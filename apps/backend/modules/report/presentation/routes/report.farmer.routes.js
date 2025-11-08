/**
 * Report Routes - Farmer
 *
 * API routes for farmer report operations.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (reportController, authenticateFarmer) => {
  // Request a new report
  router.post('/request', authenticateFarmer, (req, res) =>
    reportController.requestReport(req, res),
  );

  // List my reports
  router.get('/', authenticateFarmer, (req, res) => reportController.listReports(req, res));

  // Get report details
  router.get('/:reportId', authenticateFarmer, (req, res) => reportController.getReport(req, res));

  // Download report file
  router.get('/:reportId/download', authenticateFarmer, (req, res) =>
    reportController.downloadReport(req, res),
  );

  // Generate report manually (trigger generation)
  router.post('/:reportId/generate', authenticateFarmer, (req, res) =>
    reportController.generateReport(req, res),
  );

  // Delete my report
  router.delete('/:reportId', authenticateFarmer, (req, res) =>
    reportController.deleteReport(req, res),
  );

  return router;
};
