/**
 * Calendar API Service
 *
 * API wrapper for calendar-related backend endpoints.
 * Handles event management, booking, availability, and Google Calendar sync.
 *
 * @module calendarApi
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/calendar`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const calendarApi = {
  // Event CRUD operations
  createEvent: (eventData: any) => api.post('/events', eventData),
  getEvents: (params?: any) => api.get('/events', { params }),
  getEvent: (eventId: string) => api.get(`/events/${eventId}`),
  updateEvent: (eventId: string, updates: any) => api.put(`/events/${eventId}`, updates),
  deleteEvent: (eventId: string) => api.delete(`/events/${eventId}`),

  // Event actions
  confirmEvent: (eventId: string) => api.put(`/events/${eventId}/confirm`),
  cancelEvent: (eventId: string, data: any) => api.put(`/events/${eventId}/cancel`, data),
  completeEvent: (eventId: string, data: any) => api.put(`/events/${eventId}/complete`, data),
  updateRsvp: (eventId: string, rsvpData: any) => api.put(`/events/${eventId}/rsvp`, rsvpData),

  // Availability
  getAvailableSlots: (inspectorId: string, params: any) =>
    api.get(`/availability/${inspectorId}`, { params }),

  // Booking
  bookInspection: (bookingData: any) => api.post('/bookings/inspection', bookingData),

  // Conflicts
  checkConflicts: (userId: string, timeRange: any) =>
    api.get(`/conflicts/${userId}`, { params: timeRange }),

  // Recurring events
  getRecurringInstances: (eventId: string, params: any) =>
    api.get(`/events/${eventId}/recurring-instances`, { params }),

  // Statistics
  getStatistics: (userId: string) => api.get('/statistics', { params: { userId } }),

  // Reminders
  sendReminders: () => api.post('/reminders/send'),

  // Upcoming events
  getUpcomingEvents: (params?: any) => api.get('/upcoming', { params }),

  // Google Calendar integration
  getGoogleAuthUrl: () => api.get('/google/auth'),
  enableGoogleSync: (data: any) => api.post('/google/sync/enable', data),
  disableGoogleSync: () => api.post('/google/sync/disable'),
  syncNow: () => api.post('/google/sync/now'),
  getSyncStatus: () => api.get('/google/sync/status')
};

export default calendarApi;
