/**
 * Applications API Client
 * Admin Portal - Application Review & Management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ==================== Interfaces ====================

export interface Application {
  id: string;
  applicationNumber: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  farmName: string;
  farmLocation: {
    province: string;
    district: string;
    subdistrict: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cropType: 'cannabis' | 'turmeric' | 'ginger' | 'black_galingale' | 'plai' | 'kratom';
  cultivationType: 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE' | 'MIXED';
  farmSize: number;
  farmSizeUnit: 'rai' | 'hectare';
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'inspection_pending'
    | 'inspection_in_progress'
    | 'approved'
    | 'rejected'
    | 'certificate_issued';
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  assignedReviewer?: {
    id: string;
    name: string;
    email: string;
  };
  assignedInspector?: {
    id: string;
    name: string;
    email: string;
  };
  documents: ApplicationDocument[];
  payments: Payment[];
  comments: Comment[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  category: 'identity' | 'farm_ownership' | 'cultivation_plan' | 'photo' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Payment {
  id: string;
  phase: 1 | 2;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
  receiptUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  type: 'review' | 'inspection' | 'general';
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
}

export interface ApplicationsListResponse {
  success: boolean;
  data: Application[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

export interface ReviewDecision {
  decision: 'approve' | 'reject' | 'request_changes';
  comments: string;
  documentsVerified: boolean;
  inspectionRequired: boolean;
  assignInspectorId?: string;
}

export interface InspectionResult {
  passed: boolean;
  score: number;
  findings: string;
  recommendations: string;
  photos?: string[];
}

// ==================== Helper Functions ====================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token') || localStorage.getItem('dtam_token');
}

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// ==================== API Functions ====================

/**
 * Get all applications with filters
 */
export async function getApplications(params?: {
  page?: number;
  limit?: number;
  status?: string;
  cropType?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ApplicationsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.cropType) queryParams.append('cropType', params.cropType);
  if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`${API_BASE_URL}/applications?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<ApplicationsListResponse>(response);
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  id: string
): Promise<{ success: boolean; data: Application }> {
  const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; data: Application }>(response);
}

/**
 * Assign reviewer to application
 */
export async function assignReviewer(
  applicationId: string,
  reviewerId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/assign-reviewer`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ reviewerId }),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Start document review
 */
export async function startReview(
  applicationId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/review`, {
    method: 'POST',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Complete document review with decision
 */
export async function completeReview(
  applicationId: string,
  decision: ReviewDecision
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/review/complete`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(decision),
  });

  return handleResponse<{ success: boolean; message: string; data: Application }>(response);
}

/**
 * Assign inspector to application
 */
export async function assignInspector(
  applicationId: string,
  inspectorId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/assign-inspector`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ inspectorId }),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Start field inspection
 */
export async function startInspection(
  applicationId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/inspection/start`, {
    method: 'POST',
    headers: createHeaders(),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Complete field inspection
 */
export async function completeInspection(
  applicationId: string,
  result: InspectionResult
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/inspection/complete`,
    {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(result),
    }
  );

  return handleResponse<{ success: boolean; message: string; data: Application }>(response);
}

/**
 * Approve application (Final approval)
 */
export async function approveApplication(
  applicationId: string,
  approvalData: {
    comments: string;
    certificateData?: Record<string, any>;
  }
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/approve`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(approvalData),
  });

  return handleResponse<{ success: boolean; message: string; data: Application }>(response);
}

/**
 * Reject application
 */
export async function rejectApplication(
  applicationId: string,
  rejectionData: {
    reason: string;
    comments: string;
  }
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/reject`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(rejectionData),
  });

  return handleResponse<{ success: boolean; message: string; data: Application }>(response);
}

/**
 * Add comment to application
 */
export async function addComment(
  applicationId: string,
  commentData: {
    message: string;
    type?: 'review' | 'inspection' | 'general';
  }
): Promise<{ success: boolean; message: string; data: Comment }> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/comments`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(commentData),
  });

  return handleResponse<{ success: boolean; message: string; data: Comment }>(response);
}

/**
 * Verify document
 */
export async function verifyDocument(
  applicationId: string,
  documentId: string,
  verified: boolean,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/documents/${documentId}/verify`,
    {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ verified, rejectionReason }),
    }
  );

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Get application statistics
 */
export async function getApplicationStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCropType: Record<string, number>;
  byProvince: Record<string, number>;
  recentActivity: TimelineEvent[];
}> {
  const response = await fetch(`${API_BASE_URL}/applications/stats`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse(response);
}

/**
 * Export applications to CSV
 */
export async function exportApplicationsCSV(filters?: {
  status?: string;
  cropType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.cropType) queryParams.append('cropType', filters.cropType);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const response = await fetch(`${API_BASE_URL}/applications/export/csv?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to export applications');
  }

  return response.blob();
}

/**
 * Get mock applications data for development
 */
export function getMockApplicationsData(): Application[] {
  return [
    {
      id: '1',
      applicationNumber: 'GACP-2025-0125',
      farmerId: 'f001',
      farmerName: 'นายสมชาย ใจดี',
      farmerEmail: 'somchai@example.com',
      farmName: 'ฟาร์มกัญชาเชียงใหม่',
      farmLocation: {
        province: 'เชียงใหม่',
        district: 'แม่ริม',
        subdistrict: 'ริมใต้',
        coordinates: { latitude: 18.8969, longitude: 98.9164 },
      },
      cropType: 'cannabis',
      cultivationType: 'GREENHOUSE',
      farmSize: 5,
      farmSizeUnit: 'rai',
      status: 'submitted',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      documents: [],
      payments: [
        { id: 'p1', phase: 1, amount: 5000, status: 'paid', paidAt: new Date().toISOString() },
      ],
      comments: [],
      timeline: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Add more mock data...
  ];
}
