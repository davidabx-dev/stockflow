import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.usuario import Usuario
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/saldo-comprometido")
async def relatorio_saldo_comprometido(
    material_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Relatório de saldo reservado por material com drill-down das requisições responsáveis.
    """
    return await ReportService.relatorio_saldo_comprometido(db, material_id)


@router.get("/consumo-obra")
async def relatorio_consumo_obra(
    obra_id: Optional[uuid.UUID] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Consumo por obra em R$ com soma de valores totais de saída e devoluções.
    """
    return await ReportService.relatorio_consumo_por_obra(db, obra_id, data_inicio, data_fim)


@router.get("/materiais-minimo")
async def relatorio_materiais_minimo(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Relatório de materiais que atingiram ou estão abaixo do estoque mínimo.
    """
    return await ReportService.relatorio_materiais_abaixo_minimo(db)


@router.get("/posicao-valor-estoque")
async def relatorio_posicao_valor_estoque(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Posição e valorização financeira do estoque (quantidade física * custo médio atual).
    """
    return await ReportService.relatorio_posicao_valor_estoque(db)
