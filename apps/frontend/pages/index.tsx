import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Login as LoginIcon,
  Agriculture as AgricultureIcon,
  VerifiedUser as VerifiedIcon,
  Assessment as AssessmentIcon,
  LocalFlorist as LocalFloristIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  ContactMail as ContactMailIcon,
  QrCode as QrCodeIcon,
  Assignment as AssignmentIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <Head>
        <title>ระบบตรวจสอบและรับรองมาตรฐาน GACP | Botanical Audit Framework</title>
        <meta
          name="description"
          content="ระบบบริหารจัดการและตรวจสอบมาตรฐานการปลูกพืชสมุนไพร GACP (Good Agricultural and Collection Practices)"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header / Navigation */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalFloristIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#2e7d32',
                  lineHeight: 1.2
                }}
              >
                ระบบตรวจสอบและรับรองมาตรฐาน GACP
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                Botanical Audit Framework System
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button color="inherit" href="#about">
                เกี่ยวกับเรา
              </Button>
              <Button color="inherit" href="#services">
                บริการ
              </Button>
              <Button color="inherit" href="#news">
                ข่าวสาร
              </Button>
              <Button color="inherit" href="#contact">
                ติดต่อเรา
              </Button>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                href="/login"
                sx={{
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#1b5e20' }
                }}
              >
                เข้าสู่ระบบ
              </Button>
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton onClick={toggleMobileMenu}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={toggleMobileMenu}>
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href="#about">
                <ListItemText primary="เกี่ยวกับเรา" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="#services">
                <ListItemText primary="บริการ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="#news">
                <ListItemText primary="ข่าวสาร" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="#contact">
                <ListItemText primary="ติดต่อเรา" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton component="a" href="/login">
                <LoginIcon sx={{ mr: 1 }} />
                <ListItemText primary="เข้าสู่ระบบ" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/leaf-pattern.svg)',
            opacity: 0.1,
            backgroundSize: 'cover'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ระบบบริหารจัดการและรับรอง
                <br />
                มาตรฐาน GACP
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  mb: 3,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  opacity: 0.95
                }}
              >
                Good Agricultural and Collection Practices
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
                ระบบการตรวจสอบและรับรองมาตรฐานการผลิตพืชสมุนไพร
                เพื่อความปลอดภัยและคุณภาพตามมาตรฐานสากล ภายใต้การกำกับดูแลของกระทรวงสาธารณสุข
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  href="/register"
                  sx={{
                    backgroundColor: '#fff',
                    color: '#2e7d32',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f1f1f1'
                    }
                  }}
                >
                  ลงทะเบียนเกษตรกร
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="#services"
                  sx={{
                    borderColor: '#fff',
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  เรียนรู้เพิ่มเติม
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 250, md: 350 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)'
                }}
              >
                <AgricultureIcon sx={{ fontSize: 150, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Stats Section - ข้อมูลจริงจากฐานข้อมูล */}
      <Box sx={{ py: 6, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {[
              {
                number: '10',
                label: 'เกษตรกรที่ลงทะเบียน',
                icon: <AgricultureIcon />
              },
              {
                number: '0',
                label: 'ฟาร์มที่ได้รับการรับรอง',
                icon: <VerifiedIcon />
              },
              {
                number: '0',
                label: 'การตรวจประเมินทั้งหมด',
                icon: <AssessmentIcon />
              },
              {
                number: '0%',
                label: 'อัตราการผ่านการประเมิน',
                icon: <TrendingUpIcon />
              }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ color: '#2e7d32', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: 8, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: '#2e7d32', mb: 2 }}
          >
            เกี่ยวกับระบบ GACP
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto', fontSize: '1.1rem' }}
          >
            ระบบบริหารจัดการและตรวจสอบมาตรฐานการปลูกพืชสมุนไพร
            เพื่อสร้างความมั่นใจในคุณภาพและความปลอดภัยของผลิตภัณฑ์สมุนไพรไทย
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    มาตรฐาน GACP คืออะไร?
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    GACP (Good Agricultural and Collection Practices)
                    เป็นมาตรฐานการปฏิบัติทางการเกษตรและการเก็บรวบรวมที่ดี
                    ครอบคลุมทุกขั้นตอนตั้งแต่การเตรียมพื้นที่ การปลูก การเก็บเกี่ยว จนถึงการจัดเก็บ
                    เพื่อให้ได้ผลผลิตที่มีคุณภาพและปลอดภัย
                  </Typography>
                  <Button variant="text" color="primary" href="/about/gacp">
                    อ่านเพิ่มเติม →
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #66bb6a 0%, #aed581 100%)'
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    กระบวนการรับรอง
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    ขั้นตอนการขอรับรองมาตรฐาน GACP ประกอบด้วยการยื่นคำขอ การตรวจประเมินโดยผู้ตรวจ
                    การประเมินผลและการออกใบรับรอง
                    ระบบของเราช่วยให้กระบวนการเป็นไปอย่างโปร่งใสและรวดเร็ว
                  </Typography>
                  <Button variant="text" color="primary" href="/about/process">
                    ดูขั้นตอน →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section - แบ่งตามบริการ */}
      <Box id="services" sx={{ py: 8, backgroundColor: '#f9f9f9' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: '#2e7d32', mb: 2 }}
          >
            บริการของเรา
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
          >
            ระบบครบวงจรสำหรับการบริหารจัดการและรับรองมาตรฐาน GACP
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                icon: <AgricultureIcon sx={{ fontSize: 50 }} />,
                title: 'สำหรับเกษตรกร',
                description: 'ลงทะเบียนฟาร์ม ยื่นคำขอรับรอง ติดตามสถานะ และดาวน์โหลดใบรับรอง',
                color: '#4caf50',
                link: '/login?role=farmer'
              },
              {
                icon: <DescriptionIcon sx={{ fontSize: 50 }} />,
                title: 'ผู้ตรวจสอบเอกสาร',
                description: 'ตรวจสอบความถูกต้องของเอกสาร อนุมัติหรือส่งกลับแก้ไข',
                color: '#2196f3',
                link: '/login?role=document_checker'
              },
              {
                icon: <AssessmentIcon sx={{ fontSize: 50 }} />,
                title: 'ผู้ตรวจประเมิน',
                description: 'ตรวจประเมินฟาร์มตามมาตรฐาน GACP บันทึกผลและสรุปรายงาน',
                color: '#ff9800',
                link: '/login?role=inspector'
              },
              {
                icon: <VerifiedIcon sx={{ fontSize: 50 }} />,
                title: 'ผู้อนุมัติ',
                description: 'พิจารณาอนุมัติการรับรอง ออกใบรับรอง GACP',
                color: '#9c27b0',
                link: '/login?role=approver'
              },
              {
                icon: <TrendingUpIcon sx={{ fontSize: 50 }} />,
                title: 'แอดมิน',
                description: 'จัดการระบบทั้งหมด วิเคราะห์ข้อมูล Power BI และจัดการสิทธิ์ผู้ใช้',
                color: '#f44336',
                link: '/login?role=admin'
              }
            ].map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                    <Box sx={{ color: service.color, mb: 2 }}>{service.icon}</Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      size="small"
                      href={service.link}
                      sx={{ color: service.color, fontWeight: 600 }}
                    >
                      เรียนรู้เพิ่มเติม →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* เพิ่มบริการเสริม */}
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, color: '#2e7d32', mt: 8, mb: 3 }}
          >
            บริการเพิ่มเติม
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
          >
            บริการครบวงจรเพื่อเพิ่มประสิทธิภาพการทำเกษตรกรรมและการบริหารฟาร์มตามมาตรฐาน
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                icon: <LocalFloristIcon sx={{ fontSize: 50 }} />,
                title: 'ระบบบริหารจัดการฟาร์ม',
                description:
                  'บันทึกข้อมูลการเพาะปลูก การดูแล การเก็บเกี่ยว และบริหารต้นทุนอย่างมีประสิทธิภาพ',
                color: '#009688',
                link: '/services/farm-management'
              },
              {
                icon: <QrCodeIcon sx={{ fontSize: 50 }} />,
                title: 'ระบบติดตามย้อนกลับ',
                description:
                  'QR Code สำหรับผลิตภัณฑ์ เพื่อติดตามย้อนกลับตั้งแต่แหล่งที่มาจนถึงผู้บริโภค',
                color: '#3f51b5',
                link: '/services/traceability'
              },
              {
                icon: <AssignmentIcon sx={{ fontSize: 50 }} />,
                title: 'ระบบแบบสอบถามเกษตรกรสี่ภาค',
                description:
                  'เก็บข้อมูลการทำเกษตรกรรมในพื้นที่ต่างๆ เพื่อวิเคราะห์และพัฒนาองค์ความรู้',
                color: '#795548',
                link: '/services/survey'
              },
              {
                icon: <CompareIcon sx={{ fontSize: 50 }} />,
                title: 'ระบบเปรียบเทียบมาตรฐาน',
                description: 'เปรียบเทียบมาตรฐาน GACP กับมาตรฐานอื่นๆ เช่น Organic, GAP และ GMP',
                color: '#607d8b',
                link: '/services/standard-comparison'
              }
            ].map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                    <Box sx={{ color: service.color, mb: 2 }}>{service.icon}</Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      size="small"
                      href={service.link}
                      sx={{ color: service.color, fontWeight: 600 }}
                    >
                      เรียนรู้เพิ่มเติม →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* News Section */}
      <Box id="news" sx={{ py: 8, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
              ข่าวสารและกิจกรรม
            </Typography>
            <Button href="/news" sx={{ color: '#2e7d32' }}>
              ดูทั้งหมด →
            </Button>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                date: '15 ต.ค. 2568',
                category: 'ประกาศ',
                title: 'เปิดรับสมัครเกษตรกรเข้าร่วมโครงการรับรอง GACP รุ่นที่ 12',
                icon: 'announcement',
                tag: 'ใหม่'
              },
              {
                date: '10 ต.ค. 2568',
                category: 'อบรม',
                title: 'อบรมเชิงปฏิบัติการ "การจัดการฟาร์มสมุนไพรตามมาตรฐาน GACP"',
                icon: 'training',
                tag: 'กำลังดำเนินการ'
              },
              {
                date: '5 ต.ค. 2568',
                category: 'ข่าวสาร',
                title: 'กระทรวงสาธารณสุขมอบรางวัลเกษตรกรดีเด่น ด้านการผลิตสมุนไพร',
                icon: 'news',
                tag: null
              }
            ].map((news, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          news.icon === 'announcement'
                            ? 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
                            : news.icon === 'training'
                            ? 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'
                            : 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                      }}
                    >
                      {news.icon === 'announcement' && <AssignmentIcon sx={{ fontSize: 60, color: 'white' }} />}
                      {news.icon === 'training' && <AssessmentIcon sx={{ fontSize: 60, color: 'white' }} />}
                      {news.icon === 'news' && <DescriptionIcon sx={{ fontSize: 60, color: 'white' }} />}
                    </Box>
                    {news.tag && (
                      <Chip
                        label={news.tag}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: '#f44336',
                          color: '#fff',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={news.category} size="small" color="primary" />
                      <Typography variant="caption" color="textSecondary">
                        {news.date}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, minHeight: 60 }}>
                      {news.title}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      อ่านต่อ →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box
        id="contact"
        sx={{
          py: 8,
          backgroundColor: '#2e7d32',
          color: '#fff'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                ติดต่อเรา
              </Typography>
              <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
                กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
                <br />
                กระทรวงสาธารณสุข
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ContactMailIcon />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ที่อยู่:
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      88/22 ถนนติวานนท์ 14 ตลาดขวัญ เมืองนนทบุรี จ.นนทบุรี 11000
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ContactMailIcon />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      โทรศัพท์:
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      02-149-7000
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ContactMailIcon />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      อีเมล:
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      gacp@dtam.moph.go.th
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                ลิงก์ที่เกี่ยวข้อง
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Link
                    href="https://www.dtam.moph.go.th/"
                    target="_blank"
                    style={{ color: '#fff', textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → กรมการแพทย์แผนไทยฯ
                    </Typography>
                  </Link>
                  <Link
                    href="https://www.moph.go.th/"
                    target="_blank"
                    style={{ color: '#fff', textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → กระทรวงสาธารณสุข
                    </Typography>
                  </Link>
                  <Link
                    href="https://cannabis-gacp-thaicam.dtam.moph.go.th/"
                    target="_blank"
                    style={{ color: '#fff', textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → ระบบ GACP กัญชา
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link
                    href="https://edbr.dbd.go.th/"
                    target="_blank"
                    style={{ color: '#fff', textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → กรมพัฒนาธุรกิจการค้า
                    </Typography>
                  </Link>
                  <Link href="/help" style={{ color: '#fff', textDecoration: 'none' }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → คู่มือการใช้งาน
                    </Typography>
                  </Link>
                  <Link href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, '&:hover': { textDecoration: 'underline' } }}
                    >
                      → คำถามที่พบบ่อย
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          backgroundColor: '#1b5e20',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2025 Botanical Audit Framework System - กรมการแพทย์แพทย์แผนไทยและการแพทย์ทางเลือก
            สงวนลิขสิทธิ์
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
            Version 2.0.0 | Powered by Next.js & Material-UI
          </Typography>
        </Container>
      </Box>
    </>
  );
}
