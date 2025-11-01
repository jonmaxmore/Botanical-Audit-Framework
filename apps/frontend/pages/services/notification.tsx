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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NotificationsActive as NotificationsActiveIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

export default function NotificationServicePage() {
  const router = useRouter();

  const notificationChannels = [
    { label: 'SMS', icon: <SmsIcon color="primary" /> },
    { label: 'Email', icon: <EmailIcon color="primary" /> },
    { label: 'Mobile Push', icon: <PhoneAndroidIcon color="primary" /> }
  ];

  return (
    <>
      <Head>
        <title>ระบบแจ้งเตือนอัจฉริยะ | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <NotificationsActiveIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Center</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f9fbe7', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
                ระบบแจ้งเตือนอัจฉริยะ
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                แจ้งเตือนทุกเหตุการณ์สำคัญจากการเพาะปลูกถึงการออกใบรับรอง
                ให้ทุกฝ่ายได้รับข้อมูลตรงเวลาบนหลายช่องทาง
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  ทดลองแดชบอร์ดแจ้งเตือน
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/application')}
                >
                  ตั้งค่าการแจ้งเตือนใบคำขอ
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <InsightsIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Supporting Module
                      </Typography>
                      <Chip label="ผสานการแจ้งเตือนหลายช่องทาง" color="primary" size="small" />
                    </Box>
                  </Box>
                  <List>
                    {notificationChannels.map(channel => (
                      <ListItem key={channel.label} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>{channel.icon}</ListItemIcon>
                        <ListItemText
                          primary={channel.label}
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
              title: 'Automation Workflow',
              description: 'กำหนดเงื่อนไขแจ้งเตือนสำหรับการปลูก ตรวจสอบ และออกใบรับรองได้ละเอียด',
              icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Multi-channel Delivery',
              description: 'ส่งผ่าน SMS, Email, และ Mobile Push พร้อม log การส่งกลับมาที่ระบบ',
              icon: <EmailIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Role-based Subscriptions',
              description:
                'แพทย์ นักวิจัย เจ้าหน้าที่ และเกษตรกรสามารถเลือกรับการแจ้งเตือนได้ตามบทบาท',
              icon: <PhoneAndroidIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Insight Dashboard',
              description: 'วิเคราะห์ประสิทธิภาพการแจ้งเตือนด้วยเมตริกการเปิดอ่านและการตอบกลับ',
              icon: <InsightsIcon color="primary" sx={{ fontSize: 34 }} />
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
      </Container>
    </>
  );
}
