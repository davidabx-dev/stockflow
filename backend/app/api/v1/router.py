from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    materiais,
    localizacoes,
    obras,
    estoque,
    requisicoes,
    inventario,
    relatorios,
    auditoria,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação & Usuários"])
api_router.include_router(materiais.router, prefix="/materiais", tags=["Materiais & Classificação"])
api_router.include_router(localizacoes.router, prefix="/localizacoes", tags=["Localizações"])
api_router.include_router(obras.router, prefix="/obras", tags=["Obras"])
api_router.include_router(estoque.router, prefix="/estoque", tags=["Operações de Estoque"])
api_router.include_router(requisicoes.router, prefix="/requisicoes", tags=["Requisições & Reservas"])
api_router.include_router(inventario.router, prefix="/inventario", tags=["Inventário Físico"])
api_router.include_router(relatorios.router, prefix="/relatorios", tags=["Relatórios"])
api_router.include_router(auditoria.router, prefix="/auditoria", tags=["Auditoria Imutável"])
