'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import {
  VerifiedUser,
  PendingActions,
  CheckCircle,
  Schedule,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, [router]);

  const stats = [
    {
      title: 'Total Certificates',
      value: '1,234',
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      change: '+12%',
    },
    {
      title: 'Pending',
      value: '45',
      icon: <PendingActions sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      change: '+8%',
    },
    {
      title: 'Approved',
      value: '1,156',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      change: '+15%',
    },
    {
      title: 'Expiring Soon',
      value: '33',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#f44336',
      change: '-5%',
    }
  ];

  const recentCertificates = [
    {
      id: 'CERT-2025-001',
      farmName: 'สวนทดสอบ A',
      farmer: 'นายสมชาย ใจดี',
      status: 'approved',
      date: '2025-10-14',
    },
    {
      id: 'CERT-2025-002',
      farmName: 'สวนทดสอบ B',
      farmer: 'นางสาวสมหญิง ใจงาม',
      status: 'pending',
      date: '2025-10-13',
    },
    {
      id: 'CERT-2025-003',
      farmName: 'สวนทดสอบ C',
      farmer: 'นายสมศักดิ์ ใจกล้า',
      status: 'approved',
      date: '2025-10-12',
    }
  ];

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ภาพรวมการออกใบรับรองมาตรฐาน GACP
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={() => router.push('/certificates/new')}
          >
            ออกใบรับรองใหม่
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      {stat.change} from last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Certificates */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ใบรับรองล่าสุด
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentCertificates.map(cert => (
              <Box
                key={cert.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {cert.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cert.farmName} - {cert.farmer}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {cert.date}
                  </Typography>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: cert.status === 'approved' ? '#4caf5020' : '#ff980020',
                      color: cert.status === 'approved' ? '#4caf50' : '#ff9800',
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {cert.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined">
                    ดูรายละเอียด
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}
