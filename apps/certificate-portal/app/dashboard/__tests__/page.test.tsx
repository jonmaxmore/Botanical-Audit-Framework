import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockLocalStorage.clear();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login if no token', () => {
      render(<DashboardPage />);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should not redirect if token exists', () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<DashboardPage />);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<DashboardPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show dashboard after loading', async () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<DashboardPage />);
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Page Rendering', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render page title', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should render Total Certificates stat', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Total Certificates')).toBeInTheDocument();
        expect(screen.getByText('1,234')).toBeInTheDocument();
      });
    });

    it('should render Pending stat', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('should render Approved stat', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('1,156')).toBeInTheDocument();
      });
    });

    it('should render Expiring Soon stat', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
        expect(screen.getByText('33')).toBeInTheDocument();
      });
    });

    it('should render recent certificates section', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/CERT-2025-001/)).toBeInTheDocument();
        expect(screen.getByText(/สวนทดสอบ A/)).toBeInTheDocument();
      });
    });

    it('should display multiple recent certificates', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/CERT-2025-001/)).toBeInTheDocument();
        expect(screen.getByText(/CERT-2025-002/)).toBeInTheDocument();
        expect(screen.getByText(/CERT-2025-003/)).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should display change percentages', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/\+12%/)).toBeInTheDocument();
        expect(screen.getByText(/\+8%/)).toBeInTheDocument();
        expect(screen.getByText(/\+15%/)).toBeInTheDocument();
      });
    });

    it('should render all 4 stat cards', async () => {
      render(<DashboardPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const statCards = [
          screen.getByText('Total Certificates'),
          screen.getByText('Pending'),
          screen.getByText('Approved'),
          screen.getByText('Expiring Soon'),
        ];
        expect(statCards).toHaveLength(4);
      });
    });
  });
});
