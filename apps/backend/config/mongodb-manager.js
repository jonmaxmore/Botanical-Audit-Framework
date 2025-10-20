/**
 * MongoDB Connection Manager
 * MIS Team Solution for Server Stability
 *
 * Features:
 * - Auto-reconnect on connection loss
 * - Connection pooling
 * - Health checks
 * - Graceful shutdown
 * - Error handling
 */

const mongoose = require('mongoose');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('../shared').logger;
const dbLogger = logger.createLogger('mongodb');

let config;
try {
  // Try to load config from file
  const configPath = path.join(__dirname, 'app-config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);
} catch (error) {
  // Fallback to default config if file not found or invalid JSON
  dbLogger.warn(`Could not load MongoDB config from file: ${error.message}. Using defaults.`);
  config = {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      reconnectInterval: 5000,
      reconnectAttempts: 5,
    },
  };
}

// Connection state
let isConnected = false;
let isConnecting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;

/**
 * Initialize MongoDB connection
 */
async function connect() {
  if (isConnected || isConnecting) {
    return;
  }

  isConnecting = true;
  dbLogger.info(`Connecting to MongoDB: ${maskUri(config.mongodb.uri)}`);

  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    dbLogger.info('Successfully connected to MongoDB');
  } catch (error) {
    isConnecting = false;
    dbLogger.error(`MongoDB connection error: ${error.message}`);
    scheduleReconnect();
    throw error;
  }

  // Set up event listeners
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    dbLogger.warn('MongoDB disconnected');
    scheduleReconnect();
  });

  mongoose.connection.on('error', error => {
    dbLogger.error(`MongoDB connection error: ${error.message}`);
    if (isConnected) {
      isConnected = false;
      scheduleReconnect();
    }
  });

  return mongoose.connection;
}

/**
 * Schedule reconnection attempt
 */
function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  const maxAttempts = config.mongodb.reconnectAttempts || 5;
  if (reconnectAttempts >= maxAttempts) {
    dbLogger.error(`Maximum reconnect attempts (${maxAttempts}) reached. Giving up.`);
    return;
  }

  reconnectAttempts++;
  const interval = config.mongodb.reconnectInterval || 5000;
  dbLogger.info(
    `Scheduling MongoDB reconnection attempt ${reconnectAttempts}/${maxAttempts} in ${interval}ms`,
  );

  reconnectTimer = setTimeout(async () => {
    try {
      dbLogger.info(
        `Attempting to reconnect to MongoDB (attempt ${reconnectAttempts}/${maxAttempts})`,
      );
      await connect();
    } catch (error) {
      dbLogger.error(`Reconnection attempt failed: ${error.message}`);
    }
  }, interval);
}

/**
 * Force reconnection
 */
async function forceReconnect() {
  dbLogger.info('Forced reconnection requested');

  if (isConnected) {
    try {
      await mongoose.connection.close();
    } catch (error) {
      dbLogger.error(`Error closing existing connection: ${error.message}`);
    }
    isConnected = false;
  }

  clearTimeout(reconnectTimer);
  reconnectAttempts = 0;

  try {
    await connect();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get connection status
 */
function getStatus() {
  return {
    isConnected,
    isConnecting,
    readyState: mongoose.connection.readyState,
    reconnectAttempts,
    dbName: mongoose.connection.name || null,
  };
}

/**
 * Health check
 */
async function healthCheck() {
  if (!isConnected) {
    return {
      status: 'unhealthy',
      message: 'Not connected to MongoDB',
      details: {
        readyState: mongoose.connection.readyState,
        reconnectAttempts,
      },
    };
  }

  try {
    // Simple ping to check connection
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      message: 'Connected to MongoDB',
      details: {
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `MongoDB health check failed: ${error.message}`,
      details: {
        readyState: mongoose.connection.readyState,
        error: error.message,
      },
    };
  }
}

// Utility to mask sensitive information in URI
function maskUri(uri) {
  if (!uri) return 'undefined';
  try {
    const parsedUri = new URL(uri);
    if (parsedUri.password) {
      parsedUri.password = '******';
    }
    return parsedUri.toString();
  } catch (error) {
    return uri.replace(/:([^@/]+)@/, ':******@');
  }
}

module.exports = {
  connect,
  forceReconnect,
  getStatus,
  healthCheck,
  connection: mongoose.connection,
};
