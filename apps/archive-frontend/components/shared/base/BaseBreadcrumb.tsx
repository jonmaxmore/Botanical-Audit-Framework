import React from 'react';
import Link from 'next/link';

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** URL to navigate to (optional for last item) */
  href?: string;
  /** Icon element to display before label */
  icon?: React.ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Breadcrumb separator type
 */
export type BreadcrumbSeparator = 'slash' | 'chevron' | 'arrow' | 'dot' | 'custom';

/**
 * Breadcrumb size
 */
export type BreadcrumbSize = 'small' | 'medium' | 'large';

/**
 * BaseBreadcrumb component props
 */
export interface BaseBreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator style between items */
  separator?: BreadcrumbSeparator;
  /** Custom separator element (requires separator='custom') */
  customSeparator?: React.ReactNode;
  /** Size of the breadcrumb */
  size?: BreadcrumbSize;
  /** Maximum number of items to display before collapsing */
  maxItems?: number;
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  /** Custom home icon */
  homeIcon?: React.ReactNode;
  /** Whether items should be full width on mobile */
  responsive?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for breadcrumb items */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

/**
 * BaseBreadcrumb Component
 * 
 * A navigation component that shows the current page's location within a hierarchy.
 * 
 * @example
 * ```tsx
 * <BaseBreadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', href: '/products/electronics' },
 *     { label: 'Laptop' }
 *   ]}
 *   separator="chevron"
 * />
 * ```
 */
const BaseBreadcrumb: React.FC<BaseBreadcrumbProps> = ({
  items,
  separator = 'slash',
  customSeparator,
  size = 'medium',
  maxItems,
  showHomeIcon = false,
  homeIcon,
  responsive = true,
  className = '',
  onItemClick,
}) => {
  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base',
    };
    return sizes[size];
  };

  // Get separator element
  const getSeparatorElement = () => {
    if (separator === 'custom' && customSeparator) {
      return customSeparator;
    }

    const separators = {
      slash: <span className="mx-2 text-gray-400">/</span>,
      chevron: (
        <svg
          className="mx-2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      arrow: (
        <svg
          className="mx-2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      ),
      dot: <span className="mx-2 text-gray-400">•</span>,
    };

    return separators[separator as keyof typeof separators] || separators.slash;
  };

  // Get default home icon
  const getHomeIcon = () => {
    if (homeIcon) {
      return homeIcon;
    }

    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    );
  };

  // Handle item collapse if maxItems is set
  const getDisplayItems = () => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    // Always show first and last items, collapse middle
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 2));
    
    return [
      ...firstItems,
      { label: '...', disabled: true } as BreadcrumbItem,
      ...lastItems,
    ];
  };

  const displayItems = getDisplayItems();

  // Handle item click
  const handleItemClick = (item: BreadcrumbItem, index: number, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  // Render breadcrumb item
  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isDisabled = item.disabled || isLast;
    const isFirst = index === 0;

    const itemClasses = `
      inline-flex items-center gap-1.5
      ${isDisabled ? 'text-gray-900 cursor-default' : 'text-gray-600 hover:text-primary-600 cursor-pointer'}
      ${isDisabled ? '' : 'transition-colors duration-200'}
      ${item.disabled ? 'opacity-50' : ''}
    `.trim();

    const content = (
      <>
        {isFirst && showHomeIcon && (
          <span className="text-gray-600">{getHomeIcon()}</span>
        )}
        {!isFirst && item.icon && (
          <span className="text-gray-600">{item.icon}</span>
        )}
        <span>{item.label}</span>
      </>
    );

    // If it's the last item or disabled, render as span
    if (isDisabled) {
      return (
        <li key={index} className="inline-flex items-center">
          <span className={itemClasses} aria-current={isLast ? 'page' : undefined}>
            {content}
          </span>
        </li>
      );
    }

    // If it has href, render as link
    if (item.href) {
      return (
        <li key={index} className="inline-flex items-center">
          <Link
            href={item.href}
            className={itemClasses}
            onClick={(e: React.MouseEvent) => handleItemClick(item, index, e)}
          >
            {content}
          </Link>
        </li>
      );
    }

    // Otherwise render as button
    return (
      <li key={index} className="inline-flex items-center">
        <button
          type="button"
          className={itemClasses}
          onClick={(e: React.MouseEvent) => handleItemClick(item, index, e)}
        >
          {content}
        </button>
      </li>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${getSizeClasses()} ${responsive ? 'overflow-x-auto' : ''} ${className}`}
    >
      <ol className="flex items-center flex-wrap">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          return (
            <React.Fragment key={index}>
              {renderItem(item, index, isLast)}
              {!isLast && (
                <li className="inline-flex items-center" aria-hidden="true">
                  {getSeparatorElement()}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default BaseBreadcrumb;
