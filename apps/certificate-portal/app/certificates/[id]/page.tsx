'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  GetApp,
  QrCode2,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Print,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Certificate } from '@/lib/types/certificate';

// Mock certificate data
const mockCertificate: Certificate = {
  id: '1',
  certificateNumber: 'GACP-2025-0001',
  farmId: 'F001',
  farmName: 'สวนมะม่วงทองดี',
  farmerName: 'นายสมชาย ใจดี',
  farmerNationalId: '1234567890123',
  address: {
    houseNumber: '123',
    village: 'หมู่ 5',
    subdistrict: 'ทุ่งสุขลา',
    district: 'ศรีราชา',
    province: 'ชลบุรี',
    postalCode: '20230',
  },
  farmArea: 15.5,
  cropType: 'มะม่วง',
  certificationStandard: 'GACP',
  status: 'approved',
  issuedBy: 'cert@gacp.test',
  issuedDate: '2025-01-15',
  expiryDate: '2028-01-15',
  inspectionDate: '2025-01-10',
  inspectorName: 'นางสาวสมหญิง ตรวจสอบ',
  inspectionReport: 'ฟาร์มผ่านการตรวจสอบตามมาตรฐาน GACP ครบถ้วนทุกข้อกำหนด',
  notes: 'ฟาร์มมีการจัดการที่ดีเยี่ยม แนะนำให้เป็นแบบอย่างให้ฟาร์มอื่น',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
};

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load certificate (mock for now)
    setLoading(true);
    setTimeout(() => {
      setCertificate(mockCertificate);
      setLoading(false);
    }, 500);
  }, [router, params]);

  const handleApprove = () => {
    enqueueSnackbar('Certificate approved successfully!', { variant: 'success' });
    if (certificate) {
      setCertificate({ ...certificate, status: 'approved' });
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      enqueueSnackbar('Please provide a reason for rejection', { variant: 'error' });
      return;
    }
    enqueueSnackbar('Certificate rejected', { variant: 'warning' });
    if (certificate) {
      setCertificate({ ...certificate, status: 'rejected' });
    }
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleDownloadPDF = () => {
    enqueueSnackbar('Downloading PDF...', { variant: 'info' });
    // PDF download logic here
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Certificate['status']) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'pending':
        return 'รออนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'expired':
        return 'หมดอายุ';
      case 'revoked':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  if (loading || !certificate) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/certificates')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {certificate.certificateNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certificate Details
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button startIcon={<Print />} onClick={handlePrint}>
              Print
            </Button>
            <Button startIcon={<GetApp />} onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            <Button startIcon={<QrCode2 />} onClick={() => setShowQRDialog(true)}>
              QR Code
            </Button>
          </Box>
        </Box>

        {/* Status Alert */}
        {certificate.status === 'pending' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This certificate is pending approval. Please review and approve or reject.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Certificate Information
                  </Typography>
                  <Chip
                    label={getStatusLabel(certificate.status)}
                    color={getStatusColor(certificate.status)}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Certificate Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {certificate.certificateNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Certification Standard
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {certificate.certificationStandard}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Issued Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.issuedDate).toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.expiryDate).toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} mb={2}>
                  Farm Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Farm Name
                    </Typography>
                    <Typography variant="body1">{certificate.farmName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Farm ID
                    </Typography>
                    <Typography variant="body1">{certificate.farmId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Farmer Name
                    </Typography>
                    <Typography variant="body1">{certificate.farmerName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      National ID
                    </Typography>
                    <Typography variant="body1">{certificate.farmerNationalId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Crop Type
                    </Typography>
                    <Typography variant="body1">{certificate.cropType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Farm Area
                    </Typography>
                    <Typography variant="body1">{certificate.farmArea} ไร่</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {certificate.address.houseNumber} {certificate.address.village} ต.
                      {certificate.address.subdistrict} อ.{certificate.address.district} จ.
                      {certificate.address.province} {certificate.address.postalCode}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} mb={2}>
                  Inspection Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Inspection Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.inspectionDate).toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Inspector Name
                    </Typography>
                    <Typography variant="body1">{certificate.inspectorName}</Typography>
                  </Grid>
                  {certificate.inspectionReport && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Inspection Report
                      </Typography>
                      <Typography variant="body1">{certificate.inspectionReport}</Typography>
                    </Grid>
                  )}
                  {certificate.notes && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Additional Notes
                      </Typography>
                      <Typography variant="body1">{certificate.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions & Metadata */}
          <Grid item xs={12} md={4}>
            {/* Actions */}
            {certificate.status === 'pending' && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Actions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={handleApprove}
                    >
                      Approve Certificate
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<Cancel />}
                      onClick={() => setShowRejectDialog(true)}
                    >
                      Reject Certificate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Metadata
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Issued By
                    </Typography>
                    <Typography variant="body2">{certificate.issuedBy}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(certificate.createdAt).toLocaleString('th-TH')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(certificate.updatedAt).toLocaleString('th-TH')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
          <DialogTitle>QR Code</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={2}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 250,
                  height: 250,
                  bgcolor: '#f5f5f5',
                }}
              >
                <QrCode2 sx={{ fontSize: 200, color: 'primary.main' }} />
              </Paper>
              <Typography variant="caption" textAlign="center">
                Scan this QR code to verify the certificate
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {certificate.certificateNumber}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQRDialog(false)}>Close</Button>
            <Button variant="contained" startIcon={<GetApp />}>
              Download QR
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
          <DialogTitle>Reject Certificate</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={2}>
              Please provide a reason for rejecting this certificate:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleReject}>
              Reject Certificate
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
