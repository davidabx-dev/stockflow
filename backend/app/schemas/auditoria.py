import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class AuditoriaLogResponse(BaseModel):
    id: uuid.UUID
    tabela: str
    registro_id: str
    acao: str
    usuario_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    dados_anteriores: Optional[Dict[str, Any]] = None
    dados_novos: Optional[Dict[str, Any]] = None
    motivo: Optional[str] = None
    created_at: datetime
    
    usuario_nome: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
