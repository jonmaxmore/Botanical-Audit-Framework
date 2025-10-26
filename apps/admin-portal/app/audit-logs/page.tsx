'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  ipAddress: string;
  details: string;
}

export default function AuditLogsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  // Mock audit logs data
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: 'admin@gacp.go.th',
      action: 'LOGIN',
      resource: 'Authentication',
      status: 'success',
      ipAddress: '192.168.1.100',
      details: 'Successful login',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'reviewer@gacp.go.th',
      action: 'UPDATE',
      resource: 'Application #GACP-2025-0125',
      status: 'success',
      ipAddress: '192.168.1.101',
      details: 'Updated application status to APPROVED',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: 'inspector@gacp.go.th',
      action: 'CREATE',
      resource: 'Inspection Report #IR-2025-089',
      status: 'success',
      ipAddress: '192.168.1.102',
      details: 'Created new inspection report',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'unknown@suspicious.com',
      action: 'LOGIN_FAILED',
      resource: 'Authentication',
      status: 'error',
      ipAddress: '103.45.67.89',
      details: 'Failed login attempt - invalid credentials',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: 'admin@gacp.go.th',
      action: 'DELETE',
      resource: 'User #USER-456',
      status: 'warning',
      ipAddress: '192.168.1.100',
      details: 'Deleted user account',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'reviewer@gacp.go.th',
      action: 'VIEW',
      resource: 'Certificate #GACP-2025-0001',
      status: 'success',
      ipAddress: '192.168.1.101',
      details: 'Viewed certificate details',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      user: 'admin@gacp.go.th',
      action: 'UPDATE',
      resource: 'System Settings',
      status: 'success',
      ipAddress: '192.168.1.100',
      details: 'Updated system configuration',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: 'inspector@gacp.go.th',
      action: 'UPLOAD',
      resource: 'Document #DOC-2025-234',
      status: 'success',
      ipAddress: '192.168.1.102',
      details: 'Uploaded inspection photo',
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'สำเร็จ';
      case 'warning':
        return 'คำเตือน';
      case 'error':
        return 'ข้อผิดพลาด';
      default:
        return status;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          <AdminHeader onMenuClick={handleSidebarToggle} title="Audit Logs" />

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
                    Audit Logs
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ติดตามและตรวจสอบกิจกรรมทั้งหมดในระบบ
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<DownloadIcon />}>
                  Export CSV
                </Button>
              </Box>

              <Card>
                <CardContent>
                  {/* Search and Filter */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 3,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <TextField
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flexGrow: 1 }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>สถานะ</InputLabel>
                      <Select
                        value={filterStatus}
                        label="สถานะ"
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <MenuItem value="all">ทั้งหมด</MenuItem>
                        <MenuItem value="success">สำเร็จ</MenuItem>
                        <MenuItem value="warning">คำเตือน</MenuItem>
                        <MenuItem value="error">ข้อผิดพลาด</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Audit Logs Table */}
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>เวลา</TableCell>
                          <TableCell>ผู้ใช้</TableCell>
                          <TableCell>การกระทำ</TableCell>
                          <TableCell>ทรัพยากร</TableCell>
                          <TableCell>สถานะ</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>รายละเอียด</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedLogs.map(log => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(log.timestamp).toLocaleString('th-TH')}
                              </Typography>
                            </TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>
                              <Chip label={log.action} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{log.resource}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(log.status)}
                                color={getStatusColor(log.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {log.ipAddress}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {log.details}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredLogs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="แถวต่อหน้า:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
                  />
                </CardContent>
              </Card>
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
