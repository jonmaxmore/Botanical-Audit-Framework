import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
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
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  CalendarToday,
  Assessment,
  Search,
  Person,
  Logout,
  Menu as MenuIcon,
  NavigateBefore,
  NavigateNext,
  LocationOn,
  AccessTime,
  Event
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function InspectorSchedule() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Mock schedule data
  const scheduleData: any = {
    '2025-10-22': [
      {
        id: 1,
        time: '09:00',
        farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
        farmerName: 'นายสมชาย ใจดี',
        location: 'เชียงใหม่',
        type: 'ตรวจสอบครั้งแรก',
        status: 'scheduled'
      },
      {
        id: 2,
        time: '14:00',
        farmName: 'ฟาร์มกัญชาออร์แกนิก',
        farmerName: 'นางสาวจิตรา สวยงาม',
        location: 'เชียงใหม่',
        type: 'ตรวจสอบติดตาม',
        status: 'scheduled'
      }
    ],
    '2025-10-23': [
      {
        id: 3,
        time: '10:30',
        farmName: 'ฟาร์มกัญชาทางการแพทย์',
        farmerName: 'นางสาวสมหญิง ดีมาก',
        location: 'เชียงราย',
        type: 'ตรวจสอบติดตาม',
        status: 'scheduled'
      }
    ],
    '2025-10-24': [
      {
        id: 4,
        time: '14:00',
        farmName: 'ฟาร์มไพรออร์แกนิก',
        farmerName: 'นายประเสริฐ เก่งดี',
        location: 'ลำปาง',
        type: 'ตรวจสอบเพื่อต่ออายุ',
        status: 'scheduled'
      }
    ],
    '2025-10-25': [
      {
        id: 5,
        time: '09:30',
        farmName: 'ฟาร์มสมุนไพรนครสวรรค์',
        farmerName: 'นายวิทยา เรียนดี',
        location: 'นครสวรรค์',
        type: 'ตรวจสอบครั้งแรก',
        status: 'scheduled'
      },
      {
        id: 6,
        time: '13:00',
        farmName: 'ฟาร์มกัญชาอุตรดิตถ์',
        farmerName: 'นางสาววิภา ใจดี',
        location: 'อุตรดิตถ์',
        type: 'ตรวจสอบครั้งแรก',
        status: 'scheduled'
      }
    ],
    '2025-10-28': [
      {
        id: 7,
        time: '10:00',
        farmName: 'ฟาร์มพืชสมุนไพรพิษณุโลก',
        farmerName: 'นายสุรชัย เจริญ',
        location: 'พิษณุโลก',
        type: 'ตรวจสอบเพื่อต่ออายุ',
        status: 'scheduled'
      }
    ]
  };

  const menuItems = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/inspector/dashboard' },
    { text: 'คำขอตรวจสอบ', icon: <Assignment />, path: '/inspector/applications' },
    { text: 'ตารางนัดหมาย', icon: <CalendarToday />, path: '/inspector/schedule' },
    { text: 'รายงานการตรวจสอบ', icon: <Assessment />, path: '/inspector/reports' },
    { text: 'ค้นหาฟาร์ม', icon: <Search />, path: '/inspector/farms' },
    { text: 'โปรไฟล์', icon: <Person />, path: '/inspector/profile' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const hasSchedule = (date: Date | null) => {
    if (!date) return false;
    const key = formatDateKey(date);
    return scheduleData[key] && scheduleData[key].length > 0;
  };

  const getScheduleCount = (date: Date | null) => {
    if (!date) return 0;
    const key = formatDateKey(date);
    return scheduleData[key]?.length || 0;
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return formatDateKey(date1) === formatDateKey(date2);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectedSchedules = scheduleData[formatDateKey(selectedDate)] || [];

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
        <title>ตารางนัดหมาย - ระบบ GACP</title>
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
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📅 ตารางนัดหมายการตรวจสอบ
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              จัดการและดูตารางนัดหมายการตรวจสอบฟาร์ม
            </Typography>

            <Grid container spacing={3}>
              {/* Calendar */}
              <Grid item xs={12} lg={7}>
                <Paper sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <IconButton onClick={() => navigateMonth('prev')}>
                      <NavigateBefore />
                    </IconButton>
                    <Typography variant="h6" fontWeight={600}>
                      {currentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
                    </Typography>
                    <IconButton onClick={() => navigateMonth('next')}>
                      <NavigateNext />
                    </IconButton>
                  </Box>

                  {/* Day headers */}
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(day => (
                      <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {day}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Calendar days */}
                  <Grid container spacing={1}>
                    {getDaysInMonth(currentDate).map((date, index) => {
                      const count = getScheduleCount(date);
                      const hasItems = hasSchedule(date);
                      const isSelected = isSameDay(date, selectedDate);
                      const isTodayDate = isToday(date);

                      return (
                        <Grid item xs key={index}>
                          <Box
                            onClick={() => date && setSelectedDate(date)}
                            sx={{
                              aspectRatio: '1',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: date ? 'pointer' : 'default',
                              bgcolor: isSelected
                                ? 'primary.main'
                                : isTodayDate
                                  ? 'primary.light'
                                  : date
                                    ? 'white'
                                    : 'transparent',
                              color: isSelected ? 'white' : date ? 'text.primary' : 'transparent',
                              border: isTodayDate && !isSelected ? '2px solid' : '1px solid',
                              borderColor: isTodayDate && !isSelected ? 'primary.main' : '#e0e0e0',
                              borderRadius: 1,
                              '&:hover': date
                                ? {
                                  bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                                }
                                : {},
                              position: 'relative'
                            }}
                          >
                            {date && (
                              <>
                                <Typography
                                  variant="body2"
                                  fontWeight={isSelected || isTodayDate ? 600 : 400}
                                >
                                  {date.getDate()}
                                </Typography>
                                {hasItems && (
                                  <Chip
                                    label={count}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: '0.65rem',
                                      mt: 0.5,
                                      bgcolor: isSelected ? 'rgba(255,255,255,0.3)' : 'error.main',
                                      color: 'white'
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>

              {/* Schedule Details */}
              <Grid item xs={12} lg={5}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Event color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      นัดหมายวันที่{' '}
                      {selectedDate.toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </Typography>
                  </Box>

                  {selectedSchedules.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">ไม่มีนัดหมายในวันนี้</Typography>
                    </Box>
                  ) : (
                    <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {selectedSchedules.map((schedule: any) => (
                        <Card key={schedule.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                              <Box
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  p: 1.5,
                                  borderRadius: 2,
                                  minWidth: 60,
                                  textAlign: 'center'
                                }}
                              >
                                <AccessTime sx={{ fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                  {schedule.time}
                                </Typography>
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {schedule.farmName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  เกษตรกร: {schedule.farmerName}
                                </Typography>
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                >
                                  <LocationOn fontSize="small" color="action" />
                                  <Typography variant="caption">{schedule.location}</Typography>
                                </Box>
                                <Chip label={schedule.type} size="small" color="info" />
                              </Box>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="small" variant="contained" fullWidth>
                                เริ่มตรวจสอบ
                              </Button>
                              <Button size="small" variant="outlined" fullWidth>
                                ดูรายละเอียด
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
