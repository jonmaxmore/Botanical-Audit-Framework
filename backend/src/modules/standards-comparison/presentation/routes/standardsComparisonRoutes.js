/**
 * GACP Standards Comparison System - API Routes Configuration
 * ระบบกำหนดเส้นทาง API endpoints สำหรับ Standards Comparison System
 *
 * Business Logic & Process Workflow:
 * 1. Route Organization - การจัดระเบียบ API endpoints ตาม business workflows
 * 2. Complex Workflow Support - รองรับ workflows ที่ซับซ้อนของการเปรียบเทียบมาตรฐาน
 * 3. Multi-step Process Routes - endpoints สำหรับกระบวนการหลายขั้นตอน
 * 4. Advanced Permission Controls - การควบคุมสิทธิ์แบบละเอียดสำหรับแต่ละ operation
 *
 * Technical Implementation:
 * - Express.js router with advanced middleware chains
 * - Support for long-running operations with progress tracking
 * - File upload and download capabilities for reports
 * - Comprehensive error handling for complex business scenarios
 */

const express = require('express');
const router = express.Router();

/**
 * Standards Comparison Routes Setup Function
 * ฟังก์ชันสำหรับกำหนดเส้นทาง API ของ Standards Comparison System
 *
 * Input Parameters:
 * @param {Object} dependencies - ออบเจ็กต์ที่มี controllers และ middleware
 *
 * Route Structure:
 * - /api/standards-comparisons/* - Standards comparison management endpoints
 * - /api/farms/:farmId/standards-comparisons/* - Farm-specific comparison endpoints
 * - /api/standards-comparisons/:id/reports/* - Report generation and management
 * - /api/standards-comparisons/:id/progress/* - Progress tracking endpoints
 *
 * Middleware Chains:
 * 1. Authentication middleware - ตรวจสอบการ login
 * 2. Authorization middleware - ตรวจสอบสิทธิ์การเข้าถึง
 * 3. Input validation middleware - ตรวจสอบความถูกต้องของข้อมูล
 * 4. Rate limiting middleware - จำกัดการเรียกใช้ API
 * 5. Audit logging middleware - บันทึก activity log
 * 6. File handling middleware - จัดการไฟล์และรายงาน
 */
function setupStandardsComparisonRoutes(dependencies) {
  const {
    standardsComparisonController,
    authMiddleware,
    validationMiddleware,
    rateLimitMiddleware,
    auditMiddleware,
    fileMiddleware,
    progressMiddleware,
    logger
  } = dependencies;

  // =============================================================================
  // STANDARDS COMPARISON MANAGEMENT ROUTES
  // =============================================================================

  /**
   * Create Standards Comparison
   * POST /api/standards-comparisons
   *
   * สร้างการเปรียบเทียบมาตรฐานใหม่
   *
   * Middleware Chain:
   * - Authentication: ตรวจสอบการ login
   * - Rate Limiting: จำกัด 5 requests ต่อนาที
   * - Input Validation: ตรวจสอบ comparison configuration
   * - Audit Logging: บันทึก activity
   *
   * Business Rules:
   * - ผู้ใช้ต้องมีสิทธิ์ในการสร้าง comparison สำหรับฟาร์มที่ระบุ
   * - ต้องระบุมาตรฐานอ้างอิงและมาตรฐานเป้าหมาย
   * - กำหนดค่า analysis parameters ได้
   */
  router.post(
    '/standards-comparisons',
    authMiddleware.authenticate,
    rateLimitMiddleware.createStandardsComparison,
    validationMiddleware.validateCreateStandardsComparison,
    auditMiddleware.logActivity('standards_comparison_create'),
    async(req, res) => {
      try {
        await standardsComparisonController.createStandardsComparison(req, res);
      } catch (error) {
        logger.error('Standards comparison creation route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Standards Comparison by ID
   * GET /api/standards-comparisons/:id
   *
   * ดึงข้อมูลการเปรียบเทียบมาตรฐานตาม ID
   *
   * Query Parameters:
   * - includeLatestData: boolean
   * - includeProgress: boolean
   * - includeRecommendations: boolean
   * - format: string (summary/detailed/full)
   */
  router.get(
    '/standards-comparisons/:id',
    authMiddleware.authenticate,
    rateLimitMiddleware.getStandardsComparison,
    auditMiddleware.logActivity('standards_comparison_view'),
    async(req, res) => {
      try {
        await standardsComparisonController.getStandardsComparison(req, res);
      } catch (error) {
        logger.error('Standards comparison retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Update Comparison Configuration
   * PUT /api/standards-comparisons/:id/configuration
   *
   * อัปเดตการกำหนดค่าการเปรียบเทียบ
   *
   * Business Rules:
   * - อนุญาตการแก้ไขเฉพาะเมื่อสถานะเป็น 'draft' หรือ 'configuring'
   * - การเปลี่ยนแปลง analysis parameters จะ reset ผลการวิเคราะห์
   */
  router.put(
    '/standards-comparisons/:id/configuration',
    authMiddleware.authenticate,
    rateLimitMiddleware.updateStandardsComparison,
    validationMiddleware.validateUpdateComparisonConfiguration,
    auditMiddleware.logActivity('standards_comparison_config_update'),
    async(req, res) => {
      try {
        await standardsComparisonController.updateComparisonConfiguration(req, res);
      } catch (error) {
        logger.error('Comparison configuration update route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // DATA COLLECTION AND ANALYSIS ROUTES
  // =============================================================================

  /**
   * Collect Current Practices Data
   * POST /api/standards-comparisons/:id/collect-data
   *
   * เริ่มกระบวนการรวบรวมข้อมูลการปฏิบัติปัจจุบัน
   *
   * Middleware Chain:
   * - Progress Tracking: เริ่มการติดตาม progress
   * - Long Operation Support: รองรับ operations ที่ใช้เวลานาน
   */
  router.post(
    '/standards-comparisons/:id/collect-data',
    authMiddleware.authenticate,
    rateLimitMiddleware.collectData,
    validationMiddleware.validateDataCollectionOptions,
    progressMiddleware.initializeProgress,
    auditMiddleware.logActivity('data_collection_start'),
    async(req, res) => {
      try {
        await standardsComparisonController.collectCurrentPracticesData(req, res);
      } catch (error) {
        logger.error('Data collection route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Run Standards Analysis
   * POST /api/standards-comparisons/:id/analyze
   *
   * ดำเนินการวิเคราะห์เปรียบเทียบมาตรฐาน
   *
   * Business Process:
   * 1. ตรวจสอบความพร้อมสำหรับการวิเคราะห์
   * 2. ดำเนินการวิเคราะห์แบบครอบคลุม
   * 3. สร้างคำแนะนำการปรับปรุง
   * 4. คำนวณ ROI และ impact metrics
   */
  router.post(
    '/standards-comparisons/:id/analyze',
    authMiddleware.authenticate,
    rateLimitMiddleware.analyzeStandards,
    validationMiddleware.validateAnalysisOptions,
    progressMiddleware.initializeProgress,
    auditMiddleware.logActivity('standards_analysis_start'),
    async(req, res) => {
      try {
        await standardsComparisonController.runStandardsAnalysis(req, res);
      } catch (error) {
        logger.error('Standards analysis route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // PROGRESS TRACKING ROUTES
  // =============================================================================

  /**
   * Get Comparison Progress
   * GET /api/standards-comparisons/:id/progress
   *
   * ดึงข้อมูลความคืบหน้าของการเปรียบเทียบ
   *
   * Real-time Features:
   * - แสดงความคืบหน้าของแต่ละขั้นตอน
   * - ประเมินเวลาที่เหลือ
   * - แสดงขั้นตอนถัดไป
   */
  router.get(
    '/standards-comparisons/:id/progress',
    authMiddleware.authenticate,
    rateLimitMiddleware.getProgress,
    auditMiddleware.logActivity('progress_view'),
    async(req, res) => {
      try {
        await standardsComparisonController.getComparisonProgress(req, res);
      } catch (error) {
        logger.error('Progress retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // FARM-SPECIFIC ROUTES
  // =============================================================================

  /**
   * Get Farm Standards Comparisons
   * GET /api/farms/:farmId/standards-comparisons
   *
   * ดึงรายการการเปรียบเทียบมาตรฐานทั้งหมดของฟาร์ม
   *
   * Query Parameters:
   * - page: number (pagination)
   * - limit: number (records per page)
   * - status: string/array (filter by status)
   * - dateFrom: string (start date filter)
   * - dateTo: string (end date filter)
   * - includeMetrics: boolean (include farm metrics)
   * - includeTrends: boolean (include trend analysis)
   */
  router.get(
    '/farms/:farmId/standards-comparisons',
    authMiddleware.authenticate,
    rateLimitMiddleware.getFarmComparisons,
    validationMiddleware.validateFarmId,
    auditMiddleware.logActivity('farm_comparisons_view'),
    async(req, res) => {
      try {
        await standardsComparisonController.getFarmStandardsComparisons(req, res);
      } catch (error) {
        logger.error('Farm comparisons retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // REPORT GENERATION AND MANAGEMENT ROUTES
  // =============================================================================

  /**
   * Generate Improvement Report
   * POST /api/standards-comparisons/:id/reports
   *
   * สร้างรายงานคำแนะนำการปรับปรุง
   *
   * Report Types:
   * - improvement_plan: แผนการปรับปรุงแบบละเอียด
   * - executive_summary: สรุปสำหรับผู้บริหาร
   * - gap_analysis: รายงานการวิเคราะห์ช่องว่าง
   * - action_plan: แผนปฏิบัติการ
   *
   * Output Formats:
   * - PDF: สำหรับการพิมพ์และการนำเสนอ
   * - HTML: สำหรับการดูออนไลน์
   * - Excel: สำหรับการวิเคราะห์เพิ่มเติม
   */
  router.post(
    '/standards-comparisons/:id/reports',
    authMiddleware.authenticate,
    rateLimitMiddleware.generateReport,
    validationMiddleware.validateReportOptions,
    auditMiddleware.logActivity('report_generation'),
    async(req, res) => {
      try {
        await standardsComparisonController.generateImprovementReport(req, res);
      } catch (error) {
        logger.error('Report generation route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Download Report
   * GET /api/standards-comparisons/:id/reports/:reportId/download
   *
   * ดาวน์โหลดรายงานที่สร้างแล้ว
   *
   * Security Features:
   * - ตรวจสอบสิทธิ์การดาวน์โหลด
   * - URL expiration
   * - File integrity verification
   */
  router.get(
    '/standards-comparisons/:id/reports/:reportId/download',
    authMiddleware.authenticate,
    rateLimitMiddleware.downloadReport,
    auditMiddleware.logActivity('report_download'),
    fileMiddleware.validateFileAccess,
    async(req, res) => {
      try {
        // Implementation for report download
        // This would be handled by a separate file service
        res.status(200).json({
          success: true,
          message: 'Report download functionality to be implemented',
          reportId: req.params.reportId
        });
      } catch (error) {
        logger.error('Report download route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // SEARCH AND FILTERING ROUTES
  // =============================================================================

  /**
   * Search Standards Comparisons
   * POST /api/standards-comparisons/search
   *
   * ค้นหาการเปรียบเทียบมาตรฐานด้วยเงื่อนไขที่หลากหลาย
   *
   * Search Criteria:
   * - searchText: full-text search
   * - farmIds: array of farm IDs
   * - statuses: array of comparison statuses
   * - scoreRange: min/max compliance scores
   * - dateRange: creation date range
   * - standardIds: specific standards to filter by
   *
   * Advanced Features:
   * - Faceted search results
   * - Search result highlighting
   * - Saved search queries
   */
  router.post(
    '/standards-comparisons/search',
    authMiddleware.authenticate,
    rateLimitMiddleware.searchComparisons,
    validationMiddleware.validateSearchCriteria,
    auditMiddleware.logActivity('comparisons_search'),
    async(req, res) => {
      try {
        // Implementation for advanced search
        res.status(200).json({
          success: true,
          message: 'Advanced search functionality to be implemented',
          searchCriteria: req.body
        });
      } catch (error) {
        logger.error('Search route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // STATISTICS AND ANALYTICS ROUTES
  // =============================================================================

  /**
   * Get Comparison Statistics
   * GET /api/standards-comparisons/statistics
   *
   * ดึงสถิติการเปรียบเทียบมาตรฐานสำหรับ dashboard
   *
   * Query Parameters:
   * - farmId: string (optional) - สถิติของฟาร์มเฉพาะ
   * - dateFrom: string (optional) - วันที่เริ่มต้น
   * - dateTo: string (optional) - วันที่สิ้นสุด
   * - groupBy: string (optional) - จัดกลุ่มตาม (farm, standard, month)
   *
   * Statistics Provided:
   * - Total comparisons by status
   * - Average compliance scores
   * - Most common gaps
   * - Improvement trends over time
   * - ROI metrics from implemented recommendations
   */
  router.get(
    '/standards-comparisons/statistics',
    authMiddleware.authenticate,
    rateLimitMiddleware.getStatistics,
    auditMiddleware.logActivity('statistics_view'),
    async(req, res) => {
      try {
        // Implementation for statistics
        res.status(200).json({
          success: true,
          message: 'Statistics functionality to be implemented',
          filters: req.query
        });
      } catch (error) {
        logger.error('Statistics route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // UTILITY AND HEALTH CHECK ROUTES
  // =============================================================================

  /**
   * Health Check
   * GET /api/standards-comparisons/health
   *
   * ตรวจสอบสถานะการทำงานของ Standards Comparison System
   */
  router.get('/standards-comparisons/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'standards-comparison-system',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      capabilities: [
        'comparison_creation',
        'data_collection',
        'standards_analysis',
        'report_generation',
        'progress_tracking'
      ]
    });
  });

  /**
   * API Documentation
   * GET /api/standards-comparisons/docs
   *
   * ส่งคืน API documentation
   */
  router.get('/standards-comparisons/docs', (req, res) => {
    res.status(200).json({
      success: true,
      documentation: {
        title: 'GACP Standards Comparison System API',
        version: '1.0.0',
        description: 'API endpoints for GACP standards comparison and improvement planning',
        endpoints: {
          management: [
            'POST /api/standards-comparisons - Create comparison',
            'GET /api/standards-comparisons/:id - Get comparison details',
            'PUT /api/standards-comparisons/:id/configuration - Update configuration'
          ],
          workflows: [
            'POST /api/standards-comparisons/:id/collect-data - Collect practices data',
            'POST /api/standards-comparisons/:id/analyze - Run analysis',
            'GET /api/standards-comparisons/:id/progress - Get progress'
          ],
          reporting: [
            'POST /api/standards-comparisons/:id/reports - Generate reports',
            'GET /api/standards-comparisons/:id/reports/:reportId/download - Download report'
          ],
          farm_management: ['GET /api/farms/:farmId/standards-comparisons - Get farm comparisons'],
          utilities: [
            'POST /api/standards-comparisons/search - Search comparisons',
            'GET /api/standards-comparisons/statistics - Get statistics'
          ]
        },
        workflow_steps: {
          typical_flow: [
            '1. Create comparison with POST /api/standards-comparisons',
            '2. Collect data with POST /api/standards-comparisons/:id/collect-data',
            '3. Run analysis with POST /api/standards-comparisons/:id/analyze',
            '4. Generate reports with POST /api/standards-comparisons/:id/reports',
            '5. Monitor progress with GET /api/standards-comparisons/:id/progress'
          ]
        }
      }
    });
  });

  // =============================================================================
  // ERROR HANDLING MIDDLEWARE
  // =============================================================================

  /**
   * Route Not Found Handler
   * จัดการกรณีที่เรียกใช้ route ที่ไม่มีอยู่
   */
  router.use('*', (req, res) => {
    logger.warn('Standards comparison route not found', {
      method: req.method,
      path: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested standards comparison endpoint was not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
          'POST /api/standards-comparisons',
          'GET /api/standards-comparisons/:id',
          'PUT /api/standards-comparisons/:id/configuration',
          'POST /api/standards-comparisons/:id/collect-data',
          'POST /api/standards-comparisons/:id/analyze',
          'GET /api/standards-comparisons/:id/progress',
          'POST /api/standards-comparisons/:id/reports'
        ]
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * General Error Handler
   * จัดการข้อผิดพลาดทั่วไปในระดับ route
   */
  router.use((error, req, res, next) => {
    logger.error('Standards comparison route error:', {
      error: error.message,
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id
    });

    // ตรวจสอบประเภทข้อผิดพลาด
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: error.message
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'BusinessLogicError') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'BUSINESS_LOGIC_ERROR',
          message: error.message,
          details: error.details
        },
        timestamp: new Date().toISOString()
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred in standards comparison system'
      },
      timestamp: new Date().toISOString()
    });
  });

  logger.info('Standards Comparison System routes configured successfully', {
    totalRoutes: router.stack.length,
    routeCategories: [
      'management',
      'workflows',
      'progress_tracking',
      'farm_specific',
      'reporting',
      'search',
      'statistics',
      'utilities'
    ],
    timestamp: new Date().toISOString()
  });

  return router;
}

module.exports = setupStandardsComparisonRoutes;
