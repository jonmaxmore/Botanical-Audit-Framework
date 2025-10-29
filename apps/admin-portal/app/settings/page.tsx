'use client';

import { Container, Typography, Grid, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SystemSettingsForm from '@/components/settings/SystemSettingsForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import BackupRestore from '@/components/settings/BackupRestore';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SettingsPage() {
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
          ⚙️ System Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <SystemSettingsForm onSave={async (settings) => {}} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <NotificationSettings onSave={async (settings) => {}} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <SecuritySettings />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <BackupRestore onBackup={async () => {}} onRestore={async (file) => {}} onDelete={async (id) => {}} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
