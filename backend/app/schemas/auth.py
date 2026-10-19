import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.usuario import RoleEnum


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    role: RoleEnum = RoleEnum.SOLICITANTE
    ativo: bool = True


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
