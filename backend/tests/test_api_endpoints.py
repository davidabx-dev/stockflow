import pytest
from httpx import AsyncClient
from tests.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_auth_login_e_me(client: AsyncClient, seed_data: dict):
    """Testa login e consulta do próprio usuário."""
    login_payload = {
        "username": "admin@teste.com",
        "password": "Senha@123",
    }
    response = await client.post("/api/v1/auth/login", data=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    # Consulta /me
    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "admin@teste.com"
    assert me_data["role"] == "ADMIN"


@pytest.mark.asyncio
async def test_fluxo_api_completo(client: AsyncClient, seed_data: dict):
    """
    Testa o fluxo completo via API HTTP:
    1. Entrada de material via /api/v1/estoque/entradas
    2. Criação de requisição via /api/v1/requisicoes
    3. Aprovação da requisição via /api/v1/requisicoes/{id}/aprovar
    4. Separação da requisição via /api/v1/requisicoes/{id}/separar
    5. Entrega da requisição via /api/v1/requisicoes/{id}/entregar
    6. Consulta de auditoria via /api/v1/auditoria/logs
    """
    admin_headers = auth_headers_for(seed_data["admin"])
    almoxarife_headers = auth_headers_for(seed_data["almoxarife"])
    solicitante_headers = auth_headers_for(seed_data["solicitante1"])
    auditor_headers = auth_headers_for(seed_data["auditor"])

    mat = seed_data["material"]
    loc = seed_data["localizacao"]
    obra = seed_data["obra"]

    # 1. Registrar Entrada via API
    entrada_payload = {
        "material_id": str(mat.id),
        "localizacao_id": str(loc.id),
        "quantidade": "80.0000",
        "custo_unitario": "12.50",
        "numero_documento_fiscal": "NF-TESTE-999",
    }
    res_ent = await client.post("/api/v1/estoque/entradas", json=entrada_payload, headers=almoxarife_headers)
    assert res_ent.status_code == 200
    assert float(res_ent.json()["valor_total"]) == 1000.0

    # 2. Criar Requisição via API
    req_payload = {
        "obra_id": str(obra.id),
        "finalidade": "OBRA",
        "justificativa": "Instalação no bloco B",
        "itens": [{
            "material_id": str(mat.id),
            "localizacao_id": str(loc.id),
            "quantidade_solicitada": "25.0000",
        }],
    }
    res_req = await client.post("/api/v1/requisicoes", json=req_payload, headers=solicitante_headers)
    assert res_req.status_code == 200
    req_data = res_req.json()
    req_id = req_data["id"]
    assert req_data["status"] == "PENDENTE"

    # 3. Aprovação via API
    res_aprov = await client.post(f"/api/v1/requisicoes/{req_id}/aprovar", headers=almoxarife_headers)
    assert res_aprov.status_code == 200
    assert res_aprov.json()["status"] == "APROVADA"

    # 4. Separação via API
    res_sep = await client.post(f"/api/v1/requisicoes/{req_id}/separar", headers=almoxarife_headers)
    assert res_sep.status_code == 200
    assert res_sep.json()["status"] == "SEPARADA"

    # 5. Entrega via API
    entrega_payload = {"recebido_por": "Encarregado Marcos"}
    res_entreg = await client.post(f"/api/v1/requisicoes/{req_id}/entregar", json=entrega_payload, headers=almoxarife_headers)
    assert res_entreg.status_code == 200
    assert res_entreg.json()["status"] == "ENTREGUE"
    assert res_entreg.json()["recebido_por"] == "Encarregado Marcos"

    # 6. Auditoria via API
    res_audit = await client.get("/api/v1/auditoria/logs", headers=auditor_headers)
    assert res_audit.status_code == 200
    logs = res_audit.json()
    assert len(logs) >= 4  # Entrada, Criação de req, Aprovação, Separação, Entrega
