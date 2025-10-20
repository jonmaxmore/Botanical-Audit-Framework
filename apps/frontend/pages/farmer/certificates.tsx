import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import {
  Agriculture,
  Dashboard as DashboardIcon,
  Assignment,
  Verified,
  Description,
  Person,
  Logout,
  Menu as MenuIcon,
  Download,
  Visibility
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FarmerCertificates() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'farmer') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const certificates = [
    {
      id: 'CERT001',
      farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
      issueDate: '2025-09-01',
      expiryDate: '2026-09-01',
      status: 'active'
    },
    {
      id: 'CERT002',
      farmName: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
      issueDate: '2025-08-15',
      expiryDate: '2026-08-15',
      status: 'active'
    }
  ];

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/farmer/dashboard' },
    { text: 'ฟาร์มของฉัน', icon: <Agriculture />, path: '/farmer/farms' },
    { text: 'คำขอรับรอง', icon: <Assignment />, path: '/farmer/applications' },
    { text: 'ใบรับรอง', icon: <Verified />, path: '/farmer/certificates' },
    { text: 'เอกสาร', icon: <Description />, path: '/farmer/documents' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/farmer/profile' }
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
            {user?.name?.[0] || 'F'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name || 'เกษตรกร'}
            </Typography>
            <Typography variant="caption">{user?.email}</Typography>
          </Box>
        </Box>
      </Box>
      <List>
        {menuItems.map(item => (
          <ListItem
            key={item.text}
            component="div"
            sx={{ cursor: 'pointer' }}
            selected={router.pathname === item.path}
            onClick={() => router.push(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            localStorage.clear();
            router.push('/login');
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user) return null;

  return (
    <>
      <Head>
        <title>ใบรับรอง - ระบบ GACP</title>
      </Head>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Agriculture sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ระบบ GACP - เกษตรกร
            </Typography>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name?.[0]}</Avatar>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: 240 }, flexShrink: 0 }}>
          {isMobile ? (
            <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}>
              {drawer}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{ '& .MuiDrawer-paper': { width: 240, top: 64, height: 'calc(100% - 64px)' } }}
            >
              {drawer}
            </Drawer>
          )}
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { md: 'calc(100% - 240px)' }, mt: 8 }}
        >
          <Container maxWidth="lg">
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
              ใบรับรอง GACP
            </Typography>
            <Grid container spacing={3}>
              {certificates.map(cert => (
                <Grid item xs={12} md={6} key={cert.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Verified sx={{ fontSize: 40, color: 'success.main' }} />
                        <Chip label="มีผลบังคับ" color="success" size="small" />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {cert.farmName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        รหัสใบรับรอง: {cert.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        วันที่ออก: {new Date(cert.issueDate).toLocaleDateString('th-TH')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        วันหมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<Visibility />}>
                          ดู
                        </Button>
                        <Button size="small" variant="contained" startIcon={<Download />}>
                          ดาวน์โหลด
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
