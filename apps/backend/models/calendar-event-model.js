/**
 * Calendar Event Model
 *
 * Manages calendar events for inspector scheduling, farm inspections,
 * and general appointments in the GACP certification system.
 *
 * Features:
 * - Inspector availability tracking
 * - Farm inspection scheduling
 * - Recurring events support
 * - Google Calendar synchronization
 * - Conflict detection
 * - Automatic reminders
 *
 * @module models/calendar-event-model
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Calendar Event Schema
 */
const calendarEventSchema = new Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // Event Type
    eventType: {
      type: String,
      required: true,
      enum: {
        values: ['INSPECTION', 'MEETING', 'TRAINING', 'REVIEW', 'BREAK', 'BLOCKED', 'OTHER'],
        message: 'Invalid event type'
      },
      index: true
    },

    // Date and Time
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },

    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },

    // All-day event flag
    isAllDay: {
      type: Boolean,
      default: false
    },

    // Timezone
    timezone: {
      type: String,
      default: 'Asia/Bangkok'
    },

    // Participants
    organizer: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },
      name: String,
      email: String,
      role: String
    },

    attendees: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        email: String,
        role: String,
        status: {
          type: String,
          enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE'],
          default: 'PENDING'
        },
        responseTime: Date
      }
    ],

    // Related Entities
    relatedTo: {
      entityType: {
        type: String,
        enum: ['APPLICATION', 'FARM', 'INSPECTION', 'CERTIFICATE', 'JOB_ASSIGNMENT'],
        index: true
      },
      entityId: {
        type: Schema.Types.ObjectId,
        index: true
      },
      entityNumber: String // For display (e.g., application number)
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ['ONLINE', 'FARM', 'OFFICE', 'OTHER'],
        default: 'OFFICE'
      },
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      farmId: {
        type: Schema.Types.ObjectId,
        ref: 'Farm'
      },
      meetingUrl: String, // For online meetings
      meetingPlatform: String // 'zoom', 'teams', 'google-meet', etc.
    },

    // Recurring Events
    recurrence: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      pattern: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']
      },
      interval: Number, // Every N days/weeks/months
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
      dayOfMonth: Number, // 1-31
      endDate: Date,
      occurrences: Number, // Total number of occurrences
      parentEventId: {
        type: Schema.Types.ObjectId,
        ref: 'CalendarEvent'
      }
    },

    // Status and State
    status: {
      type: String,
      enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'SCHEDULED',
      index: true
    },

    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    // Reminders
    reminders: [
      {
        type: {
          type: String,
          enum: ['EMAIL', 'SMS', 'LINE', 'PUSH'],
          required: true
        },
        minutesBefore: {
          type: Number,
          required: true
        },
        sent: {
          type: Boolean,
          default: false
        },
        sentAt: Date
      }
    ],

    // Google Calendar Integration
    googleCalendar: {
      eventId: String, // Google Calendar event ID
      syncEnabled: {
        type: Boolean,
        default: false
      },
      lastSyncAt: Date,
      syncStatus: {
        type: String,
        enum: ['SYNCED', 'PENDING', 'FAILED', 'DISABLED'],
        default: 'DISABLED'
      },
      syncError: String,
      calendarId: String // Google Calendar ID
    },

    // Conflict Detection
    hasConflict: {
      type: Boolean,
      default: false
    },

    conflicts: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: 'CalendarEvent'
        },
        reason: String,
        detectedAt: Date
      }
    ],

    // Additional Metadata
    color: String, // For UI display
    tags: [String],
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },

    // Notes and Attachments
    notes: String,
    attachments: [
      {
        filename: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: Date
      }
    ],

    // Visibility
    visibility: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE', 'TEAM'],
      default: 'TEAM'
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'calendar_events'
  }
);

// Indexes for Performance
calendarEventSchema.index({ startTime: 1, endTime: 1 });
calendarEventSchema.index({ 'organizer.userId': 1, startTime: 1 });
calendarEventSchema.index({ 'attendees.userId': 1, startTime: 1 });
calendarEventSchema.index({ eventType: 1, status: 1 });
calendarEventSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });
calendarEventSchema.index({ 'location.farmId': 1 });
calendarEventSchema.index({ 'googleCalendar.eventId': 1 }, { sparse: true });

// Compound index for conflict detection
calendarEventSchema.index({ 'attendees.userId': 1, startTime: 1, endTime: 1, status: 1 });

/**
 * Check if event overlaps with another time range
 */
calendarEventSchema.methods.overlaps = function (otherStartTime, otherEndTime) {
  return this.startTime < otherEndTime && this.endTime > otherStartTime;
};

/**
 * Get event duration in minutes
 */
calendarEventSchema.methods.getDuration = function () {
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
};

/**
 * Check if event is upcoming
 */
calendarEventSchema.methods.isUpcoming = function () {
  return this.startTime > new Date() && this.status !== 'CANCELLED';
};

/**
 * Check if event is in progress
 */
calendarEventSchema.methods.isInProgress = function () {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.status === 'CONFIRMED';
};

/**
 * Check if event is past
 */
calendarEventSchema.methods.isPast = function () {
  return this.endTime < new Date();
};

/**
 * Mark event as completed
 */
calendarEventSchema.methods.markCompleted = async function () {
  this.status = 'COMPLETED';
  return await this.save();
};

/**
 * Cancel event
 */
calendarEventSchema.methods.cancel = async function (userId, reason) {
  this.status = 'CANCELLED';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  return await this.save();
};

/**
 * Add reminder
 */
calendarEventSchema.methods.addReminder = function (type, minutesBefore) {
  this.reminders.push({
    type,
    minutesBefore,
    sent: false
  });
  return this.save();
};

/**
 * Mark reminder as sent
 */
calendarEventSchema.methods.markReminderSent = function (reminderIndex) {
  if (this.reminders[reminderIndex]) {
    this.reminders[reminderIndex].sent = true;
    this.reminders[reminderIndex].sentAt = new Date();
    return this.save();
  }
};

/**
 * Static: Find events by date range
 */
calendarEventSchema.statics.findByDateRange = function (startDate, endDate, filter = {}) {
  return this.find({
    startTime: { $lte: endDate },
    endTime: { $gte: startDate },
    isDeleted: false,
    ...filter
  }).sort({ startTime: 1 });
};

/**
 * Static: Find user events
 */
calendarEventSchema.statics.findUserEvents = function (userId, startDate, endDate) {
  return this.find({
    $or: [{ 'organizer.userId': userId }, { 'attendees.userId': userId }],
    startTime: { $lte: endDate },
    endTime: { $gte: startDate },
    isDeleted: false
  }).sort({ startTime: 1 });
};

/**
 * Static: Check for conflicts
 */
calendarEventSchema.statics.findConflicts = async function (
  userId,
  startTime,
  endTime,
  excludeEventId = null
) {
  const query = {
    'attendees.userId': userId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    isDeleted: false
  };

  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  return await this.find(query);
};

/**
 * Static: Find events needing reminders
 */
calendarEventSchema.statics.findEventsNeedingReminders = async function () {
  const now = new Date();

  return await this.find({
    status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    startTime: { $gt: now },
    'reminders.sent': false,
    isDeleted: false
  });
};

/**
 * Pre-save hook: Detect conflicts
 */
calendarEventSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('startTime') || this.isModified('endTime')) {
    // Check for conflicts with other events
    const attendeeIds = this.attendees.map(a => a.userId);
    attendeeIds.push(this.organizer.userId);

    const conflicts = await this.constructor.findConflicts(
      attendeeIds,
      this.startTime,
      this.endTime,
      this._id
    );

    this.hasConflict = conflicts.length > 0;
    this.conflicts = conflicts.map(c => ({
      eventId: c._id,
      reason: 'Time overlap detected',
      detectedAt: new Date()
    }));
  }

  next();
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
