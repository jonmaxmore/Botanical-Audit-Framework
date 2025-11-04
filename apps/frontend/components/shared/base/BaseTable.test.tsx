/**
 * BaseTable Component - Unit Tests
 * 
 * Comprehensive test suite covering:
 * - Rendering and basic display
 * - Sorting functionality
 * - Pagination
 * - Row selection (single/multiple)
 * - Loading and empty states
 * - Custom renderers
 * - Row interactions
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseTable, { TableColumn } from './BaseTable';

// ============================================================================
// Test Data
// ============================================================================

interface TestUser {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive';
}

const testUsers: TestUser[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', age: 25, status: 'active' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', age: 30, status: 'active' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 35, status: 'inactive' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 28, status: 'active' },
  { id: 5, name: 'Eve Adams', email: 'eve@example.com', age: 32, status: 'inactive' },
];

const basicColumns: TableColumn<TestUser>[] = [
  { id: 'name', label: 'Name', accessor: 'name' },
  { id: 'email', label: 'Email', accessor: 'email' },
  { id: 'age', label: 'Age', accessor: 'age' },
  { id: 'status', label: 'Status', accessor: 'status' },
];

// ============================================================================
// Test Suite: Rendering
// ============================================================================

describe('BaseTable - Rendering', () => {
  it('renders table with data', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
      />
    );

    // Check table exists
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={[]}
        rowKey="id"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    const customMessage = 'No users found';
    render(
      <BaseTable
        columns={basicColumns}
        data={[]}
        rowKey="id"
        emptyMessage={customMessage}
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        className="custom-table-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-table-class');
  });

  it('renders row numbers when showRowNumbers is true', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        showRowNumbers
      />
    );

    expect(screen.getByText('#')).toBeInTheDocument();
    // First row number
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Column Configuration
// ============================================================================

describe('BaseTable - Column Configuration', () => {
  it('uses custom column width', () => {
    const columnsWithWidth: TableColumn<TestUser>[] = [
      { id: 'name', label: 'Name', accessor: 'name', width: '200px' },
      { id: 'email', label: 'Email', accessor: 'email' },
    ];

    const { container } = render(
      <BaseTable
        columns={columnsWithWidth}
        data={testUsers}
        rowKey="id"
      />
    );

    const nameHeader = container.querySelector('th:first-child');
    expect(nameHeader).toHaveStyle({ width: '200px' });
  });

  it('applies column alignment', () => {
    const columnsWithAlign: TableColumn<TestUser>[] = [
      { id: 'name', label: 'Name', accessor: 'name' },
      { id: 'age', label: 'Age', accessor: 'age', align: 'right' },
    ];

    render(
      <BaseTable
        columns={columnsWithAlign}
        data={testUsers}
        rowKey="id"
      />
    );

    const ageHeader = screen.getByText('Age').parentElement;
    expect(ageHeader).toHaveClass('text-right');
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender: TableColumn<TestUser>[] = [
      { 
        id: 'name', 
        label: 'Name', 
        accessor: 'name',
        render: (value) => <strong data-testid="custom-name">{value}</strong>
      },
    ];

    render(
      <BaseTable
        columns={columnsWithRender}
        data={testUsers.slice(0, 1)}
        rowKey="id"
      />
    );

    const customElement = screen.getByTestId('custom-name');
    expect(customElement).toBeInTheDocument();
    expect(customElement.tagName).toBe('STRONG');
    expect(customElement).toHaveTextContent('Alice Smith');
  });

  it('uses accessor function', () => {
    const columnsWithAccessor: TableColumn<TestUser>[] = [
      { 
        id: 'fullInfo', 
        label: 'Full Info', 
        accessor: (row) => `${row.name} (${row.age})`,
      },
    ];

    render(
      <BaseTable
        columns={columnsWithAccessor}
        data={testUsers.slice(0, 1)}
        rowKey="id"
      />
    );

    expect(screen.getByText('Alice Smith (25)')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Sorting
// ============================================================================

describe('BaseTable - Sorting', () => {
  it('displays sort indicators when sortable is true', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
      />
    );

    // Check for sort indicator (↕)
    const nameHeader = screen.getByText('Name').parentElement;
    expect(nameHeader).toHaveTextContent('↕');
  });

  it('sorts data ascending on first click', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
      />
    );

    const nameHeader = screen.getByText('Name').parentElement!;
    fireEvent.click(nameHeader);

    // After ascending sort: Alice, Bob, Charlie, Diana, Eve
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Alice Smith')).toBeInTheDocument();
  });

  it('sorts data descending on second click', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
      />
    );

    const nameHeader = screen.getByText('Name').parentElement!;
    fireEvent.click(nameHeader); // Ascending
    fireEvent.click(nameHeader); // Descending

    // After descending sort: Eve, Diana, Charlie, Bob, Alice
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Eve Adams')).toBeInTheDocument();
  });

  it('clears sort on third click', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
      />
    );

    const nameHeader = screen.getByText('Name').parentElement!;
    fireEvent.click(nameHeader); // Ascending
    fireEvent.click(nameHeader); // Descending
    fireEvent.click(nameHeader); // Clear

    // Should show original order
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Alice Smith')).toBeInTheDocument();
  });

  it('calls onSortChange callback', () => {
    const onSortChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
        onSortChange={onSortChange}
      />
    );

    const nameHeader = screen.getByText('Name').parentElement!;
    fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      columnId: 'name',
      direction: 'asc',
    });
  });

  it('sorts by column-specific sortable property', () => {
    const columnsWithSortable: TableColumn<TestUser>[] = [
      { id: 'name', label: 'Name', accessor: 'name', sortable: true },
      { id: 'email', label: 'Email', accessor: 'email', sortable: false },
    ];

    render(
      <BaseTable
        columns={columnsWithSortable}
        data={testUsers}
        rowKey="id"
      />
    );

    const nameHeader = screen.getByText('Name').parentElement!;
    const emailHeader = screen.getByText('Email').parentElement!;

    // Name should have sort indicator
    expect(nameHeader).toHaveTextContent('↕');
    // Email should not have sort indicator
    expect(emailHeader).not.toHaveTextContent('↕');
  });
});

// ============================================================================
// Test Suite: Pagination
// ============================================================================

describe('BaseTable - Pagination', () => {
  it('displays pagination controls when pagination is true', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText(/Showing 1 to 2 of 5 results/)).toBeInTheDocument();
  });

  it('shows correct number of rows per page', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    // Should show 2 data rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header + 2 data rows
  });

  it('navigates to next page', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Page 2 should show Charlie and Diana
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    // Page 1 data should not be visible
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('navigates to previous page', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    const nextButton = screen.getByText('Next');
    const prevButton = screen.getByText('Previous');

    fireEvent.click(nextButton); // Go to page 2
    fireEvent.click(prevButton); // Go back to page 1

    // Page 1 should show Alice and Bob
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    // Navigate to last page (page 3 for 5 items with pageSize 2)
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange callback', () => {
    const onPageChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders page number buttons', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    // Should have page buttons 1, 2, 3
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('clicks on page number button', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
      />
    );

    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);

    // Should show Eve (last item on page 3)
    expect(screen.getByText('Eve Adams')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Row Selection
// ============================================================================

describe('BaseTable - Row Selection', () => {
  it('does not show selection column when selectionMode is none', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="none"
      />
    );

    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });

  it('shows checkboxes when selectionMode is multiple', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[]}
        onSelectionChange={jest.fn()}
      />
    );

    // Should have 1 header checkbox + 5 row checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);
  });

  it('shows radio buttons when selectionMode is single', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="single"
        selectedRows={[]}
        onSelectionChange={jest.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('selects a single row', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="single"
        selectedRows={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const firstRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(firstRadio);

    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('selects multiple rows', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First data row

    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('deselects a row', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[1, 2]}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Deselect first row

    expect(onSelectionChange).toHaveBeenCalledWith([2]);
  });

  it('selects all rows with header checkbox', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
  });

  it('deselects all rows with header checkbox', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[1, 2, 3, 4, 5]}
        onSelectionChange={onSelectionChange}
      />
    );

    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });
});

// ============================================================================
// Test Suite: Row Interactions
// ============================================================================

describe('BaseTable - Row Interactions', () => {
  it('calls onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        onRowClick={onRowClick}
      />
    );

    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[1]); // First data row

    expect(onRowClick).toHaveBeenCalledWith(testUsers[0], 0);
  });

  it('applies hoverable class when hoverable is true', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        hoverable
      />
    );

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveClass('hover:bg-gray-50');
  });

  it('applies cursor-pointer class when onRowClick is provided', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        onRowClick={jest.fn()}
      />
    );

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveClass('cursor-pointer');
  });

  it('highlights selected row', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="single"
        selectedRows={[1]}
        onSelectionChange={jest.fn()}
      />
    );

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveClass('bg-blue-50');
  });
});

// ============================================================================
// Test Suite: Table Variants
// ============================================================================

describe('BaseTable - Variants', () => {
  it('applies striped variant', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        variant="striped"
      />
    );

    const rows = screen.getAllByRole('row');
    // Second data row (index 2) should have striped class
    expect(rows[2]).toHaveClass('bg-gray-50');
  });

  it('applies bordered variant', () => {
    const { container } = render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        variant="bordered"
      />
    );

    const tableContainer = container.querySelector('.overflow-x-auto');
    expect(tableContainer).toHaveClass('border-gray-300');
  });

  it('applies compact mode', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        compact
      />
    );

    const rows = screen.getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(cells[0]).toHaveClass('py-2');
  });
});

// ============================================================================
// Test Suite: Complex Scenarios
// ============================================================================

describe('BaseTable - Complex Scenarios', () => {
  it('handles sorting with pagination', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        sortable
        pagination
        pageSize={2}
      />
    );

    // Sort by name
    const nameHeader = screen.getByText('Name').parentElement!;
    fireEvent.click(nameHeader);

    // Page 1 should show Alice and Bob (alphabetically sorted)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('handles selection with pagination', () => {
    const onSelectionChange = jest.fn();

    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        selectionMode="multiple"
        selectedRows={[]}
        onSelectionChange={onSelectionChange}
        pagination
        pageSize={2}
      />
    );

    // Select items on page 1
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox);

    // Should only select visible rows (1, 2)
    expect(onSelectionChange).toHaveBeenCalledWith([1, 2]);
  });

  it('maintains row numbers across pages', () => {
    render(
      <BaseTable
        columns={basicColumns}
        data={testUsers}
        rowKey="id"
        pagination
        pageSize={2}
        showRowNumbers
      />
    );

    // Navigate to page 2
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Row numbers should be 3 and 4
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
