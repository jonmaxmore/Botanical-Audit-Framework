import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Chip, Container, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { Download, Verified, Visibility } from '@mui/icons-material';
import Head from 'next/head';
import FarmerLayout from '../../components/layout/FarmerLayout';
import { api } from '../../src/lib/api';

type CertificateStatus = 'active' | 'pending_renewal' | 'expired' | 'approved' | 'pending' | 'rejected';

type CertificateItem = {
  id: string;
  _id?: string;
  certificateNumber?: string;
  farmName: string;
  farmId?: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  pdfUrl?: string;
};

const statusConfig: Record<CertificateStatus, { label: string; color: ChipProps['color'] }> = {
  active: { label: 'มีผลบังคับ', color: 'success' },
  approved: { label: 'มีผลบังคับ', color: 'success' },
  pending_renewal: { label: 'รอต่ออายุ', color: 'warning' },
  pending: { label: 'รอการอนุมัติ', color: 'warning' },
  expired: { label: 'หมดอายุ', color: 'error' },
  rejected: { label: 'ถูกปฏิเสธ', color: 'error' }
};

const defaultChip: { label: string; color: ChipProps['color'] } = {
  label: 'ไม่ทราบสถานะ',
  color: 'default'
};

const getStatusChip = (status: CertificateStatus) => {
  const { label, color } = statusConfig[status] ?? defaultChip;
  return <Chip label={label} color={color} size="small" />;
};

export default function FarmerCertificates() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/certificates');
      const certsData = response.data.data || response.data.certificates || response.data || [];
      setCertificates(certsData);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลใบรับรองได้');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId: string) => {
    try {
      const response = await api.get(`/api/certificates/download/${certId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error downloading certificate:', err);
      alert('ไม่สามารถดาวน์โหลดใบรับรองได้');
    }
  };

  const handleView = (certId: string) => {
    window.open(`/certificate/verify/${certId}`, '_blank');
  };
  return (
    <>
      <Head>
        <title>ใบรับรอง - ระบบ GACP</title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
            ใบรับรอง GACP
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : certificates.length === 0 ? (
            <Alert severity="info">
              ยังไม่มีใบรับรอง กรุณายื่นคำขอรับรองและรอการอนุมัติ
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {certificates.map(cert => {
                const certId = cert._id || cert.id || cert.certificateNumber || '';
                return (
                  <Grid item xs={12} md={6} key={certId}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2
                          }}
                        >
                          <Verified sx={{ fontSize: 40, color: 'success.main' }} />
                          {getStatusChip(cert.status)}
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          {cert.farmName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          รหัสใบรับรอง: {cert.certificateNumber || certId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          วันที่ออก: {new Date(cert.issueDate).toLocaleDateString('th-TH')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          วันหมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<Visibility />}
                            onClick={() => handleView(certId)}
                          >
                            ดู
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<Download />}
                            onClick={() => handleDownload(certId)}
                          >
                            ดาวน์โหลด
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </FarmerLayout>
    </>
  );
}
