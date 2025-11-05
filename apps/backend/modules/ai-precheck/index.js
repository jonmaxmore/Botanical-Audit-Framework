/**
 * AI Pre-Check Module
 *
 * Automatically validates application documents using AI
 * - OCR document extraction
 * - Completeness checking
 * - Risk scoring
 * - Automated recommendations
 *
 * @module ai-precheck
 */

const express = require('express');
const router = express.Router();

// Import routes
const aiPreCheckRoutes = require('./presentation/routes/aiPrecheck.routes');

// Mount routes
router.use('/ai-precheck', aiPreCheckRoutes);

module.exports = router;
