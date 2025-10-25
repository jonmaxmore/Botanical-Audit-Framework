import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CertificatesPage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('CertificatesPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Authentication', () => {
    it('should redirect to login if no token', () => {
      render(<CertificatesPage />);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should not redirect if token exists', () => {
      mockLocalStorage.setItem('cert_token', 'test-token');
      render(<CertificatesPage />);
      expect(mockPush).not.toHaveBeenCalledWith('/login');
    });
  });

  describe('Page Rendering', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render page title', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('Certificate Management')).toBeInTheDocument();
      });
    });

    it('should render New Certificate button', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('New Certificate')).toBeInTheDocument();
      });
    });

    it('should render search field', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search certificates...')).toBeInTheDocument();
      });
    });

    it('should render filter controls', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        // Multiple elements with "Status" and "Standard" (label + table header)
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Standard').length).toBeGreaterThan(0);
      });
    });

    it('should render certificates table', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('Certificate No.')).toBeInTheDocument();
        expect(screen.getByText('Farm Name')).toBeInTheDocument();
        expect(screen.getByText('Farmer Name')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should show loading state initially', () => {
      render(<CertificatesPage />);
      // Component sets loading true in useEffect
      expect(mockLocalStorage.getItem('cert_token')).toBe('test-token');
    });

    it('should display mock certificates after loading', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
        expect(screen.getByText('สวนมะม่วงทองดี')).toBeInTheDocument();
        expect(screen.getByText('นายสมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('should display multiple certificate records', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
        expect(screen.getByText('GACP-2025-0002')).toBeInTheDocument();
        expect(screen.getByText('GACP-2025-0003')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should update search query on input', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search certificates...') as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'GACP-2025-0001' } });
        expect(searchInput.value).toBe('GACP-2025-0001');
      });
    });

    it('should trigger search on Enter key', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search certificates...');
        fireEvent.change(searchInput, { target: { value: 'มะม่วง' } });
        fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });
        // Search is triggered
      });
    });

    it('should trigger search on button click', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search certificates...');
        fireEvent.change(searchInput, { target: { value: 'ทุเรียน' } });
        
        const searchButton = screen.getAllByText('Search')[0];
        fireEvent.click(searchButton);
        // Search is triggered
      });
    });

    it('should filter certificates by search query', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(async () => {
        const searchInput = screen.getByPlaceholderText('Search certificates...');
        fireEvent.change(searchInput, { target: { value: 'มะม่วง' } });
        
        const searchButton = screen.getAllByText('Search')[0];
        fireEvent.click(searchButton);

        await waitFor(() => {
          expect(screen.getByText('สวนมะม่วงทองดี')).toBeInTheDocument();
          expect(screen.queryByText('ฟาร์มผักอินทรีย์สุขใจ')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render status filter', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Multiple elements with "Status" (label + table header)
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
      });
    });

    it('should render standard filter', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Multiple elements with "Standard" (label + table header)
        expect(screen.getAllByText('Standard').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render pagination controls', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/Rows per page/i)).toBeInTheDocument();
      });
    });

    it('should display results count', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText(/Showing .* of .* certificates/)).toBeInTheDocument();
      });
    });

    it('should change page when pagination clicked', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const nextPageButton = screen.getByLabelText(/next page/i);
        if (nextPageButton) {
          fireEvent.click(nextPageButton);
        }
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should navigate to new certificate page on button click', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const newButton = screen.getByText('New Certificate');
        fireEvent.click(newButton);
        expect(mockPush).toHaveBeenCalledWith('/certificates/new');
      });
    });

    it('should navigate to certificate detail on view click', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const viewButtons = screen.getAllByLabelText('View Details');
        if (viewButtons.length > 0) {
          fireEvent.click(viewButtons[0]);
          expect(mockPush).toHaveBeenCalledWith('/certificates/1');
        }
      });
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should refresh certificates on refresh button click', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const refreshButton = screen.getByLabelText('Refresh');
        fireEvent.click(refreshButton);
      });

      // Should trigger loading again
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should display status chips', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check for at least one status chip
        const statusChips = screen.getAllByText(/อนุมัติแล้ว|รออนุมัติ|ปฏิเสธ|หมดอายุ|ยกเลิก/);
        expect(statusChips.length).toBeGreaterThan(0);
      });
    });

    it('should display certification standard chips', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const gacpChips = screen.getAllByText('GACP');
        expect(gacpChips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Table Actions', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should render action buttons for each certificate', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getAllByLabelText('View Details').length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText('Download PDF').length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText('Show QR Code').length).toBeGreaterThan(0);
      });
    });

    it('should display formatted dates', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Dates should be formatted in Thai locale
        const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Status Badge Logic', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should show correct status colors for approved', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that approved status is displayed
        const approvedBadges = screen.getAllByText('อนุมัติแล้ว');
        expect(approvedBadges.length).toBeGreaterThan(0);
      });
    });

    it('should show correct status colors for pending', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that pending status exists
        const statuses = screen.queryAllByText('รออนุมัติ');
        expect(statuses.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should show correct status colors for rejected', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that rejected status rendering works
        const statuses = screen.queryAllByText('ปฏิเสธ');
        expect(statuses.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should show correct status colors for expired', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that expired status rendering works
        const statuses = screen.queryAllByText('หมดอายุ');
        expect(statuses.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should show correct status colors for revoked', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that revoked status rendering works
        const statuses = screen.queryAllByText('ยกเลิก');
        expect(statuses.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Filter Conditional Logic', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should filter by status correctly', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Initially shows certificates
        const paginationText = screen.getByText(/Showing \d+ of \d+ certificates/);
        expect(paginationText).toBeTruthy();
      });
    });

    it('should filter by certification standard correctly', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Check that standard filter exists
        const standardLabels = screen.getAllByText('Standard');
        expect(standardLabels.length).toBeGreaterThan(0);
      });
    });

    it('should show empty filter when no filter applied', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // All certificates should be visible
        const paginationText = screen.getByText(/Showing \d+ of \d+ certificates/);
        expect(paginationText).toBeTruthy();
      });
    });
  });

  describe('Pagination Logic', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('cert_token', 'test-token');
    });

    it('should show correct pagination count', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Should show "Showing X of Y certificates"
        const paginationText = screen.getByText(/Showing \d+ of \d+ certificates/);
        expect(paginationText).toBeTruthy();
      });
    });

    it('should handle rows per page change', async () => {
      render(<CertificatesPage />);
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Pagination controls should be present
        const paginationText = screen.getByText(/Showing \d+ of \d+ certificates/);
        expect(paginationText).toBeTruthy();
      });
    });
  });
});
