import { Box, Button, Card, CardContent, Chip, Container, Grid, Typography } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { Download, Verified, Visibility } from '@mui/icons-material';
import Head from 'next/head';
import FarmerLayout from '../../components/layout/FarmerLayout';

type CertificateStatus = 'active' | 'pending_renewal' | 'expired';

type CertificateItem = {
  id: string;
  farmName: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
};

const statusConfig: Record<CertificateStatus, { label: string; color: ChipProps['color'] }> = {
  active: { label: 'มีผลบังคับ', color: 'success' },
  pending_renewal: { label: 'รอต่ออายุ', color: 'warning' },
  expired: { label: 'หมดอายุ', color: 'error' }
};

const certificates: CertificateItem[] = [
  {
    id: 'CERT001',
    farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
    issueDate: '2025-09-01',
    expiryDate: '2026-09-01',
    status: 'active'
  },
  {
    id: 'CERT002',
    farmName: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
    issueDate: '2025-08-15',
    expiryDate: '2026-08-15',
    status: 'active'
  }
];

const defaultChip: { label: string; color: ChipProps['color'] } = {
  label: 'ไม่ทราบสถานะ',
  color: 'default'
};

const getStatusChip = (status: CertificateStatus) => {
  const { label, color } = statusConfig[status] ?? defaultChip;
  return <Chip label={label} color={color} size="small" />;
};

export default function FarmerCertificates() {
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
          <Grid container spacing={3}>
            {certificates.map(cert => (
              <Grid item xs={12} md={6} key={cert.id}>
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
                      รหัสใบรับรอง: {cert.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      วันที่ออก: {new Date(cert.issueDate).toLocaleDateString('th-TH')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      วันหมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Visibility />}>
                        ดู
                      </Button>
                      <Button size="small" variant="contained" startIcon={<Download />}>
                        ดาวน์โหลด
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FarmerLayout>
    </>
  );
}
