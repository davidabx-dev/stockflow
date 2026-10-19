export * from './material';
export * from './inventory';
export * from './requisition';
export * from './movement';
export * from './audit';

export type Role = 'ADMIN' | 'ALMOXARIFE' | 'SOLICITANTE' | 'AUDITOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
}

export interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Localizacao {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'ALMOXARIFADO' | 'OBRA' | 'DEPOSITO_GERAL';
  descricao?: string;
  ativo: boolean;
}

export interface Obra {
  id: string;
  codigo_obra: string;
  nome: string;
  endereco?: string;
  responsavel?: string;
  ativa: boolean;
}

export interface SaldoComprometidoReport {
  material_id: string;
  sku: string;
  nome: string;
  unidade: string;
  categoria: string;
  quantidade_fisica_total: number;
  quantidade_reservada_total: number;
  quantidade_disponivel_total: number;
  custo_medio_atual: number;
  valor_reservado_rs: number;
  requisicoes_comprometidas: {
    requisicao_id: string;
    numero_requisicao: string;
    status: string;
    solicitante?: string;
    obra?: string;
    quantidade_reservada: number;
    data_aprovacao?: string;
  }[];
}

export interface ConsumoObraReport {
  obra_id: string;
  codigo_obra: string;
  nome_obra: string;
  responsavel?: string;
  total_saidas_rs: number;
  total_devolucoes_rs: number;
  total_liquido_consumido_rs: number;
  materiais_consumidos: {
    sku: string;
    nome: string;
    unidade: string;
    quantidade_saida: number;
    valor_total_saida_rs: number;
  }[];
}

export interface MaterialMinimoReport {
  material_id: string;
  sku: string;
  nome: string;
  unidade: string;
  quantidade_fisica: number;
  estoque_minimo: number;
  defasagem_minima: number;
  custo_medio_atual: number;
  custo_reposicao_estimado_rs: number;
}

export interface PosicaoValorReport {
  valor_geral_estoque_rs: number;
  total_itens_catalogados: number;
  itens: {
    material_id: string;
    sku: string;
    nome: string;
    unidade: string;
    quantidade_fisica: number;
    custo_medio: number;
    valor_total_rs: number;
  }[];
}
