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
  MenuBook as MenuBookIcon,
  TaskAlt as TaskAltIcon,
  Checklist as ChecklistIcon,
  CloudUpload as CloudUploadIcon,
  Support as SupportIcon
} from '@mui/icons-material';

export default function SopWizardServicePage() {
  const router = useRouter();

  const sopHighlights = [
    'ตัวช่วยสร้าง SOP สำหรับการเพาะปลูกกัญชาแบบทีละขั้นตอน',
    'กำหนดเวิร์กโฟลว์การอนุมัติและการทบทวนเอกสารได้ละเอียด',
    'อัปโหลดหลักฐานและแนบรูปภาพได้จากภาคสนาม',
    'สร้าง Template SOP เป็นมาตรฐานกลางสำหรับเครือข่าย'
  ];

  return (
    <>
      <Head>
        <title>GACP SOP Wizard | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography variant="h6">SOP Wizard</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#fff3e0', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
                เครื่องมือสร้าง SOP กัญชาอัจฉริยะ
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                ช่วยทีมกำหนดมาตรฐานการเพาะปลูก กำหนดเวิร์กโฟลว์ และยกระดับความสอดคล้องกับ GACP
                อย่างต่อเนื่อง
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => router.push('/login')}>
                  เริ่มสร้าง SOP ใหม่
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/field-inspection')}
                >
                  ผสานกับการตรวจแปลงภาคสนาม
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ChecklistIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Supporting Module
                      </Typography>
                      <Chip label="จัดการเอกสารมาตรฐาน" color="primary" size="small" />
                    </Box>
                  </Box>
                  <List>
                    {sopHighlights.map(item => (
                      <ListItem key={item} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <TaskAltIcon color="primary" />
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
              title: 'SOP Builder',
              description: 'ตัวช่วยสร้างทีละขั้นพร้อมคำแนะนำจากผู้เชี่ยวชาญของกรมการแพทย์แผนไทย',
              icon: <MenuBookIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Approval Workflow',
              description: 'รองรับการพิจารณาโดยหลายบทบาทพร้อม Log การอนุมัติ',
              icon: <ChecklistIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Field Evidence Capture',
              description: 'อัปโหลดภาพถ่ายและข้อมูลภาคสนามได้ผ่านเว็บและมือถือ',
              icon: <CloudUploadIcon color="primary" sx={{ fontSize: 34 }} />
            },
            {
              title: 'Continuous Support',
              description: 'ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำและอัปเดตมาตรฐานอย่างต่อเนื่อง',
              icon: <SupportIcon color="primary" sx={{ fontSize: 34 }} />
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
