import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BasePagination from './BasePagination';

describe('BasePagination', () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
    mockOnPageSizeChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders pagination controls', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
    });

    it('renders page buttons', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    });

    it('renders first/last buttons by default', () => {
      render(
        <BasePagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(screen.getByLabelText('First')).toBeInTheDocument();
      expect(screen.getByLabelText('Last')).toBeInTheDocument();
    });

    it('hides first/last buttons when showFirstLast is false', () => {
      render(
        <BasePagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showFirstLast={false}
        />
      );
      
      expect(screen.queryByLabelText('First')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Last')).not.toBeInTheDocument();
    });

    it('renders total items count when showTotal is true', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showTotal
        />
      );
      
      expect(screen.getByText(/Showing 1 to 10 of 100 items/i)).toBeInTheDocument();
    });

    it('hides total items when showTotal is false', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showTotal={false}
        />
      );
      
      expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
    });

    it('renders page size selector when showPageSize is true', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          showPageSize
        />
      );
      
      expect(screen.getByLabelText('Items per page:')).toBeInTheDocument();
    });

    it('renders jump to page input when showJumpTo is true', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
        />
      );
      
      expect(screen.getByLabelText('Jump to:')).toBeInTheDocument();
      expect(screen.getByText('Go')).toBeInTheDocument();
    });

    it('renders nothing when totalItems is 0', () => {
      const { container } = render(
        <BasePagination
          currentPage={1}
          totalItems={0}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Page Navigation', () => {
    it('calls onPageChange when page button is clicked', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const page2Button = screen.getByLabelText('Page 2');
      fireEvent.click(page2Button);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when next button is clicked', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const nextButton = screen.getByLabelText('Next');
      fireEvent.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when previous button is clicked', () => {
      render(
        <BasePagination
          currentPage={2}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const prevButton = screen.getByLabelText('Previous');
      fireEvent.click(prevButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange when first button is clicked', () => {
      render(
        <BasePagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const firstButton = screen.getByLabelText('First');
      fireEvent.click(firstButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange when last button is clicked', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const lastButton = screen.getByLabelText('Last');
      fireEvent.click(lastButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(10);
    });

    it('disables previous button on first page', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const prevButton = screen.getByLabelText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(
        <BasePagination
          currentPage={10}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const nextButton = screen.getByLabelText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('does not call onPageChange when disabled', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          disabled
        />
      );
      
      const page2Button = screen.getByLabelText('Page 2');
      fireEvent.click(page2Button);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Size Change', () => {
    it('calls onPageSizeChange when page size is changed', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          showPageSize
        />
      );
      
      const select = screen.getByLabelText('Items per page:');
      fireEvent.change(select, { target: { value: '20' } });
      
      expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
    });

    it('renders page size options', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          pageSizeOptions={[5, 10, 25, 50]}
          showPageSize
        />
      );
      
      const select = screen.getByLabelText('Items per page:');
      expect(select).toHaveValue('10');
      
      const options = select.querySelectorAll('option');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('5');
      expect(options[1]).toHaveValue('10');
      expect(options[2]).toHaveValue('25');
      expect(options[3]).toHaveValue('50');
    });
  });

  describe('Jump To Page', () => {
    it('jumps to page when go button is clicked', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
        />
      );
      
      const input = screen.getByLabelText('Jump to:');
      const goButton = screen.getByText('Go');
      
      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.click(goButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(5);
    });

    it('jumps to page when Enter key is pressed', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
        />
      );
      
      const input = screen.getByLabelText('Jump to:');
      
      fireEvent.change(input, { target: { value: '7' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnPageChange).toHaveBeenCalledWith(7);
    });

    it('clears input after jumping to page', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
        />
      );
      
      const input = screen.getByLabelText('Jump to:') as HTMLInputElement;
      const goButton = screen.getByText('Go');
      
      fireEvent.change(input, { target: { value: '3' } });
      fireEvent.click(goButton);
      
      expect(input.value).toBe('');
    });

    it('does not jump to invalid page number', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
        />
      );
      
      const input = screen.getByLabelText('Jump to:');
      const goButton = screen.getByText('Go');
      
      fireEvent.change(input, { target: { value: '99' } });
      fireEvent.click(goButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Calculation', () => {
    it('calculates correct total pages', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      // Should have 10 pages total
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
    });

    it('calculates correct current range', () => {
      render(
        <BasePagination
          currentPage={2}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showTotal
        />
      );
      
      expect(screen.getByText(/Showing 11 to 20 of 100 items/i)).toBeInTheDocument();
    });

    it('handles last page range correctly', () => {
      render(
        <BasePagination
          currentPage={10}
          totalItems={95}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showTotal
        />
      );
      
      expect(screen.getByText(/Showing 91 to 95 of 95 items/i)).toBeInTheDocument();
    });
  });

  describe('Page Number Generation', () => {
    it('shows all pages when total pages is less than maxPageButtons', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={50}
          pageSize={10}
          onPageChange={mockOnPageChange}
          maxPageButtons={7}
        />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
    });

    it('shows ellipsis when there are many pages', () => {
      render(
        <BasePagination
          currentPage={10}
          totalItems={200}
          pageSize={10}
          onPageChange={mockOnPageChange}
          maxPageButtons={7}
        />
      );
      
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('always shows first and last page', () => {
      render(
        <BasePagination
          currentPage={10}
          totalItems={200}
          pageSize={10}
          onPageChange={mockOnPageChange}
          maxPageButtons={7}
        />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies default variant classes', () => {
      const { container } = render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          variant="default"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('border');
    });

    it('applies minimal variant classes', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          variant="minimal"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('bg-primary-100');
    });

    it('applies compact variant classes', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          variant="compact"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('bg-primary-600');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          size="small"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('h-8');
    });

    it('applies medium size classes', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          size="medium"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('h-10');
    });

    it('applies large size classes', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          size="large"
        />
      );
      
      const button = screen.getByLabelText('Page 1');
      expect(button).toHaveClass('h-12');
    });
  });

  describe('Custom Labels', () => {
    it('uses custom labels', () => {
      const customLabels = {
        previous: 'Prev',
        next: 'Next Page',
        first: 'Start',
        last: 'End',
        showing: 'Displaying',
      };

      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          labels={customLabels}
          showTotal
        />
      );
      
      expect(screen.getByLabelText('Prev')).toBeInTheDocument();
      expect(screen.getByLabelText('Next Page')).toBeInTheDocument();
      expect(screen.getByLabelText('Start')).toBeInTheDocument();
      expect(screen.getByLabelText('End')).toBeInTheDocument();
      expect(screen.getByText(/Displaying/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables all buttons when disabled', () => {
      render(
        <BasePagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          disabled
        />
      );
      
      const prevButton = screen.getByLabelText('Previous');
      const nextButton = screen.getByLabelText('Next');
      const pageButton = screen.getByLabelText('Page 1');
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(pageButton).toBeDisabled();
    });

    it('disables page size selector when disabled', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          showPageSize
          disabled
        />
      );
      
      const select = screen.getByLabelText('Items per page:');
      expect(select).toBeDisabled();
    });

    it('disables jump to page when disabled', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          showJumpTo
          disabled
        />
      );
      
      const input = screen.getByLabelText('Jump to:');
      const goButton = screen.getByText('Go');
      
      expect(input).toBeDisabled();
      expect(goButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label on page buttons', () => {
      render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    });

    it('has aria-current on active page', () => {
      render(
        <BasePagination
          currentPage={3}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      const activePage = screen.getByLabelText('Page 3');
      expect(activePage).toHaveAttribute('aria-current', 'page');
    });

    it('has correct labels on navigation buttons', () => {
      render(
        <BasePagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      
      expect(screen.getByLabelText('First')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
      expect(screen.getByLabelText('Last')).toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      const { container } = render(
        <BasePagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
          className="custom-pagination"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-pagination');
    });
  });
});
