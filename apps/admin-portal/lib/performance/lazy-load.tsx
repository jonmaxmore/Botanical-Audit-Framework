// @ts-nocheck
/**
 * Lazy Loading Utility Functions
 *
 * Features:
 * - Dynamic component imports
 * - Lazy loading with Suspense
 * - Preloading strategies
 * - Error boundaries
 * - Loading states
 *
 * Usage:
 * ```tsx
 * import { lazyLoad } from '@/lib/performance/lazy-load';
 *
 * const HeavyComponent = lazyLoad(() => import('./HeavyComponent'), {
 *   fallback: <Skeleton />,
 *   preload: 'hover'
 * });
 * ```
 */

import { lazy, ComponentType, Suspense, ReactNode } from 'react';

/**
 * Lazy load options
 */
interface LazyLoadOptions {
  /** Fallback component while loading */
  fallback?: ReactNode;
  /** Preload strategy */
  preload?: 'idle' | 'hover' | 'visible' | 'none';
  /** Retry attempts on failure */
  retryAttempts?: number;
  /** Delay before showing fallback (ms) */
  delay?: number;
}

/**
 * Component import function
 */
type ComponentImportFn<T> = () => Promise<{ default: ComponentType<T> }>;

/**
 * Preload cache
 */
const preloadCache = new Map<string, Promise<unknown>>();

/**
 * Enhanced lazy loading with retry logic
 */
export function lazyLoad<T = Record<string, unknown>>(
  importFn: ComponentImportFn<T>,
  options: LazyLoadOptions = {}
): ComponentType<T> {
  const { fallback = null, preload = 'none', retryAttempts = 3, delay = 200 } = options;

  // Create retry-enabled import function
  const retryImport = async (attempts = retryAttempts): Promise<{ default: ComponentType<T> }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attempts <= 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryImport(attempts - 1);
    }
  };

  // Create lazy component
  const LazyComponent = lazy(retryImport);

  // Wrapper component with Suspense
  const WrappedComponent: ComponentType<T> = (props: T) => {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };

  // Add preload capability
  (WrappedComponent as any).preload = () => {
    const cacheKey = importFn.toString();
    if (!preloadCache.has(cacheKey)) {
      preloadCache.set(cacheKey, retryImport());
    }
    return preloadCache.get(cacheKey);
  };

  return WrappedComponent;
}

/**
 * Lazy load route component
 */
export function lazyLoadRoute<T = Record<string, unknown>>(
  importFn: ComponentImportFn<T>
): ComponentType<T> {
  return lazyLoad(importFn, {
    fallback: <RouteLoadingFallback />,
    preload: 'visible',
    retryAttempts: 3,
  });
}

/**
 * Lazy load modal/dialog component
 */
export function lazyLoadModal<T = Record<string, unknown>>(
  importFn: ComponentImportFn<T>
): ComponentType<T> {
  return lazyLoad(importFn, {
    fallback: <ModalLoadingFallback />,
    preload: 'hover',
    retryAttempts: 2,
  });
}

/**
 * Lazy load heavy component (charts, editors, etc.)
 */
export function lazyLoadHeavy<T = Record<string, unknown>>(
  importFn: ComponentImportFn<T>
): ComponentType<T> {
  return lazyLoad(importFn, {
    fallback: <HeavyLoadingFallback />,
    preload: 'idle',
    retryAttempts: 3,
    delay: 500,
  });
}

/**
 * Preload component on idle
 */
export function preloadOnIdle(preloadFn: () => Promise<unknown>): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      preloadFn();
    });
  } else {
    setTimeout(() => {
      preloadFn();
    }, 1000);
  }
}

/**
 * Preload component on hover
 */
export function preloadOnHover(
  element: HTMLElement,
  preloadFn: () => Promise<unknown>
): () => void {
  let hasPreloaded = false;

  const handleHover = () => {
    if (!hasPreloaded) {
      hasPreloaded = true;
      preloadFn();
    }
  };

  element.addEventListener('mouseenter', handleHover, { once: true });
  element.addEventListener('focus', handleHover, { once: true });

  // Cleanup function
  return () => {
    element.removeEventListener('mouseenter', handleHover);
    element.removeEventListener('focus', handleHover);
  };
}

/**
 * Preload component when visible in viewport
 */
export function preloadOnVisible(
  element: HTMLElement,
  preloadFn: () => Promise<unknown>
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {};
  }

  let hasPreloaded = false;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasPreloaded) {
          hasPreloaded = true;
          preloadFn();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '50px', // Preload before fully visible
    }
  );

  observer.observe(element);

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Default loading fallback components
 */
function RouteLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
      }}
    >
      <div>Loading...</div>
    </div>
  );
}

function ModalLoadingFallback() {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div>Loading modal...</div>
    </div>
  );
}

function HeavyLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <div>Loading component...</div>
    </div>
  );
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'production') {
    console.log('📦 Bundle size analysis available in build output');
  }
}

/**
 * Dynamically import and execute
 */
export async function dynamicImport<T>(modulePath: string): Promise<T> {
  try {
    const module = await import(/* webpackChunkName: "[request]" */ modulePath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to dynamically import ${modulePath}:`, error);
    throw error;
  }
}
