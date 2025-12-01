'use client';

import React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  PriorityHigh as HighPriorityIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface Application {
  id: string;
  applicationNumber: string;
  farmerName: string;
  farmName: string;
  province: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'revision';
  priority: 'high' | 'medium' | 'low';
  submittedDate: string;
  dueDate: string;
  assignedTo?: string;
  reviewProgress: number;
  documentCount: number;
}

interface ReviewQueueProps {
  applications: Application[];
  onViewApplication: (id: string) => void;
}

export default function ReviewQueue({ applications, onViewApplication }: ReviewQueueProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('dueDate');

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'รอตรวจสอบ',
      in_review: 'กำลังตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
      revision: 'ต้องแก้ไข',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      in_review: 'info',
      approved: 'success',
      rejected: 'error',
      revision: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: 'สูง',
      medium: 'ปานกลาง',
      low: 'ต่ำ',
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'error' | 'warning' | 'success'> = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInMs = due.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const getDueDateDisplay = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);

    if (daysUntilDue < 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
          <ErrorIcon fontSize="small" />
          <Typography variant="body2" color="error">
            เกินกำหนด {Math.abs(daysUntilDue)} วัน
          </Typography>
        </Box>
      );
    } else if (daysUntilDue === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
          <ScheduleIcon fontSize="small" />
          <Typography variant="body2" color="warning.main">
            ครบกำหนดวันนี้
          </Typography>
        </Box>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
          <ScheduleIcon fontSize="small" />
          <Typography variant="body2" color="warning.main">
            อีก {daysUntilDue} วัน
          </Typography>
        </Box>
      );
    } else {
      return (
        <Typography variant="body2" color="text.secondary">
          อีก {daysUntilDue} วัน
        </Typography>
      );
    }
  };

  // Filter and sort applications
  const filteredApplications = React.useMemo(() => {
    const filtered = applications.filter(app => {
      const matchesSearch =
        search === '' ||
        app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
        app.farmerName.toLowerCase().includes(search.toLowerCase()) ||
        app.farmName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'submittedDate':
          return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, search, statusFilter, priorityFilter, sortBy]);

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="ค้นหาเลขที่คำขอ, ชื่อเกษตรกร, หรือชื่อแปลง..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />} sx={{ minWidth: 120 }}>
              ตัวกรอง
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={statusFilter}
                label="สถานะ"
                onChange={e => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="pending">รอตรวจสอบ</MenuItem>
                <MenuItem value="in_review">กำลังตรวจสอบ</MenuItem>
                <MenuItem value="revision">ต้องแก้ไข</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>ความสำคัญ</InputLabel>
              <Select
                value={priorityFilter}
                label="ความสำคัญ"
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="high">สูง</MenuItem>
                <MenuItem value="medium">ปานกลาง</MenuItem>
                <MenuItem value="low">ต่ำ</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>เรียงตาม</InputLabel>
              <Select value={sortBy} label="เรียงตาม" onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="dueDate">กำหนดส่ง</MenuItem>
                <MenuItem value="priority">ความสำคัญ</MenuItem>
                <MenuItem value="submittedDate">วันที่ส่งคำขอ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          แสดง {filteredApplications.length} จาก {applications.length} คำขอ
        </Typography>
        <Typography variant="body2" color="primary.main" fontWeight={500}>
          {applications.filter(a => a.status === 'pending').length} รอตรวจสอบ
        </Typography>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ความสำคัญ</TableCell>
                <TableCell>เลขที่คำขอ</TableCell>
                <TableCell>เกษตรกร</TableCell>
                <TableCell>ชื่อแปลง</TableCell>
                <TableCell>จังหวัด</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>ความคืบหน้า</TableCell>
                <TableCell>กำหนดส่ง</TableCell>
                <TableCell>ผู้รับผิดชอบ</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      ไม่พบคำขอรับรอง
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map(app => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Tooltip title={getPriorityLabel(app.priority)}>
                        <Chip
                          size="small"
                          icon={app.priority === 'high' ? <HighPriorityIcon /> : undefined}
                          label={getPriorityLabel(app.priority)}
                          color={getPriorityColor(app.priority)}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {app.applicationNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(app.submittedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.farmerName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.farmName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {app.province}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(app.status)}
                        color={getStatusColor(app.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${app.reviewProgress}%`,
                              height: '100%',
                              bgcolor: app.reviewProgress === 100 ? 'success.main' : 'primary.main',
                              transition: 'width 0.3s',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {app.reviewProgress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getDueDateDisplay(app.dueDate)}</TableCell>
                    <TableCell>
                      {app.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {app.assignedTo.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" noWrap>
                            {app.assignedTo}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onViewApplication(app.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
