'use client';

import React from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Search as SearchIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Block as SuspendedIcon,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'manager' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

interface UsersTableProps {
  users: User[];
  onView: (userId: string) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function UsersTable({ users, onView, onEdit, onDelete }: UsersTableProps) {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [anchorEl, setAnchorEl] = React.useState<{ [key: string]: HTMLElement | null }>({});

  const handleMenuOpen = (userId: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [userId]: event.currentTarget });
  };

  const handleMenuClose = (userId: string) => {
    setAnchorEl({ ...anchorEl, [userId]: null });
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
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
      suspended: 'ระงับ',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon fontSize="small" />;
      case 'inactive':
        return <InactiveIcon fontSize="small" />;
      case 'suspended':
        return <SuspendedIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'เมื่อสักครู่';
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else if (diffInDays < 7) {
      return `${diffInDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="ค้นหาผู้ใช้งาน..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>บทบาท</InputLabel>
          <Select value={roleFilter} label="บทบาท" onChange={e => setRoleFilter(e.target.value)}>
            <SelectMenuItem value="all">ทั้งหมด</SelectMenuItem>
            <SelectMenuItem value="admin">ผู้ดูแลระบบ</SelectMenuItem>
            <SelectMenuItem value="reviewer">ผู้ตรวจสอบ</SelectMenuItem>
            <SelectMenuItem value="manager">ผู้จัดการ</SelectMenuItem>
            <SelectMenuItem value="viewer">ผู้ดูข้อมูล</SelectMenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>สถานะ</InputLabel>
          <Select
            value={statusFilter}
            label="สถานะ"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <SelectMenuItem value="all">ทั้งหมด</SelectMenuItem>
            <SelectMenuItem value="active">ใช้งาน</SelectMenuItem>
            <SelectMenuItem value="inactive">ไม่ใช้งาน</SelectMenuItem>
            <SelectMenuItem value="suspended">ระงับ</SelectMenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          แสดง {filteredUsers.length} จาก {users.length} ผู้ใช้งาน
        </Typography>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ผู้ใช้</TableCell>
                <TableCell>อีเมล</TableCell>
                <TableCell>บทบาท</TableCell>
                <TableCell>แผนก</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>เข้าสู่ระบบล่าสุด</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      ไม่พบข้อมูลผู้ใช้งาน
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar}
                          sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.department}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(user.status) || undefined}
                        label={getStatusLabel(user.status)}
                        color={getStatusColor(user.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatRelativeTime(user.lastLogin)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={e => handleMenuOpen(user.id, e)}>
                        <MoreIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[user.id]}
                        open={Boolean(anchorEl[user.id])}
                        onClose={() => handleMenuClose(user.id)}
                      >
                        <MenuItem
                          onClick={() => {
                            onView(user.id);
                            handleMenuClose(user.id);
                          }}
                        >
                          ดูรายละเอียด
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onEdit(user.id);
                            handleMenuClose(user.id);
                          }}
                        >
                          แก้ไข
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onDelete(user.id);
                            handleMenuClose(user.id);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          ลบ
                        </MenuItem>
                      </Menu>
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
