'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UsersTable from '@/components/users/UsersTable';
import UserFormDialog, { UserFormData } from '@/components/users/UserFormDialog';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'manager' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    // Simulate data loading with mock data
    const timer = setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'นายสมชาย ผู้ตรวจสอบ',
          email: 'somchai@gacp.go.th',
          avatar: '',
          role: 'reviewer',
          department: 'ฝ่ายตรวจสอบ',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'นางสาวสมหญิง ผู้จัดการ',
          email: 'somying@gacp.go.th',
          avatar: '',
          role: 'manager',
          department: 'ฝ่ายบริหาร',
          status: 'active',
          lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'นายสมศักดิ์ ผู้ดูแล',
          email: 'somsak@gacp.go.th',
          avatar: '',
          role: 'admin',
          department: 'ฝ่ายเทคโนโลยี',
          status: 'active',
          lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'นางสมใจ ผู้ดูข้อมูล',
          email: 'somjai@gacp.go.th',
          avatar: '',
          role: 'viewer',
          department: 'ฝ่ายบัญชี',
          status: 'active',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          name: 'นายประสิทธิ์ ผู้ตรวจ',
          email: 'prasit@gacp.go.th',
          avatar: '',
          role: 'reviewer',
          department: 'ฝ่ายตรวจสอบ',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '6',
          name: 'นางสาววิภา ผู้ดูแล',
          email: 'wipa@gacp.go.th',
          avatar: '',
          role: 'admin',
          department: 'ฝ่ายเทคโนโลยี',
          status: 'suspended',
          lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('คุณต้องการลบผู้ใช้งานนี้หรือไม่?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('ลบผู้ใช้งานเรียบร้อย');
    }
  };

  const handleFormSubmit = (data: UserFormData) => {
    if (editingUser) {
      // Edit existing user
      setUsers(
        users.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                name: data.name,
                phone: data.phone,
                role: data.role,
                department: data.department,
                avatar: data.avatar,
              }
            : u
        )
      );
      alert(`แก้ไขข้อมูล "${data.name}" เรียบร้อย`);
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
        department: data.department,
        status: 'active',
        lastLogin: new Date().toISOString(),
      };
      setUsers([newUser, ...users]);
      alert(`เพิ่มผู้ใช้งาน "${data.name}" เรียบร้อย`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex' }}>
        <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} />

        <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <AdminHeader onMenuClick={handleSidebarToggle} />

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box
              sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  จัดการผู้ใช้งาน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  จัดการข้อมูลผู้ใช้งาน บทบาท และสิทธิ์การเข้าถึง
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                sx={{ height: 'fit-content' }}
              >
                เพิ่มผู้ใช้งาน
              </Button>
            </Box>

            {/* Users Table */}
            <UsersTable
              users={users}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />

            {/* User Form Dialog */}
            <UserFormDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onSubmit={handleFormSubmit}
              initialData={
                editingUser
                  ? {
                      name: editingUser.name,
                      email: editingUser.email,
                      phone: '',
                      role: editingUser.role,
                      department: editingUser.department,
                      position: '',
                      location: '',
                      avatar: editingUser.avatar,
                    }
                  : undefined
              }
              mode={editingUser ? 'edit' : 'create'}
            />
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
