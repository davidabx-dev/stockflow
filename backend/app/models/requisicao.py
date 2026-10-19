import uuid
from datetime import datetime, timezone
from decimal import Decimal
import enum
from typing import List, Optional
from sqlalchemy import (
    String, DateTime, Numeric, Enum, ForeignKey, CheckConstraint, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.estoque import FinalidadeEnum


class StatusRequisicaoEnum(str, enum.Enum):
    PENDENTE = "PENDENTE"
    APROVADA = "APROVADA"
    REJEITADA = "REJEITADA"
    SEPARADA = "SEPARADA"
    ENTREGUE = "ENTREGUE"
    CANCELADA = "CANCELADA"


class StatusItemEnum(str, enum.Enum):
    PENDENTE = "PENDENTE"
    RESERVADO = "RESERVADO"
    SEPARADO = "SEPARADO"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"


class Requisicao(Base):
    __tablename__ = "requisicoes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    numero: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    solicitante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    obra_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("obras.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    
    finalidade: Mapped[FinalidadeEnum] = mapped_column(
        Enum(FinalidadeEnum, name="finalidade_enum", create_type=False),
        nullable=False,
        index=True
    )
    status: Mapped[StatusRequisicaoEnum] = mapped_column(
        Enum(StatusRequisicaoEnum, name="status_requisicao_enum", create_type=False),
        default=StatusRequisicaoEnum.PENDENTE,
        nullable=False,
        index=True
    )
    
    justificativa: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    motivo_rejeicao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data_necessidade: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Rastreamento de Aprovação
    aprovador_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=True
    )
    aprovado_em: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Rastreamento de Separação
    separado_por_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=True
    )
    separado_em: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Rastreamento de Entrega
    entregue_por_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=True
    )
    recebido_por: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)  # Nome de quem recebeu fisicamente
    entregue_em: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relacionamentos
    solicitante = relationship("Usuario", foreign_keys=[solicitante_id], back_populates="requisicoes_solicitadas")
    aprovador = relationship("Usuario", foreign_keys=[aprovador_id], back_populates="requisicoes_aprovadas")
    separador = relationship("Usuario", foreign_keys=[separado_por_id], back_populates="requisicoes_separadas")
    entregador = relationship("Usuario", foreign_keys=[entregue_por_id], back_populates="requisicoes_entregues")
    obra = relationship("Obra", back_populates="requisicoes")
    
    itens: Mapped[List["RequisicaoItem"]] = relationship(
        "RequisicaoItem", back_populates="requisicao", cascade="all, delete-orphan"
    )
    movimentacoes = relationship("Movimentacao", back_populates="requisicao")


class RequisicaoItem(Base):
    __tablename__ = "requisicao_itens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    requisicao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requisicoes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materiais.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    localizacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("localizacoes.id", ondelete="RESTRICT"), nullable=False
    )
    
    quantidade_solicitada: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    quantidade_atendida: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("0.0000"), nullable=False)
    
    status_item: Mapped[StatusItemEnum] = mapped_column(
        Enum(StatusItemEnum, name="status_item_enum", create_type=False),
        default=StatusItemEnum.PENDENTE,
        nullable=False,
    )
    observacao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("quantidade_solicitada > 0", name="chk_req_item_qtd_solicitada_positiva"),
        CheckConstraint("quantidade_atendida >= 0", name="chk_req_item_qtd_atendida_nao_negativa"),
        CheckConstraint("quantidade_atendida <= quantidade_solicitada", name="chk_req_item_qtd_atendida_lte_solicitada"),
    )

    # Relacionamentos
    requisicao = relationship("Requisicao", back_populates="itens")
    material = relationship("Material", back_populates="requisicao_itens")
    localizacao = relationship("Localizacao")
