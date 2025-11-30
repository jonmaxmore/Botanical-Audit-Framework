'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Download, QrCode2, Edit } from '@mui/icons-material';
import QRCode from 'qrcode';
import { generateCertificatePDF } from '@/lib/utils/pdf-generator';
import apiClient from '@/lib/api-client';

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      const id = params.id as string;
      try {
        const response = await apiClient.get(`/certificates/${id}`);
        if (response.data.success) {
          const certData = response.data.data;
          const mappedCert = {
            id: certData.certificateNumber, // Display ID
            _id: certData._id, // Internal ID
            farmName: certData.farmName || 'Unknown Farm',
            status: certData.status,
            issueDate: new Date(certData.validFrom).toLocaleDateString('en-GB'),
            expiryDate: new Date(certData.validUntil).toLocaleDateString('en-GB'),
            // Keep original data for PDF/QR if needed
            ...certData,
          };
          setCertificate(mappedCert);

          // Generate QR Code
          try {
            const url = await QRCode.toDataURL(
              JSON.stringify({
                id: mappedCert.id,
                verifyUrl: `https://gacp.go.th/verify/${mappedCert.id}`,
              })
            );
            setQrCodeUrl(url);
          } catch (err) {
            console.error('QR Gen Error', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch certificate:', err);
        // Fallback or error handling
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCertificate();
    }
  }, [params.id]);

  const handleDownloadPDF = () => {
    if (certificate) {
      generateCertificatePDF(certificate);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!certificate) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          Certificate not found
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
            Back to List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back to List
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {certificate.id}
            </Typography>
            <Chip
              label={certificate.status}
              color={
                certificate.status === 'Active'
                  ? 'success'
                  : certificate.status === 'Expired'
                    ? 'error'
                    : 'default'
              }
            />
          </Box>
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<Edit />}>
              Edit
            </Button>
            <Button variant="contained" startIcon={<Download />} onClick={handleDownloadPDF}>
              PDF
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Farm Name
            </Typography>
            <Typography variant="h6">{certificate.farmName}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Issue Date
            </Typography>
            <Typography variant="h6">{certificate.issueDate}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Expiry Date
            </Typography>
            <Typography variant="h6">{certificate.expiryDate}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              QR Code
            </Typography>
            <Box mt={1}>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Certificate QR Code" width={150} height={150} />
              ) : (
                <QrCode2 sx={{ fontSize: 60 }} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
