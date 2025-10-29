'use client';

import { Box, Container, Grid, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KPICard from '@/components/dashboard/KPICard';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import InspectorKPICards from '@/components/dashboard/InspectorKPICards';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setStats({
          totalApplications: 156,
          pendingReview: 23,
          approved: 98,
          rejected: 12,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📊 Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <KPICard
              title="คำขอทั้งหมด"
              value={stats.totalApplications}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="รอตรวจสอบ"
              value={stats.pendingReview}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="อนุมัติแล้ว"
              value={stats.approved}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="ไม่อนุมัติ"
              value={stats.rejected}
              color="error"
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <ActivitySummary />
          </Grid>

          <Grid item xs={12} md={4}>
            <QuickActionsPanel />
          </Grid>

          <Grid item xs={12}>
            <InspectorKPICards />
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
