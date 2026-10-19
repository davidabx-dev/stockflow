import uuid
from datetime import datetime
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
from app.models.usuario import Usuario
from app.models.estoque import (
    Movimentacao,
    EstoquePorLocalizacao,
    TipoMovimentacaoEnum,
    FinalidadeEnum,
)
from app.models.material import Material
from app.schemas.estoque import (
    EntradaCreate,
    SaidaDiretaCreate,
    DevolucaoCreate,
    AjusteCreate,
    MovimentacaoResponse,
    SaldoLocalizacaoResponse,
)
from app.services.stock_engine import StockEngine

router = APIRouter()


@router.post("/entradas", response_model=MovimentacaoResponse)
async def registrar_entrada(
    body: EntradaCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Registra entrada física de mercadoria e recalcula o custo médio ponderado móvel.
    """
    try:
        ip = get_client_ip(request)
        mov = await StockEngine.registrar_entrada(
            db=db,
            material_id=body.material_id,
            localizacao_id=body.localizacao_id,
            quantidade=body.quantidade,
            custo_unitario=body.custo_unitario,
            usuario_id=current_user.id,
            finalidade=body.finalidade,
            numero_documento_fiscal=body.numero_documento_fiscal,
            observacao=body.observacao,
            ip_address=ip,
        )
        await db.commit()
        await db.refresh(mov)
        return mov
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/saidas-diretas", response_model=MovimentacaoResponse)
async def registrar_saida_direta(
    body: SaidaDiretaCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Registra saída avulsa de material usando o custo médio vigente sem alterá-lo.
    """
    try:
        ip = get_client_ip(request)
        mov = await StockEngine.registrar_saida_direta(
            db=db,
            material_id=body.material_id,
            localizacao_id=body.localizacao_id,
            quantidade=body.quantidade,
            usuario_id=current_user.id,
            finalidade=body.finalidade,
            obra_id=body.obra_id,
            observacao=body.observacao,
            ip_address=ip,
        )
        await db.commit()
        await db.refresh(mov)
        return mov
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/devolucoes", response_model=MovimentacaoResponse)
async def registrar_devolucao(
    body: DevolucaoCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Registra devolução reaproveitando o custo histórico da saída original.
    """
    try:
        ip = get_client_ip(request)
        mov = await StockEngine.registrar_devolucao(
            db=db,
            movimentacao_saida_id=body.movimentacao_saida_id,
            quantidade=body.quantidade,
            usuario_id=current_user.id,
            motivo=body.motivo,
            ip_address=ip,
        )
        await db.commit()
        await db.refresh(mov)
        return mov
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/ajustes", response_model=MovimentacaoResponse)
async def registrar_ajuste(
    body: AjusteCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    """
    Registra ajuste de inventário manual com motivo obrigatório.
    """
    try:
        ip = get_client_ip(request)
        mov = await StockEngine.registrar_ajuste(
            db=db,
            material_id=body.material_id,
            localizacao_id=body.localizacao_id,
            quantidade_diferenca=body.quantidade_diferenca,
            motivo=body.motivo,
            usuario_id=current_user.id,
            sessao_inventario_id=body.sessao_inventario_id,
            ip_address=ip,
        )
        await db.commit()
        await db.refresh(mov)
        return mov
    except StockFlowException as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=e.message)


@router.get("/movimentacoes", response_model=List[MovimentacaoResponse])
async def list_movimentacoes(
    tipo: Optional[TipoMovimentacaoEnum] = None,
    material_id: Optional[uuid.UUID] = None,
    localizacao_id: Optional[uuid.UUID] = None,
    obra_id: Optional[uuid.UUID] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Consulta o livro-razão imutável (Ledger) de movimentações.
    """
    stmt = (
        select(Movimentacao)
        .options(
            selectinload(Movimentacao.material),
            selectinload(Movimentacao.localizacao),
            selectinload(Movimentacao.obra),
            selectinload(Movimentacao.usuario),
        )
        .order_by(Movimentacao.created_at.desc())
    )

    filtros = []
    if tipo:
        filtros.append(Movimentacao.tipo == tipo)
    if material_id:
        filtros.append(Movimentacao.material_id == material_id)
    if localizacao_id:
        filtros.append(Movimentacao.localizacao_id == localizacao_id)
    if obra_id:
        filtros.append(Movimentacao.obra_id == obra_id)
    if data_inicio:
        filtros.append(Movimentacao.created_at >= data_inicio)
    if data_fim:
        filtros.append(Movimentacao.created_at <= data_fim)

    if filtros:
        stmt = stmt.where(and_(*filtros))

    stmt = stmt.offset(offset).limit(limit)
    res = await db.execute(stmt)
    movs = res.scalars().all()

    resultado = []
    for m in movs:
        resultado.append({
            "id": m.id,
            "tipo": m.tipo,
            "material_id": m.material_id,
            "localizacao_id": m.localizacao_id,
            "localizacao_destino_id": m.localizacao_destino_id,
            "quantidade": m.quantidade,
            "custo_unitario": m.custo_unitario,
            "valor_total": m.valor_total,
            "finalidade": m.finalidade,
            "obra_id": m.obra_id,
            "requisicao_id": m.requisicao_id,
            "movimentacao_origem_id": m.movimentacao_origem_id,
            "sessao_inventario_id": m.sessao_inventario_id,
            "motivo_ajuste": m.motivo_ajuste,
            "numero_documento_fiscal": m.numero_documento_fiscal,
            "observacao": m.observacao,
            "usuario_id": m.usuario_id,
            "created_at": m.created_at,
            "material_nome": m.material.nome if m.material else None,
            "material_sku": m.material.sku if m.material else None,
            "usuario_nome": m.usuario.nome if m.usuario else None,
            "obra_nome": m.obra.nome if m.obra else None,
        })

    return resultado


@router.get("/saldos", response_model=List[SaldoLocalizacaoResponse])
async def list_saldos(
    material_id: Optional[uuid.UUID] = None,
    localizacao_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Lista saldos físicos e reservados por localização.
    """
    stmt = (
        select(EstoquePorLocalizacao)
        .options(
            selectinload(EstoquePorLocalizacao.material),
            selectinload(EstoquePorLocalizacao.localizacao),
        )
    )

    filtros = []
    if material_id:
        filtros.append(EstoquePorLocalizacao.material_id == material_id)
    if localizacao_id:
        filtros.append(EstoquePorLocalizacao.localizacao_id == localizacao_id)

    if filtros:
        stmt = stmt.where(and_(*filtros))

    res = await db.execute(stmt)
    saldos = res.scalars().all()

    return [
        {
            "id": s.id,
            "material_id": s.material_id,
            "localizacao_id": s.localizacao_id,
            "quantidade_fisica": s.quantidade_fisica,
            "quantidade_reservada": s.quantidade_reservada,
            "quantidade_disponivel": s.quantidade_fisica - s.quantidade_reservada,
            "material_nome": s.material.nome if s.material else None,
            "material_sku": s.material.sku if s.material else None,
            "localizacao_nome": s.localizacao.nome if s.localizacao else None,
        }
        for s in saldos
    ]
