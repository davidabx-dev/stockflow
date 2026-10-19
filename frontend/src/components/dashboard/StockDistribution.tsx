'use client';

import React from 'react';
import { StockDonut } from '@/components/charts/StockDonut';

export function StockDistribution() {
  return (
    <div className="hud-card p-5 flex flex-col justify-between relative overflow-hidden h-full">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-950/40 mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Distribuição do estoque
        </h2>
        <span className="text-[10px] font-mono text-cyan-400 font-bold">1.248 ITENS</span>
      </div>

      <StockDonut />
    </div>
  );
}
