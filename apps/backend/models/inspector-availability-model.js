/**
 * Inspector Availability Model
 *
 * Manages inspector working hours, availability slots, time off,
 * and scheduling preferences for the GACP inspection calendar.
 *
 * Features:
 * - Regular working hours configuration
 * - Custom availability slots
 * - Time off and holidays
 * - Maximum daily bookings
 * - Travel time between farms
 * - Google Calendar sync preferences
 *
 * @module models/inspector-availability-model
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Inspector Availability Schema
 */
const inspectorAvailabilitySchema = new Schema(
  {
    // Inspector Reference
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    inspectorName: String,
    inspectorEmail: String,

    // Regular Working Hours (Weekly Pattern)
    workingHours: [
      {
        dayOfWeek: {
          type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          required: true,
          min: 0,
          max: 6
        },
        isWorkingDay: {
          type: Boolean,
          default: true
        },
        slots: [
          {
            startTime: {
              type: String, // Format: "HH:mm" (e.g., "09:00")
              required: true
            },
            endTime: {
              type: String, // Format: "HH:mm" (e.g., "17:00")
              required: true
            },
            slotType: {
              type: String,
              enum: ['AVAILABLE', 'BREAK', 'ADMIN'],
              default: 'AVAILABLE'
            }
          }
        ]
      }
    ],

    // Custom Availability (Overrides regular hours for specific dates)
    customAvailability: [
      {
        date: {
          type: Date,
          required: true,
          index: true
        },
        isAvailable: {
          type: Boolean,
          default: true
        },
        slots: [
          {
            startTime: String, // "HH:mm"
            endTime: String, // "HH:mm"
            reason: String
          }
        ],
        note: String
      }
    ],

    // Time Off and Holidays
    timeOff: [
      {
        startDate: {
          type: Date,
          required: true,
          index: true
        },
        endDate: {
          type: Date,
          required: true
        },
        reason: {
          type: String,
          enum: ['VACATION', 'SICK_LEAVE', 'PERSONAL', 'HOLIDAY', 'TRAINING', 'OTHER'],
          required: true
        },
        description: String,
        status: {
          type: String,
          enum: ['PENDING', 'APPROVED', 'REJECTED'],
          default: 'PENDING'
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        approvedAt: Date
      }
    ],

    // Booking Constraints
    constraints: {
      maxDailyInspections: {
        type: Number,
        default: 4, // Maximum inspections per day
        min: 1,
        max: 10
      },
      minInspectionDuration: {
        type: Number,
        default: 120, // Minutes (2 hours)
        min: 30
      },
      maxInspectionDuration: {
        type: Number,
        default: 480, // Minutes (8 hours)
        min: 60
      },
      travelTimeBetweenFarms: {
        type: Number,
        default: 60, // Minutes (1 hour buffer)
        min: 0
      },
      advanceBookingDays: {
        type: Number,
        default: 3, // Minimum days in advance for booking
        min: 0
      },
      maxAdvanceBookingDays: {
        type: Number,
        default: 90, // Maximum days in advance for booking
        min: 1
      }
    },

    // Service Areas (Provinces/Regions)
    serviceAreas: [
      {
        province: {
          type: String,
          required: true
        },
        districts: [String],
        isPreferred: {
          type: Boolean,
          default: false
        },
        travelTimeMinutes: Number
      }
    ],

    // Google Calendar Integration
    googleCalendarSync: {
      enabled: {
        type: Boolean,
        default: false
      },
      calendarId: String, // Primary calendar ID
      accessToken: String, // Encrypted
      refreshToken: String, // Encrypted
      tokenExpiry: Date,
      lastSyncAt: Date,
      syncFrequency: {
        type: String,
        enum: ['REALTIME', 'HOURLY', 'DAILY'],
        default: 'HOURLY'
      },
      syncDirection: {
        type: String,
        enum: ['BIDIRECTIONAL', 'TO_GOOGLE', 'FROM_GOOGLE'],
        default: 'BIDIRECTIONAL'
      }
    },

    // Preferences
    preferences: {
      preferredInspectionTypes: [
        {
          type: String,
          enum: ['CANNABIS', 'MEDICINAL_PLANTS', 'ORGANIC', 'GACP']
        }
      ],
      preferredTimeSlots: [
        {
          type: String,
          enum: ['MORNING', 'AFTERNOON', 'EVENING']
        }
      ],
      autoAcceptBookings: {
        type: Boolean,
        default: false
      },
      requireBookingConfirmation: {
        type: Boolean,
        default: true
      },
      notifyOnNewBooking: {
        type: Boolean,
        default: true
      },
      notifyOn24hReminder: {
        type: Boolean,
        default: true
      }
    },

    // Statistics
    statistics: {
      totalInspections: {
        type: Number,
        default: 0
      },
      completedInspections: {
        type: Number,
        default: 0
      },
      cancelledInspections: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0
      },
      lastInspectionDate: Date
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    activatedAt: Date,
    deactivatedAt: Date,
    deactivationReason: String
  },
  {
    timestamps: true,
    collection: 'inspector_availability'
  }
);

// Indexes
inspectorAvailabilitySchema.index({ inspectorId: 1, 'timeOff.startDate': 1 });
inspectorAvailabilitySchema.index({ 'customAvailability.date': 1 });
inspectorAvailabilitySchema.index({ 'serviceAreas.province': 1 });

/**
 * Check if inspector is available on a specific date
 */
inspectorAvailabilitySchema.methods.isAvailableOn = function (date) {
  // Check if date falls within time off
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const hasTimeOff = this.timeOff.some(timeOff => {
    const start = new Date(timeOff.startDate);
    const end = new Date(timeOff.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return dateObj >= start && dateObj <= end && timeOff.status === 'APPROVED';
  });

  if (hasTimeOff) return false;

  // Check custom availability
  const customAvail = this.customAvailability.find(
    ca => new Date(ca.date).toDateString() === dateObj.toDateString()
  );

  if (customAvail) {
    return customAvail.isAvailable;
  }

  // Check regular working hours
  const dayOfWeek = dateObj.getDay();
  const workingDay = this.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

  return workingDay ? workingDay.isWorkingDay : false;
};

/**
 * Get available time slots for a specific date
 */
inspectorAvailabilitySchema.methods.getAvailableSlotsOn = function (date) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Check custom availability first
  const customAvail = this.customAvailability.find(
    ca => new Date(ca.date).toDateString() === dateObj.toDateString()
  );

  if (customAvail && customAvail.isAvailable) {
    return customAvail.slots;
  }

  // Return regular working hours
  const workingDay = this.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

  if (workingDay && workingDay.isWorkingDay) {
    return workingDay.slots.filter(slot => slot.slotType === 'AVAILABLE');
  }

  return [];
};

/**
 * Add time off
 */
inspectorAvailabilitySchema.methods.addTimeOff = function (
  startDate,
  endDate,
  reason,
  description
) {
  this.timeOff.push({
    startDate,
    endDate,
    reason,
    description,
    status: 'PENDING'
  });
  return this.save();
};

/**
 * Approve time off
 */
inspectorAvailabilitySchema.methods.approveTimeOff = function (timeOffId, approverId) {
  const timeOff = this.timeOff.id(timeOffId);
  if (timeOff) {
    timeOff.status = 'APPROVED';
    timeOff.approvedBy = approverId;
    timeOff.approvedAt = new Date();
    return this.save();
  }
  throw new Error('Time off not found');
};

/**
 * Check if serves a specific area
 */
inspectorAvailabilitySchema.methods.servesArea = function (province, district = null) {
  const area = this.serviceAreas.find(sa => sa.province === province);
  if (!area) return false;
  if (district && area.districts.length > 0) {
    return area.districts.includes(district);
  }
  return true;
};

/**
 * Static: Find available inspectors for date range and area
 */
inspectorAvailabilitySchema.statics.findAvailableInspectors = async function (
  startDate,
  endDate,
  province = null
) {
  const query = {
    isActive: true
  };

  if (province) {
    query['serviceAreas.province'] = province;
  }

  const inspectors = await this.find(query);

  // Filter by date availability
  return inspectors.filter(inspector => {
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      if (!inspector.isAvailableOn(currentDate)) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return true;
  });
};

/**
 * Static: Get all working hours template
 */
inspectorAvailabilitySchema.statics.getDefaultWorkingHours = function () {
  return [
    { dayOfWeek: 0, isWorkingDay: false, slots: [] }, // Sunday
    {
      dayOfWeek: 1,
      isWorkingDay: true,
      slots: [{ startTime: '09:00', endTime: '17:00', slotType: 'AVAILABLE' }]
    },
    {
      dayOfWeek: 2,
      isWorkingDay: true,
      slots: [{ startTime: '09:00', endTime: '17:00', slotType: 'AVAILABLE' }]
    },
    {
      dayOfWeek: 3,
      isWorkingDay: true,
      slots: [{ startTime: '09:00', endTime: '17:00', slotType: 'AVAILABLE' }]
    },
    {
      dayOfWeek: 4,
      isWorkingDay: true,
      slots: [{ startTime: '09:00', endTime: '17:00', slotType: 'AVAILABLE' }]
    },
    {
      dayOfWeek: 5,
      isWorkingDay: true,
      slots: [{ startTime: '09:00', endTime: '17:00', slotType: 'AVAILABLE' }]
    },
    { dayOfWeek: 6, isWorkingDay: false, slots: [] } // Saturday
  ];
};

const InspectorAvailability = mongoose.model('InspectorAvailability', inspectorAvailabilitySchema);

module.exports = InspectorAvailability;
