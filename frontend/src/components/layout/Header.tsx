'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onOpenMobileMenu?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({
  title = 'Dashboard StockFlow',
  subtitle = 'Gestão Integrada de Estoque • Monitoramento em Tempo Real',
  badge = 'V2.4 PRO FLUXO',
  onOpenMobileMenu,
  onSearch,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const moduleTabs = [
    {
      id: 'dashboard',
      href: '/',
      label: 'Visão Executiva',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="7" x="3" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" />
          <rect width="7" height="7" x="3" y="14" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'materiais',
      href: '/materiais',
      label: 'Materiais & Saldo',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        </svg>
      ),
    },
    {
      id: 'entradas',
      href: '/entradas',
      label: 'Entradas Pendentes',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 6.5L19 3l-3.5 12-3.5-3.5" />
          <path d="M7 11.5l5.5-5.5" />
          <path d="M7 16.5l4-4" />
        </svg>
      ),
    },
    {
      id: 'requisicoes',
      href: '/requisicoes',
      label: 'Requisições em Fila',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      id: 'relatorios',
      href: '/relatorios',
      label: 'Relatórios & BI',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'auditoria',
      href: '/auditoria',
      label: 'Auditoria Imutável',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <header className="topbar-panel">
      {/* ROW 1: BRANDING, SEARCH & SYSTEM CONTROLS */}
      <div className="topbar-row-header">
        {/* BRANDING & TITLE */}
        <div className="topbar-branding">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white mr-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          <div className="topbar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="7" x="3" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="14" rx="1.5" />
              <rect width="7" height="7" x="3" y="14" rx="1.5" />
            </svg>
          </div>
          <div className="topbar-title-group">
            <div className="topbar-title-row">
              <h1 className="topbar-title">
                {title.includes('StockFlow') ? (
                  <>
                    {title.replace('StockFlow', '')} <span>StockFlow</span>
                  </>
                ) : (
                  <>
                    {title.split(' ')[0]} <span>{title.split(' ').slice(1).join(' ')}</span>
                  </>
                )}
              </h1>
              {badge && <span className="badge-version">{badge}</span>}
            </div>
            <p className="topbar-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* CENTER QUICK SEARCH TERMINAL */}
        <div className="topbar-center-search">
          <svg className="topbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar materiais, requisições, obras..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="topbar-search-input"
          />
          <span className="topbar-kbd">⌘ K</span>
        </div>

        {/* ACTIONS & CONTROLS DOCK */}
        <div className="topbar-actions">
          {/* THEME TOGGLE SWITCH */}
          <button
            type="button"
            className={`theme-toggle-switch ${!isDarkMode ? 'is-light' : ''}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Alternar Tema"
            title="Alternar Tema"
          >
            <span className="theme-toggle-slider">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </span>
            <span className="theme-toggle-side-icon">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </span>
            <span className="theme-toggle-side-icon">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </span>
          </button>

          {/* ONLINE RADAR STATUS PILL */}
          <div className="status-pill" title="Dispositivo Conectado e Operando">
            <div className="status-radar">
              <div className="status-ping"></div>
              <div className="status-dot"></div>
            </div>
            <span>Sistema Online</span>
          </div>

          {/* NOTIFICATION BELL BUTTON */}
          <button className="topbar-notif-btn" title="Notificações">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="topbar-notif-badge">8</span>
          </button>

          {/* USER PROFILE PILL & FLOATING DROPDOWN */}
          <div className="relative">
            <div
              className="user-dropdown-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="user-avatar">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Giovanni Silva"
                />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.nome || 'Giovanni Silva'}</span>
                <span className="user-role">{user?.role || 'ADMINISTRADOR'}</span>
              </div>
              <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="user-dropdown-menu show">
                <button className="dropdown-item">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Meu Perfil</span>
                </button>
                <button className="dropdown-item">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Segurança</span>
                </button>
                <button className="dropdown-item">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Configurações</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="dropdown-item dropdown-item-danger"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: NEON GRADIENT LIGHT DIVIDER */}
      <div className="topbar-divider"></div>

      {/* ROW 3: MODULE NAVIGATION TABS & QUICK CONTROLS DOCK */}
      <div className="topbar-row-bottom">
        {/* MODULE TABS */}
        <nav className="module-nav">
          {moduleTabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`module-tab ${isActive ? 'active' : ''}`}
              >
                <div className="tab-icon-badge">{tab.icon}</div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: DATE PICKER & QUICK ACTIONS */}
        <div className="topbar-right-controls">
          {/* Date Range Selector */}
          <button className="date-range-pill" title="Filtrar Período">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>01/05/2024 - 31/05/2024</span>
            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="quick-action-pill"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
              </svg>
              <span>Ações rápidas</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isQuickActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 hud-card p-2 rounded-xl shadow-2xl z-50 border border-emerald-500/30">
                <Link
                  href="/entradas"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-colors"
                >
                  <span className="text-emerald-400 font-bold">+</span> Nova Entrada de Material
                </Link>
                <Link
                  href="/requisicoes"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-colors"
                >
                  <span className="text-emerald-400 font-bold">+</span> Criar Requisição
                </Link>
                <Link
                  href="/auditoria"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-colors"
                >
                  <span className="text-emerald-400 font-bold">⚡</span> Realizar Auditoria Rápida
                </Link>
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Exportar Relatório PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
