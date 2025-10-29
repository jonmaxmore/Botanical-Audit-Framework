'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/roles`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data.data || data || []);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
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
          <Typography variant="h4">Role Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>Add Role</Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          {roles.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No roles configured - Please create roles via API</Alert>
            </Grid>
          ) : (
            roles.map((role) => (
              <Grid item xs={12} md={6} key={role.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{role.name}</Typography>
                      <Chip label={`${role.userCount || 0} users`} size="small" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {role.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Permissions:</Typography>
                    <List dense>
                      {role.permissions?.map((perm: string, idx: number) => (
                        <ListItem key={idx}>
                          <ListItemText primary={perm} />
                        </ListItem>
                      ))}
                    </List>
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
