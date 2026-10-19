'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'dashboard',
      href: '/',
      label: 'Dashboard',
      themeClass: 'nav-emerald',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      label: 'Materiais',
      themeClass: 'nav-amber',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      id: 'entradas',
      href: '/entradas',
      label: 'Entradas',
      themeClass: 'nav-blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 6.5L19 3l-3.5 12-3.5-3.5" />
          <path d="M7 11.5l5.5-5.5" />
          <path d="M7 16.5l4-4" />
        </svg>
      ),
    },
    {
      id: 'requisicoes',
      href: '/requisicoes',
      label: 'Requisições',
      themeClass: 'nav-purple',
      badge: '12',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8V5a1 1 0 0 1 1-1h3" />
          <path d="M16 4h3a1 1 0 0 1 1 1v3" />
          <path d="M4 16v3a1 1 0 0 0 1 1h3" />
          <path d="M16 20h3a1 1 0 0 0 1-1v-3" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      id: 'devolucoes',
      href: '/devolucoes',
      label: 'Devoluções',
      themeClass: 'nav-rose',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
    },
    {
      id: 'inventario',
      href: '/inventario',
      label: 'Inventário',
      themeClass: 'nav-cyan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="m9 14 2 2 4-4" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
      ),
    },
    {
      id: 'relatorios',
      href: '/relatorios',
      label: 'Relatórios',
      themeClass: 'nav-lime',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'auditoria',
      href: '/auditoria',
      label: 'Auditoria',
      themeClass: 'nav-indigo',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isOpenMobile ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden lg:flex'
        }`}
      >
        {/* Status Radar Pulsante Topo Direita */}
        <div className="sidebar-status-container" title="Sistema Online">
          <div className="sidebar-status-ping"></div>
          <div className="sidebar-status-dot"></div>
        </div>

        {/* StockFlow Brand Logo & Interactive Cube Toggle */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <button
              onClick={onToggleCollapse}
              className="sidebar-cube-btn group"
              title="Recolher / Expandir Menu (Alt + B)"
            >
              <div className="cube-btn-inner">
                {/* 3 Barrinhas Clássicas (Menu Hambúrguer) */}
                <svg
                  className="icon-menu"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </div>
            </button>
            <div className="sidebar-brand-text">
              <span className="brand-stock">Stock</span>
              <span className="brand-flow">Flow</span>
            </div>
          </div>
        </div>

        {/* Divisória Sutil */}
        <div className="sidebar-divider"></div>

        {/* Menu com Scrollbar Esmeralda Fina */}
        <div className="sidebar-nav-container">
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                currentTab === item.id ||
                (pathname?.startsWith(item.href) && item.href !== '/');

              const itemClass = `sidebar-nav-item ${item.themeClass} ${isActive ? 'active' : ''}`;

              if (onSelectTab) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={itemClass}
                    title={item.label}
                  >
                    <div className="nav-icon-badge">{item.icon}</div>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50 group-hover:border-purple-500/40">
                        {item.badge}
                      </span>
                    )}
                    {isActive && !item.badge && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={itemClass}
                  title={item.label}
                >
                  <div className="nav-icon-badge">{item.icon}</div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50 group-hover:border-purple-500/40">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Almoxarifado Selector Capsule */}
        <div className="sidebar-location-capsule mt-2">
          <button className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#091524] border border-slate-800 hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(0,245,155,0.12)] transition-all text-left group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="sidebar-location-info min-w-0">
                <div className="text-[11px] font-bold text-white truncate">Almoxarifado Geral</div>
                <div className="text-[10px] text-slate-400 truncate">Estoque</div>
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="sidebar-version-text text-[10px] font-mono text-slate-500 text-center mt-2.5">
            StockFlow v2.4.0
          </div>
        </div>

        {/* Botão de Recolher Sidebar */}
        <button
          id="toggleCollapse"
          onClick={onToggleCollapse}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold tracking-wider text-slate-400 hover:text-emerald-400 rounded-xl bg-[#081324] border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(0,245,155,0.15)] transition-all cursor-pointer"
          title="Recolher / Expandir Menu"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
          <span>Recolher</span>
        </button>
      </aside>
    </>
  );
}
