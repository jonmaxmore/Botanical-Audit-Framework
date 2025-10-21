import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Agriculture,
  Add,
  Edit,
  Delete,
  LocationOn,
  Landscape,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment,
  Verified,
  Description,
  Person,
  Logout,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FarmerFarms() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const farms = [
    {
      id: 1,
      name: 'ฟาร์มสมุนไพรเชียงใหม่',
      location: 'เชียงใหม่',
      size: '15 ไร่',
      crops: 'กัญชา, ขมิ้นชัน',
      status: 'active',
      certified: true,
    },
    {
      id: 2,
      name: 'ฟาร์มกัญชาทางการแพทย์',
      location: 'เชียงราย',
      size: '10 ไร่',
      crops: 'กัญชาทางการแพทย์',
      status: 'active',
      certified: false,
    },
    {
      id: 3,
      name: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
      location: 'ลำปาง',
      size: '20 ไร่',
      crops: 'ฟ้าทะลายโจร, ว่านหางจระเข้',
      status: 'active',
      certified: true,
    },
  ];

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/farmer/dashboard' },
    { text: 'ฟาร์มของฉัน', icon: <Agriculture />, path: '/farmer/farms' },
    { text: 'คำขอรับรอง', icon: <Assignment />, path: '/farmer/applications' },
    { text: 'ใบรับรอง', icon: <Verified />, path: '/farmer/certificates' },
    { text: 'เอกสาร', icon: <Description />, path: '/farmer/documents' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/farmer/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

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
            button
            selected={router.pathname === item.path}
            onClick={() => router.push(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={handleLogout}>
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
        <title>ฟาร์มของฉัน - ระบบ GACP</title>
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
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
            >
              <Typography variant="h4" fontWeight={700}>
                ฟาร์มของฉัน
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                เพิ่มฟาร์มใหม่
              </Button>
            </Box>

            <Grid container spacing={3}>
              {farms.map(farm => (
                <Grid item xs={12} md={6} lg={4} key={farm.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Agriculture sx={{ fontSize: 40, color: 'primary.main' }} />
                        {farm.certified && (
                          <Chip
                            label="รับรองแล้ว"
                            color="success"
                            size="small"
                            icon={<Verified />}
                          />
                        )}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {farm.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {farm.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Landscape fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          ขนาด: {farm.size}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>พืชที่ปลูก:</strong> {farm.crops}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button size="small" startIcon={<Edit />}>
                        แก้ไข
                      </Button>
                      <Button size="small" color="error" startIcon={<Delete />}>
                        ลบ
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มฟาร์มใหม่</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ชื่อฟาร์ม" margin="normal" />
          <TextField fullWidth label="สถานที่" margin="normal" />
          <TextField fullWidth label="ขนาด (ไร่)" type="number" margin="normal" />
          <TextField fullWidth label="พืชที่ปลูก" margin="normal" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
