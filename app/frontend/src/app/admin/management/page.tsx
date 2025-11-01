'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  WorkspacePremium as CertificateIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import { useApplicationContext } from '@/contexts/ApplicationContext';

/**
 * Admin Certificate & User Management Page
 *
 * หน้าจัดการใบรับรองและผู้ใช้งาน
 * - Tab 1: Certificate Management (ใบรับรองที่ออก, ยกเลิก)
 * - Tab 2: User Management (CRUD ผู้ใช้, จัดการ roles)
 */

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'สมชาย ใจดี',
    email: 'farmer1@example.com',
    role: 'FARMER',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'สมหญิง รักษ์ดี',
    email: 'farmer2@example.com',
    role: 'FARMER',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'วิชัย ตรวจสอบ',
    email: 'officer1@example.com',
    role: 'DTAM_OFFICER',
    status: 'active',
    createdAt: '2023-12-01',
  },
  {
    id: '4',
    name: 'สุดา ลงพื้นที่',
    email: 'inspector1@example.com',
    role: 'INSPECTOR',
    status: 'active',
    createdAt: '2023-11-15',
  },
  {
    id: '5',
    name: 'ผู้จัดการ ระบบ',
    email: 'admin1@example.com',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2023-10-01',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminManagementPage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplicationContext();
  const [tabValue, setTabValue] = useState(0);

  // Certificates state
  const [certSearch, setCertSearch] = useState('');
  const [certPage, setCertPage] = useState(0);
  const [certRowsPerPage, setCertRowsPerPage] = useState(10);
  const [certMenuAnchor, setCertMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // Users state
  const [users, setUsers] = useState(mockUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDialog, setUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'FARMER',
    status: 'active',
  });

  // Get issued certificates
  const issuedCertificates = applications
    .filter((app) => app.workflowState === 'CERTIFICATE_ISSUED' || app.workflowState === 'APPROVED')
    .map((app, index) => ({
      id: app.id,
      certificateNumber: `GACP-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
      applicationNumber: app.applicationNumber,
      farmName: app.farmInfo?.name,
      farmerName: app.farmerInfo?.name,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      status: 'active',
      score: app.inspectionData?.totalScore || 0,
    }));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Certificate handlers
  const handleCertMenuOpen = (event: React.MouseEvent<HTMLElement>, cert: any) => {
    setCertMenuAnchor(event.currentTarget);
    setSelectedCert(cert);
  };

  const handleCertMenuClose = () => {
    setCertMenuAnchor(null);
    setSelectedCert(null);
  };

  const handleViewCertificate = () => {
    alert(`ดูใบรับรอง: ${selectedCert?.certificateNumber}`);
    handleCertMenuClose();
  };

  const handleDownloadCertificate = () => {
    alert(`ดาวน์โหลดใบรับรอง: ${selectedCert?.certificateNumber}`);
    handleCertMenuClose();
  };

  const handleRevokeCertificate = () => {
    if (confirm(`ยืนยันยกเลิกใบรับรอง ${selectedCert?.certificateNumber}?`)) {
      alert('ยกเลิกใบรับรองสำเร็จ');
      handleCertMenuClose();
    }
  };

  // User handlers
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      setSelectedUser(user);
    } else {
      setUserForm({
        name: '',
        email: '',
        role: 'FARMER',
        status: 'active',
      });
      setSelectedUser(null);
    }
    setUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setUserForm({
      name: '',
      email: '',
      role: 'FARMER',
      status: 'active',
    });
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Edit existing user
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...userForm } : u)));
      alert('แก้ไขผู้ใช้สำเร็จ');
    } else {
      // Add new user
      const newUser = {
        id: String(Date.now()),
        ...userForm,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      alert('เพิ่มผู้ใช้สำเร็จ');
    }
    handleCloseUserDialog();
  };

  const handleDeleteUser = () => {
    if (confirm(`ยืนยันลบผู้ใช้ ${selectedUser?.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser?.id));
      alert('ลบผู้ใช้สำเร็จ');
      handleUserMenuClose();
    }
  };

  // Filter certificates
  const filteredCertificates = issuedCertificates.filter(
    (cert) =>
      cert.certificateNumber.toLowerCase().includes(certSearch.toLowerCase()) ||
      cert.farmName?.toLowerCase().includes(certSearch.toLowerCase()) ||
      cert.farmerName?.toLowerCase().includes(certSearch.toLowerCase())
  );

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'FARMER':
        return 'เกษตรกร';
      case 'DTAM_OFFICER':
        return 'เจ้าหน้าที่ตรวจเอกสาร';
      case 'INSPECTOR':
        return 'เจ้าหน้าที่ตรวจฟาร์ม';
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FARMER':
        return 'default';
      case 'DTAM_OFFICER':
        return 'primary';
      case 'INSPECTOR':
        return 'secondary';
      case 'ADMIN':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          📚 Certificate & User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          จัดการใบรับรอง GACP และผู้ใช้งานในระบบ
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<CertificateIcon />} label="ใบรับรอง" iconPosition="start" />
            <Tab icon={<PeopleIcon />} label="ผู้ใช้งาน" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panel 1: Certificates */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {/* Search */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="ค้นหาใบรับรอง (เลขที่, ชื่อฟาร์ม, ชื่อเกษตรกร)"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>

            {/* Statistics */}
            <Alert severity="info" sx={{ mb: 3 }}>
              ใบรับรองที่ออกแล้ว: <strong>{issuedCertificates.length}</strong> ใบ | ใบรับรองใช้งาน:{' '}
              <strong>{issuedCertificates.filter((c) => c.status === 'active').length}</strong> ใบ
            </Alert>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>เลขที่ใบรับรอง</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ใบสมัคร</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ชื่อฟาร์ม</strong>
                    </TableCell>
                    <TableCell>
                      <strong>เกษตรกร</strong>
                    </TableCell>
                    <TableCell>
                      <strong>คะแนน</strong>
                    </TableCell>
                    <TableCell>
                      <strong>วันที่ออก</strong>
                    </TableCell>
                    <TableCell>
                      <strong>หมดอายุ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>สถานะ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>จัดการ</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCertificates
                    .slice(certPage * certRowsPerPage, certPage * certRowsPerPage + certRowsPerPage)
                    .map((cert) => (
                      <TableRow key={cert.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {cert.certificateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{cert.applicationNumber}</TableCell>
                        <TableCell>{cert.farmName}</TableCell>
                        <TableCell>{cert.farmerName}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${cert.score}/100`}
                            color={cert.score >= 90 ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(cert.issueDate).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cert.status === 'active' ? 'ใช้งาน' : 'ยกเลิก'}
                            color={cert.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={(e) => handleCertMenuOpen(e, cert)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredCertificates.length}
              page={certPage}
              onPageChange={(_, newPage) => setCertPage(newPage)}
              rowsPerPage={certRowsPerPage}
              onRowsPerPageChange={(e) => {
                setCertRowsPerPage(parseInt(e.target.value, 10));
                setCertPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="แสดงต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
            />
          </Box>
        </TabPanel>

        {/* Tab Panel 2: Users */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {/* Search & Add Button */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, บทบาท)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenUserDialog()}
                sx={{ minWidth: 150 }}
              >
                เพิ่มผู้ใช้
              </Button>
            </Box>

            {/* Statistics */}
            <Alert severity="info" sx={{ mb: 3 }}>
              ผู้ใช้ทั้งหมด: <strong>{users.length}</strong> คน | เกษตรกร:{' '}
              <strong>{users.filter((u) => u.role === 'FARMER').length}</strong> | เจ้าหน้าที่:{' '}
              <strong>{users.filter((u) => u.role !== 'FARMER').length}</strong>
            </Alert>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>ชื่อ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>อีเมล</strong>
                    </TableCell>
                    <TableCell>
                      <strong>บทบาท</strong>
                    </TableCell>
                    <TableCell>
                      <strong>สถานะ</strong>
                    </TableCell>
                    <TableCell>
                      <strong>วันที่สร้าง</strong>
                    </TableCell>
                    <TableCell>
                      <strong>จัดการ</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status === 'active' ? 'ใช้งาน' : 'ระงับ'}
                            color={user.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={(e) => handleUserMenuOpen(e, user)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={userPage}
              onPageChange={(_, newPage) => setUserPage(newPage)}
              rowsPerPage={userRowsPerPage}
              onRowsPerPageChange={(e) => {
                setUserRowsPerPage(parseInt(e.target.value, 10));
                setUserPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="แสดงต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Certificate Menu */}
      <Menu anchorEl={certMenuAnchor} open={Boolean(certMenuAnchor)} onClose={handleCertMenuClose}>
        <MenuItem onClick={handleViewCertificate}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          ดูใบรับรอง
        </MenuItem>
        <MenuItem onClick={handleDownloadCertificate}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          ดาวน์โหลด
        </MenuItem>
        <MenuItem onClick={handleRevokeCertificate} sx={{ color: 'error.main' }}>
          <BlockIcon sx={{ mr: 1 }} fontSize="small" />
          ยกเลิกใบรับรอง
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenUserDialog(selectedUser);
            handleUserMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          ลบ
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog open={userDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="ชื่อ"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>บทบาท</InputLabel>
              <Select
                value={userForm.role}
                label="บทบาท"
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <MenuItem value="FARMER">เกษตรกร</MenuItem>
                <MenuItem value="DTAM_OFFICER">เจ้าหน้าที่ตรวจเอกสาร</MenuItem>
                <MenuItem value="INSPECTOR">เจ้าหน้าที่ตรวจฟาร์ม</MenuItem>
                <MenuItem value="ADMIN">ผู้ดูแลระบบ</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={userForm.status}
                label="สถานะ"
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
              >
                <MenuItem value="active">ใช้งาน</MenuItem>
                <MenuItem value="inactive">ระงับ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={!userForm.name || !userForm.email}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(AdminManagementPage, ['ADMIN']);
