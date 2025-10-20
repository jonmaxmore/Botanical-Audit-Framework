import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Certificate } from '@/lib/types/certificate';

interface PDFOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  compress?: boolean;
}

/**
 * Generate certificate PDF from HTML element
 */
export async function generateCertificatePDF(
  certificate: Certificate,
  elementId: string,
  options?: PDFOptions,
): Promise<jsPDF> {
  const defaultOptions: PDFOptions = {
    orientation: 'portrait',
    format: 'a4',
    compress: true,
    ...options,
  };

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Generate canvas from HTML element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: defaultOptions.orientation,
    unit: 'mm',
    format: defaultOptions.format,
    compress: defaultOptions.compress,
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  return pdf;
}

/**
 * Generate simple certificate PDF
 */
export function generateSimpleCertificatePDF(
  certificate: Certificate,
  qrCodeDataURL?: string,
  options?: PDFOptions,
): jsPDF {
  const defaultOptions: PDFOptions = {
    orientation: 'portrait',
    format: 'a4',
    compress: true,
    ...options,
  };

  const pdf = new jsPDF({
    orientation: defaultOptions.orientation,
    unit: 'mm',
    format: defaultOptions.format,
    compress: defaultOptions.compress,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFillColor(33, 150, 243); // Primary blue
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('GACP Certificate', pageWidth / 2, 20, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text('Good Agricultural and Collection Practices', pageWidth / 2, 30, { align: 'center' });

  // Certificate Number
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(`Certificate No: ${certificate.certificateNumber}`, pageWidth / 2, 55, {
    align: 'center',
  });

  // Content
  let yPos = 75;

  // Farm Information
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Farm Information', 20, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Farm Name: ${certificate.farmName}`, 20, yPos);
  yPos += 7;
  pdf.text(`Farm ID: ${certificate.farmId}`, 20, yPos);
  yPos += 7;
  pdf.text(`Farmer Name: ${certificate.farmerName}`, 20, yPos);
  yPos += 7;
  pdf.text(`National ID: ${certificate.farmerNationalId}`, 20, yPos);
  yPos += 7;
  pdf.text(`Crop Type: ${certificate.cropType}`, 20, yPos);
  yPos += 7;
  pdf.text(`Farm Area: ${certificate.farmArea} Rai`, 20, yPos);
  yPos += 7;

  const address = certificate.address;
  const fullAddress = `${address.houseNumber} ${address.village || ''} ${address.subdistrict}, ${address.district}, ${address.province} ${address.postalCode}`;
  pdf.text(`Address: ${fullAddress}`, 20, yPos);
  yPos += 15;

  // Certification Details
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certification Details', 20, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Standard: ${certificate.certificationStandard}`, 20, yPos);
  yPos += 7;
  pdf.text(`Status: ${certificate.status.toUpperCase()}`, 20, yPos);
  yPos += 7;
  pdf.text(
    `Issued Date: ${new Date(certificate.issuedDate).toLocaleDateString('en-US')}`,
    20,
    yPos,
  );
  yPos += 7;
  pdf.text(
    `Expiry Date: ${new Date(certificate.expiryDate).toLocaleDateString('en-US')}`,
    20,
    yPos,
  );
  yPos += 7;
  pdf.text(
    `Inspection Date: ${new Date(certificate.inspectionDate).toLocaleDateString('en-US')}`,
    20,
    yPos,
  );
  yPos += 7;
  pdf.text(`Inspector: ${certificate.inspectorName}`, 20, yPos);
  yPos += 15;

  // QR Code
  if (qrCodeDataURL) {
    const qrSize = 40;
    pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - qrSize - 20, yPos, qrSize, qrSize);
    pdf.setFontSize(9);
    pdf.text('Scan to verify', pageWidth - qrSize - 20 + qrSize / 2, yPos + qrSize + 5, {
      align: 'center',
    });
  }

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'Department of Agriculture, Ministry of Agriculture and Cooperatives',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' },
  );
  pdf.text(`Issued by: ${certificate.issuedBy}`, pageWidth / 2, pageHeight - 15, {
    align: 'center',
  });
  pdf.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  });

  return pdf;
}

/**
 * Download PDF file
 */
export function downloadPDF(pdf: jsPDF, filename: string = 'certificate.pdf'): void {
  pdf.save(filename);
}

/**
 * Open PDF in new window
 */
export function openPDFInNewWindow(pdf: jsPDF): void {
  const pdfBlob = pdf.output('blob');
  const pdfURL = URL.createObjectURL(pdfBlob);
  window.open(pdfURL, '_blank');
}

/**
 * Get PDF as blob
 */
export function getPDFBlob(pdf: jsPDF): Blob {
  return pdf.output('blob');
}

/**
 * Get PDF as data URL
 */
export function getPDFDataURL(pdf: jsPDF): string {
  return pdf.output('dataurlstring');
}

export default {
  generateCertificatePDF,
  generateSimpleCertificatePDF,
  downloadPDF,
  openPDFInNewWindow,
  getPDFBlob,
  getPDFDataURL,
};
