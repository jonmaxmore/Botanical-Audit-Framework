/**
 * Global Error Handler
 * Centralized error handling with classification, logging, and response formatting
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  FILE_SYSTEM = 'file_system',
  PAYMENT = 'payment',
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
    requestId?: string;
    stack?: string;
  };
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    category: ErrorCategory = ErrorCategory.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    details?: any,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * Predefined error types
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      400,
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      true,
      details,
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      message,
      401,
      'AUTHENTICATION_ERROR',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      true,
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(
      message,
      403,
      'AUTHORIZATION_ERROR',
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      true,
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(
      `${resource} not found`,
      404,
      'NOT_FOUND',
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.LOW,
      true,
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', ErrorCategory.CONFLICT, ErrorSeverity.LOW, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Rate limit exceeded',
      429,
      'RATE_LIMIT_ERROR',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      true,
      { retryAfter },
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      500,
      'DATABASE_ERROR',
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      true,
      details,
    );
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(
      `External API error from ${service}: ${message}`,
      502,
      'EXTERNAL_API_ERROR',
      ErrorCategory.EXTERNAL_API,
      ErrorSeverity.HIGH,
      true,
      details,
    );
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string) {
    super(
      `Operation timeout: ${operation}`,
      504,
      'TIMEOUT_ERROR',
      ErrorCategory.TIMEOUT,
      ErrorSeverity.MEDIUM,
      true,
    );
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 402, 'PAYMENT_ERROR', ErrorCategory.PAYMENT, ErrorSeverity.HIGH, true, details);
  }
}

/**
 * Error Handler Service
 */
export class ErrorHandler {
  /**
   * Check if error is operational (expected) or programming error
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Determine if error is trusted (safe to send details to client)
   */
  static isTrusted(error: Error): boolean {
    return this.isOperational(error);
  }

  /**
   * Convert various error types to AppError
   */
  static normalizeError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      return new ValidationError('Validation failed', details);
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new ValidationError('Database validation failed', {
        message: error.message,
      });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new DatabaseError('Database connection failed', {
        message: error.message,
      });
    }

    // Standard Error
    if (error instanceof Error) {
      return new AppError(
        error.message,
        500,
        'INTERNAL_ERROR',
        ErrorCategory.INTERNAL,
        ErrorSeverity.HIGH,
        false,
      );
    }

    // Unknown error
    return new AppError(
      'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR',
      ErrorCategory.INTERNAL,
      ErrorSeverity.CRITICAL,
      false,
      { originalError: String(error) },
    );
  }

  /**
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
    switch (error.code) {
      // Unique constraint violation
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        return new ConflictError(`Record with this ${target.join(', ')} already exists`, {
          fields: target,
        });
      }

      // Foreign key constraint violation
      case 'P2003':
        return new ValidationError('Referenced record does not exist', {
          field: error.meta?.field_name,
        });

      // Record not found
      case 'P2025':
        return new NotFoundError('Record');

      // Connection timeout
      case 'P2024':
        return new TimeoutError('Database connection');

      // Query timeout
      case 'P2034':
        return new TimeoutError('Database query');

      // Record required but not found
      case 'P2018':
        return new NotFoundError('Required record');

      default:
        return new DatabaseError('Database operation failed', {
          code: error.code,
          meta: error.meta,
        });
    }
  }

  /**
   * Format error for API response
   */
  static formatErrorResponse(
    error: AppError,
    req?: NextApiRequest,
    includeStack: boolean = false,
  ): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    // Add request details
    if (req) {
      response.error.path = req.url;
      response.error.requestId = (req as any).id || undefined;
    }

    // Add error details if operational
    if (error.isOperational && error.details) {
      response.error.details = error.details;
    }

    // Add stack trace in development
    if (includeStack && error.stack) {
      response.error.stack = error.stack;
    }

    return response;
  }

  /**
   * Send error response to client
   */
  static sendErrorResponse(res: NextApiResponse, error: AppError, req?: NextApiRequest): void {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const response = this.formatErrorResponse(error, req, isDevelopment);

    res.status(error.statusCode).json(response);
  }

  /**
   * Handle error in API route
   */
  static async handleError(
    error: unknown,
    req: NextApiRequest,
    res: NextApiResponse,
  ): Promise<void> {
    const normalizedError = this.normalizeError(error);

    // Log error (will be integrated with error logger)
    await this.logError(normalizedError, req);

    // Send response to client
    this.sendErrorResponse(res, normalizedError, req);

    // Handle critical errors
    if (!this.isOperational(normalizedError)) {
      await this.handleCriticalError(normalizedError);
    }
  }

  /**
   * Log error (placeholder for error logger integration)
   */
  private static async logError(error: AppError, req: NextApiRequest): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      level: this.getLogLevel(error.severity),
      code: error.code,
      message: error.message,
      category: error.category,
      severity: error.severity,
      statusCode: error.statusCode,
      path: req.url,
      method: req.method,
      ip: this.getClientIp(req),
      userId: (req as any).user?.id,
      details: error.details,
      stack: error.stack,
    };

    // Console log for now (will be replaced with proper logger)
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      console.error('Error:', logData);
    } else {
      console.warn('Error:', logData);
    }
  }

  /**
   * Get log level from severity
   */
  private static getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'warn';
      case ErrorSeverity.MEDIUM:
        return 'error';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }

  /**
   * Get client IP from request
   */
  private static getClientIp(req: NextApiRequest): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['cf-connecting-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Handle critical errors (non-operational)
   */
  private static async handleCriticalError(error: AppError): Promise<void> {
    console.error('CRITICAL ERROR - Application may be in unstable state:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    // In production, you might want to:
    // 1. Send alert to monitoring service
    // 2. Notify on-call team
    // 3. Consider graceful shutdown if necessary

    // For now, just log
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service
    }
  }

  /**
   * Create async error wrapper for API routes
   */
  static asyncHandler(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        await handler(req, res);
      } catch (error) {
        await this.handleError(error, req, res);
      }
    };
  }

  /**
   * Create error from HTTP response
   */
  static fromHttpResponse(response: Response, service: string = 'External API'): AppError {
    const statusCode = response.status;
    const message = response.statusText || 'Request failed';

    if (statusCode >= 500) {
      return new ExternalAPIError(service, message, { statusCode });
    }

    if (statusCode === 404) {
      return new NotFoundError(`${service} resource`);
    }

    if (statusCode === 429) {
      return new RateLimitError();
    }

    if (statusCode === 401) {
      return new AuthenticationError(`${service} authentication failed`);
    }

    if (statusCode === 403) {
      return new AuthorizationError(`${service} access denied`);
    }

    return new AppError(
      message,
      statusCode,
      'HTTP_ERROR',
      ErrorCategory.EXTERNAL_API,
      ErrorSeverity.MEDIUM,
    );
  }
}

/**
 * Helper function to throw errors
 */
export function throwError(
  message: string,
  statusCode?: number,
  code?: string,
  category?: ErrorCategory,
  severity?: ErrorSeverity,
): never {
  throw new AppError(message, statusCode, code, category, severity);
}

/**
 * Assert function for validation
 */
export function assert(
  condition: boolean,
  message: string,
  ErrorClass: typeof AppError = ValidationError,
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Export error types for convenience
 */
export const Errors = {
  Validation: ValidationError,
  Authentication: AuthenticationError,
  Authorization: AuthorizationError,
  NotFound: NotFoundError,
  Conflict: ConflictError,
  RateLimit: RateLimitError,
  Database: DatabaseError,
  ExternalAPI: ExternalAPIError,
  Timeout: TimeoutError,
  Payment: PaymentError,
  App: AppError,
};
