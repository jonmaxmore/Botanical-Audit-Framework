import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
  Api as ApiIcon,
  LockOutlined as LockOutlinedIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Settings as SettingsIcon,
  Password as PasswordIcon
} from '@mui/icons-material';

export default function AuthenticationIntegrationPage() {
  const router = useRouter();

  const setupSteps = [
    'ตั้งค่า Environment Variables สำหรับ JWT, MongoDB, Bcrypt',
    'เชื่อมต่อโมดูล Farmer Auth และ DTAM Auth ผ่าน Container',
    'กำหนด Middleware สำหรับเส้นทาง Farmer, Staff และ Mixed Access',
    'ตรวจสอบบทบาทและสิทธิ์ (17 Permissions) ก่อนเปิดใช้งาน Production'
  ];

  const apiEndpoints = [
    '/api/farmers/register, /api/farmers/login, /api/farmers/profile',
    '/api/dtam/login, /api/dtam/profile, /api/dtam/staff',
    '/api/auth/refresh-token, /api/auth/logout'
  ];

  const securityPractices = [
    'Rotate JWT Secret และ Refresh Token ทุก 90 วัน',
    'กำหนด Password Policy ขั้นต่ำ 12 ตัวอักษรพร้อม Symbols',
    'บันทึก Audit Log ทุกกิจกรรมของ Staff และ Critical Actions',
    'บังคับใช้ MFA สำหรับบทบาท ADMIN และ MANAGER'
  ];

  return (
    <>
      <Head>
        <title>การเชื่อมต่อระบบ Authentication & SSO | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/services/authentication')}
          >
            กลับหน้าระบบ SSO
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <IntegrationInstructionsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Integration Guide</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#ede7f6', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
                คู่มือเชื่อมต่อระบบ Authentication & SSO
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                รองรับทั้งเกษตรกรและเจ้าหน้าที่ DTAM ด้วยโครงสร้างแบบ Clean Architecture ใช้งาน
                Middleware จัดการบทบาทและสิทธิ์ได้ครบถ้วน
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component="a"
                  variant="contained"
                  size="large"
                  href="https://github.com/jonmaxmore/Botanical-Audit-Framework/blob/main/docs/AUTHENTICATION_INTEGRATION_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ดาวน์โหลดคู่มือฉบับเต็ม
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/authentication')}
                >
                  กลับสรุปคุณสมบัติ
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockOutlinedIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Clean Architecture Ready
                      </Typography>
                      <Chip label="Farmer + DTAM Auth Modules" color="primary" size="small" />
                    </Box>
                  </Box>
                  <List>
                    {apiEndpoints.map(item => (
                      <ListItem key={item} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <ApiIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          ขั้นตอนการเชื่อมต่อระบบ
        </Typography>
        <Stepper alternativeLabel activeStep={setupSteps.length - 1} sx={{ mb: 6 }}>
          {setupSteps.map(step => (
            <Step key={step} completed>
              <StepLabel icon={<SettingsIcon color="primary" />}>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 820, mx: 'auto', mb: 6 }}
        >
          ใช้ Middleware `authenticateFarmer`, `authenticateDTAMStaff`, และ `requirePermission`
          เพื่อกำหนดการเข้าถึงในแต่ละโมดูล พร้อมรองรับ Optional Auth สำหรับข้อมูลสาธารณะ
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: 'Role & Permission Control',
              description:
                'รองรับ 4 บทบาทหลักพร้อม 17 สิทธิ์ ใช้ร่วมกับ requireRole และ requirePermission',
              icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Security Hardening',
              description:
                'เปิดใช้ MFA, Rotation ของ JWT Secret และบังคับใช้ Password Policy ระดับสูง',
              icon: <SecurityIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Credential Management',
              description:
                'แยก Token ของ Farmer/DTAM พร้อม Refresh Token Rotation และ Session Timeout',
              icon: <PasswordIcon color="primary" sx={{ fontSize: 34 }} />
            }
          ].map(feature => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon color="primary" sx={{ fontSize: 34, mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    แนวปฏิบัติด้านความปลอดภัยที่แนะนำ
                  </Typography>
                </Box>
                <List>
                  {securityPractices.map(practice => (
                    <ListItem key={practice} disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={practice}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
