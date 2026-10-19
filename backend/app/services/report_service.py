import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.material import Material, Categoria, UnidadeMedida
from app.models.estoque import EstoquePorLocalizacao, Movimentacao, TipoMovimentacaoEnum, FinalidadeEnum
from app.models.requisicao import Requisicao, RequisicaoItem, StatusRequisicaoEnum
from app.models.obra import Obra
from app.models.localizacao import Localizacao


class ReportService:
    """
    Serviço de Relatórios e Consultas Analíticas (Parte 7 da Checklist V3).
    """

    @staticmethod
    async def relatorio_saldo_comprometido(
        db: AsyncSession,
        material_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retorna o saldo reservado por material com drill-down das requisições responsáveis.
        """
        stmt_materiais = (
            select(Material)
            .options(
                selectinload(Material.saldos_localizacao),
                selectinload(Material.unidade_medida),
                selectinload(Material.categoria),
            )
            .where(Material.ativo == True)
        )
        if material_id:
            stmt_materiais = stmt_materiais.where(Material.id == material_id)

        res_mats = await db.execute(stmt_materiais)
        materiais = res_mats.scalars().all()

        resultado = []

        for mat in materiais:
            total_fisico = sum((s.quantidade_fisica for s in mat.saldos_localizacao), Decimal("0.0000"))
            total_reservado = sum((s.quantidade_reservada for s in mat.saldos_localizacao), Decimal("0.0000"))
            disponivel = total_fisico - total_reservado

            # Busca requisições ativas que estão reservando este material
            stmt_reqs = (
                select(RequisicaoItem)
                .join(Requisicao, RequisicaoItem.requisicao_id == Requisicao.id)
                .options(
                    selectinload(RequisicaoItem.requisicao).selectinload(Requisicao.solicitante),
                    selectinload(RequisicaoItem.requisicao).selectinload(Requisicao.obra),
                )
                .where(
                    RequisicaoItem.material_id == mat.id,
                    Requisicao.status.in_([StatusRequisicaoEnum.APROVADA, StatusRequisicaoEnum.SEPARADA]),
                )
            )
            res_reqs = await db.execute(stmt_reqs)
            itens_reservados = res_reqs.scalars().all()

            drill_down_requisicoes = []
            for item in itens_reservados:
                req = item.requisicao
                drill_down_requisicoes.append({
                    "requisicao_id": str(req.id),
                    "numero_requisicao": req.numero,
                    "status": req.status.value,
                    "solicitante": req.solicitante.nome if req.solicitante else None,
                    "obra": req.obra.nome if req.obra else None,
                    "quantidade_reservada": float(item.quantidade_solicitada),
                    "data_aprovacao": req.aprovado_em.isoformat() if req.aprovado_em else None,
                })

            resultado.append({
                "material_id": str(mat.id),
                "sku": mat.sku,
                "nome": mat.nome,
                "unidade": mat.unidade_medida.sigla if mat.unidade_medida else "",
                "categoria": mat.categoria.nome if mat.categoria else "",
                "quantidade_fisica_total": float(total_fisico),
                "quantidade_reservada_total": float(total_reservado),
                "quantidade_disponivel_total": float(disponivel),
                "custo_medio_atual": float(mat.custo_medio_atual),
                "valor_reservado_rs": float(total_reservado * mat.custo_medio_atual),
                "requisicoes_comprometidas": drill_down_requisicoes,
            })

        return resultado

    @staticmethod
    async def relatorio_consumo_por_obra(
        db: AsyncSession,
        obra_id: Optional[uuid.UUID] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Consumo por obra em R$:
        Soma de valor_total das saídas com finalidade = OBRA, deduzindo devoluções vinculadas.
        """
        stmt_obras = select(Obra).where(Obra.ativa == True)
        if obra_id:
            stmt_obras = stmt_obras.where(Obra.id == obra_id)

        res_obras = await db.execute(stmt_obras)
        obras = res_obras.scalars().all()

        resultado = []

        for obra in obras:
            # Query de saídas para esta obra
            filtros_saida = [
                Movimentacao.obra_id == obra.id,
                Movimentacao.tipo == TipoMovimentacaoEnum.SAIDA,
                Movimentacao.finalidade == FinalidadeEnum.OBRA,
            ]
            filtros_dev = [
                Movimentacao.obra_id == obra.id,
                Movimentacao.tipo == TipoMovimentacaoEnum.DEVOLUCAO,
            ]

            if data_inicio:
                filtros_saida.append(Movimentacao.created_at >= data_inicio)
                filtros_dev.append(Movimentacao.created_at >= data_inicio)
            if data_fim:
                filtros_saida.append(Movimentacao.created_at <= data_fim)
                filtros_dev.append(Movimentacao.created_at <= data_fim)

            # Busca detalhes das saídas agrupadas por material
            stmt_saidas_detalhe = (
                select(
                    Material.sku,
                    Material.nome,
                    UnidadeMedida.sigla.label("unidade"),
                    func.sum(Movimentacao.quantidade).label("qtd_total_saida"),
                    func.sum(Movimentacao.valor_total).label("valor_total_saida"),
                )
                .join(Material, Movimentacao.material_id == Material.id)
                .join(UnidadeMedida, Material.unidade_medida_id == UnidadeMedida.id)
                .where(and_(*filtros_saida))
                .group_by(Material.sku, Material.nome, UnidadeMedida.sigla)
            )
            res_saidas = await db.execute(stmt_saidas_detalhe)
            itens_saida = res_saidas.all()

            # Busca totais de devoluções para a obra
            stmt_dev_total = select(
                func.coalesce(func.sum(Movimentacao.valor_total), Decimal("0.00"))
            ).where(and_(*filtros_dev))
            res_dev = await db.execute(stmt_dev_total)
            total_devolucoes_rs = res_dev.scalar_one()

            total_saidas_rs = sum((row.valor_total_saida for row in itens_saida), Decimal("0.00"))
            total_liquido_consumido_rs = total_saidas_rs - total_devolucoes_rs

            detalhes_materiais = [
                {
                    "sku": row.sku,
                    "nome": row.nome,
                    "unidade": row.unidade,
                    "quantidade_saida": float(row.qtd_total_saida),
                    "valor_total_saida_rs": float(row.valor_total_saida),
                }
                for row in itens_saida
            ]

            resultado.append({
                "obra_id": str(obra.id),
                "codigo_obra": obra.codigo_obra,
                "nome_obra": obra.nome,
                "responsavel": obra.responsavel,
                "total_saidas_rs": float(total_saidas_rs),
                "total_devolucoes_rs": float(total_devolucoes_rs),
                "total_liquido_consumido_rs": float(total_liquido_consumido_rs),
                "materiais_consumidos": detalhes_materiais,
            })

        return resultado

    @staticmethod
    async def relatorio_materiais_abaixo_minimo(
        db: AsyncSession,
    ) -> List[Dict[str, Any]]:
        """
        Retorna materiais cujo estoque físico total ou disponível está abaixo do estoque mínimo.
        """
        stmt = (
            select(
                Material,
                func.coalesce(func.sum(EstoquePorLocalizacao.quantidade_fisica), Decimal("0.0000")).label("qtd_fisica_total"),
                func.coalesce(func.sum(EstoquePorLocalizacao.quantidade_reservada), Decimal("0.0000")).label("qtd_reservada_total"),
            )
            .outerjoin(EstoquePorLocalizacao, Material.id == EstoquePorLocalizacao.material_id)
            .options(selectinload(Material.unidade_medida), selectinload(Material.categoria))
            .where(Material.ativo == True)
            .group_by(Material.id)
            .having(
                func.coalesce(func.sum(EstoquePorLocalizacao.quantidade_fisica), Decimal("0.0000")) < Material.estoque_minimo
            )
        )
        res = await db.execute(stmt)
        rows = res.all()

        resultado = []
        for mat, qtd_fisica, qtd_reservada in rows:
            disponivel = qtd_fisica - qtd_reservada
            defasagem = mat.estoque_minimo - qtd_fisica

            resultado.append({
                "material_id": str(mat.id),
                "sku": mat.sku,
                "nome": mat.nome,
                "categoria": mat.categoria.nome if mat.categoria else "",
                "unidade": mat.unidade_medida.sigla if mat.unidade_medida else "",
                "estoque_minimo": float(mat.estoque_minimo),
                "quantidade_fisica": float(qtd_fisica),
                "quantidade_reservada": float(qtd_reservada),
                "quantidade_disponivel": float(disponivel),
                "defasagem_minima": float(defasagem),
                "custo_medio_atual": float(mat.custo_medio_atual),
                "custo_reposicao_estimado_rs": float(defasagem * mat.custo_medio_atual),
            })

        return resultado

    @staticmethod
    async def relatorio_posicao_valor_estoque(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Retorna a posição global de estoque valorizada em R$ por localização e geral.
        """
        stmt_locs = select(Localizacao).where(Localizacao.ativo == True)
        res_locs = await db.execute(stmt_locs)
        locs = res_locs.scalars().all()

        posicao_por_localizacao = []
        valor_geral_estoque = Decimal("0.00")
        total_itens_cadastrados = 0

        for loc in locs:
            stmt_saldos = (
                select(EstoquePorLocalizacao, Material)
                .join(Material, EstoquePorLocalizacao.material_id == Material.id)
                .where(EstoquePorLocalizacao.localizacao_id == loc.id)
            )
            res_saldos = await db.execute(stmt_saldos)
            linhas = res_saldos.all()

            valor_local = Decimal("0.00")
            itens_local = []

            for saldo, mat in linhas:
                val_item = (saldo.quantidade_fisica * mat.custo_medio_atual).quantize(Decimal("0.01"))
                valor_local += val_item
                itens_local.append({
                    "material_id": str(mat.id),
                    "sku": mat.sku,
                    "nome": mat.nome,
                    "quantidade_fisica": float(saldo.quantidade_fisica),
                    "quantidade_reservada": float(saldo.quantidade_reservada),
                    "quantidade_disponivel": float(saldo.quantidade_fisica - saldo.quantidade_reservada),
                    "custo_medio_atual": float(mat.custo_medio_atual),
                    "valor_total_rs": float(val_item),
                })

            valor_geral_estoque += valor_local
            total_itens_cadastrados += len(itens_local)

            posicao_por_localizacao.append({
                "localizacao_id": str(loc.id),
                "codigo": loc.codigo,
                "nome": loc.nome,
                "valor_total_localizacao_rs": float(valor_local),
                "total_itens": len(itens_local),
                "itens": itens_local,
            })

        return {
            "valor_geral_estoque_rs": float(valor_geral_estoque),
            "total_localizacoes": len(locs),
            "total_itens_geral": total_itens_cadastrados,
            "localizacoes": posicao_por_localizacao,
        }
