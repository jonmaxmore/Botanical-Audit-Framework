// Test page to verify Sentry error tracking
'use client';

import { useEffect, useState } from 'react';

export default function TestSentryPage() {
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    if (errorType === 'throw') {
      // This will be caught by Sentry
      throw new Error('Test Error: Sentry Integration Check');
    }
  }, [errorType]);

  const triggerClientError = () => {
    setErrorType('throw');
  };

  const triggerAsyncError = async () => {
    try {
      throw new Error('Test Async Error: Sentry Integration Check');
    } catch (error) {
      // Manually capture with Sentry
      if (typeof window !== 'undefined') {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(error);
      }
      alert('Error captured and sent to Sentry!');
    }
  };

  const triggerWarning = async () => {
    if (typeof window !== 'undefined') {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage('Test Warning: Sentry Integration Check', 'warning');
      alert('Warning sent to Sentry!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">🔍 Sentry Integration Test</h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Note:</strong> This page is for testing Sentry error tracking. Click the
            buttons below to generate test errors.
          </p>
          <p className="text-sm text-blue-800 mt-2">
            Check your Sentry dashboard at{' '}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              sentry.io
            </a>{' '}
            to verify errors are being captured.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={triggerClientError}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            🚨 Trigger Client Error (Throw)
          </button>

          <button
            onClick={triggerAsyncError}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            ⚠️ Trigger Async Error (Manual Capture)
          </button>

          <button
            onClick={triggerWarning}
            className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
          >
            ⚡ Send Warning Message
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
          <h2 className="font-semibold text-gray-800 mb-2">What to check in Sentry:</h2>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Error message and stack trace</li>
            <li>Browser and device information</li>
            <li>User session replay (if configured)</li>
            <li>Breadcrumbs leading to the error</li>
            <li>Release version and environment</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline font-semibold">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
