import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  Chip,
  AppBar,
  Toolbar,
  Drawer,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  CalendarToday,
  Assessment,
  Search as SearchIcon,
  Person,
  Logout,
  Menu as MenuIcon,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  FilterList,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function InspectorApplications() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'inspector') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  // Mock data
  const applications = [
    {
      id: 'APP001',
      farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
      farmerName: 'นายสมชาย ใจดี',
      farmerId: '1234567890123',
      location: 'เชียงใหม่',
      area: '15 ไร่',
      submitDate: '2025-10-15',
      scheduledDate: '2025-10-22',
      type: 'ตรวจสอบครั้งแรก',
      status: 'assigned',
      priority: 'high',
      crops: ['กัญชา', 'สมุนไพร'],
    },
    {
      id: 'APP002',
      farmName: 'ฟาร์มกัญชาทางการแพทย์',
      farmerName: 'นางสาวสมหญิง ดีมาก',
      farmerId: '9876543210987',
      location: 'เชียงราย',
      area: '10 ไร่',
      submitDate: '2025-10-10',
      scheduledDate: '2025-10-23',
      type: 'ตรวจสอบติดตาม',
      status: 'in_progress',
      priority: 'medium',
      crops: ['กัญชาทางการแพทย์'],
    },
    {
      id: 'APP003',
      farmName: 'ฟาร์มไพรออร์แกนิก',
      farmerName: 'นายประเสริฐ เก่งดี',
      farmerId: '5555555555555',
      location: 'ลำปาง',
      area: '20 ไร่',
      submitDate: '2025-10-05',
      scheduledDate: '2025-10-24',
      type: 'ตรวจสอบเพื่อต่ออายุ',
      status: 'assigned',
      priority: 'low',
      crops: ['สมุนไพร', 'ไพรออร์แกนิก'],
    },
    {
      id: 'APP004',
      farmName: 'ฟาร์มกัญชาแม่สอด',
      farmerName: 'นางวิภา ใจกว้าง',
      farmerId: '1111222233334',
      location: 'ตาก',
      area: '8 ไร่',
      submitDate: '2025-09-28',
      scheduledDate: null,
      type: 'ตรวจสอบครั้งแรก',
      status: 'pending_schedule',
      priority: 'high',
      crops: ['กัญชา'],
    },
    {
      id: 'APP005',
      farmName: 'ฟาร์มสมุนไพรนครราชสีมา',
      farmerName: 'นายวิชัย สุขใจ',
      farmerId: '4444333322221',
      location: 'นครราชสีมา',
      area: '25 ไร่',
      submitDate: '2025-09-20',
      scheduledDate: '2025-10-18',
      type: 'ตรวจสอบครั้งแรก',
      status: 'completed',
      priority: 'medium',
      crops: ['สมุนไพร', 'พืชสมุนไพร'],
    },
  ];

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/inspector/dashboard' },
    { text: 'คำขอตรวจสอบ', icon: <Assignment />, path: '/inspector/applications' },
    { text: 'ตารางนัดหมาย', icon: <CalendarToday />, path: '/inspector/schedule' },
    { text: 'รายงานการตรวจสอบ', icon: <Assessment />, path: '/inspector/reports' },
    { text: 'ค้นหาฟาร์ม', icon: <SearchIcon />, path: '/inspector/farms' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/inspector/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusChip = (status: string) => {
    const statusConfig: any = {
      pending_schedule: { label: 'รอกำหนดตารางนัดหมาย', color: 'warning' },
      assigned: { label: 'มอบหมายแล้ว', color: 'info' },
      in_progress: { label: 'กำลังตรวจสอบ', color: 'primary' },
      completed: { label: 'ตรวจสอบแล้ว', color: 'success' },
      rejected: { label: 'ไม่อนุมัติ', color: 'error' },
    };
    return (
      <Chip label={statusConfig[status]?.label} color={statusConfig[status]?.color} size="small" />
    );
  };

  const getPriorityChip = (priority: string) => {
    const config: any = {
      high: { label: 'ด่วน', color: 'error' },
      medium: { label: 'ปานกลาง', color: 'warning' },
      low: { label: 'ปกติ', color: 'info' },
    };
    return <Chip label={config[priority]?.label} color={config[priority]?.color} size="small" />;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const drawer = (
    <Box>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2, width: 48, height: 48 }}>
            {user?.name?.[0] || 'I'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name || 'ผู้ตรวจสอบ'}
            </Typography>
            <Typography variant="caption">{user?.email}</Typography>
            <Chip
              label="Inspector"
              size="small"
              sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </Box>
        </Box>
      </Box>
      <List>
        {menuItems.map(item => (
          <ListItem
            key={item.text}
            component="div"
            sx={{
              cursor: 'pointer',
              bgcolor: router.pathname === item.path ? 'primary.light' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => router.push(item.path)}
          >
            <ListItemIcon
              sx={{ color: router.pathname === item.path ? 'primary.main' : 'inherit' }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem component="div" sx={{ cursor: 'pointer' }} onClick={handleLogout}>
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
        <title>คำขอตรวจสอบ - ระบบ GACP</title>
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: 1201, bgcolor: 'white', color: 'text.primary', boxShadow: 2 }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Assessment sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
              ระบบ GACP - ผู้ตรวจสอบ
            </Typography>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name?.[0]}</Avatar>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: 260 }, flexShrink: 0 }}>
          {isMobile ? (
            <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}>
              {drawer}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 260,
                  top: 64,
                  height: 'calc(100% - 64px)',
                  borderRight: '2px solid #e0e0e0',
                },
              }}
            >
              {drawer}
            </Drawer>
          )}
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { md: 'calc(100% - 260px)' }, mt: 8 }}
        >
          <Container maxWidth="xl">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📋 คำขอตรวจสอบทั้งหมด
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              จัดการคำขอตรวจสอบฟาร์มและกำหนดตารางนัดหมาย
            </Typography>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="ค้นหาด้วยรหัส, ชื่อฟาร์ม, หรือเกษตรกร..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="สถานะ"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterList />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="pending_schedule">รอกำหนดตาราง</MenuItem>
                    <MenuItem value="assigned">มอบหมายแล้ว</MenuItem>
                    <MenuItem value="in_progress">กำลังตรวจสอบ</MenuItem>
                    <MenuItem value="completed">ตรวจสอบแล้ว</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    พบ {filteredApplications.length} รายการ
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Applications Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>รหัส</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ฟาร์ม</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>เกษตรกร</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ประเภท</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ความสำคัญ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>สถานะ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>วันนัดหมาย</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>การจัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map(app => (
                    <TableRow key={app.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {app.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {app.farmName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.location} • {app.area}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{app.farmerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.farmerId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{app.type}</Typography>
                      </TableCell>
                      <TableCell>{getPriorityChip(app.priority)}</TableCell>
                      <TableCell>{getStatusChip(app.status)}</TableCell>
                      <TableCell>
                        {app.scheduledDate ? (
                          <Typography variant="body2">
                            {new Date(app.scheduledDate).toLocaleDateString('th-TH')}
                          </Typography>
                        ) : (
                          <Chip label="ยังไม่กำหนด" size="small" color="warning" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => {
                            setSelectedApp(app);
                            setDialogOpen(true);
                          }}
                        >
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

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedApp && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  รายละเอียดคำขอตรวจสอบ
                </Typography>
                {getStatusChip(selectedApp.status)}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    รหัสคำขอ
                  </Typography>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {selectedApp.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    ความสำคัญ
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{getPriorityChip(selectedApp.priority)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    ชื่อฟาร์ม
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedApp.farmName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    ที่ตั้ง
                  </Typography>
                  <Typography variant="body1">{selectedApp.location}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    ชื่อเกษตรกร
                  </Typography>
                  <Typography variant="body1">{selectedApp.farmerName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    เลขบัตรประชาชน
                  </Typography>
                  <Typography variant="body1">{selectedApp.farmerId}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    พื้นที่ฟาร์ม
                  </Typography>
                  <Typography variant="body1">{selectedApp.area}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    ประเภทการตรวจสอบ
                  </Typography>
                  <Typography variant="body1">{selectedApp.type}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    พืชที่ปลูก
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedApp.crops.map((crop: string) => (
                      <Chip key={crop} label={crop} size="small" color="success" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    วันที่ยื่นคำขอ
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedApp.submitDate).toLocaleDateString('th-TH')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    วันนัดหมายตรวจสอบ
                  </Typography>
                  <Typography variant="body1">
                    {selectedApp.scheduledDate
                      ? new Date(selectedApp.scheduledDate).toLocaleDateString('th-TH')
                      : 'ยังไม่กำหนด'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>ปิด</Button>
              {selectedApp.status === 'assigned' && (
                <>
                  <Button variant="outlined" color="error" startIcon={<Cancel />}>
                    ปฏิเสธ
                  </Button>
                  <Button variant="contained" startIcon={<CheckCircle />}>
                    เริ่มตรวจสอบ
                  </Button>
                </>
              )}
              {selectedApp.status === 'pending_schedule' && (
                <Button variant="contained" startIcon={<Schedule />}>
                  กำหนดตารางนัดหมาย
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
