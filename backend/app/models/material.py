import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, Numeric, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UnidadeMedida(Base):
    __tablename__ = "unidades_medida"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sigla: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(50), nullable=False)
    fracionavel: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    materiais: Mapped[List["Material"]] = relationship("Material", back_populates="unidade_medida")


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    subcategorias: Mapped[List["Subcategoria"]] = relationship("Subcategoria", back_populates="categoria", cascade="all, delete-orphan")
    materiais: Mapped[List["Material"]] = relationship("Material", back_populates="categoria")


class Subcategoria(Base):
    __tablename__ = "subcategorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id", ondelete="CASCADE"), nullable=False)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    categoria: Mapped["Categoria"] = relationship("Categoria", back_populates="subcategorias")
    materiais: Mapped[List["Material"]] = relationship("Material", back_populates="subcategoria")


class Material(Base):
    __tablename__ = "materiais"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"), nullable=False)
    subcategoria_id: Mapped[Optional[int]] = mapped_column(ForeignKey("subcategorias.id"), nullable=True)
    unidade_medida_id: Mapped[int] = mapped_column(ForeignKey("unidades_medida.id"), nullable=False)
    
    estoque_minimo: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("0.0000"), nullable=False)
    custo_medio_atual: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
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
    categoria: Mapped["Categoria"] = relationship("Categoria", back_populates="materiais")
    subcategoria: Mapped[Optional["Subcategoria"]] = relationship("Subcategoria", back_populates="materiais")
    unidade_medida: Mapped["UnidadeMedida"] = relationship("UnidadeMedida", back_populates="materiais")
    
    saldos_localizacao = relationship("EstoquePorLocalizacao", back_populates="material", cascade="all, delete-orphan")
    movimentacoes = relationship("Movimentacao", back_populates="material")
    requisicao_itens = relationship("RequisicaoItem", back_populates="material")
