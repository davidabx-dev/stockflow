'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardFeature } from '@/features/dashboard';
import { MateriaisFeature } from '@/features/materiais';
import { EntradasFeature } from '@/features/entradas';
import { RequisicoesFeature } from '@/features/requisicoes';
import { DevolucoesFeature } from '@/features/devolucoes';
import { InventarioFeature } from '@/features/inventario';
import { RelatoriosFeature } from '@/features/relatorios';
import { AuditoriaFeature } from '@/features/auditoria';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard StockFlow', subtitle: 'Visão executiva de saldo, reservas e métricas financeiras' },
    materiais: { title: 'Catálogo de Materiais & Estoque', subtitle: 'Controle de saldo físico, reservado e disponível por localização' },
    entradas: { title: 'Entrada de Mercadorias (NF-e)', subtitle: 'Recálculo automático de custo médio ponderado móvel' },
    requisicoes: { title: 'Requisições & Fila de Separação', subtitle: 'Fluxo seguro de aprovação, reserva atômica e entrega' },
    devolucoes: { title: 'Devoluções de Obras', subtitle: 'Estorno de saídas com recuperação do custo histórico original' },
    inventario: { title: 'Inventário Físico & Ajustes', subtitle: 'Conferência física, apuração de divergências e ajustes de saldo' },
    relatorios: { title: 'Relatórios & Inteligência Contábil', subtitle: 'Consumo por obra em R$, saldo comprometido e reposição' },
    auditoria: { title: 'Livro-Razão & Auditoria Imutável', subtitle: 'Rastreabilidade total e logs imutáveis de todas as ações' },
  };

  const currentMeta = titles[currentTab] || { title: 'Dashboard StockFlow', subtitle: '' };

  return (
    <AppShell title={currentMeta.title} subtitle={currentMeta.subtitle}>
      {currentTab === 'dashboard' && <DashboardFeature onNavigate={setCurrentTab} />}
      {currentTab === 'materiais' && <MateriaisFeature />}
      {currentTab === 'entradas' && <EntradasFeature />}
      {currentTab === 'requisicoes' && <RequisicoesFeature />}
      {currentTab === 'devolucoes' && <DevolucoesFeature />}
      {currentTab === 'inventario' && <InventarioFeature />}
      {currentTab === 'relatorios' && <RelatoriosFeature />}
      {currentTab === 'auditoria' && <AuditoriaFeature />}
    </AppShell>
  );
}
