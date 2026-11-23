import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'analyst' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'cti_auth_token';

// Remove everything older builds stored (including the old demo role/session keys).
const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('cti_demo_role');
  localStorage.removeItem('cti_session_v2');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // The user's identity and role ALWAYS come from the server, validated from the JWT.
  // Nothing stored in the browser (role, flags) can grant access.
  useEffect(() => {
    localStorage.removeItem('cti_demo_role');
    localStorage.removeItem('cti_session_v2');
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        if (res.data && res.data.email) setUser(res.data);
        else clearSession();
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      setUser(res.data.user);
    } catch (err: any) {
      if (!err.response) {
        throw new Error('Cannot reach the server. Please try again later.');
      }
      throw err;
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
