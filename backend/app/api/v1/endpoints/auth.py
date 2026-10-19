import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.api.deps import (
    get_db,
    get_current_user,
    get_current_user_optional,
    get_current_admin,
    get_client_ip,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.usuario import Usuario, RoleEnum
from app.schemas.auth import (
    Token,
    LoginRequest,
    RefreshTokenRequest,
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
)
from app.services.audit_service import AuditService

router = APIRouter()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Configura os cookies de sessão HttpOnly com atributos seguros de acordo com a OWASP."""
    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    """Exclui os cookies de sessão no navegador configurando Max-Age=0."""
    response.delete_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        path="/",
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    response.delete_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        path="/",
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )


@router.post("/login", response_model=Token)
async def login_form(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login padrão OAuth2 compatível com Swagger UI e emissão de Cookies HttpOnly."""
    stmt = select(Usuario).where(Usuario.email == form_data.username)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo.",
        )

    access_token = create_access_token(
        subject=user.email,
        role=user.role.value,
        user_id=str(user.id),
    )
    refresh_token = create_refresh_token(
        subject=user.email,
        user_id=str(user.id),
    )

    _set_auth_cookies(response, access_token, refresh_token)

    ip = get_client_ip(request)
    await AuditService.registrar_log(
        db=db,
        tabela="usuarios",
        registro_id=str(user.id),
        acao="LOGIN_SUCESSO",
        usuario_id=user.id,
        ip_address=ip,
        motivo="Autenticação via formulário OAuth2",
    )
    await db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }


@router.post("/login/json", response_model=Token)
async def login_json(
    body: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Login via JSON payload para o Frontend Next.js com Cookies HttpOnly seguros."""
    stmt = select(Usuario).where(Usuario.email == body.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(body.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo.",
        )

    access_token = create_access_token(
        subject=user.email,
        role=user.role.value,
        user_id=str(user.id),
    )
    refresh_token = create_refresh_token(
        subject=user.email,
        user_id=str(user.id),
    )

    _set_auth_cookies(response, access_token, refresh_token)

    ip = get_client_ip(request)
    await AuditService.registrar_log(
        db=db,
        tabela="usuarios",
        registro_id=str(user.id),
        acao="LOGIN_SUCESSO",
        usuario_id=user.id,
        ip_address=ip,
        motivo="Autenticação via JSON com sucesso",
    )
    await db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }


@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Renova o access token a partir do cookie HttpOnly 'stockflow_refresh_token' ou payload JSON.
    """
    token_str = (body.refresh_token if body and body.refresh_token else None) or request.cookies.get(
        settings.REFRESH_TOKEN_COOKIE_NAME
    )

    if not token_str:
        raise HTTPException(status_code=401, detail="Refresh token não fornecido.")

    try:
        payload = decode_token(token_str)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token de tipo inválido.")
        user_id = uuid.UUID(payload.get("user_id"))
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado.")

    stmt = select(Usuario).where(Usuario.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.ativo:
        raise HTTPException(status_code=401, detail="Usuário inexistente ou inativo.")

    new_access_token = create_access_token(
        subject=user.email,
        role=user.role.value,
        user_id=str(user.id),
    )
    new_refresh_token = create_refresh_token(
        subject=user.email,
        user_id=str(user.id),
    )

    _set_auth_cookies(response, new_access_token, new_refresh_token)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Usuario] = Depends(get_current_user_optional),
):
    """
    Invalida e apaga os cookies HttpOnly de sessão no navegador e grava log de auditoria.
    """
    _clear_auth_cookies(response)

    if current_user:
        ip = get_client_ip(request)
        await AuditService.registrar_log(
            db=db,
            tabela="usuarios",
            registro_id=str(current_user.id),
            acao="LOGOUT_SUCESSO",
            usuario_id=current_user.id,
            ip_address=ip,
            motivo="Logout efetuado com sucesso",
        )
        await db.commit()

    return {"message": "Logout realizado com sucesso."}


@router.get("/me", response_model=UsuarioResponse)
async def read_current_user_me(
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna dados do usuário atualmente autenticado via Cookie ou Bearer token."""
    return current_user


@router.get("/users", response_model=List[UsuarioResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin),
):
    """Lista todos os usuários cadastrados (Admin only)."""
    stmt = select(Usuario).order_by(Usuario.nome)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/users", response_model=UsuarioResponse)
async def create_user(
    body: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin),
    request: Request = None,
):
    """Cria um novo usuário com senha criptografada via Argon2id (Admin only)."""
    stmt_exist = select(Usuario).where(Usuario.email == body.email)
    res = await db.execute(stmt_exist)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    user = Usuario(
        nome=body.nome,
        email=body.email,
        senha_hash=get_password_hash(body.senha),
        role=body.role,
        ativo=body.ativo,
    )
    db.add(user)
    await db.flush()

    ip = get_client_ip(request) if request else None
    await AuditService.registrar_log(
        db=db,
        tabela="usuarios",
        registro_id=str(user.id),
        acao="CRIAR_USUARIO",
        usuario_id=current_user.id,
        ip_address=ip,
        dados_novos={"email": user.email, "role": user.role.value},
        motivo="Cadastro de usuário",
    )
    await db.commit()
    await db.refresh(user)
    return user
