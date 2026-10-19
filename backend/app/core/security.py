from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings

# pwdlib com Argon2id recomendado oficialmente pelo FastAPI moderno
password_hash = PasswordHash((
    Argon2Hasher(
        time_cost=3,
        memory_cost=65536,  # 64 MB
        parallelism=4,
        hash_len=32,
        salt_len=16,
    ),
))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha com Argon2id via pwdlib."""
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Gera hash seguro com Argon2id via pwdlib."""
    return password_hash.hash(password)


def create_access_token(
    subject: Union[str, Any],
    role: str,
    user_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Cria JWT access token usando PyJWT."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": str(subject),
        "user_id": str(user_id),
        "role": role,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    user_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Cria JWT refresh token usando PyJWT."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": str(subject),
        "user_id": str(user_id),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decodifica e valida assinatura do JWT usando PyJWT."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError as e:
        raise ValueError(f"Token inválido ou expirado: {str(e)}")
