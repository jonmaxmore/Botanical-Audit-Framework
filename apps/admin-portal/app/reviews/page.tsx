'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Card, CardContent, Grid } from '@mui/material';
import {
  Assignment as ReviewIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReviewQueue, { Application } from '@/components/applications/ReviewQueue';

export default function ReviewsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [applications, setApplications] = React.useState<Application[]>([]);

  React.useEffect(() => {
    // Simulate data loading with mock data
    const timer = setTimeout(() => {
      setApplications([
        {
          id: '1',
          applicationNumber: 'GACP-2025-0001',
          farmerName: 'นายสมชาย ใจดี',
          farmName: 'แปลงผักปลอดภัย 1',
          province: 'เชียงใหม่',
          status: 'pending',
          priority: 'high',
          submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'นายสมศักดิ์',
          reviewProgress: 0,
          documentCount: 12,
        },
        {
          id: '2',
          applicationNumber: 'GACP-2025-0002',
          farmerName: 'นางสมหญิง รักษ์ดี',
          farmName: 'แปลงมะม่วงออร์แกนิก',
          province: 'นครปฐม',
          status: 'in_review',
          priority: 'medium',
          submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'นางสาวสมใจ',
          reviewProgress: 45,
          documentCount: 8,
        },
        {
          id: '3',
          applicationNumber: 'GACP-2025-0003',
          farmerName: 'นายประสิทธิ์ เจริญ',
          farmName: 'แปลงกาแฟอราบิก้า',
          province: 'เชียงราย',
          status: 'pending',
          priority: 'high',
          submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          reviewProgress: 0,
          documentCount: 15,
        },
        {
          id: '4',
          applicationNumber: 'GACP-2025-0004',
          farmerName: 'นางวิภา สุขใจ',
          farmName: 'แปลงข้าวออร์แกนิก',
          province: 'สุโขทัย',
          status: 'revision',
          priority: 'medium',
          submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'นายสมชาย',
          reviewProgress: 75,
          documentCount: 10,
        },
        {
          id: '5',
          applicationNumber: 'GACP-2025-0005',
          farmerName: 'นายธนา มั่นคง',
          farmName: 'แปลงสตรอเบอร์รี่',
          province: 'เชียงใหม่',
          status: 'in_review',
          priority: 'low',
          submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'นายสมศักดิ์',
          reviewProgress: 30,
          documentCount: 9,
        },
        {
          id: '6',
          applicationNumber: 'GACP-2025-0006',
          farmerName: 'นางสาวมาลี ดีใจ',
          farmName: 'แปลงผักไฮโดรโปนิกส์',
          province: 'กรุงเทพมหานคร',
          status: 'pending',
          priority: 'high',
          submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          reviewProgress: 0,
          documentCount: 11,
        },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewApplication = (id: string) => {
    router.push(`/reviews/${id}`);
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      inReview: applications.filter(a => a.status === 'in_review').length,
      needsRevision: applications.filter(a => a.status === 'revision').length,
    };
  }, [applications]);

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
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                คิวตรวจสอบคำขอ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ตรวจสอบและประเมินคำขอรับรอง GACP
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          ทั้งหมด
                        </Typography>
                        <ReviewIcon color="primary" />
                      </Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        คำขอทั้งหมด
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          รอตรวจสอบ
                        </Typography>
                        <PendingIcon color="warning" />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        รอการดำเนินการ
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          กำลังตรวจสอบ
                        </Typography>
                        <ApprovedIcon color="info" />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {stats.inReview}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        อยู่ระหว่างดำเนินการ
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          ต้องแก้ไข
                        </Typography>
                        <RejectedIcon color="error" />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {stats.needsRevision}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ส่งกลับแก้ไข
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Review Queue Table */}
            <ReviewQueue applications={applications} onViewApplication={handleViewApplication} />
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
