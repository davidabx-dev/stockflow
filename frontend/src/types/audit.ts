export interface AuditoriaLog {
  id: string;
  tabela: string;
  registro_id: string;
  acao: string;
  usuario_id?: string;
  usuario_nome?: string;
  ip_address?: string;
  dados_anteriores?: Record<string, unknown>;
  dados_novos?: Record<string, unknown>;
  motivo?: string;
  created_at: string;
}
