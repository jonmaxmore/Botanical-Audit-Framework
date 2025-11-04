import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  PlayArrow as PlayArrowIcon,
  Videocam as VideocamIcon,
  DriveEta as DriveEtaIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axios from 'axios';

// Types
interface InspectorStats {
  pending: number;
  inProgress: number;
  completed: number;
  avgScore: number;
}

interface DTAMApplication {
  id: string;
  applicationNumber: string;
  lotId: string;
  farmer: {
    name: string;
    phone: string;
  };
  farm: {
    name: string;
    province: string;
    area: number;
  };
  status: string;
  inspectionType: string;
  inspectionScheduledDate: string | null;
  inspectionScore: number | null;
  aiQc: {
    score: number;
    grade: string;
  } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function InspectorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [stats, setStats] = useState<InspectorStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    avgScore: 0
  });
  const [applications, setApplications] = useState<DTAMApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DTAMApplication | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE}/dtam/inspector/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      let status = '';
      if (tabValue === 0) status = 'REVIEW_PASSED,INSPECTION_SCHEDULED';
      else if (tabValue === 1) status = 'INSPECTION_IN_PROGRESS';
      else if (tabValue === 2) status = 'INSPECTION_COMPLETED';
      
      const response = await axios.get(`${API_BASE}/dtam/inspector/applications`, {
        params: { status },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplications(response.data.data.applications || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

  // Initialize
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    
    if (!userStr || !token) {
      router.push('/login?role=inspector');
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    fetchStats();
    fetchApplications();
  }, [router, fetchStats, fetchApplications]);

  // Refresh on tab change
  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [tabValue, currentUser, fetchApplications]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const handleScheduleClick = (app: DTAMApplication) => {
    setSelectedApp(app);
    setScheduleDialogOpen(true);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduledDate(tomorrow.toISOString().slice(0, 16));
  };

  const handleScheduleSubmit = async () => {
    if (!selectedApp || !scheduledDate) return;
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(
        `${API_BASE}/dtam/inspector/applications/${selectedApp.id}/schedule`,
        { scheduledDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setScheduleDialogOpen(false);
      setSelectedApp(null);
      fetchStats();
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartInspection = async (appId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/dtam/inspector/applications/${appId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchStats();
      fetchApplications();
      router.push(`/inspector/inspection/${appId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start inspection');
    }
  };

  const handleViewDetails = (appId: string) => {
    router.push(`/inspector/application/${appId}`);
  };

  const getInspectionTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <VideocamIcon />;
      case 'HYBRID': return <DriveEtaIcon />;
      case 'ONSITE': return <HomeIcon />;
      default: return <AssessmentIcon />;
    }
  };

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'info';
      case 'HYBRID': return 'warning';
      case 'ONSITE': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REVIEW_PASSED': return 'success';
      case 'INSPECTION_SCHEDULED': return 'info';
      case 'INSPECTION_IN_PROGRESS': return 'warning';
      case 'INSPECTION_COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'REVIEW_PASSED': 'ผ่านการตรวจเอกสาร',
      'INSPECTION_SCHEDULED': 'กำหนดวันแล้ว',
      'INSPECTION_IN_PROGRESS': 'กำลังตรวจ',
      'INSPECTION_COMPLETED': 'ตรวจเสร็จแล้ว'
    };
    return labels[status] || status;
  };

  if (!currentUser) return null;

  const statCards = [
    { label: 'รอกำหนดวัน', value: stats.pending, icon: <ScheduleIcon />, color: '#2196f3' },
    { label: 'กำลังตรวจ', value: stats.inProgress, icon: <AssessmentIcon />, color: '#ff9800' },
    { label: 'เสร็จสิ้น (30 วัน)', value: stats.completed, icon: <CheckCircleIcon />, color: '#4caf50' },
    { label: 'คะแนนเฉลี่ย', value: stats.avgScore.toFixed(1), icon: <CheckCircleIcon />, color: '#9c27b0' }
  ];

  return (
    <>
      <Head>
        <title>Dashboard ผู้ตรวจประเมิน | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#ff9800' }}>
        <Toolbar>
          <AssessmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบตรวจประเมิน GACP
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#f57c00' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName || currentUser.firstName + ' ' + currentUser.lastName}</strong>
                <br />
                <small>{currentUser.role || 'INSPECTOR'}</small>
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          แดชบอร์ดตรวจประเมิน
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        p: 1,
                        borderRadius: 1,
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Applications Table */}
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="รอตรวจประเมิน" />
            <Tab label="กำลังดำเนินการ" />
            <Tab label="เสร็จสิ้น" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>เลขที่คำขอ</TableCell>
                    <TableCell>Lot ID</TableCell>
                    <TableCell>ชื่อเกษตรกร</TableCell>
                    <TableCell>ฟาร์ม</TableCell>
                    <TableCell>ประเภทการตรวจ</TableCell>
                    <TableCell>AI Score</TableCell>
                    <TableCell>วันที่กำหนด</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                          ไม่มีรายการตรวจประเมิน
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell>{app.applicationNumber}</TableCell>
                        <TableCell>
                          <Chip label={app.lotId} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {app.farmer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.farmer.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.farm.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.farm.province} - {app.farm.area} ไร่
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getInspectionTypeIcon(app.inspectionType)}
                            label={app.inspectionType}
                            size="small"
                            color={getInspectionTypeColor(app.inspectionType) as any}
                          />
                        </TableCell>
                        <TableCell>
                          {app.aiQc && (
                            <Chip
                              label={`${app.aiQc.score} (${app.aiQc.grade})`}
                              size="small"
                              color={app.aiQc.score >= 80 ? 'success' : app.aiQc.score >= 60 ? 'warning' : 'error'}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {app.inspectionScheduledDate ? (
                            <Typography variant="body2">
                              {new Date(app.inspectionScheduledDate).toLocaleDateString('th-TH', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              ยังไม่กำหนด
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(app.status)}
                            size="small"
                            color={getStatusColor(app.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(app.id)}
                              title="ดูรายละเอียด"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            
                            {app.status === 'REVIEW_PASSED' && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleScheduleClick(app)}
                                title="กำหนดวันตรวจ"
                              >
                                <EventIcon fontSize="small" />
                              </IconButton>
                            )}
                            
                            {app.status === 'INSPECTION_SCHEDULED' && (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStartInspection(app.id)}
                                title="เริ่มตรวจ"
                              >
                                <PlayArrowIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>กำหนดวันตรวจประเมิน</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                คำขอ: {selectedApp.applicationNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                เกษตรกร: {selectedApp.farmer.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                ฟาร์ม: {selectedApp.farm.name} ({selectedApp.farm.province})
              </Typography>
              <Typography variant="body2" gutterBottom mb={2}>
                ประเภทการตรวจ: <Chip label={selectedApp.inspectionType} size="small" />
              </Typography>

              <TextField
                fullWidth
                type="datetime-local"
                label="วันและเวลาที่ตรวจ"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleScheduleSubmit}
            variant="contained"
            color="primary"
            disabled={submitting || !scheduledDate}
          >
            {submitting ? <CircularProgress size={24} /> : 'กำหนดวันตรวจ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
