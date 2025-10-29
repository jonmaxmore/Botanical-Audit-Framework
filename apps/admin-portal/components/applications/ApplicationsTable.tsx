'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assignment as AssignIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import type { Application } from '../../lib/api/applications';

interface ApplicationsTableProps {
  applications: Application[];
  onViewApplication: (application: Application) => void;
  onAssignReviewer: (application: Application) => void;
  onStartReview: (application: Application) => void;
  onCompleteReview: (application: Application) => void;
  onApprove: (application: Application) => void;
  onReject: (application: Application) => void;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof Application;

const cropTypeLabels: Record<string, string> = {
  cannabis: 'กัญชา',
  turmeric: 'ขมิ้นชัน',
  ginger: 'ขิง',
  black_galingale: 'กระชายดำ',
  plai: 'ไพล',
  kratom: 'กระท่อม',
};

const statusLabels: Record<string, string> = {
  draft: 'แบบร่าง',
  submitted: 'ส่งแล้ว',
  under_review: 'กำลังตรวจสอบ',
  inspection_pending: 'รอตรวจสอบ',
  inspection_in_progress: 'กำลังตรวจสอบ',
  approved: 'อนุมัติ',
  rejected: 'ปฏิเสธ',
  certificate_issued: 'ออกใบรับรองแล้ว',
};

const statusColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  draft: 'default',
  submitted: 'info',
  under_review: 'warning',
  inspection_pending: 'warning',
  inspection_in_progress: 'primary',
  approved: 'success',
  rejected: 'error',
  certificate_issued: 'success',
};

export default function ApplicationsTable({
  applications,
  onViewApplication,
  onAssignReviewer,
  onStartReview,
  onCompleteReview,
  onApprove,
  onReject,
}: ApplicationsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('submittedAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cropTypeFilter, setCropTypeFilter] = useState<string>('all');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      searchTerm === '' ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.farmerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCropType = cropTypeFilter === 'all' || app.cropType === cropTypeFilter;

    return matchesSearch && matchesStatus && matchesCropType;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    // Handle date sorting
    if (orderBy === 'submittedAt' || orderBy === 'updatedAt') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0;
      bValue = bValue ? new Date(bValue as string).getTime() : 0;
    }

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Paginate applications
  const paginatedApplications = sortedApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getActionButtons = (application: Application) => {
    const buttons = [];

    buttons.push(
      <Tooltip key="view" title="ดูรายละเอียด">
        <IconButton size="small" onClick={() => onViewApplication(application)} color="primary">
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );

    if (application.status === 'submitted') {
      buttons.push(
        <Tooltip key="assign" title="มอบหมายผู้ตรวจสอบ">
          <IconButton size="small" onClick={() => onAssignReviewer(application)} color="info">
            <AssignIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    if (application.status === 'submitted' && application.assignedReviewer) {
      buttons.push(
        <Tooltip key="start" title="เริ่มตรวจสอบ">
          <IconButton size="small" onClick={() => onStartReview(application)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    if (application.status === 'under_review') {
      buttons.push(
        <Tooltip key="complete" title="ตรวจสอบเสร็จสิ้น">
          <IconButton size="small" onClick={() => onCompleteReview(application)} color="warning">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    if (
      application.status === 'inspection_in_progress' ||
      application.status === 'inspection_pending'
    ) {
      buttons.push(
        <Tooltip key="approve" title="อนุมัติ">
          <IconButton size="small" onClick={() => onApprove(application)} color="success">
            <ApproveIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="reject" title="ปฏิเสธ">
          <IconButton size="small" onClick={() => onReject(application)} color="error">
            <RejectIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    return buttons;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Filters */}
      <Box sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="ค้นหา (เลขที่คำขอ, ชื่อเกษตรกร)"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>ประเภทพืช</InputLabel>
            <Select
              value={cropTypeFilter}
              label="ประเภทพืช"
              onChange={e => setCropTypeFilter(e.target.value)}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="cannabis">กัญชา</MenuItem>
              <MenuItem value="turmeric">ขมิ้นชัน</MenuItem>
              <MenuItem value="ginger">ขิง</MenuItem>
              <MenuItem value="black_galingale">กระชายดำ</MenuItem>
              <MenuItem value="plai">ไพล</MenuItem>
              <MenuItem value="kratom">กระท่อม</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>สถานะ</InputLabel>
            <Select
              value={statusFilter}
              label="สถานะ"
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="submitted">ส่งแล้ว</MenuItem>
              <MenuItem value="under_review">กำลังตรวจสอบ</MenuItem>
              <MenuItem value="inspection_pending">รอตรวจสอบ</MenuItem>
              <MenuItem value="inspection_in_progress">กำลังตรวจสอบ</MenuItem>
              <MenuItem value="approved">อนุมัติ</MenuItem>
              <MenuItem value="rejected">ปฏิเสธ</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          พบ {filteredApplications.length} รายการจากทั้งหมด {applications.length} รายการ
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'applicationNumber'}
                  direction={orderBy === 'applicationNumber' ? order : 'asc'}
                  onClick={() => handleRequestSort('applicationNumber')}
                >
                  เลขที่คำขอ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'farmerName'}
                  direction={orderBy === 'farmerName' ? order : 'asc'}
                  onClick={() => handleRequestSort('farmerName')}
                >
                  ชื่อเกษตรกร
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'cropType'}
                  direction={orderBy === 'cropType' ? order : 'asc'}
                  onClick={() => handleRequestSort('cropType')}
                >
                  ประเภทพืช
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  สถานะ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'submittedAt'}
                  direction={orderBy === 'submittedAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('submittedAt')}
                >
                  วันที่ส่ง
                </TableSortLabel>
              </TableCell>
              <TableCell>ผู้ตรวจสอบ</TableCell>
              <TableCell align="right">การดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    ไม่พบข้อมูล
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedApplications.map(application => (
                <TableRow key={application.id} hover>
                  <TableCell>{application.applicationNumber}</TableCell>
                  <TableCell>{application.farmerName}</TableCell>
                  <TableCell>
                    <Chip
                      label={cropTypeLabels[application.cropType]}
                      size="small"
                      color={application.cropType === 'cannabis' ? 'success' : 'default'}
                      sx={{
                        fontWeight: application.cropType === 'cannabis' ? 'bold' : 'normal',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[application.status]}
                      size="small"
                      color={statusColors[application.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {application.assignedReviewer ? (
                      <Typography variant="body2">
                        {typeof application.assignedReviewer === 'object' && application.assignedReviewer !== null
                          ? (application.assignedReviewer as any).name || String(application.assignedReviewer)
                          : String(application.assignedReviewer)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        ยังไม่มอบหมาย
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {getActionButtons(application)}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredApplications.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="แถวต่อหน้า:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
      />
    </Paper>
  );
}
