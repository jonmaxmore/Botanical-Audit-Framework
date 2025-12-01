'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Videocam, LocationOn } from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import axios from 'axios';

interface Schedule {
  id: string;
  inspectionId: string;
  type: 'video_call' | 'onsite';
  scheduledDate: string;
  scheduledTime: string;
  farmerName: string;
  status: string;
}

export default function InspectionCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchSchedules();
  }, [currentMonth]);

  const fetchSchedules = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inspections/calendar`,
        { params: { startDate: start.toISOString(), endDate: end.toISOString() } }
      );

      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(s => isSameDay(new Date(s.scheduledDate), day));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h5">{format(currentMonth, 'MMMM yyyy')}</Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
          <Box key={day} sx={{ textAlign: 'center', fontWeight: 'bold', p: 1 }}>
            {day}
          </Box>
        ))}

        {days.map(day => {
          const daySchedules = getSchedulesForDay(day);
          return (
            <Card
              key={day.toString()}
              sx={{
                minHeight: 100,
                opacity: isSameMonth(day, currentMonth) ? 1 : 0.3,
                bgcolor: daySchedules.length > 0 ? 'action.hover' : 'background.paper',
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Typography variant="caption">{format(day, 'd')}</Typography>
                {daySchedules.map(schedule => (
                  <Chip
                    key={schedule.id}
                    size="small"
                    icon={schedule.type === 'video_call' ? <Videocam /> : <LocationOn />}
                    label={schedule.scheduledTime}
                    sx={{ mt: 0.5, width: '100%' }}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
