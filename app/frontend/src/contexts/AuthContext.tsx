'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { retryFetch } from '@/lib/api/retry'; // Task 2.1 - Retry logic

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

  // Login function (Real Backend API with Timeout + Retry)
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Task 2.1: Wrap fetch with retry logic (3 attempts, exponential backoff)
      const data = await retryFetch(
        async () => {
          // Task 1.1: 10s timeout with AbortController
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch('http://localhost:3004/api/auth/login', {
              method: 'POST',
              signal: controller.signal,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.json();
              const error: any = new Error(errorData.message || 'เข้าสู่ระบบไม่สำเร็จ');
              error.status = response.status; // Add status for retry logic
              throw error;
            }

            return response.json();
          } catch (fetchError: any) {
            clearTimeout(timeoutId);

            // Handle timeout error specifically
            if (fetchError.name === 'AbortError') {
              const error: any = new Error(
                'การเชื่อมต่อหมดเวลา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
              );
              error.name = 'AbortError'; // Preserve error type for retry logic
              throw error;
            }

            throw fetchError;
          }
        },
        {
          maxAttempts: 3,
          initialDelay: 1000, // 1s, 2s, 4s backoff
          onRetry: (attempt, error) => {
            // Retry attempt logged silently for production
            if (process.env.NODE_ENV === 'development') {
              console.warn(`🔄 Login retry ${attempt}/3:`, error.message);
            }
          },
        }
      );

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

      // Login success - logged in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Real Login Success:', { email: realUser.email, role: realUser.role });
      }

      // Set loading to false BEFORE redirect to ensure withAuth HOC works correctly
      setIsLoading(false);

      // Redirect based on role
      const roleRedirects: Record<UserRole, string> = {
        FARMER: '/farmer/dashboard',
        DTAM_OFFICER: '/officer/dashboard',
        INSPECTOR: '/inspector/dashboard',
        ADMIN: '/admin/dashboard',
      };

      router.push(roleRedirects[realUser.role] || '/');

      return data; // Return login data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      setIsLoading(false); // Also set to false on error
      throw error;
    }
  };

  // Register function (Real Backend API with Timeout + Retry)
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      // Task 2.1: Wrap fetch with retry logic (3 attempts, exponential backoff)
      const responseData = await retryFetch(
        async () => {
          // Task 1.1: 10s timeout with AbortController
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch('http://localhost:3004/api/auth/register', {
              method: 'POST',
              signal: controller.signal,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: data.email,
                password: data.password,
                fullName: data.name,
                phone: data.phoneNumber,
                nationalId: (data as any).nationalId || Date.now().toString().substring(0, 13),
                role: data.role.toLowerCase(),
                farmerType: data.role === 'FARMER' ? 'individual' : undefined,
                farmingExperience: data.role === 'FARMER' ? 0 : undefined,
              }),
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.json();
              const error: any = new Error(errorData.message || 'ลงทะเบียนไม่สำเร็จ');
              error.status = response.status;
              throw error;
            }

            return response.json();
          } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
              const error: any = new Error(
                'การเชื่อมต่อหมดเวลา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
              );
              error.name = 'AbortError';
              throw error;
            }

            throw fetchError;
          }
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`🔄 Register retry ${attempt}/3:`, error.message);
            }
          },
        }
      );

      // Backend returns: { data: { tokens: { accessToken, refreshToken }, user: { id, email, role, ... } } }
      const realToken = responseData.data?.tokens?.accessToken || responseData.token;
      const userData = responseData.data?.user || responseData.user;
      const realUser: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role.toUpperCase() as UserRole,
        name: userData.fullName || userData.name,
        phoneNumber: userData.phone || userData.phoneNumber,
        createdAt: userData.createdAt,
      };

      // Auto-login after registration
      setToken(realToken);
      setUser(realUser);
      localStorage.setItem('auth_token', realToken);
      localStorage.setItem('auth_user', JSON.stringify(realUser));

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Real Registration Success:', { email: realUser.email, role: realUser.role });
      }

      // Set loading to false BEFORE redirect to ensure withAuth HOC works correctly
      setIsLoading(false);

      // Redirect based on role
      const roleRedirects: Record<UserRole, string> = {
        FARMER: '/farmer/dashboard',
        DTAM_OFFICER: '/officer/dashboard',
        INSPECTOR: '/inspector/dashboard',
        ADMIN: '/admin/dashboard',
      };

      router.push(roleRedirects[data.role] || '/');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      setIsLoading(false); // Also set to false on error
      throw error;
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

  // Refresh token function with Timeout + Retry
  const refreshToken = async () => {
    try {
      if (!token) return;

      // Task 2.1: Wrap fetch with retry logic (2 attempts, faster retry for background refresh)
      const data = await retryFetch(
        async () => {
          // Task 1.1: 10s timeout with AbortController
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch('http://localhost:3004/api/auth/refresh', {
              method: 'POST',
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const error: any = new Error('Token refresh failed');
              error.status = response.status;
              throw error;
            }

            return response.json();
          } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
              const error: any = new Error(
                'การเชื่อมต่อหมดเวลา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
              );
              error.name = 'AbortError';
              throw error;
            }

            throw fetchError;
          }
        },
        {
          maxAttempts: 2, // Fewer retries for background refresh
          initialDelay: 500, // Faster retry (not user-facing)
          onRetry: (attempt, error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`🔄 Token refresh retry ${attempt}/2:`, error.message);
            }
          },
        }
      );

      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token refresh error:', error);
      }
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
