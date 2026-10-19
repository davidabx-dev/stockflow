'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoginView } from '@/components/LoginView';
import { useSidebar } from '@/hooks/useSidebar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Carregando StockFlow...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-black antialiased font-sans">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area (Matches dashboard.html fluid structure) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6 lg:px-8">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
