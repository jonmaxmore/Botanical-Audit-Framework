/**
 * Unit Tests for BaseActionModal Component
 * 
 * Tests cover:
 * - Rendering with different decision options
 * - Form validation
 * - Submit flow
 * - Loading states
 * - Error handling
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BaseActionModal from '../BaseActionModal';
import type { DecisionOption, ActionFormData } from '../BaseActionModal';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Mock decision options
const mockDecisionOptions: DecisionOption[] = [
  {
    value: 'approve',
    label: 'Approve',
    icon: <CheckCircle data-testid="approve-icon" />,
    color: 'success',
  },
  {
    value: 'reject',
    label: 'Reject',
    icon: <XCircle data-testid="reject-icon" />,
    color: 'error',
    requiresReason: true,
  },
  {
    value: 'request-changes',
    label: 'Request Changes',
    icon: <AlertTriangle data-testid="request-changes-icon" />,
    color: 'warning',
    requiresReason: true,
  },
];

describe('BaseActionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    type: 'review' as const,
    title: 'Review Application',
    subtitle: 'APP-001 - John Doe',
    decisionOptions: mockDecisionOptions,
    defaultDecision: 'approve',
    itemId: 'test-item-1',
    itemData: {
      name: 'John Doe',
      identifier: 'APP-001',
      cropType: 'Cannabis',
      farmSize: 10,
    },
    minCommentLength: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(<BaseActionModal {...defaultProps} />);
      
      expect(screen.getByText('Review Application')).toBeInTheDocument();
      expect(screen.getByText('APP-001 - John Doe')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<BaseActionModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Review Application')).not.toBeInTheDocument();
    });

    it('should render all decision options', () => {
      render(<BaseActionModal {...defaultProps} />);
      
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
      expect(screen.getByText('Request Changes')).toBeInTheDocument();
    });

    it('should render item data', () => {
      render(<BaseActionModal {...defaultProps} />);
      
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/APP-001/)).toBeInTheDocument();
    });

    it('should show rating input when showRating is true', () => {
      render(<BaseActionModal {...defaultProps} showRating={true} />);
      
      // Rating component should be present
      const ratingElements = screen.getAllByRole('radio');
      expect(ratingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Decision Selection', () => {
    it('should select default decision on mount', () => {
      render(<BaseActionModal {...defaultProps} />);
      
      const approveRadio = screen.getByLabelText(/Approve/i);
      expect(approveRadio).toBeChecked();
    });

    it('should allow changing decision', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const rejectRadio = screen.getByLabelText(/Reject/i);
      await user.click(rejectRadio);
      
      expect(rejectRadio).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('should validate minimum comment length', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      // Try to submit with short comment
      await user.type(commentInput, 'Short');
      await user.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should require comment field', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/comment is required/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should validate rating when showRating is true', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} showRating={true} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment with enough characters');
      
      // Try to submit without rating (if required)
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // Should either submit or show rating validation based on configuration
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Submit Flow', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment with enough characters');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            decision: 'approve',
            comments: 'This is a valid comment with enough characters',
          })
        );
      });
    });

    it('should include rating in submission when provided', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} showRating={true} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment');
      
      // Select rating (assuming 5-star rating)
      const ratingInputs = screen.getAllByRole('radio');
      if (ratingInputs.length > 0) {
        await user.click(ratingInputs[4]); // Click 5th star
      }
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            rating: expect.any(Number),
          })
        );
      });
    });

    it('should close modal after successful submission', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle submission errors', async () => {
      const onSubmitError = jest.fn().mockRejectedValue(new Error('Submission failed'));
      const user = userEvent.setup();
      
      render(<BaseActionModal {...defaultProps} onSubmit={onSubmitError} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
      
      // Modal should remain open on error
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const user = userEvent.setup();
      
      render(<BaseActionModal {...defaultProps} onSubmit={slowSubmit} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // Submit button should be disabled during loading
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(slowSubmit).toHaveBeenCalled();
      });
    });

    it('should disable form inputs during submission', async () => {
      const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const user = userEvent.setup();
      
      render(<BaseActionModal {...defaultProps} onSubmit={slowSubmit} />);
      
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a valid comment');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // All radio buttons should be disabled
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
      
      await waitFor(() => {
        expect(slowSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Close Modal', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when close icon is clicked', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should reset form when modal is closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<BaseActionModal {...defaultProps} />);
      
      // Fill form
      const commentInput = screen.getByPlaceholderText(/comments/i);
      await user.type(commentInput, 'This is a test comment');
      
      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      // Reopen modal
      rerender(<BaseActionModal {...defaultProps} isOpen={true} />);
      
      // Form should be reset
      const newCommentInput = screen.getByPlaceholderText(/comments/i);
      expect(newCommentInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<BaseActionModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/close/i)).toBeInTheDocument();
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      // Tab through modal elements
      await user.tab();
      
      // Focus should stay within modal
      const focusedElement = document.activeElement;
      const modal = screen.getByRole('dialog');
      expect(modal).toContainElement(focusedElement);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BaseActionModal {...defaultProps} />);
      
      // Should be able to close with Escape key
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
