import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import (
    get_db,
    get_current_user,
    get_current_almoxarife_or_admin,
    get_client_ip,
)
from app.core.exceptions import StockFlowException
from app.models.usuario import Usuario, RoleEnum
from app.models.requisicao import (
    Requisicao,
    RequisicaoItem,
    StatusRequisicaoEnum,
)
from app.models.estoque import FinalidadeEnum
from app.schemas.requisicao import (
    RequisicaoCreate,
    RequisicaoResponse,
    RequisicaoRejeicao,
    RequisicaoEntrega,
)
from app.services.requisition_service import RequisitionService

router = APIRouter()


@router.post("", response_model=RequisicaoResponse)
async def criar_requisicao(
    body: RequisicaoCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Cria uma nova requisição de materiais em estado PENDENTE.
    """
    try:
        ip = get_client_ip(request)
        itens_data = [item.model_dump() for item in body.itens]
        req = await RequisitionService.criar_requisicao(
            db=db,
            solicitante_id=current_user.id,
            finalidade=body.finalidade,
            itens_data=itens_data,
            obra_id=body.obra_id,
            justificativa=body.justificativa,
            data_necessidade=body.data_necessidade,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(req.id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.get("", response_model=List[RequisicaoResponse])
async def list_requisicoes(
    status: Optional[StatusRequisicaoEnum] = None,
    finalidade: Optional[FinalidadeEnum] = None,
    obra_id: Optional[uuid.UUID] = None,
    minhas_requisicoes: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Lista requisições de materiais.
    Usuários com role SOLICITANTE visualizam apenas as suas por padrão se solicitarem.
    """
    stmt = (
        select(Requisicao)
        .options(
            selectinload(Requisicao.solicitante),
            selectinload(Requisicao.aprovador),
            selectinload(Requisicao.separador),
            selectinload(Requisicao.entregador),
            selectinload(Requisicao.obra),
            selectinload(Requisicao.itens).selectinload(RequisicaoItem.material),
        )
        .order_by(Requisicao.created_at.desc())
    )

    filtros = []
    if status:
        filtros.append(Requisicao.status == status)
    if finalidade:
        filtros.append(Requisicao.finalidade == finalidade)
    if obra_id:
        filtros.append(Requisicao.obra_id == obra_id)

    # Se for solicitante comum ou se explicitamente marcado
    if current_user.role == RoleEnum.SOLICITANTE or minhas_requisicoes:
        filtros.append(Requisicao.solicitante_id == current_user.id)

    if filtros:
        stmt = stmt.where(and_(*filtros))

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{requisicao_id}", response_model=RequisicaoResponse)
async def get_requisicao(
    requisicao_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Obtém os detalhes completos de uma requisição.
    """
    stmt = (
        select(Requisicao)
        .options(
            selectinload(Requisicao.solicitante),
            selectinload(Requisicao.aprovador),
            selectinload(Requisicao.separador),
            selectinload(Requisicao.entregador),
            selectinload(Requisicao.obra),
            selectinload(Requisicao.itens).selectinload(RequisicaoItem.material),
        )
        .where(Requisicao.id == requisicao_id)
    )
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Requisição não encontrada.")

    # Se for solicitante e não for admin/almoxarife, só pode ver a sua própria
    if current_user.role == RoleEnum.SOLICITANTE and req.solicitante_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado a esta requisição.")

    return req


@router.post("/{requisicao_id}/aprovar", response_model=RequisicaoResponse)
async def aprovar_requisicao(
    requisicao_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Aprova a requisição e executa a reserva automática de estoque.
    Regra de Segurança: O solicitante não pode aprovar a própria requisição.
    """
    try:
        ip = get_client_ip(request)
        await RequisitionService.aprovar_requisicao(
            db=db,
            requisicao_id=requisicao_id,
            aprovador_id=current_user.id,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(requisicao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/{requisicao_id}/separar", response_model=RequisicaoResponse)
async def separar_requisicao(
    requisicao_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Marca os materiais da requisição como SEPARADOS pelo almoxarife.
    """
    try:
        ip = get_client_ip(request)
        await RequisitionService.separar_requisicao(
            db=db,
            requisicao_id=requisicao_id,
            separador_id=current_user.id,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(requisicao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/{requisicao_id}/entregar", response_model=RequisicaoResponse)
async def entregar_requisicao(
    requisicao_id: uuid.UUID,
    body: RequisicaoEntrega,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Realiza a baixa física definitiva, estorna a reserva e registra a saída de materiais.
    """
    try:
        ip = get_client_ip(request)
        await RequisitionService.entregar_requisicao(
            db=db,
            requisicao_id=requisicao_id,
            entregador_id=current_user.id,
            recebido_por=body.recebido_por,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(requisicao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/{requisicao_id}/rejeitar", response_model=RequisicaoResponse)
async def rejeitar_requisicao(
    requisicao_id: uuid.UUID,
    body: RequisicaoRejeicao,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Rejeita uma requisição PENDENTE fornecendo o motivo.
    """
    try:
        ip = get_client_ip(request)
        await RequisitionService.rejeitar_requisicao(
            db=db,
            requisicao_id=requisicao_id,
            aprovador_id=current_user.id,
            motivo=body.motivo,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(requisicao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/{requisicao_id}/cancelar", response_model=RequisicaoResponse)
async def cancelar_requisicao(
    requisicao_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Cancela a requisição e estorna a reserva se já estava aprovada.
    Proteção BOLA/IDOR: Solicitante só pode cancelar sua própria requisição.
    """
    stmt_check = select(Requisicao).where(Requisicao.id == requisicao_id)
    res_check = await db.execute(stmt_check)
    req_exist = res_check.scalar_one_or_none()
    if not req_exist:
        raise HTTPException(status_code=404, detail="Requisição não encontrada.")

    if current_user.role == RoleEnum.SOLICITANTE and req_exist.solicitante_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode cancelar suas próprias requisições.")

    try:
        ip = get_client_ip(request)
        await RequisitionService.cancelar_requisicao(
            db=db,
            requisicao_id=requisicao_id,
            usuario_id=current_user.id,
            ip_address=ip,
        )
        await db.commit()
        return await get_requisicao(requisicao_id, db, current_user)
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)
