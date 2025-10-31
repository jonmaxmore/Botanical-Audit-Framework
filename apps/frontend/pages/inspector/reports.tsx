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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Rating
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
  Download,
  Add,
  CheckCircle
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function InspectorReports() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
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

  // Mock reports data
  const reports = [
    {
      id: 'REP001',
      applicationId: 'APP005',
      farmName: 'ฟาร์มสมุนไพรนครราชสีมา',
      farmerName: 'นายวิชัย สุขใจ',
      inspectionDate: '2025-10-18',
      submitDate: '2025-10-19',
      status: 'approved',
      score: 4.5,
      result: 'ผ่านการตรวจสอบ',
      recommendation: 'แนะนำให้รับรอง GACP'
    },
    {
      id: 'REP002',
      applicationId: 'APP006',
      farmName: 'ฟาร์มกัญชาพิษณุโลก',
      farmerName: 'นางสาวสุดา เก่งมาก',
      inspectionDate: '2025-10-15',
      submitDate: '2025-10-16',
      status: 'approved',
      score: 4.0,
      result: 'ผ่านการตรวจสอบ',
      recommendation: 'แนะนำให้รับรอง GACP'
    },
    {
      id: 'REP003',
      applicationId: 'APP007',
      farmName: 'ฟาร์มไพรสมุนไพรลพบุรี',
      farmerName: 'นายเกษม รวยดี',
      inspectionDate: '2025-10-10',
      submitDate: '2025-10-11',
      status: 'rejected',
      score: 2.5,
      result: 'ไม่ผ่านการตรวจสอบ',
      recommendation: 'จำเป็นต้องปรับปรุง: ระบบการเก็บบันทึก, การจัดการน้ำ'
    },
    {
      id: 'REP004',
      applicationId: 'APP002',
      farmName: 'ฟาร์มกัญชาทางการแพทย์',
      farmerName: 'นางสาวสมหญิง ดีมาก',
      inspectionDate: '2025-10-23',
      submitDate: null,
      status: 'draft',
      score: null,
      result: 'กำลังจัดทำรายงาน',
      recommendation: '-'
    }
  ];

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/inspector/dashboard' },
    { text: 'คำขอตรวจสอบ', icon: <Assignment />, path: '/inspector/applications' },
    { text: 'ตารางนัดหมาย', icon: <CalendarToday />, path: '/inspector/schedule' },
    { text: 'รายงานการตรวจสอบ', icon: <Assessment />, path: '/inspector/reports' },
    { text: 'ค้นหาฟาร์ม', icon: <SearchIcon />, path: '/inspector/farms' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/inspector/profile' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusChip = (status: string) => {
    const statusConfig: any = {
      draft: { label: 'ร่าง', color: 'default' },
      submitted: { label: 'ส่งแล้ว', color: 'info' },
      approved: { label: 'อนุมัติแล้ว', color: 'success' },
      rejected: { label: 'ไม่อนุมัติ', color: 'error' }
    };
    return (
      <Chip label={statusConfig[status]?.label} color={statusConfig[status]?.color} size="small" />
    );
  };

  const getResultChip = (result: string) => {
    if (result.includes('ผ่าน')) {
      return <Chip label={result} color="success" size="small" />;
    }
    if (result.includes('ไม่ผ่าน')) {
      return <Chip label={result} color="error" size="small" />;
    }
    return <Chip label={result} color="default" size="small" />;
  };

  const filteredReports = reports.filter(
    report =>
      report.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.applicationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              '&:hover': { bgcolor: 'action.hover' }
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
        <title>รายงานการตรวจสอบ - ระบบ GACP</title>
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
                  borderRight: '2px solid #e0e0e0'
                }
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
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  📊 รายงานการตรวจสอบทั้งหมด
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  จัดการและดูรายงานการตรวจสอบฟาร์มทั้งหมด
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<Add />} size="large">
                สร้างรายงานใหม่
              </Button>
            </Box>

            {/* Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="ค้นหาด้วยรหัสรายงาน, รหัสคำขอ, ชื่อฟาร์ม, หรือเกษตรกร..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Paper>

            {/* Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>รหัสรายงาน</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>รหัสคำขอ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ฟาร์ม</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>วันที่ตรวจสอบ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>คะแนน</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ผลการตรวจ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>สถานะ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>การจัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map(report => (
                    <TableRow key={report.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {report.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{report.applicationId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {report.farmName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.farmerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(report.inspectionDate).toLocaleDateString('th-TH')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {report.score ? (
                          <Box>
                            <Rating value={report.score} precision={0.5} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {report.score}/5.0
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getResultChip(report.result)}</TableCell>
                      <TableCell>{getStatusChip(report.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => {
                              setSelectedReport(report);
                              setDialogOpen(true);
                            }}
                          >
                            ดู
                          </Button>
                          {report.status !== 'draft' && (
                            <Button size="small" variant="outlined" startIcon={<Download />}>
                              ดาวน์โหลด
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>
      </Box>

      {/* Report Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  รายละเอียดรายงาน {selectedReport.id}
                </Typography>
                {getStatusChip(selectedReport.status)}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      ข้อมูลทั่วไป
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          รหัสรายงาน
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedReport.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          รหัสคำขอ
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedReport.applicationId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          ชื่อฟาร์ม
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedReport.farmName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          เกษตรกร
                        </Typography>
                        <Typography variant="body2">{selectedReport.farmerName}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      ผลการตรวจสอบ
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          วันที่ตรวจสอบ
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedReport.inspectionDate).toLocaleDateString('th-TH')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          วันที่ส่งรายงาน
                        </Typography>
                        <Typography variant="body2">
                          {selectedReport.submitDate
                            ? new Date(selectedReport.submitDate).toLocaleDateString('th-TH')
                            : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          คะแนนการประเมิน
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          {selectedReport.score ? (
                            <>
                              <Rating value={selectedReport.score} precision={0.5} readOnly />
                              <Typography variant="body2" fontWeight={600}>
                                {selectedReport.score}/5.0
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          ผลการตรวจสอบ
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>{getResultChip(selectedReport.result)}</Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          คำแนะนำ
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {selectedReport.recommendation}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>ปิด</Button>
              {selectedReport.status === 'draft' && (
                <Button variant="contained" startIcon={<CheckCircle />}>
                  ส่งรายงาน
                </Button>
              )}
              {selectedReport.status !== 'draft' && (
                <Button variant="contained" startIcon={<Download />}>
                  ดาวน์โหลด PDF
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
