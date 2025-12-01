/**
 * BaseCard Component
 * 
 * Reusable card component for consistent card layouts across all portals.
 * Consolidates card logic from:
 * - farmer-portal
 * - admin-portal
 * - certificate-portal
 * 
 * Features:
 * - Multiple variants (default, outlined, elevated)
 * - Optional header with title and actions
 * - Optional footer with actions
 * - Hover effects
 * - Click handler for interactive cards
 * - Flexible content area
 * - Type-safe props
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5 Week 3-4
 */

'use client';

import React, { ReactNode, HTMLAttributes } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface BaseCardAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
}

export interface BaseCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Visual variant of the card
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Card title (shows in header)
   */
  title?: ReactNode;

  /**
   * Subtitle text (shows below title in header)
   */
  subtitle?: ReactNode;

  /**
   * Header icon or image
   */
  headerIcon?: ReactNode;

  /**
   * Actions to display in header
   */
  headerActions?: ReactNode;

  /**
   * Footer content
   */
  footer?: ReactNode;

  /**
   * Action buttons in footer
   */
  actions?: BaseCardAction[];

  /**
   * Make card hoverable with subtle animation
   * @default false
   */
  hoverable?: boolean;

  /**
   * Make card clickable
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Padding size
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';

  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseCard({
  children,
  variant = 'default',
  title,
  subtitle,
  headerIcon,
  headerActions,
  footer,
  actions,
  hoverable = false,
  onClick,
  className = '',
  padding = 'medium',
  loading = false,
  ...rest
}: BaseCardProps) {
  // Base classes
  const baseClasses = 'rounded-xl transition-all duration-200';

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-transparent border-2 border-gray-300',
    elevated: 'bg-white shadow-lg'
  };

  // Hover classes
  const hoverClasses = hoverable || onClick
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';

  // Padding classes
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  // Content padding (when there's header or footer)
  const contentPaddingClasses = {
    none: '',
    small: 'px-4 py-3',
    medium: 'px-6 py-4',
    large: 'px-8 py-6'
  };

  // Combine classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${!title && !footer ? paddingClasses[padding] : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Handle card click
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  // Has header?
  const hasHeader = title || subtitle || headerIcon || headerActions;

  // Has footer?
  const hasFooter = footer || (actions && actions.length > 0);

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      {...rest}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Header */}
      {hasHeader && (
        <div className={`flex items-start justify-between border-b border-gray-200 ${contentPaddingClasses[padding]}`}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Header Icon */}
            {headerIcon && (
              <div className="flex-shrink-0 mt-1">
                {headerIcon}
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Header Actions */}
          {headerActions && (
            <div className="flex-shrink-0 ml-4">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={hasHeader || hasFooter ? contentPaddingClasses[padding] : ''}>
        {children}
      </div>

      {/* Footer */}
      {hasFooter && (
        <div className={`border-t border-gray-200 ${contentPaddingClasses[padding]}`}>
          {/* Custom Footer Content */}
          {footer && <div>{footer}</div>}

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <div className="flex items-center justify-end gap-3">
              {actions.map((action, index) => {
                const buttonVariantClasses = {
                  primary: 'bg-blue-600 text-white hover:bg-blue-700',
                  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                  text: 'text-blue-600 hover:bg-blue-50'
                };

                const buttonClass = buttonVariantClasses[action.variant || 'primary'];

                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    disabled={action.disabled || loading}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${buttonClass}
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
