/**
 * Error Tracker
 * Integration with error tracking services (Sentry, Rollbar, etc.)
 */

import { AppError } from './error-handler';
import { ErrorLogEntry } from './error-logger';

/**
 * Error tracker configuration
 */
export interface ErrorTrackerConfig {
  dsn?: string;
  environment: string;
  release?: string;
  serverName?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  beforeSend?: (event: TrackerEvent) => TrackerEvent | null;
  beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
  ignoreErrors?: Array<string | RegExp>;
  denyUrls?: Array<string | RegExp>;
  allowUrls?: Array<string | RegExp>;
  enabled?: boolean;
}

/**
 * Tracker event structure
 */
export interface TrackerEvent {
  eventId: string;
  timestamp: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  message: string;
  exception?: {
    type: string;
    value: string;
    stackTrace?: StackFrame[];
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    query?: string;
    data?: any;
  };
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ipAddress?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  contexts?: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
  fingerprint?: string[];
}

/**
 * Stack frame structure
 */
export interface StackFrame {
  filename: string;
  function: string;
  lineno: number;
  colno: number;
  absPath?: string;
  context?: {
    pre: string[];
    code: string;
    post: string[];
  };
}

/**
 * Breadcrumb (user actions leading to error)
 */
export interface Breadcrumb {
  type: string;
  category: string;
  message?: string;
  data?: Record<string, any>;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: string;
}

/**
 * Error Tracker Service
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private config: ErrorTrackerConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs: number = 100;
  private isInitialized: boolean = false;

  private constructor(config: ErrorTrackerConfig) {
    this.config = {
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      enabled: true,
      ...config,
    };
  }

  /**
   * Initialize error tracker
   */
  static initialize(config: ErrorTrackerConfig): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker(config);
      ErrorTracker.instance.setup();
    }
    return ErrorTracker.instance;
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      throw new Error('ErrorTracker not initialized. Call initialize() first.');
    }
    return ErrorTracker.instance;
  }

  /**
   * Setup error tracker
   */
  private setup(): void {
    if (!this.config.enabled) {
      console.log('Error tracking is disabled');
      return;
    }

    // TODO: Initialize Sentry or other service
    // Example for Sentry:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: this.config.dsn,
    //   environment: this.config.environment,
    //   release: this.config.release,
    //   ...
    // });

    this.isInitialized = true;
    console.log('✅ Error tracker initialized');
  }

  /**
   * Capture error
   */
  async captureError(
    error: Error | AppError,
    context?: {
      user?: any;
      request?: any;
      tags?: Record<string, string>;
      extra?: Record<string, any>;
      level?: 'fatal' | 'error' | 'warning';
    }
  ): Promise<string> {
    if (!this.config.enabled || !this.isInitialized) {
      return '';
    }

    // Check if error should be ignored
    if (this.shouldIgnoreError(error)) {
      return '';
    }

    // Sample errors
    if (Math.random() > (this.config.sampleRate || 1.0)) {
      return '';
    }

    const event = this.createEvent(error, context);

    // Apply beforeSend callback
    if (this.config.beforeSend) {
      const modifiedEvent = this.config.beforeSend(event);
      if (!modifiedEvent) {
        return ''; // Event filtered out
      }
      Object.assign(event, modifiedEvent);
    }

    // Send to error tracking service
    const eventId = await this.sendEvent(event);

    return eventId;
  }

  /**
   * Create tracker event from error
   */
  private createEvent(error: Error | AppError, context?: any): TrackerEvent {
    const appError = error instanceof AppError ? error : null;

    const event: TrackerEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      level: this.getLevel(appError),
      message: error.message,
      exception: {
        type: error.name,
        value: error.message,
        stackTrace: this.parseStackTrace(error.stack || ''),
      },
      breadcrumbs: this.breadcrumbs.slice(-50), // Last 50 breadcrumbs
      tags: {},
      extra: {},
      contexts: {},
    };

    // Add AppError specific data
    if (appError) {
      event.tags = {
        ...event.tags,
        errorCode: appError.code,
        errorCategory: appError.category,
        errorSeverity: appError.severity,
      };

      if (appError.details) {
        event.extra!.errorDetails = appError.details;
      }
    }

    // Add request context
    if (context?.request) {
      event.request = {
        url: context.request.url,
        method: context.request.method,
        headers: this.sanitizeHeaders(context.request.headers),
        query: context.request.query,
        data: this.sanitizeBody(context.request.body),
      };
    }

    // Add user context
    if (context?.user) {
      event.user = {
        id: context.user.id,
        email: context.user.email,
        username: context.user.username,
        ipAddress: context.user.ip,
      };
    }

    // Add custom tags
    if (context?.tags) {
      event.tags = { ...event.tags, ...context.tags };
    }

    // Add extra data
    if (context?.extra) {
      event.extra = { ...event.extra, ...context.extra };
    }

    // Add environment context
    event.contexts!.runtime = {
      name: 'node',
      version: process.version,
    };

    event.contexts!.os = {
      name: process.platform,
    };

    return event;
  }

  /**
   * Get error level
   */
  private getLevel(error: AppError | null): 'fatal' | 'error' | 'warning' {
    if (!error) return 'error';

    if (error.severity === 'critical' || error.severity === 'high') {
      return 'fatal';
    }

    if (error.severity === 'low') {
      return 'warning';
    }

    return 'error';
  }

  /**
   * Parse stack trace into frames
   */
  private parseStackTrace(stack: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = stack.split('\n').slice(1); // Skip error message

    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          function: match[1],
          filename: match[2].split('/').pop() || match[2],
          absPath: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        });
      }
    }

    return frames;
  }

  /**
   * Sanitize headers
   */
  private sanitizeHeaders(headers: any): Record<string, string> {
    if (!headers) return {};

    const sanitized: Record<string, string> = {};
    const sensitive = ['authorization', 'cookie', 'x-api-key'];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitive.includes(key.toLowerCase())) {
        sanitized[key] = '[FILTERED]';
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  /**
   * Sanitize request body
   */
  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    // Remove sensitive fields
    const sensitive = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitive) {
      if (field in sanitized) {
        sanitized[field] = '[FILTERED]';
      }
    }

    return sanitized;
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: Error): boolean {
    if (!this.config.ignoreErrors) return false;

    return this.config.ignoreErrors.some(pattern => {
      if (typeof pattern === 'string') {
        return error.message.includes(pattern);
      }
      return pattern.test(error.message);
    });
  }

  /**
   * Send event to tracking service
   */
  private async sendEvent(event: TrackerEvent): Promise<string> {
    try {
      // TODO: Send to Sentry or other service
      // Example:
      // const response = await fetch(this.config.dsn, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });

      // For now, just log
      console.log('Error tracked:', {
        eventId: event.eventId,
        level: event.level,
        message: event.message,
      });

      return event.eventId;
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
      return '';
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    // Apply beforeBreadcrumb callback
    if (this.config.beforeBreadcrumb) {
      const modified = this.config.beforeBreadcrumb(fullBreadcrumb);
      if (!modified) return; // Filtered out
      Object.assign(fullBreadcrumb, modified);
    }

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string } | null): void {
    // TODO: Integrate with tracking service
    console.log('User context set:', user);
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    // TODO: Integrate with tracking service
  }

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, any>): void {
    // TODO: Integrate with tracking service
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.config.enabled) return;

    console.log(`[${level.toUpperCase()}]`, message);
    // TODO: Send to tracking service
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Helper functions
 */

export function initializeErrorTracker(config: ErrorTrackerConfig): ErrorTracker {
  return ErrorTracker.initialize(config);
}

export function captureError(error: Error | AppError, context?: any): Promise<string> {
  try {
    return ErrorTracker.getInstance().captureError(error, context);
  } catch {
    console.error('Error tracker not initialized');
    return Promise.resolve('');
  }
}

export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  try {
    ErrorTracker.getInstance().addBreadcrumb(breadcrumb);
  } catch {
    // Silently fail if not initialized
  }
}

export function setUser(user: any): void {
  try {
    ErrorTracker.getInstance().setUser(user);
  } catch {
    // Silently fail
  }
}

export function captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void {
  try {
    ErrorTracker.getInstance().captureMessage(message, level);
  } catch {
    console.log(message);
  }
}

/**
 * React Error Boundary integration
 */
export function captureReactError(error: Error, errorInfo: { componentStack: string }): void {
  captureError(error, {
    tags: { errorBoundary: 'react' },
    extra: { componentStack: errorInfo.componentStack },
  });
}

/**
 * API Error integration
 */
export function captureApiError(error: Error | AppError, request: any): Promise<string> {
  return captureError(error, {
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers,
      query: request.query,
      body: request.body,
    },
    tags: {
      type: 'api',
      endpoint: request.url,
    },
  });
}

/**
 * Database Error integration
 */
export function captureDatabaseError(error: Error, query?: string): Promise<string> {
  return captureError(error, {
    tags: { type: 'database' },
    extra: { query },
  });
}

/**
 * External API Error integration
 */
export function captureExternalApiError(
  error: Error,
  service: string,
  endpoint: string
): Promise<string> {
  return captureError(error, {
    tags: {
      type: 'external_api',
      service,
      endpoint,
    },
  });
}
