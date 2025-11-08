/**
 * Report Routes - DTAM
 *
 * API routes for DTAM staff report operations.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (reportController, authenticateDTAM) => {
  // Request a new report
  router.post('/request', authenticateDTAM, (req, res) => reportController.requestReport(req, res));

  // List all reports
  router.get('/', authenticateDTAM, (req, res) => reportController.listReports(req, res));

  // Get report statistics
  router.get('/statistics', authenticateDTAM, (req, res) =>
    reportController.getStatistics(req, res),
  );

  // Get report details
  router.get('/:reportId', authenticateDTAM, (req, res) => reportController.getReport(req, res));

  // Download report file
  router.get('/:reportId/download', authenticateDTAM, (req, res) =>
    reportController.downloadReport(req, res),
  );

  // Generate report manually
  router.post('/:reportId/generate', authenticateDTAM, (req, res) =>
    reportController.generateReport(req, res),
  );

  // Retry failed report
  router.post('/:reportId/retry', authenticateDTAM, (req, res) =>
    reportController.retryReport(req, res),
  );

  // Delete report
  router.delete('/:reportId', authenticateDTAM, (req, res) =>
    reportController.deleteReport(req, res),
  );

  return router;
};
