'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Lock,
  TrendingUp,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  MoreVertical,
  Building2,
  Calendar,
  FileSpreadsheet,
  Printer,
  Layers,
  CheckCircle2,
  PieChart,
  BarChart3,
  Info,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ComprometidoItem {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  saldoFisico: number;
  saldoReservado: number;
  saldoDisponivel: number;
  unidade: string;
  custoMedio: number;
  valorComprometido: number;
  status: 'Crítico' | 'Normal' | 'Atenção';
  requisicoes: Array<{
    reqId: string;
    solicitante: string;
    obra: string;
    data: string;
    quantidade: number;
    valor: number;
  }>;
}

const mockComprometidos: ComprometidoItem[] = [
  {
    id: '1',
    nome: 'Cabo PP 3x2,5mm',
    sku: 'MAT-0001',
    categoria: 'Cabos',
    saldoFisico: 500,
    saldoReservado: 120,
    saldoDisponivel: 380,
    unidade: 'm',
    custoMedio: 8.10,
    valorComprometido: 972.00,
    status: 'Atenção',
    requisicoes: [
      { reqId: 'REQ-1258', solicitante: 'Carlos Mendes', obra: 'Obra Alpha', data: '31/05/2024', quantidade: 50, valor: 405.00 },
      { reqId: 'REQ-1251', solicitante: 'Bruno Ferreira', obra: 'Obra Gama', data: '28/05/2024', quantidade: 70, valor: 567.00 },
    ],
  },
  {
    id: '2',
    nome: 'Disjuntor DIN 32A',
    sku: 'MAT-0003',
    categoria: 'Elétrico',
    saldoFisico: 24,
    saldoReservado: 10,
    saldoDisponivel: 14,
    unidade: 'un',
    custoMedio: 24.90,
    valorComprometido: 249.00,
    status: 'Normal',
    requisicoes: [
      { reqId: 'REQ-1258', solicitante: 'Carlos Mendes', obra: 'Obra Alpha', data: '31/05/2024', quantidade: 10, valor: 249.00 },
    ],
  },
  {
    id: '3',
    nome: 'Eletroduto PVC 25mm',
    sku: 'MAT-0004',
    categoria: 'Tubulações',
    saldoFisico: 120,
    saldoReservado: 60,
    saldoDisponivel: 60,
    unidade: 'm',
    custoMedio: 6.80,
    valorComprometido: 408.00,
    status: 'Atenção',
    requisicoes: [
      { reqId: 'REQ-1257', solicitante: 'Mariana Costa', obra: 'Obra Beta', data: '31/05/2024', quantidade: 60, valor: 408.00 },
    ],
  },
  {
    id: '4',
    nome: 'Cimento CP II 50kg',
    sku: 'MAT-0007',
    categoria: 'Construção',
    saldoFisico: 120,
    saldoReservado: 90,
    saldoDisponivel: 30,
    unidade: 'sc',
    custoMedio: 32.50,
    valorComprometido: 2925.00,
    status: 'Crítico',
    requisicoes: [
      { reqId: 'REQ-1256', solicitante: 'João Oliveira', obra: 'Obra Gama', data: '30/05/2024', quantidade: 40, valor: 1300.00 },
      { reqId: 'REQ-1251', solicitante: 'Bruno Ferreira', obra: 'Obra Gama', data: '28/05/2024', quantidade: 50, valor: 1625.00 },
    ],
  },
  {
    id: '5',
    nome: 'Tinta Acrílica Branca',
    sku: 'MAT-0008',
    categoria: 'Pintura',
    saldoFisico: 40,
    saldoReservado: 17,
    saldoDisponivel: 23,
    unidade: 'gal',
    custoMedio: 42.00,
    valorComprometido: 714.00,
    status: 'Normal',
    requisicoes: [
      { reqId: 'REQ-1257', solicitante: 'Mariana Costa', obra: 'Obra Beta', data: '31/05/2024', quantidade: 5, valor: 210.00 },
      { reqId: 'REQ-1252', solicitante: 'Juliana Alves', obra: 'Obra Beta', data: '28/05/2024', quantidade: 12, valor: 504.00 },
    ],
  },
];

export const RelatoriosView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<ComprometidoItem[]>(mockComprometidos);
  const [selectedItem, setSelectedItem] = useState<ComprometidoItem>(mockComprometidos[0]);
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Saldo Comprometido');
  const [obraFiltro, setObraFiltro] = useState('Todas as Obras');
  const [tabAtiva, setTabAtiva] = useState<
    'COMPROMETIDO' | 'OBRA' | 'MINIMO' | 'VALOR'
  >('COMPROMETIDO');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtered List
  const itensFiltrados = items.filter((it) => {
    const matchBusca =
      it.nome.toLowerCase().includes(busca.toLowerCase()) ||
      it.sku.toLowerCase().includes(busca.toLowerCase()) ||
      it.categoria.toLowerCase().includes(busca.toLowerCase());

    return matchBusca;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Relatórios</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Análises consolidadas de consumo, saldo comprometido e posição financeira.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Gerando documento PDF para impressão...')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={() => showToast('Exportando relatório consolidado (Excel / CSV)...')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar relatório</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (FITSTRONG GLASS / CYAN, AMBER, EMERALD, ROSE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: VALOR EM ESTOQUE (Cyan) */}
        <div
          onClick={() => {
            setTabAtiva('VALOR');
            showToast('Exibindo Posição Financeira Geral');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">VALOR EM ESTOQUE</span>
            <div className="kpi-value text-xl xl:text-2xl">R$ 482.930,00</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Posição patrimonial ativa</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: SALDO COMPROMETIDO (Amber) */}
        <div
          onClick={() => {
            setTabAtiva('COMPROMETIDO');
            showToast('Exibindo Saldo Comprometido & Drill-Down');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">SALDO COMPROMETIDO</span>
            <div className="kpi-value text-xl xl:text-2xl">R$ 38.450,00</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>23 requisições aprovadas</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: CONSUMO DO MÊS (Emerald) */}
        <div
          onClick={() => {
            setTabAtiva('OBRA');
            showToast('Exibindo Consumo por Obra');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">CONSUMO DO MÊS</span>
            <div className="kpi-value text-xl xl:text-2xl">R$ 114.280,00</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>-4,2% vs média histórica</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: ABAIXO DO MÍNIMO (Rose) */}
        <div
          onClick={() => {
            setTabAtiva('MINIMO');
            showToast('Exibindo Materiais Abaixo do Mínimo');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ABAIXO DO MÍNIMO</span>
            <div className="kpi-value">14 itens</div>
            <div className="kpi-status text-rose-400">
              <span className="status-indicator-dot" />
              <span>Reposição prioritária</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTER BAR */}
      <div className="bg-[#081424]/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        {/* Row 1: Filters Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar material, código ou categoria..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
              />
            </div>

            {/* Obra Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Obra</span>
              <select
                value={obraFiltro}
                onChange={(e) => setObraFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todas as Obras" className="bg-slate-900 text-white">Todas as Obras</option>
                <option value="Obra Alpha" className="bg-slate-900 text-white">Obra Alpha</option>
                <option value="Obra Beta" className="bg-slate-900 text-white">Obra Beta</option>
                <option value="Obra Gama" className="bg-slate-900 text-white">Obra Gama</option>
                <option value="Obra Delta" className="bg-slate-900 text-white">Obra Delta</option>
              </select>
            </div>

            {/* Período */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01/05/2024 - 31/05/2024</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filtrar Button */}
            <button
              onClick={() => showToast('Relatório recalculado com sucesso!')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 font-bold transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>

            {/* Limpar Button */}
            <button
              onClick={() => {
                setBusca('');
                setObraFiltro('Todas as Obras');
                showToast('Filtros redefinidos');
              }}
              className="px-3 py-2 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Limpar
            </button>

            {/* + Novo Relatório Button */}
            <button
              onClick={() => showToast('Configurando modelo personalizado de relatório...')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Gerar Relatório</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sub-tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-xs overflow-x-auto">
          {[
            { key: 'COMPROMETIDO', label: 'Saldo Comprometido & Drill-Down', icon: Lock },
            { key: 'OBRA', label: 'Consumo por Obra (em R$)', icon: Building2 },
            { key: 'MINIMO', label: 'Abaixo do Mínimo & Reposição', icon: AlertTriangle },
            { key: 'VALOR', label: 'Posição Financeira Geral', icon: DollarSign },
          ].map((tab) => {
            const isActive = tabAtiva === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setTabAtiva(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MASTER REPORT TABLE (DRILL-DOWN ACCORDION ON ROW CLICK) */}
      <div className="hud-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Relatório de Saldo Comprometido por Material</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clique em qualquer linha para abrir o detalhamento exato das requisições que bloqueiam o saldo físico.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
            {itensFiltrados.length} materiais analisados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/80 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Material & Código</th>
                <th className="py-3.5 px-3 font-semibold">Categoria</th>
                <th className="py-3.5 px-3 font-semibold text-right">Saldo Físico</th>
                <th className="py-3.5 px-3 font-semibold text-right">Reservado</th>
                <th className="py-3.5 px-3 font-semibold text-right">Disponível</th>
                <th className="py-3.5 px-3 font-semibold text-right">Custo Médio</th>
                <th className="py-3.5 px-3 font-semibold text-right">Valor Comprometido</th>
                <th className="py-3.5 px-3 font-semibold text-center">Requisições</th>
                <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {itensFiltrados.map((it) => {
                const isExpanded = expandedId === it.id;
                const isSelected = selectedItem.id === it.id;

                return (
                  <React.Fragment key={it.id}>
                    <tr
                      onClick={() => {
                        setSelectedItem(it);
                        toggleExpand(it.id);
                      }}
                      className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                        isSelected
                          ? 'bg-slate-800/70 border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.12)]'
                          : ''
                      }`}
                    >
                      {/* Material & Código */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {it.nome}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono ml-2">({it.sku})</span>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3 text-slate-400">{it.categoria}</td>

                      {/* Saldo Físico */}
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {it.saldoFisico} {it.unidade}
                      </td>

                      {/* Saldo Reservado */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                        {it.saldoReservado} {it.unidade}
                      </td>

                      {/* Saldo Disponível */}
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                        {it.saldoDisponivel} {it.unidade}
                      </td>

                      {/* Custo Médio */}
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        R$ {it.custoMedio.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Valor Comprometido */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">
                        R$ {it.valorComprometido.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Requisições Tag */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {it.requisicoes.length} req(s)
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(it);
                              toggleExpand(it.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Drill-down"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE DRILL-DOWN SUBTABLE */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={9} className="px-8 py-3.5">
                          <div className="p-3.5 rounded-2xl bg-[#081528] border border-cyan-500/30 space-y-2.5 shadow-inner">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Requisições Bloqueando Saldo Físico de {it.nome}:</span>
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                Total Reservado: <strong className="text-amber-400">{it.saldoReservado} {it.unidade}</strong> (R$ {it.valorComprometido.toFixed(2).replace('.', ',')})
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {it.requisicoes.map((req, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs gap-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                                      {req.reqId}
                                    </span>
                                    <span className="font-semibold text-white">{req.solicitante}</span>
                                    <span className="text-slate-400 font-mono">📍 {req.obra}</span>
                                    <span className="text-slate-500 font-mono text-[11px]">📅 {req.data}</span>
                                  </div>

                                  <div className="flex items-center gap-4 self-end sm:self-auto">
                                    <span className="font-mono font-bold text-amber-400">
                                      {req.quantidade} {it.unidade} bloqueados
                                    </span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      R$ {req.valor.toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Mostrando <strong className="text-white">1 a {itensFiltrados.length}</strong> de <strong className="text-white">{items.length}</strong> registros
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 border border-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.4)]">
              1
            </button>
            <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. LOWER OPERATIONAL SECTION: SPLIT CARDS (EXACT 5-3-2-2 PROPORTIONS MATCHING REFERENCE IMAGE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-start">
        {/* CARD 1: DEVOLUÇÃO SELECIONADA & MATERIAIS (5 COLS ON XL) */}
        <div className="xl:col-span-5 hud-card p-4 space-y-3.5 shadow-2xl border border-slate-800/80">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Devolução selecionada</div>
              <h2 className="text-xl font-black text-white font-mono mt-0.5">DEV-00421</h2>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-mono">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>PENDENTE</span>
            </span>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[9px] bg-[#060e1a]/90 p-2.5 rounded-xl border border-slate-800/70">
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[8px]">SAÍDA ORIGINAL</span>
              <strong className="text-white font-mono text-[10px]">EXT-812</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[8px]">DATA</span>
              <strong className="text-slate-300 font-mono text-[10px]">28/05/2024</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[8px]">RESPONSÁVEL</span>
              <strong className="text-white truncate block text-[10px]">Carlos Mendes</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[8px]">OBRA</span>
              <strong className="text-cyan-400 truncate block text-[10px]">Obra Alpha</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[8px]">FINALIDADE</span>
              <strong className="text-slate-300 truncate block text-[10px]">Instalação elétrica — Bloco B</strong>
            </div>
          </div>

          {/* Subtable: Materiais da devolução */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white tracking-wide">
              Materiais da devolução
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-[9px] uppercase font-semibold text-slate-500 border-b border-slate-800/80">
                    <th className="pb-2 font-semibold">Material</th>
                    <th className="pb-2 font-semibold">Entregue</th>
                    <th className="pb-2 font-semibold">Já devolvido</th>
                    <th className="pb-2 font-semibold">Disponível</th>
                    <th className="pb-2 font-semibold text-center">Nova devolução</th>
                    <th className="pb-2 font-semibold text-right">Restante possível</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">
                          🔌
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">Cabo PP 3x2,5mm</div>
                          <div className="text-[9px] text-slate-500">m</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-slate-300">100 m</td>
                    <td className="py-2 font-mono text-slate-400">20 m</td>
                    <td className="py-2">
                      <div className="font-mono font-bold text-slate-200">80 m</div>
                      <div className="w-14 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <div className="inline-block px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200 text-xs font-bold">
                        50 m
                      </div>
                    </td>
                    <td className="py-2 font-mono text-right text-slate-400">30 m</td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">
                          🎨
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">Tinta Acrílica Branca</div>
                          <div className="text-[9px] text-slate-500">gal</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-slate-300">10 gal</td>
                    <td className="py-2 font-mono text-slate-400">0 gal</td>
                    <td className="py-2">
                      <div className="font-mono font-bold text-slate-200">10 gal</div>
                      <div className="w-14 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <div className="inline-block px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200 text-xs font-bold">
                        5 gal
                      </div>
                    </td>
                    <td className="py-2 font-mono text-right text-slate-400">5 gal</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">
                          ⚡
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">Disjuntor DIN 32A</div>
                          <div className="text-[9px] text-slate-500">un</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-slate-300">20 un</td>
                    <td className="py-2 font-mono text-slate-400">5 un</td>
                    <td className="py-2">
                      <div className="font-mono font-bold text-slate-200">15 un</div>
                      <div className="w-14 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <div className="inline-block px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200 text-xs font-bold">
                        10 un
                      </div>
                    </td>
                    <td className="py-2 font-mono text-right text-slate-400">5 un</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CARD 2: NOVA DEVOLUÇÃO FORM (3 COLS ON XL) */}
        <div className="xl:col-span-3 hud-card p-4 space-y-3 shadow-2xl border border-slate-800/80 text-xs">
          <div className="font-bold text-white text-xs tracking-wide border-b border-slate-800 pb-1.5">
            Nova devolução
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Material</label>
            <div className="relative">
              <select className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs">
                <option>Cabo PP 3x2,5mm</option>
                <option>Tinta Acrílica Branca</option>
                <option>Disjuntor DIN 32A</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Quantidade a devolver</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={50}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-cyan-500 focus:outline-none text-xs"
              />
              <span className="font-mono text-slate-400 font-bold text-xs">m</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-1 font-semibold">
              Máximo permitido: 80 m
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Motivo</label>
            <div className="relative">
              <select className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs">
                <option>Material não utilizado</option>
                <option>Excedente</option>
                <option>Obra encerrada</option>
                <option>Material danificado</option>
                <option>Material incompatível</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Observação</label>
            <textarea
              rows={2}
              placeholder="Observações adicionais (opcional)..."
              maxLength={200}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none text-[11px]"
            />
            <div className="text-[9px] text-slate-500 text-right">0/200</div>
          </div>
        </div>

        {/* CARD 3: IMPACTO NO ESTOQUE (2 COLS ON XL) */}
        <div className="xl:col-span-2 hud-card p-4 space-y-3.5 shadow-2xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-200 font-semibold text-xs pb-0.5">
            <span>Impacto no estoque</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Top section */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Material</span>
              <span className="font-semibold text-slate-100 truncate max-w-[100px]">Cabo PP 3x2,5mm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Estoque atual</span>
              <span className="font-mono text-slate-200 font-bold">380 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Devolução</span>
              <span className="font-mono text-emerald-400 font-bold">+50 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Novo estoque</span>
              <span className="font-mono text-emerald-400 font-black">430 m</span>
            </div>
          </div>

          {/* Spacing & Bottom section */}
          <div className="pt-2.5 border-t border-slate-800/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Entregue originalmente</span>
              <span className="font-mono text-slate-200">100 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Já devolvido</span>
              <span className="font-mono text-slate-200">20 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Disponível para devolver</span>
              <span className="font-mono text-slate-200">80 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Nova devolução</span>
              <span className="font-mono text-emerald-400 font-bold">50 m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Restante possível</span>
              <span className="font-mono text-slate-200">30 m</span>
            </div>
          </div>
        </div>

        {/* CARD 4: STACKED CUSTO HISTÓRICO & WORKFLOW DA DEVOLUÇÃO (2 COLS ON XL) */}
        <div className="xl:col-span-2 space-y-3">
          {/* Top Box: Custo Histórico */}
          <div className="hud-card p-3 space-y-2 border border-slate-800/80 text-xs shadow-xl">
            <div className="flex items-center gap-1 text-slate-200 font-semibold text-xs pb-0.5">
              <span>Custo histórico</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">Custo histórico</span>
              <span className="font-mono font-bold text-slate-200 text-xs">R$ 8,10 / m</span>
            </div>

            {/* Dotted separator line */}
            <div className="border-b border-dashed border-slate-800/90 my-1" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">Valor recuperado</span>
              <span className="font-mono font-black text-emerald-400 text-xs">
                R$ 405,00
              </span>
            </div>
          </div>

          {/* Bottom Box: Workflow da Devolução */}
          <div className="hud-card p-3 space-y-2.5 border border-slate-800/80 text-xs shadow-xl">
            <div className="font-semibold text-white text-xs">
              Workflow da devolução
            </div>

            <div className="relative pl-1 space-y-2 pt-0.5 text-xs">
              {/* Continuous vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-blue-600/60 -z-0" />

              {/* Step 1: Saída original */}
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shadow-[0_0_6px_rgba(37,99,235,0.6)] flex-shrink-0">
                  ✓
                </div>
                <span className="text-slate-300 font-medium text-[10px]">Saída original</span>
              </div>

              {/* Step 2: Selecionar materiais */}
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shadow-[0_0_6px_rgba(37,99,235,0.6)] flex-shrink-0">
                  ✓
                </div>
                <span className="text-slate-300 font-medium text-[10px]">Selecionar materiais</span>
              </div>

              {/* Step 3: Definir quantidade (ACTIVE) */}
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black shadow-[0_0_8px_rgba(37,99,235,0.8)] flex-shrink-0">
                  3
                </div>
                <span className="text-white font-bold text-[10px]">Definir quantidade</span>
              </div>

              {/* Step 4: Revisão */}
              <div className="relative z-10 flex items-center gap-2 opacity-60">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                  4
                </div>
                <span className="text-slate-400 font-medium text-[10px]">Revisão</span>
              </div>

              {/* Step 5: Confirmada */}
              <div className="relative z-10 flex items-center gap-2 opacity-60">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                  5
                </div>
                <span className="text-slate-400 font-medium text-[10px]">Confirmada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM BAR: REVISÃO DA DEVOLUÇÃO (EXACT MATCH TO REFERENCE IMAGE) */}
      <div className="hud-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/80 shadow-2xl">
        <div className="space-y-1 w-full md:w-auto">
          <div className="text-xs font-bold text-white">Revisão da devolução</div>
          <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Material</span>
              <strong className="text-white text-xs">Cabo PP 3x2,5mm</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Quantidade</span>
              <strong className="text-white font-mono text-xs">50 m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Motivo</span>
              <strong className="text-slate-300 text-xs">Material não utilizado</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Estoque atual</span>
              <strong className="text-slate-300 font-mono text-xs">380 m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Estoque após devolução</span>
              <strong className="text-emerald-400 font-mono font-bold text-xs">430 m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Valor recuperado</span>
              <strong className="text-emerald-400 font-mono font-black text-xs">R$ 405,00</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-auto">
          <button
            onClick={() => showToast('Revisão cancelada')}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <button
            onClick={() => showToast('Devolução confirmada com sucesso!')}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>Confirmar devolução</span>
          </button>
        </div>
      </div>

      {/* 7. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-cyan-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
