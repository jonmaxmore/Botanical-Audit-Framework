/**
 * Certificate Service with QR Code Generation
 *
 * Purpose: Generate certificates with QR codes and PDF
 * Features:
 * - Certificate number generation
 * - QR code with tamper-proof hash
 * - PDF generation with QR code
 * - Public verification API
 */

const logger = require('../shared/logger');
const QRCode = require('qrcode');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class CertificateService {
  constructor(config = {}) {
    this.secretKey =
      config.secretKey || process.env.CERTIFICATE_SECRET_KEY || 'gacp-certificate-secret-2025';
    this.baseUrl = config.baseUrl || process.env.BASE_URL || 'https://gacp.go.th';
    this.uploadPath = config.uploadPath || path.join(__dirname, '../../../uploads/certificates');

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Generate certificate number
   * Format: GACP-YYYY-NNNNNN
   */
  async generateCertificateNumber(db) {
    const year = new Date().getFullYear();

    // Get last certificate number for this year
    const lastCertificate = await db
      .collection('certificates')
      .findOne(
        { certificateNumber: new RegExp(`^GACP-${year}-`) },
        { sort: { certificateNumber: -1 } }
      );

    let sequence = 1;

    if (lastCertificate) {
      const lastNumber = lastCertificate.certificateNumber;
      const lastSequence = parseInt(lastNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `GACP-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  /**
   * Generate tamper-proof hash for QR code
   */
  generateHash(data) {
    const payload = `${data.certificateNumber}|${data.issuedAt}|${data.expiresAt}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Verify QR code hash
   */
  verifyHash(payload) {
    const expectedHash = this.generateHash({
      certificateNumber: payload.c,
      issuedAt: payload.i,
      expiresAt: payload.e
    });

    return payload.h === expectedHash;
  }

  /**
   * Generate QR code
   */
  async generateQRCode(certificateData) {
    const verificationUrl = `${this.baseUrl}/verify/${certificateData.certificateNumber}`;

    const payload = {
      v: 1, // version
      c: certificateData.certificateNumber,
      u: verificationUrl,
      i: new Date(certificateData.issuedAt).getTime(),
      e: new Date(certificateData.expiresAt).getTime(),
      h: this.generateHash(certificateData)
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  }

  /**
   * Generate certificate PDF
   */
  async generatePDF(certificate) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `${certificate.certificateNumber}.pdf`;
        const filePath = path.join(this.uploadPath, fileName);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe to file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('ใบรับรอง GACP', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(16)
          .font('Helvetica')
          .text('Good Agricultural and Collection Practices', { align: 'center' })
          .moveDown(2);

        // Certificate Number
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('เลขที่ใบรับรอง / Certificate Number:', 50, 150);

        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#0066CC')
          .text(certificate.certificateNumber, 50, 170)
          .fillColor('#000000');

        // Farm Information
        doc.fontSize(12).font('Helvetica-Bold').text('ชื่อฟาร์ม / Farm Name:', 50, 210);

        doc.fontSize(12).font('Helvetica').text(certificate.farmName, 50, 230);

        doc.fontSize(12).font('Helvetica-Bold').text('ชื่อเกษตรกร / Farmer Name:', 50, 260);

        doc.fontSize(12).font('Helvetica').text(certificate.farmerName, 50, 280);

        // Certification Details
        doc.fontSize(12).font('Helvetica-Bold').text('ประเภทพืช / Crop Type:', 50, 320);

        doc.fontSize(12).font('Helvetica').text(certificate.cropType, 50, 340);

        doc.fontSize(12).font('Helvetica-Bold').text('ขนาดพื้นที่ / Farm Size:', 300, 320);

        doc.fontSize(12).font('Helvetica').text(`${certificate.farmSize} ไร่`, 300, 340);

        // Validity Period
        doc.fontSize(12).font('Helvetica-Bold').text('วันที่ออก / Issue Date:', 50, 380);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(
            new Date(certificate.issuedAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            50,
            400
          );

        doc.fontSize(12).font('Helvetica-Bold').text('วันหมดอายุ / Expiry Date:', 300, 380);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#CC0000')
          .text(
            new Date(certificate.expiresAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            300,
            400
          )
          .fillColor('#000000');

        // QR Code
        doc.fontSize(12).font('Helvetica-Bold').text('ตรวจสอบความถูกต้อง / Verify:', 50, 460);

        // Add QR code image (remove data:image/png;base64, prefix)
        const qrCodeBase64 = certificate.qrCode.replace(/^data:image\/png;base64,/, '');
        const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64');

        doc.image(qrCodeBuffer, 50, 480, { width: 150, height: 150 });

        // Verification URL
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${this.baseUrl}/verify/${certificate.certificateNumber}`, 220, 530, {
            width: 300,
            align: 'left'
          });

        // Footer
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('กรมพัฒนาการแพทย์แผนไทยและการแพทย์ทางเลือก', 50, 700, {
            align: 'center'
          });

        doc.fontSize(10).text('Department of Thai Traditional and Alternative Medicine', 50, 715, {
          align: 'center'
        });

        // Signature line
        doc.moveTo(350, 680).lineTo(500, 680).stroke();

        doc.fontSize(10).text('ผู้อนุมัติ / Approved by', 350, 685);

        doc.fontSize(10).text(certificate.issuedBy || 'Director', 350, 700);

        // Finalize PDF
        doc.end();

        // Wait for file to be written
        writeStream.on('finish', () => {
          resolve(`/uploads/certificates/${fileName}`);
        });

        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate complete certificate with QR code and PDF
   */
  async generateCertificate(db, applicationData) {
    try {
      // Generate certificate number
      const certificateNumber = await this.generateCertificateNumber(db);

      // Prepare certificate data
      const certificate = {
        certificateNumber,
        applicationId: applicationData.id,
        farmerId: applicationData.farmerId,
        farmName: applicationData.farmName,
        farmerName: applicationData.farmerName,
        cropType: applicationData.cropType,
        farmSize: applicationData.farmSize,
        certificationStandard: 'GACP',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
        issuedBy: applicationData.approvedBy,
        status: 'active',
        createdAt: new Date()
      };

      // Generate QR code
      certificate.qrCode = await this.generateQRCode(certificate);

      // Generate PDF
      certificate.pdfUrl = await this.generatePDF(certificate);

      // Save to database
      await db.collection('certificates').insertOne(certificate);

      logger.info(`✅ Certificate generated: ${certificateNumber}`);

      return certificate;
    } catch (error) {
      logger.error('❌ Certificate generation failed:', error);
      throw error;
    }
  }

  /**
   * Verify certificate by number
   */
  async verifyCertificate(db, certificateNumber) {
    const certificate = await db.collection('certificates').findOne({
      certificateNumber,
      status: { $ne: 'revoked' }
    });

    if (!certificate) {
      return {
        valid: false,
        reason: 'Certificate not found'
      };
    }

    // Check expiry
    if (certificate.expiresAt < new Date()) {
      return {
        valid: false,
        reason: 'Certificate expired',
        certificate: {
          certificateNumber: certificate.certificateNumber,
          expiresAt: certificate.expiresAt
        }
      };
    }

    // Check revocation
    if (certificate.status === 'revoked') {
      return {
        valid: false,
        reason: 'Certificate revoked',
        certificate: {
          certificateNumber: certificate.certificateNumber,
          revokedAt: certificate.revokedAt,
          revokedBy: certificate.revokedBy
        }
      };
    }

    return {
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        farmName: certificate.farmName,
        farmerName: certificate.farmerName,
        cropType: certificate.cropType,
        farmSize: certificate.farmSize,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        status: certificate.status
      }
    };
  }

  /**
   * Verify QR code
   */
  async verifyQRCode(db, qrData) {
    try {
      const payload = JSON.parse(qrData);

      // Verify version
      if (payload.v !== 1) {
        return {
          valid: false,
          reason: 'Unsupported QR code version'
        };
      }

      // Verify hash (tamper detection)
      if (!this.verifyHash(payload)) {
        return {
          valid: false,
          reason: 'QR code tampered or invalid'
        };
      }

      // Verify certificate
      return await this.verifyCertificate(db, payload.c);
    } catch (error) {
      return {
        valid: false,
        reason: 'Invalid QR code format'
      };
    }
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(db, certificateNumber, revokedBy, reason) {
    const result = await db.collection('certificates').updateOne(
      { certificateNumber },
      {
        $set: {
          status: 'revoked',
          revokedAt: new Date(),
          revokedBy,
          revocationReason: reason,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Certificate not found or already revoked');
    }

    logger.info(`✅ Certificate revoked: ${certificateNumber}`);

    return { success: true };
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats(db) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, active, expired, revoked, expiringThisMonth] = await Promise.all([
      db.collection('certificates').countDocuments({}),
      db.collection('certificates').countDocuments({ status: 'active', expiresAt: { $gt: now } }),
      db.collection('certificates').countDocuments({ expiresAt: { $lt: now } }),
      db.collection('certificates').countDocuments({ status: 'revoked' }),
      db.collection('certificates').countDocuments({
        status: 'active',
        expiresAt: {
          $gt: now,
          $lt: thirtyDaysFromNow
        }
      })
    ]);

    return {
      total,
      active,
      expired,
      revoked,
      expiringThisMonth
    };
  }
}

module.exports = CertificateService;

// Example usage
if (require.main === module) {
  const { MongoClient } = require('mongodb');

  const test = async function () {
    const client = await MongoClient.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform'
    );
    const db = client.db();

    const certificateService = new CertificateService({
      secretKey: 'test-secret-key',
      baseUrl: 'https://gacp.go.th'
    });

    // Test certificate generation
    const mockApplication = {
      id: 'APP-2025-000001',
      farmerId: 'FARMER-001',
      farmName: 'ฟาร์มตัวอย่าง',
      farmerName: 'นายทดสอบ ระบบ',
      cropType: 'Cannabis',
      farmSize: 5.5,
      approvedBy: 'Director'
    };

    const certificate = await certificateService.generateCertificate(db, mockApplication);
    logger.info('Certificate generated:', certificate.certificateNumber);

    // Test verification
    const verification = await certificateService.verifyCertificate(
      db,
      certificate.certificateNumber
    );
    logger.info('Verification result:', verification);

    // Test QR code verification
    const qrPayload = JSON.stringify({
      v: 1,
      c: certificate.certificateNumber,
      u: `https://gacp.go.th/verify/${certificate.certificateNumber}`,
      i: certificate.issuedAt.getTime(),
      e: certificate.expiresAt.getTime(),
      h: certificateService.generateHash(certificate)
    });

    const qrVerification = await certificateService.verifyQRCode(db, qrPayload);
    logger.info('QR verification result:', qrVerification);

    // Get stats
    const stats = await certificateService.getCertificateStats(db);
    logger.info('Certificate stats:', stats);

    await client.close();
  };

  test().catch(console.error);
}
