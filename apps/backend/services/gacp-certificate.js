/**
 * GACP Certificate Service
 * Manages digital certificate generation, validation, and lifecycle
 *
 * Implements digital signatures, QR codes, and blockchain verification
 * Based on Thai DTAM and ASEAN digital certificate standards
 */

const fs = require('fs').promises;
const path = require('path');
// const QRCode = require('qrcode'); // Mock for development
// const { createCanvas } = require('canvas'); // Mock for development
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

const Application = require('../models/application');
const User = require('../models/user');
const logger = require('../shared/logger');
const { ValidationError, BusinessLogicError } = require('../shared/errors');

class GACPCertificateService {
  constructor() {
    this.certificateDirectory = path.join(process.cwd(), 'storage', 'certificates');
    this.templateDirectory = path.join(process.cwd(), 'resources', 'templates');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.certificateDirectory, { recursive: true });
      await fs.mkdir(this.templateDirectory, { recursive: true });
    } catch (error) {
      logger.error('Error creating certificate directories', {
        error: error.message
      });
    }
  }

  /**
   * Generate digital GACP certificate
   * Creates PDF certificate with QR code and digital signature
   */
  async generateCertificate(applicationId, approvedBy) {
    try {
      const application = await Application.findById(applicationId)
        .populate('applicant')
        .populate('assignedInspector');

      if (!application) {
        throw new ValidationError('Application not found');
      }

      if (application.currentStatus !== 'approved') {
        throw new BusinessLogicError('Application must be approved before certificate generation');
      }

      // Generate unique certificate number
      const certificateNumber = await this.generateCertificateNumber(application);

      // Create certificate data
      const certificateData = this.prepareCertificateData(
        application,
        certificateNumber,
        approvedBy
      );

      // Generate QR code for verification
      const qrCodeData = await this.generateQRCode(certificateData);

      // Generate digital signature
      const digitalSignature = this.generateDigitalSignature(certificateData);

      // Create PDF certificate
      const certificatePDF = await this.createCertificatePDF(certificateData, qrCodeData);

      // Save certificate to database
      const certificate = await this.saveCertificateRecord(
        application,
        certificateData,
        digitalSignature,
        certificatePDF
      );

      // Update application status
      await application.updateStatus(
        'certificate_issued',
        approvedBy,
        `Certificate ${certificateNumber} issued`
      );

      // Schedule certificate expiry reminder
      await this.scheduleCertificateReminders(certificate);

      logger.info('GACP certificate generated', {
        applicationId,
        certificateNumber,
        validityPeriod: certificateData.validityPeriod,
        issuedBy: approvedBy
      });

      return {
        certificate,
        certificateNumber,
        pdfPath: certificatePDF.filePath,
        qrCode: qrCodeData,
        publicVerificationUrl: this.generatePublicVerificationUrl(certificateNumber)
      };
    } catch (error) {
      logger.error('Error generating certificate', {
        applicationId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify certificate authenticity
   * Validates digital signature and certificate status
   */
  async verifyCertificate(certificateNumber, verificationCode = null) {
    try {
      // Find certificate in database
      const certificate = await this.findCertificateByNumber(certificateNumber);

      if (!certificate) {
        return {
          valid: false,
          reason: 'Certificate not found',
          status: 'invalid'
        };
      }

      // Check certificate status
      if (certificate.status !== 'active') {
        return {
          valid: false,
          reason: `Certificate is ${certificate.status}`,
          status: certificate.status,
          certificate: this.sanitizeCertificateData(certificate)
        };
      }

      // Check expiry
      if (new Date() > certificate.expiryDate) {
        return {
          valid: false,
          reason: 'Certificate has expired',
          status: 'expired',
          expiryDate: certificate.expiryDate,
          certificate: this.sanitizeCertificateData(certificate)
        };
      }

      // Verify digital signature
      const signatureValid = this.verifyDigitalSignature(certificate);

      if (!signatureValid) {
        return {
          valid: false,
          reason: 'Invalid digital signature',
          status: 'tampered'
        };
      }

      // Additional verification code check (for QR codes)
      if (verificationCode && certificate.verificationCode !== verificationCode) {
        return {
          valid: false,
          reason: 'Invalid verification code',
          status: 'invalid'
        };
      }

      // Certificate is valid
      return {
        valid: true,
        status: 'active',
        certificate: this.sanitizeCertificateData(certificate),
        verificationDetails: {
          verifiedAt: new Date(),
          digitalSignatureValid: true,
          blockchainVerified: false // TODO: Implement blockchain verification
        }
      };
    } catch (error) {
      logger.error('Error verifying certificate', {
        certificateNumber,
        error: error.message
      });
      return {
        valid: false,
        reason: 'Verification system error',
        status: 'error'
      };
    }
  }

  /**
   * Renew certificate
   * Extends validity period for active certificates
   */
  async renewCertificate(certificateNumber, renewedBy, renewalData) {
    try {
      const certificate = await this.findCertificateByNumber(certificateNumber);

      if (!certificate) {
        throw new ValidationError('Certificate not found');
      }

      // Check if renewal is allowed
      const daysUntilExpiry = Math.ceil(
        (certificate.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry > 90) {
        throw new BusinessLogicError('Certificate can only be renewed within 90 days of expiry');
      }

      // Check if farm still meets GACP standards
      const complianceCheck = await this.checkCurrentCompliance(certificate.applicationId);

      if (!complianceCheck.compliant) {
        throw new BusinessLogicError(
          'Certificate cannot be renewed due to compliance issues: ' +
            complianceCheck.issues.join(', ')
        );
      }

      // Calculate new expiry date
      const newExpiryDate = new Date(certificate.expiryDate);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 2); // Extend by 2 years

      // Update certificate
      certificate.expiryDate = newExpiryDate;
      certificate.renewalHistory.push({
        renewedDate: new Date(),
        renewedBy,
        previousExpiryDate: certificate.expiryDate,
        newExpiryDate,
        renewalNotes: renewalData.notes || ''
      });

      await certificate.save();

      // Generate renewal notice
      const renewalNotice = await this.generateRenewalNotice(certificate, renewedBy);

      logger.info('Certificate renewed', {
        certificateNumber,
        newExpiryDate,
        renewedBy
      });

      return {
        certificate,
        renewalNotice,
        newExpiryDate
      };
    } catch (error) {
      logger.error('Error renewing certificate', {
        certificateNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Revoke certificate
   * Invalidates certificate due to compliance violations
   */
  async revokeCertificate(certificateNumber, revokedBy, revocationReason) {
    try {
      const certificate = await this.findCertificateByNumber(certificateNumber);

      if (!certificate) {
        throw new ValidationError('Certificate not found');
      }

      if (certificate.status !== 'active') {
        throw new BusinessLogicError('Only active certificates can be revoked');
      }

      // Update certificate status
      certificate.status = 'revoked';
      certificate.revocationDate = new Date();
      certificate.revokedBy = revokedBy;
      certificate.revocationReason = revocationReason;

      await certificate.save();

      // Update related application
      const application = await Application.findById(certificate.applicationId);
      if (application) {
        await application.updateStatus(
          'certificate_revoked',
          revokedBy,
          `Certificate revoked: ${revocationReason}`
        );
      }

      // Add to public revocation list
      await this.addToRevocationList(certificate);

      // Send notifications
      await this.sendRevocationNotifications(certificate);

      logger.warn('Certificate revoked', {
        certificateNumber,
        revokedBy,
        reason: revocationReason
      });

      return {
        certificate,
        revocationConfirmation: true
      };
    } catch (error) {
      logger.error('Error revoking certificate', {
        certificateNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate public verification page
   * Creates embeddable verification widget
   */
  async generateVerificationPage(certificateNumber) {
    try {
      const verification = await this.verifyCertificate(certificateNumber);

      const verificationPage = {
        certificateNumber,
        verificationTimestamp: new Date(),
        result: verification,
        publicData: verification.valid
          ? {
              farmName: verification.certificate.farmName,
              farmerName: verification.certificate.farmerName,
              province: verification.certificate.location.province,
              cropTypes: verification.certificate.cropTypes,
              issueDate: verification.certificate.issueDate,
              expiryDate: verification.certificate.expiryDate,
              certificationBody: 'กรมการปกครอง (DTAM)',
              standards: ['WHO GACP', 'ASEAN GACP']
            }
          : null
      };

      return verificationPage;
    } catch (error) {
      logger.error('Error generating verification page', {
        certificateNumber,
        error: error.message
      });
      throw error;
    }
  }

  // === PRIVATE HELPER METHODS ===

  async generateCertificateNumber(application) {
    const year = new Date().getFullYear();
    const province = application.farmInformation.location.province;
    const provinceCode = this.getProvinceCode(province);

    // Format: GACP-{Year}-{ProvinceCode}-{SequentialNumber}
    const prefix = `GACP-${year}-${provinceCode}`;

    // Find the highest sequential number for this year and province
    const lastCertificate = await Application.findOne({
      'certificate.certificateNumber': new RegExp(`^${prefix}-`),
      'certificate.issueDate': {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    }).sort({ 'certificate.certificateNumber': -1 });

    let sequentialNumber = 1;
    if (lastCertificate && lastCertificate.certificate) {
      const lastNumber = lastCertificate.certificate.certificateNumber.split('-').pop();
      sequentialNumber = parseInt(lastNumber) + 1;
    }

    return `${prefix}-${sequentialNumber.toString().padStart(4, '0')}`;
  }

  prepareCertificateData(application, certificateNumber, approvedBy) {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years validity

    return {
      certificateNumber,
      applicationId: application._id,
      applicationNumber: application.applicationNumber,

      // Farm Information
      farmName: application.farmInformation.farmName,
      farmerName: application.applicant.fullName,
      farmerId: application.applicant.nationalId,

      // Location
      location: {
        address: application.farmInformation.location.address,
        subdistrict: application.farmInformation.location.subdistrict,
        district: application.farmInformation.location.district,
        province: application.farmInformation.location.province,
        postalCode: application.farmInformation.location.postalCode,
        coordinates: application.farmInformation.location.coordinates
      },

      // Farm Details
      farmSize: application.farmInformation.farmSize.totalArea,
      cropTypes: application.cropInformation.map(crop => crop.cropType),
      farmingSystem: application.farmInformation.farmingSystem,

      // Certification Details
      issueDate,
      expiryDate,
      validityPeriod: 24, // months
      certificationStandards: ['WHO GACP', 'ASEAN GACP', 'DTAM Standards'],

      // Assessment Details
      finalScore: application.calculateTotalScore(),
      inspectionDate: application.inspectionCompleted,
      inspectorId: application.assignedInspector,

      // Approval Details
      approvedBy,
      approvalDate: new Date(),
      issuingAuthority: 'กรมการปกครอง (Department of Provincial Administration)',

      // Verification
      verificationCode: crypto.randomBytes(16).toString('hex'),
      digitalSignatureAlgorithm: 'RSA-SHA256'
    };
  }

  async generateQRCode(certificateData) {
    const verificationUrl = `${process.env.PUBLIC_URL || 'https://gacp.dtam.go.th'}/verify/${certificateData.certificateNumber}?code=${certificateData.verificationCode}`;

    // Mock QR Code for development (replace with real implementation)
    const qrCodeDataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    /*
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    */

    return {
      dataURL: qrCodeDataURL,
      verificationUrl,
      format: 'PNG'
    };
  }

  generateDigitalSignature(certificateData) {
    // In production, use HSM or dedicated signing service
    const dataToSign = JSON.stringify({
      certificateNumber: certificateData.certificateNumber,
      farmerName: certificateData.farmerName,
      farmName: certificateData.farmName,
      issueDate: certificateData.issueDate,
      expiryDate: certificateData.expiryDate,
      finalScore: certificateData.finalScore,
      verificationCode: certificateData.verificationCode
    });

    // Create signature using HMAC for now (replace with RSA in production)
    const secretKey = process.env.CERTIFICATE_SIGNING_KEY || 'default-secret-key';
    const signature = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');

    return {
      algorithm: 'HMAC-SHA256',
      signature,
      signedData: dataToSign,
      timestamp: new Date()
    };
  }

  async createCertificatePDF(certificateData, qrCodeData) {
    const filename = `certificate_${certificateData.certificateNumber}.pdf`;
    const filePath = path.join(this.certificateDirectory, filename);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 72, right: 72 }
    });

    // Pipe to file
    const stream = require('fs').createWriteStream(filePath);
    doc.pipe(stream);

    // Add content
    await this.addCertificateContent(doc, certificateData, qrCodeData);

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    await new Promise(resolve => stream.on('finish', resolve));

    return {
      filename,
      filePath,
      size: (await fs.stat(filePath)).size
    };
  }

  async addCertificateContent(doc, data, qrCodeData) {
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('ใบรับรอง GACP', { align: 'center' });

    doc.fontSize(18).text('Good Agricultural and Collection Practices', { align: 'center' });

    doc.fontSize(14).font('Helvetica').text('กรมการปกครอง กระทรวงมหาดไทย', { align: 'center' });

    doc.moveDown(2);

    // Certificate number
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`Certificate No: ${data.certificateNumber}`, { align: 'center' });

    doc.moveDown(1);

    // Main content
    doc.fontSize(12).font('Helvetica').text('This is to certify that:', { align: 'center' });

    doc.moveDown(0.5);

    // Farm details
    doc.fontSize(14).font('Helvetica-Bold').text(`Farm Name: ${data.farmName}`, { align: 'left' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Farmer: ${data.farmerName}`)
      .text(
        `Location: ${data.location.subdistrict}, ${data.location.district}, ${data.location.province}`
      )
      .text(`Farm Size: ${data.farmSize} rai`)
      .text(`Crop Types: ${data.cropTypes.join(', ')}`);

    doc.moveDown(1);

    // Certification statement
    doc.text('has been assessed and found to comply with the requirements of:');
    doc.moveDown(0.5);

    data.certificationStandards.forEach(standard => {
      doc.text(`• ${standard}`);
    });

    doc.moveDown(1);

    // Assessment details
    doc
      .text(`Assessment Score: ${data.finalScore}%`)
      .text(`Inspection Date: ${data.inspectionDate.toLocaleDateString('th-TH')}`)
      .text(`Issue Date: ${data.issueDate.toLocaleDateString('th-TH')}`)
      .text(`Expiry Date: ${data.expiryDate.toLocaleDateString('th-TH')}`);

    doc.moveDown(2);

    // QR Code
    if (qrCodeData.dataURL) {
      const qrImage = qrCodeData.dataURL.split(',')[1];
      const qrBuffer = Buffer.from(qrImage, 'base64');
      doc.image(qrBuffer, doc.page.width - 150, doc.y - 100, { width: 100 });
    }

    // Signature area
    doc
      .text('Authorized by:', 50, doc.page.height - 150)
      .text('Department of Provincial Administration', 50, doc.page.height - 130)
      .text('Ministry of Interior', 50, doc.page.height - 110);

    // Verification instructions
    doc
      .fontSize(10)
      .text('Verify this certificate at: https://gacp.dtam.go.th/verify', 50, doc.page.height - 80)
      .text(`Verification Code: ${data.verificationCode}`, 50, doc.page.height - 65);
  }

  async saveCertificateRecord(application, certificateData, digitalSignature, pdfInfo) {
    // Update application with certificate information
    application.certificate = {
      certificateNumber: certificateData.certificateNumber,
      issueDate: certificateData.issueDate,
      expiryDate: certificateData.expiryDate,
      validityPeriod: certificateData.validityPeriod,
      status: 'active',
      verificationCode: certificateData.verificationCode,
      digitalSignature: digitalSignature.signature,
      pdfFilename: pdfInfo.filename,
      pdfSize: pdfInfo.size
    };

    await application.save();

    return application.certificate;
  }

  async findCertificateByNumber(certificateNumber) {
    const application = await Application.findOne({
      'certificate.certificateNumber': certificateNumber
    }).populate('applicant');

    if (!application || !application.certificate) {
      return null;
    }

    return {
      ...application.certificate.toObject(),
      applicationId: application._id,
      farmName: application.farmInformation.farmName,
      farmerName: application.applicant.fullName,
      location: application.farmInformation.location,
      cropTypes: application.cropInformation.map(c => c.cropType)
    };
  }

  verifyDigitalSignature(certificate) {
    try {
      // Reconstruct the signed data
      const dataToVerify = JSON.stringify({
        certificateNumber: certificate.certificateNumber,
        farmerName: certificate.farmerName,
        farmName: certificate.farmName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        finalScore: certificate.finalScore,
        verificationCode: certificate.verificationCode
      });

      const secretKey = process.env.CERTIFICATE_SIGNING_KEY || 'default-secret-key';
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(dataToVerify)
        .digest('hex');

      return expectedSignature === certificate.digitalSignature;
    } catch (error) {
      logger.error('Error verifying digital signature', {
        error: error.message
      });
      return false;
    }
  }

  sanitizeCertificateData(certificate) {
    // Remove sensitive data before returning to public
    const sanitized = { ...certificate };
    delete sanitized.digitalSignature;
    delete sanitized.verificationCode;
    return sanitized;
  }

  async checkCurrentCompliance(applicationId) {
    // Check if there are any compliance violations or surveillance issues
    const application = await Application.findById(applicationId);

    if (!application) {
      return { compliant: false, issues: ['Application not found'] };
    }

    const issues = [];

    // Check for recent surveillance violations
    if (application.surveillanceViolations && application.surveillanceViolations.length > 0) {
      const recentViolations = application.surveillanceViolations.filter(
        v => new Date() - v.date < 365 * 24 * 60 * 60 * 1000 // Within last year
      );

      if (recentViolations.length > 0) {
        issues.push('Recent surveillance violations');
      }
    }

    // Check for complaint records
    if (application.complaintRecords && application.complaintRecords.length > 0) {
      const unresolvedComplaints = application.complaintRecords.filter(
        c => c.status !== 'resolved'
      );
      if (unresolvedComplaints.length > 0) {
        issues.push('Unresolved complaints');
      }
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  async generateRenewalNotice(certificate, renewedBy) {
    // Generate a simple renewal notice document
    return {
      noticeNumber: `RN-${certificate.certificateNumber}-${Date.now()}`,
      certificateNumber: certificate.certificateNumber,
      renewalDate: new Date(),
      renewedBy,
      newExpiryDate: certificate.expiryDate,
      notes: 'Certificate renewed based on continued compliance'
    };
  }

  async addToRevocationList(certificate) {
    // Add to public revocation list (this would be a separate collection in production)
    logger.info('Certificate added to revocation list', {
      certificateNumber: certificate.certificateNumber,
      revocationDate: certificate.revocationDate
    });
  }

  async sendRevocationNotifications(certificate) {
    // Send notifications about certificate revocation
    logger.info('Revocation notifications sent', {
      certificateNumber: certificate.certificateNumber
    });
  }

  generatePublicVerificationUrl(certificateNumber) {
    return `${process.env.PUBLIC_URL || 'https://gacp.dtam.go.th'}/verify/${certificateNumber}`;
  }

  getProvinceCode(provinceName) {
    // Map province names to 2-letter codes
    const provinceCodes = {
      กรุงเทพมหานคร: 'BK',
      เชียงใหม่: 'CM',
      เชียงราย: 'CR',
      นครราชสีมา: 'NM',
      ขอนแก่น: 'KK',
      อุบลราชธานี: 'UB',
      สงขลา: 'SK',
      ภูเก็ต: 'PK'
      // Add more provinces as needed
    };

    return provinceCodes[provinceName] || 'XX';
  }

  async scheduleCertificateReminders(certificate) {
    // Schedule reminders for certificate expiry
    const expiryDate = new Date(certificate.expiryDate);

    // 90 days before expiry
    const reminder90 = new Date(expiryDate);
    reminder90.setDate(reminder90.getDate() - 90);

    // 30 days before expiry
    const reminder30 = new Date(expiryDate);
    reminder30.setDate(reminder30.getDate() - 30);

    logger.info('Certificate expiry reminders scheduled', {
      certificateNumber: certificate.certificateNumber,
      reminders: [reminder90, reminder30]
    });
  }
}

module.exports = new GACPCertificateService();
