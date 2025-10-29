'use client';

import { Container, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📈 Analytics Dashboard
        </Typography>
        <AnalyticsCharts />
      </Container>
    </ErrorBoundary>
  );
}
