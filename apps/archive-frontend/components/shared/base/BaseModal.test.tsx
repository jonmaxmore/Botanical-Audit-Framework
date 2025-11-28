import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseModal from './BaseModal';

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('BaseModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(
        <BaseModal isOpen={false} onClose={mockOnClose}>
          <p>Modal Content</p>
        </BaseModal>
      );
      
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Modal Content</p>
        </BaseModal>
      );
      
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="My Modal">
          <p>Content</p>
        </BaseModal>
      );
      
      expect(screen.getByText('My Modal')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <BaseModal
          isOpen={true}
          onClose={mockOnClose}
          footer={<button>Save</button>}
        >
          <p>Content</p>
        </BaseModal>
      );
      
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal">
          <p>Content</p>
        </BaseModal>
      );
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal" showCloseButton={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Closing Behavior', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal">
          <p>Content</p>
        </BaseModal>
      );
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when closeOnEscape is false', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} closeOnEscape={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = screen.getByRole('dialog').firstChild as HTMLElement;
      fireEvent.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on backdrop click when closeOnBackdropClick is false', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} closeOnBackdropClick={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = screen.getByRole('dialog').firstChild as HTMLElement;
      fireEvent.click(backdrop);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking modal content', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Modal Content</p>
        </BaseModal>
      );
      
      const content = screen.getByText('Modal Content');
      fireEvent.click(content);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('applies small size class', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} size="sm">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });

    it('applies medium size class', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} size="md">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('applies large size class', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} size="lg">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('applies extra large size class', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} size="xl">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.max-w-xl');
      expect(modal).toBeInTheDocument();
    });

    it('applies full size class', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} size="full">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.max-w-full');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Backdrop', () => {
    it('renders backdrop by default', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toBeInTheDocument();
    });

    it('hides backdrop when showBackdrop is false', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} showBackdrop={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('applies custom backdrop opacity', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} backdropOpacity={75}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = container.querySelector('.bg-opacity-75');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('centers modal by default', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const modalContainer = container.querySelector('.items-center');
      expect(modalContainer).toBeInTheDocument();
    });

    it('positions modal at top when centered is false', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} centered={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      const modalContainer = container.querySelector('.items-start');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('Scroll Locking', () => {
    it('locks body scroll when modal opens', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal closes', () => {
      const { rerender } = render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(
        <BaseModal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(document.body.style.overflow).toBe('');
    });

    it('does not lock scroll when lockScroll is false', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} lockScroll={false}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Focus Management', () => {
    it('focuses first focusable element when opened', async () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <button>First Button</button>
          <button>Second Button</button>
        </BaseModal>
      );
      
      await waitFor(() => {
        expect(screen.getByText('First Button')).toHaveFocus();
      }, { timeout: 200 });
    });

    it('traps focus within modal with Tab key', async () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </BaseModal>
      );
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close modal');
        closeButton.focus();
      });

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.keyDown(closeButton, { key: 'Tab' });
      
      // Tab should move to first button
      await waitFor(() => {
        expect(screen.getByText('Button 1')).toHaveFocus();
      });
    });

    it('allows disabling focus trap', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} trapFocus={false}>
          <button>Button</button>
        </BaseModal>
      );
      
      // Focus trap should not be active
      fireEvent.keyDown(document, { key: 'Tab' });
      // Should not throw or cause issues
    });
  });

  describe('Animations', () => {
    it('applies fade animation classes', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} animation="fade">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.animate-fade-in');
      expect(modal).toBeInTheDocument();
    });

    it('applies slide-up animation classes', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} animation="slide-up">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.animate-slide-up');
      expect(modal).toBeInTheDocument();
    });

    it('applies zoom animation classes', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} animation="zoom">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.animate-zoom-in');
      expect(modal).toBeInTheDocument();
    });

    it('applies no animation when animation is none', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} animation="none">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('[class*="animate"]');
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className to modal', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} className="custom-modal">
          <p>Content</p>
        </BaseModal>
      );
      
      const modal = container.querySelector('.custom-modal');
      expect(modal).toBeInTheDocument();
    });

    it('applies custom headerClassName', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal" headerClassName="custom-header">
          <p>Content</p>
        </BaseModal>
      );
      
      const header = screen.getByText('Modal').parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('applies custom bodyClassName', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} bodyClassName="custom-body">
          <p>Content</p>
        </BaseModal>
      );
      
      const body = container.querySelector('.custom-body');
      expect(body).toBeInTheDocument();
    });

    it('applies custom footerClassName', () => {
      render(
        <BaseModal
          isOpen={true}
          onClose={mockOnClose}
          footer={<button>Save</button>}
          footerClassName="custom-footer"
        >
          <p>Content</p>
        </BaseModal>
      );
      
      const footer = screen.getByText('Save').parentElement;
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Z-Index', () => {
    it('applies default z-index', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveStyle({ zIndex: '1000' });
    });

    it('applies custom z-index', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} zIndex={2000}>
          <p>Content</p>
        </BaseModal>
      );
      
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveStyle({ zIndex: '2000' });
    });
  });

  describe('Callbacks', () => {
    it('calls onOpen when modal opens', async () => {
      const onOpen = jest.fn();
      
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} onOpen={onOpen}>
          <p>Content</p>
        </BaseModal>
      );
      
      await waitFor(() => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onClosed when modal closes', async () => {
      const onClosed = jest.fn();
      
      const { rerender } = render(
        <BaseModal isOpen={true} onClose={mockOnClose} onClosed={onClosed}>
          <p>Content</p>
        </BaseModal>
      );
      
      rerender(
        <BaseModal isOpen={false} onClose={mockOnClose} onClosed={onClosed}>
          <p>Content</p>
        </BaseModal>
      );
      
      await waitFor(() => {
        expect(onClosed).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="My Modal">
          <p>Content</p>
        </BaseModal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      
      const title = screen.getByText('My Modal');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('close button has proper aria-label', () => {
      render(
        <BaseModal isOpen={true} onClose={mockOnClose} title="Modal">
          <p>Content</p>
        </BaseModal>
      );
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('backdrop has aria-hidden', () => {
      const { container } = render(
        <BaseModal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </BaseModal>
      );
      
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
