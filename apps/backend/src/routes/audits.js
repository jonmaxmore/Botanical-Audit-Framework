/**
 * Audit Management API Routes
 * RESTful API for managing GACP field audits
 *
 * Version: 1.0
 * Base Path: /api/v1/audits
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getAllAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
  scheduleFieldAudit,
  getAuditorSchedule,
  submitAuditReport,
  getAuditStats,
} = require('../controllers/auditController');

// Audit list and search
router.get('/', authenticate, authorize(['director', 'auditor', 'admin']), getAllAudits);

// Audit statistics
router.get('/stats', authenticate, authorize(['director', 'auditor', 'admin']), getAuditStats);

// Get auditor schedule
router.get(
  '/schedule/:auditorId',
  authenticate,
  authorize(['director', 'auditor']),
  getAuditorSchedule,
);

// Get specific audit
router.get('/:id', authenticate, getAuditById);

// Schedule field audit
router.post(
  '/schedule',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('auditSchedule'),
  scheduleFieldAudit,
);

// Create new audit
router.post(
  '/',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('audit'),
  createAudit,
);

// Submit audit report
router.post(
  '/:id/report',
  authenticate,
  authorize(['auditor']),
  validateRequest('auditReport'),
  submitAuditReport,
);

// Update audit
router.put(
  '/:id',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('audit'),
  updateAudit,
);

// Delete audit
router.delete('/:id', authenticate, authorize(['director', 'admin']), deleteAudit);

module.exports = router;
