import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
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
  CompareArrows as CompareIcon,
  LockOutlined as LockOutlinedIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Route as RouteIcon,
  Poll as PollIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  NotificationsActive as NotificationsActiveIcon,
  BarChart as BarChartIcon,
  MenuBook as MenuBookIcon,
  FactCheck as FactCheckIcon
} from '@mui/icons-material';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mainServices = [
    {
      id: 'auth-sso',
      title: 'ระบบสมาชิกและการยืนยันตัวตน (SSO)',
      summary: 'Single Sign-On, JWT, MFA-ready และ RBAC สำหรับทุกระบบในแพลตฟอร์ม',
      highlights: [
        'พร้อมใช้จริงในทุกพอร์ทัล',
        'จัดการสิทธิ์ตามบทบาทอัตโนมัติ',
        'รองรับ Multi-factor Authentication'
      ],
      icon: LockOutlinedIcon,
      color: '#2e7d32',
      status: 'พร้อมใช้งานจริง',
      link: '/services/authentication'
    },
    {
      id: 'application',
      title: 'ระบบยื่นคำขอรับรองกัญชา GACP',
      summary: 'กระบวนการ 7 ขั้นตอนสำหรับยื่นคำขอ ตรวจสอบเอกสาร และติดตามสถานะการรับรองกัญชา',
      highlights: [
        'โฟกัสเฉพาะกัญชาเป็นหลัก',
        'ติดตามสถานะได้แบบเรียลไทม์',
        'เชื่อมต่อการชำระเงินและการแจ้งเตือน'
      ],
      icon: AssignmentTurnedInIcon,
      color: '#1b5e20',
      status: 'พร้อมใช้งานจริง',
      link: '/services/application'
    },
    {
      id: 'farm-management',
      title: 'ระบบบริหารจัดการฟาร์ม',
      summary: 'ลงทะเบียนฟาร์ม จัดการสายพันธุ์กัญชา และควบคุมข้อมูลการเพาะปลูกตามมาตรฐาน',
      highlights: [
        'รองรับการควบคุมจากส่วนกลาง',
        'บันทึกข้อมูลรอบการเพาะปลูก',
        'ตรวจสอบฟาร์มแบบดิจิทัล'
      ],
      icon: AgricultureIcon,
      color: '#43a047',
      status: 'พร้อมใช้งานจริง',
      link: '/services/farm-management'
    },
    {
      id: 'track-trace',
      title: 'ระบบติดตามย้อนกลับ (Track & Trace)',
      summary: 'ติดตามผลิตภัณฑ์กัญชาตั้งแต่เมล็ดจนถึงการจำหน่าย พร้อม QR Code สำหรับตรวจสอบ',
      highlights: ['Seed-to-sale ครบถ้วน', 'สร้าง QR Code อัตโนมัติ', 'รายงานย้อนกลับเพื่อตรวจสอบ'],
      icon: RouteIcon,
      color: '#00796b',
      status: 'พร้อมใช้งานจริง',
      link: '/services/track-trace'
    },
    {
      id: 'survey',
      title: 'ระบบสำรวจและแบบสอบถาม',
      summary: 'สร้างแบบสอบถาม 4 ภูมิภาค วิเคราะห์ข้อมูลเกษตรกร และส่งออกผลลัพธ์ได้ทันที',
      highlights: ['Standalone 100%', 'มีเทมเพลตพร้อมใช้', 'รายงานผลแบบเรียลไทม์'],
      icon: PollIcon,
      color: '#3949ab',
      status: 'พร้อมใช้งานจริง',
      link: '/services/survey'
    },
    {
      id: 'standards',
      title: 'ระบบเปรียบเทียบมาตรฐาน',
      summary: 'เปรียบเทียบ GACP กับมาตรฐานสากล 8 รูปแบบ เพื่อวางแผนการรับรองและวิเคราะห์ช่องว่าง',
      highlights: ['Standalone 100%', 'วิเคราะห์ Gap อัตโนมัติ', 'สร้าง Roadmap การปรับปรุง'],
      icon: CompareIcon,
      color: '#5e35b1',
      status: 'พร้อมใช้งานจริง',
      link: '/services/standards-comparison'
    }
  ];

  const supportServices = [
    {
      id: 'certificate',
      title: 'ระบบออกใบรับรอง',
      summary: 'ออกและตรวจสอบใบรับรอง GACP พร้อมสแกน QR Code สำหรับประชาชน',
      icon: WorkspacePremiumIcon,
      color: '#00897b',
      link: '/services/certificate'
    },
    {
      id: 'field-inspection',
      title: 'ระบบตรวจประเมินภาคสนาม',
      summary: 'วางแผนและประเมิน 25 หัวข้อ CCP พร้อมติดตามคำสั่งแก้ไขแบบเรียลไทม์',
      icon: FactCheckIcon,
      color: '#0288d1',
      link: '/services/field-inspection'
    },
    {
      id: 'notification',
      title: 'ระบบแจ้งเตือน',
      summary: 'อีเมล SMS และ In-app Notification เชื่อมต่อทุกโมดูล',
      icon: NotificationsActiveIcon,
      color: '#e65100',
      link: '/services/notification'
    },
    {
      id: 'reporting',
      title: 'ระบบรายงานและวิเคราะห์',
      summary: 'แดชบอร์ดและ KPI เชิงลึกสำหรับผู้บริหาร เน้นข้อมูลกัญชาเป็นหลัก',
      icon: BarChartIcon,
      color: '#1e88e5',
      link: '/services/reporting'
    },
    {
      id: 'sop',
      title: 'ระบบ SOP Wizard',
      summary: 'สร้างและบริหารมาตรฐานการปฏิบัติงาน (SOP) สำหรับฟาร์มกัญชา',
      icon: MenuBookIcon,
      color: '#6d4c41',
      link: '/services/sop'
    }
  ];

  const personaSolutions = [
    {
      icon: AgricultureIcon,
      title: 'เกษตรกรกัญชา',
      description: 'ลงทะเบียน ยื่นคำขอ รับคำแนะนำการเพาะปลูก และติดตามสถานะรับรอง',
      color: '#4caf50',
      link: '/login?role=farmer'
    },
    {
      icon: DescriptionIcon,
      title: 'ผู้ตรวจสอบเอกสาร',
      description: 'ตรวจสอบความครบถ้วนของเอกสารกัญชาและอนุมัติได้ในคลิกเดียว',
      color: '#2196f3',
      link: '/login?role=document_checker'
    },
    {
      icon: AssessmentIcon,
      title: 'ผู้ตรวจประเมินภาคสนาม',
      description: 'วางแผนลงพื้นที่และบันทึกผลตรวจมาตรฐาน GACP ผ่านแท็บเล็ต',
      color: '#ff9800',
      link: '/login?role=inspector'
    },
    {
      icon: VerifiedIcon,
      title: 'ผู้อนุมัติ',
      description: 'พิจารณาผลการตรวจและออกใบรับรองดิจิทัลได้ทันที',
      color: '#9c27b0',
      link: '/login?role=approver'
    },
    {
      icon: TrendingUpIcon,
      title: 'ผู้ดูแลระบบ / ผู้บริหาร',
      description: 'ควบคุมทุกโมดูล จัดการผู้ใช้ และวิเคราะห์ข้อมูลเชิงนโยบาย',
      color: '#f44336',
      link: '/login?role=admin'
    }
  ];

  const herbalPortfolio = [
    {
      id: 'cannabis',
      name: 'กัญชา (Cannabis)',
      scientificName: 'Cannabis sativa L.',
      description: 'พืชหลักของแพลตฟอร์ม เน้นการเพาะปลูกเชิงการแพทย์ตามมาตรฐานสากล',
      tag: 'Primary Crop'
    },
    {
      id: 'turmeric',
      name: 'ขมิ้นชัน (Turmeric)',
      scientificName: 'Curcuma longa',
      description: 'สมุนไพรเศรษฐกิจสำคัญของไทย ใช้ในการแพทย์แผนไทยและอุตสาหกรรมอาหาร',
      tag: 'Medicinal Herb'
    },
    {
      id: 'ginger',
      name: 'ขิง (Ginger)',
      scientificName: 'Zingiber officinale',
      description: 'สมุนไพรฤทธิ์ร้อน ช่วยกระตุ้นระบบไหลเวียนและลดอาการอักเสบ',
      tag: 'Medicinal Herb'
    },
    {
      id: 'black-galingale',
      name: 'กระชายดำ (Black Galingale)',
      scientificName: 'Kaempferia parviflora',
      description: 'สมุนไพรเสริมสมรรถภาพ มีสารต้านอนุมูลอิสระสูง',
      tag: 'Medicinal Herb'
    },
    {
      id: 'plai',
      name: 'ไพล (Plai)',
      scientificName: 'Zingiber montanum',
      description: 'ใช้ในงานแพทย์แผนไทยสำหรับลดอาการอักเสบและปวดเมื่อย',
      tag: 'Medicinal Herb'
    },
    {
      id: 'kratom',
      name: 'กระท่อม (Kratom)',
      scientificName: 'Mitragyna speciosa',
      description: 'สมุนไพรพื้นบ้านที่อยู่ในการกำกับดูแล เน้นการใช้ประโยชน์อย่างถูกกฎหมาย',
      tag: 'Regulated Herb'
    }
  ];

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
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}
              >
                <Image
                  src="/images/hero-farming.jpg"
                  alt="GACP Certified Farming"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
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
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/gacp-standard.jpg"
                  alt="GACP Standard"
                />
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
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/certification-process.jpg"
                  alt="Certification Process"
                />
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

      {/* Services Section - แสดงบริการทั้งหมด */}
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
            แพลตฟอร์มดิจิทัลแบบครบวงจรสำหรับการบริหารจัดการและรับรองมาตรฐาน GACP
            โดยให้ความสำคัญกับกัญชาเป็นลำดับแรก
          </Typography>

          <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: '#2e7d32', mb: 4 }}>
            บริการหลัก (Core Services)
          </Typography>
          <Grid container spacing={3}>
            {mainServices.map(service => {
              const IconComponent = service.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
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
                    <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                      <Box sx={{ textAlign: 'center', color: service.color, mb: 2 }}>
                        <IconComponent sx={{ fontSize: 50 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600, textAlign: 'center' }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2, textAlign: 'center' }}
                      >
                        {service.summary}
                      </Typography>
                      <Stack spacing={1} sx={{ mb: 3 }}>
                        {service.highlights.map(item => (
                          <Typography variant="body2" color="textSecondary" key={item}>
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                      <Chip
                        label={service.status}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button
                        size="small"
                        href={service.link}
                        sx={{ color: service.color, fontWeight: 600 }}
                      >
                        ดูรายละเอียด →
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, color: '#2e7d32', mt: 8, mb: 3 }}
          >
            บริการเสริม (Supporting Modules)
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
          >
            โมดูลสนับสนุนที่เชื่อมต่อกับบริการหลัก เพื่อให้การพัฒนาฟาร์มกัญชาเป็นไปอย่างครบวงจร
          </Typography>

          <Grid container spacing={3}>
            {supportServices.map(service => {
              const IconComponent = service.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={service.id}>
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
                      <Box sx={{ color: service.color, mb: 2 }}>
                        <IconComponent sx={{ fontSize: 48 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {service.summary}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button
                        size="small"
                        href={service.link}
                        sx={{ color: service.color, fontWeight: 600 }}
                      >
                        ดูรายละเอียด →
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, color: '#2e7d32', mt: 8, mb: 3 }}
          >
            โซลูชันตามกลุ่มผู้ใช้งาน
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}
          >
            ออกแบบประสบการณ์ให้เหมาะสมกับบทบาทของผู้ใช้งาน
            โดยยังคงยึดหลักกัญชาเป็นศูนย์กลางของข้อมูล
          </Typography>

          <Grid container spacing={3}>
            {personaSolutions.map(solution => {
              const IconComponent = solution.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={solution.title}>
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
                      <Box sx={{ color: solution.color, mb: 2 }}>
                        <IconComponent sx={{ fontSize: 50 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {solution.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {solution.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button
                        size="small"
                        href={solution.link}
                        sx={{ color: solution.color, fontWeight: 600 }}
                      >
                        เข้าสู่ระบบ →
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Herbal Portfolio Section */}
      <Box sx={{ py: 8, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: '#2e7d32', mb: 2 }}
          >
            พืชสมุนไพรหลัก 6 ชนิดในแพลตฟอร์ม
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 6, maxWidth: 820, mx: 'auto' }}
          >
            กัญชาเป็นตัวเลือกแรกและเป็นศูนย์กลางของทุกโมดูล
            พร้อมการสนับสนุนสมุนไพรไทยที่มีศักยภาพอีก 5 ชนิดเพื่อเสริมเศรษฐกิจชุมชน
          </Typography>

          <Grid container spacing={3}>
            {herbalPortfolio.map(herb => (
              <Grid item xs={12} sm={6} md={4} key={herb.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: herb.id === 'cannabis' ? '4px solid #2e7d32' : '4px solid #c8e6c9',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                        {herb.name}
                      </Typography>
                      <Chip
                        label={herb.tag}
                        color={herb.id === 'cannabis' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontStyle: 'italic', mb: 2 }}
                    >
                      {herb.scientificName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {herb.description}
                    </Typography>
                  </CardContent>
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
                image: '/images/news-1.jpg',
                tag: 'ใหม่'
              },
              {
                date: '10 ต.ค. 2568',
                category: 'อบรม',
                title: 'อบรมเชิงปฏิบัติการ "การจัดการฟาร์มสมุนไพรตามมาตรฐาน GACP"',
                image: '/images/news-2.jpg',
                tag: 'กำลังดำเนินการ'
              },
              {
                date: '5 ต.ค. 2568',
                category: 'ข่าวสาร',
                title: 'กระทรวงสาธารณสุขมอบรางวัลเกษตรกรดีเด่น ด้านการผลิตสมุนไพร',
                image: '/images/news-3.jpg',
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
                    <CardMedia component="img" height="180" image={news.image} alt={news.title} />
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
