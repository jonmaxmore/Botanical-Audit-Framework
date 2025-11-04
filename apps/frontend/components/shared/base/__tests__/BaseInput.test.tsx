/**
 * BaseInput Unit Tests
 * 
 * Comprehensive test suite for BaseInput component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseInput from '../BaseInput';

describe('BaseInput', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders input with placeholder', () => {
      render(<BaseInput placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<BaseInput label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<BaseInput helperText="This is a hint" />);
      expect(screen.getByText('This is a hint')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<BaseInput label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INPUT TYPES
  // ============================================================================

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<BaseInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(<BaseInput type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<BaseInput type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<BaseInput type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input', () => {
      render(<BaseInput type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(<BaseInput type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders search input', () => {
      render(<BaseInput type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  // ============================================================================
  // TEXTAREA/MULTILINE
  // ============================================================================

  describe('Multiline/Textarea', () => {
    it('renders textarea when multiline is true', () => {
      render(<BaseInput multiline />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('applies rows prop to textarea', () => {
      render(<BaseInput multiline rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('uses default rows for textarea', () => {
      render(<BaseInput multiline />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '3');
    });
  });

  // ============================================================================
  // SIZE VARIANTS
  // ============================================================================

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<BaseInput size="small" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('applies medium size classes (default)', () => {
      render(<BaseInput size="medium" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('applies large size classes', () => {
      render(<BaseInput size="large" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-5', 'py-3', 'text-lg');
    });
  });

  // ============================================================================
  // VALIDATION STATES
  // ============================================================================

  describe('Validation States', () => {
    it('applies default state classes', () => {
      render(<BaseInput state="default" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
    });

    it('applies success state classes', () => {
      render(<BaseInput state="success" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-500');
    });

    it('applies error state classes', () => {
      render(<BaseInput state="error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('applies warning state classes', () => {
      render(<BaseInput state="warning" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-yellow-500');
    });

    it('automatically sets error state when error prop provided', () => {
      render(<BaseInput error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('automatically sets success state when success prop provided', () => {
      render(<BaseInput success="Success message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-500');
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ICONS
  // ============================================================================

  describe('Icons', () => {
    it('renders start icon', () => {
      const StartIcon = () => <span data-testid="start-icon">Icon</span>;
      render(<BaseInput startIcon={<StartIcon />} />);
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      const EndIcon = () => <span data-testid="end-icon">Icon</span>;
      render(<BaseInput endIcon={<EndIcon />} />);
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    it('renders both start and end icons', () => {
      const StartIcon = () => <span data-testid="start-icon">Start</span>;
      const EndIcon = () => <span data-testid="end-icon">End</span>;
      render(
        <BaseInput
          startIcon={<StartIcon />}
          endIcon={<EndIcon />}
        />
      );
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    it('applies left padding when start icon present', () => {
      const StartIcon = () => <span>Icon</span>;
      render(<BaseInput startIcon={<StartIcon />} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('applies right padding when end icon present', () => {
      const EndIcon = () => <span>Icon</span>;
      render(<BaseInput endIcon={<EndIcon />} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });
  });

  // ============================================================================
  // DISABLED STATE
  // ============================================================================

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<BaseInput disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<BaseInput disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('applies disabled label style', () => {
      render(<BaseInput label="Disabled" disabled />);
      const label = screen.getByText('Disabled');
      expect(label).toHaveClass('text-gray-400');
    });
  });

  // ============================================================================
  // FULL WIDTH
  // ============================================================================

  describe('Full Width', () => {
    it('applies full width to container', () => {
      const { container } = render(<BaseInput fullWidth />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-full');
    });

    it('input always has w-full class', () => {
      render(<BaseInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });
  });

  // ============================================================================
  // CHARACTER COUNT
  // ============================================================================

  describe('Character Count', () => {
    it('shows character count when showCount and maxLength provided', () => {
      render(<BaseInput value="test" maxLength={10} showCount />);
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });

    it('does not show count without maxLength', () => {
      render(<BaseInput value="test" showCount />);
      expect(screen.queryByText('4/')).not.toBeInTheDocument();
    });

    it('does not show count without showCount', () => {
      render(<BaseInput value="test" maxLength={10} />);
      expect(screen.queryByText('4/10')).not.toBeInTheDocument();
    });

    it('applies warning color when near limit', () => {
      render(<BaseInput value="123456789" maxLength={10} showCount />);
      const count = screen.getByText('9/10');
      expect(count).toHaveClass('text-red-600');
    });

    it('shows 0 count for empty input', () => {
      render(<BaseInput value="" maxLength={10} showCount />);
      expect(screen.getByText('0/10')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VALUE AND CHANGE HANDLING
  // ============================================================================

  describe('Value and Change Handling', () => {
    it('displays provided value', () => {
      render(<BaseInput value="test value" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('calls onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<BaseInput onChange={onChange} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('respects maxLength attribute', () => {
      render(<BaseInput maxLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '5');
    });
  });

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================

  describe('Accessibility', () => {
    it('associates label with input using htmlFor', () => {
      render(<BaseInput label="Username" id="username-input" />);
      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'username-input');
      expect(input).toHaveAttribute('id', 'username-input');
    });

    it('generates unique ID when not provided', () => {
      render(<BaseInput label="Test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
    });

    it('sets aria-invalid on error state', () => {
      render(<BaseInput error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby when helper text present', () => {
      render(<BaseInput helperText="Helper" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });

    it('helper text has correct ID', () => {
      render(<BaseInput helperText="Helper" id="test-input" />);
      const helper = screen.getByText('Helper');
      expect(helper).toHaveAttribute('id', 'test-input-helper');
    });
  });

  // ============================================================================
  // COMBINED FEATURES
  // ============================================================================

  describe('Combined Features', () => {
    it('renders input with all features', () => {
      const StartIcon = () => <span data-testid="start">Start</span>;
      const EndIcon = () => <span data-testid="end">End</span>;
      
      render(
        <BaseInput
          type="email"
          size="large"
          label="Email"
          placeholder="Enter email"
          helperText="We'll never share your email"
          required
          startIcon={<StartIcon />}
          endIcon={<EndIcon />}
          fullWidth
          value="test@example.com"
          maxLength={50}
          showCount
        />
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
      expect(screen.getByTestId('start')).toBeInTheDocument();
      expect(screen.getByTestId('end')).toBeInTheDocument();
      expect(screen.getByText('18/50')).toBeInTheDocument();
    });

    it('renders multiline with error and count', () => {
      render(
        <BaseInput
          multiline
          rows={4}
          label="Description"
          error="Too short"
          value="Test"
          maxLength={100}
          showCount
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '4');
      expect(screen.getByText('Too short')).toBeInTheDocument();
      expect(screen.getByText('4/100')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CUSTOM PROPS
  // ============================================================================

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<BaseInput className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('forwards other HTML attributes', () => {
      render(
        <BaseInput
          name="test-input"
          autoComplete="off"
          readOnly
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'test-input');
      expect(input).toHaveAttribute('autoComplete', 'off');
      expect(input).toHaveAttribute('readOnly');
    });

    it('applies min and max for number input', () => {
      render(<BaseInput type="number" min={0} max={100} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });
  });

  // ============================================================================
  // REF FORWARDING
  // ============================================================================

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<BaseInput ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('forwards ref to textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<BaseInput multiline ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
