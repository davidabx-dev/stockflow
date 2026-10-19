from decimal import Decimal
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.inventario import StatusInventarioEnum, SessaoInventario
from app.models.estoque import FinalidadeEnum
from app.services.stock_engine import StockEngine
from app.services.inventory_service import InventoryService
from app.services.report_service import ReportService
from app.services.requisition_service import RequisitionService


@pytest.mark.asyncio
async def test_sessao_inventario_e_ajustes_em_lote(db_session: AsyncSession, seed_data: dict):
    """
    Testa abertura de sessão de inventário, lançamento de contagens com divergência e confirmação em lote.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    almoxarife = seed_data["almoxarife"]

    # 1. Entrada de 50 un a R$ 10,00
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    # 2. Abrir sessão de inventário
    sessao = await InventoryService.abrir_sessao(
        db=db_session,
        localizacao_id=loc.id,
        usuario_id=almoxarife.id,
        observacao="Inventário anual",
    )
    await db_session.commit()
    assert sessao.status == StatusInventarioEnum.ABERTA

    # 3. Lança contagem física de 42 unidades (divergência de -8 unidades)
    await InventoryService.lancar_contagens(
        db=db_session,
        sessao_id=sessao.id,
        contagens=[{"material_id": mat.id, "quantidade_contada": Decimal("42.0000")}],
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    # Recarrega a sessão com os itens
    stmt_sessao = (
        select(SessaoInventario)
        .options(selectinload(SessaoInventario.itens))
        .where(SessaoInventario.id == sessao.id)
    )
    res_sessao = await db_session.execute(stmt_sessao)
    sessao_carregada = res_sessao.scalar_one()

    assert len(sessao_carregada.itens) == 1
    item = sessao_carregada.itens[0]
    assert item.quantidade_sistema_anterior == Decimal("50.0000")
    assert item.quantidade_contada == Decimal("42.0000")
    assert item.diferenca == Decimal("-8.0000")
    assert item.valor_total_diferenca == Decimal("-80.00")

    # 4. Confirma sessão de inventário
    await InventoryService.confirmar_sessao(
        db=db_session,
        sessao_id=sessao.id,
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    res_conf = await db_session.execute(stmt_sessao)
    sessao_confirmada = res_conf.scalar_one()

    assert sessao_confirmada.status == StatusInventarioEnum.CONFIRMADA
    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)
    # Saldo foi ajustado para 42 unidades
    assert saldo.quantidade_fisica == Decimal("42.0000")


@pytest.mark.asyncio
async def test_relatorios_consumo_obra_e_saldo_comprometido(db_session: AsyncSession, seed_data: dict):
    """
    Testa fechamento contábil dos relatórios de consumo por obra (com devolução) e saldo comprometido.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    almoxarife = seed_data["almoxarife"]
    solicitante = seed_data["solicitante1"]
    obra = seed_data["obra"]

    # 1. Entrada de 100 un a R$ 25,00 (Total R$ 2.500)
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("25.00"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    # 2. Saída para a Obra de 40 un a R$ 25,00 (R$ 1.000)
    saida = await StockEngine.registrar_saida_direta(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("40.0000"),
        usuario_id=almoxarife.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
    )
    await db_session.commit()

    # 3. Devolução de 10 un da obra (R$ 250)
    await StockEngine.registrar_devolucao(
        db=db_session,
        movimentacao_saida_id=saida.id,
        quantidade=Decimal("10.0000"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    # 4. Requisição aprovada de 20 un (reserva)
    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=solicitante.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
        justificativa="Reserva para obra",
        itens_data=[{"material_id": mat.id, "localizacao_id": loc.id, "quantidade_solicitada": Decimal("20.0000")}],
    )
    await db_session.commit()
    await RequisitionService.aprovar_requisicao(db=db_session, requisicao_id=req.id, aprovador_id=almoxarife.id)
    await db_session.commit()

    # Consulta Relatório de Consumo por Obra
    rel_consumo = await ReportService.relatorio_consumo_por_obra(db_session, obra_id=obra.id)
    assert len(rel_consumo) == 1
    rel_obra = rel_consumo[0]
    assert rel_obra["total_saidas_rs"] == 1000.00
    assert rel_obra["total_devolucoes_rs"] == 250.00
    assert rel_obra["total_liquido_consumido_rs"] == 750.00

    # Consulta Relatório de Saldo Comprometido
    rel_comp = await ReportService.relatorio_saldo_comprometido(db_session, material_id=mat.id)
    assert len(rel_comp) == 1
    comp = rel_comp[0]
    assert comp["quantidade_reservada_total"] == 20.0
    assert comp["quantidade_fisica_total"] == 70.0  # 100 - 40 + 10 = 70
    assert comp["quantidade_disponivel_total"] == 50.0
    assert len(comp["requisicoes_comprometidas"]) == 1
    assert comp["requisicoes_comprometidas"][0]["numero_requisicao"] == req.numero
