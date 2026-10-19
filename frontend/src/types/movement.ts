export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'DEVOLUCAO' | 'AJUSTE' | 'TRANSFERENCIA';
export type Finalidade = 'OBRA' | 'MANUTENCAO' | 'USO_INTERNO' | 'REPOSICAO' | 'OUTRO' | 'AJUSTE_INVENTARIO' | 'ENTRADA_COMPRA' | 'DEVOLUCAO_OBRA';

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  material_id: string;
  localizacao_id: string;
  localizacao_destino_id?: string;
  quantidade: number;
  custo_unitario: number;
  valor_total: number;
  finalidade: Finalidade;
  obra_id?: string;
  requisicao_id?: string;
  movimentacao_origem_id?: string;
  sessao_inventario_id?: string;
  motivo_ajuste?: string;
  numero_documento_fiscal?: string;
  observacao?: string;
  usuario_id: string;
  created_at: string;
  material_nome?: string;
  material_sku?: string;
  usuario_nome?: string;
  obra_nome?: string;
}
