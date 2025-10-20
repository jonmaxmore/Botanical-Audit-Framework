/**
 * Report Controller
 *
 * HTTP request handlers for report operations.
 * Part of Clean Architecture - Presentation Layer
 */

class ReportController {
  constructor(
    requestReportUseCase,
    generateReportUseCase,
    getReportUseCase,
    downloadReportUseCase,
    listReportsUseCase,
    deleteReportUseCase,
    getReportStatisticsUseCase,
    retryFailedReportUseCase,
  ) {
    this.requestReportUseCase = requestReportUseCase;
    this.generateReportUseCase = generateReportUseCase;
    this.getReportUseCase = getReportUseCase;
    this.downloadReportUseCase = downloadReportUseCase;
    this.listReportsUseCase = listReportsUseCase;
    this.deleteReportUseCase = deleteReportUseCase;
    this.getReportStatisticsUseCase = getReportStatisticsUseCase;
    this.retryFailedReportUseCase = retryFailedReportUseCase;
  }

  // Request a new report
  async requestReport(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.role === 'dtam' ? 'dtam' : 'farmer';

      const reportData = {
        ...req.body,
        requestedBy: userId,
        requestedByType: userType,
      };

      const report = await this.requestReportUseCase.execute(reportData);

      // Auto-generate if not scheduled
      if (report.schedule === 'ONCE') {
        // Trigger generation in background (don't await)
        this.generateReportUseCase.execute(report.id).catch(error => {
          logger.error('Failed to generate report:', error);
        });
      }

      res.status(201).json({
        success: true,
        message: 'Report requested successfully',
        data: report,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Generate report manually
  async generateReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user can access the report
      const report = await this.getReportUseCase.execute(reportId, userId, userRole);

      // Generate
      const generatedReport = await this.generateReportUseCase.execute(reportId);

      res.status(200).json({
        success: true,
        message: 'Report generated successfully',
        data: generatedReport,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get report details
  async getReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const report = await this.getReportUseCase.execute(reportId, userId, userRole);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(error.message.includes('Access denied') ? 403 : 404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Download report file
  async downloadReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await this.downloadReportUseCase.execute(reportId, userId, userRole);

      res.set({
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.fileSize,
      });

      res.send(result.buffer);
    } catch (error) {
      res.status(error.message.includes('Access denied') ? 403 : 404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // List reports
  async listReports(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const { type, status, format, page = 1, limit = 20 } = req.query;

      const filters = {};
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (format) filters.format = format;

      const result = await this.listReportsUseCase.execute(
        filters,
        userId,
        userRole,
        parseInt(page),
        parseInt(limit),
      );

      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      await this.deleteReportUseCase.execute(reportId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      res.status(error.message.includes('Only') ? 403 : 404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get report statistics (DTAM only)
  async getStatistics(req, res) {
    try {
      const filters = {};

      // Date range filter
      if (req.query.startDate) {
        filters.createdAt = { $gte: new Date(req.query.startDate) };
      }
      if (req.query.endDate) {
        filters.createdAt = {
          ...filters.createdAt,
          $lte: new Date(req.query.endDate),
        };
      }

      const statistics = await this.getReportStatisticsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Retry failed report (DTAM only)
  async retryReport(req, res) {
    try {
      const { reportId } = req.params;

      const report = await this.retryFailedReportUseCase.execute(reportId);

      res.status(200).json({
        success: true,
        message: 'Report retry initiated',
        data: report,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ReportController;
