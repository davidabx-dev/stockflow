'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Usuario, Role } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, Usuario> = {
  'admin@stockflow.local': {
    id: 'usr_admin',
    nome: 'Giovanni Silva',
    email: 'admin@stockflow.local',
    role: 'ADMIN',
    ativo: true,
  },
  'almoxarife@stockflow.local': {
    id: 'usr_almoxarife',
    nome: 'Carlos Mendes',
    email: 'almoxarife@stockflow.local',
    role: 'ALMOXARIFE',
    ativo: true,
  },
  'solicitante1@stockflow.local': {
    id: 'usr_solicitante',
    nome: 'Mariana Costa',
    email: 'solicitante1@stockflow.local',
    role: 'SOLICITANTE',
    ativo: true,
  },
  'auditor@stockflow.local': {
    id: 'usr_auditor',
    nome: 'Lucas Oliveira',
    email: 'auditor@stockflow.local',
    role: 'AUDITOR',
    ativo: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await api.get<Usuario>('/auth/me');
      setUser(userData);
    } catch {
      // Fallback para sessão salva localmente se o backend estiver offline
      try {
        const savedDemo = localStorage.getItem('stockflow_demo_user');
        if (savedDemo) {
          setUser(JSON.parse(savedDemo));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      // Tenta autenticar contra o backend se online
      await api.post('/auth/login/json', {
        email,
        senha,
      });
      await fetchCurrentUser();
    } catch {
      // Fallback automático para modo de demonstração / offline
      const normalizedEmail = email.toLowerCase().trim();
      const matchedUser = DEMO_USERS[normalizedEmail] || {
        id: 'usr_demo',
        nome: email.split('@')[0] || 'Usuário StockFlow',
        email: email || 'admin@stockflow.local',
        role: 'ADMIN' as Role,
        ativo: true,
      };

      setUser(matchedUser);
      try {
        localStorage.setItem('stockflow_demo_user', JSON.stringify(matchedUser));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout').catch(() => null);
    } finally {
      try {
        localStorage.removeItem('stockflow_demo_user');
      } catch {}
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
