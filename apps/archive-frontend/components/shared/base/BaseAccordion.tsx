import React, { ReactNode, useState, useRef, KeyboardEvent } from 'react';

/**
 * Accordion expansion modes
 */
export type AccordionMode = 'single' | 'multiple';

/**
 * Accordion variant styles
 */
export type AccordionVariant = 'default' | 'bordered' | 'separated';

/**
 * Accordion size variants
 */
export type AccordionSize = 'small' | 'medium' | 'large';

/**
 * Individual accordion item configuration
 */
export interface AccordionItem {
  /** Unique identifier for the accordion item */
  id: string;
  /** Header/trigger text or content */
  header: ReactNode;
  /** Panel content to show when expanded */
  content: ReactNode;
  /** Optional icon to display before header */
  icon?: ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Custom CSS classes for this item */
  className?: string;
}

/**
 * Props for the BaseAccordion component
 */
export interface BaseAccordionProps {
  /** Array of accordion items to display */
  items: AccordionItem[];
  /** Expansion mode - 'single' allows only one item open, 'multiple' allows many */
  mode?: AccordionMode;
  /** Visual variant of the accordion */
  variant?: AccordionVariant;
  /** Size of the accordion items */
  size?: AccordionSize;
  /** Initially expanded item IDs (controlled) */
  defaultExpanded?: string[];
  /** Controlled expanded item IDs */
  expandedItems?: string[];
  /** Callback when expanded items change */
  onChange?: (expandedItems: string[]) => void;
  /** Whether to animate expand/collapse */
  animated?: boolean;
  /** Whether to show expand/collapse icons */
  showIcons?: boolean;
  /** Custom expand icon (defaults to chevron) */
  expandIcon?: ReactNode;
  /** Custom collapse icon (defaults to chevron) */
  collapseIcon?: ReactNode;
  /** Whether all items are disabled */
  disabled?: boolean;
  /** Custom CSS classes for the accordion container */
  className?: string;
  /** Custom CSS classes for accordion items */
  itemClassName?: string;
  /** Custom CSS classes for accordion headers */
  headerClassName?: string;
  /** Custom CSS classes for accordion panels */
  panelClassName?: string;
}

/**
 * BaseAccordion - A flexible accordion component for collapsible content sections
 * 
 * Features:
 * - Single or multiple item expansion modes
 * - Controlled and uncontrolled modes
 * - Keyboard navigation (Enter, Space, Arrow keys)
 * - Smooth animations
 * - Multiple visual variants
 * - Customizable icons
 * - Full accessibility with ARIA attributes
 * - Disabled state support
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: '1', header: 'Section 1', content: 'Content 1' },
 *   { id: '2', header: 'Section 2', content: 'Content 2' }
 * ];
 * 
 * <BaseAccordion items={items} mode="single" />
 * ```
 */
export const BaseAccordion: React.FC<BaseAccordionProps> = ({
  items,
  mode = 'single',
  variant = 'default',
  size = 'medium',
  defaultExpanded = [],
  expandedItems: controlledExpandedItems,
  onChange,
  animated = true,
  showIcons = true,
  expandIcon,
  collapseIcon,
  disabled = false,
  className = '',
  itemClassName = '',
  headerClassName = '',
  panelClassName = '',
}) => {
  // Internal state for uncontrolled mode
  const [uncontrolledExpandedItems, setUncontrolledExpandedItems] = useState<string[]>(defaultExpanded);
  
  // Determine if component is controlled
  const isControlled = controlledExpandedItems !== undefined;
  const expandedItems = isControlled ? controlledExpandedItems : uncontrolledExpandedItems;
  
  // Refs for managing focus
  const headerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /**
   * Handle toggling an accordion item
   */
  const handleToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item?.disabled || disabled) return;

    let newExpandedItems: string[];

    if (mode === 'single') {
      // In single mode, only one item can be expanded
      newExpandedItems = expandedItems.includes(itemId) ? [] : [itemId];
    } else {
      // In multiple mode, toggle the item
      newExpandedItems = expandedItems.includes(itemId)
        ? expandedItems.filter(id => id !== itemId)
        : [...expandedItems, itemId];
    }

    if (!isControlled) {
      setUncontrolledExpandedItems(newExpandedItems);
    }
    onChange?.(newExpandedItems);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, itemId: string) => {
    const enabledItems = items.filter(item => !item.disabled && !disabled);
    const currentEnabledIndex = enabledItems.findIndex(item => item.id === itemId);

    let targetIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Move to next item
        targetIndex = (currentEnabledIndex + 1) % enabledItems.length;
        break;

      case 'ArrowUp':
        event.preventDefault();
        // Move to previous item
        targetIndex = currentEnabledIndex === 0 
          ? enabledItems.length - 1 
          : currentEnabledIndex - 1;
        break;

      case 'Home':
        event.preventDefault();
        // Move to first item
        targetIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        // Move to last item
        targetIndex = enabledItems.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        handleToggle(itemId);
        return;
    }

    // Focus the target header
    if (targetIndex !== null) {
      const targetItem = enabledItems[targetIndex];
      headerRefs.current.get(targetItem.id)?.focus();
    }
  };

  /**
   * Get size-specific classes
   */
  const getSizeClasses = () => {
    const sizeMap = {
      small: {
        header: 'px-3 py-2 text-sm',
        panel: 'px-3 py-2 text-sm',
        icon: 'h-4 w-4',
      },
      medium: {
        header: 'px-4 py-3 text-base',
        panel: 'px-4 py-3 text-base',
        icon: 'h-5 w-5',
      },
      large: {
        header: 'px-6 py-4 text-lg',
        panel: 'px-6 py-4 text-base',
        icon: 'h-6 w-6',
      },
    };
    return sizeMap[size];
  };

  /**
   * Get variant-specific classes for container
   */
  const getContainerClasses = () => {
    const variantMap = {
      default: 'border rounded-lg overflow-hidden',
      bordered: 'space-y-0',
      separated: 'space-y-3',
    };
    return variantMap[variant];
  };

  /**
   * Get variant-specific classes for item
   */
  const getItemClasses = (isExpanded: boolean, isDisabled: boolean, index: number) => {
    const baseClasses = 'transition-all duration-200';
    
    const variantMap = {
      default: `${index !== items.length - 1 ? 'border-b' : ''}`,
      bordered: 'border rounded-lg overflow-hidden',
      separated: 'border rounded-lg overflow-hidden shadow-sm',
    };

    const stateClasses = isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : isExpanded
      ? 'bg-gray-50'
      : 'bg-white hover:bg-gray-50';

    return `${baseClasses} ${variantMap[variant]} ${stateClasses}`;
  };

  /**
   * Get header classes
   */
  const getHeaderClasses = (isExpanded: boolean, isDisabled: boolean) => {
    const sizeClasses = getSizeClasses();
    
    const baseClasses = 'w-full flex items-center justify-between font-medium text-left transition-colors duration-200';
    
    const stateClasses = isDisabled
      ? 'cursor-not-allowed text-gray-400'
      : 'cursor-pointer text-gray-900 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

    return `${baseClasses} ${sizeClasses.header} ${stateClasses}`;
  };

  /**
   * Get default expand/collapse icons
   */
  const getDefaultIcon = (isExpanded: boolean) => {
    const sizeClasses = getSizeClasses();
    const rotationClass = isExpanded ? 'rotate-180' : 'rotate-0';
    const transitionClass = animated ? 'transition-transform duration-200' : '';
    
    return (
      <svg
        className={`${sizeClasses.icon} ${rotationClass} ${transitionClass} text-gray-500`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  /**
   * Get panel classes with animation
   */
  const getPanelClasses = (isExpanded: boolean) => {
    const sizeClasses = getSizeClasses();
    
    const baseClasses = 'overflow-hidden border-t bg-white';
    const animationClasses = animated
      ? isExpanded
        ? 'animate-accordion-down'
        : 'animate-accordion-up'
      : '';

    return `${baseClasses} ${sizeClasses.panel} ${animationClasses}`;
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {items.map((item, index) => {
        const isExpanded = expandedItems.includes(item.id);
        const isDisabled = item.disabled || disabled;

        return (
          <div
            key={item.id}
            className={`${getItemClasses(isExpanded, isDisabled, index)} ${itemClassName} ${item.className || ''}`}
          >
            {/* Accordion Header */}
            <button
              ref={(el) => {
                if (el) {
                  headerRefs.current.set(item.id, el);
                } else {
                  headerRefs.current.delete(item.id);
                }
              }}
              type="button"
              onClick={() => handleToggle(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              disabled={isDisabled}
              aria-expanded={isExpanded}
              aria-controls={`accordion-panel-${item.id}`}
              aria-disabled={isDisabled}
              className={`${getHeaderClasses(isExpanded, isDisabled)} ${headerClassName}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Optional item icon */}
                {item.icon && (
                  <span className={`flex-shrink-0 ${sizeClasses.icon}`}>
                    {item.icon}
                  </span>
                )}
                
                {/* Header content */}
                <span className="flex-1">{item.header}</span>
              </div>

              {/* Expand/collapse icon */}
              {showIcons && (
                <span className="flex-shrink-0 ml-3">
                  {isExpanded
                    ? collapseIcon || getDefaultIcon(true)
                    : expandIcon || getDefaultIcon(false)}
                </span>
              )}
            </button>

            {/* Accordion Panel */}
            {isExpanded && (
              <div
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-header-${item.id}`}
                className={`${getPanelClasses(isExpanded)} ${panelClassName}`}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

BaseAccordion.displayName = 'BaseAccordion';

export default BaseAccordion;
