import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_current_user,
    get_current_almoxarife_or_admin,
)
from app.models.usuario import Usuario
from app.models.localizacao import Localizacao
from app.schemas.localizacao import (
    LocalizacaoCreate,
    LocalizacaoUpdate,
    LocalizacaoResponse,
)

router = APIRouter()


@router.get("", response_model=List[LocalizacaoResponse])
async def list_localizacoes(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    stmt = select(Localizacao).order_by(Localizacao.nome)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=LocalizacaoResponse)
async def create_localizacao(
    body: LocalizacaoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt_exist = select(Localizacao).where(Localizacao.codigo == body.codigo.upper())
    res = await db.execute(stmt_exist)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Código de localização já cadastrado.")

    loc = Localizacao(
        codigo=body.codigo.upper().strip(),
        nome=body.nome.strip(),
        tipo=body.tipo,
        descricao=body.descricao,
        ativo=body.ativo,
    )
    db.add(loc)
    await db.commit()
    await db.refresh(loc)
    return loc


@router.put("/{localizacao_id}", response_model=LocalizacaoResponse)
async def update_localizacao(
    localizacao_id: uuid.UUID,
    body: LocalizacaoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt = select(Localizacao).where(Localizacao.id == localizacao_id)
    res = await db.execute(stmt)
    loc = res.scalar_one_or_none()
    if not loc:
        raise HTTPException(status_code=404, detail="Localização não encontrada.")

    if body.codigo is not None:
        loc.codigo = body.codigo.upper().strip()
    if body.nome is not None:
        loc.nome = body.nome.strip()
    if body.tipo is not None:
        loc.tipo = body.tipo
    if body.descricao is not None:
        loc.descricao = body.descricao
    if body.ativo is not None:
        loc.ativo = body.ativo

    await db.commit()
    await db.refresh(loc)
    return loc
