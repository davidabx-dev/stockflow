import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.estoque import TipoMovimentacaoEnum, FinalidadeEnum


class EntradaCreate(BaseModel):
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade: Decimal
    custo_unitario: Decimal
    finalidade: FinalidadeEnum = FinalidadeEnum.ENTRADA_COMPRA
    numero_documento_fiscal: Optional[str] = None
    observacao: Optional[str] = None


class SaidaDiretaCreate(BaseModel):
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade: Decimal
    finalidade: FinalidadeEnum
    obra_id: Optional[uuid.UUID] = None
    observacao: Optional[str] = None


class DevolucaoCreate(BaseModel):
    movimentacao_saida_id: uuid.UUID
    quantidade: Decimal
    motivo: Optional[str] = None


class AjusteCreate(BaseModel):
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade_diferenca: Decimal  # Positivo ou negativo
    motivo: str
    sessao_inventario_id: Optional[uuid.UUID] = None


class MovimentacaoResponse(BaseModel):
    id: uuid.UUID
    tipo: TipoMovimentacaoEnum
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    localizacao_destino_id: Optional[uuid.UUID] = None
    quantidade: Decimal
    custo_unitario: Decimal
    valor_total: Decimal
    finalidade: FinalidadeEnum
    obra_id: Optional[uuid.UUID] = None
    requisicao_id: Optional[uuid.UUID] = None
    movimentacao_origem_id: Optional[uuid.UUID] = None
    sessao_inventario_id: Optional[uuid.UUID] = None
    motivo_ajuste: Optional[str] = None
    numero_documento_fiscal: Optional[str] = None
    observacao: Optional[str] = None
    usuario_id: uuid.UUID
    created_at: datetime

    # Dados desnormalizados úteis para listagem
    material_nome: Optional[str] = None
    material_sku: Optional[str] = None
    usuario_nome: Optional[str] = None
    obra_nome: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SaldoLocalizacaoResponse(BaseModel):
    id: uuid.UUID
    material_id: uuid.UUID
    localizacao_id: uuid.UUID
    quantidade_fisica: Decimal
    quantidade_reservada: Decimal
    quantidade_disponivel: Decimal

    material_nome: Optional[str] = None
    material_sku: Optional[str] = None
    localizacao_nome: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
