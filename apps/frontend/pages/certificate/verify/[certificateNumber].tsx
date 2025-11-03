/**
 * Certificate Verification Page
 * Verify certificate authenticity with QR scanner
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InfoIcon from '@mui/icons-material/Info';

interface VerificationResult {
  valid: boolean;
  status: string;
  certificate?: {
    certificateNumber: string;
    holderName: string;
    farmName: string;
    issuanceDate: string;
    expiryDate: string;
    status: string;
  };
  daysUntilExpiry?: number;
  message: string;
}

export default function CertificateVerify() {
  const router = useRouter();
  const { certificateNumber } = router.query;
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const verifyCertificate = useCallback(async () => {
    try {
      const response = await fetch(`/api/certificates/verify/${certificateNumber}`);
      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
      } else {
        setError('ไม่สามารถตรวจสอบใบรับรองได้');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }, [certificateNumber]);

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate();
    }
  }, [certificateNumber, verifyCertificate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = () => {
    if (!verificationResult) return null;

    if (verificationResult.valid) {
      return <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />;
    }

    if (verificationResult.status === 'expired') {
      return <WarningIcon sx={{ fontSize: 80, color: 'warning.main' }} />;
    }

    return <CancelIcon sx={{ fontSize: 80, color: 'error.main' }} />;
  };

  const getStatusColor = () => {
    if (!verificationResult) return 'grey';

    if (verificationResult.valid) return 'success';
    if (verificationResult.status === 'expired') return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/certificate/search')}
        >
          กลับไปหน้าค้นหา
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <QrCodeScannerIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            ผลการตรวจสอบใบรับรอง
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            ระบบตรวจสอบความถูกต้องของใบรับรอง GACP
          </Typography>
        </Paper>

        {/* Verification Result */}
        {verificationResult && (
          <>
            {/* Status Card */}
            <Card
              sx={{
                mb: 3,
                bgcolor: `${getStatusColor()}.light`,
                color: verificationResult.valid ? 'success.contrastText' : 'text.primary'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {getStatusIcon()}
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                  {verificationResult.message}
                </Typography>
                {verificationResult.certificate && (
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    เลขที่ใบรับรอง: {verificationResult.certificate.certificateNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Certificate Details */}
            {verificationResult.certificate && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <VerifiedIcon color="primary" />
                    รายละเอียดใบรับรอง
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ชื่อเกษตรกร/หน่วยงาน
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {verificationResult.certificate.holderName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ชื่อแปลง
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {verificationResult.certificate.farmName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        วันที่ออกใบรับรอง
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(verificationResult.certificate.issuanceDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        วันหมดอายุ
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(verificationResult.certificate.expiryDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Verification Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  รายละเอียดการตรวจสอบ
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon>
                      {verificationResult.valid ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="สถานะใบรับรอง"
                      secondary={
                        verificationResult.valid
                          ? 'ใบรับรองนี้ถูกต้องและมีผลบังคับใช้'
                          : verificationResult.message
                      }
                    />
                  </ListItem>

                  {verificationResult.daysUntilExpiry !== undefined && (
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon
                          color={
                            verificationResult.daysUntilExpiry <= 30
                              ? 'warning'
                              : verificationResult.daysUntilExpiry <= 60
                                ? 'info'
                                : 'action'
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="ระยะเวลาที่เหลือ"
                        secondary={`ใบรับรองจะหมดอายุในอีก ${verificationResult.daysUntilExpiry} วัน`}
                      />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ตรวจสอบเมื่อ"
                      secondary={new Date().toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Warning for expiring certificates */}
            {verificationResult.valid &&
              verificationResult.daysUntilExpiry &&
              verificationResult.daysUntilExpiry <= 60 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    ⚠️ <strong>คำเตือน:</strong> ใบรับรองนี้ใกล้หมดอายุแล้ว
                    กรุณาดำเนินการต่ออายุภายใน {verificationResult.daysUntilExpiry} วัน
                  </Typography>
                </Alert>
              )}

            {/* Action Buttons */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.push('/certificate/search')}
                >
                  ค้นหาใบรับรองอื่น
                </Button>
              </Grid>
              {verificationResult.certificate && (
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      router.push(
                        `/certificate/${verificationResult.certificate!.certificateNumber}`
                      )
                    }
                  >
                    ดูรายละเอียดเต็ม
                  </Button>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Info Section */}
        <Card sx={{ mt: 4, bgcolor: 'info.light' }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <InfoIcon />
              ข้อมูลเพิ่มเติม
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              • ระบบตรวจสอบความถูกต้องของใบรับรองโดยอัตโนมัติจากฐานข้อมูลของกรมการปกครอง
            </Typography>
            <Typography variant="body2" paragraph>
              • หากพบข้อผิดพลาดหรือมีข้อสงสัย กรุณาติดต่อ: 0-2141-9000
            </Typography>
            <Typography variant="body2">
              • ใบรับรองที่ถูกต้องจะมีลายเซ็นดิจิทัลและ QR Code สำหรับตรวจสอบ
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
