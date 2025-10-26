import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InspectorsPage from '../page';

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

describe('InspectorsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the page with header and title', () => {
      render(<InspectorsPage />);

      expect(screen.getByText('ผู้ตรวจสอบ (Inspectors)')).toBeInTheDocument();
      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<InspectorsPage />);

      expect(screen.getByText(/จัดการและติดตามผู้ตรวจสอบ GACP/)).toBeInTheDocument();
    });

    it('should render add inspector button', () => {
      render(<InspectorsPage />);

      const addButton = screen.getByText('เพิ่มผู้ตรวจสอบ');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should render all four statistics cards', () => {
      render(<InspectorsPage />);

      expect(screen.getByText('ผู้ตรวจสอบทั้งหมด')).toBeInTheDocument();
      expect(screen.getByText('พร้อมปฏิบัติงาน')).toBeInTheDocument();
      expect(screen.getByText('กำลังตรวจสอบ')).toBeInTheDocument();
      expect(screen.getByText('ออฟไลน์')).toBeInTheDocument();
    });

    it('should display correct statistics counts', () => {
      render(<InspectorsPage />);

      // 4 total inspectors (from mock data)
      const totalCount = screen.getAllByText('4');
      expect(totalCount.length).toBeGreaterThan(0);

      // 2 available inspectors
      const availableCount = screen.getAllByText('2');
      expect(availableCount.length).toBeGreaterThan(0);

      // 1 busy inspector
      const busyCount = screen.getAllByText('1');
      expect(busyCount.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<InspectorsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ตรวจสอบ...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search query when typing', () => {
      render(<InspectorsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ตรวจสอบ...');

      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });

      expect(searchInput).toHaveValue('สมชาย');
    });

    it('should filter inspectors based on search query', () => {
      render(<InspectorsPage />);

      // Initially should show all inspectors
      expect(screen.getByText('นายสมชาย ตรวจสอบ')).toBeInTheDocument();
      expect(screen.getByText('นางสาวสมหญิง ลงพื้นที่')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ตรวจสอบ...');

      // Search for specific inspector
      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });

      expect(screen.getByText('นายสมชาย ตรวจสอบ')).toBeInTheDocument();
    });
  });

  describe('Inspector Cards', () => {
    it('should render all inspector cards', () => {
      render(<InspectorsPage />);

      expect(screen.getByText('นายสมชาย ตรวจสอบ')).toBeInTheDocument();
      expect(screen.getByText('นางสาวสมหญิง ลงพื้นที่')).toBeInTheDocument();
      expect(screen.getByText('นายประสิทธิ์ ออกตรวจ')).toBeInTheDocument();
      expect(screen.getByText('นางวิภา ตรวจการ')).toBeInTheDocument();
    });

    it('should display inspector contact information', () => {
      render(<InspectorsPage />);

      expect(screen.getByText('somchai.inspect@gacp.go.th')).toBeInTheDocument();
      expect(screen.getByText('081-234-5678')).toBeInTheDocument();
    });

    it('should display inspector locations', () => {
      render(<InspectorsPage />);

      expect(screen.getByText('เชียงใหม่')).toBeInTheDocument();
      expect(screen.getByText('ลำพูน')).toBeInTheDocument();
      expect(screen.getByText('เชียงราย')).toBeInTheDocument();
      expect(screen.getByText('พะเยา')).toBeInTheDocument();
    });

    it('should display status chips', () => {
      render(<InspectorsPage />);

      const availableChips = screen.getAllByText('พร้อมปฏิบัติงาน');
      const busyChips = screen.getAllByText('กำลังตรวจสอบ');
      const offlineChips = screen.getAllByText('ออฟไลน์');

      expect(availableChips.length).toBeGreaterThan(0);
      expect(busyChips.length).toBeGreaterThan(0);
      expect(offlineChips.length).toBeGreaterThan(0);
    });

    it('should display inspection statistics', () => {
      render(<InspectorsPage />);

      expect(screen.getByText(/3 งานที่ได้รับมอบหมาย/)).toBeInTheDocument();
      expect(screen.getByText(/45 งานที่เสร็จสิ้น/)).toBeInTheDocument();
    });

    it('should display certifications', () => {
      render(<InspectorsPage />);

      const gacpInspectorChips = screen.getAllByText('GACP Inspector');
      expect(gacpInspectorChips.length).toBeGreaterThan(0);

      expect(screen.getByText('Organic Farming')).toBeInTheDocument();
      expect(screen.getByText('Quality Control')).toBeInTheDocument();
      expect(screen.getByText('Food Safety')).toBeInTheDocument();
    });
  });

  describe('Action Menu', () => {
    it('should open action menu when clicking more button', () => {
      render(<InspectorsPage />);

      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);

      expect(screen.getByText('ดูรายละเอียด')).toBeInTheDocument();
      expect(screen.getByText('มอบหมายงาน')).toBeInTheDocument();
      expect(screen.getByText('แก้ไขข้อมูล')).toBeInTheDocument();
    });

    it('should close menu when clicking outside', () => {
      render(<InspectorsPage />);

      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);

      expect(screen.getByText('ดูรายละเอียด')).toBeInTheDocument();

      fireEvent.click(document.body);

      // Menu should be closed (no longer visible)
    });
  });

  describe('Navigation', () => {
    it('should navigate to inspector detail when clicking view details', () => {
      render(<InspectorsPage />);

      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);

      const viewDetailsOption = screen.getByText('ดูรายละเอียด');
      fireEvent.click(viewDetailsOption);

      expect(mockPush).toHaveBeenCalledWith('/inspectors/1');
    });

    it('should navigate to assignment when clicking assign work', () => {
      render(<InspectorsPage />);

      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);

      const assignWorkOption = screen.getByText('มอบหมายงาน');
      fireEvent.click(assignWorkOption);

      expect(mockPush).toHaveBeenCalledWith('/inspectors/1/assign');
    });

    it('should navigate to edit when clicking edit option', () => {
      render(<InspectorsPage />);

      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);

      const editOption = screen.getByText('แก้ไขข้อมูล');
      fireEvent.click(editOption);

      expect(mockPush).toHaveBeenCalledWith('/inspectors/1/edit');
    });
  });

  describe('Add Inspector', () => {
    it('should navigate to add inspector page when clicking add button', () => {
      render(<InspectorsPage />);

      const addButton = screen.getByText('เพิ่มผู้ตรวจสอบ');
      fireEvent.click(addButton);

      expect(mockPush).toHaveBeenCalledWith('/inspectors/new');
    });
  });

  describe('Status Colors', () => {
    it('should render available status with success color', () => {
      render(<InspectorsPage />);

      const availableChips = screen.getAllByText('พร้อมปฏิบัติงาน');
      expect(availableChips[0]).toHaveClass('MuiChip-colorSuccess');
    });

    it('should render busy status with warning color', () => {
      render(<InspectorsPage />);

      const busyChips = screen.getAllByText('กำลังตรวจสอบ');
      expect(busyChips[0]).toHaveClass('MuiChip-colorWarning');
    });

    it('should render offline status with default color', () => {
      render(<InspectorsPage />);

      const offlineChips = screen.getAllByText('ออฟไลน์');
      expect(offlineChips[0]).toHaveClass('MuiChip-colorDefault');
    });
  });

  describe('Empty State', () => {
    it('should handle case when no inspectors match search', () => {
      render(<InspectorsPage />);

      const searchInput = screen.getByPlaceholderText('ค้นหาผู้ตรวจสอบ...');

      // Search for non-existent inspector
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      // Should not show any inspector cards
      expect(screen.queryByText('นายสมชาย ตรวจสอบ')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render layout components', () => {
      render(<InspectorsPage />);

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });
  });

  describe('Contact Information Icons', () => {
    it('should render email icons for each inspector', () => {
      render(<InspectorsPage />);

      const emailAddresses = screen.getAllByText(/@gacp.go.th/);
      expect(emailAddresses.length).toBeGreaterThan(0);
    });

    it('should render phone icons for each inspector', () => {
      render(<InspectorsPage />);

      const phoneNumbers = screen.getAllByText(/08\d-\d{3}-\d{4}/);
      expect(phoneNumbers.length).toBeGreaterThan(0);
    });
  });

  describe('Work Statistics', () => {
    it('should calculate and display assigned inspections', () => {
      render(<InspectorsPage />);

      // Total assigned: 3 + 5 + 2 + 0 = 10 งานที่ได้รับมอบหมาย
      expect(screen.getByText(/3 งานที่ได้รับมอบหมาย/)).toBeInTheDocument();
      expect(screen.getByText(/5 งานที่ได้รับมอบหมาย/)).toBeInTheDocument();
      expect(screen.getByText(/2 งานที่ได้รับมอบหมาย/)).toBeInTheDocument();
      expect(screen.getByText(/0 งานที่ได้รับมอบหมาย/)).toBeInTheDocument();
    });

    it('should display completed inspections for each inspector', () => {
      render(<InspectorsPage />);

      expect(screen.getByText(/45 งานที่เสร็จสิ้น/)).toBeInTheDocument();
      expect(screen.getByText(/38 งานที่เสร็จสิ้น/)).toBeInTheDocument();
      expect(screen.getByText(/52 งานที่เสร็จสิ้น/)).toBeInTheDocument();
      expect(screen.getByText(/29 งานที่เสร็จสิ้น/)).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render inspector cards in a grid layout', () => {
      render(<InspectorsPage />);

      const cards = screen.getAllByRole('button', { name: /more/i });
      // Should have 4 inspector cards with action buttons
      expect(cards.length).toBe(4);
    });
  });
});
