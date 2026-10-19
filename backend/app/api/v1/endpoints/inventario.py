import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import (
    get_db,
    get_current_almoxarife_or_admin,
    get_client_ip,
)
from app.core.exceptions import StockFlowException
from app.models.usuario import Usuario
from app.models.inventario import (
    SessaoInventario,
    InventarioItem,
    StatusInventarioEnum,
)
from app.schemas.inventario import (
    SessaoInventarioCreate,
    LancarContagensRequest,
    SessaoInventarioResponse,
)
from app.services.inventory_service import InventoryService

router = APIRouter()


@router.post("/sessoes", response_model=SessaoInventarioResponse)
async def abrir_sessao_inventario(
    body: SessaoInventarioCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Abre uma nova sessão de contagem física de inventário.
    """
    try:
        ip = get_client_ip(request)
        sessao = await InventoryService.abrir_sessao(
            db=db,
            localizacao_id=body.localizacao_id,
            usuario_id=current_user.id,
            observacao=body.observacao,
            ip_address=ip,
        )
        await db.commit()
        return await get_sessao_inventario(sessao.id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.get("/sessoes", response_model=List[SessaoInventarioResponse])
async def list_sessoes_inventario(
    status: Optional[StatusInventarioEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Lista todas as sessões de inventário registradas.
    """
    stmt = (
        select(SessaoInventario)
        .options(
            selectinload(SessaoInventario.itens).selectinload(InventarioItem.material),
        )
        .order_by(SessaoInventario.data_abertura.desc())
    )
    if status:
        stmt = stmt.where(SessaoInventario.status == status)

    res = await db.execute(stmt)
    sessoes = res.scalars().all()

    resultado = []
    for s in sessoes:
        itens_res = [
            {
                "id": it.id,
                "sessao_inventario_id": it.sessao_inventario_id,
                "material_id": it.material_id,
                "quantidade_sistema_anterior": it.quantidade_sistema_anterior,
                "quantidade_contada": it.quantidade_contada,
                "diferenca": it.diferenca,
                "custo_unitario_aplicado": it.custo_unitario_aplicado,
                "valor_total_diferenca": it.valor_total_diferenca,
                "ajuste_movimentacao_id": it.ajuste_movimentacao_id,
                "material_nome": it.material.nome if it.material else None,
                "material_sku": it.material.sku if it.material else None,
            }
            for it in s.itens
        ]
        resultado.append({
            "id": s.id,
            "numero": s.numero,
            "localizacao_id": s.localizacao_id,
            "usuario_id": s.usuario_id,
            "status": s.status,
            "observacao": s.observacao,
            "data_abertura": s.data_abertura,
            "data_fechamento": s.data_fechamento,
            "itens": itens_res,
        })
    return resultado


@router.get("/sessoes/{sessao_id}", response_model=SessaoInventarioResponse)
async def get_sessao_inventario(
    sessao_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Obtém os detalhes e itens contados de uma sessão de inventário.
    """
    stmt = (
        select(SessaoInventario)
        .options(
            selectinload(SessaoInventario.itens).selectinload(InventarioItem.material),
        )
        .where(SessaoInventario.id == sessao_id)
    )
    res = await db.execute(stmt)
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Sessão de inventário não encontrada.")

    itens_res = [
        {
            "id": it.id,
            "sessao_inventario_id": it.sessao_inventario_id,
            "material_id": it.material_id,
            "quantidade_sistema_anterior": it.quantidade_sistema_anterior,
            "quantidade_contada": it.quantidade_contada,
            "diferenca": it.diferenca,
            "custo_unitario_aplicado": it.custo_unitario_aplicado,
            "valor_total_diferenca": it.valor_total_diferenca,
            "ajuste_movimentacao_id": it.ajuste_movimentacao_id,
            "material_nome": it.material.nome if it.material else None,
            "material_sku": it.material.sku if it.material else None,
        }
        for it in s.itens
    ]

    return {
        "id": s.id,
        "numero": s.numero,
        "localizacao_id": s.localizacao_id,
        "usuario_id": s.usuario_id,
        "status": s.status,
        "observacao": s.observacao,
        "data_abertura": s.data_abertura,
        "data_fechamento": s.data_fechamento,
        "itens": itens_res,
    }


@router.post("/sessoes/{sessao_id}/contagens", response_model=SessaoInventarioResponse)
async def lancar_contagens(
    sessao_id: uuid.UUID,
    body: LancarContagensRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Lança contagens físicas para materiais da sessão e compara com o sistema.
    """
    try:
        ip = get_client_ip(request)
        contagens_data = [c.model_dump() for c in body.contagens]
        await InventoryService.lancar_contagens(
            db=db,
            sessao_id=sessao_id,
            contagens=contagens_data,
            usuario_id=current_user.id,
            ip_address=ip,
        )
        await db.commit()
        return await get_sessao_inventario(sessao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/sessoes/{sessao_id}/confirmar", response_model=SessaoInventarioResponse)
async def confirmar_sessao(
    sessao_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Confirma a sessão de inventário e gera os ajustes de estoque no livro-razão.
    """
    try:
        ip = get_client_ip(request)
        await InventoryService.confirmar_sessao(
            db=db,
            sessao_id=sessao_id,
            usuario_id=current_user.id,
            ip_address=ip,
        )
        await db.commit()
        return await get_sessao_inventario(sessao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)
