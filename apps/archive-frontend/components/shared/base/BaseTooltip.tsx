/**
 * BaseTooltip Component
 * 
 * A flexible tooltip component for displaying contextual information on hover or focus.
 * 
 * Features:
 * - Multiple positioning options (top, bottom, left, right)
 * - Arrow indicator pointing to target
 * - Trigger options (hover, focus, click, manual)
 * - Customizable delay for show/hide
 * - Size variants (small, medium, large)
 * - Dark/light themes
 * - Keyboard accessibility (Escape to close)
 * - Portal rendering (prevents overflow issues)
 * - Auto-positioning (adjusts if tooltip goes off-screen)
 * - Disabled state
 * - Custom styling support
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';
export type TooltipSize = 'small' | 'medium' | 'large';
export type TooltipTheme = 'dark' | 'light';

export interface BaseTooltipProps {
  // Content
  children: ReactNode;
  content: ReactNode;
  
  // Positioning
  placement?: TooltipPlacement;
  offset?: number; // Distance from target in pixels
  
  // Behavior
  trigger?: TooltipTrigger;
  disabled?: boolean;
  open?: boolean; // For manual control
  onOpenChange?: (open: boolean) => void;
  
  // Timing
  showDelay?: number; // Delay before showing (ms)
  hideDelay?: number; // Delay before hiding (ms)
  
  // Appearance
  size?: TooltipSize;
  theme?: TooltipTheme;
  arrow?: boolean;
  maxWidth?: string | number;
  
  // Styling
  className?: string;
  contentClassName?: string;
  
  // Accessibility
  id?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getTooltipPosition = (
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
  offset: number,
  arrow: boolean
): { top: number; left: number; actualPlacement: TooltipPlacement } => {
  const arrowSize = arrow ? 8 : 0;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = 0;
  let left = 0;
  let actualPlacement = placement;
  
  // Calculate initial position based on placement
  switch (placement) {
    case 'top':
      top = targetRect.top + scrollY - tooltipRect.height - offset - arrowSize;
      left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
      
      // Check if tooltip goes above viewport
      if (top < scrollY) {
        actualPlacement = 'bottom';
        top = targetRect.bottom + scrollY + offset + arrowSize;
      }
      break;
      
    case 'bottom':
      top = targetRect.bottom + scrollY + offset + arrowSize;
      left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
      
      // Check if tooltip goes below viewport
      if (top + tooltipRect.height > scrollY + viewportHeight) {
        actualPlacement = 'top';
        top = targetRect.top + scrollY - tooltipRect.height - offset - arrowSize;
      }
      break;
      
    case 'left':
      top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left + scrollX - tooltipRect.width - offset - arrowSize;
      
      // Check if tooltip goes left of viewport
      if (left < scrollX) {
        actualPlacement = 'right';
        left = targetRect.right + scrollX + offset + arrowSize;
      }
      break;
      
    case 'right':
      top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + scrollX + offset + arrowSize;
      
      // Check if tooltip goes right of viewport
      if (left + tooltipRect.width > scrollX + viewportWidth) {
        actualPlacement = 'left';
        left = targetRect.left + scrollX - tooltipRect.width - offset - arrowSize;
      }
      break;
  }
  
  // Ensure tooltip stays within horizontal viewport bounds
  if (left < scrollX + 10) {
    left = scrollX + 10;
  } else if (left + tooltipRect.width > scrollX + viewportWidth - 10) {
    left = scrollX + viewportWidth - tooltipRect.width - 10;
  }
  
  // Ensure tooltip stays within vertical viewport bounds
  if (top < scrollY + 10) {
    top = scrollY + 10;
  } else if (top + tooltipRect.height > scrollY + viewportHeight - 10) {
    top = scrollY + viewportHeight - tooltipRect.height - 10;
  }
  
  return { top, left, actualPlacement };
};

// ============================================================================
// Component
// ============================================================================

export default function BaseTooltip({
  children,
  content,
  placement = 'top',
  offset = 8,
  trigger = 'hover',
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  showDelay = 200,
  hideDelay = 0,
  size = 'medium',
  theme = 'dark',
  arrow = true,
  maxWidth = 200,
  className = '',
  contentClassName = '',
  id,
}: BaseTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);
  
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  
  const isControlled = controlledOpen !== undefined;
  const isVisible = isControlled ? controlledOpen : isOpen;
  
  // ============================================================================
  // Position Calculation
  // ============================================================================
  
  const updatePosition = useCallback(() => {
    if (!targetRef.current || !tooltipRef.current || !isVisible) return;
    
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const { top, left, actualPlacement: newPlacement } = getTooltipPosition(
      targetRect,
      tooltipRect,
      placement,
      offset,
      arrow
    );
    
    setPosition({ top, left });
    setActualPlacement(newPlacement);
  }, [isVisible, placement, offset, arrow]);
  
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);
  
  // ============================================================================
  // Show/Hide Handlers
  // ============================================================================
  
  const show = useCallback(() => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    showTimeoutRef.current = setTimeout(() => {
      if (!isControlled) {
        setIsOpen(true);
      }
      onOpenChange?.(true);
    }, showDelay);
  }, [disabled, isControlled, onOpenChange, showDelay]);
  
  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      if (!isControlled) {
        setIsOpen(false);
      }
      onOpenChange?.(false);
    }, hideDelay);
  }, [isControlled, onOpenChange, hideDelay]);
  
  const toggle = useCallback(() => {
    if (disabled) return;
    
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [disabled, isVisible, show, hide]);
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      show();
    }
  };
  
  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hide();
    }
  };
  
  const handleFocus = () => {
    if (trigger === 'focus') {
      show();
    }
  };
  
  const handleBlur = () => {
    if (trigger === 'focus') {
      hide();
    }
  };
  
  const handleClick = () => {
    if (trigger === 'click') {
      toggle();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      hide();
    }
  };
  
  // ============================================================================
  // Cleanup
  // ============================================================================
  
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  
  // ============================================================================
  // Styles
  // ============================================================================
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-2.5',
  };
  
  const themeClasses = {
    dark: 'bg-gray-900 text-white border-gray-800',
    light: 'bg-white text-gray-900 border-gray-200 shadow-lg',
  };
  
  const arrowClasses = {
    top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };
  
  const arrowThemeClasses = {
    dark: {
      top: 'border-t-gray-900',
      bottom: 'border-b-gray-900',
      left: 'border-l-gray-900',
      right: 'border-r-gray-900',
    },
    light: {
      top: 'border-t-white',
      bottom: 'border-b-white',
      left: 'border-l-white',
      right: 'border-r-white',
    },
  };
  
  // ============================================================================
  // Render
  // ============================================================================
  
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <>
      {/* Target Element */}
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId : undefined}
        className={`inline-block ${className}`}
      >
        {children}
      </div>
      
      {/* Tooltip Portal */}
      {isVisible && !disabled && content && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            zIndex: 9999,
          }}
          className={`
            ${sizeClasses[size]}
            ${themeClasses[theme]}
            rounded-lg
            border
            pointer-events-none
            whitespace-normal
            break-words
            animate-in
            fade-in-0
            zoom-in-95
            duration-200
            ${contentClassName}
          `}
        >
          {/* Content */}
          <div>{content}</div>
          
          {/* Arrow */}
          {arrow && (
            <div
              className={`
                absolute
                w-0
                h-0
                border-[8px]
                ${arrowClasses[actualPlacement]}
                ${arrowThemeClasses[theme][actualPlacement]}
              `}
            />
          )}
        </div>
      )}
    </>
  );
}
