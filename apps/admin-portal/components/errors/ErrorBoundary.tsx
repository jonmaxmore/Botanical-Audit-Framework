/**
 * Error Boundary Component
 * React error boundary for catching and handling runtime errors
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error
    this.logError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index],
      );

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  logError(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // Example:
    // Sentry.captureException(error, {
    //   contexts: { react: { componentStack: errorInfo.componentStack } }
    // });
  }

  reset = (): void => {
    const { onReset } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (onReset) {
      onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'page', isolate = false } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo!);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback based on level
      return this.renderDefaultFallback(level);
    }

    // Wrap children in error isolation if needed
    if (isolate) {
      return <ErrorIsolation>{children}</ErrorIsolation>;
    }

    return children;
  }

  renderDefaultFallback(level: 'page' | 'section' | 'component'): ReactNode {
    const { error, errorInfo, errorCount } = this.state;

    switch (level) {
      case 'page':
        return (
          <PageErrorFallback
            error={error!}
            errorInfo={errorInfo!}
            onReset={this.reset}
            errorCount={errorCount}
          />
        );
      case 'section':
        return <SectionErrorFallback error={error!} errorInfo={errorInfo!} onReset={this.reset} />;
      case 'component':
        return <ComponentErrorFallback error={error!} onReset={this.reset} />;
    }
  }
}

/**
 * Error Isolation Wrapper
 */
class ErrorIsolation extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Isolated error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null; // Hide broken component
    }
    return this.props.children;
  }
}

/**
 * Page-level Error Fallback
 */
interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  onReset?: () => void;
  errorCount?: number;
}

export function PageErrorFallback({
  error,
  errorInfo,
  onReset,
  errorCount = 0,
}: ErrorFallbackProps): JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTooManyErrors = errorCount >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">เกิดข้อผิดพลาดขึ้น</h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          {isTooManyErrors
            ? 'เกิดข้อผิดพลาดซ้ำหลายครั้ง กรุณาลองรีเฟรชหน้าหรือติดต่อทีมสนับสนุน'
            : 'ขออภัยในความไม่สะดวก เราได้บันทึกปัญหานี้และกำลังดำเนินการแก้ไข'}
        </p>

        {/* Error Details (Development only) */}
        {isDevelopment && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Bug className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 mb-2">Error Details:</p>
                <p className="text-sm text-red-600 font-mono mb-2 break-words">{error.message}</p>
                {error.stack && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-900">Stack Trace</summary>
                    <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {errorInfo?.componentStack && (
                  <details className="text-xs text-gray-600 mt-2">
                    <summary className="cursor-pointer hover:text-gray-900">
                      Component Stack
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Count Warning */}
        {errorCount > 0 && !isTooManyErrors && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ ข้อผิดพลาดนี้เกิดขึ้น {errorCount} ครั้งแล้ว
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onReset && !isTooManyErrors && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              ลองอีกครั้ง
            </button>
          )}
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            กลับหน้าหลัก
          </button>
          {isTooManyErrors && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              รีเฟรชหน้า
            </button>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          ต้องการความช่วยเหลือ?{' '}
          <a href="/support" className="text-blue-600 hover:underline">
            ติดต่อฝ่ายสนับสนุน
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Section-level Error Fallback
 */
export function SectionErrorFallback({
  error,
  errorInfo,
  onReset,
}: ErrorFallbackProps): JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 mb-2">ส่วนนี้เกิดข้อผิดพลาด</h3>
          <p className="text-red-700 mb-4">ไม่สามารถแสดงเนื้อหาในส่วนนี้ได้ กรุณาลองอีกครั้ง</p>

          {isDevelopment && (
            <div className="mb-4 p-3 bg-white rounded border border-red-200">
              <p className="text-sm font-mono text-red-600 break-words">{error.message}</p>
            </div>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              ลองอีกครั้ง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component-level Error Fallback
 */
export function ComponentErrorFallback({
  error,
  onReset,
}: Omit<ErrorFallbackProps, 'errorInfo'>): JSX.Element {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded text-sm">
      <AlertTriangle className="w-4 h-4" />
      <span>เกิดข้อผิดพลาด</span>
      {onReset && (
        <button
          onClick={onReset}
          className="ml-2 text-red-600 hover:text-red-800"
          title="ลองอีกครั้ง"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

/**
 * Hook for error boundary reset
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState();

  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError],
  );
}

/**
 * Async Error Boundary (for async operations)
 */
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): JSX.Element {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error('Async error caught:', error, errorInfo);
        // TODO: Send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Retry Error Boundary (with automatic retry)
 */
interface RetryErrorBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  onMaxRetriesReached?: () => void;
}

export function RetryErrorBoundary({
  children,
  maxRetries = 3,
  retryDelay = 1000,
  onMaxRetriesReached,
}: RetryErrorBoundaryProps): JSX.Element {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      console.error('Retry boundary caught error:', error, errorInfo);

      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else if (onMaxRetriesReached) {
        onMaxRetriesReached();
      }
    },
    [retryCount, maxRetries, retryDelay, onMaxRetriesReached],
  );

  return (
    <ErrorBoundary
      key={retryCount}
      onError={handleError}
      fallback={
        retryCount >= maxRetries ? (
          <PageErrorFallback error={new Error('Max retries reached')} errorCount={retryCount} />
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                กำลังลองอีกครั้ง... ({retryCount + 1}/{maxRetries})
              </p>
            </div>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
