/**
 * Public Certificate Verification Page
 *
 * No authentication required - public can scan QR and verify certificates
 * Rate limiting should be applied at backend level
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked' | 'active';

interface Certificate {
  id: string;
  certificateNumber: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNationalId: string;
  address: {
    houseNumber: string;
    village?: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  farmArea: number;
  cropType: string;
  certificationStandard: string;
  status: CertificateStatus;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  inspectionDate: string;
  inspectorName: string;
  revokedDate?: string;
  revokedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock API
const certificateApi = {
  verify: async (certNumber: string): Promise<VerificationResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock valid certificate
    if (certNumber.startsWith('GACP')) {
      return {
        valid: true,
        certificate: {
          id: '1',
          certificateNumber: certNumber,
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
            postalCode: '20230'
          },
          farmArea: 15.5,
          cropType: 'มะม่วง',
          certificationStandard: 'GACP',
          status: 'active',
          issuedBy: 'cert@gacp.test',
          issuedDate: '2025-01-15',
          expiryDate: '2028-01-15',
          inspectionDate: '2025-01-10',
          inspectorName: 'นางสาวสมหญิง ตรวจสอบ',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z'
        },
        message: 'Certificate is valid and active'
      };
    }

    return {
      valid: false,
      message: 'Certificate not found in database'
    };
  }
};

interface VerificationResult {
  valid: boolean;
  certificate?: Certificate;
  message?: string;
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateNumber = params.certificateNumber as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyCertificate() {
      if (!certificateNumber) {
        setError('Certificate number is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await certificateApi.verify(certificateNumber);
        setResult(data);
      } catch (err: any) {
        console.error('Verification error:', err);
        setError('Failed to verify certificate');
        setResult({ valid: false, message: 'Verification failed' });
      } finally {
        setLoading(false);
      }
    }

    verifyCertificate();
  }, [certificateNumber]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          p: 3
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Verifying Certificate...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error && !result) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Verification Failed
          </Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  // Verification result
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4,
        px: 2
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom>
            GACP Certificate Verification
          </Typography>
          <Typography variant="body1">
            Department of Agriculture, Ministry of Agriculture and Cooperatives
          </Typography>
        </Paper>

        {/* Verification Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {result?.valid ? (
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mr: 2 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 60, color: 'error.main', mr: 2 }} />
              )}
              <Box>
                <Typography variant="h5" gutterBottom>
                  {result?.valid ? 'Certificate Valid' : 'Certificate Invalid'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificate Number: <strong>{certificateNumber}</strong>
                </Typography>
              </Box>
            </Box>

            {result?.message && (
              <Alert severity={result.valid ? 'success' : 'error'} sx={{ mt: 2 }}>
                {result.message}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Certificate Details */}
        {result?.valid && result.certificate && (
          <>
            {/* Status Check */}
            {result.certificate.status === 'revoked' && (
              <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon />}>
                <Typography variant="h6" gutterBottom>
                  This certificate has been revoked
                </Typography>
                <Typography variant="body2">
                  Revocation Date:{' '}
                  {result.certificate.revokedDate
                    ? new Date(result.certificate.revokedDate).toLocaleDateString('en-US')
                    : 'N/A'}
                </Typography>
                {result.certificate.revokedReason && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reason: {result.certificate.revokedReason}
                  </Typography>
                )}
              </Alert>
            )}

            {result.certificate.status === 'expired' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  This certificate has expired
                </Typography>
                <Typography variant="body2">
                  Expiry Date: {new Date(result.certificate.expiryDate).toLocaleDateString('en-US')}
                </Typography>
              </Alert>
            )}

            {/* Farm Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Farm Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Farm Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.farmName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Farm ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.farmId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Farmer Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.farmerName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      National ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.farmerNationalId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Crop Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.cropType}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Farm Area
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.farmArea} Rai
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.address.houseNumber}{' '}
                      {result.certificate.address.village || ''}{' '}
                      {result.certificate.address.subdistrict},{' '}
                      {result.certificate.address.district}, {result.certificate.address.province}{' '}
                      {result.certificate.address.postalCode}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Certification Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Certification Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Certification Standard
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.certificationStandard}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={result.certificate.status.toUpperCase()}
                      color={
                        result.certificate.status === 'active'
                          ? 'success'
                          : result.certificate.status === 'expired'
                            ? 'warning'
                            : 'error'
                      }
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issued Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(result.certificate.issuedDate).toLocaleDateString('en-US')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(result.certificate.expiryDate).toLocaleDateString('en-US')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Inspection Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(result.certificate.inspectionDate).toLocaleDateString('en-US')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Inspector
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.inspectorName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issued By
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.certificate.issuedBy}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Verification Notice */}
            <Alert severity="info">
              <Typography variant="body2">
                This certificate has been verified against the official database of the Department
                of Agriculture. The information shown above is accurate as of{' '}
                {new Date().toLocaleString('en-US')}.
              </Typography>
            </Alert>
          </>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Department of Agriculture
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ministry of Agriculture and Cooperatives, Thailand
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
