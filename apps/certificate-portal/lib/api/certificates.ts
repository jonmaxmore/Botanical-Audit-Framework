import axios from 'axios';
import {
  Certificate,
  CertificateFormData,
  CertificateStats,
  CertificateFilters,
} from '@/lib/types/certificate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cert_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Certificate API
export const certificateApi = {
  // Get all certificates with filters
  getAll: async (filters?: CertificateFilters) => {
    const response = await api.get<Certificate[]>('/certificates', { params: filters });
    return response.data;
  },

  // Get certificate by ID
  getById: async (id: string) => {
    const response = await api.get<Certificate>(`/certificates/${id}`);
    return response.data;
  },

  // Create new certificate
  create: async (data: CertificateFormData) => {
    const response = await api.post<Certificate>('/certificates', data);
    return response.data;
  },

  // Update certificate
  update: async (id: string, data: Partial<CertificateFormData>) => {
    const response = await api.put<Certificate>(`/certificates/${id}`, data);
    return response.data;
  },

  // Delete certificate
  delete: async (id: string) => {
    await api.delete(`/certificates/${id}`);
  },

  // Approve certificate
  approve: async (id: string) => {
    const response = await api.post<Certificate>(`/certificates/${id}/approve`);
    return response.data;
  },

  // Reject certificate
  reject: async (id: string, reason: string) => {
    const response = await api.post<Certificate>(`/certificates/${id}/reject`, { reason });
    return response.data;
  },

  // Revoke certificate
  revoke: async (id: string, reason: string) => {
    const response = await api.post<Certificate>(`/certificates/${id}/revoke`, { reason });
    return response.data;
  },

  // Generate QR code
  generateQR: async (id: string) => {
    const response = await api.get<{ qrCode: string }>(`/certificates/${id}/qr`);
    return response.data.qrCode;
  },

  // Generate PDF
  generatePDF: async (id: string) => {
    const response = await api.get(`/certificates/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Validate certificate
  validate: async (certificateNumber: string) => {
    const response = await api.post<{ valid: boolean; certificate?: Certificate }>(
      '/certificates/validate',
      { certificateNumber }
    );
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get<CertificateStats>('/certificates/stats');
    return response.data;
  },

  // Search certificates
  search: async (query: string) => {
    const response = await api.get<Certificate[]>('/certificates/search', { params: { q: query } });
    return response.data;
  },
};

export default certificateApi;
