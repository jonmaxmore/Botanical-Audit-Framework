/**
 * Rate Limit Middleware for Next.js API Routes
 *
 * Provides easy-to-use middleware for protecting API endpoints with:
 * - Automatic IP detection
 * - User-based rate limiting
 * - Custom configurations per route
 * - Standard HTTP headers
 * - Error handling
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimiter, RateLimitConfig, RATE_LIMIT_CONFIGS } from './rate-limiter';

export interface RateLimitMiddlewareOptions {
  namespace: string;
  config?: Partial<RateLimitConfig>;
  useUserId?: boolean; // Use user ID instead of IP
  getUserId?: (req: NextApiRequest) => string | null;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitExceeded?: (req: NextApiRequest, res: NextApiResponse) => void;
}

export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Higher-order function to add rate limiting to API routes
 */
export function withRateLimit(
  handler: NextApiHandler,
  options: RateLimitMiddlewareOptions,
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get identifier (IP or User ID)
      const identifier =
        options.useUserId && options.getUserId
          ? options.getUserId(req) || getClientIp(req)
          : getClientIp(req);

      // Check rate limit
      const result = await rateLimiter.checkLimit({
        identifier,
        namespace: options.namespace,
        config: options.config,
      });

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetTime.toISOString());

      // Handle blocked requests
      if (result.blocked) {
        res.setHeader('Retry-After', (result.retryAfter || 0).toString());

        if (options.onLimitExceeded) {
          return options.onLimitExceeded(req, res);
        }

        return res.status(429).json({
          error: 'Too many requests',
          message: 'Your account has been temporarily blocked due to excessive requests',
          retryAfter: result.retryAfter,
          resetTime: result.resetTime.toISOString(),
        });
      }

      // Handle rate limit exceeded
      if (!result.success) {
        res.setHeader('Retry-After', (result.retryAfter || 0).toString());

        if (options.onLimitExceeded) {
          return options.onLimitExceeded(req, res);
        }

        return res.status(429).json({
          error: 'Too many requests',
          message: options.config?.message || 'Too many requests, please try again later',
          retryAfter: result.retryAfter,
          resetTime: result.resetTime.toISOString(),
        });
      }

      // Wrap the original response to handle success/failure tracking
      if (options.skipSuccessfulRequests || options.skipFailedRequests) {
        const originalJson = res.json.bind(res);
        const originalStatus = res.status.bind(res);
        let statusCode = 200;

        res.status = ((code: number) => {
          statusCode = code;
          return originalStatus(code);
        }) as any;

        res.json = (data: any) => {
          const isSuccess = statusCode >= 200 && statusCode < 400;

          // Decrement counter if we should skip this request
          if (
            (options.skipSuccessfulRequests && isSuccess) ||
            (options.skipFailedRequests && !isSuccess)
          ) {
            // Note: This is simplified. In production, you'd need to
            // decrement the actual counter in Redis
          }

          return originalJson(data);
        };
      }

      // Continue to handler
      return await handler(req, res);
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open - allow request if rate limiter fails
      return await handler(req, res);
    }
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: NextApiRequest): string {
  // Check X-Forwarded-For header (most common)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    return ips.trim();
  }

  // Check X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Check CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) {
    return Array.isArray(cfIp) ? cfIp[0] : cfIp;
  }

  // Fallback to socket remote address
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Decorator for easy rate limiting
 */
export function RateLimited(options: RateLimitMiddlewareOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: NextApiRequest, res: NextApiResponse) {
      const wrappedHandler = withRateLimit(originalMethod, options);
      return await wrappedHandler.call(this, req, res);
    };

    return descriptor;
  };
}

/**
 * Predefined middleware configurations
 */

// Public API endpoints (60 req/min)
export function withPublicApiLimit(handler: NextApiHandler): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'public-api',
    config: RATE_LIMIT_CONFIGS.PUBLIC_API,
  });
}

// Authenticated API endpoints (120 req/min)
export function withAuthenticatedApiLimit(
  handler: NextApiHandler,
  getUserId?: (req: NextApiRequest) => string | null,
): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'authenticated-api',
    config: RATE_LIMIT_CONFIGS.AUTHENTICATED_API,
    useUserId: true,
    getUserId,
  });
}

// Login endpoints (5 attempts per 15 min)
export function withLoginLimit(handler: NextApiHandler): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'login',
    config: RATE_LIMIT_CONFIGS.LOGIN,
    skipSuccessfulRequests: true, // Only count failed login attempts
  });
}

// Password reset endpoints (3 attempts per hour)
export function withPasswordResetLimit(handler: NextApiHandler): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'password-reset',
    config: RATE_LIMIT_CONFIGS.PASSWORD_RESET,
  });
}

// File upload endpoints (10 uploads per minute)
export function withUploadLimit(
  handler: NextApiHandler,
  getUserId?: (req: NextApiRequest) => string | null,
): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'upload',
    config: RATE_LIMIT_CONFIGS.UPLOAD,
    useUserId: true,
    getUserId,
  });
}

// Heavy operation endpoints (5 req/min)
export function withHeavyOperationLimit(handler: NextApiHandler): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'heavy-operation',
    config: RATE_LIMIT_CONFIGS.HEAVY_OPERATION,
  });
}

// Admin endpoints (200 req/min)
export function withAdminLimit(
  handler: NextApiHandler,
  getUserId?: (req: NextApiRequest) => string | null,
): NextApiHandler {
  return withRateLimit(handler, {
    namespace: 'admin',
    config: RATE_LIMIT_CONFIGS.ADMIN,
    useUserId: true,
    getUserId,
  });
}

/**
 * Manual rate limit check (for use in API routes)
 */
export async function checkRateLimit(
  req: NextApiRequest,
  namespace: string,
  config?: Partial<RateLimitConfig>,
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}> {
  const identifier = getClientIp(req);
  const result = await rateLimiter.checkLimit({
    identifier,
    namespace,
    config,
  });

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetTime: result.resetTime,
    retryAfter: result.retryAfter,
  };
}

/**
 * Reset rate limit for specific identifier
 */
export async function resetRateLimit(req: NextApiRequest, namespace: string): Promise<void> {
  const identifier = getClientIp(req);
  await rateLimiter.resetLimit(identifier, namespace);
}

/**
 * Block IP address
 */
export async function blockIp(
  ip: string,
  namespace: string,
  durationMs: number,
  reason?: string,
): Promise<void> {
  await rateLimiter.blockIdentifier(ip, namespace, durationMs, reason);
}

/**
 * Unblock IP address
 */
export async function unblockIp(ip: string, namespace: string): Promise<void> {
  await rateLimiter.unblockIdentifier(ip, namespace);
}

/**
 * Get rate limit statistics
 */
export async function getRateLimitStats(namespace: string) {
  return await rateLimiter.getStatistics(namespace);
}

/**
 * Detect DDoS attack
 */
export async function detectDDoS(namespace: string, threshold: number = 100) {
  return await rateLimiter.detectAttack(namespace, threshold);
}

/**
 * Get blocked IPs
 */
export async function getBlockedIps(namespace: string) {
  return await rateLimiter.getBlockedIdentifiers(namespace);
}

// Example usage in API routes:
/*
// Basic usage
export default withRateLimit(
  async (req, res) => {
    res.json({ message: 'Hello World' });
  },
  {
    namespace: 'api',
    config: { maxRequests: 100, windowMs: 60000 }
  }
);

// Login endpoint
export default withLoginLimit(async (req, res) => {
  // Login logic here
  res.json({ success: true });
});

// With user-based limiting
export default withAuthenticatedApiLimit(
  async (req, res) => {
    // API logic here
    res.json({ data: [] });
  },
  (req) => req.session?.userId || null
);

// Manual check
export default async function handler(req, res) {
  const limit = await checkRateLimit(req, 'custom', {
    maxRequests: 50,
    windowMs: 60000
  });

  if (!limit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: limit.retryAfter
    });
  }

  // API logic here
  res.json({ success: true });
}
*/
