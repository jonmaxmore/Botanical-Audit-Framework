/**
 * GACP Application Service - MongoDB Integration
 * Enhanced service for handling farmer applications and SOP compliance with MongoDB
 */

// Import MongoDB models

class GACPApplicationService {
  constructor() {
    this.initializeSOPRules();
  }

  initializeSOPRules() {
    // SOP Compliance Rules based on GACP standards
    this.sopRules = {
      farmer_info: {
        required_fields: [
          'fullName',
          'idCard',
          'farmAddress',
          'cropType',
          'farmSize',
          'productionSystem',
        ],
        validation: data => {
          const missing = this.sopRules.farmer_info.required_fields.filter(field => !data[field]);
          return {
            status: missing.length === 0 ? 'pass' : 'pending',
            score:
              ((this.sopRules.farmer_info.required_fields.length - missing.length) /
                this.sopRules.farmer_info.required_fields.length) *
              100,
            errors: missing.map(field => `กรุณากรอก ${field}`),
            message:
              missing.length === 0
                ? 'ข้อมูลเกษตรกรครบถ้วน'
                : `ข้อมูลขาดหาย ${missing.length} รายการ`,
          };
        },
      },

      document_completeness: {
        required_documents: ['landTitle', 'idCard', 'farmingLicense', 'plotMap'],
        optional_documents: ['waterSource', 'coa'],
        validation: documents => {
          const uploaded = Object.keys(documents);
          const missing = this.sopRules.document_completeness.required_documents.filter(
            doc => !uploaded.includes(doc)
          );
          const hasOptional = this.sopRules.document_completeness.optional_documents.some(doc =>
            uploaded.includes(doc)
          );

          let score =
            ((this.sopRules.document_completeness.required_documents.length - missing.length) /
              this.sopRules.document_completeness.required_documents.length) *
            80;
          if (hasOptional) score += 20; // Bonus for optional documents

          return {
            status: missing.length === 0 ? 'pass' : 'pending',
            score: Math.min(score, 100),
            errors: missing.map(doc => `กรุณาอัปโหลด ${doc}`),
            message:
              missing.length === 0 ? 'เอกสารครบถ้วน' : `เอกสารขาดหาย ${missing.length} รายการ`,
          };
        },
      },

      water_source: {
        minimum_quality_score: 70,
        required_tests: ['ph', 'ec', 'heavyMetals', 'pesticides'],
        validation: waterData => {
          if (!waterData || !waterData.testResults) {
            return {
              status: 'pending',
              score: 0,
              errors: ['ไม่พบข้อมูลการทดสอบน้ำ'],
              message: 'กรุณาอัปโหลดผลการทดสอบน้ำ',
            };
          }

          const { testResults, overallScore } = waterData;
          const missingTests = this.sopRules.water_source.required_tests.filter(
            test => !testResults[test]
          );

          return {
            status:
              overallScore >= this.sopRules.water_source.minimum_quality_score &&
              missingTests.length === 0
                ? 'pass'
                : 'fail',
            score: overallScore || 0,
            errors: missingTests.map(test => `ไม่พบการทดสอบ ${test}`),
            message:
              overallScore >= this.sopRules.water_source.minimum_quality_score
                ? 'คุณภาพน้ำผ่านเกณฑ์'
                : 'คุณภาพน้ำไม่ผ่านเกณฑ์',
          };
        },
      },

      soil_quality: {
        minimum_quality_score: 75,
        required_nutrients: ['nitrogen', 'phosphorus', 'potassium', 'organicMatter'],
        validation: soilData => {
          if (!soilData || !soilData.testResults) {
            return {
              status: 'pending',
              score: 0,
              errors: ['ไม่พบข้อมูลการทดสอบดิน'],
              message: 'กรุณาอัปโหลดผลการทดสอบดิน',
            };
          }

          const { testResults, overallScore } = soilData;
          const missingNutrients = this.sopRules.soil_quality.required_nutrients.filter(
            nutrient => !testResults[nutrient]
          );

          return {
            status:
              overallScore >= this.sopRules.soil_quality.minimum_quality_score &&
              missingNutrients.length === 0
                ? 'pass'
                : 'fail',
            score: overallScore || 0,
            errors: missingNutrients.map(nutrient => `ไม่พบข้อมูล ${nutrient}`),
            message:
              overallScore >= this.sopRules.soil_quality.minimum_quality_score
                ? 'คุณภาพดินผ่านเกณฑ์'
                : 'คุณภาพดินไม่ผ่านเกณฑ์',
          };
        },
      },
    };
  }

  /**
   * Create new application in MongoDB
   */
  async createApplication(applicantId, applicationData) {
    try {
      const application = new Application({
        applicant: applicantId,
        farmInfo: applicationData.farmInfo,
        herbDetails: applicationData.herbDetails,
        status: 'draft',
        submittedAt: new Date(),
      });

      await application.save();

      return {
        success: true,
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        message: 'สร้างใบสมัครสำเร็จ',
      };
    } catch (error) {
      console.error('Create application error:', error);
      throw new Error('ไม่สามารถสร้างใบสมัครได้');
    }
  }

  /**
   * Get application by ID from MongoDB
   */
  async getApplication(applicationId) {
    try {
      const application = await Application.findById(applicationId)
        .populate('applicant', 'firstName lastName email')
        .populate('assignedInspector', 'firstName lastName email');

      if (!application) {
        throw new Error('ไม่พบใบสมัคร');
      }

      return application;
    } catch (error) {
      console.error('Get application error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลใบสมัครได้');
    }
  }

  /**
   * Update application in MongoDB
   */
  async updateApplication(applicationId, updateData) {
    try {
      const application = await Application.findByIdAndUpdate(
        applicationId,
        {
          ...updateData,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!application) {
        throw new Error('ไม่พบใบสมัคร');
      }

      return application;
    } catch (error) {
      console.error('Update application error:', error);
      throw new Error('ไม่สามารถอัปเดตใบสมัครได้');
    }
  }

  /**
   * Get applications by applicant from MongoDB
   */
  async getApplicationsByApplicant(applicantId) {
    try {
      const applications = await Application.find({ applicant: applicantId })
        .populate('assignedInspector', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return applications;
    } catch (error) {
      console.error('Get applications by applicant error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลใบสมัครได้');
    }
  }

  /**
   * Submit application for review
   */
  async submitApplication(applicationId) {
    try {
      const application = await Application.findById(applicationId);

      if (!application) {
        throw new Error('ไม่พบใบสมัคร');
      }

      if (application.status !== 'draft') {
        throw new Error('ใบสมัครนี้ถูกส่งแล้ว');
      }

      // Validate application completeness
      const validation = await this.validateApplicationCompleteness(application);

      if (!validation.isComplete) {
        throw new Error(`ใบสมัครไม่ครบถ้วน: ${validation.missingItems.join(', ')}`);
      }

      // Update status and submission time
      application.status = 'submitted';
      application.submittedAt = new Date();
      application.validationResults = validation;

      await application.save();

      return {
        success: true,
        message: 'ส่งใบสมัครสำเร็จ',
        applicationNumber: application.applicationNumber,
      };
    } catch (error) {
      console.error('Submit application error:', error);
      throw error;
    }
  }

  /**
   * Validate application completeness
   */
  async validateApplicationCompleteness(application) {
    const validation = {
      isComplete: true,
      missingItems: [],
      score: 0,
      details: {},
    };

    try {
      // Check farmer info
      const farmerValidation = this.sopRules.farmer_info.validation(application.farmInfo || {});
      validation.details.farmerInfo = farmerValidation;

      if (farmerValidation.status !== 'pass') {
        validation.isComplete = false;
        validation.missingItems.push(...farmerValidation.errors);
      }

      // Check document completeness
      const documentValidation = this.sopRules.document_completeness.validation(
        application.documents || {}
      );
      validation.details.documents = documentValidation;

      if (documentValidation.status !== 'pass') {
        validation.isComplete = false;
        validation.missingItems.push(...documentValidation.errors);
      }

      // Calculate overall score
      const scores = Object.values(validation.details).map(detail => detail.score || 0);
      validation.score = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return validation;
    } catch (error) {
      console.error('Validation error:', error);
      validation.isComplete = false;
      validation.missingItems.push('ไม่สามารถตรวจสอบความครบถ้วนได้');
      return validation;
    }
  }

  /**
   * Assign inspector to application
   */
  async assignInspector(applicationId, inspectorId) {
    try {
      const application = await Application.findById(applicationId);
      const inspector = await User.findById(inspectorId);

      if (!application) {
        throw new Error('ไม่พบใบสมัคร');
      }

      if (!inspector || inspector.role !== 'inspector') {
        throw new Error('ไม่พบผู้ตรวจสอบ');
      }

      application.assignedInspector = inspectorId;
      application.status = 'under_review';
      application.assignedAt = new Date();

      await application.save();

      return {
        success: true,
        message: 'มอบหมายผู้ตรวจสอบสำเร็จ',
        inspector: {
          id: inspector._id,
          name: `${inspector.firstName} ${inspector.lastName}`,
          email: inspector.email,
        },
      };
    } catch (error) {
      console.error('Assign inspector error:', error);
      throw error;
    }
  }

  /**
   * Update inspection results
   */
  async updateInspectionResults(applicationId, inspectionData) {
    try {
      const application = await Application.findById(applicationId);

      if (!application) {
        throw new Error('ไม่พบใบสมัคร');
      }

      application.inspectionResults = inspectionData;
      application.inspectionCompletedAt = new Date();

      // Determine status based on inspection results
      if (inspectionData.overallScore >= 80) {
        application.status = 'approved';
      } else if (inspectionData.overallScore >= 60) {
        application.status = 'conditional_approval';
      } else {
        application.status = 'rejected';
      }

      await application.save();

      return {
        success: true,
        message: 'บันทึกผลการตรวจสอบสำเร็จ',
        status: application.status,
        score: inspectionData.overallScore,
      };
    } catch (error) {
      console.error('Update inspection results error:', error);
      throw error;
    }
  }

  /**
   * Get application statistics from MongoDB
   */
  async getApplicationStatistics() {
    try {
      const stats = await Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const total = await Application.countDocuments();

      const result = {
        total,
        byStatus: {},
      };

      stats.forEach(stat => {
        result.byStatus[stat._id] = stat.count;
      });

      return result;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw new Error('ไม่สามารถดึงสถิติได้');
    }
  }

  /**
   * Search applications with filters
   */
  async searchApplications(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.herbType) {
        query['herbDetails.herbType'] = filters.herbType;
      }

      if (filters.applicant) {
        query.applicant = filters.applicant;
      }

      if (filters.assignedInspector) {
        query.assignedInspector = filters.assignedInspector;
      }

      const applications = await Application.find(query)
        .populate('applicant', 'firstName lastName email')
        .populate('assignedInspector', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return applications;
    } catch (error) {
      console.error('Search applications error:', error);
      throw new Error('ไม่สามารถค้นหาใบสมัครได้');
    }
  }
}

module.exports = new GACPApplicationService();
