'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { getApplicationStats } from '@/lib/api/applications';
import {
  Assessment as StatsIcon,
  TrendingUp as TrendIcon,
  CompareArrows as CompareIcon,
  PieChart as PieIcon,
} from '@mui/icons-material';

export default function StatisticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicationStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              สถิติและการวิเคราะห์
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ภาพรวมและข้อมูลสถิติทั้งหมด
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {stats ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>คำขอทั้งหมด</Typography>
                        <Typography variant="h4">{stats.total || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>อนุมัติแล้ว</Typography>
                        <Typography variant="h4" color="success.main">{stats.byStatus?.approved || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>รอตรวจสอบ</Typography>
                        <Typography variant="h4" color="warning.main">{stats.byStatus?.under_review || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>ปฏิเสธ</Typography>
                        <Typography variant="h4" color="error.main">{stats.byStatus?.rejected || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">ไม่มีข้อมูลสถิติ - กรุณาสร้างข้อมูลทดสอบ</Alert>
              )}
            </>
          )}
        </Container>
      </Box>
    </ErrorBoundary>
  );
}
