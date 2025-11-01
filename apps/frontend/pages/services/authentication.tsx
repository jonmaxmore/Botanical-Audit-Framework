import React from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LockOutlined as LockOutlinedIcon,
  VerifiedUser as VerifiedUserIcon,
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Api as ApiIcon
} from '@mui/icons-material';

export default function AuthenticationPage() {
  const router = useRouter();

  const features = [
    {
      title: 'Single Sign-On (SSO)',
      description: 'เข้าสู่ระบบครั้งเดียวเพื่อเข้าถึงทุกพอร์ทัลของแพลตฟอร์ม ลดการจำรหัสผ่านหลายชุด',
      icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 36 }} />
    },
    {
      title: 'Multi-factor Authentication (MFA)',
      description: 'รองรับการยืนยันตัวตนหลายปัจจัยเพื่อเสริมความปลอดภัยสำหรับผู้ใช้สำคัญ',
      icon: <FingerprintIcon color="primary" sx={{ fontSize: 36 }} />
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      description: 'จัดการสิทธิ์ตามบทบาทเพื่อให้ข้อมูลสำคัญเข้าถึงได้เฉพาะผู้มีสิทธิ์',
      icon: <SecurityIcon color="primary" sx={{ fontSize: 36 }} />
    },
    {
      title: 'Centralized User Management',
      description: 'ควบคุมบัญชีผู้ใช้ การรีเซ็ตรหัสผ่าน และการเพิกถอนสิทธิ์จากศูนย์กลางเดียว',
      icon: <SettingsIcon color="primary" sx={{ fontSize: 36 }} />
    }
  ];

  const integrationPoints = [
    'API กลางสำหรับสมัครสมาชิก ยืนยัน OTP และตรวจสอบสิทธิ์',
    'JWT Access + Refresh Token พร้อมกลไก Rotation',
    'Session Management ที่รองรับการแจ้งเตือนหมดอายุแบบเรียลไทม์',
    'รวมกับระบบ Application, Farm Management, Track & Trace, Survey และ Standards'
  ];

  return (
    <>
      <Head>
        <title>ระบบสมาชิกและการยืนยันตัวตน (SSO) | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <LockOutlinedIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Authentication & SSO
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#e8f5e9', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบสมาชิกและการยืนยันตัวตน (SSO)
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                โครงสร้างพื้นฐานด้านความปลอดภัยที่เชื่อมต่อทุกโมดูลของแพลตฟอร์ม
                กำหนดสิทธิ์ได้ละเอียดและพร้อมรองรับการขยายตัวในอนาคต
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  เข้าสู่ระบบ
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/authentication/integration')}
                >
                  คู่มือการเชื่อมต่อ
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LockOutlinedIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Production Ready
                      </Typography>
                      <Chip label="Core Infrastructure" color="success" size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    ระบบรองรับผู้ใช้หลายบทบาทพร้อมการตรวจสอบย้อนหลัง ใช้โครงสร้าง Token
                    แบบแยกส่วนเพื่อความปลอดภัยสูงสุด
                  </Typography>
                  <List>
                    {integrationPoints.map(item => (
                      <ListItem key={item} disableGutters sx={{ alignItems: 'flex-start' }}>
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
          คุณสมบัติหลัก
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 820, mx: 'auto', mb: 6 }}
        >
          สร้างประสบการณ์ใช้งานที่ต่อเนื่องทั้งฝั่งเกษตรกร เจ้าหน้าที่ DTAM และผู้บริหาร ด้วยโซลูชัน
          SSO แบบรวมศูนย์
        </Typography>

        <Grid container spacing={4}>
          {features.map(feature => (
            <Grid item xs={12} md={6} key={feature.title}>
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
        </Grid>
      </Container>
    </>
  );
}
