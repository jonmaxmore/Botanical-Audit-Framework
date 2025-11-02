/**
 * Calendar Routes
 *
 * REST API endpoints for calendar and scheduling operations.
 * Handles events, availability, bookings, and Google Calendar sync.
 *
 * @module routes/calendar.routes
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const express = require('express');
const router = express.Router();
const CalendarService = require('../services/calendar.service');
const calendarService = new CalendarService();
const googleCalendarService = require('../services/google-calendar.service');
const { authenticate } = require('../middleware/auth');
const { requireStaff, requireInspector } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/asyncHandler');
const { AppError } = require('../shared/errors');

/**
 * @route   POST /api/calendar/events
 * @desc    Create a new calendar event
 * @access  Private (Staff, Inspector)
 */
router.post(
  '/events',
  authenticate,
  requireStaff(),
  asyncHandler(async (req, res) => {
    const event = await calendarService.createEvent(req.body, req.user);
    res.status(201).json({
      success: true,
      data: event
    });
  })
);

/**
 * @route   GET /api/calendar/events
 * @desc    Get calendar events with filters
 * @access  Private (All authenticated users)
 * @query   startDate, endDate, eventType, status, userId
 */
router.get(
  '/events',
  authenticate,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, eventType, status, userId } = req.query;

    // Build filter
    const filter = {
      isDeleted: false
    };

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    if (status) {
      filter.status = status;
    }

    // Filter by user (organizer or attendee)
    const targetUserId = userId || req.user._id;
    filter.$or = [{ 'organizer.userId': targetUserId }, { 'attendees.userId': targetUserId }];

    const CalendarEvent = require('../models/calendar-event-model');
    const events = await CalendarEvent.find(filter).sort({ startTime: 1 }).limit(100);

    res.json({
      success: true,
      data: events,
      count: events.length
    });
  })
);

/**
 * @route   GET /api/calendar/events/:id
 * @desc    Get a single calendar event by ID
 * @access  Private (All authenticated users)
 */
router.get(
  '/events/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const CalendarEvent = require('../models/calendar-event-model');
    const event = await CalendarEvent.findById(req.params.id);

    if (!event || event.isDeleted) {
      throw new AppError('Event not found', 404);
    }

    res.json({
      success: true,
      data: event
    });
  })
);

/**
 * @route   PUT /api/calendar/events/:id
 * @desc    Update a calendar event
 * @access  Private (Event organizer or Admin)
 */
router.put(
  '/events/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const event = await calendarService.updateEvent(req.params.id, req.body, req.user);
    res.json({
      success: true,
      data: event
    });
  })
);

/**
 * @route   DELETE /api/calendar/events/:id
 * @desc    Delete (soft delete) a calendar event
 * @access  Private (Event organizer or Admin)
 */
router.delete(
  '/events/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const event = await calendarService.deleteEvent(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: event
    });
  })
);

/**
 * @route   GET /api/calendar/upcoming
 * @desc    Get upcoming events for current user
 * @access  Private (All authenticated users)
 * @query   days (default: 7)
 */
router.get(
  '/upcoming',
  authenticate,
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const events = await calendarService.getUpcomingEvents(req.user._id, days);

    res.json({
      success: true,
      data: events,
      count: events.length
    });
  })
);

/**
 * @route   GET /api/calendar/availability/:inspectorId
 * @desc    Get available time slots for an inspector
 * @access  Private (All authenticated users)
 * @query   startDate, endDate, duration (default: 120 minutes)
 */
router.get(
  '/availability/:inspectorId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, duration } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const slots = await calendarService.getAvailableSlots(
      req.params.inspectorId,
      new Date(startDate),
      new Date(endDate),
      parseInt(duration) || 120
    );

    res.json({
      success: true,
      data: slots,
      count: slots.length
    });
  })
);

/**
 * @route   POST /api/calendar/bookings/inspection
 * @desc    Book an inspection appointment
 * @access  Private (Farmer, Staff)
 */
router.post(
  '/bookings/inspection',
  authenticate,
  asyncHandler(async (req, res) => {
    const { farmId, inspectorId, startTime, endTime, applicationId } = req.body;

    if (!farmId || !inspectorId || !startTime || !endTime || !applicationId) {
      throw new AppError('Missing required booking information', 400);
    }

    const booking = await calendarService.bookInspection(
      {
        farmId,
        inspectorId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        applicationId
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Inspection booked successfully',
      data: booking
    });
  })
);

/**
 * @route   PUT /api/calendar/events/:id/confirm
 * @desc    Confirm a scheduled event
 * @access  Private (Inspector, Admin)
 */
router.put(
  '/events/:id/confirm',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const event = await calendarService.updateEvent(
      req.params.id,
      { status: 'CONFIRMED' },
      req.user
    );

    res.json({
      success: true,
      message: 'Event confirmed',
      data: event
    });
  })
);

/**
 * @route   PUT /api/calendar/events/:id/cancel
 * @desc    Cancel an event
 * @access  Private (Event organizer or Admin)
 */
router.put(
  '/events/:id/cancel',
  authenticate,
  asyncHandler(async (req, res) => {
    const CalendarEvent = require('../models/calendar-event-model');
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const updatedEvent = await event.cancel(req.user._id, req.body.reason);

    res.json({
      success: true,
      message: 'Event cancelled',
      data: updatedEvent
    });
  })
);

/**
 * @route   PUT /api/calendar/events/:id/complete
 * @desc    Mark an event as completed
 * @access  Private (Inspector, Admin)
 */
router.put(
  '/events/:id/complete',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const CalendarEvent = require('../models/calendar-event-model');
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    event.markCompleted();
    await event.save();

    res.json({
      success: true,
      message: 'Event marked as completed',
      data: event
    });
  })
);

/**
 * @route   GET /api/calendar/conflicts/:userId
 * @desc    Check for scheduling conflicts
 * @access  Private (Staff, Inspector)
 * @query   startTime, endTime, excludeEventId
 */
router.get(
  '/conflicts/:userId',
  authenticate,
  requireStaff(),
  asyncHandler(async (req, res) => {
    const { startTime, endTime, excludeEventId } = req.query;

    if (!startTime || !endTime) {
      throw new AppError('Start time and end time are required', 400);
    }

    const CalendarEvent = require('../models/calendar-event-model');
    const conflicts = await CalendarEvent.findConflicts(
      req.params.userId,
      new Date(startTime),
      new Date(endTime),
      excludeEventId
    );

    res.json({
      success: true,
      data: conflicts,
      hasConflicts: conflicts.length > 0,
      count: conflicts.length
    });
  })
);

/**
 * @route   GET /api/calendar/events/:id/recurring-instances
 * @desc    Get instances of a recurring event
 * @access  Private (All authenticated users)
 * @query   startDate, endDate
 */
router.get(
  '/events/:id/recurring-instances',
  authenticate,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const instances = await calendarService.getRecurringInstances(
      req.params.id,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: instances,
      count: instances.length
    });
  })
);

/**
 * @route   PUT /api/calendar/events/:id/rsvp
 * @desc    Update RSVP status for an attendee
 * @access  Private (Event attendee)
 */
router.put(
  '/events/:id/rsvp',
  authenticate,
  asyncHandler(async (req, res) => {
    const { rsvpStatus } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'TENTATIVE'].includes(rsvpStatus)) {
      throw new AppError('Invalid RSVP status', 400);
    }

    const CalendarEvent = require('../models/calendar-event-model');
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Find and update attendee RSVP
    const attendee = event.attendees.find(a => a.userId.toString() === req.user._id.toString());

    if (!attendee) {
      throw new AppError('You are not an attendee of this event', 403);
    }

    attendee.rsvpStatus = rsvpStatus;
    await event.save();

    res.json({
      success: true,
      message: 'RSVP updated successfully',
      data: event
    });
  })
);

/**
 * @route   POST /api/calendar/reminders/send
 * @desc    Process and send event reminders (cron job endpoint)
 * @access  Private (Admin only)
 */
router.post(
  '/reminders/send',
  authenticate,
  requireStaff(),
  asyncHandler(async (req, res) => {
    const events = await calendarService.getEventsNeedingReminders();
    const results = [];

    for (const event of events) {
      try {
        await calendarService.sendReminders(event._id);
        results.push({ eventId: event._id, success: true });
      } catch (error) {
        results.push({ eventId: event._id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Reminders processed',
      data: results,
      total: events.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  })
);

/**
 * @route   GET /api/calendar/statistics
 * @desc    Get calendar statistics for current user
 * @access  Private (All authenticated users)
 */
router.get(
  '/statistics',
  authenticate,
  asyncHandler(async (req, res) => {
    const CalendarEvent = require('../models/calendar-event-model');
    const userId = req.user._id;

    // Get statistics
    const [totalEvents, upcomingEvents, completedEvents, cancelledEvents] = await Promise.all([
      CalendarEvent.countDocuments({
        'organizer.userId': userId,
        isDeleted: false
      }),
      CalendarEvent.countDocuments({
        'organizer.userId': userId,
        startTime: { $gte: new Date() },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] },
        isDeleted: false
      }),
      CalendarEvent.countDocuments({
        'organizer.userId': userId,
        status: 'COMPLETED',
        isDeleted: false
      }),
      CalendarEvent.countDocuments({
        'organizer.userId': userId,
        status: 'CANCELLED',
        isDeleted: false
      })
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        cancelledEvents
      }
    });
  })
);

// ========== Google Calendar Integration Routes ==========

/**
 * @route   GET /api/calendar/google/auth
 * @desc    Get Google OAuth2 authorization URL
 * @access  Private (Inspector)
 */
router.get(
  '/google/auth',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const authUrl = googleCalendarService.getAuthUrl(req.user._id);
    res.json({
      success: true,
      data: { authUrl }
    });
  })
);

/**
 * @route   GET /api/calendar/google/callback
 * @desc    Handle Google OAuth2 callback
 * @access  Public (OAuth callback)
 */
router.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);

    // Enable sync for inspector
    const inspectorId = state; // User ID passed in state parameter
    await googleCalendarService.enableSync(inspectorId, tokens);

    // Redirect to success page
    res.redirect('/dashboard?google_sync=success');
  })
);

/**
 * @route   POST /api/calendar/google/sync/enable
 * @desc    Enable Google Calendar sync
 * @access  Private (Inspector)
 */
router.post(
  '/google/sync/enable',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const { calendarId } = req.body;
    const authUrl = googleCalendarService.getAuthUrl(req.user._id);

    res.json({
      success: true,
      message: 'Please authorize access to Google Calendar',
      data: { authUrl, calendarId }
    });
  })
);

/**
 * @route   POST /api/calendar/google/sync/disable
 * @desc    Disable Google Calendar sync
 * @access  Private (Inspector)
 */
router.post(
  '/google/sync/disable',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const availability = await googleCalendarService.disableSync(req.user._id);
    res.json({
      success: true,
      message: 'Google Calendar sync disabled',
      data: availability
    });
  })
);

/**
 * @route   POST /api/calendar/google/sync/now
 * @desc    Trigger immediate sync with Google Calendar
 * @access  Private (Inspector)
 */
router.post(
  '/google/sync/now',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const results = await googleCalendarService.fullSync(req.user._id);
    res.json({
      success: true,
      message: 'Sync completed',
      data: results
    });
  })
);

/**
 * @route   GET /api/calendar/google/sync/status
 * @desc    Get Google Calendar sync status
 * @access  Private (Inspector)
 */
router.get(
  '/google/sync/status',
  authenticate,
  requireInspector(),
  asyncHandler(async (req, res) => {
    const InspectorAvailability = require('../models/inspector-availability-model');
    const availability = await InspectorAvailability.findOne({
      inspectorId: req.user._id
    });

    if (!availability) {
      throw new AppError('Availability not configured', 404);
    }

    res.json({
      success: true,
      data: {
        enabled: availability.googleCalendarSync.enabled,
        calendarId: availability.googleCalendarSync.calendarId,
        lastSyncAt: availability.googleCalendarSync.lastSyncAt,
        syncStatus: availability.googleCalendarSync.syncStatus
      }
    });
  })
);

module.exports = router;
