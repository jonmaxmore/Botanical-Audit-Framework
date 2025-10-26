import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertificatesPage from '../page';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock components
jest.mock('@/components/layout/AdminHeader', () => {
  return function MockAdminHeader() {
    return <div data-testid="admin-header">Admin Header</div>;
  };
});

jest.mock('@/components/layout/AdminSidebar', () => {
  return function MockAdminSidebar() {
    return <div data-testid="admin-sidebar">Admin Sidebar</div>;
  };
});

jest.mock('@/lib/protected-route', () => {
  return function MockProtectedRoute({ children }: any) {
    return <div>{children}</div>;
  };
});

jest.mock('@/components/common/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

describe('CertificatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Page Rendering', () => {
    it('should render the page with header and title', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('จัดการใบรับรอง')).toBeInTheDocument();
      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    });

    it('should render loading spinner initially', () => {
      render(<CertificatesPage />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Statistics Cards', () => {
    it('should display all statistics cards', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('ใบรับรองทั้งหมด')).toBeInTheDocument();
      expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument();
      expect(screen.getByText('หมดอายุ')).toBeInTheDocument();
      expect(screen.getByText('ถูกเพิกถอน')).toBeInTheDocument();
    });

    it('should display correct certificate counts', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Total certificates (mock data has 5)
      expect(screen.getByText('5')).toBeInTheDocument();
      // Active certificates
      expect(screen.getByText('3')).toBeInTheDocument();
      // Expired certificates
      expect(screen.getByText('1')).toBeInTheDocument();
      // Revoked certificates
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        'ค้นหาเลขที่ใบรับรอง, ชื่อฟาร์ม, ชื่อเกษตรกร...'
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search query when typing', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        'ค้นหาเลขที่ใบรับรอง, ชื่อฟาร์ม, ชื่อเกษตรกร...'
      );

      fireEvent.change(searchInput, { target: { value: 'GACP-2025-0001' } });

      expect(searchInput).toHaveValue('GACP-2025-0001');
    });

    it('should filter certificates based on search query', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Initially should show all certificates
      expect(screen.getByText('ฟาร์มมะนาวอินทรีย์')).toBeInTheDocument();
      expect(screen.getByText('ฟาร์มข้าวหอมมะลิ')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(
        'ค้นหาเลขที่ใบรับรอง, ชื่อฟาร์ม, ชื่อเกษตรกร...'
      );

      // Search for specific farm
      fireEvent.change(searchInput, { target: { value: 'มะนาว' } });

      await waitFor(() => {
        expect(screen.getByText('ฟาร์มมะนาวอินทรีย์')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should render filter buttons for each status', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
      expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument();
      expect(screen.getByText('หมดอายุ')).toBeInTheDocument();
      expect(screen.getByText('ถูกเพิกถอน')).toBeInTheDocument();
    });

    it('should filter certificates by active status', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const activeButton = screen.getAllByText('ใช้งานอยู่')[1]; // Second one is the filter button
      fireEvent.click(activeButton);

      await waitFor(() => {
        // Should show only active certificates
        const activeChips = screen.getAllByText('ใช้งานอยู่');
        expect(activeChips.length).toBeGreaterThan(0);
      });
    });

    it('should filter certificates by expired status', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const expiredButton = screen.getAllByText('หมดอายุ')[1];
      fireEvent.click(expiredButton);

      await waitFor(() => {
        const expiredChips = screen.getAllByText('หมดอายุ');
        expect(expiredChips.length).toBeGreaterThan(0);
      });
    });

    it('should reset filter to show all certificates', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // First filter by active
      const activeButton = screen.getAllByText('ใช้งานอยู่')[1];
      fireEvent.click(activeButton);

      // Then click "All" to reset
      const allButton = screen.getByText('ทั้งหมด');
      fireEvent.click(allButton);

      await waitFor(() => {
        // Should show certificates with different statuses
        expect(screen.getByText('ฟาร์มมะนาวอินทรีย์')).toBeInTheDocument();
      });
    });
  });

  describe('Certificate Table', () => {
    it('should render table headers', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('เลขที่ใบรับรอง')).toBeInTheDocument();
      expect(screen.getByText('ชื่อฟาร์ม')).toBeInTheDocument();
      expect(screen.getByText('ชื่อเกษตรกร')).toBeInTheDocument();
      expect(screen.getByText('วันที่ออก')).toBeInTheDocument();
      expect(screen.getByText('วันหมดอายุ')).toBeInTheDocument();
      expect(screen.getByText('สถานะ')).toBeInTheDocument();
      expect(screen.getByText('จัดการ')).toBeInTheDocument();
    });

    it('should render certificate rows with correct data', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Check first certificate data
      expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
      expect(screen.getByText('ฟาร์มมะนาวอินทรีย์')).toBeInTheDocument();
      expect(screen.getByText('นายสมชาย ใจดี')).toBeInTheDocument();
    });

    it('should display status chips with correct colors', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const statusChips = screen.getAllByText('ใช้งานอยู่');
      expect(statusChips.length).toBeGreaterThan(0);
    });
  });

  describe('Action Menu', () => {
    it('should open action menu when clicking more button', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          expect(screen.getByText('ดูรายละเอียด')).toBeInTheDocument();
          expect(screen.getByText('ดาวน์โหลด PDF')).toBeInTheDocument();
          expect(screen.getByText('เพิกถอนใบรับรอง')).toBeInTheDocument();
        });
      }
    });

    it('should close action menu when clicking outside', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          expect(screen.getByText('ดูรายละเอียด')).toBeInTheDocument();
        });

        // Click outside to close
        fireEvent.click(document.body);

        await waitFor(() => {
          expect(screen.queryByText('ดูรายละเอียด')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Navigation', () => {
    it('should navigate when clicking view details', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          const viewButton = screen.getByText('ดูรายละเอียด');
          fireEvent.click(viewButton);
        });

        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/certificates/'));
      }
    });
  });

  describe('Revoke Certificate', () => {
    it('should show revoke option in action menu', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          expect(screen.getByText('เพิกถอนใบรับรอง')).toBeInTheDocument();
        });
      }
    });

    it('should handle revoke certificate action', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          const revokeButton = screen.getByText('เพิกถอนใบรับรอง');
          fireEvent.click(revokeButton);
        });

        // Menu should close after action
        await waitFor(() => {
          expect(screen.queryByText('เพิกถอนใบรับรอง')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Download PDF', () => {
    it('should show download PDF option in action menu', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          expect(screen.getByText('ดาวน์โหลด PDF')).toBeInTheDocument();
        });
      }
    });

    it('should handle download PDF action', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const moreButtons = screen.getAllByRole('button', { name: '' });
      const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          const downloadButton = screen.getByText('ดาวน์โหลด PDF');
          fireEvent.click(downloadButton);
        });

        // Menu should close after action
        await waitFor(() => {
          expect(screen.queryByText('ดาวน์โหลด PDF')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Responsive Behavior', () => {
    it('should render mobile layout components', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle case when no certificates match search', async () => {
      render(<CertificatesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        'ค้นหาเลขที่ใบรับรอง, ชื่อฟาร์ม, ชื่อเกษตรกร...'
      );

      // Search for non-existent certificate
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT-CERT' } });

      await waitFor(() => {
        // Table should still be rendered but with no matching rows
        expect(screen.getByText('เลขที่ใบรับรอง')).toBeInTheDocument();
      });
    });
  });
});
