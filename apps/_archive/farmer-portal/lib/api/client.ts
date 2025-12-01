import { createApiClient } from '@gacp/utils';

// Export types re-exported from utils if needed, or rely on utils
export type { ApiResponse, ApiError } from '@gacp/utils';

export const apiClient = createApiClient({
  authTokenKey: 'token', // Farmer portal uses 'token'
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
});

export const handleApiError = (error: any) => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || error.message,
      status: error.response.status,
      data: error.response.data,
    };
  }
  return { message: error.message || 'An unknown error occurred' };
};
