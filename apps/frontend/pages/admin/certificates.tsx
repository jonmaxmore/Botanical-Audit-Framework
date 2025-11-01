/**
 * Admin Certificate Management Page
 * Admin interface for managing certificates
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Pagination,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface Certificate {
  _id: string;
  certificateNumber: string;
  holderInfo: {
    fullName?: string;
    organizationName?: string;
  };
  siteInfo: {
    farmName: string;
  };
  status: string;
  issuanceDate: string;
  expiryDate: string;
  application: {
    applicationNumber: string;
  };
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  suspended: number;
  revoked: number;
}

export default function AdminCertificates() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [actionDialog, setActionDialog] = useState<'suspend' | 'reinstate' | 'revoke' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [page, statusFilter]);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/certificates/admin?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCertificates(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/certificates/admin/stats/summary', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCertificates();
  };

  const handleAction = async () => {
    if (!selectedCertificate || !actionDialog) return;

    if ((actionDialog === 'suspend' || actionDialog === 'revoke') && !actionReason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/certificates/admin/${selectedCertificate.certificateNumber}/${actionDialog}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: actionReason })
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `${actionDialog === 'suspend' ? 'ระงับ' : actionDialog === 'reinstate' ? 'เปิดใช้งาน' : 'เพิกถอน'}ใบรับรองเรียบร้อยแล้ว`
        );
        fetchCertificates();
        fetchStats();
        handleCloseDialog();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Action error:', err);
      alert('ไม่สามารถดำเนินการได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setActionDialog(null);
    setSelectedCertificate(null);
    setActionReason('');
  };

  const openActionDialog = (cert: Certificate, action: 'suspend' | 'reinstate' | 'revoke') => {
    setSelectedCertificate(cert);
    setActionDialog(action);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'suspended':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'ใช้งานได้';
      case 'expired':
        return 'หมดอายุ';
      case 'suspended':
        return 'ระงับชั่วคราว';
      case 'revoked':
        return 'ถูกเพิกถอน';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            จัดการใบรับรอง GACP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ระบบจัดการและควบคุมใบรับรองมาตรฐาน GACP
          </Typography>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    ทั้งหมด
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="overline">ใช้งานได้</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="overline">ใกล้หมดอายุ</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.expiringSoon}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="overline">หมดอายุ</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.expired}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">ระงับชั่วคราว</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.suspended}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">ถูกเพิกถอน</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.revoked}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="ค้นหาเลขที่ใบรับรอง, ชื่อ, หรือชื่อแปลง"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={statusFilter}
                    label="สถานะ"
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="active">ใช้งานได้</MenuItem>
                    <MenuItem value="expired">หมดอายุ</MenuItem>
                    <MenuItem value="suspended">ระงับชั่วคราว</MenuItem>
                    <MenuItem value="revoked">ถูกเพิกถอน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  ค้นหา
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={fetchStats}
                >
                  รีเฟรช
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Certificates Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>เลขที่ใบรับรอง</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ชื่อ</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ชื่อแปลง</strong>
                  </TableCell>
                  <TableCell>
                    <strong>วันที่ออก</strong>
                  </TableCell>
                  <TableCell>
                    <strong>วันหมดอายุ</strong>
                  </TableCell>
                  <TableCell>
                    <strong>สถานะ</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>จัดการ</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map(cert => (
                    <TableRow key={cert._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {cert.certificateNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {cert.holderInfo.organizationName || cert.holderInfo.fullName}
                      </TableCell>
                      <TableCell>{cert.siteInfo.farmName}</TableCell>
                      <TableCell>{formatDate(cert.issuanceDate)}</TableCell>
                      <TableCell>{formatDate(cert.expiryDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(cert.status)}
                          color={getStatusColor(cert.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/certificate/${cert.certificateNumber}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ดาวน์โหลด PDF">
                            <IconButton
                              size="small"
                              onClick={() =>
                                window.open(`/api/certificates/pdf/${cert.certificateNumber}`)
                              }
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {cert.status === 'active' && (
                            <Tooltip title="ระงับชั่วคราว">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => openActionDialog(cert, 'suspend')}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {cert.status === 'suspended' && (
                            <Tooltip title="เปิดใช้งานอีกครั้ง">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openActionDialog(cert, 'reinstate')}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(cert.status === 'active' || cert.status === 'suspended') && (
                            <Tooltip title="เพิกถอน">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openActionDialog(cert, 'revoke')}
                              >
                                <DeleteForeverIcon fontSize="small" />
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
          </TableContainer>

          {/* Pagination */}
          {!loading && certificates.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialog !== null} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionDialog === 'suspend'
              ? 'ระงับใบรับรองชั่วคราว'
              : actionDialog === 'reinstate'
                ? 'เปิดใช้งานใบรับรองอีกครั้ง'
                : 'เพิกถอนใบรับรอง'}
          </DialogTitle>
          <DialogContent>
            {selectedCertificate && (
              <>
                <Alert
                  severity={
                    actionDialog === 'revoke'
                      ? 'error'
                      : actionDialog === 'suspend'
                        ? 'warning'
                        : 'info'
                  }
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {actionDialog === 'suspend' &&
                      'คุณต้องการระงับใบรับรองนี้ชั่วคราวหรือไม่? สามารถเปิดใช้งานได้ภายหลัง'}
                    {actionDialog === 'reinstate' &&
                      'คุณต้องการเปิดใช้งานใบรับรองนี้อีกครั้งหรือไม่?'}
                    {actionDialog === 'revoke' &&
                      'คุณต้องการเพิกถอนใบรับรองนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้'}
                  </Typography>
                </Alert>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>เลขที่ใบรับรอง:</strong> {selectedCertificate.certificateNumber}
                  <br />
                  <strong>ชื่อ:</strong>{' '}
                  {selectedCertificate.holderInfo.organizationName ||
                    selectedCertificate.holderInfo.fullName}
                </Typography>

                {(actionDialog === 'suspend' || actionDialog === 'revoke') && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="เหตุผล *"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="ระบุเหตุผลในการดำเนินการ"
                  />
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={actionLoading}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAction}
              variant="contained"
              color={
                actionDialog === 'revoke'
                  ? 'error'
                  : actionDialog === 'suspend'
                    ? 'warning'
                    : 'primary'
              }
              disabled={actionLoading}
            >
              {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
