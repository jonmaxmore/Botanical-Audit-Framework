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

const calendarRoutes = require('../routes/calendar.routes');
const CalendarService = require('../services/calendar.service');

jest.mock('../services/calendar.service');
jest.mock('../services/google-calendar.service'); // Mock Google Calendar service
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
  let mockCalendarService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/calendar', calendarRoutes);
    jest.clearAllMocks();
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
      CalendarService.prototype.createEvent = jest.fn().mockResolvedValue(mockEvent);

      const response = await request(app).post('/api/calendar/events').send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });

    it('should return 400 for invalid event data', async () => {
      const invalidData = {
        title: 'Test Event'
        // Missing required fields
      };

      const response = await request(app).post('/api/calendar/events').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/calendar/events', () => {
    it('should get events with filters', async () => {
      const mockEvents = [
        { _id: 'event1', title: 'Event 1' },
        { _id: 'event2', title: 'Event 2' }
      ];

      CalendarService.prototype.getEvents = jest.fn().mockResolvedValue(mockEvents);

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
      CalendarService.prototype.getEvent = jest.fn().mockResolvedValue(mockEvent);

      const response = await request(app).get('/api/calendar/events/event123');

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe('event123');
    });

    it('should return 404 for non-existent event', async () => {
      CalendarService.prototype.getEvent = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/calendar/events/invalid-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/calendar/events/:id', () => {
    it('should update event', async () => {
      const updates = { title: 'Updated Title' };
      const mockUpdatedEvent = { _id: 'event123', ...updates };

      CalendarService.prototype.updateEvent = jest.fn().mockResolvedValue(mockUpdatedEvent);

      const response = await request(app).put('/api/calendar/events/event123').send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/calendar/events/:id', () => {
    it('should delete event', async () => {
      CalendarService.prototype.deleteEvent = jest.fn().mockResolvedValue(true);

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

      CalendarService.prototype.getAvailableSlots = jest.fn().mockResolvedValue(mockSlots);

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
        farmId: 'farm123'
      };

      const mockBooking = { _id: 'event123', ...bookingData };
      CalendarService.prototype.bookInspection = jest.fn().mockResolvedValue(mockBooking);

      const response = await request(app)
        .post('/api/calendar/bookings/inspection')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if booking violates constraints', async () => {
      CalendarService.prototype.bookInspection = jest
        .fn()
        .mockRejectedValue(new Error('Booking violates constraints'));

      const response = await request(app).post('/api/calendar/bookings/inspection').send({
        inspectorId: 'inspector123',
        startTime: '2025-11-03T09:00:00Z', // Too soon
        endTime: '2025-11-03T11:00:00Z',
        farmId: 'farm123'
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/calendar/events/:id/confirm', () => {
    it('should confirm event', async () => {
      const mockEvent = { _id: 'event123', status: 'CONFIRMED' };
      CalendarService.prototype.confirmEvent = jest.fn().mockResolvedValue(mockEvent);

      const response = await request(app).put('/api/calendar/events/event123/confirm');

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONFIRMED');
    });
  });

  describe('PUT /api/calendar/events/:id/cancel', () => {
    it('should cancel event', async () => {
      const mockEvent = { _id: 'event123', status: 'CANCELLED' };
      CalendarService.prototype.cancelEvent = jest.fn().mockResolvedValue(mockEvent);

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

      CalendarService.prototype.checkConflicts = jest.fn().mockResolvedValue(mockConflicts);

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

      CalendarService.prototype.getUpcomingEvents = jest.fn().mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/calendar/upcoming').query({ days: 7 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
