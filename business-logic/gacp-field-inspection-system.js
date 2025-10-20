/**
 * 🚗 GACP Field Inspection System
 * ระบบตรวจสอบฟาร์มแบบ VDO Call + ลงพื้นที่ตรวจจริง
 *
 * กระบวนการตรวจสอบ:
 * 1. นัดหมาย VDO Call กับเกษตรกร
 * 2. ทำ VDO Call เบื้องต้น
 * 3. ตัดสินใจว่าต้องลงพื้นที่หรือไม่
 * 4. หากจำเป็น จัดการลงพื้นที่ตรวจจริง
 * 5. สรุปผลการตรวจสอบและให้คะแนน
 */

const { EventEmitter } = require('events');

// เกณฑ์การตรวจสอบ GACP
const GACP_INSPECTION_CRITERIA = {
  // ด้านการจัดการพื้นที่และสิ่งแวดล้อม
  AREA_MANAGEMENT: {
    code: 'area_management',
    name: 'การจัดการพื้นที่และสิ่งแวดล้อม',
    weight: 25,
    items: [
      {
        code: 'farm_cleanliness',
        name: 'ความสะอาดของฟาร์ม',
        description: 'พื้นที่ปลูกสะอาด ไม่มีขยะหรือสิ่งปนเปื้อน',
        weight: 8,
        checkMethod: 'visual',
      },
      {
        code: 'area_boundary',
        name: 'การกำหนดขอบเขตพื้นที่',
        description: 'มีการกำหนดขอบเขตพื้นที่ปลูกชัดเจน',
        weight: 7,
        checkMethod: 'visual',
      },
      {
        code: 'drainage_system',
        name: 'ระบบระบายน้ำ',
        description: 'มีระบบระบายน้ำที่เหมาะสม',
        weight: 10,
        checkMethod: 'physical',
      },
    ],
  },

  // ด้านการปลูกและการดูแล
  CULTIVATION_PRACTICE: {
    code: 'cultivation_practice',
    name: 'การปฏิบัติการปลูกและการดูแล',
    weight: 30,
    items: [
      {
        code: 'plant_spacing',
        name: 'ระยะห่างของต้นกัญชา',
        description: 'ระยะห่างระหว่างต้นเหมาะสมตามมาตรฐาน',
        weight: 10,
        checkMethod: 'measurement',
      },
      {
        code: 'plant_health',
        name: 'สุขภาพของต้นกัญชา',
        description: 'ต้นกัญชามีสุขภาพดี ไม่เป็นโรคหรือศัตรูพืช',
        weight: 15,
        checkMethod: 'visual',
      },
      {
        code: 'water_management',
        name: 'การจัดการน้ำ',
        description: 'มีระบบให้น้ำที่เหมาะสมและเพียงพอ',
        weight: 5,
        checkMethod: 'physical',
      },
    ],
  },

  // ด้านการใช้ปุ๋ยและสารเคมี
  INPUT_MANAGEMENT: {
    code: 'input_management',
    name: 'การจัดการปัจจัยการผลิต',
    weight: 20,
    items: [
      {
        code: 'fertilizer_storage',
        name: 'การเก็บรักษาปุ๋ย',
        description: 'เก็บปุ๋ยในที่เหมาะสม ป้องกันการปนเปื้อน',
        weight: 8,
        checkMethod: 'physical',
      },
      {
        code: 'pesticide_storage',
        name: 'การเก็บรักษาสารกำจัดศัตรูพืช',
        description: 'เก็บสารเคมีแยกจากอาหารและอุปกรณ์อื่น',
        weight: 12,
        checkMethod: 'physical',
      },
    ],
  },

  // ด้านการบันทึกข้อมูล
  RECORD_KEEPING: {
    code: 'record_keeping',
    name: 'การบันทึกข้อมูล',
    weight: 15,
    items: [
      {
        code: 'cultivation_log',
        name: 'บันทึกการปลูกและดูแล',
        description: 'มีการบันทึกกิจกรรมการปลูกอย่างสม่ำเสมอ',
        weight: 8,
        checkMethod: 'document',
      },
      {
        code: 'input_usage_log',
        name: 'บันทึกการใช้ปัจจัยการผลิต',
        description: 'บันทึกการใช้ปุ๋ยและสารเคมีครบถ้วน',
        weight: 7,
        checkMethod: 'document',
      },
    ],
  },

  // ด้านอุปกรณ์และสิ่งปลูกสร้าง
  INFRASTRUCTURE: {
    code: 'infrastructure',
    name: 'อุปกรณ์และสิ่งปลูกสร้าง',
    weight: 10,
    items: [
      {
        code: 'storage_facility',
        name: 'สิ่งปลูกสร้างสำหรับเก็บผลผลิต',
        description: 'มีโรงเก็บหรือพื้นที่เก็บผลผลิตที่เหมาะสม',
        weight: 5,
        checkMethod: 'physical',
      },
      {
        code: 'equipment_condition',
        name: 'สภาพอุปกรณ์การเกษตร',
        description: 'อุปกรณ์อยู่ในสภาพดีใช้งานได้',
        weight: 5,
        checkMethod: 'visual',
      },
    ],
  },
};

// ประเภทการตรวจสอบ
const INSPECTION_TYPES = {
  VDO_CALL: {
    type: 'vdo_call',
    name: 'VDO Call',
    description: 'ตรวจสอบผ่านการโทรวิดีโอ',
    duration: 30, // นาที
    canCheck: ['visual', 'document'],
    limitations: ['ไม่สามารถตรวจสอบทางกายภาพได้', 'ขึ้นอยู่กับคุณภาพสัญญาณ'],
  },
  ON_SITE: {
    type: 'on_site',
    name: 'ลงพื้นที่ตรวจจริง',
    description: 'ตรวจสอบในพื้นที่จริง',
    duration: 120, // นาที
    canCheck: ['visual', 'physical', 'measurement', 'document'],
    limitations: ['ใช้เวลานาน', 'มีค่าใช้จ่ายในการเดินทาง'],
  },
};

class GACPFieldInspectionSystem extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.criteria = GACP_INSPECTION_CRITERIA;
    this.inspectionTypes = INSPECTION_TYPES;
    this.passingScore = 80; // คะแนนผ่าน 80%
    this.minVdoScore = 70; // คะแนนขั้นต่ำจาก VDO Call เพื่อไม่ต้องลงพื้นที่
  }

  /**
   * ดึงเกณฑ์การตรวจสอบทั้งหมด
   */
  getInspectionCriteria() {
    return Object.values(this.criteria).map(category => ({
      code: category.code,
      name: category.name,
      weight: category.weight,
      items: category.items.map(item => ({
        code: item.code,
        name: item.name,
        description: item.description,
        weight: item.weight,
        checkMethod: item.checkMethod,
      })),
    }));
  }

  /**
   * นัดหมาย VDO Call
   */
  async scheduleVDOCall(applicationId, inspectorId, scheduledDateTime, meetingDetails = {}) {
    const inspection = {
      inspectionId: this.generateInspectionId(),
      applicationId,
      inspectorId,
      type: 'vdo_call',
      status: 'scheduled',
      scheduledDateTime,
      meetingDetails: {
        platform: meetingDetails.platform || 'Microsoft Teams',
        meetingId: meetingDetails.meetingId || this.generateMeetingId(),
        meetingUrl: meetingDetails.meetingUrl,
        password: meetingDetails.password,
        instructions:
          meetingDetails.instructions || 'เตรียมเอกสารและพื้นที่ฟาร์มให้พร้อมสำหรับการตรวจสอบ',
      },
      checklist: this.generateVDOChecklist(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // บันทึกข้อมูลการตรวจสอบ
    await this.saveInspection(inspection);

    // อัพเดตใบสมัคร
    await this.updateApplicationInspectionStatus(applicationId, 'vdo_scheduled', {
      inspectionId: inspection.inspectionId,
      scheduledDateTime,
      inspectorId,
    });

    // ส่งการแจ้งเตือน
    this.emit('vdo_call_scheduled', {
      applicationId,
      inspectorId,
      scheduledDateTime,
      meetingDetails: inspection.meetingDetails,
      inspectionId: inspection.inspectionId,
    });

    return inspection;
  }

  /**
   * ดำเนินการ VDO Call
   */
  async conductVDOCall(inspectionId, vdoResults) {
    const inspection = await this.getInspection(inspectionId);

    if (inspection.type !== 'vdo_call' || inspection.status !== 'scheduled') {
      throw new Error('สถานะการตรวจสอบไม่ถูกต้องสำหรับ VDO Call');
    }

    const {
      inspectorId,
      startedAt,
      completedAt,
      attendees,
      checklistResults,
      photos,
      videos,
      findings,
      technicalIssues,
      farmersCooperation,
    } = vdoResults;

    // คำนวณคะแนน
    const score = this.calculateInspectionScore(checklistResults, 'vdo_call');

    // ตัดสินใจว่าต้องลงพื้นที่หรือไม่
    const requiresOnSite = this.shouldRequireOnSiteInspection(score, checklistResults, findings);

    // อัพเดตผลการตรวจสอบ
    inspection.status = 'completed';
    inspection.results = {
      startedAt,
      completedAt,
      duration: completedAt && startedAt ? (completedAt - startedAt) / (1000 * 60) : 0, // นาที
      attendees,
      checklistResults,
      score,
      photos,
      videos,
      findings,
      technicalIssues,
      farmersCooperation,
      requiresOnSite,
      inspector: inspectorId,
    };
    inspection.updatedAt = new Date();

    await this.saveInspection(inspection);

    if (requiresOnSite) {
      // ต้องลงพื้นที่ตรวจเพิ่มเติม
      await this.updateApplicationInspectionStatus(inspection.applicationId, 'requires_onsite', {
        vdoScore: score,
        vdoInspectionId: inspectionId,
        reason: 'VDO Call ไม่สามารถตรวจสอบได้ครบถ้วน',
      });

      this.emit('onsite_inspection_required', {
        applicationId: inspection.applicationId,
        vdoInspectionId: inspectionId,
        vdoScore: score,
        reason: requiresOnSite.reason,
      });
    } else if (score >= this.passingScore) {
      // ผ่าน VDO Call เพียงอย่างเดียว
      await this.completeInspection(inspection.applicationId, {
        finalScore: score,
        method: 'vdo_call_only',
        passed: true,
        inspectionId,
      });
    } else {
      // ไม่ผ่านเกณฑ์
      await this.completeInspection(inspection.applicationId, {
        finalScore: score,
        method: 'vdo_call_only',
        passed: false,
        inspectionId,
        reason: 'คะแนนไม่ถึงเกณฑ์ที่กำหนด',
      });
    }

    return inspection;
  }

  /**
   * นัดหมายลงพื้นที่ตรวจจริง
   */
  async scheduleOnSiteInspection(
    applicationId,
    inspectorId,
    scheduledDateTime,
    appointmentDetails = {},
  ) {
    const inspection = {
      inspectionId: this.generateInspectionId(),
      applicationId,
      inspectorId,
      type: 'on_site',
      status: 'scheduled',
      scheduledDateTime,
      appointmentDetails: {
        location: appointmentDetails.location,
        contactPerson: appointmentDetails.contactPerson,
        contactPhone: appointmentDetails.contactPhone,
        estimatedDuration: appointmentDetails.estimatedDuration || 120, // นาที
        specialInstructions: appointmentDetails.specialInstructions,
        equipmentNeeded: appointmentDetails.equipmentNeeded || [],
      },
      checklist: this.generateOnSiteChecklist(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveInspection(inspection);

    await this.updateApplicationInspectionStatus(applicationId, 'onsite_scheduled', {
      inspectionId: inspection.inspectionId,
      scheduledDateTime,
      inspectorId,
    });

    this.emit('onsite_inspection_scheduled', {
      applicationId,
      inspectorId,
      scheduledDateTime,
      appointmentDetails: inspection.appointmentDetails,
      inspectionId: inspection.inspectionId,
    });

    return inspection;
  }

  /**
   * ดำเนินการตรวจพื้นที่จริง
   */
  async conductOnSiteInspection(inspectionId, onSiteResults) {
    const inspection = await this.getInspection(inspectionId);

    if (inspection.type !== 'on_site' || inspection.status !== 'scheduled') {
      throw new Error('สถานะการตรวจสอบไม่ถูกต้องสำหรับการลงพื้นที่');
    }

    const {
      inspectorId,
      startedAt,
      completedAt,
      checklistResults,
      measurements,
      photos,
      samples,
      findings,
      recommendations,
      farmersPresent,
      weatherConditions,
    } = onSiteResults;

    // คำนวณคะแนน
    const score = this.calculateInspectionScore(checklistResults, 'on_site');

    // อัพเดตผลการตรวจสอบ
    inspection.status = 'completed';
    inspection.results = {
      startedAt,
      completedAt,
      duration: completedAt && startedAt ? (completedAt - startedAt) / (1000 * 60) : 0,
      checklistResults,
      score,
      measurements,
      photos,
      samples,
      findings,
      recommendations,
      farmersPresent,
      weatherConditions,
      inspector: inspectorId,
    };
    inspection.updatedAt = new Date();

    await this.saveInspection(inspection);

    // สรุปผลการตรวจสอบ
    await this.completeInspection(inspection.applicationId, {
      finalScore: score,
      method: 'on_site',
      passed: score >= this.passingScore,
      inspectionId,
      reason: score < this.passingScore ? 'คะแนนไม่ถึงเกณฑ์ที่กำหนด' : null,
    });

    return inspection;
  }

  /**
   * สรุปผลการตรวจสอบทั้งหมด
   */
  async completeInspection(applicationId, finalResults) {
    const application = await this.getApplication(applicationId);

    // อัพเดตผลการตรวจสอบใบสมัคร
    application.inspection = application.inspection || {};
    application.inspection.status = 'completed';
    application.inspection.completedAt = new Date();
    application.inspection.finalScore = finalResults.finalScore;
    application.inspection.passed = finalResults.passed;
    application.inspection.method = finalResults.method;
    application.inspection.inspectionId = finalResults.inspectionId;
    application.inspection.reason = finalResults.reason;

    // เพิ่มประวัติ
    application.history = application.history || [];
    application.history.push({
      action: finalResults.passed ? 'INSPECTION_PASSED' : 'INSPECTION_FAILED',
      timestamp: new Date(),
      actor: 'INSPECTOR',
      note: `การตรวจฟาร์มสำเร็จ คะแนน: ${finalResults.finalScore}% (${finalResults.method})`,
      details: finalResults,
    });

    await this.saveApplication(application);

    // ส่ง event
    this.emit('inspection_completed', {
      applicationId,
      passed: finalResults.passed,
      score: finalResults.finalScore,
      method: finalResults.method,
      inspectionId: finalResults.inspectionId,
    });

    return application;
  }

  /**
   * ตัดสินใจว่าต้องลงพื้นที่หรือไม่
   */
  shouldRequireOnSiteInspection(vdoScore, checklistResults, findings) {
    // คะแนนต่ำเกินไป
    if (vdoScore < this.minVdoScore) {
      return {
        required: true,
        reason: `คะแนน VDO Call (${vdoScore}%) ต่ำกว่าเกณฑ์ (${this.minVdoScore}%)`,
      };
    }

    // มีข้อสงสัยในรายการสำคัญ
    const criticalIssues = this.findCriticalIssues(checklistResults);
    if (criticalIssues.length > 0) {
      return {
        required: true,
        reason: `พบข้อสงสัยในรายการสำคัญ: ${criticalIssues.join(', ')}`,
      };
    }

    // มีการรายงานปัญหาที่ต้องตรวจสอบเพิ่มเติม
    const requiresPhysicalCheck = findings.some(
      finding => finding.requiresPhysicalInspection === true,
    );

    if (requiresPhysicalCheck) {
      return {
        required: true,
        reason: 'พบปัญหาที่ต้องตรวจสอบทางกายภาพ',
      };
    }

    return { required: false };
  }

  /**
   * หาปัญหาที่สำคัญ
   */
  findCriticalIssues(checklistResults) {
    const critical = [];

    Object.values(checklistResults || {}).forEach(category => {
      category.items.forEach(item => {
        // รายการที่มีน้ำหนักมาก หรือเกี่ยวกับความปลอดภัย
        if (item.weight >= 10 && (!item.passed || item.score < 70)) {
          critical.push(item.name);
        }
      });
    });

    return critical;
  }

  /**
   * คำนวณคะแนนการตรวจสอบ
   */
  calculateInspectionScore(checklistResults, inspectionType) {
    let totalWeight = 0;
    let earnedScore = 0;

    Object.values(checklistResults || {}).forEach(category => {
      category.items.forEach(item => {
        // ตรวจสอบว่าสามารถตรวจได้ด้วยวิธีนี้หรือไม่
        const canCheck = this.inspectionTypes[inspectionType.toUpperCase()]?.canCheck || [];
        if (canCheck.includes(item.checkMethod)) {
          totalWeight += item.weight;
          earnedScore += item.score || 0;
        }
      });
    });

    return totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
  }

  /**
   * สร้าง checklist สำหรับ VDO Call
   */
  generateVDOChecklist() {
    const checklist = {};

    Object.entries(this.criteria).forEach(([categoryKey, category]) => {
      checklist[categoryKey] = {
        category: category.name,
        items: category.items
          .filter(item => ['visual', 'document'].includes(item.checkMethod))
          .map(item => ({
            ...item,
            checked: false,
            score: 0,
            notes: '',
            photos: [],
          })),
      };
    });

    return checklist;
  }

  /**
   * สร้าง checklist สำหรับการลงพื้นที่
   */
  generateOnSiteChecklist() {
    const checklist = {};

    Object.entries(this.criteria).forEach(([categoryKey, category]) => {
      checklist[categoryKey] = {
        category: category.name,
        items: category.items.map(item => ({
          ...item,
          checked: false,
          score: 0,
          notes: '',
          photos: [],
          measurements: item.checkMethod === 'measurement' ? {} : null,
        })),
      };
    });

    return checklist;
  }

  /**
   * ดึงสถิติการตรวจสอบ
   */
  async getInspectionStatistics() {
    const stats = {
      total: 0,
      byType: {
        vdo_only: 0,
        onsite_only: 0,
        vdo_plus_onsite: 0,
      },
      averageScores: {
        vdo: 0,
        onsite: 0,
        combined: 0,
      },
      passRates: {
        vdo: 0,
        onsite: 0,
        overall: 0,
      },
      commonIssues: {},
      inspectionDuration: {
        vdo: 0,
        onsite: 0,
      },
    };

    // TODO: Implement actual statistics from database
    return stats;
  }

  // ==================== Helper Methods ====================

  generateInspectionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `insp_${timestamp}_${random}`;
  }

  generateMeetingId() {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  async getInspection(inspectionId) {
    // TODO: Implement database query
    throw new Error(`Inspection ${inspectionId} not found - Database integration needed`);
  }

  async saveInspection(inspection) {
    // TODO: Implement database save
    return inspection;
  }

  async getApplication(applicationId) {
    // TODO: Implement database query
    throw new Error(`Application ${applicationId} not found - Database integration needed`);
  }

  async saveApplication(application) {
    // TODO: Implement database save
    return application;
  }

  async updateApplicationInspectionStatus(applicationId, status, details = {}) {
    const application = await this.getApplication(applicationId);
    application.inspection = application.inspection || {};
    application.inspection.status = status;
    application.inspection.details = { ...application.inspection.details, ...details };
    application.inspection.updatedAt = new Date();
    return await this.saveApplication(application);
  }

  /**
   * สร้างรายงานการตรวจสอบ
   */
  generateInspectionReport(inspections) {
    if (!Array.isArray(inspections)) {
      inspections = [inspections];
    }

    const report = {
      applicationId: inspections[0]?.applicationId,
      totalInspections: inspections.length,
      inspectionMethods: [],
      finalScore: 0,
      passed: false,
      summary: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
      timeline: [],
    };

    inspections.forEach(inspection => {
      report.inspectionMethods.push({
        type: inspection.type,
        date: inspection.scheduledDateTime,
        score: inspection.results?.score || 0,
        duration: inspection.results?.duration || 0,
      });

      report.timeline.push({
        action: `${inspection.type}_completed`,
        date: inspection.results?.completedAt || inspection.updatedAt,
        score: inspection.results?.score || 0,
      });
    });

    // คำนวณคะแนนรวม (ถ้ามีทั้ง VDO และ On-site จะใช้คะแนนสูงสุด)
    const scores = inspections.map(i => i.results?.score || 0);
    report.finalScore = Math.max(...scores);
    report.passed = report.finalScore >= this.passingScore;

    return report;
  }
}

// Export
module.exports = {
  GACPFieldInspectionSystem,
  GACP_INSPECTION_CRITERIA,
  INSPECTION_TYPES,
};
