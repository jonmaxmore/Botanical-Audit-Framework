/**
 * API Error Middleware
 * Next.js API route middleware for consistent error handling
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorHandler, AppError } from './error-handler';

/**
 * Middleware options
 */
interface ErrorMiddlewareOptions {
  logErrors?: boolean;
  sendStackTrace?: boolean;
  customLogger?: (error: AppError, req: NextApiRequest) => Promise<void>;
  onError?: (error: AppError, req: NextApiRequest, res: NextApiResponse) => Promise<void>;
}

/**
 * Global error handling middleware for API routes
 */
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: ErrorMiddlewareOptions = {}
) {
  const {
    logErrors = true,
    sendStackTrace = process.env.NODE_ENV === 'development',
    customLogger,
    onError,
  } = options;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Add request ID for tracking
      (req as any).id = generateRequestId();

      // Execute the handler
      await handler(req, res);
    } catch (error) {
      // Normalize error
      const normalizedError = ErrorHandler.normalizeError(error);

      // Custom logging if provided
      if (logErrors && customLogger) {
        await customLogger(normalizedError, req);
      }

      // Custom error callback
      if (onError) {
        await onError(normalizedError, req, res);
      }

      // Send error response if not already sent
      if (!res.headersSent) {
        ErrorHandler.sendErrorResponse(res, normalizedError, req);
      }

      // Log critical errors
      if (!ErrorHandler.isOperational(normalizedError)) {
        console.error('Non-operational error occurred:', {
          error: normalizedError,
          requestId: (req as any).id,
          path: req.url,
          method: req.method,
        });
      }
    }
  };
}

/**
 * Error handling middleware with custom error transformation
 */
export function withCustomErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  errorTransformer: (error: unknown) => AppError
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const transformedError = errorTransformer(error);
      ErrorHandler.sendErrorResponse(res, transformedError, req);
    }
  };
}

/**
 * Catch-all error middleware for unhandled rejections
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);

    const error = ErrorHandler.normalizeError(reason);

    if (!ErrorHandler.isOperational(error)) {
      console.error('CRITICAL: Unhandled rejection with non-operational error');
      // In production, consider alerting and graceful shutdown
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);

    const normalizedError = ErrorHandler.normalizeError(error);

    if (!ErrorHandler.isOperational(normalizedError)) {
      console.error('CRITICAL: Uncaught exception - shutting down gracefully');

      // Attempt graceful shutdown
      process.exit(1);
    }
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, performing graceful shutdown');
    // TODO: Close database connections, finish pending requests, etc.
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received, performing graceful shutdown');
    process.exit(0);
  });
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware to validate request body
 */
export function withBodyValidation<T>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  validator: (body: any) => T
) {
  return withErrorHandler(async (req, res) => {
    // Validate body
    const validatedBody = validator(req.body);
    (req as any).validatedBody = validatedBody;

    // Call handler with validated data
    await handler(req, res);
  });
}

/**
 * Middleware to handle method not allowed
 */
export function withMethodValidation(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  allowedMethods: string[]
) {
  return withErrorHandler(async (req, res) => {
    if (!allowedMethods.includes(req.method || '')) {
      throw new AppError(`Method ${req.method} not allowed`, 405, 'METHOD_NOT_ALLOWED');
    }

    await handler(req, res);
  });
}

/**
 * Combine multiple middlewares
 */
export function composeMiddleware(
  ...middlewares: Array<
    (
      handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    ) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  >
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Error response helpers
 */
export class ErrorResponse {
  /**
   * Send validation error
   */
  static validation(res: NextApiResponse, message: string, details?: any): void {
    const error = ErrorHandler.normalizeError(new Error(message));
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    if (details) error.details = details;
    ErrorHandler.sendErrorResponse(res, error);
  }

  /**
   * Send not found error
   */
  static notFound(res: NextApiResponse, resource: string = 'Resource'): void {
    const error = ErrorHandler.normalizeError(new Error(`${resource} not found`));
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    ErrorHandler.sendErrorResponse(res, error);
  }

  /**
   * Send unauthorized error
   */
  static unauthorized(res: NextApiResponse, message: string = 'Unauthorized'): void {
    const error = ErrorHandler.normalizeError(new Error(message));
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    ErrorHandler.sendErrorResponse(res, error);
  }

  /**
   * Send forbidden error
   */
  static forbidden(res: NextApiResponse, message: string = 'Forbidden'): void {
    const error = ErrorHandler.normalizeError(new Error(message));
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    ErrorHandler.sendErrorResponse(res, error);
  }

  /**
   * Send internal server error
   */
  static internal(res: NextApiResponse, message: string = 'Internal server error'): void {
    const error = ErrorHandler.normalizeError(new Error(message));
    error.statusCode = 500;
    error.code = 'INTERNAL_ERROR';
    ErrorHandler.sendErrorResponse(res, error);
  }

  /**
   * Send custom error
   */
  static custom(
    res: NextApiResponse,
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ): void {
    const error = ErrorHandler.normalizeError(new Error(message));
    error.statusCode = statusCode;
    error.code = code;
    if (details) error.details = details;
    ErrorHandler.sendErrorResponse(res, error);
  }
}

/**
 * API route wrapper with common patterns
 */
export function createApiRoute(config: {
  methods: string[];
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  requireAuth?: boolean;
  validate?: (body: any) => any;
  rateLimit?: any; // Will integrate with rate limiter
}) {
  const { methods, handler, requireAuth = false, validate, rateLimit } = config;

  let wrappedHandler = handler;

  // Add validation if provided
  if (validate) {
    wrappedHandler = withBodyValidation(wrappedHandler, validate);
  }

  // Add method validation
  wrappedHandler = withMethodValidation(wrappedHandler, methods);

  // Add authentication check if required
  if (requireAuth) {
    const authHandler = wrappedHandler;
    wrappedHandler = async (req, res) => {
      // TODO: Integrate with auth middleware
      const user = (req as any).user;
      if (!user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      await authHandler(req, res);
    };
  }

  // Add rate limiting if provided
  if (rateLimit) {
    // TODO: Integrate with rate limiter
  }

  // Add error handling
  return withErrorHandler(wrappedHandler);
}

/**
 * Typed API handler with automatic error handling
 */
export function apiHandler<TRequest = any, TResponse = any>(
  handler: (
    req: NextApiRequest & { body: TRequest },
    res: NextApiResponse<TResponse>
  ) => Promise<void>
) {
  return withErrorHandler(async (req, res) => {
    await handler(req as any, res);
  });
}

/**
 * Success response helpers
 */
export class SuccessResponse {
  /**
   * Send success response with data
   */
  static ok<T>(res: NextApiResponse, data: T, message?: string): void {
    res.status(200).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send created response
   */
  static created<T>(res: NextApiResponse, data: T, message?: string): void {
    res.status(201).json({
      success: true,
      data,
      message: message || 'Resource created successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send no content response
   */
  static noContent(res: NextApiResponse): void {
    res.status(204).end();
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: NextApiResponse,
    data: T[],
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }
  ): void {
    res.status(200).json({
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Error boundary for API routes
 */
export async function handleApiError(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const normalizedError = ErrorHandler.normalizeError(error);

  // Log error details
  console.error('API Error:', {
    path: req.url,
    method: req.method,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      stack: normalizedError.stack,
    },
  });

  // Send error response
  ErrorHandler.sendErrorResponse(res, normalizedError, req);
}

/**
 * Development-only error details middleware
 */
export function withDetailedErrors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  if (process.env.NODE_ENV !== 'development') {
    return handler;
  }

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const normalizedError = ErrorHandler.normalizeError(error);

      // Send detailed error in development
      res.status(normalizedError.statusCode).json({
        success: false,
        error: {
          code: normalizedError.code,
          message: normalizedError.message,
          details: normalizedError.details,
          stack: normalizedError.stack,
          category: normalizedError.category,
          severity: normalizedError.severity,
        },
        request: {
          method: req.method,
          path: req.url,
          headers: req.headers,
          query: req.query,
          body: req.body,
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Initialize error handling middleware
 */
export function initializeErrorHandling(): void {
  setupGlobalErrorHandlers();

  console.log('✅ Global error handlers initialized');
}
