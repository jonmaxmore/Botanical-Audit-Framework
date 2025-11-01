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
  WorkspacePremium as WorkspacePremiumIcon,
  Verified as VerifiedIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  History as HistoryIcon
} from '@mui/icons-material';

export default function CertificateServicePage() {
  const router = useRouter();

  const benefits = [
    'ออกใบรับรองดิจิทัลพร้อมลายเซ็นอิเล็กทรอนิกส์',
    'ตรวจสอบสถานะใบรับรองได้ทันทีผ่าน QR Code',
    'เก็บประวัติการออกใบรับรองและการต่ออายุครบถ้วน',
    'ส่งออกสำเนาใบรับรองเป็น PDF ภายในคลิกเดียว'
  ];

  return (
    <>
      <Head>
        <title>ระบบออกใบรับรอง GACP | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <WorkspacePremiumIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Certificate Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#fffde7', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                ระบบออกใบรับรอง GACP
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                สนับสนุนการออก ตรวจสอบ และจัดเก็บใบรับรองกัญชา GACP แบบดิจิทัล
                พร้อมเชื่อมต่อการยื่นคำขอ
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  เปิดแดชบอร์ดเจ้าหน้าที่
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/application')}
                >
                  ขั้นตอนการยื่นคำขอ
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Supporting Module
                      </Typography>
                      <Chip label="เชื่อมต่อระบบยื่นคำขอ" color="primary" size="small" />
                    </Box>
                  </Box>
                  <List>
                    {benefits.map(item => (
                      <ListItem key={item} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <QrCodeIcon color="primary" />
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
          ฟังก์ชันสำคัญ
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: 'ศูนย์ออกใบรับรองกลาง',
              description: 'เจ้าหน้าที่ DTAM สามารถออกหรือเพิกถอนใบรับรองได้ในระบบเดียว',
              icon: <WorkspacePremiumIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'ตรวจสอบย้อนกลับได้ทันที',
              description: 'ประชาชนและคู่ค้าสามารถสแกน QR Code เพื่อยืนยันความถูกต้องของใบรับรอง',
              icon: <QrCodeIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'เก็บประวัติครบวงจร',
              description:
                'เก็บประวัติการออกใบรับรอง การต่ออายุ และสาเหตุการเพิกถอนเพื่อการตรวจสอบ',
              icon: <HistoryIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'ดาวน์โหลดใช้งานได้ทันที',
              description: 'เจ้าของใบรับรองสามารถดาวน์โหลด PDF ได้จากแอปพลิเคชันทุกเวลา',
              icon: <DownloadIcon color="primary" sx={{ fontSize: 34 }} />
            }
          ].map(feature => (
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
