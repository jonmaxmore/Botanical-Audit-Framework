import { apiClient, ApiResponse, handleApiError } from './client';

// Application interface matching backend model
export interface Application {
  _id: string;
  userId: string;
  farmerName: string;
  farmName: string;
  documentId: string;
  documentTitle: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  submitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  urgency: 'low' | 'medium' | 'high';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

// Application list response
export interface ApplicationListResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
}

// Application filter parameters
export interface ApplicationFilterParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  urgency?: 'low' | 'medium' | 'high' | 'all';
  documentType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Review application parameters
export interface ReviewApplicationParams {
  applicationId: string;
  status: 'approved' | 'rejected';
  reviewComment?: string;
}

// Statistics response
export interface ApplicationStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highPriority: number;
}

// Get applications list (DTAM only)
export const getApplications = async (
  params?: ApplicationFilterParams
): Promise<ApiResponse<ApplicationListResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<ApplicationListResponse>>(
      '/api/dtam/applications',
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          status: params?.status !== 'all' ? params?.status : undefined,
          urgency: params?.urgency !== 'all' ? params?.urgency : undefined,
          documentType: params?.documentType,
          search: params?.search,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      }
    );

    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Get single application by ID (DTAM only)
export const getApplicationById = async (
  applicationId: string
): Promise<ApiResponse<Application>> => {
  try {
    const response = await apiClient.get<ApiResponse<Application>>(
      `/api/dtam/applications/${applicationId}`
    );
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Review application (DTAM only)
export const reviewApplication = async (
  params: ReviewApplicationParams
): Promise<ApiResponse<Application>> => {
  try {
    const response = await apiClient.put<ApiResponse<Application>>(
      `/api/dtam/applications/${params.applicationId}/review`,
      {
        status: params.status,
        reviewComment: params.reviewComment,
      }
    );

    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Get application statistics (DTAM only)
export const getApplicationStatistics = async (): Promise<ApiResponse<ApplicationStatistics>> => {
  try {
    const response = await apiClient.get<ApiResponse<ApplicationStatistics>>(
      '/api/dtam/applications/statistics'
    );
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

// Download application document (DTAM only)
export const downloadApplicationDocument = async (applicationId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/api/dtam/applications/${applicationId}/download`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};
