/**
 * BaseDatePicker Component
 * 
 * A flexible date picker component for selecting dates with calendar popup.
 * Supports single date, date range, min/max dates, disabled dates, and custom formatting.
 * 
 * Features:
 * - Single date selection
 * - Date range selection (start/end dates)
 * - Calendar popup with month/year navigation
 * - Min/max date constraints
 * - Disabled dates (specific dates or predicates)
 * - Custom date formatting
 * - Keyboard navigation
 * - Error states and validation
 * - Size variants (small, medium, large)
 * - Full width support
 * - Form integration
 * - Today button for quick selection
 * - Clear button
 * - Accessibility (ARIA, keyboard support)
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface BaseDatePickerProps {
  // Basic props
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Date constraints
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  
  // Range selection
  range?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  
  // Formatting
  dateFormat?: string; // e.g., 'MM/DD/YYYY', 'DD/MM/YYYY'
  
  // Appearance
  error?: string;
  helperText?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  
  // Features
  clearable?: boolean;
  showTodayButton?: boolean;
  closeOnSelect?: boolean; // Auto-close after selection (default: true for single, false for range)
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date to string based on format pattern
 */
const formatDate = (date: Date | null, format: string = 'MM/DD/YYYY'): string => {
  if (!date) return '';
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const dayStr = day.toString().padStart(2, '0');
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString();
  
  return format
    .replace('DD', dayStr)
    .replace('MM', monthStr)
    .replace('YYYY', yearStr);
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if date is between two dates (inclusive)
 */
const isDateBetween = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return false;
  
  const dateTime = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  
  return dateTime >= startTime && dateTime <= endTime;
};

/**
 * Check if date is disabled
 */
const isDateDisabled = (
  date: Date,
  disabledDates?: Date[] | ((date: Date) => boolean),
  minDate?: Date,
  maxDate?: Date
): boolean => {
  // Check min/max constraints
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  
  // Check disabled dates
  if (!disabledDates) return false;
  
  if (typeof disabledDates === 'function') {
    return disabledDates(date);
  }
  
  return disabledDates.some(d => isSameDay(d, date));
};

/**
 * Get days in month
 */
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get calendar grid (6 weeks x 7 days)
 */
const getCalendarDays = (year: number, month: number): (Date | null)[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days: (Date | null)[] = [];
  
  // Previous month days
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Fill remaining cells to complete 6 weeks (42 days)
  const remainingCells = 42 - days.length;
  for (let i = 0; i < remainingCells; i++) {
    days.push(null);
  }
  
  return days;
};

// ============================================================================
// Main Component
// ============================================================================

export default function BaseDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  name,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  disabledDates,
  range = false,
  startDate,
  endDate,
  onRangeChange,
  dateFormat = 'MM/DD/YYYY',
  error,
  helperText,
  className = '',
  size = 'medium',
  fullWidth = false,
  clearable = false,
  showTodayButton = true,
  closeOnSelect = true,
  onFocus,
  onBlur,
  onOpen,
  onClose,
}: BaseDatePickerProps) {
  // ============================================================================
  // State
  // ============================================================================
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value?.getMonth() ?? new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(value?.getFullYear() ?? new Date().getFullYear());
  const [isFocused, setIsFocused] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const displayValue = range
    ? startDate && endDate
      ? `${formatDate(startDate, dateFormat)} - ${formatDate(endDate, dateFormat)}`
      : startDate
      ? formatDate(startDate, dateFormat)
      : ''
    : value ? formatDate(value, dateFormat) : '';
  
  const hasValue = range ? !!(startDate || endDate) : !!value;
  
  const calendarDays = getCalendarDays(currentYear, currentMonth);
  
  const shouldCloseOnSelect = closeOnSelect !== undefined ? closeOnSelect : !range;
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleToggleOpen = () => {
    if (disabled) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };
  
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date, disabledDates, minDate, maxDate)) return;
    
    if (range) {
      handleRangeDateSelect(date);
    } else {
      onChange?.(date);
      
      if (shouldCloseOnSelect) {
        setIsOpen(false);
        onClose?.();
      }
    }
  };
  
  const handleRangeDateSelect = (date: Date) => {
    if (!tempStartDate || (startDate && endDate)) {
      // First selection - set start date
      setTempStartDate(date);
      onRangeChange?.(date, null);
    } else {
      // Second selection - set end date
      if (date < tempStartDate) {
        // If selected date is before start, swap them
        onRangeChange?.(date, tempStartDate);
      } else {
        onRangeChange?.(tempStartDate, date);
      }
      
      setTempStartDate(null);
      
      if (shouldCloseOnSelect) {
        setIsOpen(false);
        onClose?.();
      }
    }
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (range) {
      onRangeChange?.(null, null);
      setTempStartDate(null);
    } else {
      onChange?.(null);
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    
    if (range) {
      onRangeChange?.(today, today);
      setTempStartDate(null);
    } else {
      onChange?.(today);
    }
    
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    
    if (shouldCloseOnSelect) {
      setIsOpen(false);
      onClose?.();
    }
  };
  
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && !isOpen) {
      setIsOpen(true);
      onOpen?.();
    }
  };
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  // Focus/Blur callbacks
  useEffect(() => {
    if (isFocused) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  }, [isFocused, onFocus, onBlur]);
  
  // ============================================================================
  // CSS Classes
  // ============================================================================
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8 text-sm';
      case 'large':
        return 'h-12 text-base';
      case 'medium':
      default:
        return 'h-10 text-sm';
    }
  };
  
  const getContainerClasses = () => {
    const baseClasses = 'relative';
    const widthClasses = fullWidth ? 'w-full' : 'w-auto';
    
    return `${baseClasses} ${widthClasses} ${className}`;
  };
  
  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 border rounded-md transition-colors cursor-pointer';
    const sizeClasses = getSizeClasses();
    const stateClasses = disabled
      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
      : error
      ? 'border-red-500 bg-white text-gray-900 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200'
      : isFocused || isOpen
      ? 'border-blue-500 bg-white text-gray-900 ring-2 ring-blue-200'
      : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
    
    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  };
  
  const getCalendarClasses = () => {
    return 'absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]';
  };
  
  const getDayClasses = (date: Date | null) => {
    if (!date) return 'invisible';
    
    const isDisabled = isDateDisabled(date, disabledDates, minDate, maxDate);
    const isToday = isSameDay(date, new Date());
    const isSelected = range
      ? isSameDay(date, startDate || null) || isSameDay(date, endDate || null)
      : isSameDay(date, value || null);
    const isInRange = range && startDate && endDate && isDateBetween(date, startDate || null, endDate || null);
    
    const baseClasses = 'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors';
    
    if (isDisabled) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700`;
    }
    
    if (isInRange) {
      return `${baseClasses} bg-blue-100 text-blue-900 cursor-pointer hover:bg-blue-200`;
    }
    
    if (isToday) {
      return `${baseClasses} border-2 border-blue-600 text-blue-600 font-semibold cursor-pointer hover:bg-blue-50`;
    }
    
    return `${baseClasses} text-gray-700 cursor-pointer hover:bg-gray-100`;
  };
  
  // ============================================================================
  // Render
  // ============================================================================
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <div ref={containerRef} className={getContainerClasses()}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={handleToggleOpen}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={getInputClasses()}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-disabled={disabled}
        />
        
        {/* Clear Button */}
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear date"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Calendar Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      {/* Calendar Popup */}
      {isOpen && (
        <div className={getCalendarClasses()}>
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </div>
            
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {calendarDays.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => date && handleDateSelect(date)}
                disabled={!date || isDateDisabled(date, disabledDates, minDate, maxDate)}
                className={getDayClasses(date)}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t pt-3">
            {showTodayButton && (
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Today
              </button>
            )}
            
            {clearable && hasValue && (
              <button
                type="button"
                onClick={(e) => {
                  handleClear(e);
                  setIsOpen(false);
                  onClose?.();
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Helper Text / Error Message */}
      {(helperText || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
      
      {/* Hidden Input for Form Submission */}
      {name && !range && (
        <input
          type="hidden"
          name={name}
          value={value ? value.toISOString() : ''}
        />
      )}
      
      {/* Hidden Inputs for Range */}
      {name && range && (
        <>
          <input
            type="hidden"
            name={`${name}_start`}
            value={startDate ? startDate.toISOString() : ''}
          />
          <input
            type="hidden"
            name={`${name}_end`}
            value={endDate ? endDate.toISOString() : ''}
          />
        </>
      )}
    </div>
  );
}
