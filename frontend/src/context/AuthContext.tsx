import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { MOCK_USER } from '../services/mockData';

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
  demoLogin: (role: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'usr-001',
    email: 'admin@cti.platform',
    full_name: 'Platform Administrator',
    role: 'admin',
  },
  analyst: {
    id: 'usr-002',
    email: 'analyst@cti.platform',
    full_name: 'Senior Threat Analyst',
    role: 'analyst',
  },
  viewer: {
    id: 'usr-003',
    email: 'viewer@cti.platform',
    full_name: 'Read-Only Observer',
    role: 'viewer',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if we already have a stored session role
      const storedRole = localStorage.getItem('cti_demo_role') as 'admin' | 'analyst' | 'viewer' | null;
      if (storedRole && MOCK_USERS[storedRole]) {
        setUser(MOCK_USERS[storedRole]);
        setLoading(false);
        return;
      }

      // 2. Check stored JWT token and try to fetch user from backend
      const token = localStorage.getItem('cti_auth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.email) {
            setUser(res.data);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem('cti_auth_token');
        }
      }

      // 3. Auto demo login as admin for hackathon (try backend first, fall back to local mock)
      try {
        const res = await api.post('/auth/demo-login?role=admin');
        if (res.data?.user) {
          localStorage.setItem('cti_auth_token', res.data.access_token || 'mock-token');
          localStorage.setItem('cti_demo_role', 'admin');
          setUser(res.data.user);
        } else {
          // Backend returned unexpected shape — use local mock
          localStorage.setItem('cti_demo_role', 'admin');
          setUser(MOCK_USERS.admin);
        }
      } catch {
        // Backend completely offline — use local mock immediately
        localStorage.setItem('cti_demo_role', 'admin');
        setUser(MOCK_USERS.admin);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Check local demo credentials first
    const demoCredentials: Record<string, { password: string; role: 'admin' | 'analyst' | 'viewer' }> = {
      'admin@cti.platform': { password: 'Admin123!', role: 'admin' },
      'analyst@cti.platform': { password: 'Analyst123!', role: 'analyst' },
      'viewer@cti.platform': { password: 'Viewer123!', role: 'viewer' },
    };

    const demoMatch = demoCredentials[email];
    if (demoMatch && demoMatch.password === password) {
      localStorage.setItem('cti_demo_role', demoMatch.role);
      localStorage.removeItem('cti_auth_token');
      setUser(MOCK_USERS[demoMatch.role]);
      return;
    }

    // Try real backend auth
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('cti_auth_token', res.data.access_token);
      localStorage.setItem('cti_demo_role', res.data.user?.role || 'analyst');
      setUser(res.data.user);
    } catch (err: any) {
      if (!err.response) {
        // Backend offline - check demo credentials fallback
        throw new Error('Invalid email or password');
      }
      throw err;
    }
  };

  const demoLogin = async (role: 'admin' | 'analyst' | 'viewer') => {
    // Always use local mock for instant hackathon demo
    localStorage.setItem('cti_demo_role', role);
    localStorage.removeItem('cti_auth_token');
    setUser(MOCK_USERS[role]);

    // Also try to get a real JWT in the background (non-blocking)
    api.post(`/auth/demo-login?role=${role}`).then(res => {
      if (res.data?.access_token) {
        localStorage.setItem('cti_auth_token', res.data.access_token);
      }
    }).catch(() => { /* ignore - local mock is sufficient */ });
  };

  const logout = () => {
    localStorage.removeItem('cti_auth_token');
    localStorage.removeItem('cti_demo_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        demoLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
