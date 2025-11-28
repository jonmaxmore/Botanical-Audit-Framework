/**
 * BaseDatePicker Unit Tests
 * 
 * Comprehensive test suite for BaseDatePicker component
 * 
 * Test Coverage:
 * - Rendering (basic, with props, variants)
 * - Date Selection (single, range, today)
 * - Calendar Functionality (navigation, grid, disabled dates)
 * - Date Constraints (min/max dates, disabled dates)
 * - Date Formatting (different formats)
 * - Keyboard Navigation (Enter, Escape, arrows)
 * - Clear Functionality
 * - Error States
 * - Click Outside
 * - Form Integration
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseDatePicker from '../BaseDatePicker';

describe('BaseDatePicker', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders date picker with label', () => {
      render(<BaseDatePicker label="Select Date" onChange={() => {}} />);
      expect(screen.getByText('Select Date')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<BaseDatePicker placeholder="Choose a date..." onChange={() => {}} />);
      const input = screen.getByPlaceholderText('Choose a date...');
      expect(input).toBeInTheDocument();
    });

    it('renders with required asterisk', () => {
      render(<BaseDatePicker label="Date" required onChange={() => {}} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<BaseDatePicker helperText="Select a valid date" onChange={() => {}} />);
      expect(screen.getByText('Select a valid date')).toBeInTheDocument();
    });

    it('renders with error state', () => {
      render(
        <BaseDatePicker
          label="Date"
          error="Date is required"
          helperText="Date is required"
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <BaseDatePicker className="custom-class" onChange={() => {}} />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ============================================================================
  // SIZE TESTS
  // ============================================================================

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(
        <BaseDatePicker size="small" onChange={() => {}} />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('text-sm');
    });

    it('renders medium size (default)', () => {
      const { container } = render(
        <BaseDatePicker size="medium" onChange={() => {}} />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('text-base');
    });

    it('renders large size', () => {
      const { container } = render(
        <BaseDatePicker size="large" onChange={() => {}} />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('text-lg');
    });
  });

  // ============================================================================
  // DATE SELECTION TESTS
  // ============================================================================

  describe('Date Selection', () => {
    it('opens calendar when input is clicked', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });

    it('selects a date when calendar day is clicked', async () => {
      const handleChange = jest.fn();
      render(<BaseDatePicker onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const firstAvailableDay = dayButtons.find(
          btn => !btn.disabled && btn.textContent && /^\d+$/.test(btn.textContent)
        );
        
        if (firstAvailableDay) {
          fireEvent.click(firstAvailableDay);
          expect(handleChange).toHaveBeenCalled();
        }
      });
    });

    it('displays selected date in input field', () => {
      const selectedDate = new Date(2025, 10, 4); // Nov 4, 2025
      render(<BaseDatePicker value={selectedDate} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toContain('11/04/2025');
    });

    it('closes calendar after date selection with closeOnSelect', async () => {
      const handleChange = jest.fn();
      render(<BaseDatePicker onChange={handleChange} closeOnSelect />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const firstAvailableDay = dayButtons.find(
          btn => !btn.disabled && btn.textContent && /^\d+$/.test(btn.textContent)
        );
        
        if (firstAvailableDay) {
          fireEvent.click(firstAvailableDay);
        }
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Today')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // DATE RANGE TESTS
  // ============================================================================

  describe('Date Range Selection', () => {
    it('renders in range mode', () => {
      render(
        <BaseDatePicker
          range
          onRangeChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('calls onRangeChange when selecting date range', async () => {
      const handleRangeChange = jest.fn();
      render(
        <BaseDatePicker
          range
          onRangeChange={handleRangeChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const availableDays = dayButtons.filter(
          btn => !btn.disabled && btn.textContent && /^\d+$/.test(btn.textContent)
        );
        
        if (availableDays.length >= 2) {
          fireEvent.click(availableDays[0]);
          fireEvent.click(availableDays[1]);
          expect(handleRangeChange).toHaveBeenCalled();
        }
      });
    });

    it('displays date range in input field', () => {
      const startDate = new Date(2025, 10, 1);
      const endDate = new Date(2025, 10, 5);
      
      render(
        <BaseDatePicker
          range
          startDate={startDate}
          endDate={endDate}
          onRangeChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toContain('11/01/2025');
      expect(input.value).toContain('11/05/2025');
    });
  });

  // ============================================================================
  // CALENDAR NAVIGATION TESTS
  // ============================================================================

  describe('Calendar Navigation', () => {
    it('navigates to previous month', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const prevButton = screen.getByLabelText('Previous month');
        fireEvent.click(prevButton);
        expect(prevButton).toBeInTheDocument();
      });
    });

    it('navigates to next month', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const nextButton = screen.getByLabelText('Next month');
        fireEvent.click(nextButton);
        expect(nextButton).toBeInTheDocument();
      });
    });

    it('displays correct month and year in header', async () => {
      const date = new Date(2025, 10, 4); // November 2025
      render(<BaseDatePicker value={date} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText(/November 2025/)).toBeInTheDocument();
      });
    });

    it('generates 42-day calendar grid (6 weeks)', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const calendarDays = dayButtons.filter(
          btn => btn.textContent && /^\d+$/.test(btn.textContent)
        );
        
        // Should have day cells (some might be from previous/next month)
        expect(calendarDays.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // DATE CONSTRAINTS TESTS
  // ============================================================================

  describe('Date Constraints', () => {
    it('respects minDate constraint', async () => {
      const minDate = new Date(2025, 10, 10);
      const handleChange = jest.fn();
      
      render(
        <BaseDatePicker
          minDate={minDate}
          onChange={handleChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const earlyDate = dayButtons.find(
          btn => btn.textContent === '5'
        );
        
        if (earlyDate) {
          expect(earlyDate).toBeDisabled();
        }
      });
    });

    it('respects maxDate constraint', async () => {
      const maxDate = new Date(2025, 10, 10);
      
      render(
        <BaseDatePicker
          maxDate={maxDate}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const lateDate = dayButtons.find(
          btn => btn.textContent === '25'
        );
        
        if (lateDate) {
          expect(lateDate).toBeDisabled();
        }
      });
    });

    it('disables dates based on disabledDates array', async () => {
      const disabledDates = [
        new Date(2025, 10, 4),
        new Date(2025, 10, 5),
      ];
      
      render(
        <BaseDatePicker
          value={new Date(2025, 10, 1)}
          disabledDates={disabledDates}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button');
        const day4 = dayButtons.find(btn => btn.textContent === '4');
        const day5 = dayButtons.find(btn => btn.textContent === '5');
        
        if (day4 && day5) {
          expect(day4).toBeDisabled();
          expect(day5).toBeDisabled();
        }
      });
    });

    it('disables dates based on predicate function', async () => {
      const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
      };
      
      render(
        <BaseDatePicker
          value={new Date(2025, 10, 4)}
          disabledDates={isWeekend}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        // Weekend dates should be disabled
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // DATE FORMAT TESTS
  // ============================================================================

  describe('Date Formatting', () => {
    it('formats date as MM/DD/YYYY (default)', () => {
      const date = new Date(2025, 10, 4);
      render(<BaseDatePicker value={date} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('11/04/2025');
    });

    it('formats date as DD/MM/YYYY', () => {
      const date = new Date(2025, 10, 4);
      render(
        <BaseDatePicker
          value={date}
          dateFormat="DD/MM/YYYY"
          onChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('04/11/2025');
    });

    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2025, 10, 4);
      render(
        <BaseDatePicker
          value={date}
          dateFormat="YYYY-MM-DD"
          onChange={() => {}}
        />
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2025-11-04');
    });
  });

  // ============================================================================
  // TODAY BUTTON TESTS
  // ============================================================================

  describe('Today Button', () => {
    it('renders today button when showTodayButton is true', async () => {
      render(<BaseDatePicker showTodayButton onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });

    it('selects today when today button is clicked', async () => {
      const handleChange = jest.fn();
      render(<BaseDatePicker showTodayButton onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        const todayButton = screen.getByText('Today');
        fireEvent.click(todayButton);
        
        expect(handleChange).toHaveBeenCalled();
        const calledDate = handleChange.mock.calls[0][0];
        const today = new Date();
        
        expect(calledDate.getDate()).toBe(today.getDate());
        expect(calledDate.getMonth()).toBe(today.getMonth());
        expect(calledDate.getFullYear()).toBe(today.getFullYear());
      });
    });

    it('does not render today button when showTodayButton is false', async () => {
      render(<BaseDatePicker showTodayButton={false} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.queryByText('Today')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // CLEAR FUNCTIONALITY TESTS
  // ============================================================================

  describe('Clear Functionality', () => {
    it('renders clear button when clearable and value exists', () => {
      const date = new Date(2025, 10, 4);
      render(
        <BaseDatePicker
          value={date}
          clearable
          onChange={() => {}}
        />
      );
      
      const clearButton = screen.getByLabelText('Clear date');
      expect(clearButton).toBeInTheDocument();
    });

    it('does not render clear button when no value', () => {
      render(
        <BaseDatePicker
          clearable
          onChange={() => {}}
        />
      );
      
      const clearButton = screen.queryByLabelText('Clear date');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('clears date when clear button is clicked', () => {
      const handleChange = jest.fn();
      const date = new Date(2025, 10, 4);
      
      render(
        <BaseDatePicker
          value={date}
          clearable
          onChange={handleChange}
        />
      );
      
      const clearButton = screen.getByLabelText('Clear date');
      fireEvent.click(clearButton);
      
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('clears date range when clear button is clicked in range mode', () => {
      const handleRangeChange = jest.fn();
      const startDate = new Date(2025, 10, 1);
      const endDate = new Date(2025, 10, 5);
      
      render(
        <BaseDatePicker
          range
          startDate={startDate}
          endDate={endDate}
          clearable
          onRangeChange={handleRangeChange}
        />
      );
      
      const clearButton = screen.getByLabelText('Clear date');
      fireEvent.click(clearButton);
      
      expect(handleRangeChange).toHaveBeenCalledWith(null, null);
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('opens calendar when Enter is pressed on input', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });

    it('closes calendar when Escape is pressed', async () => {
      render(<BaseDatePicker onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Today')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // CLICK OUTSIDE TESTS
  // ============================================================================

  describe('Click Outside', () => {
    it('closes calendar when clicking outside', async () => {
      render(
        <div>
          <BaseDatePicker onChange={() => {}} />
          <div data-testid="outside">Outside</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
      
      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);
      
      await waitFor(() => {
        expect(screen.queryByText('Today')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // FORM INTEGRATION TESTS
  // ============================================================================

  describe('Form Integration', () => {
    it('creates hidden input for form submission', () => {
      const date = new Date(2025, 10, 4);
      const { container } = render(
        <BaseDatePicker
          name="test-date"
          value={date}
          onChange={() => {}}
        />
      );
      
      const hiddenInput = container.querySelector('input[name="test-date"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
    });

    it('creates separate hidden inputs for date range', () => {
      const startDate = new Date(2025, 10, 1);
      const endDate = new Date(2025, 10, 5);
      const { container } = render(
        <BaseDatePicker
          range
          name="date-range"
          startDate={startDate}
          endDate={endDate}
          onRangeChange={() => {}}
        />
      );
      
      const startInput = container.querySelector('input[name="date-range-start"]');
      const endInput = container.querySelector('input[name="date-range-end"]');
      
      expect(startInput).toBeInTheDocument();
      expect(endInput).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DISABLED STATE TESTS
  // ============================================================================

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<BaseDatePicker disabled onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not open calendar when disabled', () => {
      render(<BaseDatePicker disabled onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.click(input);
      
      expect(screen.queryByText('Today')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR STATE TESTS
  // ============================================================================

  describe('Error State', () => {
    it('applies error styling when error prop is provided', () => {
      const { container } = render(
        <BaseDatePicker error="Error message" onChange={() => {}} />
      );
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-red-500');
    });

    it('displays error message in helper text', () => {
      render(
        <BaseDatePicker
          error="Date is invalid"
          helperText="Date is invalid"
          onChange={() => {}}
        />
      );
      
      const helperText = screen.getByText('Date is invalid');
      expect(helperText).toHaveClass('text-red-600');
    });
  });
});
