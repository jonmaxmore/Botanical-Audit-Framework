/**
 * Calendar Routes Integration Tests
 *
 * Tests for calendar API endpoints.
 *
 * @test CalendarRoutes
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const request = require('supertest');
const express = require('express');

// Mock config before requiring google-calendar.service
jest.mock('../../../config/google-calendar.config', () => ({
  google: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  },
  calendar: {
    timeZone: 'Asia/Bangkok',
    syncInterval: 300000
  }
}));

// Mock CalendarEvent model
jest.mock('../models/calendar-event-model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findConflicts: jest.fn(),
  countDocuments: jest.fn()
}));

// Create mock CalendarService instance
const mockCalendarService = {
  createEvent: jest.fn(),
  getEvents: jest.fn(),
  getEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  getAvailableSlots: jest.fn(),
  bookInspection: jest.fn(),
  confirmEvent: jest.fn(),
  cancelEvent: jest.fn(),
  getConflicts: jest.fn(),
  getUpcomingEvents: jest.fn()
};

// Mock CalendarService to return our mock instance
jest.mock('../services/calendar.service', () => {
  return jest.fn().mockImplementation(() => mockCalendarService);
});

jest.mock('../services/google-calendar.service'); // Mock Google Calendar service

const calendarRoutes = require('../routes/calendar.routes');
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));
jest.mock('../shared/errors', () => ({
  AppError: class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
}));

// Import AppError for test use
const { AppError } = require('../shared/errors');

jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { _id: 'user123', role: 'INSPECTOR' };
    next();
  }
}));
jest.mock('../middleware/rbac', () => ({
  requireStaff: () => (req, res, next) => next(),
  requireInspector: () => (req, res, next) => next()
}));

describe('Calendar Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/calendar', calendarRoutes);

    // Reset all mocks
    Object.values(mockCalendarService).forEach(mock => {
      if (typeof mock.mockReset === 'function') {
        mock.mockReset();
      }
    });
  });

  describe('POST /api/calendar/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        eventType: 'INSPECTION',
        startTime: '2025-11-05T09:00:00Z',
        endTime: '2025-11-05T11:00:00Z'
      };

      const mockEvent = { _id: 'event123', ...eventData };
      mockCalendarService.createEvent.mockResolvedValue(mockEvent);

      const response = await request(app).post('/api/calendar/events').send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });
  });

  describe('GET /api/calendar/events', () => {
    it('should get events with filters', async () => {
      const mockEvents = [
        { _id: 'event1', title: 'Event 1' },
        { _id: 'event2', title: 'Event 2' }
      ];

      // Mock CalendarEvent.find for the route's direct query
      const CalendarEvent = require('../models/calendar-event-model');
      CalendarEvent.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockEvents)
        })
      });

      const response = await request(app).get('/api/calendar/events').query({
        startDate: '2025-11-01',
        endDate: '2025-11-30'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/calendar/events/:id', () => {
    it('should get single event by id', async () => {
      const mockEvent = { _id: 'event123', title: 'Test Event' };

      const CalendarEvent = require('../models/calendar-event-model');
      CalendarEvent.findById = jest.fn().mockResolvedValue(mockEvent);

      const response = await request(app).get('/api/calendar/events/event123');

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe('event123');
    });

    it('should return 404 for non-existent event', async () => {
      const CalendarEvent = require('../models/calendar-event-model');
      CalendarEvent.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/calendar/events/invalid-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/calendar/events/:id', () => {
    it('should update event', async () => {
      const updates = { title: 'Updated Title' };
      const mockUpdatedEvent = { _id: 'event123', ...updates };

      mockCalendarService.updateEvent.mockResolvedValue(mockUpdatedEvent);

      const response = await request(app).put('/api/calendar/events/event123').send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/calendar/events/:id', () => {
    it('should delete event', async () => {
      mockCalendarService.deleteEvent.mockResolvedValue(true);

      const response = await request(app).delete('/api/calendar/events/event123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/calendar/availability/:inspectorId', () => {
    it('should get available slots', async () => {
      const mockSlots = [
        { start: '2025-11-05T09:00:00Z', end: '2025-11-05T11:00:00Z' },
        { start: '2025-11-05T13:00:00Z', end: '2025-11-05T15:00:00Z' }
      ];

      mockCalendarService.getAvailableSlots.mockResolvedValue(mockSlots);

      const response = await request(app).get('/api/calendar/availability/inspector123').query({
        startDate: '2025-11-05',
        endDate: '2025-11-05',
        duration: 120
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/calendar/bookings/inspection', () => {
    it('should book inspection', async () => {
      const bookingData = {
        inspectorId: 'inspector123',
        startTime: '2025-11-05T09:00:00Z',
        endTime: '2025-11-05T11:00:00Z',
        farmId: 'farm123',
        applicationId: 'app123'
      };

      const mockBooking = { _id: 'event123', ...bookingData };
      mockCalendarService.bookInspection.mockResolvedValue(mockBooking);

      const response = await request(app)
        .post('/api/calendar/bookings/inspection')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if booking violates constraints', async () => {
      mockCalendarService.bookInspection.mockRejectedValue(
        new AppError('Booking violates constraints', 400)
      );

      const response = await request(app).post('/api/calendar/bookings/inspection').send({
        inspectorId: 'inspector123',
        startTime: '2025-11-03T09:00:00Z',
        endTime: '2025-11-03T11:00:00Z',
        farmId: 'farm123',
        applicationId: 'app123'
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/calendar/events/:id/confirm', () => {
    it('should confirm event', async () => {
      const mockEvent = { _id: 'event123', status: 'CONFIRMED' };
      mockCalendarService.updateEvent.mockResolvedValue(mockEvent);

      const response = await request(app).put('/api/calendar/events/event123/confirm');

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONFIRMED');
    });
  });

  describe('PUT /api/calendar/events/:id/cancel', () => {
    it('should cancel event', async () => {
      const mockEvent = {
        _id: 'event123',
        status: 'SCHEDULED',
        cancel: jest.fn().mockResolvedValue({ _id: 'event123', status: 'CANCELLED' })
      };

      // Mock CalendarEvent.findById for the route's event lookup
      const CalendarEvent = require('../models/calendar-event-model');
      CalendarEvent.findById = jest.fn().mockResolvedValue(mockEvent);

      const response = await request(app)
        .put('/api/calendar/events/event123/cancel')
        .send({ reason: 'Weather conditions' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('GET /api/calendar/conflicts/:userId', () => {
    it('should check for conflicts', async () => {
      const mockConflicts = [{ _id: 'event1', title: 'Conflicting Event' }];

      // Mock CalendarEvent.findConflicts for the route's direct query
      const CalendarEvent = require('../models/calendar-event-model');
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue(mockConflicts);

      const response = await request(app).get('/api/calendar/conflicts/user123').query({
        startTime: '2025-11-05T09:00:00Z',
        endTime: '2025-11-05T11:00:00Z'
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/calendar/upcoming', () => {
    it('should get upcoming events', async () => {
      const mockEvents = [
        { _id: 'event1', title: 'Upcoming 1' },
        { _id: 'event2', title: 'Upcoming 2' }
      ];

      mockCalendarService.getUpcomingEvents.mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/calendar/upcoming').query({ days: 7 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
