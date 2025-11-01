import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    color: {
      ...defaultOptions.color,
      ...options?.color
    }
  };

  return QRCode.toDataURL(data, mergedOptions);
}

/**
 * Generate QR code on canvas
 */
export async function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  data: string,
  options?: QRCodeOptions
): Promise<void> {
  const defaultOptions: QRCodeOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    color: {
      ...defaultOptions.color,
      ...options?.color
    }
  };

  await QRCode.toCanvas(canvas, data, mergedOptions);
}

/**
 * Generate certificate verification QR code
 * Contains certificate number and verification URL
 */
export async function generateCertificateQR(
  certificateNumber: string,
  options?: QRCodeOptions
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const verificationURL = `${baseUrl}/verify/${certificateNumber}`;
  return generateQRCode(verificationURL, options);
}

/**
 * Download QR code as image
 */
export function downloadQRCode(dataURL: string, filename: string = 'qrcode.png'): void {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate QR code data
 */
export function isValidQRData(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }

  // Check if data is not too long (QR code has limits)
  if (data.length > 4296) {
    return false;
  }

  return true;
}

export default {
  generateQRCode,
  generateQRCodeCanvas,
  generateCertificateQR,
  downloadQRCode,
  isValidQRData
};
