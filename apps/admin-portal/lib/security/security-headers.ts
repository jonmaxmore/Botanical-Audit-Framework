/**
 * Security Headers Service
 *
 * Implements comprehensive security headers for protecting against:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - Protocol downgrade
 * - Information leakage
 *
 * Based on OWASP security recommendations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage, ServerResponse } from 'http';

export interface SecurityHeadersConfig {
  // Content Security Policy
  contentSecurityPolicy?: {
    directives?: Record<string, string | string[]>;
    reportOnly?: boolean;
    reportUri?: string;
  };

  // Strict Transport Security
  strictTransportSecurity?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  // Frame Options
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string; // string for ALLOW-FROM uri

  // Content Type Options
  contentTypeOptions?: boolean;

  // XSS Protection
  xssProtection?: {
    enabled?: boolean;
    mode?: 'block';
  };

  // Referrer Policy
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';

  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy?: Record<string, string[]>;

  // Cross-Origin Policies
  crossOriginEmbedderPolicy?: 'unsafe-none' | 'require-corp' | 'credentialless';
  crossOriginOpenerPolicy?: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin';

  // Additional headers
  removeHeaders?: string[]; // Headers to remove
  customHeaders?: Record<string, string>;
}

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = {
      contentSecurityPolicy: config.contentSecurityPolicy || this.getDefaultCSP(),
      strictTransportSecurity: config.strictTransportSecurity || {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameOptions: config.frameOptions || 'DENY',
      contentTypeOptions: config.contentTypeOptions ?? true,
      xssProtection: config.xssProtection || {
        enabled: true,
        mode: 'block',
      },
      referrerPolicy: config.referrerPolicy || 'strict-origin-when-cross-origin',
      permissionsPolicy: config.permissionsPolicy || this.getDefaultPermissionsPolicy(),
      crossOriginEmbedderPolicy: config.crossOriginEmbedderPolicy || 'require-corp',
      crossOriginOpenerPolicy: config.crossOriginOpenerPolicy || 'same-origin',
      crossOriginResourcePolicy: config.crossOriginResourcePolicy || 'same-origin',
      removeHeaders: config.removeHeaders || ['X-Powered-By'],
      customHeaders: config.customHeaders || {},
    };
  }

  /**
   * Default Content Security Policy
   */
  private getDefaultCSP(): SecurityHeadersConfig['contentSecurityPolicy'] {
    return {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on your needs
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': [],
      },
      reportOnly: false,
    };
  }

  /**
   * Default Permissions Policy
   */
  private getDefaultPermissionsPolicy(): Record<string, string[]> {
    return {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
      'ambient-light-sensor': [],
      autoplay: ["'self'"],
      'encrypted-media': ["'self'"],
      fullscreen: ["'self'"],
      'picture-in-picture': ["'self'"],
    };
  }

  /**
   * Build Content Security Policy header value
   */
  private buildCSPHeader(): string {
    const directives = this.config.contentSecurityPolicy?.directives || {};
    const parts: string[] = [];

    for (const [key, value] of Object.entries(directives)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push(`${key} ${value.join(' ')}`);
        } else {
          parts.push(key);
        }
      } else {
        parts.push(`${key} ${value}`);
      }
    }

    return parts.join('; ');
  }

  /**
   * Build Permissions Policy header value
   */
  private buildPermissionsPolicyHeader(): string {
    const policy = this.config.permissionsPolicy || {};
    const parts: string[] = [];

    for (const [feature, allowlist] of Object.entries(policy)) {
      if (allowlist.length === 0) {
        parts.push(`${feature}=()`);
      } else {
        parts.push(`${feature}=(${allowlist.join(' ')})`);
      }
    }

    return parts.join(', ');
  }

  /**
   * Build Strict-Transport-Security header value
   */
  private buildHSTSHeader(): string {
    const hsts = this.config.strictTransportSecurity!;
    const parts = [`max-age=${hsts.maxAge}`];

    if (hsts.includeSubDomains) {
      parts.push('includeSubDomains');
    }

    if (hsts.preload) {
      parts.push('preload');
    }

    return parts.join('; ');
  }

  /**
   * Apply security headers to response
   */
  applyHeaders(res: NextApiResponse | ServerResponse): void {
    // Remove unwanted headers
    if (this.config.removeHeaders) {
      this.config.removeHeaders.forEach(header => {
        res.removeHeader?.(header);
      });
    }

    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      const headerName = this.config.contentSecurityPolicy.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

      let cspValue = this.buildCSPHeader();

      if (this.config.contentSecurityPolicy.reportUri) {
        cspValue += `; report-uri ${this.config.contentSecurityPolicy.reportUri}`;
      }

      res.setHeader(headerName, cspValue);
    }

    // Strict-Transport-Security (HSTS)
    if (this.config.strictTransportSecurity) {
      res.setHeader('Strict-Transport-Security', this.buildHSTSHeader());
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      res.setHeader('X-Frame-Options', this.config.frameOptions);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // X-XSS-Protection (deprecated but still useful for older browsers)
    if (this.config.xssProtection?.enabled) {
      const value = this.config.xssProtection.mode === 'block' ? '1; mode=block' : '1';
      res.setHeader('X-XSS-Protection', value);
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      res.setHeader('Referrer-Policy', this.config.referrerPolicy);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      res.setHeader('Permissions-Policy', this.buildPermissionsPolicyHeader());
    }

    // Cross-Origin-Embedder-Policy
    if (this.config.crossOriginEmbedderPolicy) {
      res.setHeader('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin-Opener-Policy
    if (this.config.crossOriginOpenerPolicy) {
      res.setHeader('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    // Cross-Origin-Resource-Policy
    if (this.config.crossOriginResourcePolicy) {
      res.setHeader('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }

    // Custom headers
    if (this.config.customHeaders) {
      for (const [key, value] of Object.entries(this.config.customHeaders)) {
        res.setHeader(key, value);
      }
    }
  }

  /**
   * Get all headers as object
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Build all headers into object
    const mockRes = {
      setHeader: (name: string, value: string | string[]) => {
        headers[name] = Array.isArray(value) ? value.join(', ') : value;
      },
      removeHeader: () => {},
    } as any;

    this.applyHeaders(mockRes);

    return headers;
  }
}

// Export singleton with secure defaults
export const securityHeaders = new SecurityHeaders();

/**
 * Middleware to apply security headers
 */
export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withSecurityHeaders(
  handler: NextApiHandler,
  config?: SecurityHeadersConfig,
): NextApiHandler {
  const security = config ? new SecurityHeaders(config) : securityHeaders;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply security headers
    security.applyHeaders(res);

    // Continue to handler
    return await handler(req, res);
  };
}

/**
 * Next.js middleware for security headers (app-wide)
 */
export function createSecurityHeadersMiddleware(config?: SecurityHeadersConfig) {
  const security = config ? new SecurityHeaders(config) : securityHeaders;

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    security.applyHeaders(res);
    next();
  };
}

/**
 * Preset configurations for different environments
 */
export const SecurityPresets = {
  /**
   * Strict security (production)
   */
  STRICT: new SecurityHeaders({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'none'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': [],
      },
    },
    frameOptions: 'DENY',
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
  }),

  /**
   * Relaxed security (development)
   */
  DEVELOPMENT: new SecurityHeaders({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:', 'http:'],
        'connect-src': ["'self'", 'ws:', 'wss:'],
      },
    },
    strictTransportSecurity: {
      maxAge: 0,
    },
    crossOriginEmbedderPolicy: 'unsafe-none',
  }),

  /**
   * API-specific security
   */
  API: new SecurityHeaders({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'none'"],
      },
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    referrerPolicy: 'no-referrer',
  }),
};

// Example usage:
/*
// Apply to single API route
export default withSecurityHeaders(async (req, res) => {
  res.json({ message: 'Hello World' });
});

// Apply with custom config
export default withSecurityHeaders(
  async (req, res) => {
    res.json({ data: [] });
  },
  {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://trusted-cdn.com']
      }
    }
  }
);

// Use preset
export default withSecurityHeaders(
  handler,
  SecurityPresets.STRICT.config
);

// In next.config.js for app-wide headers:
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: Object.entries(securityHeaders.getHeaders()).map(([key, value]) => ({
          key,
          value
        }))
      }
    ];
  }
};
*/
