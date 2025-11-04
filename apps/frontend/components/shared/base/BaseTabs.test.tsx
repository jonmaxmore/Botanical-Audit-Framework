/**
 * BaseTabs Component Tests
 * 
 * Test Coverage:
 * 1. Rendering & Display
 * 2. Tab Switching
 * 3. Keyboard Navigation
 * 4. Variants & Sizes
 * 5. Icons & Badges
 * 6. Controlled Mode
 * 7. Accessibility
 * 8. Edge Cases
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseTabs, { Tab } from './BaseTabs';

const mockTabs: Tab[] = [
  { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
];

describe('BaseTabs - Rendering', () => {
  it('renders all tabs', () => {
    render(<BaseTabs tabs={mockTabs} />);
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    render(<BaseTabs tabs={mockTabs} />);
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('hides inactive tab content', () => {
    render(<BaseTabs tabs={mockTabs} />);
    expect(screen.getByText('Content 2')).not.toBeVisible();
  });
});

describe('BaseTabs - Tab Switching', () => {
  it('switches tab on click', () => {
    render(<BaseTabs tabs={mockTabs} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Content 2')).toBeVisible();
    expect(screen.getByText('Content 1')).not.toBeVisible();
  });

  it('calls onChange callback', () => {
    const onChange = jest.fn();
    render(<BaseTabs tabs={mockTabs} onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(onChange).toHaveBeenCalledWith('tab2');
  });
});

describe('BaseTabs - Keyboard Navigation', () => {
  it('navigates with ArrowRight', () => {
    render(<BaseTabs tabs={mockTabs} />);
    const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('navigates with ArrowLeft', () => {
    render(<BaseTabs tabs={mockTabs} defaultActiveTab="tab2" />);
    const secondTab = screen.getByRole('tab', { name: 'Tab 2' });
    secondTab.focus();
    fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('wraps to first tab with ArrowRight on last tab', () => {
    render(<BaseTabs tabs={mockTabs} defaultActiveTab="tab3" />);
    const lastTab = screen.getByRole('tab', { name: 'Tab 3' });
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' });
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('goes to first tab with Home key', () => {
    render(<BaseTabs tabs={mockTabs} defaultActiveTab="tab3" />);
    const lastTab = screen.getByRole('tab', { name: 'Tab 3' });
    fireEvent.keyDown(lastTab, { key: 'Home' });
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('goes to last tab with End key', () => {
    render(<BaseTabs tabs={mockTabs} />);
    const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
    fireEvent.keyDown(firstTab, { key: 'End' });
    expect(screen.getByText('Content 3')).toBeVisible();
  });
});

describe('BaseTabs - Variants', () => {
  it('renders underline variant', () => {
    render(<BaseTabs tabs={mockTabs} variant="underline" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('border-b-2');
  });

  it('renders contained variant', () => {
    render(<BaseTabs tabs={mockTabs} variant="contained" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('rounded-t-lg');
  });

  it('renders pills variant', () => {
    render(<BaseTabs tabs={mockTabs} variant="pills" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('rounded-full');
  });
});

describe('BaseTabs - Sizes', () => {
  it('renders small size', () => {
    render(<BaseTabs tabs={mockTabs} size="small" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('text-sm');
  });

  it('renders medium size', () => {
    render(<BaseTabs tabs={mockTabs} size="medium" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('text-base');
  });

  it('renders large size', () => {
    render(<BaseTabs tabs={mockTabs} size="large" />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('text-lg');
  });
});

describe('BaseTabs - Icons & Badges', () => {
  it('renders tab with icon', () => {
    const tabsWithIcon: Tab[] = [
      { id: 'tab1', label: 'Tab 1', icon: <span data-testid="icon">🏠</span>, content: <div>Content</div> },
    ];
    render(<BaseTabs tabs={tabsWithIcon} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders tab with badge', () => {
    const tabsWithBadge: Tab[] = [
      { id: 'tab1', label: 'Tab 1', badge: '5', content: <div>Content</div> },
    ];
    render(<BaseTabs tabs={tabsWithBadge} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('BaseTabs - Controlled Mode', () => {
  it('uses controlled activeTab', () => {
    render(<BaseTabs tabs={mockTabs} activeTab="tab2" />);
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('updates when controlled activeTab changes', () => {
    const { rerender } = render(<BaseTabs tabs={mockTabs} activeTab="tab1" />);
    expect(screen.getByText('Content 1')).toBeVisible();
    
    rerender(<BaseTabs tabs={mockTabs} activeTab="tab3" />);
    expect(screen.getByText('Content 3')).toBeVisible();
  });
});

describe('BaseTabs - Disabled Tabs', () => {
  it('renders disabled tab', () => {
    const tabsWithDisabled: Tab[] = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
    ];
    render(<BaseTabs tabs={tabsWithDisabled} />);
    const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(disabledTab).toBeDisabled();
  });

  it('skips disabled tab in keyboard navigation', () => {
    const tabsWithDisabled: Tab[] = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
      { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
    ];
    render(<BaseTabs tabs={tabsWithDisabled} />);
    const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(screen.getByText('Content 3')).toBeVisible();
  });
});

describe('BaseTabs - Lazy Loading', () => {
  it('only renders active tab content when lazy', () => {
    render(<BaseTabs tabs={mockTabs} lazy />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });
});

describe('BaseTabs - Layout', () => {
  it('renders full width tabs', () => {
    const { container } = render(<BaseTabs tabs={mockTabs} fullWidth />);
    const tabs = container.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      expect(tab).toHaveStyle({ flex: 1 });
    });
  });

  it('centers tabs', () => {
    const { container } = render(<BaseTabs tabs={mockTabs} centered />);
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).toHaveClass('justify-center');
  });
});

describe('BaseTabs - Accessibility', () => {
  it('has correct ARIA attributes', () => {
    render(<BaseTabs tabs={mockTabs} />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', 'tabpanel-tab1');
  });

  it('tabpanel has correct ARIA attributes', () => {
    const { container } = render(<BaseTabs tabs={mockTabs} />);
    const panel = container.querySelector('#tabpanel-tab1');
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1');
  });

  it('active tab has tabIndex 0', () => {
    render(<BaseTabs tabs={mockTabs} />);
    const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(activeTab).toHaveAttribute('tabIndex', '0');
  });

  it('inactive tabs have tabIndex -1', () => {
    render(<BaseTabs tabs={mockTabs} />);
    const inactiveTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(inactiveTab).toHaveAttribute('tabIndex', '-1');
  });
});
