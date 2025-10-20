/**
 * API Cache Middleware for Next.js API Routes
 *
 * Features:
 * - Automatic caching of API responses
 * - Configurable cache duration per route
 * - Cache key generation based on request
 * - Conditional caching based on status code
 * - Cache invalidation hooks
 * - Support for GET requests
 *
 * Usage:
 * ```typescript
 * import { withCache } from '@/lib/cache/api-cache-middleware';
 *
 * export default withCache(
 *   async (req, res) => {
 *     // Your handler logic
 *   },
 *   { ttl: 600, namespace: 'api:users' }
 * );
 * ```
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheService } from './cache-service';
import { createHash } from 'crypto';

export interface CacheOptions {
  /** Cache TTL in seconds */
  ttl?: number;
  /** Cache namespace */
  namespace?: string;
  /** Cache only specific HTTP methods (default: ['GET']) */
  methods?: string[];
  /** Cache only specific status codes (default: [200]) */
  statusCodes?: number[];
  /** Custom cache key generator */
  keyGenerator?: (req: NextApiRequest) => string;
  /** Skip cache condition */
  skip?: (req: NextApiRequest) => boolean;
  /** Include query params in cache key (default: true) */
  includeQuery?: boolean;
  /** Include specific headers in cache key */
  includeHeaders?: string[];
}

export interface CachedResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: unknown;
  cachedAt: number;
}

const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 300, // 5 minutes
  namespace: 'api',
  methods: ['GET'],
  statusCodes: [200],
  includeQuery: true,
  includeHeaders: [],
};

/**
 * Generate cache key from request
 */
function generateCacheKey(req: NextApiRequest, options: CacheOptions): string {
  if (options.keyGenerator) {
    return options.keyGenerator(req);
  }

  const parts: string[] = [req.method || 'GET', req.url || ''];

  // Include query parameters
  if (options.includeQuery && req.query) {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    if (queryString) {
      parts.push(queryString);
    }
  }

  // Include specific headers
  if (options.includeHeaders && options.includeHeaders.length > 0) {
    options.includeHeaders.forEach(header => {
      const value = req.headers[header.toLowerCase()];
      if (value) {
        parts.push(`${header}:${value}`);
      }
    });
  }

  // Create hash of combined parts
  const key = parts.join('|');
  return createHash('md5').update(key).digest('hex');
}

/**
 * Check if request should be cached
 */
function shouldCacheRequest(req: NextApiRequest, options: CacheOptions): boolean {
  // Check skip condition
  if (options.skip && options.skip(req)) {
    return false;
  }

  // Check method
  const methods = options.methods || DEFAULT_OPTIONS.methods!;
  if (!methods.includes(req.method || 'GET')) {
    return false;
  }

  return true;
}

/**
 * Check if response should be cached
 */
function shouldCacheResponse(statusCode: number, options: CacheOptions): boolean {
  const validCodes = options.statusCodes || DEFAULT_OPTIONS.statusCodes!;
  return validCodes.includes(statusCode);
}

/**
 * Wrap response methods to capture output
 */
function wrapResponse(
  res: NextApiResponse,
  onResponse: (cached: CachedResponse) => void,
): NextApiResponse {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalStatus = res.status.bind(res);

  let statusCode = 200;
  let capturedBody: unknown;

  // Wrap status method
  res.status = function (code: number) {
    statusCode = code;
    return originalStatus(code);
  };

  // Wrap json method
  res.json = function (body: unknown) {
    capturedBody = body;

    onResponse({
      statusCode,
      headers: res.getHeaders() as Record<string, string | string[]>,
      body,
      cachedAt: Date.now(),
    });

    return originalJson(body);
  };

  // Wrap send method
  res.send = function (body: unknown) {
    capturedBody = body;

    onResponse({
      statusCode,
      headers: res.getHeaders() as Record<string, string | string[]>,
      body,
      cachedAt: Date.now(),
    });

    return originalSend(body);
  };

  return res;
}

/**
 * API Cache Middleware
 */
export function withCache<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void> | void,
  options: CacheOptions = {},
): (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    // Check if we should attempt to cache this request
    if (!shouldCacheRequest(req, finalOptions)) {
      return handler(req, res);
    }

    // Generate cache key
    const cacheKey = generateCacheKey(req, finalOptions);
    const namespace = finalOptions.namespace!;

    // Try to get from cache
    const cached = await cacheService.get<CachedResponse>(namespace, cacheKey);

    if (cached) {
      // Return cached response
      res.status(cached.statusCode);

      // Set cached headers (except cache-control which we'll override)
      Object.entries(cached.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'cache-control') {
          res.setHeader(key, value);
        }
      });

      // Add cache hit header
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Time', new Date(cached.cachedAt).toISOString());

      // Send cached body
      if (typeof cached.body === 'object') {
        return res.json(cached.body as T);
      } else {
        return res.send(cached.body as T);
      }
    }

    // Cache miss - add header
    res.setHeader('X-Cache', 'MISS');

    // Wrap response to capture output
    let responseCaptured = false;
    const wrappedRes = wrapResponse(res, capturedResponse => {
      if (responseCaptured) return;
      responseCaptured = true;

      // Check if we should cache this response
      if (shouldCacheResponse(capturedResponse.statusCode, finalOptions)) {
        // Cache the response asynchronously
        cacheService.set(namespace, cacheKey, capturedResponse, finalOptions.ttl).catch(err => {
          console.error('Failed to cache response:', err);
        });
      }
    });

    // Execute original handler
    return handler(req, wrappedRes as NextApiResponse<T>);
  };
}

/**
 * Manually invalidate cache for specific route
 */
export async function invalidateCache(namespace: string, pattern?: string): Promise<number> {
  if (pattern) {
    return await cacheService.invalidatePattern(namespace, pattern);
  }
  return await cacheService.invalidateNamespace(namespace);
}

/**
 * Cache decorator for class methods
 */
export function Cacheable(
  namespace: string,
  ttl: number,
  keyGenerator?: (...args: unknown[]) => string,
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(...args)
        : createHash('md5').update(JSON.stringify(args)).digest('hex');

      // Try to get from cache
      const cached = await cacheService.get(namespace, cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Cache result
      await cacheService.set(namespace, cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache warming utility
 */
export async function warmCache(
  routes: Array<{
    namespace: string;
    key: string;
    fetcher: () => Promise<unknown>;
    ttl?: number;
  }>,
): Promise<void> {
  console.log(`🔥 Warming cache for ${routes.length} routes...`);

  const results = await Promise.allSettled(
    routes.map(async route => {
      const value = await route.fetcher();
      await cacheService.set(route.namespace, route.key, value, route.ttl);
      return route;
    }),
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`✅ Cache warming complete: ${succeeded} succeeded, ${failed} failed`);
}

/**
 * Get cache headers for manual response
 */
export function getCacheHeaders(maxAge: number = 300): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
  };
}
