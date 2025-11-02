/**
 * Analytics API Routes
 * Feature 3: Analytics Dashboard
 *
 * Endpoints:
 * - GET /api/analytics/overview - Overall statistics
 * - GET /api/analytics/applications - Application statistics with trends
 * - GET /api/analytics/documents - Document statistics
 * - GET /api/analytics/certificates - Certificate statistics
 * - GET /api/analytics/inspections - Inspection statistics
 * - GET /api/analytics/users - User statistics
 * - GET /api/analytics/trends - Trend data for charts
 * - GET /api/analytics/export - Export analytics data
 */

const express = require('express');
const router = express.Router();
const { createLogger } = require('../shared/logger');
const logger = createLogger('analytics-routes');

// Import models
const Application = require('../models/Application');
const Document = require('../models/Document');
const Certificate = require('../models/Certificate');
const Inspection = require('../models/Inspection');
const User = require('../models/user');
const Notification = require('../models/Notification');

// Middleware
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overall system statistics
 * @access  Admin, Manager
 */
router.get('/overview', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate statistics from all modules
    const [
      totalApplications,
      totalDocuments,
      totalCertificates,
      totalInspections,
      totalUsers,
      totalNotifications,
      pendingApplications,
      pendingDocuments,
      activeInspections,
      activeCertificates
    ] = await Promise.all([
      Application.countDocuments(dateFilter),
      Document.countDocuments(dateFilter),
      Certificate.countDocuments(dateFilter),
      Inspection.countDocuments(dateFilter),
      User.countDocuments({ createdAt: dateFilter.createdAt }),
      Notification.countDocuments(dateFilter),
      Application.countDocuments({ ...dateFilter, status: 'pending' }),
      Document.countDocuments({ ...dateFilter, status: 'pending' }),
      Inspection.countDocuments({ ...dateFilter, status: 'in_progress' }),
      Certificate.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalApplications,
          totalDocuments,
          totalCertificates,
          totalInspections,
          totalUsers,
          totalNotifications,
          pendingApplications,
          pendingDocuments,
          activeInspections,
          activeCertificates
        },
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/applications
 * @desc    Get application statistics with status breakdown
 * @access  Admin, Manager
 */
router.get('/applications', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build aggregation pipeline
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProcessingTime: { $avg: '$processingTime' }
        }
      }
    ];

    const statusBreakdown = await Application.aggregate(pipeline);

    // Get total counts
    const total = await Application.countDocuments(matchStage);

    // Calculate approval rate
    const approved = statusBreakdown.find(s => s._id === 'approved')?.count || 0;
    const rejected = statusBreakdown.find(s => s._id === 'rejected')?.count || 0;
    const completed = approved + rejected;
    const approvalRate = completed > 0 ? ((approved / completed) * 100).toFixed(2) : 0;

    // Get recent applications for trends
    const recentApplications = await Application.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        approvalRate: parseFloat(approvalRate),
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgProcessingTime: item.avgProcessingTime
          };
          return acc;
        }, {}),
        trends: recentApplications.map(item => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          count: item.count
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting application analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/documents
 * @desc    Get document statistics with type breakdown
 * @access  Admin, Manager
 */
router.get('/documents', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Status breakdown
    const statusPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    // Type breakdown
    const typePipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 }
        }
      }
    ];

    const [statusBreakdown, typeBreakdown, total] = await Promise.all([
      Document.aggregate(statusPipeline),
      Document.aggregate(typePipeline),
      Document.countDocuments(matchStage)
    ]);

    // Calculate approval rate
    const approved = statusBreakdown.find(s => s._id === 'approved')?.count || 0;
    const rejected = statusBreakdown.find(s => s._id === 'rejected')?.count || 0;
    const reviewed = approved + rejected;
    const approvalRate = reviewed > 0 ? ((approved / reviewed) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        total,
        approvalRate: parseFloat(approvalRate),
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: typeBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Error getting document analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/certificates
 * @desc    Get certificate statistics
 * @access  Admin, Manager
 */
router.get('/certificates', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.issuedDate = {};
      if (startDate) matchStage.issuedDate.$gte = new Date(startDate);
      if (endDate) matchStage.issuedDate.$lte = new Date(endDate);
    }

    // Status breakdown
    const statusPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    // Crop type breakdown
    const cropPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$cropType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    // Monthly issuance trend
    const trendPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$issuedDate' },
            month: { $month: '$issuedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ];

    const [statusBreakdown, cropBreakdown, trends, total] = await Promise.all([
      Certificate.aggregate(statusPipeline),
      Certificate.aggregate(cropPipeline),
      Certificate.aggregate(trendPipeline),
      Certificate.countDocuments(matchStage)
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCropType: cropBreakdown.map(item => ({
          cropType: item._id,
          count: item.count
        })),
        monthlyTrends: trends.map(item => ({
          period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          count: item.count
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting certificate analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificate analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/inspections
 * @desc    Get inspection statistics
 * @access  Admin, Manager, Inspector
 */
router.get(
  '/inspections',
  authenticate,
  authorize(['admin', 'manager', 'inspector']),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const userRole = req.user.role;
      const userId = req.user.userId || req.user.id;

      const matchStage = {};
      if (startDate || endDate) {
        matchStage.scheduledDate = {};
        if (startDate) matchStage.scheduledDate.$gte = new Date(startDate);
        if (endDate) matchStage.scheduledDate.$lte = new Date(endDate);
      }

      // Filter by inspector if not admin/manager
      if (userRole === 'inspector') {
        matchStage.inspector = userId;
      }

      // Status breakdown
      const statusPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        }
      ];

      const [statusBreakdown, total] = await Promise.all([
        Inspection.aggregate(statusPipeline),
        Inspection.countDocuments(matchStage)
      ]);

      // Calculate completion rate
      const completed = statusBreakdown.find(s => s._id === 'completed')?.count || 0;
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

      // Calculate average score
      const completedInspections = statusBreakdown.filter(s => s._id === 'completed');
      const avgScore =
        completedInspections.length > 0
          ? (
              completedInspections.reduce((sum, s) => sum + (s.avgScore || 0), 0) /
              completedInspections.length
            ).toFixed(2)
          : 0;

      res.json({
        success: true,
        data: {
          total,
          completionRate: parseFloat(completionRate),
          averageScore: parseFloat(avgScore),
          byStatus: statusBreakdown.reduce((acc, item) => {
            acc[item._id] = {
              count: item.count,
              avgScore: item.avgScore || 0
            };
            return acc;
          }, {})
        }
      });
    } catch (error) {
      logger.error('Error getting inspection analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inspection analytics',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/analytics/users
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Role breakdown
    const rolePipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ];

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [roleBreakdown, total, activeUsers] = await Promise.all([
      User.aggregate(rolePipeline),
      User.countDocuments(matchStage),
      User.countDocuments({
        ...matchStage,
        lastLoginAt: { $gte: thirtyDaysAgo }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        activeUsers,
        byRole: roleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trend data for line charts (applications, certificates over time)
 * @access  Admin, Manager
 */
router.get('/trends', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { period = '30days', type = 'applications' } = req.query;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Select collection based on type
    let Model;
    let dateField = 'createdAt';

    switch (type) {
      case 'applications':
        Model = Application;
        break;
      case 'documents':
        Model = Document;
        break;
      case 'certificates':
        Model = Certificate;
        dateField = 'issuedDate';
        break;
      case 'inspections':
        Model = Inspection;
        dateField = 'scheduledDate';
        break;
      default:
        Model = Application;
    }

    // Aggregation pipeline for daily trends
    const pipeline = [
      {
        $match: {
          [dateField]: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: `$${dateField}` },
            month: { $month: `$${dateField}` },
            day: { $dayOfMonth: `$${dateField}` }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ];

    const trends = await Model.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        period,
        type,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        trends: trends.map(item => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          count: item.count
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting trend analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trend analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data (CSV/JSON)
 * @access  Admin, Manager
 */
router.get('/export', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { format = 'json', type = 'overview', startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let data;

    switch (type) {
      case 'applications':
        data = await Application.find(matchStage)
          .select('applicationId applicantName status cropType createdAt updatedAt')
          .lean();
        break;
      case 'documents':
        data = await Document.find(matchStage)
          .select('documentId title documentType status uploadedBy createdAt')
          .lean();
        break;
      case 'certificates':
        data = await Certificate.find(matchStage)
          .select('certificateNumber farmerName cropType status issuedDate expiryDate')
          .lean();
        break;
      case 'inspections':
        data = await Inspection.find(matchStage)
          .select('inspectionId farmName inspector status scheduledDate score')
          .lean();
        break;
      default:
        // Overview data
        data = {
          totalApplications: await Application.countDocuments(matchStage),
          totalDocuments: await Document.countDocuments(matchStage),
          totalCertificates: await Certificate.countDocuments(matchStage),
          totalInspections: await Inspection.countDocuments(matchStage)
        };
    }

    if (format === 'csv') {
      // Convert to CSV format
      const fields = Object.keys(Array.isArray(data) ? data[0] || {} : data);
      const csv = [
        fields.join(','),
        ...(Array.isArray(data)
          ? data.map(row => fields.map(field => row[field] || '').join(','))
          : [fields.map(field => data[field] || '').join(',')])
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analytics-${type}-${Date.now()}.csv`
      );
      res.send(csv);
    } else {
      // JSON format
      res.json({
        success: true,
        type,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        data,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

module.exports = router;
