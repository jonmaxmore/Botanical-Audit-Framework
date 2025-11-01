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
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  UploadFile as UploadFileIcon,
  Checklist as ChecklistIcon,
  Payment as PaymentIcon,
  NotificationsActive as NotificationsActiveIcon,
  TrackChanges as TrackChangesIcon
} from '@mui/icons-material';

export default function ApplicationServicePage() {
  const router = useRouter();

  const features = [
    {
      title: '7-Step Application Wizard',
      description: 'ระบบช่วยนำทางการยื่นคำขอรับรองตั้งแต่เตรียมข้อมูลจนถึงยื่นคำร้อง',
      icon: <ChecklistIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Document Management',
      description: 'อัปโหลด จัดการ และตรวจสอบความครบถ้วนของเอกสารได้ในระบบเดียว',
      icon: <UploadFileIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Integrated Payments',
      description: 'รองรับการชำระค่าธรรมเนียมแบบออนไลน์และออกใบเสร็จรับเงินอัตโนมัติ',
      icon: <PaymentIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Real-time Notifications',
      description: 'แจ้งเตือนทุกสถานะผ่านอีเมล SMS และ In-app Notification',
      icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Status Tracking Dashboard',
      description: 'มุมมองเดียวติดตามสถานะทั้งฝั่งเกษตรกรและเจ้าหน้าที่ DTAM',
      icon: <TrackChangesIcon color="primary" sx={{ fontSize: 34 }} />
    }
  ];

  const steps = [
    'ลงทะเบียนข้อมูลฟาร์มและผู้รับผิดชอบ',
    'เลือกประเภทผลิตภัณฑ์และพื้นที่เพาะปลูก',
    'อัปโหลดเอกสารและหลักฐานที่เกี่ยวข้อง',
    'ตรวจสอบและชำระค่าธรรมเนียม',
    'การตรวจสอบเอกสารโดยเจ้าหน้าที่',
    'การตรวจประเมินภาคสนาม',
    'อนุมัติและออกใบรับรอง'
  ];

  return (
    <>
      <Head>
        <title>ระบบยื่นคำขอรับรองกัญชา GACP | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <AssignmentTurnedInIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            GACP Application System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f3e5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบยื่นคำขอรับรองกัญชา GACP
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                เปลี่ยนการยื่นรับรองให้เป็นดิจิทัลครบวงจร
                ติดตามได้ทุกขั้นตอนและโปร่งใสสำหรับทั้งเกษตรกรและเจ้าหน้าที่
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/register')}>
                  เริ่มยื่นคำขอ
                </Button>
                <Button variant="outlined" size="large" onClick={() => router.push('/login')}>
                  เข้าสู่ระบบ DTAM
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Production Ready
                      </Typography>
                      <Chip label="Core Business Service" color="primary" size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    รวม Workflow 7 ขั้นตอน พร้อมการอนุมัติหลายระดับ การแจ้งเตือนเรียลไทม์
                    และการบูรณาการกับระบบฟาร์มและ Track & Trace
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          ขั้นตอนการยื่นคำขอรับรอง
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 820, mx: 'auto', mb: 6 }}
        >
          ติดตามความคืบหน้าของการขอรับรองได้แบบเรียลไทม์ ทุกฝ่ายเห็นสถานะเดียวกัน ลดงานเอกสารซ้ำซ้อน
        </Typography>

        <Stepper alternativeLabel activeStep={steps.length - 1} sx={{ mb: 6 }}>
          {steps.map(label => (
            <Step key={label} completed>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mt: 8 }}>
          คุณสมบัติเด่น
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
