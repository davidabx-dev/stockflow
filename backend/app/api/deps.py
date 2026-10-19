import uuid
from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import AsyncSessionLocal
from app.models.usuario import Usuario, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency para obter sessão assíncrona do banco de dados."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_client_ip(request: Request) -> Optional[str]:
    """Extrai IP do cliente a partir dos headers ou da conexão direta."""
    if not request:
        return None
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token_header: Optional[str] = Depends(oauth2_scheme),
) -> Usuario:
    """
    Autenticação Híbrida Segura:
    1. Prioritário: Cookie HttpOnly 'stockflow_access_token' (imune a XSS no navegador).
    2. Fallback: Header 'Authorization: Bearer <token>' (para APIs/scripts/testes).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas, sessão não autenticada ou token expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = None
    if request:
        token = request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)
    if not token and token_header:
        token = token_header

    if not token:
        raise credentials_exception

    try:
        payload = decode_token(token)
        user_id_str: str = payload.get("user_id")
        token_type: str = payload.get("type")
        if user_id_str is None or token_type != "access":
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except Exception:
        raise credentials_exception

    stmt = select(Usuario).where(Usuario.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo no sistema.",
        )
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token_header: Optional[str] = Depends(oauth2_scheme),
) -> Optional[Usuario]:
    """Retorna o usuário autenticado ou None se não houver sessão ativa."""
    try:
        return await get_current_user(request=request, db=db, token_header=token_header)
    except HTTPException:
        return None


def require_roles(*allowed_roles: RoleEnum) -> Callable:
    """
    Factory de dependência para autorização baseada em papéis (RBAC).
    """
    async def role_checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permissão negada. Papéis permitidos: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# Dependências pré-configuradas para facilidade de uso
get_current_admin = require_roles(RoleEnum.ADMIN)
get_current_almoxarife_or_admin = require_roles(RoleEnum.ALMOXARIFE, RoleEnum.ADMIN)
get_current_auditor_or_admin = require_roles(RoleEnum.AUDITOR, RoleEnum.ADMIN)
