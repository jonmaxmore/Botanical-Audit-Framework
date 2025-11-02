/**
 * Calendar Widget Component
 *
 * Compact calendar widget for inspector dashboard.
 * Shows upcoming inspections and quick actions.
 *
 * @component CalendarWidget
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Alert,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { calendarApi } from '../../../lib/api/calendar';

interface CalendarWidgetProps {
  inspectorId: string;
  onCreateEvent?: () => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  inspectorId,
  onCreateEvent
}) => {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState(0);

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // Get next 7 days
      const response = await calendarApi.getUpcomingEvents({
        userId: inspectorId,
        days: 7
      });

      const eventsList = response.data || [];
      setEvents(eventsList);

      // Count conflicts
      const conflictCount = eventsList.filter((e: any) => e.hasConflict).length;
      setConflicts(conflictCount);
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      setError('ไม่สามารถโหลดข้อมูลปฏิทินได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inspectorId) {
      fetchUpcomingEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectorId]);

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INSPECTION: '#2196f3',
      MEETING: '#ff9800',
      TRAINING: '#9c27b0',
      REVIEW: '#f44336',
      BREAK: '#795548',
      OTHER: '#607d8b'
    };
    return colors[type] || '#757575';
  };

  // Get event type label
  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INSPECTION: 'ตรวจประเมิน',
      MEETING: 'ประชุม',
      TRAINING: 'อบรม',
      REVIEW: 'ทบทวน',
      BREAK: 'พัก',
      BLOCKED: 'บล็อก',
      OTHER: 'อื่นๆ'
    };
    return labels[type] || type;
  };

  // Format event time
  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ปฏิทินงาน
            </Typography>
            {conflicts > 0 && (
              <Tooltip title={`มี ${conflicts} รายการที่มีความขัดแย้ง`}>
                <WarningIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
          <Box>
            <Tooltip title="รีเฟรช">
              <IconButton size="small" onClick={fetchUpcomingEvents} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onCreateEvent && (
              <Tooltip title="สร้างกิจกรรม">
                <IconButton size="small" color="primary" onClick={onCreateEvent}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Upcoming Events List */}
        {loading ? (
          <Box>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              ไม่มีกิจกรรมในอีก 7 วันข้างหน้า
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {events.map((event: any) => (
              <ListItem
                key={event._id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderLeft: event.hasConflict ? '4px solid #f44336' : 'none'
                }}
                onClick={() => router.push(`/inspector/schedule?eventId=${event._id}`)}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {event.title}
                    </Typography>
                    <Chip
                      label={getEventTypeLabel(event.eventType)}
                      size="small"
                      sx={{
                        bgcolor: `${getEventTypeColor(event.eventType)}20`,
                        color: getEventTypeColor(event.eventType),
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(event.startTime), 'EEE, dd MMM', { locale: th })} •{' '}
                      {formatEventTime(event.startTime, event.endTime)}
                    </Typography>
                  </Box>
                  {event.location?.type && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {event.location.type} {event.location.address && `• ${event.location.address}`}
                    </Typography>
                  )}
                  {event.hasConflict && (
                    <Chip
                      label="มีความขัดแย้ง"
                      size="small"
                      color="error"
                      sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {/* View All Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => router.push('/inspector/schedule')}
          sx={{ mt: 2 }}
        >
          ดูปฏิทินทั้งหมด
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
