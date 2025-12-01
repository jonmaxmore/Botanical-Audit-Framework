'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Add } from '@mui/icons-material';
import UsersTable from '@/components/users/UsersTable';
import UserFormDialog from '@/components/users/UserFormDialog';
import RoleManagement from '@/components/users/RoleManagement';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">👥 User Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add User
          </Button>
        </Box>
        <UsersTable users={[]} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
        <Box mt={4}>
          <RoleManagement
            roles={[]}
            permissions={[]}
            onAddRole={() => {}}
            onEditRole={() => {}}
            onDeleteRole={() => {}}
          />
        </Box>
        <UserFormDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={() => {}}
          mode="create"
        />
      </Container>
    </ErrorBoundary>
  );
}
