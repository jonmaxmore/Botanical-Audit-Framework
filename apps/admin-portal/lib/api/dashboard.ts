/**
 * Dashboard API Client
 * Admin Portal - Analytics & Statistics Integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==================== Interfaces ====================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    api: 'operational' | 'down';
  };
}

export interface DashboardStats {
  totalApplications: number;
  totalUsers: number;
  totalFarmers: number;
  totalInspectors: number;
  totalCertificates: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  cropStats: {
    cannabis: number;
    turmeric: number;
    ginger: number;
    blackGalingale: number;
    plai: number;
    kratom: number;
  };
}

export interface RealtimeStats {
  activeUsers: number;
  onlineInspectors: number;
  pendingReviews: number;
  todayApplications: number;
  todayApprovals: number;
  systemLoad: number;
  apiResponseTime: number;
}

export interface ApplicationTrend {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface CropDistribution {
  cropType: string;
  count: number;
  percentage: number;
}

export interface RegionalData {
  region: string;
  province: string;
  applications: number;
  certificates: number;
  farmers: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  trends: {
    applications: ApplicationTrend[];
    revenue: Array<{ month: string; amount: number }>;
  };
  cropDistribution: CropDistribution[];
  regionalData: RegionalData[];
  recentActivity: Array<{
    id: string;
    type: 'application' | 'approval' | 'rejection' | 'certificate';
    description: string;
    timestamp: string;
    user: string;
  }>;
  topPerformers: {
    inspectors: Array<{
      id: string;
      name: string;
      completedInspections: number;
      avgRating: number;
    }>;
    regions: Array<{
      region: string;
      applications: number;
      successRate: number;
    }>;
  };
}

export interface FarmerStats {
  totalFarms: number;
  totalApplications: number;
  activeCertificates: number;
  pendingReviews: number;
  cropTypes: string[];
  certificationStatus: 'none' | 'pending' | 'certified' | 'expired';
}

export interface DTAMStats {
  assignedApplications: number;
  completedReviews: number;
  pendingInspections: number;
  averageReviewTime: number;
  performanceRating: number;
}

// ==================== Helper Functions ====================

/**
 * Get authentication token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token') || localStorage.getItem('dtam_token');
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

  const data = await response.json();
  return data.data || data;
}

// ==================== API Functions ====================

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const response = await fetch(`${API_BASE_URL}/dashboard/health`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<SystemHealth>(response);
}

/**
 * Get realtime statistics
 */
export async function getRealtimeStats(): Promise<RealtimeStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/realtime`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<RealtimeStats>(response);
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<AdminDashboard>(response);
}

/**
 * Get dashboard stats (general)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<DashboardStats>(response);
}

/**
 * Get farmer-specific dashboard
 */
export async function getFarmerDashboard(userId: string): Promise<FarmerStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/farmer/${userId}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<FarmerStats>(response);
}

/**
 * Get DTAM staff statistics
 */
export async function getDTAMStats(): Promise<DTAMStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/dtam`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<DTAMStats>(response);
}

/**
 * Get application trends
 */
export async function getApplicationTrends(params?: {
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'week' | 'month';
}): Promise<ApplicationTrend[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.interval) queryParams.append('interval', params.interval);

  const response = await fetch(`${API_BASE_URL}/dashboard/trends/applications?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<ApplicationTrend[]>(response);
}

/**
 * Get crop distribution
 */
export async function getCropDistribution(): Promise<CropDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/crops`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<CropDistribution[]>(response);
}

/**
 * Get regional statistics
 */
export async function getRegionalStats(): Promise<RegionalData[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/regional`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<RegionalData[]>(response);
}

/**
 * Get revenue statistics
 */
export async function getRevenueStats(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}): Promise<Array<{ period: string; amount: number; count: number }>> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

  const response = await fetch(`${API_BASE_URL}/dashboard/stats/revenue?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse(response);
}

/**
 * Get inspector performance metrics
 */
export async function getInspectorPerformance(): Promise<
  Array<{
    id: string;
    name: string;
    completedInspections: number;
    pendingInspections: number;
    avgRating: number;
    avgCompletionTime: number;
  }>
> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats/inspectors`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse(response);
}

/**
 * Export dashboard data to CSV
 */
export async function exportDashboardCSV(
  type: 'applications' | 'users' | 'revenue'
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/dashboard/export/${type}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to export ${type} data`);
  }

  return response.blob();
}

/**
 * Get mock dashboard data for development
 */
export function getMockDashboardData(): AdminDashboard {
  return {
    stats: {
      totalApplications: 1248,
      totalUsers: 856,
      totalFarmers: 654,
      totalInspectors: 48,
      totalCertificates: 892,
      pendingApplications: 127,
      approvedApplications: 892,
      rejectedApplications: 229,
      revenue: {
        total: 37440000, // 30,000 THB * 1248
        thisMonth: 3750000,
        lastMonth: 3600000,
      },
      cropStats: {
        cannabis: 945, // Cannabis first!
        turmeric: 156,
        ginger: 78,
        blackGalingale: 34,
        plai: 23,
        kratom: 12,
      },
    },
    trends: {
      applications: [
        { date: '2025-10-21', submitted: 45, approved: 38, rejected: 5, pending: 2 },
        { date: '2025-10-22', submitted: 52, approved: 42, rejected: 7, pending: 3 },
        { date: '2025-10-23', submitted: 38, approved: 35, rejected: 2, pending: 1 },
        { date: '2025-10-24', submitted: 61, approved: 48, rejected: 9, pending: 4 },
        { date: '2025-10-25', submitted: 55, approved: 51, rejected: 3, pending: 1 },
        { date: '2025-10-26', submitted: 48, approved: 44, rejected: 3, pending: 1 },
        { date: '2025-10-27', submitted: 42, approved: 39, rejected: 2, pending: 1 },
      ],
      revenue: [
        { month: 'ม.ค.', amount: 3200000 },
        { month: 'ก.พ.', amount: 3450000 },
        { month: 'มี.ค.', amount: 3680000 },
        { month: 'เม.ย.', amount: 3520000 },
        { month: 'พ.ค.', amount: 3890000 },
        { month: 'มิ.ย.', amount: 4120000 },
      ],
    },
    cropDistribution: [
      { cropType: 'กัญชา (Cannabis)', count: 945, percentage: 75.7 },
      { cropType: 'ขมิ้นชัน (Turmeric)', count: 156, percentage: 12.5 },
      { cropType: 'ขิง (Ginger)', count: 78, percentage: 6.3 },
      { cropType: 'กระชายดำ (Black Galingale)', count: 34, percentage: 2.7 },
      { cropType: 'ไพล (Plai)', count: 23, percentage: 1.8 },
      { cropType: 'กระท่อม (Kratom)', count: 12, percentage: 1.0 },
    ],
    regionalData: [
      {
        region: 'ภาคเหนือ',
        province: 'เชียงใหม่',
        applications: 234,
        certificates: 198,
        farmers: 187,
      },
      {
        region: 'ภาคเหนือ',
        province: 'เชียงราย',
        applications: 189,
        certificates: 156,
        farmers: 145,
      },
      {
        region: 'ภาคกลาง',
        province: 'กรุงเทพฯ',
        applications: 156,
        certificates: 134,
        farmers: 98,
      },
      {
        region: 'ภาคตะวันออกเฉียงเหนือ',
        province: 'อุบลราชธานี',
        applications: 143,
        certificates: 121,
        farmers: 115,
      },
      { region: 'ภาคใต้', province: 'สงขลา', applications: 98, certificates: 87, farmers: 76 },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'application',
        description: 'นายสมชาย ใจดี ส่งคำขอรับรอง GACP-2025-0125 (กัญชา)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: 'นายสมชาย ใจดี',
      },
      {
        id: '2',
        type: 'approval',
        description: 'คำขอ GACP-2025-0120 (กัญชา) ได้รับการอนุมัติ',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        user: 'นายสมศักดิ์ ผู้ตรวจ',
      },
      {
        id: '3',
        type: 'certificate',
        description: 'ออกใบรับรอง CERT-2025-0892 สำหรับนายประสิทธิ์ มั่นคง (กัญชา)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'ระบบอัตโนมัติ',
      },
      {
        id: '4',
        type: 'rejection',
        description: 'คำขอ GACP-2025-0115 (ขมิ้นชัน) ถูกปฏิเสธ - เอกสารไม่ครบ',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: 'นางสมหญิง ผู้ตรวจ',
      },
      {
        id: '5',
        type: 'application',
        description: 'นางสาววิภา ทองดี ส่งคำขอรับรอง GACP-2025-0126 (กัญชา)',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: 'นางสาววิภา ทองดี',
      },
    ],
    topPerformers: {
      inspectors: [
        { id: '1', name: 'นายสมชาย ผู้ตรวจสอบ', completedInspections: 148, avgRating: 4.8 },
        { id: '2', name: 'นางสมหญิง ผู้ตรวจ', completedInspections: 135, avgRating: 4.7 },
        { id: '3', name: 'นายประสิทธิ์ มั่นคง', completedInspections: 128, avgRating: 4.6 },
      ],
      regions: [
        { region: 'เชียงใหม่', applications: 234, successRate: 84.6 },
        { region: 'เชียงราย', applications: 189, successRate: 82.5 },
        { region: 'กรุงเทพฯ', applications: 156, successRate: 85.9 },
      ],
    },
  };
}
