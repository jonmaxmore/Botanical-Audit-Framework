'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  Badge,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Inspection {
  _id: string;
  inspectionNumber: string;
  inspectionType: string;
  scheduledDate: string;
  status: string;
  application: {
    applicationNumber: string;
    basicInfo: {
      farmName: string;
      ownerName: string;
    };
  };
  inspector: {
    fullName: string;
    email: string;
  };
  siteInfo: {
    farmName: string;
    address: string;
  };
  scoring?: {
    totalScore: number;
    grade: string;
    passed: boolean;
  };
  photoCount?: number;
  checklistCompletion?: number;
  isOverdue?: boolean;
  daysUntilInspection?: number;
}

interface Statistics {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  averageScore: number;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  scheduled: 'primary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'default'
};

const statusLabels: Record<string, string> = {
  scheduled: 'กำหนดการ',
  in_progress: 'กำลังตรวจ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  rescheduled: 'เลื่อนนัด'
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    inspectionType: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.inspectionType) queryParams.append('inspectionType', filters.inspectionType);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);

      const response = await fetch(`/api/inspections?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch inspections');

      const data = await response.json();
      setInspections(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInspections();
    fetchStatistics();
  }, [fetchInspections]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/inspections/statistics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStatistics(data.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Update filter based on tab
    switch (newValue) {
      case 0: // All
        setFilters({ ...filters, status: '' });
        break;
      case 1: // Upcoming
        setFilters({ ...filters, status: 'scheduled' });
        break;
      case 2: // In Progress
        setFilters({ ...filters, status: 'in_progress' });
        break;
      case 3: // Completed
        setFilters({ ...filters, status: 'completed' });
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <AssignmentIcon />;
      case 'scheduled':
        return <ScheduleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <CalendarIcon />;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        inspection.inspectionNumber.toLowerCase().includes(searchLower) ||
        inspection.application.applicationNumber.toLowerCase().includes(searchLower) ||
        inspection.siteInfo.farmName.toLowerCase().includes(searchLower) ||
        inspection.inspector.fullName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          ระบบตรวจประเมินไร่
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchInspections();
              fetchStatistics();
            }}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            สร้างการตรวจใหม่
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  ทั้งหมด
                </Typography>
                <Typography variant="h4">{statistics.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  กำหนดการ
                </Typography>
                <Typography variant="h4" color="primary">
                  {statistics.scheduled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  กำลังดำเนินการ
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.inProgress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  คะแนนเฉลี่ย
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.averageScore.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="ค้นหาเลขที่การตรวจ, ชื่อไร่, ผู้ตรวจ..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDialogOpen(true)}
            >
              ตัวกรอง
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label={
              <Badge badgeContent={statistics?.total || 0} color="default">
                ทั้งหมด
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={statistics?.scheduled || 0} color="primary">
                กำหนดการ
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={statistics?.inProgress || 0} color="warning">
                กำลังตรวจ
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={statistics?.completed || 0} color="success">
                เสร็จสิ้น
              </Badge>
            }
          />
        </Tabs>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Inspections List */
        <List>
          {filteredInspections.length === 0 ? (
            <Card>
              <CardContent>
                <Typography align="center" color="textSecondary">
                  ไม่พบข้อมูลการตรวจ
                </Typography>
              </CardContent>
            </Card>
          ) : (
            filteredInspections.map(inspection => (
              <Card key={inspection._id} sx={{ mb: 2 }}>
                <ListItemButton href={`/inspections/${inspection._id}`}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getStatusIcon(inspection.status)}
                        <Box>
                          <Typography variant="h6">{inspection.inspectionNumber}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {inspection.siteInfo.farmName} ·{' '}
                            {inspection.application.applicationNumber}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={statusLabels[inspection.status]}
                        color={statusColors[inspection.status]}
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ width: '100%' }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          วันที่นัด
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(inspection.scheduledDate), 'dd/MM/yyyy HH:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          ผู้ตรวจ
                        </Typography>
                        <Typography variant="body2">{inspection.inspector.fullName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          ประเภทการตรวจ
                        </Typography>
                        <Typography variant="body2">
                          {inspection.inspectionType === 'initial' && 'ครั้งแรก'}
                          {inspection.inspectionType === 'surveillance' && 'ติดตาม'}
                          {inspection.inspectionType === 'renewal' && 'ต่ออายุ'}
                          {inspection.inspectionType === 'special' && 'พิเศษ'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        {inspection.scoring && (
                          <>
                            <Typography variant="caption" color="textSecondary">
                              คะแนน
                            </Typography>
                            <Typography variant="body2">
                              {inspection.scoring.totalScore.toFixed(1)} ({inspection.scoring.grade}
                              )
                            </Typography>
                          </>
                        )}
                      </Grid>
                    </Grid>

                    {inspection.isOverdue && (
                      <Alert severity="warning" sx={{ mt: 1, width: '100%' }}>
                        เกินกำหนด
                      </Alert>
                    )}
                  </ListItem>
                </ListItemButton>
              </Card>
            ))
          )}
        </List>
      )}

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ตัวกรองการค้นหา</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="สถานะ"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="scheduled">กำหนดการ</MenuItem>
              <MenuItem value="in_progress">กำลังตรวจ</MenuItem>
              <MenuItem value="completed">เสร็จสิ้น</MenuItem>
              <MenuItem value="cancelled">ยกเลิก</MenuItem>
            </TextField>

            <TextField
              select
              label="ประเภทการตรวจ"
              value={filters.inspectionType}
              onChange={e => setFilters({ ...filters, inspectionType: e.target.value })}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="initial">ครั้งแรก</MenuItem>
              <MenuItem value="surveillance">ติดตาม</MenuItem>
              <MenuItem value="renewal">ต่ออายุ</MenuItem>
              <MenuItem value="special">พิเศษ</MenuItem>
            </TextField>

            <TextField
              type="date"
              label="จากวันที่"
              value={filters.fromDate}
              onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="date"
              label="ถึงวันที่"
              value={filters.toDate}
              onChange={e => setFilters({ ...filters, toDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFilters({ status: '', inspectionType: '', fromDate: '', toDate: '', search: '' });
              setFilterDialogOpen(false);
            }}
          >
            ล้างตัวกรอง
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Inspection Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>สร้างการตรวจใหม่</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            การสร้างการตรวจใหม่จะถูกพัฒนาในเฟสถัดไป
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
