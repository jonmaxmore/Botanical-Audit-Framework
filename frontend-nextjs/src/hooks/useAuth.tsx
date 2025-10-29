/**
 * GACP Platform - Authentication React Hook
 *
 * PURPOSE: Provide authentication state management with proper business logic
 * COMPLIANCE: Thai FDA GACP 2018 authentication requirements
 * WORKFLOW: Secure authentication state with role-based access control
 *
 * BUSINESS LOGIC FOUNDATION:
 * - Multi-role authentication state management
 * - Automatic token refresh and validation
 * - Role-based permission checking
 * - Secure session management
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { gacpAuthService } from '../api/auth-service';

// ============================================================================
// TYPE DEFINITIONS - Authentication Hook
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'farmer' | 'dtam_officer' | 'inspector' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  permissions: string[];
  profile?: {
    farmName?: string;
    farmLocation?: string;
    department?: string;
    position?: string;
    licenseNumber?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateProfile: (profileData: any) => Promise<void>;
}

// ============================================================================
// AUTHENTICATION CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// AUTHENTICATION PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null,
  });

  /**
   * Initialize authentication state on app start
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authManager = gacpAuthService.getAuthManager();
        const token = authManager.getToken();
        const userData = authManager.getUserData();

        if (token && userData) {
          // Verify token is still valid
          try {
            const profileResponse = await gacpAuthService.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setAuthState({
                user: profileResponse.data as AuthUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                token,
              });
            } else {
              // Token invalid, clear auth
              authManager.clearAuth();
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                token: null,
              });
            }
          } catch (error) {
            // Profile fetch failed, clear auth
            authManager.clearAuth();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired',
              token: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null,
          });
        }
      } catch (error) {
        console.error('[Auth Hook] Initialization failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed',
          token: null,
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email: string, password: string, role?: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await gacpAuthService.login({
        email,
        password,
        role: role as any,
      });

      if (response.success && response.data) {
        setAuthState({
          user: response.data.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          token: response.data.token,
        });

        console.log('[Auth Hook] Login successful:', {
          userId: response.data.user.id,
          role: response.data.user.role,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('[Auth Hook] Login failed:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: any) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await gacpAuthService.register(userData);

      if (response.success && response.data) {
        setAuthState({
          user: response.data.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          token: response.data.token,
        });

        console.log('[Auth Hook] Registration successful:', {
          userId: response.data.user.id,
          role: response.data.user.role,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('[Auth Hook] Registration failed:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await gacpAuthService.logout();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
      });

      console.log('[Auth Hook] Logout successful');
    } catch (error: any) {
      console.error('[Auth Hook] Logout failed:', error);
      // Even if logout fails, clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
      });
    }
  }, []);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await gacpAuthService.refreshToken();

      if (response.success && response.data) {
        setAuthState((prev) => ({
          ...prev,
          user: response.data.user as AuthUser,
          token: response.data.token,
        }));

        console.log('[Auth Hook] Token refreshed successfully');
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      console.error('[Auth Hook] Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [logout]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData: any) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await gacpAuthService.updateProfile(profileData);

      if (response.success && response.data) {
        setAuthState((prev) => ({
          ...prev,
          user: response.data as AuthUser,
          isLoading: false,
        }));

        console.log('[Auth Hook] Profile updated successfully');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('[Auth Hook] Profile update failed:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return authState.user?.role === role;
    },
    [authState.user]
  );

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return authState.user?.permissions?.includes(permission) || false;
    },
    [authState.user]
  );

  // Context value
  const contextValue: AuthContextValue = {
    ...authState,
    login,
    logout,
    register,
    refreshToken,
    clearError,
    hasRole,
    hasPermission,
    updateProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ============================================================================
// CUSTOM HOOKS FOR SPECIFIC AUTH OPERATIONS
// ============================================================================

/**
 * Hook for login form components
 */
export const useLogin = () => {
  const { login, isLoading, error, clearError } = useAuth();

  return {
    login,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Hook for registration form components
 */
export const useRegister = () => {
  const { register, isLoading, error, clearError } = useAuth();

  return {
    register,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Hook for role-based access control
 */
export const usePermissions = () => {
  const { user, hasRole, hasPermission } = useAuth();

  return {
    user,
    hasRole,
    hasPermission,
    isFarmer: hasRole('farmer'),
    isDTAMOfficer: hasRole('dtam_officer'),
    isInspector: hasRole('inspector'),
    isAdmin: hasRole('admin'),
  };
};

/**
 * Hook for profile management
 */
export const useProfile = () => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();

  return {
    user,
    updateProfile,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string,
  requiredPermission?: string
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading, hasRole, hasPermission, user } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      return <div>Please log in to access this page</div>;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return <div>Access denied: Insufficient role permissions</div>;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return <div>Access denied: Insufficient permissions</div>;
    }

    return <Component {...props} />;
  };
};

/**
 * Hook for automatic token refresh
 */
export const useTokenRefresh = () => {
  const { refreshToken, isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Set up automatic token refresh (every 14 minutes for 15-minute tokens)
    const interval = setInterval(
      async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('[Auth Hook] Automatic token refresh failed:', error);
        }
      },
      14 * 60 * 1000
    ); // 14 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, token, refreshToken]);
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { AuthUser, AuthState, AuthContextValue };

export default useAuth;
