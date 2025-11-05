/**
 * QA Verification Module
 *
 * Quality assurance verification system
 * - Risk-based sampling (10%, 30%, 100%)
 * - Document and photo verification
 * - Report quality checks
 * - GACP compliance verification
 * - Re-inspection requests
 *
 * @module qa-verification
 */

const express = require('express');
const router = express.Router();

// Import routes
const qaVerificationRoutes = require('./presentation/routes/qaVerification.routes');

// Mount routes
router.use('/qa', qaVerificationRoutes);

module.exports = router;
