/**
 * GACP Platform - Authentication Service
 *
 * PURPOSE: Handle all authentication-related API calls with proper business logic
 * COMPLIANCE: Thai FDA GACP 2018 authentication requirements
 * WORKFLOW: Secure authentication flow with role-based access control
 *
 * BUSINESS LOGIC FOUNDATION:
 * - Multi-role authentication (farmer, dtam_officer, inspector, admin)
 * - JWT token lifecycle management
 * - Session security and validation
 * - Government-grade security standards
 */

import {
  gacpApiClient,
  GACP_API_CONFIG,
  type GACPApiResponse,
  type GACPAuthToken,
} from './gacp-api-client';

// ============================================================================
// TYPE DEFINITIONS - Authentication Specific
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'farmer' | 'dtam_officer' | 'inspector' | 'admin';
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'farmer' | 'dtam_officer' | 'inspector' | 'admin';

  // Farmer-specific fields
  farmName?: string;
  farmLocation?: string;
  farmSize?: number;
  cropTypes?: string[];

  // Official-specific fields
  department?: string;
  position?: string;
  licenseNumber?: string;

  // Terms and conditions
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'farmer' | 'dtam_officer' | 'inspector' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  permissions: string[];

  // Profile specific data
  profile: {
    farmName?: string;
    farmLocation?: string;
    farmSize?: number;
    cropTypes?: string[];
    department?: string;
    position?: string;
    licenseNumber?: string;
  };

  // Audit fields
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ============================================================================
// AUTHENTICATION SERVICE CLASS
// ============================================================================

class GACPAuthService {
  private static instance: GACPAuthService;

  public static getInstance(): GACPAuthService {
    if (!GACPAuthService.instance) {
      GACPAuthService.instance = new GACPAuthService();
    }
    return GACPAuthService.instance;
  }

  /**
   * User login with proper validation and error handling
   */
  async login(credentials: LoginCredentials): Promise<GACPApiResponse<GACPAuthToken>> {
    try {
      // Validate credentials before sending to server
      this.validateLoginCredentials(credentials);

      const response = await gacpApiClient.post<GACPAuthToken>(
        GACP_API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Store authentication data if login successful
      if (response.success && response.data) {
        const authManager = gacpApiClient.getAuthManager();
        authManager.setToken(response.data.token);
        authManager.setUserData(response.data.user);

        // Log successful login for audit
        console.log('[GACP Auth] Successful login:', {
          userId: response.data.user.id,
          role: response.data.user.role,
          timestamp: new Date().toISOString(),
        });
      }

      return response;
    } catch (error) {
      console.error('[GACP Auth] Login failed:', error);
      throw error;
    }
  }

  /**
   * User registration with comprehensive validation
   */
  async register(userData: RegisterData): Promise<GACPApiResponse<GACPAuthToken>> {
    try {
      // Validate registration data
      this.validateRegistrationData(userData);

      const response = await gacpApiClient.post<GACPAuthToken>(
        GACP_API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Store authentication data if registration successful
      if (response.success && response.data) {
        const authManager = gacpApiClient.getAuthManager();
        authManager.setToken(response.data.token);
        authManager.setUserData(response.data.user);

        // Log successful registration for audit
        console.log('[GACP Auth] Successful registration:', {
          userId: response.data.user.id,
          role: response.data.user.role,
          timestamp: new Date().toISOString(),
        });
      }

      return response;
    } catch (error) {
      console.error('[GACP Auth] Registration failed:', error);
      throw error;
    }
  }

  /**
   * User logout with proper cleanup
   */
  async logout(): Promise<GACPApiResponse<void>> {
    try {
      const authManager = gacpApiClient.getAuthManager();
      const userData = authManager.getUserData();

      // Call logout endpoint to invalidate server-side session
      const response = await gacpApiClient.post<void>(GACP_API_CONFIG.ENDPOINTS.AUTH.LOGOUT);

      // Clear local authentication data
      authManager.clearAuth();

      // Log successful logout for audit
      console.log('[GACP Auth] Successful logout:', {
        userId: userData?.id,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      // Even if server logout fails, clear local data
      const authManager = gacpApiClient.getAuthManager();
      authManager.clearAuth();

      console.error('[GACP Auth] Logout error (local data cleared):', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<GACPApiResponse<UserProfile>> {
    try {
      return await gacpApiClient.get<UserProfile>(GACP_API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    } catch (error) {
      console.error('[GACP Auth] Get profile failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<GACPApiResponse<UserProfile>> {
    try {
      // Validate profile data
      this.validateProfileData(profileData);

      const response = await gacpApiClient.put<UserProfile>(
        GACP_API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        profileData
      );

      // Update local user data if successful
      if (response.success && response.data) {
        const authManager = gacpApiClient.getAuthManager();
        authManager.setUserData(response.data);
      }

      return response;
    } catch (error) {
      console.error('[GACP Auth] Update profile failed:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<GACPApiResponse<void>> {
    try {
      // Validate password data
      this.validatePasswordChange(passwordData);

      return await gacpApiClient.post<void>(
        `${GACP_API_CONFIG.ENDPOINTS.AUTH.PROFILE}/change-password`,
        passwordData
      );
    } catch (error) {
      console.error('[GACP Auth] Change password failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: PasswordResetData): Promise<GACPApiResponse<void>> {
    try {
      // Validate email
      this.validateEmail(resetData.email);

      return await gacpApiClient.post<void>(
        `${GACP_API_CONFIG.ENDPOINTS.AUTH.PROFILE}/reset-password`,
        resetData
      );
    } catch (error) {
      console.error('[GACP Auth] Request password reset failed:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(resetData: PasswordResetConfirmData): Promise<GACPApiResponse<void>> {
    try {
      // Validate reset data
      this.validatePasswordResetConfirm(resetData);

      return await gacpApiClient.post<void>(
        `${GACP_API_CONFIG.ENDPOINTS.AUTH.PROFILE}/confirm-reset-password`,
        resetData
      );
    } catch (error) {
      console.error('[GACP Auth] Confirm password reset failed:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<GACPApiResponse<void>> {
    try {
      return await gacpApiClient.post<void>(GACP_API_CONFIG.ENDPOINTS.AUTH.VERIFY, { token });
    } catch (error) {
      console.error('[GACP Auth] Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<GACPApiResponse<GACPAuthToken>> {
    try {
      const response = await gacpApiClient.post<GACPAuthToken>(
        GACP_API_CONFIG.ENDPOINTS.AUTH.REFRESH
      );

      // Update stored token if successful
      if (response.success && response.data) {
        const authManager = gacpApiClient.getAuthManager();
        authManager.setToken(response.data.token);
        authManager.setUserData(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('[GACP Auth] Token refresh failed:', error);
      throw error;
    }
  }

  // ========================================================================
  // VALIDATION METHODS - Business Logic Enforcement
  // ========================================================================

  /**
   * Validate login credentials
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials.email) {
      throw new Error('Email is required');
    }

    if (!credentials.password) {
      throw new Error('Password is required');
    }

    // Validate email format
    this.validateEmail(credentials.email);

    // Validate password strength
    this.validatePassword(credentials.password);
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(userData: RegisterData): void {
    // Required fields validation
    if (!userData.email) throw new Error('Email is required');
    if (!userData.password) throw new Error('Password is required');
    if (!userData.confirmPassword) throw new Error('Password confirmation is required');
    if (!userData.firstName) throw new Error('First name is required');
    if (!userData.lastName) throw new Error('Last name is required');
    if (!userData.role) throw new Error('Role is required');

    // Email validation
    this.validateEmail(userData.email);

    // Password validation
    this.validatePassword(userData.password);

    // Password confirmation
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Role-specific validation
    if (userData.role === 'farmer') {
      if (!userData.farmName) throw new Error('Farm name is required for farmers');
      if (!userData.farmLocation) throw new Error('Farm location is required for farmers');
    }

    if (['dtam_officer', 'inspector'].includes(userData.role)) {
      if (!userData.department) throw new Error('Department is required for officials');
      if (!userData.position) throw new Error('Position is required for officials');
    }

    // Terms acceptance
    if (!userData.acceptTerms) {
      throw new Error('You must accept the terms and conditions');
    }

    if (!userData.acceptPrivacyPolicy) {
      throw new Error('You must accept the privacy policy');
    }
  }

  /**
   * Validate profile data
   */
  private validateProfileData(profileData: Partial<UserProfile>): void {
    if (profileData.email) {
      this.validateEmail(profileData.email);
    }

    if (profileData.firstName && profileData.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }

    if (profileData.lastName && profileData.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
  }

  /**
   * Validate password change data
   */
  private validatePasswordChange(passwordData: PasswordChangeData): void {
    if (!passwordData.currentPassword) {
      throw new Error('Current password is required');
    }

    if (!passwordData.newPassword) {
      throw new Error('New password is required');
    }

    if (!passwordData.confirmNewPassword) {
      throw new Error('Password confirmation is required');
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      throw new Error('New passwords do not match');
    }

    this.validatePassword(passwordData.newPassword);
  }

  /**
   * Validate password reset confirmation data
   */
  private validatePasswordResetConfirm(resetData: PasswordResetConfirmData): void {
    if (!resetData.token) {
      throw new Error('Reset token is required');
    }

    if (!resetData.newPassword) {
      throw new Error('New password is required');
    }

    if (!resetData.confirmNewPassword) {
      throw new Error('Password confirmation is required');
    }

    if (resetData.newPassword !== resetData.confirmNewPassword) {
      throw new Error('Passwords do not match');
    }

    this.validatePassword(resetData.newPassword);
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const authManager = gacpApiClient.getAuthManager();
    return authManager.isAuthenticated();
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any | null {
    const authManager = gacpApiClient.getAuthManager();
    return authManager.getUserData();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const authManager = gacpApiClient.getAuthManager();
    return authManager.hasRole(role);
  }

  /**
   * Check if current user has specific permission
   */
  hasPermission(permission: string): boolean {
    const authManager = gacpApiClient.getAuthManager();
    return authManager.hasPermission(permission);
  }

  /**
   * Get authentication manager instance
   */
  getAuthManager() {
    return gacpApiClient.getAuthManager();
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

// Create singleton instance
const gacpAuthService = GACPAuthService.getInstance();

// Export service (types already exported via export interface above)
export { gacpAuthService };

// Default export
export default gacpAuthService;
