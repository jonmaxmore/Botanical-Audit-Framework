import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardLayout from '../DashboardLayout';

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Layout Rendering', () => {
    it('should render layout with children', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render app title in drawer', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );
      const titles = screen.getAllByText('Certificate Portal');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render user avatar', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );
      expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
    });
  });

  describe('Navigation Menu', () => {
    it('should render all menu items', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // All menu items - use getAllByText to handle potential duplicates
      const menuItems = [
        'Dashboard',
        'Certificates',
        'QR Scanner',
        'Search',
        'Reports',
        'Settings',
      ];
      menuItems.forEach((item) => {
        expect(screen.getAllByText(item).length).toBeGreaterThan(0);
      });
    });

    it('should navigate to dashboard when clicking Dashboard menu', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const buttons = screen.getAllByText('Dashboard');
      const dashboardButton = buttons[0].closest('[role="button"]');
      expect(dashboardButton).toBeInTheDocument();
      fireEvent.click(dashboardButton!);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to certificates when clicking Certificates menu', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const buttons = screen.getAllByText('Certificates');
      const certificatesButton = buttons[0].closest('[role="button"]');
      expect(certificatesButton).toBeInTheDocument();
      fireEvent.click(certificatesButton!);
      expect(mockPush).toHaveBeenCalledWith('/certificates');
    });

    it('should navigate to settings when clicking Settings menu', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const buttons = screen.getAllByText('Settings');
      const settingsButton = buttons[0].closest('[role="button"]');
      expect(settingsButton).toBeInTheDocument();
      fireEvent.click(settingsButton!);
      expect(mockPush).toHaveBeenCalledWith('/settings');
    });
  });

  describe('User Menu', () => {
    it('should open user menu when clicking avatar', async () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const avatarButton = screen.getByTestId('AccountCircleIcon').closest('button');
      expect(avatarButton).toBeInTheDocument();
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should navigate to profile when clicking Profile menu item', async () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const avatarButton = screen.getByTestId('AccountCircleIcon').closest('button');
      expect(avatarButton).toBeInTheDocument();
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        const profileItem = screen.getByText('Profile').closest('li');
        expect(profileItem).toBeInTheDocument();
        fireEvent.click(profileItem!);
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('should logout and redirect to login when clicking Logout', async () => {
      localStorageMock.setItem('cert_token', 'test-token');
      localStorageMock.setItem('cert_user', JSON.stringify({ id: '1' }));

      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const avatarButton = screen.getByTestId('AccountCircleIcon').closest('button');
      expect(avatarButton).toBeInTheDocument();
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        const logoutItem = screen.getByText('Logout').closest('li');
        expect(logoutItem).toBeInTheDocument();
        fireEvent.click(logoutItem!);
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cert_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cert_user');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Active Menu State', () => {
    it('should highlight active menu item for /dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');

      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const buttons = screen.getAllByText('Dashboard');
      const dashboardButton = buttons[0].closest('[role="button"]');
      expect(dashboardButton?.className).toContain('Mui-selected');
    });

    it('should highlight active menu item for /certificates', () => {
      mockPathname.mockReturnValue('/certificates');

      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const buttons = screen.getAllByText('Certificates');
      const certificatesButton = buttons[0].closest('[role="button"]');
      expect(certificatesButton?.className).toContain('Mui-selected');
    });
  });

  describe('Mobile Drawer', () => {
    it('should have mobile menu button', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('MenuIcon')).toBeInTheDocument();
    });
  });
});
