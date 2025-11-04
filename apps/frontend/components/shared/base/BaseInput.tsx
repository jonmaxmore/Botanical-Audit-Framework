/**
 * BaseInput Component
 * 
 * A versatile input component supporting multiple types with validation states.
 * Supports text, email, password, number, tel, url, search, and textarea.
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { forwardRef, ReactNode } from 'react';

// Input size variants
export type InputSize = 'small' | 'medium' | 'large';

// Input validation states
export type InputState = 'default' | 'success' | 'error' | 'warning';

// Input types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  /** Input type */
  type?: InputType;
  /** Input size */
  size?: InputSize;
  /** Validation state */
  state?: InputState;
  /** Input label */
  label?: ReactNode;
  /** Helper text displayed below input */
  helperText?: ReactNode;
  /** Error message (automatically sets state to 'error') */
  error?: ReactNode;
  /** Success message (automatically sets state to 'success') */
  success?: ReactNode;
  /** Icon displayed at start of input */
  startIcon?: ReactNode;
  /** Icon displayed at end of input */
  endIcon?: ReactNode;
  /** Make input full width */
  fullWidth?: boolean;
  /** Render as textarea */
  multiline?: boolean;
  /** Number of rows for textarea */
  rows?: number;
  /** Show character count (requires maxLength) */
  showCount?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * BaseInput Component
 * 
 * Flexible input component with validation states and icons
 */
const BaseInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, BaseInputProps>(
  (
    {
      type = 'text',
      size = 'medium',
      state: stateProp,
      label,
      helperText,
      error,
      success,
      startIcon,
      endIcon,
      fullWidth = false,
      multiline = false,
      rows = 3,
      showCount = false,
      className = '',
      disabled = false,
      value,
      maxLength,
      id,
      ...rest
    },
    ref
  ) => {
    // Determine state from props
    const state: InputState = error ? 'error' : success ? 'success' : stateProp || 'default';

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Size classes
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-5 py-3 text-lg',
    };

    // State classes
    const stateClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
    };

    // Helper text color based on state
    const helperTextColor = {
      default: 'text-gray-600',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
    };

    // Base input classes
    const inputClasses = `
      w-full
      rounded-lg
      border
      bg-white
      transition-colors
      duration-200
      focus:outline-none
      focus:ring-2
      ${sizeClasses[size]}
      ${stateClasses[state]}
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
      ${startIcon ? 'pl-10' : ''}
      ${endIcon ? 'pr-10' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Calculate character count
    const currentLength = typeof value === 'string' ? value.length : 0;
    const showCharCount = showCount && maxLength;

    // Helper text to display
    const displayHelperText = error || success || helperText;

    // Render input or textarea
    const renderInput = () => {
      const commonProps = {
        id: inputId,
        disabled,
        value,
        maxLength,
        className: inputClasses,
        'aria-invalid': state === 'error',
        'aria-describedby': displayHelperText ? `${inputId}-helper` : undefined,
        ...rest,
      };

      if (multiline) {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            {...commonProps}
          />
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          {...commonProps}
        />
      );
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1.5 ${
              disabled ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            {label}
            {rest.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          {/* Input/Textarea */}
          {renderInput()}

          {/* End Icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}

          {/* Loading Spinner (if needed in future) */}
        </div>

        {/* Helper Text and Character Count */}
        {(displayHelperText || showCharCount) && (
          <div className="flex justify-between items-start mt-1.5">
            {/* Helper Text */}
            {displayHelperText && (
              <p
                id={`${inputId}-helper`}
                className={`text-sm ${helperTextColor[state]}`}
              >
                {displayHelperText}
              </p>
            )}

            {/* Character Count */}
            {showCharCount && (
              <p
                className={`text-sm ml-auto ${
                  maxLength && currentLength > maxLength * 0.9
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {currentLength}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;
