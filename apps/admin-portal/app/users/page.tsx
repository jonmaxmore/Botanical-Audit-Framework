'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { getUsers, type User } from '@/lib/api/users';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({ page: 1, limit: 50 });
      setUsers(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">User Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add User
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          {users.length} users found
        </Typography>
        
        {/* User table component would go here */}
        {users.length === 0 && !error && (
          <Alert severity="info">No users found</Alert>
        )}
      </Box>
    </ErrorBoundary>
  );
}
