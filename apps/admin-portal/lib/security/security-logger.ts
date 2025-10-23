// @ts-nocheck
/**
 * Security Logger Service
 *
 * Comprehensive security event logging for:
 * - Authentication events
 * - Authorization failures
 * - Suspicious activities
 * - Data access
 * - Configuration changes
 * - Security alerts
 */

import { redisClient, type RedisClient } from '../cache/redis-client';
import fs from 'fs/promises';
import path from 'path';

export enum SecurityEventType {
  // Authentication
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // Authorization
  ACCESS_DENIED = 'access_denied',
  PERMISSION_VIOLATION = 'permission_violation',
  ROLE_CHANGE = 'role_change',

  // Data Access
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  BULK_OPERATION = 'bulk_operation',

  // Security Violations
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_VIOLATION = 'csrf_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',

  // Suspicious Activity
  SUSPICIOUS_LOGIN = 'suspicious_login',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  UNUSUAL_DATA_ACCESS = 'unusual_data_access',
  PRIVILEGE_ESCALATION_ATTEMPT = 'privilege_escalation_attempt',

  // System
  CONFIG_CHANGE = 'config_change',
  SECURITY_SETTING_CHANGE = 'security_setting_change',
  ADMIN_ACTION = 'admin_action',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  userId?: string;
  ip: string;
  userAgent: string;
  message: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SecurityLogQuery {
  type?: SecurityEventType[];
  severity?: SecurityEventSeverity[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class SecurityLogger {
  private redis: RedisClient;
  private logDir: string;

  constructor() {
    this.redis = redisClient;
    this.logDir = path.join(process.cwd(), 'logs', 'security');
  }

  /**
   * Log security event
   */
  async logEvent(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    message: string,
    options: {
      userId?: string;
      ip: string;
      userAgent: string;
      details?: Record<string, any>;
      metadata?: Record<string, any>;
    },
  ): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date(),
      userId: options.userId,
      ip: options.ip,
      userAgent: options.userAgent,
      message,
      details: options.details,
      metadata: options.metadata,
    };

    // Store in Redis (recent events)
    await this.storeInRedis(event);

    // Write to file (persistent storage)
    await this.writeToFile(event);

    // Trigger alerts for critical events
    if (severity === SecurityEventSeverity.CRITICAL) {
      await this.triggerAlert(event);
    }

    // Console log for development
    this.consoleLog(event);

    return event;
  }

  /**
   * Store event in Redis
   */
  private async storeInRedis(event: SecurityEvent): Promise<void> {
    const key = `security:events`;
    const eventJson = JSON.stringify(event);

    // Add to sorted set with timestamp as score
    await this.redis.zadd(key, event.timestamp.getTime(), eventJson);

    // Keep only last 10,000 events
    const count = await this.redis.zcard(key);
    if (count > 10000) {
      await this.redis.zremrangebyrank(key, 0, count - 10001);
    }

    // Set expiry (90 days)
    await this.redis.expire(key, 90 * 24 * 60 * 60);

    // Also store by user if userId exists
    if (event.userId) {
      const userKey = `security:events:user:${event.userId}`;
      await this.redis.lpush(userKey, eventJson);
      await this.redis.ltrim(userKey, 0, 999); // Keep last 1000
      await this.redis.expire(userKey, 90 * 24 * 60 * 60);
    }

    // Store by type
    const typeKey = `security:events:type:${event.type}`;
    await this.redis.lpush(typeKey, eventJson);
    await this.redis.ltrim(typeKey, 0, 999);
    await this.redis.expire(typeKey, 90 * 24 * 60 * 60);
  }

  /**
   * Write event to file
   */
  private async writeToFile(event: SecurityEvent): Promise<void> {
    try {
      // Create log directory if it doesn't exist
      await fs.mkdir(this.logDir, { recursive: true });

      // Create daily log file
      const date = event.timestamp.toISOString().split('T')[0];
      const filename = `security-${date}.log`;
      const filepath = path.join(this.logDir, filename);

      // Format log line
      const logLine = JSON.stringify(event) + '\n';

      // Append to file
      await fs.appendFile(filepath, logLine);
    } catch (error) {
      console.error('Failed to write security log to file:', error);
    }
  }

  /**
   * Console log for development
   */
  private consoleLog(event: SecurityEvent): void {
    const emoji = this.getSeverityEmoji(event.severity);
    const color = this.getSeverityColor(event.severity);

    console.log(`${emoji} [${event.severity.toUpperCase()}] ${event.type}: ${event.message}`, {
      userId: event.userId,
      ip: event.ip,
      timestamp: event.timestamp.toISOString(),
    });
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: SecurityEventSeverity): string {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return 'ℹ️';
      case SecurityEventSeverity.MEDIUM:
        return '⚠️';
      case SecurityEventSeverity.HIGH:
        return '🚨';
      case SecurityEventSeverity.CRITICAL:
        return '🔴';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: SecurityEventSeverity): string {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return '\x1b[36m'; // Cyan
      case SecurityEventSeverity.MEDIUM:
        return '\x1b[33m'; // Yellow
      case SecurityEventSeverity.HIGH:
        return '\x1b[31m'; // Red
      case SecurityEventSeverity.CRITICAL:
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * Trigger alert for critical events
   */
  private async triggerAlert(event: SecurityEvent): Promise<void> {
    // Store in alerts queue
    const alertKey = 'security:alerts';
    await this.redis.lpush(alertKey, JSON.stringify(event));
    await this.redis.ltrim(alertKey, 0, 99); // Keep last 100
    await this.redis.expire(alertKey, 7 * 24 * 60 * 60); // 7 days

    // TODO: Send notifications (email, Slack, SMS, etc.)
    console.error('🚨 CRITICAL SECURITY ALERT:', event.message);
  }

  /**
   * Query security logs
   */
  async queryLogs(query: SecurityLogQuery): Promise<SecurityEvent[]> {
    const key = 'security:events';

    // Get events from Redis
    const startScore = query.startDate?.getTime() || 0;
    const endScore = query.endDate?.getTime() || Date.now();
    const limit = query.limit || 100;

    const events = await this.redis.zrangebyscore(key, startScore, endScore, limit);

    // Parse and filter events
    let parsedEvents: SecurityEvent[] = events.map(e => JSON.parse(e));

    // Filter by type
    if (query.type && query.type.length > 0) {
      parsedEvents = parsedEvents.filter(e => query.type!.includes(e.type));
    }

    // Filter by severity
    if (query.severity && query.severity.length > 0) {
      parsedEvents = parsedEvents.filter(e => query.severity!.includes(e.severity));
    }

    // Filter by userId
    if (query.userId) {
      parsedEvents = parsedEvents.filter(e => e.userId === query.userId);
    }

    return parsedEvents.reverse(); // Most recent first
  }

  /**
   * Get user's security events
   */
  async getUserEvents(userId: string, limit: number = 100): Promise<SecurityEvent[]> {
    const key = `security:events:user:${userId}`;
    const events = await this.redis.lrange(key, 0, limit - 1);
    return events.map(e => JSON.parse(e));
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: SecurityEventType, limit: number = 100): Promise<SecurityEvent[]> {
    const key = `security:events:type:${type}`;
    const events = await this.redis.lrange(key, 0, limit - 1);
    return events.map(e => JSON.parse(e));
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 50): Promise<SecurityEvent[]> {
    const key = 'security:alerts';
    const alerts = await this.redis.lrange(key, 0, limit - 1);
    return alerts.map(a => JSON.parse(a));
  }

  /**
   * Get statistics
   */
  async getStatistics(days: number = 7): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    criticalAlerts: number;
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await this.queryLogs({ startDate, limit: 10000 });

    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      criticalAlerts: 0,
    };

    for (const event of events) {
      // Count by type
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;

      // Count by severity
      stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;

      // Count critical alerts
      if (event.severity === SecurityEventSeverity.CRITICAL) {
        stats.criticalAlerts++;
      }
    }

    return stats;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Clear old logs (maintenance)
   */
  async clearOldLogs(days: number = 90): Promise<void> {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const key = 'security:events';

    await this.redis.zremrangebyscore(key, 0, cutoffDate);
    console.log(`Cleared security logs older than ${days} days`);
  }
}

// Export singleton
export const securityLogger = new SecurityLogger();

// Helper functions for common events
export const SecurityLog = {
  /**
   * Log login success
   */
  loginSuccess: (userId: string, ip: string, userAgent: string) => {
    return securityLogger.logEvent(
      SecurityEventType.LOGIN_SUCCESS,
      SecurityEventSeverity.LOW,
      'User logged in successfully',
      { userId, ip, userAgent },
    );
  },

  /**
   * Log login failure
   */
  loginFailure: (identifier: string, ip: string, userAgent: string, reason: string) => {
    return securityLogger.logEvent(
      SecurityEventType.LOGIN_FAILURE,
      SecurityEventSeverity.MEDIUM,
      `Login failed: ${reason}`,
      {
        ip,
        userAgent,
        details: { identifier, reason },
      },
    );
  },

  /**
   * Log account lockout
   */
  accountLocked: (identifier: string, ip: string, attempts: number) => {
    return securityLogger.logEvent(
      SecurityEventType.ACCOUNT_LOCKED,
      SecurityEventSeverity.HIGH,
      `Account locked after ${attempts} failed login attempts`,
      {
        ip,
        userAgent: 'system',
        details: { identifier, attempts },
      },
    );
  },

  /**
   * Log access denied
   */
  accessDenied: (userId: string, resource: string, ip: string, userAgent: string) => {
    return securityLogger.logEvent(
      SecurityEventType.ACCESS_DENIED,
      SecurityEventSeverity.MEDIUM,
      `Access denied to resource: ${resource}`,
      {
        userId,
        ip,
        userAgent,
        details: { resource },
      },
    );
  },

  /**
   * Log XSS attempt
   */
  xssAttempt: (ip: string, userAgent: string, input: string) => {
    return securityLogger.logEvent(
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventSeverity.HIGH,
      'XSS attack attempt detected',
      {
        ip,
        userAgent,
        details: { input: input.substring(0, 200) },
      },
    );
  },

  /**
   * Log SQL injection attempt
   */
  sqlInjectionAttempt: (ip: string, userAgent: string, query: string) => {
    return securityLogger.logEvent(
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventSeverity.HIGH,
      'SQL injection attempt detected',
      {
        ip,
        userAgent,
        details: { query: query.substring(0, 200) },
      },
    );
  },

  /**
   * Log rate limit exceeded
   */
  rateLimitExceeded: (identifier: string, ip: string, endpoint: string) => {
    return securityLogger.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventSeverity.MEDIUM,
      `Rate limit exceeded for endpoint: ${endpoint}`,
      {
        ip,
        userAgent: 'system',
        details: { identifier, endpoint },
      },
    );
  },

  /**
   * Log sensitive data access
   */
  sensitiveDataAccess: (userId: string, dataType: string, ip: string, userAgent: string) => {
    return securityLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecurityEventSeverity.MEDIUM,
      `Accessed sensitive data: ${dataType}`,
      {
        userId,
        ip,
        userAgent,
        details: { dataType },
      },
    );
  },

  /**
   * Log suspicious login
   */
  suspiciousLogin: (userId: string, ip: string, userAgent: string, reason: string) => {
    return securityLogger.logEvent(
      SecurityEventType.SUSPICIOUS_LOGIN,
      SecurityEventSeverity.HIGH,
      `Suspicious login detected: ${reason}`,
      {
        userId,
        ip,
        userAgent,
        details: { reason },
      },
    );
  },
};

// Example usage:
/*
// Log login success
await SecurityLog.loginSuccess('user-id', '192.168.1.1', 'Mozilla/5.0...');

// Log login failure
await SecurityLog.loginFailure(
  'user@example.com',
  '192.168.1.1',
  'Mozilla/5.0...',
  'Invalid password'
);

// Log custom event
await securityLogger.logEvent(
  SecurityEventType.CONFIG_CHANGE,
  SecurityEventSeverity.HIGH,
  'Security configuration changed',
  {
    userId: 'admin-id',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    details: {
      setting: 'rate_limit',
      oldValue: '60',
      newValue: '100'
    }
  }
);

// Query logs
const events = await securityLogger.queryLogs({
  type: [SecurityEventType.LOGIN_FAILURE],
  severity: [SecurityEventSeverity.HIGH],
  startDate: new Date('2025-01-01'),
  limit: 50
});

// Get statistics
const stats = await securityLogger.getStatistics(7);
console.log('Security events in last 7 days:', stats);
*/
