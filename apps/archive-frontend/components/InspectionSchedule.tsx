/**
 * Calendar Scheduling Component
 * Allows inspector to schedule inspections with Google Calendar integration
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Event as EventIcon,
  VideoCall as VideoIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface InspectionScheduleProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  application: {
    applicationNumber: string;
    farmer: {
      name: string;
      farmName: string;
      farmLocation: string;
      phone: string;
      email?: string;
    };
    inspectionType: 'VIDEO' | 'HYBRID' | 'ONSITE';
    lotId: string;
  };
  onScheduled?: () => void;
}

interface InspectorAvailability {
  inspectorId: string;
  name: string;
  email: string;
  workload: number;
  availableSlots: string[];
}

const InspectionSchedule: React.FC<InspectionScheduleProps> = ({
  open,
  onClose,
  applicationId,
  application,
  onScheduled
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedInspector, setSelectedInspector] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  // Data state
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [availability, setAvailability] = useState<InspectorAvailability[]>([]);
  const [recommendedSlot, setRecommendedSlot] = useState<any>(null);

  // Get inspection type details
  const inspectionTypeDetails = {
    VIDEO: {
      color: 'info',
      icon: <VideoIcon />,
      duration: 2,
      price: 500,
      location: 'Daily.co (Online)'
    },
    HYBRID: {
      color: 'warning',
      icon: <LocationIcon />,
      duration: 4,
      price: 1500,
      location: `${application.farmer.farmLocation} + Video Call`
    },
    ONSITE: {
      color: 'error',
      icon: <LocationIcon />,
      duration: 8,
      price: 3000,
      location: application.farmer.farmLocation
    }
  };

  const typeInfo = inspectionTypeDetails[application.inspectionType];

  // Load inspectors on mount
  useEffect(() => {
    const loadInspectors = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${API_BASE}/dtam/inspector/available`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setInspectors(response.data.data.inspectors || []);
      } catch (err: any) {
        console.error('Failed to load inspectors:', err);
        setError('ไม่สามารถโหลดรายชื่อผู้ตรวจประเมินได้');
      }
    };

    if (open) {
      loadInspectors();
    }
  }, [open]);

  // Load availability when inspector or date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedInspector || !scheduledDate) return;

      try {
        setLoadingAvailability(true);
        const token = localStorage.getItem('authToken');

        const response = await axios.post(
          `${API_BASE}/calendar/check-availability`,
          {
            inspectorId: selectedInspector,
            date: scheduledDate,
            duration: typeInfo.duration
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setAvailability(response.data.data.availability || []);
        setRecommendedSlot(response.data.data.recommendedSlot || null);
        setLoadingAvailability(false);
      } catch (err: any) {
        console.error('Failed to check availability:', err);
        setLoadingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedInspector, scheduledDate, typeInfo.duration]);

  const handleSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      await axios.post(
        `${API_BASE}/dtam/inspector/${applicationId}/schedule`,
        {
          inspectorId: selectedInspector,
          scheduledDate,
          scheduledTime,
          notes,
          createCalendarEvent: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setLoading(false);

      if (onScheduled) {
        onScheduled();
      }

      // Close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to schedule inspection:', err);
      setError(err.response?.data?.message || 'ไม่สามารถนัดหมายการตรวจประเมินได้');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedInspector('');
    setScheduledDate('');
    setScheduledTime('09:00');
    setNotes('');
    setError(null);
    setSuccess(false);
    setAvailability([]);
    setRecommendedSlot(null);
    onClose();
  };

  const useRecommendedSlot = () => {
    if (recommendedSlot) {
      setSelectedInspector(recommendedSlot.inspectorId);
      setScheduledDate(recommendedSlot.date);
      setScheduledTime(recommendedSlot.time);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EventIcon />
          <Typography variant="h6">นัดหมายการตรวจประเมิน</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            นัดหมายการตรวจประเมินสำเร็จ
          </Alert>
        )}

        {/* Application Info Card */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  ใบสมัคร
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {application.applicationNumber}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  เกษตรกร
                </Typography>
                <Typography variant="body2">{application.farmer.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {application.farmer.phone}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  แปลง
                </Typography>
                <Typography variant="body2">{application.farmer.farmName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Lot: {application.lotId}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ประเภทการตรวจ:
                  </Typography>
                  <Chip
                    icon={typeInfo.icon}
                    label={application.inspectionType}
                    color={typeInfo.color as any}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {typeInfo.duration} ชั่วโมง • ฿{typeInfo.price.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  สถานที่
                </Typography>
                <Typography variant="body2">{typeInfo.location}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recommended Slot */}
        {recommendedSlot && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={useRecommendedSlot}>
                ใช้
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="bold">
              แนะนำช่วงเวลา
            </Typography>
            <Typography variant="caption">
              {recommendedSlot.inspectorName} •{' '}
              {new Date(recommendedSlot.date).toLocaleDateString('th-TH')} •{' '}
              {recommendedSlot.time}
            </Typography>
          </Alert>
        )}

        {/* Scheduling Form */}
        <Grid container spacing={2}>
          {/* Inspector Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>ผู้ตรวจประเมิน</InputLabel>
              <Select
                value={selectedInspector}
                onChange={(e) => setSelectedInspector(e.target.value)}
                label="ผู้ตรวจประเมิน"
              >
                {inspectors.map((inspector) => (
                  <MenuItem key={inspector._id} value={inspector._id}>
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <PersonIcon fontSize="small" />
                      <Box flex={1}>
                        <Typography variant="body2">{inspector.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          งานปัจจุบัน: {inspector.activeInspections || 0} งาน
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Selection */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="วันที่"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: minDate }}
            />
          </Grid>

          {/* Time Selection */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              type="time"
              label="เวลา"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 1800 }} // 30-minute intervals
            />
          </Grid>

          {/* Availability Indicator */}
          {loadingAvailability && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress sx={{ flex: 1 }} />
                <Typography variant="caption">กำลังตรวจสอบความว่าง...</Typography>
              </Box>
            </Grid>
          )}

          {availability.length > 0 && !loadingAvailability && (
            <Grid item xs={12}>
              <Alert severity="success" icon={<CheckIcon />}>
                ผู้ตรวจประเมินว่างในช่วงเวลานี้
              </Alert>
            </Grid>
          )}

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="หมายเหตุ (ถ้ามี)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ข้อมูลเพิ่มเติมหรือคำแนะนำสำหรับผู้ตรวจประเมิน"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSchedule}
          variant="contained"
          disabled={!selectedInspector || !scheduledDate || !scheduledTime || loading}
          startIcon={<EventIcon />}
        >
          นัดหมาย
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InspectionSchedule;
