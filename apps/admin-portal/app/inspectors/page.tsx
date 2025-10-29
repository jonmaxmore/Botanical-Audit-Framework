'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { getUsers } from '@/lib/api/users';

export default function InspectorsPage() {
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({ role: 'inspector', limit: 50 });
      setInspectors(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch inspectors:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Inspectors</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>Add Inspector</Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          {inspectors.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No inspectors found</Typography>
            </Grid>
          ) : (
            inspectors.map((inspector) => (
              <Grid item xs={12} md={6} lg={4} key={inspector.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{inspector.name?.[0]}</Avatar>
                      <Box>
                        <Typography variant="h6">{inspector.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{inspector.email}</Typography>
                      </Box>
                    </Box>
                    <Chip label={`${inspector.assignedCases || 0} cases`} size="small" />
                    <Chip label={inspector.status || 'active'} color="success" size="small" sx={{ ml: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}
