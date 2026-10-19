'use client';

import React from 'react';
import { ToastMessage } from '@/hooks/useToast';

interface ToastProps {
  toasts: ToastMessage[];
}

export function ToastContainer({ toasts }: ToastProps) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(toast => {
        const glowBorder = {
          info: 'border-cyan-500/60 shadow-[0_0_20px_rgba(0,229,255,0.35)]',
          success: 'border-emerald-500/60 shadow-[0_0_20px_rgba(0,245,155,0.35)]',
          warning: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
          error: 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        }[toast.type || 'info'];

        const dotColor = {
          info: 'bg-cyan-400',
          success: 'bg-emerald-400',
          warning: 'bg-amber-400',
          error: 'bg-rose-400',
        }[toast.type || 'info'];

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#061426] border ${glowBorder} text-xs text-white pointer-events-auto animate-in slide-in-from-bottom duration-300`}
          >
            <span className={`w-2 h-2 rounded-full ${dotColor} animate-ping`} />
            <span className="font-semibold">{toast.text}</span>
          </div>
        );
      })}
    </div>
  );
}
