/**
 * Error Logger
 * Comprehensive error logging with persistence, aggregation, and analysis
 */

import { writeFile, appendFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { AppError, ErrorSeverity, ErrorCategory } from './error-handler';

/**
 * Log entry structure
 */
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'fatal';
  error: {
    code: string;
    message: string;
    name: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    stack?: string;
    cause?: any;
  };
  context: {
    environment: string;
    nodeVersion: string;
    platform: string;
    hostname: string;
    pid: number;
  };
  request?: {
    method?: string;
    url?: string;
    path?: string;
    query?: any;
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    userAgent?: string;
    requestId?: string;
  };
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  performance?: {
    duration?: number;
    memory?: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
  };
  tags?: string[];
  fingerprint?: string;
  occurrences?: number;
}

/**
 * Error aggregation key
 */
interface ErrorFingerprint {
  code: string;
  message: string;
  stack: string;
  path?: string;
}

/**
 * Error statistics
 */
export interface ErrorStats {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byCode: Record<string, number>;
  topErrors: Array<{ code: string; count: number; message: string }>;
  timeRange: { start: string; end: string };
}

/**
 * Error Logger Service
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logDir: string;
  private errorCache: Map<string, ErrorLogEntry>;
  private aggregationWindow: number = 60000; // 1 minute

  private constructor() {
    this.logDir = join(process.cwd(), 'logs', 'errors');
    this.errorCache = new Map();
    this.ensureLogDirectory();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    try {
      await mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(data: ErrorFingerprint): string {
    const normalizedStack = this.normalizeStack(data.stack);
    const key = `${data.code}:${data.message}:${normalizedStack}:${data.path || ''}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Normalize stack trace for consistent fingerprinting
   */
  private normalizeStack(stack: string): string {
    if (!stack) return '';

    // Remove line numbers and column numbers
    return stack
      .split('\n')
      .slice(0, 5) // Only first 5 lines
      .map(line => line.replace(/:\d+:\d+/g, ''))
      .join('\n');
  }

  /**
   * Log error with full context
   */
  async logError(
    error: Error | AppError,
    context?: {
      request?: any;
      user?: any;
      tags?: string[];
      additionalData?: Record<string, any>;
    },
  ): Promise<string> {
    const logEntry = this.createLogEntry(error, context);

    // Check for duplicate errors
    const existingEntry = this.errorCache.get(logEntry.fingerprint!);
    if (existingEntry) {
      existingEntry.occurrences = (existingEntry.occurrences || 1) + 1;
      await this.updateLogEntry(existingEntry);
      return existingEntry.id;
    }

    // Store in cache
    this.errorCache.set(logEntry.fingerprint!, logEntry);

    // Clean old cache entries
    this.cleanCache();

    // Persist to file
    await this.persistLog(logEntry);

    // Log to console
    this.consoleLog(logEntry);

    return logEntry.id;
  }

  /**
   * Create log entry from error
   */
  private createLogEntry(error: Error | AppError, context?: any): ErrorLogEntry {
    const appError = error instanceof AppError ? error : this.normalizeError(error);

    const entry: ErrorLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: this.getLogLevel(appError),
      error: {
        code: appError.code || 'UNKNOWN_ERROR',
        message: appError.message,
        name: appError.name,
        category: appError.category || ErrorCategory.INTERNAL,
        severity: appError.severity || ErrorSeverity.MEDIUM,
        stack: appError.stack,
        cause: (appError as any).cause,
      },
      context: {
        environment: process.env.NODE_ENV || 'unknown',
        nodeVersion: process.version,
        platform: process.platform,
        hostname: process.env.HOSTNAME || 'unknown',
        pid: process.pid,
      },
      performance: {
        memory: process.memoryUsage(),
      },
    };

    // Add request context
    if (context?.request) {
      entry.request = {
        method: context.request.method,
        url: context.request.url,
        path: context.request.path,
        query: context.request.query,
        headers: this.sanitizeHeaders(context.request.headers),
        ip: this.getClientIp(context.request),
        userAgent: context.request.headers?.['user-agent'],
        requestId: context.request.id,
      };
    }

    // Add user context
    if (context?.user) {
      entry.user = {
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
      };
    }

    // Add tags
    if (context?.tags) {
      entry.tags = context.tags;
    }

    // Generate fingerprint
    entry.fingerprint = this.generateFingerprint({
      code: entry.error.code,
      message: entry.error.message,
      stack: entry.error.stack || '',
      path: entry.request?.path,
    });

    entry.occurrences = 1;

    return entry;
  }

  /**
   * Normalize error to AppError format
   */
  private normalizeError(error: Error): AppError {
    return new AppError(
      error.message,
      500,
      'UNKNOWN_ERROR',
      ErrorCategory.INTERNAL,
      ErrorSeverity.MEDIUM,
      false,
    );
  }

  /**
   * Get log level from AppError
   */
  private getLogLevel(error: AppError): 'error' | 'warn' | 'fatal' {
    switch (error.severity) {
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
   * Sanitize headers (remove sensitive data)
   */
  private sanitizeHeaders(headers: any): Record<string, string> {
    if (!headers) return {};

    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  /**
   * Get client IP from request
   */
  private getClientIp(request: any): string {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0] ||
      request.headers?.['x-real-ip'] ||
      request.headers?.['cf-connecting-ip'] ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persist log to file
   */
  private async persistLog(entry: ErrorLogEntry): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `errors-${date}.jsonl`;
      const filepath = join(this.logDir, filename);

      const logLine = JSON.stringify(entry) + '\n';
      await appendFile(filepath, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to persist error log:', error);
    }
  }

  /**
   * Update existing log entry
   */
  private async updateLogEntry(entry: ErrorLogEntry): Promise<void> {
    // In production, you'd update the database entry
    // For now, just update cache and write a new line
    await this.persistLog(entry);
  }

  /**
   * Console logging
   */
  private consoleLog(entry: ErrorLogEntry): void {
    const { level, error, request } = entry;

    const logData = {
      level,
      code: error.code,
      message: error.message,
      category: error.category,
      severity: error.severity,
      path: request?.path,
      method: request?.method,
      userId: entry.user?.id,
      occurrences: entry.occurrences,
      timestamp: entry.timestamp,
    };

    if (level === 'fatal') {
      console.error('FATAL ERROR:', logData);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    } else if (level === 'error') {
      console.error('ERROR:', logData);
    } else {
      console.warn('WARNING:', logData);
    }
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();

    for (const [fingerprint, entry] of this.errorCache.entries()) {
      const entryTime = new Date(entry.timestamp).getTime();
      if (now - entryTime > this.aggregationWindow) {
        this.errorCache.delete(fingerprint);
      }
    }
  }

  /**
   * Query logs by criteria
   */
  async queryLogs(criteria: {
    startDate?: Date;
    endDate?: Date;
    level?: string;
    category?: ErrorCategory;
    code?: string;
    userId?: string;
    limit?: number;
  }): Promise<ErrorLogEntry[]> {
    const { startDate, endDate, level, category, code, userId, limit = 100 } = criteria;

    try {
      const logs: ErrorLogEntry[] = [];
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
      const end = endDate || new Date();

      // Read log files
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toISOString().split('T')[0];
        const filename = `errors-${date}.jsonl`;
        const filepath = join(this.logDir, filename);

        try {
          const content = await readFile(filepath, 'utf-8');
          const lines = content.trim().split('\n');

          for (const line of lines) {
            if (!line) continue;

            const entry: ErrorLogEntry = JSON.parse(line);

            // Apply filters
            if (level && entry.level !== level) continue;
            if (category && entry.error.category !== category) continue;
            if (code && entry.error.code !== code) continue;
            if (userId && entry.user?.id !== userId) continue;

            logs.push(entry);

            if (logs.length >= limit) break;
          }
        } catch (error) {
          // File doesn't exist or can't be read, skip
          continue;
        }

        if (logs.length >= limit) break;
      }

      return logs.reverse(); // Most recent first
    } catch (error) {
      console.error('Failed to query logs:', error);
      return [];
    }
  }

  /**
   * Get error statistics
   */
  async getStatistics(days: number = 7): Promise<ErrorStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs = await this.queryLogs({ startDate, limit: 10000 });

    const stats: ErrorStats = {
      total: logs.length,
      byLevel: {},
      byCategory: {},
      bySeverity: {},
      byCode: {},
      topErrors: [],
      timeRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
    };

    const errorCounts: Map<string, { code: string; count: number; message: string }> = new Map();

    for (const log of logs) {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by category
      stats.byCategory[log.error.category] = (stats.byCategory[log.error.category] || 0) + 1;

      // Count by severity
      stats.bySeverity[log.error.severity] = (stats.bySeverity[log.error.severity] || 0) + 1;

      // Count by code
      stats.byCode[log.error.code] = (stats.byCode[log.error.code] || 0) + 1;

      // Track error occurrences
      const existing = errorCounts.get(log.error.code);
      if (existing) {
        existing.count += log.occurrences || 1;
      } else {
        errorCounts.set(log.error.code, {
          code: log.error.code,
          count: log.occurrences || 1,
          message: log.error.message,
        });
      }
    }

    // Get top errors
    stats.topErrors = Array.from(errorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Clear old logs
   */
  async clearOldLogs(daysToKeep: number = 30): Promise<number> {
    let clearedCount = 0;

    // TODO: Implement log file cleanup
    // Read directory, delete files older than daysToKeep

    return clearedCount;
  }
}

/**
 * Singleton instance
 */
export const errorLogger = ErrorLogger.getInstance();

/**
 * Helper function to log errors
 */
export async function logError(error: Error | AppError, context?: any): Promise<string> {
  return errorLogger.logError(error, context);
}

/**
 * Helper function to query logs
 */
export async function queryErrorLogs(criteria: Parameters<ErrorLogger['queryLogs']>[0]) {
  return errorLogger.queryLogs(criteria);
}

/**
 * Helper function to get error statistics
 */
export async function getErrorStatistics(days?: number) {
  return errorLogger.getStatistics(days);
}
