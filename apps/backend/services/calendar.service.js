/**
 * Calendar Service
 *
 * Business logic for calendar and scheduling operations.
 * Handles event creation, conflict detection, availability management,
 * Google Calendar sync, and booking workflows for GACP inspections.
 *
 * @module services/calendar.service
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const CalendarEvent = require('../models/calendar-event-model');
const InspectorAvailability = require('../models/inspector-availability-model');
const logger = require('../src/utils/logger');
const { AppError } = require('../shared/errors');

/**
 * Calendar Service Class
 */
class CalendarService {
  constructor(notificationService = null) {
    this.notificationService = notificationService;
  }

  /**
   * Create a new calendar event
   *
   * @param {Object} eventData - Event data
   * @param {string} eventData.title - Event title
   * @param {string} eventData.eventType - Event type (INSPECTION, MEETING, etc.)
   * @param {Date} eventData.startTime - Start time
   * @param {Date} eventData.endTime - End time
   * @param {Object} eventData.organizer - Organizer details
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, currentUser) {
    try {
      logger.info('Creating calendar event', {
        eventType: eventData.eventType,
        organizerId: currentUser._id
      });

      // Validate date range
      this._validateDateRange(eventData.startTime, eventData.endTime);

      // Check if organizer is inspector and has availability configured
      if (this._isInspectorRole(currentUser.role)) {
        await this._validateInspectorAvailability(
          currentUser._id,
          eventData.startTime,
          eventData.endTime
        );
      }

      // Check for conflicts
      const conflicts = await this._checkConflicts(
        eventData.organizer.userId,
        eventData.startTime,
        eventData.endTime,
        null // excludeEventId
      );

      // Create event with conflict status
      const event = new CalendarEvent({
        ...eventData,
        hasConflict: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
          conflictingEventId: c._id,
          conflictingEventTitle: c.title,
          reason: 'Time overlap detected',
          detectedAt: new Date()
        }))
      });

      await event.save();

      logger.info('Calendar event created successfully', {
        eventId: event._id,
        hasConflict: event.hasConflict
      });

      return event;
    } catch (error) {
      logger.error('Error creating calendar event', { error: error.message });
      throw error;
    }
  }

  /**
   * Update an existing calendar event
   *
   * @param {string} eventId - Event ID
   * @param {Object} updates - Update data
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updates, currentUser) {
    try {
      logger.info('Updating calendar event', { eventId });

      const event = await CalendarEvent.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check permissions
      this._checkEventPermissions(event, currentUser);

      // If time is being updated, validate and check conflicts
      if (updates.startTime || updates.endTime) {
        const newStartTime = updates.startTime || event.startTime;
        const newEndTime = updates.endTime || event.endTime;

        this._validateDateRange(newStartTime, newEndTime);

        const conflicts = await this._checkConflicts(
          event.organizer.userId,
          newStartTime,
          newEndTime,
          eventId
        );

        updates.hasConflict = conflicts.length > 0;
        updates.conflicts = conflicts.map(c => ({
          conflictingEventId: c._id,
          conflictingEventTitle: c.title,
          reason: 'Time overlap detected',
          detectedAt: new Date()
        }));
      }

      // Apply updates
      Object.assign(event, updates);
      await event.save();

      logger.info('Calendar event updated successfully', { eventId });
      return event;
    } catch (error) {
      logger.error('Error updating calendar event', {
        eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete (soft delete) a calendar event
   *
   * @param {string} eventId - Event ID
   * @param {Object} currentUser - Current authenticated user
   * @returns {Promise<Object>} Deleted event
   */
  async deleteEvent(eventId, currentUser) {
    try {
      logger.info('Deleting calendar event', { eventId });

      const event = await CalendarEvent.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check permissions
      this._checkEventPermissions(event, currentUser);

      // Soft delete
      event.isDeleted = true;
      event.deletedAt = new Date();
      event.deletedBy = currentUser._id;
      await event.save();

      logger.info('Calendar event deleted successfully', { eventId });
      return event;
    } catch (error) {
      logger.error('Error deleting calendar event', {
        eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get available time slots for an inspector
   *
   * @param {string} inspectorId - Inspector ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} duration - Required duration in minutes
   * @returns {Promise<Array>} Available time slots
   */
  async getAvailableSlots(inspectorId, startDate, endDate, duration = 120) {
    try {
      logger.info('Getting available slots', {
        inspectorId,
        startDate,
        endDate,
        duration
      });

      // Get inspector availability configuration
      const availability = await InspectorAvailability.findOne({
        inspectorId,
        isActive: true
      });

      if (!availability) {
        throw new AppError('Inspector availability not configured', 404);
      }

      // Get existing bookings in date range
      const existingEvents = await CalendarEvent.find({
        'organizer.userId': inspectorId,
        startTime: { $gte: startDate, $lte: endDate },
        status: { $nin: ['CANCELLED', 'NO_SHOW'] },
        isDeleted: false
      }).sort({ startTime: 1 });

      // Generate available slots
      const slots = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        // Check if inspector is available on this date
        if (availability.isAvailableOn(currentDate)) {
          const daySlots = availability.getAvailableSlotsOn(currentDate);

          for (const slot of daySlots) {
            const slotStart = this._combineDateTime(currentDate, slot.startTime);
            const slotEnd = this._combineDateTime(currentDate, slot.endTime);

            // Check if slot can accommodate the required duration
            const slotDuration = (slotEnd - slotStart) / (1000 * 60); // minutes
            if (slotDuration >= duration) {
              // Find free sub-slots within this availability slot
              const freeSlots = this._findFreeSlots(
                slotStart,
                slotEnd,
                existingEvents,
                duration,
                availability.constraints.travelTimeBetweenFarms
              );
              slots.push(...freeSlots);
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      logger.info('Found available slots', { count: slots.length });
      return slots;
    } catch (error) {
      logger.error('Error getting available slots', { error: error.message });
      throw error;
    }
  }

  /**
   * Book an inspection appointment
   *
   * @param {Object} bookingData - Booking data
   * @param {string} bookingData.farmId - Farm ID
   * @param {string} bookingData.inspectorId - Inspector ID
   * @param {Date} bookingData.startTime - Start time
   * @param {Date} bookingData.endTime - End time
   * @param {string} bookingData.applicationId - Related application ID
   * @param {Object} requester - User requesting the booking
   * @returns {Promise<Object>} Created booking event
   */
  async bookInspection(bookingData, requester) {
    try {
      logger.info('Booking inspection', {
        farmId: bookingData.farmId,
        inspectorId: bookingData.inspectorId
      });

      // Validate inspector availability
      const availability = await InspectorAvailability.findOne({
        inspectorId: bookingData.inspectorId,
        isActive: true
      });

      if (!availability) {
        throw new AppError('Inspector not available for booking', 400);
      }

      // Check advance booking constraints
      const now = new Date();
      const startTime = new Date(bookingData.startTime);
      const daysInAdvance = Math.ceil((startTime - now) / (1000 * 60 * 60 * 24));

      if (daysInAdvance < availability.constraints.advanceBookingDays) {
        throw new AppError(
          `Booking must be made at least ${availability.constraints.advanceBookingDays} days in advance`,
          400
        );
      }

      if (daysInAdvance > availability.constraints.maxAdvanceBookingDays) {
        throw new AppError(
          `Booking cannot be made more than ${availability.constraints.maxAdvanceBookingDays} days in advance`,
          400
        );
      }

      // Check if time slot is available
      const conflicts = await this._checkConflicts(
        bookingData.inspectorId,
        bookingData.startTime,
        bookingData.endTime,
        null
      );

      if (conflicts.length > 0) {
        throw new AppError('Selected time slot is not available', 409);
      }

      // Check daily inspection limit
      const dailyCount = await this._getDailyInspectionCount(
        bookingData.inspectorId,
        bookingData.startTime
      );

      if (dailyCount >= availability.constraints.maxDailyInspections) {
        throw new AppError('Inspector has reached maximum daily inspections', 400);
      }

      // Get inspector details
      const User = require('../modules/user-management/infrastructure/models/User');
      const inspector = await User.findById(bookingData.inspectorId);

      // Create inspection event
      const event = await this.createEvent(
        {
          title: `Farm Inspection - ${bookingData.farmId}`,
          description: `GACP inspection appointment for farm ${bookingData.farmId}`,
          eventType: 'INSPECTION',
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          organizer: {
            userId: inspector._id,
            name: inspector.name,
            email: inspector.email,
            role: inspector.role
          },
          attendees: [
            {
              userId: requester._id,
              name: requester.name,
              email: requester.email,
              role: requester.role,
              rsvpStatus: 'ACCEPTED'
            }
          ],
          location: {
            type: 'FARM',
            farmId: bookingData.farmId
          },
          relatedTo: [
            {
              entityType: 'FARM',
              entityId: bookingData.farmId
            },
            {
              entityType: 'APPLICATION',
              entityId: bookingData.applicationId
            }
          ],
          status: availability.preferences.autoAcceptBookings ? 'CONFIRMED' : 'SCHEDULED',
          priority: 'HIGH',
          reminders: [
            {
              type: 'EMAIL',
              minutesBefore: 1440, // 24 hours
              sent: false
            },
            {
              type: 'LINE',
              minutesBefore: 60, // 1 hour
              sent: false
            }
          ]
        },
        inspector
      );

      // TODO: Send booking notification to inspector and farmer
      // await this._sendBookingNotification(event, inspector, requester);
      if (this.notificationService && this.notificationService.sendBookingConfirmation) {
        await this.notificationService.sendBookingConfirmation(event, inspector, requester);
      }

      logger.info('Inspection booked successfully', {
        eventId: event._id,
        farmId: bookingData.farmId
      });

      return event;
    } catch (error) {
      logger.error('Error booking inspection', { error: error.message });
      throw error;
    }
  }

  /**
   * Get upcoming events for a user
   *
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>} Upcoming events
   */
  async getUpcomingEvents(userId, days = 7) {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const events = await CalendarEvent.find({
        $or: [{ 'organizer.userId': userId }, { 'attendees.userId': userId }],
        startTime: { $gte: now, $lte: endDate },
        status: { $nin: ['CANCELLED', 'NO_SHOW'] },
        isDeleted: false
      }).sort({ startTime: 1 });

      return events;
    } catch (error) {
      logger.error('Error getting upcoming events', { error: error.message });
      throw error;
    }
  }

  /**
   * Get events needing reminders
   *
   * @returns {Promise<Array>} Events needing reminders
   */
  async getEventsNeedingReminders() {
    try {
      const events = await CalendarEvent.findEventsNeedingReminders();
      logger.info('Found events needing reminders', { count: events.length });
      return events;
    } catch (error) {
      logger.error('Error getting events needing reminders', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send reminders for an event
   *
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Updated event
   */
  async sendReminders(eventId) {
    try {
      const event = await CalendarEvent.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // TODO: Integrate with notification service
      // For now, just mark reminders as sent
      event.reminders.forEach((reminder, index) => {
        if (!reminder.sent) {
          const now = new Date();
          const eventStart = new Date(event.startTime);
          const reminderTime = new Date(eventStart.getTime() - reminder.minutesBefore * 60 * 1000);

          if (now >= reminderTime) {
            event.markReminderSent(index);
            logger.info('Reminder sent', {
              eventId,
              reminderType: reminder.type,
              minutesBefore: reminder.minutesBefore
            });
          }
        }
      });

      await event.save();
      return event;
    } catch (error) {
      logger.error('Error sending reminders', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle recurring event instances
   *
   * @param {string} parentEventId - Parent recurring event ID
   * @param {Date} startDate - Start date for instances
   * @param {Date} endDate - End date for instances
   * @returns {Promise<Array>} Generated event instances
   */
  async getRecurringInstances(parentEventId, startDate, endDate) {
    try {
      const parentEvent = await CalendarEvent.findById(parentEventId);
      if (!parentEvent || !parentEvent.recurrence.isRecurring) {
        throw new AppError('Not a recurring event', 400);
      }

      const instances = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      const recurrence = parentEvent.recurrence;

      while (currentDate <= end) {
        // Check if instance should be generated based on pattern
        if (this._matchesRecurrencePattern(currentDate, recurrence)) {
          // Check if instance already exists or is an exception
          const isException = recurrence.exceptions.some(
            ex => ex.toDateString() === currentDate.toDateString()
          );

          if (!isException) {
            const instanceStart = new Date(currentDate);
            instanceStart.setHours(
              parentEvent.startTime.getHours(),
              parentEvent.startTime.getMinutes()
            );

            const duration = parentEvent.getDuration();
            const instanceEnd = new Date(instanceStart);
            instanceEnd.setMinutes(instanceEnd.getMinutes() + duration);

            instances.push({
              ...parentEvent.toObject(),
              _id: undefined,
              startTime: instanceStart,
              endTime: instanceEnd,
              recurrence: {
                ...parentEvent.recurrence.toObject(),
                parentEventId: parentEvent._id
              }
            });
          }
        }

        // Move to next date based on pattern
        currentDate = this._getNextRecurrenceDate(currentDate, recurrence);
      }

      return instances;
    } catch (error) {
      logger.error('Error generating recurring instances', {
        error: error.message
      });
      throw error;
    }
  }

  // ========== Private Helper Methods ==========

  /**
   * Validate date range
   */
  _validateDateRange(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
      throw new AppError('End time must be after start time', 400);
    }

    if (start < now) {
      throw new AppError('Cannot create events in the past', 400);
    }
  }

  /**
   * Check if user has inspector role
   */
  _isInspectorRole(role) {
    return ['DTAM_INSPECTOR', 'SENIOR_INSPECTOR'].includes(role);
  }

  /**
   * Validate inspector availability
   */
  async _validateInspectorAvailability(inspectorId, startTime, _endTime) {
    const availability = await InspectorAvailability.findOne({
      inspectorId,
      isActive: true
    });

    if (!availability) {
      throw new AppError(
        'Inspector availability not configured. Please set up your working hours first.',
        400
      );
    }

    const date = new Date(startTime);
    if (!availability.isAvailableOn(date)) {
      throw new AppError('Inspector is not available on the selected date', 400);
    }
  }

  /**
   * Check for scheduling conflicts
   */
  async _checkConflicts(userId, startTime, endTime, excludeEventId) {
    return await CalendarEvent.findConflicts(userId, startTime, endTime, excludeEventId);
  }

  /**
   * Check event permissions
   */
  _checkEventPermissions(event, user) {
    const isOrganizer = event.organizer.userId.toString() === user._id.toString();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('You do not have permission to modify this event', 403);
    }
  }

  /**
   * Combine date and time string
   */
  _combineDateTime(date, timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Find free time slots
   */
  _findFreeSlots(slotStart, slotEnd, existingEvents, duration, travelTime) {
    const freeSlots = [];
    let currentTime = new Date(slotStart);

    while (currentTime < slotEnd) {
      const potentialEnd = new Date(currentTime);
      potentialEnd.setMinutes(potentialEnd.getMinutes() + duration);

      if (potentialEnd > slotEnd) break;

      // Check if this slot overlaps with any existing event
      const hasOverlap = existingEvents.some(event => event.overlaps(currentTime, potentialEnd));

      if (!hasOverlap) {
        freeSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(potentialEnd),
          duration
        });
      }

      // Move to next slot (add duration + travel time)
      currentTime.setMinutes(currentTime.getMinutes() + duration + travelTime);
    }

    return freeSlots;
  }

  /**
   * Get daily inspection count
   */
  async _getDailyInspectionCount(inspectorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await CalendarEvent.countDocuments({
      'organizer.userId': inspectorId,
      eventType: 'INSPECTION',
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['CANCELLED', 'NO_SHOW'] },
      isDeleted: false
    });

    return count;
  }

  /**
   * Check if date matches recurrence pattern
   */
  _matchesRecurrencePattern(date, recurrence) {
    switch (recurrence.pattern) {
      case 'DAILY':
        return true;
      case 'WEEKLY':
        if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
          return recurrence.daysOfWeek.includes(date.getDay());
        }
        return true;
      case 'MONTHLY':
        // Repeat on same day of month
        return true;
      case 'YEARLY':
        // Repeat on same date each year
        return true;
      default:
        return false;
    }
  }

  /**
   * Get next recurrence date
   */
  _getNextRecurrenceDate(currentDate, recurrence) {
    const next = new Date(currentDate);
    const interval = recurrence.interval || 1;

    switch (recurrence.pattern) {
      case 'DAILY':
        next.setDate(next.getDate() + interval);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7 * interval);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }

    return next;
  }
}

module.exports = CalendarService;
