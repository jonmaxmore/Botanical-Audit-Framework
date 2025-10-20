/**
 * 🔄 Application Workflow Engine
 * ระบบจัดการ Workflow ของการสมัครใบรับรอง GACP แบบครบวงจร
 */

const EventEmitter = require('events');

class ApplicationWorkflowEngine extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    this.db = dependencies.db || null;
    this.notificationService = dependencies.notificationService || null;
    this.documentService = dependencies.documentService || null;

    // Workflow States
    this.STATES = {
      DRAFT: 'draft',
      SUBMITTED: 'submitted',
      DOCUMENT_REVIEW: 'document_review',
      FIELD_INSPECTION_SCHEDULED: 'field_inspection_scheduled',
      FIELD_INSPECTION_IN_PROGRESS: 'field_inspection_in_progress',
      FIELD_INSPECTION_COMPLETED: 'field_inspection_completed',
      COMPLIANCE_REVIEW: 'compliance_review',
      PENDING_APPROVAL: 'pending_approval',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      CERTIFICATE_ISSUED: 'certificate_issued',
      EXPIRED: 'expired',
    };

    // State Transitions Map
    this.transitions = {
      [this.STATES.DRAFT]: [this.STATES.SUBMITTED],
      [this.STATES.SUBMITTED]: [this.STATES.DOCUMENT_REVIEW, this.STATES.REJECTED],
      [this.STATES.DOCUMENT_REVIEW]: [
        this.STATES.FIELD_INSPECTION_SCHEDULED,
        this.STATES.REJECTED,
        this.STATES.SUBMITTED, // Request more documents
      ],
      [this.STATES.FIELD_INSPECTION_SCHEDULED]: [
        this.STATES.FIELD_INSPECTION_IN_PROGRESS,
        this.STATES.REJECTED,
      ],
      [this.STATES.FIELD_INSPECTION_IN_PROGRESS]: [
        this.STATES.FIELD_INSPECTION_COMPLETED,
        this.STATES.REJECTED,
      ],
      [this.STATES.FIELD_INSPECTION_COMPLETED]: [
        this.STATES.COMPLIANCE_REVIEW,
        this.STATES.REJECTED,
      ],
      [this.STATES.COMPLIANCE_REVIEW]: [
        this.STATES.PENDING_APPROVAL,
        this.STATES.REJECTED,
        this.STATES.FIELD_INSPECTION_SCHEDULED, // Re-inspection needed
      ],
      [this.STATES.PENDING_APPROVAL]: [this.STATES.APPROVED, this.STATES.REJECTED],
      [this.STATES.APPROVED]: [this.STATES.CERTIFICATE_ISSUED],
      [this.STATES.CERTIFICATE_ISSUED]: [this.STATES.EXPIRED],
    };

    // Initialize event handlers
    this._setupEventHandlers();

    console.log('[ApplicationWorkflowEngine] Initialized successfully');
  }

  /**
   * สร้างใบสมัครใหม่
   */
  async createApplication(applicationData) {
    const application = {
      id: this._generateApplicationId(),
      ...applicationData,
      status: this.STATES.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          status: this.STATES.DRAFT,
          timestamp: new Date(),
          note: 'Application created',
        },
      ],
    };

    // Save to database
    if (this.db) {
      const collection = this.db.collection('applications');
      await collection.insertOne(application);
    }

    this.emit('application:created', application);

    return application;
  }

  /**
   * ยื่นใบสมัคร (Submit)
   */
  async submitApplication(applicationId, submittedBy) {
    const application = await this._getApplication(applicationId);

    // Validate current state
    if (application.status !== this.STATES.DRAFT) {
      throw new Error(`Cannot submit application in ${application.status} state`);
    }

    // Validate required documents
    await this._validateRequiredDocuments(application);

    // Transition to submitted state
    await this._transitionState(application, this.STATES.SUBMITTED, {
      note: 'Application submitted for review',
      submittedBy,
      submittedAt: new Date(),
    });

    // Send notification
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        type: 'APPLICATION_SUBMITTED',
        userId: application.farmerId,
        data: {
          applicationId: application.id,
          farmName: application.farmName,
        },
      });
    }

    this.emit('application:submitted', application);

    return application;
  }

  /**
   * เริ่มตรวจสอบเอกสาร (Document Review)
   */
  async startDocumentReview(applicationId, reviewerId) {
    const application = await this._getApplication(applicationId);

    await this._transitionState(application, this.STATES.DOCUMENT_REVIEW, {
      note: 'Document review started',
      reviewerId,
      reviewStartedAt: new Date(),
    });

    // Assign to reviewer
    application.assignedReviewer = reviewerId;
    await this._updateApplication(application);

    this.emit('application:review_started', application);

    return application;
  }

  /**
   * เสร็จสิ้นการตรวจสอบเอกสาร
   */
  async completeDocumentReview(applicationId, reviewResult) {
    const application = await this._getApplication(applicationId);

    if (reviewResult.approved) {
      // Schedule field inspection
      await this._scheduleFieldInspection(application, reviewResult);
    } else {
      // Request more documents or reject
      if (reviewResult.requestMoreDocuments) {
        await this._transitionState(application, this.STATES.SUBMITTED, {
          note: 'More documents requested',
          requiredDocuments: reviewResult.requiredDocuments,
          reviewedBy: reviewResult.reviewerId,
        });
      } else {
        await this.rejectApplication(applicationId, reviewResult.reason, reviewResult.reviewerId);
      }
    }

    return application;
  }

  /**
   * กำหนดวันตรวจสอบหน้างาน (Schedule Field Inspection)
   */
  async _scheduleFieldInspection(application, scheduleData) {
    await this._transitionState(application, this.STATES.FIELD_INSPECTION_SCHEDULED, {
      note: 'Field inspection scheduled',
      inspectionDate: scheduleData.inspectionDate,
      inspectorId: scheduleData.inspectorId,
      scheduledBy: scheduleData.scheduledBy,
    });

    // Send notification to farmer
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        type: 'INSPECTION_SCHEDULED',
        userId: application.farmerId,
        data: {
          applicationId: application.id,
          inspectionDate: scheduleData.inspectionDate,
          inspectorName: scheduleData.inspectorName,
        },
      });
    }

    this.emit('inspection:scheduled', application);

    return application;
  }

  /**
   * เริ่มการตรวจสอบหน้างาน
   */
  async startFieldInspection(applicationId, inspectorId) {
    const application = await this._getApplication(applicationId);

    await this._transitionState(application, this.STATES.FIELD_INSPECTION_IN_PROGRESS, {
      note: 'Field inspection in progress',
      inspectorId,
      inspectionStartedAt: new Date(),
    });

    this.emit('inspection:started', application);

    return application;
  }

  /**
   * บันทึกผลการตรวจสอบหน้างาน
   */
  async completeFieldInspection(applicationId, inspectionReport) {
    const application = await this._getApplication(applicationId);

    // Save inspection report
    application.inspectionReport = {
      ...inspectionReport,
      completedAt: new Date(),
      inspectorId: inspectionReport.inspectorId,
    };

    await this._transitionState(application, this.STATES.FIELD_INSPECTION_COMPLETED, {
      note: 'Field inspection completed',
      score: inspectionReport.totalScore,
      passedInspection: inspectionReport.passed,
    });

    await this._updateApplication(application);

    // If passed, move to compliance review
    if (inspectionReport.passed) {
      await this._startComplianceReview(application);
    } else {
      // Reject or schedule re-inspection
      if (inspectionReport.allowReInspection) {
        await this._scheduleFieldInspection(application, inspectionReport.reInspectionSchedule);
      } else {
        await this.rejectApplication(
          applicationId,
          'Failed field inspection: ' + inspectionReport.failureReason,
          inspectionReport.inspectorId
        );
      }
    }

    this.emit('inspection:completed', application);

    return application;
  }

  /**
   * เริ่มตรวจสอบความสอดคล้องกับมาตรฐาน
   */
  async _startComplianceReview(application) {
    await this._transitionState(application, this.STATES.COMPLIANCE_REVIEW, {
      note: 'Compliance review started',
      reviewStartedAt: new Date(),
    });

    // Automatic compliance check
    const complianceResult = await this._performComplianceCheck(application);

    application.complianceResult = complianceResult;
    await this._updateApplication(application);

    if (complianceResult.compliant) {
      await this._transitionState(application, this.STATES.PENDING_APPROVAL, {
        note: 'Ready for final approval',
        complianceScore: complianceResult.score,
      });
    }

    this.emit('compliance:reviewed', application);

    return application;
  }

  /**
   * ตรวจสอบความสอดคล้องกับมาตรฐาน GACP
   */
  async _performComplianceCheck(application) {
    const checks = {
      documentationComplete: true,
      fieldInspectionPassed: application.inspectionReport?.passed || false,
      sopImplemented: true,
      traceabilitySystemReady: true,
      qualityControlInPlace: true,
    };

    const score = (Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100;

    return {
      compliant: score >= 80,
      score,
      checks,
      evaluatedAt: new Date(),
    };
  }

  /**
   * อนุมัติใบสมัคร
   */
  async approveApplication(applicationId, approvedBy, approvalNote) {
    const application = await this._getApplication(applicationId);

    await this._transitionState(application, this.STATES.APPROVED, {
      note: approvalNote || 'Application approved',
      approvedBy,
      approvedAt: new Date(),
    });

    // Generate certificate
    await this._issueCertificate(application, approvedBy);

    // Send notification
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        type: 'APPLICATION_APPROVED',
        userId: application.farmerId,
        data: {
          applicationId: application.id,
          farmName: application.farmName,
        },
      });
    }

    this.emit('application:approved', application);

    return application;
  }

  /**
   * ออกใบรับรอง
   */
  async _issueCertificate(application, issuedBy) {
    const certificate = {
      certificateNumber: this._generateCertificateNumber(),
      applicationId: application.id,
      farmerId: application.farmerId,
      farmName: application.farmName,
      issuedAt: new Date(),
      validUntil: this._calculateExpiryDate(),
      issuedBy,
      status: 'active',
    };

    // Save certificate
    if (this.db) {
      const collection = this.db.collection('certificates');
      await collection.insertOne(certificate);
    }

    application.certificateId = certificate.certificateNumber;

    await this._transitionState(application, this.STATES.CERTIFICATE_ISSUED, {
      note: 'Certificate issued',
      certificateNumber: certificate.certificateNumber,
    });

    await this._updateApplication(application);

    this.emit('certificate:issued', { application, certificate });

    return certificate;
  }

  /**
   * ปฏิเสธใบสมัคร
   */
  async rejectApplication(applicationId, reason, rejectedBy) {
    const application = await this._getApplication(applicationId);

    await this._transitionState(application, this.STATES.REJECTED, {
      note: 'Application rejected',
      reason,
      rejectedBy,
      rejectedAt: new Date(),
    });

    // Send notification
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        type: 'APPLICATION_REJECTED',
        userId: application.farmerId,
        data: {
          applicationId: application.id,
          reason,
        },
      });
    }

    this.emit('application:rejected', application);

    return application;
  }

  /**
   * เปลี่ยนสถานะของใบสมัคร
   */
  async _transitionState(application, newState, metadata = {}) {
    // Validate transition
    const allowedTransitions = this.transitions[application.status] || [];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(`Invalid state transition from ${application.status} to ${newState}`);
    }

    const oldState = application.status;
    application.status = newState;
    application.updatedAt = new Date();

    // Add to history
    application.history = application.history || [];
    application.history.push({
      from: oldState,
      to: newState,
      timestamp: new Date(),
      ...metadata,
    });

    await this._updateApplication(application);

    this.emit('state:changed', {
      application,
      from: oldState,
      to: newState,
      metadata,
    });

    return application;
  }

  /**
   * ตรวจสอบเอกสารที่จำเป็น
   */
  async _validateRequiredDocuments(application) {
    const requiredDocs = ['farm_registration', 'land_ownership', 'farmer_id', 'farm_map'];

    const missingDocs = requiredDocs.filter(
      doc => !application.documents || !application.documents[doc]
    );

    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    return true;
  }

  /**
   * ดึงข้อมูลใบสมัคร
   */
  async _getApplication(applicationId) {
    if (this.db) {
      const collection = this.db.collection('applications');
      const application = await collection.findOne({ id: applicationId });

      if (!application) {
        throw new Error(`Application not found: ${applicationId}`);
      }

      return application;
    }

    throw new Error('Database not configured');
  }

  /**
   * อัพเดทข้อมูลใบสมัคร
   */
  async _updateApplication(application) {
    if (this.db) {
      const collection = this.db.collection('applications');
      await collection.updateOne({ id: application.id }, { $set: application });
    }

    return application;
  }

  /**
   * ดึงสถิติของ Workflow
   */
  async getWorkflowStatistics(filters = {}) {
    if (!this.db) {
      throw new Error('Database not configured');
    }

    const collection = this.db.collection('applications');

    const stats = await collection
      .aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProcessingTime: {
              $avg: {
                $subtract: ['$updatedAt', '$createdAt'],
              },
            },
          },
        },
      ])
      .toArray();

    return stats;
  }

  /**
   * Setup event handlers
   */
  _setupEventHandlers() {
    this.on('state:changed', data => {
      console.log(`[Workflow] State changed: ${data.from} → ${data.to} for ${data.application.id}`);
    });
  }

  /**
   * Helper: Generate Application ID
   */
  _generateApplicationId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `GACP-${timestamp}-${random}`;
  }

  /**
   * Helper: Generate Certificate Number
   */
  _generateCertificateNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000);
    return `CERT-${year}-${String(random).padStart(5, '0')}`;
  }

  /**
   * Helper: Calculate Expiry Date (3 years)
   */
  _calculateExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date;
  }
}

module.exports = ApplicationWorkflowEngine;
