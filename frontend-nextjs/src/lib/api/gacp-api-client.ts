/**
 * GACP Platform - Official API Client
 *
 * PURPOSE: Enterprise-grade API client specifically designed for GACP certification platform
 * COMPLIANCE: WHO GACP 2003, Thai FDA GACP 2018, FAO Guidelines, ASEAN standards
 * ARCHITECTURE: Clean architecture with proper separation of concerns
 *
 * BUSINESS LOGIC FOUNDATION:
 * - JWT authentication with role-based access control
 * - GACP workflow state management
 * - Critical Control Points (CCP) assessment
 * - Government API integration compliance
 * - Audit trail and logging requirements
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// ============================================================================
// CONFIGURATION - Based on Thai FDA GACP Requirements
// ============================================================================

const GACP_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
  TIMEOUT: 30000, // 30 seconds - Government standard
  VERSION: 'v1',

  // Authentication configuration
  AUTH: {
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer',
    STORAGE_KEY: 'gacp_auth_token',
    USER_STORAGE_KEY: 'gacp_user_data',
    REFRESH_THRESHOLD: 300, // 5 minutes before expiry
  },

  // GACP-specific endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY: '/api/auth/verify',
      PROFILE: '/api/auth/profile',
    },

    // GACP Business Logic endpoints
    GACP: {
      WORKFLOW: '/api/gacp/workflow',
      CCPS: '/api/gacp/ccps',
      TRANSITION: '/api/gacp/workflow/transition',
      ASSESSMENT: '/api/gacp/assessment',
      SCORE_CALCULATION: '/api/gacp/test/score-calculation',
    },

    // Application management
    APPLICATIONS: {
      LIST: '/api/applications',
      CREATE: '/api/applications',
      DETAIL: '/api/applications',
      UPDATE: '/api/applications',
      DELETE: '/api/applications',
      SUBMIT: '/api/applications/{id}/submit',
      REVIEW: '/api/applications/{id}/review',
    },

    // Document management
    DOCUMENTS: {
      UPLOAD: '/api/documents/upload',
      DOWNLOAD: '/api/documents/download',
      LIST: '/api/documents',
      DELETE: '/api/documents',
    },

    // Certificate management
    CERTIFICATES: {
      LIST: '/api/certificates',
      ISSUE: '/api/certificates/issue',
      VERIFY: '/api/certificates/verify',
      DOWNLOAD: '/api/certificates/download',
    },

    // System health and monitoring
    SYSTEM: {
      HEALTH: '/health',
      STATUS: '/api/status',
      VERSION: '/api/version',
    },
  },

  // Error handling configuration
  ERROR_HANDLING: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    RETRY_MULTIPLIER: 2, // Exponential backoff
  },
} as const;

// ============================================================================
// TYPE DEFINITIONS - GACP Platform Specific
// ============================================================================

export interface GACPApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  requestId?: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface GACPApiError {
  message: string;
  status?: number;
  code?: string;
  data?: any;
  timestamp?: string;
  requestId?: string;
}

export interface GACPAuthToken {
  token: string;
  expiresIn: number;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: 'farmer' | 'dtam_officer' | 'inspector' | 'admin';
    permissions: string[];
  };
}

export interface GACPWorkflowInfo {
  applicationStatuses: string[];
  workflowStates: number;
  transitions: number;
  framework: string;
  compliance: string[];
  workflowGraph: {
    nodes: Array<{
      id: string;
      label: string;
      allowedTransitions: string[];
      requiredActors: string[];
      requiredDocuments: string[] | string;
      timeLimit: number | null;
      businessRules: string[];
    }>;
    edges: Array<{
      from: string;
      to: string;
      weight: number;
    }>;
  };
}

export interface GACPCCPFramework {
  totalCCPs: number;
  ccps: Array<{
    id: string;
    name: string;
    name_th: string;
    criteria: any[];
    weight: number;
    min_score: number;
    compliance_standards: string[];
  }>;
  scoringSystem: {
    TOTAL_SCORE_MAX: number;
    OVERALL_PASSING_SCORE: number;
    CERTIFICATE_LEVELS: {
      GOLD: any;
      SILVER: any;
      BRONZE: any;
    };
    RISK_LEVELS: {
      LOW: any;
      MEDIUM: any;
      HIGH: any;
    };
  };
  framework: string;
  methodology: string;
}

// ============================================================================
// AUTHENTICATION MANAGER - JWT Token Management
// ============================================================================

class GACPAuthManager {
  private static instance: GACPAuthManager;

  public static getInstance(): GACPAuthManager {
    if (!GACPAuthManager.instance) {
      GACPAuthManager.instance = new GACPAuthManager();
    }
    return GACPAuthManager.instance;
  }

  /**
   * Get authentication token from secure storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(GACP_API_CONFIG.AUTH.STORAGE_KEY);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Set authentication token in secure storage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(GACP_API_CONFIG.AUTH.STORAGE_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  /**
   * Get user data from secure storage
   */
  getUserData(): any | null {
    if (typeof window === 'undefined') return null;

    try {
      const userData = localStorage.getItem(GACP_API_CONFIG.AUTH.USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Set user data in secure storage
   */
  setUserData(userData: any): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(GACP_API_CONFIG.AUTH.USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(GACP_API_CONFIG.AUTH.STORAGE_KEY);
      localStorage.removeItem(GACP_API_CONFIG.AUTH.USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(requiredRole: string): boolean {
    const userData = this.getUserData();
    return userData?.role === requiredRole;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const userData = this.getUserData();
    return userData?.permissions?.includes(permission) || false;
  }
}

// ============================================================================
// GACP API CLIENT - Enterprise Grade Implementation
// ============================================================================

class GACPApiClient {
  private client: AxiosInstance;
  private authManager: GACPAuthManager;
  private requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.authManager = GACPAuthManager.getInstance();
    this.requestQueue = new Map();
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create properly configured Axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: GACP_API_CONFIG.BASE_URL,
      timeout: GACP_API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Platform': 'GACP-Frontend',
      },
      // Enable automatic compression
      decompress: true,
      // Validate status codes
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add authentication and common headers
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = this.authManager.getToken();
        if (token && config.headers) {
          config.headers[GACP_API_CONFIG.AUTH.TOKEN_HEADER] =
            `${GACP_API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`;
        }

        // Add request timestamp
        config.headers['X-Request-Timestamp'] = new Date().toISOString();

        // Add user role for backend authorization
        const userData = this.authManager.getUserData();
        if (userData?.role) {
          config.headers['X-User-Role'] = userData.role;
        }

        // Log request for audit purposes
        console.log(`[GACP API] ${config.method?.toUpperCase()} ${config.url}`, {
          timestamp: new Date().toISOString(),
          headers: config.headers,
        });

        return config;
      },
      (error: AxiosError) => {
        console.error('[GACP API] Request Error:', error);
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor - Handle common responses and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response for audit
        console.log(`[GACP API] Response ${response.status}:`, {
          url: response.config.url,
          timestamp: new Date().toISOString(),
          data: response.data,
        });

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Clear invalid token
          this.authManager.clearAuth();

          // Redirect to login page
          if (typeof window !== 'undefined') {
            console.warn('[GACP API] Authentication failed, redirecting to login');
            window.location.href = '/login';
          }

          return Promise.reject(this.formatError(error));
        }

        // Handle 403 Forbidden - Insufficient permissions
        if (error.response?.status === 403) {
          console.error('[GACP API] Access denied - insufficient permissions');
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
          console.error('[GACP API] Resource not found');
        }

        // Handle 500 Internal Server Error
        if (error.response?.status === 500) {
          console.error('[GACP API] Server error - please try again later');
        }

        // Handle network errors
        if (!error.response) {
          console.error('[GACP API] Network error - unable to connect to server');
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Format error response for consistent error handling
   */
  private formatError(error: AxiosError): GACPApiError {
    const errorData = error.response?.data as any;

    return {
      message: errorData?.message || error.message || 'An unknown error occurred',
      status: error.response?.status,
      code: errorData?.code || error.code,
      data: errorData,
      timestamp: new Date().toISOString(),
      requestId: errorData?.requestId,
    };
  }

  /**
   * Generic GET request with proper error handling
   */
  async get<T>(url: string, config?: any): Promise<GACPApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Generic POST request with proper error handling
   */
  async post<T>(url: string, data?: any, config?: any): Promise<GACPApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Generic PUT request with proper error handling
   */
  async put<T>(url: string, data?: any, config?: any): Promise<GACPApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Generic DELETE request with proper error handling
   */
  async delete<T>(url: string, config?: any): Promise<GACPApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * File upload with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<GACPApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(Math.round(progress));
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========================================================================
  // GACP-SPECIFIC API METHODS
  // ========================================================================

  /**
   * Get GACP workflow information
   */
  async getGACPWorkflow(): Promise<GACPApiResponse<GACPWorkflowInfo>> {
    return this.get<GACPWorkflowInfo>(GACP_API_CONFIG.ENDPOINTS.GACP.WORKFLOW);
  }

  /**
   * Get Critical Control Points framework
   */
  async getGACPCCPs(): Promise<GACPApiResponse<GACPCCPFramework>> {
    return this.get<GACPCCPFramework>(GACP_API_CONFIG.ENDPOINTS.GACP.CCPS);
  }

  /**
   * Perform workflow transition
   */
  async performWorkflowTransition(
    applicationId: string,
    transition: {
      from: string;
      to: string;
      actor: string;
      data?: any;
    }
  ): Promise<GACPApiResponse<any>> {
    return this.post(GACP_API_CONFIG.ENDPOINTS.GACP.TRANSITION, {
      applicationId,
      ...transition,
    });
  }

  /**
   * Calculate CCP assessment score
   */
  async calculateCCPScore(assessmentData: any): Promise<GACPApiResponse<any>> {
    return this.post(GACP_API_CONFIG.ENDPOINTS.GACP.SCORE_CALCULATION, assessmentData);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<GACPApiResponse<any>> {
    return this.get(GACP_API_CONFIG.ENDPOINTS.SYSTEM.HEALTH);
  }

  /**
   * Get authentication manager instance
   */
  getAuthManager(): GACPAuthManager {
    return this.authManager;
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

// Create singleton instance
const gacpApiClient = new GACPApiClient();

// Export everything needed for the application
export { gacpApiClient, GACPAuthManager, GACP_API_CONFIG };

export type { GACPApiResponse, GACPApiError, GACPAuthToken, GACPWorkflowInfo, GACPCCPFramework };

// Default export
export default gacpApiClient;
