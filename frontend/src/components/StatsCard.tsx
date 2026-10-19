import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorVariant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorVariant = 'blue',
}) => {
  const variantStyles = {
    blue: {
      bgIcon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      borderGlow: 'hover:border-blue-500/30',
    },
    emerald: {
      bgIcon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderGlow: 'hover:border-emerald-500/30',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderGlow: 'hover:border-amber-500/30',
    },
    purple: {
      bgIcon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      borderGlow: 'hover:border-purple-500/30',
    },
    rose: {
      bgIcon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      borderGlow: 'hover:border-rose-500/30',
    },
  };

  const style = variantStyles[colorVariant];

  return (
    <div className={`glass-panel p-5 glass-panel-hover ${style.borderGlow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${style.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
