/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BaseDialog from './BaseDialog';

describe('BaseDialog', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          Test Content
        </BaseDialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      render(
        <BaseDialog open={false} onClose={() => {}}>
          Test Content
        </BaseDialog>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <BaseDialog open={true} onClose={() => {}} title="Test Title">
          Test Content
        </BaseDialog>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render without title', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}}>
          Test Content
        </BaseDialog>
      );

      const header = container.querySelector('header');
      expect(header).not.toBeInTheDocument();
    });

    it('should render close button by default', () => {
      render(
        <BaseDialog open={true} onClose={() => {}} title="Test Title">
          Test Content
        </BaseDialog>
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should not render close button when showCloseButton is false', () => {
      render(
        <BaseDialog 
          open={true} 
          onClose={() => {}} 
          title="Test Title"
          showCloseButton={false}
        >
          Test Content
        </BaseDialog>
      );

      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          <div>Custom Content</div>
          <p>Paragraph content</p>
        </BaseDialog>
      );

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Size Tests
  // ============================================================================

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} size="small">
          Content
        </BaseDialog>
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('max-w-sm');
    });

    it('should apply medium size classes (default)', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('max-w-lg');
    });

    it('should apply large size classes', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} size="large">
          Content
        </BaseDialog>
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('max-w-2xl');
    });

    it('should apply fullscreen size classes', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} size="fullscreen">
          Content
        </BaseDialog>
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-full');
      expect(dialog).toHaveClass('h-full');
    });
  });

  // ============================================================================
  // Close Handlers Tests
  // ============================================================================

  describe('Close Handlers', () => {
    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <BaseDialog open={true} onClose={handleClose} title="Test">
          Content
        </BaseDialog>
      );

      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const handleClose = jest.fn();
      const { container } = render(
        <BaseDialog open={true} onClose={handleClose}>
          Content
        </BaseDialog>
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when backdrop is clicked if closeOnBackdrop is false', () => {
      const handleClose = jest.fn();
      const { container } = render(
        <BaseDialog open={true} onClose={handleClose} closeOnBackdrop={false}>
          Content
        </BaseDialog>
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside dialog', () => {
      const handleClose = jest.fn();
      render(
        <BaseDialog open={true} onClose={handleClose}>
          <div data-testid="dialog-content">Content</div>
        </BaseDialog>
      );

      fireEvent.click(screen.getByTestId('dialog-content'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should call onClose when ESC key is pressed', () => {
      const handleClose = jest.fn();
      render(
        <BaseDialog open={true} onClose={handleClose}>
          Content
        </BaseDialog>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when ESC key is pressed if closeOnEsc is false', () => {
      const handleClose = jest.fn();
      render(
        <BaseDialog open={true} onClose={handleClose} closeOnEsc={false}>
          Content
        </BaseDialog>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when other keys are pressed', () => {
      const handleClose = jest.fn();
      render(
        <BaseDialog open={true} onClose={handleClose}>
          Content
        </BaseDialog>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'Space' });
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Action Buttons Tests
  // ============================================================================

  describe('Action Buttons', () => {
    it('should render action buttons', () => {
      const actions = [
        { label: 'Cancel', onClick: jest.fn() },
        { label: 'Confirm', onClick: jest.fn() },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should call action onClick handlers', () => {
      const handleCancel = jest.fn();
      const handleConfirm = jest.fn();
      const actions = [
        { label: 'Cancel', onClick: handleCancel },
        { label: 'Confirm', onClick: handleConfirm },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('should render action buttons with different variants', () => {
      const actions = [
        { label: 'Outlined', onClick: jest.fn(), variant: 'outlined' as const },
        { label: 'Contained', onClick: jest.fn(), variant: 'contained' as const },
        { label: 'Text', onClick: jest.fn(), variant: 'text' as const },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      const outlinedBtn = screen.getByRole('button', { name: 'Outlined' });
      const containedBtn = screen.getByRole('button', { name: 'Contained' });
      const textBtn = screen.getByRole('button', { name: 'Text' });

      expect(outlinedBtn).toHaveClass('border');
      expect(containedBtn).not.toHaveClass('border');
      expect(textBtn).not.toHaveClass('border');
    });

    it('should render action buttons with different colors', () => {
      const actions = [
        { label: 'Primary', onClick: jest.fn(), color: 'primary' as const },
        { label: 'Secondary', onClick: jest.fn(), color: 'secondary' as const },
        { label: 'Success', onClick: jest.fn(), color: 'success' as const },
        { label: 'Error', onClick: jest.fn(), color: 'error' as const },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Success' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Error' })).toBeInTheDocument();
    });

    it('should disable action buttons when disabled is true', () => {
      const actions = [
        { label: 'Disabled', onClick: jest.fn(), disabled: true },
        { label: 'Enabled', onClick: jest.fn(), disabled: false },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      const disabledBtn = screen.getByRole('button', { name: 'Disabled' });
      const enabledBtn = screen.getByRole('button', { name: 'Enabled' });

      expect(disabledBtn).toBeDisabled();
      expect(enabledBtn).not.toBeDisabled();
    });

    it('should not call onClick when action button is disabled', () => {
      const handleClick = jest.fn();
      const actions = [
        { label: 'Disabled', onClick: handleClick, disabled: true },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should show loading spinner when action is loading', () => {
      const actions = [
        { label: 'Loading', onClick: jest.fn(), loading: true },
      ];

      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not call onClick when action button is loading', () => {
      const handleClick = jest.fn();
      const actions = [
        { label: 'Loading', onClick: handleClick, loading: true },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      fireEvent.click(screen.getByRole('button', { name: /Loading/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Custom Footer Tests
  // ============================================================================

  describe('Custom Footer', () => {
    it('should render custom footer when provided', () => {
      render(
        <BaseDialog
          open={true}
          onClose={() => {}}
          footer={<div>Custom Footer Content</div>}
        >
          Content
        </BaseDialog>
      );

      expect(screen.getByText('Custom Footer Content')).toBeInTheDocument();
    });

    it('should not render actions when custom footer is provided', () => {
      const actions = [
        { label: 'Should Not Appear', onClick: jest.fn() },
      ];

      render(
        <BaseDialog
          open={true}
          onClose={() => {}}
          actions={actions}
          footer={<div>Custom Footer</div>}
        >
          Content
        </BaseDialog>
      );

      expect(screen.queryByRole('button', { name: 'Should Not Appear' })).not.toBeInTheDocument();
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should not render footer when no actions and no custom footer', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      const footer = container.querySelector('footer');
      expect(footer).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Focus Management Tests
  // ============================================================================

  describe('Focus Management', () => {
    it('should focus dialog when opened', async () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          <div data-testid="dialog-content">Content</div>
        </BaseDialog>
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(document.activeElement).toBe(dialog);
      });
    });

    it('should restore focus when closed', async () => {
      const { rerender } = render(
        <>
          <button data-testid="trigger">Open Dialog</button>
          <BaseDialog open={false} onClose={() => {}}>
            Content
          </BaseDialog>
        </>
      );

      // Focus trigger button
      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      // Open dialog
      rerender(
        <>
          <button data-testid="trigger">Open Dialog</button>
          <BaseDialog open={true} onClose={() => {}}>
            Content
          </BaseDialog>
        </>
      );

      await waitFor(() => {
        expect(document.activeElement).not.toBe(trigger);
      });

      // Close dialog
      rerender(
        <>
          <button data-testid="trigger">Open Dialog</button>
          <BaseDialog open={false} onClose={() => {}}>
            Content
          </BaseDialog>
        </>
      );

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  // ============================================================================
  // Scroll Lock Tests
  // ============================================================================

  describe('Scroll Lock', () => {
    const originalOverflow = document.body.style.overflow;

    beforeEach(() => {
      document.body.style.overflow = originalOverflow;
    });

    afterEach(() => {
      document.body.style.overflow = originalOverflow;
    });

    it('should lock body scroll when dialog is open', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when dialog is closed', () => {
      document.body.style.overflow = 'auto';

      const { rerender } = render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <BaseDialog open={false} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      expect(document.body.style.overflow).toBe('auto');
    });

    it('should not lock body scroll when disableScrollLock is true', () => {
      document.body.style.overflow = 'auto';

      render(
        <BaseDialog open={true} onClose={() => {}} disableScrollLock={true}>
          Content
        </BaseDialog>
      );

      expect(document.body.style.overflow).toBe('auto');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      render(
        <BaseDialog open={true} onClose={() => {}} title="Test Title">
          Content
        </BaseDialog>
      );

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();

      const title = document.getElementById(titleId!);
      expect(title).toHaveTextContent('Test Title');
    });

    it('should not have aria-labelledby when title is not provided', () => {
      render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <BaseDialog open={true} onClose={handleClose} title="Test">
          <button>First Button</button>
          <button>Second Button</button>
        </BaseDialog>
      );

      // Tab should move through focusable elements
      await user.tab();
      expect(screen.getByText('First Button')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Second Button')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
    });
  });

  // ============================================================================
  // Custom Class Tests
  // ============================================================================

  describe('Custom Classes', () => {
    it('should apply custom className to dialog container', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} className="custom-class">
          Content
        </BaseDialog>
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('custom-class');
    });

    it('should apply custom contentClassName to content area', () => {
      const { container } = render(
        <BaseDialog
          open={true}
          onClose={() => {}}
          contentClassName="custom-content-class"
        >
          Content
        </BaseDialog>
      );

      const content = container.querySelector('.custom-content-class');
      expect(content).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Z-Index Tests
  // ============================================================================

  describe('Z-Index', () => {
    it('should use default z-index of 1000', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toHaveStyle({ zIndex: '1000' });
    });

    it('should use custom z-index when provided', () => {
      const { container } = render(
        <BaseDialog open={true} onClose={() => {}} zIndex={2000}>
          Content
        </BaseDialog>
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toHaveStyle({ zIndex: '2000' });
    });
  });

  // ============================================================================
  // Complex Scenarios Tests
  // ============================================================================

  describe('Complex Scenarios', () => {
    it('should handle rapid open/close', async () => {
      const { rerender } = render(
        <BaseDialog open={false} onClose={() => {}}>
          Content
        </BaseDialog>
      );

      // Rapidly toggle open/close
      for (let i = 0; i < 5; i++) {
        rerender(
          <BaseDialog open={true} onClose={() => {}}>
            Content
          </BaseDialog>
        );

        rerender(
          <BaseDialog open={false} onClose={() => {}}>
            Content
          </BaseDialog>
        );
      }

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should cleanup event listeners on unmount', () => {
      const handleClose = jest.fn();
      const { unmount } = render(
        <BaseDialog open={true} onClose={handleClose}>
          Content
        </BaseDialog>
      );

      unmount();

      // ESC key should not trigger after unmount
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should handle multiple action buttons with complex interactions', () => {
      const handleCancel = jest.fn();
      const handleSave = jest.fn();
      const handleDelete = jest.fn();

      const actions = [
        { label: 'Cancel', onClick: handleCancel, variant: 'outlined' as const },
        { label: 'Save Draft', onClick: handleSave, variant: 'outlined' as const, color: 'secondary' as const },
        { label: 'Delete', onClick: handleDelete, variant: 'contained' as const, color: 'error' as const },
      ];

      render(
        <BaseDialog open={true} onClose={() => {}} actions={actions}>
          Content
        </BaseDialog>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
      expect(handleSave).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle dialog with form submission', () => {
      const handleClose = jest.fn();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <BaseDialog open={true} onClose={handleClose}>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" />
            <button type="submit">Submit</button>
          </form>
        </BaseDialog>
      );

      const input = screen.getByPlaceholderText('Name');
      fireEvent.change(input, { target: { value: 'Test Name' } });

      const submitBtn = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleClose).not.toHaveBeenCalled(); // Dialog should not close on form submit
    });
  });
});
