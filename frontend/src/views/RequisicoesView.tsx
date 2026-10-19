'use client';

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  ArrowDown,
  Check,
  X,
  User,
  Building,
  ClipboardList,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface RequisicaoItem {
  id: string;
  solicitante: string;
  obra: string;
  finalidade: string;
  finalidadeDetalhe: string;
  itensCount: number;
  data: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Aprovada' | 'Separando' | 'Entregue' | 'Rejeitada';
  tempoAtraso?: string;
  materiais: Array<{
    nome: string;
    icon: string;
    solicitado: string;
    disponivel: string;
    disponivelNum: number;
    solicitadoNum: number;
    unidade: string;
    isInsuficiente?: boolean;
  }>;
  fluxo: {
    solicitadaEm: string;
    etapaAtual: 'Solicitada' | 'Em análise' | 'Aprovada' | 'Separada' | 'Entregue';
  };
  impacto: {
    fisico: number;
    reservado: number;
    disponivelAtual: number;
    solicitado: number;
    unidade: string;
  };
}

const mockRequisicoes: RequisicaoItem[] = [
  {
    id: 'REQ-1258',
    solicitante: 'Carlos Mendes',
    obra: 'Obra Alpha',
    finalidade: 'Instalação elétrica',
    finalidadeDetalhe: 'Instalação elétrica — Bloco B',
    itensCount: 5,
    data: '31/05/2024 09:15',
    prioridade: 'Alta',
    status: 'Pendente',
    tempoAtraso: 'Solicitada há 2h • Em análise',
    materiais: [
      { nome: 'Cabo PP 3x2,5mm', icon: '🔌', solicitado: '50 m', disponivel: '380 m', disponivelNum: 380, solicitadoNum: 50, unidade: 'm' },
      { nome: 'Disjuntor DIN 32A', icon: '⚡', solicitado: '10 un', disponivel: '24 un', disponivelNum: 24, solicitadoNum: 10, unidade: 'un' },
      { nome: 'Eletroduto 3/4"', icon: '🛠️', solicitado: '30 m', disponivel: '15 m', disponivelNum: 15, solicitadoNum: 30, unidade: 'm', isInsuficiente: true },
    ],
    fluxo: { solicitadaEm: '31/05/2024 09:15', etapaAtual: 'Em análise' },
    impacto: { fisico: 500, reservado: 120, disponivelAtual: 380, solicitado: 50, unidade: 'm' },
  },
  {
    id: 'REQ-1257',
    solicitante: 'Mariana Costa',
    obra: 'Obra Beta',
    finalidade: 'Manutenção hidráulica',
    finalidadeDetalhe: 'Rede de esgoto e águas pluviais',
    itensCount: 8,
    data: '31/05/2024 08:40',
    prioridade: 'Média',
    status: 'Aprovada',
    tempoAtraso: 'Aprovada há 4h',
    materiais: [
      { nome: 'Eletroduto PVC 25mm', icon: '🛠️', solicitado: '60 m', disponivel: '120 m', disponivelNum: 120, solicitadoNum: 60, unidade: 'm' },
      { nome: 'Tinta Acrílica Branca', icon: '🎨', solicitado: '5 gal', disponivel: '40 gal', disponivelNum: 40, solicitadoNum: 5, unidade: 'gal' },
    ],
    fluxo: { solicitadaEm: '31/05/2024 08:40', etapaAtual: 'Aprovada' },
    impacto: { fisico: 200, reservado: 40, disponivelAtual: 160, solicitado: 60, unidade: 'm' },
  },
  {
    id: 'REQ-1256',
    solicitante: 'João Oliveira',
    obra: 'Obra Gama',
    finalidade: 'Infraestrutura',
    finalidadeDetalhe: 'Fundação e estaqueamento',
    itensCount: 3,
    data: '30/05/2024 17:20',
    prioridade: 'Média',
    status: 'Separando',
    tempoAtraso: 'Em separação no Almoxarifado',
    materiais: [
      { nome: 'Cimento CP II 50kg', icon: '🧱', solicitado: '40 sc', disponivel: '120 sc', disponivelNum: 120, solicitadoNum: 40, unidade: 'sc' },
    ],
    fluxo: { solicitadaEm: '30/05/2024 17:20', etapaAtual: 'Separada' },
    impacto: { fisico: 300, reservado: 80, disponivelAtual: 220, solicitado: 40, unidade: 'sc' },
  },
  {
    id: 'REQ-1255',
    solicitante: 'Fernanda Lima',
    obra: 'Obra Delta',
    finalidade: 'Manutenção',
    finalidadeDetalhe: 'Reforma de esquadrias e telhado',
    itensCount: 6,
    data: '30/05/2024 14:10',
    prioridade: 'Baixa',
    status: 'Entregue',
    tempoAtraso: 'Entregue no canteiro de obras',
    materiais: [
      { nome: 'Parafuso 4,2x32mm', icon: '🔩', solicitado: '200 un', disponivel: '800 un', disponivelNum: 800, solicitadoNum: 200, unidade: 'un' },
      { nome: 'Madeira Pinus 2x4', icon: '🪵', solicitado: '10 un', disponivel: '25 un', disponivelNum: 25, solicitadoNum: 10, unidade: 'un' },
    ],
    fluxo: { solicitadaEm: '30/05/2024 14:10', etapaAtual: 'Entregue' },
    impacto: { fisico: 1000, reservado: 0, disponivelAtual: 1000, solicitado: 200, unidade: 'un' },
  },
  {
    id: 'REQ-1254',
    solicitante: 'Rafael Santos',
    obra: 'Obra Alpha',
    finalidade: 'Instalação elétrica',
    finalidadeDetalhe: 'Iluminação de emergência',
    itensCount: 2,
    data: '29/05/2024 11:05',
    prioridade: 'Baixa',
    status: 'Entregue',
    tempoAtraso: 'Entregue no canteiro de obras',
    materiais: [
      { nome: 'Lâmpada LED 12W', icon: '💡', solicitado: '30 un', disponivel: '60 un', disponivelNum: 60, solicitadoNum: 30, unidade: 'un' },
    ],
    fluxo: { solicitadaEm: '29/05/2024 11:05', etapaAtual: 'Entregue' },
    impacto: { fisico: 100, reservado: 0, disponivelAtual: 100, solicitado: 30, unidade: 'un' },
  },
  {
    id: 'REQ-1253',
    solicitante: 'Lucas Pereira',
    obra: 'Obra Epsilon',
    finalidade: 'Instalação hidráulica',
    finalidadeDetalhe: 'Tubulações de alta pressão',
    itensCount: 7,
    data: '29/05/2024 09:30',
    prioridade: 'Alta',
    status: 'Rejeitada',
    tempoAtraso: 'Rejeitada por falta de justificativa',
    materiais: [
      { nome: 'Eletroduto 3/4"', icon: '🛠️', solicitado: '80 m', disponivel: '15 m', disponivelNum: 15, solicitadoNum: 80, unidade: 'm', isInsuficiente: true },
    ],
    fluxo: { solicitadaEm: '29/05/2024 09:30', etapaAtual: 'Solicitada' },
    impacto: { fisico: 50, reservado: 0, disponivelAtual: 50, solicitado: 80, unidade: 'm' },
  },
  {
    id: 'REQ-1252',
    solicitante: 'Juliana Alves',
    obra: 'Obra Beta',
    finalidade: 'Acabamento',
    finalidadeDetalhe: 'Pintura interna e forro de gesso',
    itensCount: 4,
    data: '28/05/2024 16:45',
    prioridade: 'Média',
    status: 'Aprovada',
    tempoAtraso: 'Aguardando início da separação',
    materiais: [
      { nome: 'Tinta Acrílica Branca', icon: '🎨', solicitado: '12 gal', disponivel: '40 gal', disponivelNum: 40, solicitadoNum: 12, unidade: 'gal' },
    ],
    fluxo: { solicitadaEm: '28/05/2024 16:45', etapaAtual: 'Aprovada' },
    impacto: { fisico: 80, reservado: 12, disponivelAtual: 68, solicitado: 12, unidade: 'gal' },
  },
  {
    id: 'REQ-1251',
    solicitante: 'Bruno Ferreira',
    obra: 'Obra Gama',
    finalidade: 'Infraestrutura',
    finalidadeDetalhe: 'Drenagem e pavimentação',
    itensCount: 10,
    data: '28/05/2024 10:20',
    prioridade: 'Baixa',
    status: 'Separando',
    tempoAtraso: 'Em separação no Almoxarifado B',
    materiais: [
      { nome: 'Cimento CP II 50kg', icon: '🧱', solicitado: '50 sc', disponivel: '120 sc', disponivelNum: 120, solicitadoNum: 50, unidade: 'sc' },
    ],
    fluxo: { solicitadaEm: '28/05/2024 10:20', etapaAtual: 'Separada' },
    impacto: { fisico: 250, reservado: 50, disponivelAtual: 200, solicitado: 50, unidade: 'sc' },
  },
];

export const RequisicoesView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<RequisicaoItem[]>(mockRequisicoes);
  const [selectedReq, setSelectedReq] = useState<RequisicaoItem>(mockRequisicoes[0]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [obraFiltro, setObraFiltro] = useState('Todas');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('Todas');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State Nova Requisição
  const [novaObra, setNovaObra] = useState('Obra Alpha');
  const [novaFinalidade, setNovaFinalidade] = useState('Instalação elétrica');
  const [novaPrioridade, setNovaPrioridade] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [novoMaterialNome, setNovoMaterialNome] = useState('Cabo PP 3x2,5mm');
  const [novaQtd, setNovaQtd] = useState('50');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAprovarReq = (reqId: string) => {
    const updated = items.map((r) => (r.id === reqId ? { ...r, status: 'Aprovada' as const } : r));
    setItems(updated);
    if (selectedReq.id === reqId) {
      setSelectedReq({ ...selectedReq, status: 'Aprovada' });
    }
    showToast(`Requisição ${reqId} aprovada com sucesso!`);
  };

  const handleRejeitarReq = (reqId: string) => {
    const updated = items.map((r) => (r.id === reqId ? { ...r, status: 'Rejeitada' as const } : r));
    setItems(updated);
    if (selectedReq.id === reqId) {
      setSelectedReq({ ...selectedReq, status: 'Rejeitada' });
    }
    showToast(`Requisição ${reqId} foi rejeitada.`);
  };

  const handleCreateNovaRequisicao = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: RequisicaoItem = {
      id: `REQ-${1259 + items.length}`,
      solicitante: 'Carlos Mendes',
      obra: novaObra,
      finalidade: novaFinalidade,
      finalidadeDetalhe: `${novaFinalidade} — Setor Principal`,
      itensCount: 1,
      data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      prioridade: novaPrioridade,
      status: 'Pendente',
      tempoAtraso: 'Solicitada agora • Em análise',
      materiais: [
        {
          nome: novoMaterialNome,
          icon: '🔌',
          solicitado: `${novaQtd} m`,
          disponivel: '380 m',
          disponivelNum: 380,
          solicitadoNum: Number(novaQtd),
          unidade: 'm',
        },
      ],
      fluxo: {
        solicitadaEm: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        etapaAtual: 'Em análise',
      },
      impacto: {
        fisico: 500,
        reservado: 120,
        disponivelAtual: 380,
        solicitado: Number(novaQtd),
        unidade: 'm',
      },
    };

    setItems([newReq, ...items]);
    setSelectedReq(newReq);
    setIsNewModalOpen(false);
    showToast(`Nova requisição ${newReq.id} enviada com sucesso!`);
  };

  // Filtered requisicoes
  const requisicoesFiltradas = items.filter((r) => {
    const matchBusca =
      r.id.toLowerCase().includes(busca.toLowerCase()) ||
      r.solicitante.toLowerCase().includes(busca.toLowerCase()) ||
      r.obra.toLowerCase().includes(busca.toLowerCase()) ||
      r.finalidade.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = statusFiltro === 'Todos' || r.status === statusFiltro;
    const matchObra = obraFiltro === 'Todas' || r.obra === obraFiltro;
    const matchPrioridade = prioridadeFiltro === 'Todas' || r.prioridade === prioridadeFiltro;

    return matchBusca && matchStatus && matchObra && matchPrioridade;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Requisições</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Controle solicitações, aprovações e separação de materiais.
          </p>
        </div>

        <button
          onClick={() => showToast('Exportando relatório de requisições...')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar</span>
        </button>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (THEMED IN FITSTRONG GLASS / CYAN, AMBER, EMERALD, ROSE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: TOTAL (Cyan Blue) */}
        <div
          onClick={() => {
            setStatusFiltro('Todos');
            showToast('Exibindo todas as requisições');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">TOTAL</span>
            <div className="kpi-value">286</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Requisições registradas</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">+8,4% vs mês anterior</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: PENDENTES (Amber Gold) */}
        <div
          onClick={() => {
            setStatusFiltro('Pendente');
            showToast('Filtrando por requisições Pendentes');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">PENDENTES</span>
            <div className="kpi-value">23</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>5 aguardando aprovação</span>
            </div>
            <div className="text-[10px] text-amber-400 font-bold mt-0.5">Atenção necessária</div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: APROVADAS (Emerald Green) */}
        <div
          onClick={() => {
            setStatusFiltro('Aprovada');
            showToast('Filtrando por requisições Aprovadas');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">APROVADAS</span>
            <div className="kpi-value">198</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>+12 este mês</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">+9,1% vs mês anterior</div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: ATRASADAS (Rose Red) */}
        <div
          onClick={() => {
            showToast('Filtrando por requisições com atraso');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ATRASADAS</span>
            <div className="kpi-value">8</div>
            <div className="kpi-status text-rose-400">
              <span className="status-indicator-dot" />
              <span>Requer atenção</span>
            </div>
            <div className="text-[10px] text-rose-400 font-bold mt-0.5">2 atrasadas hoje</div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTER BAR */}
      <div className="bg-[#081424]/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar requisição, solicitante, obra..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
          />
        </div>

        {/* Dropdowns & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Status</span>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-slate-900 text-white">Todos</option>
                <option value="Pendente" className="bg-slate-900 text-white">Pendente</option>
                <option value="Aprovada" className="bg-slate-900 text-white">Aprovada</option>
                <option value="Separando" className="bg-slate-900 text-white">Separando</option>
                <option value="Entregue" className="bg-slate-900 text-white">Entregue</option>
                <option value="Rejeitada" className="bg-slate-900 text-white">Rejeitada</option>
              </select>
            </div>

            {/* Obra Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Obra</span>
              <select
                value={obraFiltro}
                onChange={(e) => setObraFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todas" className="bg-slate-900 text-white">Todas</option>
                <option value="Obra Alpha" className="bg-slate-900 text-white">Obra Alpha</option>
                <option value="Obra Beta" className="bg-slate-900 text-white">Obra Beta</option>
                <option value="Obra Gama" className="bg-slate-900 text-white">Obra Gama</option>
                <option value="Obra Delta" className="bg-slate-900 text-white">Obra Delta</option>
                <option value="Obra Epsilon" className="bg-slate-900 text-white">Obra Epsilon</option>
              </select>
            </div>

            {/* Prioridade Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Prioridade</span>
              <select
                value={prioridadeFiltro}
                onChange={(e) => setPrioridadeFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todas" className="bg-slate-900 text-white">Todas</option>
                <option value="Alta" className="bg-slate-900 text-white">Alta</option>
                <option value="Média" className="bg-slate-900 text-white">Média</option>
                <option value="Baixa" className="bg-slate-900 text-white">Baixa</option>
              </select>
            </div>

            {/* Período Pill */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>01/05/2024 - 31/05/2024</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filtrar Button */}
            <button
              onClick={() => showToast('Filtros aplicados com sucesso!')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 font-bold transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>

            {/* Limpar Button */}
            <button
              onClick={() => {
                setBusca('');
                setStatusFiltro('Todos');
                setObraFiltro('Todas');
                setPrioridadeFiltro('Todas');
                showToast('Filtros limpos');
              }}
              className="px-3 py-2 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Limpar
            </button>

            {/* + Nova Requisição Button */}
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nova requisição</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN LAYOUT: REQUISITIONS TABLE + RIGHT DETAILS DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* TABLE CONTAINER (8 COLS ON XL) */}
        <div className="xl:col-span-8 hud-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/60 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-3 font-semibold">Solicitante</th>
                  <th className="py-3.5 px-3 font-semibold">Obra</th>
                  <th className="py-3.5 px-3 font-semibold">Finalidade</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Itens</th>
                  <th className="py-3.5 px-3 font-semibold">Data</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Prioridade</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {requisicoesFiltradas.map((req) => {
                  const isSelected = selectedReq.id === req.id;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                        isSelected
                          ? 'bg-slate-800/70 border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.12)]'
                          : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{req.id}</td>

                      {/* Solicitante */}
                      <td className="py-3 px-3 font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {req.solicitante}
                      </td>

                      {/* Obra */}
                      <td className="py-3 px-3 text-slate-300">{req.obra}</td>

                      {/* Finalidade */}
                      <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[140px]">
                        {req.finalidade}
                      </td>

                      {/* Itens */}
                      <td className="py-3 px-3 font-mono text-center text-slate-300">
                        {req.itensCount} itens
                      </td>

                      {/* Data */}
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{req.data}</td>

                      {/* Prioridade */}
                      <td className="py-3 px-3 text-center">
                        {req.prioridade === 'Alta' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <span>↑ Alta</span>
                          </span>
                        )}
                        {req.prioridade === 'Média' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span>→ Média</span>
                          </span>
                        )}
                        {req.prioridade === 'Baixa' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span>↓ Baixa</span>
                          </span>
                        )}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-3 text-center">
                        {req.status === 'Pendente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            <span>Pendente</span>
                          </span>
                        )}
                        {req.status === 'Aprovada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Aprovada</span>
                          </span>
                        )}
                        {req.status === 'Separando' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                            <span>Separando</span>
                          </span>
                        )}
                        {req.status === 'Entregue' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span>Entregue</span>
                          </span>
                        )}
                        {req.status === 'Rejeitada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <span>Rejeitada</span>
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReq(req);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Opções de ${req.id}`);
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

          {/* TABLE FOOTER & PAGINATION */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Mostrando <strong className="text-white">1 a {requisicoesFiltradas.length}</strong> de{' '}
              <strong className="text-white">42</strong> requisições
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-blue-600 border border-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                1
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                2
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                3
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                4
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                5
              </button>
              <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE DETAILS DRAWER (4 COLS ON XL) */}
        <div className="xl:col-span-4 hud-card p-5 space-y-4 shadow-2xl border border-cyan-500/40">
          {/* Header Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-wide">Detalhes da requisição</h2>
            <button
              onClick={() => showToast('Painel minimizado')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Requisition Status Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white font-mono">{selectedReq.id}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                  {selectedReq.status}
                </span>
              </div>
              {selectedReq.prioridade === 'Alta' && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono">
                  ● URGENTE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{selectedReq.tempoAtraso}</p>
          </div>

          {/* Requisition Info Fields */}
          <div className="space-y-2.5 text-xs bg-[#081528]/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Solicitante</div>
              <div className="flex items-center gap-1.5 font-bold text-white mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedReq.solicitante}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Obra</div>
              <div className="font-semibold text-white mt-0.5">{selectedReq.obra}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Finalidade</div>
              <div className="flex items-center gap-1.5 text-slate-300 mt-0.5">
                <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedReq.finalidadeDetalhe}</span>
              </div>
            </div>
          </div>

          {/* Section: Materiais Solicitados */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              Materiais solicitados
            </div>
            <div className="space-y-2 text-xs">
              {selectedReq.materiais.map((mat, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    mat.isInsuficiente
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{mat.icon}</span>
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{mat.nome}</div>
                        <div className="text-[10px] text-slate-400">Solicitado: {mat.solicitado}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Disponível</div>
                      <div
                        className={`font-mono font-bold ${
                          mat.isInsuficiente ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {mat.disponivel}
                      </div>
                    </div>
                  </div>
                  {mat.isInsuficiente && (
                    <div className="text-[10px] text-rose-400 font-bold mt-1 text-right">
                      Estoque insuficiente
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sub Grid: Impacto no Estoque + Fluxo de Aprovação (EXACT MATCH TO REFERENCE IMAGE) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* 1. Impacto no Estoque (with Progress Bars) */}
            <div className="p-3.5 rounded-2xl bg-[#081528]/90 border border-slate-800/80 space-y-2 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] pb-1">
                <span>Impacto no estoque</span>
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {/* Step 1: Físico */}
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Físico</span>
                  <span className="font-mono text-slate-200 font-bold">500 m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/80">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Down Arrow */}
              <div className="text-slate-500 text-center text-[10px] leading-none py-0.5">↓</div>

              {/* Step 2: Reservado */}
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Reservado</span>
                  <span className="font-mono text-slate-200 font-bold">120 m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/80">
                  <div className="h-full bg-blue-500/80 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              {/* Down Arrow */}
              <div className="text-slate-500 text-center text-[10px] leading-none py-0.5">↓</div>

              {/* Step 3: Disponível atual */}
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Disponível atual</span>
                  <span className="font-mono text-slate-200 font-bold">380 m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/80">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.5)]" style={{ width: '76%' }} />
                </div>
              </div>

              {/* Down Arrow */}
              <div className="text-slate-500 text-center text-[10px] leading-none py-0.5">↓</div>

              {/* Step 4: Solicitado nesta req. */}
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Solicitado nesta req.</span>
                  <span className="font-mono text-slate-200 font-bold">50 m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/80">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>

              {/* Down Arrow */}
              <div className="text-slate-500 text-center text-[10px] leading-none py-0.5">↓</div>

              {/* Step 5: Disponível após aprovação */}
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Disponível após aprovação</span>
                  <span className="font-mono font-black text-emerald-400 text-xs drop-shadow-[0_0_6px_rgba(0,245,155,0.4)]">
                    330 m
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/80">
                  <div
                    className="h-full bg-[#00f59b] rounded-full shadow-[0_0_10px_rgba(0,245,155,0.7)]"
                    style={{ width: '66%' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Fluxo de Aprovação (Continuous Vertical Timeline) */}
            <div className="p-3.5 rounded-2xl bg-[#081528]/90 border border-slate-800/80 space-y-2 text-xs shadow-inner">
              <div className="text-slate-300 font-semibold text-[11px] pb-1">
                Fluxo de aprovação
              </div>

              <div className="relative pl-1 space-y-3.5 pt-0.5">
                {/* Continuous Vertical Line */}
                <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-700/60 -z-0" />

                {/* Step 1: Solicitada (Done Blue) */}
                <div className="relative z-10 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(37,99,235,0.6)] flex-shrink-0">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] leading-tight">Solicitada</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">31/05/2024 09:15</div>
                  </div>
                </div>

                {/* Step 2: Em análise (Active Blue Dot with Badge) */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-[#081528] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="font-bold text-white text-[11px] truncate">Em análise</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0c1e3d] text-blue-400 border border-blue-800/80 flex-shrink-0 font-mono">
                    Atual
                  </span>
                </div>

                {/* Step 3: Aprovada (Inactive Hollow Ring) */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-slate-700/80 bg-[#081528] flex-shrink-0" />
                  <span className="text-slate-400 text-[11px] font-medium">Aprovada</span>
                </div>

                {/* Step 4: Separada (Inactive Hollow Ring) */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-slate-700/80 bg-[#081528] flex-shrink-0" />
                  <span className="text-slate-400 text-[11px] font-medium">Separada</span>
                </div>

                {/* Step 5: Entregue (Inactive Hollow Ring) */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-slate-700/80 bg-[#081528] flex-shrink-0" />
                  <span className="text-slate-400 text-[11px] font-medium">Entregue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons at bottom of Drawer (EXACT MATCH TO REFERENCE IMAGE) */}
          <div className="grid grid-cols-12 gap-3 pt-2 text-xs">
            <button
              onClick={() => handleRejeitarReq(selectedReq.id)}
              className="col-span-4 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#081524] border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 font-bold transition-all cursor-pointer shadow-md"
            >
              <X className="w-4 h-4 text-rose-500" />
              <span>Rejeitar</span>
            </button>
            <button
              onClick={() => handleAprovarReq(selectedReq.id)}
              className="col-span-8 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>Aprovar requisição</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODAL NOVA REQUISIÇÃO */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="hud-card w-full max-w-lg p-6 border border-blue-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <h3 className="text-base font-bold text-white">Criar Nova Requisição</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNovaRequisicao} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Obra de Destino *</label>
                  <select
                    value={novaObra}
                    onChange={(e) => setNovaObra(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Obra Alpha">Obra Alpha</option>
                    <option value="Obra Beta">Obra Beta</option>
                    <option value="Obra Gama">Obra Gama</option>
                    <option value="Obra Delta">Obra Delta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prioridade *</label>
                  <select
                    value={novaPrioridade}
                    onChange={(e) => setNovaPrioridade(e.target.value as 'Alta' | 'Média' | 'Baixa')}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Finalidade / Justificativa *</label>
                <input
                  type="text"
                  value={novaFinalidade}
                  onChange={(e) => setNovaFinalidade(e.target.value)}
                  placeholder="Ex: Instalação elétrica — Bloco C"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Material *</label>
                  <select
                    value={novoMaterialNome}
                    onChange={(e) => setNovoMaterialNome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Cabo PP 3x2,5mm">Cabo PP 3x2,5mm</option>
                    <option value="Disjuntor DIN 32A">Disjuntor DIN 32A</option>
                    <option value="Eletroduto 3/4">Eletroduto 3/4"</option>
                    <option value="Tinta Acrílica Branca">Tinta Acrílica Branca</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtd Solicitada *</label>
                  <input
                    type="number"
                    value={novaQtd}
                    onChange={(e) => setNovaQtd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Enviar Requisição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-cyan-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
