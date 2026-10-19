import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_current_user,
    get_current_almoxarife_or_admin,
)
from app.models.usuario import Usuario
from app.models.obra import Obra
from app.schemas.obra import ObraCreate, ObraUpdate, ObraResponse

router = APIRouter()


@router.get("", response_model=List[ObraResponse])
async def list_obras(
    ativa: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    stmt = select(Obra).order_by(Obra.nome)
    if ativa is not None:
        stmt = stmt.where(Obra.ativa == ativa)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=ObraResponse)
async def create_obra(
    body: ObraCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt_exist = select(Obra).where(Obra.codigo_obra == body.codigo_obra.upper())
    res = await db.execute(stmt_exist)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Código de obra já cadastrado.")

    obra = Obra(
        codigo_obra=body.codigo_obra.upper().strip(),
        nome=body.nome.strip(),
        endereco=body.endereco,
        responsavel=body.responsavel,
        ativa=body.ativa,
    )
    db.add(obra)
    await db.commit()
    await db.refresh(obra)
    return obra


@router.put("/{obra_id}", response_model=ObraResponse)
async def update_obra(
    obra_id: uuid.UUID,
    body: ObraUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt = select(Obra).where(Obra.id == obra_id)
    res = await db.execute(stmt)
    obra = res.scalar_one_or_none()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada.")

    if body.codigo_obra is not None:
        obra.codigo_obra = body.codigo_obra.upper().strip()
    if body.nome is not None:
        obra.nome = body.nome.strip()
    if body.endereco is not None:
        obra.endereco = body.endereco
    if body.responsavel is not None:
        obra.responsavel = body.responsavel
    if body.ativa is not None:
        obra.ativa = body.ativa

    await db.commit()
    await db.refresh(obra)
    return obra
