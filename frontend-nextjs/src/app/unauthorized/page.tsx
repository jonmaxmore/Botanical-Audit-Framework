'use client';

import React from 'react';
import { Box, Container, Paper, Typography, Button } from '@mui/material';
import { Block } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'DTAM_OFFICER':
        return '/officer/dashboard';
      case 'INSPECTOR':
        return '/inspector/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h3" fontWeight={600} gutterBottom>
            403
          </Typography>
          <Typography variant="h5" fontWeight={500} gutterBottom>
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            หน้านี้สำหรับผู้ใช้ที่มีสิทธิ์เข้าถึงเท่านั้น
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(getDashboardPath())}
            >
              ไปที่ Dashboard
            </Button>
            <Button variant="outlined" onClick={() => router.push('/')}>
              กลับหน้าหลัก
            </Button>
            <Button variant="outlined" color="error" onClick={logout}>
              ออกจากระบบ
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
