/**
 * 🏆 GACP Certificate Generation System
 * ระบบออกใบรับรองอัตโนมัติสำหรับฟาร์มที่ผ่านเกณฑ์ GACP
 *
 * ฟีเจอร์หลัก:
 * - สร้างใบรับรองแบบอัตโนมัติ
 * - ระบบหมายเลขใบรับรองที่ไม่ซ้ำ
 * - สร้าง QR Code สำหรับการตรวจสอบ
 * - รองรับการส่งออกหลายรูปแบบ (PDF, PNG)
 * - ระบบ verification online
 */

const { EventEmitter } = require('events');

// เทมเพลตใบรับรอง
const CERTIFICATE_TEMPLATES = {
  STANDARD: {
    id: 'standard',
    name: 'ใบรับรอง GACP มาตรฐาน',
    description: 'ใบรับรองมาตรฐานสำหรับฟาร์มกัญชา',
    validityPeriod: 24, // เดือน
    layout: {
      width: 297, // A4 width in mm
      height: 210, // A4 height in mm
      orientation: 'landscape',
    },
    elements: {
      logo: { x: 20, y: 20, width: 60, height: 30 },
      title: { x: 148.5, y: 40, align: 'center', fontSize: 24 },
      certificateNumber: { x: 220, y: 25, fontSize: 12 },
      farmerName: { x: 148.5, y: 70, align: 'center', fontSize: 18 },
      farmName: { x: 148.5, y: 85, align: 'center', fontSize: 16 },
      location: { x: 148.5, y: 100, align: 'center', fontSize: 12 },
      validFrom: { x: 60, y: 140, fontSize: 10 },
      validUntil: { x: 60, y: 155, fontSize: 10 },
      qrCode: { x: 220, y: 120, size: 50 },
      signature: { x: 40, y: 170, width: 60, height: 25 },
      seal: { x: 200, y: 160, width: 40, height: 40 },
    },
  },
  PREMIUM: {
    id: 'premium',
    name: 'ใบรับรอง GACP พรีเมี่ยม',
    description: 'ใบรับรองพิเศษสำหรับฟาร์มที่มีคะแนนสูง',
    validityPeriod: 36, // เดือน
    minimumScore: 95,
    layout: {
      width: 210, // A4 width in mm
      height: 297, // A4 height in mm
      orientation: 'portrait',
    },
  },
};

// ข้อมูลหน่วยงานผู้ออกใบรับรอง
const ISSUING_AUTHORITY = {
  name: 'กรมวิชาการเกษตร',
  name_en: 'Department of Agriculture',
  ministry: 'กระทรวงเกษตรและสหกรณ์',
  address: '50 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900',
  website: 'https://www.doa.go.th',
  phone: '0-2579-8444',
  logo: '/assets/images/doa-logo.png',
  seal: '/assets/images/doa-seal.png',
  director: {
    name: 'นายกรรมการ ผู้อำนวยการ',
    title: 'ผู้อำนวยการกรมวิชาการเกษตร',
    signature: '/assets/images/director-signature.png',
  },
};

class GACPCertificateGenerator extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.templates = CERTIFICATE_TEMPLATES;
    this.authority = ISSUING_AUTHORITY;
    this.certificates = new Map(); // In-memory storage
  }

  /**
   * สร้างใบรับรองจากข้อมูลใบสมัคร
   */
  async generateCertificate(applicationId, templateId = 'standard') {
    try {
      // ดึงข้อมูลใบสมัคร
      const application = await this.getApplication(applicationId);

      // ตรวจสอบความพร้อม
      this.validateApplicationForCertificate(application);

      // เลือกเทมเพลต
      const template = this.selectTemplate(application, templateId);

      // สร้างหมายเลขใบรับรอง
      const certificateNumber = this.generateCertificateNumber();

      // สร้างข้อมูลใบรับรอง
      const certificateData = {
        id: this.generateCertificateId(),
        applicationId,
        certificateNumber,
        template: template.id,

        // ข้อมูลเกษตรกร
        farmer: {
          name: application.farmerName,
          idCard: application.farmerId,
          phone: application.farmerPhone,
          email: application.farmerEmail,
        },

        // ข้อมูลฟาร์ม
        farm: {
          name: application.farmDetails?.name || `ฟาร์ม${application.farmerName}`,
          address: this.formatFarmAddress(application.farmDetails),
          area: application.farmDetails?.area || 0,
          gpsLocation: application.farmDetails?.gpsLocation,
        },

        // ข้อมูลการรับรอง
        certification: {
          issuedDate: new Date(),
          validFrom: new Date(),
          validUntil: this.calculateExpiryDate(template.validityPeriod),
          standard: 'GACP (Good Agricultural and Collection Practices)',
          score: application.finalScore || 0,
          grade: this.calculateGrade(application.finalScore || 0),
        },

        // ข้อมูลการตรวจสอบ
        inspection: {
          inspectorId: application.inspection?.inspectorId,
          inspectionDate: application.inspection?.completedAt,
          method: application.inspection?.method || 'comprehensive',
          findings: application.inspection?.findings || [],
        },

        // QR Code และการตรวจสอบ
        verification: {
          qrCode: null, // จะสร้างภายหลัง
          verificationUrl: null,
          digitalSignature: null,
        },

        // สถานะ
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // สร้าง QR Code
      certificateData.verification.qrCode = await this.generateQRCode(certificateData);
      certificateData.verification.verificationUrl =
        this.generateVerificationUrl(certificateNumber);

      // สร้างลายเซ็นดิจิทัล
      certificateData.verification.digitalSignature =
        await this.generateDigitalSignature(certificateData);

      // บันทึกข้อมูล
      await this.saveCertificate(certificateData);

      // สร้างไฟล์ใบรับรอง
      const certificateFile = await this.renderCertificate(certificateData);

      // อัพเดตสถานะ
      certificateData.status = 'issued';
      certificateData.filePath = certificateFile.path;
      certificateData.downloadUrl = certificateFile.downloadUrl;
      certificateData.issuedAt = new Date();

      await this.saveCertificate(certificateData);

      // อัพเดตใบสมัคร
      await this.updateApplicationCertificate(applicationId, {
        certificateId: certificateData.id,
        certificateNumber,
        downloadUrl: certificateFile.downloadUrl,
        issuedAt: certificateData.issuedAt,
      });

      // ส่ง event
      this.emit('certificate_generated', {
        applicationId,
        certificateId: certificateData.id,
        certificateNumber,
        farmerName: application.farmerName,
      });

      return certificateData;
    } catch (error) {
      throw new Error(`Failed to generate certificate: ${error.message}`);
    }
  }

  /**
   * ตรวจสอบใบรับรองออนไลน์
   */
  async verifyCertificate(certificateNumber) {
    try {
      const certificate = await this.getCertificateByNumber(certificateNumber);

      if (!certificate) {
        return {
          valid: false,
          error: 'ไม่พบใบรับรองในระบบ',
        };
      }

      // ตรวจสอบวันหมดอายุ
      const now = new Date();
      const expired = now > new Date(certificate.certification.validUntil);

      return {
        valid: !expired,
        certificate: {
          number: certificate.certificateNumber,
          farmerName: certificate.farmer.name,
          farmName: certificate.farm.name,
          issuedDate: certificate.certification.issuedDate,
          validUntil: certificate.certification.validUntil,
          standard: certificate.certification.standard,
          score: certificate.certification.score,
          grade: certificate.certification.grade,
          expired: expired,
        },
        verification: {
          verifiedAt: new Date(),
          digitalSignature: certificate.verification.digitalSignature,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบ',
      };
    }
  }

  /**
   * ดึงรายการใบรับรองของเกษตรกร
   */
  async getFarmerCertificates(farmerId) {
    // TODO: Implement database query
    const certificates = Array.from(this.certificates.values())
      .filter(cert => cert.farmer.idCard === farmerId)
      .sort((a, b) => b.createdAt - a.createdAt);

    return certificates.map(cert => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      farmName: cert.farm.name,
      issuedDate: cert.certification.issuedDate,
      validUntil: cert.certification.validUntil,
      score: cert.certification.score,
      grade: cert.certification.grade,
      status: cert.status,
      downloadUrl: cert.downloadUrl,
      expired: new Date() > new Date(cert.certification.validUntil),
    }));
  }

  /**
   * สร้างรายงานสถิติใบรับรอง
   */
  async getCertificateStatistics(dateFrom = null, dateTo = null) {
    const certificates = Array.from(this.certificates.values());

    // กรองตามวันที่ถ้ามี
    const filteredCerts = certificates.filter(cert => {
      if (!dateFrom && !dateTo) return true;
      const issueDate = new Date(cert.certification.issuedDate);
      if (dateFrom && issueDate < new Date(dateFrom)) return false;
      if (dateTo && issueDate > new Date(dateTo)) return false;
      return true;
    });

    return {
      total: filteredCerts.length,
      active: filteredCerts.filter(cert => new Date() <= new Date(cert.certification.validUntil))
        .length,
      expired: filteredCerts.filter(cert => new Date() > new Date(cert.certification.validUntil))
        .length,
      byGrade: this.groupBy(filteredCerts, cert => cert.certification.grade),
      byTemplate: this.groupBy(filteredCerts, 'template'),
      averageScore: this.calculateAverageScore(filteredCerts),
      monthlyIssued: this.groupByMonth(filteredCerts),
      topScores: filteredCerts
        .sort((a, b) => b.certification.score - a.certification.score)
        .slice(0, 10)
        .map(cert => ({
          certificateNumber: cert.certificateNumber,
          farmerName: cert.farmer.name,
          farmName: cert.farm.name,
          score: cert.certification.score,
        })),
    };
  }

  // ==================== Helper Methods ====================

  validateApplicationForCertificate(application) {
    if (!application) {
      throw new Error('ไม่พบข้อมูลใบสมัคร');
    }

    if (application.currentState !== 'approved') {
      throw new Error('ใบสมัครยังไม่ได้รับการอนุมัติ');
    }

    if (!application.inspection?.passed) {
      throw new Error('การตรวจสอบฟาร์มยังไม่ผ่าน');
    }

    if (!application.finalScore || application.finalScore < 80) {
      throw new Error('คะแนนไม่ถึงเกณฑ์ที่กำหนด (80%)');
    }
  }

  selectTemplate(application, requestedTemplateId) {
    const template = this.templates[requestedTemplateId.toUpperCase()];

    if (!template) {
      return this.templates.STANDARD;
    }

    // ตรวจสอบเงื่อนไขพิเศษ
    if (template.minimumScore && application.finalScore < template.minimumScore) {
      return this.templates.STANDARD;
    }

    return template;
  }

  generateCertificateNumber() {
    const year = new Date().getFullYear() + 543; // Buddhist year
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const sequence = this.getNextSequenceNumber();

    return `GACP${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }

  generateCertificateId() {
    return `cert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  getNextSequenceNumber() {
    // TODO: Implement proper sequence from database
    return Math.floor(Math.random() * 9999) + 1;
  }

  formatFarmAddress(farmDetails) {
    if (!farmDetails) return 'ไม่ระบุที่อยู่';

    const parts = [
      farmDetails.address,
      farmDetails.subdistrict,
      farmDetails.district,
      farmDetails.province,
      farmDetails.postalCode,
    ].filter(Boolean);

    return parts.join(' ');
  }

  calculateExpiryDate(validityMonths) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + validityMonths);
    return expiry;
  }

  calculateGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    return 'C';
  }

  async generateQRCode(certificateData) {
    // TODO: Implement actual QR code generation
    const qrData = {
      certificateNumber: certificateData.certificateNumber,
      verificationUrl: this.generateVerificationUrl(certificateData.certificateNumber),
      issuedDate: certificateData.certification.issuedDate.toISOString(),
      farmerName: certificateData.farmer.name,
    };

    // Return mock QR code data URL
    return `data:image/png;base64,mock_qr_code_${certificateData.certificateNumber}`;
  }

  generateVerificationUrl(certificateNumber) {
    return `https://gacp.doa.go.th/verify/${certificateNumber}`;
  }

  async generateDigitalSignature(certificateData) {
    // TODO: Implement actual digital signature
    const dataToSign = JSON.stringify({
      certificateNumber: certificateData.certificateNumber,
      farmerName: certificateData.farmer.name,
      issuedDate: certificateData.certification.issuedDate,
      score: certificateData.certification.score,
    });

    // Return mock signature
    return `mock_signature_${Buffer.from(dataToSign).toString('base64').substring(0, 32)}`;
  }

  async renderCertificate(certificateData) {
    // TODO: Implement actual PDF generation
    const fileName = `GACP_Certificate_${certificateData.certificateNumber}.pdf`;
    const filePath = `/certificates/${fileName}`;

    // Mock certificate generation
    const certificateContent = this.createCertificateContent(certificateData);

    return {
      path: filePath,
      fileName: fileName,
      downloadUrl: `https://gacp.doa.go.th${filePath}`,
      mimeType: 'application/pdf',
      size: certificateContent.length,
      generatedAt: new Date(),
    };
  }

  createCertificateContent(certificateData) {
    // Mock certificate content
    return `
    กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์
    
    ใบรับรอง GACP
    (Good Agricultural and Collection Practices)
    
    หมายเลขใบรับรอง: ${certificateData.certificateNumber}
    
    ขอรับรองว่า
    นาย/นาง/นางสาว ${certificateData.farmer.name}
    
    เป็นเจ้าของ/ผู้ดำเนินการ ${certificateData.farm.name}
    ที่อยู่ ${certificateData.farm.address}
    
    ได้ผ่านการตรวจสอบมาตรฐาน GACP แล้ว
    คะแนนที่ได้ ${certificateData.certification.score}% (เกรด ${certificateData.certification.grade})
    
    วันที่ออกใบรับรอง: ${certificateData.certification.issuedDate.toLocaleDateString('th-TH')}
    วันที่หมดอายุ: ${certificateData.certification.validUntil.toLocaleDateString('th-TH')}
    
    ตรวจสอบความถูกต้องได้ที่: ${certificateData.verification.verificationUrl}
    
    ${this.authority.director.name}
    ${this.authority.director.title}
    `;
  }

  groupBy(array, keyOrFunction) {
    return array.reduce((groups, item) => {
      const key = typeof keyOrFunction === 'function' ? keyOrFunction(item) : item[keyOrFunction];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  groupByMonth(certificates) {
    return certificates.reduce((groups, cert) => {
      const month = new Date(cert.certification.issuedDate).toISOString().substring(0, 7);
      groups[month] = (groups[month] || 0) + 1;
      return groups;
    }, {});
  }

  calculateAverageScore(certificates) {
    if (certificates.length === 0) return 0;
    const total = certificates.reduce((sum, cert) => sum + cert.certification.score, 0);
    return Math.round((total / certificates.length) * 10) / 10;
  }

  // TODO: Implement these methods with actual database integration
  async getApplication(applicationId) {
    throw new Error('Database integration needed - getApplication');
  }

  async saveCertificate(certificateData) {
    this.certificates.set(certificateData.id, certificateData);
    return certificateData;
  }

  async getCertificateByNumber(certificateNumber) {
    const certificate = Array.from(this.certificates.values()).find(
      cert => cert.certificateNumber === certificateNumber
    );
    return certificate || null;
  }

  async updateApplicationCertificate(applicationId, certificateInfo) {
    // TODO: Implement database update
    return certificateInfo;
  }

  /**
   * เพิกถอนใบรับรอง
   */
  async revokeCertificate(certificateNumber, reason, revokedBy) {
    const certificate = await this.getCertificateByNumber(certificateNumber);

    if (!certificate) {
      throw new Error('ไม่พบใบรับรองในระบบ');
    }

    certificate.status = 'revoked';
    certificate.revokedAt = new Date();
    certificate.revokedBy = revokedBy;
    certificate.revocationReason = reason;

    await this.saveCertificate(certificate);

    this.emit('certificate_revoked', {
      certificateNumber,
      reason,
      revokedBy,
      farmerName: certificate.farmer.name,
    });

    return certificate;
  }

  /**
   * ต่ออายุใบรับรอง
   */
  async renewCertificate(oldCertificateNumber, newApplicationId) {
    const oldCertificate = await this.getCertificateByNumber(oldCertificateNumber);

    if (!oldCertificate) {
      throw new Error('ไม่พบใบรับรองเดิม');
    }

    // สร้างใบรับรองใหม่
    const newCertificate = await this.generateCertificate(newApplicationId);

    // อัพเดตใบรับรองเดิม
    oldCertificate.status = 'renewed';
    oldCertificate.renewedAt = new Date();
    oldCertificate.renewedTo = newCertificate.certificateNumber;

    await this.saveCertificate(oldCertificate);

    return newCertificate;
  }
}

// Export
module.exports = {
  GACPCertificateGenerator,
  CERTIFICATE_TEMPLATES,
  ISSUING_AUTHORITY,
};
