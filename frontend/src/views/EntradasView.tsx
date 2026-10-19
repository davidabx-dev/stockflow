'use client';

import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Calendar,
  DollarSign,
  Clock,
  Download,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  MoreVertical,
  ArrowDown,
  CheckCircle2,
  Info,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MaterialOption {
  id: string;
  sku: string;
  nome: string;
  unidade: string;
  estoqueAtual: number;
  custoMedioAtual: number;
}

interface EntradaRecord {
  id: string;
  data: string;
  material: string;
  codigo: string;
  quantidade: string;
  valor: string;
  localizacao: string;
  status: 'Registrada' | 'Em Análise' | 'Cancelada';
}

const mockMaterials: MaterialOption[] = [
  { id: '1', sku: 'MAT-0001', nome: 'Cabo PP 3x2,5mm', unidade: 'm', estoqueAtual: 380, custoMedioAtual: 8.10 },
  { id: '2', sku: 'MAT-0002', nome: 'Disjuntor DIN 32A', unidade: 'un', estoqueAtual: 50, custoMedioAtual: 24.90 },
  { id: '3', sku: 'MAT-0003', nome: 'Eletroduto PVC 25mm', unidade: 'm', estoqueAtual: 100, custoMedioAtual: 6.80 },
  { id: '4', sku: 'MAT-0004', nome: 'Tinta Acrílica Branca 18L', unidade: 'gal', estoqueAtual: 20, custoMedioAtual: 42.00 },
  { id: '5', sku: 'MAT-0005', nome: 'Cimento CP II 50kg', unidade: 'sc', estoqueAtual: 80, custoMedioAtual: 32.50 },
  { id: '6', sku: 'MAT-0006', nome: 'Parafuso 4,2x32mm', unidade: 'un', estoqueAtual: 1200, custoMedioAtual: 0.15 },
];

const initialRecords: EntradaRecord[] = [
  { id: '1', data: '31/05/2024 14:22', material: 'Cabo PP 3x2,5mm', codigo: 'MAT-0001', quantidade: '500 m', valor: 'R$ 4.200,00', localizacao: 'Almoxarifado A', status: 'Registrada' },
  { id: '2', data: '30/05/2024 09:15', material: 'Tinta Acrílica Branca 18L', codigo: 'MAT-0004', quantidade: '20 gal', valor: 'R$ 840,00', localizacao: 'Almoxarifado B', status: 'Registrada' },
  { id: '3', data: '29/05/2024 16:40', material: 'Disjuntor DIN 32A', codigo: 'MAT-0002', quantidade: '50 un', valor: 'R$ 1.245,00', localizacao: 'Almoxarifado A', status: 'Registrada' },
  { id: '4', data: '28/05/2024 11:08', material: 'Eletroduto PVC 25mm', codigo: 'MAT-0003', quantidade: '100 m', valor: 'R$ 680,00', localizacao: 'Almoxarifado C', status: 'Registrada' },
  { id: '5', data: '27/05/2024 08:55', material: 'Parafuso 4,2x32mm', codigo: 'MAT-0006', quantidade: '300 un', valor: 'R$ 45,00', localizacao: 'Almoxarifado A', status: 'Registrada' },
];

export const EntradasView: React.FC = () => {
  const { hasRole } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [records, setRecords] = useState<EntradaRecord[]>(initialRecords);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  // Form State
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(mockMaterials[0]);
  const [quantidade, setQuantidade] = useState<string>('500');
  const [unidade, setUnidade] = useState<string>('m');
  const [custoUnitario, setCustoUnitario] = useState<string>('8.40');
  const [docFiscal, setDocFiscal] = useState<string>('NF-e 000123');
  const [serie, setSerie] = useState<string>('1');
  const [dataDoc, setDataDoc] = useState<string>('2024-05-31');
  const [fornecedor, setFornecedor] = useState<string>('Fornecedor ABC Ltda');
  const [localizacao, setLocalizacao] = useState<string>('Almoxarifado A');
  const [observacao, setObservacao] = useState<string>('Entrada referente à compra de cabos para manutenção elétrica.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Real-time calculations
  const qtdNum = Number(quantidade) || 0;
  const custoNum = Number(custoUnitario) || 0;
  const estoqueAtual = selectedMaterial.estoqueAtual;
  const custoMedioAtual = selectedMaterial.custoMedioAtual;
  const estoqueApos = estoqueAtual + qtdNum;
  const valorTotalEntrada = qtdNum * custoNum;

  // Moving Average Cost Calculation
  let novoCustoMedio = custoMedioAtual;
  if (estoqueApos > 0) {
    novoCustoMedio = (estoqueAtual * custoMedioAtual + qtdNum * custoNum) / estoqueApos;
  }

  const handleMaterialChange = (matId: string) => {
    const mat = mockMaterials.find((m) => m.id === matId) || mockMaterials[0];
    setSelectedMaterial(mat);
    setUnidade(mat.unidade);
    setCustoUnitario(mat.custoMedioAtual.toFixed(2));
  };

  const handleRevisar = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setIsSubmitting(true);
      setTimeout(() => {
        const newRecord: EntradaRecord = {
          id: String(Date.now()),
          data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          material: selectedMaterial.nome,
          codigo: selectedMaterial.sku,
          quantidade: `${qtdNum} ${unidade}`,
          valor: `R$ ${valorTotalEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          localizacao,
          status: 'Registrada',
        };
        setRecords([newRecord, ...records]);
        setIsSubmitting(false);
        setCurrentStep(4);
        showToast(`Entrada de ${selectedMaterial.nome} registrada com sucesso!`);
      }, 600);
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setQuantidade('500');
    setCustoUnitario('8.40');
    setDocFiscal('NF-e 000123');
    setObservacao('Entrada referente à compra de cabos para manutenção elétrica.');
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP TITLE ROW & EXPORT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Entradas</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registre e acompanhe entradas de materiais.
          </p>
        </div>

        <button
          onClick={() => showToast('Exportando relatório de entradas em PDF / Excel...')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#081524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar</span>
        </button>
      </div>

      {/* 2. TOP 4 SUMMARY KPI CARDS (THEMED IN FITSTRONG GLASS / BLUE CYBER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Entradas registradas */}
        <div
          onClick={() => showToast('Exibindo todas as 128 entradas registradas')}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ENTRADAS REGISTRADAS</span>
            <div className="kpi-value">128</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Total de entradas</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">+14,6% vs mês anterior</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Entradas este mês */}
        <div
          onClick={() => showToast('Exibindo 28 entradas do mês corrente')}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ENTRADAS ESTE MÊS</span>
            <div className="kpi-value">28</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>No mês atual</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">+8,3% vs mês anterior</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valor movimentado */}
        <div
          onClick={() => showToast('Valor financeiro movimentado este mês: R$ 18.540,50')}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">VALOR MOVIMENTADO</span>
            <div className="kpi-value text-xl xl:text-2xl">R$ 18.540,50</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Total no mês</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">+12,7% vs mês anterior</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Última entrada */}
        <div
          onClick={() => showToast('Última entrada realizada há 2 horas por Administrador')}
          className="kpi-card kpi-cyan group cursor-pointer"
        >
          <div className="kpi-content">
            <span className="kpi-title">ÚLTIMA ENTRADA</span>
            <div className="kpi-value text-lg xl:text-xl">31/05/2024</div>
            <div className="kpi-status text-cyan-400">
              <span className="status-indicator-dot" />
              <span>Há 2 horas</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Por Administrador</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: WIZARD FORM (Nova Entrada) + IMPACT ON STOCK PREVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: NOVA ENTRADA WIZARD (8 COLS ON XL) */}
        <div className="xl:col-span-8 hud-card p-5 lg:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-wide">Nova entrada</h2>
          </div>

          {/* Wizard Step Tracker */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 text-xs">
            {/* Step 1: Material */}
            <div
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2.5 cursor-pointer flex-shrink-0 ${
                currentStep === 1 ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 1
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                1
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white">Material</div>
                <div className="text-[10px] text-slate-400">Selecione o material</div>
              </div>
            </div>

            <span className="text-slate-600 flex-shrink-0">→</span>

            {/* Step 2: Dados */}
            <div
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2.5 cursor-pointer flex-shrink-0 ${
                currentStep === 2 ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 2
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white">Dados</div>
                <div className="text-[10px] text-slate-400">Informações da entrada</div>
              </div>
            </div>

            <span className="text-slate-600 flex-shrink-0">→</span>

            {/* Step 3: Revisão */}
            <div
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2.5 cursor-pointer flex-shrink-0 ${
                currentStep === 3 ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 3
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white">Revisão</div>
                <div className="text-[10px] text-slate-400">Revise e confirme</div>
              </div>
            </div>

            <span className="text-slate-600 flex-shrink-0">→</span>

            {/* Step 4: Concluído */}
            <div
              className={`flex items-center gap-2.5 flex-shrink-0 ${
                currentStep === 4 ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 4
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,245,155,0.6)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                4
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white">Concluído</div>
                <div className="text-[10px] text-slate-400">Entrada registrada</div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          {currentStep < 4 ? (
            <form onSubmit={handleRevisar} className="space-y-4 text-xs">
              {/* Row 1: Material, Quantidade, Unidade, Custo Unitário */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                {/* Material Select Combobox */}
                <div className="sm:col-span-5">
                  <label className="block text-slate-300 font-semibold mb-1">Material *</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedMaterial.id}
                      onChange={(e) => handleMaterialChange(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-medium focus:border-blue-500/60 focus:outline-none cursor-pointer appearance-none"
                    >
                      {mockMaterials.map((m) => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                          {m.nome}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Quantidade */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade *</label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-blue-500/60 focus:outline-none"
                    required
                  />
                </div>

                {/* Unidade */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Unidade *</label>
                  <div className="relative">
                    <select
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono focus:border-blue-500/60 focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="m">m</option>
                      <option value="un">un</option>
                      <option value="gal">gal</option>
                      <option value="sc">sc</option>
                      <option value="kg">kg</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Custo Unitário */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Custo unitário *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoUnitario}
                    onChange={(e) => setCustoUnitario(e.target.value)}
                    placeholder="8,40"
                    className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono font-bold focus:border-blue-500/60 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Documento / NF, Série, Data, Fornecedor */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                {/* Documento / NF */}
                <div className="sm:col-span-4">
                  <label className="block text-slate-300 font-semibold mb-1">Documento / Nota fiscal *</label>
                  <input
                    type="text"
                    value={docFiscal}
                    onChange={(e) => setDocFiscal(e.target.value)}
                    placeholder="NF-e 000123"
                    className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono focus:border-blue-500/60 focus:outline-none"
                    required
                  />
                </div>

                {/* Série */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Série</label>
                  <input
                    type="text"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono focus:border-blue-500/60 focus:outline-none"
                  />
                </div>

                {/* Data do documento */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">Data do documento *</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dataDoc}
                      onChange={(e) => setDataDoc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white font-mono focus:border-blue-500/60 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Fornecedor */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">Fornecedor</label>
                  <div className="relative">
                    <select
                      value={fornecedor}
                      onChange={(e) => setFornecedor(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white focus:border-blue-500/60 focus:outline-none cursor-pointer appearance-none truncate pr-6"
                    >
                      <option value="Fornecedor ABC Ltda">Fornecedor ABC Ltda</option>
                      <option value="Distribuidora Elétrica">Distribuidora Elétrica</option>
                      <option value="Tubos & Conexões Brasil">Tubos & Conexões Brasil</option>
                      <option value="Tintas Premium SA">Tintas Premium SA</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Localização */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Localização *</label>
                <div className="relative max-w-sm">
                  <select
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white focus:border-blue-500/60 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="Almoxarifado A">Almoxarifado A</option>
                    <option value="Almoxarifado B">Almoxarifado B</option>
                    <option value="Almoxarifado C">Almoxarifado C</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Row 4: Observação */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observação</label>
                <textarea
                  rows={3}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Observações complementares sobre esta entrada..."
                  className="w-full px-3 py-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none resize-none"
                />
              </div>

              {/* Buttons Row */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>{currentStep === 3 ? 'Confirmar entrada' : 'Revisar entrada'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Step 4 Completed Screen */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,245,155,0.4)] animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Entrada Registrada com Sucesso!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {qtdNum} {unidade} de {selectedMaterial.nome} foram integrados ao estoque do{' '}
                  {localizacao}.
                </p>
              </div>
              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                + Registrar Outra Entrada
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: IMPACTO NO ESTOQUE (4 COLS ON XL) */}
        <div className="xl:col-span-4 hud-card p-5 space-y-5 shadow-2xl border border-blue-500/40">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-wide">Impacto no estoque</h2>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Material Name */}
          <div>
            <div className="text-[11px] text-slate-400">Material</div>
            <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
              {selectedMaterial.nome}
            </div>
          </div>

          {/* Downward Impact Flow */}
          <div className="space-y-2 bg-[#081528]/90 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
            {/* Estoque atual */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Estoque atual</div>
              <div className="text-lg font-bold text-blue-400 font-mono">
                {estoqueAtual} {unidade}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="py-0.5 text-slate-500">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Nova entrada */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Nova entrada</div>
              <div className="text-lg font-bold text-blue-400 font-mono">
                +{qtdNum} {unidade}
              </div>
            </div>

            {/* Down Arrow */}
            <div className="py-0.5 text-slate-500">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Estoque após lançamento */}
            <div className="pt-1 border-t border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Estoque após lançamento</div>
              <div className="text-xl font-black text-emerald-400 font-mono drop-shadow-[0_0_10px_rgba(0,245,155,0.4)]">
                {estoqueApos} {unidade}
              </div>
            </div>
          </div>

          {/* Cost Moving Average Breakdown */}
          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Custo médio atual</span>
              <span className="font-mono text-slate-200">
                R$ {custoMedioAtual.toFixed(2).replace('.', ',')} / {unidade}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Custo da entrada</span>
              <span className="font-mono text-slate-200">
                R$ {custoNum.toFixed(2).replace('.', ',')} / {unidade}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300 font-semibold">Novo custo médio</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                R$ {novoCustoMedio.toFixed(2).replace('.', ',')} / {unidade}
              </span>
            </div>
          </div>

          {/* Validation Status */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Entrada válida e impacta positivamente o estoque.</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: ÚLTIMAS ENTRADAS TABLE */}
      <div className="hud-card overflow-hidden">
        {/* Table Header */}
        <div className="p-4 pb-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide">Últimas entradas</h2>
          <span className="text-xs font-mono text-cyan-400 font-semibold">5 lançamentos recentes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-800/80 bg-slate-950/60 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-3 font-semibold">Material</th>
                <th className="py-3 px-3 font-semibold">Código</th>
                <th className="py-3 px-3 font-semibold">Quantidade</th>
                <th className="py-3 px-3 font-semibold">Valor</th>
                <th className="py-3 px-3 font-semibold">Localização</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 text-right pr-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{rec.data}</td>
                  <td className="py-3 px-3 font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {rec.material}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">{rec.codigo}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">{rec.quantidade}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-300">{rec.valor}</td>
                  <td className="py-3 px-3 text-slate-400">{rec.localizacao}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast(`Visualizando lançamento ${rec.codigo}`)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Ver detalhes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showToast(`Opções da entrada ${rec.codigo}`)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Mostrar Mais */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <button
            onClick={() => {
              setShowMore(!showMore);
              showToast('Carregando mais entradas registradas...');
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>{showMore ? 'Mostrar menos' : 'Mostrar mais'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 hud-card px-4 py-3 border border-blue-400/50 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-xs font-semibold text-slate-200">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
