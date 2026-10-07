'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface AuthContextType {
  user: any | null;
  isUserLoading: boolean;
  loading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isUserLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('jwt_token');
        }
      }
      setIsUserLoading(false);
    };
    fetchUser();
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('jwt_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isUserLoading, loading: isUserLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  return { user: context.user, isUserLoading: context.isUserLoading };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

// Dummy hooks to prevent immediate crashes in components while refactoring
export const useFirestore = () => null;
export const useCollection = () => ({ data: null, isLoading: false, error: null });
export const useDoc = () => ({ data: null, isLoading: false, error: null });
export const useAuthMemo = (cb: any, deps: any[]) => React.useMemo(cb, deps);
export const useAuthData = () => ({ logout: () => {} });
