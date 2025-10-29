'use client';

import { Container, Typography, Box, TextField, Button, Grid, Card, CardContent } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CertificatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
          📜 Certificate Management
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card>
                <CardContent>
                  <Typography variant="h6">GACP-2025-{String(i).padStart(4, '0')}</Typography>
                  <Typography color="text.secondary">Status: Active</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
