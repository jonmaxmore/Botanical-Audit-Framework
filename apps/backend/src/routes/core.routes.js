/**
 * Core Routes
 * Root, Health, and API Documentation endpoints
 */

const express = require('express');
const router = express.Router();
const mongoManager = require('../../config/mongodb-manager');

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'GACP Certification System API (Atlas)',
    version: '1.0.0-atlas',
    description: 'Production API for GACP certification system with MongoDB Atlas',
    database: 'MongoDB Atlas',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health - System health check',
      api: '/api - API documentation',
      auth: '/api/auth - Authentication endpoints',
      applications: '/api/applications - Application management',
      dashboard: '/api/dashboard - Dashboard data',
    },
    message: 'Atlas server ready! Frontend: http://localhost:3001',
    demo: 'Live demo available at /demo.html',
  });
});

// API Documentation
router.get('/api', (req, res) => {
  res.json({
    name: 'GACP Atlas API',
    version: '1.0.0-atlas',
    mode: 'atlas',
    database: mongoManager.isConnected() ? 'Connected' : 'Disconnected',
    monitoring: 'Available at /monitoring-dashboard.html',
    endpoints: {
      'GET /health': 'Health check with database status',
      'GET /api/auth/me': 'Get current user (requires JWT)',
      'POST /api/auth/login': 'User login',
      'POST /api/auth/register': 'User registration',
      'GET /api/applications': 'List applications (requires auth)',
      'POST /api/applications': 'Create application (requires auth)',
      'GET /api/applications/:id': 'Get application details (requires auth)',
      'GET /api/dashboard/stats': 'Dashboard statistics (requires auth)',
    },
    authentication: 'JWT Bearer Token',
    example_request: {
      login: {
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: 'farmer@example.com',
          password: 'password123',
        },
      },
    },
  });
});

// Health check endpoint
router.get('/health', async (req, res) => {
  const dbHealth = await mongoManager.healthCheck();

  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0-atlas',
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    mongodb: {
      connected: mongoManager.isConnected(),
      status: mongoManager.getStatus(),
    },
  };

  res.json(health);
});

// Database connection test
router.get('/api/db/test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoManager.isConnected()) {
      // Test basic database operations
      const collections = await mongoose.connection.db.listCollections().toArray();

      res.json({
        success: true,
        message: 'Database connection successful',
        database: mongoose.connection.db.databaseName,
        collections: collections.map(c => c.name),
        connection_info: mongoManager.getStatus(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database not connected',
        status: mongoManager.getStatus(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
    });
  }
});

module.exports = router;
