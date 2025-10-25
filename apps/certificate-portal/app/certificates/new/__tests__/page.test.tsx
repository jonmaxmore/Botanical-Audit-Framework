import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import NewCertificatePage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
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

// Mock console.log to suppress noise in tests
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalLog;
});


describe('NewCertificatePage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: mockEnqueueSnackbar });
    mockLocalStorage.clear();
    mockPush.mockClear();
    mockEnqueueSnackbar.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login if no token', () => {
      render(<NewCertificatePage />);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should not redirect if token exists', () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<NewCertificatePage />);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Page Rendering', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render page title', () => {
      render(<NewCertificatePage />);
      expect(screen.getByText('New Certificate')).toBeInTheDocument();
    });

    it('should render stepper with 3 steps', () => {
      render(<NewCertificatePage />);
      expect(screen.getAllByText('Farm Information').length).toBeGreaterThan(0);
      expect(screen.getByText('Inspection Details')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<NewCertificatePage />);
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find(btn => btn.querySelector('[data-testid="ArrowBackIcon"]'));
      expect(backButton).toBeInTheDocument();
    });

    it('should start at step 0 (Farm Information)', () => {
      render(<NewCertificatePage />);
      expect(screen.getByText(/Enter the basic information about the farm/i)).toBeInTheDocument();
    });

    it('should render Next button', () => {
      render(<NewCertificatePage />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Step 1: Farm Information Fields', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render Farm ID field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Farm ID/i)).toBeInTheDocument();
    });

    it('should render Farm Name field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Farm Name/i)).toBeInTheDocument();
    });

    it('should render Farmer Name field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Farmer Name/i)).toBeInTheDocument();
    });

    it('should render National ID field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/National ID/i)).toBeInTheDocument();
    });

    it('should render Farm Area field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Farm Area/i)).toBeInTheDocument();
    });

    it('should render House Number field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/House Number/i)).toBeInTheDocument();
    });

    it('should render Village field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Village/i)).toBeInTheDocument();
    });

    it('should render Postal Code field', () => {
      render(<NewCertificatePage />);
      expect(screen.getByLabelText(/Postal Code/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should allow typing in Farm ID field', async () => {
      render(<NewCertificatePage />);
      const farmIdInput = screen.getByLabelText(/Farm ID/i);
      await userEvent.type(farmIdInput, 'F001');
      expect(farmIdInput).toHaveValue('F001');
    });

    it('should allow typing in Farm Name field', async () => {
      render(<NewCertificatePage />);
      const farmNameInput = screen.getByLabelText(/Farm Name/i);
      await userEvent.type(farmNameInput, 'Test Farm');
      expect(farmNameInput).toHaveValue('Test Farm');
    });

    it('should allow typing in National ID field', async () => {
      render(<NewCertificatePage />);
      const nationalIdInput = screen.getByLabelText(/National ID/i);
      await userEvent.type(nationalIdInput, '1101701544722');
      expect(nationalIdInput).toHaveValue('1101701544722');
    });
  });

  describe('Step Navigation', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should have Next button visible on step 1', () => {
      render(<NewCertificatePage />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should disable Back button on first step', () => {
      render(<NewCertificatePage />);
      // The step navigation "Back" button (not the ArrowBack icon button for list navigation)
      const backButton = screen.getByRole('button', { name: /^back$/i });
      expect(backButton).toBeDisabled();
    });
  });
});
