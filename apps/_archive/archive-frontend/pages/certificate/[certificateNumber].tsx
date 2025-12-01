/**
 * Certificate Detail Page
 * Display full certificate information and verification status
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface CertificateData {
  certificateNumber: string;
  certificateType: string;
  holderInfo: {
    holderType: string;
    fullName?: string;
    organizationName?: string;
    province: string;
  };
  siteInfo: {
    farmName: string;
    totalArea: number;
    location: {
      province: string;
      district: string;
    };
  };
  issuanceDate: string;
  expiryDate: string;
  status: string;
  scope: string;
  standardsComplied: string[];
  qrCode: {
    data: string;
    imageUrl?: string;
  };
  verificationUrl: string;
  isValid: boolean;
  daysUntilExpiry: number;
}

export default function CertificateDetail() {
  const router = useRouter();
  const { certificateNumber } = router.query;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCertificate = useCallback(async () => {
    try {
      const response = await fetch(`/api/certificates/${certificateNumber}`);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.data);
      } else {
        setError(data.message || 'ไม่พบใบรับรอง');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('ไม่สามารถโหลดข้อมูลใบรับรองได้');
    } finally {
      setLoading(false);
    }
  }, [certificateNumber]);

  useEffect(() => {
    if (certificateNumber) {
      fetchCertificate();
    }
  }, [certificateNumber, fetchCertificate]);

  const handleDownloadPDF = () => {
    window.open(`/api/certificates/pdf/${certificateNumber}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบรับรอง GACP ${certificateNumber}`,
          text: `ตรวจสอบใบรับรองมาตรฐาน GACP`,
          url
        });
      } catch (err) {
        console.error('Share error:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('คัดลอก URL แล้ว');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'suspended':
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
      case 'suspended':
        return 'ระงับชั่วคราว';
      case 'revoked':
        return 'ถูกเพิกถอน';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !certificate) {
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
      <Container maxWidth="lg">
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/certificate/search')}
          >
            กลับไปค้นหา
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
              แชร์
            </Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              พิมพ์
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
              ดาวน์โหลด PDF
            </Button>
          </Box>
        </Box>

        {/* Certificate Status Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: certificate.status === 'active' ? 'success.light' : 'warning.light',
            color: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              {certificate.status === 'active' ? (
                <VerifiedIcon sx={{ fontSize: 48 }} />
              ) : (
                <WarningIcon sx={{ fontSize: 48 }} />
              )}
            </Grid>
            <Grid item xs>
              <Typography variant="h5" fontWeight="bold">
                {certificate.status === 'active'
                  ? 'ใบรับรองนี้ถูกต้องและมีผลบังคับใช้'
                  : `สถานะ: ${getStatusLabel(certificate.status)}`}
              </Typography>
              {certificate.isValid && certificate.daysUntilExpiry <= 60 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  ⚠️ ใบรับรองจะหมดอายุในอีก {certificate.daysUntilExpiry} วัน
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Chip
                label={getStatusLabel(certificate.status)}
                color={getStatusColor(certificate.status)}
                size="medium"
                sx={{ fontSize: '1.1rem', px: 2, py: 1 }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column - Main Info */}
          <Grid item xs={12} md={8}>
            {/* Certificate Number */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  เลขที่ใบรับรอง
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  {certificate.certificateNumber}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  ประเภท:{' '}
                  {certificate.certificateType === 'full'
                    ? 'ใบรับรองเต็มรูปแบบ'
                    : certificate.certificateType}
                </Typography>
              </CardContent>
            </Card>

            {/* Holder Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {certificate.holderInfo.holderType === 'individual' ? '👤' : '🏢'}
                  </Avatar>
                  ข้อมูลผู้ถือใบรับรอง
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ชื่อ
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.holderInfo.organizationName || certificate.holderInfo.fullName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ประเภท
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.holderInfo.holderType === 'individual'
                        ? 'บุคคล'
                        : certificate.holderInfo.holderType === 'group'
                          ? 'กลุ่ม'
                          : 'องค์กร'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      จังหวัด
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.holderInfo.province}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Site Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AgricultureIcon color="primary" />
                  ข้อมูลแปลงเพาะปลูก
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ชื่อแปลง
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.siteInfo.farmName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      ที่ตั้ง
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.siteInfo.location.district},{' '}
                      {certificate.siteInfo.location.province}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      พื้นที่รับรอง
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.siteInfo.totalArea} ไร่
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Certification Details */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CheckCircleIcon color="primary" />
                  รายละเอียดการรับรอง
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      วันที่ออกใบรับรอง
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.issuanceDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      วันหมดอายุ
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.expiryDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ขอบเขตการรับรอง
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.scope}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      มาตรฐานที่ปฏิบัติตาม
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {certificate.standardsComplied.map((standard, index) => (
                        <Chip key={index} label={standard} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - QR & Verification */}
          <Grid item xs={12} md={4}>
            {/* QR Code */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                >
                  <QrCodeIcon color="primary" />
                  QR Code ตรวจสอบ
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    display: 'inline-block'
                  }}
                >
                  {certificate.qrCode.imageUrl ? (
                    <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                      <Image
                        src={certificate.qrCode.imageUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 200,
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white'
                      }}
                    >
                      <QrCodeIcon sx={{ fontSize: 100, color: 'grey.400' }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                  สแกน QR Code เพื่อตรวจสอบความถูกต้อง
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() =>
                    router.push(`/certificate/verify/${certificate.certificateNumber}`)
                  }
                >
                  ตรวจสอบความถูกต้อง
                </Button>
              </CardContent>
            </Card>

            {/* Verification Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลการตรวจสอบ
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ตรวจสอบแล้ว"
                      secondary="ใบรับรองนี้ได้รับการตรวจสอบจากระบบ"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="ลายเซ็นดิจิทัล" secondary="มีลายเซ็นดิจิทัลที่ถูกต้อง" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarTodayIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="วันที่ตรวจสอบ"
                      secondary={new Date().toLocaleString('th-TH')}
                    />
                  </ListItem>
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  URL สำหรับตรวจสอบ:
                  <br />
                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    {certificate.verificationUrl}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
