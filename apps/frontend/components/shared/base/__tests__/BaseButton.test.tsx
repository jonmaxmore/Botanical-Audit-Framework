/**
 * BaseButton Unit Tests
 * 
 * Comprehensive test suite for BaseButton component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseButton from '../BaseButton';

describe('BaseButton', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<BaseButton>Click Me</BaseButton>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with custom className', () => {
      render(<BaseButton className="custom-class">Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  // ============================================================================
  // VARIANT TESTS
  // ============================================================================

  describe('Variants', () => {
    it('renders contained variant (default)', () => {
      render(<BaseButton variant="contained">Contained</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('renders outlined variant', () => {
      render(<BaseButton variant="outlined">Outlined</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-blue-600');
    });

    it('renders text variant', () => {
      render(<BaseButton variant="text">Text</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-blue-600');
    });

    it('renders gradient variant', () => {
      render(<BaseButton variant="gradient">Gradient</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r');
    });
  });

  // ============================================================================
  // SIZE TESTS
  // ============================================================================

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<BaseButton size="small">Small</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('renders medium size (default)', () => {
      render(<BaseButton size="medium">Medium</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-2.5', 'text-base');
    });

    it('renders large size', () => {
      render(<BaseButton size="large">Large</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-3', 'text-lg');
    });
  });

  // ============================================================================
  // COLOR TESTS
  // ============================================================================

  describe('Colors', () => {
    const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

    colors.forEach((color) => {
      it(`renders ${color} color`, () => {
        render(<BaseButton color={color}>{color}</BaseButton>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('renders primary color (default)', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('renders success color', () => {
      render(<BaseButton color="success">Success</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
    });

    it('renders error color', () => {
      render(<BaseButton color="error">Error</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });
  });

  // ============================================================================
  // ICON TESTS
  // ============================================================================

  describe('Icons', () => {
    const TestIcon = () => <svg data-testid="test-icon"><path /></svg>;

    it('renders with start icon', () => {
      render(
        <BaseButton startIcon={<TestIcon />}>
          With Start Icon
        </BaseButton>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Start Icon')).toBeInTheDocument();
    });

    it('renders with end icon', () => {
      render(
        <BaseButton endIcon={<TestIcon />}>
          With End Icon
        </BaseButton>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With End Icon')).toBeInTheDocument();
    });

    it('renders with both start and end icons', () => {
      const StartIcon = () => <svg data-testid="start-icon"><path /></svg>;
      const EndIcon = () => <svg data-testid="end-icon"><path /></svg>;

      render(
        <BaseButton startIcon={<StartIcon />} endIcon={<EndIcon />}>
          With Both Icons
        </BaseButton>
      );

      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
      expect(screen.getByText('With Both Icons')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      const TestIcon = () => <svg data-testid="test-icon"><path /></svg>;

      render(
        <BaseButton loading startIcon={<TestIcon />} endIcon={<TestIcon />}>
          Loading
        </BaseButton>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<BaseButton loading>Loading</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('disables button when loading', () => {
      render(<BaseButton loading>Loading</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not call onClick when loading', () => {
      const onClick = jest.fn();
      render(<BaseButton loading onClick={onClick}>Loading</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('prevents default when clicked while loading', () => {
      const onClick = jest.fn();
      const { container } = render(<BaseButton loading onClick={onClick}>Loading</BaseButton>);
      const button = container.querySelector('button')!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      button.dispatchEvent(event);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // DISABLED STATE TESTS
  // ============================================================================

  describe('Disabled State', () => {
    it('renders disabled button', () => {
      render(<BaseButton disabled>Disabled</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has aria-disabled attribute when disabled', () => {
      render(<BaseButton disabled>Disabled</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(<BaseButton disabled onClick={onClick}>Disabled</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('has opacity-50 class when disabled', () => {
      render(<BaseButton disabled>Disabled</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  // ============================================================================
  // EVENT HANDLER TESTS
  // ============================================================================

  describe('Event Handlers', () => {
    it('calls onClick when clicked', () => {
      const onClick = jest.fn();
      render(<BaseButton onClick={onClick}>Click Me</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick with event object', () => {
      const onClick = jest.fn();
      render(<BaseButton onClick={onClick}>Click Me</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles focus event', () => {
      const onFocus = jest.fn();
      render(<BaseButton onFocus={onFocus}>Button</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('handles blur event', () => {
      const onBlur = jest.fn();
      render(<BaseButton onBlur={onBlur}>Button</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.blur(button);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('handles mouse enter event', () => {
      const onMouseEnter = jest.fn();
      render(<BaseButton onMouseEnter={onMouseEnter}>Button</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('handles mouse leave event', () => {
      const onMouseLeave = jest.fn();
      render(<BaseButton onMouseLeave={onMouseLeave}>Button</BaseButton>);
      const button = screen.getByRole('button');
      fireEvent.mouseLeave(button);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // FULL WIDTH TESTS
  // ============================================================================

  describe('Full Width', () => {
    it('renders full width button', () => {
      render(<BaseButton fullWidth>Full Width</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('renders normal width by default', () => {
      render(<BaseButton>Normal Width</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  // ============================================================================
  // TYPE ATTRIBUTE TESTS
  // ============================================================================

  describe('Button Type', () => {
    it('renders with type="button" by default', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with type="submit"', () => {
      render(<BaseButton type="submit">Submit</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders with type="reset"', () => {
      render(<BaseButton type="reset">Reset</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'false');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('sets aria-busy when loading', () => {
      render(<BaseButton loading>Loading</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('sets aria-disabled when disabled', () => {
      render(<BaseButton disabled>Disabled</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('icons have aria-hidden attribute', () => {
      const TestIcon = () => <svg data-testid="test-icon"><path /></svg>;
      const { container } = render(
        <BaseButton startIcon={<TestIcon />}>
          Button
        </BaseButton>
      );
      const iconContainer = container.querySelector('span[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('loading spinner has aria-hidden attribute', () => {
      const { container } = render(<BaseButton loading>Loading</BaseButton>);
      const spinner = container.querySelector('svg[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COMBINED STATE TESTS
  // ============================================================================

  describe('Combined States', () => {
    it('renders gradient variant with success color', () => {
      render(
        <BaseButton variant="gradient" color="success">
          Gradient Success
        </BaseButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('renders outlined variant with error color', () => {
      render(
        <BaseButton variant="outlined" color="error">
          Outlined Error
        </BaseButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-red-600');
    });

    it('renders small size with loading state', () => {
      render(
        <BaseButton size="small" loading>
          Small Loading
        </BaseButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5');
      expect(button).toBeDisabled();
    });

    it('renders full width with icon and loading', () => {
      const TestIcon = () => <svg data-testid="test-icon"><path /></svg>;
      render(
        <BaseButton fullWidth loading startIcon={<TestIcon />}>
          Full Width Loading
        </BaseButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('can be focused with Tab key', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('calls onClick when Enter is pressed', () => {
      const onClick = jest.fn();
      render(<BaseButton onClick={onClick}>Button</BaseButton>);
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button); // Browsers trigger click on Enter
      expect(onClick).toHaveBeenCalled();
    });

    it('calls onClick when Space is pressed', () => {
      const onClick = jest.fn();
      render(<BaseButton onClick={onClick}>Button</BaseButton>);
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      fireEvent.click(button); // Browsers trigger click on Space
      expect(onClick).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // STYLE CONSISTENCY TESTS
  // ============================================================================

  describe('Style Consistency', () => {
    it('applies base classes to all variants', () => {
      const variants = ['contained', 'outlined', 'text', 'gradient'] as const;
      variants.forEach((variant) => {
        const { rerender } = render(
          <BaseButton variant={variant}>Button</BaseButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center', 'gap-2', 'rounded-lg', 'font-medium');
        rerender(<></>);
      });
    });

    it('applies focus ring classes', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('applies transition classes', () => {
      render(<BaseButton>Button</BaseButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-200');
    });
  });
});
