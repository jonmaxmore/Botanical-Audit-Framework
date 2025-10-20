'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Description as ReportIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import ReportGenerator, { ReportConfig } from '@/components/reports/ReportGenerator';

interface ReportHistory {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'completed' | 'pending';
  format: string;
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock report history
  const reportHistory: ReportHistory[] = [
    {
      id: '1',
      name: 'รายงานคำขอรับรอง ม.ค. 2025',
      type: 'applications',
      date: '2025-02-01',
      status: 'completed',
      format: 'PDF',
    },
    {
      id: '2',
      name: 'รายงานการตรวจสอบ ธ.ค. 2024',
      type: 'reviews',
      date: '2025-01-15',
      status: 'completed',
      format: 'Excel',
    },
    {
      id: '3',
      name: 'รายงานสถิติ Q4 2024',
      type: 'statistics',
      date: '2025-01-10',
      status: 'completed',
      format: 'PDF',
    },
  ];

  const handleGenerateReport = async (config: ReportConfig) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: `สร้างรายงานสำเร็จ! กำลังดาวน์โหลดไฟล์ ${config.format.toUpperCase()}...`,
        severity: 'success',
      });
    }, 2000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'success' : 'warning';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? <SuccessIcon /> : <PendingIcon />;
  };

  const getStatusLabel = (status: string) => {
    return status === 'completed' ? 'สำเร็จ' : 'กำลังสร้าง';
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex' }}>
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
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="รายงาน" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  จัดการรายงาน
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  สร้างและจัดการรายงานต่างๆ ในระบบ
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Report Generator */}
                <Grid item xs={12} md={5}>
                  <ReportGenerator onGenerate={handleGenerateReport} loading={loading} />
                </Grid>

                {/* Report History */}
                <Grid item xs={12} md={7}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        รายงานล่าสุด
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        รายการรายงานที่สร้างไว้
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      {reportHistory.length > 0 ? (
                        <List>
                          {reportHistory.map((report, index) => (
                            <React.Fragment key={report.id}>
                              <ListItem
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 1,
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  <ReportIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography variant="body1" fontWeight={500}>
                                        {report.name}
                                      </Typography>
                                      <Chip
                                        icon={getStatusIcon(report.status)}
                                        label={getStatusLabel(report.status)}
                                        size="small"
                                        color={getStatusColor(report.status)}
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        สร้างเมื่อ:{' '}
                                        {new Date(report.date).toLocaleDateString('th-TH', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 2 }}
                                      >
                                        รูปแบบ: {report.format}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              {index < reportHistory.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">ยังไม่มีรายงานที่สร้างไว้</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ProtectedRoute>
  );
}
