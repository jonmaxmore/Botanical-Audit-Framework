'use client';

import { Container, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReportGenerator from '@/components/reports/ReportGenerator';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ReportsPage() {
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
          📊 Reports & Analytics
        </Typography>
        <ReportGenerator />
      </Container>
    </ErrorBoundary>
  );
}
