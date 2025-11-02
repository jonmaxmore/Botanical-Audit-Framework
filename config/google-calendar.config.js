/**
 * Google Calendar Configuration
 *
 * OAuth2 credentials and settings for Google Calendar API integration.
 *
 * @module config/google-calendar.config
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/google/callback',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  },
  calendar: {
    defaultTimezone: 'Asia/Bangkok',
    syncInterval: 3600000, // 1 hour in milliseconds
    maxSyncDays: 90, // Sync events up to 90 days in future
    retryAttempts: 3,
    retryDelay: 5000 // 5 seconds
  }
};
