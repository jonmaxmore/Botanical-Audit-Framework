/**
 * Google Calendar Integration Service
 *
 * Handles OAuth2 authentication and bidirectional synchronization
 * between GACP platform and Google Calendar.
 *
 * Features:
 * - OAuth2 authentication flow
 * - Create/Update/Delete events in Google Calendar
 * - Sync events from Google Calendar to platform
 * - Token refresh management
 * - Webhook notifications for real-time updates
 *
 * @module services/google-calendar.service
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

const { google } = require('googleapis');
const CalendarEvent = require('../models/calendar-event-model');
const InspectorAvailability = require('../models/inspector-availability-model');
const logger = require('../src/utils/logger');

// Lazy load config to avoid require errors in tests
let config;
const getConfig = () => {
  if (!config) {
    config = require('../../config/google-calendar.config');
  }
  return config;
};
const { AppError } = require('../shared/errors');

class GoogleCalendarService {
  constructor() {
    try {
      const cfg = getConfig();
      this.oauth2Client = new google.auth.OAuth2(
        cfg.google.clientId,
        cfg.google.clientSecret,
        cfg.google.redirectUri
      );
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    } catch (error) {
      // Allow service to load even if config is missing (for testing)
      logger.warn('GoogleCalendarService: Config not loaded', { error: error.message });
      this.oauth2Client = null;
      this.calendar = null;
    }
  }

  /**
   * Generate OAuth2 authorization URL
   *
   * @param {string} userId - User ID for state parameter
   * @returns {string} Authorization URL
   */
  getAuthUrl(userId) {
    const cfg = getConfig();
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: cfg.google.scopes,
      state: userId,
      prompt: 'consent' // Force consent to get refresh token
    });

    logger.info('Generated Google OAuth URL', { userId });
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   *
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} Token data
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      logger.info('Exchanged code for tokens');
      return tokens;
    } catch (error) {
      logger.error('Error exchanging code for tokens', { error: error.message });
      throw new AppError('Failed to authenticate with Google Calendar', 500);
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      logger.info('Refreshed access token');
      return credentials;
    } catch (error) {
      logger.error('Error refreshing access token', { error: error.message });
      throw new AppError('Failed to refresh Google Calendar token', 500);
    }
  }

  /**
   * Enable Google Calendar sync for an inspector
   *
   * @param {string} inspectorId - Inspector ID
   * @param {Object} tokens - OAuth tokens
   * @param {string} calendarId - Google Calendar ID (default: 'primary')
   * @returns {Promise<Object>} Updated availability
   */
  async enableSync(inspectorId, tokens, calendarId = 'primary') {
    try {
      const availability = await InspectorAvailability.findOne({ inspectorId });
      if (!availability) {
        throw new AppError('Inspector availability not found', 404);
      }

      // Encrypt tokens (in production, use proper encryption)
      availability.googleCalendarSync = {
        enabled: true,
        calendarId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
        lastSyncAt: new Date(),
        syncFrequency: 'HOURLY',
        syncDirection: 'BIDIRECTIONAL'
      };

      await availability.save();

      logger.info('Google Calendar sync enabled', { inspectorId });
      return availability;
    } catch (error) {
      logger.error('Error enabling Google Calendar sync', { error: error.message });
      throw error;
    }
  }

  /**
   * Disable Google Calendar sync for an inspector
   *
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<Object>} Updated availability
   */
  async disableSync(inspectorId) {
    try {
      const availability = await InspectorAvailability.findOne({ inspectorId });
      if (!availability) {
        throw new AppError('Inspector availability not found', 404);
      }

      availability.googleCalendarSync.enabled = false;
      await availability.save();

      logger.info('Google Calendar sync disabled', { inspectorId });
      return availability;
    } catch (error) {
      logger.error('Error disabling Google Calendar sync', { error: error.message });
      throw error;
    }
  }

  /**
   * Create event in Google Calendar
   *
   * @param {Object} event - Calendar event from our system
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<Object>} Google Calendar event
   */
  async createGoogleEvent(event, inspectorId) {
    try {
      const availability = await this._getAvailabilityWithAuth(inspectorId);

      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: this._formatLocation(event.location),
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone || config.calendar.defaultTimezone
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone || config.calendar.defaultTimezone
        },
        attendees: event.attendees.map(a => ({
          email: a.email,
          displayName: a.name,
          responseStatus: this._mapRsvpStatus(a.rsvpStatus)
        })),
        reminders: {
          useDefault: false,
          overrides: event.reminders.map(r => ({
            method: r.type.toLowerCase(),
            minutes: r.minutesBefore
          }))
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: availability.googleCalendarSync.calendarId,
        resource: googleEvent
      });

      logger.info('Created event in Google Calendar', {
        eventId: event._id,
        googleEventId: response.data.id
      });

      // Update our event with Google Calendar ID
      event.googleCalendar.eventId = response.data.id;
      event.googleCalendar.syncStatus = 'SYNCED';
      event.googleCalendar.lastSyncAt = new Date();
      await event.save();

      return response.data;
    } catch (error) {
      logger.error('Error creating Google Calendar event', { error: error.message });
      throw new AppError('Failed to create event in Google Calendar', 500);
    }
  }

  /**
   * Update event in Google Calendar
   *
   * @param {Object} event - Calendar event from our system
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<Object>} Updated Google Calendar event
   */
  async updateGoogleEvent(event, inspectorId) {
    try {
      if (!event.googleCalendar.eventId) {
        return await this.createGoogleEvent(event, inspectorId);
      }

      const availability = await this._getAvailabilityWithAuth(inspectorId);

      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: this._formatLocation(event.location),
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone || config.calendar.defaultTimezone
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone || config.calendar.defaultTimezone
        },
        attendees: event.attendees.map(a => ({
          email: a.email,
          displayName: a.name,
          responseStatus: this._mapRsvpStatus(a.rsvpStatus)
        }))
      };

      const response = await this.calendar.events.update({
        calendarId: availability.googleCalendarSync.calendarId,
        eventId: event.googleCalendar.eventId,
        resource: googleEvent
      });

      logger.info('Updated event in Google Calendar', {
        eventId: event._id,
        googleEventId: response.data.id
      });

      event.googleCalendar.syncStatus = 'SYNCED';
      event.googleCalendar.lastSyncAt = new Date();
      await event.save();

      return response.data;
    } catch (error) {
      logger.error('Error updating Google Calendar event', { error: error.message });
      throw new AppError('Failed to update event in Google Calendar', 500);
    }
  }

  /**
   * Delete event from Google Calendar
   *
   * @param {Object} event - Calendar event from our system
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<void>}
   */
  async deleteGoogleEvent(event, inspectorId) {
    try {
      if (!event.googleCalendar.eventId) {
        return; // Nothing to delete in Google Calendar
      }

      const availability = await this._getAvailabilityWithAuth(inspectorId);

      await this.calendar.events.delete({
        calendarId: availability.googleCalendarSync.calendarId,
        eventId: event.googleCalendar.eventId
      });

      logger.info('Deleted event from Google Calendar', {
        eventId: event._id,
        googleEventId: event.googleCalendar.eventId
      });

      event.googleCalendar.syncStatus = 'DELETED';
      event.googleCalendar.lastSyncAt = new Date();
      await event.save();
    } catch (error) {
      logger.error('Error deleting Google Calendar event', { error: error.message });
      throw new AppError('Failed to delete event from Google Calendar', 500);
    }
  }

  /**
   * Sync events from Google Calendar to our system
   *
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<Object>} Sync results
   */
  async syncFromGoogle(inspectorId) {
    try {
      const availability = await this._getAvailabilityWithAuth(inspectorId);

      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + config.calendar.maxSyncDays);

      // Get events from Google Calendar
      const response = await this.calendar.events.list({
        calendarId: availability.googleCalendarSync.calendarId,
        timeMin: now.toISOString(),
        timeMax: maxDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.data.items || [];
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
      };

      for (const googleEvent of googleEvents) {
        try {
          // Check if event already exists in our system
          const existingEvent = await CalendarEvent.findOne({
            'googleCalendar.eventId': googleEvent.id
          });

          if (existingEvent) {
            // Update existing event
            existingEvent.title = googleEvent.summary;
            existingEvent.description = googleEvent.description;
            existingEvent.startTime = new Date(
              googleEvent.start.dateTime || googleEvent.start.date
            );
            existingEvent.endTime = new Date(googleEvent.end.dateTime || googleEvent.end.date);
            existingEvent.googleCalendar.lastSyncAt = new Date();
            await existingEvent.save();
            results.updated++;
          } else {
            // Create new event
            const User = require('../modules/user-management/infrastructure/models/User');
            const inspector = await User.findById(inspectorId);

            const newEvent = new CalendarEvent({
              title: googleEvent.summary || 'Untitled Event',
              description: googleEvent.description || '',
              eventType: 'OTHER',
              startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
              endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
              organizer: {
                userId: inspector._id,
                name: inspector.name,
                email: inspector.email,
                role: inspector.role
              },
              googleCalendar: {
                eventId: googleEvent.id,
                syncEnabled: true,
                lastSyncAt: new Date(),
                syncStatus: 'SYNCED',
                calendarId: availability.googleCalendarSync.calendarId
              },
              status: 'SCHEDULED'
            });

            await newEvent.save();
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            googleEventId: googleEvent.id,
            error: error.message
          });
        }
      }

      // Update last sync time
      availability.googleCalendarSync.lastSyncAt = new Date();
      await availability.save();

      logger.info('Synced events from Google Calendar', {
        inspectorId,
        results
      });

      return results;
    } catch (error) {
      logger.error('Error syncing from Google Calendar', { error: error.message });
      throw new AppError('Failed to sync events from Google Calendar', 500);
    }
  }

  /**
   * Full bidirectional sync
   *
   * @param {string} inspectorId - Inspector ID
   * @returns {Promise<Object>} Sync results
   */
  async fullSync(inspectorId) {
    try {
      // Sync from Google to our system
      const fromGoogle = await this.syncFromGoogle(inspectorId);

      // Sync our events to Google
      const ourEvents = await CalendarEvent.find({
        'organizer.userId': inspectorId,
        'googleCalendar.syncEnabled': true,
        'googleCalendar.syncStatus': { $in: ['PENDING', 'ERROR'] },
        startTime: { $gte: new Date() },
        isDeleted: false
      });

      const toGoogle = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const event of ourEvents) {
        try {
          if (event.googleCalendar.eventId) {
            await this.updateGoogleEvent(event, inspectorId);
            toGoogle.updated++;
          } else {
            await this.createGoogleEvent(event, inspectorId);
            toGoogle.created++;
          }
        } catch (error) {
          toGoogle.errors.push({
            eventId: event._id,
            error: error.message
          });
        }
      }

      logger.info('Completed full bidirectional sync', {
        inspectorId,
        fromGoogle,
        toGoogle
      });

      return { fromGoogle, toGoogle };
    } catch (error) {
      logger.error('Error in full sync', { error: error.message });
      throw error;
    }
  }

  // ========== Private Helper Methods ==========

  /**
   * Get availability with valid auth credentials
   */
  async _getAvailabilityWithAuth(inspectorId) {
    const availability = await InspectorAvailability.findOne({
      inspectorId,
      'googleCalendarSync.enabled': true
    });

    if (!availability) {
      throw new AppError('Google Calendar sync not enabled', 400);
    }

    // Check if token needs refresh
    const tokenExpiry = new Date(availability.googleCalendarSync.tokenExpiry);
    const now = new Date();

    if (now >= tokenExpiry) {
      const newTokens = await this.refreshAccessToken(availability.googleCalendarSync.refreshToken);
      availability.googleCalendarSync.accessToken = newTokens.access_token;
      availability.googleCalendarSync.tokenExpiry = new Date(newTokens.expiry_date);
      await availability.save();
    }

    // Set credentials for API calls
    this.oauth2Client.setCredentials({
      access_token: availability.googleCalendarSync.accessToken,
      refresh_token: availability.googleCalendarSync.refreshToken
    });

    return availability;
  }

  /**
   * Format location for Google Calendar
   */
  _formatLocation(location) {
    if (!location) return '';

    if (location.type === 'ONLINE') {
      return location.meetingUrl || 'Online Meeting';
    }

    if (location.type === 'FARM') {
      return location.address || `Farm: ${location.farmId}`;
    }

    if (location.type === 'OFFICE') {
      return location.address || 'Office';
    }

    return '';
  }

  /**
   * Map RSVP status to Google Calendar format
   */
  _mapRsvpStatus(rsvpStatus) {
    const mapping = {
      PENDING: 'needsAction',
      ACCEPTED: 'accepted',
      DECLINED: 'declined',
      TENTATIVE: 'tentative'
    };
    return mapping[rsvpStatus] || 'needsAction';
  }
}

module.exports = new GoogleCalendarService();
