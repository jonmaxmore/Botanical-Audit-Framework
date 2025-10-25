import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import CertificateDetailPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
const mockParams = { id: '1' };
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
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

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true,
});

describe('CertificateDetailPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: mockEnqueueSnackbar });
    mockLocalStorage.clear();
    mockPush.mockClear();
    mockEnqueueSnackbar.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login if no token', () => {
      render(<CertificateDetailPage />);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should not redirect if token exists', () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<CertificateDetailPage />);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should show loading state initially', () => {
      render(<CertificateDetailPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show certificate after loading', async () => {
      render(<CertificateDetailPage />);
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getAllByText('GACP-2025-0001').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Page Rendering', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render certificate number', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getAllByText('GACP-2025-0001').length).toBeGreaterThan(0);
      });
    });

    it('should render farm information', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('สวนมะม่วงทองดี')).toBeInTheDocument();
        expect(screen.getByText('นายสมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /qr code/i })).toBeInTheDocument();
      });
    });

    it('should render back button', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const backButton = buttons.find(btn => btn.querySelector('[data-testid="ArrowBackIcon"]'));
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should render status chip', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('อนุมัติแล้ว')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should navigate back to certificates list on back button click', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const backButton = buttons.find(btn => btn.querySelector('[data-testid="ArrowBackIcon"]'));
        if (backButton) fireEvent.click(backButton);
      });
      
      expect(mockPush).toHaveBeenCalledWith('/certificates');
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should call window.print when print button clicked', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const printButton = screen.getByRole('button', { name: /print/i });
        fireEvent.click(printButton);
      });
      
      expect(window.print).toHaveBeenCalled();
    });

    it('should show notification when download PDF clicked', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });
        fireEvent.click(downloadButton);
      });
      
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Downloading PDF...', { variant: 'info' });
    });

    it('should open QR dialog when QR button clicked', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const qrButton = screen.getByRole('button', { name: /qr code/i });
        fireEvent.click(qrButton);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should display approved status with correct label', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('อนุมัติแล้ว')).toBeInTheDocument();
      });
    });
  });

  describe('Certificate Information Display', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should display farm area', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/15.5/)).toBeInTheDocument();
      });
    });

    it('should display crop type', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('มะม่วง')).toBeInTheDocument();
      });
    });

    it('should display certification standard', async () => {
      render(<CertificateDetailPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('GACP')).toBeInTheDocument();
      });
    });
  });
});
