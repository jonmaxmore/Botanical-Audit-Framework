/**
 * Authentication & Authorization Helper
 * Handle user authentication, session management, and role-based access
 */

import { UserRole, getDashboardRoute, hasPermission } from './roles';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  farmerId?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

/**
 * Get current authenticated user from session/cookie
 * This is a placeholder - implement with your actual auth system
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // TODO: Implement actual session retrieval
    // Example: from cookie, localStorage, or server session

    // For now, return mock data or null
    const sessionData = getSessionFromStorage();
    if (!sessionData) return null;

    return sessionData.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<AuthSession | null> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const session: AuthSession = await response.json();

    // Store session
    setSessionInStorage(session);

    return session;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Call logout API
    await fetch('/api/auth/logout', { method: 'POST' });

    // Clear session
    clearSessionFromStorage();

    // Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Register new user
 */
export async function register(data: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  farmName?: string;
}): Promise<AuthSession | null> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const session: AuthSession = await response.json();

    // Store session
    setSessionInStorage(session);

    return session;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

/**
 * Redirect user to their role-specific dashboard
 */
export function redirectToDashboard(role: UserRole): void {
  const dashboardRoute = getDashboardRoute(role);
  window.location.href = dashboardRoute;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSessionFromStorage();
  if (!session) return false;

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  return now < expiresAt;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth(redirectUrl?: string): void {
  if (!isAuthenticated()) {
    const url = redirectUrl || window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(url)}`;
  }
}

/**
 * Require specific role - redirect if user doesn't have permission
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    requireAuth();
    return false;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or their dashboard
    window.location.href = getDashboardRoute(user.role);
    return false;
  }

  return true;
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    requireAuth();
    return false;
  }

  if (!hasPermission(user.role, permission)) {
    window.location.href = getDashboardRoute(user.role);
    return false;
  }

  return true;
}

// ========================================
// Session Storage Helpers (Private)
// ========================================

const SESSION_KEY = 'gacp_auth_session';

function getSessionFromStorage(): AuthSession | null {
  try {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    return JSON.parse(data);
  } catch {
    return null;
  }
}

function setSessionInStorage(session: AuthSession): void {
  try {
    if (typeof window === 'undefined') return;

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

function clearSessionFromStorage(): void {
  try {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Mock session for development
 * TODO: Remove in production
 */
export function setMockSession(role: UserRole): void {
  const mockUser: User = {
    id: '1',
    email: `${role}@gacp.test`,
    name: `Test ${role}`,
    role,
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  const mockSession: AuthSession = {
    user: mockUser,
    token: 'mock-token-' + role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  setSessionInStorage(mockSession);
}
