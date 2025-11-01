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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  FileDownload as FileDownloadIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

export default function ReportingServicePage() {
  const router = useRouter();

  const analyticsHighlights = [
    'Dashboard สำหรับผู้บริหารที่แสดง KPI ของโครงการกัญชา',
    'รายงานการตรวจแปลง การยื่นคำขอ และสถานะใบรับรองแบบเรียลไทม์',
    'เชื่อมต่อข้อมูลจากระบบ Track & Trace และ Digital Logbook',
    'รองรับการส่งออกข้อมูลสู่ Excel และ Power BI'
  ];

  return (
    <>
      <Head>
        <title>ระบบรายงานและวิเคราะห์ข้อมูล | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <AssessmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Reporting & Analytics</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f1f8e9', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
                ระบบรายงานและวิเคราะห์ข้อมูล
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                แปลงข้อมูลจากทุกโมดูลของ GACP System
                เป็นอินไซต์และรายงานเชิงลึกเพื่อการตัดสินใจแบบเรียลไทม์
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  เข้าดูแดชบอร์ดผู้บริหาร
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/track-trace')}
                >
                  ดูข้อมูล Traceability
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TimelineIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Supporting Module
                      </Typography>
                      <Chip label="บูรณาการข้อมูลข้ามระบบ" color="primary" size="small" />
                    </Box>
                  </Box>
                  <List>
                    {analyticsHighlights.map(item => (
                      <ListItem key={item} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AnalyticsIcon color="primary" />
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
              title: 'Executive Dashboard',
              description: 'นำเสนอ KPIs สำคัญของโครงการกัญชาแบบเรียลไทม์พร้อมกราฟและแผนที่',
              icon: <AssessmentIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Traceability Analytics',
              description: 'สรุปข้อมูลจาก Track & Trace และ Logbook เพื่อวิเคราะห์จุดวิกฤต',
              icon: <TimelineIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Predictive Insights',
              description: 'ใช้ Machine Learning บนข้อมูลการปลูกและการตรวจ เพื่อคาดการณ์ความเสี่ยง',
              icon: <InsightsIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Export & Sharing',
              description: 'รองรับการส่งออกข้อมูลเป็น Excel, CSV, PDF รวมถึงการเชื่อมต่อ Power BI',
              icon: <FileDownloadIcon color="primary" sx={{ fontSize: 34 }} />
            }
          ].map(feature => (
            <Grid item xs={12} md={6} key={feature.title}>
              <Card>
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
        <Divider sx={{ my: 6 }} />
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            เชื่อมต่อกับระบบนิเวศกัญชา DTAM ได้ครบวงจร
          </Typography>
          <Button variant="contained" size="large" onClick={() => router.push('/contact')}>
            พูดคุยกับทีมวิเคราะห์ข้อมูล
          </Button>
        </Box>
      </Container>
    </>
  );
}
