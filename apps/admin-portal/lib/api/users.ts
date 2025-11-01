/**
 * User Management API Client
 * Admin Portal - Backend Integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'inspector' | 'approver' | 'farmer' | 'manager' | 'viewer';
  department?: string;
  position?: string;
  location?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: User['role'];
  department?: string;
  position?: string;
  location?: string;
  avatar?: string;
  password?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

/**
 * Create headers with authentication
 */
function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get all users with optional filters
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}): Promise<UsersListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<UsersListResponse>(response);
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; data: User }>(response);
}

/**
 * Create new user
 */
export async function createUser(
  userData: UserFormData
): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse<{ success: boolean; data: User }>(response);
}

/**
 * Update existing user
 */
export async function updateUser(
  id: string,
  userData: Partial<UserFormData>
): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse<{ success: boolean; data: User }>(response);
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Search users
 */
export async function searchUsers(query: string): Promise<UsersListResponse> {
  const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<UsersListResponse>(response);
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<{ success: boolean; data: UserStats }> {
  const response = await fetch(`${API_BASE_URL}/users/stats`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; data: UserStats }>(response);
}

/**
 * Update user status
 */
export async function updateUserStatus(
  id: string,
  status: User['status']
): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
    method: 'PATCH',
    headers: createHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse<{ success: boolean; data: User }>(response);
}

/**
 * Reset user password (Admin only)
 */
export async function resetUserPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ password: newPassword }),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Get user activity log
 */
export async function getUserActivity(
  id: string,
  params?: { page?: number; limit?: number }
): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    action: string;
    details: string;
    ip: string;
    timestamp: string;
  }>;
}> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/users/${id}/activity?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse(response);
}

/**
 * Bulk update users
 */
export async function bulkUpdateUsers(
  userIds: string[],
  updates: Partial<User>
): Promise<{ success: boolean; updated: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/bulk-update`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ userIds, updates }),
  });

  return handleResponse<{ success: boolean; updated: number; message: string }>(response);
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(
  userIds: string[]
): Promise<{ success: boolean; deleted: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/bulk-delete`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ userIds }),
  });

  return handleResponse<{ success: boolean; deleted: number; message: string }>(response);
}

/**
 * Export users to CSV
 */
export async function exportUsersCSV(filters?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (filters?.role) queryParams.append('role', filters.role);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.search) queryParams.append('search', filters.search);

  const response = await fetch(`${API_BASE_URL}/users/export/csv?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to export CSV: ${response.statusText}`);
  }

  return response.blob();
}
