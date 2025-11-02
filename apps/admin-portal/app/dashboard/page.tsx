'use client';

import { Box, Container, Grid, Typography, Alert, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Refresh, Analytics as AnalyticsIcon } from '@mui/icons-material';
import KPICard from '@/components/dashboard/KPICard';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import InspectorKPICards from '@/components/dashboard/InspectorKPICards';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DashboardStats {
  totalApplications: number;
  totalDocuments: number;
  totalCertificates: number;
  totalInspections: number;
  pendingApplications: number;
  pendingDocuments: number;
  activeInspections: number;
  activeCertificates: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setStats(data.data.overview);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !stats) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            📊 Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchStats}
              disabled={loading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={() => router.push('/analytics')}
            >
              Analytics
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <KPICard
              title="คำขอทั้งหมด"
              value={stats?.totalApplications || 0}
              icon={<div>📋</div>}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="เอกสารทั้งหมด"
              value={stats?.totalDocuments || 0}
              icon={<div>📄</div>}
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="ใบรับรอง"
              value={stats?.totalCertificates || 0}
              icon={<div>✅</div>}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="การตรวจสอบ"
              value={stats?.totalInspections || 0}
              icon={<div>🔍</div>}
              color="warning"
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <ActivitySummary activities={[]} />
          </Grid>

          <Grid item xs={12} md={4}>
            <QuickActionsPanel />
          </Grid>

          <Grid item xs={12}>
            <InspectorKPICards
              data={{
                totalInspections: stats?.totalInspections || 0,
                completedToday: 0,
                upcomingThisWeek: stats?.activeInspections || 0,
                videoCallCount: 0,
                onsiteCount: 0,
                avgResponseTime: 0,
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
