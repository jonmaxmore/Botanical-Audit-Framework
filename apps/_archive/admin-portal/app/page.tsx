'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

export default function AdminHomePage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const dashboardCards = [
    {
      title: 'Dashboard',
      description: 'ภาพรวมระบบและ KPI',
      icon: <DashboardIcon sx={{ fontSize: 48 }} />,
      color: '#2e7d32',
      path: '/dashboard',
    },
    {
      title: 'Applications',
      description: 'ตรวจสอบและอนุมัติคำขอ',
      icon: <AssignmentIcon sx={{ fontSize: 48 }} />,
      color: '#1976d2',
      path: '/applications',
    },
    {
      title: 'Users',
      description: 'จัดการผู้ใช้งาน',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      color: '#ed6c02',
      path: '/users',
    },
    {
      title: 'Reports',
      description: 'รายงานและการวิเคราะห์',
      icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
      color: '#9c27b0',
      path: '/reports',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🌾 GACP Admin Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ระบบจัดการผู้ดูแลระบบ - Good Agricultural Certification Platform
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {dashboardCards.map(card => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => router.push(card.path)}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              localStorage.removeItem('admin_token');
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
