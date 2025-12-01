/**
 * Authentication Security Module
 *
 * Comprehensive authentication security features:
 * - Account lockout protection
 * - Session management
 * - JWT security
 * - 2FA/TOTP verification
 * - Login attempt tracking
 * - IP-based security
 */

import { redisClient, type RedisClient } from '../cache/redis-client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface LoginAttempt {
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  userId?: string;
}

export interface AccountLockout {
  userId: string;
  lockedUntil: Date;
  reason: string;
  attemptCount: number;
}

export interface SessionData {
  userId: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class AuthSecurityService {
  private redis: RedisClient;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  // Configuration
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly JWT_LIFETIME = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_LIFETIME = '7d'; // 7 days
  private readonly MAX_SESSIONS_PER_USER = 5;

  constructor() {
    this.redis = redisClient;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
  }

  // ============================================================================
  // Account Lockout Protection
  // ============================================================================

  /**
   * Record login attempt
   */
  async recordLoginAttempt(
    identifier: string, // Email or username
    success: boolean,
    ip: string,
    userAgent: string,
    userId?: string
  ): Promise<void> {
    const key = `login:attempts:${identifier}`;
    const attempt: LoginAttempt = {
      ip,
      userAgent,
      timestamp: new Date(),
      success,
      userId,
    };

    // Add to list
    await this.redis.lpush(key, JSON.stringify(attempt));
    await this.redis.ltrim(key, 0, 99); // Keep last 100
    await this.redis.expire(key, 24 * 60 * 60); // 24 hours

    if (!success) {
      await this.checkAndLockAccount(identifier, ip);
    }
  }

  /**
   * Check and lock account if needed
   */
  private async checkAndLockAccount(identifier: string, ip: string): Promise<void> {
    const key = `login:attempts:${identifier}`;
    const attempts = await this.redis.lrange(key, 0, this.MAX_LOGIN_ATTEMPTS - 1);

    // Parse recent attempts
    const recentAttempts: LoginAttempt[] = attempts.map(a => JSON.parse(a)).filter(a => !a.success);

    if (recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      // Check if all attempts are recent (within lockout window)
      const now = Date.now();
      const recentFailures = recentAttempts.filter(a => {
        const attemptTime = new Date(a.timestamp).getTime();
        return now - attemptTime < this.LOCKOUT_DURATION_MS;
      });

      if (recentFailures.length >= this.MAX_LOGIN_ATTEMPTS) {
        await this.lockAccount(identifier, 'Too many failed login attempts', ip);
      }
    }
  }

  /**
   * Lock account
   */
  async lockAccount(identifier: string, reason: string, ip: string): Promise<void> {
    const key = `account:locked:${identifier}`;
    const lockout: AccountLockout = {
      userId: identifier,
      lockedUntil: new Date(Date.now() + this.LOCKOUT_DURATION_MS),
      reason,
      attemptCount: this.MAX_LOGIN_ATTEMPTS,
    };

    await this.redis.set(key, JSON.stringify(lockout), Math.ceil(this.LOCKOUT_DURATION_MS / 1000));

    // Log security event
    console.warn(`Account locked: ${identifier} from IP ${ip} - ${reason}`);
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(identifier: string): Promise<{
    locked: boolean;
    lockout?: AccountLockout;
  }> {
    const key = `account:locked:${identifier}`;
    const data = await this.redis.get(key);

    if (!data) {
      return { locked: false };
    }

    const lockout: AccountLockout = JSON.parse(data);
    const now = new Date();
    const lockedUntil = new Date(lockout.lockedUntil);

    if (now >= lockedUntil) {
      await this.redis.del(key);
      return { locked: false };
    }

    return { locked: true, lockout };
  }

  /**
   * Unlock account (admin action)
   */
  async unlockAccount(identifier: string): Promise<void> {
    const key = `account:locked:${identifier}`;
    await this.redis.del(key);

    // Clear failed attempts
    const attemptsKey = `login:attempts:${identifier}`;
    await this.redis.del(attemptsKey);

    console.log(`Account unlocked: ${identifier}`);
  }

  /**
   * Get failed login attempts
   */
  async getFailedAttempts(identifier: string): Promise<LoginAttempt[]> {
    const key = `login:attempts:${identifier}`;
    const attempts = await this.redis.lrange(key, 0, 19); // Last 20 attempts

    return attempts.map(a => JSON.parse(a)).filter(a => !a.success);
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Create session
   */
  async createSession(userId: string, ip: string, userAgent: string): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_LIFETIME_MS);

    const session: SessionData = {
      userId,
      sessionId,
      ip,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt,
    };

    // Store session
    const key = `session:${sessionId}`;
    await this.redis.set(key, JSON.stringify(session), Math.ceil(this.SESSION_LIFETIME_MS / 1000));

    // Add to user's session list
    const userSessionsKey = `user:sessions:${userId}`;
    await this.redis.lpush(userSessionsKey, sessionId);
    await this.redis.ltrim(userSessionsKey, 0, this.MAX_SESSIONS_PER_USER - 1);
    await this.redis.expire(userSessionsKey, Math.ceil(this.SESSION_LIFETIME_MS / 1000));

    return session;
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = `session:${sessionId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    const session: SessionData = JSON.parse(data);

    // Check if expired
    if (new Date() >= new Date(session.expiresAt)) {
      await this.destroySession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.lastActivity = new Date();

    const key = `session:${sessionId}`;
    await this.redis.set(key, JSON.stringify(session), Math.ceil(this.SESSION_LIFETIME_MS / 1000));
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      // Remove from user's session list
      const userSessionsKey = `user:sessions:${session.userId}`;
      await this.redis.lrem(userSessionsKey, 0, sessionId);
    }

    // Delete session
    const key = `session:${sessionId}`;
    await this.redis.del(key);
  }

  /**
   * Destroy all user sessions (logout all devices)
   */
  async destroyAllUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessionIds = await this.redis.lrange(userSessionsKey, 0, -1);

    // Delete all sessions
    for (const sessionId of sessionIds) {
      const key = `session:${sessionId}`;
      await this.redis.del(key);
    }

    // Clear session list
    await this.redis.del(userSessionsKey);
  }

  /**
   * Get all user sessions
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessionIds = await this.redis.lrange(userSessionsKey, 0, -1);

    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ============================================================================
  // JWT Security
  // ============================================================================

  /**
   * Create access token
   */
  createAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.JWT_LIFETIME,
      issuer: 'gacp-admin',
      audience: 'gacp-api',
    });
  }

  /**
   * Create refresh token
   */
  createRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.REFRESH_TOKEN_LIFETIME,
      issuer: 'gacp-admin',
      audience: 'gacp-api',
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'gacp-admin',
        audience: 'gacp-api',
      }) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtRefreshSecret, {
        issuer: 'gacp-admin',
        audience: 'gacp-api',
      }) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    // Check if session still valid
    const session = await this.getSession(payload.sessionId);
    if (!session) {
      return null;
    }

    // Create new tokens
    const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };

    return {
      accessToken: this.createAccessToken(newPayload),
      refreshToken: this.createRefreshToken(newPayload),
    };
  }

  /**
   * Revoke token (blacklist)
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) {
        return;
      }

      const key = `token:revoked:${token}`;
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        await this.redis.set(key, '1', ttl);
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }

  /**
   * Check if token is revoked
   */
  async isTokenRevoked(token: string): Promise<boolean> {
    const key = `token:revoked:${token}`;
    const revoked = await this.redis.get(key);
    return revoked !== null;
  }

  // ============================================================================
  // 2FA Preparation
  // ============================================================================

  /**
   * Generate 2FA secret
   */
  generate2FASecret(userEmail: string): TwoFactorSecret {
    const secret = this.generateBase32Secret();

    // Generate QR code URL (for authenticator apps)
    const issuer = 'GACP Admin';
    const qrCode = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Generate base32 secret
   */
  private generateBase32Secret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';

    for (let i = 0; i < 32; i++) {
      secret += chars[crypto.randomInt(chars.length)];
    }

    return secret;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const formatted = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formatted);
    }

    return codes;
  }

  /**
   * Store 2FA secret
   */
  async store2FASecret(userId: string, secret: string): Promise<void> {
    const key = `2fa:secret:${userId}`;
    await this.redis.set(key, secret);
  }

  /**
   * Get 2FA secret
   */
  async get2FASecret(userId: string): Promise<string | null> {
    const key = `2fa:secret:${userId}`;
    return await this.redis.get(key);
  }

  /**
   * Verify 2FA token using TOTP
   */
  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const secret = await this.get2FASecret(userId);
    if (!secret) {
      return false;
    }

    // Verify TOTP token using speakeasy
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps before/after for clock drift
    });

    return verified;
  }

  // ============================================================================
  // IP-based Security
  // ============================================================================

  /**
   * Track IP-based login patterns
   */
  async trackIPLogin(userId: string, ip: string): Promise<void> {
    const key = `user:ips:${userId}`;
    await this.redis.lpush(
      key,
      JSON.stringify({
        ip,
        timestamp: new Date().toISOString(),
      })
    );
    await this.redis.ltrim(key, 0, 49); // Keep last 50
    await this.redis.expire(key, 90 * 24 * 60 * 60); // 90 days
  }

  /**
   * Check if IP is suspicious
   */
  async isSuspiciousIP(userId: string, ip: string): Promise<boolean> {
    const key = `user:ips:${userId}`;
    const ips = await this.redis.lrange(key, 0, 49);

    if (ips.length === 0) {
      return false;
    }

    const knownIPs = ips.map(entry => JSON.parse(entry).ip);
    return !knownIPs.includes(ip);
  }
}

// Export singleton
export const authSecurity = new AuthSecurityService();

// Example usage:
/*
// Record login attempt
await authSecurity.recordLoginAttempt(
  'user@example.com',
  false,
  '192.168.1.1',
  'Mozilla/5.0...'
);

// Check if account locked
const { locked, lockout } = await authSecurity.isAccountLocked('user@example.com');
if (locked) {
  console.log('Account locked until:', lockout?.lockedUntil);
}

// Create session
const session = await authSecurity.createSession(
  'user-id',
  '192.168.1.1',
  'Mozilla/5.0...'
);

// Create tokens
const accessToken = authSecurity.createAccessToken({
  userId: 'user-id',
  email: 'user@example.com',
  role: 'USER',
  sessionId: session.sessionId
});

// Verify token
const payload = authSecurity.verifyAccessToken(accessToken);
if (payload) {
  console.log('User ID:', payload.userId);
}

// Generate 2FA secret
const twoFA = authSecurity.generate2FASecret('user@example.com');
console.log('Secret:', twoFA.secret);
console.log('QR Code:', twoFA.qrCode);
console.log('Backup codes:', twoFA.backupCodes);
*/
