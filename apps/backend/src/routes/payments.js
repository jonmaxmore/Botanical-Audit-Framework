/**
 * Payment Management API Routes
 * RESTful API for managing GACP payment processing
 *
 * Version: 1.0
 * Base Path: /api/v1/payments
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth-middleware');
const { validateRequest } = require('../middleware/validation-middleware');
const {
  getAllPayments,
  getPaymentById,
  initiatePayment,
  updatePayment,
  getPaymentStatus,
  processWebhook,
  getPaymentStats,
  refundPayment
} = require('../controllers/paymentController');

// Payment list and search
router.get('/', authenticate, authorize(['director', 'admin']), getAllPayments);

// Payment statistics
router.get('/stats', authenticate, authorize(['director', 'admin']), getPaymentStats);

// Get payment status
router.get('/status/:applicationId', authenticate, getPaymentStatus);

// Get specific payment
router.get('/:id', authenticate, getPaymentById);

// Initiate payment
router.post(
  '/initiate',
  authenticate,
  authorize(['farmer', 'director']),
  validateRequest('paymentInitiation'),
  initiatePayment
);

// Process refund
router.post(
  '/:id/refund',
  authenticate,
  authorize(['director', 'admin']),
  validateRequest('refund'),
  refundPayment
);

// Update payment
router.put(
  '/:id',
  authenticate,
  authorize(['director', 'admin']),
  validateRequest('payment'),
  updatePayment
);

// Webhook endpoint (no authentication for external services)
router.post('/webhook', validateRequest('webhook'), processWebhook);

module.exports = router;
