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
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalFlorist as LocalFloristIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  ReceiptLong as ReceiptLongIcon,
  ShowChart as ShowChartIcon,
  Cloud as CloudIcon
} from '@mui/icons-material';

export default function FarmManagementPage() {
  const router = useRouter();

  const features = [
    {
      title: 'บันทึกกิจกรรมในฟาร์ม',
      description: 'บันทึกการปลูก การให้น้ำ การใส่ปุ๋ย และการใช้สารป้องกันกำจัดศัตรูพืช',
      icon: <CheckCircleIcon color="primary" />
    },
    {
      title: 'ติดตามการเจริญเติบโต',
      description: 'ติดตามการเจริญเติบโตของพืชตั้งแต่เริ่มปลูกจนถึงเก็บเกี่ยว',
      icon: <TimelineIcon color="primary" />
    },
    {
      title: 'บริหารต้นทุนและรายได้',
      description: 'คำนวณต้นทุน ประมาณการรายได้ และวิเคราะห์ความคุ้มค่า',
      icon: <ReceiptLongIcon color="primary" />
    },
    {
      title: 'รายงานและการวิเคราะห์',
      description: 'สรุปผลการดำเนินงาน ผลผลิต และคุณภาพตามมาตรฐาน',
      icon: <ShowChartIcon color="primary" />
    },
    {
      title: 'ข้อมูลสภาพอากาศ',
      description: 'แสดงข้อมูลสภาพอากาศล่าสุดและพยากรณ์อากาศสำหรับพื้นที่ของคุณ',
      icon: <CloudIcon color="primary" />
    }
  ];

  return (
    <>
      <Head>
        <title>ระบบบริหารจัดการฟาร์ม | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <LocalFloristIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            GACP System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบบริหารจัดการฟาร์ม
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                บริหารจัดการฟาร์มตามมาตรฐาน GACP อย่างมีประสิทธิภาพและแม่นยำ
                ด้วยระบบดิจิทัลที่ช่วยให้การทำงานง่ายขึ้น
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
                onClick={() => router.push('/login')}
              >
                เริ่มใช้งาน
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/farm-management.jpg"
                alt="Farm Management"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
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
          คุณสมบัติหลัก
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}
        >
          ระบบบริหารจัดการฟาร์มที่ครบครันสำหรับเกษตรกรที่ต้องการจัดการฟาร์มตามมาตรฐาน GACP
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" component="h3" sx={{ ml: 2, fontWeight: 600 }}>
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

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/services/farm-management/demo')}
            sx={{ mx: 1 }}
          >
            ดูตัวอย่าง
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{ mx: 1 }}
          >
            เริ่มใช้งาน
          </Button>
        </Box>
      </Container>
    </>
  );
}
