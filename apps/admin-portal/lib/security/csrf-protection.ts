// @ts-nocheck
/**
 * CSRF (Cross-Site Request Forgery) Protection Module

import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

export interface CSRFTokenData {
  token: string;
  secret: string;
  timestamp: number;
  expiresAt: Date;
}

export interface CSRFOptions {
  tokenLength?: number; // Length of token in bytes
  cookieName?: string; // Name of CSRF cookie
  headerName?: string; // Name of CSRF header
  sessionKey?: string; // Session key for storing token
  tokenLifetime?: number; // Token lifetime in milliseconds
  secureCookie?: boolean; // Use secure cookie flag
  sameSite?: 'strict' | 'lax' | 'none';
  ignoreMethods?: string[]; // Methods to skip CSRF check
}

export class CSRFProtection {
  private options: Required<CSRFOptions>;

  constructor(options: CSRFOptions = {}) {
    this.options = {
      tokenLength: options.tokenLength || 32,
      cookieName: options.cookieName || 'csrf-token',
      headerName: options.headerName || 'x-csrf-token',
      sessionKey: options.sessionKey || 'csrfSecret',
      tokenLifetime: options.tokenLifetime || 24 * 60 * 60 * 1000, // 24 hours
      secureCookie: options.secureCookie ?? true,
      sameSite: options.sameSite || 'strict',
      ignoreMethods: options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'],
    };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): CSRFTokenData {
    const secret = this.generateRandomString(this.options.tokenLength);
    const token = this.createToken(secret);
    const timestamp = Date.now();
    const expiresAt = new Date(timestamp + this.options.tokenLifetime);

    return {
      token,
      secret,
      timestamp,
      expiresAt,
    };
  }

  /**
   * Create token from secret
   */
  private createToken(secret: string): string {
    const timestamp = Date.now().toString();
    const data = `${secret}:${timestamp}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${timestamp}.${hash}`;
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string, secret: string): boolean {
    try {
      // Parse token
      const parts = token.split('.');
      if (parts.length !== 2) {
        return false;
      }

      const [timestamp, hash] = parts;

      // Check token age
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > this.options.tokenLifetime) {
        return false;
      }

      // Verify hash
      const expectedToken = this.createToken(secret);
      const expectedHash = expectedToken.split('.')[1];

      return this.secureCompare(hash, expectedHash);
    } catch (error) {
      console.error('CSRF token verification error:', error);
      return false;
    }
  }

  /**
   * Secure string comparison (timing-attack safe)
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate cryptographically secure random string
   */
  private generateRandomString(length: number): string {
    return crypto
      .randomBytes(length)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, length);
  }

  /**
   * Set CSRF token in cookie
   */
  setCookie(res: NextApiResponse, tokenData: CSRFTokenData): void {
    const cookieValue = `${tokenData.secret}`;
    const cookieOptions = [
      `${this.options.cookieName}=${cookieValue}`,
      `Path=/`,
      `Max-Age=${Math.floor(this.options.tokenLifetime / 1000)}`,
      `SameSite=${this.options.sameSite}`,
      `HttpOnly`,
    ];

    if (this.options.secureCookie) {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));
  }

  /**
   * Get CSRF secret from cookie
   */
  getSecretFromCookie(req: NextApiRequest): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return null;
    }

    const cookies = this.parseCookies(cookieHeader);
    return cookies[this.options.cookieName] || null;
  }

  /**
   * Get CSRF token from request
   */
  getTokenFromRequest(req: NextApiRequest): string | null {
    // Check header first
    const headerToken = req.headers[this.options.headerName.toLowerCase()];
    if (headerToken) {
      return Array.isArray(headerToken) ? headerToken[0] : headerToken;
    }

    // Check body
    if (req.body && req.body._csrf) {
      return req.body._csrf;
    }

    // Check query
    if (req.query && req.query._csrf) {
      return Array.isArray(req.query._csrf) ? req.query._csrf[0] : req.query._csrf;
    }

    return null;
  }

  /**
   * Parse cookies from header
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = parts[1];
      }
    });

    return cookies;
  }

  /**
   * Check if method should be ignored
   */
  shouldIgnoreMethod(method: string): boolean {
    return this.options.ignoreMethods.includes(method.toUpperCase());
  }

  /**
   * Validate CSRF token from request
   */
  validateRequest(req: NextApiRequest): boolean {
    // Skip check for ignored methods
    if (this.shouldIgnoreMethod(req.method || 'GET')) {
      return true;
    }

    // Get token and secret
    const token = this.getTokenFromRequest(req);
    const secret = this.getSecretFromCookie(req);

    if (!token || !secret) {
      return false;
    }

    return this.verifyToken(token, secret);
  }

  /**
   * Rotate CSRF token (for added security)
   */
  rotateToken(req: NextApiRequest, res: NextApiResponse): CSRFTokenData {
    const newTokenData = this.generateToken();
    this.setCookie(res, newTokenData);
    return newTokenData;
  }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection();

/**
 * CSRF Protection Middleware
 */
export interface CSRFMiddlewareOptions extends CSRFOptions {
  onValidationFailure?: (req: NextApiRequest, res: NextApiResponse) => void;
  autoRotate?: boolean; // Rotate token on each request
}

export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Higher-order function to add CSRF protection to API routes
 */
export function withCSRFProtection(
  handler: NextApiHandler,
  options: CSRFMiddlewareOptions = {},
): NextApiHandler {
  const csrf = new CSRFProtection(options);

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validate CSRF token
      const isValid = csrf.validateRequest(req);

      if (!isValid) {
        if (options.onValidationFailure) {
          return options.onValidationFailure(req, res);
        }

        return res.status(403).json({
          error: 'CSRF validation failed',
          message: 'Invalid or missing CSRF token',
        });
      }

      // Auto-rotate token if enabled
      if (options.autoRotate && !csrf.shouldIgnoreMethod(req.method || 'GET')) {
        const newTokenData = csrf.rotateToken(req, res);
        // Set new token in response header
        res.setHeader(csrf.options.headerName, newTokenData.token);
      }

      // Continue to handler
      return await handler(req, res);
    } catch (error) {
      console.error('CSRF middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'CSRF protection failed',
      });
    }
  };
}

/**
 * API endpoint to get CSRF token
 */
export function createCSRFTokenEndpoint(options: CSRFOptions = {}): NextApiHandler {
  const csrf = new CSRFProtection(options);

  return (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Generate new token
    const tokenData = csrf.generateToken();

    // Set cookie
    csrf.setCookie(res, tokenData);

    // Return token
    res.status(200).json({
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
    });
  };
}

/**
 * Decorator for CSRF protection
 */
export function CSRFProtected(options: CSRFMiddlewareOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: NextApiRequest, res: NextApiResponse) {
      const wrappedHandler = withCSRFProtection(originalMethod, options);
      return await wrappedHandler.call(this, req, res);
    };

    return descriptor;
  };
}

// Example usage:
/*
// API route with CSRF protection
export default withCSRFProtection(async (req, res) => {
  // Your API logic here
  res.json({ success: true });
});

// Get CSRF token endpoint
// pages/api/auth/csrf.ts
export default createCSRFTokenEndpoint();

// Client-side usage:
// 1. Get CSRF token
const response = await fetch('/api/auth/csrf');
const { token } = await response.json();

// 2. Include token in requests
fetch('/api/protected', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'value' })
});

// Or in form:
<form method="POST" action="/api/protected">
  <input type="hidden" name="_csrf" value={token} />
  <!-- other fields -->
</form>
*/
