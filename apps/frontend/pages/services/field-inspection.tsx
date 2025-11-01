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
  Stepper,
  Step,
  StepLabel,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FactCheck as FactCheckIcon,
  CalendarMonth as CalendarMonthIcon,
  ChecklistRtl as ChecklistRtlIcon,
  CameraAlt as CameraAltIcon,
  TaskAlt as TaskAltIcon,
  Insights as InsightsIcon,
  Dangerous as DangerousIcon,
  GppGood as GppGoodIcon
} from '@mui/icons-material';

export default function FieldInspectionServicePage() {
  const router = useRouter();

  const inspectionSteps = [
    'วางแผนและนัดหมายตรวจฟาร์ม (14 วัน)',
    'เตรียมรายการตรวจ 25 หัวข้อ (Critical Control Points)',
    'ตรวจภาคสนามพร้อมเก็บหลักฐาน',
    'ให้คะแนนและบันทึกข้อสังเกตภายในระบบ',
    'สรุปรายงานและออกคำสั่งแก้ไข (ถ้ามี)'
  ];

  const ccpItems = [
    'Seed & Planting Material Quality – 15 คะแนน',
    'Soil & Fertilizer Management – 15 คะแนน',
    'Pest & Disease Management – 15 คะแนน',
    'Harvesting Practices – 15 คะแนน',
    'Post-Harvest Handling – 15 คะแนน',
    'Storage & Transportation – 10 คะแนน',
    'Record Keeping – 10 คะแนน',
    'Worker Training & Safety – 5 คะแนน'
  ];

  const features = [
    {
      title: 'Digital Checklist & Scoring',
      description: 'แบบฟอร์ม 25 หัวข้อพร้อมคะแนนอัตโนมัติ ปรับใช้ตามมาตรฐาน GACP',
      icon: <ChecklistRtlIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Evidence Capture',
      description: 'แนบรูปถ่าย วิดีโอ และบันทึกเสียงจากพื้นที่ตรวจได้ทันที',
      icon: <CameraAltIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Risk-Based Assessment',
      description: 'ระบบคำนวณความเสี่ยงสูง-กลาง-ต่ำ เพื่อเสนอแนะมาตรการเร่งด่วน',
      icon: <DangerousIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Corrective Action Tracking',
      description: 'ติดตามคำสั่งแก้ไขและสถานะการปิดงานของฟาร์มแบบเรียลไทม์',
      icon: <TaskAltIcon color="primary" sx={{ fontSize: 34 }} />
    },
    {
      title: 'Scheduling & Dispatch',
      description: 'บูรณาการปฏิทิน DTAM จัดสรรผู้ตรวจประเมินตามพื้นที่และความชำนาญ',
      icon: <CalendarMonthIcon color="primary" sx={{ fontSize: 34 }} />
    }
  ];

  return (
    <>
      <Head>
        <title>ระบบตรวจประเมินภาคสนาม (Field Inspection) | GACP System</title>
      </Head>

      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <FactCheckIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Field Inspection System</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#e3f2fd', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
                ระบบตรวจประเมินภาคสนาม (Field Inspection)
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                วางแผน ตรวจ และติดตามผลการตรวจฟาร์มกัญชาอย่างเป็นระบบ เชื่อมต่อกับการยื่นคำขอ
                การออกใบรับรอง และ Track & Trace
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login?role=inspector')}
                >
                  เข้าสู่ระบบผู้ตรวจ
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/services/sop')}
                >
                  ดาวน์โหลดเทมเพลต SOP
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <GppGoodIcon color="primary" sx={{ fontSize: 42, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Integrated Core Process
                      </Typography>
                      <Chip
                        label="เชื่อมต่อ Application & Track & Trace"
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <List>
                    {ccpItems.map(item => (
                      <ListItem key={item} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <FactCheckIcon color="primary" />
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
          เวิร์กโฟลว์การตรวจฟาร์ม
        </Typography>
        <Stepper alternativeLabel activeStep={inspectionSteps.length - 1} sx={{ mb: 6 }}>
          {inspectionSteps.map(step => (
            <Step key={step} completed>
              <StepLabel icon={<InsightsIcon color="primary" />}>{step}</StepLabel>
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
          ระบบคำนวณคะแนนผ่านขั้นต่ำที่ 80 คะแนน พร้อมแจ้งเตือนความเสี่ยงสูงทันที เพื่อให้ทีม DTAM
          ออกคำสั่งแก้ไขได้ภายในเวลาที่กำหนด
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
