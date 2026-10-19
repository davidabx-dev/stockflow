import uuid
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    SaldoInsuficienteError,
    MaterialInativoError,
    LocalizacaoInativaError,
    MovimentacaoOrigemNaoEncontradaError,
    QuantidadeDevolucaoExcedidaError,
    StockFlowException,
)
from app.models.material import Material
from app.models.localizacao import Localizacao
from app.models.estoque import (
    EstoquePorLocalizacao,
    Movimentacao,
    TipoMovimentacaoEnum,
    FinalidadeEnum,
)
from app.services.audit_service import AuditService


class StockEngine:
    """
    Motor Central de Regras de Negócio e Transações do Estoque (Checklist V3).
    Garante integridade matemática, concorrência atômica e imutabilidade contábil.
    """

    @staticmethod
    async def get_or_create_saldo_com_lock(
        db: AsyncSession,
        material_id: uuid.UUID,
        localizacao_id: uuid.UUID,
    ) -> EstoquePorLocalizacao:
        """
        Obtém o registro de saldo com lock exclusivo de linha (SELECT FOR UPDATE).
        Cria o registro se ele ainda não existir para aquele par (material, localizacao).
        """
        stmt = (
            select(EstoquePorLocalizacao)
            .where(
                EstoquePorLocalizacao.material_id == material_id,
                EstoquePorLocalizacao.localizacao_id == localizacao_id,
            )
            .with_for_update()
        )
        result = await db.execute(stmt)
        saldo = result.scalar_one_or_none()

        if saldo is None:
            saldo = EstoquePorLocalizacao(
                material_id=material_id,
                localizacao_id=localizacao_id,
                quantidade_fisica=Decimal("0.0000"),
                quantidade_reservada=Decimal("0.0000"),
            )
            db.add(saldo)
            await db.flush()
            # Bloqueia a linha recém-criada
            stmt_reselect = (
                select(EstoquePorLocalizacao)
                .where(EstoquePorLocalizacao.id == saldo.id)
                .with_for_update()
            )
            res_reselect = await db.execute(stmt_reselect)
            saldo = res_reselect.scalar_one()

        return saldo

    @staticmethod
    async def get_material_com_lock(
        db: AsyncSession,
        material_id: uuid.UUID,
    ) -> Material:
        """Obtém material com lock exclusivo de linha."""
        stmt = select(Material).where(Material.id == material_id).with_for_update()
        result = await db.execute(stmt)
        material = result.scalar_one_or_none()
        if not material:
            raise StockFlowException("Material não encontrado.")
        if not material.ativo:
            raise MaterialInativoError("Material inativo não pode ser movimentado.")
        return material

    @staticmethod
    async def registrar_entrada(
        db: AsyncSession,
        material_id: uuid.UUID,
        localizacao_id: uuid.UUID,
        quantidade: Decimal,
        custo_unitario: Decimal,
        usuario_id: uuid.UUID,
        finalidade: FinalidadeEnum = FinalidadeEnum.ENTRADA_COMPRA,
        numero_documento_fiscal: Optional[str] = None,
        observacao: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Movimentacao:
        """
        Registra entrada física e recalcula o custo médio móvel ponderado (Moving Average Cost).
        Regra V3:
          novo_medio = ((qtd_atual * medio_atual) + (qtd_in * custo_in)) / (qtd_atual + qtd_in)
        """
        if quantidade <= Decimal("0.0000"):
            raise StockFlowException("A quantidade de entrada deve ser maior que zero.")
        if custo_unitario < Decimal("0.00"):
            raise StockFlowException("O custo unitário não pode ser negativo.")

        material = await StockEngine.get_material_com_lock(db, material_id)
        saldo = await StockEngine.get_or_create_saldo_com_lock(db, material_id, localizacao_id)

        # Calcula a quantidade física total do material no sistema (todas as localizações)
        stmt_total_fisico = select(
            func.coalesce(func.sum(EstoquePorLocalizacao.quantidade_fisica), Decimal("0.0000"))
        ).where(EstoquePorLocalizacao.material_id == material_id)
        res_total = await db.execute(stmt_total_fisico)
        qtd_fisica_total_atual = res_total.scalar_one()

        custo_medio_anterior = material.custo_medio_atual
        qtd_anterior_total = qtd_fisica_total_atual

        # Recálculo do custo médio ponderado móvel
        if qtd_anterior_total > Decimal("0.0000"):
            valor_total_existente = qtd_anterior_total * custo_medio_anterior
            valor_total_entrada = quantidade * custo_unitario
            nova_qtd_total = qtd_anterior_total + quantidade
            novo_custo_medio = (valor_total_existente + valor_total_entrada) / nova_qtd_total
        else:
            novo_custo_medio = custo_unitario

        novo_custo_medio = novo_custo_medio.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        material.custo_medio_atual = novo_custo_medio

        # Atualiza o saldo físico da localização
        qtd_fisica_local_anterior = saldo.quantidade_fisica
        saldo.quantidade_fisica += quantidade

        valor_total_mov = (quantidade * custo_unitario).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        movimentacao = Movimentacao(
            tipo=TipoMovimentacaoEnum.ENTRADA,
            material_id=material_id,
            localizacao_id=localizacao_id,
            quantidade=quantidade,
            custo_unitario=custo_unitario.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            valor_total=valor_total_mov,
            finalidade=finalidade,
            numero_documento_fiscal=numero_documento_fiscal,
            observacao=observacao,
            usuario_id=usuario_id,
        )
        db.add(movimentacao)
        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="movimentacoes",
            registro_id=str(movimentacao.id),
            acao="ENTRADA_ESTOQUE",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={
                "qtd_fisica_local": str(qtd_fisica_local_anterior),
                "qtd_fisica_total": str(qtd_anterior_total),
                "custo_medio": str(custo_medio_anterior),
            },
            dados_novos={
                "qtd_fisica_local": str(saldo.quantidade_fisica),
                "qtd_entrada": str(quantidade),
                "custo_unitario_entrada": str(custo_unitario),
                "novo_custo_medio": str(novo_custo_medio),
                "documento": numero_documento_fiscal,
            },
            motivo=observacao or "Entrada de material no estoque",
        )

        return movimentacao

    @staticmethod
    async def registrar_saida_direta(
        db: AsyncSession,
        material_id: uuid.UUID,
        localizacao_id: uuid.UUID,
        quantidade: Decimal,
        usuario_id: uuid.UUID,
        finalidade: FinalidadeEnum,
        obra_id: Optional[uuid.UUID] = None,
        observacao: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Movimentacao:
        """
        Registra saída direta de material.
        Regra V3:
          Usa o custo_medio_atual vigente no momento da saída e NÃO recalcula o custo médio.
        """
        if quantidade <= Decimal("0.0000"):
            raise StockFlowException("A quantidade de saída deve ser maior que zero.")
        if finalidade == FinalidadeEnum.OBRA and not obra_id:
            raise StockFlowException("Obra é obrigatória para saídas com finalidade OBRA.")

        material = await StockEngine.get_material_com_lock(db, material_id)
        saldo = await StockEngine.get_or_create_saldo_com_lock(db, material_id, localizacao_id)

        # Verifica saldo disponível
        disponivel = saldo.quantidade_fisica - saldo.quantidade_reservada
        if disponivel < quantidade:
            raise SaldoInsuficienteError(
                f"Saldo disponível insuficiente ({disponivel}) para a saída de {quantidade}."
            )

        qtd_fisica_anterior = saldo.quantidade_fisica
        saldo.quantidade_fisica -= quantidade

        custo_unitario_vigente = material.custo_medio_atual
        valor_total_mov = (quantidade * custo_unitario_vigente).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        movimentacao = Movimentacao(
            tipo=TipoMovimentacaoEnum.SAIDA,
            material_id=material_id,
            localizacao_id=localizacao_id,
            quantidade=quantidade,
            custo_unitario=custo_unitario_vigente,
            valor_total=valor_total_mov,
            finalidade=finalidade,
            obra_id=obra_id,
            observacao=observacao,
            usuario_id=usuario_id,
        )
        db.add(movimentacao)
        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="movimentacoes",
            registro_id=str(movimentacao.id),
            acao="SAIDA_ESTOQUE",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={"qtd_fisica": str(qtd_fisica_anterior)},
            dados_novos={
                "qtd_fisica": str(saldo.quantidade_fisica),
                "quantidade_saida": str(quantidade),
                "custo_unitario": str(custo_unitario_vigente),
                "valor_total": str(valor_total_mov),
            },
            motivo=observacao or "Saída direta de estoque",
        )

        return movimentacao

    @staticmethod
    async def registrar_devolucao(
        db: AsyncSession,
        movimentacao_saida_id: uuid.UUID,
        quantidade: Decimal,
        usuario_id: uuid.UUID,
        motivo: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Movimentacao:
        """
        Registra devolução de material para o estoque vinculada a uma SAÍDA original.
        Regra V3:
          Reaproveita o custo_unitario da saída original e NÃO recalcula o custo médio.
        """
        if quantidade <= Decimal("0.0000"):
            raise StockFlowException("A quantidade de devolução deve ser maior que zero.")

        # Busca a movimentação de saída original com lock
        stmt_saida = (
            select(Movimentacao)
            .where(Movimentacao.id == movimentacao_saida_id)
            .with_for_update()
        )
        res_saida = await db.execute(stmt_saida)
        saida_original = res_saida.scalar_one_or_none()

        if not saida_original:
            raise MovimentacaoOrigemNaoEncontradaError(
                "A movimentação de saída de origem especificada não existe."
            )
        if saida_original.tipo != TipoMovimentacaoEnum.SAIDA:
            raise StockFlowException("Apenas movimentações de SAÍDA podem receber devoluções.")

        # Calcula a quantidade já devolvida para esta saída específica
        stmt_devolvido = select(
            func.coalesce(func.sum(Movimentacao.quantidade), Decimal("0.0000"))
        ).where(
            Movimentacao.movimentacao_origem_id == movimentacao_saida_id,
            Movimentacao.tipo == TipoMovimentacaoEnum.DEVOLUCAO,
        )
        res_dev = await db.execute(stmt_devolvido)
        qtd_ja_devolvida = res_dev.scalar_one()

        if (qtd_ja_devolvida + quantidade) > saida_original.quantidade:
            raise QuantidadeDevolucaoExcedidaError(
                f"A quantidade a devolver ({quantidade}) somada à já devolvida ({qtd_ja_devolvida}) "
                f"excede a quantidade da saída original ({saida_original.quantidade})."
            )

        saldo = await StockEngine.get_or_create_saldo_com_lock(
            db, saida_original.material_id, saida_original.localizacao_id
        )

        qtd_fisica_anterior = saldo.quantidade_fisica
        saldo.quantidade_fisica += quantidade

        # Custo reaproveitado da saída original
        custo_original = saida_original.custo_unitario
        valor_total_dev = (quantidade * custo_original).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        movimentacao_dev = Movimentacao(
            tipo=TipoMovimentacaoEnum.DEVOLUCAO,
            material_id=saida_original.material_id,
            localizacao_id=saida_original.localizacao_id,
            quantidade=quantidade,
            custo_unitario=custo_original,
            valor_total=valor_total_dev,
            finalidade=FinalidadeEnum.DEVOLUCAO_OBRA,
            obra_id=saida_original.obra_id,
            requisicao_id=saida_original.requisicao_id,
            requisicao_item_id=saida_original.requisicao_item_id,
            movimentacao_origem_id=saida_original.id,
            observacao=motivo,
            usuario_id=usuario_id,
        )
        db.add(movimentacao_dev)
        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="movimentacoes",
            registro_id=str(movimentacao_dev.id),
            acao="DEVOLUCAO_ESTOQUE",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={"qtd_fisica": str(qtd_fisica_anterior)},
            dados_novos={
                "qtd_fisica": str(saldo.quantidade_fisica),
                "quantidade_devolvida": str(quantidade),
                "custo_unitario_resgatado": str(custo_original),
                "valor_total_devolucao": str(valor_total_dev),
                "saida_origem_id": str(saida_original.id),
            },
            motivo=motivo or "Devolução de material da obra",
        )

        return movimentacao_dev

    @staticmethod
    async def registrar_ajuste(
        db: AsyncSession,
        material_id: uuid.UUID,
        localizacao_id: uuid.UUID,
        quantidade_diferenca: Decimal,
        motivo: str,
        usuario_id: uuid.UUID,
        sessao_inventario_id: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None,
    ) -> Movimentacao:
        """
        Registra ajuste positivo ou negativo no estoque.
        Regra V3:
          Usa o custo_medio_atual vigente e NÃO altera o custo médio unitário do material.
        """
        if quantidade_diferenca == Decimal("0.0000"):
            raise StockFlowException("A diferença para ajuste não pode ser zero.")
        if not motivo or not motivo.strip():
            raise StockFlowException("O motivo do ajuste é estritamente obrigatório.")

        material = await StockEngine.get_material_com_lock(db, material_id)
        saldo = await StockEngine.get_or_create_saldo_com_lock(db, material_id, localizacao_id)

        qtd_fisica_anterior = saldo.quantidade_fisica

        # Se for ajuste negativo (redução de estoque)
        if quantidade_diferenca < Decimal("0.0000"):
            qtd_reduzir = abs(quantidade_diferenca)
            disponivel = saldo.quantidade_fisica - saldo.quantidade_reservada
            if disponivel < qtd_reduzir:
                raise SaldoInsuficienteError(
                    f"Não é possível realizar ajuste negativo de {qtd_reduzir}. "
                    f"Saldo disponível na localização: {disponivel}."
                )
            saldo.quantidade_fisica -= qtd_reduzir
        else:
            saldo.quantidade_fisica += quantidade_diferenca

        custo_unitario_vigente = material.custo_medio_atual
        qtd_absoluta = abs(quantidade_diferenca)
        valor_total_ajuste = (qtd_absoluta * custo_unitario_vigente).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        movimentacao = Movimentacao(
            tipo=TipoMovimentacaoEnum.AJUSTE,
            material_id=material_id,
            localizacao_id=localizacao_id,
            quantidade=qtd_absoluta,
            custo_unitario=custo_unitario_vigente,
            valor_total=valor_total_ajuste,
            finalidade=FinalidadeEnum.AJUSTE_INVENTARIO,
            sessao_inventario_id=sessao_inventario_id,
            motivo_ajuste=motivo,
            observacao=f"Ajuste {'Positivo' if quantidade_diferenca > 0 else 'Negativo'} de {quantidade_diferenca}",
            usuario_id=usuario_id,
        )
        db.add(movimentacao)
        await db.flush()

        await AuditService.registrar_log(
            db=db,
            tabela="movimentacoes",
            registro_id=str(movimentacao.id),
            acao="AJUSTE_ESTOQUE",
            usuario_id=usuario_id,
            ip_address=ip_address,
            dados_anteriores={"qtd_fisica": str(qtd_fisica_anterior)},
            dados_novos={
                "qtd_fisica": str(saldo.quantidade_fisica),
                "diferenca_ajustada": str(quantidade_diferenca),
                "custo_unitario": str(custo_unitario_vigente),
                "valor_total": str(valor_total_ajuste),
                "motivo": motivo,
            },
            motivo=motivo,
        )

        return movimentacao
