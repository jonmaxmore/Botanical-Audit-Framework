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
  Route as RouteIcon,
  QrCode as QrCodeIcon,
  Insights as InsightsIcon,
  LocalShipping as LocalShippingIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

export default function TrackTracePage() {
  const router = useRouter();

  const steps = ['เมล็ดพันธุ์', 'การเพาะปลูก', 'การเก็บเกี่ยว', 'การแปรรูป', 'การจัดจำหน่าย'];

  const features = [
    {
      title: 'Seed-to-Sale Visibility',
      description: 'ติดตามข้อมูลตั้งแต่เมล็ดจนถึงผู้บริโภคผ่านแดชบอร์ดเดียว',
      icon: <RouteIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'QR Code Generation & Verification',
      description: 'สร้างและสแกน QR Code เพื่อแสดงข้อมูลผลิตภัณฑ์แบบเรียลไทม์',
      icon: <QrCodeIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Compliance Reporting',
      description: 'สร้างรายงานการกำกับดูแลและตรวจสอบย้อนกลับตามมาตรฐาน GACP',
      icon: <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Inventory Monitoring',
      description: 'ติดตามล็อตสินค้าและสถานะสินค้าคงคลังเพื่อจัดการการกระจายสินค้า',
      icon: <InventoryIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Supply Chain Analytics',
      description: 'วิเคราะห์ข้อมูลการเคลื่อนย้ายสินค้าเพื่อเพิ่มประสิทธิภาพห่วงโซ่อุปทาน',
      icon: <InsightsIcon color="primary" sx={{ fontSize: 34 }} />
    }
  ];

  return (
    <>
      <Head>
        <title>ระบบติดตามย้อนกลับ (Track & Trace) | GACP System</title>
      </Head>

      <AppBar position="static" sx={{ backgroundColor: '#004d40' }}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <RouteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Track & Trace System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#e0f2f1', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบติดตามย้อนกลับ (Track & Trace)
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                ตรวจสอบเส้นทางสินค้ากัญชาตั้งแต่ต้นทางถึงปลายทาง
                เชื่อมต่อข้อมูลจากระบบยื่นคำขอและฟาร์มแบบไร้รอยต่อ
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  เข้าสู่ระบบ
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/traceability')}
                >
                  เรียนรู้เพิ่มเติม
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QrCodeIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Production Ready
                      </Typography>
                      <Chip label="Integrated Core Service" color="success" size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    รองรับการบันทึกข้อมูลแบบเรียลไทม์ การออก QR Code สำหรับทุกล็อตสินค้า
                    และการแสดงข้อมูลย้อนกลับสำหรับประชาชน
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          เส้นทางการติดตามสินค้า
        </Typography>

        <Stepper alternativeLabel activeStep={steps.length - 1} sx={{ mb: 6 }}>
          {steps.map(label => (
            <Step key={label} completed>
              <StepLabel icon={<LocalShippingIcon color="primary" />}>{label}</StepLabel>
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
          พลิกโฉมห่วงโซ่อุปทานให้โปร่งใส สร้างความมั่นใจให้ผู้บริโภคและหน่วยงานกำกับดูแล
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
