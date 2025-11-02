/**
 * Calendar Service Unit Tests
 *
 * Tests for calendar event management and booking logic.
 *
 * @test CalendarService
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const CalendarService = require('../services/calendar.service');
const CalendarEvent = require('../models/calendar-event-model');
const InspectorAvailability = require('../models/inspector-availability-model');

jest.mock('../models/calendar-event-model');
jest.mock('../models/inspector-availability-model');
jest.mock('../modules/user-management/infrastructure/models/User');
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

describe('CalendarService', () => {
  let calendarService;
  let mockNotificationService;

  beforeEach(() => {
    mockNotificationService = {
      sendBookingConfirmation: jest.fn(),
      sendConflictAlert: jest.fn()
    };

    // Setup default mocks for CalendarEvent static methods
    CalendarEvent.findConflicts = jest.fn().mockResolvedValue([]);
    CalendarEvent.countDocuments = jest.fn().mockResolvedValue(0);

    calendarService = new CalendarService(mockNotificationService);
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      const eventData = {
        title: 'Test Inspection',
        eventType: 'INSPECTION',
        startTime: new Date('2025-11-03T09:00:00Z'),
        endTime: new Date('2025-11-03T11:00:00Z'),
        organizer: { userId: 'user123', role: 'INSPECTOR' }
      };

      const mockEvent = {
        _id: 'event123',
        ...eventData,
        hasConflict: false,
        conflicts: [],
        save: jest.fn().mockResolvedValue(this)
      };
      CalendarEvent.mockImplementation(() => mockEvent);

      // Mock findConflicts - no conflicts
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue([]);

      const result = await calendarService.createEvent(eventData, { _id: 'user123' });

      expect(mockEvent.save).toHaveBeenCalled();
      expect(result.hasConflict).toBe(false);
    });

    it('should detect conflicts when creating event', async () => {
      const eventData = {
        title: 'Test Event',
        startTime: new Date('2025-11-03T09:00:00Z'),
        endTime: new Date('2025-11-03T11:00:00Z'),
        organizer: { userId: 'user123' }
      };

      const conflictingEvent = {
        _id: 'conflict123',
        title: 'Existing Event',
        startTime: new Date('2025-11-03T10:00:00Z'),
        endTime: new Date('2025-11-03T12:00:00Z')
      };

      const mockEvent = {
        _id: 'event123',
        ...eventData,
        hasConflict: true,
        conflicts: [
          {
            conflictingEventId: conflictingEvent._id,
            conflictingEventTitle: conflictingEvent.title,
            reason: 'Time overlap detected'
          }
        ],
        save: jest.fn().mockResolvedValue(this)
      };
      CalendarEvent.mockImplementation(() => mockEvent);

      // Mock findConflicts - return conflicting event
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue([conflictingEvent]);

      const result = await calendarService.createEvent(eventData, { _id: 'user123' });

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
    });

    it('should throw error if end time is before start time', async () => {
      const eventData = {
        title: 'Invalid Event',
        startTime: new Date('2025-11-03T11:00:00Z'),
        endTime: new Date('2025-11-03T09:00:00Z')
      };

      await expect(calendarService.createEvent(eventData, { _id: 'user123' })).rejects.toThrow(
        'End time must be after start time'
      );
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available time slots for inspector', async () => {
      const inspectorId = 'inspector123';
      const startDate = new Date('2025-11-03T00:00:00Z');
      const endDate = new Date('2025-11-03T23:59:59Z');
      const duration = 120; // 2 hours

      const mockAvailability = {
        workingHours: [
          {
            dayOfWeek: 6, // Saturday (Nov 3, 2025 is Sunday, but let's test the method)
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true
          }
        ],
        customAvailability: [],
        timeOff: [],
        constraints: {
          travelTimeBetweenFarms: 30
        },
        isAvailableOn: jest.fn().mockReturnValue(true),
        getAvailableSlotsOn: jest.fn().mockReturnValue([
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '13:00', endTime: '17:00' }
        ])
      };

      const mockExistingEvents = [
        {
          startTime: new Date('2025-11-03T10:00:00Z'),
          endTime: new Date('2025-11-03T12:00:00Z'),
          overlaps: jest.fn().mockReturnValue(false)
        }
      ];

      InspectorAvailability.findOne = jest.fn().mockResolvedValue(mockAvailability);
      CalendarEvent.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExistingEvents)
      });

      const slots = await calendarService.getAvailableSlots(
        inspectorId,
        startDate,
        endDate,
        duration
      );

      expect(InspectorAvailability.findOne).toHaveBeenCalledWith({
        inspectorId,
        isActive: true
      });
      expect(slots).toBeInstanceOf(Array);
    });

    it('should throw error if inspector not found', async () => {
      InspectorAvailability.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        calendarService.getAvailableSlots('invalid-inspector', new Date(), new Date(), 120)
      ).rejects.toThrow('Inspector availability not configured');
    });
  });

  describe('bookInspection', () => {
    it('should book inspection successfully', async () => {
      const mongoose = require('mongoose');
      const bookingData = {
        inspectorId: new mongoose.Types.ObjectId().toString(),
        startTime: new Date('2025-11-05T09:00:00Z'),
        endTime: new Date('2025-11-05T11:00:00Z'),
        farmId: 'farm123',
        purpose: 'GACP Certification'
      };

      const mockAvailability = {
        inspectorId: bookingData.inspectorId,
        constraints: {
          maxDailyInspections: 3,
          minInspectionDuration: 60,
          advanceBookingDays: 2
        },
        preferences: {
          autoAcceptBookings: true
        }
      };

      const mockInspector = {
        _id: bookingData.inspectorId,
        firstName: 'John',
        lastName: 'Doe',
        role: 'INSPECTOR'
      };

      const mockEvent = {
        _id: 'event123',
        ...bookingData,
        eventType: 'INSPECTION',
        hasConflict: false,
        conflicts: [],
        save: jest.fn().mockResolvedValue(this)
      };

      InspectorAvailability.findOne = jest.fn().mockResolvedValue(mockAvailability);
      CalendarEvent.countDocuments = jest.fn().mockResolvedValue(0);

      // Mock findConflicts - no conflicts
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue([]);

      CalendarEvent.mockImplementation(() => mockEvent);

      // Mock User.findById
      const User = require('../modules/user-management/infrastructure/models/User');
      User.findById = jest.fn().mockResolvedValue(mockInspector);

      await calendarService.bookInspection(bookingData, { _id: 'farmer123' });

      expect(mockNotificationService.sendBookingConfirmation).toHaveBeenCalled();
    });

    it('should throw error if booking too soon', async () => {
      const bookingData = {
        inspectorId: 'inspector123',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        farmId: 'farm123'
      };

      const mockAvailability = {
        constraints: {
          advanceBookingDays: 3 // Requires 3 days advance booking
        }
      };

      InspectorAvailability.findOne = jest.fn().mockResolvedValue(mockAvailability);

      await expect(
        calendarService.bookInspection(bookingData, { _id: 'farmer123' })
      ).rejects.toThrow('Booking must be made at least 3 days in advance');
    });

    it('should throw error if inspector reached daily limit', async () => {
      const mongoose = require('mongoose');
      const inspectorId = new mongoose.Types.ObjectId().toString();
      const bookingData = {
        inspectorId: inspectorId,
        startTime: new Date('2025-11-05T09:00:00Z'),
        endTime: new Date('2025-11-05T11:00:00Z'),
        farmId: 'farm123'
      };

      const mockAvailability = {
        constraints: {
          maxDailyInspections: 2,
          advanceBookingDays: 1
        }
      };

      InspectorAvailability.findOne = jest.fn().mockResolvedValue(mockAvailability);
      CalendarEvent.countDocuments = jest.fn().mockResolvedValue(2); // Already at limit

      // Mock for _checkConflicts to prevent other errors
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue([]);

      await expect(
        calendarService.bookInspection(bookingData, { _id: 'farmer123' })
      ).rejects.toThrow('Inspector has reached maximum daily inspections');
    });
  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const eventId = 'event123';
      const updates = {
        title: 'Updated Title',
        startTime: new Date('2025-11-05T10:00:00Z')
      };

      const mockEvent = {
        _id: eventId,
        title: 'Old Title',
        organizer: { userId: 'user123' },
        save: jest.fn()
      };

      CalendarEvent.findById = jest.fn().mockResolvedValue(mockEvent);
      CalendarEvent.findConflicts = jest.fn().mockResolvedValue([]);

      await calendarService.updateEvent(eventId, updates, { _id: 'user123' });

      expect(mockEvent.title).toBe('Updated Title');
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should throw error if user not authorized', async () => {
      const mockEvent = {
        _id: 'event123',
        organizer: { userId: 'user123' }
      };

      CalendarEvent.findById = jest.fn().mockResolvedValue(mockEvent);

      await expect(
        calendarService.updateEvent('event123', {}, { _id: 'user456', role: 'FARMER' })
      ).rejects.toThrow('You do not have permission to modify this event');
    });
  });

  describe('deleteEvent', () => {
    it('should soft delete event', async () => {
      const mockEvent = {
        _id: 'event123',
        organizer: { userId: 'user123' },
        deletedAt: null,
        save: jest.fn()
      };

      CalendarEvent.findById = jest.fn().mockResolvedValue(mockEvent);

      await calendarService.deleteEvent('event123', { _id: 'user123' });

      expect(mockEvent.deletedAt).toBeDefined();
      expect(mockEvent.save).toHaveBeenCalled();
    });
  });

  describe('getUpcomingEvents', () => {
    it('should return upcoming events for user', async () => {
      const userId = 'user123';
      const mockEvents = [
        {
          _id: 'event1',
          title: 'Event 1',
          startTime: new Date('2025-11-05T09:00:00Z')
        },
        {
          _id: 'event2',
          title: 'Event 2',
          startTime: new Date('2025-11-06T10:00:00Z')
        }
      ];

      CalendarEvent.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvents)
      });

      const events = await calendarService.getUpcomingEvents(userId, 7);

      expect(events).toHaveLength(2);
      expect(CalendarEvent.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          startTime: expect.any(Object)
        })
      );
    });
  });
});
