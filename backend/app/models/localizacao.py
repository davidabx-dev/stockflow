import uuid
from datetime import datetime, timezone
import enum
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TipoLocalizacaoEnum(str, enum.Enum):
    ALMOXARIFADO = "ALMOXARIFADO"
    OBRA = "OBRA"
    DEPOSITO_GERAL = "DEPOSITO_GERAL"


class Localizacao(Base):
    __tablename__ = "localizacoes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo: Mapped[TipoLocalizacaoEnum] = mapped_column(
        Enum(TipoLocalizacaoEnum, name="tipo_localizacao_enum", create_type=False),
        default=TipoLocalizacaoEnum.ALMOXARIFADO,
        nullable=False,
    )
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relacionamentos
    saldos = relationship("EstoquePorLocalizacao", back_populates="localizacao", cascade="all, delete-orphan")
    movimentacoes_origem = relationship("Movimentacao", foreign_keys="Movimentacao.localizacao_id", back_populates="localizacao")
    movimentacoes_destino = relationship("Movimentacao", foreign_keys="Movimentacao.localizacao_destino_id", back_populates="localizacao_destino")
