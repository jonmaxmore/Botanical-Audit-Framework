/**
 * Certificate Management API Routes
 * RESTful API for managing GACP certificates
 *
 * Version: 1.0
 * Base Path: /api/v1/certificates
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth-middleware');
const { validateRequest } = require('../middleware/validation-middleware');
const {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  downloadCertificate,
  verifyCertificate,
  renewCertificate,
  getCertificateStats,
} = require('../controllers/certificateController');

// Certificate list and search
router.get('/', authenticate, authorize(['director', 'auditor', 'admin']), getAllCertificates);

// Certificate statistics
router.get(
  '/stats',
  authenticate,
  authorize(['director', 'auditor', 'admin']),
  getCertificateStats,
);

// Certificate verification (public endpoint)
router.get('/verify/:certificateNumber', verifyCertificate);

// Download certificate (public endpoint)
router.get('/download/:certificateNumber', downloadCertificate);

// Get specific certificate
router.get('/:id', authenticate, getCertificateById);

// Create new certificate
router.post(
  '/',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('certificate'),
  createCertificate,
);

// Update certificate
router.put(
  '/:id',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('certificate'),
  updateCertificate,
);

// Renew certificate
router.post('/:id/renew', authenticate, authorize(['director', 'auditor']), renewCertificate);

// Delete certificate
router.delete('/:id', authenticate, authorize(['director', 'admin']), deleteCertificate);

module.exports = router;
