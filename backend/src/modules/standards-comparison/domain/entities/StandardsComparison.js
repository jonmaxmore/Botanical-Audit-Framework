/**
 * GACP Standards Comparison System - Domain Entity
 * ระบบเปรียบเทียบมาตรฐาน GACP สำหรับการประเมินความสอดคล้องและการปรับปรุง
 *
 * Business Logic & Process Workflow:
 * 1. Standards Analysis - การวิเคราะห์และเปรียบเทียบมาตรฐาน GACP
 * 2. Compliance Assessment - การประเมินระดับการปฏิบัติตามมาตรฐาน
 * 3. Gap Analysis - การวิเคราะห์ช่องว่างและจุดที่ต้องปรับปรุง
 * 4. Improvement Recommendations - การแนะนำแนวทางการปรับปรุง
 *
 * Technical Implementation:
 * - Domain-driven design principles for standards comparison logic
 * - Complex business rules for multi-standard comparison
 * - Advanced scoring algorithms for compliance assessment
 * - Comprehensive reporting for improvement guidance
 */

const { v4: uuidv4 } = require('uuid');

/**
 * StandardsComparison - คลาสหลักสำหรับการเปรียบเทียบมาตรฐาน GACP
 *
 * Process Flow:
 * 1. Standards Selection - การเลือกมาตรฐานที่ต้องการเปรียบเทียบ
 * 2. Data Collection - การรวบรวมข้อมูลการปฏิบัติจากระบบต่างๆ
 * 3. Analysis Engine - การวิเคราะห์ความแตกต่างและความสอดคล้อง
 * 4. Gap Identification - การระบุจุดที่ต้องปรับปรุง
 * 5. Recommendation Generation - การสร้างคำแนะนำการปรับปรุง
 *
 * Business Rules:
 * - รองรับการเปรียบเทียบมาตรฐาน GACP หลายเวอร์ชัน
 * - คำนวณคะแนนความสอดคล้องแบบถ่วงน้ำหนัก
 * - สร้างรายงานแนะนำที่เฉพาะเจาะจงและปฏิบัติได้จริง
 * - ติดตามความคืบหน้าการปรับปรุงแบบเรียลไทม์
 *
 * Integration Points:
 * - เชื่อมโยงกับระบบ Farm Management เพื่อดึงข้อมูลการปฏิบัติ
 * - เชื่อมโยงกับ Survey System เพื่อรวบรวมผลการประเมิน
 * - เชื่อมโยงกับ Track & Trace เพื่อตรวจสอบการปฏิบัติจริง
 */
class StandardsComparison {
  constructor(data = {}) {
    // Basic Information
    this.id = data.id || uuidv4();
    this.comparisonName = data.comparisonName || '';
    this.description = data.description || '';
    this.farmId = data.farmId || '';

    // Standards Configuration
    this.baselineStandard = data.baselineStandard || {};
    this.targetStandards = data.targetStandards || [];
    this.comparisonScope = data.comparisonScope || 'full'; // full, partial, specific_areas

    // Analysis Configuration
    this.analysisParameters = data.analysisParameters || {
      includeCriticalItems: true,
      includeRecommendations: true,
      detailLevel: 'comprehensive', // basic, detailed, comprehensive
      priorityFocus: 'high_impact' // all, high_impact, quick_wins
    };

    // Current State Data
    this.currentPractices = data.currentPractices || {};
    this.complianceStatus = data.complianceStatus || {};

    // Comparison Results
    this.comparisonResults = data.comparisonResults || {};
    this.gapAnalysis = data.gapAnalysis || {};
    this.improvementPlan = data.improvementPlan || {};

    // Metadata
    this.status = data.status || 'draft'; // draft, analyzing, completed, archived
    this.createdDate = data.createdDate || new Date();
    this.lastAnalysisDate = data.lastAnalysisDate || null;
    this.completedDate = data.completedDate || null;
    this.version = data.version || 1;

    // Analysis Metrics
    this.overallComplianceScore = data.overallComplianceScore || 0;
    this.criticalGapsCount = data.criticalGapsCount || 0;
    this.improvementOpportunities = data.improvementOpportunities || 0;

    // Validate required data
    this.validate();
  }

  /**
   * Data Validation
   * การตรวจสอบความถูกต้องของข้อมูลพื้นฐาน
   *
   * Business Rules:
   * - ต้องมีชื่อการเปรียบเทียบที่ชัดเจน
   * - ต้องระบุฟาร์มที่เกี่ยวข้อง
   * - ต้องมีมาตรฐานอ้างอิงอย่างน้อย 1 ชุด
   */
  validate() {
    const errors = [];

    if (!this.comparisonName || this.comparisonName.trim().length === 0) {
      errors.push('Comparison name is required');
    }

    if (!this.farmId || this.farmId.trim().length === 0) {
      errors.push('Farm ID is required');
    }

    if (!this.baselineStandard || Object.keys(this.baselineStandard).length === 0) {
      errors.push('Baseline standard is required');
    }

    if (errors.length > 0) {
      throw new Error(`Standards Comparison validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Configure Comparison Parameters
   * การกำหนดค่าพารามิเตอร์สำหรับการเปรียบเทียบ
   *
   * Input Parameters:
   * @param {Object} parameters - พารามิเตอร์การวิเคราะห์
   *
   * Business Logic:
   * - กำหนดขอบเขตการเปรียบเทียบ (ทั้งหมด หรือเฉพาะส่วน)
   * - ตั้งค่าระดับรายละเอียดของการวิเคราะห์
   * - กำหนดเกณฑ์การให้ความสำคัญ
   * - เลือกประเภทการแนะนำที่ต้องการ
   *
   * Configuration Options:
   * - comparisonScope: กำหนดขอบเขตการเปรียบเทียบ
   * - detailLevel: ระดับรายละเอียดของรายงาน
   * - priorityFocus: การมุ่งเน้นประเภทการปรับปรุง
   * - includeTimeline: รวมกำหนดเวลาการปรับปรุงหรือไม่
   */
  configureComparison(parameters) {
    // อัปเดตพารามิเตอร์การวิเคราะห์
    this.analysisParameters = {
      ...this.analysisParameters,
      ...parameters,
      lastUpdated: new Date(),
      updatedBy: parameters.updatedBy || 'system'
    };

    // ตรวจสอบความถูกต้องของการตั้งค่า
    this.validateAnalysisParameters();

    // บันทึก audit trail
    this.logConfigurationChange('comparison_parameters_updated', parameters);

    return this.analysisParameters;
  }

  /**
   * Add Target Standard
   * การเพิ่มมาตรฐานเป้าหมายสำหรับการเปรียบเทียบ
   *
   * Input Parameters:
   * @param {Object} standardData - ข้อมูลมาตรฐานที่ต้องการเปรียบเทียบ
   *
   * Business Rules:
   * - แต่ละมาตรฐานต้องมี ID และชื่อที่ชัดเจน
   * - ต้องระบุเวอร์ชันของมาตรฐาน
   * - สามารถกำหนดน้ำหนักความสำคัญได้
   * - ตรวจสอบไม่ให้มีมาตรฐานซ้ำกัน
   */
  addTargetStandard(standardData) {
    // ตรวจสอบข้อมูลมาตรฐาน
    if (!standardData.id || !standardData.name || !standardData.version) {
      throw new Error('Standard ID, name, and version are required');
    }

    // ตรวจสอบว่าไม่มีมาตรฐานซ้ำ
    const existingStandard = this.targetStandards.find(
      std => std.id === standardData.id && std.version === standardData.version
    );

    if (existingStandard) {
      throw new Error(`Standard ${standardData.name} v${standardData.version} already exists`);
    }

    // เพิ่มข้อมูลเพิ่มเติม
    const standardEntry = {
      ...standardData,
      addedDate: new Date(),
      weight: standardData.weight || 1.0,
      isActive: standardData.isActive !== false,
      comparisonAreas: standardData.comparisonAreas || [],
      customCriteria: standardData.customCriteria || {}
    };

    this.targetStandards.push(standardEntry);

    // บันทึก audit trail
    this.logConfigurationChange('target_standard_added', {
      standardId: standardData.id,
      standardName: standardData.name,
      version: standardData.version
    });

    return standardEntry;
  }

  /**
   * Set Current Practices
   * การกำหนดข้อมูลการปฏิบัติปัจจุบันของฟาร์ม
   *
   * Input Parameters:
   * @param {Object} practicesData - ข้อมูลการปฏิบัติปัจจุบัน
   *
   * Business Logic:
   * - รวบรวมข้อมูลจากระบบต่างๆ ในแพลตฟอร์ม GACP
   * - จัดหมวดหมู่การปฏิบัติตามมาตรฐาน
   * - ประเมินระดับการปฏิบัติในแต่ละด้าน
   * - เชื่อมโยงกับหลักฐานสนับสนุน
   *
   * Data Sources:
   * - Farm Management System: ข้อมูลการจัดการฟาร์ม
   * - Survey Results: ผลการประเมินจากแบบสำรวจ
   * - Track & Trace Records: บันทึกการติดตามย้อนกลับ
   * - Application Documents: เอกสารประกอบการขอรับรอง
   */
  setCurrentPractices(practicesData) {
    // จัดระเบียบข้อมูลการปฏิบัติตามหมวดหมู่
    this.currentPractices = {
      // การจัดการการผลิต (Production Management)
      productionManagement: {
        seedSelection: practicesData.seedSelection || {},
        cultivationPractices: practicesData.cultivationPractices || {},
        fertilizerManagement: practicesData.fertilizerManagement || {},
        pestManagement: practicesData.pestManagement || {},
        irrigationManagement: practicesData.irrigationManagement || {}
      },

      // การควบคุมคุณภาพ (Quality Control)
      qualityControl: {
        testingProtocols: practicesData.testingProtocols || {},
        qualityAssurance: practicesData.qualityAssurance || {},
        contaminationPrevention: practicesData.contaminationPrevention || {},
        storageManagement: practicesData.storageManagement || {}
      },

      // การจัดการสิ่งแวดล้อม (Environmental Management)
      environmentalManagement: {
        soilManagement: practicesData.soilManagement || {},
        waterConservation: practicesData.waterConservation || {},
        wasteManagement: practicesData.wasteManagement || {},
        biodiversityProtection: practicesData.biodiversityProtection || {}
      },

      // ความปลอดภัยและอาชีวอนามัย (Safety and Health)
      safetyHealth: {
        workerSafety: practicesData.workerSafety || {},
        equipmentSafety: practicesData.equipmentSafety || {},
        emergencyProcedures: practicesData.emergencyProcedures || {},
        healthMonitoring: practicesData.healthMonitoring || {}
      },

      // การบริหารจัดการ (Management Systems)
      managementSystems: {
        documentationSystem: practicesData.documentationSystem || {},
        recordKeeping: practicesData.recordKeeping || {},
        staffTraining: practicesData.staffTraining || {},
        supplierManagement: practicesData.supplierManagement || {}
      },

      // ข้อมูลเมตา
      lastUpdated: new Date(),
      dataSource: practicesData.dataSource || 'manual_input',
      verificationStatus: practicesData.verificationStatus || 'pending',
      evidenceFiles: practicesData.evidenceFiles || []
    };

    // คำนวณคะแนนการปฏิบัติในแต่ละด้าน
    this.calculatePracticeScores();

    // บันทึก audit trail
    this.logConfigurationChange('current_practices_updated', {
      categories: Object.keys(this.currentPractices),
      lastUpdated: this.currentPractices.lastUpdated
    });

    return this.currentPractices;
  }

  /**
   * Run Comparison Analysis
   * การดำเนินการวิเคราะห์เปรียบเทียบมาตรฐาน
   *
   * Business Process:
   * 1. Preparation - เตรียมข้อมูลและตรวจสอบความพร้อม
   * 2. Standards Alignment - จับคู่และปรับแต่งมาตรฐานให้เข้ากันได้
   * 3. Gap Analysis - วิเคราะห์ความแตกต่างและจุดที่ขาดหาย
   * 4. Scoring Calculation - คำนวณคะแนนความสอดคล้อง
   * 5. Recommendations Generation - สร้างคำแนะนำการปรับปรุง
   *
   * Analysis Algorithm:
   * - ใช้ weighted scoring สำหรับประเมินความสำคัญ
   * - วิเคราะห์ gap ทั้งเชิงปริมาณและคุณภาพ
   * - สร้าง priority matrix สำหรับการปรับปรุง
   * - คำนวณ ROI และ feasibility ของแต่ละข้อแนะนำ
   */
  async runComparisonAnalysis() {
    try {
      // เตรียมการวิเคราะห์
      this.status = 'analyzing';
      this.lastAnalysisDate = new Date();

      // Step 1: Validate Analysis Readiness
      this.validateAnalysisReadiness();

      // Step 2: Prepare Standards Data
      const alignedStandards = this.prepareStandardsAlignment();

      // Step 3: Conduct Gap Analysis
      const gapAnalysisResults = this.conductGapAnalysis(alignedStandards);

      // Step 4: Calculate Compliance Scores
      const complianceScores = this.calculateComplianceScores(gapAnalysisResults);

      // Step 5: Generate Recommendations
      const recommendations = this.generateRecommendations(gapAnalysisResults);

      // Step 6: Create Improvement Plan
      const improvementPlan = this.createImprovementPlan(recommendations);

      // รวบรวมผลการวิเคราะห์
      this.comparisonResults = {
        analysisId: uuidv4(),
        analysisDate: this.lastAnalysisDate,
        standardsAnalyzed: alignedStandards.length + 1, // +1 for baseline
        totalCriteria: this.calculateTotalCriteria(alignedStandards),

        // คะแนนรวม
        overallCompliance: complianceScores.overall,
        categoryScores: complianceScores.byCategory,

        // Gap analysis
        totalGaps: gapAnalysisResults.totalGaps,
        criticalGaps: gapAnalysisResults.criticalGaps,
        gapsByCategory: gapAnalysisResults.byCategory,

        // Recommendations
        totalRecommendations: recommendations.length,
        highPriorityRecommendations: recommendations.filter(r => r.priority === 'high').length,
        estimatedImplementationTime: this.calculateTotalImplementationTime(recommendations)
      };

      this.gapAnalysis = gapAnalysisResults;
      this.improvementPlan = improvementPlan;

      // อัปเดตเมตริกส์สำคัญ
      this.overallComplianceScore = complianceScores.overall;
      this.criticalGapsCount = gapAnalysisResults.criticalGaps;
      this.improvementOpportunities = recommendations.length;

      // เปลี่ยนสถานะเป็นเสร็จสมบูรณ์
      this.status = 'completed';
      this.completedDate = new Date();

      // บันทึก audit trail
      this.logAnalysisCompletion();

      return this.comparisonResults;
    } catch (error) {
      this.status = 'error';
      this.logError('analysis_failed', error);
      throw new Error(`Standards comparison analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate Analysis Readiness
   * ตรวจสอบความพร้อมสำหรับการวิเคราะห์
   */
  validateAnalysisReadiness() {
    const errors = [];

    if (!this.baselineStandard || Object.keys(this.baselineStandard).length === 0) {
      errors.push('Baseline standard is required');
    }

    if (!this.currentPractices || Object.keys(this.currentPractices).length === 0) {
      errors.push('Current practices data is required');
    }

    if (this.targetStandards.length === 0) {
      errors.push('At least one target standard is required for comparison');
    }

    if (errors.length > 0) {
      throw new Error(`Analysis readiness validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Prepare Standards Alignment
   * เตรียมการจับคู่มาตรฐานสำหรับการเปรียบเทียบ
   */
  prepareStandardsAlignment() {
    return this.targetStandards
      .filter(standard => standard.isActive)
      .map(standard => {
        return {
          ...standard,
          alignedCriteria: this.alignStandardCriteria(standard),
          mappingConfidence: this.calculateMappingConfidence(standard)
        };
      });
  }

  /**
   * Conduct Gap Analysis
   * ดำเนินการวิเคราะห์ช่องว่าง (Gap Analysis)
   */
  conductGapAnalysis(alignedStandards) {
    const gaps = [];
    let criticalGapsCount = 0;

    // วิเคราะห์แต่ละมาตรฐาน
    alignedStandards.forEach(standard => {
      const standardGaps = this.analyzeStandardGaps(standard);
      gaps.push(...standardGaps);

      criticalGapsCount += standardGaps.filter(gap => gap.severity === 'critical').length;
    });

    // จัดหมวดหมู่ gaps
    const gapsByCategory = this.categorizeGaps(gaps);

    return {
      totalGaps: gaps.length,
      criticalGaps: criticalGapsCount,
      gaps: gaps,
      byCategory: gapsByCategory,
      analysisDate: new Date()
    };
  }

  /**
   * Calculate Compliance Scores
   * คำนวณคะแนนความสอดคล้องกับมาตรฐาน
   */
  calculateComplianceScores(gapAnalysisResults) {
    const categoryScores = {};

    // คำนวณคะแนนแต่ละหมวดหมู่
    Object.keys(this.currentPractices).forEach(category => {
      if (
        category !== 'lastUpdated' &&
        category !== 'dataSource' &&
        category !== 'verificationStatus' &&
        category !== 'evidenceFiles'
      ) {
        categoryScores[category] = this.calculateCategoryScore(category, gapAnalysisResults);
      }
    });

    // คำนวณคะแนนรวม (weighted average)
    const weights = this.getCategoryWeights();
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      const weight = weights[category] || 1.0;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return {
      overall: overallScore,
      byCategory: categoryScores,
      calculationDate: new Date()
    };
  }

  /**
   * Generate Recommendations
   * สร้างคำแนะนำการปรับปรุง
   */
  generateRecommendations(gapAnalysisResults) {
    const recommendations = [];

    // สร้างคำแนะนำจาก gaps ที่พบ
    gapAnalysisResults.gaps.forEach(gap => {
      const recommendation = this.createRecommendationFromGap(gap);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // เรียงลำดับตามความสำคัญและผลกระทบ
    return recommendations.sort((a, b) => {
      if (a.priority === b.priority) {
        return b.impact - a.impact;
      }
      return this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority);
    });
  }

  /**
   * Create Improvement Plan
   * สร้างแผนการปรับปรุงจากคำแนะนำ
   */
  createImprovementPlan(recommendations) {
    const plan = {
      planId: uuidv4(),
      createdDate: new Date(),
      totalRecommendations: recommendations.length,
      phases: [],
      timeline: {},
      resourceRequirements: {},
      expectedOutcomes: {}
    };

    // จัดกลุ่มคำแนะนำตามความสำคัญและเวลาดำเนินการ
    const phases = this.organizeRecommendationsIntoPhases(recommendations);

    plan.phases = phases.map((phase, index) => ({
      phaseNumber: index + 1,
      phaseName: phase.name,
      recommendations: phase.recommendations,
      estimatedDuration: phase.duration,
      dependencies: phase.dependencies || [],
      resources: phase.resources || {},
      successCriteria: phase.successCriteria || []
    }));

    // คำนวณไทม์ไลน์รวม
    plan.timeline = this.calculateImplementationTimeline(plan.phases);

    // ประเมินทรัพยากรที่ต้องการ
    plan.resourceRequirements = this.calculateResourceRequirements(recommendations);

    // คาดการณ์ผลลัพธ์
    plan.expectedOutcomes = this.calculateExpectedOutcomes(recommendations);

    return plan;
  }

  /**
   * Helper Methods
   * ฟังก์ชันช่วยเหลือต่างๆ สำหรับการคำนวณและประมวลผล
   */

  calculatePracticeScores() {
    // Implementation for calculating practice scores
    // This would involve complex scoring algorithms based on GACP standards
  }

  alignStandardCriteria(standard) {
    // Implementation for aligning standard criteria with current practices
    return [];
  }

  calculateMappingConfidence(standard) {
    // Implementation for calculating how confident we are in the mapping
    return 0.85; // Example confidence score
  }

  analyzeStandardGaps(standard) {
    // Implementation for analyzing gaps against a specific standard
    return [];
  }

  categorizeGaps(gaps) {
    // Implementation for categorizing gaps by area/severity/type
    return {};
  }

  calculateCategoryScore(category, gapAnalysisResults) {
    // Implementation for calculating compliance score for a category
    return 75; // Example score
  }

  getCategoryWeights() {
    return {
      productionManagement: 1.5,
      qualityControl: 2.0,
      environmentalManagement: 1.3,
      safetyHealth: 1.8,
      managementSystems: 1.2
    };
  }

  createRecommendationFromGap(gap) {
    // Implementation for creating actionable recommendations from gaps
    return null;
  }

  getPriorityWeight(priority) {
    const weights = { critical: 1, high: 2, medium: 3, low: 4 };
    return weights[priority] || 5;
  }

  organizeRecommendationsIntoPhases(recommendations) {
    // Implementation for organizing recommendations into implementation phases
    return [];
  }

  calculateImplementationTimeline(phases) {
    // Implementation for calculating overall implementation timeline
    return {};
  }

  calculateResourceRequirements(recommendations) {
    // Implementation for calculating required resources
    return {};
  }

  calculateExpectedOutcomes(recommendations) {
    // Implementation for calculating expected outcomes
    return {};
  }

  calculateTotalCriteria(alignedStandards) {
    return alignedStandards.reduce(
      (total, standard) => total + (standard.alignedCriteria ? standard.alignedCriteria.length : 0),
      0
    );
  }

  calculateTotalImplementationTime(recommendations) {
    return recommendations.reduce((total, rec) => total + (rec.estimatedTime || 0), 0);
  }

  validateAnalysisParameters() {
    // Implementation for validating analysis parameters
  }

  /**
   * Audit Trail Methods
   * ระบบบันทึกการเปลี่ยนแปลงและกิจกรรม
   */

  logConfigurationChange(action, details) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }

    this.auditTrail.push({
      timestamp: new Date(),
      action: action,
      details: details,
      version: this.version
    });
  }

  logAnalysisCompletion() {
    this.logConfigurationChange('analysis_completed', {
      overallScore: this.overallComplianceScore,
      criticalGaps: this.criticalGapsCount,
      completionTime: new Date() - this.lastAnalysisDate
    });
  }

  logError(action, error) {
    this.logConfigurationChange(action, {
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Export Methods
   * ระบบส่งออกข้อมูลและรายงาน
   */

  exportComparisonReport() {
    return {
      comparisonInfo: {
        id: this.id,
        name: this.comparisonName,
        description: this.description,
        farmId: this.farmId,
        status: this.status,
        analysisDate: this.lastAnalysisDate,
        version: this.version
      },
      results: this.comparisonResults,
      gapAnalysis: this.gapAnalysis,
      improvementPlan: this.improvementPlan,
      generatedAt: new Date()
    };
  }

  exportSummaryMetrics() {
    return {
      comparisonId: this.id,
      farmId: this.farmId,
      overallComplianceScore: this.overallComplianceScore,
      criticalGapsCount: this.criticalGapsCount,
      improvementOpportunities: this.improvementOpportunities,
      analysisDate: this.lastAnalysisDate,
      status: this.status
    };
  }
}

module.exports = StandardsComparison;
