import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminHeader from '../AdminHeader';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AdminHeader', () => {
  const mockPush = jest.fn();
  const mockMenuClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render header with default title', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    expect(screen.getByText('แดชบอร์ด')).toBeInTheDocument();
  });

  it('should render header with custom title', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} title="จัดการผู้ใช้" />);
    
    expect(screen.getByText('จัดการผู้ใช้')).toBeInTheDocument();
  });

  it('should display user information from localStorage', () => {
    const mockUser = {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'ผู้ดูแลระบบ',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(<AdminHeader onMenuClick={mockMenuClick} />);

    expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    expect(screen.getByText('ผู้ดูแลระบบ')).toBeInTheDocument();
  });

  it('should display default user when localStorage is empty', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('should call onMenuClick when menu button is clicked', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);

    expect(mockMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should display notification badge with count', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    const notificationButton = screen.getByLabelText('notifications');
    expect(notificationButton).toBeInTheDocument();
    
    // Badge should show 3 notifications
    const badge = notificationButton.querySelector('.MuiBadge-badge');
    expect(badge).toHaveTextContent('3');
  });

  it('should open and close notification menu', async () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    const notificationButton = screen.getByLabelText('notifications');
    fireEvent.click(notificationButton);

    // Check notification menu opened
    await waitFor(() => {
      expect(screen.getByText('การแจ้งเตือน')).toBeInTheDocument();
    });

    expect(screen.getByText(/คำขอรับรองใหม่/)).toBeInTheDocument();
    expect(screen.getByText(/อนุมัติเรียบร้อย/)).toBeInTheDocument();

    // Close menu by clicking a notification
    const firstNotification = screen.getByText(/คำขอรับรองใหม่/);
    fireEvent.click(firstNotification);

    await waitFor(() => {
      expect(screen.queryByText('การแจ้งเตือน')).not.toBeInTheDocument();
    });
  });

  it('should navigate to settings when settings button is clicked', () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    const settingsButton = screen.getByLabelText('settings');
    fireEvent.click(settingsButton);

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('should open profile menu and show user details', async () => {
    const mockUser = {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'ผู้ดูแลระบบ',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    // Click on avatar to open menu
    const avatar = screen.getByText('ส').closest('div');
    if (avatar?.parentElement) {
      fireEvent.click(avatar.parentElement);
    }

    // Check profile menu opened with user details
    await waitFor(() => {
      const emailElements = screen.getAllByText('somchai@example.com');
      expect(emailElements.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText('ตั้งค่าบัญชี')).toBeInTheDocument();
    expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
  });

  it('should navigate to settings from profile menu', async () => {
    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    // Open profile menu
    const avatar = screen.getByText('A').closest('div');
    if (avatar?.parentElement) {
      fireEvent.click(avatar.parentElement);
    }

    // Click settings in menu
    await waitFor(() => {
      expect(screen.getByText('ตั้งค่าบัญชี')).toBeInTheDocument();
    });

    const settingsMenuItem = screen.getByText('ตั้งค่าบัญชี');
    fireEvent.click(settingsMenuItem);

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('should logout and redirect to login page', async () => {
    const mockUser = {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'ผู้ดูแลระบบ',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token-123');

    render(<AdminHeader onMenuClick={mockMenuClick} />);
    
    // Open profile menu
    const avatar = screen.getByText('ส').closest('div');
    if (avatar?.parentElement) {
      fireEvent.click(avatar.parentElement);
    }

    // Click logout
    await waitFor(() => {
      expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
    });

    const logoutMenuItem = screen.getByText('ออกจากระบบ');
    fireEvent.click(logoutMenuItem);

    // Verify localStorage cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    // Verify redirect to login
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should display user avatar initial', () => {
    const mockUser = {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'ผู้ดูแลระบบ',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(<AdminHeader onMenuClick={mockMenuClick} />);

    // Avatar should show first character of name
    expect(screen.getByText('ส')).toBeInTheDocument();
  });
});
