from decimal import Decimal
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.material import Material
from app.models.estoque import EstoquePorLocalizacao, Movimentacao, TipoMovimentacaoEnum, FinalidadeEnum
from app.services.stock_engine import StockEngine
from app.core.exceptions import (
    SaldoInsuficienteError,
    QuantidadeDevolucaoExcedidaError,
)


@pytest.mark.asyncio
async def test_calculo_custo_medio_movel_entradas(db_session: AsyncSession, seed_data: dict):
    """
    Prova matemática:
    1ª entrada: 100 un a R$ 10,00 -> Médio = R$ 10,00
    2ª entrada: 100 un a R$ 20,00 -> Médio = (1000 + 2000)/200 = R$ 15,00
    3ª entrada: 50 un a R$ 30,00  -> Médio = (200*15 + 50*30)/250 = (3000 + 1500)/250 = R$ 18,00
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    usr = seed_data["almoxarife"]

    # 1ª Entrada
    mov1 = await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=usr.id,
        numero_documento_fiscal="NF-001",
    )
    await db_session.commit()

    await db_session.refresh(mat)
    assert mat.custo_medio_atual == Decimal("10.00")
    assert mov1.valor_total == Decimal("1000.00")

    # 2ª Entrada
    mov2 = await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("20.00"),
        usuario_id=usr.id,
        numero_documento_fiscal="NF-002",
    )
    await db_session.commit()

    await db_session.refresh(mat)
    assert mat.custo_medio_atual == Decimal("15.00")
    assert mov2.valor_total == Decimal("2000.00")

    # 3ª Entrada
    mov3 = await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        custo_unitario=Decimal("30.00"),
        usuario_id=usr.id,
        numero_documento_fiscal="NF-003",
    )
    await db_session.commit()

    await db_session.refresh(mat)
    assert mat.custo_medio_atual == Decimal("18.00")
    assert mov3.valor_total == Decimal("1500.00")


@pytest.mark.asyncio
async def test_saida_nao_altera_custo_medio(db_session: AsyncSession, seed_data: dict):
    """
    Regra V3:
    Saída captura o custo_medio_atual vigente e NÃO recalcula o custo médio do material.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    usr = seed_data["almoxarife"]
    obra = seed_data["obra"]

    # Entrada de 100 un a R$ 20,00
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("20.00"),
        usuario_id=usr.id,
    )
    await db_session.commit()

    # Saída de 40 un
    mov_saida = await StockEngine.registrar_saida_direta(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("40.0000"),
        usuario_id=usr.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
    )
    await db_session.commit()

    await db_session.refresh(mat)
    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)

    assert saldo.quantidade_fisica == Decimal("60.0000")
    assert mov_saida.custo_unitario == Decimal("20.00")
    assert mov_saida.valor_total == Decimal("800.00")
    # Custo médio permanece intacto
    assert mat.custo_medio_atual == Decimal("20.00")


@pytest.mark.asyncio
async def test_devolucao_reaproveita_custo_saida_original(db_session: AsyncSession, seed_data: dict):
    """
    Regra V3:
    Devolução busca o custo registrado NA SAÍDA ORIGINAL e NÃO recalcula o custo médio atual.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    usr = seed_data["almoxarife"]
    obra = seed_data["obra"]

    # 1. Entrada a R$ 10,00
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=usr.id,
    )
    await db_session.commit()

    # 2. Saída a R$ 10,00
    saida1 = await StockEngine.registrar_saida_direta(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        usuario_id=usr.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
    )
    await db_session.commit()

    # 3. Nova entrada a R$ 50,00 (que eleva o custo médio do estoque atual para R$ 36,67)
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("50.00"),
        usuario_id=usr.id,
    )
    await db_session.commit()
    await db_session.refresh(mat)
    # (50*10 + 100*50)/150 = 5500/150 = 36.67
    assert mat.custo_medio_atual == Decimal("36.67")

    # 4. Devolução de 20 unidades daquela primeira saída
    dev = await StockEngine.registrar_devolucao(
        db=db_session,
        movimentacao_saida_id=saida1.id,
        quantidade=Decimal("20.0000"),
        usuario_id=usr.id,
        motivo="Sobra de material",
    )
    await db_session.commit()

    # Prova que o custo unitário resgatado foi R$ 10,00 (da saída 1) e NÃO R$ 36,67 (médio atual)
    assert dev.custo_unitario == Decimal("10.00")
    assert dev.valor_total == Decimal("200.00")

    # Prova que o custo médio do material NÃO mudou após a devolução
    await db_session.refresh(mat)
    assert mat.custo_medio_atual == Decimal("36.67")


@pytest.mark.asyncio
async def test_bloqueio_devolucao_excedente(db_session: AsyncSession, seed_data: dict):
    """
    Testa se o sistema impede devolver mais do que a saída original registrou.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    usr = seed_data["almoxarife"]
    obra = seed_data["obra"]

    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("30.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=usr.id,
    )
    saida = await StockEngine.registrar_saida_direta(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("20.0000"),
        usuario_id=usr.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
    )
    await db_session.commit()

    # 1ª devolução parcial: 15 un
    await StockEngine.registrar_devolucao(
        db=db_session,
        movimentacao_saida_id=saida.id,
        quantidade=Decimal("15.0000"),
        usuario_id=usr.id,
    )
    await db_session.commit()

    # Tentativa de devolver mais 10 un (total seria 25, mas a saída foi só de 20)
    with pytest.raises(QuantidadeDevolucaoExcedidaError):
        await StockEngine.registrar_devolucao(
            db=db_session,
            movimentacao_saida_id=saida.id,
            quantidade=Decimal("10.0000"),
            usuario_id=usr.id,
        )


@pytest.mark.asyncio
async def test_ajuste_estoque(db_session: AsyncSession, seed_data: dict):
    """
    Testa ajuste positivo e negativo com valorização pelo custo médio vigente.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    usr = seed_data["almoxarife"]

    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        custo_unitario=Decimal("25.00"),
        usuario_id=usr.id,
    )
    await db_session.commit()

    # Ajuste positivo: +5 un
    mov_ajuste_pos = await StockEngine.registrar_ajuste(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade_diferenca=Decimal("5.0000"),
        motivo="Contagem encontrou 5 unidades a mais",
        usuario_id=usr.id,
    )
    await db_session.commit()

    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)
    assert saldo.quantidade_fisica == Decimal("55.0000")
    assert mov_ajuste_pos.valor_total == Decimal("125.00")

    # Ajuste negativo: -10 un
    mov_ajuste_neg = await StockEngine.registrar_ajuste(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade_diferenca=Decimal("-10.0000"),
        motivo="Quebra de avaria",
        usuario_id=usr.id,
    )
    await db_session.commit()

    await db_session.refresh(saldo)
    assert saldo.quantidade_fisica == Decimal("45.0000")
    assert mov_ajuste_neg.valor_total == Decimal("250.00")
