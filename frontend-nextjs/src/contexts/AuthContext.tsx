'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types
export type UserRole = 'FARMER' | 'DTAM_OFFICER' | 'INSPECTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phoneNumber?: string;
  farmerId?: string; // For FARMER role
  officerId?: string; // For DTAM_OFFICER role
  inspectorId?: string; // For INSPECTOR role
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function (Mock Authentication for UI Testing)
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // 🚀 REAL API CALL - Call Backend Login
      const response = await fetch('http://localhost:3004/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      const data = await response.json();
      
      // Backend returns: { token, user: { id, email, role, ... } }
      const realToken = data.token;
      const realUser: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.fullName || data.user.name,
        phoneNumber: data.user.phone || data.user.phoneNumber,
        createdAt: data.user.createdAt,
      };
      
      // Store token and user
      setToken(realToken);
      setUser(realUser);
      localStorage.setItem('auth_token', realToken);
      localStorage.setItem('auth_user', JSON.stringify(realUser));

      console.log('✅ Real Login Success:', { email: realUser.email, role: realUser.role });

      // Redirect based on role
      const roleRedirects: Record<UserRole, string> = {
        FARMER: '/farmer/dashboard',
        DTAM_OFFICER: '/officer/dashboard',
        INSPECTOR: '/inspector/dashboard',
        ADMIN: '/admin/dashboard',
      };

      router.push(roleRedirects[realUser.role] || '/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function (Real Backend API)
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      // 🚀 REAL API CALL - Call Backend Register
      const response = await fetch('http://localhost:3004/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.name,
          phone: data.phoneNumber,
          nationalId: data.nationalId || '1234567890123',
          role: data.role.toLowerCase(), // Backend expects lowercase
          farmerType: data.role === 'FARMER' ? 'individual' : undefined,
          farmingExperience: data.role === 'FARMER' ? 0 : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ลงทะเบียนไม่สำเร็จ');
      }

      const responseData = await response.json();
      
      // Backend returns: { token, user: { id, email, role, ... } }
      const realToken = responseData.token;
      const realUser: User = {
        id: responseData.user.id,
        email: responseData.user.email,
        role: responseData.user.role.toUpperCase() as UserRole,
        name: responseData.user.fullName || responseData.user.name,
        phoneNumber: responseData.user.phone || responseData.user.phoneNumber,
        createdAt: responseData.user.createdAt,
      };
      
      // Auto-login after registration
      setToken(realToken);
      setUser(realUser);
      localStorage.setItem('auth_token', realToken);
      localStorage.setItem('auth_user', JSON.stringify(realUser));

      console.log('✅ Real Registration Success:', { email: realUser.email, role: realUser.role });

      // Redirect based on role
      const roleRedirects: Record<UserRole, string> = {
        FARMER: '/farmer/dashboard',
        DTAM_OFFICER: '/officer/dashboard',
        INSPECTOR: '/inspector/dashboard',
        ADMIN: '/admin/dashboard',
      };

      router.push(roleRedirects[data.role] || '/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!token) return;

      const response = await fetch('http://localhost:3004/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
      return null;
    }

    return <Component {...props} />;
  };
}
