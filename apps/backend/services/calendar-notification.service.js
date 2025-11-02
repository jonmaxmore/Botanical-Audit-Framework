/**
 * Calendar Notification Integration
 *
 * Handles notification triggers for calendar events.
 * Integrates with existing notification service.
 *
 * @module services/calendar-notification.service
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const logger = require('../shared/logger/logger');
const CalendarEvent = require('../models/calendar-event-model');

class CalendarNotificationService {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Send inspection booking confirmation
   */
  async sendBookingConfirmation(event) {
    try {
      const { organizer, attendees, title, startTime, location } = event;

      // Notify organizer
      await this.notificationService.sendNotification({
        userId: organizer.userId,
        type: 'calendar.booking_confirmed',
        title: 'การจองตรวจสอบได้รับการยืนยัน',
        message: `การจอง "${title}" เมื่อ ${new Date(startTime).toLocaleDateString('th-TH')} ได้รับการยืนยันแล้ว`,
        data: {
          eventId: event._id,
          eventType: event.eventType,
          startTime,
          location
        },
        priority: 'high',
        channels: ['inapp', 'email', 'line']
      });

      // Notify attendees
      for (const attendee of attendees) {
        await this.notificationService.sendNotification({
          userId: attendee.userId,
          type: 'calendar.event_invitation',
          title: 'คุณได้รับเชิญเข้าร่วมกิจกรรม',
          message: `คุณได้รับเชิญเข้าร่วม "${title}" เมื่อ ${new Date(startTime).toLocaleDateString('th-TH')}`,
          data: {
            eventId: event._id,
            eventType: event.eventType,
            startTime,
            location
          },
          priority: 'medium',
          channels: ['inapp', 'email']
        });
      }

      logger.info(`Sent booking confirmation notifications for event ${event._id}`);
    } catch (error) {
      logger.error('Error sending booking confirmation:', error);
      throw error;
    }
  }

  /**
   * Send 24-hour reminder before inspection
   */
  async send24HourReminder(event) {
    try {
      const { organizer, attendees, title, startTime, location } = event;

      const message = `แจ้งเตือน: "${title}" จะเริ่มในวันพรุ่งนี้เวลา ${new Date(startTime).toLocaleTimeString('th-TH')}`;

      // Notify organizer
      await this.notificationService.sendNotification({
        userId: organizer.userId,
        type: 'calendar.event_reminder_24h',
        title: 'แจ้งเตือนกิจกรรมล่วงหน้า 24 ชั่วโมง',
        message,
        data: {
          eventId: event._id,
          eventType: event.eventType,
          startTime,
          location
        },
        priority: 'high',
        channels: ['inapp', 'email', 'sms', 'line']
      });

      // Notify attendees
      for (const attendee of attendees) {
        await this.notificationService.sendNotification({
          userId: attendee.userId,
          type: 'calendar.event_reminder_24h',
          title: 'แจ้งเตือนกิจกรรมล่วงหน้า 24 ชั่วโมง',
          message,
          data: {
            eventId: event._id,
            eventType: event.eventType,
            startTime,
            location
          },
          priority: 'high',
          channels: ['inapp', 'email', 'sms']
        });
      }

      // Mark reminder as sent
      await CalendarEvent.findByIdAndUpdate(
        event._id,
        {
          $set: { 'reminders.$[elem].sentAt': new Date() }
        },
        {
          arrayFilters: [{ 'elem.type': 'EMAIL', 'elem.minutesBefore': 1440 }]
        }
      );

      logger.info(`Sent 24-hour reminder for event ${event._id}`);
    } catch (error) {
      logger.error('Error sending 24-hour reminder:', error);
      throw error;
    }
  }

  /**
   * Send reschedule notification
   */
  async sendRescheduleNotification(event, oldStartTime, reason) {
    try {
      const { organizer, attendees, title, startTime } = event;

      const message = `"${title}" ถูกเปลี่ยนเวลาจาก ${new Date(oldStartTime).toLocaleString('th-TH')} เป็น ${new Date(startTime).toLocaleString('th-TH')}${reason ? ` - เหตุผล: ${reason}` : ''}`;

      // Notify organizer
      await this.notificationService.sendNotification({
        userId: organizer.userId,
        type: 'calendar.event_rescheduled',
        title: 'กิจกรรมถูกเปลี่ยนแปลง',
        message,
        data: {
          eventId: event._id,
          oldStartTime,
          newStartTime: startTime,
          reason
        },
        priority: 'high',
        channels: ['inapp', 'email', 'line']
      });

      // Notify attendees
      for (const attendee of attendees) {
        await this.notificationService.sendNotification({
          userId: attendee.userId,
          type: 'calendar.event_rescheduled',
          title: 'กิจกรรมถูกเปลี่ยนแปลง',
          message,
          data: {
            eventId: event._id,
            oldStartTime,
            newStartTime: startTime,
            reason
          },
          priority: 'high',
          channels: ['inapp', 'email', 'sms']
        });
      }

      logger.info(`Sent reschedule notifications for event ${event._id}`);
    } catch (error) {
      logger.error('Error sending reschedule notification:', error);
      throw error;
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(event, reason) {
    try {
      const { organizer, attendees, title, startTime } = event;

      const message = `"${title}" ที่กำหนดเมื่อ ${new Date(startTime).toLocaleString('th-TH')} ถูกยกเลิก${reason ? ` - เหตุผล: ${reason}` : ''}`;

      // Notify organizer
      await this.notificationService.sendNotification({
        userId: organizer.userId,
        type: 'calendar.event_cancelled',
        title: 'กิจกรรมถูกยกเลิก',
        message,
        data: {
          eventId: event._id,
          startTime,
          reason
        },
        priority: 'high',
        channels: ['inapp', 'email', 'line', 'sms']
      });

      // Notify attendees
      for (const attendee of attendees) {
        await this.notificationService.sendNotification({
          userId: attendee.userId,
          type: 'calendar.event_cancelled',
          title: 'กิจกรรมถูกยกเลิก',
          message,
          data: {
            eventId: event._id,
            startTime,
            reason
          },
          priority: 'high',
          channels: ['inapp', 'email', 'sms']
        });
      }

      logger.info(`Sent cancellation notifications for event ${event._id}`);
    } catch (error) {
      logger.error('Error sending cancellation notification:', error);
      throw error;
    }
  }

  /**
   * Send daily schedule summary to inspector
   */
  async sendDailyScheduleSummary(inspectorId, events) {
    try {
      if (events.length === 0) {
        return; // No events today
      }

      const eventsList = events
        .map(
          e =>
            `• ${e.title} (${new Date(e.startTime).toLocaleTimeString('th-TH')} - ${new Date(e.endTime).toLocaleTimeString('th-TH')})`
        )
        .join('\n');

      await this.notificationService.sendNotification({
        userId: inspectorId,
        type: 'calendar.daily_schedule',
        title: `ตารางงานวันนี้ - ${events.length} รายการ`,
        message: `กิจกรรมของคุณวันนี้:\n${eventsList}`,
        data: {
          date: new Date().toISOString(),
          eventCount: events.length,
          events: events.map(e => ({
            id: e._id,
            title: e.title,
            startTime: e.startTime
          }))
        },
        priority: 'medium',
        channels: ['email', 'line']
      });

      logger.info(`Sent daily schedule summary to inspector ${inspectorId}`);
    } catch (error) {
      logger.error('Error sending daily schedule summary:', error);
      throw error;
    }
  }

  /**
   * Send conflict detection alert
   */
  async sendConflictAlert(event, conflictingEvents) {
    try {
      const { organizer, title, startTime } = event;

      const conflictsList = conflictingEvents
        .map(e => `• ${e.title} (${new Date(e.startTime).toLocaleTimeString('th-TH')})`)
        .join('\n');

      await this.notificationService.sendNotification({
        userId: organizer.userId,
        type: 'calendar.conflict_detected',
        title: '⚠️ ตรวจพบความขัดแย้งในปฏิทิน',
        message: `"${title}" มีความขัดแย้งกับกิจกรรมอื่น:\n${conflictsList}`,
        data: {
          eventId: event._id,
          startTime,
          conflictingEvents: conflictingEvents.map(e => e._id)
        },
        priority: 'urgent',
        channels: ['inapp', 'email']
      });

      logger.info(`Sent conflict alert for event ${event._id}`);
    } catch (error) {
      logger.error('Error sending conflict alert:', error);
      throw error;
    }
  }

  /**
   * Process reminder queue
   * Should be called by cron job every hour
   */
  async processReminderQueue() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find events needing 24-hour reminders
      const eventsNeedingReminders = await CalendarEvent.find({
        startTime: {
          $gte: now,
          $lte: in24Hours
        },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] },
        'reminders.sentAt': { $exists: false }
      });

      logger.info(`Found ${eventsNeedingReminders.length} events needing reminders`);

      for (const event of eventsNeedingReminders) {
        await this.send24HourReminder(event);
      }

      return eventsNeedingReminders.length;
    } catch (error) {
      logger.error('Error processing reminder queue:', error);
      throw error;
    }
  }
}

module.exports = CalendarNotificationService;
