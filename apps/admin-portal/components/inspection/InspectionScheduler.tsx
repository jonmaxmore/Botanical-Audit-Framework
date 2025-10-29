'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

interface InspectionSchedulerProps {
  inspectionId: string;
  onScheduled: () => void;
}

export default function InspectionScheduler({
  inspectionId,
  onScheduled,
}: InspectionSchedulerProps) {
  const [type, setType] = useState<'video_call' | 'onsite'>('video_call');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!scheduledDate) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inspections/${inspectionId}/schedule`,
        {
          type,
          scheduledDate: scheduledDate.toISOString(),
          scheduledTime,
          notes,
        }
      );
      onScheduled();
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        นัดหมายการตรวจสอบ
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>ประเภทการตรวจสอบ</InputLabel>
        <Select value={type} onChange={e => setType(e.target.value as any)}>
          <MenuItem value="video_call">Video Call</MenuItem>
          <MenuItem value="onsite">Onsite Inspection</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="วันที่"
          value={scheduledDate}
          onChange={setScheduledDate}
          slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        type="time"
        label="เวลา"
        value={scheduledTime}
        onChange={e => setScheduledTime(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="หมายเหตุ"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={!scheduledDate || submitting}
      >
        {submitting ? 'กำลังบันทึก...' : 'ยืนยันการนัดหมาย'}
      </Button>
    </Box>
  );
}
