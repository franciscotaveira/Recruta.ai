import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ApiError,
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '../services/api';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: Exclude<UserRole, 'admin'>,
    name?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthErrorMessage(error: ApiError): string {
  if (error.code === 'API_NON_JSON_RESPONSE' || error.code === 'API_INVALID_JSON') {
    return 'Falha de conexão com a API. Verifique a configuração de domínio entre app e backend.';
  }

  if (error.code === 'CORS_ORIGIN_NOT_ALLOWED') {
    return 'Origem bloqueada pelo backend. Ajuste a lista de CORS para este domínio.';
  }

  return error.message;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('recruta_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Restore & validate session on mount
  useEffect(() => {
    const token = localStorage.getItem('recruta_token');
    if (!token) return;
    getCurrentUser()
      .then((data) => {
        const u: User = { id: data.id, role: data.role, email: data.email, name: data.name };
        setUser(u);
        localStorage.setItem('recruta_user', JSON.stringify(u));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('recruta_token');
        localStorage.removeItem('recruta_user');
      });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginRequest(email, password);
      localStorage.setItem('recruta_token', data.token);
      const u: User = { id: data.userId, role: data.role, email: data.email, name: data.name };
      setUser(u);
      localStorage.setItem('recruta_user', JSON.stringify(u));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(mapAuthErrorMessage(error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    role: Exclude<UserRole, 'admin'>,
    name?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await registerRequest(email, password, role, name);
      localStorage.setItem('recruta_token', data.token);
      const u: User = {
        id: data.userId,
        role: data.role,
        email: data.email,
        name: data.name || name,
      };
      setUser(u);
      localStorage.setItem('recruta_user', JSON.stringify(u));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(mapAuthErrorMessage(error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('recruta_token');
    localStorage.removeItem('recruta_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
