import React, { useState, useMemo } from 'react';

/**
 * Pagination variant styles
 */
export type PaginationVariant = 'default' | 'minimal' | 'compact';

/**
 * Pagination size variants
 */
export type PaginationSize = 'small' | 'medium' | 'large';

/**
 * Props for the BasePagination component
 */
export interface BasePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show page size selector */
  showPageSize?: boolean;
  /** Whether to show total items count */
  showTotal?: boolean;
  /** Whether to show jump to page input */
  showJumpTo?: boolean;
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;
  /** Maximum number of page buttons to display */
  maxPageButtons?: number;
  /** Visual variant */
  variant?: PaginationVariant;
  /** Size of pagination controls */
  size?: PaginationSize;
  /** Whether pagination is disabled */
  disabled?: boolean;
  /** Custom labels for localization */
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    of?: string;
    items?: string;
    showing?: string;
    to?: string;
    jumpTo?: string;
    go?: string;
  };
  /** Custom CSS classes */
  className?: string;
}

/**
 * BasePagination - A flexible pagination component for data navigation
 * 
 * Features:
 * - Page navigation with prev/next/first/last
 * - Page size selector
 * - Jump to page input
 * - Keyboard navigation support
 * - Responsive design
 * - Multiple variants and sizes
 * - Customizable labels for i18n
 * - Shows current range and total items
 * 
 * @example
 * ```tsx
 * <BasePagination
 *   currentPage={1}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
export const BasePagination: React.FC<BasePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showTotal = true,
  showJumpTo = false,
  showFirstLast = true,
  maxPageButtons = 7,
  variant = 'default',
  size = 'medium',
  disabled = false,
  labels = {},
  className = '',
}) => {
  const [jumpToValue, setJumpToValue] = useState('');

  // Merge default labels with custom labels
  const defaultLabels = {
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    page: 'Page',
    of: 'of',
    items: 'items',
    showing: 'Showing',
    to: 'to',
    jumpTo: 'Jump to',
    go: 'Go',
  };
  const mergedLabels = { ...defaultLabels, ...labels };

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // Calculate current range
  const currentRange = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return { start, end };
  }, [currentPage, pageSize, totalItems]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const leftOffset = Math.floor((maxPageButtons - 3) / 2);
      const rightOffset = Math.ceil((maxPageButtons - 3) / 2);

      let startPage = currentPage - leftOffset;
      let endPage = currentPage + rightOffset;

      // Adjust if at the beginning
      if (startPage <= 2) {
        startPage = 2;
        endPage = maxPageButtons - 1;
      }

      // Adjust if at the end
      if (endPage >= totalPages - 1) {
        endPage = totalPages - 1;
        startPage = totalPages - maxPageButtons + 2;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxPageButtons]);

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    if (disabled) return;
    if (page < 1 || page > totalPages) return;
    if (page === currentPage) return;
    onPageChange(page);
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newPageSize: number) => {
    if (disabled) return;
    onPageSizeChange?.(newPageSize);
    // Adjust current page if needed
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    if (currentPage > newTotalPages) {
      onPageChange(newTotalPages);
    }
  };

  /**
   * Handle jump to page
   */
  const handleJumpTo = () => {
    const page = parseInt(jumpToValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToValue('');
    }
  };

  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    const sizeMap = {
      small: {
        button: 'h-8 min-w-[2rem] px-2 text-sm',
        select: 'h-8 text-sm px-2',
        input: 'h-8 w-16 text-sm px-2',
        text: 'text-xs',
      },
      medium: {
        button: 'h-10 min-w-[2.5rem] px-3 text-base',
        select: 'h-10 text-base px-3',
        input: 'h-10 w-20 text-base px-3',
        text: 'text-sm',
      },
      large: {
        button: 'h-12 min-w-[3rem] px-4 text-lg',
        select: 'h-12 text-lg px-4',
        input: 'h-12 w-24 text-lg px-4',
        text: 'text-base',
      },
    };
    return sizeMap[size];
  };

  /**
   * Get variant classes for buttons
   */
  const getButtonClasses = (isActive: boolean = false) => {
    const sizeClasses = getSizeClasses();
    const baseClasses = `${sizeClasses.button} inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`;

    const variantMap = {
      default: isActive
        ? 'bg-primary-600 text-white border border-primary-600'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
      minimal: isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-700 hover:bg-gray-100',
      compact: isActive
        ? 'bg-primary-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return `${baseClasses} ${variantMap[variant]} ${disabledClasses}`;
  };

  /**
   * Render page button
   */
  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <span
          key={`ellipsis-${index}`}
          className="inline-flex items-center justify-center min-w-[2rem] text-gray-500"
        >
          ...
        </span>
      );
    }

    const pageNum = page as number;
    const isActive = pageNum === currentPage;

    return (
      <button
        key={`page-${pageNum}`}
        onClick={() => handlePageChange(pageNum)}
        disabled={disabled}
        className={getButtonClasses(isActive)}
        aria-label={`${mergedLabels.page} ${pageNum}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNum}
      </button>
    );
  };

  const sizeClasses = getSizeClasses();

  // Don't render if no items
  if (totalItems === 0) return null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top row: Total count and page size selector */}
      {(showTotal || showPageSize) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Total count */}
          {showTotal && (
            <div className={`text-gray-600 ${sizeClasses.text}`}>
              {mergedLabels.showing} {currentRange.start} {mergedLabels.to} {currentRange.end} {mergedLabels.of}{' '}
              {totalItems} {mergedLabels.items}
            </div>
          )}

          {/* Page size selector */}
          {showPageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className={`text-gray-600 ${sizeClasses.text}`}>
                Items per page:
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={disabled}
                className={`${sizeClasses.select} border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Bottom row: Navigation controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              className={`${getButtonClasses()} ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={mergedLabels.first}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Previous page button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={`${getButtonClasses()} ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={mergedLabels.previous}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page number buttons */}
          {pageNumbers.map((page, index) => renderPageButton(page, index))}

          {/* Next page button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={`${getButtonClasses()} ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={mergedLabels.next}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last page button */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              className={`${getButtonClasses()} ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={mergedLabels.last}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Jump to page */}
        {showJumpTo && (
          <div className="flex items-center gap-2">
            <label htmlFor="jump-to-page" className={`text-gray-600 ${sizeClasses.text}`}>
              {mergedLabels.jumpTo}:
            </label>
            <input
              id="jump-to-page"
              type="number"
              min={1}
              max={totalPages}
              value={jumpToValue}
              onChange={(e) => setJumpToValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpTo();
                }
              }}
              disabled={disabled}
              placeholder="1"
              className={`${sizeClasses.input} border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={handleJumpTo}
              disabled={disabled}
              className={`${sizeClasses.button} px-4 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {mergedLabels.go}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

BasePagination.displayName = 'BasePagination';

export default BasePagination;
