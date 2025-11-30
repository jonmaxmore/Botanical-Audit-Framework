import { apiClient } from './client';
import { ApiResponse } from '@gacp/utils';

export interface Certificate {
  _id: string;
  certificateNumber: string;
  farmName: string;
  cropTypes: string[];
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  pdfUrl?: string;
  qrCode?: string;
}

export const certificatesApi = {
  getMyCertificates: async (): Promise<ApiResponse<Certificate[]>> => {
    const response = await apiClient.get<ApiResponse<Certificate[]>>(
      '/certificates/my-certificates'
    );
    return response.data;
  },

  getCertificate: async (id: string): Promise<ApiResponse<Certificate>> => {
    const response = await apiClient.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return response.data;
  },
};
