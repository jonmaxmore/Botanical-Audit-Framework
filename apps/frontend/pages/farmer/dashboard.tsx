import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { Farmer } from '../../types/user.types';
import { WorkflowService } from '../../lib/workflow.service';

export default function FarmerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Farmer | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=farmer');
      return;
    }
    const user = JSON.parse(userStr) as Farmer;
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  // Mock applications data
  const applications = [
    {
      id: 'APP001',
      applicationNumber: 'GACP-2025-001',
      farmName: 'ฟาร์มสมุนไพรสมชาย',
      cropType: 'ฟ้าทะลายโจร',
      status: 'submitted',
      submittedAt: new Date('2025-01-15'),
    },
  ];

  const stats = [
    { label: 'คำขอทั้งหมด', value: '1', icon: <DescriptionIcon />, color: '#2196f3' },
    { label: 'รอตรวจสอบ', value: '1', icon: <TrendingUpIcon />, color: '#ff9800' },
    { label: 'ได้รับการรับรอง', value: '0', icon: <VerifiedIcon />, color: '#4caf50' },
    {
      label: 'พื้นที่ทั้งหมด',
      value: `${currentUser.totalFarmArea || 0} ไร่`,
      icon: <AgricultureIcon />,
      color: '#9c27b0',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard เกษตรกร | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <AgricultureIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบเกษตรกร GACP
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#1b5e20' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName}</strong>
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
            สวัสดี, {currentUser.fullName}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/farmer/application/create')}
            sx={{ backgroundColor: '#2e7d32' }}
          >
            ยื่นคำขอใหม่
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        p: 1,
                        borderRadius: 1,
                        mr: 2,
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

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            คำขอรับรองของฉัน
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่คำขอ</TableCell>
                  <TableCell>ชื่อฟาร์ม</TableCell>
                  <TableCell>พืชที่ปลูก</TableCell>
                  <TableCell>วันที่ยื่น</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                        ยังไม่มีคำขอ
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.applicationNumber}</TableCell>
                      <TableCell>{app.farmName}</TableCell>
                      <TableCell>{app.cropType}</TableCell>
                      <TableCell>{app.submittedAt.toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>
                        <Chip
                          label={WorkflowService.getStatusLabel(app.status as any)}
                          size="small"
                          sx={{
                            backgroundColor: WorkflowService.getStatusColor(app.status as any),
                            color: '#fff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => router.push(`/farmer/application/${app.id}`)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
