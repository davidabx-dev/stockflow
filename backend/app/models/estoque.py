import uuid
from datetime import datetime, timezone
from decimal import Decimal
import enum
from typing import Optional
from sqlalchemy import (
    String, DateTime, Numeric, Enum, ForeignKey, CheckConstraint, UniqueConstraint, Index, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TipoMovimentacaoEnum(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    DEVOLUCAO = "DEVOLUCAO"
    AJUSTE = "AJUSTE"
    TRANSFERENCIA = "TRANSFERENCIA"  # Placeholder V3 para futura expansão


class FinalidadeEnum(str, enum.Enum):
    OBRA = "OBRA"
    MANUTENCAO = "MANUTENCAO"
    USO_INTERNO = "USO_INTERNO"
    REPOSICAO = "REPOSICAO"
    OUTRO = "OUTRO"
    AJUSTE_INVENTARIO = "AJUSTE_INVENTARIO"
    ENTRADA_COMPRA = "ENTRADA_COMPRA"
    DEVOLUCAO_OBRA = "DEVOLUCAO_OBRA"


class EstoquePorLocalizacao(Base):
    """
    Tabela de junção material x localizacao carregando o saldo físico e reservado.
    Disponível = física - reservada.
    """
    __tablename__ = "estoque_por_localizacao"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materiais.id", ondelete="CASCADE"), nullable=False, index=True
    )
    localizacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("localizacoes.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    
    quantidade_fisica: Mapped[Decimal] = mapped_column(
        Numeric(12, 4), default=Decimal("0.0000"), nullable=False
    )
    quantidade_reservada: Mapped[Decimal] = mapped_column(
        Numeric(12, 4), default=Decimal("0.0000"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Constraints de Integridade estritas no Banco
    __table_args__ = (
        UniqueConstraint("material_id", "localizacao_id", name="uq_estoque_material_localizacao"),
        CheckConstraint("quantidade_fisica >= 0", name="chk_estoque_qtd_fisica_positiva"),
        CheckConstraint("quantidade_reservada >= 0", name="chk_estoque_qtd_reservada_positiva"),
        CheckConstraint("quantidade_fisica >= quantidade_reservada", name="chk_estoque_fisica_gte_reservada"),
    )

    # Relacionamentos
    material = relationship("Material", back_populates="saldos_localizacao")
    localizacao = relationship("Localizacao", back_populates="saldos")

    @property
    def quantidade_disponivel(self) -> Decimal:
        return self.quantidade_fisica - self.quantidade_reservada


class Movimentacao(Base):
    """
    Livro-razão imutável (Ledger) do estoque.
    Cada linha grava o custo unitário e valor total vigentes no momento.
    """
    __tablename__ = "movimentacoes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tipo: Mapped[TipoMovimentacaoEnum] = mapped_column(
        Enum(TipoMovimentacaoEnum, name="tipo_movimentacao_enum", create_type=False),
        nullable=False,
        index=True
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materiais.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    localizacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("localizacoes.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    localizacao_destino_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("localizacoes.id", ondelete="RESTRICT"), nullable=True
    )
    
    quantidade: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    custo_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    valor_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    finalidade: Mapped[FinalidadeEnum] = mapped_column(
        Enum(FinalidadeEnum, name="finalidade_enum", create_type=False),
        nullable=False,
        index=True
    )
    obra_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("obras.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    requisicao_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requisicoes.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    requisicao_item_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requisicao_itens.id", ondelete="RESTRICT"), nullable=True
    )
    
    # Auto-relacionamento para devolução vincular à saída original
    movimentacao_origem_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("movimentacoes.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    sessao_inventario_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessoes_inventario.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    
    motivo_ajuste: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    numero_documento_fiscal: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    observacao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    __table_args__ = (
        CheckConstraint("quantidade > 0", name="chk_movimentacao_qtd_positiva"),
        CheckConstraint("custo_unitario >= 0", name="chk_movimentacao_custo_nao_negativo"),
        CheckConstraint("valor_total >= 0", name="chk_movimentacao_valor_total_nao_negativo"),
        Index("ix_movimentacoes_obra_finalidade", "obra_id", "finalidade"),
    )

    # Relacionamentos
    material = relationship("Material", back_populates="movimentacoes")
    localizacao = relationship("Localizacao", foreign_keys=[localizacao_id], back_populates="movimentacoes_origem")
    localizacao_destino = relationship("Localizacao", foreign_keys=[localizacao_destino_id], back_populates="movimentacoes_destino")
    obra = relationship("Obra", back_populates="movimentacoes")
    usuario = relationship("Usuario", back_populates="movimentacoes")
    requisicao = relationship("Requisicao", back_populates="movimentacoes")
    sessao_inventario = relationship("SessaoInventario", back_populates="movimentacoes_ajuste")
    
    movimentacao_origem = relationship("Movimentacao", remote_side=[id], backref="devolucoes_vinculadas")
