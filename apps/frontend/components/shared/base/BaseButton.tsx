/**
 * BaseButton Component
 * 
 * Reusable button component for consistent UI across all portals.
 * Consolidates button logic from:
 * - farmer-portal
 * - admin-portal  
 * - certificate-portal
 * 
 * Features:
 * - Multiple variants (contained, outlined, text, gradient)
 * - Size variations (small, medium, large)
 * - Color themes (primary, secondary, success, error, warning, info)
 * - Loading state with spinner
 * - Icon support (start/end icons)
 * - Disabled state
 * - Full keyboard accessibility
 * - Type-safe props
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5 Week 3-4
 */

'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'gradient';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

export interface BaseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Visual variant of the button
   * @default 'contained'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Color theme of the button
   * @default 'primary'
   */
  color?: ButtonColor;

  /**
   * Icon to display at the start of the button
   */
  startIcon?: ReactNode;

  /**
   * Icon to display at the end of the button
   */
  endIcon?: ReactNode;

  /**
   * Loading state - shows spinner and disables button
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseButton({
  children,
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}: BaseButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-2.5 text-base',
    large: 'px-8 py-3 text-lg'
  };

  // Color classes for each variant
  const colorClasses = {
    contained: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500'
    },
    outlined: {
      primary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      secondary: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      success: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      error: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
      warning: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      info: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500'
    },
    text: {
      primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      secondary: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
      error: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
      warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      info: 'text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500'
    },
    gradient: {
      primary: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500 shadow-lg',
      secondary: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:from-gray-600 hover:to-gray-800 focus:ring-gray-500 shadow-lg',
      success: 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 focus:ring-green-500 shadow-lg',
      error: 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 focus:ring-red-500 shadow-lg',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white hover:from-yellow-600 hover:to-yellow-800 focus:ring-yellow-500 shadow-lg',
      info: 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white hover:from-cyan-600 hover:to-cyan-800 focus:ring-cyan-500 shadow-lg'
    }
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${colorClasses[variant][color]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg 
          className={`${iconSizeClasses[size]} animate-spin`}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Start Icon */}
      {!loading && startIcon && (
        <span className={iconSizeClasses[size]} aria-hidden="true">
          {startIcon}
        </span>
      )}

      {/* Button Content */}
      <span>{children}</span>

      {/* End Icon */}
      {!loading && endIcon && (
        <span className={iconSizeClasses[size]} aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  );
}
