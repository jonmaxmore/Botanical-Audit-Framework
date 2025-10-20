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
const logger = require('../shared').logger;
const appLogger = logger.createLogger('mongodb-manager');

class MongoDBManager {
  constructor() {
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // Increased from 5
    this.baseReconnectInterval = 5000; // 5 seconds base interval
    this.keepAliveInterval = null;
    this.connectionMonitor = null;
    this.lastConnectionAttempt = 0;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect(uri = null) {
    const MONGODB_URI =
      uri || process.env.MONGODB_URI || process.env.MONGODB_URI_SIMPLE || process.env.MONGODB_URL;

    if (!MONGODB_URI) {
      appLogger.info('[MongoDB] ❌ No MongoDB URI provided');
      appLogger.info('[MongoDB] Please set MONGODB_URI in .env file');
      return false;
    }

    // Check if it's a local MongoDB URI that might not be running
    const isLocalMongoDB = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');

    // Force Atlas connection - don't try local MongoDB
    const forceAtlas = !isLocalMongoDB || process.env.FORCE_ATLAS === 'true';

    // Timeout configuration
    const timeouts = {
      serverSelection: forceAtlas ? 30000 : isLocalMongoDB ? 3000 : 10000,
      socket: 45000,
      connection: forceAtlas ? 30000 : isLocalMongoDB ? 3000 : 10000,
      idle: 30000
    };

    // Pool configuration
    const pool = {
      max: 10,
      min: 2
    };

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Timeouts
      serverSelectionTimeoutMS: timeouts.serverSelection,
      socketTimeoutMS: timeouts.socket,
      connectTimeoutMS: timeouts.connection,
      maxIdleTimeMS: timeouts.idle,

      // Network
      family: 4, // Use IPv4

      // Pool
      maxPoolSize: pool.max,
      minPoolSize: pool.min,

      // Retry
      retryWrites: true,
      retryReads: true,

      // SSL/TLS
      ssl: forceAtlas || !isLocalMongoDB,
      tls: forceAtlas || !isLocalMongoDB,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    };

    try {
      appLogger.info('[MongoDB] Attempting to connect...');
      appLogger.info('[MongoDB] URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

      await mongoose.connect(MONGODB_URI, options);

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.lastConnectionAttempt = Date.now();

      appLogger.info('[MongoDB] ✅ Connected successfully');
      appLogger.info('[MongoDB] Database:', mongoose.connection.db.databaseName);

      // Setup event listeners
      this.setupEventListeners();

      // Start connection monitoring
      this.startConnectionMonitoring();

      return true;
    } catch (error) {
      appLogger.error('[MongoDB] ❌ Connection failed:', error.message);

      // Special handling for local MongoDB not running
      if (
        isLocalMongoDB &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))
      ) {
        appLogger.info('[MongoDB] 💡 Local MongoDB not running. Starting in mock mode...');
        this.isConnected = false;
        return false; // Allow server to continue without DB
      }

      // Auto-retry logic for other errors with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const backoffTime = this.calculateBackoffTime();
        appLogger.info(
          `[MongoDB] Retrying connection (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.round(backoffTime / 1000)}s...`
        );

        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.connect(uri); // Recursive retry with original URI
      }

      appLogger.error('[MongoDB] ❌ Max reconnection attempts reached');
      appLogger.warn(
        '[MongoDB] Resetting connection attempts count and will try again in 60 seconds'
      );

      // Instead of giving up, we'll reset and try again after a longer pause
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.connect(uri);
      }, 60000); // Wait 1 minute before resetting the cycle

      this.isConnected = false;
      return false; // Allow server to continue in fallback mode for now
    }
  }

  /**
   * Calculate backoff time using exponential strategy
   */
  calculateBackoffTime() {
    // Exponential backoff with jitter: baseTime * (2^attempt) * (0.75 + 0.5*random)
    const exponentialPart = Math.pow(2, Math.min(this.reconnectAttempts - 1, 6)); // Cap at 2^6
    const jitter = 0.75 + Math.random() * 0.5; // Random between 0.75 and 1.25
    return Math.min(this.baseReconnectInterval * exponentialPart * jitter, 300000); // Max 5 minutes
  }

  /**
   * Start periodic connection monitoring
   */
  startConnectionMonitoring() {
    // Clear any existing intervals
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    if (this.connectionMonitor) clearInterval(this.connectionMonitor);

    // Set up keep-alive ping every 30 seconds
    this.keepAliveInterval = setInterval(async() => {
      if (this.isConnected) {
        try {
          await mongoose.connection.db.admin().ping();
          appLogger.debug('[MongoDB] Keep-alive ping successful');
        } catch (error) {
          appLogger.warn('[MongoDB] Keep-alive ping failed:', error.message);
          // The disconnected event should handle reconnection
        }
      }
    }, 30000);

    // Set up connection monitor every 2 minutes
    this.connectionMonitor = setInterval(async() => {
      // If not connected and no recent connection attempt
      if (!this.isConnected && Date.now() - this.lastConnectionAttempt > 60000) {
        appLogger.info(
          '[MongoDB] Connection monitor detected disconnect state, initiating reconnection'
        );
        this.reconnectAttempts = 0; // Reset attempts
        this.lastConnectionAttempt = Date.now();
        this.connect();
      }

      // Check for zombie connection (connected but can't communicate)
      if (this.isConnected) {
        try {
          const status = await this.healthCheck();
          if (status.status !== 'healthy') {
            appLogger.warn('[MongoDB] Zombie connection detected. Forcing reconnection');
            await this.disconnect();
            this.lastConnectionAttempt = Date.now();
            this.connect();
          }
        } catch (error) {
          appLogger.error('[MongoDB] Error during connection monitoring:', error.message);
        }
      }
    }, 120000);

    appLogger.info('[MongoDB] Connection monitoring started');
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      appLogger.info('[MongoDB] Event: Connected');
      this.isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      appLogger.info('[MongoDB] Event: Disconnected');
      this.isConnected = false;

      // Auto-reconnect with delay to avoid hammering the server
      appLogger.info('[MongoDB] Preparing auto-reconnect...');
      setTimeout(() => {
        if (!this.isConnected) {
          appLogger.info('[MongoDB] Attempting auto-reconnect...');
          this.lastConnectionAttempt = Date.now();
          this.connect();
        }
      }, 5000);
    });

    mongoose.connection.on('error', err => {
      appLogger.error('[MongoDB] Event: Error -', err.message);
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      appLogger.info('[MongoDB] Event: Reconnected');
      this.isConnected = true;
    });

    // Handle process termination
    process.on('SIGINT', async() => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async() => {
      await this.disconnect();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async err => {
      appLogger.error('[MongoDB] Uncaught exception:', err.message);
      // Don't disconnect - let the process continue if possible
    });

    process.on('unhandledRejection', async reason => {
      appLogger.error('[MongoDB] Unhandled rejection:', reason);
      // Don't disconnect - let the process continue if possible
    });
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect() {
    try {
      // Clear monitoring intervals
      if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
      if (this.connectionMonitor) clearInterval(this.connectionMonitor);

      if (mongoose.connection.readyState !== 0) {
        // Not already closed
        await mongoose.connection.close();
        appLogger.info('[MongoDB] Disconnected gracefully');
      }
      this.isConnected = false;
    } catch (error) {
      appLogger.error('[MongoDB] Error during disconnect:', error.message);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          connected: false,
          message: 'Not connected to MongoDB'
        };
      }

      // Ping database
      await mongoose.connection.db.admin().ping();

      return {
        status: 'healthy',
        connected: true,
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState,
        collections: await this.getCollectionStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = {};

      for (const coll of collections) {
        const collStats = await mongoose.connection.db.collection(coll.name).stats();
        stats[coll.name] = {
          documents: collStats.count,
          size: collStats.size,
          indexes: collStats.nindexes
        };
      }

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.db?.databaseName || 'N/A'
    };
  }

  /**
   * Force reconnection - can be called from API or health check
   */
  async forceReconnect() {
    appLogger.info('[MongoDB] Forcing reconnection...');
    await this.disconnect();
    this.reconnectAttempts = 0;
    this.lastConnectionAttempt = Date.now();
    return this.connect();
  }
}

// Export singleton instance
const mongoManager = new MongoDBManager();

module.exports = mongoManager;
