'use client';

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Edit3,
  ShieldAlert,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  Check,
  X,
  Copy,
  User,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
  CheckCircle2,
  Trash2,
  PlusCircle,
  LogIn,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuditoriaItem {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  acaoIcon: string;
  entidade: string;
  entidadeId: string;
  motivo: string;
  nivel: 'Informação' | 'Atenção' | 'Crítico';
  alteracoes?: Array<{
    campo: string;
    antes: string;
    depois: string;
  }>;
  jsonPayload?: string;
  ip: string;
  sessao: string;
  origem: string;
  navegador: string;
  resultado: string;
}

const mockAuditoria: AuditoriaItem[] = [
  {
    id: 'AUD-84921',
    dataHora: '31/05/2024 · 10:42:18',
    usuario: 'Carlos Mendes',
    acao: 'Atualização',
    acaoIcon: '✎',
    entidade: 'Material',
    entidadeId: 'MAT-0001',
    motivo: 'Ajuste de estoque após conferência',
    nivel: 'Informação',
    alteracoes: [
      { campo: 'Estoque mínimo', antes: '100 m', depois: '120 m' },
      { campo: 'Custo médio', antes: 'R$ 8,10 / m', depois: 'R$ 8,27 / m' },
      { campo: 'Localização', antes: 'Almoxarifado A', depois: 'Almoxarifado B' },
    ],
    jsonPayload: `{\n  "entity": "material",\n  "entityId": "MAT-0001",\n  "action": "update",\n  "user": "carlos.mendes",\n  "timestamp": "2024-05-31T10:42:18",\n  "changes": {\n    "minimumStock": {\n      "from": 100,\n      "to": 120\n    }\n  }\n}`,
    ip: '192.168.0.25',
    sessao: '8f3a7b2c4d6e9f1a',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84920',
    dataHora: '31/05/2024 · 10:38:05',
    usuario: 'Mariana Costa',
    acao: 'Aprovação',
    acaoIcon: '✓',
    entidade: 'Requisição',
    entidadeId: 'REQ-1258',
    motivo: 'Solicitação aprovada',
    nivel: 'Informação',
    alteracoes: [
      { campo: 'Status da requisição', antes: 'Em análise', depois: 'Aprovada' },
    ],
    jsonPayload: `{\n  "entity": "requisicao",\n  "entityId": "REQ-1258",\n  "action": "approve",\n  "user": "mariana.costa",\n  "timestamp": "2024-05-31T10:38:05"\n}`,
    ip: '192.168.0.44',
    sessao: '9a8b7c6d5e4f3a2b',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84919',
    dataHora: '31/05/2024 · 10:21:44',
    usuario: 'João Oliveira',
    acao: 'Criação',
    acaoIcon: '+',
    entidade: 'Entrada',
    entidadeId: 'ENT-01842',
    motivo: 'Entrada de materiais registrada',
    nivel: 'Informação',
    alteracoes: [
      { campo: 'Estoque físico', antes: '0 m', depois: '+500 m' },
    ],
    jsonPayload: `{\n  "entity": "entrada",\n  "entityId": "ENT-01842",\n  "action": "create",\n  "user": "joao.oliveira",\n  "timestamp": "2024-05-31T10:21:44"\n}`,
    ip: '192.168.0.12',
    sessao: '1c2d3e4f5a6b7c8d',
    origem: 'Web application',
    navegador: 'Firefox 126.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84918',
    dataHora: '31/05/2024 · 09:57:31',
    usuario: 'Administrador',
    acao: 'Exclusão',
    acaoIcon: '🗑',
    entidade: 'Material',
    entidadeId: 'MAT-0082',
    motivo: 'Cadastro duplicado',
    nivel: 'Crítico',
    alteracoes: [
      { campo: 'Status do registro', antes: 'Ativo', depois: 'Excluído' },
    ],
    jsonPayload: `{\n  "entity": "material",\n  "entityId": "MAT-0082",\n  "action": "delete",\n  "user": "admin",\n  "reason": "Cadastro duplicado",\n  "timestamp": "2024-05-31T09:57:31"\n}`,
    ip: '192.168.0.1',
    sessao: '7e6d5c4b3a2f1e0d',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84917',
    dataHora: '31/05/2024 · 09:41:12',
    usuario: 'Fernanda Lima',
    acao: 'Ajuste',
    acaoIcon: '⚡',
    entidade: 'Inventário',
    entidadeId: 'INV-0024',
    motivo: 'Diferença identificada na conferência',
    nivel: 'Atenção',
    alteracoes: [
      { campo: 'Saldo contado', antes: '30 un', depois: '28 un (-2)' },
    ],
    jsonPayload: `{\n  "entity": "inventario",\n  "entityId": "INV-0024",\n  "action": "adjust",\n  "user": "fernanda.lima",\n  "timestamp": "2024-05-31T09:41:12"\n}`,
    ip: '192.168.0.19',
    sessao: '3b4c5d6e7f8a9b0c',
    origem: 'Web application',
    navegador: 'Safari 17.4',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84916',
    dataHora: '31/05/2024 · 09:18:22',
    usuario: 'Rafael Santos',
    acao: 'Atualização',
    acaoIcon: '✎',
    entidade: 'Material',
    entidadeId: 'MAT-0003',
    motivo: 'Correção de descrição',
    nivel: 'Informação',
    alteracoes: [
      { campo: 'Descrição', antes: 'Disjuntor 32A', depois: 'Disjuntor DIN 32A' },
    ],
    jsonPayload: `{\n  "entity": "material",\n  "entityId": "MAT-0003",\n  "action": "update",\n  "user": "rafael.santos",\n  "timestamp": "2024-05-31T09:18:22"\n}`,
    ip: '192.168.0.31',
    sessao: '4a5b6c7d8e9f0a1b',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84915',
    dataHora: '31/05/2024 · 08:55:33',
    usuario: 'Carlos Mendes',
    acao: 'Exportação',
    acaoIcon: '⤴',
    entidade: 'Relatório',
    entidadeId: 'REL-0045',
    motivo: 'Exportação de relatório',
    nivel: 'Informação',
    alteracoes: [],
    jsonPayload: `{\n  "entity": "relatorio",\n  "entityId": "REL-0045",\n  "action": "export",\n  "format": "xlsx",\n  "user": "carlos.mendes",\n  "timestamp": "2024-05-31T08:55:33"\n}`,
    ip: '192.168.0.25',
    sessao: '8f3a7b2c4d6e9f1a',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84914',
    dataHora: '31/05/2024 · 08:32:11',
    usuario: 'Mariana Costa',
    acao: 'Rejeição',
    acaoIcon: '✕',
    entidade: 'Requisição',
    entidadeId: 'REQ-1256',
    motivo: 'Itens fora de padrão',
    nivel: 'Atenção',
    alteracoes: [
      { campo: 'Status da requisição', antes: 'Em análise', depois: 'Rejeitada' },
    ],
    jsonPayload: `{\n  "entity": "requisicao",\n  "entityId": "REQ-1256",\n  "action": "reject",\n  "user": "mariana.costa",\n  "timestamp": "2024-05-31T08:32:11"\n}`,
    ip: '192.168.0.44',
    sessao: '9a8b7c6d5e4f3a2b',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84913',
    dataHora: '30/05/2024 · 17:48:09',
    usuario: 'João Oliveira',
    acao: 'Login',
    acaoIcon: '🔒',
    entidade: 'Sistema',
    entidadeId: '-',
    motivo: 'Login realizado',
    nivel: 'Informação',
    alteracoes: [],
    jsonPayload: `{\n  "entity": "auth",\n  "action": "login",\n  "user": "joao.oliveira",\n  "timestamp": "2024-05-30T17:48:09"\n}`,
    ip: '192.168.0.12',
    sessao: '1c2d3e4f5a6b7c8d',
    origem: 'Web application',
    navegador: 'Firefox 126.0',
    resultado: 'Concluído',
  },
  {
    id: 'AUD-84912',
    dataHora: '30/05/2024 · 16:22:37',
    usuario: 'Administrador',
    acao: 'Ajuste',
    acaoIcon: '⚡',
    entidade: 'Inventário',
    entidadeId: 'INV-0023',
    motivo: 'Ajuste manual de estoque',
    nivel: 'Atenção',
    alteracoes: [
      { campo: 'Saldo físico', antes: '50 sc', depois: '48 sc (-2)' },
    ],
    jsonPayload: `{\n  "entity": "inventario",\n  "entityId": "INV-0023",\n  "action": "manual_adjust",\n  "user": "admin",\n  "timestamp": "2024-05-30T16:22:37"\n}`,
    ip: '192.168.0.1',
    sessao: '7e6d5c4b3a2f1e0d',
    origem: 'Web application',
    navegador: 'Chrome 124.0.0.0',
    resultado: 'Concluído',
  },
];

export const AuditoriaView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<AuditoriaItem[]>(mockAuditoria);
  const [selectedItem, setSelectedItem] = useState<AuditoriaItem>(mockAuditoria[0]);
  const [busca, setBusca] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('Todos os usuários');
  const [acaoFiltro, setAcaoFiltro] = useState('Todas as ações');
  const [entidadeFiltro, setEntidadeFiltro] = useState('Todas as entidades');
  const [nivelFiltro, setNivelFiltro] = useState('Todos');
  const [somenteCriticos, setSomenteCriticos] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyJSON = () => {
    if (selectedItem.jsonPayload) {
      navigator.clipboard.writeText(selectedItem.jsonPayload);
      showToast('Payload JSON copiado para a área de transferência!');
    }
  };

  // Filtered List
  const itensFiltrados = items.filter((it) => {
    const matchBusca =
      it.id.toLowerCase().includes(busca.toLowerCase()) ||
      it.usuario.toLowerCase().includes(busca.toLowerCase()) ||
      it.entidade.toLowerCase().includes(busca.toLowerCase()) ||
      it.entidadeId.toLowerCase().includes(busca.toLowerCase()) ||
      it.motivo.toLowerCase().includes(busca.toLowerCase()) ||
      it.acao.toLowerCase().includes(busca.toLowerCase());

    const matchUser = usuarioFiltro === 'Todos os usuários' || it.usuario === usuarioFiltro;
    const matchAcao = acaoFiltro === 'Todas as ações' || it.acao === acaoFiltro;
    const matchEntidade = entidadeFiltro === 'Todas as entidades' || it.entidade === entidadeFiltro;
    const matchNivel = nivelFiltro === 'Todos' || it.nivel === nivelFiltro;
    const matchCritico = !somenteCriticos || it.nivel === 'Crítico';

    return matchBusca && matchUser && matchAcao && matchEntidade && matchNivel && matchCritico;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auditoria</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rastreie operações, alterações e eventos do sistema.
          </p>
        </div>

        <button
          onClick={() => showToast('Exportando log consolidado de auditoria...')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar auditoria</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
        </button>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (FITSTRONG GLASS / CYAN, EMERALD, AMBER, ROSE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: EVENTOS (Cyan) */}
        <div
          onClick={() => {
            setSomenteCriticos(false);
            setNivelFiltro('Todos');
            showToast('Exibindo todos os 12.584 eventos registrados');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">EVENTOS</span>
            <div className="kpi-value">12.584</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Eventos registrados</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: HOJE (Emerald) */}
        <div
          onClick={() => {
            showToast('428 eventos registrados nas últimas 24 horas');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">HOJE</span>
            <div className="kpi-value">428</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>Eventos nas últimas 24h</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: ALTERAÇÕES (Amber) */}
        <div
          onClick={() => {
            setAcaoFiltro('Atualização');
            showToast('Filtrando por eventos de alteração de cadastro');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ALTERAÇÕES</span>
            <div className="kpi-value">186</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>Alterações no período</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <Edit3 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: CRÍTICOS (Rose) */}
        <div
          onClick={() => {
            setSomenteCriticos(true);
            showToast('Filtrando apenas eventos críticos');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">CRÍTICOS</span>
            <div className="kpi-value">7</div>
            <div className="kpi-status text-rose-400">
              <span className="status-indicator-dot" />
              <span>Requerem atenção</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTER BAR (EVENTOS DE AUDITORIA) */}
      <div className="bg-[#081424]/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Eventos de auditoria</span>
        </div>

        {/* Row 1: Search + User + Action + Entity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Buscar</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuário, entidade, ação ou evento..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Usuário</label>
            <div className="relative">
              <select
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs"
              >
                <option value="Todos os usuários">Todos os usuários</option>
                <option value="Carlos Mendes">Carlos Mendes</option>
                <option value="Mariana Costa">Mariana Costa</option>
                <option value="João Oliveira">João Oliveira</option>
                <option value="Administrador">Administrador</option>
                <option value="Fernanda Lima">Fernanda Lima</option>
                <option value="Rafael Santos">Rafael Santos</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Ação</label>
            <div className="relative">
              <select
                value={acaoFiltro}
                onChange={(e) => setAcaoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs"
              >
                <option value="Todas as ações">Todas as ações</option>
                <option value="Atualização">Atualização</option>
                <option value="Aprovação">Aprovação</option>
                <option value="Criação">Criação</option>
                <option value="Exclusão">Exclusão</option>
                <option value="Ajuste">Ajuste</option>
                <option value="Exportação">Exportação</option>
                <option value="Rejeição">Rejeição</option>
                <option value="Login">Login</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Entidade</label>
            <div className="relative">
              <select
                value={entidadeFiltro}
                onChange={(e) => setEntidadeFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs"
              >
                <option value="Todas as entidades">Todas as entidades</option>
                <option value="Material">Material</option>
                <option value="Requisição">Requisição</option>
                <option value="Entrada">Entrada</option>
                <option value="Inventário">Inventário</option>
                <option value="Relatório">Relatório</option>
                <option value="Sistema">Sistema</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Period + Level + Critical Toggle + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Period */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01/05/2024 - 31/05/2024</span>
            </div>

            {/* Nível */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Nível</span>
              <select
                value={nivelFiltro}
                onChange={(e) => setNivelFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-slate-900 text-white">Todos</option>
                <option value="Informação" className="bg-slate-900 text-white">Informação</option>
                <option value="Atenção" className="bg-slate-900 text-white">Atenção</option>
                <option value="Crítico" className="bg-slate-900 text-white">Crítico</option>
              </select>
            </div>

            {/* Toggle Somente Críticos */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setSomenteCriticos(!somenteCriticos)}
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                  somenteCriticos ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    somenteCriticos ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-slate-300 font-semibold">Somente críticos</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setBusca('');
                setUsuarioFiltro('Todos os usuários');
                setAcaoFiltro('Todas as ações');
                setEntidadeFiltro('Todas as entidades');
                setNivelFiltro('Todos');
                setSomenteCriticos(false);
                showToast('Filtros limpos');
              }}
              className="px-3 py-2 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
            <button
              onClick={() => showToast('Filtros aplicados com sucesso!')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Aplicar filtros</span>
            </button>
          </div>
        </div>

        {/* Hint footer */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Pesquise por: usuário, ID, material, requisição, ação ou período.</span>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN LAYOUT: AUDIT LOGS TABLE + RIGHT DETAILS DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT AUDIT TABLE (8 COLS ON XL) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="hud-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/60 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Data/Hora ⇅</th>
                    <th className="py-3.5 px-3 font-semibold">Usuário</th>
                    <th className="py-3.5 px-3 font-semibold">Ação</th>
                    <th className="py-3.5 px-3 font-semibold">Entidade</th>
                    <th className="py-3.5 px-3 font-semibold">ID</th>
                    <th className="py-3.5 px-3 font-semibold">Motivo</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Nível</th>
                    <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {itensFiltrados.map((it) => {
                    const isSelected = selectedItem.id === it.id;

                    return (
                      <tr
                        key={it.id}
                        onClick={() => setSelectedItem(it)}
                        className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? 'bg-slate-800/70 border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.12)]'
                            : ''
                        }`}
                      >
                        {/* Data/Hora */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {it.dataHora}
                        </td>

                        {/* Usuário */}
                        <td className="py-3 px-3 font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {it.usuario}
                        </td>

                        {/* Ação */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-white">
                            <span>{it.acaoIcon}</span>
                            <span>{it.acao}</span>
                          </span>
                        </td>

                        {/* Entidade */}
                        <td className="py-3 px-3 text-slate-300">{it.entidade}</td>

                        {/* ID */}
                        <td className="py-3 px-3 font-mono font-bold text-cyan-400">{it.entidadeId}</td>

                        {/* Motivo */}
                        <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[160px]">
                          {it.motivo}
                        </td>

                        {/* Nível Pill */}
                        <td className="py-3 px-3 text-center">
                          {it.nivel === 'Informação' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <span>ⓘ Informação</span>
                            </span>
                          )}
                          {it.nivel === 'Atenção' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <span>⚠ Atenção</span>
                            </span>
                          )}
                          {it.nivel === 'Crítico' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono">
                              <span>⛔ Crítico</span>
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(it);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Visualizar detalhes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast(`Opções de auditoria do log ${it.id}`);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Mais opções"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Pagination */}
            <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Linhas por página:</span>
                <div className="flex items-center gap-1 font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <span>10</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span>1-10 de 12.584</span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ALERT STRIP: OPERAÇÃO CRÍTICA */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Operação crítica: <span className="text-white">Exclusão de material</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 space-x-2">
                  <span>Administrador · 31/05/2024 - 09:57:31</span>
                  <span>•</span>
                  <span>Material: <strong className="text-slate-200">MAT-0082 — Disjuntor DIN 32A</strong></span>
                  <span>•</span>
                  <span>Motivo: <strong className="text-slate-300">Cadastro duplicado</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const crit = items.find((i) => i.nivel === 'Crítico');
                if (crit) setSelectedItem(crit);
                showToast('Exibindo log da operação crítica');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all cursor-pointer self-end sm:self-auto whitespace-nowrap"
            >
              Ver detalhes
            </button>
          </div>
        </div>

        {/* RIGHT SIDE DETAILS DRAWER (EXACT 2-COLUMN INTERNAL LAYOUT MATCHING REFERENCE IMAGE) */}
        <div className="xl:col-span-4 hud-card p-5 space-y-4 shadow-2xl border border-cyan-500/40 text-xs">
          {/* Header Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-wide">Detalhes do evento</h2>
            <button
              onClick={() => showToast('Painel minimizado')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Event Title & Badges */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{selectedItem.id}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 uppercase font-mono">
                  INFORMAÇÃO
                </span>
              </div>
              <button
                onClick={() => showToast('Abrindo opções do evento')}
                className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-black text-white mt-1">Material atualizado</h3>
          </div>

          {/* Metadata Rows with Icons */}
          <div className="space-y-2 text-xs py-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase text-[10px] font-semibold">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>USUÁRIO</span>
              </span>
              <strong className="text-white font-medium">{selectedItem.usuario}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase text-[10px] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>DATA E HORA</span>
              </span>
              <strong className="text-slate-200 font-mono text-[11px]">{selectedItem.dataHora}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase text-[10px] font-semibold">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>ENTIDADE</span>
              </span>
              <strong className="text-slate-200 font-mono text-[11px]">
                {selectedItem.entidade} · {selectedItem.entidadeId}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase text-[10px] font-semibold">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>AÇÃO</span>
              </span>
              <strong className="text-white font-medium">{selectedItem.acao}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase text-[10px] font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>MOTIVO</span>
              </span>
              <strong className="text-slate-300 font-medium truncate max-w-[190px]">
                {selectedItem.motivo}
              </strong>
            </div>
          </div>

          {/* LOWER SECTION: 2 COLUMNS SIDE-BY-SIDE (ALTERAÇÕES + TIMELINE ON LEFT / DADOS TÉCNICOS + INFORMAÇÕES ON RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-slate-800/80">
            {/* LEFT SUB-COLUMN: ALTERAÇÕES + TIMELINE DO EVENTO */}
            <div className="space-y-4">
              {/* Card: Alterações */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-white tracking-wide">
                  Alterações
                </div>

                <div className="space-y-1.5 bg-[#081528]/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                  <div className="grid grid-cols-12 text-[10px] text-slate-500 uppercase font-semibold pb-1 border-b border-slate-800">
                    <div className="col-span-5"></div>
                    <div className="col-span-3 text-center">ANTES</div>
                    <div className="col-span-4 text-right">DEPOIS</div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1 border-b border-slate-800/60">
                    <div className="col-span-5 text-slate-300 font-medium">Estoque mínimo</div>
                    <div className="col-span-3 text-center font-mono text-slate-400">100 m</div>
                    <div className="col-span-4 text-right font-mono font-bold text-emerald-400">→ 120 m</div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1 border-b border-slate-800/60">
                    <div className="col-span-5 text-slate-300 font-medium">Custo médio</div>
                    <div className="col-span-3 text-center font-mono text-slate-400 text-[10px]">R$ 8,10 / m</div>
                    <div className="col-span-4 text-right font-mono font-bold text-emerald-400 text-[10px]">→ R$ 8,27 / m</div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <div className="col-span-5 text-slate-300 font-medium">Localização</div>
                    <div className="col-span-3 text-center font-mono text-slate-400 text-[10px]">Almox. A</div>
                    <div className="col-span-4 text-right font-mono font-bold text-emerald-400 text-[10px]">Almox. B</div>
                  </div>
                </div>
              </div>

              {/* Card: Timeline do Evento */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-white tracking-wide">
                  Timeline do evento
                </div>

                <div className="relative pl-1 space-y-3 pt-1 text-xs">
                  {/* Continuous connecting vertical line */}
                  <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-700/60 -z-0" />

                  {/* 10:42 Material atualizado */}
                  <div className="relative z-10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 text-white flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(37,99,235,0.6)] flex-shrink-0 mt-0.5">
                      ●
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono text-[11px]">10:42</strong>
                        <span className="font-bold text-white text-[11px]">Material atualizado</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Carlos Mendes</div>
                      <div className="text-[10px] text-slate-500">Estoque mínimo: 100 → 120</div>
                    </div>
                  </div>

                  {/* 10:38 Requisição aprovada */}
                  <div className="relative z-10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono text-[11px]">10:38</strong>
                        <span className="font-bold text-white text-[11px]">Requisição aprovada</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Mariana Costa</div>
                      <div className="text-[10px] text-slate-500">REQ-1258</div>
                    </div>
                  </div>

                  {/* 10:21 Entrada registrada */}
                  <div className="relative z-10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      +
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono text-[11px]">10:21</strong>
                        <span className="font-bold text-white text-[11px]">Entrada registrada</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">João Oliveira</div>
                      <div className="text-[10px] text-slate-500">+500 m · Cabo PP 2,5mm</div>
                    </div>
                  </div>

                  {/* 09:57 Material excluído */}
                  <div className="relative z-10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-400 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(244,63,94,0.4)] flex-shrink-0 mt-0.5">
                      🗑
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono text-[11px]">09:57</strong>
                        <span className="font-bold text-white text-[11px]">Material excluído</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Administrador</div>
                      <div className="text-[10px] text-slate-500">MAT-0082</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SUB-COLUMN: DADOS TÉCNICOS + INFORMAÇÕES TÉCNICAS */}
            <div className="space-y-4">
              {/* Card: Dados Técnicos (JSON Code Viewer with Line Numbers) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dados técnicos</span>
                  </span>
                  <button
                    onClick={handleCopyJSON}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copiar JSON</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#060c16] border border-slate-800 font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner">
                  <div className="table w-full">
                    <div className="table-row text-slate-600 select-none">
                      <span className="table-cell pr-2 text-right">1</span>
                      <span className="table-cell text-slate-300"></span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">2</span>
                      <span className="table-cell text-slate-300">&#123;</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">3</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"entity": <span className="text-emerald-300">"material"</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">4</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"entityId": <span className="text-emerald-300">"MAT-0001"</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">5</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"action": <span className="text-emerald-300">"update"</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">6</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"user": <span className="text-emerald-300">"carlos.mendes"</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">7</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"timestamp": <span className="text-amber-300">"2024-05-31T10:42:18"</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">8</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;"changes": &#123;</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">9</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;&nbsp;&nbsp;"minimumStock": &#123;</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">10</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"from": <span className="text-purple-300">100</span>,</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">11</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"to": <span className="text-purple-300">120</span></span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">12</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">13</span>
                      <span className="table-cell text-cyan-300">&nbsp;&nbsp;&#125;</span>
                    </div>
                    <div className="table-row">
                      <span className="table-cell pr-2 text-right text-slate-600 select-none">14</span>
                      <span className="table-cell text-slate-300">&#125;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card: Informações Técnicas */}
              <div className="space-y-2 bg-[#081528]/80 p-3 rounded-2xl border border-slate-800/80 text-[11px]">
                <div className="font-bold text-white text-[11px]">Informações técnicas</div>

                <div className="space-y-1.5 pt-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP / Sessão</span>
                    <div className="text-right">
                      <strong className="text-slate-200 font-mono block">192.168.0.25</strong>
                      <span className="text-[9px] text-slate-500 font-mono">Sessão: 8f3a7b2c4d6e9f1a</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Origem</span>
                    <strong className="text-slate-200">Web application</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Navegador</span>
                    <strong className="text-slate-200 font-mono">Chrome 124.0.0.0</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Resultado</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                      <span>Concluído</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">ID do evento</span>
                    <strong className="text-cyan-400 font-mono">{selectedItem.id}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-cyan-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
