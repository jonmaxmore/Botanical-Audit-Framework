import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { Admin } from '../../types/user.types';
import { allUsers } from '../../data/users.seed';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=admin');
      return;
    }
    const user = JSON.parse(userStr) as Admin;
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  const stats = [
    {
      label: 'ผู้ใช้ทั้งหมด',
      value: allUsers.length.toString(),
      icon: <PeopleIcon />,
      color: '#2196f3'
    },
    { label: 'เกษตรกร', value: '10', icon: <PeopleIcon />, color: '#4caf50' },
    { label: 'พนักงาน', value: '4', icon: <PeopleIcon />, color: '#ff9800' },
    { label: 'คำขอทั้งหมด', value: '1', icon: <AssessmentIcon />, color: '#9c27b0' }
  ];

  return (
    <>
      <Head>
        <title>Dashboard แอดมิน | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#f44336' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบจัดการ GACP (Admin)
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName}</strong>
                <br />
                <small>ผู้ดูแลระบบ</small>
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => router.push('/admin/settings')}>
              <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
              ตั้งค่า
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          แดชบอร์ดผู้ดูแลระบบ
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        p: 1,
                        borderRadius: 1,
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                การจัดการผู้ใช้
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => router.push('/admin/users')}
              >
                จัดการผู้ใช้ทั้งหมด
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => router.push('/admin/roles')}
              >
                จัดการสิทธิ์และบทบาท
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1, color: '#f44336' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Power BI Analytics
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#f44336' }}
                onClick={() => router.push('/admin/analytics')}
              >
                เปิด Dashboard วิเคราะห์
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                ดูสถิติและรายงานแบบ Real-time
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="ภาพรวมระบบ" />
                <Tab label="กิจกรรมล่าสุด" />
                <Tab label="รายงาน" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Typography variant="body1" paragraph>
                    ระบบทำงานปกติ - ไม่มีปัญหา
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    อัพเดทล่าสุด: {new Date().toLocaleString('th-TH')}
                  </Typography>
                </Box>
              )}

              {tabValue === 1 && (
                <Typography variant="body2" color="textSecondary">
                  ไม่มีกิจกรรมล่าสุด
                </Typography>
              )}

              {tabValue === 2 && (
                <Typography variant="body2" color="textSecondary">
                  ไม่มีรายงานใหม่
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
