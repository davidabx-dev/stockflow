class StockFlowException(Exception):
    """Exceção base do sistema StockFlow."""
    def __init__(self, message: str, code: str = "GENERIC_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class SaldoInsuficienteError(StockFlowException):
    """Lançada quando a quantidade física ou disponível é insuficiente para reserva/baixa."""
    def __init__(self, message: str = "Saldo disponível insuficiente para realizar a operação."):
        super().__init__(message, code="SALDO_INSUFICIENTE")


class AutoAprovacaoNaoPermitidaError(StockFlowException):
    """Lançada quando o solicitante tenta aprovar a própria requisição."""
    def __init__(self, message: str = "Regra de segurança violada: O solicitante não pode aprovar a própria requisição."):
        super().__init__(message, code="AUTO_APROVACAO_PROIBIDA")


class StatusRequisicaoInvalidoError(StockFlowException):
    """Lançada quando a transição de estado da requisição é proibida."""
    def __init__(self, message: str = "A transição de status da requisição solicitada é inválida."):
        super().__init__(message, code="STATUS_TRANSICAO_INVALIDA")


class MovimentacaoOrigemNaoEncontradaError(StockFlowException):
    """Lançada quando uma devolução não localiza a movimentação de saída original."""
    def __init__(self, message: str = "Movimentação de saída original não encontrada para vincular a devolução."):
        super().__init__(message, code="MOVIMENTACAO_ORIGEM_NAO_ENCONTRADA")


class QuantidadeDevolucaoExcedidaError(StockFlowException):
    """Lançada quando a devolução tenta devolver mais do que foi entregue originalmente."""
    def __init__(self, message: str = "A quantidade a devolver excede a quantidade da saída original."):
        super().__init__(message, code="QUANTIDADE_DEVOLUCAO_EXCEDIDA")


class MaterialInativoError(StockFlowException):
    """Lançada ao tentar movimentar ou requisitar material inativo."""
    def __init__(self, message: str = "O material selecionado está inativo."):
        super().__init__(message, code="MATERIAL_INATIVO")


class LocalizacaoInativaError(StockFlowException):
    """Lançada ao tentar operar em localização desativada."""
    def __init__(self, message: str = "A localização selecionada está inativa."):
        super().__init__(message, code="LOCALIZACAO_INATIVA")


class SessaoInventarioFechadaError(StockFlowException):
    """Lançada ao tentar lançar contagem em sessão de inventário já encerrada/cancelada."""
    def __init__(self, message: str = "A sessão de inventário não está aberta para lançamentos."):
        super().__init__(message, code="SESSAO_INVENTARIO_FECHADA")
