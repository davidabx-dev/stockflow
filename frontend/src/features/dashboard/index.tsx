'use client';

import React from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { StockIndicators } from '@/components/dashboard/StockIndicators';
import { StockDistribution } from '@/components/dashboard/StockDistribution';

interface DashboardFeatureProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardFeature({ onNavigate }: DashboardFeatureProps) {
  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: VALOR EM ESTOQUE (Emerald Green) */}
        <KpiCard
          title="VALOR EM ESTOQUE"
          value="R$ 148.540,00"
          statusText="8,4% este mês"
          variant="emerald"
          onClick={() => onNavigate?.('relatorios')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
        />

        {/* Card 2: ITENS CADASTRADOS (Cyan Blue) */}
        <KpiCard
          title="ITENS CADASTRADOS"
          value="1.248"
          statusText="12 itens novos"
          variant="cyan"
          onClick={() => onNavigate?.('materiais')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
        />

        {/* Card 3: REQUISIÇÕES PENDENTES (Amber Gold) */}
        <KpiCard
          title="REQUISIÇÕES PENDENTES"
          value="23"
          statusText="5 aguardando aprovação"
          variant="amber"
          onClick={() => onNavigate?.('requisicoes')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 12h6" />
              <path d="M9 16h6" />
            </svg>
          }
        />

        {/* Card 4: ABAIXO DO MÍNIMO (Rose Red) */}
        <KpiCard
          title="ABAIXO DO MÍNIMO"
          value="17"
          statusText="3 itens críticos"
          variant="rose"
          onClick={() => onNavigate?.('materiais')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      {/* Middle Section: Indicadores com Mini-Ondas & Donut 3D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <StockIndicators />
        </div>
        <div className="lg:col-span-5">
          <StockDistribution />
        </div>
      </div>

      {/* LOWER GRID: OPERAÇÕES INTEGRADAS DOS MÓDULOS STOCKFLOW */}
      <div className="space-y-6">
        {/* ROW 1: OPERAÇÕES PRINCIPAIS (REQUISIÇÕES & MATERIAIS CRÍTICOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CARD 1: REQUISIÇÕES AGUARDANDO APROVAÇÃO (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Requisições aguardando aprovação
                    </h2>
                    <p className="text-[11px] text-slate-400">5 solicitações pendentes de liberação</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/25 rounded-full">
                  23 no fluxo
                </span>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                      <th className="pb-2.5 font-semibold">ID</th>
                      <th className="pb-2.5 font-semibold">Solicitante</th>
                      <th className="pb-2.5 font-semibold">Obra</th>
                      <th className="pb-2.5 font-semibold text-center">Itens</th>
                      <th className="pb-2.5 font-semibold text-center">Prioridade</th>
                      <th className="pb-2.5 font-semibold text-right">Status</th>
                      <th className="pb-2.5 font-semibold text-right pr-1">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-2.5 font-mono text-cyan-400 font-bold">REQ-1258</td>
                      <td className="py-2.5 text-white font-medium">Carlos Mendes</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Obra Alpha</td>
                      <td className="py-2.5 text-center font-mono text-slate-300">5</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span>↑ Alta</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Pendente</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right pr-1">
                        <Link href="/requisicoes" className="p-1 text-slate-400 hover:text-cyan-400 transition-colors inline-block" title="Visualizar">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-2.5 font-mono text-cyan-400 font-bold">REQ-1257</td>
                      <td className="py-2.5 text-white font-medium">Mariana Costa</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Obra Beta</td>
                      <td className="py-2.5 text-center font-mono text-slate-300">8</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span>→ Média</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>Aprovada</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right pr-1">
                        <Link href="/requisicoes" className="p-1 text-slate-400 hover:text-cyan-400 transition-colors inline-block" title="Visualizar">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-2.5 font-mono text-cyan-400 font-bold">REQ-1256</td>
                      <td className="py-2.5 text-white font-medium">João Oliveira</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Obra Gama</td>
                      <td className="py-2.5 text-center font-mono text-slate-300">3</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span>→ Média</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <span>Separando</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right pr-1">
                        <Link href="/requisicoes" className="p-1 text-slate-400 hover:text-cyan-400 transition-colors inline-block" title="Visualizar">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-2.5 font-mono text-cyan-400 font-bold">REQ-1255</td>
                      <td className="py-2.5 text-white font-medium">Fernanda Lima</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Obra Delta</td>
                      <td className="py-2.5 text-center font-mono text-slate-300">6</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>↓ Baixa</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>Entregue</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right pr-1">
                        <Link href="/requisicoes" className="p-1 text-slate-400 hover:text-cyan-400 transition-colors inline-block" title="Visualizar">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/requisicoes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver todas as 42 requisições</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/requisicoes" className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all">
                + Nova Requisição
              </Link>
            </div>
          </div>

          {/* CARD 2: MATERIAIS CRÍTICOS & CONTROLE DE ESTOQUE (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Materiais críticos
                    </h2>
                    <p className="text-[11px] text-slate-400">17 itens com saldo abaixo do ponto de reposição</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full">
                  3 urgentes
                </span>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                      <th className="pb-2.5 font-semibold">Material</th>
                      <th className="pb-2.5 font-semibold">Código</th>
                      <th className="pb-2.5 font-semibold">Categoria</th>
                      <th className="pb-2.5 font-semibold">Disponível / Mínimo</th>
                      <th className="pb-2.5 font-semibold text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-white font-medium">
                        <div className="font-semibold text-slate-100">Cabo PP 3x2,5mm</div>
                        <div className="text-[10px] text-slate-400">Cabo elétrico flexível</div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">MAT-0001</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                          Elétrico
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-rose-400 font-bold">38 m</span>
                          <span className="text-slate-500 text-[10px]">/ 100 m</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span>Crítico</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-white font-medium">
                        <div className="font-semibold text-slate-100">Disjuntor DIN 32A</div>
                        <div className="text-[10px] text-slate-400">Curva C bipolar</div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">MAT-0002</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                          Elétrico
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-rose-400 font-bold">2 un</span>
                          <span className="text-slate-500 text-[10px]">/ 10 un</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span>Crítico</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-white font-medium">
                        <div className="font-semibold text-slate-100">Eletroduto 3/4"</div>
                        <div className="text-[10px] text-slate-400">PVC Rígido 3m</div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">MAT-0003</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-md">
                          Hidráulico
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold">15 m</span>
                          <span className="text-slate-500 text-[10px]">/ 50 m</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span>Atenção</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/materiais" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver todos os 17 materiais críticos</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/materiais" className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all">
                Gerar Pedido de Compra
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: ENTRADAS RECENTES & CONFERÊNCIA DE INVENTÁRIO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CARD 3: ÚLTIMAS ENTRADAS DE MATERIAIS (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Últimas entradas
                    </h2>
                    <p className="text-[11px] text-slate-400">28 recebimentos no mês • Total: R$ 18.540,50</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  +14,6% vs mês ant.
                </span>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                      <th className="pb-2.5 font-semibold">Data/Hora</th>
                      <th className="pb-2.5 font-semibold">Material</th>
                      <th className="pb-2.5 font-semibold">Qtd</th>
                      <th className="pb-2.5 font-semibold">Valor Total</th>
                      <th className="pb-2.5 font-semibold">Almoxarifado</th>
                      <th className="pb-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">31/05 14:22</td>
                      <td className="py-2.5 text-white font-medium">
                        <div>Cabo PP 3x2,5mm</div>
                        <div className="text-[10px] text-slate-500 font-mono">MAT-0001</div>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">+500 m</td>
                      <td className="py-2.5 font-mono text-slate-300">R$ 4.200,00</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Almoxarifado A</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>Registrada</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">30/05 09:15</td>
                      <td className="py-2.5 text-white font-medium">
                        <div>Tinta Acrílica Branca 18L</div>
                        <div className="text-[10px] text-slate-500 font-mono">MAT-0004</div>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">+20 gal</td>
                      <td className="py-2.5 font-mono text-slate-300">R$ 840,00</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Almoxarifado B</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>Registrada</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">29/05 16:40</td>
                      <td className="py-2.5 text-white font-medium">
                        <div>Disjuntor DIN 32A</div>
                        <div className="text-[10px] text-slate-500 font-mono">MAT-0002</div>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">+50 un</td>
                      <td className="py-2.5 font-mono text-slate-300">R$ 1.245,00</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">Almoxarifado A</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span>Registrada</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/entradas" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver histórico de entradas</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/entradas" className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all">
                + Nova Entrada
              </Link>
            </div>
          </div>

          {/* CARD 4: CONFERÊNCIA DO INVENTÁRIO (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Conferência do inventário
                    </h2>
                    <p className="text-[11px] text-slate-400">Ciclo INV-0007 em andamento • 986 de 1.248 itens</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">79%</span>
                  <span className="text-[10px] text-slate-500 block">Concluído</span>
                </div>
              </div>

              {/* Progress Bar Full */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3.5 border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full" style={{ width: '79%' }}></div>
              </div>

              {/* 3 Stat Blocks */}
              <div className="grid grid-cols-3 gap-2.5 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Conferidos</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">986</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Pendentes</div>
                  <div className="text-base font-bold text-blue-400 font-mono mt-0.5">245</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Divergências</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">17</div>
                </div>
              </div>

              {/* Divergence Preview Rows */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span className="text-slate-200">Cabo PP 3x2,5mm</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">500m → 497m</span>
                    <span className="text-rose-400 font-bold">-3 m</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-200">Disjuntor DIN 32A</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">100un → 104un</span>
                    <span className="text-emerald-400 font-bold">+4 un</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/inventario" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Acessar painel de inventário</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/inventario" className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all">
                Realizar Contagem
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3: DEVOLUÇÕES, AUDITORIA & ALERTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CARD 5: DEVOLUÇÕES RECENTES (4 Cols) */}
          <div className="hud-card lg:col-span-4 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 14 4 9 9 4" />
                      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Devoluções recentes
                  </h2>
                </div>
                <span className="text-xs text-rose-400 font-mono font-bold">+5 un hoje</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-xs">DEV-00421</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">+50 m</span>
                  </div>
                  <div className="text-xs text-white font-medium mt-1">Cabo PP 3x2,5mm</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Material não utilizado</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400">Pendente</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-xs">DEV-00420</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">+5 gal</span>
                  </div>
                  <div className="text-xs text-white font-medium mt-1">Tinta Acrílica Branca</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Excedente Obra Beta</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">Processada</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <Link href="/devolucoes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver todas as devoluções</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* CARD 6: TIMELINE DE AUDITORIA (4 Cols) */}
          <div className="hud-card lg:col-span-4 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Auditoria recente
                  </h2>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 rounded-full">
                  428 hoje
                </span>
              </div>

              {/* Timeline Items */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors">
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">10:42</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400">Atualização</span>
                      <span className="text-white font-medium truncate">Carlos Mendes</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Estoque mínimo MAT-0001 (100m)</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors">
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">10:38</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">Aprovação</span>
                      <span className="text-white font-medium truncate">Mariana Costa</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Requisição REQ-1258 aprovada</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors">
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">10:21</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-400">Criação</span>
                      <span className="text-white font-medium truncate">João Oliveira</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Entrada ENT-01842 (+500m)</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors">
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">09:57</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400">Exclusão</span>
                      <span className="text-white font-medium truncate">Administrador</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Item duplicado MAT-0082</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <Link href="/auditoria" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver log de auditoria completo</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* CARD 7: ALERTAS DO SISTEMA (4 Cols) */}
          <div className="hud-card lg:col-span-4 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Alertas do sistema
                  </h2>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-full">
                  4 ativos
                </span>
              </div>

              {/* 4 Priority Alerts */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">17 materiais abaixo do mínimo</div>
                      <div className="text-[10px] text-slate-400">Reposição imediata necessária</div>
                    </div>
                  </div>
                  <span className="text-rose-400 font-mono text-[11px] font-bold">Crítico</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">3 requisições atrasadas (&gt;48h)</div>
                      <div className="text-[10px] text-slate-400">Aguardando aprovação do gestor</div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-mono text-[11px] font-bold">Atenção</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">Inventário mensal pendente</div>
                      <div className="text-[10px] text-slate-400">Ciclo INV-0007 em 79%</div>
                    </div>
                  </div>
                  <span className="text-sky-400 font-mono text-[11px] font-bold">Info</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">2 itens com validade próxima</div>
                      <div className="text-[10px] text-slate-400">Vencimento em até 30 dias</div>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">Ok</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <Link href="/relatorios" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Painel de resolução de alertas</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 4: RELATÓRIOS ANALÍTICOS & RESUMO OPERACIONAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CARD 8: RELATÓRIO DE VALOR POR CATEGORIA (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Valor do estoque por categoria
                    </h2>
                    <p className="text-[11px] text-slate-400">Distribuição contábil do inventário ativo</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                  Total: R$ 148.540,00
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* Category Multi-Gradient Donut Ring (Fixed: overflow-visible & expanded viewBox so glow never clips into a square) */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center p-2">
                  <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="-12 -12 124 124" style={{ overflow: 'visible' }}>
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="11" />
                    {/* Elétrica: 46.1% (Emerald) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#00f59b"
                      strokeWidth="11"
                      strokeDasharray="110.06 238.76"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(0,245,155,0.7)]"
                    />
                    {/* Hidráulica: 21.7% (Sky Blue) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#38bdf8"
                      strokeWidth="11"
                      strokeDasharray="51.81 238.76"
                      strokeDashoffset="-113.06"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                    />
                    {/* Ferragens: 16.4% (Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray="39.15 238.76"
                      strokeDashoffset="-167.87"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                    />
                    {/* Outros: 15.8% (Purple) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#a855f7"
                      strokeWidth="11"
                      strokeDasharray="37.72 238.76"
                      strokeDashoffset="-209.02"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[9px] uppercase font-semibold text-slate-400">Total</span>
                    <span className="text-[11px] font-bold text-white font-mono">148k</span>
                  </div>
                </div>

                {/* Category Breakdown List */}
                <div className="flex-1 space-y-1.5 text-xs w-full">
                  <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-slate-300 font-medium">Elétrica</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="font-bold text-white">R$ 68.450</span>
                      <span className="text-emerald-400 font-bold ml-1.5">46,1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      <span className="text-slate-300 font-medium">Hidráulica</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="font-bold text-white">R$ 32.180</span>
                      <span className="text-sky-400 font-bold ml-1.5">21,7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-slate-300 font-medium">Ferragens</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="font-bold text-white">R$ 24.350</span>
                      <span className="text-amber-400 font-bold ml-1.5">16,4%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span className="text-slate-300 font-medium">Outros</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="font-bold text-white">R$ 23.560</span>
                      <span className="text-purple-400 font-bold ml-1.5">15,8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/relatorios" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Ver relatório financeiro completo</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/relatorios" className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all">
                Exportar PDF
              </Link>
            </div>
          </div>

          {/* CARD 9: INDICADORES DE EFICIÊNCIA OPERACIONAL (6 Cols) */}
          <div className="hud-card lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 14 14" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Eficiência &amp; Desempenho
                    </h2>
                    <p className="text-[11px] text-slate-400">Indicadores de produtividade e giro de estoque</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                  ● Operação Excelente
                </span>
              </div>

              {/* 4 Performance Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Tempo de Atendimento</div>
                  <div className="text-base font-bold text-white font-mono mt-1">1h 24m</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">-18% vs média</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Acuracidade do Estoque</div>
                  <div className="text-base font-bold text-cyan-400 font-mono mt-1">98,6%</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">+0,8% no mês</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Taxa de Ruptura</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-1">1,4%</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Meta: &lt; 2%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Giro Mensal</div>
                  <div className="text-base font-bold text-purple-400 font-mono mt-1">3,4x</div>
                  <div className="text-[10px] text-purple-300 mt-0.5">Fluxo contínuo</div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <Link href="/relatorios" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>Relatório detalhado de produtividade</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <span className="text-[11px] text-slate-500 font-mono">Atualizado há 2 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
