/**
 * GACP Platform - Redis Caching Configuration
 *
 * Implements caching strategy for:
 * 1. KPI Dashboard data
 * 2. Session management
 * 3. Certificate verification
 * 4. Application status lookup
 *
 * @version 1.0.0
 * @created October 14, 2025
 */

import { createClient, type RedisClientType } from 'redis';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
}

// ============================================================================
// REDIS CLIENT CONFIGURATION
// ============================================================================

const REDIS_CONFIG: CacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'gacp:'
};

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: REDIS_CONFIG.host,
      port: REDIS_CONFIG.port
    },
    password: REDIS_CONFIG.password,
    database: REDIS_CONFIG.db
  });

  redisClient.on('error', err => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  }
}

// ============================================================================
// CACHE KEY GENERATORS
// ============================================================================

const KEYS = {
  // KPI Dashboard
  kpiDashboard: (userId: string) => `${REDIS_CONFIG.keyPrefix}kpi:${userId}`,
  kpiDashboardAdmin: () => `${REDIS_CONFIG.keyPrefix}kpi:admin:global`,

  // Session Management
  session: (sessionId: string) => `${REDIS_CONFIG.keyPrefix}session:${sessionId}`,
  userSessions: (userId: string) => `${REDIS_CONFIG.keyPrefix}sessions:user:${userId}`,

  // Certificate Verification
  certificate: (certificateId: string) => `${REDIS_CONFIG.keyPrefix}cert:${certificateId}`,
  certificateByUser: (userId: string) => `${REDIS_CONFIG.keyPrefix}cert:user:${userId}`,

  // Application Status
  application: (applicationId: string) => `${REDIS_CONFIG.keyPrefix}app:${applicationId}`,
  applicationsByUser: (userId: string) => `${REDIS_CONFIG.keyPrefix}apps:user:${userId}`,

  // Payment
  payment: (paymentId: string) => `${REDIS_CONFIG.keyPrefix}payment:${paymentId}`,
  paymentSession: (sessionId: string) => `${REDIS_CONFIG.keyPrefix}payment:session:${sessionId}`,

  // Inspector Schedule
  inspectorSchedule: (inspectorId: string, date: string) =>
    `${REDIS_CONFIG.keyPrefix}inspector:${inspectorId}:schedule:${date}`,

  // Rate Limiting
  rateLimit: (userId: string, endpoint: string) =>
    `${REDIS_CONFIG.keyPrefix}ratelimit:${userId}:${endpoint}`
};

// ============================================================================
// CACHE TTL (Time To Live) CONFIGURATION
// ============================================================================

export const CACHE_TTL = {
  // KPI Dashboard: 5 minutes
  kpiDashboard: 5 * 60,

  // Session: 24 hours
  session: 24 * 60 * 60,

  // Certificate: 1 hour
  certificate: 60 * 60,

  // Application: 5 minutes
  application: 5 * 60,

  // Payment Session: 15 minutes
  paymentSession: 15 * 60,

  // Inspector Schedule: 30 minutes
  inspectorSchedule: 30 * 60,

  // Rate Limit: 1 minute
  rateLimit: 60
} as const;

// ============================================================================
// KPI DASHBOARD CACHING
// ============================================================================

export interface KPIDashboardData {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalRevenue: number;
  averageProcessingTime: number;
  conversionRate: number;
  generatedAt: string;
}

/**
 * Cache KPI dashboard data
 */
export async function cacheKPIDashboard(userId: string, data: KPIDashboardData): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.kpiDashboard(userId);

  await client.setEx(key, CACHE_TTL.kpiDashboard, JSON.stringify(data));
}

/**
 * Get cached KPI dashboard data
 */
export async function getCachedKPIDashboard(userId: string): Promise<KPIDashboardData | null> {
  const client = getRedisClient();
  const key = KEYS.kpiDashboard(userId);

  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate KPI dashboard cache
 */
export async function invalidateKPIDashboard(userId: string): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.kpiDashboard(userId);
  await client.del(key);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
}

/**
 * Store session in Redis
 */
export async function cacheSession(sessionId: string, session: SessionData): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.session(sessionId);

  await client.setEx(key, CACHE_TTL.session, JSON.stringify(session));

  // Add to user's session set
  const userSessionsKey = KEYS.userSessions(session.userId);
  await client.sAdd(userSessionsKey, sessionId);
}

/**
 * Get session from Redis
 */
export async function getCachedSession(sessionId: string): Promise<SessionData | null> {
  const client = getRedisClient();
  const key = KEYS.session(sessionId);

  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Delete session from Redis
 */
export async function deleteCachedSession(sessionId: string): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.session(sessionId);

  // Get session to find userId
  const session = await getCachedSession(sessionId);
  if (session) {
    // Remove from user's session set
    const userSessionsKey = KEYS.userSessions(session.userId);
    await client.sRem(userSessionsKey, sessionId);
  }

  await client.del(key);
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<string[]> {
  const client = getRedisClient();
  const key = KEYS.userSessions(userId);
  return client.sMembers(key);
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const client = getRedisClient();
  const sessionIds = await getUserSessions(userId);

  const pipeline = client.multi();
  for (const sessionId of sessionIds) {
    pipeline.del(KEYS.session(sessionId));
  }
  pipeline.del(KEYS.userSessions(userId));

  await pipeline.exec();
}

// ============================================================================
// CERTIFICATE VERIFICATION CACHING
// ============================================================================

export interface CertificateData {
  id: string;
  userId: string;
  applicationId: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

/**
 * Cache certificate data
 */
export async function cacheCertificate(certificate: CertificateData): Promise<void> {
  const client = getRedisClient();

  // Cache by certificate ID
  const certKey = KEYS.certificate(certificate.id);
  await client.setEx(certKey, CACHE_TTL.certificate, JSON.stringify(certificate));

  // Cache by user ID
  const userCertKey = KEYS.certificateByUser(certificate.userId);
  await client.setEx(userCertKey, CACHE_TTL.certificate, certificate.id);
}

/**
 * Get cached certificate
 */
export async function getCachedCertificate(certificateId: string): Promise<CertificateData | null> {
  const client = getRedisClient();
  const key = KEYS.certificate(certificateId);

  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Get certificate by user ID
 */
export async function getCachedCertificateByUser(userId: string): Promise<CertificateData | null> {
  const client = getRedisClient();

  // Get certificate ID from user cache
  const userCertKey = KEYS.certificateByUser(userId);
  const certId = await client.get(userCertKey);

  if (!certId) return null;

  // Get certificate data
  return getCachedCertificate(certId);
}

/**
 * Invalidate certificate cache
 */
export async function invalidateCertificate(certificateId: string): Promise<void> {
  const client = getRedisClient();

  // Get certificate to find userId
  const certificate = await getCachedCertificate(certificateId);

  // Delete certificate cache
  await client.del(KEYS.certificate(certificateId));

  // Delete user certificate cache
  if (certificate) {
    await client.del(KEYS.certificateByUser(certificate.userId));
  }
}

// ============================================================================
// APPLICATION STATUS CACHING
// ============================================================================

export interface ApplicationData {
  id: string;
  userId: string;
  status: string;
  submissionCount: number;
  rejectionCount: number;
  rescheduleCount: number;
  updatedAt: string;
}

/**
 * Cache application data
 */
export async function cacheApplication(application: ApplicationData): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.application(application.id);

  await client.setEx(key, CACHE_TTL.application, JSON.stringify(application));
}

/**
 * Get cached application
 */
export async function getCachedApplication(applicationId: string): Promise<ApplicationData | null> {
  const client = getRedisClient();
  const key = KEYS.application(applicationId);

  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate application cache
 */
export async function invalidateApplication(applicationId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(KEYS.application(applicationId));
}

// ============================================================================
// PAYMENT SESSION CACHING
// ============================================================================

/**
 * Cache payment session
 */
export async function cachePaymentSession(sessionId: string, data: unknown): Promise<void> {
  const client = getRedisClient();
  const key = KEYS.paymentSession(sessionId);

  await client.setEx(key, CACHE_TTL.paymentSession, JSON.stringify(data));
}

/**
 * Get cached payment session
 */
export async function getCachedPaymentSession(sessionId: string): Promise<unknown | null> {
  const client = getRedisClient();
  const key = KEYS.paymentSession(sessionId);

  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Delete payment session
 */
export async function deletePaymentSession(sessionId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(KEYS.paymentSession(sessionId));
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  const client = getRedisClient();
  await client.flushDb();
  console.log('✅ All cache cleared');
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  const client = getRedisClient();

  const info = await client.info('stats');
  const keyspace = await client.info('keyspace');

  // Parse Redis INFO output
  const statsMatch = info.match(/keyspace_hits:(\d+)/);
  const missesMatch = info.match(/keyspace_misses:(\d+)/);
  const keysMatch = keyspace.match(/keys=(\d+)/);
  const memoryMatch = info.match(/used_memory:(\d+)/);

  const hits = statsMatch ? parseInt(statsMatch[1]) : 0;
  const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
  const keys = keysMatch ? parseInt(keysMatch[1]) : 0;
  const memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;

  const total = hits + misses;
  const hitRate = total > 0 ? (hits / total) * 100 : 0;

  return {
    hits,
    misses,
    keys,
    memory,
    hitRate
  };
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
}> {
  try {
    const client = getRedisClient();
    const pong = await client.ping();

    if (pong === 'PONG') {
      return {
        status: 'healthy',
        message: 'Redis is connected and responding'
      };
    }

    return {
      status: 'unhealthy',
      message: 'Redis ping failed'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const cacheModule = {
  // Initialization
  initializeRedis,
  getRedisClient,
  closeRedis,

  // KPI Dashboard
  cacheKPIDashboard,
  getCachedKPIDashboard,
  invalidateKPIDashboard,

  // Session
  cacheSession,
  getCachedSession,
  deleteCachedSession,
  getUserSessions,
  deleteAllUserSessions,

  // Certificate
  cacheCertificate,
  getCachedCertificate,
  getCachedCertificateByUser,
  invalidateCertificate,

  // Application
  cacheApplication,
  getCachedApplication,
  invalidateApplication,

  // Payment
  cachePaymentSession,
  getCachedPaymentSession,
  deletePaymentSession,

  // Utilities
  clearAllCache,
  getCacheStats,
  healthCheck,

  // Constants
  CACHE_TTL
};

export default cacheModule;
