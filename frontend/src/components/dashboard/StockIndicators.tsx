'use client';

import React from 'react';
import { NeonWave } from '@/components/charts/NeonWave';

interface IndicatorData {
  id: string;
  title: string;
  value: string;
  percentage: string;
  color: 'cyan' | 'rose' | 'amber' | 'emerald';
  icon: React.ReactNode;
}

interface StockIndicatorsProps {
  indicators?: IndicatorData[];
}

export function StockIndicators({
  indicators = [
    {
      id: 'entradas',
      title: 'ENTRADAS',
      value: 'R$ 85.420,00',
      percentage: '15,6%',
      color: 'cyan',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      id: 'saidas',
      title: 'SAÍDAS',
      value: 'R$ 67.300,00',
      percentage: '9,3%',
      color: 'rose',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    },
    {
      id: 'reservado',
      title: 'RESERVADO',
      value: 'R$ 28.450,00',
      percentage: '0,0%',
      color: 'amber',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      id: 'disponivel',
      title: 'DISPONÍVEL',
      value: 'R$ 120.090,00',
      percentage: '8,7%',
      color: 'emerald',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
  ],
}: StockIndicatorsProps) {
  return (
    <div className="hud-card p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-950/40 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          Indicadores de estoque
        </h2>
        <div className="flex items-center gap-2 text-slate-500">
          <button className="hover:text-emerald-400 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4 Sub Metrics with Neon Wave Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-1">
        {indicators.map((ind) => {
          const cardClass = `neon-indicator-card card-${ind.color} group`;
          const textColors = {
            cyan: 'text-cyan-400',
            rose: 'text-rose-400',
            amber: 'text-amber-400',
            emerald: 'text-emerald-400',
          }[ind.color];

          return (
            <div key={ind.id} className={cardClass}>
              <div className="relative z-10">
                {/* Header: Icon + Title */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg border border-${ind.color}-400/70 bg-gradient-to-br from-${ind.color}-900/60 to-${ind.color}-950/80 ${textColors} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {ind.icon}
                  </div>
                  <span className="text-[11px] font-extrabold text-white/80 uppercase tracking-wider">
                    {ind.title}
                  </span>
                </div>

                {/* Value */}
                <div className="text-lg lg:text-xl font-extrabold text-white tracking-tight mt-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] font-mono">
                  {ind.value}
                </div>

                {/* Variation with Target Dot */}
                <div className={`flex items-center gap-1.5 text-xs font-bold ${textColors} mt-1`}>
                  <span className="status-indicator-dot" />
                  <span>{ind.percentage}</span>
                </div>
              </div>

              {/* Mini Wave Canvas */}
              <NeonWave color={ind.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
