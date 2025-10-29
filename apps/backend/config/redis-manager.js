/**
 * Redis Connection Manager
 *
 * Provides distributed caching, session management,
 * and pub/sub capabilities for horizontal scaling.
 */
const Redis = require('ioredis');
const { _promisify } = require('util');
const configManager = require('./config-manager');
const logger = require('../shared/logger');
const redisLogger = logger.createLogger('redis');

// Get Redis configuration
const config = configManager.getConfig().redis;
let redisClient;
let isConnected = false;
let reconnectTimer = null;
let pubSub = null;

// Initialize Redis connection
async function connect() {
  if (!config.enabled) {
    redisLogger.info('Redis is disabled in configuration. Using in-memory fallback.');
    return setupInMemoryFallback();
  }

  if (isConnected) {
    return redisClient;
  }

  redisLogger.info(`Connecting to Redis at ${config.host}:${config.port}`);

  try {
    const options = {
      host: config.host,
      port: config.port,
      password: config.password || undefined,
      retryStrategy: times => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    };

    redisClient = new Redis(options);

    // Set up event handlers
    redisClient.on('connect', () => {
      isConnected = true;
      redisLogger.info('Connected to Redis server');
    });

    redisClient.on('error', err => {
      redisLogger.error(`Redis error: ${err.message}`);
    });

    redisClient.on('close', () => {
      isConnected = false;
      redisLogger.warn('Connection to Redis closed');
    });

    redisClient.on('reconnecting', () => {
      redisLogger.info('Reconnecting to Redis...');
    });

    // Create pub/sub client for messaging
    pubSub = {
      publisher: new Redis(options),
      subscriber: new Redis(options)
    };

    pubSub.subscriber.on('message', (channel, message) => {
      redisLogger.debug(`Received message from ${channel}`);
      messageHandlers.forEach(handler => {
        if (handler.channel === channel || handler.channel === '*') {
          handler.callback(channel, message);
        }
      });
    });

    // Initialize with a ping to verify connection
    await redisClient.ping();
    isConnected = true;

    return redisClient;
  } catch (error) {
    isConnected = false;
    redisLogger.error(`Failed to connect to Redis: ${error.message}`);
    scheduleReconnect();
    throw error;
  }
}

// Schedule reconnection
function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  reconnectTimer = setTimeout(async () => {
    redisLogger.info('Attempting to reconnect to Redis...');
    try {
      await connect();
    } catch (error) {
      redisLogger.error(`Redis reconnection failed: ${error.message}`);
    }
  }, 5000);
}

// Disconnect from Redis
async function disconnect() {
  if (!redisClient || !isConnected) {
    return true;
  }

  try {
    await redisClient.quit();
    if (pubSub) {
      await pubSub.publisher.quit();
      await pubSub.subscriber.quit();
    }
    isConnected = false;
    redisLogger.info('Disconnected from Redis');
    return true;
  } catch (error) {
    redisLogger.error(`Error disconnecting from Redis: ${error.message}`);
    return false;
  }
}

// Cache methods
const cache = {
  async get(key) {
    try {
      if (!isConnected) return null;
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      redisLogger.error(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds) {
    try {
      if (!isConnected) return false;
      const ttl = ttlSeconds || config.ttl || 86400; // Default 24 hours
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, 'EX', ttl);
      return true;
    } catch (error) {
      redisLogger.error(`Cache set error for key ${key}: ${error.message}`);
      return false;
    }
  },

  async delete(key) {
    try {
      if (!isConnected) return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      redisLogger.error(`Cache delete error for key ${key}: ${error.message}`);
      return false;
    }
  },

  async flush() {
    try {
      if (!isConnected) return false;
      await redisClient.flushdb();
      return true;
    } catch (error) {
      redisLogger.error(`Cache flush error: ${error.message}`);
      return false;
    }
  }
};

// Message handlers
const messageHandlers = [];

// Messaging methods
const messaging = {
  subscribe(channel, callback) {
    if (!isConnected || !pubSub) {
      redisLogger.warn(`Cannot subscribe to ${channel} - Redis not connected`);
      return false;
    }

    pubSub.subscriber.subscribe(channel);
    messageHandlers.push({ channel, callback });
    redisLogger.debug(`Subscribed to channel ${channel}`);
    return true;
  },

  unsubscribe(channel, callback) {
    if (!isConnected || !pubSub) return false;

    pubSub.subscriber.unsubscribe(channel);

    const index = messageHandlers.findIndex(
      h => h.channel === channel && (!callback || h.callback === callback)
    );

    if (index !== -1) {
      messageHandlers.splice(index, 1);
    }

    return true;
  },

  publish(channel, message) {
    if (!isConnected || !pubSub) {
      redisLogger.warn(`Cannot publish to ${channel} - Redis not connected`);
      return false;
    }

    const serialized = typeof message === 'string' ? message : JSON.stringify(message);

    pubSub.publisher.publish(channel, serialized);
    return true;
  }
};

// In-memory fallback for when Redis is disabled
let inMemoryCache = {};
function setupInMemoryFallback() {
  redisLogger.info('Setting up in-memory cache fallback');

  // Simple in-memory implementation
  cache.get = async key => inMemoryCache[key] || null;
  cache.set = async (key, value) => {
    inMemoryCache[key] = value;
    return true;
  };
  cache.delete = async key => {
    delete inMemoryCache[key];
    return true;
  };
  cache.flush = async () => {
    inMemoryCache = {};
    return true;
  };

  // No-op messaging for in-memory mode
  messaging.subscribe = () => false;
  messaging.unsubscribe = () => false;
  messaging.publish = () => false;

  isConnected = true;
  return true;
}

// Get connection status
function getStatus() {
  if (!config.enabled) {
    return 'disabled';
  }
  return isConnected ? 'connected' : 'disconnected';
}

// Health check
async function healthCheck() {
  if (!config.enabled) {
    return {
      status: 'disabled',
      message: 'Redis is disabled in configuration'
    };
  }

  if (!isConnected) {
    return {
      status: 'unhealthy',
      message: 'Not connected to Redis'
    };
  }

  try {
    // Perform a simple ping
    const startTime = Date.now();
    await redisClient.ping();
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      message: 'Connected to Redis',
      details: {
        latency: `${latency}ms`,
        host: config.host,
        port: config.port
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Redis health check failed: ${error.message}`
    };
  }
}

module.exports = {
  connect,
  disconnect,
  getStatus,
  healthCheck,
  cache,
  messaging,
  getClient: () => redisClient
};
