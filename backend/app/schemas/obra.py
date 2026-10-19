import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ObraBase(BaseModel):
    codigo_obra: str
    nome: str
    endereco: Optional[str] = None
    responsavel: Optional[str] = None
    ativa: bool = True


class ObraCreate(ObraBase):
    pass


class ObraUpdate(BaseModel):
    codigo_obra: Optional[str] = None
    nome: Optional[str] = None
    endereco: Optional[str] = None
    responsavel: Optional[str] = None
    ativa: Optional[bool] = None


class ObraResponse(ObraBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
