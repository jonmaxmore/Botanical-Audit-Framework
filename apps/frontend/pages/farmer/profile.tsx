import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
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
  Save,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FarmerProfile() {
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

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/farmer/dashboard' },
    { text: 'ฟาร์มของฉัน', icon: <Agriculture />, path: '/farmer/farms' },
    { text: 'คำขอรับรอง', icon: <Assignment />, path: '/farmer/applications' },
    { text: 'ใบรับรอง', icon: <Verified />, path: '/farmer/certificates' },
    { text: 'เอกสาร', icon: <Description />, path: '/farmer/documents' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/farmer/profile' },
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
        <title>โปรไฟล์ - ระบบ GACP</title>
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
          <Container maxWidth="md">
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
              โปรไฟล์
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="ชื่อ" defaultValue="เกษตรกรทดสอบ" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="นามสกุล" defaultValue="ระบบ" margin="normal" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="อีเมล"
                    value={user?.email || ''}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="เบอร์โทรศัพท์"
                    defaultValue="081-234-5678"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="เลขบัตรประชาชน"
                    defaultValue="1-2345-67890-12-3"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ที่อยู่"
                    defaultValue="123 หมู่ 4 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่"
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<Save />} size="large">
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>
      </Box>
    </>
  );
}
