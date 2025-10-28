'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  People as PeopleIcon,
  AttachMoney as RevenueIcon,
  Eco as CannabisIcon,
} from '@mui/icons-material';
import StatisticsCard from '@/components/dashboard/StatisticsCard';
import ActivitySummary, { Activity } from '@/components/dashboard/ActivitySummary';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import LineChart from '@/components/dashboard/LineChart';
import PieChart from '@/components/dashboard/PieChart';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import * as dashboardApi from '@/lib/api/dashboard';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<dashboardApi.AdminDashboard | null>(
    null
  );

  // Load dashboard data from API
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      // Fallback to mock data
      setDashboardData(dashboardApi.getMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format activities for display
  const activities: Activity[] =
    dashboardData?.recentActivity.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.type === 'application' ? 'คำขอรับรองใหม่' :
             activity.type === 'approval' ? 'อนุมัติคำขอ' :
             activity.type === 'certificate' ? 'ออกใบรับรอง' : 'ปฏิเสธคำขอ',
      description: activity.description,
      time: activity.timestamp,
      user: activity.user,
    })) || [];

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
                สรุปข้อมูลและสถิติการทำงานของระบบ GACP Platform
              </Typography>

              {/* Error Alert */}
              {error && (
                <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error} (กำลังแสดงข้อมูลตัวอย่าง)
                </Alert>
              )}

              {/* Loading State */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Statistics Cards - Cannabis First Metrics */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Cannabis Applications - First Priority */}
                    <Grid item xs={12} sm={6} md={2}>
                      <StatisticsCard
                        title="กัญชา"
                        value={dashboardData?.stats.cropStats.cannabis.toString() || '0'}
                        subtitle="คำขอกัญชา (75.7%)"
                        icon={<CannabisIcon />}
                        iconColor="success"
                        trend={{
                          value: 18.5,
                          isPositive: true,
                        }}
                      />
                    </Grid>

                    {/* Total Applications */}
                    <Grid item xs={12} sm={6} md={2.5}>
                      <StatisticsCard
                        title="คำขอทั้งหมด"
                        value={dashboardData?.stats.totalApplications.toLocaleString() || '0'}
                        subtitle="คำขอในระบบ"
                        icon={<AssignmentIcon />}
                        iconColor="primary"
                        trend={{
                          value: 12.5,
                          isPositive: true,
                        }}
                      />
                    </Grid>

                    {/* Pending */}
                    <Grid item xs={12} sm={6} md={2.5}>
                      <StatisticsCard
                        title="รอตรวจสอบ"
                        value={dashboardData?.stats.pendingApplications.toString() || '0'}
                        subtitle="คำขอรอการตรวจสอบ"
                        icon={<PendingIcon />}
                        iconColor="warning"
                        trend={{
                          value: 8.2,
                          isPositive: false,
                        }}
                      />
                    </Grid>

                    {/* Approved */}
                    <Grid item xs={12} sm={6} md={2.5}>
                      <StatisticsCard
                        title="อนุมัติแล้ว"
                        value={dashboardData?.stats.approvedApplications.toString() || '0'}
                        subtitle="คำขอที่อนุมัติแล้ว"
                        icon={<ApprovedIcon />}
                        iconColor="success"
                        trend={{
                          value: 15.3,
                          isPositive: true,
                        }}
                      />
                    </Grid>

                    {/* Revenue */}
                    <Grid item xs={12} sm={6} md={2.5}>
                      <StatisticsCard
                        title="รายได้"
                        value={`${(dashboardData?.stats.revenue.thisMonth || 0) / 1000000}M`}
                        subtitle="รายได้เดือนนี้ (บาท)"
                        icon={<RevenueIcon />}
                        iconColor="info"
                        trend={{
                          value: 5.1,
                          isPositive: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Secondary Statistics - Other Crops */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            สถิติพืชสมุนไพรอื่นๆ
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={2.4}>
                              <Typography variant="body2" color="text.secondary">
                                ขมิ้นชัน
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {dashboardData?.stats.cropStats.turmeric || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                              <Typography variant="body2" color="text.secondary">
                                ขิง
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {dashboardData?.stats.cropStats.ginger || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                              <Typography variant="body2" color="text.secondary">
                                กระชายดำ
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {dashboardData?.stats.cropStats.blackGalingale || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                              <Typography variant="body2" color="text.secondary">
                                ไพล
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {dashboardData?.stats.cropStats.plai || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2.4}>
                              <Typography variant="body2" color="text.secondary">
                                กระท่อม
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {dashboardData?.stats.cropStats.kratom || 0}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}

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
