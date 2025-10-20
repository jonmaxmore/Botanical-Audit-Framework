/**
 * GACP Standards Comparison System - Infrastructure Layer Repository
 * ระบบ Repository สำหรับการจัดการข้อมูล Standards Comparison ในฐานข้อมูล
 *
 * Business Logic & Process Workflow:
 * 1. Data Persistence - การจัดการข้อมูลการเปรียบเทียบมาตรฐานในฐานข้อมูล
 * 2. Complex Query Support - รองรับการ query ข้อมูลที่ซับซ้อน
 * 3. Analysis Data Management - การจัดการข้อมูลผลการวิเคราะห์ขนาดใหญ่
 * 4. Historical Data Tracking - การติดตามข้อมูลประวัติการเปรียบเทียบ
 *
 * Technical Implementation:
 * - MongoDB aggregation pipelines for complex analysis queries
 * - Optimized indexing for performance with large datasets
 * - Flexible schema design for evolving standards requirements
 * - Comprehensive audit trail and change tracking
 */

const StandardsComparison = require('../../domain/entities/StandardsComparison');

/**
 * StandardsComparisonRepository - คลาสสำหรับจัดการการเข้าถึงข้อมูล Standards Comparison
 *
 * Process Flow:
 * 1. Comparison CRUD Operations - การสร้าง อ่าน แก้ไข และลบข้อมูลการเปรียบเทียบ
 * 2. Complex Analysis Queries - การ query ข้อมูลสำหรับการวิเคราะห์
 * 3. Historical Tracking - การติดตามและจัดเก็บประวัติการเปลี่ยนแปลง
 * 4. Performance Optimization - การปรับปรุงประสิทธิภาพการเข้าถึงข้อมูล
 *
 * Data Management Strategy:
 * - แยกการจัดเก็บข้อมูล metadata และ analysis results
 * - ใช้ aggregation pipeline สำหรับ complex reporting
 * - Implement caching สำหรับ frequently accessed data
 * - รองรับ horizontal scaling สำหรับข้อมูลขนาดใหญ่
 */
class StandardsComparisonRepository {
  constructor(mongoClient, logger) {
    this.db = mongoClient.db('gacp_platform');
    this.collection = this.db.collection('standards_comparisons');
    this.analysisCollection = this.db.collection('comparison_analysis_results');
    this.reportsCollection = this.db.collection('comparison_reports');
    this.logger = logger;

    // สร้าง indexes สำหรับการค้นหาที่มีประสิทธิภาพ
    this.initializeIndexes();
  }

  /**
   * Initialize Database Indexes
   * การสร้าง indexes เพื่อปรับปรุงประสิทธิภาพการค้นหา
   *
   * Business Reasoning:
   * - เพิ่มความเร็วในการค้นหาและรายงานการเปรียบเทียบมาตรฐาน
   * - รองรับ complex aggregation queries สำหรับการวิเคราะห์
   * - ปรับปรุงประสิทธิภาพ time-series queries สำหรับ trends analysis
   */
  async initializeIndexes() {
    try {
      // Primary collection indexes
      await this.collection.createIndex({ farmId: 1, createdDate: -1 });
      await this.collection.createIndex({ status: 1, lastAnalysisDate: -1 });
      await this.collection.createIndex({ 'baselineStandard.id': 1 });

      // Compound indexes for complex queries
      await this.collection.createIndex({
        farmId: 1,
        status: 1,
        'comparisonResults.overallCompliance': -1
      });

      // Text search index
      await this.collection.createIndex({
        comparisonName: 'text',
        description: 'text',
        'targetStandards.name': 'text'
      });

      // Analysis results indexes
      await this.analysisCollection.createIndex({
        comparisonId: 1,
        analysisDate: -1
      });
      await this.analysisCollection.createIndex({
        'results.overallCompliance': -1
      });

      // Reports collection indexes
      await this.reportsCollection.createIndex({
        comparisonId: 1,
        reportType: 1,
        generatedDate: -1
      });

      this.logger.info('Standards comparison repository indexes initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize standards comparison indexes:', error);
    }
  }

  /**
   * Create Standards Comparison
   * การสร้างการเปรียบเทียบมาตรฐานใหม่
   *
   * Input Parameters:
   * @param {StandardsComparison} standardsComparison - Standards Comparison entity
   *
   * Business Process:
   * 1. ตรวจสอบความถูกต้องของข้อมูล entity
   * 2. เตรียมข้อมูลสำหรับบันทึกลงฐานข้อมูล
   * 3. บันทึกลงฐานข้อมูลพร้อม audit trail
   * 4. สร้าง initial analysis workspace
   * 5. ส่งคืน entity ที่บันทึกแล้ว
   *
   * Data Structure:
   * - แยกเก็บ metadata และ large analysis data
   * - สร้าง reference links ระหว่าง collections
   * - เตรียม workspace สำหรับ future analysis results
   */
  async create(standardsComparison) {
    try {
      this.logger.info('Creating standards comparison in database', {
        comparisonName: standardsComparison.comparisonName,
        farmId: standardsComparison.farmId
      });

      // เตรียมข้อมูลหลักสำหรับบันทึก
      const comparisonDocument = {
        _id: standardsComparison.id,
        comparisonName: standardsComparison.comparisonName,
        description: standardsComparison.description,
        farmId: standardsComparison.farmId,

        // Standards configuration
        baselineStandard: standardsComparison.baselineStandard,
        targetStandards: standardsComparison.targetStandards,
        comparisonScope: standardsComparison.comparisonScope,
        analysisParameters: standardsComparison.analysisParameters,

        // Current state
        currentPractices: standardsComparison.currentPractices,
        complianceStatus: standardsComparison.complianceStatus,

        // Results (initially empty)
        comparisonResults: standardsComparison.comparisonResults,
        gapAnalysis: standardsComparison.gapAnalysis,
        improvementPlan: standardsComparison.improvementPlan,

        // Metadata
        status: standardsComparison.status,
        createdDate: standardsComparison.createdDate,
        lastAnalysisDate: standardsComparison.lastAnalysisDate,
        completedDate: standardsComparison.completedDate,
        version: standardsComparison.version,

        // Metrics
        overallComplianceScore: standardsComparison.overallComplianceScore,
        criticalGapsCount: standardsComparison.criticalGapsCount,
        improvementOpportunities: standardsComparison.improvementOpportunities,

        // Audit trail
        auditTrail: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModifiedBy: 'system',
          lastModifiedAt: new Date(),
          changeHistory: [
            {
              timestamp: new Date(),
              action: 'comparison_created',
              details: {
                comparisonName: standardsComparison.comparisonName,
                farmId: standardsComparison.farmId
              }
            }
          ]
        }
      };

      // บันทึกข้อมูลหลัก
      const result = await this.collection.insertOne(comparisonDocument);

      if (!result.acknowledged) {
        throw new Error('Failed to insert standards comparison into database');
      }

      // สร้าง analysis workspace
      await this.createAnalysisWorkspace(standardsComparison.id);

      this.logger.info('Standards comparison created successfully', {
        comparisonId: standardsComparison.id
      });

      return standardsComparison;
    } catch (error) {
      this.logger.error('Failed to create standards comparison:', error);
      throw new Error(`Standards comparison creation failed: ${error.message}`);
    }
  }

  /**
   * Find Standards Comparison by ID
   * การค้นหาการเปรียบเทียบมาตรฐานด้วย ID
   *
   * Input Parameters:
   * @param {string} comparisonId - ID ของการเปรียบเทียบ
   *
   * Business Logic:
   * 1. ค้นหาข้อมูลหลักจาก main collection
   * 2. รวมข้อมูล analysis results หากมี
   * 3. แปลงข้อมูลเป็น domain entity
   * 4. เพิ่ม computed fields และ derived data
   */
  async findById(comparisonId) {
    try {
      this.logger.info('Finding standards comparison by ID', { comparisonId });

      // ค้นหาข้อมูลหลัก
      const comparisonDocument = await this.collection.findOne({ _id: comparisonId });

      if (!comparisonDocument) {
        this.logger.warn('Standards comparison not found', { comparisonId });
        return null;
      }

      // ดึงข้อมูล analysis results ล่าสุด (ถ้ามี)
      const latestAnalysis = await this.analysisCollection.findOne(
        { comparisonId: comparisonId },
        { sort: { analysisDate: -1 } }
      );

      // รวม analysis results เข้ากับข้อมูลหลัก
      if (latestAnalysis) {
        comparisonDocument.comparisonResults = latestAnalysis.results;
        comparisonDocument.gapAnalysis = latestAnalysis.gapAnalysis;
        comparisonDocument.improvementPlan = latestAnalysis.improvementPlan;
        comparisonDocument.lastAnalysisDate = latestAnalysis.analysisDate;
      }

      // แปลงข้อมูลเป็น domain entity
      const standardsComparison = new StandardsComparison({
        id: comparisonDocument._id,
        comparisonName: comparisonDocument.comparisonName,
        description: comparisonDocument.description,
        farmId: comparisonDocument.farmId,
        baselineStandard: comparisonDocument.baselineStandard,
        targetStandards: comparisonDocument.targetStandards,
        comparisonScope: comparisonDocument.comparisonScope,
        analysisParameters: comparisonDocument.analysisParameters,
        currentPractices: comparisonDocument.currentPractices,
        complianceStatus: comparisonDocument.complianceStatus,
        comparisonResults: comparisonDocument.comparisonResults,
        gapAnalysis: comparisonDocument.gapAnalysis,
        improvementPlan: comparisonDocument.improvementPlan,
        status: comparisonDocument.status,
        createdDate: comparisonDocument.createdDate,
        lastAnalysisDate: comparisonDocument.lastAnalysisDate,
        completedDate: comparisonDocument.completedDate,
        version: comparisonDocument.version,
        overallComplianceScore: comparisonDocument.overallComplianceScore,
        criticalGapsCount: comparisonDocument.criticalGapsCount,
        improvementOpportunities: comparisonDocument.improvementOpportunities
      });

      this.logger.info('Standards comparison found successfully', { comparisonId });
      return standardsComparison;
    } catch (error) {
      this.logger.error('Failed to find standards comparison:', error);
      throw new Error(`Standards comparison lookup failed: ${error.message}`);
    }
  }

  /**
   * Find Standards Comparisons by Farm ID
   * การค้นหาการเปรียบเทียบมาตรฐานทั้งหมดของฟาร์ม
   *
   * Input Parameters:
   * @param {string} farmId - ID ของฟาร์ม
   * @param {Object} options - ตัวเลือกการค้นหาและ pagination
   *
   * Business Features:
   * - รองรับการกรองตามสถานะและช่วงเวลา
   * - Pagination สำหรับข้อมูลจำนวนมาก
   * - Sorting ตามเกณฑ์ต่างๆ
   * - Summary statistics สำหรับ dashboard
   */
  async findByFarmId(farmId, options = {}) {
    try {
      this.logger.info('Finding standards comparisons by farm ID', { farmId, options });

      // สร้าง query criteria
      const query = { farmId };

      // เพิ่มการกรองตามสถานะ
      if (options.status) {
        query.status = Array.isArray(options.status) ? { $in: options.status } : options.status;
      }

      // เพิ่มการกรองตามช่วงวันที่
      if (options.dateFrom || options.dateTo) {
        query.createdDate = {};
        if (options.dateFrom) {
          query.createdDate.$gte = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          query.createdDate.$lte = new Date(options.dateTo);
        }
      }

      // ตั้งค่า pagination
      const limit = parseInt(options.limit) || 10;
      const skip = parseInt(options.skip) || 0;

      // ตั้งค่า sorting
      const sort = options.sort || { createdDate: -1 };

      // ดำเนินการค้นหา
      const cursor = this.collection.find(query).sort(sort).skip(skip).limit(limit);

      const comparisonDocuments = await cursor.toArray();
      const totalCount = await this.collection.countDocuments(query);

      // แปลงเป็น domain entities
      const comparisons = comparisonDocuments.map(
        doc =>
          new StandardsComparison({
            id: doc._id,
            comparisonName: doc.comparisonName,
            description: doc.description,
            farmId: doc.farmId,
            baselineStandard: doc.baselineStandard,
            targetStandards: doc.targetStandards,
            comparisonScope: doc.comparisonScope,
            analysisParameters: doc.analysisParameters,
            currentPractices: doc.currentPractices,
            complianceStatus: doc.complianceStatus,
            comparisonResults: doc.comparisonResults,
            gapAnalysis: doc.gapAnalysis,
            improvementPlan: doc.improvementPlan,
            status: doc.status,
            createdDate: doc.createdDate,
            lastAnalysisDate: doc.lastAnalysisDate,
            completedDate: doc.completedDate,
            version: doc.version,
            overallComplianceScore: doc.overallComplianceScore,
            criticalGapsCount: doc.criticalGapsCount,
            improvementOpportunities: doc.improvementOpportunities
          })
      );

      // คำนวณสถิติสำหรับฟาร์ม
      const farmStatistics = await this.calculateFarmStatistics(farmId, query);

      const result = {
        comparisons,
        statistics: farmStatistics,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0
        }
      };

      this.logger.info('Farm standards comparisons found successfully', {
        farmId,
        count: comparisons.length,
        totalCount
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to find farm standards comparisons:', error);
      throw new Error(`Farm comparisons lookup failed: ${error.message}`);
    }
  }

  /**
   * Update Standards Comparison
   * การอัปเดตข้อมูลการเปรียบเทียบมาตรฐาน
   *
   * Input Parameters:
   * @param {string} comparisonId - ID ของการเปรียบเทียบ
   * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
   * @param {string} updatedBy - ผู้ที่ทำการอัปเดต
   *
   * Business Logic:
   * - แยกการอัปเดตข้อมูล metadata และ analysis results
   * - บันทึก audit trail ทุกการเปลี่ยนแปลง
   * - Handle large analysis data แยกจาก main document
   * - Update derived metrics และ computed fields
   */
  async update(comparisonId, updateData, updatedBy = 'system') {
    try {
      this.logger.info('Updating standards comparison', { comparisonId, updatedBy });

      // ตรวจสอบว่า comparison มีอยู่จริง
      const existingComparison = await this.findById(comparisonId);
      if (!existingComparison) {
        throw new Error(`Standards comparison with ID ${comparisonId} not found`);
      }

      // แยกข้อมูล analysis results ออกจาก main update
      const { comparisonResults, gapAnalysis, improvementPlan, ...mainUpdateData } = updateData;

      // เตรียมข้อมูลสำหรับ main document update
      const mainUpdate = {
        $set: {
          ...mainUpdateData,
          'auditTrail.lastModifiedBy': updatedBy,
          'auditTrail.lastModifiedAt': new Date(),
          version: existingComparison.version + 1
        },
        $push: {
          'auditTrail.changeHistory': {
            timestamp: new Date(),
            updatedBy: updatedBy,
            changes: Object.keys(updateData),
            previousVersion: existingComparison.version
          }
        }
      };

      // อัปเดต main document
      const mainResult = await this.collection.updateOne({ _id: comparisonId }, mainUpdate);

      if (mainResult.matchedCount === 0) {
        throw new Error('Standards comparison not found for update');
      }

      // หากมี analysis results ให้บันทึกแยก
      if (comparisonResults || gapAnalysis || improvementPlan) {
        await this.saveAnalysisResults(comparisonId, {
          results: comparisonResults,
          gapAnalysis: gapAnalysis,
          improvementPlan: improvementPlan,
          analysisDate: new Date(),
          analyzedBy: updatedBy
        });
      }

      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedComparison = await this.findById(comparisonId);

      this.logger.info('Standards comparison updated successfully', {
        comparisonId,
        version: updatedComparison.version
      });

      return updatedComparison;
    } catch (error) {
      this.logger.error('Failed to update standards comparison:', error);
      throw new Error(`Standards comparison update failed: ${error.message}`);
    }
  }

  /**
   * Delete Standards Comparison
   * การลบการเปรียบเทียบมาตรฐาน (soft delete)
   *
   * Input Parameters:
   * @param {string} comparisonId - ID ของการเปรียบเทียบ
   * @param {string} deletedBy - ผู้ที่ทำการลบ
   *
   * Business Rules:
   * - ใช้ soft delete เพื่อรักษาประวัติข้อมูล
   * - เก็บ analysis results และ reports ไว้
   * - บันทึก audit trail การลบ
   * - อัปเดต related data references
   */
  async delete(comparisonId, deletedBy = 'system') {
    try {
      this.logger.info('Deleting standards comparison (soft delete)', { comparisonId, deletedBy });

      // ตรวจสอบว่า comparison มีอยู่จริง
      const existingComparison = await this.findById(comparisonId);
      if (!existingComparison) {
        throw new Error(`Standards comparison with ID ${comparisonId} not found`);
      }

      // ทำ soft delete
      const result = await this.collection.updateOne(
        { _id: comparisonId },
        {
          $set: {
            status: 'deleted',
            deletedDate: new Date(),
            'auditTrail.lastModifiedBy': deletedBy,
            'auditTrail.lastModifiedAt': new Date()
          },
          $push: {
            'auditTrail.changeHistory': {
              timestamp: new Date(),
              updatedBy: deletedBy,
              action: 'soft_delete',
              reason: 'Standards comparison deactivated'
            }
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('Standards comparison not found for deletion');
      }

      // Mark related analysis results as deleted
      await this.analysisCollection.updateMany(
        { comparisonId: comparisonId },
        {
          $set: {
            deleted: true,
            deletedDate: new Date(),
            deletedBy: deletedBy
          }
        }
      );

      // Mark related reports as deleted
      await this.reportsCollection.updateMany(
        { comparisonId: comparisonId },
        {
          $set: {
            deleted: true,
            deletedDate: new Date(),
            deletedBy: deletedBy
          }
        }
      );

      this.logger.info('Standards comparison deleted successfully (soft delete)', { comparisonId });

      return {
        success: true,
        comparisonId,
        deletedBy,
        deletedDate: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to delete standards comparison:', error);
      throw new Error(`Standards comparison deletion failed: ${error.message}`);
    }
  }

  /**
   * Search Standards Comparisons
   * การค้นหาการเปรียบเทียบมาตรฐานด้วยเงื่อนไขที่หลากหลาย
   *
   * Input Parameters:
   * @param {Object} searchCriteria - เงื่อนไขการค้นหา
   * @param {Object} options - ตัวเลือกการค้นหา
   *
   * Search Features:
   * - Full-text search ในชื่อและคำอธิบาย
   * - กรองตามมาตรฐานและคะแนน
   * - ค้นหาตามช่วงวันที่และสถานะ
   * - Advanced filtering สำหรับ business intelligence
   */
  async searchComparisons(searchCriteria, options = {}) {
    try {
      this.logger.info('Searching standards comparisons', { searchCriteria, options });

      const pipeline = [];

      // Match stage - กรองข้อมูลพื้นฐาน
      const matchStage = {
        status: { $ne: 'deleted' }
      };

      // เพิ่มการกรองตามฟาร์ม
      if (searchCriteria.farmId) {
        matchStage.farmId = searchCriteria.farmId;
      }

      // เพิ่มการกรองตามสถานะ
      if (searchCriteria.status) {
        matchStage.status = Array.isArray(searchCriteria.status)
          ? { $in: searchCriteria.status }
          : searchCriteria.status;
      }

      // เพิ่มการกรองตามช่วงคะแนน
      if (searchCriteria.minScore !== undefined || searchCriteria.maxScore !== undefined) {
        matchStage.overallComplianceScore = {};
        if (searchCriteria.minScore !== undefined) {
          matchStage.overallComplianceScore.$gte = searchCriteria.minScore;
        }
        if (searchCriteria.maxScore !== undefined) {
          matchStage.overallComplianceScore.$lte = searchCriteria.maxScore;
        }
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
          $language: 'none' // รองรับหลายภาษา
        };
      }

      pipeline.push({ $match: matchStage });

      // เพิ่ม text score หากมีการค้นหาข้อความ
      if (searchCriteria.searchText) {
        pipeline.push({
          $addFields: {
            searchScore: { $meta: 'textScore' }
          }
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

      // แปลงเป็น domain entities
      const comparisons = searchResults.map(
        doc =>
          new StandardsComparison({
            id: doc._id,
            comparisonName: doc.comparisonName,
            description: doc.description,
            farmId: doc.farmId,
            baselineStandard: doc.baselineStandard,
            targetStandards: doc.targetStandards,
            comparisonScope: doc.comparisonScope,
            analysisParameters: doc.analysisParameters,
            currentPractices: doc.currentPractices,
            complianceStatus: doc.complianceStatus,
            comparisonResults: doc.comparisonResults,
            gapAnalysis: doc.gapAnalysis,
            improvementPlan: doc.improvementPlan,
            status: doc.status,
            createdDate: doc.createdDate,
            lastAnalysisDate: doc.lastAnalysisDate,
            completedDate: doc.completedDate,
            version: doc.version,
            overallComplianceScore: doc.overallComplianceScore,
            criticalGapsCount: doc.criticalGapsCount,
            improvementOpportunities: doc.improvementOpportunities,
            searchScore: doc.searchScore
          })
      );

      const result = {
        comparisons,
        pagination: {
          totalCount,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: skip + limit < totalCount,
          hasPrev: skip > 0
        },
        searchCriteria
      };

      this.logger.info('Standards comparison search completed', {
        resultsCount: comparisons.length,
        totalCount
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to search standards comparisons:', error);
      throw new Error(`Standards comparison search failed: ${error.message}`);
    }
  }

  /**
   * Helper Methods
   * ฟังก์ชันช่วยเหลือสำหรับการจัดการข้อมูล
   */

  /**
   * Create Analysis Workspace
   * สร้าง workspace สำหรับเก็บผลการวิเคราะห์
   */
  async createAnalysisWorkspace(comparisonId) {
    try {
      const workspaceDoc = {
        comparisonId: comparisonId,
        createdDate: new Date(),
        analysisHistory: [],
        largeDataReferences: {},
        computationMetrics: {}
      };

      await this.analysisCollection.insertOne(workspaceDoc);

      this.logger.info('Analysis workspace created', { comparisonId });
    } catch (error) {
      this.logger.error('Failed to create analysis workspace:', error);
      // Don't throw error as this is not critical for main operation
    }
  }

  /**
   * Save Analysis Results
   * บันทึกผลการวิเคราะห์แยกจาก main document
   */
  async saveAnalysisResults(comparisonId, analysisData) {
    try {
      const analysisDoc = {
        comparisonId: comparisonId,
        analysisId: require('uuid').v4(),
        analysisDate: analysisData.analysisDate,
        results: analysisData.results,
        gapAnalysis: analysisData.gapAnalysis,
        improvementPlan: analysisData.improvementPlan,
        analyzedBy: analysisData.analyzedBy,
        computationMetrics: {
          executionTime: analysisData.executionTime,
          dataPointsProcessed: analysisData.dataPointsProcessed,
          algorithmsUsed: analysisData.algorithmsUsed
        }
      };

      await this.analysisCollection.insertOne(analysisDoc);

      this.logger.info('Analysis results saved', {
        comparisonId,
        analysisId: analysisDoc.analysisId
      });
    } catch (error) {
      this.logger.error('Failed to save analysis results:', error);
      throw error;
    }
  }

  /**
   * Save Report
   * บันทึกรายงานที่สร้างจากการเปรียบเทียบ
   */
  async saveReport(comparisonId, reportData) {
    try {
      const reportDoc = {
        comparisonId: comparisonId,
        reportId: reportData.id,
        reportType: reportData.type,
        generatedDate: new Date(),
        format: reportData.format,
        language: reportData.language,
        content: reportData.content,
        metadata: reportData.metadata,
        fileReferences: reportData.fileReferences || []
      };

      await this.reportsCollection.insertOne(reportDoc);

      this.logger.info('Report saved', {
        comparisonId,
        reportId: reportData.id
      });
    } catch (error) {
      this.logger.error('Failed to save report:', error);
      throw error;
    }
  }

  /**
   * Calculate Farm Statistics
   * คำนวณสถิติของฟาร์มสำหรับการเปรียบเทียบมาตรฐาน
   */
  async calculateFarmStatistics(farmId, baseQuery = {}) {
    try {
      const query = { ...baseQuery, farmId };

      const pipeline = [
        { $match: query },
        {
          $group: {
            _id: null,
            totalComparisons: { $sum: 1 },
            completedComparisons: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            averageComplianceScore: { $avg: '$overallComplianceScore' },
            totalCriticalGaps: { $sum: '$criticalGapsCount' },
            totalImprovementOpportunities: { $sum: '$improvementOpportunities' },
            latestComparison: { $max: '$createdDate' },
            oldestComparison: { $min: '$createdDate' }
          }
        }
      ];

      const result = await this.collection.aggregate(pipeline).toArray();
      const stats = result[0] || {};

      return {
        totalComparisons: stats.totalComparisons || 0,
        completedComparisons: stats.completedComparisons || 0,
        completionRate:
          stats.totalComparisons > 0
            ? Math.round((stats.completedComparisons / stats.totalComparisons) * 100)
            : 0,
        averageComplianceScore: Math.round(stats.averageComplianceScore || 0),
        totalCriticalGaps: stats.totalCriticalGaps || 0,
        totalImprovementOpportunities: stats.totalImprovementOpportunities || 0,
        assessmentPeriod: {
          from: stats.oldestComparison,
          to: stats.latestComparison
        }
      };
    } catch (error) {
      this.logger.error('Failed to calculate farm statistics:', error);
      return {
        totalComparisons: 0,
        completedComparisons: 0,
        completionRate: 0,
        averageComplianceScore: 0,
        totalCriticalGaps: 0,
        totalImprovementOpportunities: 0
      };
    }
  }
}

module.exports = StandardsComparisonRepository;
