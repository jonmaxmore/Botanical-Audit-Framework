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
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
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

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: forceAtlas ? 30000 : isLocalMongoDB ? 3000 : 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: forceAtlas ? 30000 : isLocalMongoDB ? 3000 : 10000,
      family: 4, // Use IPv4
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      // SSL/TLS Configuration - always true for Atlas
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

      appLogger.info('[MongoDB] ✅ Connected successfully');
      appLogger.info('[MongoDB] Database:', mongoose.connection.db.databaseName);

      // Setup event listeners
      this.setupEventListeners();

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

      // Auto-retry logic for other errors
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        appLogger.info(
          `[MongoDB] Retrying connection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );

        await new Promise(resolve => setTimeout(resolve, this.reconnectInterval));
        return this.connect(uri); // Recursive retry with original URI
      }

      appLogger.error('[MongoDB] ❌ Max reconnection attempts reached');
      appLogger.error('[MongoDB] Server will continue WITHOUT database');
      appLogger.error('[MongoDB] Using mock data mode');
      this.isConnected = false;
      return false; // Allow server to continue in fallback mode
    }
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

      // Auto-reconnect
      appLogger.info('[MongoDB] Attempting auto-reconnect...');
      this.connect();
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
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      appLogger.info('[MongoDB] Disconnected gracefully');
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
}

// Export singleton instance
const mongoManager = new MongoDBManager();

module.exports = mongoManager;
