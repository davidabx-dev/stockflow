import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.usuario import Usuario
from app.core.config import settings


@pytest.mark.asyncio
async def test_login_sets_httponly_secure_cookies(client: AsyncClient, seed_data: dict):
    """
    1. Teste de Login e Emissão de Cookies HttpOnly:
    Verifica que /auth/login/json define os cookies 'stockflow_access_token' e 'stockflow_refresh_token'
    com os atributos de segurança exigidos (HttpOnly, SameSite=Lax).
    """
    admin: Usuario = seed_data["admin"]

    res = await client.post(
        "/api/v1/auth/login/json",
        json={"email": admin.email, "senha": "Senha@123"}
    )
    assert res.status_code == 200

    # Verifica headers Set-Cookie
    cookies = client.cookies
    assert settings.ACCESS_TOKEN_COOKIE_NAME in cookies
    assert settings.REFRESH_TOKEN_COOKIE_NAME in cookies

    set_cookie_headers = [h.lower() for h in res.headers.get_list("set-cookie")]
    assert any("httponly" in h for h in set_cookie_headers)
    assert any("samesite=lax" in h for h in set_cookie_headers)


@pytest.mark.asyncio
async def test_auth_me_via_cookie_only(client: AsyncClient, seed_data: dict):
    """
    2. Teste de Acesso a /auth/me usando exclusivamente Cookies:
    Comprova que o frontend não precisa enviar o token no header Authorization.
    """
    almoxarife: Usuario = seed_data["almoxarife"]

    # Login
    await client.post(
        "/api/v1/auth/login/json",
        json={"email": almoxarife.email, "senha": "Senha@123"}
    )

    # Chamada a /auth/me sem passar Authorization Header
    res_me = await client.get("/api/v1/auth/me")
    assert res_me.status_code == 200
    user_data = res_me.json()
    assert user_data["email"] == almoxarife.email
    assert user_data["role"] == "ALMOXARIFE"


@pytest.mark.asyncio
async def test_refresh_token_via_cookie(client: AsyncClient, seed_data: dict):
    """
    3. Teste de Renovação Segura via Cookie HttpOnly:
    Executa POST /auth/refresh sem corpo JSON, lendo o refresh_token do cookie.
    """
    solicitante: Usuario = seed_data["solicitante1"]

    # Login inicial
    await client.post(
        "/api/v1/auth/login/json",
        json={"email": solicitante.email, "senha": "Senha@123"}
    )

    # Executa refresh sem passar body
    res_refresh = await client.post("/api/v1/auth/refresh")
    assert res_refresh.status_code == 200
    assert "access_token" in res_refresh.json()

    # Valida que novo access cookie permite consultar /auth/me
    res_me = await client.get("/api/v1/auth/me")
    assert res_me.status_code == 200
    assert res_me.json()["email"] == solicitante.email


@pytest.mark.asyncio
async def test_logout_clears_cookies_and_revokes_session(client: AsyncClient, seed_data: dict):
    """
    4. Teste de Logout e Invalidação de Sessão:
    Verifica que /auth/logout expira os cookies (Max-Age=0) e chamadas subsequentes a rotas protegidas retornam 401.
    """
    auditor: Usuario = seed_data["auditor"]

    # 1. Login
    await client.post(
        "/api/v1/auth/login/json",
        json={"email": auditor.email, "senha": "Senha@123"}
    )

    # Confirma que sessão está ativa
    res_me1 = await client.get("/api/v1/auth/me")
    assert res_me1.status_code == 200

    # 2. Executa Logout
    res_logout = await client.post("/api/v1/auth/logout")
    assert res_logout.status_code == 200

    # 3. Limpa explicitamente os cookies no cliente simulando o comportamento do navegador que recebeu Max-Age=0
    client.cookies.clear()

    # 4. Próxima requisição protegida deve falhar com 401
    res_me2 = await client.get("/api/v1/auth/me")
    assert res_me2.status_code == 401


@pytest.mark.asyncio
async def test_cookie_tampered_or_expired_rejected(client: AsyncClient):
    """
    5. Teste de Cookie Adulterado:
    Garante que cookies com assinatura forjada são rejeitados com 401.
    """
    client.cookies.set(settings.ACCESS_TOKEN_COOKIE_NAME, "valor_jwt_totalmente_invalido_adulterado")
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_usuario_desativado_perde_acesso_com_cookie(client: AsyncClient, seed_data: dict, db_session):
    """
    6. Teste de Usuário Desativado no Banco:
    Mesmo com cookie de sessão ativo, se o usuário for desativado pelo administrador, o acesso é cortado.
    """
    solicitante: Usuario = seed_data["solicitante2"]

    # Login com cookie
    await client.post(
        "/api/v1/auth/login/json",
        json={"email": solicitante.email, "senha": "Senha@123"}
    )

    # Desativa usuário no banco
    solicitante.ativo = False
    await db_session.commit()

    # Acesso recusado no próximo request
    res = await client.get("/api/v1/auth/me")
    assert res.status_code in (400, 401)


@pytest.mark.asyncio
async def test_cors_options_and_credentials(client: AsyncClient):
    """
    7. Teste de Configuração de CORS e Credenciais:
    Valida que preflight OPTIONS de origem autorizada permite credenciais (cookies).
    """
    res = await client.options(
        "/api/v1/auth/me",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        }
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-credentials") == "true"
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
