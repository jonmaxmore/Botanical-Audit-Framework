/**
 * GACP Business Logic Models
 * Based on WHO Guidelines, FAO Standards, and Thai FDA Requirements
 *
 * Compliance Framework:
 * - WHO Good Agricultural and Collection Practices (GACP)
 * - FAO Guidelines on Good Agricultural Practices
 * - Thai FDA Notification on GACP for Medicinal Plants
 * - ASEAN Guidelines for Traditional Medicine
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 * @compliance WHO-GACP, FAO, Thai-FDA, ASEAN-TM
 */

const mongoose = require('mongoose');

/**
 * GACP Application Status Workflow
 * Based on Thai FDA GACP Certification Process
 *
 * Reference: Thai FDA Notification on GACP for Medicinal Plants (2018)
 * Process: 10-Phase Certification Workflow
 */
const GACPApplicationStatus = {
  // Phase 1: Initial Application
  DRAFT: 'draft', // ร่าง - เกษตรกรเริ่มกรอกข้อมูล
  SUBMITTED: 'submitted', // ยื่นแล้ว - ส่งให้ DTAM ตรวจสอบ

  // Phase 2: Document Review
  UNDER_REVIEW: 'under_review', // กำลังตรวจสอบ - DTAM ตรวจสอบเอกสาร
  DOCUMENT_INCOMPLETE: 'document_incomplete', // เอกสารไม่ครบ - ต้องแก้ไขเพิ่มเติม
  DOCUMENT_APPROVED: 'document_approved', // เอกสารผ่าน - พร้อมตรวจประเมิน

  // Phase 3: Field Inspection
  INSPECTION_SCHEDULED: 'inspection_scheduled', // กำหนดวันตรวจ - นัดหมายผู้ตรวจ
  INSPECTION_IN_PROGRESS: 'inspection_in_progress', // กำลังตรวจ - ผู้ตรวจอยู่ในพื้นที่
  INSPECTION_COMPLETED: 'inspection_completed', // ตรวจเสร็จ - ผู้ตรวจส่งรายงาน

  // Phase 4: Assessment Results
  INSPECTION_PASSED: 'inspection_passed', // ผ่านการตรวจ - คะแนนเกินเกณฑ์
  INSPECTION_FAILED: 'inspection_failed', // ไม่ผ่านการตรวจ - ต้องแก้ไข
  CORRECTIVE_ACTION_REQUIRED: 'corrective_action_required', // ต้องแก้ไข - ภายใน 90 วัน

  // Phase 5: Final Approval
  APPROVED: 'approved', // อนุมัติ - ได้รับใบรับรอง GACP
  REJECTED: 'rejected', // ปฏิเสธ - ไม่ผ่านเกณฑ์

  // Phase 6: Certificate Management
  CERTIFICATE_ISSUED: 'certificate_issued', // ออกใบรับรอง - ใช้ได้ 3 ปี
  CERTIFICATE_SUSPENDED: 'certificate_suspended', // ระงับใบรับรอง - ชั่วคราว
  CERTIFICATE_REVOKED: 'certificate_revoked', // เพิกถอนใบรับรอง - ถาวร
  CERTIFICATE_EXPIRED: 'certificate_expired', // หมดอายุ - ต้องต่ออายุ
};

/**
 * GACP Critical Control Points (CCPs)
 * Based on HACCP Principles adapted for Agricultural Practices
 *
 * Reference: WHO Guidelines on GACP (2003), FAO Guidelines
 * Framework: 8 Critical Control Points for Medicinal Plants
 */
const GACPCriticalControlPoints = {
  // CCP 1: Seed and Planting Material (เมล็ดพันธุ์และวัสดุปลูก)
  SEED_QUALITY: {
    id: 'CCP01',
    name: 'Seed and Planting Material Quality',
    name_th: 'คุณภาพเมล็ดพันธุ์และวัสดุปลูก',
    criteria: [
      'Authenticated botanical identity', // ตัวตนทางพฤกษศาสตร์ที่ถูกต้อง
      'Genetic purity and stability', // ความบริสุทธิ์และเสถียรภาพทางพันธุกรรม
      'Freedom from pathogens', // ปราศจากเชื้อโรค
      'Proper storage conditions', // การเก็บรักษาที่เหมาะสม
    ],
    weight: 15, // 15% ของคะแนนรวม
    min_score: 70, // คะแนนขั้นต่ำ 70%
  },

  // CCP 2: Soil Management (การจัดการดิน)
  SOIL_MANAGEMENT: {
    id: 'CCP02',
    name: 'Soil Management and Environment',
    name_th: 'การจัดการดินและสิ่งแวดล้อม',
    criteria: [
      'Soil contamination assessment', // การประเมินการปนเปื้อนในดิน
      'Heavy metals within limits', // โลหะหนักไม่เกินเกณฑ์
      'Proper drainage systems', // ระบบการระบายน้ำที่เหมาะสม
      'Environmental protection', // การปกป้องสิ่งแวดล้อม
    ],
    weight: 12,
    min_score: 75,
  },

  // CCP 3: Pest and Disease Management (การจัดการศัตรูพืช)
  PEST_MANAGEMENT: {
    id: 'CCP03',
    name: 'Integrated Pest Management',
    name_th: 'การจัดการศัตรูพืชแบบผสมผสาน',
    criteria: [
      'IPM strategy implementation', // การใช้กลยุทธ์ IPM
      'Approved pesticide list compliance', // การใช้สารกำจัดศัตรูพืชที่อนุญาต
      'Residue levels within MRL', // สารตกค้างไม่เกิน MRL
      'Natural control methods priority', // ให้ความสำคัญกับการควบคุมทางธรรมชาติ
    ],
    weight: 18,
    min_score: 80,
  },

  // CCP 4: Harvesting (การเก็บเกี่ยว)
  HARVESTING: {
    id: 'CCP04',
    name: 'Harvesting Practices',
    name_th: 'หลักปฏิบัติการเก็บเกี่ยว',
    criteria: [
      'Optimal harvesting time', // เวลาเก็บเกี่ยวที่เหมาะสม
      'Proper harvesting methods', // วิธีการเก็บเกี่ยวที่ถูกต้อง
      'Clean harvesting tools', // เครื่องมือเก็บเกี่ยวที่สะอาด
      'Weather conditions consideration', // การพิจารณาสภาพอากาศ
    ],
    weight: 15,
    min_score: 75,
  },

  // CCP 5: Post-Harvest Handling (การจัดการหลังการเก็บเกี่ยว)
  POST_HARVEST: {
    id: 'CCP05',
    name: 'Post-Harvest Handling',
    name_th: 'การจัดการหลังการเก็บเกี่ยว',
    criteria: [
      'Immediate cooling/drying', // การทำความเย็น/การอบแห้งทันที
      'Clean processing facilities', // สิ่งอำนวยความสะดวกในการแปรรูปที่สะอาด
      'Prevention of cross-contamination', // การป้องกันการปนเปื้อนไขว้
      'Proper handling procedures', // ขั้นตอนการจัดการที่เหมาะสม
    ],
    weight: 13,
    min_score: 75,
  },

  // CCP 6: Storage and Packaging (การเก็บรักษาและบรรจุภัณฑ์)
  STORAGE_PACKAGING: {
    id: 'CCP06',
    name: 'Storage and Packaging',
    name_th: 'การเก็บรักษาและบรรจุภัณฑ์',
    criteria: [
      'Controlled storage conditions', // สภาวะการเก็บรักษาที่ควบคุม
      'Pest-free storage areas', // พื้นที่เก็บปราศจากศัตรูพืช
      'Appropriate packaging materials', // วัสดุบรรจุภัณฑ์ที่เหมาะสม
      'Clear labeling system', // ระบบการติดฉลากที่ชัดเจน
    ],
    weight: 10,
    min_score: 70,
  },

  // CCP 7: Documentation and Records (การจัดทำเอกสารและบันทึก)
  DOCUMENTATION: {
    id: 'CCP07',
    name: 'Documentation and Record Keeping',
    name_th: 'การจัดทำเอกสารและการเก็บบันทึก',
    criteria: [
      'Complete field records', // บันทึกการปฏิบัติในแปลงครบถ้วน
      'Input usage documentation', // การบันทึกการใช้ปัจจัยการผลิต
      'Traceability system', // ระบบการติดตามย้อนกลับ
      'Staff training records', // บันทึกการฝึกอบรมพนักงาน
    ],
    weight: 9,
    min_score: 80,
  },

  // CCP 8: Personnel Training (การฝึกอบรมบุคลากร)
  PERSONNEL_TRAINING: {
    id: 'CCP08',
    name: 'Personnel Hygiene and Training',
    name_th: 'สุขอนามัยและการฝึกอบรมบุคลากร',
    criteria: [
      'GACP knowledge training', // การฝึกอบรมความรู้ GACP
      'Personal hygiene practices', // การปฏิบัติด้านสุขอนามัยส่วนบุคคล
      'Safety procedures understanding', // ความเข้าใจขั้นตอนความปลอดภัย
      'Regular competency assessment', // การประเมินความสามารถเป็นประจำ
    ],
    weight: 8,
    min_score: 75,
  },
};

/**
 * GACP Scoring System
 * Based on Thai FDA GACP Assessment Criteria
 *
 * Total Score Calculation:
 * - Each CCP has weighted score
 * - Minimum passing score: 75% overall
 * - No CCP can score below minimum threshold
 */
const GACPScoringSystem = {
  TOTAL_SCORE_MAX: 100,
  OVERALL_PASSING_SCORE: 75,

  // Certificate Levels based on score
  CERTIFICATE_LEVELS: {
    GOLD: { min: 90, max: 100, validity: 3 }, // 3 years validity
    SILVER: { min: 80, max: 89, validity: 2 }, // 2 years validity
    BRONZE: { min: 75, max: 79, validity: 1 }, // 1 year validity
  },

  // Risk Assessment Categories
  RISK_LEVELS: {
    LOW: { score_range: [85, 100], monitoring: 'Annual' },
    MEDIUM: { score_range: [75, 84], monitoring: 'Semi-annual' },
    HIGH: { score_range: [0, 74], monitoring: 'Quarterly' },
  },
};

/**
 * GACP Compliance Requirements
 * Legal Framework and Regulatory Compliance
 */
const GACPComplianceFramework = {
  // Thai Legal Requirements
  THAI_REGULATIONS: {
    FDA_NOTIFICATION: 'Thai FDA Notification on GACP for Medicinal Plants (2018)',
    PLANT_QUARANTINE_ACT: 'Plant Quarantine Act B.E. 2507 (1964)',
    HAZARDOUS_SUBSTANCES_ACT: 'Hazardous Substances Act B.E. 2535 (1992)',
    DRUG_ACT: 'Drug Act B.E. 2510 (1967)',
  },

  // International Standards
  INTERNATIONAL_STANDARDS: {
    WHO_GACP: 'WHO Guidelines on Good Agricultural and Collection Practices (2003)',
    FAO_GUIDELINES: 'FAO Guidelines on Good Agricultural Practices',
    ASEAN_GUIDELINES: 'ASEAN Guidelines for Traditional Medicine',
    ISO_22000: 'ISO 22000:2018 Food Safety Management Systems',
  },

  // Mandatory Documentation
  REQUIRED_DOCUMENTS: [
    'Land ownership or lease agreement', // เอกสารกรรมสิทธิ์หรือสัญญาเช่าที่ดิน
    'Soil analysis report', // รายงานการวิเคราะห์ดิน
    'Water quality test results', // ผลการทดสอบคุณภาพน้ำ
    'Seed/planting material certificates', // ใบรับรองเมล็ดพันธุ์/วัสดุปลูก
    'Pesticide usage records', // บันทึกการใช้สารกำจัดศัตรูพืช
    'Harvesting and processing records', // บันทึกการเก็บเกี่ยวและแปรรูป
    'Staff training certificates', // ใบรับรองการฝึกอบรมพนักงาน
    'Internal audit reports', // รายงานการตรวจสอบภายใน
  ],
};

/**
 * Export GACP Business Logic Models
 */
module.exports = {
  GACPApplicationStatus,
  GACPCriticalControlPoints,
  GACPScoringSystem,
  GACPComplianceFramework,

  // Helper Functions
  getWorkflowSteps: () => Object.keys(GACPApplicationStatus),
  getCCPList: () => Object.keys(GACPCriticalControlPoints),
  calculateTotalScore: ccpScores => {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [ccpKey, ccp] of Object.entries(GACPCriticalControlPoints)) {
      if (ccpScores[ccpKey]) {
        totalScore += (ccpScores[ccpKey] * ccp.weight) / 100;
        totalWeight += ccp.weight;
      }
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  },

  getCertificateLevel: totalScore => {
    for (const [level, criteria] of Object.entries(GACPScoringSystem.CERTIFICATE_LEVELS)) {
      if (totalScore >= criteria.min && totalScore <= criteria.max) {
        return { level, ...criteria };
      }
    }
    return null;
  },

  validateCCPScores: ccpScores => {
    const violations = [];

    for (const [ccpKey, ccp] of Object.entries(GACPCriticalControlPoints)) {
      if (ccpScores[ccpKey] < ccp.min_score) {
        violations.push({
          ccp: ccpKey,
          required: ccp.min_score,
          actual: ccpScores[ccpKey],
          name: ccp.name_th,
        });
      }
    }

    return violations;
  },
};
