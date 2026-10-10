'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Citizen' | 'Government' | 'NGO';
  wardId?: string;
  organizationName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const userData = res.data.data.user;
    const token = res.data.data.token;
    localStorage.setItem('cc_user', JSON.stringify(userData));
    localStorage.setItem('cc_token', token);
    setUser(userData);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const userData = res.data.data.user;
    const token = res.data.data.token;
    localStorage.setItem('cc_user', JSON.stringify(userData));
    localStorage.setItem('cc_token', token);
    setUser(userData);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
