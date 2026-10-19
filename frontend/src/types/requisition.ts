import { Usuario, Obra, Finalidade } from './index';
import { Material } from './material';

export type StatusRequisicao = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'SEPARADA' | 'ENTREGUE' | 'CANCELADA';
export type StatusItem = 'PENDENTE' | 'RESERVADO' | 'SEPARADO' | 'ENTREGUE' | 'CANCELADO';

export interface RequisicaoItem {
  id: string;
  requisicao_id: string;
  material_id: string;
  localizacao_id: string;
  quantidade_solicitada: number;
  quantidade_atendida: number;
  status_item: StatusItem;
  observacao?: string;
  material?: Material;
  material_nome?: string;
  material_sku?: string;
  material_unidade?: string;
}

export interface Requisicao {
  id: string;
  numero: string;
  solicitante_id: string;
  obra_id?: string;
  finalidade: Finalidade;
  status: StatusRequisicao;
  justificativa?: string;
  motivo_rejeicao?: string;
  data_necessidade?: string;
  aprovador_id?: string;
  aprovado_em?: string;
  separado_por_id?: string;
  separado_em?: string;
  entregue_por_id?: string;
  recebido_por?: string;
  entregue_em?: string;
  created_at: string;
  updated_at: string;
  solicitante?: Usuario;
  aprovador?: Usuario;
  separador?: Usuario;
  entregador?: Usuario;
  obra?: Obra;
  itens: RequisicaoItem[];
}
