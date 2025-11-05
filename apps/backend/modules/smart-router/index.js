/**
 * Smart Router Module
 *
 * Intelligent workload routing and inspector assignment
 * - Priority-based routing
 * - Workload balancing
 * - Inspection type determination
 * - Inspector matching
 *
 * @module smart-router
 */

const express = require('express');
const router = express.Router();

// Import routes
const routingRoutes = require('./presentation/routes/routing.routes');

// Mount routes
router.use('/routing', routingRoutes);

module.exports = router;
