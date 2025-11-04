/**
 * BaseBadge Component Tests
 * 
 * Test Coverage:
 * 1. Rendering & Display
 * 2. Variants & Colors
 * 3. Sizes
 * 4. Icons
 * 5. Dots
 * 6. Removable Functionality
 * 7. Clickable Functionality
 * 8. Accessibility
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseBadge from './BaseBadge';

// ============================================================================
// Test Suite 1: Rendering & Display
// ============================================================================

describe('BaseBadge - Rendering & Display', () => {
  it('renders children content', () => {
    render(<BaseBadge>Test Badge</BaseBadge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    render(<BaseBadge>Default</BaseBadge>);
    const badge = screen.getByText('Default').closest('span');
    expect(badge).toHaveClass('bg-blue-600'); // Primary color
    expect(badge).toHaveClass('text-white'); // Solid variant
  });

  it('applies custom className', () => {
    render(<BaseBadge className="custom-class">Badge</BaseBadge>);
    const badge = screen.getByText('Badge').closest('span');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders as inline-flex element', () => {
    render(<BaseBadge>Inline</BaseBadge>);
    const badge = screen.getByText('Inline').closest('span');
    expect(badge).toHaveClass('inline-flex');
  });
});

// ============================================================================
// Test Suite 2: Variants & Colors
// ============================================================================

describe('BaseBadge - Variants', () => {
  it('renders solid variant', () => {
    render(<BaseBadge variant="solid" color="primary">Solid</BaseBadge>);
    const badge = screen.getByText('Solid').closest('span');
    expect(badge).toHaveClass('bg-blue-600');
    expect(badge).toHaveClass('text-white');
  });

  it('renders outlined variant', () => {
    render(<BaseBadge variant="outlined" color="primary">Outlined</BaseBadge>);
    const badge = screen.getByText('Outlined').closest('span');
    expect(badge).toHaveClass('border-2');
    expect(badge).toHaveClass('border-blue-600');
  });

  it('renders soft variant', () => {
    render(<BaseBadge variant="soft" color="primary">Soft</BaseBadge>);
    const badge = screen.getByText('Soft').closest('span');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });
});

describe('BaseBadge - Colors', () => {
  const colors: Array<'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray'> = [
    'primary', 'secondary', 'success', 'error', 'warning', 'info', 'gray',
  ];

  colors.forEach(color => {
    it(`renders ${color} color`, () => {
      render(<BaseBadge color={color}>{color}</BaseBadge>);
      expect(screen.getByText(color)).toBeInTheDocument();
    });
  });

  it('renders primary color (default)', () => {
    render(<BaseBadge>Default Color</BaseBadge>);
    const badge = screen.getByText('Default Color').closest('span');
    expect(badge).toHaveClass('bg-blue-600');
  });

  it('renders success color correctly', () => {
    render(<BaseBadge color="success">Success</BaseBadge>);
    const badge = screen.getByText('Success').closest('span');
    expect(badge).toHaveClass('bg-green-600');
  });

  it('renders error color correctly', () => {
    render(<BaseBadge color="error">Error</BaseBadge>);
    const badge = screen.getByText('Error').closest('span');
    expect(badge).toHaveClass('bg-red-600');
  });
});

// ============================================================================
// Test Suite 3: Sizes
// ============================================================================

describe('BaseBadge - Sizes', () => {
  it('renders small size', () => {
    render(<BaseBadge size="small">Small</BaseBadge>);
    const badge = screen.getByText('Small').closest('span');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('px-2');
  });

  it('renders medium size (default)', () => {
    render(<BaseBadge size="medium">Medium</BaseBadge>);
    const badge = screen.getByText('Medium').closest('span');
    expect(badge).toHaveClass('text-sm');
    expect(badge).toHaveClass('px-2.5');
  });

  it('renders large size', () => {
    render(<BaseBadge size="large">Large</BaseBadge>);
    const badge = screen.getByText('Large').closest('span');
    expect(badge).toHaveClass('text-base');
    expect(badge).toHaveClass('px-3');
  });
});

// ============================================================================
// Test Suite 4: Icons
// ============================================================================

describe('BaseBadge - Icons', () => {
  it('renders with start icon', () => {
    render(
      <BaseBadge startIcon={<span data-testid="start-icon">✓</span>}>
        With Icon
      </BaseBadge>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders with end icon', () => {
    render(
      <BaseBadge endIcon={<span data-testid="end-icon">→</span>}>
        With Icon
      </BaseBadge>
    );
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders with both icons', () => {
    render(
      <BaseBadge
        startIcon={<span data-testid="start-icon">✓</span>}
        endIcon={<span data-testid="end-icon">→</span>}
      >
        Both Icons
      </BaseBadge>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('icons have correct size classes', () => {
    render(
      <BaseBadge
        size="large"
        startIcon={<span data-testid="icon">✓</span>}
      >
        Large Icon
      </BaseBadge>
    );
    const iconWrapper = screen.getByTestId('icon').parentElement;
    expect(iconWrapper).toHaveClass('w-5', 'h-5');
  });
});

// ============================================================================
// Test Suite 5: Dots
// ============================================================================

describe('BaseBadge - Dots', () => {
  it('renders without dot by default', () => {
    const { container } = render(<BaseBadge>No Dot</BaseBadge>);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).not.toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    const { container } = render(<BaseBadge dot>With Dot</BaseBadge>);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('dot has correct size for small badge', () => {
    const { container } = render(
      <BaseBadge size="small" dot>Small Dot</BaseBadge>
    );
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toHaveClass('w-1.5', 'h-1.5');
  });

  it('dot has correct size for large badge', () => {
    const { container } = render(
      <BaseBadge size="large" dot>Large Dot</BaseBadge>
    );
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toHaveClass('w-2.5', 'h-2.5');
  });

  it('dot animates with pulse', () => {
    const { container } = render(<BaseBadge dot>Pulse</BaseBadge>);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toHaveClass('animate-pulse');
  });
});

// ============================================================================
// Test Suite 6: Removable Functionality
// ============================================================================

describe('BaseBadge - Removable', () => {
  it('does not render close button by default', () => {
    render(<BaseBadge>Not Removable</BaseBadge>);
    const closeButton = screen.queryByLabelText('Remove');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('renders close button when removable', () => {
    render(<BaseBadge removable>Removable</BaseBadge>);
    const closeButton = screen.getByLabelText('Remove');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onRemove when close button clicked', () => {
    const handleRemove = jest.fn();
    render(
      <BaseBadge removable onRemove={handleRemove}>
        Remove Me
      </BaseBadge>
    );
    
    const closeButton = screen.getByLabelText('Remove');
    fireEvent.click(closeButton);
    
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('stops propagation on remove click', () => {
    const handleRemove = jest.fn();
    const handleClick = jest.fn();
    
    render(
      <BaseBadge
        removable
        onRemove={handleRemove}
        onClick={handleClick}
      >
        Remove Me
      </BaseBadge>
    );
    
    const closeButton = screen.getByLabelText('Remove');
    fireEvent.click(closeButton);
    
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not render end icon when removable', () => {
    render(
      <BaseBadge
        removable
        endIcon={<span data-testid="end-icon">→</span>}
      >
        Badge
      </BaseBadge>
    );
    expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument();
  });

  it('close button has focus styles', () => {
    render(<BaseBadge removable>Removable</BaseBadge>);
    const closeButton = screen.getByLabelText('Remove');
    expect(closeButton).toHaveClass('focus:outline-none');
    expect(closeButton).toHaveClass('focus:ring-2');
  });
});

// ============================================================================
// Test Suite 7: Clickable Functionality
// ============================================================================

describe('BaseBadge - Clickable', () => {
  it('is not clickable by default', () => {
    render(<BaseBadge>Not Clickable</BaseBadge>);
    const badge = screen.getByText('Not Clickable').closest('span');
    expect(badge).not.toHaveClass('cursor-pointer');
  });

  it('renders as clickable when clickable prop is true', () => {
    render(<BaseBadge clickable>Clickable</BaseBadge>);
    const badge = screen.getByText('Clickable').closest('span');
    expect(badge).toHaveClass('cursor-pointer');
  });

  it('renders as clickable when onClick is provided', () => {
    render(<BaseBadge onClick={() => {}}>Clickable</BaseBadge>);
    const badge = screen.getByText('Clickable').closest('span');
    expect(badge).toHaveClass('cursor-pointer');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<BaseBadge onClick={handleClick}>Click Me</BaseBadge>);
    
    const badge = screen.getByText('Click Me').closest('span');
    fireEvent.click(badge!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows hover effect when clickable', () => {
    render(<BaseBadge clickable color="primary">Hover</BaseBadge>);
    const badge = screen.getByText('Hover').closest('span');
    expect(badge).toHaveClass('hover:bg-blue-700');
  });

  it('has role="button" when clickable', () => {
    render(<BaseBadge onClick={() => {}}>Button Badge</BaseBadge>);
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
  });

  it('is keyboard accessible with Enter key', () => {
    const handleClick = jest.fn();
    render(<BaseBadge onClick={handleClick}>Keyboard</BaseBadge>);
    
    const badge = screen.getByText('Keyboard').closest('span');
    fireEvent.keyDown(badge!, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible with Space key', () => {
    const handleClick = jest.fn();
    render(<BaseBadge onClick={handleClick}>Keyboard</BaseBadge>);
    
    const badge = screen.getByText('Keyboard').closest('span');
    fireEvent.keyDown(badge!, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has tabIndex when clickable', () => {
    render(<BaseBadge onClick={() => {}}>Focusable</BaseBadge>);
    const badge = screen.getByText('Focusable').closest('span');
    expect(badge).toHaveAttribute('tabIndex', '0');
  });
});

// ============================================================================
// Test Suite 8: Shape & Styling
// ============================================================================

describe('BaseBadge - Shape & Styling', () => {
  it('has rounded corners by default', () => {
    render(<BaseBadge>Rounded</BaseBadge>);
    const badge = screen.getByText('Rounded').closest('span');
    expect(badge).toHaveClass('rounded-md');
  });

  it('renders as pill shape when pill prop is true', () => {
    render(<BaseBadge pill>Pill</BaseBadge>);
    const badge = screen.getByText('Pill').closest('span');
    expect(badge).toHaveClass('rounded-full');
  });

  it('applies transition classes', () => {
    render(<BaseBadge>Transition</BaseBadge>);
    const badge = screen.getByText('Transition').closest('span');
    expect(badge).toHaveClass('transition-all');
    expect(badge).toHaveClass('duration-200');
  });

  it('has proper flex alignment', () => {
    render(<BaseBadge>Flex</BaseBadge>);
    const badge = screen.getByText('Flex').closest('span');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
  });
});

// ============================================================================
// Test Suite 9: Accessibility
// ============================================================================

describe('BaseBadge - Accessibility', () => {
  it('icons have aria-hidden', () => {
    const { container } = render(
      <BaseBadge startIcon={<span>✓</span>}>
        Icon Badge
      </BaseBadge>
    );
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('close button has aria-label', () => {
    render(<BaseBadge removable>Removable</BaseBadge>);
    const closeButton = screen.getByLabelText('Remove');
    expect(closeButton).toBeInTheDocument();
  });

  it('clickable badge has proper role', () => {
    render(<BaseBadge onClick={() => {}}>Clickable</BaseBadge>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('non-clickable badge has no role', () => {
    render(<BaseBadge>Static</BaseBadge>);
    const badge = screen.getByText('Static').closest('span');
    expect(badge).not.toHaveAttribute('role');
  });
});

// ============================================================================
// Test Suite 10: Edge Cases
// ============================================================================

describe('BaseBadge - Edge Cases', () => {
  it('handles empty children', () => {
    render(<BaseBadge>{''}</BaseBadge>);
    const badge = screen.getByText('').closest('span');
    expect(badge).toBeInTheDocument();
  });

  it('handles numeric children', () => {
    render(<BaseBadge>{42}</BaseBadge>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles complex content', () => {
    render(
      <BaseBadge>
        <div>
          <span>Complex</span>
          <strong>Content</strong>
        </div>
      </BaseBadge>
    );
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles multiple combined features', () => {
    const handleClick = jest.fn();
    const handleRemove = jest.fn();
    
    render(
      <BaseBadge
        variant="soft"
        color="success"
        size="large"
        startIcon={<span data-testid="icon">✓</span>}
        dot
        removable
        onRemove={handleRemove}
        onClick={handleClick}
        pill
        className="custom"
      >
        Everything
      </BaseBadge>
    );
    
    expect(screen.getByText('Everything')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove')).toBeInTheDocument();
    
    const badge = screen.getByText('Everything').closest('span');
    expect(badge).toHaveClass('custom');
    expect(badge).toHaveClass('rounded-full');
  });

  it('prioritizes removable over end icon', () => {
    render(
      <BaseBadge
        removable
        endIcon={<span data-testid="end-icon">→</span>}
      >
        Priority Test
      </BaseBadge>
    );
    
    expect(screen.getByLabelText('Remove')).toBeInTheDocument();
    expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument();
  });
});
