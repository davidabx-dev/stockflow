'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Layers,
  Box,
  DollarSign,
  Eye,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Filter,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  CornerUpLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Material, Categoria, UnidadeMedida } from '@/types';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';

interface MaterialItem {
  id: number;
  sku: string;
  nome: string;
  subtitulo: string;
  categoria: string;
  categoria_cor: string;
  disponivel: number;
  reservado: number;
  fisico_total: number;
  minimo: number;
  unidade: string;
  custo_medio: number;
  status: 'Crítico' | 'Atenção' | 'Normal';
  img_icon: string;
  localizacoes: Array<{ nome: string; qtd: number }>;
  movimentacoes: Array<{
    tipo: 'Entrada' | 'Saída' | 'Devolução';
    qtd: string;
    qtd_color: string;
    doc: string;
    data: string;
  }>;
}

const initialMockMaterials: MaterialItem[] = [
  {
    id: 1,
    sku: 'MAT-0001',
    nome: 'Cabo PP 3x2,5mm',
    subtitulo: 'Cabo elétrico flexível',
    categoria: 'Elétrico',
    categoria_cor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    disponivel: 38,
    reservado: 120,
    fisico_total: 500,
    minimo: 100,
    unidade: 'm',
    custo_medio: 8.40,
    status: 'Crítico',
    img_icon: '🔌',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 25 },
      { nome: 'Almoxarifado B', qtd: 13 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 50 m', qtd_color: 'text-emerald-400', doc: 'NF 12345 - Fornecedor ABC', data: '15/05/2024' },
      { tipo: 'Saída', qtd: '- 12 m', qtd_color: 'text-rose-400', doc: 'Req. 4587 - Obra Residencial', data: '14/05/2024' },
      { tipo: 'Devolução', qtd: '+ 5 m', qtd_color: 'text-cyan-400', doc: 'Dev. 125 - Obra Comercial', data: '13/05/2024' },
    ],
  },
  {
    id: 2,
    sku: 'MAT-0002',
    nome: 'Disjuntor Din 25A',
    subtitulo: 'Curva C',
    categoria: 'Elétrico',
    categoria_cor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    disponivel: 2,
    reservado: 5,
    fisico_total: 7,
    minimo: 10,
    unidade: 'un',
    custo_medio: 24.90,
    status: 'Crítico',
    img_icon: '⚡',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 2 },
      { nome: 'Almoxarifado B', qtd: 0 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 20 un', qtd_color: 'text-emerald-400', doc: 'NF 88214 - Distribuidora Elétrica', data: '10/05/2024' },
      { tipo: 'Saída', qtd: '- 18 un', qtd_color: 'text-rose-400', doc: 'Req. 4520 - Painel Principal', data: '12/05/2024' },
    ],
  },
  {
    id: 3,
    sku: 'MAT-0003',
    nome: 'Eletroduto PVC 25mm',
    subtitulo: 'Eletroduto rígido',
    categoria: 'Hidráulico',
    categoria_cor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    disponivel: 15,
    reservado: 20,
    fisico_total: 35,
    minimo: 50,
    unidade: 'm',
    custo_medio: 6.80,
    status: 'Atenção',
    img_icon: '🛠️',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 10 },
      { nome: 'Almoxarifado B', qtd: 5 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 60 m', qtd_color: 'text-emerald-400', doc: 'NF 55120 - Tubos & Conexões', data: '05/05/2024' },
      { tipo: 'Saída', qtd: '- 45 m', qtd_color: 'text-rose-400', doc: 'Req. 4480 - Infraestrutura', data: '08/05/2024' },
    ],
  },
  {
    id: 4,
    sku: 'MAT-0004',
    nome: 'Tinta Acrílica Branco 18L',
    subtitulo: 'Cor: Branco',
    categoria: 'Acabamento',
    categoria_cor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    disponivel: 80,
    reservado: 15,
    fisico_total: 95,
    minimo: 30,
    unidade: 'gal',
    custo_medio: 42.00,
    status: 'Normal',
    img_icon: '🎨',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 50 },
      { nome: 'Almoxarifado B', qtd: 30 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 40 gal', qtd_color: 'text-emerald-400', doc: 'NF 99124 - Tintas Premium', data: '01/05/2024' },
      { tipo: 'Saída', qtd: '- 10 gal', qtd_color: 'text-rose-400', doc: 'Req. 4390 - Pintura Fachada', data: '04/05/2024' },
    ],
  },
  {
    id: 5,
    sku: 'MAT-0005',
    nome: 'Cimento CP II 50kg',
    subtitulo: 'Alta resistência',
    categoria: 'Construção',
    categoria_cor: 'bg-amber-600/15 text-amber-500 border-amber-600/30',
    disponivel: 120,
    reservado: 40,
    fisico_total: 160,
    minimo: 50,
    unidade: 'sc',
    custo_medio: 32.50,
    status: 'Normal',
    img_icon: '🧱',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 80 },
      { nome: 'Almoxarifado B', qtd: 40 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 150 sc', qtd_color: 'text-emerald-400', doc: 'NF 77812 - Cimentos do Brasil', data: '02/05/2024' },
      { tipo: 'Saída', qtd: '- 30 sc', qtd_color: 'text-rose-400', doc: 'Req. 4410 - Fundação Obra B', data: '06/05/2024' },
    ],
  },
  {
    id: 6,
    sku: 'MAT-0006',
    nome: 'Parafuso 4,2x32mm',
    subtitulo: 'Auto brocante',
    categoria: 'Fixação',
    categoria_cor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    disponivel: 500,
    reservado: 100,
    fisico_total: 600,
    minimo: 200,
    unidade: 'un',
    custo_medio: 0.15,
    status: 'Normal',
    img_icon: '🔩',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 300 },
      { nome: 'Almoxarifado B', qtd: 200 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 1000 un', qtd_color: 'text-emerald-400', doc: 'NF 12903 - Parafusos & Porcas', data: '28/04/2024' },
      { tipo: 'Saída', qtd: '- 500 un', qtd_color: 'text-rose-400', doc: 'Req. 4310 - Drywall Obra C', data: '03/05/2024' },
    ],
  },
  {
    id: 7,
    sku: 'MAT-0007',
    nome: 'Madeira Pinus 2x4',
    subtitulo: '3,0 metros',
    categoria: 'Madeira',
    categoria_cor: 'bg-amber-700/15 text-amber-400 border-amber-700/30',
    disponivel: 25,
    reservado: 30,
    fisico_total: 55,
    minimo: 40,
    unidade: 'un',
    custo_medio: 18.90,
    status: 'Crítico',
    img_icon: '🪵',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 15 },
      { nome: 'Almoxarifado B', qtd: 10 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 50 un', qtd_color: 'text-emerald-400', doc: 'NF 66102 - Madeireira Silva', data: '22/04/2024' },
      { tipo: 'Saída', qtd: '- 25 un', qtd_color: 'text-rose-400', doc: 'Req. 4290 - Formas de Concreto', data: '29/04/2024' },
    ],
  },
  {
    id: 8,
    sku: 'MAT-0008',
    nome: 'Lâmpada LED 12W',
    subtitulo: '6500K Branca',
    categoria: 'Iluminação',
    categoria_cor: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    disponivel: 60,
    reservado: 40,
    fisico_total: 100,
    minimo: 100,
    unidade: 'un',
    custo_medio: 7.50,
    status: 'Atenção',
    img_icon: '💡',
    localizacoes: [
      { nome: 'Almoxarifado A', qtd: 40 },
      { nome: 'Almoxarifado B', qtd: 20 },
    ],
    movimentacoes: [
      { tipo: 'Entrada', qtd: '+ 100 un', qtd_color: 'text-emerald-400', doc: 'NF 88310 - LED Brasil Iluminação', data: '18/04/2024' },
      { tipo: 'Saída', qtd: '- 40 un', qtd_color: 'text-rose-400', doc: 'Req. 4210 - Iluminação Garagem', data: '25/04/2024' },
    ],
  },
];

export const MateriaisView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<MaterialItem[]>(initialMockMaterials);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('Todos');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem>(initialMockMaterials[0]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Novo Material
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoSKU, setNovoSKU] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoSubtitulo, setNovoSubtitulo] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Elétrico');
  const [novoSaldo, setNovoSaldo] = useState('100');
  const [novoMinimo, setNovoMinimo] = useState('20');
  const [novoCusto, setNovoCusto] = useState('15.50');
  const [novaUnidade, setNovaUnidade] = useState('un');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const saldoNum = Number(novoSaldo) || 0;
    const minNum = Number(novoMinimo) || 0;
    const custoNum = Number(novoCusto) || 0;

    const newItem: MaterialItem = {
      id: Date.now(),
      sku: novoSKU || `MAT-${String(items.length + 1).padStart(4, '0')}`,
      nome: novoNome,
      subtitulo: novoSubtitulo || 'Item cadastrado',
      categoria: novaCategoria,
      categoria_cor:
        novaCategoria === 'Elétrico'
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : novaCategoria === 'Hidráulico'
          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
          : novaCategoria === 'Acabamento'
          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
          : 'bg-amber-600/15 text-amber-500 border-amber-600/30',
      disponivel: saldoNum,
      reservado: 0,
      fisico_total: saldoNum,
      minimo: minNum,
      unidade: novaUnidade,
      custo_medio: custoNum,
      status: saldoNum <= minNum * 0.5 ? 'Crítico' : saldoNum <= minNum ? 'Atenção' : 'Normal',
      img_icon: '📦',
      localizacoes: [{ nome: 'Almoxarifado Geral', qtd: saldoNum }],
      movimentacoes: [
        {
          tipo: 'Entrada',
          qtd: `+ ${saldoNum} ${novaUnidade}`,
          qtd_color: 'text-emerald-400',
          doc: 'Cadastro Inicial de Estoque',
          data: new Date().toLocaleDateString('pt-BR'),
        },
      ],
    };

    setItems([newItem, ...items]);
    setSelectedMaterial(newItem);
    setIsModalOpen(false);
    showToast(`Material ${novoNome} cadastrado com sucesso!`);

    // Reset Form
    setNovoSKU('');
    setNovoNome('');
    setNovoSubtitulo('');
    setNovoSaldo('100');
    setNovoMinimo('20');
    setNovoCusto('15.50');
  };

  // KPIs
  const totalMateriais = 1248;
  const disponiveisCount = 986;
  const abaixoMinimoCount = 17;
  const valorTotalEstoque = 148540.0;

  // Filtered List
  const materiaisFiltrados = items.filter((m) => {
    const matchBusca =
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.sku.toLowerCase().includes(busca.toLowerCase()) ||
      m.subtitulo.toLowerCase().includes(busca.toLowerCase());

    const matchCat = categoriaFiltro === 'Todas' || m.categoria === categoriaFiltro;
    const matchStatus = statusFiltro === 'Todos' || m.status === statusFiltro;

    return matchBusca && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP TITLE ROW & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Materiais</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie materiais, quantidades, custos e disponibilidade.
          </p>
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Importação de planilha iniciada...')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Importar</span>
          </button>

          <button
            onClick={() => showToast('Exportando catálogo completo em PDF / Excel...')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-black bg-[#00f59b] hover:bg-[#00e08e] rounded-xl shadow-[0_0_20px_rgba(0,245,155,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Novo material</span>
          </button>
        </div>
      </div>

      {/* 2. 4 TOP SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total de materiais (Green) */}
        <div
          onClick={() => {
            setStatusFiltro('Todos');
            showToast('Exibindo todos os 1.248 materiais');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">TOTAL DE MATERIAIS</span>
            <div className="kpi-value">{totalMateriais.toLocaleString('pt-BR')}</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>Cadastrados no sistema</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <Box className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Materiais disponíveis (Blue/Cyan) */}
        <div
          onClick={() => {
            setStatusFiltro('Normal');
            showToast('Filtrando por: Materiais Disponíveis');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">MATERIAIS DISPONÍVEIS</span>
            <div className="kpi-value">{disponiveisCount.toLocaleString('pt-BR')}</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Com estoque disponível</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Abaixo do mínimo (Amber/Orange) */}
        <div
          onClick={() => {
            setStatusFiltro('Crítico');
            showToast('Filtrando por: Materiais Críticos / Abaixo do Mínimo');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ABAIXO DO MÍNIMO</span>
            <div className="kpi-value">{abaixoMinimoCount}</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>Materiais críticos</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Valor total do estoque (Purple/Indigo) */}
        <div
          onClick={() => {
            showToast('Visualizando valor patrimonial do estoque');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">VALOR TOTAL DO ESTOQUE</span>
            <div className="kpi-value">
              R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot text-emerald-400" />
              <span>↑ 8,4% este mês</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS DOCK */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#081424]/90 p-3 rounded-2xl border border-slate-800 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar material por nome, código ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Categoria Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Categoria</span>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="Todas" className="bg-slate-900 text-white">Todas</option>
              <option value="Elétrico" className="bg-slate-900 text-white">Elétrico</option>
              <option value="Hidráulico" className="bg-slate-900 text-white">Hidráulico</option>
              <option value="Acabamento" className="bg-slate-900 text-white">Acabamento</option>
              <option value="Construção" className="bg-slate-900 text-white">Construção</option>
              <option value="Fixação" className="bg-slate-900 text-white">Fixação</option>
              <option value="Madeira" className="bg-slate-900 text-white">Madeira</option>
              <option value="Iluminação" className="bg-slate-900 text-white">Iluminação</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Status</span>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="Todos" className="bg-slate-900 text-white">Todos</option>
              <option value="Crítico" className="bg-slate-900 text-white">Crítico</option>
              <option value="Atenção" className="bg-slate-900 text-white">Atenção</option>
              <option value="Normal" className="bg-slate-900 text-white">Normal</option>
            </select>
          </div>

          {/* Filtros Button with Active Indicator Dot */}
          <button
            onClick={() => {
              setBusca('');
              setCategoriaFiltro('Todas');
              setStatusFiltro('Todos');
              showToast('Filtros redefinidos');
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00f59b]" />
          </button>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN LAYOUT (TABLE + RIGHT DETAILS DRAWER) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER TABLE (8 COLS ON XL) */}
        <div className="xl:col-span-8 hud-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/50 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Material</th>
                  <th className="py-3.5 px-3 font-semibold">Código</th>
                  <th className="py-3.5 px-3 font-semibold">Categoria</th>
                  <th className="py-3.5 px-3 font-semibold">Estoque disponível</th>
                  <th className="py-3.5 px-3 font-semibold">Estoque mínimo</th>
                  <th className="py-3.5 px-3 font-semibold">Custo médio</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {materiaisFiltrados.map((item) => {
                  const isSelected = selectedMaterial.id === item.id;
                  const valorTotalFormat = (item.disponivel * item.custo_medio).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  });

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedMaterial(item)}
                      className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                        isSelected
                          ? 'bg-slate-800/70 border-l-4 border-emerald-400 shadow-[inset_0_0_20px_rgba(0,245,155,0.12)]'
                          : ''
                      }`}
                    >
                      {/* Material Name & Subtitle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                            {item.img_icon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                              {item.nome}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{item.subtitulo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Código */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">{item.sku}</td>

                      {/* Categoria Badge */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-md ${item.categoria_cor}`}>
                          {item.categoria}
                        </span>
                      </td>

                      {/* Estoque Disponível */}
                      <td className="py-3 px-3">
                        <div
                          className={`font-mono font-bold ${
                            item.status === 'Crítico'
                              ? 'text-rose-400'
                              : item.status === 'Atenção'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.disponivel} {item.unidade}
                        </div>
                        <div className="text-[10px] text-slate-500">Unidade: {item.unidade}</div>
                      </td>

                      {/* Estoque Mínimo */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.minimo} {item.unidade}
                      </td>

                      {/* Custo Médio */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        R$ {item.custo_medio.toFixed(2).replace('.', ',')} / {item.unidade}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-3 text-center">
                        {item.status === 'Crítico' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                            Crítico
                          </span>
                        )}
                        {item.status === 'Atenção' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
                            Atenção
                          </span>
                        )}
                        {item.status === 'Normal' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMaterial(item);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Opções de ${item.nome}`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
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
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Mostrando de <strong className="text-white">1</strong> a{' '}
              <strong className="text-white">{materiaisFiltrados.length}</strong> de{' '}
              <strong className="text-white">1.248</strong> materiais
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(0,245,155,0.3)]">
                1
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                2
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                3
              </button>
              <span className="text-slate-600 px-1">...</span>
              <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors">
                156
              </button>
              <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>8 / página</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE DETAILS DRAWER (4 COLS ON XL) */}
        <div className="xl:col-span-4 hud-card p-5 space-y-4 shadow-2xl border border-emerald-500/40">
          {/* Header Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-wide">Detalhes do material</h2>
            <button
              onClick={() => showToast('Painel minimizado')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Material Hero Card */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-[#061220] border border-slate-700/80 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
              {selectedMaterial.img_icon}
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="text-base font-black text-white leading-tight truncate">
                {selectedMaterial.nome}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                  <span>+ Ativo</span>
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-slate-900 rounded border border-slate-800">
                  <span>{selectedMaterial.sku}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${selectedMaterial.categoria_cor}`}>
                  {selectedMaterial.categoria}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Stat Blocks (Disponível, Reservado, Físico Total) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base font-black text-white font-mono">
                {selectedMaterial.disponivel} {selectedMaterial.unidade}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">Disponível</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base font-black text-white font-mono">
                {selectedMaterial.reservado} {selectedMaterial.unidade}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">Reservado</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base font-black text-white font-mono">
                {selectedMaterial.fisico_total} {selectedMaterial.unidade}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">Físico total</div>
            </div>
          </div>

          {/* Specs List */}
          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Estoque mínimo</span>
              <span className="font-mono font-bold text-rose-400">
                {selectedMaterial.minimo} {selectedMaterial.unidade}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Unidade de medida</span>
              <span className="font-mono font-semibold text-white">{selectedMaterial.unidade}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Custo médio</span>
              <span className="font-mono font-semibold text-white">
                R$ {selectedMaterial.custo_medio.toFixed(2).replace('.', ',')} / {selectedMaterial.unidade}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Valor total</span>
              <span className="font-mono font-bold text-white">
                R${' '}
                {(selectedMaterial.disponivel * selectedMaterial.custo_medio)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Box Localizações */}
          <div className="space-y-2 bg-[#091526]/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider">Localizações</div>
            <div className="space-y-1.5">
              {selectedMaterial.localizacoes.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span>{loc.nome}</span>
                  <span className="font-mono font-semibold text-white">
                    {loc.qtd} {selectedMaterial.unidade}
                  </span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between font-bold text-white">
                <span>Total</span>
                <span className="font-mono text-emerald-400">
                  {selectedMaterial.disponivel} {selectedMaterial.unidade}
                </span>
              </div>
            </div>
          </div>

          {/* Box Últimas Movimentações */}
          <div className="space-y-2 bg-[#091526]/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                Últimas movimentações
              </span>
              <button
                onClick={() => showToast('Abrindo histórico de todas as movimentações...')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-2 pt-1">
              {selectedMaterial.movimentacoes.map((mov, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {mov.tipo === 'Entrada' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />}
                      {mov.tipo === 'Saída' && <ArrowDown className="w-3.5 h-3.5 text-rose-400" />}
                      {mov.tipo === 'Devolução' && <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400" />}
                      <span className="text-white">{mov.tipo}</span>
                    </div>
                    <span className={`font-mono font-bold ${mov.qtd_color}`}>{mov.qtd}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span className="truncate max-w-[170px]">{mov.doc}</span>
                    <span className="font-mono">{mov.data}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons at bottom */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => showToast(`Editando material: ${selectedMaterial.nome}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold text-black bg-[#00f59b] hover:bg-[#00e08e] rounded-xl shadow-[0_0_18px_rgba(0,245,155,0.4)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-black" />
              <span>Editar material</span>
            </button>
            <button
              onClick={() => showToast(`Material ${selectedMaterial.nome} inativado.`)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Inativar material</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODAL NOVO MATERIAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="hud-card w-full max-w-lg p-6 border border-emerald-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-bold text-white">Cadastrar Novo Material</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Material</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Cabo PP 3x4mm"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtítulo / Descrição Curta</label>
                <input
                  type="text"
                  value={novoSubtitulo}
                  onChange={(e) => setNovoSubtitulo(e.target.value)}
                  placeholder="Ex: Cabo flexível 750V"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código / SKU</label>
                  <input
                    type="text"
                    value={novoSKU}
                    onChange={(e) => setNovoSKU(e.target.value)}
                    placeholder="MAT-0009"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option>Elétrico</option>
                    <option>Hidráulico</option>
                    <option>Acabamento</option>
                    <option>Construção</option>
                    <option>Fixação</option>
                    <option>Madeira</option>
                    <option>Iluminação</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Saldo Inicial</label>
                  <input
                    type="number"
                    value={novoSaldo}
                    onChange={(e) => setNovoSaldo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={novoMinimo}
                    onChange={(e) => setNovoMinimo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoCusto}
                    onChange={(e) => setNovoCusto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-[#00f59b] text-black font-bold hover:bg-[#00e08e] shadow-[0_0_15px_rgba(0,245,155,0.4)] cursor-pointer"
                >
                  Cadastrar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-emerald-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00f59b]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
