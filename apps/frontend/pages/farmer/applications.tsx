import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
  Divider
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
  Visibility
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FarmerApplications() {
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

  const applications = [
    {
      id: 'APP001',
      farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
      type: 'GACP Certification',
      status: 'pending',
      date: '2025-10-15'
    },
    {
      id: 'APP002',
      farmName: 'ฟาร์มกัญชาทางการแพทย์',
      type: 'GACP Renewal',
      status: 'in_progress',
      date: '2025-10-10'
    },
    {
      id: 'APP003',
      farmName: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
      type: 'GACP Certification',
      status: 'approved',
      date: '2025-10-05'
    },
    {
      id: 'APP004',
      farmName: 'ฟาร์มสมุนไพรลำปาง',
      type: 'GACP Certification',
      status: 'rejected',
      date: '2025-09-28'
    }
  ];

  const getStatusChip = (status: string) => {
    const config: any = {
      pending: { label: 'รอดำเนินการ', color: 'warning' },
      in_progress: { label: 'กำลังตรวจสอบ', color: 'info' },
      approved: { label: 'อนุมัติ', color: 'success' },
      rejected: { label: 'ไม่อนุมัติ', color: 'error' }
    };
    return <Chip label={config[status]?.label} color={config[status]?.color} size="small" />;
  };

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
            button
            selected={router.pathname === item.path}
            onClick={() => router.push(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem
          button
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
        <title>คำขอรับรอง - ระบบ GACP</title>
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
              คำขอรับรอง
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell>
                      <strong>รหัสคำขอ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ฟาร์ม</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ประเภท</strong>
                    </TableCell>
                    <TableCell>
                      <strong>สถานะ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>วันที่ยื่น</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ดำเนินการ</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map(app => (
                    <TableRow key={app.id} hover>
                      <TableCell>{app.id}</TableCell>
                      <TableCell>{app.farmName}</TableCell>
                      <TableCell>{app.type}</TableCell>
                      <TableCell>{getStatusChip(app.status)}</TableCell>
                      <TableCell>{new Date(app.date).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Visibility />} variant="outlined">
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>
      </Box>
    </>
  );
}
