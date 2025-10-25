const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gacp/ui', '@gacp/types', '@gacp/utils'],
  turbopack: {},
  // Disable instrumentation for development to avoid conflicts
  experimental: {
    // instrumentation.js is now available by default in Next.js 16
    clientTraceMetadata: ['baggage', 'sentry-trace', 'traceparent'],
  },
};

// Wrap the config with Sentry
module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppress all Sentry build-time logs
    silent: true,

    // Organization and project from Sentry
    org: process.env.SENTRY_ORG || 'gacp',
    project: process.env.SENTRY_PROJECT || 'farmer-portal',

    // Only upload source maps in production
    disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
    disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for better error reporting
    widenClientFileUpload: true,

    // Automatically annotate React components with origin information
    reactComponentAnnotation: {
      enabled: true,
    },

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Automatically instrument API routes and server actions
    automaticVercelMonitors: true,
  },
);
