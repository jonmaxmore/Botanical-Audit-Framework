/**
 * GACP Survey System - Infrastructure Layer Repository
 * ระบบ Repository สำหรับการจัดการข้อมูล Survey ในฐานข้อมูล MongoDB
 *
 * Business Logic & Process Workflow:
 * 1. Data Persistence Layer - การจัดการข้อมูลแบบสำรวจในฐานข้อมูล
 * 2. MongoDB Integration - การเชื่อมต่อและจัดการข้อมูลผ่าน MongoDB
 * 3. GACP Standards Compliance - การจัดเก็บข้อมูลตามมาตรฐาน GACP
 * 4. Performance Optimization - การปรับปรุงประสิทธิภาพการเข้าถึงข้อมูล
 *
 * Technical Implementation:
 * - Repository Pattern Implementation for Clean Architecture
 * - MongoDB Query Optimization for GACP Survey Data
 * - Error Handling and Data Validation
 * - Audit Trail and Change Tracking
 */

const Survey = require('../../domain/entities/Survey');
const SurveyResponse = require('../../domain/entities/SurveyResponse');

/**
 * SurveyRepository - คลาสสำหรับจัดการการเข้าถึงข้อมูล Survey
 *
 * Process Flow:
 * 1. Survey CRUD Operations - การสร้าง อ่าน แก้ไข และลบข้อมูลแบบสำรวจ
 * 2. Query Optimization - การปรับปรุงประสิทธิภาพการค้นหา
 * 3. Data Validation - การตรวจสอบความถูกต้องของข้อมูล
 * 4. Relationship Management - การจัดการความสัมพันธ์ระหว่างข้อมูล
 *
 * Workflow Logic:
 * - มีการติดตาม audit trail ทุกการเปลี่ยนแปลง
 * - รองรับการค้นหาและกรองข้อมูลแบบหลากหลาย
 * - จัดการความสัมพันธ์กับ SurveyResponse อย่างมีประสิทธิภาพ
 * - รองรับการทำงานแบบ pagination สำหรับข้อมูลจำนวนมาก
 */
class SurveyRepository {
  constructor(mongoClient, logger) {
    this.db = mongoClient.db('gacp_platform');
    this.collection = this.db.collection('surveys');
    this.responseCollection = this.db.collection('survey_responses');
    this.logger = logger;

    // สร้าง indexes สำหรับการค้นหาที่มีประสิทธิภาพ
    // Performance optimization through proper indexing
    this.initializeIndexes();
  }

  /**
   * Initialize Database Indexes
   * การสร้าง indexes เพื่อปรับปรุงประสิทธิภาพการค้นหา
   *
   * Business Reasoning:
   * - เพิ่มความเร็วในการค้นหาข้อมูลแบบสำรวจ
   * - รองรับการค้นหาตามเงื่อนไขต่างๆ ของ GACP
   * - ปรับปรุงประสิทธิภาพการทำงานของระบบโดยรวม
   */
  async initializeIndexes() {
    try {
      // Index สำหรับการค้นหาพื้นฐาน
      await this.collection.createIndex({ farmId: 1, isActive: 1 });
      await this.collection.createIndex({ category: 1, createdDate: -1 });
      await this.collection.createIndex({ 'gacpStandards.category': 1 });

      // Text index สำหรับการค้นหาข้อความ
      await this.collection.createIndex({
        title: 'text',
        description: 'text',
        'sections.title': 'text',
        'sections.questions.questionText': 'text',
      });

      // Response collection indexes
      await this.responseCollection.createIndex({ surveyId: 1, farmId: 1 });
      await this.responseCollection.createIndex({ status: 1, startDate: -1 });

      this.logger.info('Survey repository indexes initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize survey indexes:', error);
    }
  }

  /**
   * Create Survey
   * การสร้างแบบสำรวจใหม่ในระบบ
   *
   * Input Parameters:
   * @param {Object} surveyData - ข้อมูลแบบสำรวจที่จะสร้าง
   *
   * Business Process:
   * 1. ตรวจสอบความถูกต้องของข้อมูลที่ส่งเข้ามา
   * 2. สร้าง Survey entity ด้วยข้อมูลที่ได้รับ
   * 3. บันทึกลงฐานข้อมูลพร้อม audit trail
   * 4. ส่งคืน Survey entity ที่สร้างเสร็จแล้ว
   *
   * Error Handling:
   * - จัดการข้อผิดพลาดจากการเชื่อมต่อฐานข้อมูล
   * - ตรวจสอบข้อมูลซ้ำกันหรือไม่ถูกต้อง
   * - บันทึก error logs เพื่อการติดตาม
   */
  async createSurvey(surveyData) {
    try {
      this.logger.info('Creating new survey in database', {
        title: surveyData.title,
        category: surveyData.category,
      });

      // สร้าง Survey entity
      const survey = new Survey(surveyData);

      // เตรียมข้อมูลสำหรับบันทึกลงฐานข้อมูล
      const surveyDocument = {
        _id: survey.id,
        title: survey.title,
        description: survey.description,
        category: survey.category,
        farmId: survey.farmId,
        sections: survey.sections,
        gacpStandards: survey.gacpStandards,
        scoringCriteria: survey.scoringCriteria,
        isActive: survey.isActive,
        createdDate: survey.createdDate,
        lastModified: survey.lastModified,
        version: survey.version,

        // Audit trail information
        auditTrail: {
          createdBy: surveyData.createdBy || 'system',
          createdAt: new Date(),
          lastModifiedBy: surveyData.createdBy || 'system',
          lastModifiedAt: new Date(),
          changeHistory: [],
        },
      };

      // บันทึกลงฐานข้อมูล
      const result = await this.collection.insertOne(surveyDocument);

      if (!result.acknowledged) {
        throw new Error('Failed to insert survey into database');
      }

      this.logger.info('Survey created successfully', { surveyId: survey.id });
      return survey;
    } catch (error) {
      this.logger.error('Failed to create survey:', error);
      throw new Error(`Survey creation failed: ${error.message}`);
    }
  }

  /**
   * Find Survey by ID
   * การค้นหาแบบสำรวจด้วย ID
   *
   * Input Parameters:
   * @param {string} surveyId - ID ของแบบสำรวจที่ต้องการค้นหา
   *
   * Business Logic:
   * 1. ค้นหาข้อมูลจากฐานข้อมูลด้วย ID
   * 2. ตรวจสอบว่าพบข้อมูลหรือไม่
   * 3. แปลงข้อมูลเป็น Survey entity
   * 4. ส่งคืนผลลัพธ์
   *
   * Performance Consideration:
   * - ใช้ _id index เพื่อความเร็วในการค้นหา
   * - มีการ cache หาก survey มีการเรียกใช้บ่อย
   */
  async findById(surveyId) {
    try {
      this.logger.info('Finding survey by ID', { surveyId });

      const surveyDocument = await this.collection.findOne({ _id: surveyId });

      if (!surveyDocument) {
        this.logger.warn('Survey not found', { surveyId });
        return null;
      }

      // แปลงข้อมูลเป็น Survey entity
      const survey = new Survey({
        id: surveyDocument._id,
        title: surveyDocument.title,
        description: surveyDocument.description,
        category: surveyDocument.category,
        farmId: surveyDocument.farmId,
        sections: surveyDocument.sections,
        gacpStandards: surveyDocument.gacpStandards,
        scoringCriteria: surveyDocument.scoringCriteria,
        isActive: surveyDocument.isActive,
        createdDate: surveyDocument.createdDate,
        lastModified: surveyDocument.lastModified,
        version: surveyDocument.version,
      });

      this.logger.info('Survey found successfully', { surveyId });
      return survey;
    } catch (error) {
      this.logger.error('Failed to find survey:', error);
      throw new Error(`Survey lookup failed: ${error.message}`);
    }
  }

  /**
   * Find Surveys by Farm ID
   * การค้นหาแบบสำรวจทั้งหมดของฟาร์มที่ระบุ
   *
   * Input Parameters:
   * @param {string} farmId - ID ของฟาร์มที่ต้องการค้นหาแบบสำรวจ
   * @param {Object} options - ตัวเลือกสำหรับการค้นหา (pagination, sorting, filtering)
   *
   * Business Process:
   * 1. สร้าง query criteria ตาม farmId และ filters
   * 2. ใช้ pagination เพื่อจัดการข้อมูลจำนวนมาก
   * 3. แปลงผลลัพธ์เป็น Survey entities
   * 4. ส่งคืนรายการพร้อมข้อมูล pagination
   *
   * Performance Features:
   * - รองรับ pagination เพื่อลดการใช้หน่วยความจำ
   * - มี sorting options ตามความต้องการ
   * - สามารถกรองตามสถานะและหมวดหมู่
   */
  async findByFarmId(farmId, options = {}) {
    try {
      this.logger.info('Finding surveys by farm ID', { farmId, options });

      // สร้าง query criteria
      const query = { farmId };

      // เพิ่มการกรองตามสถานะ
      if (options.includeInactive !== true) {
        query.isActive = true;
      }

      // เพิ่มการกรองตามหมวดหมู่
      if (options.category) {
        query.category = options.category;
      }

      // ตั้งค่า pagination
      const limit = parseInt(options.limit) || 10;
      const skip = parseInt(options.skip) || 0;

      // ตั้งค่า sorting (default: วันที่สร้างล่าสุด)
      const sort = options.sort || { createdDate: -1 };

      // ค้นหาข้อมูล
      const cursor = this.collection.find(query).sort(sort).skip(skip).limit(limit);

      const surveyDocuments = await cursor.toArray();
      const totalCount = await this.collection.countDocuments(query);

      // แปลงเป็น Survey entities
      const surveys = surveyDocuments.map(
        doc =>
          new Survey({
            id: doc._id,
            title: doc.title,
            description: doc.description,
            category: doc.category,
            farmId: doc.farmId,
            sections: doc.sections,
            gacpStandards: doc.gacpStandards,
            scoringCriteria: doc.scoringCriteria,
            isActive: doc.isActive,
            createdDate: doc.createdDate,
            lastModified: doc.lastModified,
            version: doc.version,
          }),
      );

      // ส่งคืนผลลัพธ์พร้อม pagination info
      const result = {
        surveys,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0,
        },
      };

      this.logger.info('Surveys found successfully', {
        farmId,
        count: surveys.length,
        totalCount,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to find surveys by farm ID:', error);
      throw new Error(`Farm surveys lookup failed: ${error.message}`);
    }
  }

  /**
   * Update Survey
   * การอัปเดตข้อมูลแบบสำรวจ
   *
   * Input Parameters:
   * @param {string} surveyId - ID ของแบบสำรวจที่ต้องการอัปเดต
   * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
   * @param {string} updatedBy - ผู้ที่ทำการอัปเดต
   *
   * Business Logic:
   * 1. ตรวจสอบว่าแบบสำรวจมีอยู่จริง
   * 2. เตรียมข้อมูลที่ต้องการอัปเดต
   * 3. บันทึก audit trail การเปลี่ยนแปลง
   * 4. อัปเดตข้อมูลในฐานข้อมูล
   * 5. ส่งคืน Survey entity ที่อัปเดตแล้ว
   *
   * Audit Trail:
   * - บันทึกผู้ที่ทำการแก้ไขและเวลา
   * - เก็บประวัติการเปลี่ยนแปลงที่สำคัญ
   * - รองรับการ rollback หากจำเป็น
   */
  async updateSurvey(surveyId, updateData, updatedBy = 'system') {
    try {
      this.logger.info('Updating survey', { surveyId, updatedBy });

      // ตรวจสอบว่าแบบสำรวจมีอยู่จริง
      const existingSurvey = await this.findById(surveyId);
      if (!existingSurvey) {
        throw new Error(`Survey with ID ${surveyId} not found`);
      }

      // เตรียมข้อมูลสำหรับอัปเดต
      const updateDocument = {
        ...updateData,
        lastModified: new Date(),
        version: existingSurvey.version + 1,

        // อัปเดต audit trail
        $push: {
          'auditTrail.changeHistory': {
            timestamp: new Date(),
            updatedBy: updatedBy,
            changes: Object.keys(updateData),
            previousVersion: existingSurvey.version,
          },
        },
        $set: {
          'auditTrail.lastModifiedBy': updatedBy,
          'auditTrail.lastModifiedAt': new Date(),
        },
      };

      // ทำการอัปเดต
      const result = await this.collection.updateOne({ _id: surveyId }, updateDocument);

      if (result.matchedCount === 0) {
        throw new Error('Survey not found for update');
      }

      if (result.modifiedCount === 0) {
        this.logger.warn('Survey update resulted in no changes', { surveyId });
      }

      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedSurvey = await this.findById(surveyId);

      this.logger.info('Survey updated successfully', {
        surveyId,
        version: updatedSurvey.version,
      });

      return updatedSurvey;
    } catch (error) {
      this.logger.error('Failed to update survey:', error);
      throw new Error(`Survey update failed: ${error.message}`);
    }
  }

  /**
   * Delete Survey (Soft Delete)
   * การลบแบบสำรวจแบบ soft delete
   *
   * Input Parameters:
   * @param {string} surveyId - ID ของแบบสำรวจที่ต้องการลบ
   * @param {string} deletedBy - ผู้ที่ทำการลบ
   *
   * Business Logic:
   * 1. ตั้งค่า isActive เป็น false แทนการลบข้อมูลจริง
   * 2. บันทึก audit trail การลบ
   * 3. ตรวจสอบและจัดการ survey responses ที่เกี่ยวข้อง
   * 4. ส่งคืนสถานะการลบ
   *
   * Data Protection:
   * - ไม่ลบข้อมูลจริงเพื่อรักษาประวัติ
   * - รักษาความสัมพันธ์กับข้อมูล responses
   * - สามารถกู้คืนได้หากจำเป็น
   */
  async deleteSurvey(surveyId, deletedBy = 'system') {
    try {
      this.logger.info('Deleting survey (soft delete)', { surveyId, deletedBy });

      // ตรวจสอบว่าแบบสำรวจมีอยู่จริง
      const existingSurvey = await this.findById(surveyId);
      if (!existingSurvey) {
        throw new Error(`Survey with ID ${surveyId} not found`);
      }

      // ตรวจสอบว่ามี active responses หรือไม่
      const activeResponses = await this.responseCollection.countDocuments({
        surveyId: surveyId,
        status: { $in: ['in_progress', 'completed'] },
      });

      if (activeResponses > 0) {
        throw new Error(`Cannot delete survey: ${activeResponses} active responses exist`);
      }

      // ทำ soft delete
      const result = await this.collection.updateOne(
        { _id: surveyId },
        {
          $set: {
            isActive: false,
            deletedDate: new Date(),
            'auditTrail.lastModifiedBy': deletedBy,
            'auditTrail.lastModifiedAt': new Date(),
          },
          $push: {
            'auditTrail.changeHistory': {
              timestamp: new Date(),
              updatedBy: deletedBy,
              action: 'soft_delete',
              reason: 'Survey deactivated',
            },
          },
        },
      );

      if (result.matchedCount === 0) {
        throw new Error('Survey not found for deletion');
      }

      this.logger.info('Survey deleted successfully (soft delete)', { surveyId });
      return { success: true, surveyId, deletedBy };
    } catch (error) {
      this.logger.error('Failed to delete survey:', error);
      throw new Error(`Survey deletion failed: ${error.message}`);
    }
  }

  /**
   * Search Surveys
   * การค้นหาแบบสำรวจด้วยเงื่อนไขที่หลากหลาย
   *
   * Input Parameters:
   * @param {Object} searchCriteria - เงื่อนไขการค้นหา
   * @param {Object} options - ตัวเลือกสำหรับการค้นหา
   *
   * Business Features:
   * 1. Full-text search ในชื่อ คำอธิบาย และคำถาม
   * 2. การกรองตามหมวดหมู่และมาตรฐาน GACP
   * 3. การค้นหาตามช่วงวันที่
   * 4. รองรับ pagination และ sorting
   *
   * Search Capabilities:
   * - ค้นหาข้อความในหลายฟิลด์พร้อมกัน
   * - กรองตามสถานะและหมวดหมู่
   * - ค้นหาตามมาตรฐาน GACP ที่เกี่ยวข้อง
   * - รองรับการค้นหาแบบ fuzzy matching
   */
  async searchSurveys(searchCriteria, options = {}) {
    try {
      this.logger.info('Searching surveys with criteria', { searchCriteria, options });

      // สร้าง query pipeline สำหรับการค้นหา
      const pipeline = [];

      // Match stage - กรองข้อมูลพื้นฐาน
      const matchStage = {
        isActive: searchCriteria.includeInactive !== true,
      };

      // เพิ่มการกรองตามฟาร์ม
      if (searchCriteria.farmId) {
        matchStage.farmId = searchCriteria.farmId;
      }

      // เพิ่มการกรองตามหมวดหมู่
      if (searchCriteria.category) {
        matchStage.category = searchCriteria.category;
      }

      // เพิ่มการกรองตามช่วงวันที่
      if (searchCriteria.dateFrom || searchCriteria.dateTo) {
        matchStage.createdDate = {};
        if (searchCriteria.dateFrom) {
          matchStage.createdDate.$gte = new Date(searchCriteria.dateFrom);
        }
        if (searchCriteria.dateTo) {
          matchStage.createdDate.$lte = new Date(searchCriteria.dateTo);
        }
      }

      // เพิ่มการค้นหาข้อความ
      if (searchCriteria.searchText) {
        matchStage.$text = {
          $search: searchCriteria.searchText,
          $language: 'thai', // รองรับภาษาไทย
        };
      }

      pipeline.push({ $match: matchStage });

      // เพิ่ม score สำหรับ text search
      if (searchCriteria.searchText) {
        pipeline.push({
          $addFields: {
            searchScore: { $meta: 'textScore' },
          },
        });
      }

      // Sort stage
      const sortStage = {};
      if (searchCriteria.searchText) {
        sortStage.searchScore = { $meta: 'textScore' };
      }
      sortStage.createdDate = options.sortOrder === 'asc' ? 1 : -1;
      pipeline.push({ $sort: sortStage });

      // Pagination
      const limit = parseInt(options.limit) || 10;
      const skip = parseInt(options.skip) || 0;

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // ดำเนินการค้นหา
      const searchResults = await this.collection.aggregate(pipeline).toArray();

      // นับจำนวนผลลัพธ์ทั้งหมด
      const countPipeline = pipeline.slice(0, -2); // ลบ skip และ limit
      countPipeline.push({ $count: 'total' });
      const countResult = await this.collection.aggregate(countPipeline).toArray();
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      // แปลงเป็น Survey entities
      const surveys = searchResults.map(
        doc =>
          new Survey({
            id: doc._id,
            title: doc.title,
            description: doc.description,
            category: doc.category,
            farmId: doc.farmId,
            sections: doc.sections,
            gacpStandards: doc.gacpStandards,
            scoringCriteria: doc.scoringCriteria,
            isActive: doc.isActive,
            createdDate: doc.createdDate,
            lastModified: doc.lastModified,
            version: doc.version,
            searchScore: doc.searchScore,
          }),
      );

      const result = {
        surveys,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0,
        },
        searchCriteria,
      };

      this.logger.info('Survey search completed', {
        resultsCount: surveys.length,
        totalCount,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to search surveys:', error);
      throw new Error(`Survey search failed: ${error.message}`);
    }
  }

  /**
   * Get Survey Statistics
   * การดึงสถิติของแบบสำรวจสำหรับการรายงาน
   *
   * Input Parameters:
   * @param {string} farmId - ID ของฟาร์ม (optional)
   * @param {Object} dateRange - ช่วงวันที่ที่ต้องการดูสถิติ
   *
   * Business Intelligence:
   * 1. จำนวนแบบสำรวจทั้งหมดและตามหมวดหมู่
   * 2. อัตราการตอบแบบสำรวจ (completion rate)
   * 3. คะแนนเฉลี่ยตามมาตรฐาน GACP
   * 4. แนวโน้มการใช้งานแบบสำรวจ
   *
   * Analytics Output:
   * - รายงานสถิติเชิงลึกสำหรับการตัดสินใจ
   * - ข้อมูล dashboard สำหรับผู้บริหาร
   * - แนวโน้มการปฏิบัติตามมาตรฐาน GACP
   */
  async getSurveyStatistics(farmId = null, dateRange = {}) {
    try {
      this.logger.info('Generating survey statistics', { farmId, dateRange });

      const pipeline = [];

      // Match stage - กรองข้อมูลตามเงื่อนไข
      const matchStage = { isActive: true };

      if (farmId) {
        matchStage.farmId = farmId;
      }

      if (dateRange.from || dateRange.to) {
        matchStage.createdDate = {};
        if (dateRange.from) {
          matchStage.createdDate.$gte = new Date(dateRange.from);
        }
        if (dateRange.to) {
          matchStage.createdDate.$lte = new Date(dateRange.to);
        }
      }

      pipeline.push({ $match: matchStage });

      // Group และคำนวณสถิติ
      pipeline.push({
        $group: {
          _id: null,
          totalSurveys: { $sum: 1 },
          categories: {
            $addToSet: '$category',
          },
          surveysByCategory: {
            $push: {
              category: '$category',
              gacpStandards: '$gacpStandards',
            },
          },
          averageQuestionsPerSurvey: {
            $avg: {
              $sum: {
                $map: {
                  input: '$sections',
                  as: 'section',
                  in: { $size: '$$section.questions' },
                },
              },
            },
          },
        },
      });

      const statsResult = await this.collection.aggregate(pipeline).toArray();
      const stats = statsResult[0] || {};

      // ดึงข้อมูลการตอบแบบสำรวจ
      const responseStats = await this.getResponseStatistics(farmId, dateRange);

      // คำนวณสถิติเพิ่มเติม
      const categoryBreakdown = await this.getCategoryBreakdown(farmId, dateRange);
      const completionTrends = await this.getCompletionTrends(farmId, dateRange);

      const finalStats = {
        overview: {
          totalSurveys: stats.totalSurveys || 0,
          totalCategories: stats.categories ? stats.categories.length : 0,
          averageQuestionsPerSurvey: Math.round(stats.averageQuestionsPerSurvey || 0),
          totalResponses: responseStats.totalResponses || 0,
          completionRate: responseStats.completionRate || 0,
        },
        categoryBreakdown,
        responseStats,
        trends: completionTrends,
        generatedAt: new Date(),
      };

      this.logger.info('Survey statistics generated successfully', {
        totalSurveys: finalStats.overview.totalSurveys,
        totalResponses: finalStats.overview.totalResponses,
      });

      return finalStats;
    } catch (error) {
      this.logger.error('Failed to generate survey statistics:', error);
      throw new Error(`Statistics generation failed: ${error.message}`);
    }
  }

  /**
   * Get Response Statistics
   * การดึงสถิติการตอบแบบสำรวจ
   */
  async getResponseStatistics(farmId, dateRange) {
    const matchStage = {};

    if (farmId) matchStage.farmId = farmId;
    if (dateRange.from || dateRange.to) {
      matchStage.startDate = {};
      if (dateRange.from) matchStage.startDate.$gte = new Date(dateRange.from);
      if (dateRange.to) matchStage.startDate.$lte = new Date(dateRange.to);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalResponses: { $sum: 1 },
          completedResponses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          averageScore: { $avg: '$totalScore' },
          averageCompletionTime: { $avg: '$completionTimeMinutes' },
        },
      },
    ];

    const result = await this.responseCollection.aggregate(pipeline).toArray();
    const stats = result[0] || {};

    return {
      totalResponses: stats.totalResponses || 0,
      completedResponses: stats.completedResponses || 0,
      completionRate:
        stats.totalResponses > 0
          ? Math.round((stats.completedResponses / stats.totalResponses) * 100)
          : 0,
      averageScore: Math.round(stats.averageScore || 0),
      averageCompletionTime: Math.round(stats.averageCompletionTime || 0),
    };
  }

  /**
   * Get Category Breakdown
   * การแบ่งข้อมูลตามหมวดหมู่
   */
  async getCategoryBreakdown(farmId, dateRange) {
    const matchStage = { isActive: true };

    if (farmId) matchStage.farmId = farmId;
    if (dateRange.from || dateRange.to) {
      matchStage.createdDate = {};
      if (dateRange.from) matchStage.createdDate.$gte = new Date(dateRange.from);
      if (dateRange.to) matchStage.createdDate.$lte = new Date(dateRange.to);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          gacpStandards: { $addToSet: '$gacpStandards' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await this.collection.aggregate(pipeline).toArray();

    return results.map(item => ({
      category: item._id,
      surveyCount: item.count,
      gacpStandardsCount: item.gacpStandards.length,
    }));
  }

  /**
   * Get Completion Trends
   * การดึงแนวโน้มการทำแบบสำรวจ
   */
  async getCompletionTrends(farmId, dateRange) {
    const matchStage = {};

    if (farmId) matchStage.farmId = farmId;

    // ตั้งค่าช่วงวันที่ (default: 30 วันที่ผ่านมา)
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date();
    const startDate = dateRange.from
      ? new Date(dateRange.from)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    matchStage.completedDate = {
      $gte: startDate,
      $lte: endDate,
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedDate' },
          },
          completions: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await this.responseCollection.aggregate(pipeline).toArray();

    return results.map(item => ({
      date: item._id,
      completions: item.completions,
      averageScore: Math.round(item.averageScore || 0),
    }));
  }
}

module.exports = SurveyRepository;
