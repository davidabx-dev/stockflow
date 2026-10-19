import uuid
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class UnidadeMedidaBase(BaseModel):
    sigla: str
    nome: str
    fracionavel: bool = False


class UnidadeMedidaCreate(UnidadeMedidaBase):
    pass


class UnidadeMedidaResponse(UnidadeMedidaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SubcategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None


class SubcategoriaCreate(SubcategoriaBase):
    categoria_id: int


class SubcategoriaResponse(SubcategoriaBase):
    id: int
    categoria_id: int
    model_config = ConfigDict(from_attributes=True)


class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaResponse(CategoriaBase):
    id: int
    subcategorias: List[SubcategoriaResponse] = []
    model_config = ConfigDict(from_attributes=True)


class MaterialBase(BaseModel):
    sku: str
    nome: str
    descricao: Optional[str] = None
    categoria_id: int
    subcategoria_id: Optional[int] = None
    unidade_medida_id: int
    estoque_minimo: Decimal = Decimal("0.0000")


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    sku: Optional[str] = None
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    subcategoria_id: Optional[int] = None
    unidade_medida_id: Optional[int] = None
    estoque_minimo: Optional[Decimal] = None
    ativo: Optional[bool] = None


class SaldoItemResponse(BaseModel):
    localizacao_id: uuid.UUID
    localizacao_nome: Optional[str] = None
    quantidade_fisica: Decimal
    quantidade_reservada: Decimal
    quantidade_disponivel: Decimal

    model_config = ConfigDict(from_attributes=True)


class MaterialResponse(MaterialBase):
    id: uuid.UUID
    custo_medio_atual: Decimal
    ativo: bool
    categoria: Optional[CategoriaBase] = None
    subcategoria: Optional[SubcategoriaBase] = None
    unidade_medida: Optional[UnidadeMedidaResponse] = None
    quantidade_fisica_total: Optional[Decimal] = None
    quantidade_reservada_total: Optional[Decimal] = None
    quantidade_disponivel_total: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)
