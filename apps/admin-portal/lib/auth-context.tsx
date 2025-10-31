'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const logError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(...args);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      logError('Auth check failed:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication - replace with real API call
      const mockUsers = [
        {
          id: '1',
          email: 'admin@gacp.th',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
        },
        {
          id: '2',
          email: 'reviewer@gacp.th',
          password: 'reviewer123',
          name: 'Reviewer User',
          role: 'reviewer',
        },
        {
          id: '3',
          email: 'approver@gacp.th',
          password: 'approver123',
          name: 'Approver User',
          role: 'approver',
        },
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Create mock token
      const mockToken = btoa(JSON.stringify({ userId: foundUser.id, email: foundUser.email }));

      // Remove password from user object
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = foundUser;

      // Store in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // Update state
      setToken(mockToken);
      setUser(userWithoutPassword);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      logError('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login
    router.push('/login');
  };

  const checkAuth = (): boolean => {
    return !!(token && user);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: checkAuth(),
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
