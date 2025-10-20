'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Grid, Chip } from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function ApplicationsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock data for applications
  const applications = [
    {
      id: 1,
      farmName: 'ฟาร์มทดสอบ A',
      applicant: 'นายสมชาย ใจดี',
      status: 'pending',
      date: '2025-10-10',
    },
    {
      id: 2,
      farmName: 'ฟาร์มทดสอบ B',
      applicant: 'นางสมหญิง ใจงาม',
      status: 'approved',
      date: '2025-10-08',
    },
    {
      id: 3,
      farmName: 'ฟาร์มทดสอบ C',
      applicant: 'นายสมศักดิ์ มั่นคง',
      status: 'reviewing',
      date: '2025-10-12',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'reviewing':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอพิจารณา';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'reviewing':
        return 'กำลังตรวจสอบ';
      case 'rejected':
        return 'ไม่อนุมัติ';
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
        </Box>

        {/* Sidebar - Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'calc(100% - 280px)' },
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="คำขอรับรอง" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Page Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    คำขอรับรอง GACP
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    จัดการและติดตามคำขอรับรองมาตรฐาน
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<FilterIcon />}>
                    ตัวกรอง
                  </Button>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    เพิ่มคำขอ
                  </Button>
                </Box>
              </Box>

              {/* Loading State */}
              {loading ? (
                <LoadingSpinner message="กำลังโหลดคำขอรับรอง..." />
              ) : (
                /* Applications List */
                <Grid container spacing={3}>
                  {applications.map(app => (
                    <Grid item xs={12} key={app.id}>
                      <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {app.farmName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                ผู้ยื่นคำขอ: {app.applicant}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                วันที่ยื่น: {new Date(app.date).toLocaleDateString('th-TH')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                alignItems: 'flex-end',
                              }}
                            >
                              <Chip
                                label={getStatusText(app.status)}
                                color={getStatusColor(app.status)}
                                size="small"
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => router.push(`/applications/${app.id}`)}
                              >
                                ดูรายละเอียด
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State if no applications */}
              {!loading && applications.length === 0 && (
                <Card sx={{ boxShadow: 2, mt: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      ยังไม่มีคำขอรับรอง
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      เริ่มต้นโดยการเพิ่มคำขอรับรองใหม่
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />}>
                      เพิ่มคำขอแรก
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
