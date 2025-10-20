/**
 * GACP Digital Platform Entry Point
 * Main server initialization and startup
 */

const { GACAApplication } = require('./app');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection! Shutting down...', err);
  process.exit(1);
});

// Create and start the application
async function startServer() {
  try {
    const app = new GACAApplication();
    await app.start();

    logger.info('🎉 GACP Digital Platform started successfully!');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
