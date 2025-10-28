/**
 * Database Health Monitoring Service
 * Comprehensive MongoDB Atlas health monitoring and performance tracking
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const logger = require('../shared/logger/logger');
const mongoose = require('mongoose');
const mongoManager = require('../config/mongodb-manager');

class DatabaseHealthMonitor {
  constructor() {
    this.healthMetrics = {
      connectionStatus: 'unknown',
      responseTime: 0,
      activeConnections: 0,
      errorCount: 0,
      lastHealthCheck: null,
      uptime: 0,
      collections: {},
      performance: {
        avgResponseTime: 0,
        peakResponseTime: 0,
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0
      }
    };

    this.healthHistory = [];
    this.maxHistoryLength = 100;
    this.monitoringInterval = null;

    this.startMonitoring();
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring() {
    logger.info('🔍 Starting database health monitoring...');

    // Initial health check
    this.performHealthCheck();

    // Set up periodic monitoring (every 30 seconds)
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Monitor MongoDB events
    this.setupEventListeners();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('⏹️ Database health monitoring stopped');
    }
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected');
      this.healthMetrics.connectionStatus = 'connected';
      this.updateHealthHistory('connected');
    });

    mongoose.connection.on('error', error => {
      logger.error('❌ MongoDB connection error:', error);
      this.healthMetrics.connectionStatus = 'error';
      this.healthMetrics.errorCount++;
      this.updateHealthHistory('error', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info('⚠️ MongoDB disconnected');
      this.healthMetrics.connectionStatus = 'disconnected';
      this.updateHealthHistory('disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
      this.healthMetrics.connectionStatus = 'reconnected';
      this.updateHealthHistory('reconnected');
    });
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const startTime = Date.now();

    try {
      // Test basic connection
      const isConnected = mongoose.connection.readyState === 1;

      if (isConnected) {
        // Test database operations
        await this.testDatabaseOperations();

        // Get connection statistics
        await this.getConnectionStats();

        // Check collection health
        await this.checkCollectionHealth();

        this.healthMetrics.connectionStatus = 'healthy';
      } else {
        this.healthMetrics.connectionStatus = 'disconnected';
      }

      // Calculate response time
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      this.healthMetrics.responseTime = responseTime;
      this.healthMetrics.lastHealthCheck = new Date().toISOString();
      this.healthMetrics.uptime = process.uptime();

      logger.info(`💚 Database health check completed in ${responseTime}ms`);
    } catch (error) {
      logger.error('❌ Database health check failed:', error);

      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, false);

      this.healthMetrics.connectionStatus = 'unhealthy';
      this.healthMetrics.errorCount++;
      this.healthMetrics.lastError = error.message;
      this.healthMetrics.lastHealthCheck = new Date().toISOString();
    }
  }

  /**
   * Test basic database operations
   */
  async testDatabaseOperations() {
    const testData = {
      _id: new mongoose.Types.ObjectId(),
      testField: 'health-check',
      timestamp: new Date()
    };

    // Test insert
    const TestCollection = mongoose.connection.db.collection('health_check_test');
    await TestCollection.insertOne(testData);

    // Test find
    const foundDoc = await TestCollection.findOne({ _id: testData._id });
    if (!foundDoc) {
      throw new Error('Database read operation failed');
    }

    // Test update
    await TestCollection.updateOne({ _id: testData._id }, { $set: { updated: true } });

    // Test delete (cleanup)
    await TestCollection.deleteOne({ _id: testData._id });
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats() {
    try {
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();

      this.healthMetrics.activeConnections = serverStatus.connections?.current || 0;
      this.healthMetrics.serverInfo = {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        host: serverStatus.host
      };
    } catch (error) {
      logger.warn('⚠️ Could not retrieve server statistics:', error.message);
    }
  }

  /**
   * Check health of all collections
   */
  async checkCollectionHealth() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;
        const coll = mongoose.connection.db.collection(collectionName);

        // Get collection stats
        const stats = await coll.stats();

        this.healthMetrics.collections[collectionName] = {
          documentCount: stats.count,
          size: stats.size,
          avgDocumentSize: stats.avgObjSize,
          indexes: stats.nindexes,
          healthy: true
        };
      }
    } catch (error) {
      logger.warn('⚠️ Could not retrieve collection statistics:', error.message);
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(responseTime, successful) {
    const perf = this.healthMetrics.performance;

    perf.totalQueries++;

    if (successful) {
      perf.successfulQueries++;
    } else {
      perf.failedQueries++;
    }

    // Update average response time
    perf.avgResponseTime = (perf.avgResponseTime + responseTime) / 2;

    // Update peak response time
    if (responseTime > perf.peakResponseTime) {
      perf.peakResponseTime = responseTime;
    }
  }

  /**
   * Update health history
   */
  updateHealthHistory(status, details = null) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      status: status,
      details: details,
      responseTime: this.healthMetrics.responseTime
    };

    this.healthHistory.unshift(historyEntry);

    // Keep only the latest entries
    if (this.healthHistory.length > this.maxHistoryLength) {
      this.healthHistory.pop();
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      status: this.healthMetrics.connectionStatus,
      metrics: this.healthMetrics,
      history: this.healthHistory.slice(0, 10), // Return last 10 entries
      summary: {
        isHealthy: this.healthMetrics.connectionStatus === 'healthy',
        totalChecks: this.healthMetrics.performance.totalQueries,
        successRate:
          this.healthMetrics.performance.totalQueries > 0
            ? (
                (this.healthMetrics.performance.successfulQueries /
                  this.healthMetrics.performance.totalQueries) *
                100
              ).toFixed(2)
            : 0,
        avgResponseTime: Math.round(this.healthMetrics.performance.avgResponseTime),
        uptime: process.uptime()
      }
    };
  }

  /**
   * Get detailed health report
   */
  getDetailedHealthReport() {
    return {
      overview: this.getHealthStatus(),
      connectionDetails: {
        readyState: mongoose.connection.readyState,
        readyStateText: this.getReadyStateText(mongoose.connection.readyState),
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      },
      collections: this.healthMetrics.collections,
      performance: this.healthMetrics.performance,
      recentHistory: this.healthHistory.slice(0, 20),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }

  /**
   * Get readable ready state text
   */
  getReadyStateText(readyState) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[readyState] || 'unknown';
  }

  /**
   * Force reconnection if needed
   */
  async forceReconnection() {
    try {
      logger.info('🔄 Forcing database reconnection...');
      await mongoose.disconnect();
      await mongoManager.connect();
      logger.info('✅ Database reconnection successful');
      return true;
    } catch (error) {
      logger.error('❌ Database reconnection failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const dbHealthMonitor = new DatabaseHealthMonitor();

// Graceful shutdown
process.on('SIGTERM', () => {
  dbHealthMonitor.stopMonitoring();
});

process.on('SIGINT', () => {
  dbHealthMonitor.stopMonitoring();
});

module.exports = dbHealthMonitor;
