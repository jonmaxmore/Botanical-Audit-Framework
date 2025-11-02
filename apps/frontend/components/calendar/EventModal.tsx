/**
 * Event Modal Component
 *
 * Dialog for creating and editing calendar events.
 * Includes form validation and conflict detection.
 *
 * @component EventModal
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { calendarApi } from '../../lib/api/calendar';

interface EventModalProps {
  open: boolean;
  event: any;
  userId: string;
  role: string;
  onClose: () => void;
  onSave: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  open,
  event,
  userId,
  role,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'MEETING',
    startTime: '',
    endTime: '',
    location: {
      type: 'OFFICE',
      address: ''
    },
    status: 'SCHEDULED'
  });

  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'MEETING',
        startTime: event.startTime ? formatDateTimeLocal(new Date(event.startTime)) : '',
        endTime: event.endTime ? formatDateTimeLocal(new Date(event.endTime)) : '',
        location: event.location || { type: 'OFFICE', address: '' },
        status: event.status || 'SCHEDULED'
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        eventType: 'MEETING',
        startTime: '',
        endTime: '',
        location: { type: 'OFFICE', address: '' },
        status: 'SCHEDULED'
      });
    }
    setConflicts([]);
    setError('');
  }, [event, open]);

  // Format date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  // Check for conflicts
  const checkConflicts = async () => {
    if (!formData.startTime || !formData.endTime) return;

    try {
      const response = await calendarApi.checkConflicts(userId, {
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        excludeEventId: event?._id
      });

      setConflicts(response.data || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  // Handle form change
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Handle location change
  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title) {
      setError('Title is required');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required');
      return false;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        location: formData.location,
        status: formData.status,
        organizer: {
          userId,
          role
        }
      };

      if (event?._id) {
        // Update existing event
        await calendarApi.updateEvent(event._id, payload);
      } else {
        // Create new event
        await calendarApi.createEvent(payload);
      }

      onSave();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!event?._id) return;
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setLoading(true);
      await calendarApi.deleteEvent(event._id);
      onSave();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel event
  const handleCancel = async () => {
    if (!event?._id) return;
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setLoading(true);
      await calendarApi.cancelEvent(event._id, { reason });
      onSave();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to cancel event');
    } finally {
      setLoading(false);
    }
  };

  // Check conflicts when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const timer = setTimeout(() => {
        checkConflicts();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime, formData.endTime]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{event?._id ? 'Edit Event' : 'Create Event'}</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Conflicts Warning */}
          {conflicts.length > 0 && (
            <Alert severity="warning">
              <strong>Scheduling Conflict Detected!</strong>
              <br />
              {conflicts.length} event(s) overlap with this time:
              {conflicts.map((c: any) => (
                <div key={c._id}>
                  - {c.title} ({format(new Date(c.startTime), 'PPp')})
                </div>
              ))}
            </Alert>
          )}

          {/* Title */}
          <TextField
            label="Title"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            fullWidth
            required
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Event Type */}
          <FormControl fullWidth>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={formData.eventType}
              onChange={e => handleChange('eventType', e.target.value)}
              label="Event Type"
            >
              <MenuItem value="INSPECTION">Inspection</MenuItem>
              <MenuItem value="MEETING">Meeting</MenuItem>
              <MenuItem value="TRAINING">Training</MenuItem>
              <MenuItem value="REVIEW">Review</MenuItem>
              <MenuItem value="BREAK">Break</MenuItem>
              <MenuItem value="BLOCKED">Blocked</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          {/* Start Time */}
          <TextField
            label="Start Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={e => handleChange('startTime', e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          {/* End Time */}
          <TextField
            label="End Time"
            type="datetime-local"
            value={formData.endTime}
            onChange={e => handleChange('endTime', e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          {/* Location Type */}
          <FormControl fullWidth>
            <InputLabel>Location Type</InputLabel>
            <Select
              value={formData.location.type}
              onChange={e => handleLocationChange('type', e.target.value)}
              label="Location Type"
            >
              <MenuItem value="ONLINE">Online</MenuItem>
              <MenuItem value="FARM">Farm</MenuItem>
              <MenuItem value="OFFICE">Office</MenuItem>
            </Select>
          </FormControl>

          {/* Location Address */}
          <TextField
            label="Location Address"
            value={formData.location.address}
            onChange={e => handleLocationChange('address', e.target.value)}
            fullWidth
            placeholder="Enter address or meeting URL"
          />

          {/* Status */}
          {event?._id && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Event Details */}
          {event?._id && (
            <Box>
              <Chip
                label={`Created: ${format(new Date(event.createdAt), 'PPp')}`}
                size="small"
                sx={{ mr: 1 }}
              />
              {event.hasConflict && (
                <Chip label="Has Conflicts" color="warning" size="small" sx={{ mr: 1 }} />
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {/* Delete Button */}
        {event?._id && role !== 'FARMER' && (
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Delete
          </Button>
        )}

        {/* Cancel Event Button */}
        {event?._id && event.status !== 'CANCELLED' && role !== 'FARMER' && (
          <Button onClick={handleCancel} color="warning" disabled={loading}>
            Cancel Event
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Close Button */}
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || (role === 'FARMER' && event?._id)}
        >
          {loading ? <CircularProgress size={24} /> : event?._id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
