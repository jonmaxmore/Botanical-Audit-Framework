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
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { DocumentChecker } from '../../types/user.types';
import { ApplicationStatus } from '../../types/application.types';
import { WorkflowService } from '../../lib/workflow.service';

export default function DocumentCheckerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DocumentChecker | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=document_checker');
      return;
    }
    const user = JSON.parse(userStr) as DocumentChecker;
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  const pendingApplications = [
    {
      id: 'APP001',
      applicationNumber: 'GACP-2025-001',
      farmerName: 'สมชาย ใจดี',
      farmName: 'ฟาร์มสมุนไพรสมชาย',
      cropType: 'ฟ้าทะลายโจร',
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date('2025-01-15'),
    },
  ];

  const stats = [
    { label: 'รอตรวจสอบ', value: '1', icon: <HourglassEmptyIcon />, color: '#ff9800' },
    { label: 'อนุมัติแล้ว', value: '0', icon: <CheckCircleIcon />, color: '#4caf50' },
    { label: 'ส่งกลับแก้ไข', value: '0', icon: <CancelIcon />, color: '#f44336' },
    { label: 'ทั้งหมด', value: '1', icon: <DescriptionIcon />, color: '#2196f3' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard ผู้ตรวจสอบเอกสาร | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#2196f3' }}>
        <Toolbar>
          <DescriptionIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบตรวจสอบเอกสาร GACP
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName}</strong>
                <br />
                <small>{currentUser.department}</small>
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          แดชบอร์ดตรวจสอบเอกสาร
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
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="รอตรวจสอบ" />
            <Tab label="ตรวจสอบแล้ว" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่คำขอ</TableCell>
                  <TableCell>ชื่อเกษตรกร</TableCell>
                  <TableCell>ฟาร์ม</TableCell>
                  <TableCell>พืชที่ปลูก</TableCell>
                  <TableCell>วันที่ยื่น</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tabValue === 0 && pendingApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                        ไม่มีเอกสารรอตรวจสอบ
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tabValue === 0 ? (
                  pendingApplications.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.applicationNumber}</TableCell>
                      <TableCell>{app.farmerName}</TableCell>
                      <TableCell>{app.farmName}</TableCell>
                      <TableCell>{app.cropType}</TableCell>
                      <TableCell>{app.submittedAt.toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>
                        <Chip
                          label={WorkflowService.getStatusLabel(app.status)}
                          size="small"
                          sx={{
                            backgroundColor: WorkflowService.getStatusColor(app.status),
                            color: '#fff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => router.push(`/document-checker/review/${app.id}`)}
                        >
                          ตรวจสอบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                        ไม่มีรายการ
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
