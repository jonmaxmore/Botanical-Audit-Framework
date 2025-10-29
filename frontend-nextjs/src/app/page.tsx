'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Agriculture,
  Assignment,
  Payment,
  FactCheck,
  LocationOn,
  CheckCircle,
  CardMembership,
  Login,
  PersonAdd,
  ArrowForward,
  Description,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { useRouter } from 'next/navigation';
import WorkflowProgress from '@/components/WorkflowProgress';

// Guest Landing Page (not logged in)
function GuestLandingPage() {
  const router = useRouter();

  const workflowSteps = [
    {
      step: 1,
      icon: <Assignment />,
      title: 'ยื่นคำขอ',
      description: 'กรอกข้อมูลฟาร์มและอัปโหลดเอกสาร',
    },
    {
      step: 2,
      icon: <Payment />,
      title: 'ชำระเงินรอบแรก',
      description: '5,000 บาท (ค่าตรวจเอกสาร)',
    },
    {
      step: 3,
      icon: <Description />,
      title: 'ตรวจสอบเอกสาร',
      description: 'เจ้าหน้าที่ DTAM ตรวจสอบ',
    },
    { step: 4, icon: <FactCheck />, title: 'เอกสารผ่าน', description: 'พร้อมต่อขั้นตอนถัดไป' },
    {
      step: 5,
      icon: <Payment />,
      title: 'ชำระเงินรอบสอง',
      description: '25,000 บาท (ค่าตรวจฟาร์ม)',
    },
    {
      step: 6,
      icon: <LocationOn />,
      title: 'ตรวจสอบฟาร์ม',
      description: 'VDO Call และ/หรือลงพื้นที่',
    },
    { step: 7, icon: <CheckCircle />, title: 'อนุมัติผล', description: 'ตัดสินผลการรับรอง' },
    {
      step: 8,
      icon: <CardMembership />,
      title: 'รับใบรับรอง',
      description: 'ดาวน์โหลด Certificate',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={700} gutterBottom>
            ระบบรับรองมาตรฐาน GACP
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Good Agricultural and Collection Practices
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
            ระบบการรับรองมาตรฐาน WHO-GACP สำหรับการปลูกพืชสมุนไพรและกัญชาทางการแพทย์
            ภายใต้การกำกับของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => router.push('/register')}
              sx={{
                bgcolor: 'white',
                color: '#2e7d32',
                mr: 2,
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              สมัครสมาชิก
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Login />}
              onClick={() => router.push('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
          <Timeline sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          ขั้นตอนการรับรอง GACP (8 ขั้นตอน)
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          กระบวนการรับรองมาตรฐานที่โปร่งใส ตรวจสอบได้ ทุกขั้นตอน
        </Typography>

        <Grid container spacing={3}>
          {workflowSteps.map((step) => (
            <Grid item xs={12} sm={6} md={3} key={step.step}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  textAlign: 'center',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>
                <Chip label={`ขั้นตอน ${step.step}`} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 6, p: 4, bgcolor: '#f5f5f5' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight={700} color="primary" textAlign="center">
                5,000 + 25,000
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                บาท (ค่าธรรมเนียมทั้งหมด)
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight={700} color="primary" textAlign="center">
                8
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                ขั้นตอนการรับรอง
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight={700} color="primary" textAlign="center">
                80+
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                คะแนนขั้นต่ำผ่าน
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight={700} color="primary" textAlign="center">
                24/7
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                เข้าถึงระบบได้ตลอดเวลา
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

// Logged In Landing Page (role-based)
function AuthenticatedLandingPage() {
  const { user } = useAuth();
  const { applications, fetchApplications, isLoading } = useApplication();
  const router = useRouter();
  const [activeApp, setActiveApp] = useState<any>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (applications && applications.length > 0) {
      const active = applications.find(
        (app) => app.currentState !== 'CERTIFICATE_ISSUED' && app.currentState !== 'REJECTED'
      );
      setActiveApp(active || applications[0]);
    }
  }, [applications]);

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'DTAM_OFFICER':
        return '/officer/dashboard';
      case 'INSPECTOR':
        return '/inspector/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'FARMER':
        return [
          {
            label: 'ยื่นคำขอใหม่',
            path: '/farmer/applications/new',
            color: 'primary',
            show: !activeApp,
          },
          {
            label: 'อัปโหลดเอกสาร',
            path: '/farmer/documents',
            color: 'warning',
            show: activeApp?.currentState === 'DRAFT',
          },
          {
            label: 'ชำระเงิน',
            path: '/farmer/payments',
            color: 'error',
            show: activeApp?.currentState?.includes('PAYMENT_PENDING'),
          },
          {
            label: 'ดูใบรับรอง',
            path: '/farmer/certificates',
            color: 'success',
            show: activeApp?.currentState === 'CERTIFICATE_ISSUED',
          },
        ];
      case 'DTAM_OFFICER':
        return [
          { label: 'รายการรอตรวจ', path: '/officer/applications', color: 'primary', show: true },
          { label: 'รายงาน', path: '/officer/reports', color: 'secondary', show: true },
        ];
      case 'INSPECTOR':
        return [
          { label: 'ตารางตรวจสอบ', path: '/inspector/schedule', color: 'primary', show: true },
          { label: 'ส่งรายงาน', path: '/inspector/inspections', color: 'warning', show: true },
        ];
      case 'ADMIN':
        return [
          { label: 'จัดการผู้ใช้', path: '/admin/users', color: 'primary', show: true },
          { label: 'สถิติระบบ', path: '/admin/statistics', color: 'secondary', show: true },
        ];
      default:
        return [];
    }
  };

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'FARMER':
        return 'เกษตรกร';
      case 'DTAM_OFFICER':
        return 'เจ้าหน้าที่ DTAM';
      case 'INSPECTOR':
        return 'ผู้ตรวจสอบ';
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight={600} gutterBottom>
          สวัสดี, {user?.name}
        </Typography>
        <Chip label={getRoleDisplay()} sx={{ bgcolor: 'white', color: '#2e7d32' }} />
      </Paper>

      {user?.role === 'FARMER' && activeApp && (
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ใบสมัครปัจจุบัน: {activeApp.applicationNumber}
          </Typography>
          <Chip
            label={activeApp.currentState}
            color={
              activeApp.currentState === 'CERTIFICATE_ISSUED'
                ? 'success'
                : activeApp.currentState === 'REJECTED'
                  ? 'error'
                  : 'primary'
            }
            sx={{ mb: 3 }}
          />

          <WorkflowProgress
            currentState={activeApp.currentState}
            currentStep={activeApp.currentStep}
          />

          <Box sx={{ mt: 3 }}>
            <LinearProgress
              variant="determinate"
              value={(activeApp.currentStep / 8) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              ความคืบหน้า: {Math.round((activeApp.currentStep / 8) * 100)}% ({activeApp.currentStep}
              /8 ขั้นตอน)
            </Typography>
          </Box>
        </Paper>
      )}

      {user?.role === 'FARMER' && !activeApp && !isLoading && (
        <Alert severity="info" sx={{ mb: 4 }}>
          คุณยังไม่มีใบสมัคร GACP โปรดเริ่มยื่นคำขอใหม่
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          เมนูด่วน
        </Typography>
        <Grid container spacing={2}>
          {getQuickActions()
            .filter((action) => action.show)
            .map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Button
                  variant="contained"
                  color={action.color as any}
                  fullWidth
                  endIcon={<ArrowForward />}
                  onClick={() => router.push(action.path)}
                  sx={{ py: 2 }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              endIcon={<ArrowForward />}
              onClick={() => router.push(getDashboardPath())}
              sx={{ py: 2 }}
            >
              ไปที่ Dashboard
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

// Main Page Component
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return isAuthenticated ? <AuthenticatedLandingPage /> : <GuestLandingPage />;
}
