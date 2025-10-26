/**
 * PDF Generator Unit Tests
 */

import {
  generateSimpleCertificatePDF,
  downloadPDF,
  openPDFInNewWindow,
  getPDFBlob,
  getPDFDataURL,
} from '../pdf-generator';
import { Certificate } from '../../types/certificate';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      }
    },
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setTextColor: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
    output: jest.fn((type: string) => {
      if (type === 'blob') {
        return new Blob(['mock-pdf'], { type: 'application/pdf' });
      }
      if (type === 'dataurlstring') {
        return 'data:application/pdf;base64,mock-pdf-data';
      }
      return 'mock-output';
    }),
  }));
});

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,mock-canvas',
    height: 800,
    width: 600,
  });
});

describe('PDF Generator', () => {
  const mockCertificate: Certificate = {
    id: 'cert-123',
    certificateNumber: 'GACP-2025-001',
    farmId: 'farm-456',
    farmName: 'Test Farm',
    farmerName: 'John Doe',
    farmerNationalId: '1234567890123',
    address: {
      houseNumber: '123',
      village: 'Test Village',
      subdistrict: 'Test Sub',
      district: 'Test District',
      province: 'Bangkok',
      postalCode: '10110',
    },
    farmArea: 15.5,
    cropType: 'Rice',
    certificationStandard: 'GACP',
    status: 'active',
    issuedBy: 'Department of Agriculture',
    issuedDate: '2025-01-01',
    expiryDate: '2026-01-01',
    inspectionDate: '2024-12-15',
    inspectorName: 'Inspector Smith',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  };

  describe('generateSimpleCertificatePDF', () => {
    it('should generate PDF with certificate data', () => {
      const pdf = generateSimpleCertificatePDF(mockCertificate);

      expect(pdf).toBeDefined();
      expect(pdf.setFontSize).toHaveBeenCalled();
      expect(pdf.text).toHaveBeenCalled();
    });

    it('should include QR code if provided', () => {
      const qrCode = 'data:image/png;base64,mock-qr';
      const pdf = generateSimpleCertificatePDF(mockCertificate, qrCode);

      expect(pdf).toBeDefined();
      expect(pdf.addImage).toHaveBeenCalledWith(
        qrCode,
        'PNG',
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should use custom options', () => {
      const options = {
        orientation: 'landscape' as const,
        format: 'letter' as const,
        compress: false,
      };

      const pdf = generateSimpleCertificatePDF(mockCertificate, undefined, options);

      expect(pdf).toBeDefined();
    });

    it('should include all certificate details', () => {
      const pdf = generateSimpleCertificatePDF(mockCertificate);

      expect(pdf.text).toHaveBeenCalledWith(
        expect.stringContaining('GACP-2025-001'),
        expect.any(Number),
        expect.any(Number),
        expect.any(Object),
      );
    });
  });

  describe('downloadPDF', () => {
    it('should call pdf.save with default filename', () => {
      const mockPDF = {
        save: jest.fn(),
      } as any;

      downloadPDF(mockPDF);

      expect(mockPDF.save).toHaveBeenCalledWith('certificate.pdf');
    });

    it('should call pdf.save with custom filename', () => {
      const mockPDF = {
        save: jest.fn(),
      } as any;
      const filename = 'my-certificate.pdf';

      downloadPDF(mockPDF, filename);

      expect(mockPDF.save).toHaveBeenCalledWith(filename);
    });
  });

  describe('openPDFInNewWindow', () => {
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
      windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should open PDF in new window', () => {
      const mockPDF = {
        output: jest.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' })),
      } as any;

      openPDFInNewWindow(mockPDF);

      expect(mockPDF.output).toHaveBeenCalledWith('blob');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith('mock-url', '_blank');
    });
  });

  describe('getPDFBlob', () => {
    it('should return PDF as blob', () => {
      const mockPDF = {
        output: jest.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' })),
      } as any;

      const blob = getPDFBlob(mockPDF);

      expect(blob).toBeInstanceOf(Blob);
      expect(mockPDF.output).toHaveBeenCalledWith('blob');
    });
  });

  describe('getPDFDataURL', () => {
    it('should return PDF as data URL', () => {
      const mockPDF = {
        output: jest.fn().mockReturnValue('data:application/pdf;base64,test'),
      } as any;

      const dataURL = getPDFDataURL(mockPDF);

      expect(typeof dataURL).toBe('string');
      expect(dataURL).toContain('data:application/pdf');
      expect(mockPDF.output).toHaveBeenCalledWith('dataurlstring');
    });
  });
});
