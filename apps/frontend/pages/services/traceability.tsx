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
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  QrCode as QrCodeIcon,
  Eco as EcoIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export default function TraceabilityPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>ระบบติดตามย้อนกลับ | GACP System</title>
      </Head>

      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <QrCodeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            GACP System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f0f2ff', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบติดตามย้อนกลับ
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                ติดตามเส้นทางผลิตภัณฑ์สมุนไพรตั้งแต่แหล่งปลูกถึงผู้บริโภค ด้วยระบบ QR Code
                ที่โปร่งใสและตรวจสอบได้
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 2, backgroundColor: '#3f51b5' }}
                onClick={() => router.push('/login')}
              >
                เริ่มใช้งาน
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                <QrCodeIcon sx={{ fontSize: 120, color: '#3f51b5', mb: 2 }} />
                <Typography variant="body2" sx={{ mb: 2 }}>
                  ตัวอย่าง QR Code สำหรับการติดตามย้อนกลับ
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          กระบวนการติดตามย้อนกลับ
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}
        >
          ระบบติดตามย้อนกลับช่วยให้ผู้บริโภคสามารถเข้าถึงข้อมูลของผลิตภัณฑ์
          ตั้งแต่การเพาะปลูกจนถึงการจำหน่าย
        </Typography>

        <Stepper alternativeLabel sx={{ mb: 6 }}>
          <Step active>
            <StepLabel icon={<EcoIcon sx={{ color: '#3f51b5' }} />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                การเพาะปลูก
              </Typography>
            </StepLabel>
          </Step>
          <Step active>
            <StepLabel icon={<LocalShippingIcon sx={{ color: '#3f51b5' }} />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                การขนส่ง
              </Typography>
            </StepLabel>
          </Step>
          <Step active>
            <StepLabel icon={<StoreIcon sx={{ color: '#3f51b5' }} />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                การจำหน่าย
              </Typography>
            </StepLabel>
          </Step>
          <Step active>
            <StepLabel icon={<PersonIcon sx={{ color: '#3f51b5' }} />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ผู้บริโภค
              </Typography>
            </StepLabel>
          </Step>
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  สำหรับเกษตรกรและผู้ผลิต
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  - สร้าง QR Code เฉพาะสำหรับผลิตภัณฑ์ของคุณ
                  <br />
                  - บันทึกข้อมูลการผลิตแบบเรียลไทม์
                  <br />
                  - แสดงใบรับรองมาตรฐาน GACP ให้ลูกค้าเห็น
                  <br />- ติดตามสินค้าคงคลังและการกระจายผลิตภัณฑ์
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  สำหรับผู้บริโภค
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  - สแกน QR Code เพื่อดูข้อมูลผลิตภัณฑ์
                  <br />
                  - เรียนรู้แหล่งที่มาและวิธีการผลิต
                  <br />
                  - ตรวจสอบมาตรฐานและใบรับรอง
                  <br />- เข้าถึงคำแนะนำการใช้และประโยชน์ของสมุนไพร
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/services/traceability/demo')}
            sx={{ mx: 1, color: '#3f51b5', borderColor: '#3f51b5' }}
          >
            ทดลองสแกน QR
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{ mx: 1, backgroundColor: '#3f51b5' }}
          >
            เริ่มใช้งาน
          </Button>
        </Box>
      </Container>
    </>
  );
}
