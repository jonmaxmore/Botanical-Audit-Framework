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
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationOnIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

export default function SurveyPage() {
  const router = useRouter();

  const regions = [
    {
      name: 'ภาคเหนือ',
      image: '/images/north.jpg',
      plants: 'มะแขว่น, กวาวเครือ, จิงจูฉ่าย',
    },
    {
      name: 'ภาคกลาง',
      image: '/images/central.jpg',
      plants: 'กระชาย, ขมิ้นชัน, ไพล',
    },
    {
      name: 'ภาคตะวันออกเฉียงเหนือ',
      image: '/images/northeast.jpg',
      plants: 'พญานาค, ย่านาง, บุก',
    },
    {
      name: 'ภาคใต้',
      image: '/images/south.jpg',
      plants: 'ลูกยอ, เถาวัลย์เปรียง, สมุนไพรทะเล',
    },
  ];

  return (
    <>
      <Head>
        <title>ระบบแบบสอบถามเกษตรกรสี่ภาค | GACP System</title>
      </Head>

      <AppBar position="static" sx={{ backgroundColor: '#795548' }}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <AssignmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            GACP System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f8f4f1', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            ระบบแบบสอบถามเกษตรกรสี่ภาค
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            align="center"
            paragraph
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          >
            เก็บรวบรวมข้อมูลเกษตรกรผู้ปลูกสมุนไพรจากทั้ง 4 ภูมิภาคของประเทศไทย
            เพื่อการพัฒนาองค์ความรู้และนโยบายสนับสนุนการเกษตรที่เหมาะสม
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ backgroundColor: '#795548' }}
              onClick={() => router.push('/services/survey/participate')}
            >
              เข้าร่วมแบบสอบถาม
            </Button>
          </Box>
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
          ข้อมูลสมุนไพรตามภูมิภาค
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}
        >
          ประเทศไทยมีความหลากหลายของพืชสมุนไพรในแต่ละภูมิภาค
          แบบสอบถามนี้จะช่วยเก็บข้อมูลเฉพาะพื้นที่เพื่อการพัฒนาอย่างยั่งยืน
        </Typography>

        <Grid container spacing={4}>
          {regions.map((region, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardMedia component="img" height="200" image={region.image} alt={region.name} />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {region.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>พืชสมุนไพรที่สำคัญ:</strong> {region.plants}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: '#795548', borderColor: '#795548' }}
                    onClick={() => router.push(`/services/survey/region/${index + 1}`)}
                  >
                    ดูข้อมูลเพิ่มเติม
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                ประโยชน์ของการเข้าร่วมแบบสอบถาม
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: '#795548' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      แผนที่พืชสมุนไพร
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    ข้อมูลจะถูกนำมาจัดทำแผนที่แสดงการกระจายตัวของพืชสมุนไพรในประเทศไทย
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#795548' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      วิเคราะห์ศักยภาพ
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    นำข้อมูลมาวิเคราะห์ศักยภาพการผลิตและโอกาสทางการตลาดของแต่ละภูมิภาค
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShareIcon sx={{ mr: 1, color: '#795548' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      แบ่งปันความรู้
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    แลกเปลี่ยนความรู้และภูมิปัญญาท้องถิ่นในการปลูกสมุนไพร
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            size="large"
            sx={{ backgroundColor: '#795548' }}
            onClick={() => router.push('/services/survey/participate')}
          >
            เข้าร่วมแบบสอบถาม
          </Button>
        </Box>
      </Container>
    </>
  );
}
