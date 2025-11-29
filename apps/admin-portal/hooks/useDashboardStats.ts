import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
}

export function useDashboardStats() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/dashboard/stats');

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        // Fallback or error handling
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError('ไม่สามารถโหลดข้อมูลสถิติได้ (Using Mock Data)');
      // Fallback to mock data if API fails (e.g. endpoint not ready)
      setStats({
        totalApplications: 156,
        pendingReview: 23,
        approved: 98,
        rejected: 12,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
}

