// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event:', event);
      console.error('Original Error:', hint.originalException);
      return null;
    }
    return event;
  },

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Cancelled requests
    'AbortError',
    'Request aborted'
  ],

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Additional integrations
  integrations: [
    Sentry.httpIntegration({
      // Track outgoing HTTP requests (filter out health checks)
      // Filtering is handled by tracesSampler below
    })
  ],

  // Custom trace sampling (replaces tracesSampleRate when defined)
  tracesSampler: samplingContext => {
    // Don't trace health check requests
    if (samplingContext.request?.url?.includes('/health')) {
      return 0;
    }
    // Use environment-specific sample rate for other requests
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  },

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
