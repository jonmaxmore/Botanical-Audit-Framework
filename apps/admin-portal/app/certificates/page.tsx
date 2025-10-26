'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Block as RevokeIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface Certificate {
  id: string;
  certificateNumber: string;
  farmName: string;
  farmerName: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  issuer: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCertId, setSelectedCertId] = React.useState<string | null>(null);

  // Mock data for certificates
  const [certificates, setCertificates] = React.useState<Certificate[]>([
    {
      id: '1',
      certificateNumber: 'GACP-2025-0001',
      farmName: 'ฟาร์มสมชาย',
      farmerName: 'นายสมชาย ใจดี',
      issuedDate: '2025-01-15',
      expiryDate: '2027-01-15',
      status: 'active',
      issuer: 'นายสมศักดิ์ ผู้อนุมัติ',
    },
    {
      id: '2',
      certificateNumber: 'GACP-2025-0002',
      farmName: 'ฟาร์มสมหญิง',
      farmerName: 'นางสมหญิง ใจงาม',
      issuedDate: '2025-02-20',
      expiryDate: '2027-02-20',
      status: 'active',
      issuer: 'นายสมศักดิ์ ผู้อนุมัติ',
    },
    {
      id: '3',
      certificateNumber: 'GACP-2024-0156',
      farmName: 'ฟาร์มประสิทธิ์',
      farmerName: 'นายประสิทธิ์ มั่นคง',
      issuedDate: '2024-10-10',
      expiryDate: '2026-10-10',
      status: 'active',
      issuer: 'นางวิภา ผู้อนุมัติ',
    },
    {
      id: '4',
      certificateNumber: 'GACP-2023-0089',
      farmName: 'ฟาร์มสุรชัย',
      farmerName: 'นายสุรชัย เก่งกาจ',
      issuedDate: '2023-06-15',
      expiryDate: '2025-06-15',
      status: 'expired',
      issuer: 'นายสมศักดิ์ ผู้อนุมัติ',
    },
    {
      id: '5',
      certificateNumber: 'GACP-2024-0120',
      farmName: 'ฟาร์มวิไล',
      farmerName: 'นางวิไล สบายดี',
      issuedDate: '2024-08-01',
      expiryDate: '2026-08-01',
      status: 'revoked',
      issuer: 'นางวิภา ผู้อนุมัติ',
    },
  ]);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, certId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCertId(certId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCertId(null);
  };

  const handleView = () => {
    if (selectedCertId) {
      router.push(`/certificates/${selectedCertId}`);
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedCertId) {
      const cert = certificates.find(c => c.id === selectedCertId);
      alert(`กำลังดาวน์โหลดใบรับรอง ${cert?.certificateNumber}`);
    }
    handleMenuClose();
  };

  const handleRevoke = () => {
    if (selectedCertId) {
      const cert = certificates.find(c => c.id === selectedCertId);
      if (confirm(`คุณต้องการเพิกถอนใบรับรอง ${cert?.certificateNumber} หรือไม่?`)) {
        setCertificates(
          certificates.map(c =>
            c.id === selectedCertId ? { ...c, status: 'revoked' as const } : c
          )
        );
        alert('เพิกถอนใบรับรองเรียบร้อย');
      }
    }
    handleMenuClose();
  };

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

  const getStatusText = (status: string) => {
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

  const filteredCertificates = certificates.filter(
    cert =>
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
        </Box>

        {/* Sidebar - Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'calc(100% - 280px)' },
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="จัดการใบรับรอง" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Page Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    จัดการใบรับรอง GACP
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ตรวจสอบ ดาวน์โหลด และเพิกถอนใบรับรอง
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<FilterIcon />}>
                    ตัวกรอง
                  </Button>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    ออกใบรับรองใหม่
                  </Button>
                </Box>
              </Box>

              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="ค้นหาด้วยเลขใบรับรอง, ชื่อฟาร์ม, หรือชื่อเกษตรกร..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        ใบรับรองทั้งหมด
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {certificates.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        ใช้งานได้
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {certificates.filter(c => c.status === 'active').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        หมดอายุ
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {certificates.filter(c => c.status === 'expired').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        ถูกเพิกถอน
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {certificates.filter(c => c.status === 'revoked').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Loading State */}
              {loading ? (
                <LoadingSpinner message="กำลังโหลดใบรับรอง..." />
              ) : (
                /* Certificates List */
                <Grid container spacing={3}>
                  {filteredCertificates.map(cert => (
                    <Grid item xs={12} key={cert.id}>
                      <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant="h6" fontWeight={600}>
                                  {cert.certificateNumber}
                                </Typography>
                                <Chip
                                  label={getStatusText(cert.status)}
                                  color={getStatusColor(cert.status)}
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body1" gutterBottom>
                                <strong>ฟาร์ม:</strong> {cert.farmName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>เกษตรกร:</strong> {cert.farmerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ออกให้เมื่อ: {new Date(cert.issuedDate).toLocaleDateString('th-TH')}{' '}
                                | หมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mt: 0.5 }}
                              >
                                ผู้ออก: {cert.issuer}
                              </Typography>
                            </Box>
                            <Box>
                              <IconButton onClick={e => handleMenuOpen(e, cert.id)} size="small">
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State */}
              {!loading && filteredCertificates.length === 0 && (
                <Card sx={{ boxShadow: 2, mt: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {searchQuery ? 'ไม่พบใบรับรองที่ค้นหา' : 'ยังไม่มีใบรับรอง'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {searchQuery
                        ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง'
                        : 'เริ่มต้นโดยการออกใบรับรองใหม่'}
                    </Typography>
                    {!searchQuery && (
                      <Button variant="contained" startIcon={<AddIcon />}>
                        ออกใบรับรองแรก
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Menu */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleView}>
                  <ViewIcon sx={{ mr: 1 }} fontSize="small" />
                  ดูรายละเอียด
                </MenuItem>
                <MenuItem onClick={handleDownload}>
                  <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                  ดาวน์โหลด PDF
                </MenuItem>
                <MenuItem
                  onClick={handleRevoke}
                  disabled={
                    selectedCertId
                      ? certificates.find(c => c.id === selectedCertId)?.status === 'revoked'
                      : false
                  }
                >
                  <RevokeIcon sx={{ mr: 1 }} fontSize="small" />
                  เพิกถอนใบรับรอง
                </MenuItem>
              </Menu>
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
