import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerifyPage from '../page';
import QRCode from 'qrcode';

// Mock QRCode library
jest.mock('qrcode', () => ({
  toCanvas: jest.fn()
}));

describe('VerifyPage', () => {
  const advanceVerificationTimers = async (duration = 1500) => {
    await act(async () => {
      jest.advanceTimersByTime(duration);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Page Rendering', () => {
    it('should render the page with header and title', () => {
      render(<VerifyPage />);

      expect(screen.getByText('ตรวจสอบใบรับรอง GACP')).toBeInTheDocument();
      expect(screen.getByText('ระบบตรวจสอบความถูกต้องของใบรับรองมาตรฐาน')).toBeInTheDocument();
    });

    it('should render the verified user icon', () => {
      render(<VerifyPage />);

      const icon = document.querySelector('[data-testid="VerifiedUserIcon"]');
      expect(icon).toBeInTheDocument();
    });

    it('should render search box with instructions', () => {
      render(<VerifyPage />);

      expect(screen.getByText('กรอกเลขที่ใบรับรอง')).toBeInTheDocument();
      expect(screen.getByText('ตัวอย่าง: GACP-2025-0001')).toBeInTheDocument();
    });
  });

  describe('Input Field', () => {
    it('should render certificate number input field', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      expect(input).toBeInTheDocument();
    });

    it('should update input value when typing', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'gacp-2025-0001' } });

      expect(input.value).toBe('GACP-2025-0001');
    });

    it('should convert input to uppercase automatically', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'gacp-test-123' } });

      expect(input.value).toBe('GACP-TEST-123');
    });

    it('should trigger verification on Enter key press', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');

      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(screen.getByText('กำลังตรวจสอบ...')).toBeInTheDocument();
    });
  });

  describe('Search Button', () => {
    it('should render search button', () => {
      render(<VerifyPage />);

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      expect(button).toBeInTheDocument();
    });

    it('should show loading state when clicking verify button', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      expect(screen.getByText('กำลังตรวจสอบ...')).toBeInTheDocument();
    });

    it('should disable button during loading', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      expect(button).toBeDisabled();
    });

    it('should disable input field during loading', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      expect(input).toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('should show error when verifying empty certificate number', () => {
      render(<VerifyPage />);

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      expect(screen.getByText('กรุณากรอกเลขที่ใบรับรอง')).toBeInTheDocument();
    });

    it('should show error when verifying whitespace-only input', () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: '   ' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      expect(screen.getByText('กรุณากรอกเลขที่ใบรับรอง')).toBeInTheDocument();
    });

    it('should clear previous error when typing valid input', () => {
      render(<VerifyPage />);

      // First trigger error
      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);
      expect(screen.getByText('กรุณากรอกเลขที่ใบรับรอง')).toBeInTheDocument();

      // Then type valid input and verify
      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });
      fireEvent.click(button);

      expect(screen.queryByText('กรุณากรอกเลขที่ใบรับรอง')).not.toBeInTheDocument();
    });
  });

  describe('Valid Certificate Result', () => {
    it('should display success message for valid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('ใบรับรองถูกต้อง')).toBeInTheDocument();
      });
    });

    it('should display certificate number', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
      });
    });

    it('should display farm and farmer information', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('สวนมะม่วงทองดี')).toBeInTheDocument();
        expect(screen.getByText('นายสมชาย ใจดี')).toBeInTheDocument();
      });
    });

    it('should display address information', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(
          screen.getByText('123 หมู่ 5 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230')
        ).toBeInTheDocument();
      });
    });

    it('should display crop type and standard', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('มะม่วง')).toBeInTheDocument();
        expect(screen.getByText('GACP')).toBeInTheDocument();
      });
    });

    it('should display status chip with correct color', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        const statusChip = screen.getByText('ใช้งานได้');
        expect(statusChip).toBeInTheDocument();
        expect(statusChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
      });
    });

    it('should display issued and expiry dates', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('ออกให้')).toBeInTheDocument();
        expect(screen.getByText('หมดอายุ')).toBeInTheDocument();
      });
    });

    it('should display success alert message', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText(/ใบรับรองนี้ถูกต้องและยังคงใช้งานได้/)).toBeInTheDocument();
      });
    });

    it('should display check circle icon for valid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        const icon = document.querySelector('[data-testid="CheckCircleIcon"]');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Invalid Certificate Result', () => {
    it('should display error message for invalid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-CERT' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('ไม่พบใบรับรอง')).toBeInTheDocument();
      });
    });

    it('should display cancel icon for invalid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-CERT' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        const icon = document.querySelector('[data-testid="CancelIcon"]');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should not display certificate details for invalid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-CERT' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.queryByText('เกษตรกร')).not.toBeInTheDocument();
        expect(screen.queryByText('ฟาร์ม')).not.toBeInTheDocument();
      });
    });
  });

  describe('QR Code Generation', () => {
    it('should generate QR code for valid certificate', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(QRCode.toCanvas).toHaveBeenCalled();
      });
    });

    it('should display QR code section heading', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('QR Code ใบรับรอง')).toBeInTheDocument();
      });
    });

    it('should display QR code scan instruction', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('สแกน QR Code เพื่อตรวจสอบใบรับรอง')).toBeInTheDocument();
      });
    });

    it('should call QRCode.toCanvas with correct parameters', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(QRCode.toCanvas).toHaveBeenCalledWith(
          expect.any(Object),
          expect.stringContaining('GACP-2025-0001'),
          expect.objectContaining({
            width: 200,
            margin: 2
          })
        );
      });
    });

    it('should not generate QR code for invalid certificate', async () => {
      (QRCode.toCanvas as jest.Mock).mockClear();

      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-CERT' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(QRCode.toCanvas).not.toHaveBeenCalled();
      });
    });
  });

  describe('Info Section', () => {
    it('should display usage instructions when no result', () => {
      render(<VerifyPage />);

      expect(screen.getByText(/วิธีการใช้งาน:/)).toBeInTheDocument();
      expect(screen.getByText(/กรอกเลขที่ใบรับรองที่ต้องการตรวจสอบ/)).toBeInTheDocument();
    });

    it('should hide info section after showing results', async () => {
      render(<VerifyPage />);

      expect(screen.getByText(/วิธีการใช้งาน:/)).toBeInTheDocument();

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.queryByText(/วิธีการใช้งาน:/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Status Colors and Labels', () => {
    it('should display correct label for active status', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('ใช้งานได้')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Verifications', () => {
    it('should clear previous results when searching again', async () => {
      render(<VerifyPage />);

      // First search
      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      let button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        expect(screen.getByText('ใบรับรองถูกต้อง')).toBeInTheDocument();
      });

      // Second search
      fireEvent.change(input, { target: { value: 'INVALID-CERT' } });
      button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      // Should clear previous result during loading
      expect(screen.queryByText('ใบรับรองถูกต้อง')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design Elements', () => {
    it('should render all icon components', async () => {
      render(<VerifyPage />);

      const input = screen.getByPlaceholderText('GACP-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'GACP-2025-0001' } });

      const button = screen.getByRole('button', { name: /ตรวจสอบ/i });
      fireEvent.click(button);

      await advanceVerificationTimers();

      await waitFor(() => {
        const personIcon = document.querySelector('[data-testid="PersonIcon"]');
        const locationIcon = document.querySelector('[data-testid="LocationOnIcon"]');
        const eventIcons = document.querySelectorAll('[data-testid="EventIcon"]');

        expect(personIcon).toBeInTheDocument();
        expect(locationIcon).toBeInTheDocument();
        expect(eventIcons.length).toBeGreaterThan(0);
      });
    });
  });
});
