import uuid
import pytest
from httpx import AsyncClient
from decimal import Decimal
from sqlalchemy import select
from app.models.usuario import Usuario
from app.models.material import Material
from app.models.localizacao import Localizacao
from app.models.requisicao import Requisicao, StatusRequisicaoEnum
from app.services.stock_engine import StockEngine
from app.services.requisition_service import RequisitionService
from app.core.config import settings


@pytest.mark.asyncio
async def test_post_protegido_sem_autenticacao_retorna_401(client: AsyncClient, seed_data: dict):
    """
    1. Separação de Camadas:
    Endpoint protegido (POST /api/v1/estoque/entradas) chamado sem credenciais
    passa pelo middleware CSRF mas DEVE ser rejeitado com HTTP 401 Unauthorized pela camada de Autenticação.
    """
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    client.cookies.clear()
    res = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 5.0,
            "custo_unitario": 20.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Origin": "http://localhost:3000"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_post_protegido_autenticado_same_origin_sucesso(client: AsyncClient, seed_data: dict):
    """
    2. Endpoint protegido com autenticação e contexto same-origin:
    Deve ser aceito pelo CSRF Guard e autorizado (HTTP 200 OK).
    """
    admin: Usuario = seed_data["admin"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )

    res = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 2.0,
            "custo_unitario": 15.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Sec-Fetch-Site": "same-origin"}
    )
    assert res.status_code == 200
    assert res.json()["tipo"] == "ENTRADA"


@pytest.mark.asyncio
async def test_post_protegido_cross_site_bloqueado_403(client: AsyncClient, seed_data: dict):
    """
    3. Endpoint protegido com autenticação via cookie e contexto cross-site:
    Deve ser bloqueado pelo CSRF Guard com HTTP 403 Forbidden.
    """
    admin: Usuario = seed_data["admin"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )

    res = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 1.0,
            "custo_unitario": 10.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Sec-Fetch-Site": "cross-site", "Origin": "http://localhost:3000"}
    )
    assert res.status_code == 403
    assert "cross-site" in res.json()["detail"]


@pytest.mark.asyncio
async def test_post_protegido_origem_nao_confiavel_bloqueado_403(client: AsyncClient, seed_data: dict):
    """
    4. Endpoint protegido com autenticação e Origin não confiável:
    Deve ser bloqueado com HTTP 403 Forbidden.
    """
    admin: Usuario = seed_data["admin"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )

    res = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 1.0,
            "custo_unitario": 10.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Origin": "http://evil-attacker.com"}
    )
    assert res.status_code == 403
    assert "não autorizada" in res.json()["detail"]


@pytest.mark.asyncio
async def test_post_protegido_same_site_threat_model(client: AsyncClient, seed_data: dict):
    """
    5. Modelo de Ameaça para 'same-site':
    - same-site com Origin autorizado (http://localhost:3000) -> HTTP 200 OK.
    - same-site com Origin de subdomínio não listado (http://untrusted-subdomain.localhost:3000) -> HTTP 403 Forbidden.
    """
    admin: Usuario = seed_data["admin"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )

    # 5a. same-site com Origin autorizado
    res_trusted_samesite = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 1.0,
            "custo_unitario": 10.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Sec-Fetch-Site": "same-site", "Origin": "http://localhost:3000"}
    )
    assert res_trusted_samesite.status_code == 200

    # 5b. same-site com Origin de subdomínio não confiável
    res_untrusted_samesite = await client.post(
        "/api/v1/estoque/entradas",
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 1.0,
            "custo_unitario": 10.0,
            "finalidade": "ENTRADA_COMPRA",
        },
        headers={"Sec-Fetch-Site": "same-site", "Origin": "http://untrusted-subdomain.localhost:3000"}
    )
    assert res_untrusted_samesite.status_code == 403
    assert "same-site" in res_untrusted_samesite.json()["detail"]


@pytest.mark.asyncio
async def test_endpoint_publico_login_funciona_sem_autenticacao(client: AsyncClient, seed_data: dict):
    """
    6. Endpoint Público:
    O endpoint de login (/api/v1/auth/login/json) é intencionalmente público e
    continua aceitando requisições sem cookies prévios, retornando HTTP 200 OK.
    """
    admin: Usuario = seed_data["admin"]
    client.cookies.clear()

    res = await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_idor_solicitante_nao_cancela_requisicao_alheia(client: AsyncClient, seed_data: dict, db_session):
    """
    Teste BOLA/IDOR: Solicitante 2 tenta cancelar uma requisição criada pelo Solicitante 1.
    Deve retornar 403 Forbidden.
    """
    sol1_id = seed_data["solicitante1"].id
    sol2_email = seed_data["solicitante2"].email
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=sol1_id,
        finalidade="USO_INTERNO",
        itens_data=[{"material_id": mat_id, "localizacao_id": loc_id, "quantidade_solicitada": Decimal("3.00")}],
        justificativa="Pedido Sol1",
    )
    req_id = req.id
    await db_session.commit()

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": sol2_email, "senha": "Senha@123"}
    )

    res = await client.post(
        f"/api/v1/requisicoes/{req_id}/cancelar",
        headers={"Origin": "http://localhost:3000"}
    )
    assert res.status_code == 403
    assert "suas próprias" in res.json()["detail"]


@pytest.mark.asyncio
async def test_fluxos_sensiveis_violacao_de_ordem(client: AsyncClient, seed_data: dict, db_session):
    """
    Testes de Ordem e Máquina de Estados:
    - Entregar requisição PENDENTE (sem aprovar antes) deve ser bloqueado com 400.
    - Cancelar requisição já ENTREGUE deve ser bloqueado com 400.
    """
    alm_id = seed_data["almoxarife"].id
    alm_email = seed_data["almoxarife"].email
    sol_id = seed_data["solicitante1"].id
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    req = await RequisitionService.criar_requisicao(
        db=db_session,
        solicitante_id=sol_id,
        finalidade="USO_INTERNO",
        itens_data=[{"material_id": mat_id, "localizacao_id": loc_id, "quantidade_solicitada": Decimal("2.00")}],
        justificativa="Teste ordem",
    )
    req_id = req.id
    await db_session.commit()

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": alm_email, "senha": "Senha@123"}
    )

    # 1. Tentar entregar diretamente sem aprovação prévia -> 400
    res_entrega_invalida = await client.post(
        f"/api/v1/requisicoes/{req_id}/entregar",
        json={"recebido_por": "Fulano"},
        headers={"Origin": "http://localhost:3000"}
    )
    assert res_entrega_invalida.status_code == 400

    # 2. Faz entrada, aprova e entrega legitimamente
    await StockEngine.registrar_entrada(
        db=db_session,
        material_id=mat_id,
        localizacao_id=loc_id,
        quantidade=Decimal("10.00"),
        custo_unitario=Decimal("15.00"),
        usuario_id=alm_id,
        finalidade="ENTRADA_COMPRA",
    )
    await RequisitionService.aprovar_requisicao(
        db=db_session,
        requisicao_id=req_id,
        aprovador_id=alm_id,
    )
    await RequisitionService.entregar_requisicao(
        db=db_session,
        requisicao_id=req_id,
        entregador_id=alm_id,
        recebido_por="Recebedor Real",
    )
    await db_session.commit()

    # 3. Tentar cancelar requisição já entregue -> 400
    res_cancelar_entregue = await client.post(
        f"/api/v1/requisicoes/{req_id}/cancelar",
        headers={"Origin": "http://localhost:3000"}
    )
    assert res_cancelar_entregue.status_code == 400


@pytest.mark.asyncio
async def test_ledger_imutabilidade_sem_endpoints_mutacao(client: AsyncClient, seed_data: dict):
    """
    Teste de Imutabilidade do Ledger:
    Garante que tentativas de PUT ou DELETE na tabela de movimentações não são permitidas (404/405).
    """
    admin: Usuario = seed_data["admin"]
    dummy_id = str(uuid.uuid4())

    await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )

    res_put = await client.put(
        f"/api/v1/estoque/movimentacoes/{dummy_id}",
        json={"quantidade": 999},
        headers={"Origin": "http://localhost:3000"}
    )
    assert res_put.status_code in (404, 405)

    res_delete = await client.delete(
        f"/api/v1/estoque/movimentacoes/{dummy_id}",
        headers={"Origin": "http://localhost:3000"}
    )
    assert res_delete.status_code in (404, 405)
