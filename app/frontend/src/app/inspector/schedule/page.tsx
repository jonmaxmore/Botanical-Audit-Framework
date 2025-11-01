'use client';

import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import {
  useApplicationContext,
  type Application,
  type WorkflowState,
} from '@/contexts/ApplicationContext';

type InspectionType = 'VDO_CALL' | 'ON_SITE';
type InspectionStatus = 'pending' | 'accepted' | 'scheduled';

interface Inspection {
  id: string;
  applicationId: string;
  applicationNumber: string;
  farmerName: string;
  farmName: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate: string;
  scheduledTime: string;
  address?: string;
}

const INSPECTION_STATES: WorkflowState[] = [
  'INSPECTION_SCHEDULED',
  'INSPECTION_VDO_CALL',
  'INSPECTION_ON_SITE',
];

const matchesInspectionStage = (application: Application): boolean => {
  const state: WorkflowState | undefined = application.workflowState ?? application.currentState;
  return state ? INSPECTION_STATES.includes(state) : false;
};

const InspectorSchedulePage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplicationContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filterType, setFilterType] = useState<'all' | InspectionType>('all');
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    inspection: Inspection | null;
  }>({ open: false, inspection: null });
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  useEffect(() => {
    loadSchedule();
  }, [applications, filterType]);

  const loadSchedule = (): void => {
    try {
      const inspectionApplications = applications.filter(matchesInspectionStage);

      const mockInspections: Inspection[] = inspectionApplications.map(
        (app: Application, index: number) => {
          const today = new Date();
          const scheduledDate = new Date(today);
          scheduledDate.setDate(today.getDate() + index);

          return {
            id: `INS-${app.id}`,
            applicationId: app.id,
            applicationNumber: app.applicationNumber,
            farmerName: app.farmerInfo?.name || app.farmerName || 'ไม่ระบุ',
            farmName: app.farmInfo?.name || app.farmName || 'ไม่ระบุ',
            type: index % 3 === 0 ? 'VDO_CALL' : 'ON_SITE',
            status: index % 2 === 0 ? 'accepted' : 'pending',
            scheduledDate: scheduledDate.toISOString().split('T')[0],
            scheduledTime: `${9 + (index % 6)}:00`,
            address: app.farmInfo?.address,
          };
        }
      );

      let filtered = mockInspections;
      if (filterType !== 'all') {
        filtered = mockInspections.filter((inspection) => inspection.type === filterType);
      }

      filtered.sort(
        (a: Inspection, b: Inspection) =>
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );

      setInspections(filtered);
      setLoading(false);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setLoading(false);
    }
  };

  const handleAccept = (inspection: Inspection): void => {
    // Update status to accepted
    setInspections((prev: Inspection[]) =>
      prev.map((ins: Inspection) => (ins.id === inspection.id ? { ...ins, status: 'accepted' } : ins))
    );
    alert(`ยืนยันนัดตรวจ: ${inspection.farmName}`);
  };

  const handleOpenReschedule = (inspection: Inspection): void => {
    setRescheduleDialog({ open: true, inspection });
    setNewDate(inspection.scheduledDate);
    setNewTime(inspection.scheduledTime);
  };

  const handleCloseReschedule = (): void => {
    setRescheduleDialog({ open: false, inspection: null });
    setNewDate('');
    setNewTime('');
  };

  const handleConfirmReschedule = (): void => {
    if (!rescheduleDialog.inspection) return;

    // Update scheduled date/time
    setInspections((prev: Inspection[]) =>
      prev.map((ins: Inspection) =>
        ins.id === rescheduleDialog.inspection!.id
          ? { ...ins, scheduledDate: newDate, scheduledTime: newTime }
          : ins
      )
    );

    alert(
      `เปลี่ยนนัดตรวจเป็น: ${new Date(newDate).toLocaleDateString('th-TH')} เวลา ${newTime} น.`
    );
    handleCloseReschedule();
  };

  const handleStartInspection = (inspection: Inspection): void => {
    if (inspection.type === 'VDO_CALL') {
      router.push(`/inspector/inspections/${inspection.applicationId}/vdo-call`);
    } else {
      router.push(`/inspector/inspections/${inspection.applicationId}/on-site`);
    }
  };

  const getInspectionTypeLabel = (type: 'VDO_CALL' | 'ON_SITE') => {
    return type === 'VDO_CALL' ? 'VDO Call' : 'ลงพื้นที่';
  };

  const getInspectionTypeIcon = (type: 'VDO_CALL' | 'ON_SITE') => {
    return type === 'VDO_CALL' ? <VideocamIcon /> : <LocationOnIcon />;
  };

  const getInspectionTypeColor = (type: 'VDO_CALL' | 'ON_SITE'): 'primary' | 'secondary' => {
    return type === 'VDO_CALL' ? 'primary' : 'secondary';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอยืนยัน';
      case 'accepted':
        return 'ยืนยันแล้ว';
      case 'scheduled':
        return 'นัดแล้ว';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'scheduled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const pendingCount = inspections.filter((ins: Inspection) => ins.status === 'pending').length;

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
          📅 ตารางนัดตรวจ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          จัดการนัดหมายการตรวจสอบฟาร์ม - มีนัดรอยืนยัน {pendingCount} รายการ
        </Typography>
      </Box>

      {/* Filter Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant={filterType === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilterType('all')}
          >
            ทั้งหมด (
            {
              applications.filter((app: Application) => matchesInspectionStage(app)).length
            }
            )
          </Button>
          <Button
            variant={filterType === 'VDO_CALL' ? 'contained' : 'outlined'}
            color="primary"
            startIcon={<VideocamIcon />}
            onClick={() => setFilterType('VDO_CALL')}
          >
            VDO Call
          </Button>
          <Button
            variant={filterType === 'ON_SITE' ? 'contained' : 'outlined'}
            color="secondary"
            startIcon={<LocationOnIcon />}
            onClick={() => setFilterType('ON_SITE')}
          >
            ลงพื้นที่
          </Button>
        </Box>
      </Paper>

      {/* Alert for Pending */}
      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          มีนัดตรวจรอยืนยัน <strong>{pendingCount} รายการ</strong> - กรุณายืนยันหรือเปลี่ยนนัดภายใน
          24 ชั่วโมง
        </Alert>
      )}

      {/* Inspections List */}
      {inspections.length === 0 ? (
        <Alert severity="info" icon={<ScheduleIcon />}>
          ไม่มีนัดตรวจตามเงื่อนไขที่เลือก
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inspections.map((inspection: Inspection) => (
            <Card
              key={inspection.id}
              sx={{
                ...(isToday(inspection.scheduledDate) && {
                  border: '2px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                }),
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    {/* Title */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {getInspectionTypeIcon(inspection.type)}
                      <Typography variant="h6" fontWeight="bold">
                        {inspection.farmName}
                      </Typography>
                      <Chip
                        label={getInspectionTypeLabel(inspection.type)}
                        color={getInspectionTypeColor(inspection.type)}
                        size="small"
                      />
                      <Chip
                        label={getStatusLabel(inspection.status)}
                        color={getStatusColor(inspection.status)}
                        size="small"
                      />
                      {isToday(inspection.scheduledDate) && (
                        <Chip label="🔥 วันนี้" color="error" size="small" />
                      )}
                    </Box>

                    {/* Details */}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>เกษตรกร:</strong> {inspection.farmerName} | <strong>เลขที่:</strong>{' '}
                      {inspection.applicationNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📅 <strong>นัดหมาย:</strong> {formatDate(inspection.scheduledDate)} เวลา{' '}
                      {inspection.scheduledTime} น.
                    </Typography>
                    {inspection.type === 'ON_SITE' && inspection.address && (
                      <Typography variant="body2" color="text.secondary">
                        📍 <strong>สถานที่:</strong> {inspection.address}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {inspection.status === 'pending' && (
                      <>
                        <Tooltip title="ยืนยันนัด">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleAccept(inspection)}
                          >
                            ยืนยัน
                          </Button>
                        </Tooltip>
                        <Tooltip title="เปลี่ยนนัด">
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            startIcon={<ScheduleIcon />}
                            onClick={() => handleOpenReschedule(inspection)}
                          >
                            เปลี่ยนนัด
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {inspection.status === 'accepted' && (
                      <Tooltip title="เริ่มตรวจสอบ">
                        <Button
                          variant="contained"
                          color={getInspectionTypeColor(inspection.type)}
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => handleStartInspection(inspection)}
                        >
                          เริ่มตรวจสอบ
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onClose={handleCloseReschedule} maxWidth="sm" fullWidth>
        <DialogTitle>⏰ เปลี่ยนนัดหมาย</DialogTitle>
        <DialogContent>
          {rescheduleDialog.inspection && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  กำลังเปลี่ยนนัดสำหรับ: <strong>{rescheduleDialog.inspection.farmName}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  นัดเดิม: {formatDate(rescheduleDialog.inspection.scheduledDate)} เวลา{' '}
                  {rescheduleDialog.inspection.scheduledTime} น.
                </Typography>
              </Alert>

              <TextField
                fullWidth
                type="date"
                label="วันที่ใหม่"
                value={newDate}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setNewDate(event.target.value)
                }
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="time"
                label="เวลาใหม่"
                value={newTime}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setNewTime(event.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReschedule}>ยกเลิก</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmReschedule}
            disabled={!newDate || !newTime}
          >
            ยืนยันเปลี่ยนนัด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          💡 หมายเหตุ
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          <li>
            <Typography variant="body2">
              <strong>VDO Call:</strong> ตรวจสอบเบื้องต้นผ่านวิดีโอคอล (30-45 นาที)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>ลงพื้นที่:</strong> ตรวจสอบฟาร์มจริง ให้คะแนน 8 CCPs (2-3 ชั่วโมง)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              กรุณายืนยันนัดภายใน 24 ชั่วโมง หากไม่สะดวกให้เปลี่ยนนัดก่อนล่วงหน้า 1 วัน
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default withAuth(InspectorSchedulePage, ['INSPECTOR']);
