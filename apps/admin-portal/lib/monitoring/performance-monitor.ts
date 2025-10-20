/**
 * Performance Monitor
 * Track application performance metrics, API response times, and resource usage
 */

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  timestamp: string;
  type: 'api' | 'page' | 'component' | 'database' | 'external';
  name: string;
  duration: number;
  success: boolean;
  statusCode?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Transaction tracking
 */
export interface Transaction {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  spans: Span[];
  tags: Record<string, string>;
  data: Record<string, any>;
}

/**
 * Span tracking (sub-operations)
 */
export interface Span {
  id: string;
  parentId?: string;
  operation: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  data: Record<string, any>;
}

/**
 * Performance summary
 */
export interface PerformanceSummary {
  averageResponseTime: number;
  p50: number;
  p75: number;
  p95: number;
  p99: number;
  totalRequests: number;
  successRate: number;
  errorRate: number;
  slowestEndpoints: Array<{ name: string; avgDuration: number; count: number }>;
}

/**
 * Performance Monitor Service
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private transactions: Map<string, Transaction> = new Map();
  private maxMetrics: number = 10000;

  private constructor() {
    this.setupPerformanceObserver();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Setup performance observer (browser only)
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    try {
      // Observe navigation timing
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.recordWebVital(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'measure'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Record web vital
   */
  private recordWebVital(entry: PerformanceEntry): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      type: 'page',
      name: entry.name,
      duration: entry.duration,
      success: true,
      metadata: {
        entryType: entry.entryType,
        startTime: entry.startTime,
      },
    };

    this.addMetric(metric);
  }

  /**
   * Track API call performance
   */
  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    error?: Error
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      type: 'api',
      name: `${method} ${endpoint}`,
      duration,
      success: statusCode >= 200 && statusCode < 400,
      statusCode,
      error: error?.message,
      metadata: {
        method,
        endpoint,
      },
    };

    this.addMetric(metric);

    // Log slow API calls
    if (duration > 3000) {
      console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(
    query: string,
    duration: number,
    success: boolean = true,
    error?: Error
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      type: 'database',
      name: query.substring(0, 100), // Truncate long queries
      duration,
      success,
      error: error?.message,
      metadata: {
        queryType: this.extractQueryType(query),
      },
    };

    this.addMetric(metric);

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow database query: ${query.substring(0, 50)}... took ${duration}ms`);
    }
  }

  /**
   * Track external API call
   */
  trackExternalApi(
    service: string,
    endpoint: string,
    duration: number,
    success: boolean,
    error?: Error
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      type: 'external',
      name: `${service}:${endpoint}`,
      duration,
      success,
      error: error?.message,
      metadata: {
        service,
        endpoint,
      },
    };

    this.addMetric(metric);
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, duration: number): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      type: 'component',
      name: componentName,
      duration,
      success: true,
      metadata: {},
    };

    this.addMetric(metric);

    // Log slow renders
    if (duration > 100) {
      console.warn(`Slow component render: ${componentName} took ${duration}ms`);
    }
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Extract query type from SQL
   */
  private extractQueryType(query: string): string {
    const match = query.trim().match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i);
    return match ? match[1].toUpperCase() : 'UNKNOWN';
  }

  /**
   * Start transaction
   */
  startTransaction(name: string, type: string = 'http.request'): Transaction {
    const transaction: Transaction = {
      id: this.generateId(),
      name,
      type,
      startTime: Date.now(),
      spans: [],
      tags: {},
      data: {},
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Finish transaction
   */
  finishTransaction(transactionId: string, tags?: Record<string, string>): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    transaction.endTime = Date.now();
    transaction.duration = transaction.endTime - transaction.startTime;

    if (tags) {
      transaction.tags = { ...transaction.tags, ...tags };
    }

    // Log slow transactions
    if (transaction.duration > 5000) {
      console.warn(`Slow transaction: ${transaction.name} took ${transaction.duration}ms`);
    }

    // Remove from active transactions
    this.transactions.delete(transactionId);
  }

  /**
   * Start span (sub-operation)
   */
  startSpan(
    transactionId: string,
    operation: string,
    description: string,
    parentSpanId?: string
  ): Span | null {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return null;

    const span: Span = {
      id: this.generateId(),
      parentId: parentSpanId,
      operation,
      description,
      startTime: Date.now(),
      tags: {},
      data: {},
    };

    transaction.spans.push(span);
    return span;
  }

  /**
   * Finish span
   */
  finishSpan(transactionId: string, spanId: string, tags?: Record<string, string>): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    const span = transaction.spans.find(s => s.id === spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  /**
   * Get performance summary
   */
  getSummary(
    type?: 'api' | 'page' | 'component' | 'database' | 'external',
    minutes: number = 60
  ): PerformanceSummary {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const filtered = this.metrics.filter(m => {
      const timestamp = new Date(m.timestamp).getTime();
      return timestamp >= cutoff && (!type || m.type === type);
    });

    if (filtered.length === 0) {
      return {
        averageResponseTime: 0,
        p50: 0,
        p75: 0,
        p95: 0,
        p99: 0,
        totalRequests: 0,
        successRate: 0,
        errorRate: 0,
        slowestEndpoints: [],
      };
    }

    // Calculate percentiles
    const durations = filtered.map(m => m.duration).sort((a, b) => a - b);
    const p50 = this.percentile(durations, 50);
    const p75 = this.percentile(durations, 75);
    const p95 = this.percentile(durations, 95);
    const p99 = this.percentile(durations, 99);

    // Calculate success/error rates
    const successCount = filtered.filter(m => m.success).length;
    const successRate = (successCount / filtered.length) * 100;
    const errorRate = 100 - successRate;

    // Find slowest endpoints
    const endpointStats = new Map<string, { total: number; count: number }>();
    for (const metric of filtered) {
      const stats = endpointStats.get(metric.name) || { total: 0, count: 0 };
      stats.total += metric.duration;
      stats.count += 1;
      endpointStats.set(metric.name, stats);
    }

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([name, stats]) => ({
        name,
        avgDuration: stats.total / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50,
      p75,
      p95,
      p99,
      totalRequests: filtered.length,
      successRate,
      errorRate,
      slowestEndpoints,
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Get metrics by type
   */
  getMetrics(
    type?: 'api' | 'page' | 'component' | 'database' | 'external',
    limit: number = 100
  ): PerformanceMetrics[] {
    let filtered = this.metrics;

    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }

    return filtered.slice(-limit);
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Generate ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Performance measurement decorator
 */
export function measurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const monitor = PerformanceMonitor.getInstance();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;

      monitor.trackApiCall(propertyKey, 'METHOD', duration, 200);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      monitor.trackApiCall(propertyKey, 'METHOD', duration, 500, error as Error);

      throw error;
    }
  };

  return descriptor;
}

/**
 * Singleton instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Helper functions
 */

export function trackApiPerformance(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  error?: Error
): void {
  performanceMonitor.trackApiCall(endpoint, method, duration, statusCode, error);
}

export function trackDatabasePerformance(
  query: string,
  duration: number,
  success?: boolean,
  error?: Error
): void {
  performanceMonitor.trackDatabaseQuery(query, duration, success, error);
}

export function trackExternalApiPerformance(
  service: string,
  endpoint: string,
  duration: number,
  success: boolean,
  error?: Error
): void {
  performanceMonitor.trackExternalApi(service, endpoint, duration, success, error);
}

export function getPerformanceSummary(
  type?: 'api' | 'page' | 'component' | 'database' | 'external',
  minutes?: number
): PerformanceSummary {
  return performanceMonitor.getSummary(type, minutes);
}

/**
 * React component performance tracking hook
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    performanceMonitor.trackComponentRender(componentName, duration);
  };
}

/**
 * API route performance wrapper
 */
export function withPerformanceTracking(handler: Function) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    const endpoint = req.url || 'unknown';
    const method = req.method || 'GET';

    try {
      await handler(req, res);

      const duration = Date.now() - startTime;
      const statusCode = res.statusCode || 200;

      performanceMonitor.trackApiCall(endpoint, method, duration, statusCode);
    } catch (error) {
      const duration = Date.now() - startTime;

      performanceMonitor.trackApiCall(endpoint, method, duration, 500, error as Error);

      throw error;
    }
  };
}
