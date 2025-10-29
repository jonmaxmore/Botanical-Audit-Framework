// This file is used to configure Sentry in your Next.js application
// It runs before Next.js starts, allowing Sentry to capture errors early in the startup process
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Register Sentry for Node.js runtime (server-side)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Register Sentry for Edge runtime (middleware, edge routes)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Optional: Define an onRequestError handler for custom error processing
// This is called for any uncaught errors in your application
export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: { get: (key: string) => string | null };
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined;
    renderType: 'dynamic' | 'dynamic-resume';
  }
) {
  // You can add custom logic here to process errors before they're sent to Sentry
  // For example, you might want to log additional context or filter certain errors

  // The error will be automatically sent to Sentry by the configured Sentry SDK
  console.error('Application error:', {
    error: err,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType
  });
}
