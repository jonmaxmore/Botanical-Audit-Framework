'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  VerifiedUser,
  LocationOn,
  Event,
  Person
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface CertificateVerification {
  valid: boolean;
  certificateNumber: string;
  farmName: string;
  farmerName: string;
  cropType: string;
  certificationStandard: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  address: string;
  qrCodeUrl?: string;
}

export default function VerifyPage() {
  const [certNumber, setCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVerify = async () => {
    if (!certNumber.trim()) {
      setError('กรุณากรอกเลขที่ใบรับรอง');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      // Mock data - in production, call real API
      if (certNumber === 'GACP-2025-0001') {
        setResult({
          valid: true,
          certificateNumber: 'GACP-2025-0001',
          farmName: 'สวนมะม่วงทองดี',
          farmerName: 'นายสมชาย ใจดี',
          cropType: 'มะม่วง',
          certificationStandard: 'GACP',
          issuedDate: '2025-01-15',
          expiryDate: '2028-01-15',
          status: 'active',
          address: '123 หมู่ 5 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230'
        });
      } else {
        setResult({
          valid: false,
          certificateNumber: certNumber,
          farmName: '',
          farmerName: '',
          cropType: '',
          certificationStandard: '',
          issuedDate: '',
          expiryDate: '',
          status: 'revoked',
          address: ''
        });
      }
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (result?.valid && canvasRef.current) {
      // Generate QR code
      const qrData = JSON.stringify({
        certNumber: result.certificateNumber,
        farmName: result.farmName,
        issuedDate: result.issuedDate
      });

      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  }, [result]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
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
      case 'revoked':
        return 'ถูกเพิกถอน';
      default:
        return status;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 8
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <VerifiedUser sx={{ fontSize: 80, color: 'white', mb: 2 }} />
          <Typography variant="h3" fontWeight={700} color="white" gutterBottom>
            ตรวจสอบใบรับรอง GACP
          </Typography>
          <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
            ระบบตรวจสอบความถูกต้องของใบรับรองมาตรฐาน
          </Typography>
        </Box>

        {/* Search Box */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 6 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            กรอกเลขที่ใบรับรอง
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            ตัวอย่าง: GACP-2025-0001
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="GACP-XXXX-XXXX"
              value={certNumber}
              onChange={e => setCertNumber(e.target.value.toUpperCase())}
              onKeyPress={e => e.key === 'Enter' && handleVerify()}
              disabled={loading}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              onClick={handleVerify}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
            </Button>
          </Box>
        </Paper>

        {/* Result */}
        {result && (
          <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Status Badge */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {result.valid ? (
                  <>
                    <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                      ใบรับรองถูกต้อง
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ใบรับรองนี้ออกโดยกรมวิชาการเกษตร
                    </Typography>
                  </>
                ) : (
                  <>
                    <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} color="error.main" gutterBottom>
                      ไม่พบใบรับรอง
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ไม่พบเลขที่ใบรับรองนี้ในระบบ หรืออาจถูกเพิกถอนแล้ว
                    </Typography>
                  </>
                )}
              </Box>

              {/* Certificate Details */}
              {result.valid && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'success.main'
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              เลขที่ใบรับรอง
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                              {result.certificateNumber}
                            </Typography>
                          </Box>
                          <Chip
                            label={getStatusLabel(result.status)}
                            color={getStatusColor(result.status)}
                            size="medium"
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Person sx={{ color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            เกษตรกร
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {result.farmerName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <LocationOn sx={{ color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            ฟาร์ม
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {result.farmName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ที่อยู่
                      </Typography>
                      <Typography variant="body1">{result.address}</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ชนิดพืช
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {result.cropType}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        มาตรฐาน
                      </Typography>
                      <Chip label={result.certificationStandard} color="primary" />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Event sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            ออกให้
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(result.issuedDate).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Event sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            หมดอายุ
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(result.expiryDate).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Alert severity="info">
                        ใบรับรองนี้ถูกต้องและยังคงใช้งานได้ ออกโดย กรมวิชาการเกษตร
                        กระทรวงเกษตรและสหกรณ์
                      </Alert>
                    </Grid>

                    {/* QR Code */}
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', pt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          QR Code ใบรับรอง
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-block',
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: 2
                          }}
                        >
                          <canvas ref={canvasRef} />
                        </Box>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          สแกน QR Code เพื่อตรวจสอบใบรับรอง
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        {!result && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>วิธีการใช้งาน:</strong> กรอกเลขที่ใบรับรองที่ต้องการตรวจสอบ หรือสแกน QR Code
              บนใบรับรอง
            </Typography>
          </Alert>
        )}
      </Container>
    </Box>
  );
}
