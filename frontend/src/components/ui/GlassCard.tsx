import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'none';
  variant?: 'default' | 'kpi' | 'compact';
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'cyan',
  variant = 'default',
  ...props
}: GlassCardProps) {
  const glowBorderClass = {
    cyan: 'border-[rgba(0,229,255,0.24)] hover:border-[rgba(0,229,255,0.45)]',
    emerald: 'border-[rgba(0,245,155,0.24)] hover:border-[rgba(0,245,155,0.45)]',
    amber: 'border-[rgba(245,158,11,0.24)] hover:border-[rgba(245,158,11,0.45)]',
    rose: 'border-[rgba(244,63,94,0.24)] hover:border-[rgba(244,63,94,0.45)]',
    purple: 'border-[rgba(168,85,247,0.24)] hover:border-[rgba(168,85,247,0.45)]',
    none: 'border-slate-800 hover:border-slate-700',
  }[glowColor];

  return (
    <div
      className={`hud-card ${glowBorderClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
