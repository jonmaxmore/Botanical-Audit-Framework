'use client';

import { Container, Typography, Grid, Tabs, Tab, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InspectionCalendar from '@/components/inspection/InspectionCalendar';
import InspectionScheduler from '@/components/inspection/InspectionScheduler';
import UpcomingInspections from '@/components/inspection/UpcomingInspections';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function InspectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

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
          🔍 Inspection Management
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Calendar" />
          <Tab label="Schedule" />
          <Tab label="Upcoming" />
        </Tabs>
        {tab === 0 && <InspectionCalendar />}
        {tab === 1 && <InspectionScheduler inspectionId="" onScheduled={() => {}} />}
        {tab === 2 && <UpcomingInspections />}
      </Container>
    </ErrorBoundary>
  );
}
