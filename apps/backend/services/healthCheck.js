// Comprehensive Health Check System for GACP Standards Comparison
const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');

class HealthCheckService {
  constructor(dbManager, cacheManager) {
    this.dbManager = dbManager;
    this.cacheManager = cacheManager;
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
  }

  // Basic health check
  async basicHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.version,
      environment: this.environment,
      node_version: process.version,
      pid: process.pid,
    };
  }

  // Database health check
  async databaseHealth() {
    const health = {
      mongodb: { status: 'disconnected', latency: null, details: {} },
      redis: { status: 'disconnected', latency: null, details: {} },
    };

    // MongoDB Health Check
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      const latency = Date.now() - startTime;

      health.mongodb = {
        status: 'connected',
        latency: latency,
        details: {
          readyState: mongoose.connection.readyState,
          readyStateText: this.getMongooseReadyState(mongoose.connection.readyState),
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          collections: Object.keys(mongoose.connection.collections).length,
        },
      };
    } catch (error) {
      health.mongodb = {
        status: 'error',
        latency: null,
        error: error.message,
        details: {
          readyState: mongoose.connection.readyState,
          readyStateText: this.getMongooseReadyState(mongoose.connection.readyState),
        },
      };
    }

    // Redis Health Check
    if (this.cacheManager && this.cacheManager.redis) {
      try {
        const startTime = Date.now();
        await this.cacheManager.redis.ping();
        const latency = Date.now() - startTime;

        const info = await this.cacheManager.redis.info();
        const redisInfo = this.parseRedisInfo(info);

        health.redis = {
          status: 'connected',
          latency: latency,
          details: {
            version: redisInfo.redis_version,
            uptime: redisInfo.uptime_in_seconds,
            memory_used: redisInfo.used_memory_human,
            connected_clients: redisInfo.connected_clients,
            total_commands_processed: redisInfo.total_commands_processed,
          },
        };
      } catch (error) {
        health.redis = {
          status: 'error',
          latency: null,
          error: error.message,
        };
      }
    } else {
      health.redis = {
        status: 'not_configured',
        latency: null,
        details: { message: 'Redis not configured or not available' },
      };
    }

    return health;
  }

  // System health check
  async systemHealth() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        rss: this.formatBytes(memoryUsage.rss),
        heapTotal: this.formatBytes(memoryUsage.heapTotal),
        heapUsed: this.formatBytes(memoryUsage.heapUsed),
        external: this.formatBytes(memoryUsage.external),
        arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers || 0),
        heapUsagePercentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      platform: {
        arch: process.arch,
        platform: process.platform,
        versions: process.versions,
      },
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
    };
  }

  // Application-specific health checks
  async applicationHealth() {
    const health = {
      services: {},
      features: {},
      dependencies: {},
    };

    // Check if core models are available
    try {
      const Standards = mongoose.model('Standards');
      const standardsCount = await Standards.countDocuments();
      health.services.standards = {
        status: 'healthy',
        count: standardsCount,
      };
    } catch (error) {
      health.services.standards = {
        status: 'error',
        error: error.message,
      };
    }

    try {
      const Assessment = mongoose.model('Assessment');
      const assessmentsCount = await Assessment.countDocuments();
      health.services.assessments = {
        status: 'healthy',
        count: assessmentsCount,
      };
    } catch (error) {
      health.services.assessments = {
        status: 'error',
        error: error.message,
      };
    }

    try {
      const Comparison = mongoose.model('Comparison');
      const comparisonsCount = await Comparison.countDocuments();
      health.services.comparisons = {
        status: 'healthy',
        count: comparisonsCount,
      };
    } catch (error) {
      health.services.comparisons = {
        status: 'error',
        error: error.message,
      };
    }

    // Check cache functionality
    if (this.cacheManager) {
      try {
        const testKey = 'health-check-test';
        const testValue = { test: true, timestamp: Date.now() };

        await this.cacheManager.set(testKey, testValue, 60);
        const retrieved = await this.cacheManager.get(testKey);
        await this.cacheManager.del(testKey);

        health.features.cache = {
          status: retrieved && retrieved.test ? 'healthy' : 'error',
          stats: this.cacheManager.getStats(),
        };
      } catch (error) {
        health.features.cache = {
          status: 'error',
          error: error.message,
        };
      }
    } else {
      health.features.cache = {
        status: 'disabled',
      };
    }

    // Check file system
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const uploadsDir = path.join(process.cwd(), 'uploads');
      const logsDir = path.join(process.cwd(), 'logs');

      const uploadsDirExists = await fs
        .access(uploadsDir)
        .then(() => true)
        .catch(() => false);
      const logsDirExists = await fs
        .access(logsDir)
        .then(() => true)
        .catch(() => false);

      health.features.fileSystem = {
        status: uploadsDirExists && logsDirExists ? 'healthy' : 'warning',
        details: {
          uploadsDirectory: uploadsDirExists ? 'exists' : 'missing',
          logsDirectory: logsDirExists ? 'exists' : 'missing',
        },
      };
    } catch (error) {
      health.features.fileSystem = {
        status: 'error',
        error: error.message,
      };
    }

    return health;
  }

  // Comprehensive health check
  async fullHealthCheck() {
    const startTime = Date.now();

    try {
      const [basic, database, system, application] = await Promise.all([
        this.basicHealth(),
        this.databaseHealth(),
        this.systemHealth(),
        this.applicationHealth(),
      ]);

      const checkDuration = Date.now() - startTime;
      const overallStatus = this.determineOverallStatus(database, application);

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        duration: `${checkDuration}ms`,
        basic,
        database,
        system,
        application,
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        duration: `${Date.now() - startTime}ms`,
      };
    }
  }

  // Liveness probe (simple check to see if service is running)
  livenessProbe() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  // Readiness probe (check if service is ready to handle requests)
  async readinessProbe() {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'not_ready',
          reason: 'Database not connected',
          timestamp: new Date().toISOString(),
        };
      }

      // Check if essential collections exist
      const collections = Object.keys(mongoose.connection.collections);
      const requiredCollections = ['standards', 'assessments', 'comparisons'];
      const missingCollections = requiredCollections.filter(col => !collections.includes(col));

      if (missingCollections.length > 0) {
        return {
          status: 'not_ready',
          reason: `Missing collections: ${missingCollections.join(', ')}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not_ready',
        reason: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper methods
  getMongooseReadyState(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[state] || 'unknown';
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};

    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = value;
        }
      }
    });

    return result;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  determineOverallStatus(database, application) {
    // Check critical components
    if (database.mongodb.status !== 'connected') {
      return 'unhealthy';
    }

    // Check application services
    const services = application.services;
    const criticalServices = ['standards', 'assessments', 'comparisons'];

    for (const service of criticalServices) {
      if (services[service] && services[service].status === 'error') {
        return 'degraded';
      }
    }

    return 'healthy';
  }
}

// Health check routes
const createHealthRoutes = (dbManager, cacheManager) => {
  const express = require('express');
  const router = express.Router();
  const healthService = new HealthCheckService(dbManager, cacheManager);

  // Basic health check
  router.get('/', async (req, res) => {
    try {
      const health = await healthService.basicHealth();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Comprehensive health check
  router.get('/full', async (req, res) => {
    try {
      const health = await healthService.fullHealthCheck();
      const statusCode =
        health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

      res.status(statusCode).json({
        success: health.status !== 'error',
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Database health check
  router.get('/database', async (req, res) => {
    try {
      const health = await healthService.databaseHealth();
      const isHealthy = health.mongodb.status === 'connected';

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // System health check
  router.get('/system', async (req, res) => {
    try {
      const health = await healthService.systemHealth();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Application health check
  router.get('/application', async (req, res) => {
    try {
      const health = await healthService.applicationHealth();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Kubernetes-style probes
  router.get('/live', (req, res) => {
    const health = healthService.livenessProbe();
    res.json({
      success: true,
      data: health,
    });
  });

  router.get('/ready', async (req, res) => {
    try {
      const health = await healthService.readinessProbe();
      const isReady = health.status === 'ready';

      res.status(isReady ? 200 : 503).json({
        success: isReady,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Ping endpoint
  router.get('/ping', (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'pong',
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
};

module.exports = {
  HealthCheckService,
  createHealthRoutes,
};
