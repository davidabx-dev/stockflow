'use client';

import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Check,
  X,
  RotateCcw,
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers,
  ArrowDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MaterialItem {
  id: string;
  nome: string;
  codigo: string;
  localizacao: string;
  categoria: string;
  sistema: number;
  contado: number;
  unidade: string;
  status: 'Conferido' | 'Divergência' | 'Pendente';
  motivoDivergencia?: string;
  observacao?: string;
}

const mockInventoryItems: MaterialItem[] = [
  {
    id: '1',
    nome: 'Cabo PP 3x2,5mm',
    codigo: 'MAT-0001',
    localizacao: 'Almoxarifado A',
    categoria: 'Cabos',
    sistema: 500,
    contado: 497,
    unidade: 'm',
    status: 'Divergência',
    motivoDivergencia: 'Material não localizado',
    observacao: 'Possível sobra na Obra Alpha ainda não baixada.',
  },
  {
    id: '2',
    nome: 'Fita Isolante',
    codigo: 'MAT-0002',
    localizacao: 'Almoxarifado A',
    categoria: 'Elétrico',
    sistema: 50,
    contado: 50,
    unidade: 'un',
    status: 'Conferido',
  },
  {
    id: '3',
    nome: 'Disjuntor DIN 32A',
    codigo: 'MAT-0003',
    localizacao: 'Almoxarifado B',
    categoria: 'Elétrico',
    sistema: 100,
    contado: 104,
    unidade: 'un',
    status: 'Divergência',
    motivoDivergencia: 'Sobra não identificada',
    observacao: '4 unidades encontradas em lote anterior.',
  },
  {
    id: '4',
    nome: 'Eletroduto 3/4"',
    codigo: 'MAT-0004',
    localizacao: 'Almoxarifado A',
    categoria: 'Tubulações',
    sistema: 80,
    contado: 80,
    unidade: 'm',
    status: 'Conferido',
  },
  {
    id: '5',
    nome: 'Caixa de Passagem 4x2',
    codigo: 'MAT-0005',
    localizacao: 'Almoxarifado B',
    categoria: 'Fixação',
    sistema: 30,
    contado: 28,
    unidade: 'un',
    status: 'Divergência',
    motivoDivergencia: 'Avaria não registrada',
    observacao: '2 caixas trincadas descartadas.',
  },
  {
    id: '6',
    nome: 'Parafuso 4,2x32mm',
    codigo: 'MAT-0006',
    localizacao: 'Almoxarifado A',
    categoria: 'Fixação',
    sistema: 200,
    contado: 200,
    unidade: 'un',
    status: 'Conferido',
  },
];

export const InventarioView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<MaterialItem[]>(mockInventoryItems);
  const [selectedItem, setSelectedItem] = useState<MaterialItem>(mockInventoryItems[0]);
  const [busca, setBusca] = useState('');
  const [locFiltro, setLocFiltro] = useState('Todas');
  const [catFiltro, setCatFiltro] = useState('Todas');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [tabFiltro, setTabFiltro] = useState<'Todos' | 'Não conferidos' | 'Conferidos' | 'Com divergência'>('Todos');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State Contagem
  const [inputContado, setInputContado] = useState<string>('497');
  const [inputMotivo, setInputMotivo] = useState<string>('Material não localizado');
  const [inputObs, setInputObs] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats
  const totalItens = 1248;
  const conferidos = 986;
  const divergencias = 17;
  const pendentes = 245;
  const percentual = 79;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Difference for selected item
  const countedNum = Number(inputContado) || 0;
  const diffCalculada = countedNum - selectedItem.sistema;
  const diffPercent = selectedItem.sistema > 0 ? ((diffCalculada / selectedItem.sistema) * 100).toFixed(2) : '0.00';

  const handleSelectItem = (item: MaterialItem) => {
    setSelectedItem(item);
    setInputContado(String(item.contado));
    setInputMotivo(item.motivoDivergencia || 'Material não localizado');
    setInputObs(item.observacao || '');
  };

  const handleSalvarContagem = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = items.map((it) => {
      if (it.id === selectedItem.id) {
        const isDiff = diffCalculada !== 0;
        return {
          ...it,
          contado: countedNum,
          status: isDiff ? ('Divergência' as const) : ('Conferido' as const),
          motivoDivergencia: isDiff ? inputMotivo : undefined,
          observacao: inputObs || undefined,
        };
      }
      return it;
    });

    setItems(updated);
    const updatedItem = updated.find((it) => it.id === selectedItem.id) || selectedItem;
    setSelectedItem(updatedItem);
    showToast(`Contagem de ${selectedItem.nome} atualizada: ${countedNum} ${selectedItem.unidade}`);
  };

  const handleFinalizarInventario = () => {
    showToast('Ciclo INV-0007 finalizado e relatório enviado para auditoria!');
  };

  // Filtered List
  const materiaisFiltrados = items.filter((m) => {
    const matchBusca =
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      m.localizacao.toLowerCase().includes(busca.toLowerCase());

    const matchLoc = locFiltro === 'Todas' || m.localizacao === locFiltro;
    const matchCat = catFiltro === 'Todas' || m.categoria === catFiltro;
    const matchStatus = statusFiltro === 'Todos' || m.status === statusFiltro;

    let matchTab = true;
    if (tabFiltro === 'Não conferidos') matchTab = m.status === 'Pendente';
    else if (tabFiltro === 'Conferidos') matchTab = m.status === 'Conferido';
    else if (tabFiltro === 'Com divergência') matchTab = m.status === 'Divergência';

    return matchBusca && matchLoc && matchCat && matchStatus && matchTab;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Inventário</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Realize conferências e identifique divergências de estoque.
          </p>
        </div>

        <button
          onClick={() => showToast('Exportando relatório consolidado de inventário...')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar relatório</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
        </button>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (FITSTRONG GLASS / CYAN, EMERALD, AMBER, PURPLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: ITENS (Cyan) */}
        <div
          onClick={() => {
            setTabFiltro('Todos');
            showToast('Exibindo todos os 1.248 itens no inventário');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ITENS</span>
            <div className="kpi-value">1.248</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Itens no inventário</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: CONFERIDOS (Emerald) */}
        <div
          onClick={() => {
            setTabFiltro('Conferidos');
            showToast('Filtrando por itens conferidos');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">CONFERIDOS</span>
            <div className="kpi-value">986</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>79% concluído</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: DIVERGÊNCIAS (Amber) */}
        <div
          onClick={() => {
            setTabFiltro('Com divergência');
            showToast('Filtrando por itens com divergência');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">DIVERGÊNCIAS</span>
            <div className="kpi-value">17</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>Requer atenção</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: PENDENTES (Purple) */}
        <div
          onClick={() => {
            setTabFiltro('Não conferidos');
            showToast('Filtrando por itens pendentes de contagem');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">PENDENTES</span>
            <div className="kpi-value">245</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Aguardando contagem</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTER BAR */}
      <div className="bg-[#081424]/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        {/* Row 1: Filters Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar material..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
              />
            </div>

            {/* Localização Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Localização</span>
              <select
                value={locFiltro}
                onChange={(e) => setLocFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todas" className="bg-slate-900 text-white">Todas</option>
                <option value="Almoxarifado A" className="bg-slate-900 text-white">Almoxarifado A</option>
                <option value="Almoxarifado B" className="bg-slate-900 text-white">Almoxarifado B</option>
              </select>
            </div>

            {/* Categoria Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Categoria</span>
              <select
                value={catFiltro}
                onChange={(e) => setCatFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todas" className="bg-slate-900 text-white">Todas</option>
                <option value="Cabos" className="bg-slate-900 text-white">Cabos</option>
                <option value="Elétrico" className="bg-slate-900 text-white">Elétrico</option>
                <option value="Tubulações" className="bg-slate-900 text-white">Tubulações</option>
                <option value="Fixação" className="bg-slate-900 text-white">Fixação</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Status</span>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-slate-900 text-white">Todos</option>
                <option value="Conferido" className="bg-slate-900 text-white">Conferido</option>
                <option value="Divergência" className="bg-slate-900 text-white">Divergência</option>
                <option value="Pendente" className="bg-slate-900 text-white">Pendente</option>
              </select>
            </div>

            {/* Inventário Active Cycle */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Inventário</span>
              <span className="font-mono font-bold text-cyan-400">INV-0007</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>

            {/* Conferência */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Conferência</span>
              <span className="font-bold text-white">Todos</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filtrar Button */}
            <button
              onClick={() => showToast('Filtros aplicados!')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 font-bold transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>

            {/* Limpar Button */}
            <button
              onClick={() => {
                setBusca('');
                setLocFiltro('Todas');
                setCatFiltro('Todas');
                setStatusFiltro('Todos');
                setTabFiltro('Todos');
                showToast('Filtros redefinidos');
              }}
              className="px-3 py-2 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Limpar
            </button>

            {/* + Novo Inventário Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-105 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Novo inventário</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sub-tabs Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-xs overflow-x-auto">
          {(['Todos', 'Não conferidos', 'Conferidos', 'Com divergência'] as const).map((tab) => {
            const isActive = tabFiltro === tab;
            return (
              <button
                key={tab}
                onClick={() => setTabFiltro(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN LAYOUT: LEFT TABLE & LOWER DETAILS + RIGHT PROGRESS SUMMARY PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: TABLE & LOWER CONFERÊNCIA CARDS (8 COLS ON XL) */}
        <div className="xl:col-span-8 space-y-6">
          {/* TABLE: MATERIAIS PARA CONFERÊNCIA */}
          <div className="hud-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/60 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Material</th>
                    <th className="py-3.5 px-3 font-semibold">Código</th>
                    <th className="py-3.5 px-3 font-semibold">Localização</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Sistema</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Contado</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Diferença</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Unidade</th>
                    <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {materiaisFiltrados.map((item) => {
                    const isSelected = selectedItem.id === item.id;
                    const diff = item.contado - item.sistema;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? 'bg-slate-800/70 border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.12)]'
                            : ''
                        }`}
                      >
                        {/* Radio selection circle + Material Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </div>
                            <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {item.nome}
                            </span>
                          </div>
                        </td>

                        {/* Código */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">{item.codigo}</td>

                        {/* Localização */}
                        <td className="py-3 px-3 text-slate-300">{item.localizacao}</td>

                        {/* Sistema */}
                        <td className="py-3 px-3 font-mono text-center text-slate-300">{item.sistema}</td>

                        {/* Contado */}
                        <td className="py-3 px-3 font-mono text-center font-bold text-white">{item.contado}</td>

                        {/* Diferença */}
                        <td className="py-3 px-3 font-mono text-center font-bold">
                          {diff < 0 && <span className="text-rose-400">{diff}</span>}
                          {diff > 0 && <span className="text-emerald-400">+{diff}</span>}
                          {diff === 0 && <span className="text-slate-400">0</span>}
                        </td>

                        {/* Unidade */}
                        <td className="py-3 px-3 font-mono text-center text-slate-400">{item.unidade}</td>

                        {/* Ações (Status Pill + Eye icon) */}
                        <td className="py-3 px-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'Divergência' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <span>⚠ Divergência</span>
                              </span>
                            )}
                            {item.status === 'Conferido' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span>✓ Conferido</span>
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectItem(item);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Visualizar item"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
                <span>1-10 de 92</span>
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

          {/* LOWER SECTION 1: DETALHES DO MATERIAL & CONTAGEM (3-PART SPLIT GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Part 1: Detalhes do Material Selecionado (4 cols) */}
            <div className="lg:col-span-4 hud-card p-4 space-y-3.5 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Detalhes do material selecionado
                </div>
                <h3 className="text-base font-black text-white mt-0.5">{selectedItem.nome}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#081528]/80 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 uppercase font-semibold block">Código</span>
                  <strong className="text-slate-300 font-mono">{selectedItem.codigo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block">Localização</span>
                  <strong className="text-white truncate block">{selectedItem.localizacao}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block">Categoria</span>
                  <strong className="text-cyan-400">{selectedItem.categoria}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block">Unidade</span>
                  <strong className="text-white font-mono">{selectedItem.unidade}</strong>
                </div>
              </div>

              {/* Comparação de Quantidades Flow */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Comparação de quantidades
                </div>

                {/* Horizontal badges flow */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold font-mono">
                    SISTEMA: {selectedItem.sistema} {selectedItem.unidade}
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold font-mono">
                    CONTADO: {countedNum} {selectedItem.unidade}
                  </div>
                  <div
                    className={`p-1.5 rounded-lg font-bold font-mono border ${
                      diffCalculada < 0
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : diffCalculada > 0
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    DIFERENÇA: {diffCalculada > 0 ? `+${diffCalculada}` : diffCalculada} {selectedItem.unidade}
                  </div>
                </div>

                {/* Downward comparison */}
                <div className="p-2.5 rounded-xl bg-[#081528]/80 border border-slate-800/80 text-[10px] space-y-1 mt-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Quantidade no sistema:</span>
                    <strong className="text-white font-mono">{selectedItem.sistema} {selectedItem.unidade}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Quantidade contada:</span>
                    <strong className="text-white font-mono">{countedNum} {selectedItem.unidade}</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex items-center justify-between font-bold">
                    <span className="text-slate-300">Diferença encontrada:</span>
                    <strong
                      className={`font-mono ${
                        diffCalculada < 0
                          ? 'text-rose-400'
                          : diffCalculada > 0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {diffCalculada > 0 ? `+${diffCalculada}` : diffCalculada} {selectedItem.unidade}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: Contagem e Conferência Form (4 cols) */}
            <div className="lg:col-span-4 hud-card p-4 space-y-3.5 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Contagem e conferência
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantidade contada</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={inputContado}
                    onChange={(e) => setInputContado(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-black text-sm focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="font-mono text-slate-400 font-bold">{selectedItem.unidade}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Quantidade no sistema: <strong className="text-slate-400 font-mono">{selectedItem.sistema} {selectedItem.unidade}</strong>
                </div>
              </div>

              {/* Diferença Calculada Box */}
              <div className="p-3 rounded-xl bg-[#081528]/80 border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Diferença calculada</div>
                <div
                  className={`text-xl font-black font-mono ${
                    diffCalculada < 0
                      ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                      : diffCalculada > 0
                      ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(0,245,155,0.4)]'
                      : 'text-slate-300'
                  }`}
                >
                  {diffCalculada > 0 ? `+${diffCalculada}` : diffCalculada} {selectedItem.unidade}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ({diffPercent}%) {diffCalculada < 0 ? 'abaixo do sistema' : diffCalculada > 0 ? 'acima do sistema' : 'estoque exato'}
                </div>
              </div>
            </div>

            {/* Part 3: Status da Conferência & Salvar (4 cols) */}
            <form onSubmit={handleSalvarContagem} className="lg:col-span-4 hud-card p-4 space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Status da conferência
                </div>

                {diffCalculada !== 0 ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Divergência encontrada</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                    <Check className="w-4 h-4 flex-shrink-0 stroke-[3]" />
                    <span>Contagem exata conferida</span>
                  </div>
                )}

                {diffCalculada !== 0 && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Motivo *</label>
                    <div className="relative">
                      <select
                        value={inputMotivo}
                        onChange={(e) => setInputMotivo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6 text-xs"
                      >
                        <option value="Material não localizado">Material não localizado</option>
                        <option value="Erro de contagem anterior">Erro de contagem anterior</option>
                        <option value="Avaria não registrada">Avaria não registrada</option>
                        <option value="Sobra não identificada">Sobra não identificada</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Observação</label>
                  <textarea
                    rows={2}
                    value={inputObs}
                    onChange={(e) => setInputObs(e.target.value)}
                    placeholder="Observações adicionais (opcional)..."
                    maxLength={300}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none text-xs"
                  />
                  <div className="text-[9px] text-slate-500 text-right">{inputObs.length}/300</div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer mt-2"
              >
                Salvar contagem
              </button>
            </form>
          </div>

          {/* LOWER SECTION 2: ETAPAS DO INVENTÁRIO (BOTTOM STEPPER BAR) */}
          <div className="hud-card p-4 space-y-3">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              Etapas do inventário
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
              {/* Step 1 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">Inventário criado</div>
                  <div className="text-[9px] text-slate-400 font-mono">28/05/2024 08:30</div>
                </div>
              </div>

              <span className="text-slate-600">→</span>

              {/* Step 2 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(37,99,235,0.6)]">
                  ✉
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">Contagem</div>
                  <div className="text-[9px] text-cyan-400 font-bold">Em andamento</div>
                </div>
              </div>

              <span className="text-slate-600">→</span>

              {/* Step 3 */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-700 text-slate-400 flex items-center justify-center text-[10px]">
                  +
                </div>
                <div>
                  <div className="font-semibold text-slate-300 text-[11px]">Conferência</div>
                  <div className="text-[9px] text-slate-500">Aguardando</div>
                </div>
              </div>

              <span className="text-slate-600">→</span>

              {/* Step 4 */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-700 text-slate-400 flex items-center justify-center text-[10px]">
                  ⚠
                </div>
                <div>
                  <div className="font-semibold text-slate-300 text-[11px]">Divergências</div>
                  <div className="text-[9px] text-slate-500">Aguardando</div>
                </div>
              </div>

              <span className="text-slate-600">→</span>

              {/* Step 5 */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-700 text-slate-400 flex items-center justify-center text-[10px]">
                  📋
                </div>
                <div>
                  <div className="font-semibold text-slate-300 text-[11px]">Finalização</div>
                  <div className="text-[9px] text-slate-500">Aguardando</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL: CONFERÊNCIA & RESUMO (4 COLS ON XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* CARD 1: CONFERÊNCIA DO INVENTÁRIO (79% PROGRESS) */}
          <div className="hud-card p-5 space-y-4 shadow-2xl border border-cyan-500/40">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide">Conferência do inventário</h2>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-black text-white font-mono tracking-tight">{percentual}%</div>
              <div className="text-xs text-slate-400">
                <strong className="text-white font-mono">{conferidos}</strong> de{' '}
                <strong className="text-white font-mono">{totalItens}</strong> itens conferidos
              </div>
            </div>

            {/* Neon Gradient Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,245,155,0.7)]"
                style={{ width: `${percentual}%` }}
              />
            </div>

            {/* 3 Stat Boxes */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-base font-black text-emerald-400 font-mono">{conferidos}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">Conferidos</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-base font-black text-cyan-400 font-mono">{pendentes}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">Pendentes</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-base font-black text-rose-400 font-mono">{divergencias}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">Divergências</div>
              </div>
            </div>
          </div>

          {/* CARD 2: RESUMO DA CONFERÊNCIA & FINALIZAR INVENTÁRIO */}
          <div className="hud-card p-5 space-y-4 shadow-2xl border border-emerald-500/40 text-xs">
            <div className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
              Resumo da conferência
            </div>

            {/* 3 Status Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Conferidos</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{conferidos}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Divergências</span>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm">{divergencias}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">Pendentes</span>
                </div>
                <span className="font-mono font-bold text-cyan-400 text-sm">{pendentes}</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-1.5 bg-[#081528]/80 p-3 rounded-2xl border border-slate-800/80 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Diferença positiva:</span>
                <span className="font-mono font-bold text-emerald-400">+18 un</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Diferença negativa:</span>
                <span className="font-mono font-bold text-rose-400">-27 un</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-200">Impacto estimado:</span>
                <span className="font-mono text-cyan-400 font-black text-sm">R$ 842,00</span>
              </div>
            </div>

            {/* Inventory Status Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Inventário concluído</span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>1.248 itens conferidos</strong> • <strong>17 divergências identificadas</strong>.
              </p>
              <p className="text-[10px] text-slate-400">Todos os resultados foram revisados.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => showToast('Retornando ao ciclo anterior...')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                Voltar
              </button>
              <button
                onClick={handleFinalizarInventario}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#00f59b] hover:bg-[#00e08e] text-black font-black text-xs shadow-[0_0_20px_rgba(0,245,155,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer text-center"
              >
                Finalizar Inventário
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MODAL NOVO INVENTÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="hud-card w-full max-w-lg p-6 border border-blue-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <h3 className="text-base font-bold text-white">Abrir Novo Ciclo de Inventário</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
                showToast('Novo ciclo INV-0008 iniciado com sucesso!');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Localização Alvo *</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer">
                  <option>Almoxarifado Geral (Todos)</option>
                  <option>Almoxarifado A</option>
                  <option>Almoxarifado B</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações do Ciclo</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Inventário de fechamento mensal de maio/2024"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Iniciar Contagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-emerald-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00f59b]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
