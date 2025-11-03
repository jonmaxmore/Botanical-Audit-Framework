'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useApplication } from '@/contexts/ApplicationContext';

/**
 * DTAM Officer Applications List
 *
 * หน้ารายการใบสมัครสำหรับ DTAM_OFFICER
 * - แสดงใบสมัครทั้งหมดที่รอตรวจ
 * - Filter by status
 * - Search by application number or farmer name
 * - Sort by submission date
 * - Priority indicators
 */

interface TableApplication {
  id: string;
  applicationNumber: string;
  farmerName: string;
  farmName: string;
  submittedDate: string;
  workflowState: string;
  priority: 'high' | 'medium' | 'low';
  daysWaiting: number;
}

type FilterStatus = 'all' | 'PAYMENT_PROCESSING_1' | 'DOCUMENT_REVIEW' | 'DOCUMENT_REVISION';

const OfficerApplicationsPage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplication();

  const [loading, setLoading] = useState(true);
  const [filteredApplications, setFilteredApplications] = useState<TableApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, searchQuery, filterStatus]);

  const loadApplications = () => {
    try {
      // กรองใบสมัครที่เกี่ยวข้องกับ DTAM_OFFICER
      let filtered = applications.filter(
        (app) =>
          app.currentState === 'PAYMENT_PROCESSING_1' ||
          app.currentState === 'DOCUMENT_REVIEW' ||
          app.currentState === 'DOCUMENT_REVISION' ||
          app.currentState === 'DOCUMENT_APPROVED' ||
          app.currentState === 'DOCUMENT_REJECTED'
      );

      // Filter by status
      if (filterStatus !== 'all') {
        filtered = filtered.filter((app) => app.currentState === filterStatus);
      }

      // Search by application number or farmer name
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (app) =>
            app.applicationNumber.toLowerCase().includes(query) ||
            app.farmerName.toLowerCase().includes(query) ||
            app.farmerName.toLowerCase().includes(query)
        );
      }

      // Map to table format
      const tableData = filtered.map((app) => {
        const submittedDate = new Date(app.submittedAt || Date.now());
        const daysWaiting = Math.floor(
          (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let priority: 'high' | 'medium' | 'low' = 'low';
        if (daysWaiting > 5) priority = 'high';
        else if (daysWaiting > 2) priority = 'medium';

        return {
          id: app.id,
          applicationNumber: app.applicationNumber,
          farmerName: app.farmerName || 'ไม่ระบุ',
          farmName: app.farmerName || 'ไม่ระบุ',
          submittedDate: submittedDate.toLocaleDateString('th-TH'),
          workflowState: app.currentState,
          priority,
          daysWaiting,
        };
      });

      // Sort by days waiting (descending)
      tableData.sort((a, b) => b.daysWaiting - a.daysWaiting);

      setFilteredApplications(tableData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewApplication = (id: string) => {
    router.push(`/officer/applications/${id}/review`);
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'PAYMENT_PROCESSING_1':
        return 'รอชำระเงิน';
      case 'DOCUMENT_REVIEW':
        return 'รอตรวจเอกสาร';
      case 'DOCUMENT_REVISION':
        return 'รอแก้ไข';
      case 'DOCUMENT_APPROVED':
        return 'อนุมัติแล้ว';
      case 'DOCUMENT_REJECTED':
        return 'ปฏิเสธแล้ว';
      default:
        return state;
    }
  };

  const getStateColor = (
    state: string
  ): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
    switch (state) {
      case 'PAYMENT_PROCESSING_1':
        return 'default';
      case 'DOCUMENT_REVIEW':
        return 'primary';
      case 'DOCUMENT_REVISION':
        return 'warning';
      case 'DOCUMENT_APPROVED':
        return 'success';
      case 'DOCUMENT_REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'ด่วนมาก';
      case 'medium':
        return 'ปานกลาง';
      case 'low':
        return 'ปกติ';
    }
  };

  // Get pending count
  const pendingCount = filteredApplications.filter(
    (app) => app.currentState === 'DOCUMENT_REVIEW' || app.currentState === 'DOCUMENT_REVISION'
  ).length;

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          📄 รายการใบสมัครทั้งหมด
        </Typography>
        <Typography variant="body1" color="text.secondary">
          จัดการและตรวจสอบใบสมัครรับรอง GACP - มีใบสมัครรอตรวจ {pendingCount} รายการ
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Filters and Search */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Search */}
          <TextField
            placeholder="ค้นหาเลขใบสมัคร, ชื่อเกษตรกร, ชื่อฟาร์ม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter by Status */}
          <TextField
            select
            label="สถานะ"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="PAYMENT_PROCESSING_1">รอชำระเงิน</MenuItem>
            <MenuItem value="DOCUMENT_REVIEW">รอตรวจเอกสาร</MenuItem>
            <MenuItem value="DOCUMENT_REVISION">รอแก้ไข</MenuItem>
          </TextField>
        </Box>

        {/* Info Alert */}
        {pendingCount > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            มีใบสมัครรอตรวจสอบ <strong>{pendingCount} รายการ</strong> - กรุณาดำเนินการให้เสร็จภายใน
            3-5 วันทำการ
          </Alert>
        )}

        {/* Table */}
        {filteredApplications.length === 0 ? (
          <Alert severity="info" icon={<DescriptionIcon />}>
            ไม่พบใบสมัครตามเงื่อนไขที่เลือก
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>
                      <strong>เลขใบสมัคร</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ชื่อฟาร์ม</strong>
                    </TableCell>
                    <TableCell>
                      <strong>เกษตรกร</strong>
                    </TableCell>
                    <TableCell>
                      <strong>วันที่ยื่น</strong>
                    </TableCell>
                    <TableCell>
                      <strong>รอมาแล้ว</strong>
                    </TableCell>
                    <TableCell>
                      <strong>ความเร่งด่วน</strong>
                    </TableCell>
                    <TableCell>
                      <strong>สถานะ</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>การกระทำ</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => (
                      <TableRow
                        key={app.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' },
                          ...(app.priority === 'high' && { bgcolor: 'error.lighter' }),
                        }}
                        onClick={() => handleViewApplication(app.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {app.applicationNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.farmName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.farmerName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.submittedAt}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {app.daysWaiting} วัน
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPriorityLabel(app.priority)}
                            color={getPriorityColor(app.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStateLabel(app.currentState)}
                            color={getStateColor(app.currentState)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="ดูรายละเอียดและตรวจสอบ">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewApplication(app.id);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
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
              labelRowsPerPage="แสดงต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          📌 คำอธิบายความเร่งด่วน:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="ด่วนมาก (รอ > 5 วัน)" color="error" size="small" />
          <Chip label="ปานกลาง (รอ 3-5 วัน)" color="warning" size="small" />
          <Chip label="ปกติ (รอ < 3 วัน)" color="success" size="small" />
        </Box>
      </Paper>
    </Container>
  );
};

export default OfficerApplicationsPage;
