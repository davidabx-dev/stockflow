'use client';

import React, { useState } from 'react';
import {
  PackageX,
  RotateCcw,
  TrendingUp,
  DollarSign,
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
  Info,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DevolucaoRecord {
  id: string;
  saidaOriginal: string;
  responsavel: string;
  obra: string;
  itensCount: string;
  data: string;
  motivo: string;
  status: 'Pendente' | 'Processada' | 'Em análise' | 'Cancelada';
  finalidade: string;
  dataSaida: string;
  materiais: Array<{
    nome: string;
    icon: string;
    entregue: number;
    jaDevolvido: number;
    disponivel: number;
    novaDevolucao: number;
    restante: number;
    unidade: string;
    custoUnitario: number;
  }>;
}

const mockDevolucoes: DevolucaoRecord[] = [
  {
    id: 'DEV-00421',
    saidaOriginal: 'EXT-812',
    responsavel: 'Carlos Mendes',
    obra: 'Obra Alpha',
    itensCount: '3 itens',
    data: '31/05/2024',
    motivo: 'Material não utilizado',
    status: 'Pendente',
    finalidade: 'Instalação elétrica — Bloco B',
    dataSaida: '28/05/2024',
    materiais: [
      {
        nome: 'Cabo PP 3x2,5mm',
        icon: '🔌',
        entregue: 100,
        jaDevolvido: 20,
        disponivel: 80,
        novaDevolucao: 50,
        restante: 30,
        unidade: 'm',
        custoUnitario: 8.10,
      },
      {
        nome: 'Tinta Acrílica Branca',
        icon: '🎨',
        entregue: 10,
        jaDevolvido: 0,
        disponivel: 10,
        novaDevolucao: 5,
        restante: 5,
        unidade: 'gal',
        custoUnitario: 42.00,
      },
      {
        nome: 'Disjuntor DIN 32A',
        icon: '⚡',
        entregue: 20,
        jaDevolvido: 5,
        disponivel: 15,
        novaDevolucao: 10,
        restante: 5,
        unidade: 'un',
        custoUnitario: 24.90,
      },
    ],
  },
  {
    id: 'DEV-00420',
    saidaOriginal: 'EXT-809',
    responsavel: 'Mariana Costa',
    obra: 'Obra Beta',
    itensCount: '1 item',
    data: '30/05/2024',
    motivo: 'Excedente',
    status: 'Processada',
    finalidade: 'Manutenção hidráulica geral',
    dataSaida: '25/05/2024',
    materiais: [
      {
        nome: 'Eletroduto PVC 25mm',
        icon: '🛠️',
        entregue: 50,
        jaDevolvido: 10,
        disponivel: 40,
        novaDevolucao: 20,
        restante: 20,
        unidade: 'm',
        custoUnitario: 6.80,
      },
    ],
  },
  {
    id: 'DEV-00419',
    saidaOriginal: 'EXT-807',
    responsavel: 'João Oliveira',
    obra: 'Obra Gama',
    itensCount: '4 itens',
    data: '29/05/2024',
    motivo: 'Obra encerrada',
    status: 'Em análise',
    finalidade: 'Fase de acabamento concluída',
    dataSaida: '20/05/2024',
    materiais: [
      {
        nome: 'Cimento CP II 50kg',
        icon: '🧱',
        entregue: 60,
        jaDevolvido: 10,
        disponivel: 50,
        novaDevolucao: 25,
        restante: 25,
        unidade: 'sc',
        custoUnitario: 32.50,
      },
    ],
  },
  {
    id: 'DEV-00418',
    saidaOriginal: 'EXT-804',
    responsavel: 'Fernanda Lima',
    obra: 'Obra Delta',
    itensCount: '2 itens',
    data: '28/05/2024',
    motivo: 'Material danificado',
    status: 'Processada',
    finalidade: 'Substituição por avaria no transporte',
    dataSaida: '22/05/2024',
    materiais: [
      {
        nome: 'Lâmpada LED 12W',
        icon: '💡',
        entregue: 30,
        jaDevolvido: 0,
        disponivel: 30,
        novaDevolucao: 10,
        restante: 20,
        unidade: 'un',
        custoUnitario: 7.50,
      },
    ],
  },
  {
    id: 'DEV-00417',
    saidaOriginal: 'EXT-801',
    responsavel: 'Rafael Santos',
    obra: 'Obra Épsilon',
    itensCount: '1 item',
    data: '27/05/2024',
    motivo: 'Material incompatível',
    status: 'Cancelada',
    finalidade: 'Troca de especificação de projeto',
    dataSaida: '19/05/2024',
    materiais: [
      {
        nome: 'Parafuso 4,2x32mm',
        icon: '🔩',
        entregue: 500,
        jaDevolvido: 0,
        disponivel: 500,
        novaDevolucao: 0,
        restante: 500,
        unidade: 'un',
        custoUnitario: 0.15,
      },
    ],
  },
];

export const DevolucoesView: React.FC = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<DevolucaoRecord[]>(mockDevolucoes);
  const [selectedDev, setSelectedDev] = useState<DevolucaoRecord>(mockDevolucoes[0]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [obraFiltro, setObraFiltro] = useState('Todas');
  const [responsavelFiltro, setResponsavelFiltro] = useState('Todos');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);
  const [qtdADevolver, setQtdADevolver] = useState('50');
  const [motivoSelecionado, setMotivoSelecionado] = useState('Material não utilizado');
  const [obsText, setObsText] = useState('');
  const [workflowStep, setWorkflowStep] = useState(3);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const currentMat = selectedDev.materiais[selectedMaterialIndex] || selectedDev.materiais[0];
  const qtdDevNum = Number(qtdADevolver) || 0;
  const estoqueAtual = 380;
  const novoEstoque = estoqueAtual + qtdDevNum;
  const custoHistorico = currentMat ? currentMat.custoUnitario : 8.10;
  const valorRecuperado = qtdDevNum * custoHistorico;

  const handleConfirmarDevolucao = () => {
    setWorkflowStep(5);
    const updated = items.map((d) =>
      d.id === selectedDev.id ? { ...d, status: 'Processada' as const } : d
    );
    setItems(updated);
    setSelectedDev({ ...selectedDev, status: 'Processada' });
    showToast(`Devolução ${selectedDev.id} confirmada e estoque creditado com sucesso!`);
  };

  const handleCreateNovaDevolucao = (e: React.FormEvent) => {
    e.preventDefault();
    const newDev: DevolucaoRecord = {
      id: `DEV-00${422 + items.length}`,
      saidaOriginal: 'EXT-815',
      responsavel: 'Carlos Mendes',
      obra: 'Obra Alpha',
      itensCount: '1 item',
      data: new Date().toLocaleDateString('pt-BR'),
      motivo: motivoSelecionado,
      status: 'Pendente',
      finalidade: 'Devolução registrada manualmente',
      dataSaida: '30/05/2024',
      materiais: [
        {
          nome: currentMat.nome,
          icon: currentMat.icon,
          entregue: 100,
          jaDevolvido: 0,
          disponivel: 100,
          novaDevolucao: qtdDevNum,
          restante: 100 - qtdDevNum,
          unidade: currentMat.unidade,
          custoUnitario: currentMat.custoUnitario,
        },
      ],
    };

    setItems([newDev, ...items]);
    setSelectedDev(newDev);
    setIsModalOpen(false);
    showToast(`Nova devolução ${newDev.id} registrada com sucesso!`);
  };

  // Filtered List
  const devolucoesFiltradas = items.filter((d) => {
    const matchBusca =
      d.id.toLowerCase().includes(busca.toLowerCase()) ||
      d.saidaOriginal.toLowerCase().includes(busca.toLowerCase()) ||
      d.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      d.obra.toLowerCase().includes(busca.toLowerCase()) ||
      d.motivo.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = statusFiltro === 'Todos' || d.status === statusFiltro;
    const matchObra = obraFiltro === 'Todas' || d.obra === obraFiltro;
    const matchResp = responsavelFiltro === 'Todos' || d.responsavel === responsavelFiltro;

    return matchBusca && matchStatus && matchObra && matchResp;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Devoluções</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registre, acompanhe e controle devoluções de materiais.
          </p>
        </div>

        <button
          onClick={() => showToast('Exportando relatório consolidado de devoluções...')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar relatório</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
        </button>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (FITSTRONG GLASS / CYAN, AMBER, EMERALD, PURPLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: TOTAL (Cyan) */}
        <div
          onClick={() => {
            setStatusFiltro('Todos');
            showToast('Exibindo todas as devoluções');
          }}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">TOTAL</span>
            <div className="kpi-value">184</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Devoluções registradas</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <PackageX className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: PENDENTES (Amber) */}
        <div
          onClick={() => {
            setStatusFiltro('Pendente');
            showToast('Filtrando por devoluções Pendentes');
          }}
          className="kpi-card kpi-amber group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">PENDENTES</span>
            <div className="kpi-value">7</div>
            <div className="kpi-status text-amber-400">
              <span className="status-indicator-dot" />
              <span>Aguardando processamento</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: ESTE MÊS (Emerald) */}
        <div
          onClick={() => {
            showToast('32 devoluções processadas este mês');
          }}
          className="kpi-card kpi-emerald group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ESTE MÊS</span>
            <div className="kpi-value">32</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot" />
              <span>+8,6% comparado ao mês anterior</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: VALOR DEVOLVIDO (Purple) */}
        <div
          onClick={() => {
            showToast('Valor total recuperado ao estoque: R$ 18.450,00');
          }}
          className="kpi-card kpi-rose group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">VALOR DEVOLVIDO</span>
            <div className="kpi-value text-xl xl:text-2xl">R$ 18.450,00</div>
            <div className="kpi-status text-emerald-400">
              <span className="status-indicator-dot text-emerald-400" />
              <span>Valor estimado recuperado</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-rose">
            <DollarSign className="w-6 h-6" />
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
            placeholder="Buscar saída, material ou responsável..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
          />
        </div>

        {/* Filter Controls */}
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
                <option value="Processada" className="bg-slate-900 text-white">Processada</option>
                <option value="Em análise" className="bg-slate-900 text-white">Em análise</option>
                <option value="Cancelada" className="bg-slate-900 text-white">Cancelada</option>
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
                <option value="Obra Épsilon" className="bg-slate-900 text-white">Obra Épsilon</option>
              </select>
            </div>

            {/* Responsável Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">Responsável</span>
              <select
                value={responsavelFiltro}
                onChange={(e) => setResponsavelFiltro(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-slate-900 text-white">Todos</option>
                <option value="Carlos Mendes" className="bg-slate-900 text-white">Carlos Mendes</option>
                <option value="Mariana Costa" className="bg-slate-900 text-white">Mariana Costa</option>
                <option value="João Oliveira" className="bg-slate-900 text-white">João Oliveira</option>
                <option value="Fernanda Lima" className="bg-slate-900 text-white">Fernanda Lima</option>
                <option value="Rafael Santos" className="bg-slate-900 text-white">Rafael Santos</option>
              </select>
            </div>

            {/* Período Pill */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01/05/2024 - 31/05/2024</span>
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
                setStatusFiltro('Todos');
                setObraFiltro('Todas');
                setResponsavelFiltro('Todos');
                showToast('Filtros limpos');
              }}
              className="px-3 py-2 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Limpar
            </button>

            {/* + Nova Devolução Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nova devolução</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. UPPER TABLE: DEVOLUÇÕES REGISTRADAS */}
      <div className="hud-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/60 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">ID</th>
                <th className="py-3.5 px-3 font-semibold">Saída original</th>
                <th className="py-3.5 px-3 font-semibold">Responsável</th>
                <th className="py-3.5 px-3 font-semibold">Obra</th>
                <th className="py-3.5 px-3 font-semibold text-center">Itens</th>
                <th className="py-3.5 px-3 font-semibold">Data</th>
                <th className="py-3.5 px-3 font-semibold">Motivo</th>
                <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                <th className="py-3.5 px-3 text-right pr-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {devolucoesFiltradas.map((dev) => {
                const isSelected = selectedDev.id === dev.id;

                return (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDev(dev)}
                    className={`hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-slate-800/70 border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.12)]'
                        : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{dev.id}</td>

                    {/* Saída Original */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-300">{dev.saidaOriginal}</td>

                    {/* Responsável */}
                    <td className="py-3 px-3 font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {dev.responsavel}
                    </td>

                    {/* Obra */}
                    <td className="py-3 px-3 text-slate-300">{dev.obra}</td>

                    {/* Itens */}
                    <td className="py-3 px-3 font-mono text-center text-slate-300">{dev.itensCount}</td>

                    {/* Data */}
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{dev.data}</td>

                    {/* Motivo */}
                    <td className="py-3 px-3 text-slate-300 text-[11px]">{dev.motivo}</td>

                    {/* Status Pill */}
                    <td className="py-3 px-3 text-center">
                      {dev.status === 'Pendente' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Pendente</span>
                        </span>
                      )}
                      {dev.status === 'Processada' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Processada</span>
                        </span>
                      )}
                      {dev.status === 'Em análise' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                          <span>Em análise</span>
                        </span>
                      )}
                      {dev.status === 'Cancelada' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                          <span>Cancelada</span>
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDev(dev);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Ver detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Opções de ${dev.id}`);
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
            <span>1-5 de 184</span>
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

      {/* 5. LOWER OPERATIONAL SECTION: SPLIT CARDS (DEVOLUÇÃO SELECIONADA + NOVA DEVOLUÇÃO + IMPACTO + WORKFLOW) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* CARD 1: DEVOLUÇÃO SELECIONADA & MATERIAIS (6 COLS ON XL) */}
        <div className="xl:col-span-6 hud-card p-5 space-y-4 shadow-2xl border border-cyan-500/40">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Devolução selecionada</div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-base font-black text-white font-mono">{selectedDev.id}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                  {selectedDev.status}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-[#081528]/80 p-3 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 uppercase font-semibold block">Saída original</span>
              <strong className="text-white font-mono">{selectedDev.saidaOriginal}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block">Data</span>
              <strong className="text-slate-300 font-mono">{selectedDev.dataSaida}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block">Responsável</span>
              <strong className="text-white truncate block">{selectedDev.responsavel}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold block">Obra</span>
              <strong className="text-cyan-400 truncate block">{selectedDev.obra}</strong>
            </div>
          </div>

          {/* Subtable: Materiais da devolução */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              Materiais da devolução
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <th className="pb-2 font-semibold">Material</th>
                    <th className="pb-2 font-semibold">Entregue</th>
                    <th className="pb-2 font-semibold">Já devolvido</th>
                    <th className="pb-2 font-semibold">Disponível</th>
                    <th className="pb-2 font-semibold text-center">Nova devolução</th>
                    <th className="pb-2 font-semibold text-right">Restante possível</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {selectedDev.materiais.map((mat, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedMaterialIndex(idx);
                        setQtdADevolver(String(mat.novaDevolucao));
                      }}
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                        selectedMaterialIndex === idx ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{mat.icon}</span>
                          <div>
                            <div className="font-bold text-white">{mat.nome}</div>
                            <div className="text-[10px] text-slate-500">{mat.unidade}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-300">
                        {mat.entregue} {mat.unidade}
                      </td>
                      <td className="py-2.5 font-mono text-slate-400">
                        {mat.jaDevolvido} {mat.unidade}
                      </td>
                      <td className="py-2.5">
                        <div className="font-mono font-bold text-emerald-400">
                          {mat.disponivel} {mat.unidade}
                        </div>
                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(mat.disponivel / mat.entregue) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/30">
                          {mat.novaDevolucao} {mat.unidade}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-right text-slate-400">
                        {mat.restante} {mat.unidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CARD 2: NOVA DEVOLUÇÃO FORM (3 COLS ON XL) */}
        <div className="xl:col-span-3 hud-card p-5 space-y-3.5 shadow-2xl border border-blue-500/40 text-xs">
          <div className="font-bold text-white tracking-wide border-b border-slate-800 pb-2">
            Nova devolução
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Material</label>
            <div className="relative">
              <select
                value={selectedMaterialIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedMaterialIndex(idx);
                  setQtdADevolver(String(selectedDev.materiais[idx]?.novaDevolucao || 10));
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6"
              >
                {selectedDev.materiais.map((m, i) => (
                  <option key={i} value={i}>
                    {m.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Quantidade a devolver</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={qtdADevolver}
                onChange={(e) => setQtdADevolver(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
              <span className="font-mono text-slate-400 font-bold">{currentMat.unidade}</span>
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
              Máximo permitido: {currentMat.disponivel} {currentMat.unidade}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Motivo</label>
            <div className="relative">
              <select
                value={motivoSelecionado}
                onChange={(e) => setMotivoSelecionado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="Material não utilizado">Material não utilizado</option>
                <option value="Excedente">Excedente</option>
                <option value="Obra encerrada">Obra encerrada</option>
                <option value="Material danificado">Material danificado</option>
                <option value="Material incompatível">Material incompatível</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Observação</label>
            <textarea
              rows={2}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              placeholder="Observações adicionais (opcional)..."
              maxLength={200}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none text-xs"
            />
            <div className="text-[9px] text-slate-500 text-right">{obsText.length}/200</div>
          </div>
        </div>

        {/* CARD 3 & 4: IMPACTO NO ESTOQUE + CUSTO HISTÓRICO & WORKFLOW (3 COLS ON XL) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Impacto no Estoque Box */}
          <div className="hud-card p-4 space-y-2.5 border border-emerald-500/40 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white text-[11px] uppercase">Impacto no estoque ⓘ</span>
            </div>

            <div className="text-[11px] text-slate-400">Material</div>
            <div className="font-bold text-white text-xs">{currentMat.nome}</div>

            <div className="space-y-1 bg-[#081528]/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estoque atual:</span>
                <span className="font-mono font-bold text-cyan-400">{estoqueAtual} {currentMat.unidade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Devolução:</span>
                <span className="font-mono font-bold text-emerald-400">+{qtdDevNum} {currentMat.unidade}</span>
              </div>
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between font-bold">
                <span className="text-white">Novo estoque:</span>
                <span className="font-mono text-emerald-400 font-black">{novoEstoque} {currentMat.unidade}</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Entregue originalmente:</span>
                <span className="font-mono text-slate-200">{currentMat.entregue} {currentMat.unidade}</span>
              </div>
              <div className="flex justify-between">
                <span>Já devolvido:</span>
                <span className="font-mono text-slate-200">{currentMat.jaDevolvido} {currentMat.unidade}</span>
              </div>
              <div className="flex justify-between">
                <span>Disponível para devolver:</span>
                <span className="font-mono text-slate-200">{currentMat.disponivel} {currentMat.unidade}</span>
              </div>
              <div className="flex justify-between">
                <span>Nova devolução:</span>
                <span className="font-mono text-emerald-400 font-bold">{qtdDevNum} {currentMat.unidade}</span>
              </div>
              <div className="flex justify-between">
                <span>Restante possível:</span>
                <span className="font-mono text-slate-200">{currentMat.disponivel - qtdDevNum} {currentMat.unidade}</span>
              </div>
            </div>
          </div>

          {/* Custo Histórico & Workflow Box */}
          <div className="hud-card p-4 space-y-3 border border-purple-500/40 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white text-[11px] uppercase">Custo histórico ⓘ</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Custo histórico:</span>
              <span className="font-mono font-bold text-slate-200">
                R$ {custoHistorico.toFixed(2).replace('.', ',')} / {currentMat.unidade}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Valor recuperado:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                R$ {valorRecuperado.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Workflow Stepper */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
              <div className="font-bold text-white uppercase text-[10px] mb-1">Workflow da devolução</div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>✓</span>
                <span>Saída original</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>✓</span>
                <span>Selecionar materiais</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">
                  3
                </span>
                <span>Definir quantidade</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>○</span>
                <span>4 Revisão</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>○</span>
                <span>5 Confirmada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM BAR: REVISÃO DA DEVOLUÇÃO */}
      <div className="hud-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-500/50 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs w-full md:w-auto">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Material</span>
            <strong className="text-white">{currentMat.nome}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Quantidade</span>
            <strong className="text-cyan-400 font-mono">
              {qtdDevNum} {currentMat.unidade}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Motivo</span>
            <strong className="text-slate-300">{motivoSelecionado}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Estoque atual</span>
            <strong className="text-slate-300 font-mono">
              {estoqueAtual} {currentMat.unidade}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Estoque após devolução</span>
            <strong className="text-emerald-400 font-mono font-bold">
              {novoEstoque} {currentMat.unidade}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Valor recuperado</span>
            <strong className="text-emerald-400 font-mono font-black text-sm">
              R$ {valorRecuperado.toFixed(2).replace('.', ',')}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-auto">
          <button
            onClick={() => showToast('Revisão cancelada')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmarDevolucao}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirmar devolução</span>
          </button>
        </div>
      </div>

      {/* 7. MODAL NOVA DEVOLUÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="hud-card w-full max-w-lg p-6 border border-blue-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <h3 className="text-base font-bold text-white">Registrar Nova Devolução</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNovaDevolucao} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Saída de Origem *</label>
                <input
                  type="text"
                  defaultValue="EXT-815"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material</label>
                  <select
                    value={selectedMaterialIndex}
                    onChange={(e) => setSelectedMaterialIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {selectedDev.materiais.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade a Devolver *</label>
                  <input
                    type="number"
                    value={qtdADevolver}
                    onChange={(e) => setQtdADevolver(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo da Devolução *</label>
                <select
                  value={motivoSelecionado}
                  onChange={(e) => setMotivoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Material não utilizado">Material não utilizado</option>
                  <option value="Excedente">Excedente</option>
                  <option value="Obra encerrada">Obra encerrada</option>
                  <option value="Material danificado">Material danificado</option>
                  <option value="Material incompatível">Material incompatível</option>
                </select>
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
                  Registrar Devolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-cyan-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
