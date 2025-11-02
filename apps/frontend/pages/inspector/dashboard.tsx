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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Inspector } from '../../types/user.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface InspectorStats {
  totalInspections: number;
  pendingInspections: number;
  activeInspections: number;
  completedInspections: number;
  passedInspections: number;
  failedInspections: number;
}

export default function InspectorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Inspector | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<InspectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inspector analytics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      
      const response = await fetch(`${API_BASE_URL}/analytics/inspections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inspection analytics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=inspector');
      return;
    }
    const user = JSON.parse(userStr) as Inspector;
    setCurrentUser(user);
    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  const statsCards = [
    { 
      label: 'รอกำหนดวัน', 
      value: stats?.pendingInspections || 0, 
      icon: <ScheduleIcon />, 
      color: '#2196f3' 
    },
    { 
      label: 'กำลังตรวจ', 
      value: stats?.activeInspections || 0, 
      icon: <AssessmentIcon />, 
      color: '#ff9800' 
    },
    { 
      label: 'ผ่าน', 
      value: stats?.passedInspections || 0, 
      icon: <CheckCircleIcon />, 
      color: '#4caf50' 
    },
    { 
      label: 'ไม่ผ่าน', 
      value: stats?.failedInspections || 0, 
      icon: <CancelIcon />, 
      color: '#f44336' 
    }
  ];

  return (
    <>
      <Head>
        <title>Dashboard ผู้ตรวจประเมิน | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#ff9800' }}>
        <Toolbar>
          <AssessmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบตรวจประเมิน GACP
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#f57c00' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName}</strong>
                <br />
                <small>ใบอนุญาต: {currentUser.licenseNumber}</small>
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            แดชบอร์ดตรวจประเมิน
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStats}
              disabled={loading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={() => router.push('/analytics')}
            >
              Analytics
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
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
                    {loading && !stats ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="รอตรวจประเมิน" />
            <Tab label="กำลังดำเนินการ" />
            <Tab label="เสร็จสิ้น" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่คำขอ</TableCell>
                  <TableCell>ชื่อเกษตรกร</TableCell>
                  <TableCell>ฟาร์ม</TableCell>
                  <TableCell>วันที่กำหนด</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                      ไม่มีรายการตรวจประเมิน
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
