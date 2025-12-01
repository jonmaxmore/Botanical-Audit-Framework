import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaseAccordion, AccordionItem } from './BaseAccordion';

// Mock accordion items for testing
const mockItems: AccordionItem[] = [
  {
    id: 'item-1',
    header: 'Section 1',
    content: 'Content 1',
  },
  {
    id: 'item-2',
    header: 'Section 2',
    content: 'Content 2',
  },
  {
    id: 'item-3',
    header: 'Section 3',
    content: 'Content 3',
  },
];

describe('BaseAccordion', () => {
  describe('Rendering', () => {
    it('renders all accordion items', () => {
      render(<BaseAccordion items={mockItems} />);
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('renders with default collapsed state', () => {
      render(<BaseAccordion items={mockItems} />);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('renders with defaultExpanded items', () => {
      render(<BaseAccordion items={mockItems} defaultExpanded={['item-1', 'item-2']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('renders with custom icons', () => {
      const itemsWithIcons: AccordionItem[] = [
        {
          id: 'item-1',
          header: 'Section 1',
          content: 'Content 1',
          icon: <span data-testid="custom-icon">🌟</span>,
        },
      ];

      render(<BaseAccordion items={itemsWithIcons} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Single Mode', () => {
    it('expands item when clicked', () => {
      render(<BaseAccordion items={mockItems} mode="single" />);
      
      const header1 = screen.getByText('Section 1');
      fireEvent.click(header1);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('collapses expanded item when clicked again', () => {
      render(<BaseAccordion items={mockItems} mode="single" defaultExpanded={['item-1']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      
      const header1 = screen.getByText('Section 1');
      fireEvent.click(header1);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('collapses previously expanded item when expanding another', () => {
      render(<BaseAccordion items={mockItems} mode="single" defaultExpanded={['item-1']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      
      const header2 = screen.getByText('Section 2');
      fireEvent.click(header2);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange callback with correct value', () => {
      const onChange = jest.fn();
      render(<BaseAccordion items={mockItems} mode="single" onChange={onChange} />);
      
      const header1 = screen.getByText('Section 1');
      fireEvent.click(header1);
      
      expect(onChange).toHaveBeenCalledWith(['item-1']);
    });
  });

  describe('Multiple Mode', () => {
    it('allows multiple items to be expanded', () => {
      render(<BaseAccordion items={mockItems} mode="multiple" />);
      
      fireEvent.click(screen.getByText('Section 1'));
      fireEvent.click(screen.getByText('Section 2'));
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('keeps other items expanded when expanding new item', () => {
      render(<BaseAccordion items={mockItems} mode="multiple" defaultExpanded={['item-1']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Section 2'));
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('collapses item when clicked again in multiple mode', () => {
      render(<BaseAccordion items={mockItems} mode="multiple" defaultExpanded={['item-1', 'item-2']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Section 1'));
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange with array of expanded items', () => {
      const onChange = jest.fn();
      render(<BaseAccordion items={mockItems} mode="multiple" onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Section 1'));
      expect(onChange).toHaveBeenCalledWith(['item-1']);
      
      fireEvent.click(screen.getByText('Section 2'));
      expect(onChange).toHaveBeenCalledWith(['item-1', 'item-2']);
    });
  });

  describe('Controlled Mode', () => {
    it('uses controlled expandedItems prop', () => {
      render(<BaseAccordion items={mockItems} expandedItems={['item-2']} />);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('updates when expandedItems prop changes', () => {
      const { rerender } = render(<BaseAccordion items={mockItems} expandedItems={['item-1']} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      
      rerender(<BaseAccordion items={mockItems} expandedItems={['item-2']} />);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange but does not change state in controlled mode', () => {
      const onChange = jest.fn();
      render(<BaseAccordion items={mockItems} expandedItems={['item-1']} onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Section 2'));
      
      expect(onChange).toHaveBeenCalledWith(['item-2']);
      // State should not change without prop update
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates to next item with ArrowDown', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header1 = screen.getByText('Section 1');
      header1.focus();
      
      fireEvent.keyDown(header1, { key: 'ArrowDown' });
      
      expect(screen.getByText('Section 2')).toHaveFocus();
    });

    it('navigates to previous item with ArrowUp', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header2 = screen.getByText('Section 2');
      header2.focus();
      
      fireEvent.keyDown(header2, { key: 'ArrowUp' });
      
      expect(screen.getByText('Section 1')).toHaveFocus();
    });

    it('wraps to first item when pressing ArrowDown on last item', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header3 = screen.getByText('Section 3');
      header3.focus();
      
      fireEvent.keyDown(header3, { key: 'ArrowDown' });
      
      expect(screen.getByText('Section 1')).toHaveFocus();
    });

    it('wraps to last item when pressing ArrowUp on first item', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header1 = screen.getByText('Section 1');
      header1.focus();
      
      fireEvent.keyDown(header1, { key: 'ArrowUp' });
      
      expect(screen.getByText('Section 3')).toHaveFocus();
    });

    it('navigates to first item with Home key', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header3 = screen.getByText('Section 3');
      header3.focus();
      
      fireEvent.keyDown(header3, { key: 'Home' });
      
      expect(screen.getByText('Section 1')).toHaveFocus();
    });

    it('navigates to last item with End key', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header1 = screen.getByText('Section 1');
      header1.focus();
      
      fireEvent.keyDown(header1, { key: 'End' });
      
      expect(screen.getByText('Section 3')).toHaveFocus();
    });

    it('expands item with Enter key', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header1 = screen.getByText('Section 1');
      fireEvent.keyDown(header1, { key: 'Enter' });
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('expands item with Space key', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header1 = screen.getByText('Section 1');
      fireEvent.keyDown(header1, { key: ' ' });
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('skips disabled items during keyboard navigation', () => {
      const itemsWithDisabled: AccordionItem[] = [
        { id: 'item-1', header: 'Section 1', content: 'Content 1' },
        { id: 'item-2', header: 'Section 2', content: 'Content 2', disabled: true },
        { id: 'item-3', header: 'Section 3', content: 'Content 3' },
      ];

      render(<BaseAccordion items={itemsWithDisabled} />);
      
      const header1 = screen.getByText('Section 1');
      header1.focus();
      
      fireEvent.keyDown(header1, { key: 'ArrowDown' });
      
      // Should skip disabled item-2 and focus item-3
      expect(screen.getByText('Section 3')).toHaveFocus();
    });
  });

  describe('Variants', () => {
    it('applies default variant classes', () => {
      const { container } = render(<BaseAccordion items={mockItems} variant="default" />);
      expect(container.firstChild).toHaveClass('border', 'rounded-lg');
    });

    it('applies bordered variant classes', () => {
      const { container } = render(<BaseAccordion items={mockItems} variant="bordered" />);
      expect(container.firstChild).toHaveClass('space-y-0');
    });

    it('applies separated variant classes', () => {
      const { container } = render(<BaseAccordion items={mockItems} variant="separated" />);
      expect(container.firstChild).toHaveClass('space-y-3');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<BaseAccordion items={mockItems} size="small" />);
      const header = screen.getByText('Section 1');
      expect(header).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('applies medium size classes', () => {
      render(<BaseAccordion items={mockItems} size="medium" />);
      const header = screen.getByText('Section 1');
      expect(header).toHaveClass('px-4', 'py-3', 'text-base');
    });

    it('applies large size classes', () => {
      render(<BaseAccordion items={mockItems} size="large" />);
      const header = screen.getByText('Section 1');
      expect(header).toHaveClass('px-6', 'py-4', 'text-lg');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled item with correct attributes', () => {
      const itemsWithDisabled: AccordionItem[] = [
        { id: 'item-1', header: 'Section 1', content: 'Content 1', disabled: true },
      ];

      render(<BaseAccordion items={itemsWithDisabled} />);
      
      const header = screen.getByText('Section 1');
      expect(header).toBeDisabled();
      expect(header).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not expand disabled item when clicked', () => {
      const itemsWithDisabled: AccordionItem[] = [
        { id: 'item-1', header: 'Section 1', content: 'Content 1', disabled: true },
      ];

      render(<BaseAccordion items={itemsWithDisabled} />);
      
      fireEvent.click(screen.getByText('Section 1'));
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('disables all items when disabled prop is true', () => {
      render(<BaseAccordion items={mockItems} disabled />);
      
      expect(screen.getByText('Section 1')).toBeDisabled();
      expect(screen.getByText('Section 2')).toBeDisabled();
      expect(screen.getByText('Section 3')).toBeDisabled();
    });

    it('does not expand any item when accordion is disabled', () => {
      render(<BaseAccordion items={mockItems} disabled />);
      
      fireEvent.click(screen.getByText('Section 1'));
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('shows expand/collapse icons by default', () => {
      const { container } = render(<BaseAccordion items={mockItems} />);
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('hides icons when showIcons is false', () => {
      const { container } = render(<BaseAccordion items={mockItems} showIcons={false} />);
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBe(0);
    });

    it('renders custom expand icon', () => {
      const customExpandIcon = <span data-testid="custom-expand">▼</span>;
      render(<BaseAccordion items={mockItems} expandIcon={customExpandIcon} />);
      
      expect(screen.getAllByTestId('custom-expand').length).toBeGreaterThan(0);
    });

    it('renders custom collapse icon when item is expanded', () => {
      const customCollapseIcon = <span data-testid="custom-collapse">▲</span>;
      render(
        <BaseAccordion 
          items={mockItems} 
          collapseIcon={customCollapseIcon}
          defaultExpanded={['item-1']}
        />
      );
      
      expect(screen.getByTestId('custom-collapse')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('applies animation classes when animated is true', () => {
      render(<BaseAccordion items={mockItems} animated defaultExpanded={['item-1']} />);
      
      const panel = screen.getByText('Content 1').parentElement;
      expect(panel).toHaveClass('animate-accordion-down');
    });

    it('does not apply animation classes when animated is false', () => {
      render(<BaseAccordion items={mockItems} animated={false} defaultExpanded={['item-1']} />);
      
      const panel = screen.getByText('Content 1').parentElement;
      expect(panel).not.toHaveClass('animate-accordion-down');
      expect(panel).not.toHaveClass('animate-accordion-up');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on headers', () => {
      render(<BaseAccordion items={mockItems} defaultExpanded={['item-1']} />);
      
      const header1 = screen.getByText('Section 1');
      const header2 = screen.getByText('Section 2');
      
      expect(header1).toHaveAttribute('aria-expanded', 'true');
      expect(header1).toHaveAttribute('aria-controls', 'accordion-panel-item-1');
      
      expect(header2).toHaveAttribute('aria-expanded', 'false');
      expect(header2).toHaveAttribute('aria-controls', 'accordion-panel-item-2');
    });

    it('has correct ARIA attributes on panels', () => {
      render(<BaseAccordion items={mockItems} defaultExpanded={['item-1']} />);
      
      const panel = screen.getByText('Content 1').parentElement;
      expect(panel).toHaveAttribute('role', 'region');
      expect(panel).toHaveAttribute('id', 'accordion-panel-item-1');
    });

    it('has proper button type for headers', () => {
      render(<BaseAccordion items={mockItems} />);
      
      const header = screen.getByText('Section 1');
      expect(header.tagName).toBe('BUTTON');
      expect(header).toHaveAttribute('type', 'button');
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className to container', () => {
      const { container } = render(<BaseAccordion items={mockItems} className="custom-accordion" />);
      expect(container.firstChild).toHaveClass('custom-accordion');
    });

    it('applies custom itemClassName to items', () => {
      render(<BaseAccordion items={mockItems} itemClassName="custom-item" />);
      const header = screen.getByText('Section 1');
      expect(header.parentElement).toHaveClass('custom-item');
    });

    it('applies custom headerClassName to headers', () => {
      render(<BaseAccordion items={mockItems} headerClassName="custom-header" />);
      const header = screen.getByText('Section 1');
      expect(header).toHaveClass('custom-header');
    });

    it('applies custom panelClassName to panels', () => {
      render(<BaseAccordion items={mockItems} panelClassName="custom-panel" defaultExpanded={['item-1']} />);
      const panel = screen.getByText('Content 1').parentElement;
      expect(panel).toHaveClass('custom-panel');
    });

    it('applies item-specific className', () => {
      const itemsWithClass: AccordionItem[] = [
        {
          id: 'item-1',
          header: 'Section 1',
          content: 'Content 1',
          className: 'special-item',
        },
      ];

      render(<BaseAccordion items={itemsWithClass} />);
      const header = screen.getByText('Section 1');
      expect(header.parentElement).toHaveClass('special-item');
    });
  });
});
