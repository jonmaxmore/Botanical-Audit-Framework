import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import CommentThread from './CommentThread';
import JobAttachmentList from './JobAttachmentList';
import JobHistoryTimeline from './JobHistoryTimeline';
import SLAIndicator from './SLAIndicator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onUpdate?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: '#2196f3',
  accepted: '#ff9800',
  in_progress: '#9c27b0',
  completed: '#4caf50',
  rejected: '#f44336',
  reassigned: '#607d8b'
};

const statusLabels: Record<string, string> = {
  pending: 'รอดำเนินการ',
  accepted: 'รับงาน',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  rejected: 'ปฏิเสธ',
  reassigned: 'มอบหมายใหม่'
};

const jobTypeLabels: Record<string, string> = {
  field_inspection: 'ตรวจประเมินภาคสนาม',
  document_review: 'ตรวจสอบเอกสาร',
  video_inspection: 'ตรวจประเมินผ่าน Video Call',
  follow_up: 'ตรวจติดตาม',
  certification_audit: 'ตรวจประเมินเพื่อรับรอง',
  other: 'อื่นๆ'
};

export default function JobDetailModal({ open, onClose, jobId, onUpdate }: JobDetailModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      
      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJob(data.data || data);
    } catch (err) {
      console.error('Failed to load job details:', err);
      setError('ไม่สามารถโหลดข้อมูลงานได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails();
    }
  }, [open, jobId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    if (onUpdate) onUpdate();
  };

  const handleAcceptJob = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/accept`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept job');
      }

      handleRefresh();
    } catch (err) {
      console.error('Failed to accept job:', err);
      setError('ไม่สามารถรับงานได้');
    }
  };

  const handleStartJob = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/start`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start job');
      }

      handleRefresh();
    } catch (err) {
      console.error('Failed to start job:', err);
      setError('ไม่สามารถเริ่มงานได้');
    }
  };

  const handleCompleteJob = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/complete`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete job');
      }

      handleRefresh();
    } catch (err) {
      console.error('Failed to complete job:', err);
      setError('ไม่สามารถปิดงานได้');
    }
  };

  const renderActions = () => {
    if (!job) return null;

    const actions = [];
    
    if (job.status === 'pending') {
      actions.push(
        <Button
          key="accept"
          variant="contained"
          color="primary"
          onClick={handleAcceptJob}
          startIcon={<CheckCircleIcon />}
        >
          รับงาน
        </Button>
      );
    }

    if (job.status === 'accepted') {
      actions.push(
        <Button
          key="start"
          variant="contained"
          color="warning"
          onClick={handleStartJob}
          startIcon={<ScheduleIcon />}
        >
          เริ่มงาน
        </Button>
      );
    }

    if (job.status === 'in_progress') {
      actions.push(
        <Button
          key="complete"
          variant="contained"
          color="success"
          onClick={handleCompleteJob}
          startIcon={<CheckCircleIcon />}
        >
          ปิดงาน
        </Button>
      );
    }

    return actions;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">รายละเอียดงาน</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!loading && job && (
          <>
            {/* Job Overview Section */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    ประเภทงาน
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {jobTypeLabels[job.jobType] || job.jobType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    สถานะ
                  </Typography>
                  <Box>
                    <Chip
                      label={statusLabels[job.status] || job.status}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[job.status]}20`,
                        color: statusColors[job.status],
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    คำขอ
                  </Typography>
                  <Typography variant="body1">
                    {job.applicationId?.applicationNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    เกษตรกร
                  </Typography>
                  <Typography variant="body1">
                    {job.applicationId?.farmerName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    ฟาร์ม
                  </Typography>
                  <Typography variant="body1">
                    {job.applicationId?.farmName || 'N/A'}
                  </Typography>
                </Grid>
                {job.sla && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                      SLA Status
                    </Typography>
                    <SLAIndicator sla={job.sla} />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Tabs Section */}
            <Box>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<CommentIcon />} label="ความคิดเห็น" />
                <Tab icon={<AttachFileIcon />} label="ไฟล์แนบ" />
                <Tab icon={<HistoryIcon />} label="ประวัติ" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <CommentThread jobId={jobId} onUpdate={handleRefresh} />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <JobAttachmentList jobId={jobId} onUpdate={handleRefresh} />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <JobHistoryTimeline jobId={jobId} />
              </TabPanel>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          ปิด
        </Button>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
}
