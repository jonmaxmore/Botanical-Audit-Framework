'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MailOutline as EmailIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    isRead: 'all',
    type: 'all',
    priority: 'all',
    startDate: '',
    endDate: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Selection
  const [selected, setSelected] = useState<string[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt'
      });

      if (filters.isRead !== 'all') {
        params.append('isRead', filters.isRead);
      }
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / limit));
      } else {
        setError('ไม่สามารถโหลดการแจ้งเตือนได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [page, filters, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          total: notifications.length,
          unread: data.data.count || 0,
          byType: {},
          byPriority: {}
        });
      }
    } catch (err) {
      // Stats fetch failed silently
    }
  }, [notifications.length]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        setSuccess('ทำเครื่องหมายเป็นอ่านแล้ว');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setStats(prev => ({ ...prev, unread: 0 }));
        setSuccess('ทำเครื่องหมายทั้งหมดเป็นอ่านแล้ว');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setSuccess('ลบการแจ้งเตือนแล้ว');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถลบได้');
    }
  };

  const handleBatchDelete = async () => {
    if (selected.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/batch`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationIds: selected })
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => !selected.includes(n._id)));
        setSelected([]);
        setSuccess(`ลบ ${selected.length} การแจ้งเตือนแล้ว`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถลบได้');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(notifications.map(n => n._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      isRead: 'all',
      type: 'all',
      priority: 'all',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: 'เร่งด่วนมาก',
      high: 'สำคัญ',
      medium: 'ปานกลาง',
      low: 'ทั่วไป'
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      application_submitted: 'ส่งคำขอแล้ว',
      certificate_issued: 'ออกใบรับรอง',
      inspection_scheduled: 'นัดหมายตรวจประเมิน',
      document_approved: 'อนุมัติเอกสาร',
      document_rejected: 'ปฏิเสธเอกสาร',
      payment_required: 'ต้องชำระเงิน',
      system_announcement: 'ประกาศระบบ'
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            การแจ้งเตือน
          </Typography>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => router.push('/notifications/preferences')}
          >
            ตั้งค่า
          </Button>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  ทั้งหมด
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  ยังไม่ได้อ่าน
                </Typography>
                <Typography variant="h4" fontWeight={700} color="error">
                  {stats.unread}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  อ่านแล้ว
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.total - stats.unread}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <FilterIcon />
            <Typography variant="h6">ตัวกรอง</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={filters.isRead}
                  label="สถานะ"
                  onChange={e => handleFilterChange('isRead', e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="false">ยังไม่ได้อ่าน</MenuItem>
                  <MenuItem value="true">อ่านแล้ว</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ความสำคัญ</InputLabel>
                <Select
                  value={filters.priority}
                  label="ความสำคัญ"
                  onChange={e => handleFilterChange('priority', e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="urgent">เร่งด่วนมาก</MenuItem>
                  <MenuItem value="high">สำคัญ</MenuItem>
                  <MenuItem value="medium">ปานกลาง</MenuItem>
                  <MenuItem value="low">ทั่วไป</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="วันที่เริ่มต้น"
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="วันที่สิ้นสุด"
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} mt={2}>
            <Button size="small" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
            <Button size="small" startIcon={<RefreshIcon />} onClick={fetchNotifications}>
              รีเฟรช
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>
                เลือกแล้ว <strong>{selected.length}</strong> รายการ
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    selected.forEach(id => handleMarkAsRead(id));
                    setSelected([]);
                  }}
                >
                  ทำเครื่องหมายว่าอ่านแล้ว
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBatchDelete}
                >
                  ลบ
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selected.length === notifications.length && notifications.length > 0}
              indeterminate={selected.length > 0 && selected.length < notifications.length}
              onChange={handleSelectAll}
            />
          }
          label="เลือกทั้งหมด"
        />
        <Button size="small" startIcon={<EmailIcon />} onClick={handleMarkAllAsRead}>
          ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
        </Button>
      </Stack>

      {/* Notifications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              ไม่มีการแจ้งเตือน
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {notifications.map(notification => (
            <Card
              key={notification._id}
              sx={{
                bgcolor: notification.isRead ? 'background.paper' : 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Checkbox
                    checked={selected.includes(notification._id)}
                    onChange={() => handleSelect(notification._id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Typography variant="h6" fontWeight={notification.isRead ? 400 : 600}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={getPriorityLabel(notification.priority)}
                        size="small"
                        color={getPriorityColor(notification.priority)}
                      />
                      {!notification.isRead && <Chip label="ใหม่" size="small" color="error" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {notification.message}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" color="text.disabled">
                        {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', {
                          locale: th
                        })}
                      </Typography>
                      <Chip
                        label={getTypeLabel(notification.type)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    {notification.actionUrl && (
                      <Button
                        size="small"
                        onClick={() => router.push(notification.actionUrl!)}
                        sx={{ mt: 1 }}
                      >
                        {notification.actionLabel || 'ดูรายละเอียด'}
                      </Button>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {!notification.isRead && (
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        title="ทำเครื่องหมายว่าอ่านแล้ว"
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      title="ลบ"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
