export interface UnidadeMedida {
  id: number;
  sigla: string;
  nome: string;
  fracionavel: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  subcategorias?: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  categoria_id: number;
  nome: string;
  descricao?: string;
}

export interface Material {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  categoria_id: number;
  subcategoria_id?: number;
  unidade_medida_id: number;
  estoque_minimo: number;
  custo_medio_atual: number;
  ativo: boolean;
  categoria?: Categoria;
  subcategoria?: Subcategoria;
  unidade_medida?: UnidadeMedida;
  quantidade_fisica_total?: number;
  quantidade_reservada_total?: number;
  quantidade_disponivel_total?: number;
}
