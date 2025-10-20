'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Paper,
  Tooltip,
} from '@mui/material';
import { Add, Search, Visibility, GetApp, QrCode2, FilterList, Refresh } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Certificate, CertificateFilters } from '@/lib/types/certificate';

// Mock data for development
const mockCertificates: Certificate[] = [
  {
    id: '1',
    certificateNumber: 'GACP-2025-0001',
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
      postalCode: '20230',
    },
    farmArea: 15.5,
    cropType: 'มะม่วง',
    certificationStandard: 'GACP',
    status: 'approved',
    issuedBy: 'cert@gacp.test',
    issuedDate: '2025-01-15',
    expiryDate: '2028-01-15',
    inspectionDate: '2025-01-10',
    inspectorName: 'นางสาวสมหญิง ตรวจสอบ',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    certificateNumber: 'GACP-2025-0002',
    farmId: 'F002',
    farmName: 'ฟาร์มผักอินทรีย์สุขใจ',
    farmerName: 'นางสาวสมหญิง รักษ์สิ่งแวดล้อม',
    farmerNationalId: '9876543210987',
    address: {
      houseNumber: '456',
      village: 'หมู่ 3',
      subdistrict: 'บางพลี',
      district: 'บางพลี',
      province: 'สมุทรปราการ',
      postalCode: '10540',
    },
    farmArea: 8.0,
    cropType: 'ผักอินทรีย์',
    certificationStandard: 'Organic',
    status: 'pending',
    issuedBy: 'cert@gacp.test',
    issuedDate: '2025-02-01',
    expiryDate: '2028-02-01',
    inspectionDate: '2025-01-28',
    inspectorName: 'นายสมศักดิ์ ตรวจสอบ',
    createdAt: '2025-02-01T14:30:00Z',
    updatedAt: '2025-02-01T14:30:00Z',
  },
  {
    id: '3',
    certificateNumber: 'GACP-2025-0003',
    farmId: 'F003',
    farmName: 'สวนทุริยนภูเขา',
    farmerName: 'นายประสิทธิ์ มีผล',
    farmerNationalId: '5555555555555',
    address: {
      houseNumber: '789',
      village: 'หมู่ 7',
      subdistrict: 'ท่าขนุน',
      district: 'กันตัง',
      province: 'ตรัง',
      postalCode: '92110',
    },
    farmArea: 22.0,
    cropType: 'ทุเรียน',
    certificationStandard: 'GAP',
    status: 'approved',
    issuedBy: 'cert@gacp.test',
    issuedDate: '2025-03-10',
    expiryDate: '2028-03-10',
    inspectionDate: '2025-03-05',
    inspectorName: 'นางสมจิตร ตรวจสอบ',
    createdAt: '2025-03-10T09:15:00Z',
    updatedAt: '2025-03-10T09:15:00Z',
  },
];

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<CertificateFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load certificates (mock for now)
    setLoading(true);
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 500);
  }, [router]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setFilters({ ...filters, searchQuery });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Certificate['status']) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'pending':
        return 'รออนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'expired':
        return 'หมดอายุ';
      case 'revoked':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filters.status && cert.status !== filters.status) return false;
    if (
      filters.certificationStandard &&
      cert.certificationStandard !== filters.certificationStandard
    )
      return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        cert.certificateNumber.toLowerCase().includes(query) ||
        cert.farmName.toLowerCase().includes(query) ||
        cert.farmerName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const paginatedCertificates = filteredCertificates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Certificate Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/certificates/new')}
            size="large"
          >
            New Certificate
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status"
                  onChange={e => setFilters({ ...filters, status: e.target.value as any })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Standard</InputLabel>
                <Select
                  value={filters.certificationStandard || ''}
                  label="Standard"
                  onChange={e =>
                    setFilters({ ...filters, certificationStandard: e.target.value as any })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="GACP">GACP</MenuItem>
                  <MenuItem value="GAP">GAP</MenuItem>
                  <MenuItem value="Organic">Organic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1}>
                <Button variant="contained" startIcon={<Search />} onClick={handleSearch} fullWidth>
                  Search
                </Button>
                <Tooltip title="Refresh">
                  <IconButton onClick={handleRefresh}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" mb={2}>
          Showing {paginatedCertificates.length} of {filteredCertificates.length} certificates
        </Typography>

        {/* Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Certificate No.</TableCell>
                  <TableCell>Farm Name</TableCell>
                  <TableCell>Farmer Name</TableCell>
                  <TableCell>Crop Type</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCertificates.map(cert => (
                  <TableRow key={cert.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {cert.certificateNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{cert.farmName}</TableCell>
                    <TableCell>{cert.farmerName}</TableCell>
                    <TableCell>{cert.cropType}</TableCell>
                    <TableCell>
                      <Chip label={cert.certificationStandard} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(cert.status)}
                        size="small"
                        color={getStatusColor(cert.status)}
                      />
                    </TableCell>
                    <TableCell>{new Date(cert.issuedDate).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => router.push(`/certificates/${cert.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small" color="secondary">
                            <GetApp />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Show QR Code">
                          <IconButton size="small">
                            <QrCode2 />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCertificates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Box>
    </DashboardLayout>
  );
}
