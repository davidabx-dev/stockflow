'use client';

import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@stockflow.local');
  const [senha, setSenha] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, senha);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setSenha(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar no perfil demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md hud-card p-8 relative z-10 border border-blue-500/30 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] mb-4 text-white font-extrabold text-2xl">
            SF
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Stock</span>
            <span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">Flow</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 font-mono">
              V2.4 PRO
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">Autenticação Segura & Gestão de Estoque</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email de Acesso</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70 shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Entrando no Sistema...' : 'Acessar Sistema'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Acesso Rápido para Demonstração (1 Clique)
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@stockflow.local', 'Admin@2026!')}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-all text-left flex flex-col cursor-pointer group"
            >
              <strong className="text-white group-hover:text-emerald-400 transition-colors">Administrador</strong>
              <span className="text-[10px] text-emerald-400 font-mono">Acesso Total</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('almoxarife@stockflow.local', 'Almoxarife@2026!')}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-all text-left flex flex-col cursor-pointer group"
            >
              <strong className="text-white group-hover:text-blue-400 transition-colors">Almoxarife</strong>
              <span className="text-[10px] text-blue-400 font-mono">Entrada & Estoque</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('solicitante1@stockflow.local', 'Solicitante@2026!')}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-all text-left flex flex-col cursor-pointer group"
            >
              <strong className="text-white group-hover:text-amber-400 transition-colors">Solicitante</strong>
              <span className="text-[10px] text-amber-400 font-mono">Pedir Materiais</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('auditor@stockflow.local', 'Auditor@2026!')}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-all text-left flex flex-col cursor-pointer group"
            >
              <strong className="text-white group-hover:text-purple-400 transition-colors">Auditor</strong>
              <span className="text-[10px] text-purple-400 font-mono">Compliance & Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
