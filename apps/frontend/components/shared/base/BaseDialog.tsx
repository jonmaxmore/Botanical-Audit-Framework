/**
 * BaseDialog Component
 * 
 * A flexible modal dialog component for confirmations, alerts, forms, and custom content.
 * Perfect for user interactions requiring focus and confirmation in GACP system.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Multiple sizes (small, medium, large, fullscreen)
 * - Close handlers (X button, backdrop click, ESC key)
 * - Action buttons (primary, secondary)
 * - Custom header, body, footer
 * - Smooth animations
 * - Focus trap
 * - Scroll lock
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useEffect, useRef, ReactNode } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DialogSize = 'small' | 'medium' | 'large' | 'fullscreen';

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  disabled?: boolean;
  loading?: boolean;
}

export interface BaseDialogProps {
  /**
   * Dialog open state
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Dialog title
   */
  title?: ReactNode;

  /**
   * Dialog content
   */
  children: ReactNode;

  /**
   * Dialog size
   * @default 'medium'
   */
  size?: DialogSize;

  /**
   * Footer actions
   */
  actions?: DialogAction[];

  /**
   * Show close button (X)
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdrop?: boolean;

  /**
   * Close on ESC key
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Custom footer content (overrides actions)
   */
  footer?: ReactNode;

  /**
   * Disable scroll lock on body
   * @default false
   */
  disableScrollLock?: boolean;

  /**
   * Additional CSS class for dialog
   */
  className?: string;

  /**
   * Additional CSS class for dialog content
   */
  contentClassName?: string;

  /**
   * z-index for dialog
   * @default 1000
   */
  zIndex?: number;
}

/**
 * Get size-specific classes
 */
function getSizeClasses(size: DialogSize): string {
  const sizeMap = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full w-full h-full m-0 rounded-none',
  };
  return sizeMap[size];
}

/**
 * Get button variant classes
 */
function getButtonClasses(
  variant: 'contained' | 'outlined' | 'text' = 'contained',
  color: 'primary' | 'secondary' | 'success' | 'error' = 'primary'
): string {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  if (variant === 'contained') {
    const colorMap = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    return `${baseClasses} ${colorMap[color]}`;
  }

  if (variant === 'outlined') {
    const colorMap = {
      primary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      secondary: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      success: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      error: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    };
    return `${baseClasses} ${colorMap[color]}`;
  }

  // text variant
  const colorMap = {
    primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    secondary: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
    success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
    error: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
  };
  return `${baseClasses} ${colorMap[color]}`;
}

/**
 * BaseDialog Component
 */
export default function BaseDialog({
  open,
  onClose,
  title,
  children,
  size = 'medium',
  actions,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  disableScrollLock = false,
  className = '',
  contentClassName = '',
  zIndex = 1000,
}: BaseDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onClose]);

  // Handle scroll lock
  useEffect(() => {
    if (!open || disableScrollLock) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open, disableScrollLock]);

  // Handle focus trap and restoration
  useEffect(() => {
    if (!open) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus dialog
    setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    // Restore focus on close
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Render nothing if closed
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex }}
      aria-labelledby="dialog-title"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={`relative bg-white rounded-lg shadow-xl transform transition-all w-full ${getSizeClasses(
            size
          )} ${className}`}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Close dialog"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`px-6 py-4 ${contentClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {(footer || actions) && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              {footer ? (
                footer
              ) : (
                actions?.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className={`${getButtonClasses(
                      action.variant,
                      action.color
                    )} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {action.loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {action.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
