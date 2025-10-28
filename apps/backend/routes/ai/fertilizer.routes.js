/**
 * Fertilizer Recommendation Routes
 *
 * API endpoints for AI-powered fertilizer recommendations and product management
 *
 * Base path: /api/ai/fertilizer or /api/fertilizer-products
 */

const express = require('express');
const router = express.Router();
const fertilizerController = require('../../controllers/ai/fertilizer.controller');

// TODO: Import authentication middleware when ready
// const { authenticateUser } = require('../../middleware/auth');
// const { isAdmin } = require('../../middleware/roles');

/**
 * @route   POST /api/ai/fertilizer/recommend
 * @desc    Generate AI-powered fertilizer recommendation
 * @access  Private (requires authentication)
 * @body    {
 *            farmId: ObjectId,
 *            cultivationCycleId: ObjectId,
 *            growthStage?: string,
 *            options?: {
 *              organicOnly?: boolean,
 *              maxPrice?: number
 *            }
 *          }
 */
router.post('/recommend', fertilizerController.generateRecommendation);
// When auth is ready: router.post('/recommend', authenticateUser, fertilizerController.generateRecommendation);

module.exports = router;
