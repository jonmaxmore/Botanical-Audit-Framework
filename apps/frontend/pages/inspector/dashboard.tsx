import React, { useState, useEffect } from 'react';
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
  Alert,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Inspector } from '../../types/user.types';
import JobDetailModal from '../../components/job-ticket/JobDetailModal';
import CalendarWidget from '../../components/calendar/CalendarWidget';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface InspectorStats {
  totalInspections: number;
  pendingInspections: number;
  activeInspections: number;
  completedInspections: number;
  passedInspections: number;
  failedInspections: number;
}

interface JobAssignment {
  _id: string;
  jobType: string;
  status: string;
  applicationId: {
    applicationNumber: string;
    farmerName: string;
    farmName: string;
  };
  sla: {
    dueDate: string;
    breached: boolean;
    remainingHours?: number;
  };
  createdAt: string;
}

export default function InspectorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Inspector | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<InspectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobAssignments, setJobAssignments] = useState<JobAssignment[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  // Fetch inspector analytics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');

      const response = await fetch(`${API_BASE_URL}/analytics/inspections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inspection analytics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Fetch job assignments
  const fetchJobAssignments = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const response = await fetch(
        `${API_BASE_URL}/job-assignments?assignedTo=${currentUser._id || currentUser.id}&status=pending,accepted,in_progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job assignments');
      }

      const data = await response.json();
      setJobAssignments(data.data || []);
    } catch (err) {
      console.error('Failed to load job assignments:', err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=inspector');
      return;
    }
    const user = JSON.parse(userStr) as Inspector;
    setCurrentUser(user);
    fetchStats();
    fetchJobAssignments();
  }, [router]);

  const handleOpenJobDetail = (jobId: string) => {
    setSelectedJobId(jobId);
    setJobModalOpen(true);
  };

  const handleCloseJobDetail = () => {
    setJobModalOpen(false);
    setSelectedJobId(null);
  };

  const handleJobUpdate = () => {
    fetchJobAssignments();
    fetchStats();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      accepted: 'รับงาน',
      in_progress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#2196f3',
      accepted: '#ff9800',
      in_progress: '#9c27b0',
      completed: '#4caf50'
    };
    return colors[status] || '#757575';
  };

  const getJobTypeLabel = (jobType: string) => {
    const labels: Record<string, string> = {
      field_inspection: 'ตรวจประเมินภาคสนาม',
      document_review: 'ตรวจสอบเอกสาร',
      video_inspection: 'ตรวจผ่าน Video Call',
      follow_up: 'ตรวจติดตาม',
      certification_audit: 'ตรวจประเมินเพื่อรับรอง',
      other: 'อื่นๆ'
    };
    return labels[jobType] || jobType;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  const statsCards = [
    {
      label: 'รอกำหนดวัน',
      value: stats?.pendingInspections || 0,
      icon: <ScheduleIcon />,
      color: '#2196f3'
    },
    {
      label: 'กำลังตรวจ',
      value: stats?.activeInspections || 0,
      icon: <AssessmentIcon />,
      color: '#ff9800'
    },
    {
      label: 'ผ่าน',
      value: stats?.passedInspections || 0,
      icon: <CheckCircleIcon />,
      color: '#4caf50'
    },
    {
      label: 'ไม่ผ่าน',
      value: stats?.failedInspections || 0,
      icon: <CancelIcon />,
      color: '#f44336'
    }
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
                <strong>{currentUser.fullName}</strong>
                <br />
                <small>ใบอนุญาต: {currentUser.licenseNumber}</small>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            แดชบอร์ดตรวจประเมิน
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStats}
              disabled={loading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={() => router.push('/analytics')}
            >
              Analytics
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
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
                    {loading && !stats ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Widget */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <CalendarWidget
              inspectorId={currentUser._id || currentUser.id}
              onCreateEvent={() => router.push('/inspector/schedule')}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Placeholder for additional widgets */}
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="รอตรวจประเมิน" />
            <Tab label="กำลังดำเนินการ" />
            <Tab label="เสร็จสิ้น" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ประเภทงาน</TableCell>
                  <TableCell>เลขที่คำขอ</TableCell>
                  <TableCell>เกษตรกร</TableCell>
                  <TableCell>ฟาร์ม</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                        ไม่มีรายการงาน
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobAssignments
                    .filter(job => {
                      if (tabValue === 0) return job.status === 'pending';
                      if (tabValue === 1) return ['accepted', 'in_progress'].includes(job.status);
                      return job.status === 'completed';
                    })
                    .map(job => (
                      <TableRow key={job._id} hover>
                        <TableCell>
                          <Typography variant="body2">{getJobTypeLabel(job.jobType)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {job.applicationId?.applicationNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {job.applicationId?.farmerName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {job.applicationId?.farmName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(job.status)}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(job.status)}20`,
                              color: getStatusColor(job.status),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenJobDetail(job._id)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Job Detail Modal */}
        {selectedJobId && (
          <JobDetailModal
            open={jobModalOpen}
            onClose={handleCloseJobDetail}
            jobId={selectedJobId}
            onUpdate={handleJobUpdate}
          />
        )}
      </Container>
    </>
  );
}
