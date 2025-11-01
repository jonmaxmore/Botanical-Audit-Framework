import apiClient, { ApiResponse, handleApiError } from './client';

// Document interface matching backend model
export interface Document {
  _id: string;
  userId: string;
  documentTitle: string;
  documentType: string;
  description?: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

// Document list response
export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

// Document upload parameters
export interface DocumentUploadParams {
  documentTitle: string;
  documentType: string;
  description?: string;
  file: File;
}

// Document filter parameters
export interface DocumentFilterParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  documentType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Upload document
export const uploadDocument = async (
  params: DocumentUploadParams
): Promise<ApiResponse<Document>> => {
  try {
    const formData = new FormData();
    formData.append('documentTitle', params.documentTitle);
    formData.append('documentType', params.documentType);
    if (params.description) {
      formData.append('description', params.description);
    }
    formData.append('document', params.file);

    const response = await apiClient.post<ApiResponse<Document>>(
      '/api/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Get documents list
export const getDocuments = async (
  params?: DocumentFilterParams
): Promise<ApiResponse<DocumentListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<DocumentListResponse>>('/api/documents', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        status: params?.status !== 'all' ? params?.status : undefined,
        documentType: params?.documentType,
        search: params?.search,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });

    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Get single document by ID
export const getDocumentById = async (documentId: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await apiClient.get<ApiResponse<Document>>(`/api/documents/${documentId}`);
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Download document
export const downloadDocument = async (documentId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Delete document
export const deleteDocument = async (documentId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete<ApiResponse>(`/api/documents/${documentId}`);
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Get document statistics
export interface DocumentStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const getDocumentStatistics = async (): Promise<ApiResponse<DocumentStatistics>> => {
  try {
    const response = await apiClient.get<ApiResponse<DocumentStatistics>>(
      '/api/documents/statistics'
    );
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// ============================================================================
// NOTE: Application-related interfaces and functions have been MOVED to:
// ./applications.ts
//
// This prevents duplication and maintains a single source of truth.
// Please import from: import { Application, ... } from './applications';
// ============================================================================
