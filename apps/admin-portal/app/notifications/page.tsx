'use client';

import { Container, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsList from '@/components/notifications/NotificationsList';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function NotificationsPage() {
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
          🔔 Notifications
        </Typography>
        <NotificationsList
          notifications={[]}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
          onDelete={() => {}}
        />
      </Container>
    </ErrorBoundary>
  );
}
