/**
 * Database Configuration and Connection Management
 * MongoDB and Redis connection setup with error handling
 */

const mongoose = require('mongoose');
const redis = require('redis');
const config = require('./environment');
const logger = require('../utils/logger');

class DatabaseManager {
  constructor() {
    this.mongodb = null;
    this.redis = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   */
  async connectMongoDB() {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);

      // Connect to MongoDB
      this.mongodb = await mongoose.connect(
        config.database.mongodb.uri,
        config.database.mongodb.options
      );

      // MongoDB connection events
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
        this.isConnected = true;
      });

      mongoose.connection.on('error', err => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      // Handle process termination
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));

      return this.mongodb;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Connect to Redis (optional)
   */
  async connectRedis() {
    try {
      if (!config.features.enableCaching) {
        logger.info('Redis caching is disabled');
        return null;
      }

      this.redis = redis.createClient({
        host: config.database.redis.host,
        port: config.database.redis.port,
        password: config.database.redis.password,
        db: config.database.redis.db,
        retry_strategy: options => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis max retry attempts reached');
            return undefined;
          }
          // Reconnect after
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.redis.on('error', err => {
        logger.error('Redis connection error:', err);
      });

      this.redis.on('ready', () => {
        logger.info('Redis ready for operations');
      });

      this.redis.on('end', () => {
        logger.warn('Redis connection ended');
      });

      return this.redis;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Redis is optional, so don't throw error
      return null;
    }
  }

  /**
   * Connect to all databases
   */
  async connectAll() {
    try {
      // Connect to MongoDB (required)
      await this.connectMongoDB();

      // Connect to Redis (optional)
      await this.connectRedis();

      logger.info('All database connections established');
      return true;
    } catch (error) {
      logger.error('Failed to establish database connections:', error);
      throw error;
    }
  }

  /**
   * Check database connection health
   */
  async healthCheck() {
    const health = {
      mongodb: {
        status: 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      redis: {
        status: 'disabled',
        connected: false
      }
    };

    // MongoDB health check
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        health.mongodb.status = 'connected';
      }
    } catch (error) {
      health.mongodb.status = 'error';
      health.mongodb.error = error.message;
    }

    // Redis health check
    if (this.redis && config.features.enableCaching) {
      try {
        health.redis.connected = this.redis.connected;
        health.redis.status = this.redis.connected ? 'connected' : 'disconnected';

        if (this.redis.connected) {
          await new Promise((resolve, reject) => {
            this.redis.ping((err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }
      } catch (error) {
        health.redis.status = 'error';
        health.redis.error = error.message;
      }
    }

    return health;
  }

  /**
   * Get MongoDB connection
   */
  getMongoConnection() {
    return this.mongodb;
  }

  /**
   * Get Redis connection
   */
  getRedisConnection() {
    return this.redis;
  }

  /**
   * Check if databases are connected
   */
  isReady() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    logger.info('Closing database connections...');

    try {
      // Close MongoDB connection
      if (this.mongodb) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      }

      // Close Redis connection
      if (this.redis) {
        this.redis.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error during database shutdown:', error);
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Export functions for backward compatibility
module.exports = {
  connectDB: () => databaseManager.connectAll(),
  getMongoConnection: () => databaseManager.getMongoConnection(),
  getRedisConnection: () => databaseManager.getRedisConnection(),
  healthCheck: () => databaseManager.healthCheck(),
  isReady: () => databaseManager.isReady(),
  databaseManager
};
