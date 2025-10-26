'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import { useRouter } from 'next/navigation';

interface Inspector {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  assignedInspections: number;
  completedInspections: number;
  location: string;
  certifications: string[];
}

export default function InspectorsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedInspectorId, setSelectedInspectorId] = React.useState<string | null>(null);

  // Mock inspectors data
  const inspectors: Inspector[] = [
    {
      id: '1',
      name: 'นายสมชาย ตรวจสอบ',
      email: 'somchai.inspect@gacp.go.th',
      phone: '081-234-5678',
      status: 'available',
      assignedInspections: 3,
      completedInspections: 45,
      location: 'เชียงใหม่',
      certifications: ['GACP Inspector', 'Organic Farming'],
    },
    {
      id: '2',
      name: 'นางสาวสมหญิง ลงพื้นที่',
      email: 'somying.inspect@gacp.go.th',
      phone: '082-345-6789',
      status: 'busy',
      assignedInspections: 5,
      completedInspections: 38,
      location: 'ลำพูน',
      certifications: ['GACP Inspector', 'Quality Control'],
    },
    {
      id: '3',
      name: 'นายประสิทธิ์ ออกตรวจ',
      email: 'prasit.inspect@gacp.go.th',
      phone: '083-456-7890',
      status: 'available',
      assignedInspections: 2,
      completedInspections: 52,
      location: 'เชียงราย',
      certifications: ['GACP Inspector', 'Food Safety'],
    },
    {
      id: '4',
      name: 'นางวิภา ตรวจการ',
      email: 'wipa.inspect@gacp.go.th',
      phone: '084-567-8901',
      status: 'offline',
      assignedInspections: 0,
      completedInspections: 29,
      location: 'พะเยา',
      certifications: ['GACP Inspector'],
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, inspectorId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedInspectorId(inspectorId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInspectorId(null);
  };

  const handleViewInspector = () => {
    if (selectedInspectorId) {
      router.push(`/inspectors/${selectedInspectorId}`);
    }
    handleMenuClose();
  };

  const handleAssignInspection = () => {
    if (selectedInspectorId) {
      alert('เปิดหน้ามอบหมายงานตรวจสอบ');
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'พร้อมงาน';
      case 'busy':
        return 'กำลังทำงาน';
      case 'offline':
        return 'ไม่อยู่';
      default:
        return status;
    }
  };

  const filteredInspectors = inspectors.filter(
    inspector =>
      inspector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
        </Box>

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'calc(100% - 280px)' },
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="จัดการเจ้าหน้าที่ตรวจสอบ" />

          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
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
                    เจ้าหน้าที่ตรวจสอบ
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    จัดการและมอบหมายงานตรวจสอบฟาร์ม
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />}>
                  เพิ่มเจ้าหน้าที่
                </Button>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        เจ้าหน้าที่ทั้งหมด
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {inspectors.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        พร้อมงาน
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {inspectors.filter(i => i.status === 'available').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        กำลังทำงาน
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {inspectors.filter(i => i.status === 'busy').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        งานที่กำลังดำเนินการ
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {inspectors.reduce((sum, i) => sum + i.assignedInspections, 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="ค้นหาเจ้าหน้าที่..."
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

              {/* Inspectors Grid */}
              <Grid container spacing={3}>
                {filteredInspectors.map(inspector => (
                  <Grid item xs={12} sm={6} md={4} key={inspector.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                              {inspector.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {inspector.name}
                              </Typography>
                              <Chip
                                label={getStatusLabel(inspector.status)}
                                color={getStatusColor(inspector.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <IconButton onClick={e => handleMenuOpen(e, inspector.id)} size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {inspector.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {inspector.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {inspector.location}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              งานที่รับ
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {inspector.assignedInspections}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              เสร็จแล้ว
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {inspector.completedInspections}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {inspector.certifications.map(cert => (
                            <Chip key={cert} label={cert} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Empty State */}
              {filteredInspectors.length === 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      ไม่พบเจ้าหน้าที่ตรวจสอบ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ลองเปลี่ยนคำค้นหา
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Action Menu */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewInspector}>ดูรายละเอียด</MenuItem>
                <MenuItem onClick={handleAssignInspection}>มอบหมายงาน</MenuItem>
                <MenuItem onClick={handleMenuClose}>แก้ไขข้อมูล</MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                  ระงับการใช้งาน
                </MenuItem>
              </Menu>
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
