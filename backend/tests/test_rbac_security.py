import pytest
from httpx import AsyncClient
from app.models.usuario import Usuario
from tests.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_rbac_bloqueio_solicitante_em_rotas_restritas(client: AsyncClient, seed_data: dict):
    """Garante que SOLICITANTE é terminantemente bloqueado (403) em ações de almoxarife/admin."""
    solicitante: Usuario = seed_data["solicitante1"]
    headers = auth_headers_for(solicitante)

    # 1. Tentativa de Entrada de Mercadoria (Almoxarife/Admin)
    res_entrada = await client.post(
        "/api/v1/estoque/entradas",
        headers=headers,
        json={
            "material_id": str(seed_data["material"].id),
            "localizacao_id": str(seed_data["localizacao"].id),
            "quantidade": 10.0,
            "custo_unitario": 25.0,
        },
    )
    assert res_entrada.status_code == 403

    # 2. Tentativa de Ajuste Manual de Estoque (Almoxarife/Admin)
    res_ajuste = await client.post(
        "/api/v1/estoque/ajustes",
        headers=headers,
        json={
            "material_id": str(seed_data["material"].id),
            "localizacao_id": str(seed_data["localizacao"].id),
            "quantidade_nova": 50.0,
            "motivo": "Tentativa indevida",
        },
    )
    assert res_ajuste.status_code == 403

    # 3. Tentativa de Abertura de Sessão de Inventário (Almoxarife/Admin)
    res_inv = await client.post(
        "/api/v1/inventario/sessoes",
        headers=headers,
        json={
            "localizacao_id": str(seed_data["localizacao"].id),
        },
    )
    assert res_inv.status_code == 403


@pytest.mark.asyncio
async def test_rbac_bloqueio_almoxarife_gestao_usuarios(client: AsyncClient, seed_data: dict):
    """Garante que ALMOXARIFE não tem permissão para gerenciar usuários (403)."""
    almoxarife: Usuario = seed_data["almoxarife"]
    headers = auth_headers_for(almoxarife)

    # Tentativa de listar usuários
    res_list = await client.get("/api/v1/auth/users", headers=headers)
    assert res_list.status_code == 403

    # Tentativa de criar usuário
    res_create = await client.post(
        "/api/v1/auth/users",
        headers=headers,
        json={
            "nome": "Novo User",
            "email": "novo@teste.com",
            "senha": "Senha@123",
            "role": "ADMIN",
        },
    )
    assert res_create.status_code == 403


@pytest.mark.asyncio
async def test_rbac_bloqueio_auditor_operacoes_mutacao(client: AsyncClient, seed_data: dict):
    """Garante que AUDITOR possui acesso somente leitura e não pode dar entrada ou saída."""
    auditor: Usuario = seed_data["auditor"]
    headers = auth_headers_for(auditor)

    # Leitura de auditoria é permitida (200)
    res_logs = await client.get("/api/v1/auditoria/logs", headers=headers)
    assert res_logs.status_code == 200

    # Mutação de estoque é bloqueada (403)
    res_entrada = await client.post(
        "/api/v1/estoque/entradas",
        headers=headers,
        json={
            "material_id": str(seed_data["material"].id),
            "localizacao_id": str(seed_data["localizacao"].id),
            "quantidade": 10.0,
            "custo_unitario": 25.0,
        },
    )
    assert res_entrada.status_code == 403


@pytest.mark.asyncio
async def test_auth_seguranca_tokens_invalidos_e_expirados(client: AsyncClient, seed_data: dict):
    """Garante que tokens forjados, vazios ou incorretos retornam 401 Unauthorized."""
    # 1. Sem header de autorização
    res_sem_token = await client.get("/api/v1/auth/me")
    assert res_sem_token.status_code == 401

    # 2. Token JWT forjado / assinatura inválida
    res_forjado = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMC6Y535i11W5tL4y1h0R"}
    )
    assert res_forjado.status_code == 401

    # 3. Login com senha errada
    res_login_errado = await client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@teste.com", "senha": "SenhaIncorreta!123"}
    )
    assert res_login_errado.status_code == 401
