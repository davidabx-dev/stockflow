import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    SessaoInventarioFechadaError,
    StockFlowException,
)
from app.models.inventario import (
    SessaoInventario,
    InventarioItem,
    StatusInventarioEnum,
)
from app.models.estoque import EstoquePorLocalizacao
from app.models.material import Material
from app.services.stock_engine import StockEngine
from app.services.audit_service import AuditService


class InventoryService:
    """
    Serviço de Inventário Físico (Parte 4 da Checklist V3).
    Agrupa contagens físicas e confirmação de ajustes em lote.
    """

    @staticmethod
    async def abrir_sessao(
        db: AsyncSession,
        localizacao_id: uuid.UUID,
        usuario_id: uuid.UUID,
        observacao: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> SessaoInventario:
        """Abre uma nova sessão de contagem de inventário físico."""
        ano = datetime.now(timezone.utc).year
        id_curto = uuid.uuid4().hex[:6].upper()
        numero = f"INV-{ano}-{id_curto}"

        sessao = SessaoInventario(
            numero=numero,
            localizacao_id=localizacao_id,
            usuario_id=usuario_id,
            status=StatusInventarioEnum.ABERTA,
            observacao=observacao,
        )
        db.add(sessao)
        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="sessoes_inventario",
            registro_id=str(sessao.id),
            acao="ABRIR_SESSAO_INVENTARIO",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_novos={
                "numero": sessao.numero,
                "localizacao_id": str(localizacao_id),
            },
            motivo=observacao or "Abertura de sessão de contagem de inventário",
        )

        return sessao

    @staticmethod
    async def lancar_contagens(
        db: AsyncSession,
        sessao_id: uuid.UUID,
        contagens: List[Dict[str, Any]],
        usuario_id: uuid.UUID,
        ip_address: Optional[str] = None,
    ) -> SessaoInventario:
        """
        Lança a contagem física de N materiais para a sessão de inventário.
        Calcula as diferenças e valorizações com base no saldo atual e custo médio.
        """
        stmt = (
            select(SessaoInventario)
            .where(SessaoInventario.id == sessao_id)
            .options(selectinload(SessaoInventario.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        sessao = res.scalar_one_or_none()

        if not sessao:
            raise StockFlowException("Sessão de inventário não encontrada.")
        if sessao.status != StatusInventarioEnum.ABERTA:
            raise SessaoInventarioFechadaError()

        # Limpa contagens anteriores da sessão para reprocessamento
        sessao.itens.clear()
        await db.flush()

        for cont in contagens:
            mat_id = cont["material_id"]
            qtd_contada = Decimal(str(cont["quantidade_contada"]))
            if qtd_contada < Decimal("0.0000"):
                raise StockFlowException("A quantidade contada não pode ser negativa.")

            # Busca saldo atual do sistema
            saldo = await StockEngine.get_or_create_saldo_com_lock(
                db, mat_id, sessao.localizacao_id
            )
            material = await StockEngine.get_material_com_lock(db, mat_id)

            qtd_sistema = saldo.quantidade_fisica
            diferenca = qtd_contada - qtd_sistema
            custo_unitario = material.custo_medio_atual
            valor_total_dif = (diferenca * custo_unitario).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

            item = InventarioItem(
                sessao_inventario_id=sessao.id,
                material_id=mat_id,
                quantidade_sistema_anterior=qtd_sistema,
                quantidade_contada=qtd_contada,
                diferenca=diferenca,
                custo_unitario_aplicado=custo_unitario,
                valor_total_diferenca=valor_total_dif,
            )
            sessao.itens.append(item)

        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="sessoes_inventario",
            registro_id=str(sessao.id),
            acao="LANCAR_CONTAGEM_INVENTARIO",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_novos={"itens_contados": len(contagens)},
            motivo="Lançamento de contagens físicas",
        )

        return sessao

    @staticmethod
    async def confirmar_sessao(
        db: AsyncSession,
        sessao_id: uuid.UUID,
        usuario_id: uuid.UUID,
        ip_address: Optional[str] = None,
    ) -> SessaoInventario:
        """
        Confirma a sessão de inventário e gera os ajustes de estoque correspondentes.
        """
        stmt = (
            select(SessaoInventario)
            .where(SessaoInventario.id == sessao_id)
            .options(selectinload(SessaoInventario.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        sessao = res.scalar_one_or_none()

        if not sessao:
            raise StockFlowException("Sessão de inventário não encontrada.")
        if sessao.status != StatusInventarioEnum.ABERTA:
            raise SessaoInventarioFechadaError()

        # Gera ajustes no livro de movimentações para cada diferença encontrada
        for item in sessao.itens:
            if item.diferenca != Decimal("0.0000"):
                motivo = f"Ajuste da Sessão de Inventário {sessao.numero}"
                mov = await StockEngine.registrar_ajuste(
                    db=db,
                    material_id=item.material_id,
                    localizacao_id=sessao.localizacao_id,
                    quantidade_diferenca=item.diferenca,
                    motivo=motivo,
                    usuario_id=usuario_id,
                    sessao_inventario_id=sessao.id,
                    ip_address=ip_address,
                )
                item.ajuste_movimentacao_id = mov.id

        sessao.status = StatusInventarioEnum.CONFIRMADA
        sessao.data_fechamento = datetime.now(timezone.utc)

        await AuditService.registrar_log(
            db=db,
            tabela="sessoes_inventario",
            registro_id=str(sessao.id),
            acao="CONFIRMAR_SESSAO_INVENTARIO",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={"status": StatusInventarioEnum.ABERTA.value},
            dados_novos={"status": StatusInventarioEnum.CONFIRMADA.value},
            motivo="Confirmação e efetivação de ajustes de inventário",
        )

        return sessao
