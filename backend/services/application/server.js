/**
 * Application Service - Server Entry Point
 *
 * Starts the Express server and connects to MongoDB.
 *
 * @module services/application/server
 * @requires app - Express application
 * @requires mongoose - MongoDB connection
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-16
 */

require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

// Configuration
const PORT = process.env.APPLICATION_SERVICE_PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-dev';

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Start server
 */
async function startServer() {
  try {
    // Connect to database first
    await connectDatabase();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('🚀 Application Service started');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async signal => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async() => {
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
        console.error('⚠️ Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
