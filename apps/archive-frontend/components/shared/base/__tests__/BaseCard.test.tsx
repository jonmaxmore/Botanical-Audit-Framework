/**
 * BaseCard Unit Tests
 * 
 * Comprehensive test suite for BaseCard component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseCard from '../BaseCard';

describe('BaseCard', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders card with children content', () => {
      render(<BaseCard>Test Content</BaseCard>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      const { container } = render(<BaseCard>Content</BaseCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'border', 'border-gray-200');
    });

    it('renders with custom className', () => {
      const { container } = render(
        <BaseCard className="custom-class">Content</BaseCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  // ============================================================================
  // VARIANT TESTS
  // ============================================================================

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(
        <BaseCard variant="default">Content</BaseCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'border');
    });

    it('renders outlined variant', () => {
      const { container } = render(
        <BaseCard variant="outlined">Content</BaseCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-transparent', 'border-2');
    });

    it('renders elevated variant', () => {
      const { container } = render(
        <BaseCard variant="elevated">Content</BaseCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'shadow-lg');
    });
  });

  // ============================================================================
  // HEADER TESTS
  // ============================================================================

  describe('Header', () => {
    it('renders title in header', () => {
      render(<BaseCard title="Test Title">Content</BaseCard>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders subtitle in header', () => {
      render(
        <BaseCard title="Title" subtitle="Test Subtitle">
          Content
        </BaseCard>
      );
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders header icon', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      render(
        <BaseCard title="Title" headerIcon={<TestIcon />}>
          Content
        </BaseCard>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders header actions', () => {
      render(
        <BaseCard
          title="Title"
          headerActions={<button>Action</button>}
        >
          Content
        </BaseCard>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('does not render header when no header props', () => {
      const { container } = render(<BaseCard>Content</BaseCard>);
      const headers = container.querySelectorAll('.border-b');
      expect(headers.length).toBe(0);
    });
  });

  // ============================================================================
  // FOOTER TESTS
  // ============================================================================

  describe('Footer', () => {
    it('renders custom footer content', () => {
      render(
        <BaseCard footer={<div>Custom Footer</div>}>
          Content
        </BaseCard>
      );
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('renders action buttons in footer', () => {
      const actions = [
        { label: 'Cancel', onClick: jest.fn() },
        { label: 'Save', onClick: jest.fn() }
      ];

      render(<BaseCard actions={actions}>Content</BaseCard>);
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('calls action onClick when button clicked', () => {
      const onSave = jest.fn();
      const actions = [
        { label: 'Save', onClick: onSave }
      ];

      render(<BaseCard actions={actions}>Content</BaseCard>);
      
      fireEvent.click(screen.getByText('Save'));
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('renders action buttons with correct variants', () => {
      const actions = [
        { label: 'Text', onClick: jest.fn(), variant: 'text' as const },
        { label: 'Secondary', onClick: jest.fn(), variant: 'secondary' as const },
        { label: 'Primary', onClick: jest.fn(), variant: 'primary' as const }
      ];

      render(<BaseCard actions={actions}>Content</BaseCard>);
      
      const textBtn = screen.getByText('Text');
      const secondaryBtn = screen.getByText('Secondary');
      const primaryBtn = screen.getByText('Primary');

      expect(textBtn).toHaveClass('text-blue-600');
      expect(secondaryBtn).toHaveClass('bg-gray-200');
      expect(primaryBtn).toHaveClass('bg-blue-600');
    });

    it('disables action buttons when disabled prop is true', () => {
      const actions = [
        { label: 'Disabled', onClick: jest.fn(), disabled: true }
      ];

      render(<BaseCard actions={actions}>Content</BaseCard>);
      
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // INTERACTIVE TESTS
  // ============================================================================

  describe('Interactive Features', () => {
    it('calls onClick when card is clicked', () => {
      const onClick = jest.fn();
      const { container } = render(
        <BaseCard onClick={onClick}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('adds hover classes when hoverable', () => {
      const { container } = render(
        <BaseCard hoverable>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-xl', 'cursor-pointer');
    });

    it('adds hover classes when onClick is provided', () => {
      const { container } = render(
        <BaseCard onClick={() => {}}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-xl', 'cursor-pointer');
    });

    it('sets role="button" when onClick is provided', () => {
      const { container } = render(
        <BaseCard onClick={() => {}}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('role', 'button');
    });

    it('sets tabIndex when onClick is provided', () => {
      const { container } = render(
        <BaseCard onClick={() => {}}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('handles Enter key press', () => {
      const onClick = jest.fn();
      const { container } = render(
        <BaseCard onClick={onClick}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press', () => {
      const onClick = jest.fn();
      const { container } = render(
        <BaseCard onClick={onClick}>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: ' ' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', () => {
      const onClick = jest.fn();
      const { container } = render(
        <BaseCard onClick={onClick} loading>Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading overlay when loading', () => {
      const { container } = render(
        <BaseCard loading>Content</BaseCard>
      );
      
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables action buttons when loading', () => {
      const actions = [
        { label: 'Save', onClick: jest.fn() }
      ];

      render(<BaseCard actions={actions} loading>Content</BaseCard>);
      
      const button = screen.getByText('Save');
      expect(button).toBeDisabled();
    });

    it('prevents action onClick when loading', () => {
      const onSave = jest.fn();
      const actions = [
        { label: 'Save', onClick: onSave }
      ];

      render(<BaseCard actions={actions} loading>Content</BaseCard>);
      
      const button = screen.getByText('Save');
      fireEvent.click(button);
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // PADDING TESTS
  // ============================================================================

  describe('Padding', () => {
    it('applies no padding when padding="none"', () => {
      const { container } = render(
        <BaseCard padding="none">Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
    });

    it('applies small padding', () => {
      const { container } = render(
        <BaseCard padding="small">Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('applies medium padding (default)', () => {
      const { container } = render(
        <BaseCard padding="medium">Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('applies large padding', () => {
      const { container } = render(
        <BaseCard padding="large">Content</BaseCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });
  });

  // ============================================================================
  // ACTION BUTTON EVENT PROPAGATION
  // ============================================================================

  describe('Action Button Event Handling', () => {
    it('stops propagation when action button clicked', () => {
      const cardOnClick = jest.fn();
      const actionOnClick = jest.fn();
      const actions = [
        { label: 'Action', onClick: actionOnClick }
      ];

      render(
        <BaseCard onClick={cardOnClick} actions={actions}>
          Content
        </BaseCard>
      );
      
      const actionButton = screen.getByText('Action');
      fireEvent.click(actionButton);

      expect(actionOnClick).toHaveBeenCalledTimes(1);
      expect(cardOnClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // COMBINED FEATURES TESTS
  // ============================================================================

  describe('Combined Features', () => {
    it('renders card with all features', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      const onSave = jest.fn();
      const actions = [
        { label: 'Cancel', onClick: jest.fn(), variant: 'secondary' as const },
        { label: 'Save', onClick: onSave, variant: 'primary' as const }
      ];

      render(
        <BaseCard
          variant="elevated"
          title="Test Card"
          subtitle="Test Subtitle"
          headerIcon={<TestIcon />}
          headerActions={<button>More</button>}
          footer={<div>Footer</div>}
          actions={actions}
          hoverable
          padding="large"
        >
          Test Content
        </BaseCard>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders outlined card with header and actions', () => {
      const actions = [{ label: 'Submit', onClick: jest.fn() }];

      const { container } = render(
        <BaseCard
          variant="outlined"
          title="Form Card"
          actions={actions}
        >
          Form Content
        </BaseCard>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2');
      expect(screen.getByText('Form Card')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
});
