import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.inventario import StatusInventarioEnum


class ContagemItemInput(BaseModel):
    material_id: uuid.UUID
    quantidade_contada: Decimal


class SessaoInventarioCreate(BaseModel):
    localizacao_id: uuid.UUID
    observacao: Optional[str] = None


class LancarContagensRequest(BaseModel):
    contagens: List[ContagemItemInput]


class InventarioItemResponse(BaseModel):
    id: uuid.UUID
    sessao_inventario_id: uuid.UUID
    material_id: uuid.UUID
    quantidade_sistema_anterior: Decimal
    quantidade_contada: Decimal
    diferenca: Decimal
    custo_unitario_aplicado: Decimal
    valor_total_diferenca: Decimal
    ajuste_movimentacao_id: Optional[uuid.UUID] = None

    material_nome: Optional[str] = None
    material_sku: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SessaoInventarioResponse(BaseModel):
    id: uuid.UUID
    numero: str
    localizacao_id: uuid.UUID
    usuario_id: uuid.UUID
    status: StatusInventarioEnum
    observacao: Optional[str] = None
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None

    itens: List[InventarioItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
