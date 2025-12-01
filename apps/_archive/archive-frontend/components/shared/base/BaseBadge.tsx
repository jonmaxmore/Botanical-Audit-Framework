/**
 * BaseBadge Component
 * 
 * Reusable badge component for status indicators, labels, and notifications.
 * Consolidates badge logic from:
 * - farmer-portal
 * - admin-portal  
 * - certificate-portal
 * 
 * Features:
 * - Multiple variants (solid, outlined, soft)
 * - Size variations (small, medium, large)
 * - Color themes (primary, secondary, success, error, warning, info, gray)
 * - Icon support (start/end icons)
 * - Dot indicator option
 * - Removable with close button
 * - Pill and rounded shapes
 * - Full accessibility
 * - Type-safe props
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { ReactNode, MouseEvent } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BadgeVariant = 'solid' | 'outlined' | 'soft';
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray';

export interface BaseBadgeProps {
  /**
   * Badge content
   */
  children: ReactNode;

  /**
   * Visual variant of the badge
   * @default 'solid'
   */
  variant?: BadgeVariant;

  /**
   * Size of the badge
   * @default 'medium'
   */
  size?: BadgeSize;

  /**
   * Color theme of the badge
   * @default 'primary'
   */
  color?: BadgeColor;

  /**
   * Icon to display before the content
   */
  startIcon?: ReactNode;

  /**
   * Icon to display after the content
   */
  endIcon?: ReactNode;

  /**
   * Show a dot indicator before the content
   * @default false
   */
  dot?: boolean;

  /**
   * Make the badge removable with a close button
   * @default false
   */
  removable?: boolean;

  /**
   * Callback when close button is clicked
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Make the badge pill-shaped (fully rounded)
   * @default false
   */
  pill?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler for the badge
   */
  onClick?: (event: MouseEvent<HTMLSpanElement>) => void;

  /**
   * Make the badge clickable (shows hover effect)
   * @default false
   */
  clickable?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseBadge({
  children,
  variant = 'solid',
  size = 'medium',
  color = 'primary',
  startIcon,
  endIcon,
  dot = false,
  removable = false,
  onRemove,
  pill = false,
  className = '',
  onClick,
  clickable = false,
}: BaseBadgeProps) {
  // Size classes
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base',
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  // Dot size classes
  const dotSizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5',
  };

  // Color classes by variant
  const getColorClasses = () => {
    const colorMap = {
      solid: {
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-purple-600 text-white',
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        info: 'bg-cyan-600 text-white',
        gray: 'bg-gray-600 text-white',
      },
      outlined: {
        primary: 'border-2 border-blue-600 text-blue-700 bg-transparent',
        secondary: 'border-2 border-purple-600 text-purple-700 bg-transparent',
        success: 'border-2 border-green-600 text-green-700 bg-transparent',
        error: 'border-2 border-red-600 text-red-700 bg-transparent',
        warning: 'border-2 border-yellow-600 text-yellow-700 bg-transparent',
        info: 'border-2 border-cyan-600 text-cyan-700 bg-transparent',
        gray: 'border-2 border-gray-600 text-gray-700 bg-transparent',
      },
      soft: {
        primary: 'bg-blue-100 text-blue-800 border border-blue-200',
        secondary: 'bg-purple-100 text-purple-800 border border-purple-200',
        success: 'bg-green-100 text-green-800 border border-green-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
        gray: 'bg-gray-100 text-gray-800 border border-gray-200',
      },
    };

    return colorMap[variant][color];
  };

  // Hover classes for clickable badges
  const getHoverClasses = () => {
    if (!clickable && !onClick) return '';

    const hoverMap = {
      solid: {
        primary: 'hover:bg-blue-700',
        secondary: 'hover:bg-purple-700',
        success: 'hover:bg-green-700',
        error: 'hover:bg-red-700',
        warning: 'hover:bg-yellow-700',
        info: 'hover:bg-cyan-700',
        gray: 'hover:bg-gray-700',
      },
      outlined: {
        primary: 'hover:bg-blue-50',
        secondary: 'hover:bg-purple-50',
        success: 'hover:bg-green-50',
        error: 'hover:bg-red-50',
        warning: 'hover:bg-yellow-50',
        info: 'hover:bg-cyan-50',
        gray: 'hover:bg-gray-50',
      },
      soft: {
        primary: 'hover:bg-blue-200',
        secondary: 'hover:bg-purple-200',
        success: 'hover:bg-green-200',
        error: 'hover:bg-red-200',
        warning: 'hover:bg-yellow-200',
        info: 'hover:bg-cyan-200',
        gray: 'hover:bg-gray-200',
      },
    };

    return hoverMap[variant][color];
  };

  // Close button color classes
  const getCloseButtonClasses = () => {
    const closeMap = {
      solid: 'hover:bg-white/20',
      outlined: 'hover:bg-current/10',
      soft: 'hover:bg-current/20',
    };

    return closeMap[variant];
  };

  // Handle remove click
  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.(event);
  };

  // Badge classes
  const badgeClasses = [
    'inline-flex items-center gap-1.5 font-medium',
    'transition-all duration-200',
    sizeClasses[size],
    getColorClasses(),
    pill ? 'rounded-full' : 'rounded-md',
    (clickable || onClick) && 'cursor-pointer',
    (clickable || onClick) && getHoverClasses(),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as any);
              }
            }
          : undefined
      }
    >
      {/* Dot Indicator */}
      {dot && (
        <span
          className={`${dotSizeClasses[size]} rounded-full bg-current animate-pulse`}
          aria-hidden="true"
        />
      )}

      {/* Start Icon */}
      {startIcon && (
        <span className={`${iconSizeClasses[size]} flex-shrink-0`} aria-hidden="true">
          {startIcon}
        </span>
      )}

      {/* Content */}
      <span className="leading-none">{children}</span>

      {/* End Icon */}
      {endIcon && !removable && (
        <span className={`${iconSizeClasses[size]} flex-shrink-0`} aria-hidden="true">
          {endIcon}
        </span>
      )}

      {/* Remove Button */}
      {removable && (
        <button
          type="button"
          onClick={handleRemoveClick}
          className={`
            ${iconSizeClasses[size]}
            flex-shrink-0 rounded-full
            ${getCloseButtonClasses()}
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
          `}
          aria-label="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-full h-full"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
