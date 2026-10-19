import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    SaldoInsuficienteError,
    AutoAprovacaoNaoPermitidaError,
    StatusRequisicaoInvalidoError,
    StockFlowException,
)
from app.models.requisicao import (
    Requisicao,
    RequisicaoItem,
    StatusRequisicaoEnum,
    StatusItemEnum,
)
from app.models.estoque import (
    Movimentacao,
    TipoMovimentacaoEnum,
    FinalidadeEnum,
    EstoquePorLocalizacao,
)
from app.services.stock_engine import StockEngine
from app.services.audit_service import AuditService


class RequisitionService:
    """
    Serviço que orquestra o ciclo de vida completo de requisições de materiais.
    """

    @staticmethod
    async def criar_requisicao(
        db: AsyncSession,
        solicitante_id: uuid.UUID,
        finalidade: FinalidadeEnum,
        itens_data: List[Dict[str, Any]],
        obra_id: Optional[uuid.UUID] = None,
        justificativa: Optional[str] = None,
        data_necessidade: Optional[datetime] = None,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """Cria uma requisição no estado PENDENTE."""
        if not itens_data:
            raise StockFlowException("A requisição deve conter pelo menos um item.")
        if finalidade == FinalidadeEnum.OBRA and not obra_id:
            raise StockFlowException("Obra é obrigatória para requisições com finalidade OBRA.")

        # Gera número da requisição legível
        ano = datetime.now(timezone.utc).year
        id_curto = uuid.uuid4().hex[:6].upper()
        numero = f"REQ-{ano}-{id_curto}"

        requisicao = Requisicao(
            numero=numero,
            solicitante_id=solicitante_id,
            obra_id=obra_id,
            finalidade=finalidade,
            status=StatusRequisicaoEnum.PENDENTE,
            justificativa=justificativa,
            data_necessidade=data_necessidade,
        )
        db.add(requisicao)
        await db.flush()

        for item in itens_data:
            qtd = Decimal(str(item["quantidade_solicitada"]))
            if qtd <= Decimal("0.0000"):
                raise StockFlowException("Quantidade solicitada deve ser maior que zero.")

            # Valida material
            material = await StockEngine.get_material_com_lock(db, item["material_id"])

            req_item = RequisicaoItem(
                requisicao_id=requisicao.id,
                material_id=item["material_id"],
                localizacao_id=item["localizacao_id"],
                quantidade_solicitada=qtd,
                status_item=StatusItemEnum.PENDENTE,
                observacao=item.get("observacao"),
            )
            db.add(req_item)

        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(requisicao.id),
            acao="CRIAR_REQUISICAO",
            usuario_id=solicitante_id,
            ip_address=ip_address,
            dados_novos={
                "numero": requisicao.numero,
                "finalidade": requisicao.finalidade.value if hasattr(requisicao.finalidade, "value") else str(requisicao.finalidade),
                "total_itens": len(itens_data),
            },
            motivo=justificativa or "Criação de requisição de materiais",
        )

        return requisicao

    @staticmethod
    async def aprovar_requisicao(
        db: AsyncSession,
        requisicao_id: uuid.UUID,
        aprovador_id: uuid.UUID,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """
        Aprova a requisição e realiza a RESERVA AUTOMÁTICA de estoque com locks transacionais.
        Regra de Segurança Server-Side: solicitante_id != aprovador_id.
        """
        stmt = (
            select(Requisicao)
            .where(Requisicao.id == requisicao_id)
            .options(selectinload(Requisicao.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req:
            raise StockFlowException("Requisição não encontrada.")
        if req.status != StatusRequisicaoEnum.PENDENTE:
            raise StatusRequisicaoInvalidoError(
                f"Apenas requisições PENDENTES podem ser aprovadas. Status atual: {req.status.value}"
            )
        if req.solicitante_id == aprovador_id:
            raise AutoAprovacaoNaoPermitidaError(
                "Regra de Segurança: O solicitante não pode aprovar sua própria requisição."
            )

        # Reserva de saldo com lock exclusivo por item
        for item in req.itens:
            saldo = await StockEngine.get_or_create_saldo_com_lock(
                db, item.material_id, item.localizacao_id
            )
            disponivel = saldo.quantidade_fisica - saldo.quantidade_reservada

            if disponivel < item.quantidade_solicitada:
                raise SaldoInsuficienteError(
                    f"Saldo insuficiente para o material {item.material_id}. "
                    f"Disponível: {disponivel}, Solicitado: {item.quantidade_solicitada}."
                )

            # Incrementa quantidade reservada
            saldo.quantidade_reservada += item.quantidade_solicitada
            item.status_item = StatusItemEnum.RESERVADO

        req.status = StatusRequisicaoEnum.APROVADA
        req.aprovador_id = aprovador_id
        req.aprovado_em = datetime.now(timezone.utc)

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(req.id),
            acao="APROVAR_REQUISICAO",
            usuario_id=aprovador_id,
            ip_address=ip_address,
            dados_anteriores={"status": StatusRequisicaoEnum.PENDENTE.value},
            dados_novos={
                "status": StatusRequisicaoEnum.APROVADA.value,
                "aprovador_id": str(aprovador_id),
            },
            motivo="Aprovação com reserva de estoque",
        )

        return req

    @staticmethod
    async def separar_requisicao(
        db: AsyncSession,
        requisicao_id: uuid.UUID,
        separador_id: uuid.UUID,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """Marca a requisição como SEPARADA pelo almoxarifado."""
        stmt = (
            select(Requisicao)
            .where(Requisicao.id == requisicao_id)
            .options(selectinload(Requisicao.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req:
            raise StockFlowException("Requisição não encontrada.")
        if req.status != StatusRequisicaoEnum.APROVADA:
            raise StatusRequisicaoInvalidoError(
                f"Apenas requisições APROVADAS podem ser marcadas como SEPARADAS. Status atual: {req.status.value}"
            )

        for item in req.itens:
            item.status_item = StatusItemEnum.SEPARADO

        req.status = StatusRequisicaoEnum.SEPARADA
        req.separado_por_id = separador_id
        req.separado_em = datetime.now(timezone.utc)

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(req.id),
            acao="SEPARAR_REQUISICAO",
            usuario_id=separador_id,
            ip_address=ip_address,
            dados_anteriores={"status": StatusRequisicaoEnum.APROVADA.value},
            dados_novos={
                "status": StatusRequisicaoEnum.SEPARADA.value,
                "separador_id": str(separador_id),
            },
            motivo="Separação física dos itens no almoxarifado",
        )

        return req

    @staticmethod
    async def entregar_requisicao(
        db: AsyncSession,
        requisicao_id: uuid.UUID,
        entregador_id: uuid.UUID,
        recebido_por: str,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """
        Realiza a ENTREGA (Baixa física e estorno de reserva no estoque) e gera a SAÍDA no livro-razão.
        Regra V3:
          Registra 'recebido_por' (quem pegou fisicamente), 'entregue_por_id' (almoxarife)
          e grava o custo médio vigente daquele momento na movimentação.
        """
        if not recebido_por or not recebido_por.strip():
            raise StockFlowException("O campo 'recebido_por' é obrigatório para registrar a entrega.")

        stmt = (
            select(Requisicao)
            .where(Requisicao.id == requisicao_id)
            .options(selectinload(Requisicao.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req:
            raise StockFlowException("Requisição não encontrada.")
        if req.status not in (StatusRequisicaoEnum.SEPARADA, StatusRequisicaoEnum.APROVADA):
            raise StatusRequisicaoInvalidoError(
                f"Apenas requisições APROVADAS ou SEPARADAS podem ser entregues. Status atual: {req.status.value}"
            )

        # Baixa física e contábil de cada item
        for item in req.itens:
            saldo = await StockEngine.get_or_create_saldo_com_lock(
                db, item.material_id, item.localizacao_id
            )
            material = await StockEngine.get_material_com_lock(db, item.material_id)

            # Baixa da quantidade física e da reserva correspondente
            saldo.quantidade_fisica -= item.quantidade_solicitada
            saldo.quantidade_reservada -= item.quantidade_solicitada

            item.quantidade_atendida = item.quantidade_solicitada
            item.status_item = StatusItemEnum.ENTREGUE

            # Registra a movimentação de SAÍDA com custo médio vigente
            custo_unitario_vigente = material.custo_medio_atual
            valor_total_saida = (item.quantidade_solicitada * custo_unitario_vigente).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

            movimentacao = Movimentacao(
                tipo=TipoMovimentacaoEnum.SAIDA,
                material_id=item.material_id,
                localizacao_id=item.localizacao_id,
                quantidade=item.quantidade_solicitada,
                custo_unitario=custo_unitario_vigente,
                valor_total=valor_total_saida,
                finalidade=req.finalidade,
                obra_id=req.obra_id,
                requisicao_id=req.id,
                requisicao_item_id=item.id,
                observacao=f"Entrega da Requisição {req.numero} para {recebido_por}",
                usuario_id=entregador_id,
            )
            db.add(movimentacao)

        req.status = StatusRequisicaoEnum.ENTREGUE
        req.entregue_por_id = entregador_id
        req.recebido_por = recebido_por
        req.entregue_em = datetime.now(timezone.utc)

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(req.id),
            acao="ENTREGAR_REQUISICAO",
            usuario_id=entregador_id,
            ip_address=ip_address,
            dados_novos={
                "status": StatusRequisicaoEnum.ENTREGUE.value,
                "entregador_id": str(entregador_id),
                "recebido_por": recebido_por,
            },
            motivo="Baixa física e entrega de materiais",
        )

        return req

    @staticmethod
    async def rejeitar_requisicao(
        db: AsyncSession,
        requisicao_id: uuid.UUID,
        aprovador_id: uuid.UUID,
        motivo: str,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """Rejeita uma requisição PENDENTE."""
        if not motivo or not motivo.strip():
            raise StockFlowException("O motivo da rejeição é obrigatório.")

        stmt = (
            select(Requisicao)
            .where(Requisicao.id == requisicao_id)
            .options(selectinload(Requisicao.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req:
            raise StockFlowException("Requisição não encontrada.")
        if req.status != StatusRequisicaoEnum.PENDENTE:
            raise StatusRequisicaoInvalidoError(
                f"Apenas requisições PENDENTES podem ser rejeitadas. Status atual: {req.status.value}"
            )

        for item in req.itens:
            item.status_item = StatusItemEnum.CANCELADO

        req.status = StatusRequisicaoEnum.REJEITADA
        req.motivo_rejeicao = motivo
        req.aprovador_id = aprovador_id
        req.aprovado_em = datetime.now(timezone.utc)

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(req.id),
            acao="REJEITAR_REQUISICAO",
            usuario_id=aprovador_id,
            ip_address=ip_address,
            dados_anteriores={"status": StatusRequisicaoEnum.PENDENTE.value},
            dados_novos={
                "status": StatusRequisicaoEnum.REJEITADA.value,
                "motivo_rejeicao": motivo,
            },
            motivo=motivo,
        )

        return req

    @staticmethod
    async def cancelar_requisicao(
        db: AsyncSession,
        requisicao_id: uuid.UUID,
        usuario_id: uuid.UUID,
        motivo: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Requisicao:
        """
        Cancela requisição. Se estiver APROVADA ou SEPARADA, estorna a reserva correspondente.
        """
        stmt = (
            select(Requisicao)
            .where(Requisicao.id == requisicao_id)
            .options(selectinload(Requisicao.itens))
            .with_for_update()
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req:
            raise StockFlowException("Requisição não encontrada.")
        if req.status in (StatusRequisicaoEnum.ENTREGUE, StatusRequisicaoEnum.CANCELADA, StatusRequisicaoEnum.REJEITADA):
            raise StatusRequisicaoInvalidoError(
                f"Requisições com status {req.status.value} não podem ser canceladas."
            )

        # Se houver reserva ativa, libera a reserva no estoque
        if req.status in (StatusRequisicaoEnum.APROVADA, StatusRequisicaoEnum.SEPARADA):
            for item in req.itens:
                saldo = await StockEngine.get_or_create_saldo_com_lock(
                    db, item.material_id, item.localizacao_id
                )
                saldo.quantidade_reservada -= item.quantidade_solicitada
                item.status_item = StatusItemEnum.CANCELADO

        req.status = StatusRequisicaoEnum.CANCELADA

        await AuditService.registrar_log(
            db=db,
            tabela="requisicoes",
            registro_id=str(req.id),
            acao="CANCELAR_REQUISICAO",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={"status": req.status.value},
            dados_novos={"status": StatusRequisicaoEnum.CANCELADA.value},
            motivo=motivo or "Cancelamento de requisição",
        )

        return req
