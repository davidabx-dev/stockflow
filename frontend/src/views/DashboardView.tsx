'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Boxes,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { api } from '@/lib/api';
import { Material, Requisicao, MaterialMinimoReport, PosicaoValorReport } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [posicaoValor, setPosicaoValor] = useState<PosicaoValorReport | null>(null);
  const [abaixoMinimo, setAbaixoMinimo] = useState<MaterialMinimoReport[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [mats, reqs, valorEstoque, minItems] = await Promise.all([
        api.get<Material[]>('/materiais'),
        api.get<Requisicao[]>('/requisicoes'),
        api.get<PosicaoValorReport>('/relatorios/posicao-valor-estoque').catch(() => null),
        api.get<MaterialMinimoReport[]>('/relatorios/materiais-minimo').catch(() => []),
      ]);
      setMateriais(mats);
      setRequisicoes(reqs);
      setPosicaoValor(valorEstoque);
      setAbaixoMinimo(minItems);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const valorTotalRs = posicaoValor?.valor_geral_estoque_rs || 0;
  const reqsPendentes = requisicoes.filter((r) => r.status === 'PENDENTE');

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-[#111622] to-[#161c2d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Olá, {user?.nome.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistema StockFlow operando com integridade transacional e custo médio ponderado móvel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('requisicoes')}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Requisição
          </button>
          {user?.role !== 'SOLICITANTE' && (
            <button
              onClick={() => onNavigate('entradas')}
              className="btn-secondary text-xs"
            >
              Dar Entrada de NF
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Valor Total em Estoque"
          value={`R$ ${valorTotalRs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Valorização pelo custo médio vigente"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatsCard
          title="Itens Cadastrados"
          value={materiais.length}
          subtitle="SKUs ativos no almoxarifado"
          icon={Boxes}
          colorVariant="blue"
        />
        <StatsCard
          title="Requisições Pendentes"
          value={reqsPendentes.length}
          subtitle="Aguardando aprovação de saldo"
          icon={Clock}
          colorVariant="amber"
        />
        <StatsCard
          title="Abaixo do Mínimo"
          value={abaixoMinimo.length}
          subtitle="Materiais que exigem reposição"
          icon={AlertTriangle}
          colorVariant="rose"
        />
      </div>

      {/* Grid: Requisições Recentes & Alertas de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fila de Requisições Recentes */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e2638] mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Requisições Recentes
            </h3>
            <button
              onClick={() => onNavigate('requisicoes')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {requisicoes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhuma requisição registrada.</p>
          ) : (
            <div className="space-y-3">
              {requisicoes.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-lg bg-[#0b0e17] border border-[#1e2638] flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{req.numero}</span>
                      <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {req.solicitante?.nome || 'Solicitante'} • {req.itens.length} {req.itens.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(req.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de Estoque Mínimo */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e2638] mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Alertas de Estoque Mínimo
            </h3>
            <button
              onClick={() => onNavigate('relatorios')}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Relatório de Custos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {abaixoMinimo.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
              <span>Todos os materiais estão acima do estoque mínimo estabelecido.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {abaixoMinimo.slice(0, 5).map((item) => (
                <div
                  key={item.material_id}
                  className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{item.nome}</p>
                    <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-400">
                      {item.quantidade_fisica} {item.unidade} <span className="text-slate-500 font-normal">/ Mín: {item.estoque_minimo}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Falta: <strong className="text-rose-300">{item.defasagem_minima}</strong> {item.unidade}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
