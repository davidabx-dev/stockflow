from decimal import Decimal
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.requisicao import (
    StatusRequisicaoEnum,
    StatusItemEnum,
)
from app.models.estoque import FinalidadeEnum, TipoMovimentacaoEnum
from app.services.stock_engine import StockEngine
from app.services.requisition_service import RequisitionService
from app.core.exceptions import (
    SaldoInsuficienteError,
    AutoAprovacaoNaoPermitidaError,
    StatusRequisicaoInvalidoError,
)


@pytest.mark.asyncio
async def test_ciclo_completo_requisicao_e_saldo(db_session: AsyncSession, seed_data: dict):
    """
    Testa ciclo completo:
    Entrada (100) -> Requisição (30) -> Aprovação (Reserva) -> Separação -> Entrega (Baixa física e contábil)
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    solicitante = seed_data["solicitante1"]
    almoxarife = seed_data["almoxarife"]
    obra = seed_data["obra"]

    # 1. Entrada inicial de 100 unidades a R$ 15,00
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("100.0000"),
        custo_unitario=Decimal("15.00"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)
    assert saldo.quantidade_fisica == Decimal("100.0000")
    assert saldo.quantidade_reservada == Decimal("0.0000")
    assert saldo.quantidade_disponivel == Decimal("100.0000")

    # 2. Criar Requisição de 30 unidades
    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=solicitante.id,
        finalidade=FinalidadeEnum.OBRA,
        obra_id=obra.id,
        justificativa="Instalação elétrica da torre A",
        itens_data=[{
            "material_id": mat.id,
            "localizacao_id": loc.id,
            "quantidade_solicitada": Decimal("30.0000"),
        }],
    )
    await db_session.commit()

    assert req.status == StatusRequisicaoEnum.PENDENTE
    # Na fase pendente, ainda não há reserva no saldo
    await db_session.refresh(saldo)
    assert saldo.quantidade_fisica == Decimal("100.0000")
    assert saldo.quantidade_reservada == Decimal("0.0000")
    assert saldo.quantidade_disponivel == Decimal("100.0000")

    # 3. Aprovação pelo Almoxarife (Reserva Automática)
    req_aprovada = await RequisitionService.aprovar_requisicao(
        db=db_session,
        requisicao_id=req.id,
        aprovador_id=almoxarife.id,
    )
    await db_session.commit()

    assert req_aprovada.status == StatusRequisicaoEnum.APROVADA
    await db_session.refresh(saldo)
    # Físico continua 100, mas reservado sobe para 30 e disponível cai para 70
    assert saldo.quantidade_fisica == Decimal("100.0000")
    assert saldo.quantidade_reservada == Decimal("30.0000")
    assert saldo.quantidade_disponivel == Decimal("70.0000")

    # 4. Separação pelo Almoxarife
    req_separada = await RequisitionService.separar_requisicao(
        db=db_session,
        requisicao_id=req.id,
        separador_id=almoxarife.id,
    )
    await db_session.commit()

    assert req_separada.status == StatusRequisicaoEnum.SEPARADA

    # 5. Entrega física
    req_entregue = await RequisitionService.entregar_requisicao(
        db=db_session,
        requisicao_id=req.id,
        entregador_id=almoxarife.id,
        recebido_por="Mestre de Obras Antonio",
    )
    await db_session.commit()

    assert req_entregue.status == StatusRequisicaoEnum.ENTREGUE
    assert req_entregue.recebido_por == "Mestre de Obras Antonio"

    # Saldo final: Físico baixou para 70, Reserva foi liberada (0) e Disponível é 70
    await db_session.refresh(saldo)
    assert saldo.quantidade_fisica == Decimal("70.0000")
    assert saldo.quantidade_reservada == Decimal("0.0000")
    assert saldo.quantidade_disponivel == Decimal("70.0000")


@pytest.mark.asyncio
async def test_regra_seguranca_bloqueio_autoaprovacao(db_session: AsyncSession, seed_data: dict):
    """
    Regra de Segurança Server-Side: O solicitante não pode aprovar a própria requisição.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    solicitante = seed_data["solicitante1"]

    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=seed_data["almoxarife"].id,
    )
    await db_session.commit()

    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=solicitante.id,
        finalidade=FinalidadeEnum.USO_INTERNO,
        itens_data=[{
            "material_id": mat.id,
            "localizacao_id": loc.id,
            "quantidade_solicitada": Decimal("10.0000"),
        }],
    )
    await db_session.commit()

    # Tentativa de autoaprovação pelo solicitante
    with pytest.raises(AutoAprovacaoNaoPermitidaError):
        await RequisitionService.aprovar_requisicao(
            db=db_session,
            requisicao_id=req.id,
            aprovador_id=solicitante.id,
        )


@pytest.mark.asyncio
async def test_bloqueio_aprovacao_saldo_insuficiente(db_session: AsyncSession, seed_data: dict):
    """
    Tentativa de aprovação onde a quantidade solicitada excede o saldo disponível.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    solicitante = seed_data["solicitante1"]
    almoxarife = seed_data["almoxarife"]

    # Saldo de apenas 10 unidades
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("10.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    # Requisição pedindo 25 unidades
    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=solicitante.id,
        finalidade=FinalidadeEnum.USO_INTERNO,
        itens_data=[{
            "material_id": mat.id,
            "localizacao_id": loc.id,
            "quantidade_solicitada": Decimal("25.0000"),
        }],
    )
    await db_session.commit()

    with pytest.raises(SaldoInsuficienteError):
        await RequisitionService.aprovar_requisicao(
            db=db_session,
            requisicao_id=req.id,
            aprovador_id=almoxarife.id,
        )

    # Verifica que o saldo continuou intacto
    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)
    assert saldo.quantidade_reservada == Decimal("0.0000")
    assert saldo.quantidade_disponivel == Decimal("10.0000")


@pytest.mark.asyncio
async def test_cancelamento_estorna_reserva(db_session: AsyncSession, seed_data: dict):
    """
    Testa se o cancelamento de uma requisição APROVADA estorna perfeitamente a reserva.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    solicitante = seed_data["solicitante1"]
    almoxarife = seed_data["almoxarife"]

    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat.id,
        localizacao_id=loc.id,
        quantidade=Decimal("50.0000"),
        custo_unitario=Decimal("10.00"),
        usuario_id=almoxarife.id,
    )
    await db_session.commit()

    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=solicitante.id,
        finalidade=FinalidadeEnum.USO_INTERNO,
        itens_data=[{
            "material_id": mat.id,
            "localizacao_id": loc.id,
            "quantidade_solicitada": Decimal("20.0000"),
        }],
    )
    await db_session.commit()

    await RequisitionService.aprovar_requisicao(
        db=db_session,
        requisicao_id=req.id,
        aprovador_id=almoxarife.id,
    )
    await db_session.commit()

    saldo = await StockEngine.get_or_create_saldo_com_lock(db_session, mat.id, loc.id)
    assert saldo.quantidade_reservada == Decimal("20.0000")
    assert saldo.quantidade_disponivel == Decimal("30.0000")

    # Cancelamento da requisição aprovada
    await RequisitionService.cancelar_requisicao(
        db=db_session,
        requisicao_id=req.id,
        usuario_id=solicitante.id,
        motivo="Obra cancelou a atividade",
    )
    await db_session.commit()

    await db_session.refresh(saldo)
    assert saldo.quantidade_reservada == Decimal("0.0000")
    assert saldo.quantidade_disponivel == Decimal("50.0000")
