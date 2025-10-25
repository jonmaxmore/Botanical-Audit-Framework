import axios, { AxiosError } from 'axios';
import {
  Certificate,
  CertificateFormData,
  CertificateStats,
  CertificateFilters,
} from '@/lib/types/certificate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';
const API_BASE_PATH = '/certificates';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds for large PDF/QR operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Refactor interceptor tests to achieve 70% branch coverage
// Current approach with full axios mocks bypasses interceptor logic
// Consider: Integration tests or partial mocks for interceptor branches
// Add token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('cert_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 - Redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('cert_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors with retry
    if (error.message.includes('Network Error') && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

// Certificate API - Connected to real backend
export const certificateApi = {
  /**
   * Get all certificates with pagination and filters
   * Backend: GET /api/certificates?page=1&limit=10&status=active
   */
  getAll: async (filters?: CertificateFilters) => {
    try {
      const response = await api.get<{
        success: boolean;
        data: Certificate[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(API_BASE_PATH, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      throw error;
    }
  },

  /**
   * Get certificate by ID
   * Backend: GET /api/certificates/:id
   */
  getById: async (id: string) => {
    try {
      const response = await api.get<{ success: boolean; data: Certificate }>(
        `${API_BASE_PATH}/${id}`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get certificate by certificate number
   * Backend: GET /api/certificates/number/:certificateNumber
   */
  getByCertificateNumber: async (certificateNumber: string) => {
    try {
      const response = await api.get<{ success: boolean; data: Certificate }>(
        `${API_BASE_PATH}/number/${certificateNumber}`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch certificate by number ${certificateNumber}:`, error);
      throw error;
    }
  },

  /**
   * Create new certificate
   * Backend: POST /api/certificates
   */
  create: async (data: CertificateFormData) => {
    try {
      const response = await api.post<{ success: boolean; data: Certificate }>(
        API_BASE_PATH,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create certificate:', error);
      throw error;
    }
  },

  /**
   * Update certificate
   * Backend: PUT /api/certificates/:id
   */
  update: async (id: string, data: Partial<CertificateFormData>) => {
    try {
      const response = await api.put<{ success: boolean; data: Certificate }>(
        `${API_BASE_PATH}/${id}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete certificate
   * Backend: DELETE /api/certificates/:id
   */
  delete: async (id: string) => {
    try {
      await api.delete(`${API_BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Failed to delete certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Renew certificate
   * Backend: POST /api/certificates/:id/renew
   */
  renew: async (id: string) => {
    try {
      const response = await api.post<{ success: boolean; data: Certificate }>(
        `${API_BASE_PATH}/${id}/renew`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to renew certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Revoke certificate
   * Backend: POST /api/certificates/:id/revoke
   */
  revoke: async (id: string, reason: string) => {
    try {
      const response = await api.post<{ success: boolean; data: Certificate }>(
        `${API_BASE_PATH}/${id}/revoke`,
        { reason },
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to revoke certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download certificate PDF
   * Backend: GET /api/certificates/:id/download
   */
  downloadPDF: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE_PATH}/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download PDF for certificate ${id}:`, error);
      throw error;
    }
  },

  /**
   * Verify certificate (public endpoint)
   * Backend: GET /api/certificates/verify/:certificateNumber
   */
  verify: async (certificateNumber: string) => {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          valid: boolean;
          certificate?: Certificate;
          message?: string;
        };
      }>(`${API_BASE_PATH}/verify/${certificateNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to verify certificate ${certificateNumber}:`, error);
      throw error;
    }
  },

  /**
   * Get certificate statistics
   * Backend: GET /api/certificates/stats
   */
  getStats: async () => {
    try {
      const response = await api.get<{ success: boolean; data: CertificateStats }>(
        `${API_BASE_PATH}/stats`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch certificate stats:', error);
      throw error;
    }
  },

  /**
   * Get expiring certificates
   * Backend: GET /api/certificates/expiring?days=30
   */
  getExpiring: async (days: number = 30) => {
    try {
      const response = await api.get<{ success: boolean; data: Certificate[] }>(
        `${API_BASE_PATH}/expiring`,
        { params: { days } },
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch expiring certificates:', error);
      throw error;
    }
  },

  /**
   * Get certificates by user
   * Backend: GET /api/certificates/user/:userId
   */
  getByUserId: async (userId: string) => {
    try {
      const response = await api.get<{ success: boolean; data: Certificate[] }>(
        `${API_BASE_PATH}/user/${userId}`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch certificates for user ${userId}:`, error);
      throw error;
    }
  },
};

export default certificateApi;
