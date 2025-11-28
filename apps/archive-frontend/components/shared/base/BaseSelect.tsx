/**
 * BaseSelect Component
 * 
 * A flexible dropdown select component with support for:
 * - Single and multi-select
 * - Search/filter functionality
 * - Custom option rendering
 * - Grouped options
 * - Loading states
 * - Disabled states
 * - Error states
 * - Clear button
 * - Custom placeholder
 * - Keyboard navigation
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface BaseSelectProps {
  // Basic props
  name?: string;
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  options: SelectOption[] | SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Multi-select
  multiple?: boolean;
  maxSelections?: number;
  
  // Search/Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  noOptionsMessage?: string;
  
  // Appearance
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  
  // Features
  clearable?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  
  // Custom rendering
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (selected: SelectOption | SelectOption[]) => React.ReactNode;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onCreate?: (value: string) => void; // For creating new options
  
  // Size
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

const isGroupedOptions = (options: SelectOption[] | SelectGroup[]): options is SelectGroup[] => {
  return options.length > 0 && 'options' in options[0];
};

const flattenOptions = (options: SelectOption[] | SelectGroup[]): SelectOption[] => {
  if (isGroupedOptions(options)) {
    return options.flatMap(group => group.options);
  }
  return options;
};

const getSelectedOptions = (
  options: SelectOption[] | SelectGroup[],
  value: string | number | (string | number)[] | undefined
): SelectOption[] => {
  if (value === undefined || value === null) return [];
  
  const values = Array.isArray(value) ? value : [value];
  const flatOptions = flattenOptions(options);
  
  return values
    .map(v => flatOptions.find(opt => opt.value === v))
    .filter((opt): opt is SelectOption => opt !== undefined);
};

// ============================================================================
// Main Component
// ============================================================================

const BaseSelect: React.FC<BaseSelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  multiple = false,
  maxSelections,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  noOptionsMessage = 'No options available',
  label,
  error,
  helperText,
  className = '',
  clearable = false,
  loading = false,
  loadingMessage = 'Loading...',
  renderOption,
  renderValue,
  onFocus,
  onBlur,
  onCreate,
  size = 'medium',
  fullWidth = false,
}) => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // ============================================================================
  // Selected Values
  // ============================================================================
  
  const selectedOptions = getSelectedOptions(options, value);
  const hasValue = selectedOptions.length > 0;
  
  // ============================================================================
  // Filtered Options
  // ============================================================================
  
  const getFilteredOptions = useCallback((): SelectOption[] | SelectGroup[] => {
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    
    if (isGroupedOptions(options)) {
      return options
        .map(group => ({
          ...group,
          options: group.options.filter(opt =>
            opt.label.toLowerCase().includes(query) ||
            opt.description?.toLowerCase().includes(query)
          ),
        }))
        .filter(group => group.options.length > 0);
    }
    
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);
  
  const filteredOptions = getFilteredOptions();
  const flatFilteredOptions = flattenOptions(filteredOptions);
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleToggleOpen = () => {
    if (disabled || loading) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
      setTimeout(() => {
        if (searchable && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  };
  
  const handleSelectOption = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);
      
      let newValues: (string | number)[];
      
      if (isSelected) {
        newValues = currentValues.filter(v => v !== option.value);
      } else {
        if (maxSelections && currentValues.length >= maxSelections) {
          return; // Max selections reached
        }
        newValues = [...currentValues, option.value];
      }
      
      onChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
    setSearchQuery('');
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    onSearch?.(query);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < flatFilteredOptions.length) {
          handleSelectOption(flatFilteredOptions[highlightedIndex]);
        } else if (onCreate && searchQuery) {
          onCreate(searchQuery);
          setSearchQuery('');
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < flatFilteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
        
      case 'Backspace':
        if (!searchable || !isOpen) {
          if (multiple && hasValue && !searchQuery) {
            e.preventDefault();
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.slice(0, -1);
            onChange?.(newValues);
          }
        }
        break;
        
      default:
        break;
    }
  };
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);
  
  // Focus/Blur callbacks
  useEffect(() => {
    if (isOpen && !isFocused) {
      setIsFocused(true);
      onFocus?.();
    } else if (!isOpen && isFocused) {
      setIsFocused(false);
      onBlur?.();
    }
  }, [isOpen, isFocused, onFocus, onBlur]);
  
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
    let classes = 'relative inline-block';
    if (fullWidth) classes += ' w-full';
    if (className) classes += ` ${className}`;
    return classes;
  };
  
  const getSelectClasses = () => {
    let classes = `${getSizeClasses()} px-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2`;
    
    if (fullWidth) classes += ' w-full';
    
    if (disabled) {
      classes += ' bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300';
    } else if (error) {
      classes += ' border-red-500 bg-white hover:border-red-600';
    } else if (isOpen) {
      classes += ' border-blue-500 bg-white ring-2 ring-blue-200';
    } else {
      classes += ' border-gray-300 bg-white hover:border-gray-400';
    }
    
    return classes;
  };
  
  const getDropdownClasses = () => {
    return 'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto';
  };
  
  const getOptionClasses = (option: SelectOption, index: number) => {
    const isSelected = selectedOptions.some(sel => sel.value === option.value);
    const isHighlighted = index === highlightedIndex;
    
    let classes = 'px-3 py-2 cursor-pointer transition-colors flex items-center gap-2';
    
    if (option.disabled) {
      classes += ' bg-gray-50 text-gray-400 cursor-not-allowed';
    } else if (isSelected) {
      classes += ' bg-blue-50 text-blue-700 font-medium';
    } else if (isHighlighted) {
      classes += ' bg-gray-100';
    } else {
      classes += ' hover:bg-gray-50';
    }
    
    return classes;
  };
  
  // ============================================================================
  // Render Functions
  // ============================================================================
  
  const renderSelectedValue = () => {
    if (loading) {
      return <span className="text-gray-500">{loadingMessage}</span>;
    }
    
    if (!hasValue) {
      return <span className="text-gray-400">{placeholder}</span>;
    }
    
    if (renderValue) {
      return renderValue(multiple ? selectedOptions : selectedOptions[0]);
    }
    
    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption(option);
                }}
                className="hover:text-blue-900"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      );
    }
    
    return <span>{selectedOptions[0].label}</span>;
  };
  
  const renderOptionContent = (option: SelectOption) => {
    const isSelected = selectedOptions.some(sel => sel.value === option.value);
    
    if (renderOption) {
      return renderOption(option, isSelected);
    }
    
    return (
      <div className="flex items-center gap-2 flex-1">
        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="truncate">{option.label}</div>
          {option.description && (
            <div className="text-xs text-gray-500 truncate">{option.description}</div>
          )}
        </div>
        {multiple && isSelected && (
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  };
  
  const renderDropdownContent = () => {
    if (loading) {
      return (
        <div className="px-3 py-8 text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <div>{loadingMessage}</div>
        </div>
      );
    }
    
    if (flatFilteredOptions.length === 0) {
      return (
        <div className="px-3 py-8 text-center text-gray-500">
          {onCreate && searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onCreate(searchQuery);
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Create "{searchQuery}"
            </button>
          ) : (
            noOptionsMessage
          )}
        </div>
      );
    }
    
    if (isGroupedOptions(filteredOptions)) {
      return filteredOptions.map((group, groupIndex) => (
        <div key={groupIndex}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
            {group.label}
          </div>
          {group.options.map((option) => {
            const globalIndex = flatFilteredOptions.indexOf(option);
            return (
              <div
                key={option.value}
                className={getOptionClasses(option, globalIndex)}
                onClick={() => handleSelectOption(option)}
                onMouseEnter={() => setHighlightedIndex(globalIndex)}
              >
                {renderOptionContent(option)}
              </div>
            );
          })}
        </div>
      ));
    }
    
    return flatFilteredOptions.map((option, index) => (
      <div
        key={option.value}
        className={getOptionClasses(option, index)}
        onClick={() => handleSelectOption(option)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        {renderOptionContent(option)}
      </div>
    ));
  };
  
  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <div className={getContainerClasses()}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select Container */}
      <div ref={selectRef} className="relative">
        {/* Select Button */}
        <div
          className={getSelectClasses()}
          onClick={handleToggleOpen}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="select-dropdown"
          aria-disabled={disabled}
        >
          {/* Selected Value */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {renderSelectedValue()}
          </div>
          
          {/* Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Clear Button */}
            {clearable && hasValue && !disabled && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Loading Spinner */}
            {loading && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            
            {/* Dropdown Arrow */}
            {!loading && (
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div id="select-dropdown" className={getDropdownClasses()} role="listbox">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {/* Options */}
            <div ref={dropdownRef}>
              {renderDropdownContent()}
            </div>
            
            {/* Create Option Hint */}
            {onCreate && searchQuery && flatFilteredOptions.length > 0 && (
              <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
                Press Enter to create "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Helper Text / Error */}
      {(helperText || error) && (
        <div className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </div>
      )}
      
      {/* Hidden Input for Form Submission */}
      {name && (
        <>
          {Array.isArray(value) ? (
            value.map((v, i) => (
              <input key={i} type="hidden" name={name} value={v} />
            ))
          ) : (
            <input type="hidden" name={name} value={value || ''} />
          )}
        </>
      )}
    </div>
  );
};

export default BaseSelect;
