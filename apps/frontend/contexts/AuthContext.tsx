import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../lib/auth.service';
import { UserApi } from '../lib/api.service';
import { User, UserRole } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  hasAnyRole: () => false,
  refreshUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ตรวจสอบว่ามีผู้ใช้ที่เข้าสู่ระบบอยู่แล้วหรือไม่
  useEffect(() => {
    const initAuth = async () => {
      try {
        // ตรวจสอบ token ใน localStorage
        if (AuthService.verifyToken()) {
          // ถ้ามี token ที่ถูกต้อง ให้โหลดข้อมูลผู้ใช้จาก API
          const userData = (await UserApi.getCurrentUser()) as User;
          setUser(userData);
        }
      } catch (err: any) {
        // Silent fail - don't show error on initial load
        console.log('Could not load user data:', err?.message || 'Network error');
        // Clear invalid tokens
        if (err?.response?.status === 401) {
          AuthService.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // เข้าสู่ระบบ
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await AuthService.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      } else {
        setError('Invalid credentials');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ออกจากระบบ
  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  // โหลดข้อมูลผู้ใช้อีกครั้ง
  const refreshUser = async () => {
    if (!AuthService.isAuthenticated()) return;

    try {
      setLoading(true);
      const userData = await UserApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบบทบาท
  const hasRole = (role: UserRole): boolean => {
    return !!user && user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return !!user && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
