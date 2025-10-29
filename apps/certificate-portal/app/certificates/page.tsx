'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Chip } from '@mui/material';
import { Download, QrCode2, Visibility } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([
    { id: 'GACP-2025-0001', farmName: 'ฟาร์มกัญชาเขียว', status: 'Active', issueDate: '2025-01-10', expiryDate: '2026-01-10' },
    { id: 'GACP-2025-0002', farmName: 'ฟาร์มสมุนไพรไทย', status: 'Active', issueDate: '2025-01-12', expiryDate: '2026-01-12' },
    { id: 'GACP-2025-0003', farmName: 'ฟาร์มขมิ้นชัน', status: 'Expired', issueDate: '2024-01-15', expiryDate: '2025-01-15' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📜 My Certificates
        </Typography>
        <Grid container spacing={3}>
          {certificates.map((cert) => (
            <Grid item xs={12} md={6} lg={4} key={cert.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{cert.id}</Typography>
                    <Chip
                      label={cert.status}
                      color={cert.status === 'Active' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {cert.farmName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issued: {cert.issueDate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Expires: {cert.expiryDate}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button size="small" startIcon={<Visibility />} variant="outlined">
                      View
                    </Button>
                    <Button size="small" startIcon={<Download />} variant="outlined">
                      PDF
                    </Button>
                    <Button size="small" startIcon={<QrCode2 />} variant="outlined">
                      QR
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
