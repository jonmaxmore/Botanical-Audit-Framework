'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import { VerifiedUser, PictureAsPdf, CheckCircle } from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Remove auto-redirect - let users browse landing page
    // They can choose to login or apply
  }, [router]);

  const features = [
    {
      icon: <VerifiedUser sx={{ fontSize: 48, color: '#2196f3' }} />,
      title: 'ยื่นคำขอใบรับรอง',
      description: 'ยื่นขอใบรับรองมาตรฐาน GACP ออนไลน์ได้ตลอด 24 ชั่วโมง',
    },
    {
      icon: <PictureAsPdf sx={{ fontSize: 48, color: '#2196f3' }} />,
      title: 'อัปโหลดเอกสาร',
      description: 'แนบเอกสารประกอบคำขอได้อย่างปลอดภัยและสะดวก',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 48, color: '#2196f3' }} />,
      title: 'ติดตามสถานะ',
      description: 'ตรวจสอบสถานะคำขอและความคืบหน้าแบบ Real-time',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          py: 12,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" fontWeight={700} gutterBottom>
              � ระบบยื่นขอใบรับรอง GACP
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              ยื่นคำขอใบรับรองมาตรฐาน GACP ออนไลน์ สะดวก รวดเร็ว ปลอดภัย
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/application/new')}
                sx={{
                  bgcolor: 'white',
                  color: '#1976d2',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                ยื่นคำขอใหม่
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/applications')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#f5f5f5',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                คำขอของฉัน
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
          ขั้นตอนการยื่นคำขอ
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          ระบบยื่นขอใบรับรองมาตรฐาน GACP สะดวก รวดเร็ว
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Process Steps Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            ขั้นตอนการดำเนินการ
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            ตั้งแต่ยื่นคำขอจนได้รับใบรับรอง
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  1️⃣ ยื่นคำขอและชำระเงิน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรอกข้อมูลและอัปโหลดเอกสาร จากนั้นชำระค่าธรรมเนียม 5,000 บาท
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  2️⃣ ตรวจสอบเอกสาร
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เจ้าหน้าที่ตรวจสอบความถูกต้องของเอกสาร (ใช้เวลา 3-5 วันทำการ)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  3️⃣ ตรวจสอบภาคสนาม
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ชำระค่าธรรมเนียม 25,000 บาท และนัดหมายตรวจฟาร์ม หลังผ่านการตรวจจะได้รับใบรับรอง
                  GACP
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h3" fontWeight={700} color="primary">
                30,000 ฿
              </Typography>
              <Typography variant="h6" color="text.secondary">
                ค่าธรรมเนียมรวม
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                (ชำระ 2 งวด)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" fontWeight={700} color="primary">
                14-21
              </Typography>
              <Typography variant="h6" color="text.secondary">
                วันทำการ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                (โดยประมาณ)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" fontWeight={700} color="primary">
                24/7
              </Typography>
              <Typography variant="h6" color="text.secondary">
                บริการออนไลน์
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                (ยื่นคำขอได้ตลอดเวลา)
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            © 2025 ระบบยื่นขอใบรับรอง GACP - กรมวิชาการเกษตร
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
            สอบถามข้อมูลเพิ่มเติม: โทร 02-XXX-XXXX หรือ Email: gacp@doa.go.th
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
