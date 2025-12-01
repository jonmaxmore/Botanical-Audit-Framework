/**
 * Calendar View Component
 *
 * Main calendar interface using FullCalendar library.
 * Displays events in month, week, and day views with drag-and-drop support.
 *
 * @component CalendarView
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

'use client';

import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Box, Paper, Typography, Button, ButtonGroup, Chip } from '@mui/material';
import { EventModal } from './EventModal';
import { calendarApi } from '../../lib/api/calendar';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  eventType: string;
  status: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: any;
}

interface CalendarViewProps {
  userId: string;
  role: string;
  onEventClick?: (event: any) => void;
  onDateClick?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  userId,
  role,
  onEventClick,
  onDateClick
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [_loading, setLoading] = useState(false);

  // Fetch events from API
  const fetchEvents = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const response = await calendarApi.getEvents({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        userId
      });

      const formattedEvents = response.data.map((event: any) => ({
        id: event._id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: getEventColor(event.eventType, event.status),
        borderColor: getEventBorderColor(event.status),
        extendedProps: {
          ...event,
          eventType: event.eventType,
          status: event.status,
          description: event.description,
          location: event.location
        }
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDatesSet = (arg: any) => {
    fetchEvents(arg.start, arg.end);
  };

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsModalOpen(true);
    if (onEventClick) {
      onEventClick(clickInfo.event);
    }
  };

  // Handle date click (create new event)
  const handleDateClick = (arg: any) => {
    if (onDateClick) {
      onDateClick(arg.date);
    } else {
      // Open modal for new event
      setSelectedEvent({
        startTime: arg.date,
        endTime: new Date(arg.date.getTime() + 2 * 60 * 60 * 1000) // +2 hours
      });
      setIsModalOpen(true);
    }
  };

  // Handle event drop (drag-and-drop)
  const handleEventDrop = async (info: any) => {
    try {
      await calendarApi.updateEvent(info.event.id, {
        startTime: info.event.start,
        endTime: info.event.end
      });
    } catch (error) {
      console.error('Error updating event:', error);
      info.revert();
    }
  };

  // Handle event resize
  const handleEventResize = async (info: any) => {
    try {
      await calendarApi.updateEvent(info.event.id, {
        startTime: info.event.start,
        endTime: info.event.end
      });
    } catch (error) {
      console.error('Error resizing event:', error);
      info.revert();
    }
  };

  // Change calendar view
  const changeView = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  // Navigate calendar
  const navigate = (action: 'prev' | 'next' | 'today') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      switch (action) {
        case 'prev':
          calendarApi.prev();
          break;
        case 'next':
          calendarApi.next();
          break;
        case 'today':
          calendarApi.today();
          break;
      }
    }
  };

  // Get current date range title
  const getTitle = () => {
    const calendarApi = calendarRef.current?.getApi();
    return calendarApi?.view.title || '';
  };

  // Event color based on type and status
  const getEventColor = (type: string, status: string) => {
    if (status === 'CANCELLED') return '#9e9e9e';
    if (status === 'COMPLETED') return '#4caf50';

    switch (type) {
      case 'INSPECTION':
        return '#2196f3';
      case 'MEETING':
        return '#ff9800';
      case 'TRAINING':
        return '#9c27b0';
      case 'REVIEW':
        return '#f44336';
      case 'BREAK':
        return '#795548';
      default:
        return '#607d8b';
    }
  };

  const getEventBorderColor = (status: string) => {
    if (status === 'CONFIRMED') return '#2e7d32';
    if (status === 'CANCELLED') return '#616161';
    return 'transparent';
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Refresh events after modal save
  const handleEventSaved = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const view = calendarApi.view;
      fetchEvents(view.activeStart, view.activeEnd);
    }
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('prev')}>
              Previous
            </Button>
            <Button variant="outlined" onClick={() => navigate('today')}>
              Today
            </Button>
            <Button variant="outlined" onClick={() => navigate('next')}>
              Next
            </Button>
          </Box>

          {/* Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {getTitle()}
          </Typography>

          {/* View Switcher */}
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'}
              onClick={() => changeView('dayGridMonth')}
            >
              Month
            </Button>
            <Button
              variant={currentView === 'timeGridWeek' ? 'contained' : 'outlined'}
              onClick={() => changeView('timeGridWeek')}
            >
              Week
            </Button>
            <Button
              variant={currentView === 'timeGridDay' ? 'contained' : 'outlined'}
              onClick={() => changeView('timeGridDay')}
            >
              Day
            </Button>
            <Button
              variant={currentView === 'listWeek' ? 'contained' : 'outlined'}
              onClick={() => changeView('listWeek')}
            >
              List
            </Button>
          </ButtonGroup>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip label="Inspection" size="small" sx={{ bgcolor: '#2196f3', color: 'white' }} />
          <Chip label="Meeting" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
          <Chip label="Training" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
          <Chip label="Review" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
          <Chip label="Completed" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
          <Chip label="Cancelled" size="small" sx={{ bgcolor: '#9e9e9e', color: 'white' }} />
        </Box>
      </Paper>

      {/* Calendar */}
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          editable={role !== 'FARMER'}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          timeZone="Asia/Bangkok"
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
        />
      </Paper>

      {/* Event Modal */}
      <EventModal
        open={isModalOpen}
        event={selectedEvent}
        userId={userId}
        role={role}
        onClose={handleCloseModal}
        onSave={handleEventSaved}
      />
    </Box>
  );
};

export default CalendarView;
