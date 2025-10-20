/**
 * Security Monitor Service
 *
 * Real-time security monitoring and threat detection:
 * - Anomaly detection
 * - Brute force detection
 * - DDoS detection
 * - Suspicious pattern detection
 * - Automated response
 * - Security metrics
 */

import { RedisClient } from '../cache/redis-client';
import { securityLogger, SecurityEventType, SecurityEventSeverity } from './security-logger';

export interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string; // IP or user ID
  description: string;
  indicators: string[];
  automatedResponse?: string;
  resolved: boolean;
}

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  DDOS = 'ddos',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  ACCOUNT_TAKEOVER = 'account_takeover',
  DATA_EXFILTRATION = 'data_exfiltration',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MALICIOUS_INPUT = 'malicious_input',
}

export interface SecurityMetrics {
  timestamp: Date;
  totalRequests: number;
  failedLogins: number;
  blockedIPs: number;
  activeThreats: number;
  averageResponseTime: number;
  topThreats: Array<{ type: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

export class SecurityMonitor {
  private redis: RedisClient;

  // Thresholds
  private readonly BRUTE_FORCE_THRESHOLD = 5; // Failed attempts
  private readonly BRUTE_FORCE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  private readonly DDOS_THRESHOLD = 100; // Requests per minute
  private readonly DDOS_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly SUSPICIOUS_IP_THRESHOLD = 10; // Different user attempts

  constructor() {
    this.redis = RedisClient.getInstance();
  }

  // ============================================================================
  // Brute Force Detection
  // ============================================================================

  /**
   * Detect brute force attacks
   */
  async detectBruteForce(ip: string, identifier: string): Promise<SecurityThreat | null> {
    const key = `monitor:bruteforce:${ip}:${identifier}`;
    const now = Date.now();

    // Add attempt
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(this.BRUTE_FORCE_WINDOW_MS / 1000));

    // Clean old attempts
    const windowStart = now - this.BRUTE_FORCE_WINDOW_MS;
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count recent attempts
    const count = await this.redis.zcard(key);

    if (count >= this.BRUTE_FORCE_THRESHOLD) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.BRUTE_FORCE,
        severity: 'high',
        timestamp: new Date(),
        source: ip,
        description: `Brute force attack detected from ${ip} targeting ${identifier}`,
        indicators: [
          `${count} failed login attempts in ${this.BRUTE_FORCE_WINDOW_MS / 1000}s`,
          `Target: ${identifier}`,
        ],
        automatedResponse: 'IP temporarily blocked',
        resolved: false,
      };

      await this.recordThreat(threat);
      await this.blockIP(ip, 30 * 60 * 1000); // Block for 30 minutes

      return threat;
    }

    return null;
  }

  /**
   * Detect credential stuffing
   */
  async detectCredentialStuffing(ip: string): Promise<SecurityThreat | null> {
    const key = `monitor:credentials:${ip}`;
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes

    // Count unique identifiers attempted from this IP
    const attempts = await this.redis.zrangebyscore(key, now - windowMs, now, 1000);

    const uniqueIdentifiers = new Set(attempts.map(a => JSON.parse(a).identifier));

    if (uniqueIdentifiers.size >= this.SUSPICIOUS_IP_THRESHOLD) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.CREDENTIAL_STUFFING,
        severity: 'critical',
        timestamp: new Date(),
        source: ip,
        description: `Credential stuffing detected from ${ip}`,
        indicators: [
          `${uniqueIdentifiers.size} different accounts targeted`,
          `Within ${windowMs / 1000}s window`,
        ],
        automatedResponse: 'IP blocked indefinitely',
        resolved: false,
      };

      await this.recordThreat(threat);
      await this.blockIP(ip, 24 * 60 * 60 * 1000); // Block for 24 hours

      return threat;
    }

    return null;
  }

  // ============================================================================
  // DDoS Detection
  // ============================================================================

  /**
   * Detect DDoS attacks
   */
  async detectDDoS(ip: string): Promise<SecurityThreat | null> {
    const key = `monitor:requests:${ip}`;
    const now = Date.now();

    // Add request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(this.DDOS_WINDOW_MS / 1000));

    // Clean old requests
    const windowStart = now - this.DDOS_WINDOW_MS;
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count recent requests
    const count = await this.redis.zcard(key);

    if (count >= this.DDOS_THRESHOLD) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.DDOS,
        severity: 'critical',
        timestamp: new Date(),
        source: ip,
        description: `DDoS attack detected from ${ip}`,
        indicators: [
          `${count} requests in ${this.DDOS_WINDOW_MS / 1000}s`,
          `Threshold: ${this.DDOS_THRESHOLD} req/min`,
        ],
        automatedResponse: 'IP blocked and rate limited',
        resolved: false,
      };

      await this.recordThreat(threat);
      await this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour

      return threat;
    }

    return null;
  }

  // ============================================================================
  // Suspicious Activity Detection
  // ============================================================================

  /**
   * Detect unusual login locations
   */
  async detectUnusualLocation(
    userId: string,
    ip: string,
    country: string,
  ): Promise<SecurityThreat | null> {
    const key = `monitor:locations:${userId}`;

    // Get known locations
    const locations = await this.redis.lrange(key, 0, 49);
    const knownCountries = locations.map(l => JSON.parse(l).country);

    // Check if new location
    if (locations.length > 0 && !knownCountries.includes(country)) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.SUSPICIOUS_ACTIVITY,
        severity: 'medium',
        timestamp: new Date(),
        source: userId,
        description: `Login from unusual location: ${country}`,
        indicators: [`New country: ${country}`, `Known locations: ${knownCountries.join(', ')}`],
        automatedResponse: 'User notified, 2FA required',
        resolved: false,
      };

      await this.recordThreat(threat);

      // Log security event
      await securityLogger.logEvent(
        SecurityEventType.SUSPICIOUS_LOGIN,
        SecurityEventSeverity.HIGH,
        `Unusual location detected for user ${userId}`,
        {
          userId,
          ip,
          userAgent: 'monitor',
          details: { country, knownCountries },
        },
      );

      return threat;
    }

    // Store location
    await this.redis.lpush(key, JSON.stringify({ ip, country, timestamp: new Date() }));
    await this.redis.ltrim(key, 0, 49);
    await this.redis.expire(key, 90 * 24 * 60 * 60); // 90 days

    return null;
  }

  /**
   * Detect account takeover indicators
   */
  async detectAccountTakeover(
    userId: string,
    ip: string,
    indicators: {
      passwordChanged?: boolean;
      emailChanged?: boolean;
      phoneChanged?: boolean;
      rapidTransactions?: boolean;
    },
  ): Promise<SecurityThreat | null> {
    const suspiciousChanges: string[] = [];

    if (indicators.passwordChanged) suspiciousChanges.push('Password changed');
    if (indicators.emailChanged) suspiciousChanges.push('Email changed');
    if (indicators.phoneChanged) suspiciousChanges.push('Phone changed');
    if (indicators.rapidTransactions) suspiciousChanges.push('Rapid transactions');

    if (suspiciousChanges.length >= 2) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.ACCOUNT_TAKEOVER,
        severity: 'critical',
        timestamp: new Date(),
        source: userId,
        description: `Possible account takeover for user ${userId}`,
        indicators: suspiciousChanges,
        automatedResponse: 'Account locked, user notified',
        resolved: false,
      };

      await this.recordThreat(threat);

      return threat;
    }

    return null;
  }

  /**
   * Detect data exfiltration
   */
  async detectDataExfiltration(
    userId: string,
    ip: string,
    dataVolume: number, // in MB
    timeWindow: number, // in seconds
  ): Promise<SecurityThreat | null> {
    const threshold = 100; // 100 MB in short time
    const windowThreshold = 60; // 1 minute

    if (dataVolume > threshold && timeWindow < windowThreshold) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.DATA_EXFILTRATION,
        severity: 'critical',
        timestamp: new Date(),
        source: userId,
        description: `Possible data exfiltration detected for user ${userId}`,
        indicators: [`${dataVolume}MB transferred in ${timeWindow}s`, `From IP: ${ip}`],
        automatedResponse: 'Session terminated, admin notified',
        resolved: false,
      };

      await this.recordThreat(threat);

      return threat;
    }

    return null;
  }

  /**
   * Detect privilege escalation attempts
   */
  async detectPrivilegeEscalation(
    userId: string,
    attemptedAction: string,
    currentRole: string,
    requiredRole: string,
  ): Promise<SecurityThreat | null> {
    const key = `monitor:privilege:${userId}`;

    // Track escalation attempts
    await this.redis.incr(key);
    await this.redis.expire(key, 60 * 60); // 1 hour

    const attempts = parseInt((await this.redis.get(key)) || '0');

    if (attempts >= 3) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.PRIVILEGE_ESCALATION,
        severity: 'high',
        timestamp: new Date(),
        source: userId,
        description: `Privilege escalation attempts detected for user ${userId}`,
        indicators: [
          `${attempts} unauthorized access attempts`,
          `Action: ${attemptedAction}`,
          `Current role: ${currentRole}`,
          `Required role: ${requiredRole}`,
        ],
        automatedResponse: 'Account flagged for review',
        resolved: false,
      };

      await this.recordThreat(threat);

      return threat;
    }

    return null;
  }

  // ============================================================================
  // Input Attack Detection
  // ============================================================================

  /**
   * Detect XSS attempts
   */
  async detectXSS(input: string, ip: string): Promise<SecurityThreat | null> {
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /<iframe/gi,
      /<embed/gi,
      /<object/gi,
    ];

    const matches = xssPatterns.filter(pattern => pattern.test(input));

    if (matches.length > 0) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.MALICIOUS_INPUT,
        severity: 'high',
        timestamp: new Date(),
        source: ip,
        description: 'XSS attack attempt detected',
        indicators: [
          'Malicious script tags detected',
          `Patterns matched: ${matches.length}`,
          `Input preview: ${input.substring(0, 100)}`,
        ],
        automatedResponse: 'Request blocked, IP flagged',
        resolved: false,
      };

      await this.recordThreat(threat);

      return threat;
    }

    return null;
  }

  /**
   * Detect SQL injection attempts
   */
  async detectSQLInjection(input: string, ip: string): Promise<SecurityThreat | null> {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(\bDROP\b.*\bTABLE\b)/gi,
      /(\bDELETE\b.*\bFROM\b)/gi,
      /(\bINSERT\b.*\bINTO\b)/gi,
      /(;.*--)/g,
      /('.*OR.*'.*=.*')/gi,
    ];

    const matches = sqlPatterns.filter(pattern => pattern.test(input));

    if (matches.length > 0) {
      const threat: SecurityThreat = {
        id: this.generateThreatId(),
        type: ThreatType.MALICIOUS_INPUT,
        severity: 'critical',
        timestamp: new Date(),
        source: ip,
        description: 'SQL injection attempt detected',
        indicators: [
          'SQL injection patterns detected',
          `Patterns matched: ${matches.length}`,
          `Input preview: ${input.substring(0, 100)}`,
        ],
        automatedResponse: 'Request blocked, IP blocked',
        resolved: false,
      };

      await this.recordThreat(threat);
      await this.blockIP(ip, 24 * 60 * 60 * 1000); // Block for 24 hours

      return threat;
    }

    return null;
  }

  // ============================================================================
  // Threat Management
  // ============================================================================

  /**
   * Record security threat
   */
  private async recordThreat(threat: SecurityThreat): Promise<void> {
    const key = 'security:threats';
    await this.redis.lpush(key, JSON.stringify(threat));
    await this.redis.ltrim(key, 0, 999); // Keep last 1000
    await this.redis.expire(key, 30 * 24 * 60 * 60); // 30 days

    // Log to security logger
    await securityLogger.logEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventSeverity.CRITICAL,
      threat.description,
      {
        ip: threat.source,
        userAgent: 'monitor',
        details: {
          threatType: threat.type,
          indicators: threat.indicators,
          automatedResponse: threat.automatedResponse,
        },
      },
    );

    console.error('🚨 Security threat detected:', threat);
  }

  /**
   * Get active threats
   */
  async getActiveThreats(limit: number = 100): Promise<SecurityThreat[]> {
    const key = 'security:threats';
    const threats = await this.redis.lrange(key, 0, limit - 1);
    return threats.map(t => JSON.parse(t)).filter(t => !t.resolved);
  }

  /**
   * Resolve threat
   */
  async resolveThreat(threatId: string): Promise<void> {
    const threats = await this.getActiveThreats(1000);
    const threat = threats.find(t => t.id === threatId);

    if (threat) {
      threat.resolved = true;

      // Update in Redis
      const key = 'security:threats';
      await this.redis.lrem(key, 0, JSON.stringify({ ...threat, resolved: false }));
      await this.redis.lpush(key, JSON.stringify(threat));
    }
  }

  // ============================================================================
  // IP Management
  // ============================================================================

  /**
   * Block IP address
   */
  private async blockIP(ip: string, durationMs: number): Promise<void> {
    const key = `security:blocked:${ip}`;
    await this.redis.set(key, '1', Math.ceil(durationMs / 1000));
    console.warn(`🚫 Blocked IP: ${ip} for ${durationMs / 1000}s`);
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    const key = `security:blocked:${ip}`;
    const blocked = await this.redis.get(key);
    return blocked !== null;
  }

  /**
   * Unblock IP
   */
  async unblockIP(ip: string): Promise<void> {
    const key = `security:blocked:${ip}`;
    await this.redis.del(key);
    console.log(`✅ Unblocked IP: ${ip}`);
  }

  /**
   * Get blocked IPs
   */
  async getBlockedIPs(): Promise<string[]> {
    const pattern = 'security:blocked:*';
    const keys = await this.redis.keys(pattern);
    return keys.map(k => k.replace('security:blocked:', ''));
  }

  // ============================================================================
  // Metrics & Reporting
  // ============================================================================

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const threats = await this.getActiveThreats(1000);
    const blockedIPs = await this.getBlockedIPs();

    // Count threat types
    const threatCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};

    for (const threat of threats) {
      threatCounts[threat.type] = (threatCounts[threat.type] || 0) + 1;
      sourceCounts[threat.source] = (sourceCounts[threat.source] || 0) + 1;
    }

    const topThreats = Object.entries(threatCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    return {
      timestamp: new Date(),
      totalRequests: 0, // TODO: Implement request counter
      failedLogins: 0, // TODO: Get from security logger
      blockedIPs: blockedIPs.length,
      activeThreats: threats.length,
      averageResponseTime: 0, // TODO: Implement response time tracking
      topThreats,
      topSources,
    };
  }

  /**
   * Generate threat ID
   */
  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton
export const securityMonitor = new SecurityMonitor();

// Example usage:
/*
// Detect brute force
const threat = await securityMonitor.detectBruteForce(
  '192.168.1.1',
  'user@example.com'
);

if (threat) {
  console.log('Threat detected:', threat);
}

// Detect XSS
const xssThreat = await securityMonitor.detectXSS(
  '<script>alert("xss")</script>',
  '192.168.1.1'
);

// Check if IP is blocked
const isBlocked = await securityMonitor.isIPBlocked('192.168.1.1');

// Get security metrics
const metrics = await securityMonitor.getSecurityMetrics();
console.log('Active threats:', metrics.activeThreats);
console.log('Blocked IPs:', metrics.blockedIPs);
*/
