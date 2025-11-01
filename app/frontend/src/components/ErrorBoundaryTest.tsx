'use client';

import { useState } from 'react';

/**
 * Error Boundary Test Component (Task 2.2)
 *
 * This component intentionally throws an error when the button is clicked
 * Used to verify that ErrorBoundary catches and displays errors properly
 *
 * Usage: Import in any page to test error handling
 * Example: import ErrorBoundaryTest from '@/components/ErrorBoundaryTest';
 */
export default function ErrorBoundaryTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    // Intentionally throw an error to test ErrorBoundary
    throw new Error('🧪 Test Error: This is an intentional error to test the Error Boundary!');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">Error Boundary Test</h3>
            <p className="mt-1 text-xs text-yellow-700">
              Click the button below to trigger a test error
            </p>
            <div className="mt-3">
              <button
                onClick={() => setShouldThrow(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
              >
                🧪 Throw Test Error
              </button>
            </div>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={() => {
                const element = document.querySelector('[data-test-error-boundary]');
                if (element) {
                  element.remove();
                }
              }}
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
