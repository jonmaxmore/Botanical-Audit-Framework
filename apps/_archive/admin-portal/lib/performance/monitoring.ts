// @ts-nocheck
/**
 * Performance Monitoring Utilities
 *
 * Features:
 * - Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
 * - Custom performance metrics
 * - Real User Monitoring (RUM)
 * - Performance budgets
 * - Analytics integration
 *
 * Usage:
 * ```tsx
 * import { initPerformanceMonitoring } from '@/lib/performance/monitoring';
 *
 * // In _app.tsx
 * useEffect(() => {
 *   initPerformanceMonitoring();
 * }, []);
 * ```
 */

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

/**
 * Performance metric interface
 */
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  monitorWebVitals();

  // Monitor custom metrics
  monitorCustomMetrics();

  // Monitor long tasks
  monitorLongTasks();

  // Monitor navigation timing
  monitorNavigationTiming();

  console.log('📊 Performance monitoring initialized');
}

/**
 * Monitor Core Web Vitals using web-vitals library
 */
function monitorWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals to avoid SSR issues
  // web-vitals v5+ uses onCLS, onFID, onFCP, onLCP, onTTFB (changed from getCLS, etc.)
  import('web-vitals')
    .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry); // INP replaced FID in web-vitals v4+
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    })
    .catch(err => {
      console.error('Failed to load web-vitals:', err);
    });
}

/**
 * Handle performance entry
 */
function onPerfEntry(metric: any): void {
  const { name, value, id, rating } = metric;

  const perfMetric: PerformanceMetric = {
    name,
    value: Math.round(value),
    rating: rating || getRating(name, value),
    id,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${name}:`, perfMetric);
  }

  // Send to analytics
  sendToAnalytics(perfMetric);

  // Check against budget
  checkPerformanceBudget(perfMetric);
}

/**
 * Get rating based on thresholds
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];

  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Monitor custom metrics
 */
function monitorCustomMetrics(): void {
  if (typeof window === 'undefined') return;

  // Time to Interactive (TTI)
  measureTTI();

  // Component mount times
  measureComponentPerformance();

  // API call performance
  measureAPIPerformance();
}

/**
 * Measure Time to Interactive
 */
function measureTTI(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          console.log('⚠️  Long task detected:', entry);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (err) {
    // Ignore errors
  }
}

/**
 * Measure component performance
 */
function measureComponentPerformance(): void {
  if (typeof window === 'undefined') return;

  // Use React Profiler API
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.inject({
    onCommitFiberRoot: (id: any, root: any, priorityLevel: any) => {
      // Track render times
      const renderTime = performance.now();
      console.log('🔍 Component rendered:', { id, renderTime });
    },
  });
}

/**
 * Measure API call performance
 */
function measureAPIPerformance(): void {
  if (typeof window === 'undefined') return;

  // Monkey patch fetch to track API calls
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = args[0] instanceof Request ? args[0].url : (args[0] as string);

    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - startTime;

      // Log API performance
      sendToAnalytics({
        name: 'API_CALL',
        value: Math.round(duration),
        rating: duration < 500 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
        delta: duration,
        navigationType: url,
      });

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Log failed API call
      sendToAnalytics({
        name: 'API_ERROR',
        value: Math.round(duration),
        rating: 'poor',
        navigationType: url,
      });

      throw error;
    }
  };
}

/**
 * Monitor long tasks
 */
function monitorLongTasks(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          console.warn('⚠️  Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          });

          sendToAnalytics({
            name: 'LONG_TASK',
            value: Math.round(entry.duration),
            rating: 'poor',
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (err) {
    // Long task API not supported
  }
}

/**
 * Monitor navigation timing
 */
function monitorNavigationTiming(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navTiming) return;

    const metrics = {
      dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
      tcp: navTiming.connectEnd - navTiming.connectStart,
      ttfb: navTiming.responseStart - navTiming.requestStart,
      download: navTiming.responseEnd - navTiming.responseStart,
      domInteractive: navTiming.domInteractive - navTiming.fetchStart,
      domComplete: navTiming.domComplete - navTiming.fetchStart,
      loadComplete: navTiming.loadEventEnd - navTiming.fetchStart,
    };

    console.log('📊 Navigation timing:', metrics);

    // Send individual metrics
    Object.entries(metrics).forEach(([name, value]) => {
      sendToAnalytics({
        name: `NAV_${name.toUpperCase()}`,
        value: Math.round(value),
        rating: value < 1000 ? 'good' : 'needs-improvement',
      });
    });
  });
}

/**
 * Send metrics to analytics
 */
function sendToAnalytics(metric: PerformanceMetric): void {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: metric.value,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      metric_id: metric.id,
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    const body = JSON.stringify({
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    navigator.sendBeacon('/api/analytics/performance', body);
  }
}

/**
 * Check against performance budget
 */
function checkPerformanceBudget(metric: PerformanceMetric): void {
  if (metric.rating === 'poor') {
    console.warn(`⚠️  Performance budget exceeded: ${metric.name} = ${metric.value}`);

    // Could trigger alerts or notifications here
    if (process.env.NODE_ENV === 'production') {
      // Send alert to monitoring service
      sendAlert({
        type: 'PERFORMANCE_BUDGET_EXCEEDED',
        metric: metric.name,
        value: metric.value,
        threshold: THRESHOLDS[metric.name as keyof typeof THRESHOLDS]?.needsImprovement,
      });
    }
  }
}

/**
 * Send alert to monitoring service
 */
function sendAlert(data: any): void {
  if (typeof window !== 'undefined') {
    fetch('/api/monitoring/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(err => console.error('Failed to send alert:', err));
  }
}

/**
 * Get current performance metrics snapshot
 */
export function getPerformanceSnapshot(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paintEntries = performance.getEntriesByType('paint');

  return {
    ttfb: navTiming ? navTiming.responseStart - navTiming.requestStart : 0,
    fcp: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
    domInteractive: navTiming ? navTiming.domInteractive : 0,
    domComplete: navTiming ? navTiming.domComplete : 0,
    loadComplete: navTiming ? navTiming.loadEventEnd : 0,
  };
}

/**
 * Performance budget configuration
 */
export const PERFORMANCE_BUDGET = {
  // Page load times (ms)
  pageLoadTime: 3000,
  timeToInteractive: 5000,
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,

  // Bundle sizes (KB)
  javascriptSize: 300,
  cssSize: 100,
  imageSize: 500,

  // API response times (ms)
  apiResponseTime: 500,

  // Custom metrics
  longTaskDuration: 50,
  layoutShift: 0.1,
};

/**
 * Performance report generator
 */
export function generatePerformanceReport(): string {
  const snapshot = getPerformanceSnapshot();
  const budget = PERFORMANCE_BUDGET;

  let report = '📊 Performance Report\n\n';

  Object.entries(snapshot).forEach(([key, value]) => {
    const budgetValue = (budget as any)[key];
    const status = budgetValue && value > budgetValue ? '❌' : '✅';
    report += `${status} ${key}: ${Math.round(value)}ms\n`;
  });

  return report;
}
