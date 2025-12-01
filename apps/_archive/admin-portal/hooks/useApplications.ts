import { useState, useEffect, useCallback } from 'react';
import * as applicationsApi from '@/lib/api/applications';
import type { Application } from '@/lib/api/applications';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getApplications();
      setApplications(response.data);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError('ไม่สามารถโหลดข้อมูลคำขอได้ กำลังใช้ข้อมูลจำลอง');
      // Fallback to mock data
      try {
        const mockData = applicationsApi.getMockApplicationsData();
        setApplications(mockData);
      } catch (mockErr) {
        console.error('Error loading mock data:', mockErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    loading,
    error,
    refreshApplications: loadApplications,
  };
}
