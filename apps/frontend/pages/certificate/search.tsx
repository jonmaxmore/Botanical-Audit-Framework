/**
 * Certificate Search Page
 * Public page for searching and verifying GACP certificates
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import ClearIcon from '@mui/icons-material/Clear';

interface Certificate {
  _id: string;
  certificateNumber: string;
  holderInfo: {
    fullName?: string;
    organizationName?: string;
  };
  siteInfo: {
    farmName: string;
  };
  status: string;
  issuanceDate: string;
  expiryDate: string;
}

export default function CertificateSearch() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('number');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Certificate[]>([]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('กรุณาระบุข้อมูลที่ต้องการค้นหา');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(
        `/api/certificates/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        if (data.count === 0) {
          setError('ไม่พบใบรับรองที่ตรงกับเงื่อนไขการค้นหา');
        }
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการค้นหา');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewCertificate = (certificateNumber: string) => {
    router.push(`/certificate/${certificateNumber}`);
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
      case 'renewed':
        return 'ต่ออายุแล้ว';
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VerifiedIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                ระบบตรวจสอบใบรับรอง GACP
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                ค้นหาและตรวจสอบความถูกต้องของใบรับรองมาตรฐาน GACP
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Search Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>ประเภทการค้นหา</InputLabel>
                  <Select
                    value={searchType}
                    label="ประเภทการค้นหา"
                    onChange={e => setSearchType(e.target.value)}
                  >
                    <MenuItem value="number">เลขที่ใบรับรอง</MenuItem>
                    <MenuItem value="nationalId">เลขบัตรประชาชน</MenuItem>
                    <MenuItem value="taxId">เลขประจำตัวผู้เสียภาษี</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  label={
                    searchType === 'number'
                      ? 'เลขที่ใบรับรอง (เช่น GACP-2025-BK-0001)'
                      : searchType === 'nationalId'
                        ? 'เลขบัตรประชาชน 13 หลัก'
                        : 'เลขประจำตัวผู้เสียภาษี'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {results.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              ผลการค้นหา ({results.length} รายการ)
            </Typography>

            <Grid container spacing={3}>
              {results.map(cert => (
                <Grid item xs={12} key={cert._id}>
                  <Card
                    sx={{
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            เลขที่ใบรับรอง
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {cert.certificateNumber}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            ชื่อเกษตรกร/หน่วยงาน
                          </Typography>
                          <Typography variant="body1">
                            {cert.holderInfo.organizationName || cert.holderInfo.fullName}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            ชื่อแปลง
                          </Typography>
                          <Typography variant="body1">{cert.siteInfo.farmName}</Typography>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            สถานะ
                          </Typography>
                          <Chip
                            label={getStatusLabel(cert.status)}
                            color={getStatusColor(cert.status)}
                            size="small"
                            icon={cert.status === 'active' ? <VerifiedIcon /> : <WarningIcon />}
                          />
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleViewCertificate(cert.certificateNumber)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 3,
                              pt: 1,
                              borderTop: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              วันที่ออก: {formatDate(cert.issuanceDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              วันหมดอายุ: {formatDate(cert.expiryDate)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Info Section */}
        {results.length === 0 && !error && !loading && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <VerifiedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                ค้นหาใบรับรอง GACP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ระบุเลขที่ใบรับรอง เลขบัตรประชาชน หรือเลขประจำตัวผู้เสียภาษีเพื่อค้นหา
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      1
                    </Typography>
                    <Typography variant="body2">เลือกประเภทการค้นหา</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      2
                    </Typography>
                    <Typography variant="body2">ระบุข้อมูล</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.dark', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      3
                    </Typography>
                    <Typography variant="body2">ตรวจสอบผล</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
