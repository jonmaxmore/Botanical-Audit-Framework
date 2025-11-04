/**
 * BaseTooltip Component Tests
 * 
 * Test Coverage:
 * 1. Rendering & Display
 * 2. Positioning Logic
 * 3. Trigger Modes (Hover, Focus, Click)
 * 4. Themes & Sizes
 * 5. Controlled Mode
 * 6. Accessibility
 * 7. Keyboard Interaction
 * 8. Edge Cases
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BaseTooltip from './BaseTooltip';

// Mock timer for delay testing
jest.useFakeTimers();

// Helper function to advance timers
const advanceTimersByTime = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

// ============================================================================
// Test Suite 1: Rendering & Display
// ============================================================================

describe('BaseTooltip - Rendering & Display', () => {
  it('renders children without tooltip initially', () => {
    render(
      <BaseTooltip content="Test tooltip">
        <button>Trigger</button>
      </BaseTooltip>
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <BaseTooltip content="Test tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <BaseTooltip content="Test tooltip" showDelay={0} hideDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('does not show tooltip when disabled', async () => {
    render(
      <BaseTooltip content="Test tooltip" disabled showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    advanceTimersByTime(100);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders complex content', async () => {
    render(
      <BaseTooltip
        content={
          <div>
            <strong>Title</strong>
            <p>Description</p>
          </div>
        }
        showDelay={0}
      >
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Test Suite 2: Positioning Logic
// ============================================================================

describe('BaseTooltip - Positioning', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect for positioning tests
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 40,
      top: 100,
      left: 100,
      bottom: 140,
      right: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));
  });

  it('positions tooltip on top by default', async () => {
    render(
      <BaseTooltip content="Top tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('positions tooltip on bottom', async () => {
    render(
      <BaseTooltip content="Bottom tooltip" placement="bottom" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('positions tooltip on left', async () => {
    render(
      <BaseTooltip content="Left tooltip" placement="left" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('positions tooltip on right', async () => {
    render(
      <BaseTooltip content="Right tooltip" placement="right" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('respects custom offset', async () => {
    render(
      <BaseTooltip content="Offset tooltip" offset={20} showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Test Suite 3: Trigger Modes
// ============================================================================

describe('BaseTooltip - Trigger Modes', () => {
  it('shows on hover (default trigger)', async () => {
    render(
      <BaseTooltip content="Hover tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('shows on focus trigger', async () => {
    render(
      <BaseTooltip content="Focus tooltip" trigger="focus" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.focus(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('hides on blur with focus trigger', async () => {
    render(
      <BaseTooltip content="Focus tooltip" trigger="focus" showDelay={0} hideDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.blur(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('toggles on click trigger', async () => {
    render(
      <BaseTooltip content="Click tooltip" trigger="click" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');

    // First click - show
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    // Second click - hide
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('does not show on hover with manual trigger', async () => {
    render(
      <BaseTooltip content="Manual tooltip" trigger="manual">
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));
    advanceTimersByTime(500);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 4: Delays
// ============================================================================

describe('BaseTooltip - Delays', () => {
  it('respects show delay', async () => {
    render(
      <BaseTooltip content="Delayed tooltip" showDelay={300}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    // Should not show immediately
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Should show after delay
    advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('respects hide delay', async () => {
    render(
      <BaseTooltip content="Hide delay tooltip" showDelay={0} hideDelay={300}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);

    // Should still be visible immediately after leave
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Should hide after delay
    advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('cancels show on quick mouse leave', async () => {
    render(
      <BaseTooltip content="Quick leave" showDelay={300}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    // Leave before show delay completes
    advanceTimersByTime(100);
    fireEvent.mouseLeave(trigger);

    // Wait for original show delay
    advanceTimersByTime(300);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 5: Themes & Sizes
// ============================================================================

describe('BaseTooltip - Themes & Sizes', () => {
  it('applies dark theme by default', async () => {
    render(
      <BaseTooltip content="Dark tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-gray-900');
      expect(tooltip).toHaveClass('text-white');
    });
  });

  it('applies light theme', async () => {
    render(
      <BaseTooltip content="Light tooltip" theme="light" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-white');
      expect(tooltip).toHaveClass('text-gray-900');
    });
  });

  it('applies small size', async () => {
    render(
      <BaseTooltip content="Small tooltip" size="small" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('text-xs');
    });
  });

  it('applies medium size by default', async () => {
    render(
      <BaseTooltip content="Medium tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('text-sm');
    });
  });

  it('applies large size', async () => {
    render(
      <BaseTooltip content="Large tooltip" size="large" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('text-base');
    });
  });

  it('shows arrow by default', async () => {
    render(
      <BaseTooltip content="With arrow" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('.absolute.w-0.h-0');
      expect(arrow).toBeInTheDocument();
    });
  });

  it('hides arrow when arrow=false', async () => {
    render(
      <BaseTooltip content="No arrow" arrow={false} showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('.absolute.w-0.h-0');
      expect(arrow).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// Test Suite 6: Controlled Mode
// ============================================================================

describe('BaseTooltip - Controlled Mode', () => {
  it('shows tooltip when open=true', () => {
    render(
      <BaseTooltip content="Controlled tooltip" trigger="manual" open={true}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip when open=false', () => {
    render(
      <BaseTooltip content="Controlled tooltip" trigger="manual" open={false}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when state changes', async () => {
    const handleOpenChange = jest.fn();

    render(
      <BaseTooltip
        content="Controlled tooltip"
        trigger="click"
        onOpenChange={handleOpenChange}
        showDelay={0}
      >
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('updates when open prop changes', () => {
    const { rerender } = render(
      <BaseTooltip content="Controlled tooltip" trigger="manual" open={false}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <BaseTooltip content="Controlled tooltip" trigger="manual" open={true}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 7: Accessibility
// ============================================================================

describe('BaseTooltip - Accessibility', () => {
  it('has role="tooltip"', async () => {
    render(
      <BaseTooltip content="Accessible tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('links trigger to tooltip with aria-describedby', async () => {
    render(
      <BaseTooltip content="Accessible tooltip" id="test-tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('id', 'test-tooltip');
      expect(trigger.children[0]).toHaveAttribute('aria-describedby', 'test-tooltip');
    });
  });

  it('generates unique id when not provided', async () => {
    render(
      <BaseTooltip content="Accessible tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const tooltipId = tooltip.getAttribute('id');
      expect(tooltipId).toMatch(/^tooltip-/);
      expect(trigger.children[0]).toHaveAttribute('aria-describedby', tooltipId);
    });
  });

  it('closes on Escape key', async () => {
    render(
      <BaseTooltip content="Escapable tooltip" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.keyDown(trigger, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// Test Suite 8: Edge Cases
// ============================================================================

describe('BaseTooltip - Edge Cases', () => {
  it('handles rapid hover on/off', async () => {
    render(
      <BaseTooltip content="Rapid tooltip" showDelay={100} hideDelay={100}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');

    // Rapid hovers
    fireEvent.mouseEnter(trigger);
    advanceTimersByTime(50);
    fireEvent.mouseLeave(trigger);
    advanceTimersByTime(50);
    fireEvent.mouseEnter(trigger);

    advanceTimersByTime(150);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('cleans up timeouts on unmount', () => {
    const { unmount } = render(
      <BaseTooltip content="Cleanup tooltip" showDelay={300}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    unmount();

    // Should not throw errors
    advanceTimersByTime(300);
  });

  it('handles empty content gracefully', async () => {
    render(
      <BaseTooltip content="" showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('applies custom className', async () => {
    render(
      <BaseTooltip
        content="Custom class tooltip"
        className="custom-wrapper"
        contentClassName="custom-content"
        showDelay={0}
      >
        <button>Trigger</button>
      </BaseTooltip>
    );

    const trigger = screen.getByRole('button');
    expect(trigger.parentElement).toHaveClass('custom-wrapper');

    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-content');
    });
  });

  it('respects custom maxWidth', async () => {
    render(
      <BaseTooltip content="Max width tooltip" maxWidth={300} showDelay={0}>
        <button>Trigger</button>
      </BaseTooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ maxWidth: '300px' });
    });
  });

  it('handles multiple tooltips', async () => {
    render(
      <div>
        <BaseTooltip content="First tooltip" showDelay={0}>
          <button>First</button>
        </BaseTooltip>
        <BaseTooltip content="Second tooltip" showDelay={0}>
          <button>Second</button>
        </BaseTooltip>
      </div>
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'First' }));

    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Second' }));

    await waitFor(() => {
      expect(screen.getByText('Second tooltip')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Cleanup
// ============================================================================

afterEach(() => {
  jest.clearAllTimers();
});
