/**
 * Retry Utility for API Calls
 * INTEGRATIVE REFINEMENT - Week 3-4 Task 2.1
 * 
 * Lightweight retry wrapper with exponential backoff
 * No external dependencies - pure TypeScript implementation
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
  onRetry: () => {}, // No-op by default
};

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  // Network errors (no response)
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    return true;
  }

  // HTTP errors with retryable status codes
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for fetch API calls
 * 
 * @param fn - Async function to retry (typically a fetch call)
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * 
 * @example
 * ```typescript
 * const data = await retryFetch(
 *   () => fetch('http://localhost:3004/api/auth/login', {
 *     method: 'POST',
 *     body: JSON.stringify({ email, password })
 *   }),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryFetch<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Attempt the operation
      const result = await fn();
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const shouldRetry =
        attempt < config.maxAttempts &&
        isRetryableError(error, config.retryableStatuses);

      if (!shouldRetry) {
        // Not retryable or max attempts reached
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      // Call retry callback
      config.onRetry(attempt, error);

      // Log retry attempt (development only)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `🔄 Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms`,
          {
            error: error.message,
            status: error.status,
          }
        );
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError!;
}

/**
 * Retry wrapper specifically for fetch with JSON response
 * Handles common API patterns with automatic JSON parsing
 * 
 * @example
 * ```typescript
 * const response = await retryFetchJSON<LoginResponse>(
 *   'http://localhost:3004/api/auth/login',
 *   {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email, password })
 *   },
 *   { maxAttempts: 3 }
 * );
 * ```
 */
export async function retryFetchJSON<T>(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<T> {
  return retryFetch(async () => {
    const response = await fetch(url, init);

    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response.json();
  }, options);
}

/**
 * Create a retryable fetch function with preset options
 * Useful for consistent retry behavior across multiple calls
 * 
 * @example
 * ```typescript
 * const apiCall = createRetryableFetch({ maxAttempts: 5, initialDelay: 500 });
 * 
 * const user = await apiCall(() => fetch('/api/user'));
 * const posts = await apiCall(() => fetch('/api/posts'));
 * ```
 */
export function createRetryableFetch(options: RetryOptions = {}) {
  return <T>(fn: () => Promise<T>) => retryFetch(fn, options);
}
