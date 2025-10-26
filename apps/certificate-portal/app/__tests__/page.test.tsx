import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  })
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('should render main heading', () => {
      render(<HomePage />);
      const headings = screen.getAllByText(/ระบบยื่นขอใบรับรอง GACP/i);
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should render subtitle', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/ยื่นคำขอใบรับรองมาตรฐาน GACP ออนไลน์ สะดวก รวดเร็ว ปลอดภัย/i),
      ).toBeInTheDocument();
    });

    it('should render "ยื่นคำขอใหม่" button', () => {
      render(<HomePage />);
      expect(screen.getByRole('button', { name: /ยื่นคำขอใหม่/i })).toBeInTheDocument();
    });

    it('should render "คำขอของฉัน" button', () => {
      render(<HomePage />);
      expect(screen.getByRole('button', { name: /คำขอของฉัน/i })).toBeInTheDocument();
    });

    it('should navigate to /application/new when clicking "ยื่นคำขอใหม่"', () => {
      render(<HomePage />);
      const button = screen.getByRole('button', { name: /ยื่นคำขอใหม่/i });
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/application/new');
    });

    it('should navigate to /applications when clicking "คำขอของฉัน"', () => {
      render(<HomePage />);
      const button = screen.getByRole('button', { name: /คำขอของฉัน/i });
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/applications');
    });
  });

  describe('Features Section', () => {
    it('should render features heading', () => {
      render(<HomePage />);
      expect(screen.getByText(/ขั้นตอนการยื่นคำขอ/i)).toBeInTheDocument();
    });

    it('should render "ยื่นคำขอใบรับรอง" feature', () => {
      render(<HomePage />);
      const featureTexts = screen.getAllByText(/ยื่นคำขอใบรับรอง/i);
      expect(featureTexts.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/ยื่นขอใบรับรองมาตรฐาน GACP ออนไลน์ได้ตลอด 24 ชั่วโมง/i),
      ).toBeInTheDocument();
    });

    it('should render "อัปโหลดเอกสาร" feature', () => {
      render(<HomePage />);
      const uploadTexts = screen.getAllByText(/อัปโหลดเอกสาร/i);
      expect(uploadTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/แนบเอกสารประกอบคำขอได้อย่างปลอดภัยและสะดวก/i)).toBeInTheDocument();
    });

    it('should render "ติดตามสถานะ" feature', () => {
      render(<HomePage />);
      expect(screen.getByText(/ติดตามสถานะ/i)).toBeInTheDocument();
      expect(screen.getByText(/ตรวจสอบสถานะคำขอและความคืบหน้าแบบ Real-time/i)).toBeInTheDocument();
    });

    it('should render all 3 feature icons', () => {
      render(<HomePage />);
      const icons = [
        screen.getByTestId('VerifiedUserIcon'),
        screen.getByTestId('PictureAsPdfIcon'),
        screen.getByTestId('CheckCircleIcon'),
      ];
      icons.forEach(icon => expect(icon).toBeInTheDocument());
    });
  });

  describe('Process Steps Section', () => {
    it('should render process steps heading', () => {
      render(<HomePage />);
      expect(screen.getByText(/ขั้นตอนการดำเนินการ/i)).toBeInTheDocument();
    });

    it('should render step 1: ยื่นคำขอและชำระเงิน', () => {
      render(<HomePage />);
      expect(screen.getByText(/1️⃣ ยื่นคำขอและชำระเงิน/i)).toBeInTheDocument();
      expect(
        screen.getByText(/กรอกข้อมูลและอัปโหลดเอกสาร จากนั้นชำระค่าธรรมเนียม 5,000 บาท/i),
      ).toBeInTheDocument();
    });

    it('should render step 2: ตรวจสอบเอกสาร', () => {
      render(<HomePage />);
      expect(screen.getByText(/2️⃣ ตรวจสอบเอกสาร/i)).toBeInTheDocument();
      expect(
        screen.getByText(/เจ้าหน้าที่ตรวจสอบความถูกต้องของเอกสาร \(ใช้เวลา 3-5 วันทำการ\)/i),
      ).toBeInTheDocument();
    });

    it('should render step 3: ตรวจสอบภาคสนาม', () => {
      render(<HomePage />);
      expect(screen.getByText(/3️⃣ ตรวจสอบภาคสนาม/i)).toBeInTheDocument();
      expect(
        screen.getByText(/ชำระค่าธรรมเนียม 25,000 บาท และนัดหมายตรวจฟาร์ม/i),
      ).toBeInTheDocument();
    });
  });

  describe('Stats Section', () => {
    it('should render fee information', () => {
      render(<HomePage />);
      expect(screen.getByText(/30,000 ฿/i)).toBeInTheDocument();
      const feeTexts = screen.getAllByText(/ค่าธรรมเนียม/i);
      expect(feeTexts.length).toBeGreaterThan(0);
    });

    it('should render processing time', () => {
      render(<HomePage />);
      expect(screen.getByText(/14-21/i)).toBeInTheDocument();
      const timeTexts = screen.getAllByText(/วันทำการ/i);
      expect(timeTexts.length).toBeGreaterThan(0);
    });

    it('should render 24/7 online service', () => {
      render(<HomePage />);
      expect(screen.getByText(/24\/7/i)).toBeInTheDocument();
      expect(screen.getByText(/บริการออนไลน์/i)).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render copyright text', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/© 2025 ระบบยื่นขอใบรับรอง GACP - กรมวิชาการเกษตร/i),
      ).toBeInTheDocument();
    });

    it('should render contact information', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/สอบถามข้อมูลเพิ่มเติม: โทร 02-XXX-XXXX หรือ Email: gacp@doa\.go\.th/i),
      ).toBeInTheDocument();
    });
  });
});
