'use client';

import { Box, Container, Grid, Typography, Alert } from '@mui/material';
import KPICard from '@/components/dashboard/KPICard';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import InspectorKPICards from '@/components/dashboard/InspectorKPICards';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📊 Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <KPICard
              title="คำขอทั้งหมด"
              value={stats.totalApplications}
              icon={<div>📋</div>}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="รอตรวจสอบ"
              value={stats.pendingReview}
              icon={<div>⏳</div>}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard
              title="อนุมัติแล้ว"
              value={stats.approved}
              icon={<div>✅</div>}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KPICard title="ไม่อนุมัติ" value={stats.rejected} icon={<div>❌</div>} color="error" />
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
                totalInspections: 0,
                completedToday: 0,
                upcomingThisWeek: 0,
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
