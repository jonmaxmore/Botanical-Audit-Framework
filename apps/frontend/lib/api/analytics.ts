/**
 * Analytics API Client
 * Feature 3: Analytics Dashboard
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AnalyticsOverview {
  overview: {
    totalApplications: number;
    totalDocuments: number;
    totalCertificates: number;
    totalInspections: number;
    totalUsers: number;
    totalNotifications: number;
    pendingApplications: number;
    pendingDocuments: number;
    activeInspections: number;
    activeCertificates: number;
  };
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
}

interface ApplicationStats {
  total: number;
  approvalRate: number;
  statusBreakdown: Record<string, { count: number; avgProcessingTime: number }>;
  trends: Array<{ date: string; count: number }>;
}

interface DocumentStats {
  total: number;
  approvalRate: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

interface CertificateStats {
  total: number;
  byStatus: Record<string, number>;
  byCropType: Array<{ cropType: string; count: number }>;
  monthlyTrends: Array<{ period: string; count: number }>;
}

interface InspectionStats {
  total: number;
  completionRate: number;
  averageScore: number;
  byStatus: Record<string, { count: number; avgScore: number }>;
}

interface UserStats {
  total: number;
  activeUsers: number;
  byRole: Record<string, number>;
}

interface TrendData {
  period: string;
  type: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  trends: Array<{ date: string; count: number }>;
}

/**
 * Get authentication token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Create headers with authentication
 */
function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }
  const data = await response.json();
  return data.success !== false ? data : Promise.reject(new Error(data.message));
}

/**
 * Get analytics overview
 */
export async function getAnalyticsOverview(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AnalyticsOverview> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/overview${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<AnalyticsOverview>(response);
}

/**
 * Get application statistics
 */
export async function getApplicationStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApplicationStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/applications${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<ApplicationStats>(response);
}

/**
 * Get document statistics
 */
export async function getDocumentStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DocumentStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/documents${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<DocumentStats>(response);
}

/**
 * Get certificate statistics
 */
export async function getCertificateStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CertificateStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/certificates${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<CertificateStats>(response);
}

/**
 * Get inspection statistics
 */
export async function getInspectionStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<InspectionStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/inspections${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<InspectionStats>(response);
}

/**
 * Get user statistics
 */
export async function getUserStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<UserStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/users${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<UserStats>(response);
}

/**
 * Get trend data for charts
 */
export async function getTrendData(params: {
  period: '7days' | '30days' | '90days' | '1year';
  type: 'applications' | 'documents' | 'certificates' | 'inspections';
}): Promise<TrendData> {
  const queryParams = new URLSearchParams();
  queryParams.append('period', params.period);
  queryParams.append('type', params.type);

  const url = `${API_BASE_URL}/analytics/trends?${queryParams}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  return handleResponse<TrendData>(response);
}

/**
 * Export analytics data
 */
export async function exportAnalytics(params: {
  format: 'json' | 'csv';
  type: 'overview' | 'applications' | 'documents' | 'certificates' | 'inspections';
  startDate?: string;
  endDate?: string;
}): Promise<Blob | any> {
  const queryParams = new URLSearchParams();
  queryParams.append('format', params.format);
  queryParams.append('type', params.type);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/analytics/export?${queryParams}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders()
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  if (params.format === 'csv') {
    return response.blob();
  } else {
    return response.json();
  }
}
