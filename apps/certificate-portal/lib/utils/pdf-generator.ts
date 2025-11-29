import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const generateCertificatePDF = async (certificate: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, 'F');

  // Border
  doc.setLineWidth(2);
  doc.setDrawColor(46, 125, 50); // Green color
  doc.rect(10, 10, 277, 190);

  // Title
  doc.setFontSize(30);
  doc.setTextColor(46, 125, 50);
  doc.text('GACP Certificate', 148.5, 40, { align: 'center' });

  // Certificate ID
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Certificate ID: ${certificate.id}`, 148.5, 50, { align: 'center' });

  // Content
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);

  const startY = 80;
  const lineHeight = 15;

  doc.text(`This is to certify that`, 148.5, startY, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(certificate.farmName, 148.5, startY + lineHeight, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`has successfully met the requirements for`, 148.5, startY + lineHeight * 2.5, { align: 'center' });

  doc.setFontSize(20);
  doc.text(`Good Agricultural and Collection Practices`, 148.5, startY + lineHeight * 3.5, { align: 'center' });

  // Details
  doc.setFontSize(12);
  doc.text(`Issue Date: ${certificate.issueDate}`, 50, 160);
  doc.text(`Expiry Date: ${certificate.expiryDate}`, 50, 170);
  doc.text(`Status: ${certificate.status}`, 50, 180);

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(certificate));
    doc.addImage(qrDataUrl, 'PNG', 220, 140, 40, 40);
  } catch (err) {
    console.error('Error generating QR for PDF', err);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('This certificate is electronically generated and valid without signature.', 148.5, 195, { align: 'center' });

  // Save
  doc.save(`${certificate.id}.pdf`);
};
