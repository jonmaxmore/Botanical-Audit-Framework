/**
 * Applications API Client
 * Admin Portal - Application Review & Management
 */

import apiClient from '@/lib/api-client';

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
  const response = await apiClient.get('/applications', { params });
  return response.data;
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  id: string
): Promise<{ success: boolean; data: Application }> {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data;
}

/**
 * Assign reviewer to application
 */
export async function assignReviewer(
  applicationId: string,
  reviewerId: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/applications/${applicationId}/assign-reviewer`, { reviewerId });
  return response.data;
}

/**
 * Start document review
 */
export async function startReview(
  applicationId: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/applications/${applicationId}/review`);
  return response.data;
}

/**
 * Complete document review with decision
 */
export async function completeReview(
  applicationId: string,
  decision: ReviewDecision
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await apiClient.post(`/applications/${applicationId}/review/complete`, decision);
  return response.data;
}

/**
 * Assign inspector to application
 */
export async function assignInspector(
  applicationId: string,
  inspectorId: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/applications/${applicationId}/assign-inspector`, { inspectorId });
  return response.data;
}

/**
 * Start field inspection
 */
export async function startInspection(
  applicationId: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/applications/${applicationId}/inspection/start`);
  return response.data;
}

/**
 * Complete field inspection
 */
export async function completeInspection(
  applicationId: string,
  result: InspectionResult
): Promise<{ success: boolean; message: string; data: Application }> {
  const response = await apiClient.post(`/applications/${applicationId}/inspection/complete`, result);
  return response.data;
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
  const response = await apiClient.post(`/applications/${applicationId}/approve`, approvalData);
  return response.data;
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
  const response = await apiClient.post(`/applications/${applicationId}/reject`, rejectionData);
  return response.data;
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
  const response = await apiClient.post(`/applications/${applicationId}/comments`, commentData);
  return response.data;
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
  const response = await apiClient.post(`/applications/${applicationId}/documents/${documentId}/verify`, { verified, rejectionReason });
  return response.data;
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
  const response = await apiClient.get('/applications/stats');
  return response.data.data;
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
  const response = await apiClient.get('/applications/export/csv', { params: filters, responseType: 'blob' });
  return response.data;
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

