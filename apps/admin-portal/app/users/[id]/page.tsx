'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Block as SuspendIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import ProtectedRoute from '@/lib/protected-route';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'manager' | 'viewer';
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
  lastLogin: string;
  location: string;
  permissions: string[];
  statistics: {
    applicationsReviewed: number;
    commentsPosted: number;
    documentsUploaded: number;
    averageResponseTime: string;
  };
}

interface Activity {
  id: string;
  type: 'login' | 'review' | 'comment' | 'upload' | 'edit' | 'approval';
  description: string;
  timestamp: string;
  metadata?: {
    applicationId?: string;
    documentName?: string;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      // Mock user data
      setUser({
        id: params.id as string,
        name: 'นายสมชาย ผู้ตรวจสอบ',
        email: 'somchai.reviewer@gacp.go.th',
        phone: '081-234-5678',
        avatar: '',
        role: 'reviewer',
        department: 'แผนกตรวจสอบมาตรฐาน',
        position: 'ผู้ตรวจสอบอาวุโส',
        status: 'active',
        joinedDate: '2024-01-15',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: 'กรุงเทพมหานคร',
        permissions: [
          'view_applications',
          'review_applications',
          'comment_applications',
          'upload_documents',
          'generate_reports',
        ],
        statistics: {
          applicationsReviewed: 145,
          commentsPosted: 328,
          documentsUploaded: 89,
          averageResponseTime: '2.5 ชั่วโมง',
        },
      });

      // Mock activities
      setActivities([
        {
          id: '1',
          type: 'review',
          description: 'ตรวจสอบคำขอ #APP-2345',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: { applicationId: 'APP-2345' },
        },
        {
          id: '2',
          type: 'comment',
          description: 'แสดงความคิดเห็นในคำขอ #APP-2344',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          metadata: { applicationId: 'APP-2344' },
        },
        {
          id: '3',
          type: 'upload',
          description: 'อัพโหลดเอกสาร "รายงานการตรวจสอบ.pdf"',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          metadata: { documentName: 'รายงานการตรวจสอบ.pdf' },
        },
        {
          id: '4',
          type: 'login',
          description: 'เข้าสู่ระบบ',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          type: 'approval',
          description: 'อนุมัติคำขอ #APP-2340',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          metadata: { applicationId: 'APP-2340' },
        },
      ]);

      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [params.id]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBack = () => {
    router.push('/users');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    router.push(`/users/${params.id}/edit`);
  };

  const handleSuspend = () => {
    handleMenuClose();
    setSuspendDialogOpen(true);
  };

  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleSuspendConfirm = () => {
    // TODO: API call to suspend user
    console.log('Suspending user:', params.id);
    setSuspendDialogOpen(false);
    alert('ระงับการใช้งานผู้ใช้เรียบร้อย');
  };

  const handleDeleteConfirm = () => {
    // TODO: API call to delete user
    console.log('Deleting user:', params.id);
    setDeleteDialogOpen(false);
    router.push('/users');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'ผู้ดูแลระบบ',
      reviewer: 'ผู้ตรวจสอบ',
      manager: 'ผู้จัดการ',
      viewer: 'ผู้ดูข้อมูล',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
      admin: 'error',
      reviewer: 'warning',
      manager: 'info',
      viewer: 'success',
    };
    return colors[role] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'ใช้งานอยู่',
      inactive: 'ไม่ได้ใช้งาน',
      suspended: 'ถูกระงับ',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'default' | 'error'> = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
    };
    return colors[status] || 'default';
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      login: '🔐',
      review: '📋',
      comment: '💬',
      upload: '📤',
      edit: '✏️',
      approval: '✅',
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <AdminHeader onMenuClick={handleSidebarToggle} title="รายละเอียดผู้ใช้" />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
              <Container maxWidth="lg">
                <Typography>กำลังโหลด...</Typography>
              </Container>
            </Box>
          </Box>
        </Box>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <AdminHeader onMenuClick={handleSidebarToggle} title="รายละเอียดผู้ใช้" />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
              <Container maxWidth="lg">
                <Alert severity="error">ไม่พบข้อมูลผู้ใช้</Alert>
              </Container>
            </Box>
          </Box>
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AdminHeader onMenuClick={handleSidebarToggle} title="รายละเอียดผู้ใช้" />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, bgcolor: 'grey.50' }}>
            <Container maxWidth="lg">
              {/* Header with Back Button */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<BackIcon />} onClick={handleBack} variant="outlined">
                  กลับ
                </Button>
                <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
                  ข้อมูลผู้ใช้งาน
                </Typography>
                <IconButton onClick={handleMenuOpen}>
                  <MoreIcon />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                {/* User Profile Card */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          mb: 3,
                        }}
                      >
                        <Avatar
                          src={user.avatar}
                          sx={{
                            width: 120,
                            height: 120,
                            mb: 2,
                            bgcolor: 'primary.main',
                            fontSize: '3rem',
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} textAlign="center">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {user.position}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                          <Chip
                            label={getStatusLabel(user.status)}
                            color={getStatusColor(user.status)}
                            size="small"
                            icon={user.status === 'active' ? <CheckIcon /> : <CancelIcon />}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Contact Information */}
                      <List dense>
                        <ListItem>
                          <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary="อีเมล"
                            secondary={user.email}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary="เบอร์โทรศัพท์"
                            secondary={user.phone}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary="สถานที่"
                            secondary={user.location}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary="วันที่เข้าร่วม"
                            secondary={formatDate(user.joinedDate)}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <HistoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary="เข้าสู่ระบบล่าสุด"
                            secondary={formatRelativeTime(user.lastLogin)}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      </List>

                      <Divider sx={{ my: 2 }} />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEdit}
                          fullWidth
                        >
                          แก้ไขข้อมูล
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<SuspendIcon />}
                          onClick={handleSuspend}
                          fullWidth
                        >
                          ระงับการใช้งาน
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDelete}
                          fullWidth
                        >
                          ลบผู้ใช้
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Details Section */}
                <Grid item xs={12} md={8}>
                  {/* Department & Statistics */}
                  <Card sx={{ boxShadow: 2, mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        ข้อมูลแผนก & สถิติ
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            แผนก
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {user.department}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          สถิติการทำงาน
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6} sm={3}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h4" color="primary" fontWeight={600}>
                                  {user.statistics.applicationsReviewed}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  คำขอที่ตรวจสอบ
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h4" color="secondary" fontWeight={600}>
                                  {user.statistics.commentsPosted}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ความคิดเห็น
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h4" color="success.main" fontWeight={600}>
                                  {user.statistics.documentsUploaded}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  เอกสารอัพโหลด
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="body1" color="info.main" fontWeight={600}>
                                  {user.statistics.averageResponseTime}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  เวลาตอบกลับเฉลี่ย
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Permissions Card */}
                  <Card sx={{ boxShadow: 2, mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SecurityIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          สิทธิ์การใช้งาน
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.permissions.map(permission => (
                          <Chip
                            key={permission}
                            label={permission.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Activity Timeline Card */}
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          กิจกรรมล่าสุด
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <List>
                        {activities.map((activity, index) => (
                          <React.Fragment key={activity.id}>
                            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                              <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                                {getActivityIcon(activity.type)}
                              </Box>
                              <ListItemText
                                primary={activity.description}
                                secondary={formatRelativeTime(activity.timestamp)}
                                primaryTypographyProps={{ fontWeight: 500 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                            {index < activities.length - 1 && (
                              <Divider variant="inset" component="li" />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Box>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          แก้ไขข้อมูล
        </MenuItem>
        <MenuItem onClick={handleSuspend}>
          <SuspendIcon sx={{ mr: 1 }} fontSize="small" />
          ระงับการใช้งาน
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          ลบผู้ใช้
        </MenuItem>
      </Menu>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)}>
        <DialogTitle>ยืนยันการระงับการใช้งาน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ที่จะระงับการใช้งานของ <strong>{user.name}</strong>?
            ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleSuspendConfirm} color="warning" variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ที่จะลบ <strong>{user.name}</strong>? การดำเนินการนี้ไม่สามารถยกเลิกได้
            และข้อมูลทั้งหมดของผู้ใช้จะถูกลบออกจากระบบ
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            ลบผู้ใช้
          </Button>
        </DialogActions>
      </Dialog>
    </ProtectedRoute>
  );
}
