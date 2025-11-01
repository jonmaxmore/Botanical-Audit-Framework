/**
 * Admin Payment Verification Page
 * For admins to verify farmer payment slips
 */

/* prettier-ignore-file */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface PaymentInfo {
  amount: number;
  currency: string;
  status: string;
  slipUrl?: string;
  referenceNumber?: string;
  paidAt?: string;
  verifiedAt?: string;
  notes?: string;
}

interface Application {
  _id: string;
  applicationNumber: string;
  farmerInfo: {
    fullName: string;
    idCard: string;
    phoneNumber: string;
  };
  farmInfo: {
    farmName: string;
    location: {
      province: string;
      district: string;
    };
  };
  payment: PaymentInfo;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentVerificationPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slipImageOpen, setSlipImageOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/applications/pending-payment`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pending payments');
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setNotes('');
    setDialogOpen(true);
  };

  const handleVerifyPayment = async (action: 'approve' | 'reject') => {
    if (!selectedApp) return;

    if (action === 'reject' && !notes.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    try {
      setActionLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/applications/${selectedApp._id}/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action,
            notes: notes.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();

      // Show success message
      alert(data.message);

      // Close dialog and refresh list
      setDialogOpen(false);
      setSelectedApp(null);
      setNotes('');
      await fetchPendingPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency || 'THB'
    }).format(amount);
  };

  if (loading) {
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
          ตรวจสอบการชำระเงิน
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPendingPayments}>
          รีเฟรช
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="textSecondary" align="center">
              ไม่มีรายการรอตรวจสอบ
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>เลขที่คำขอ</TableCell>
                <TableCell>ชื่อเกษตรกร</TableCell>
                <TableCell>ชื่อฟาร์ม</TableCell>
                <TableCell>จำนวนเงิน</TableCell>
                <TableCell>วันที่อัพโหลด</TableCell>
                <TableCell align="center">การดำเนินการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app._id}>
                  <TableCell>{app.applicationNumber}</TableCell>
                  <TableCell>{app.farmerInfo.fullName}</TableCell>
                  <TableCell>{app.farmInfo.farmName}</TableCell>
                  <TableCell>{formatCurrency(app.payment.amount, app.payment.currency)}</TableCell>
                  <TableCell>{formatDate(app.updatedAt)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleViewDetails(app)} size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Payment Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !actionLoading && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>ตรวจสอบหลักฐานการชำระเงิน</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    เลขที่คำขอ
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedApp.applicationNumber}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    ชื่อเกษตรกร
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedApp.farmerInfo.fullName}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    เลขบัตรประชาชน
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedApp.farmerInfo.idCard}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedApp.farmerInfo.phoneNumber}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    จำนวนเงิน
                  </Typography>
                  <Typography variant="h6" gutterBottom color="primary">
                    {formatCurrency(selectedApp.payment.amount, selectedApp.payment.currency)}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    หมายเลขอ้างอิง
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedApp.payment.referenceNumber || '-'}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    วันที่อัพโหลด
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedApp.updatedAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    หลักฐานการชำระเงิน
                  </Typography>
                  {selectedApp.payment.slipUrl ? (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 400,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedApp.payment.slipUrl}
                        alt="Payment Slip"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onClick={() => setSlipImageOpen(true)}
                      />
                    </Box>
                  ) : (
                    <Alert severity="warning">ไม่พบหลักฐานการชำระเงิน</Alert>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="หมายเหตุ (จำเป็นสำหรับการปฏิเสธ)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ระบุเหตุผลหรือข้อสังเกต..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
            ยกเลิก
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleVerifyPayment('reject')}
            disabled={actionLoading}
          >
            ปฏิเสธ
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleVerifyPayment('approve')}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'อนุมัติ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Image Dialog */}
      <Dialog open={slipImageOpen} onClose={() => setSlipImageOpen(false)} maxWidth="lg">
        <DialogContent sx={{ p: 0 }}>
          {selectedApp?.payment.slipUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedApp.payment.slipUrl}
              alt="Payment Slip Full"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
