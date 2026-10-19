import uuid
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auditoria import AuditoriaLog


class AuditService:
    @staticmethod
    async def registrar_log(
        db: AsyncSession,
        tabela: str,
        registro_id: str,
        acao: str,
        usuario_id: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None,
        dados_anteriores: Optional[Dict[str, Any]] = None,
        dados_novos: Optional[Dict[str, Any]] = None,
        motivo: Optional[str] = None,
    ) -> AuditoriaLog:
        """
        Registra um log de auditoria imutável no banco de dados.
        """
        log = AuditoriaLog(
            tabela=tabela,
            registro_id=str(registro_id),
            acao=acao,
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores=dados_anteriores,
            dados_novos=dados_novos,
            motivo=motivo,
        )
        db.add(log)
        return log
