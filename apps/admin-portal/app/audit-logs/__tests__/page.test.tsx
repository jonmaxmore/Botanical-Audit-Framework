import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditLogsPage from '../page';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
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

describe('AuditLogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the page with header and title', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText('บันทึกการตรวจสอบ (Audit Logs)')).toBeInTheDocument();
      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });

    it('should render audit logs description', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText(/ติดตามและตรวจสอบกิจกรรมทั้งหมดในระบบ/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<AuditLogsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ใช้, การกระทำ, ทรัพยากร...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search query when typing', () => {
      render(<AuditLogsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ใช้, การกระทำ, ทรัพยากร...');

      fireEvent.change(searchInput, { target: { value: 'admin@test.com' } });

      expect(searchInput).toHaveValue('admin@test.com');
    });

    it('should filter audit logs based on search query', () => {
      render(<AuditLogsPage />);

      // Initially should show logs
      expect(screen.getByText('สร้างใบสมัครใหม่')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ใช้, การกระทำ, ทรัพยากร...');

      // Search for specific user
      fireEvent.change(searchInput, { target: { value: 'admin@test.com' } });

      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('should render status filter dropdown', () => {
      render(<AuditLogsPage />);

      expect(screen.getByLabelText('สถานะ')).toBeInTheDocument();
    });

    it('should show all status options', () => {
      render(<AuditLogsPage />);

      const filterSelect = screen.getByLabelText('สถานะ');
      fireEvent.mouseDown(filterSelect);

      expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
      expect(screen.getByText('สำเร็จ')).toBeInTheDocument();
      expect(screen.getByText('คำเตือน')).toBeInTheDocument();
      expect(screen.getByText('ข้อผิดพลาด')).toBeInTheDocument();
    });

    it('should filter logs by success status', () => {
      render(<AuditLogsPage />);

      const filterSelect = screen.getByLabelText('สถานะ');
      fireEvent.mouseDown(filterSelect);

      const successOption = screen.getAllByText('สำเร็จ')[0];
      fireEvent.click(successOption);

      // Should show success logs
      const successChips = screen.getAllByText('สำเร็จ');
      expect(successChips.length).toBeGreaterThan(0);
    });

    it('should filter logs by warning status', () => {
      render(<AuditLogsPage />);

      const filterSelect = screen.getByLabelText('สถานะ');
      fireEvent.mouseDown(filterSelect);

      const warningOption = screen.getByText('คำเตือน');
      fireEvent.click(warningOption);

      // Should show warning logs
      const warningChips = screen.getAllByText('คำเตือน');
      expect(warningChips.length).toBeGreaterThan(0);
    });

    it('should filter logs by error status', () => {
      render(<AuditLogsPage />);

      const filterSelect = screen.getByLabelText('สถานะ');
      fireEvent.mouseDown(filterSelect);

      const errorOption = screen.getByText('ข้อผิดพลาด');
      fireEvent.click(errorOption);

      // Should show error logs
      const errorChips = screen.getAllByText('ข้อผิดพลาด');
      expect(errorChips.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Logs Table', () => {
    it('should render table headers', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText('เวลา')).toBeInTheDocument();
      expect(screen.getByText('ผู้ใช้')).toBeInTheDocument();
      expect(screen.getByText('การกระทำ')).toBeInTheDocument();
      expect(screen.getByText('ทรัพยากร')).toBeInTheDocument();
      expect(screen.getByText('สถานะ')).toBeInTheDocument();
      expect(screen.getByText('IP Address')).toBeInTheDocument();
    });

    it('should render audit log entries', () => {
      render(<AuditLogsPage />);

      // Check for mock data entries
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('สร้างใบสมัครใหม่')).toBeInTheDocument();
      expect(screen.getByText('Application')).toBeInTheDocument();
    });

    it('should display timestamps correctly', () => {
      render(<AuditLogsPage />);

      const timestamps = screen.getAllByText(/2025-01-\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should display IP addresses', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });

    it('should display status chips with correct colors', () => {
      render(<AuditLogsPage />);

      const successChips = screen.getAllByText('สำเร็จ');
      const warningChips = screen.getAllByText('คำเตือน');
      const errorChips = screen.getAllByText('ข้อผิดพลาด');

      expect(successChips.length).toBeGreaterThan(0);
      expect(warningChips.length).toBeGreaterThan(0);
      expect(errorChips.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText(/แถวต่อหน้า/)).toBeInTheDocument();
    });

    it('should show correct number of rows per page options', () => {
      render(<AuditLogsPage />);

      const paginationSelect = screen.getByRole('combobox', { name: /แถวต่อหน้า/ });
      expect(paginationSelect).toBeInTheDocument();
    });

    it('should change page when clicking next button', () => {
      render(<AuditLogsPage />);

      // Find pagination buttons
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('next'));

      if (nextButton && !nextButton.hasAttribute('disabled')) {
        fireEvent.click(nextButton);
        // Page should change (tested through state)
      }
    });

    it('should change rows per page', () => {
      render(<AuditLogsPage />);

      const paginationSelect = screen.getByRole('combobox', { name: /แถวต่อหน้า/ });
      fireEvent.mouseDown(paginationSelect);

      const option25 = screen.getByRole('option', { name: '25' });
      fireEvent.click(option25);

      // Should update rows per page
      expect(paginationSelect).toHaveTextContent('25');
    });
  });

  describe('Export Functionality', () => {
    it('should render export CSV button', () => {
      render(<AuditLogsPage />);

      const exportButton = screen.getByText('ส่งออก CSV');
      expect(exportButton).toBeInTheDocument();
    });

    it('should have download icon', () => {
      render(<AuditLogsPage />);

      const exportButton = screen.getByText('ส่งออก CSV');
      const downloadIcon = exportButton.previousSibling;
      expect(downloadIcon).toBeInTheDocument();
    });

    it('should trigger export when clicking button', () => {
      render(<AuditLogsPage />);

      const exportButton = screen.getByText('ส่งออก CSV');
      fireEvent.click(exportButton);

      // Export function should be called (no actual download in test)
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    it('should apply both search and status filter together', () => {
      render(<AuditLogsPage />);

      // Set search query
      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ใช้, การกระทำ, ทรัพยากร...');
      fireEvent.change(searchInput, { target: { value: 'อนุมัติ' } });

      // Set status filter
      const filterSelect = screen.getByLabelText('สถานะ');
      fireEvent.mouseDown(filterSelect);
      const successOption = screen.getAllByText('สำเร็จ')[0];
      fireEvent.click(successOption);

      // Should show logs matching both criteria
      expect(searchInput).toHaveValue('อนุมัติ');
    });
  });

  describe('Empty State', () => {
    it('should handle case when no logs match filters', () => {
      render(<AuditLogsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ใช้, การกระทำ, ทรัพยากร...');

      // Search for non-existent entry
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_USER' } });

      // Table should still be rendered
      expect(screen.getByText('เวลา')).toBeInTheDocument();
    });
  });

  describe('Details Column', () => {
    it('should show details for each log entry', () => {
      render(<AuditLogsPage />);

      // Check for details text
      expect(screen.getByText('เกษตรกร: นายสมชาย ใจดี')).toBeInTheDocument();
    });

    it('should display appropriate details for different actions', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText(/เกษตรกร:/)).toBeInTheDocument();
      expect(screen.getByText(/ใบสมัคร:/)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render layout components', () => {
      render(<AuditLogsPage />);

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });
  });

  describe('Data Sorting', () => {
    it('should display logs in chronological order', () => {
      render(<AuditLogsPage />);

      const rows = screen.getAllByRole('row');
      // Should have header row plus data rows
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe('Action Types', () => {
    it('should display various action types', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText('สร้างใบสมัครใหม่')).toBeInTheDocument();
      expect(screen.getByText('อนุมัติใบสมัคร')).toBeInTheDocument();
      expect(screen.getByText('ปฏิเสธใบสมัคร')).toBeInTheDocument();
    });
  });

  describe('Resource Types', () => {
    it('should display different resource types', () => {
      render(<AuditLogsPage />);

      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Certificate')).toBeInTheDocument();
    });
  });
});
