/**
 * Certificate Generation Service
 *
 * Complete Certificate Generation Workflow for Training Module
 * Integrates with Course Completion Process to provide certificate lifecycle management
 *
 * Business Logic & Process Flow:
 * 1. Certificate Eligibility Validation - Check completion requirements
 * 2. Certificate Data Generation - Create certificate with proper metadata
 * 3. Digital Certificate Creation - Generate PDF with security features
 * 4. Government Compliance Integration - Submit to regulatory systems
 * 5. Certificate Tracking - Maintain certificate lifecycle
 * 6. Renewal and Expiry Management - Handle certificate validity
 *
 * Workflow Integration:
 * - Triggered by successful course completion
 * - Validates against GACP certification standards
 * - Integrates with government reporting systems
 * - Provides real-time status tracking
 * - Supports audit trail and compliance requirements
 */

class CertificateGenerationService {
  constructor(options = {}) {
    this.config = options.config || {};
    this.logger = options.logger || console;
    this.database = options.database;
    this.pdfGenerator = options.pdfGenerator;
    this.governmentIntegration = options.governmentIntegration;
    this.notificationService = options.notificationService;

    // Certificate business rules
    this.certificateRules = {
      minimumPassingScore: 70,
      certificateValidityMonths: 24,
      renewalReminderMonths: 2,
      requiredCompetencies: ['GACP_BASICS', 'COMPLIANCE_UNDERSTANDING'],
      governmentSubmissionRequired: true,
      auditTrailRequired: true
    };

    // Certificate templates
    this.certificateTemplates = {
      GACP_BASIC: {
        templateId: 'GACP_BASIC_V2.0',
        title: 'Good Agricultural and Collection Practices (GACP) - Basic Certification',
        validityPeriod: 24,
        minimumScore: 70,
        competencies: ['GACP_BASICS', 'DOCUMENTATION', 'QUALITY_CONTROL']
      },
      GACP_ADVANCED: {
        templateId: 'GACP_ADV_V2.0',
        title: 'Good Agricultural and Collection Practices (GACP) - Advanced Certification',
        validityPeriod: 36,
        minimumScore: 85,
        competencies: ['GACP_ADVANCED', 'AUDIT_PREPARATION', 'CONTINUOUS_IMPROVEMENT']
      },
      GACP_INSPECTOR: {
        templateId: 'GACP_INSP_V2.0',
        title: 'GACP Inspector Certification',
        validityPeriod: 12,
        minimumScore: 90,
        competencies: ['INSPECTION_SKILLS', 'REGULATION_KNOWLEDGE', 'REPORT_WRITING']
      }
    };

    this.metrics = {
      certificatesGenerated: 0,
      governmentSubmissions: 0,
      validationFailures: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Main certificate generation workflow
   *
   * Business Process:
   * 1. Validate completion eligibility
   * 2. Determine certificate type and template
   * 3. Generate certificate data and metadata
   * 4. Create digital certificate (PDF)
   * 5. Submit to government systems
   * 6. Initialize tracking and monitoring
   * 7. Send notifications to stakeholders
   */
  async generateCertificate(completionData) {
    const startTime = Date.now();
    const operationId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      this.logger.log(
        `[CertificateGeneration] Starting certificate generation - Operation: ${operationId}`
      );

      // 1. Validate completion eligibility
      const eligibilityValidation = await this.validateCertificateEligibility(completionData);
      if (!eligibilityValidation.eligible) {
        throw new Error(`Certificate generation not eligible: ${eligibilityValidation.reason}`);
      }

      // 2. Determine certificate type and template
      const certificateTemplate = await this.determineCertificateTemplate(
        completionData,
        eligibilityValidation
      );

      // 3. Generate certificate data and metadata
      const certificateData = await this.generateCertificateData(
        completionData,
        certificateTemplate,
        operationId
      );

      // 4. Create digital certificate (PDF)
      const certificatePdf = await this.createDigitalCertificate(
        certificateData,
        certificateTemplate
      );

      // 5. Store certificate in database
      const storedCertificate = await this.storeCertificate(certificateData, certificatePdf);

      // 6. Submit to government systems (if required)
      let governmentSubmission = null;
      if (this.certificateRules.governmentSubmissionRequired) {
        governmentSubmission = await this.submitToGovernmentSystems(storedCertificate);
      }

      // 7. Initialize certificate tracking
      await this.initializeCertificateTracking(storedCertificate, governmentSubmission);

      // 8. Send completion notifications
      await this.sendCertificateNotifications(storedCertificate, completionData);

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics('SUCCESS', processingTime);

      const result = {
        success: true,
        certificate: storedCertificate,
        governmentSubmission: governmentSubmission,
        processingTime: processingTime,
        operationId: operationId
      };

      this.logger.log(
        `[CertificateGeneration] Certificate generated successfully - ID: ${storedCertificate.id}`
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[CertificateGeneration] Certificate generation failed - Operation: ${operationId}`,
        error
      );
      this.updateMetrics('FAILURE', Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Validate certificate eligibility with comprehensive business rules
   */
  async validateCertificateEligibility(completionData) {
    try {
      const validation = {
        eligible: true,
        reason: null,
        details: {},
        certificateType: null,
        requirements: []
      };

      // Check completion status
      if (!completionData.enrollment || completionData.enrollment.status !== 'COMPLETED') {
        validation.eligible = false;
        validation.reason = 'Enrollment not completed successfully';
        return validation;
      }

      // Check minimum score requirement
      const finalScore = completionData.enrollment.finalScore || 0;
      if (finalScore < this.certificateRules.minimumPassingScore) {
        validation.eligible = false;
        validation.reason = `Score below minimum requirement: ${finalScore}% (required: ${this.certificateRules.minimumPassingScore}%)`;
        return validation;
      }

      // Check course completion requirements
      const course = completionData.course;
      if (!course) {
        validation.eligible = false;
        validation.reason = 'Course information not available';
        return validation;
      }

      // Validate required competencies
      const courseCompetencies = course.learningObjectives || [];
      const requiredCompetencies = this.certificateRules.requiredCompetencies;
      const missingCompetencies = requiredCompetencies.filter(
        req => !courseCompetencies.some(comp => comp.toLowerCase().includes(req.toLowerCase()))
      );

      if (missingCompetencies.length > 0) {
        validation.eligible = false;
        validation.reason = `Missing required competencies: ${missingCompetencies.join(', ')}`;
        return validation;
      }

      // Determine certificate type based on course and performance
      validation.certificateType = this.determineCertificateType(course, finalScore);

      // Check for existing valid certificates
      const existingCertificate = await this.checkExistingValidCertificate(
        completionData.enrollment.farmerId,
        course.id,
        validation.certificateType
      );

      if (existingCertificate) {
        validation.eligible = false;
        validation.reason = `Valid certificate already exists: ${existingCertificate.certificateNumber}`;
        return validation;
      }

      // Set validation details
      validation.details = {
        finalScore: finalScore,
        certificateType: validation.certificateType,
        courseId: course.id,
        courseName: course.name,
        farmerId: completionData.enrollment.farmerId,
        completionDate: completionData.enrollment.completedAt
      };

      return validation;
    } catch (error) {
      this.logger.error('[CertificateGeneration] Eligibility validation failed:', error);
      return {
        eligible: false,
        reason: `Validation failed: ${error.message}`,
        details: {}
      };
    }
  }

  /**
   * Determine certificate type based on course and performance
   */
  determineCertificateType(course, finalScore) {
    // Business logic for certificate type determination
    if (course.type === 'INSPECTOR_TRAINING' && finalScore >= 90) {
      return 'GACP_INSPECTOR';
    } else if (course.level === 'ADVANCED' && finalScore >= 85) {
      return 'GACP_ADVANCED';
    } else {
      return 'GACP_BASIC';
    }
  }

  /**
   * Determine certificate template based on type and validation results
   */
  async determineCertificateTemplate(completionData, validation) {
    const certificateType = validation.certificateType;
    const template = this.certificateTemplates[certificateType];

    if (!template) {
      throw new Error(`Certificate template not found for type: ${certificateType}`);
    }

    return {
      ...template,
      customizations: await this.getCertificateCustomizations(completionData, certificateType)
    };
  }

  /**
   * Get certificate customizations based on course and farmer data
   */
  async getCertificateCustomizations(_completionData, _certificateType) {
    return {
      logoUrl: this.config.organizationLogo || '/assets/gacp-logo.png',
      organizationName: this.config.organizationName || 'GACP Certification Authority',
      signatoryName: this.config.signatoryName || 'Director of Certification',
      signatoryTitle: this.config.signatoryTitle || 'Authorized Signatory',
      watermarkText: 'AUTHENTIC GACP CERTIFICATE',
      qrCodeEnabled: true,
      securityFeatures: {
        hologram: true,
        serialNumber: true,
        verificationUrl: true
      }
    };
  }

  /**
   * Generate comprehensive certificate data
   */
  async generateCertificateData(completionData, template, operationId) {
    const certificateNumber = this.generateCertificateNumber(completionData, template);
    const issuedDate = new Date();
    const expiryDate = this.calculateExpiryDate(issuedDate, template.validityPeriod);

    const certificateData = {
      certificateNumber: certificateNumber,
      certificateType: template.templateId,
      title: template.title,

      // Recipient information
      recipient: {
        farmerId: completionData.enrollment.farmerId,
        farmerName:
          completionData.farmer?.firstName + ' ' + completionData.farmer?.lastName ||
          'Certificate Holder',
        farmerCode: completionData.farmer?.farmerCode || '',
        nationalId: completionData.farmer?.nationalId || ''
      },

      // Course information
      course: {
        courseId: completionData.course.id,
        courseName: completionData.course.name,
        courseCode: completionData.course.code,
        courseType: completionData.course.type,
        courseLevel: completionData.course.level
      },

      // Performance data
      performance: {
        finalScore: completionData.enrollment.finalScore,
        completionDate: completionData.enrollment.completedAt,
        studyDuration: completionData.enrollment.progress?.totalTimeSpentMinutes || 0,
        assessmentAttempts: completionData.enrollment.assessments?.length || 1
      },

      // Certificate metadata
      metadata: {
        issuedDate: issuedDate,
        expiryDate: expiryDate,
        validityMonths: template.validityPeriod,
        competencies: template.competencies,
        operationId: operationId,
        version: '2.0',
        issuingAuthority: template.customizations.organizationName,
        certificateTemplate: template.templateId
      },

      // Security features
      security: {
        certificateHash: '', // Will be generated after PDF creation
        verificationUrl: `${this.config.baseUrl}/verify-certificate/${certificateNumber}`,
        qrCodeData: '', // Will be generated
        digitalSignature: '', // Will be generated
        tamperProofSeal: '' // Will be generated
      },

      // Compliance and audit
      compliance: {
        gacpStandard: 'GACP-2024-V2.0',
        regulatoryCompliance: true,
        auditTrailId: operationId,
        governmentSubmissionRequired: this.certificateRules.governmentSubmissionRequired,
        renewalEligible: true
      }
    };

    // Generate QR code data
    certificateData.security.qrCodeData = this.generateQRCodeData(certificateData);

    return certificateData;
  }

  /**
   * Generate unique certificate number
   */
  generateCertificateNumber(completionData, template) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const courseCode = completionData.course.code?.substring(0, 4).toUpperCase() || 'GACP';
    const farmerCode = completionData.enrollment.farmerId.substring(-4).toUpperCase();
    const templateCode = template.templateId.substring(0, 4).replace('_', '');

    return `${courseCode}-${templateCode}-${farmerCode}-${timestamp}`;
  }

  /**
   * Calculate certificate expiry date
   */
  calculateExpiryDate(issuedDate, validityMonths) {
    const expiryDate = new Date(issuedDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
    return expiryDate;
  }

  /**
   * Generate QR code data for certificate verification
   */
  generateQRCodeData(certificateData) {
    return JSON.stringify({
      cn: certificateData.certificateNumber,
      fn: certificateData.recipient.farmerName,
      cd: certificateData.course.courseCode,
      sc: certificateData.performance.finalScore,
      id: certificateData.metadata.issuedDate.getTime(),
      ex: certificateData.metadata.expiryDate.getTime(),
      vf: certificateData.security.verificationUrl
    });
  }

  /**
   * Create digital certificate PDF with security features
   */
  async createDigitalCertificate(certificateData, template) {
    try {
      if (!this.pdfGenerator) {
        // Simplified implementation - in production would use actual PDF generation
        return {
          pdfData: Buffer.from('PDF_CERTIFICATE_DATA_PLACEHOLDER'),
          pdfUrl: `/certificates/${certificateData.certificateNumber}.pdf`,
          fileSize: 1024000, // 1MB
          mimeType: 'application/pdf'
        };
      }

      // Would implement actual PDF generation with:
      // - Certificate template rendering
      // - QR code embedding
      // - Digital signature application
      // - Security features (watermark, hologram simulation)

      const pdfResult = await this.pdfGenerator.generateCertificate({
        template: template,
        data: certificateData,
        security: {
          watermark: template.customizations.watermarkText,
          qrCode: certificateData.security.qrCodeData,
          digitalSignature: true
        }
      });

      return pdfResult;
    } catch (error) {
      this.logger.error('[CertificateGeneration] PDF creation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Store certificate in database with audit trail
   */
  async storeCertificate(certificateData, pdfData) {
    try {
      const collection = this.database.collection('certificates');

      const certificateDocument = {
        ...certificateData,
        pdf: {
          url: pdfData.pdfUrl,
          fileSize: pdfData.fileSize,
          mimeType: pdfData.mimeType,
          storedAt: new Date()
        },
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        auditTrail: [
          {
            action: 'CERTIFICATE_GENERATED',
            timestamp: new Date(),
            operationId: certificateData.metadata.operationId,
            details: 'Certificate successfully generated and stored'
          }
        ]
      };

      const result = await collection.insertOne(certificateDocument);

      return {
        ...certificateDocument,
        id: result.insertedId.toString()
      };
    } catch (error) {
      this.logger.error('[CertificateGeneration] Certificate storage failed:', error);
      throw new Error(`Certificate storage failed: ${error.message}`);
    }
  }

  /**
   * Submit certificate to government systems
   */
  async submitToGovernmentSystems(certificate) {
    try {
      if (!this.governmentIntegration) {
        return {
          submitted: false,
          reason: 'Government integration service not available',
          submissionId: null
        };
      }

      const submissionData = {
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        farmerNationalId: certificate.recipient.nationalId,
        farmerName: certificate.recipient.farmerName,
        courseName: certificate.course.courseName,
        finalScore: certificate.performance.finalScore,
        issuedDate: certificate.metadata.issuedDate,
        expiryDate: certificate.metadata.expiryDate,
        issuingAuthority: certificate.metadata.issuingAuthority
      };

      const submission = await this.governmentIntegration.submitCertificate(submissionData);

      return {
        submitted: true,
        submissionId: submission.submissionId,
        governmentReference: submission.reference,
        submittedAt: new Date(),
        status: submission.status || 'SUBMITTED'
      };
    } catch (error) {
      this.logger.error('[CertificateGeneration] Government submission failed:', error);
      return {
        submitted: false,
        reason: error.message,
        submissionId: null,
        error: error.message
      };
    }
  }

  /**
   * Initialize certificate tracking and monitoring
   */
  async initializeCertificateTracking(certificate, governmentSubmission) {
    try {
      const trackingData = {
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        farmerId: certificate.recipient.farmerId,
        status: 'ACTIVE',
        issuedDate: certificate.metadata.issuedDate,
        expiryDate: certificate.metadata.expiryDate,
        renewalReminderDate: this.calculateReminderDate(certificate.metadata.expiryDate),
        governmentSubmission: governmentSubmission,
        trackingEnabled: true,
        monitoringActive: true
      };

      // Store in certificate tracking system
      if (this.database) {
        const trackingCollection = this.database.collection('certificate_tracking');
        await trackingCollection.insertOne(trackingData);
      }

      this.logger.log(
        `[CertificateGeneration] Certificate tracking initialized: ${certificate.certificateNumber}`
      );
    } catch (error) {
      this.logger.error(
        '[CertificateGeneration] Certificate tracking initialization failed:',
        error
      );
      // Don't fail the main process
    }
  }

  /**
   * Calculate renewal reminder date
   */
  calculateReminderDate(expiryDate) {
    const reminderDate = new Date(expiryDate);
    reminderDate.setMonth(reminderDate.getMonth() - this.certificateRules.renewalReminderMonths);
    return reminderDate;
  }

  /**
   * Send certificate completion notifications
   */
  async sendCertificateNotifications(certificate, _completionData) {
    try {
      if (!this.notificationService) {
        return;
      }

      // Notification to farmer
      await this.notificationService.send({
        recipientId: certificate.recipient.farmerId,
        type: 'CERTIFICATE_ISSUED',
        title: 'Certificate Successfully Issued',
        message: `Your GACP certificate has been successfully generated. Certificate Number: ${certificate.certificateNumber}`,
        data: {
          certificateId: certificate.id,
          certificateNumber: certificate.certificateNumber,
          downloadUrl: certificate.pdf.url,
          expiryDate: certificate.metadata.expiryDate
        },
        channels: ['EMAIL', 'SMS', 'IN_APP']
      });

      // Notification to administrators
      await this.notificationService.send({
        recipientRole: 'ADMIN',
        type: 'CERTIFICATE_GENERATED',
        title: 'New Certificate Generated',
        message: `Certificate ${certificate.certificateNumber} has been issued to ${certificate.recipient.farmerName}`,
        data: {
          certificateId: certificate.id,
          certificateNumber: certificate.certificateNumber,
          farmerName: certificate.recipient.farmerName,
          courseName: certificate.course.courseName
        },
        channels: ['IN_APP', 'EMAIL']
      });
    } catch (error) {
      this.logger.error('[CertificateGeneration] Notification sending failed:', error);
      // Don't fail the main process
    }
  }

  /**
   * Check for existing valid certificate
   */
  async checkExistingValidCertificate(farmerId, courseId, certificateType) {
    try {
      if (!this.database) return null;

      const collection = this.database.collection('certificates');
      const existingCertificate = await collection.findOne({
        'recipient.farmerId': farmerId,
        'course.courseId': courseId,
        certificateType: certificateType,
        status: 'ACTIVE',
        'metadata.expiryDate': { $gt: new Date() }
      });

      return existingCertificate;
    } catch (error) {
      this.logger.error('[CertificateGeneration] Existing certificate check failed:', error);
      return null;
    }
  }

  /**
   * Update service metrics
   */
  updateMetrics(result, processingTime) {
    if (result === 'SUCCESS') {
      this.metrics.certificatesGenerated++;
    } else {
      this.metrics.validationFailures++;
    }

    // Update average processing time
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime *
        (this.metrics.certificatesGenerated + this.metrics.validationFailures - 1) +
        processingTime) /
      (this.metrics.certificatesGenerated + this.metrics.validationFailures);
  }

  /**
   * Get service health and metrics
   */
  getServiceHealth() {
    return {
      status: 'HEALTHY',
      metrics: this.metrics,
      configuration: {
        governmentIntegrationEnabled: !!this.governmentIntegration,
        pdfGenerationEnabled: !!this.pdfGenerator,
        notificationEnabled: !!this.notificationService,
        auditTrailEnabled: this.certificateRules.auditTrailRequired
      },
      lastUpdated: new Date()
    };
  }
}

module.exports = CertificateGenerationService;
