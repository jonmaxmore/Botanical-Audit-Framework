'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download, QrCode2, Visibility } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import apiClient from '@/lib/api-client';

interface Certificate {
  id: string;
  certificateNumber: string;
  farmName: string;
  status: string;
  issueDate: string;
  expiryDate: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await apiClient.get('/certificates');
        if (response.data.success) {
          const mappedCerts = response.data.data.map((cert: any) => ({
            id: cert._id,
            certificateNumber: cert.certificateNumber,
            farmName: cert.farmName || 'Unknown Farm',
            status: cert.status,
            issueDate: new Date(cert.validFrom).toLocaleDateString('en-GB'),
            expiryDate: new Date(cert.validUntil).toLocaleDateString('en-GB'),
          }));
          setCertificates(mappedCerts);
        }
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
        setError('Failed to load certificates. Please try again later.');
        // Fallback to mock data for demo purposes if backend is empty/fails
        setCertificates([
          {
            id: 'mock-1',
            certificateNumber: 'GACP-2025-0001',
            farmName: 'Mock Farm (Backend Offline)',
            status: 'Active',
            issueDate: '2025-01-10',
            expiryDate: '2026-01-10',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.farmName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">📜 My Certificates</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/certificates/new')}
          >
            Issue Certificate
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box mb={4} display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Search Certificates"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
          />
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
              <MenuItem value="Revoked">Revoked</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {filteredCertificates.map((cert) => (
            <Grid item xs={12} md={6} lg={4} key={cert.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{cert.certificateNumber}</Typography>
                    <Chip
                      label={cert.status}
                      color={
                        cert.status === 'Active'
                          ? 'success'
                          : cert.status === 'Expired'
                            ? 'error'
                            : 'default'
                      }
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
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      variant="outlined"
                      onClick={() => router.push(`/certificates/${cert.id}`)}
                    >
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
          {filteredCertificates.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No certificates found.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
