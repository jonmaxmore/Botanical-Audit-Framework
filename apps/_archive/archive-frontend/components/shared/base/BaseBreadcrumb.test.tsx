import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseBreadcrumb, { BreadcrumbItem } from './BaseBreadcrumb';

describe('BaseBreadcrumb', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptop' },
  ];

  describe('Rendering', () => {
    it('renders breadcrumb navigation', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    it('renders all breadcrumb items', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    it('renders nothing when items array is empty', () => {
      const { container } = render(<BaseBreadcrumb items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when items is undefined', () => {
      const { container } = render(<BaseBreadcrumb items={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders links for items with href', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('renders last item as span without link', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      const lastItem = screen.getByText('Laptop');
      expect(lastItem.tagName).toBe('SPAN');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Separators', () => {
    it('renders slash separator by default', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} />);
      const separators = container.querySelectorAll('li[aria-hidden="true"]');
      expect(separators).toHaveLength(2); // Between 3 items
      expect(separators[0].textContent).toContain('/');
    });

    it('renders chevron separator', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} separator="chevron" />);
      const separators = container.querySelectorAll('li[aria-hidden="true"] svg');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('renders arrow separator', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} separator="arrow" />);
      const separators = container.querySelectorAll('li[aria-hidden="true"] svg');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('renders dot separator', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} separator="dot" />);
      const separators = container.querySelectorAll('li[aria-hidden="true"]');
      expect(separators[0].textContent).toContain('•');
    });

    it('renders custom separator', () => {
      const customSeparator = <span data-testid="custom-sep">→</span>;
      render(
        <BaseBreadcrumb
          items={mockItems}
          separator="custom"
          customSeparator={customSeparator}
        />
      );
      expect(screen.getAllByTestId('custom-sep')).toHaveLength(2);
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} size="small" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('text-xs');
    });

    it('applies medium size classes by default', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('text-sm');
    });

    it('applies large size classes', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} size="large" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('text-base');
    });
  });

  describe('Home Icon', () => {
    it('shows default home icon when showHomeIcon is true', () => {
      render(<BaseBreadcrumb items={mockItems} showHomeIcon />);
      const homeItem = screen.getByText('Home').closest('li');
      const icon = homeItem?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('does not show home icon by default', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      const homeItem = screen.getByText('Home').closest('li');
      const icon = homeItem?.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('renders custom home icon', () => {
      const customIcon = <span data-testid="custom-home">🏠</span>;
      render(<BaseBreadcrumb items={mockItems} showHomeIcon homeIcon={customIcon} />);
      expect(screen.getByTestId('custom-home')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders icons for items', () => {
      const itemsWithIcons: BreadcrumbItem[] = [
        {
          label: 'Home',
          href: '/',
          icon: <span data-testid="home-icon">🏠</span>,
        },
        {
          label: 'Products',
          href: '/products',
          icon: <span data-testid="products-icon">📦</span>,
        },
        { label: 'Laptop' },
      ];

      render(<BaseBreadcrumb items={itemsWithIcons} />);
      expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument(); // First item with showHomeIcon=false
      expect(screen.getByTestId('products-icon')).toBeInTheDocument();
    });

    it('renders icon for first item when showHomeIcon is false', () => {
      const itemsWithIcons: BreadcrumbItem[] = [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: <span data-testid="dashboard-icon">📊</span>,
        },
        { label: 'Settings' },
      ];

      render(<BaseBreadcrumb items={itemsWithIcons} />);
      expect(screen.queryByTestId('dashboard-icon')).not.toBeInTheDocument(); // Icon not shown for first item
    });
  });

  describe('Max Items (Collapse)', () => {
    const longItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Level 1', href: '/level1' },
      { label: 'Level 2', href: '/level1/level2' },
      { label: 'Level 3', href: '/level1/level2/level3' },
      { label: 'Level 4', href: '/level1/level2/level3/level4' },
      { label: 'Current' },
    ];

    it('shows all items when no maxItems is set', () => {
      render(<BaseBreadcrumb items={longItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Level 4')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('collapses items when maxItems is set', () => {
      render(<BaseBreadcrumb items={longItems} maxItems={4} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('ellipsis item is disabled', () => {
      render(<BaseBreadcrumb items={longItems} maxItems={3} />);
      const ellipsis = screen.getByText('...');
      expect(ellipsis).toHaveClass('cursor-default');
    });

    it('shows all items when total is less than maxItems', () => {
      const shortItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Laptop' },
      ];

      render(<BaseBreadcrumb items={shortItems} maxItems={5} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('calls onItemClick when item is clicked', () => {
      const handleClick = jest.fn();
      render(<BaseBreadcrumb items={mockItems} onItemClick={handleClick} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      fireEvent.click(homeLink);

      expect(handleClick).toHaveBeenCalledWith(mockItems[0], 0);
    });

    it('calls onItemClick with correct index', () => {
      const handleClick = jest.fn();
      render(<BaseBreadcrumb items={mockItems} onItemClick={handleClick} />);

      const productsLink = screen.getByRole('link', { name: /products/i });
      fireEvent.click(productsLink);

      expect(handleClick).toHaveBeenCalledWith(mockItems[1], 1);
    });

    it('does not call onItemClick for last item', () => {
      const handleClick = jest.fn();
      render(<BaseBreadcrumb items={mockItems} onItemClick={handleClick} />);

      const lastItem = screen.getByText('Laptop');
      fireEvent.click(lastItem);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onItemClick for disabled items', () => {
      const handleClick = jest.fn();
      const itemsWithDisabled: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Disabled', href: '/disabled', disabled: true },
        { label: 'Current' },
      ];

      render(<BaseBreadcrumb items={itemsWithDisabled} onItemClick={handleClick} />);

      const disabledItem = screen.getByText('Disabled');
      fireEvent.click(disabledItem);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled Items', () => {
    const itemsWithDisabled: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Restricted', href: '/restricted', disabled: true },
      { label: 'Current' },
    ];

    it('renders disabled item as span', () => {
      render(<BaseBreadcrumb items={itemsWithDisabled} />);
      const disabledItem = screen.getByText('Restricted');
      expect(disabledItem.tagName).toBe('SPAN');
    });

    it('applies disabled styling', () => {
      render(<BaseBreadcrumb items={itemsWithDisabled} />);
      const disabledItem = screen.getByText('Restricted');
      expect(disabledItem).toHaveClass('opacity-50');
    });

    it('disabled item is not clickable', () => {
      const handleClick = jest.fn();
      render(<BaseBreadcrumb items={itemsWithDisabled} onItemClick={handleClick} />);

      const disabledItem = screen.getByText('Restricted');
      fireEvent.click(disabledItem);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Responsive', () => {
    it('applies responsive classes by default', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('overflow-x-auto');
    });

    it('removes responsive classes when responsive is false', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} responsive={false} />);
      const nav = container.querySelector('nav');
      expect(nav).not.toHaveClass('overflow-x-auto');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    it('last item has aria-current="page"', () => {
      render(<BaseBreadcrumb items={mockItems} />);
      const lastItem = screen.getByText('Laptop');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });

    it('separators have aria-hidden="true"', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} />);
      const separators = container.querySelectorAll('li[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('uses semantic HTML (nav and ol)', () => {
      const { container } = render(<BaseBreadcrumb items={mockItems} />);
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('ol')).toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      const { container } = render(
        <BaseBreadcrumb items={mockItems} className="custom-breadcrumb" />
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-breadcrumb');
    });
  });

  describe('Items without href', () => {
    it('renders button for items without href (not last)', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home' }, // No href
        { label: 'Products', href: '/products' },
        { label: 'Laptop' },
      ];

      render(<BaseBreadcrumb items={items} onItemClick={jest.fn()} />);
      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toBeInTheDocument();
    });

    it('button item calls onItemClick', () => {
      const handleClick = jest.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Home' },
        { label: 'Current' },
      ];

      render(<BaseBreadcrumb items={items} onItemClick={handleClick} />);
      const homeButton = screen.getByRole('button', { name: /home/i });
      fireEvent.click(homeButton);

      expect(handleClick).toHaveBeenCalledWith(items[0], 0);
    });
  });

  describe('Edge Cases', () => {
    it('handles single item', () => {
      const singleItem: BreadcrumbItem[] = [{ label: 'Home' }];
      render(<BaseBreadcrumb items={singleItem} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
    });

    it('handles two items', () => {
      const twoItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Products' },
      ];
      render(<BaseBreadcrumb items={twoItems} />);
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByText('Products')).toHaveAttribute('aria-current', 'page');
    });

    it('handles very long labels', () => {
      const longLabelItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        {
          label: 'This is a very long breadcrumb label that might wrap or overflow',
          href: '/long',
        },
        { label: 'Current' },
      ];

      render(<BaseBreadcrumb items={longLabelItems} />);
      expect(screen.getByText(/This is a very long/i)).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialCharItems: BreadcrumbItem[] = [
        { label: 'Home & Dashboard', href: '/' },
        { label: 'Products <New>', href: '/products' },
        { label: 'Item #42' },
      ];

      render(<BaseBreadcrumb items={specialCharItems} />);
      expect(screen.getByText('Home & Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products <New>')).toBeInTheDocument();
      expect(screen.getByText('Item #42')).toBeInTheDocument();
    });
  });
});
