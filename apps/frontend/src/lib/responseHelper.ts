/**
 * API Response Standardization Utilities
 * 
 * Provides consistent response format across the entire application
 * Handles different API response structures and normalizes them
 * 
 * @module responseHelper
 * @version 1.0.0
 * @date 2025-11-03
 */

/**
 * Standard API Response Interface
 */
export interface StandardResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

/**
 * Normalize API response to standard format
 * Handles various response structures from different endpoints
 */
export function normalizeResponse<T = any>(response: any): StandardResponse<T> {
  // If already in standard format
  if (response && typeof response === 'object') {
    // Case 1: { success, data, message }
    if ('success' in response) {
      return {
        success: response.success,
        message: response.message,
        data: response.data,
        error: response.error,
        errors: response.errors,
        meta: response.meta || response.pagination
      };
    }

    // Case 2: { data: { ... } } - Axios response
    if ('data' in response && typeof response.data === 'object') {
      return normalizeResponse(response.data);
    }

    // Case 3: Direct data object (no wrapper)
    // Assume success if we got a response
    return {
      success: true,
      data: response as T
    };
  }

  // Case 4: Primitive or null/undefined
  return {
    success: !!response,
    data: response as T
  };
}

/**
 * Extract data from various response formats
 * Returns the actual data regardless of wrapper structure
 */
export function extractData<T = any>(response: any): T | null {
  const normalized = normalizeResponse<T>(response);
  return normalized.data || null;
}

/**
 * Check if response indicates success
 */
export function isSuccess(response: any): boolean {
  const normalized = normalizeResponse(response);
  return normalized.success === true;
}

/**
 * Get error message from response
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data) {
    const data = error.response.data;
    return data.message || data.error || 'เกิดข้อผิดพลาด';
  }

  if (error?.message) {
    return error.message;
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

/**
 * Format success response
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  meta?: any
): StandardResponse<T> {
  return {
    success: true,
    message,
    data,
    meta
  };
}

/**
 * Format error response
 */
export function createErrorResponse(
  message: string,
  errors?: any[]
): StandardResponse {
  return {
    success: false,
    message,
    error: message,
    errors
  };
}

/**
 * Handle API pagination metadata
 */
export function extractPagination(response: any) {
  const normalized = normalizeResponse(response);
  
  if (normalized.meta) {
    return {
      total: normalized.meta.total || 0,
      page: normalized.meta.page || 1,
      limit: normalized.meta.limit || 10,
      pages: normalized.meta.pages || 1
    };
  }

  // Try to extract from data if it's an array
  if (Array.isArray(normalized.data)) {
    return {
      total: normalized.data.length,
      page: 1,
      limit: normalized.data.length,
      pages: 1
    };
  }

  return {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };
}

/**
 * Wrap async API call with error handling and normalization
 */
export async function safeApiCall<T = any>(
  apiCall: () => Promise<any>
): Promise<StandardResponse<T>> {
  try {
    const response = await apiCall();
    return normalizeResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: getErrorMessage(error)
    };
  }
}

export default {
  normalizeResponse,
  extractData,
  isSuccess,
  getErrorMessage,
  createSuccessResponse,
  createErrorResponse,
  extractPagination,
  safeApiCall
};
