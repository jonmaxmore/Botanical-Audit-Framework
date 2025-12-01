/**
 * BaseTable Component
 * 
 * A comprehensive data table component with sorting, pagination, selection, and filtering.
 * Perfect for farmer lists, audit logs, certificates, and other data displays.
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState, useMemo, ReactNode } from 'react';

// Column definition
export interface TableColumn<T = any> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  label: string;
  /** Accessor function or property key */
  accessor: keyof T | ((row: T) => any);
  /** Custom cell renderer */
  render?: (value: any, row: T, index: number) => ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** CSS class for header */
  headerClassName?: string;
  /** CSS class for cells */
  cellClassName?: string;
}

// Sort direction
export type SortDirection = 'asc' | 'desc' | null;

// Sort state
export interface SortState {
  columnId: string | null;
  direction: SortDirection;
}

// Selection mode
export type SelectionMode = 'none' | 'single' | 'multiple';

export interface BaseTableProps<T = any> {
  /** Table columns configuration */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Unique row key accessor */
  rowKey: keyof T | ((row: T) => string | number);
  /** Selection mode */
  selectionMode?: SelectionMode;
  /** Selected row keys */
  selectedRows?: (string | number)[];
  /** Selection change callback */
  onSelectionChange?: (selectedKeys: (string | number)[]) => void;
  /** Row click callback */
  onRowClick?: (row: T, index: number) => void;
  /** Enable sorting */
  sortable?: boolean;
  /** Initial sort state */
  defaultSort?: SortState;
  /** Sort change callback */
  onSortChange?: (sort: SortState) => void;
  /** Enable pagination */
  pagination?: boolean;
  /** Rows per page */
  pageSize?: number;
  /** Current page (controlled) */
  currentPage?: number;
  /** Page change callback */
  onPageChange?: (page: number) => void;
  /** Total rows (for server-side pagination) */
  totalRows?: number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: ReactNode;
  /** Table variant */
  variant?: 'default' | 'striped' | 'bordered';
  /** Compact mode */
  compact?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Show row numbers */
  showRowNumbers?: boolean;
}

/**
 * Get row key
 */
function getRowKey<T>(row: T, rowKey: keyof T | ((row: T) => string | number)): string | number {
  return typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as any);
}

/**
 * Get cell value
 */
function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => any)): any {
  return typeof accessor === 'function' ? accessor(row) : row[accessor];
}

/**
 * BaseTable Component
 */
function BaseTable<T extends Record<string, any> = any>({
  columns,
  data,
  rowKey,
  selectionMode = 'none',
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  sortable = false,
  defaultSort,
  onSortChange,
  pagination = false,
  pageSize = 10,
  currentPage: controlledPage,
  onPageChange,
  totalRows,
  loading = false,
  emptyMessage = 'No data available',
  variant = 'default',
  compact = false,
  hoverable = true,
  className = '',
  showRowNumbers = false,
}: BaseTableProps<T>) {
  // Local state for uncontrolled pagination
  const [localPage, setLocalPage] = useState(1);
  const currentPage = controlledPage ?? localPage;

  // Sort state
  const [sortState, setSortState] = useState<SortState>(
    defaultSort || { columnId: null, direction: null }
  );

  // Handle sort
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable && !sortable) return;

    const newDirection: SortDirection =
      sortState.columnId === columnId
        ? sortState.direction === 'asc'
          ? 'desc'
          : sortState.direction === 'desc'
          ? null
          : 'asc'
        : 'asc';

    const newSort = { columnId: newDirection ? columnId : null, direction: newDirection };
    setSortState(newSort);
    onSortChange?.(newSort);
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) return data;

    const column = columns.find((col) => col.id === sortState.columnId);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = getCellValue(a, column.accessor);
      const bValue = getCellValue(b, column.accessor);

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortState, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil((totalRows ?? sortedData.length) / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setLocalPage(page);
    }
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (selectionMode !== 'multiple') return;
    const allKeys = paginatedData.map((row) => getRowKey(row, rowKey));
    onSelectionChange?.(checked ? allKeys : []);
  };

  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (selectionMode === 'none') return;

    if (selectionMode === 'single') {
      onSelectionChange?.(checked ? [key] : []);
    } else {
      const newSelection = checked
        ? [...selectedRows, key]
        : selectedRows.filter((k) => k !== key);
      onSelectionChange?.(newSelection);
    }
  };

  const isRowSelected = (key: string | number) => selectedRows.includes(key);
  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => isRowSelected(getRowKey(row, rowKey)));

  // Variant classes
  const variantClasses = {
    default: 'border-gray-200',
    striped: 'border-gray-200',
    bordered: 'border-gray-300',
  };

  // Row classes
  const getRowClasses = (isSelected: boolean, index: number) => {
    const classes = ['border-b'];

    if (variant === 'striped' && index % 2 === 1) {
      classes.push('bg-gray-50');
    }

    if (isSelected) {
      classes.push('bg-blue-50');
    }

    if (hoverable && !isSelected) {
      classes.push('hover:bg-gray-50');
    }

    if (onRowClick) {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Table Container */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          {/* Header */}
          <thead className={`bg-gray-100 border-b-2 ${variantClasses[variant]}`}>
            <tr>
              {/* Row Numbers Column */}
              {showRowNumbers && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              )}

              {/* Selection Column */}
              {selectionMode === 'multiple' && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                </th>
              )}
              {selectionMode === 'single' && <th className="px-4 py-3 w-12"></th>}

              {/* Data Columns */}
              {columns.map((column) => {
                const isSortable = column.sortable ?? sortable;
                const isSorted = sortState.columnId === column.id;

                return (
                  <th
                    key={column.id}
                    style={{ width: column.width }}
                    className={`px-4 py-3 text-${column.align || 'left'} text-sm font-semibold text-gray-700 ${
                      column.headerClassName || ''
                    } ${isSortable ? 'cursor-pointer select-none hover:bg-gray-200' : ''}`}
                    onClick={() => isSortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {isSortable && (
                        <span className="text-gray-400">
                          {!isSorted && '↕'}
                          {isSorted && sortState.direction === 'asc' && '↑'}
                          {isSorted && sortState.direction === 'desc' && '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectionMode !== 'none' ? 1 : 0) +
                    (showRowNumbers ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectionMode !== 'none' ? 1 : 0) +
                    (showRowNumbers ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const key = getRowKey(row, rowKey);
                const isSelected = isRowSelected(key);
                const globalIndex = pagination ? (currentPage - 1) * pageSize + index : index;

                return (
                  <tr
                    key={String(key)}
                    className={getRowClasses(isSelected, globalIndex)}
                    onClick={() => onRowClick?.(row, globalIndex)}
                  >
                    {/* Row Number */}
                    {showRowNumbers && (
                      <td className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-gray-600`}>
                        {globalIndex + 1}
                      </td>
                    )}

                    {/* Selection */}
                    {selectionMode !== 'none' && (
                      <td className={`px-4 ${compact ? 'py-2' : 'py-3'}`}>
                        <input
                          type={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(key, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((column) => {
                      const value = getCellValue(row, column.accessor);
                      const cellContent = column.render
                        ? column.render(value, row, globalIndex)
                        : value;

                      return (
                        <td
                          key={column.id}
                          className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-gray-900 text-${
                            column.align || 'left'
                          } ${column.cellClassName || ''}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalRows ?? sortedData.length)} of{' '}
            {totalRows ?? sortedData.length} results
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-50'
                  } disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaseTable;
