'use client';

import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import StatisticsTable from '@/components/statistics/StatisticsTable';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import StatisticsCard from '@/components/dashboard/StatisticsCard';
import {
  Assessment as StatsIcon,
  TrendingUp as TrendIcon,
  CompareArrows as CompareIcon,
  PieChart as PieIcon,
} from '@mui/icons-material';

export default function StatisticsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
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
          <AdminHeader onMenuClick={handleSidebarToggle} title="สถิติ" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  สถิติและการวิเคราะห์
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ภาพรวมและข้อมูลสถิติทั้งหมด
                </Typography>
              </Box>

              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="อัตราการอนุมัติ"
                    value="71.5%"
                    subtitle="จากคำขอทั้งหมด"
                    icon={<StatsIcon />}
                    iconColor="success"
                    trend={{
                      value: 3.2,
                      isPositive: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="เวลาเฉลี่ย"
                    value="12 วัน"
                    subtitle="ระยะเวลาตรวจสอบ"
                    icon={<TrendIcon />}
                    iconColor="info"
                    trend={{
                      value: 1.8,
                      isPositive: false,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="อัตราการส่งซ้ำ"
                    value="8.2%"
                    subtitle="คำขอที่ส่งซ้ำ"
                    icon={<CompareIcon />}
                    iconColor="warning"
                    trend={{
                      value: 0.5,
                      isPositive: false,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatisticsCard
                    title="ความพึงพอใจ"
                    value="4.6/5"
                    subtitle="คะแนนเฉลี่ย"
                    icon={<PieIcon />}
                    iconColor="primary"
                    trend={{
                      value: 0.3,
                      isPositive: true,
                    }}
                  />
                </Grid>
              </Grid>

              {/* Analytics Charts */}
              <Box sx={{ mb: 3 }}>
                <AnalyticsCharts
                  title="การวิเคราะห์ข้อมูลเชิงลึก"
                  subtitle="แสดงแนวโน้มและการเปรียบเทียบข้อมูลในรูปแบบต่างๆ"
                />
              </Box>

              {/* Statistics Table */}
              <StatisticsTable
                title="ตารางสถิติรายละเอียด"
                subtitle="ข้อมูลสถิติทั้งหมดพร้อมการเปรียบเทียบ"
              />
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
