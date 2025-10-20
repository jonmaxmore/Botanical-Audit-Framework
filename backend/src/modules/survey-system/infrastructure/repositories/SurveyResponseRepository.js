/**
 * GACP Survey System - Survey Response Repository
 * ระบบ Repository สำหรับการจัดการข้อมูล Survey Response ในฐานข้อมูล MongoDB
 *
 * Business Logic & Process Workflow:
 * 1. Response Data Management - การจัดการข้อมูลการตอบแบบสำรวจ
 * 2. Progress Tracking - การติดตามความคืบหน้าในการทำแบบสำรวจ
 * 3. Score Calculation - การคำนวณและเก็บคะแนนการประเมิน
 * 4. Quality Assurance - การตรวจสอบคุณภาพของการตอบ
 *
 * Technical Implementation:
 * - Advanced MongoDB Queries for Response Analysis
 * - Real-time Progress Tracking
 * - Performance Optimized Data Retrieval
 * - Comprehensive Audit Trail
 */

const SurveyResponse = require('../../domain/entities/SurveyResponse');

/**
 * SurveyResponseRepository - คลาสสำหรับจัดการการเข้าถึงข้อมูล Survey Response
 *
 * Process Flow:
 * 1. Response CRUD Operations - การสร้าง อ่าน แก้ไข และลบข้อมูลการตอบ
 * 2. Progress Management - การจัดการความคืบหน้าและสถานะ
 * 3. Answer Validation - การตรวจสอบความถูกต้องของคำตอบ
 * 4. Score Aggregation - การรวมคะแนนและการประเมินผล
 *
 * Business Value:
 * - ติดตามและจัดการการตอบแบบสำรวจแบบเรียลไทม์
 * - สร้างรายงานและวิเคราะห์ผลการประเมิน
 * - รองรับการตรวจสอบและการปรับปรุงคุณภาพ
 */
class SurveyResponseRepository {
  constructor(mongoClient, logger) {
    this.db = mongoClient.db('gacp_platform');
    this.collection = this.db.collection('survey_responses');
    this.surveyCollection = this.db.collection('surveys');
    this.logger = logger;

    // สร้าง indexes สำหรับการค้นหาที่มีประสิทธิภาพ
    this.initializeIndexes();
  }

  /**
   * Initialize Database Indexes
   * การสร้าง indexes เพื่อปรับปรุงประสิทธิภาพการค้นหา Response
   *
   * Business Reasoning:
   * - เพิ่มความเร็วในการค้นหาและรายงานผลการตอบแบบสำรวจ
   * - รองรับการวิเคราะห์และติดตามความคืบหน้าแบบเรียลไทม์
   * - ปรับปรุงประสิทธิภาพการสร้างรายงานสถิติ
   */
  async initializeIndexes() {
    try {
      // Index สำหรับการค้นหาพื้นฐาน
      await this.collection.createIndex({ surveyId: 1, farmId: 1 });
      await this.collection.createIndex({ status: 1, startDate: -1 });
      await this.collection.createIndex({ completedDate: -1 });

      // Compound indexes สำหรับการรายงาน
      await this.collection.createIndex({
        farmId: 1,
        status: 1,
        completedDate: -1
      });

      // Index สำหรับการค้นหาตามคะแนน
      await this.collection.createIndex({ totalScore: -1 });
      await this.collection.createIndex({
        'scoreBreakdown.category': 1,
        'scoreBreakdown.score': -1
      });

      this.logger.info('Survey response repository indexes initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize survey response indexes:', error);
    }
  }

  /**
   * Create Survey Response
   * การสร้างการตอบแบบสำรวจใหม่
   *
   * Input Parameters:
   * @param {Object} responseData - ข้อมูลการตอบแบบสำรวจ
   *
   * Business Process:
   * 1. ตรวจสอบความถูกต้องของข้อมูลและ Survey ที่เกี่ยวข้อง
   * 2. สร้าง SurveyResponse entity ด้วยข้อมูลเริ่มต้น
   * 3. บันทึกลงฐานข้อมูลพร้อม session tracking
   * 4. ส่งคืน SurveyResponse entity ที่สร้างเสร็จ
   *
   * Workflow Logic:
   * - ตรวจสอบว่า Survey ที่เกี่ยวข้องมีอยู่และ active
   * - สร้าง unique session ID สำหรับการติดตาม
   * - กำหนดสถานะเริ่มต้นและเวลาเริ่มต้น
   * - เตรียม audit trail สำหรับการติดตาม
   */
  async createSurveyResponse(responseData) {
    try {
      this.logger.info('Creating new survey response', {
        surveyId: responseData.surveyId,
        farmId: responseData.farmId
      });

      // ตรวจสอบว่า Survey มีอยู่และ active
      const survey = await this.surveyCollection.findOne({
        _id: responseData.surveyId,
        isActive: true
      });

      if (!survey) {
        throw new Error(`Active survey with ID ${responseData.surveyId} not found`);
      }

      // ตรวจสอบว่ามี response ที่ยังไม่เสร็จสมบูรณ์หรือไม่
      const existingResponse = await this.collection.findOne({
        surveyId: responseData.surveyId,
        farmId: responseData.farmId,
        status: { $in: ['in_progress'] }
      });

      if (existingResponse) {
        this.logger.info('Found existing in-progress response', {
          responseId: existingResponse._id
        });

        // ส่งคืน existing response แทนการสร้างใหม่
        return this.convertToEntity(existingResponse);
      }

      // สร้าง SurveyResponse entity
      const surveyResponse = new SurveyResponse({
        surveyId: responseData.surveyId,
        farmId: responseData.farmId,
        respondentName: responseData.respondentName,
        respondentRole: responseData.respondentRole,
        metadata: responseData.metadata || {}
      });

      // เตรียมข้อมูลสำหรับบันทึกลงฐานข้อมูล
      const responseDocument = {
        _id: surveyResponse.id,
        surveyId: surveyResponse.surveyId,
        farmId: surveyResponse.farmId,
        respondentName: surveyResponse.respondentName,
        respondentRole: surveyResponse.respondentRole,
        sessionId: surveyResponse.sessionId,
        status: surveyResponse.status,
        startDate: surveyResponse.startDate,
        answers: surveyResponse.answers,
        currentSection: surveyResponse.currentSection,
        progressPercentage: surveyResponse.progressPercentage,
        totalScore: surveyResponse.totalScore,
        scoreBreakdown: surveyResponse.scoreBreakdown,
        qualityMetrics: surveyResponse.qualityMetrics,
        metadata: surveyResponse.metadata,

        // Survey reference information
        surveyInfo: {
          title: survey.title,
          category: survey.category,
          totalSections: survey.sections ? survey.sections.length : 0,
          totalQuestions: survey.sections
            ? survey.sections.reduce(
              (sum, section) => sum + (section.questions ? section.questions.length : 0),
              0
            )
            : 0
        },

        // Audit trail
        auditTrail: {
          createdBy: responseData.createdBy || 'system',
          createdAt: new Date(),
          lastModifiedBy: responseData.createdBy || 'system',
          lastModifiedAt: new Date(),
          sessionHistory: [
            {
              action: 'session_started',
              timestamp: new Date(),
              details: {
                respondentName: surveyResponse.respondentName,
                respondentRole: surveyResponse.respondentRole
              }
            }
          ]
        }
      };

      // บันทึกลงฐานข้อมูล
      const result = await this.collection.insertOne(responseDocument);

      if (!result.acknowledged) {
        throw new Error('Failed to insert survey response into database');
      }

      this.logger.info('Survey response created successfully', {
        responseId: surveyResponse.id,
        surveyId: responseData.surveyId
      });

      return surveyResponse;
    } catch (error) {
      this.logger.error('Failed to create survey response:', error);
      throw new Error(`Survey response creation failed: ${error.message}`);
    }
  }

  /**
   * Find Response by ID
   * การค้นหาการตอบแบบสำรวจด้วย ID
   *
   * Input Parameters:
   * @param {string} responseId - ID ของการตอบแบบสำรวจ
   *
   * Business Logic:
   * 1. ค้นหาข้อมูลจากฐานข้อมูลด้วย ID
   * 2. ตรวจสอบการมีอยู่ของข้อมูล
   * 3. แปลงข้อมูลเป็น SurveyResponse entity
   * 4. ส่งคืนผลลัพธ์พร้อมข้อมูล Survey ที่เกี่ยวข้อง
   */
  async findById(responseId) {
    try {
      this.logger.info('Finding survey response by ID', { responseId });

      const responseDocument = await this.collection.findOne({ _id: responseId });

      if (!responseDocument) {
        this.logger.warn('Survey response not found', { responseId });
        return null;
      }

      // แปลงข้อมูลเป็น SurveyResponse entity
      const surveyResponse = this.convertToEntity(responseDocument);

      this.logger.info('Survey response found successfully', { responseId });
      return surveyResponse;
    } catch (error) {
      this.logger.error('Failed to find survey response:', error);
      throw new Error(`Survey response lookup failed: ${error.message}`);
    }
  }

  /**
   * Find Responses by Survey ID
   * การค้นหาการตอบแบบสำรวจทั้งหมดของ Survey ที่ระบุ
   *
   * Input Parameters:
   * @param {string} surveyId - ID ของ Survey
   * @param {Object} options - ตัวเลือกสำหรับการค้นหา
   *
   * Business Value:
   * - รวบรวมผลการตอบแบบสำรวจเพื่อการวิเคราะห์
   * - สร้างรายงานความคืบหน้าของการประเมิน
   * - ติดตามคุณภาพและความสมบูรณ์ของข้อมูล
   */
  async findBySurveyId(surveyId, options = {}) {
    try {
      this.logger.info('Finding survey responses by survey ID', { surveyId, options });

      // สร้าง query criteria
      const query = { surveyId };

      // เพิ่มการกรองตามสถานะ
      if (options.status) {
        if (Array.isArray(options.status)) {
          query.status = { $in: options.status };
        } else {
          query.status = options.status;
        }
      }

      // เพิ่มการกรองตามฟาร์ม
      if (options.farmId) {
        query.farmId = options.farmId;
      }

      // เพิ่มการกรองตามช่วงวันที่
      if (options.dateFrom || options.dateTo) {
        query.startDate = {};
        if (options.dateFrom) {
          query.startDate.$gte = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          query.startDate.$lte = new Date(options.dateTo);
        }
      }

      // ตั้งค่า pagination
      const limit = parseInt(options.limit) || 20;
      const skip = parseInt(options.skip) || 0;

      // ตั้งค่า sorting
      const sort = options.sort || { startDate: -1 };

      // ค้นหาข้อมูล
      const cursor = this.collection.find(query).sort(sort).skip(skip).limit(limit);

      const responseDocuments = await cursor.toArray();
      const totalCount = await this.collection.countDocuments(query);

      // แปลงเป็น SurveyResponse entities
      const responses = responseDocuments.map(doc => this.convertToEntity(doc));

      // คำนวณสถิติเพิ่มเติม
      const statistics = await this.calculateSurveyStatistics(surveyId, query);

      const result = {
        responses,
        statistics,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0
        }
      };

      this.logger.info('Survey responses found successfully', {
        surveyId,
        count: responses.length,
        totalCount
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to find survey responses by survey ID:', error);
      throw new Error(`Survey responses lookup failed: ${error.message}`);
    }
  }

  /**
   * Update Survey Response
   * การอัปเดตข้อมูลการตอบแบบสำรวจ
   *
   * Input Parameters:
   * @param {string} responseId - ID ของการตอบแบบสำรวจ
   * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
   * @param {string} updatedBy - ผู้ที่ทำการอัปเดต
   *
   * Business Process:
   * 1. ตรวจสอบการมีอยู่ของ Response
   * 2. อัปเดตข้อมูลและคำนวณคะแนน
   * 3. อัปเดต progress percentage
   * 4. บันทึก audit trail การเปลี่ยนแปลง
   * 5. ส่งคืน SurveyResponse entity ที่อัปเดตแล้ว
   */
  async updateSurveyResponse(responseId, updateData, updatedBy = 'system') {
    try {
      this.logger.info('Updating survey response', { responseId, updatedBy });

      // ตรวจสอบว่า Response มีอยู่จริง
      const existingResponse = await this.findById(responseId);
      if (!existingResponse) {
        throw new Error(`Survey response with ID ${responseId} not found`);
      }

      // เตรียมข้อมูลสำหรับอัปเดต
      const updateDocument = {
        $set: {
          ...updateData,
          'auditTrail.lastModifiedBy': updatedBy,
          'auditTrail.lastModifiedAt': new Date()
        },
        $push: {
          'auditTrail.sessionHistory': {
            action: 'response_updated',
            timestamp: new Date(),
            updatedBy: updatedBy,
            changes: Object.keys(updateData)
          }
        }
      };

      // ถ้าอัปเดตคำตอบ ให้คำนวณ progress และคะแนนใหม่
      if (updateData.answers) {
        const survey = await this.surveyCollection.findOne({
          _id: existingResponse.surveyId
        });

        if (survey) {
          // คำนวณความคืบหน้าใหม่
          const progressData = this.calculateProgress(updateData.answers, survey);
          updateDocument.$set.progressPercentage = progressData.percentage;
          updateDocument.$set.currentSection = progressData.currentSection;

          // ถ้าทำเสร็จแล้ว ให้คำนวณคะแนนรวม
          if (progressData.percentage === 100 && updateData.status === 'completed') {
            const scoreData = this.calculateTotalScore(updateData.answers, survey);
            updateDocument.$set.totalScore = scoreData.totalScore;
            updateDocument.$set.scoreBreakdown = scoreData.breakdown;
            updateDocument.$set.completedDate = new Date();

            // คำนวณเวลาที่ใช้
            const completionTime = (new Date() - existingResponse.startDate) / (1000 * 60); // นาที
            updateDocument.$set.completionTimeMinutes = Math.round(completionTime);
          }
        }
      }

      // ทำการอัปเดต
      const result = await this.collection.updateOne({ _id: responseId }, updateDocument);

      if (result.matchedCount === 0) {
        throw new Error('Survey response not found for update');
      }

      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedResponse = await this.findById(responseId);

      this.logger.info('Survey response updated successfully', {
        responseId,
        progress: updatedResponse.progressPercentage
      });

      return updatedResponse;
    } catch (error) {
      this.logger.error('Failed to update survey response:', error);
      throw new Error(`Survey response update failed: ${error.message}`);
    }
  }

  /**
   * Record Answer
   * การบันทึกคำตอบสำหรับคำถามเฉพาะ
   *
   * Input Parameters:
   * @param {string} responseId - ID ของการตอบแบบสำรวจ
   * @param {string} questionId - ID ของคำถาม
   * @param {any} answer - คำตอบ
   * @param {string} answeredBy - ผู้ตอบ
   *
   * Business Logic:
   * - บันทึกคำตอบแบบเรียลไทม์
   * - คำนวณความคืบหน้าอัตโนมัติ
   * - ตรวจสอบความถูกต้องของคำตอบ
   * - อัปเดต quality metrics
   */
  async recordAnswer(responseId, questionId, answer, answeredBy = 'user') {
    try {
      this.logger.info('Recording answer for survey response', {
        responseId,
        questionId,
        answeredBy
      });

      // ดึง response ปัจจุบัน
      const currentResponse = await this.findById(responseId);
      if (!currentResponse) {
        throw new Error(`Survey response with ID ${responseId} not found`);
      }

      // ตรวจสอบสถานะ response
      if (currentResponse.status === 'completed') {
        throw new Error('Cannot modify answers for completed survey response');
      }

      // อัปเดตคำตอบ
      const updatedAnswers = { ...currentResponse.answers };
      updatedAnswers[questionId] = {
        answer: answer,
        answeredAt: new Date(),
        answeredBy: answeredBy
      };

      // อัปเดต response
      const updateResult = await this.updateSurveyResponse(
        responseId,
        {
          answers: updatedAnswers,
          lastAnswerDate: new Date()
        },
        answeredBy
      );

      this.logger.info('Answer recorded successfully', {
        responseId,
        questionId,
        progress: updateResult.progressPercentage
      });

      return updateResult;
    } catch (error) {
      this.logger.error('Failed to record answer:', error);
      throw new Error(`Answer recording failed: ${error.message}`);
    }
  }

  /**
   * Complete Survey Response
   * การทำเครื่องหมายว่าการตอบแบบสำรวจเสร็จสมบูรณ์
   *
   * Input Parameters:
   * @param {string} responseId - ID ของการตอบแบบสำรวจ
   * @param {string} completedBy - ผู้ที่ทำให้เสร็จสมบูรณ์
   *
   * Business Process:
   * 1. ตรวจสอบความสมบูรณ์ของคำตอบ
   * 2. คำนวณคะแนนรวมและรายละเอียด
   * 3. อัปเดตสถานะเป็น 'completed'
   * 4. บันทึกเวลาที่เสร็จสมบูรณ์และ quality metrics
   * 5. สร้าง completion certificate (ถ้าจำเป็น)
   */
  async completeSurveyResponse(responseId, completedBy = 'user') {
    try {
      this.logger.info('Completing survey response', { responseId, completedBy });

      // ดึง response ปัจจุบัน
      const currentResponse = await this.findById(responseId);
      if (!currentResponse) {
        throw new Error(`Survey response with ID ${responseId} not found`);
      }

      // ตรวจสอบสถานะปัจจุบัน
      if (currentResponse.status === 'completed') {
        this.logger.warn('Survey response already completed', { responseId });
        return currentResponse;
      }

      // ดึงข้อมูล survey เพื่อตรวจสอบความสมบูรณ์
      const survey = await this.surveyCollection.findOne({
        _id: currentResponse.surveyId
      });

      if (!survey) {
        throw new Error(`Survey with ID ${currentResponse.surveyId} not found`);
      }

      // ตรวจสอบความสมบูรณ์ของคำตอบ
      const completionCheck = this.validateCompletion(currentResponse.answers, survey);

      if (!completionCheck.isComplete) {
        throw new Error(
          `Survey response is incomplete: ${completionCheck.missingQuestions.length} questions missing`
        );
      }

      // คำนวณคะแนนรวมและรายละเอียด
      const scoreData = this.calculateTotalScore(currentResponse.answers, survey);

      // คำนวณ quality metrics
      const qualityMetrics = this.calculateQualityMetrics(currentResponse, survey);

      // คำนวณเวลาที่ใช้
      const completionTime = (new Date() - currentResponse.startDate) / (1000 * 60); // นาที

      // อัปเดตข้อมูลการเสร็จสมบูรณ์
      const completionData = {
        status: 'completed',
        completedDate: new Date(),
        completionTimeMinutes: Math.round(completionTime),
        totalScore: scoreData.totalScore,
        scoreBreakdown: scoreData.breakdown,
        qualityMetrics: qualityMetrics,
        progressPercentage: 100
      };

      const updatedResponse = await this.updateSurveyResponse(
        responseId,
        completionData,
        completedBy
      );

      this.logger.info('Survey response completed successfully', {
        responseId,
        totalScore: updatedResponse.totalScore,
        completionTime: Math.round(completionTime)
      });

      return updatedResponse;
    } catch (error) {
      this.logger.error('Failed to complete survey response:', error);
      throw new Error(`Survey response completion failed: ${error.message}`);
    }
  }

  /**
   * Get Farm Survey Responses
   * การดึงการตอบแบบสำรวจทั้งหมดของฟาร์ม
   *
   * Input Parameters:
   * @param {string} farmId - ID ของฟาร์ม
   * @param {Object} options - ตัวเลือกสำหรับการค้นหาและการกรอง
   *
   * Business Intelligence:
   * - วิเคราะห์ประวัติการทำแบบสำรวจของฟาร์ม
   * - สร้างรายงานความคืบหน้าและผลการประเมิน
   * - ติดตามการปฏิบัติตามมาตรฐาน GACP
   */
  async getFarmSurveyResponses(farmId, options = {}) {
    try {
      this.logger.info('Getting farm survey responses', { farmId, options });

      const query = { farmId };

      // เพิ่มการกรองตามสถานะ
      if (options.status) {
        query.status = Array.isArray(options.status) ? { $in: options.status } : options.status;
      }

      // เพิ่มการกรองตามช่วงวันที่
      if (options.dateFrom || options.dateTo) {
        query.startDate = {};
        if (options.dateFrom) {
          query.startDate.$gte = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          query.startDate.$lte = new Date(options.dateTo);
        }
      }

      // Pagination
      const limit = parseInt(options.limit) || 20;
      const skip = parseInt(options.skip) || 0;
      const sort = options.sort || { startDate: -1 };

      // ดำเนินการค้นหา
      const responses = await this.collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.collection.countDocuments(query);

      // แปลงเป็น entities
      const responseEntities = responses.map(doc => this.convertToEntity(doc));

      // คำนวณสถิติของฟาร์ม
      const farmStatistics = await this.calculateFarmStatistics(farmId, options);

      const result = {
        responses: responseEntities,
        statistics: farmStatistics,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0
        }
      };

      this.logger.info('Farm survey responses retrieved successfully', {
        farmId,
        count: responseEntities.length,
        totalCount
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get farm survey responses:', error);
      throw new Error(`Farm survey responses retrieval failed: ${error.message}`);
    }
  }

  /**
   * Helper Methods
   * ฟังก์ชันช่วยในการแปลงข้อมูลและคำนวณ
   */

  /**
   * Convert Document to Entity
   * แปลงข้อมูล MongoDB document เป็น SurveyResponse entity
   */
  convertToEntity(doc) {
    return new SurveyResponse({
      id: doc._id,
      surveyId: doc.surveyId,
      farmId: doc.farmId,
      respondentName: doc.respondentName,
      respondentRole: doc.respondentRole,
      sessionId: doc.sessionId,
      status: doc.status,
      startDate: doc.startDate,
      completedDate: doc.completedDate,
      answers: doc.answers,
      currentSection: doc.currentSection,
      progressPercentage: doc.progressPercentage,
      totalScore: doc.totalScore,
      scoreBreakdown: doc.scoreBreakdown,
      qualityMetrics: doc.qualityMetrics,
      completionTimeMinutes: doc.completionTimeMinutes,
      metadata: doc.metadata
    });
  }

  /**
   * Calculate Progress
   * คำนวณความคืบหน้าของการทำแบบสำรวจ
   */
  calculateProgress(answers, survey) {
    if (!survey.sections || survey.sections.length === 0) {
      return { percentage: 0, currentSection: null };
    }

    let totalQuestions = 0;
    let answeredQuestions = 0;
    let currentSection = null;

    survey.sections.forEach((section, sectionIndex) => {
      if (section.questions) {
        section.questions.forEach(question => {
          totalQuestions++;
          if (answers[question.id]) {
            answeredQuestions++;
          } else if (!currentSection) {
            currentSection = sectionIndex;
          }
        });
      }
    });

    const percentage =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      percentage,
      currentSection: percentage === 100 ? null : currentSection
    };
  }

  /**
   * Calculate Total Score
   * คำนวณคะแนนรวมจากคำตอบทั้งหมด
   */
  calculateTotalScore(answers, survey) {
    if (!survey.sections || !survey.scoringCriteria) {
      return { totalScore: 0, breakdown: [] };
    }

    let totalScore = 0;
    const breakdown = [];

    survey.sections.forEach(section => {
      let sectionScore = 0;
      let sectionMaxScore = 0;

      if (section.questions) {
        section.questions.forEach(question => {
          const maxPoints = question.scoring?.maxPoints || 0;
          sectionMaxScore += maxPoints;

          if (answers[question.id]) {
            const answer = answers[question.id].answer;
            const points = this.calculateQuestionScore(answer, question);
            sectionScore += points;
          }
        });
      }

      const sectionPercentage =
        sectionMaxScore > 0 ? Math.round((sectionScore / sectionMaxScore) * 100) : 0;

      breakdown.push({
        sectionId: section.id,
        sectionTitle: section.title,
        score: sectionScore,
        maxScore: sectionMaxScore,
        percentage: sectionPercentage
      });

      totalScore += sectionScore;
    });

    return { totalScore: Math.round(totalScore), breakdown };
  }

  /**
   * Calculate Question Score
   * คำนวณคะแนนสำหรับคำถามเฉพาะ
   */
  calculateQuestionScore(answer, question) {
    if (!question.scoring || !question.scoring.maxPoints) {
      return 0;
    }

    switch (question.type) {
    case 'multiple_choice':
      const correctOption = question.options?.find(opt => opt.isCorrect);
      return answer === correctOption?.value ? question.scoring.maxPoints : 0;

    case 'rating':
      const rating = parseInt(answer) || 0;
      const maxRating = question.maxRating || 5;
      return Math.round((rating / maxRating) * question.scoring.maxPoints);

    case 'yes_no':
      return answer === 'yes' ? question.scoring.maxPoints : 0;

    case 'text':
      // สำหรับคำตอบข้อความ ให้คะแนนเต็มหากมีคำตอบ
      return answer && answer.trim().length > 0 ? question.scoring.maxPoints : 0;

    default:
      return 0;
    }
  }

  /**
   * Validate Completion
   * ตรวจสอบความสมบูรณ์ของการตอบแบบสำรวจ
   */
  validateCompletion(answers, survey) {
    const missingQuestions = [];

    if (survey.sections) {
      survey.sections.forEach(section => {
        if (section.questions) {
          section.questions.forEach(question => {
            if (question.required && !answers[question.id]) {
              missingQuestions.push({
                questionId: question.id,
                sectionTitle: section.title,
                questionText: question.questionText
              });
            }
          });
        }
      });
    }

    return {
      isComplete: missingQuestions.length === 0,
      missingQuestions
    };
  }

  /**
   * Calculate Quality Metrics
   * คำนวณ metrics คุณภาพของการตอบ
   */
  calculateQualityMetrics(response, survey) {
    const metrics = {
      completionRate: response.progressPercentage,
      averageTimePerQuestion: 0,
      consistencyScore: 0,
      thoroughnessScore: 0
    };

    if (response.completionTimeMinutes && survey.sections) {
      const totalQuestions = survey.sections.reduce(
        (sum, section) => sum + (section.questions ? section.questions.length : 0),
        0
      );

      if (totalQuestions > 0) {
        metrics.averageTimePerQuestion =
          Math.round((response.completionTimeMinutes / totalQuestions) * 10) / 10;
      }
    }

    // คำนวณ thoroughness score จากความยาวของคำตอบข้อความ
    let textAnswers = 0;
    let totalTextLength = 0;

    Object.values(response.answers || {}).forEach(answerObj => {
      if (typeof answerObj.answer === 'string') {
        textAnswers++;
        totalTextLength += answerObj.answer.length;
      }
    });

    if (textAnswers > 0) {
      const avgTextLength = totalTextLength / textAnswers;
      metrics.thoroughnessScore = Math.min(100, Math.round((avgTextLength / 50) * 100));
    }

    return metrics;
  }

  /**
   * Calculate Survey Statistics
   * คำนวณสถิติสำหรับ Survey เฉพาะ
   */
  async calculateSurveyStatistics(surveyId, baseQuery = {}) {
    const query = { ...baseQuery, surveyId };

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalResponses: { $sum: 1 },
          completedResponses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressResponses: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          averageScore: { $avg: '$totalScore' },
          averageCompletionTime: { $avg: '$completionTimeMinutes' },
          averageProgress: { $avg: '$progressPercentage' }
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    const stats = result[0] || {};

    return {
      totalResponses: stats.totalResponses || 0,
      completedResponses: stats.completedResponses || 0,
      inProgressResponses: stats.inProgressResponses || 0,
      completionRate:
        stats.totalResponses > 0
          ? Math.round((stats.completedResponses / stats.totalResponses) * 100)
          : 0,
      averageScore: Math.round(stats.averageScore || 0),
      averageCompletionTime: Math.round(stats.averageCompletionTime || 0),
      averageProgress: Math.round(stats.averageProgress || 0)
    };
  }

  /**
   * Calculate Farm Statistics
   * คำนวณสถิติสำหรับฟาร์มเฉพาะ
   */
  async calculateFarmStatistics(farmId, options = {}) {
    const query = { farmId };

    if (options.dateFrom || options.dateTo) {
      query.startDate = {};
      if (options.dateFrom) query.startDate.$gte = new Date(options.dateFrom);
      if (options.dateTo) query.startDate.$lte = new Date(options.dateTo);
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalSurveys: { $sum: 1 },
          completedSurveys: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageScore: { $avg: '$totalScore' },
          totalCompletionTime: { $sum: '$completionTimeMinutes' },
          distinctSurveyTypes: { $addToSet: '$surveyId' }
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    const stats = result[0] || {};

    return {
      totalSurveys: stats.totalSurveys || 0,
      completedSurveys: stats.completedSurveys || 0,
      uniqueSurveyTypes: stats.distinctSurveyTypes ? stats.distinctSurveyTypes.length : 0,
      completionRate:
        stats.totalSurveys > 0
          ? Math.round((stats.completedSurveys / stats.totalSurveys) * 100)
          : 0,
      averageScore: Math.round(stats.averageScore || 0),
      totalTimeSpent: Math.round(stats.totalCompletionTime || 0)
    };
  }
}

module.exports = SurveyResponseRepository;
