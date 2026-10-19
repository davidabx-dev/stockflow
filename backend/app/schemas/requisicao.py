import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.requisicao import StatusRequisicaoEnum, StatusItemEnum
from app.models.estoque import FinalidadeEnum
from app.schemas.auth import UsuarioResponse
from app.schemas.obra import ObraResponse


class RequisicaoItemCreate(BaseModel):
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade_solicitada: Decimal
    observacao: Optional[str] = None


class RequisicaoItemResponse(BaseModel):
    id: uuid.UUID
    requisicao_id: uuid.UUID
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade_solicitada: Decimal
    quantidade_atendida: Decimal
    status_item: StatusItemEnum
    observacao: Optional[str] = None

    material_nome: Optional[str] = None
    material_sku: Optional[str] = None
    material_unidade: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RequisicaoCreate(BaseModel):
    obra_id: Optional[uuid.UUID] = None
    finalidade: FinalidadeEnum = FinalidadeEnum.OBRA
    justificativa: Optional[str] = None
    data_necessidade: Optional[datetime] = None
    itens: List[RequisicaoItemCreate]


class RequisicaoAprovacao(BaseModel):
    pass


class RequisicaoRejeicao(BaseModel):
    motivo: str


class RequisicaoEntrega(BaseModel):
    recebido_por: str  # Nome / documento de quem pegou o material fisicamente


class RequisicaoResponse(BaseModel):
    id: uuid.UUID
    numero: str
    solicitante_id: uuid.UUID
    obra_id: Optional[uuid.UUID] = None
    finalidade: FinalidadeEnum
    status: StatusRequisicaoEnum
    justificativa: Optional[str] = None
    motivo_rejeicao: Optional[str] = None
    data_necessidade: Optional[datetime] = None
    
    aprovador_id: Optional[uuid.UUID] = None
    aprovado_em: Optional[datetime] = None
    separado_por_id: Optional[uuid.UUID] = None
    separado_em: Optional[datetime] = None
    entregue_por_id: Optional[uuid.UUID] = None
    recebido_por: Optional[str] = None
    entregue_em: Optional[datetime] = None
    
    created_at: datetime
    updated_at: datetime

    solicitante: Optional[UsuarioResponse] = None
    aprovador: Optional[UsuarioResponse] = None
    separador: Optional[UsuarioResponse] = None
    entregador: Optional[UsuarioResponse] = None
    obra: Optional[ObraResponse] = None
    itens: List[RequisicaoItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
