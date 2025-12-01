import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  AssignmentTurnedIn as ApproveIcon,
  Block as RejectIcon,
  Undo as SendBackIcon,
  Description as CertificateIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ApproverStats {
  pendingApproval: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
}

interface DTAMApplication {
  _id: string;
  applicationNumber: string;
  lotId: string;
  farmer: {
    name: string;
    farmName: string;
  };
  status: string;
  inspectionType: string;
  inspectionScore?: number;
  paymentVerified: boolean;
  certificateNumber?: string;
}

const ApproverDashboard: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<ApproverStats>({
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    avgProcessingTime: 0,
  });
  const [applications, setApplications] = useState<DTAMApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [sendBackDialogOpen, setSendBackDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DTAMApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendBackReason, setSendBackReason] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE}/dtam/approver/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    }
  }, [API_BASE]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      let status = '';
      if (tabValue === 0) status = 'PENDING_APPROVAL';
      else if (tabValue === 1) status = 'APPROVED';
      else if (tabValue === 2) status = 'REJECTED';

      const response = await axios.get(`${API_BASE}/dtam/approver/applications`, {
        params: { status },
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(response.data.data.applications || []);
      setError(null);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, tabValue]);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchApplications();
    }
  }, [currentUser, fetchStats, fetchApplications]);

  const handleVerifyPayment = async (appId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/dtam/approver/applications/${appId}/verify-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment verified successfully');
      fetchApplications();
    } catch (err) {
      alert('Failed to verify payment');
    }
  };

  const handleApproveSubmit = async () => {
    if (!selectedApp) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/dtam/approver/applications/${selectedApp._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApproveDialogOpen(false);
      setSelectedApp(null);
      fetchStats();
      fetchApplications();
      alert('Application approved successfully');
    } catch (err) {
      alert('Failed to approve application');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/dtam/approver/applications/${selectedApp._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectDialogOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      fetchStats();
      fetchApplications();
      alert('Application rejected');
    } catch (err) {
      alert('Failed to reject application');
    }
  };

  const handleSendBackSubmit = async () => {
    if (!selectedApp || !sendBackReason.trim()) {
      alert('Please provide a reason');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/dtam/approver/applications/${selectedApp._id}/send-back`,
        { reason: sendBackReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSendBackDialogOpen(false);
      setSelectedApp(null);
      setSendBackReason('');
      fetchStats();
      fetchApplications();
      alert('Application sent back');
    } catch (err) {
      alert('Failed to send back');
    }
  };

  const handleIssueCertificate = async (appId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/dtam/approver/applications/${appId}/issue-certificate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Certificate issued: ${response.data.data.certificateNumber}`);
      fetchApplications();
    } catch (err) {
      alert('Failed to issue certificate');
    }
  };

  const handleViewDetails = (appId: string) => {
    router.push(`/approver/application/${appId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'CERTIFICATE_ISSUED': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'รออนมต';
      case 'APPROVED': return 'อนมตแลว';
      case 'REJECTED': return 'ปฏเสธ';
      case 'CERTIFICATE_ISSUED': return 'ออกใบรบรองแลว';
      default: return status;
    }
  };

  const getInspectionTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'วดโอ';
      case 'HYBRID': return 'แบบผสม';
      case 'ONSITE': return 'ลงพนท';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Approver Dashboard</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          สวสด, {currentUser?.name || 'Approver'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssessmentIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">{stats.pendingApproval}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">รออนมต</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">{stats.approved}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">อนมตแลว</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CancelIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">{stats.rejected}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">ปฏเสธ</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssessmentIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">{stats.avgProcessingTime.toFixed(1)}h</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">เวลาเฉลย</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="รออนมต" />
          <Tab label="อนมตแลว" />
          <Tab label="ปฏเสธ" />
        </Tabs>

        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขทใบสมคร</TableCell>
                  <TableCell>Lot ID</TableCell>
                  <TableCell>เกษตรกร</TableCell>
                  <TableCell>ฟารม</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>คะแนน</TableCell>
                  <TableCell>การชำระ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ใบรบรอง</TableCell>
                  <TableCell align="right">จดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">ไมมรายการ</TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app._id} hover>
                      <TableCell>{app.applicationNumber}</TableCell>
                      <TableCell>{app.lotId}</TableCell>
                      <TableCell>{app.farmer.name}</TableCell>
                      <TableCell>{app.farmer.farmName}</TableCell>
                      <TableCell>
                        <Chip label={getInspectionTypeLabel(app.inspectionType)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {app.inspectionScore ? (
                          <Chip
                            label={`${app.inspectionScore}%`}
                            color={app.inspectionScore >= 80 ? 'success' : app.inspectionScore >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {app.paymentVerified ? (
                          <Chip label="ยนยนแลว" color="success" size="small" />
                        ) : (
                          <Button size="small" variant="outlined" onClick={() => handleVerifyPayment(app._id)} disabled={tabValue !== 0}>
                            ยนยน
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={getStatusLabel(app.status)} color={getStatusColor(app.status)} size="small" />
                      </TableCell>
                      <TableCell>{app.certificateNumber || '-'}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="ดรายละเอยด">
                            <IconButton size="small" onClick={() => handleViewDetails(app._id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {tabValue === 0 && (
                            <>
                              <Tooltip title="อนมต">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setApproveDialogOpen(true);
                                  }}
                                  disabled={!app.paymentVerified}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="ปฏเสธ">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="สงกลบ">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setSendBackDialogOpen(true);
                                  }}
                                >
                                  <SendBackIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {tabValue === 1 && !app.certificateNumber && (
                            <Tooltip title="ออกใบรบรอง">
                              <IconButton size="small" color="primary" onClick={() => handleIssueCertificate(app._id)}>
                                <CertificateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ยนยนการอนมต</DialogTitle>
        <DialogContent>
          <Typography>คณตองการอนมตใบสมครเลขท <strong>{selectedApp?.applicationNumber}</strong> หรอไม?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>ยกเลก</Button>
          <Button onClick={handleApproveSubmit} variant="contained" color="success">อนมต</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ปฏเสธใบสมคร</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>ใบสมครเลขท <strong>{selectedApp?.applicationNumber}</strong></Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="เหตผล"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>ยกเลก</Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error">ปฏเสธ</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sendBackDialogOpen} onClose={() => setSendBackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สงกลบ</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>ใบสมครเลขท <strong>{selectedApp?.applicationNumber}</strong></Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="เหตผล"
            value={sendBackReason}
            onChange={(e) => setSendBackReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendBackDialogOpen(false)}>ยกเลก</Button>
          <Button onClick={handleSendBackSubmit} variant="contained" color="warning">สงกลบ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApproverDashboard;
