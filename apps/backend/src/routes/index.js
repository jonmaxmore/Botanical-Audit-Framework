/**
 * Routes Index
 * Central routing configuration
 */

const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const applicationRoutes = require('./applications');
const certificateRoutes = require('./certificates');
const auditRoutes = require('./audits');
const paymentRoutes = require('./payments');
const surveyRoutes = require('./surveys');

const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GACP Digital Platform API v1.0',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      Authentication: '/api/v1/auth',
      Users: '/api/v1/users',
      Applications: '/api/v1/applications',
      Certificates: '/api/v1/certificates',
      Audits: '/api/v1/audits',
      Payments: '/api/v1/payments',
      Surveys: '/api/v1/surveys',
      'Health Check': '/health',
      Documentation: '/api/v1/docs',
    },
    documentation: {
      postman: '/api/v1/docs/postman',
      swagger: '/api/v1/docs/swagger',
      readme: '/api/v1/docs/readme',
    },
    features: {
      authentication: 'JWT-based authentication',
      authorization: 'Role-based access control',
      validation: 'Comprehensive request validation',
      errorHandling: 'Structured error responses',
      logging: 'Centralized logging system',
      versioning: 'API versioning support',
      restful: 'RESTful API design patterns',
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/certificates', certificateRoutes);
router.use('/audits', auditRoutes);
router.use('/payments', paymentRoutes);
router.use('/surveys', surveyRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API documentation endpoints
router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
    endpoints: {
      // Authentication endpoints
      'POST /auth/register': 'Register new user',
      'POST /auth/login': 'Login user',
      'POST /auth/logout': 'Logout user',
      'GET /auth/me': 'Get current user profile',
      'POST /auth/forgot-password': 'Send password reset email',
      'POST /auth/reset-password': 'Reset user password',
      'POST /auth/refresh-token': 'Refresh JWT token',
      'GET /auth/verify-email/:token': 'Verify user email',
      'POST /auth/resend-verification': 'Resend email verification',
      'GET /auth/check': 'Check authentication status',

      // User endpoints
      'GET /users': 'Get all users (admin only)',
      'GET /users/search': 'Search users',
      'GET /users/stats': 'Get user statistics (admin only)',
      'GET /users/profile': 'Get current user profile',
      'PUT /users/profile': 'Update current user profile',
      'POST /users/change-password': 'Change user password',
      'POST /users/activity': 'Update user activity',
      'GET /users/:id': 'Get user by ID',
      'PUT /users/:id': 'Update user by ID (admin only)',
      'DELETE /users/:id': 'Delete user (admin only)',

      // Application endpoints
      'GET /applications': 'Get all applications',
      'GET /applications/stats': 'Get application statistics',
      'GET /applications/:id': 'Get application by ID',
      'POST /applications': 'Create new application (farmer)',
      'PUT /applications/:id': 'Update application',
      'DELETE /applications/:id': 'Delete application',
      'POST /applications/:id/submit': 'Submit application for review',
      'POST /applications/:id/review': 'Review application (auditor/director)',

      // Certificate endpoints
      'GET /certificates': 'Get all certificates',
      'GET /certificates/stats': 'Get certificate statistics',
      'GET /certificates/verify/:number': 'Verify certificate (public)',
      'GET /certificates/download/:number': 'Download certificate (public)',
      'GET /certificates/:id': 'Get certificate by ID',
      'POST /certificates': 'Create new certificate (auditor/director)',
      'PUT /certificates/:id': 'Update certificate',
      'DELETE /certificates/:id': 'Delete certificate (director)',
      'POST /certificates/:id/renew': 'Renew certificate',

      // Audit endpoints
      'GET /audits': 'Get all audits',
      'GET /audits/stats': 'Get audit statistics',
      'GET /audits/schedule/:auditorId': 'Get auditor schedule',
      'GET /audits/:id': 'Get audit by ID',
      'POST /audits': 'Create new audit',
      'POST /audits/schedule': 'Schedule field audit',
      'POST /audits/:id/report': 'Submit audit report (auditor)',
      'PUT /audits/:id': 'Update audit',
      'DELETE /audits/:id': 'Delete audit',

      // Payment endpoints
      'GET /payments': 'Get all payments (admin/director)',
      'GET /payments/stats': 'Get payment statistics',
      'GET /payments/status/:applicationId': 'Get payment status',
      'GET /payments/:id': 'Get payment by ID',
      'POST /payments/initiate': 'Initiate payment',
      'POST /payments/:id/refund': 'Process refund (admin/director)',
      'PUT /payments/:id': 'Update payment',
      'POST /payments/webhook': 'Payment webhook (external)',

      // Survey endpoints
      'GET /surveys/regions': 'Get survey regions (public)',
      'GET /surveys/region/:code': 'Get survey by region (public)',
      'POST /surveys/submit/:code': 'Submit survey response (public)',
      'GET /surveys': 'Get all surveys',
      'GET /surveys/stats': 'Get survey statistics',
      'GET /surveys/:id': 'Get survey by ID',
      'POST /surveys': 'Create new survey (admin/director)',
      'PUT /surveys/:id': 'Update survey',
      'DELETE /surveys/:id': 'Delete survey',
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      expiration: '7 days',
    },
    roles: {
      farmer: 'Basic user role for farmers - can create applications, view own data',
      auditor: 'Auditor role for compliance checking - can conduct audits, review applications',
      director: 'Director role for management - can approve certificates, manage system',
      admin: 'Administrator role with full access - can manage all aspects of system',
    },
    errorCodes: {
      400: 'Bad Request - Validation errors',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Insufficient privileges',
      404: 'Not Found - Resource not found',
      409: 'Conflict - Resource already exists',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error',
    },
  });
});

module.exports = router;
