import uuid
from datetime import datetime, timezone
from decimal import Decimal
import enum
from typing import List, Optional
from sqlalchemy import (
    String, DateTime, Numeric, Enum, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StatusInventarioEnum(str, enum.Enum):
    ABERTA = "ABERTA"
    CONFIRMADA = "CONFIRMADA"
    CANCELADA = "CANCELADA"


class SessaoInventario(Base):
    """
    Sessão de contagem de inventário físico agrupando contagens e ajustes em lote.
    """
    __tablename__ = "sessoes_inventario"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    numero: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    localizacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("localizacoes.id", ondelete="RESTRICT"), nullable=False
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[StatusInventarioEnum] = mapped_column(
        Enum(StatusInventarioEnum, name="status_inventario_enum", create_type=False),
        default=StatusInventarioEnum.ABERTA,
        nullable=False,
        index=True
    )
    observacao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data_abertura: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    data_fechamento: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relacionamentos
    localizacao = relationship("Localizacao")
    usuario = relationship("Usuario", back_populates="sessoes_inventario")
    itens: Mapped[List["InventarioItem"]] = relationship(
        "InventarioItem", back_populates="sessao", cascade="all, delete-orphan"
    )
    movimentacoes_ajuste = relationship("Movimentacao", back_populates="sessao_inventario")


class InventarioItem(Base):
    """
    Item contado na sessão de inventário.
    """
    __tablename__ = "inventario_itens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sessao_inventario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessoes_inventario.id", ondelete="CASCADE"), nullable=False, index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materiais.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    
    quantidade_sistema_anterior: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    quantidade_contada: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    diferenca: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)  # contada - anterior
    
    custo_unitario_aplicado: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    valor_total_diferenca: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)  # diferenca * custo
    
    ajuste_movimentacao_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("movimentacoes.id", ondelete="SET NULL"), nullable=True
    )

    # Relacionamentos
    sessao = relationship("SessaoInventario", back_populates="itens")
    material = relationship("Material")
    ajuste_movimentacao = relationship("Movimentacao")
