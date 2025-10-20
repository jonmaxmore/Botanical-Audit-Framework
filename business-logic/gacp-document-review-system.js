/**
 * 📋 GACP Document Review System
 * ระบบตรวจสอบเอกสารพร้อมกฎการแก้ไขและจำกัดจำนวนครั้งการปฏิเสธ
 *
 * กฎการตรวจสอบเอกสาร:
 * - อนุญาตให้แก้ไขได้สูงสุด 2 ครั้ง
 * - ครั้งที่ 3 หากยังไม่ผ่าน ต้องจ่ายเงินรอบแรกใหม่ (5,000 บาท)
 * - แต่ละครั้งที่แก้ไข ต้องส่งเอกสารใหม่และรอการตรวจสอบ
 * - มีระบบ checklist ที่ชัดเจนสำหรับเจ้าหน้าที่
 */

const { EventEmitter } = require('events');

// รายการเอกสารที่จำเป็นสำหรับ GACP
const REQUIRED_DOCUMENTS = {
  // เอกสารเกษตรกร
  FARMER_ID_CARD: {
    code: 'farmer_id_card',
    name: 'สำเนาบัตรประชาชนเกษตรกร',
    name_en: 'Farmer ID Card Copy',
    required: true,
    category: 'personal',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 5,
    description: 'สำเนาบัตรประชาชนของเกษตรกรที่ชัดเจน อ่านได้ทุกตัวอักษร',
  },

  HOUSE_REGISTRATION: {
    code: 'house_registration',
    name: 'สำเนาทะเบียนบ้าน',
    name_en: 'House Registration Copy',
    required: true,
    category: 'personal',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 5,
    description: 'สำเนาทะเบียนบ้านของเกษตรกร',
  },

  // เอกสารที่ดิน
  LAND_TITLE_DEED: {
    code: 'land_title_deed',
    name: 'โฉนดที่ดิน/หนังสือสำคัญการครอบครองที่ดิน',
    name_en: 'Land Title Deed',
    required: true,
    category: 'land',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 10,
    description: 'เอกสารแสดงสิทธิ์ในที่ดินที่จะปลูกกัญชา',
  },

  LAND_USE_PERMIT: {
    code: 'land_use_permit',
    name: 'ใบอนุญาตใช้ที่ดิน (ถ้ามี)',
    name_en: 'Land Use Permit',
    required: false,
    category: 'land',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 5,
    description: 'กรณีเช่าที่ดินหรือใช้ที่ดินของผู้อื่น',
  },

  // แผนผังฟาร์ม
  FARM_MAP: {
    code: 'farm_map',
    name: 'แผนผังฟาร์มและพื้นที่ปลูก',
    name_en: 'Farm Layout Map',
    required: true,
    category: 'farm',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 10,
    description: 'แผนผังแสดงขอบเขตพื้นที่ฟาร์ม พื้นที่ปลูก และสิ่งปลูกสร้าง',
  },

  // ระบบน้ำ
  WATER_PERMIT: {
    code: 'water_permit',
    name: 'ใบอนุญาตใช้น้ำ/หลักฐานแหล่งน้ำ',
    name_en: 'Water Use Permit',
    required: true,
    category: 'infrastructure',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 5,
    description: 'เอกสารแสดงสิทธิ์ในการใช้น้ำสำหรับการเกษตร',
  },

  // ใบอนุญาตปลูกกัญชา
  CANNABIS_PERMIT: {
    code: 'cannabis_permit',
    name: 'ใบอนุญาตปลูกกัญชาจากกรมวิชาการเกษตร',
    name_en: 'Cannabis Cultivation Permit',
    required: true,
    category: 'permit',
    acceptedFormats: ['pdf'],
    maxSizeMB: 5,
    description: 'ใบอนุญาตปลูกกัญชาที่ยังไม่หมดอายุ',
  },

  // แผนการปลูก
  CULTIVATION_PLAN: {
    code: 'cultivation_plan',
    name: 'แผนการปลูกและการจัดการฟาร์ม',
    name_en: 'Cultivation Management Plan',
    required: true,
    category: 'plan',
    acceptedFormats: ['pdf', 'doc', 'docx'],
    maxSizeMB: 10,
    description: 'แผนการปลูก การใช้ปุ๋ย สารกำจัดศัตรูพืช และการจัดการฟาร์ม',
  },

  // การฝึกอบรม
  TRAINING_CERTIFICATE: {
    code: 'training_certificate',
    name: 'ใบรับรองการอบรม GACP (ถ้ามี)',
    name_en: 'GACP Training Certificate',
    required: false,
    category: 'training',
    acceptedFormats: ['pdf', 'jpg', 'png'],
    maxSizeMB: 5,
    description: 'ใบรับรองการอบรมหลักเกณฑ์ GACP',
  },
};

// Checklist สำหรับการตรวจสอบเอกสาร
const DOCUMENT_CHECKLIST = {
  COMPLETENESS: {
    category: 'ความครบถ้วน',
    items: [
      {
        code: 'all_required_docs',
        question: 'มีเอกสารที่จำเป็นทั้งหมดหรือไม่?',
        weight: 20,
        critical: true,
      },
      {
        code: 'docs_readable',
        question: 'เอกสารชัดเจน อ่านได้ทุกตัวอักษรหรือไม่?',
        weight: 15,
        critical: true,
      },
      {
        code: 'docs_current',
        question: 'เอกสารยังไม่หมดอายุหรือไม่?',
        weight: 15,
        critical: true,
      },
    ],
  },

  VALIDITY: {
    category: 'ความถูกต้อง',
    items: [
      {
        code: 'id_matches',
        question: 'ข้อมูลในบัตรประชาชนตรงกับใบสมัครหรือไม่?',
        weight: 10,
        critical: false,
      },
      {
        code: 'land_ownership',
        question: 'สิทธิ์ในที่ดินถูกต้อง ชัดเจนหรือไม่?',
        weight: 15,
        critical: true,
      },
      {
        code: 'cannabis_permit_valid',
        question: 'ใบอนุญาตปลูกกัญชายังไม่หมดอายุหรือไม่?',
        weight: 20,
        critical: true,
      },
    ],
  },

  COMPLIANCE: {
    category: 'ความสอดคล้อง',
    items: [
      {
        code: 'farm_map_accurate',
        question: 'แผนผังฟาร์มสอดคล้องกับพื้นที่จริงหรือไม่?',
        weight: 10,
        critical: false,
      },
      {
        code: 'cultivation_plan_feasible',
        question: 'แผนการปลูกเป็นไปได้และสมเหตุสมผลหรือไม่?',
        weight: 15,
        critical: false,
      },
    ],
  },
};

class GACPDocumentReviewSystem extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.requiredDocs = REQUIRED_DOCUMENTS;
    this.checklist = DOCUMENT_CHECKLIST;
    this.maxRejections = 2; // จำกัดการปฏิเสธ 2 ครั้ง
  }

  /**
   * สร้างรายการเอกสารที่จำเป็น
   */
  getRequiredDocuments() {
    return Object.values(this.requiredDocs).map(doc => ({
      code: doc.code,
      name: doc.name,
      name_en: doc.name_en,
      required: doc.required,
      category: doc.category,
      acceptedFormats: doc.acceptedFormats,
      maxSizeMB: doc.maxSizeMB,
      description: doc.description,
    }));
  }

  /**
   * ตรวจสอบความครบถ้วนของเอกสารเบื้องต้น
   */
  validateDocumentSubmission(documents) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      missingRequired: [],
      invalidFormats: [],
      oversizedFiles: [],
    };

    // ตรวจสอบเอกสารที่จำเป็น
    Object.values(this.requiredDocs).forEach(docSpec => {
      if (docSpec.required && !documents[docSpec.code]) {
        validation.missingRequired.push({
          code: docSpec.code,
          name: docSpec.name,
          category: docSpec.category,
        });
        validation.valid = false;
      }

      // ตรวจสอบเอกสารที่มี
      if (documents[docSpec.code]) {
        const doc = documents[docSpec.code];

        // ตรวจสอบรูปแบบไฟล์
        if (doc.format && !docSpec.acceptedFormats.includes(doc.format.toLowerCase())) {
          validation.invalidFormats.push({
            code: docSpec.code,
            name: docSpec.name,
            submitted: doc.format,
            accepted: docSpec.acceptedFormats,
          });
          validation.valid = false;
        }

        // ตรวจสอบขนาดไฟล์
        if (doc.sizeBytes && doc.sizeBytes / (1024 * 1024) > docSpec.maxSizeMB) {
          validation.oversizedFiles.push({
            code: docSpec.code,
            name: docSpec.name,
            sizeMB: Math.round((doc.sizeBytes / (1024 * 1024)) * 10) / 10,
            maxSizeMB: docSpec.maxSizeMB,
          });
          validation.valid = false;
        }
      }
    });

    // สร้างข้อความแจ้งเตือน
    if (validation.missingRequired.length > 0) {
      validation.errors.push(`ขาดเอกสารที่จำเป็น ${validation.missingRequired.length} รายการ`);
    }

    if (validation.invalidFormats.length > 0) {
      validation.errors.push(`รูปแบบไฟล์ไม่ถูกต้อง ${validation.invalidFormats.length} รายการ`);
    }

    if (validation.oversizedFiles.length > 0) {
      validation.errors.push(`ขนาดไฟล์เกินกำหนด ${validation.oversizedFiles.length} รายการ`);
    }

    return validation;
  }

  /**
   * เริ่มกระบวนการตรวจสอบเอกสาร
   */
  async startDocumentReview(applicationId, reviewerId) {
    try {
      // ดึงข้อมูลใบสมัคร
      const application = await this.getApplication(applicationId);

      if (!application.documents) {
        throw new Error('ไม่พบเอกสารในใบสมัคร');
      }

      // ตรวจสอบความครบถ้วนเบื้องต้น
      const validation = this.validateDocumentSubmission(application.documents);

      if (!validation.valid) {
        // ส่งกลับให้แก้ไขเอกสารทันที
        return await this.rejectDocuments(applicationId, reviewerId, {
          reason: 'เอกสารไม่ครบถ้วนหรือไม่ถูกต้อง',
          findings: validation.errors,
          details: {
            missingRequired: validation.missingRequired,
            invalidFormats: validation.invalidFormats,
            oversizedFiles: validation.oversizedFiles,
          },
          autoReject: true,
        });
      }

      // สร้าง review session
      const reviewSession = {
        sessionId: this.generateReviewSessionId(),
        applicationId,
        reviewerId,
        startedAt: new Date(),
        status: 'in_progress',
        checklist: this.generateChecklist(),
        findings: [],
        score: 0,
        documents: application.documents,
      };

      // บันทึก review session
      await this.saveReviewSession(reviewSession);

      // อัพเดตสถานะใบสมัคร
      application.currentReviewSession = reviewSession.sessionId;
      application.reviewSessions = application.reviewSessions || [];
      application.reviewSessions.push(reviewSession.sessionId);

      await this.saveApplication(application);

      // ส่ง event
      this.emit('review_started', {
        applicationId,
        reviewerId,
        sessionId: reviewSession.sessionId,
      });

      return reviewSession;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ส่งผลการตรวจสอบเอกสาร
   */
  async submitReviewResult(sessionId, reviewResult) {
    try {
      const session = await this.getReviewSession(sessionId);
      const application = await this.getApplication(session.applicationId);

      const { approved, findings, checklistResults, recommendedActions } = reviewResult;

      // คำนวณคะแนน
      const score = this.calculateReviewScore(checklistResults);

      // อัพเดต review session
      session.status = 'completed';
      session.completedAt = new Date();
      session.approved = approved;
      session.findings = findings;
      session.checklistResults = checklistResults;
      session.score = score;
      session.recommendedActions = recommendedActions;

      await this.saveReviewSession(session);

      if (approved) {
        // เอกสารผ่าน
        return await this.approveDocuments(session.applicationId, session.reviewerId, session);
      } else {
        // เอกสารไม่ผ่าน
        return await this.rejectDocuments(session.applicationId, session.reviewerId, {
          reason: 'เอกสารไม่ผ่านเกณฑ์การตรวจสอบ',
          findings,
          score,
          checklistResults,
          recommendedActions,
          sessionId,
        });
      }
    } catch (error) {
      console.error('Error submitting review result:', error);
      throw error;
    }
  }

  /**
   * อนุมัติเอกสาร
   */
  async approveDocuments(applicationId, reviewerId, reviewSession) {
    const application = await this.getApplication(applicationId);

    // อัพเดตสถานะใบสมัคร
    application.documentReview = application.documentReview || {};
    application.documentReview.status = 'approved';
    application.documentReview.approvedAt = new Date();
    application.documentReview.approvedBy = reviewerId;
    application.documentReview.finalScore = reviewSession.score;
    application.documentReview.sessionId = reviewSession.sessionId;

    // เพิ่มประวัติ
    application.history = application.history || [];
    application.history.push({
      action: 'DOCUMENT_APPROVED',
      timestamp: new Date(),
      actor: reviewerId,
      note: `เอกสารผ่านการตรวจสอบ คะแนน: ${reviewSession.score}%`,
      details: {
        sessionId: reviewSession.sessionId,
        score: reviewSession.score,
      },
    });

    await this.saveApplication(application);

    // ส่ง event
    this.emit('documents_approved', {
      applicationId,
      reviewerId,
      score: reviewSession.score,
      sessionId: reviewSession.sessionId,
    });

    console.log(`✅ Documents approved: ${applicationId} - Score: ${reviewSession.score}%`);
    return application;
  }

  /**
   * ปฏิเสธเอกสาร
   */
  async rejectDocuments(applicationId, reviewerId, rejectionDetails) {
    const application = await this.getApplication(applicationId);

    // อัพเดตการนับจำนวนการปฏิเสธ
    application.documentReview = application.documentReview || {};
    application.documentReview.rejectionCount =
      (application.documentReview.rejectionCount || 0) + 1;
    application.documentReview.rejections = application.documentReview.rejections || [];

    // สร้างรายการการปฏิเสธ
    const rejection = {
      count: application.documentReview.rejectionCount,
      rejectedAt: new Date(),
      rejectedBy: reviewerId,
      reason: rejectionDetails.reason,
      findings: rejectionDetails.findings,
      score: rejectionDetails.score || 0,
      checklistResults: rejectionDetails.checklistResults,
      recommendedActions: rejectionDetails.recommendedActions,
      sessionId: rejectionDetails.sessionId,
      autoReject: rejectionDetails.autoReject || false,
    };

    application.documentReview.rejections.push(rejection);

    // ตรวจสอบว่าเกินจำนวนการปฏิเสธสูงสุดหรือไม่
    const maxRejectionsReached = application.documentReview.rejectionCount >= this.maxRejections;

    if (maxRejectionsReached) {
      // เกินจำนวนการปฏิเสธ - ต้องจ่ายเงินใหม่
      application.documentReview.status = 'rejected_max';
      application.documentReview.requiresNewPayment = true;
      application.documentReview.rejectedMaxAt = new Date();

      // เพิ่มประวัติ
      application.history.push({
        action: 'DOCUMENT_REJECTED_MAX',
        timestamp: new Date(),
        actor: reviewerId,
        note: `เอกสารถูกปฏิเสธครบ ${this.maxRejections} ครั้ง - ต้องชำระเงินใหม่`,
        details: rejection,
      });

      // ส่ง event
      this.emit('documents_rejected_max', {
        applicationId,
        reviewerId,
        rejectionCount: application.documentReview.rejectionCount,
        requiresNewPayment: true,
      });

      console.log(`❌ Documents rejected MAX: ${applicationId} - Requires new payment`);
    } else {
      // อนุญาตให้แก้ไข
      application.documentReview.status = 'revision_required';
      application.documentReview.revisionRequiredAt = new Date();

      // เพิ่มประวัติ
      application.history.push({
        action: 'DOCUMENT_REVISION_REQUIRED',
        timestamp: new Date(),
        actor: reviewerId,
        note: `เอกสารต้องแก้ไข (ครั้งที่ ${application.documentReview.rejectionCount}/${this.maxRejections})`,
        details: rejection,
      });

      // ส่ง event
      this.emit('documents_rejected', {
        applicationId,
        reviewerId,
        rejectionCount: application.documentReview.rejectionCount,
        maxRejections: this.maxRejections,
        canRevise: true,
      });

      console.log(
        `⚠️ Documents rejected: ${applicationId} - Revision required (${application.documentReview.rejectionCount}/${this.maxRejections})`
      );
    }

    await this.saveApplication(application);
    return application;
  }

  /**
   * เกษตรกรส่งเอกสารแก้ไข
   */
  async submitRevisedDocuments(applicationId, revisedDocuments, farmerId) {
    const application = await this.getApplication(applicationId);

    // ตรวจสอบสถานะ
    if (application.documentReview?.status !== 'revision_required') {
      throw new Error('ไม่สามารถส่งเอกสารแก้ไขได้ในสถานะปัจจุบัน');
    }

    // ตรวจสอบความครบถ้วนเบื้องต้น
    const validation = this.validateDocumentSubmission(revisedDocuments);

    if (!validation.valid) {
      throw new Error(`เอกสารยังไม่ถูกต้อง: ${validation.errors.join(', ')}`);
    }

    // อัพเดตเอกสาร
    application.documents = { ...application.documents, ...revisedDocuments };
    application.documentReview.status = 'pending_review';
    application.documentReview.revisedAt = new Date();
    application.documentReview.revisionSubmittedBy = farmerId;

    // เพิ่มประวัติ
    application.history.push({
      action: 'DOCUMENT_REVISED',
      timestamp: new Date(),
      actor: farmerId,
      note: 'ส่งเอกสารแก้ไขแล้ว - รอการตรวจสอบ',
      details: {
        revisedDocuments: Object.keys(revisedDocuments),
        rejectionCount: application.documentReview.rejectionCount,
      },
    });

    await this.saveApplication(application);

    // ส่ง event
    this.emit('documents_revised', {
      applicationId,
      farmerId,
      revisedDocuments: Object.keys(revisedDocuments),
      rejectionCount: application.documentReview.rejectionCount,
    });

    console.log(`📝 Documents revised: ${applicationId} - Ready for re-review`);
    return application;
  }

  /**
   * สร้าง checklist สำหรับการตรวจสอบ
   */
  generateChecklist() {
    const checklist = {};

    Object.entries(this.checklist).forEach(([categoryKey, category]) => {
      checklist[categoryKey] = {
        category: category.category,
        items: category.items.map(item => ({
          ...item,
          checked: false,
          notes: '',
          score: 0,
        })),
      };
    });

    return checklist;
  }

  /**
   * คำนวณคะแนนการตรวจสอบ
   */
  calculateReviewScore(checklistResults) {
    let totalWeight = 0;
    let earnedScore = 0;

    Object.values(checklistResults || {}).forEach(category => {
      category.items.forEach(item => {
        totalWeight += item.weight;
        if (item.checked) {
          earnedScore += item.weight;
        }
      });
    });

    return totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
  }

  /**
   * ดึงสถิติการตรวจสอบเอกสาร
   */
  async getReviewStatistics(reviewerId = null, dateFrom = null, dateTo = null) {
    // สำหรับใช้งานจริงจะดึงจากฐานข้อมูล
    const stats = {
      totalReviews: 0,
      approved: 0,
      rejected: 0,
      revisionRequired: 0,
      averageScore: 0,
      averageReviewTime: 0,
      commonIssues: {},
      byCategory: {},
      byReviewer: {},
    };

    // TODO: Implement actual statistics calculation from database
    return stats;
  }

  // ==================== Helper Methods ====================

  /**
   * สร้าง ID สำหรับ review session
   */
  generateReviewSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `review_${timestamp}_${random}`;
  }

  /**
   * ดึงข้อมูลใบสมัคร
   */
  async getApplication(applicationId) {
    // TODO: Implement database query
    // For now, return mock data or throw error
    throw new Error('Application not found - Database integration needed');
  }

  /**
   * บันทึกใบสมัคร
   */
  async saveApplication(application) {
    // TODO: Implement database save
    console.log(`Saving application: ${application.id}`);
  }

  /**
   * ดึงข้อมูล review session
   */
  async getReviewSession(sessionId) {
    // TODO: Implement database query
    throw new Error('Review session not found - Database integration needed');
  }

  /**
   * บันทึก review session
   */
  async saveReviewSession(session) {
    // TODO: Implement database save
    console.log(`Saving review session: ${session.sessionId}`);
  }

  /**
   * ดึงรายการเอกสารที่จำเป็นตามหมวดหมู่
   */
  getDocumentsByCategory() {
    const categories = {};

    Object.values(this.requiredDocs).forEach(doc => {
      if (!categories[doc.category]) {
        categories[doc.category] = [];
      }
      categories[doc.category].push(doc);
    });

    return categories;
  }

  /**
   * สร้างรายงานการตรวจสอบ
   */
  generateReviewReport(reviewSession) {
    return {
      applicationId: reviewSession.applicationId,
      sessionId: reviewSession.sessionId,
      reviewerId: reviewSession.reviewerId,
      startedAt: reviewSession.startedAt,
      completedAt: reviewSession.completedAt,
      approved: reviewSession.approved,
      score: reviewSession.score,
      findings: reviewSession.findings,
      checklistResults: reviewSession.checklistResults,
      recommendedActions: reviewSession.recommendedActions,
      summary: {
        totalChecks: this.getTotalChecklistItems(),
        passedChecks: this.getPassedChecklistItems(reviewSession.checklistResults),
        criticalIssues: this.getCriticalIssues(reviewSession.checklistResults),
        duration:
          reviewSession.completedAt && reviewSession.startedAt
            ? reviewSession.completedAt - reviewSession.startedAt
            : null,
      },
    };
  }

  /**
   * นับจำนวน checklist items ทั้งหมด
   */
  getTotalChecklistItems() {
    let total = 0;
    Object.values(this.checklist).forEach(category => {
      total += category.items.length;
    });
    return total;
  }

  /**
   * นับจำนวน checklist items ที่ผ่าน
   */
  getPassedChecklistItems(checklistResults) {
    let passed = 0;
    Object.values(checklistResults || {}).forEach(category => {
      category.items.forEach(item => {
        if (item.checked) passed++;
      });
    });
    return passed;
  }

  /**
   * ดึงปัญหาที่สำคัญ
   */
  getCriticalIssues(checklistResults) {
    const critical = [];
    Object.values(checklistResults || {}).forEach(category => {
      category.items.forEach(item => {
        if (item.critical && !item.checked) {
          critical.push({
            question: item.question,
            notes: item.notes,
          });
        }
      });
    });
    return critical;
  }
}

// Export
module.exports = {
  GACPDocumentReviewSystem,
  REQUIRED_DOCUMENTS,
  DOCUMENT_CHECKLIST,
};
