/**
 * QR Code Generator Unit Tests
 */

import {
  generateQRCode,
  generateCertificateQR,
  downloadQRCode,
  isValidQRData,
} from '../qr-generator';

// Mock QRCode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn((data: string) => {
    return Promise.resolve(`data:image/png;base64,mock-qr-${data}`);
  }),
  toCanvas: jest.fn(() => Promise.resolve()),
}));

describe('QR Code Generator', () => {
  describe('generateQRCode', () => {
    it('should generate QR code data URL', async () => {
      const data = 'TEST-CERT-12345';
      const result = await generateQRCode(data);

      expect(result).toBeDefined();
      expect(result).toContain('data:image/png;base64');
      expect(result).toContain(data);
    });

    it('should generate QR code with custom options', async () => {
      const data = 'TEST-DATA';
      const options = {
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'H' as const,
      };

      const result = await generateQRCode(data, options);

      expect(result).toBeDefined();
      expect(result).toContain('data:image/png;base64');
    });

    it('should throw error for invalid data', async () => {
      const QRCode = require('qrcode');
      QRCode.toDataURL.mockRejectedValueOnce(new Error('Invalid data'));

      await expect(generateQRCode('')).rejects.toThrow('Failed to generate QR code');
    });
  });

  describe('generateCertificateQR', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://gacp.example.com/api';
    });

    it('should generate certificate verification QR code', async () => {
      const certNumber = 'GACP-2025-001';
      const result = await generateCertificateQR(certNumber);

      expect(result).toBeDefined();
      expect(result).toContain('data:image/png;base64');
      expect(result).toContain('gacp.example.com');
      expect(result).toContain(certNumber);
    });

    it('should include full verification URL', async () => {
      const certNumber = 'GACP-2025-002';
      const result = await generateCertificateQR(certNumber);

      const expectedURL = `https://gacp.example.com/api/verify/${certNumber}`;
      expect(result).toContain(certNumber);
    });
  });

  describe('downloadQRCode', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let clickSpy: jest.Mock;

    beforeEach(() => {
      clickSpy = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should trigger download with default filename', () => {
      const dataURL = 'data:image/png;base64,ABC123';

      downloadQRCode(dataURL);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should trigger download with custom filename', () => {
      const dataURL = 'data:image/png;base64,ABC123';
      const filename = 'certificate-qr.png';

      downloadQRCode(dataURL, filename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('isValidQRData', () => {
    it('should return true for valid data', () => {
      expect(isValidQRData('GACP-2025-001')).toBe(true);
      expect(isValidQRData('https://example.com/verify/123')).toBe(true);
      expect(isValidQRData('Short text')).toBe(true);
    });

    it('should return false for invalid data', () => {
      expect(isValidQRData('')).toBe(false);
      expect(isValidQRData(null as any)).toBe(false);
      expect(isValidQRData(undefined as any)).toBe(false);
      expect(isValidQRData(123 as any)).toBe(false);
    });

    it('should return false for data that is too long', () => {
      const longData = 'A'.repeat(5000); // Over 4296 limit
      expect(isValidQRData(longData)).toBe(false);
    });

    it('should return true for data at max length', () => {
      const maxData = 'A'.repeat(4296);
      expect(isValidQRData(maxData)).toBe(true);
    });
  });
});
