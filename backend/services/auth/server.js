/**
 * Authentication Service - Express Server
 *
 * Main Express application for authentication service.
 * Port: 3001
 *
 * Features:
 * - User registration with email verification
 * - Login with JWT tokens
 * - Token refresh with rotation
 * - Password reset flow
 * - Account security (lockout, rate limiting)
 *
 * @module services/auth/server
 */

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const config = require('../../config/env.config');

// Routes
const authRoutes = require('./routes/auth.routes');

// Initialize Express app
const app = express();

/**
 * Middleware Setup
 */

// Security headers (Helmet)
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// Trust proxy (for correct IP address when behind load balancer)
app.set('trust proxy', 1);

/**
 * API Routes
 */

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'GACP Authentication Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: 'POST /api/auth/*',
      docs: 'GET /api/docs (coming soon)',
    },
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

/**
 * Error Handling
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'ไม่พบเส้นทาง API ที่คุณร้องขอ',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't leak error details in production
  const errorMessage = config.isProduction ? 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: errorMessage,
    ...(config.isDevelopment && { stack: err.stack }),
  });
});

/**
 * Database Connection
 */
async function connectDatabase() {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Server Startup
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log('\n🚀 Authentication Service Started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Environment: ${config.env}`);
      console.log(`Server: http://${config.server.host}:${config.server.port}`);
      console.log(`Health: http://${config.server.host}:${config.server.port}/health`);
      console.log(`API Base: http://${config.server.host}:${config.server.port}/api/auth`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // Graceful shutdown
    const shutdown = async signal => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };
