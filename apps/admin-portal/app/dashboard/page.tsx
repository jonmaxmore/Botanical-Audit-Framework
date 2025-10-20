'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import StatisticsCard from '@/components/dashboard/StatisticsCard';
import ActivitySummary, { Activity } from '@/components/dashboard/ActivitySummary';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import LineChart from '@/components/dashboard/LineChart';
import PieChart from '@/components/dashboard/PieChart';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock activities data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'application',
      title: 'คำขอรับรองใหม่',
      description: 'นายสมชาย ใจดี ส่งคำขอรับรอง GACP-2025-0125',
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'นายสมชาย ใจดี',
    },
    {
      id: '2',
      type: 'approval',
      title: 'อนุมัติคำขอ',
      description: 'คำขอ GACP-2025-0120 ได้รับการอนุมัติ',
      time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'นายสมศักดิ์ ผู้ตรวจ',
    },
    {
      id: '3',
      type: 'comment',
      title: 'ความเห็นใหม่',
      description: 'นางสมหญิง แสดงความเห็นในคำขอ GACP-2025-0118',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'นางสมหญิง ผู้ตรวจ',
    },
    {
      id: '4',
      type: 'user',
      title: 'ผู้ใช้งานใหม่',
      description: 'นางสาววิภา เข้าร่วมระบบในฐานะผู้ตรวจสอบ',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: 'ผู้ดูแลระบบ',
    },
    {
      id: '5',
      type: 'application',
      title: 'แก้ไขคำขอ',
      description: 'นายประสิทธิ์ แก้ไขคำขอ GACP-2025-0115',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user: 'นายประสิทธิ์ มั่นคง',
    },
  ];

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
          <AdminHeader onMenuClick={handleSidebarToggle} title="แดชบอร์ด" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Page Title */}
              <Typography variant="h4" fontWeight={700} gutterBottom>
                ภาพรวมระบบ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                สรุปข้อมูลและสถิติการทำงานของระบบ
              </Typography>

              {/* Statistics Cards - New Design */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="คำขอทั้งหมด"
                    value="1,248"
                    subtitle="คำขอในระบบ"
                    icon={<AssignmentIcon />}
                    iconColor="primary"
                    trend={{
                      value: 12.5,
                      isPositive: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="รอตรวจสอบ"
                    value="156"
                    subtitle="คำขอรอการตรวจสอบ"
                    icon={<PendingIcon />}
                    iconColor="warning"
                    trend={{
                      value: 8.2,
                      isPositive: false,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="อนุมัติเดือนนี้"
                    value="89"
                    subtitle="คำขอที่อนุมัติแล้ว"
                    icon={<ApprovedIcon />}
                    iconColor="success"
                    trend={{
                      value: 15.3,
                      isPositive: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="ผู้ใช้งานปัจจุบัน"
                    value="45"
                    subtitle="ผู้ใช้ที่ใช้งานอยู่"
                    icon={<PeopleIcon />}
                    iconColor="info"
                    trend={{
                      value: 5.1,
                      isPositive: true,
                    }}
                  />
                </Grid>
              </Grid>

              {/* Charts and Activity Section */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {/* Analytics Charts with Tabs */}
                  <Box sx={{ mb: 3 }}>
                    <AnalyticsCharts
                      title="การวิเคราะห์ข้อมูล"
                      subtitle="แสดงกราฟสถิติและการวิเคราะห์ในรูปแบบต่างๆ"
                    />
                  </Box>

                  {/* Legacy Charts - Keep for comparison */}
                  <Card sx={{ boxShadow: 2, mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        สถิติคำขอรับรอง (7 วันล่าสุด)
                      </Typography>
                      <LineChart height={300} />
                    </CardContent>
                  </Card>

                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        สัดส่วนสถานะ
                      </Typography>
                      <PieChart height={300} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Activity Summary - New Component */}
                <Grid item xs={12} md={4}>
                  <ActivitySummary activities={activities} />
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
