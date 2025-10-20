/**
 * Test Application Helper
 *
 * Creates a properly configured Express app for integration testing.
 * Includes all middleware and error handlers.
 *
 * @module tests/helpers/testApp
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../../routes/auth.routes');

/**
 * Create test Express application
 */
function createTestApp() {
  const app = express();

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Endpoint not found',
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Test app error:', err);

    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details || [],
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }

    // Mongoose errors
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database operation failed',
      });
    }

    // Default error response
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    });
  });

  return app;
}

module.exports = { createTestApp };
