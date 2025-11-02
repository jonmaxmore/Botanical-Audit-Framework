/**
 * Availability Picker Component
 *
 * UI for selecting available time slots from inspector's schedule.
 * Shows available slots with visual indicators.
 *
 * @component AvailabilityPicker
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Alert
} from '@mui/material';
import { format, addDays, startOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { calendarApi } from '../../lib/api/calendar';

interface TimeSlot {
  start: Date;
  end: Date;
  inspectorId: string;
  available: boolean;
}

interface AvailabilityPickerProps {
  inspectorId: string;
  duration: number; // Duration in minutes
  startDate?: Date;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  inspectorId,
  duration,
  startDate = new Date(),
  onSelectSlot,
  selectedSlot
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(startDate));
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate next 14 days for date selection
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  // Fetch available slots
  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError('');

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await calendarApi.getAvailableSlots(inspectorId, {
        startDate: selectedDate.toISOString(),
        endDate: endDate.toISOString(),
        duration
      });

      // Transform response to TimeSlot format
      const slots = (response.data || []).map((slot: any) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
        inspectorId,
        available: true
      }));

      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      setError(error.response?.data?.message || 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots when date or inspector changes
  useEffect(() => {
    if (inspectorId && selectedDate) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectorId, selectedDate, duration]);

  // Handle date selection
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    onSelectSlot(slot);
  };

  // Check if slot is selected
  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return (
      slot.start.getTime() === selectedSlot.start.getTime() &&
      slot.end.getTime() === selectedSlot.end.getTime()
    );
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: th });
  };

  // Group slots by time of day
  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning = slots.filter(s => s.start.getHours() < 12);
    const afternoon = slots.filter(s => s.start.getHours() >= 12 && s.start.getHours() < 17);
    const evening = slots.filter(s => s.start.getHours() >= 17);

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod(availableSlots);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Date Selector */}
        <FormControl fullWidth>
          <InputLabel>Select Date</InputLabel>
          <Select
            value={selectedDate.toISOString()}
            onChange={e => handleDateChange(new Date(e.target.value))}
            label="Select Date"
          >
            {dateOptions.map(date => (
              <MenuItem key={date.toISOString()} value={date.toISOString()}>
                {format(date, 'EEEE, dd MMMM yyyy', { locale: th })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Error Alert */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Slots Available */}
        {!loading && availableSlots.length === 0 && (
          <Alert severity="info">
            No available time slots on this date. Please select another date.
          </Alert>
        )}

        {/* Available Slots */}
        {!loading && availableSlots.length > 0 && (
          <Stack spacing={2}>
            {/* Morning Slots */}
            {morning.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    🌅 Morning (Before 12:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {morning.map((slot, index) => (
                      <Chip
                        key={index}
                        label={`${formatTime(slot.start)} - ${formatTime(slot.end)}`}
                        onClick={() => handleSlotClick(slot)}
                        color={isSlotSelected(slot) ? 'primary' : 'default'}
                        variant={isSlotSelected(slot) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Afternoon Slots */}
            {afternoon.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ☀️ Afternoon (12:00 - 17:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {afternoon.map((slot, index) => (
                      <Chip
                        key={index}
                        label={`${formatTime(slot.start)} - ${formatTime(slot.end)}`}
                        onClick={() => handleSlotClick(slot)}
                        color={isSlotSelected(slot) ? 'primary' : 'default'}
                        variant={isSlotSelected(slot) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Evening Slots */}
            {evening.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    🌙 Evening (After 17:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {evening.map((slot, index) => (
                      <Chip
                        key={index}
                        label={`${formatTime(slot.start)} - ${formatTime(slot.end)}`}
                        onClick={() => handleSlotClick(slot)}
                        color={isSlotSelected(slot) ? 'primary' : 'default'}
                        variant={isSlotSelected(slot) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}

        {/* Selected Slot Info */}
        {selectedSlot && (
          <Alert severity="success">
            <strong>Selected Time:</strong>
            <br />
            {format(selectedSlot.start, 'EEEE, dd MMMM yyyy', { locale: th })} at{' '}
            {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default AvailabilityPicker;
