import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.localizacao import TipoLocalizacaoEnum


class LocalizacaoBase(BaseModel):
    codigo: str
    nome: str
    tipo: TipoLocalizacaoEnum = TipoLocalizacaoEnum.ALMOXARIFADO
    descricao: Optional[str] = None
    ativo: bool = True


class LocalizacaoCreate(LocalizacaoBase):
    pass


class LocalizacaoUpdate(BaseModel):
    codigo: Optional[str] = None
    nome: Optional[str] = None
    tipo: Optional[TipoLocalizacaoEnum] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None


class LocalizacaoResponse(LocalizacaoBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
