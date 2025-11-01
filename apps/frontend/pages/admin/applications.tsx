/**
 * Admin Application Management Page
 * View and manage all GACP applications
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface Application {
  _id: string;
  applicationNumber: string;
  farmerInfo: {
    fullName: string;
    idCard: string;
    phoneNumber: string;
  };
  organizationInfo?: {
    organizationName: string;
  };
  farmInfo: {
    farmName: string;
    location: {
      province: string;
      district: string;
    };
  };
  status: string;
  applicantType: string;
  receivingOffice: string;
  payment?: {
    amount: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'DRAFT', label: 'แบบร่าง' },
  { value: 'SUBMITTED', label: 'ส่งแล้ว' },
  { value: 'PENDING_PAYMENT', label: 'รอชำระเงิน' },
  { value: 'PAYMENT_CONFIRMED', label: 'ชำระเงินแล้ว' },
  { value: 'UNDER_REVIEW', label: 'กำลังตรวจสอบ' },
  { value: 'PENDING_DOCUMENTS', label: 'รอเอกสารเพิ่มเติม' },
  { value: 'DOCUMENTS_RECEIVED', label: 'ได้รับเอกสาร' },
  { value: 'PENDING_INSPECTION', label: 'รอตรวจสอบสถานที่' },
  { value: 'INSPECTION_SCHEDULED', label: 'นัดหมายตรวจสอบ' },
  { value: 'INSPECTION_COMPLETED', label: 'ตรวจสอบเสร็จ' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'REJECTED', label: 'ไม่อนุมัติ' },
  { value: 'CERTIFICATE_ISSUED', label: 'ออกใบรับรองแล้ว' }
];

const applicantTypeOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'individual', label: 'เกษตรกรรายบุคคล' },
  { value: 'group', label: 'กลุ่มเกษตรกร' },
  { value: 'organization', label: 'องค์กร/นิติบุคคล' }
];

export default function ApplicationManagementPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicantTypeFilter, setApplicantTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, applicantTypeFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (applicantTypeFilter) params.append('applicantType', applicantTypeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/applications?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.data || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchApplications();
  };

  const handleViewDetails = (appId: string) => {
    router.push(`/admin/application/${appId}`);
  };

  const handleStatusUpdate = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;

    try {
      setUpdateLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/applications/${selectedApp._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newStatus,
            note: statusNote
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      alert('อัพเดทสถานะเรียบร้อยแล้ว');
      setStatusDialogOpen(false);
      setSelectedApp(null);
      await fetchApplications();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<
      string,
      'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    > = {
      DRAFT: 'default',
      SUBMITTED: 'info',
      PENDING_PAYMENT: 'warning',
      PAYMENT_CONFIRMED: 'success',
      UNDER_REVIEW: 'info',
      PENDING_DOCUMENTS: 'warning',
      DOCUMENTS_RECEIVED: 'info',
      PENDING_INSPECTION: 'warning',
      INSPECTION_SCHEDULED: 'info',
      INSPECTION_COMPLETED: 'success',
      APPROVED: 'success',
      REJECTED: 'error',
      CERTIFICATE_ISSUED: 'success'
    };
    return colorMap[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getApplicantTypeLabel = (type: string) => {
    const option = applicantTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1">
          จัดการคำขอรับรอง GACP
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchApplications}>
          รีเฟรช
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ค้นหา"
                placeholder="เลขที่คำขอ, ชื่อ, เลขบัตรประชาชน..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label="สถานะ"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>ประเภทผู้ยื่น</InputLabel>
                <Select
                  value={applicantTypeFilter}
                  onChange={e => setApplicantTypeFilter(e.target.value)}
                  label="ประเภทผู้ยื่น"
                >
                  {applicantTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={handleSearch}
                sx={{ height: '56px' }}
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6">รายการคำขอทั้งหมด ({total} รายการ)</Typography>
          </Box>

          {applications.length === 0 ? (
            <Typography variant="body1" color="textSecondary" align="center">
              ไม่พบข้อมูล
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>เลขที่คำขอ</TableCell>
                      <TableCell>ชื่อ/องค์กร</TableCell>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>วันที่สร้าง</TableCell>
                      <TableCell align="center">การดำเนินการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map(app => (
                      <TableRow key={app._id}>
                        <TableCell>{app.applicationNumber}</TableCell>
                        <TableCell>
                          {app.applicantType === 'individual'
                            ? app.farmerInfo.fullName
                            : app.organizationInfo?.organizationName || app.farmerInfo.fullName}
                        </TableCell>
                        <TableCell>{getApplicantTypeLabel(app.applicantType)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(app.status)}
                            color={getStatusColor(app.status)}
                            size="small"
                            onClick={() => handleStatusUpdate(app)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(app.createdAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(app._id)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => !updateLoading && setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>เปลี่ยนสถานะคำขอ</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                เลขที่คำขอ
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedApp.applicationNumber}
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>สถานะใหม่</InputLabel>
                <Select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  label="สถานะใหม่"
                >
                  {statusOptions
                    .filter(opt => opt.value !== '')
                    .map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="หมายเหตุ"
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="ระบุเหตุผลหรือข้อสังเกต..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updateLoading}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={updateLoading || newStatus === selectedApp?.status}
          >
            {updateLoading ? <CircularProgress size={24} /> : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
