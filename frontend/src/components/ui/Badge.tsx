import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  hasDot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  hasDot = false,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-800 text-slate-400 border-slate-700',
  }[variant];

  const dotColors = {
    cyan: 'bg-cyan-400 shadow-[0_0_6px_#00e5ff]',
    emerald: 'bg-emerald-400 shadow-[0_0_6px_#00f59b]',
    amber: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
    rose: 'bg-rose-400 shadow-[0_0_6px_#f43f5e]',
    purple: 'bg-purple-400 shadow-[0_0_6px_#a855f7]',
    slate: 'bg-slate-400',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border rounded-full ${sizeStyles} ${variantStyles} ${className}`}
    >
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {children}
    </span>
  );
}
