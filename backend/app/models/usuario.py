import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    ALMOXARIFE = "ALMOXARIFE"
    SOLICITANTE = "SOLICITANTE"
    AUDITOR = "AUDITOR"


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, name="role_enum", create_type=False),
        default=RoleEnum.SOLICITANTE,
        nullable=False,
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relacionamentos
    requisicoes_solicitadas = relationship("Requisicao", foreign_keys="Requisicao.solicitante_id", back_populates="solicitante")
    requisicoes_aprovadas = relationship("Requisicao", foreign_keys="Requisicao.aprovador_id", back_populates="aprovador")
    requisicoes_separadas = relationship("Requisicao", foreign_keys="Requisicao.separado_por_id", back_populates="separador")
    requisicoes_entregues = relationship("Requisicao", foreign_keys="Requisicao.entregue_por_id", back_populates="entregador")
    movimentacoes = relationship("Movimentacao", back_populates="usuario")
    sessoes_inventario = relationship("SessaoInventario", back_populates="usuario")
