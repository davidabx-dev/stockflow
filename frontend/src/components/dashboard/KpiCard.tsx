'use client';

import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  statusText: string;
  variant?: 'cyan' | 'emerald' | 'rose' | 'amber';
  icon: React.ReactNode;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  statusText,
  variant = 'cyan',
  icon,
  onClick,
}: KpiCardProps) {
  const cardClass = {
    cyan: 'kpi-cyan',
    emerald: 'kpi-emerald',
    rose: 'kpi-rose',
    amber: 'kpi-amber',
  }[variant];

  const iconClass = {
    cyan: 'kpi-icon-cyan',
    emerald: 'kpi-icon-emerald',
    rose: 'kpi-icon-rose',
    amber: 'kpi-icon-amber',
  }[variant];

  const statusColor = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`kpi-card ${cardClass} group`}
    >
      <div className="kpi-content">
        <span className="kpi-title">{title}</span>
        <div className="kpi-value">{value}</div>
        <div className={`kpi-status ${statusColor}`}>
          <span className="status-indicator-dot" />
          <span>{statusText}</span>
        </div>
      </div>

      {/* 3D Icon Graphic Box */}
      <div className={`kpi-icon-box ${iconClass}`}>
        {icon}
      </div>
    </div>
  );
}
