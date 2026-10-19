import asyncio
from decimal import Decimal
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.requisicao import StatusRequisicaoEnum
from app.models.estoque import FinalidadeEnum
from app.services.stock_engine import StockEngine
from app.services.requisition_service import RequisitionService
from app.core.exceptions import SaldoInsuficienteError
from tests.conftest import TestingSessionLocal


@pytest.mark.asyncio
async def test_concorrencia_aprovacao_saldo_limitado(db_session: AsyncSession, seed_data: dict):
    """
    Teste de Concorrência:
    Estoque = 10 unidades.
    5 requisições de 3 unidades cada disputam a aprovação concorrentemente.
    Exatamente 3 requisições devem aprovar (9 reservadas), 2 devem falhar com SaldoInsuficienteError.
    Saldo não pode ficar negativo e integridade deve ser mantida.
    """
    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    almoxarife = seed_data["almoxarife"]
    solicitante = seed_data["solicitante1"]

    # 1. Configura estoque inicial = 10 un
    async with TestingSessionLocal() as session:
        await StockEngine.registrar_entrada(
            db=session,
            material_id=mat.id,
            localizacao_id=loc.id,
            quantidade=Decimal("10.0000"),
            custo_unitario=Decimal("20.00"),
            usuario_id=almoxarife.id,
        )
        await session.commit()

    # 2. Cria 5 requisições de 3 unidades cada
    req_ids = []
    async with TestingSessionLocal() as session:
        for i in range(5):
            req = await RequisitionService.criar_requisicao(
                db=session,
                solicitante_id=solicitante.id,
                finalidade=FinalidadeEnum.USO_INTERNO,
                justificativa=f"Req concorrente {i+1}",
                itens_data=[{
                    "material_id": mat.id,
                    "localizacao_id": loc.id,
                    "quantidade_solicitada": Decimal("3.0000"),
                }],
            )
            req_ids.append(req.id)
        await session.commit()

    # 3. Função worker assíncrona com sessão própria
    async def aprovar_worker(r_id):
        async with TestingSessionLocal() as session:
            try:
                await RequisitionService.aprovar_requisicao(
                    db=session,
                    requisicao_id=r_id,
                    aprovador_id=almoxarife.id,
                )
                await session.commit()
                return "SUCESSO"
            except SaldoInsuficienteError:
                await session.rollback()
                return "SALDO_INSUFICIENTE"
            except Exception as e:
                await session.rollback()
                return f"ERRO: {type(e).__name__}"

    # Executa todas as aprovações em paralelo
    resultados = await asyncio.gather(*[aprovar_worker(r_id) for r_id in req_ids])

    sucessos = resultados.count("SUCESSO")
    falhas_saldo = resultados.count("SALDO_INSUFICIENTE")

    assert sucessos == 3, f"Esperado 3 sucessos, obteve: {resultados}"
    assert falhas_saldo == 2, f"Esperado 2 falhas por saldo, obteve: {resultados}"

    # 4. Verifica integridade final no banco
    async with TestingSessionLocal() as session:
        saldo = await StockEngine.get_or_create_saldo_com_lock(session, mat.id, loc.id)
        assert saldo.quantidade_fisica == Decimal("10.0000")
        assert saldo.quantidade_reservada == Decimal("9.0000")
        assert saldo.quantidade_disponivel == Decimal("1.0000")
