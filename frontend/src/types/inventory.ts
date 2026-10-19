export type StatusInventario = 'ABERTA' | 'CONFIRMADA' | 'CANCELADA';

export interface InventarioItem {
  id: string;
  sessao_inventario_id: string;
  material_id: string;
  quantidade_sistema_anterior: number;
  quantidade_contada: number;
  diferenca: number;
  custo_unitario_aplicado: number;
  valor_total_diferenca: number;
  ajuste_movimentacao_id?: string;
  material_nome?: string;
  material_sku?: string;
}

export interface SessaoInventario {
  id: string;
  numero: string;
  localizacao_id: string;
  usuario_id: string;
  status: StatusInventario;
  observacao?: string;
  data_abertura: string;
  data_fechamento?: string;
  itens: InventarioItem[];
}
