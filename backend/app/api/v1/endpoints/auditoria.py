import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import (
    get_db,
    get_current_auditor_or_admin,
)
from app.models.usuario import Usuario
from app.models.auditoria import AuditoriaLog
from app.schemas.auditoria import AuditoriaLogResponse

router = APIRouter()


@router.get("/logs", response_model=List[AuditoriaLogResponse])
async def list_auditoria_logs(
    tabela: Optional[str] = None,
    registro_id: Optional[str] = None,
    acao: Optional[str] = None,
    usuario_id: Optional[uuid.UUID] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_auditor_or_admin),
):
    """
    Consulta os registros de auditoria imutável do sistema (Admin ou Auditor).
    """
    stmt = (
        select(AuditoriaLog)
        .options(selectinload(AuditoriaLog.usuario))
        .order_by(AuditoriaLog.created_at.desc())
    )

    filtros = []
    if tabela:
        filtros.append(AuditoriaLog.tabela == tabela)
    if registro_id:
        filtros.append(AuditoriaLog.registro_id == registro_id)
    if acao:
        filtros.append(AuditoriaLog.acao == acao)
    if usuario_id:
        filtros.append(AuditoriaLog.usuario_id == usuario_id)

    if filtros:
        stmt = stmt.where(and_(*filtros))

    stmt = stmt.offset(offset).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return [
        {
            "id": log.id,
            "tabela": log.tabela,
            "registro_id": log.registro_id,
            "acao": log.acao,
            "usuario_id": log.usuario_id,
            "ip_address": log.ip_address,
            "dados_anteriores": log.dados_anteriores,
            "dados_novos": log.dados_novos,
            "motivo": log.motivo,
            "created_at": log.created_at,
            "usuario_nome": log.usuario.nome if log.usuario else None,
        }
        for log in logs
    ]
