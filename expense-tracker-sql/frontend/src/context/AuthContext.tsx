import { createContext, useContext, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from '../lib/api';
import { AuthResponse } from '../types';

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setAuthToken] = useState<string | null>(() => getAccessToken());

  const handleAuth = async (path: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>(`/auth/${path}`, { email, password });
    const newToken = res.data.accessToken;
    const newRefresh = res.data.refreshToken;
    setTokens(newToken, newRefresh);
    setAuthToken(newToken);
  };

  const login = (email: string, password: string) => handleAuth('login', email, password);
  const register = (email: string, password: string) => handleAuth('register', email, password);
  const logout = () => {
    setAuthToken(null);
    clearTokens();
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
