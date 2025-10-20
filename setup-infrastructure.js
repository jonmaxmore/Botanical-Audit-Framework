#!/usr/bin/env node

/**
 * GACP Platform - Automated Infrastructure Setup
 *
 * This script automates the infrastructure setup process including:
 * 1. MongoDB Atlas cluster verification
 * 2. Database initialization with collections and indexes
 * 3. Upstash Redis connection verification
 * 4. Environment variable validation
 * 5. Security configuration checks
 * 6. Performance optimization verification
 *
 * Usage:
 *   node setup-infrastructure.js
 *
 * Prerequisites:
 *   - MongoDB Atlas account with M10 cluster created
 *   - Upstash Redis instance created
 *   - .env file configured with connection strings
 *
 * Version: 2.0.0
 * Date: October 15, 2025
 */

const { MongoClient } = require('mongodb');
const { createClient } = require('redis');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: msg => console.log(`\n${colors.cyan}${colors.bright}━━━ ${msg} ━━━${colors.reset}\n`),
};

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'gacp_platform',
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 50,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 10,
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 60000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  redis: {
    url: process.env.UPSTASH_REDIS_URL,
  },
};

// Database schema definitions
const collections = [
  {
    name: 'users',
    indexes: [
      { key: { email: 1 }, options: { unique: true, sparse: true } },
      { key: { phone: 1 }, options: { unique: true, sparse: true } },
      { key: { role: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } },
      { key: { email: 1, role: 1 } },
      { key: { 'profile.firstName': 'text', 'profile.lastName': 'text' } },
    ],
    validation: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'role', 'isActive'],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          },
          phone: { bsonType: 'string', pattern: '^\\+?[0-9]{10,15}$' },
          password: { bsonType: 'string', minLength: 60, maxLength: 60 },
          role: { enum: ['admin', 'farmer', 'inspector', 'auditor', 'certifier'] },
          isActive: { bsonType: 'bool' },
          profile: {
            bsonType: 'object',
            properties: {
              firstName: { bsonType: 'string' },
              lastName: { bsonType: 'string' },
            },
          },
          twoFactorEnabled: { bsonType: 'bool' },
          twoFactorSecret: { bsonType: 'string' },
        },
      },
    },
  },
  {
    name: 'farms',
    indexes: [
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { 'location.coordinates': '2dsphere' } },
      { key: { certificationStatus: 1 } },
      { key: { createdAt: -1 } },
      { key: { farmerId: 1, status: 1 } },
    ],
  },
  {
    name: 'applications',
    indexes: [
      { key: { farmId: 1 } },
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { applicationNumber: 1 }, options: { unique: true } },
      { key: { createdAt: -1 } },
      { key: { farmerId: 1, status: 1 } },
      { key: { status: 1, createdAt: -1 } },
    ],
  },
  {
    name: 'inspections',
    indexes: [
      { key: { applicationId: 1 } },
      { key: { inspectorId: 1 } },
      { key: { status: 1 } },
      { key: { scheduledDate: 1 } },
      { key: { createdAt: -1 } },
      { key: { inspectorId: 1, status: 1 } },
      { key: { status: 1, scheduledDate: 1 } },
    ],
  },
  {
    name: 'audits',
    indexes: [
      { key: { inspectionId: 1 } },
      { key: { auditorId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { auditorId: 1, status: 1 } },
    ],
  },
  {
    name: 'certificates',
    indexes: [
      { key: { applicationId: 1 } },
      { key: { farmId: 1 } },
      { key: { certificateNumber: 1 }, options: { unique: true } },
      { key: { status: 1 } },
      { key: { expiryDate: 1 } },
      { key: { createdAt: -1 } },
      { key: { farmId: 1, status: 1 } },
    ],
  },
  {
    name: 'documents',
    indexes: [
      { key: { entityType: 1, entityId: 1 } },
      { key: { uploadedBy: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'notifications',
    indexes: [
      { key: { userId: 1 } },
      { key: { isRead: 1 } },
      { key: { createdAt: -1 } },
      { key: { userId: 1, isRead: 1, createdAt: -1 } },
      { key: { createdAt: 1 }, options: { expireAfterSeconds: 7776000 } }, // 90 days TTL
    ],
  },
  {
    name: 'activity_logs',
    indexes: [
      { key: { userId: 1 } },
      { key: { action: 1 } },
      { key: { entityType: 1, entityId: 1 } },
      { key: { createdAt: -1 } },
      { key: { createdAt: 1 }, options: { expireAfterSeconds: 15552000 } }, // 180 days TTL
    ],
  },
  {
    name: 'sessions',
    indexes: [
      { key: { userId: 1 } },
      { key: { token: 1 }, options: { unique: true } },
      { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }, // Auto-delete expired sessions
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'otp_codes',
    indexes: [
      { key: { identifier: 1, type: 1 } },
      { key: { code: 1 } },
      { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }, // Auto-delete expired OTPs
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'settings',
    indexes: [{ key: { key: 1 }, options: { unique: true } }, { key: { category: 1 } }],
  },
];

// Main setup function
async function setupInfrastructure() {
  log.section('GACP Platform - Infrastructure Setup');
  log.info('Starting automated infrastructure setup...');
  log.info(`Timestamp: ${new Date().toISOString()}`);

  const results = {
    envValidation: false,
    mongoConnection: false,
    databaseCreation: false,
    collectionsCreated: 0,
    indexesCreated: 0,
    redisConnection: false,
    adminUserCreated: false,
    errors: [],
  };

  try {
    // Step 1: Validate environment variables
    log.section('Step 1: Environment Variable Validation');
    results.envValidation = await validateEnvironment();

    // Step 2: Connect to MongoDB
    log.section('Step 2: MongoDB Atlas Connection');
    const mongoClient = await connectMongoDB();
    results.mongoConnection = true;

    // Step 3: Setup database and collections
    log.section('Step 3: Database Setup');
    const db = mongoClient.db(config.mongodb.dbName);
    const { collectionsCount, indexesCount } = await setupDatabase(db);
    results.databaseCreation = true;
    results.collectionsCreated = collectionsCount;
    results.indexesCreated = indexesCount;

    // Step 4: Create admin user
    log.section('Step 4: Admin User Creation');
    results.adminUserCreated = await createAdminUser(db);

    // Step 5: Connect to Redis
    log.section('Step 5: Upstash Redis Connection');
    const redisClient = await connectRedis();
    results.redisConnection = true;

    // Cleanup connections
    await mongoClient.close();
    await redisClient.quit();

    // Step 6: Generate summary report
    log.section('Setup Complete!');
    displaySummary(results);

    return results;
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    results.errors.push(error.message);
    displaySummary(results);
    process.exit(1);
  }
}

// Validate environment variables
async function validateEnvironment() {
  log.info('Checking required environment variables...');

  const required = [
    'MONGODB_URI',
    'MONGODB_DB_NAME',
    'UPSTASH_REDIS_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
  ];

  const optional = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'EMAIL_FROM',
  ];

  let allValid = true;

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      log.error(`Missing required variable: ${varName}`);
      allValid = false;
    } else {
      log.success(`${varName}: ✓ Set`);
    }
  }

  // Check optional variables
  log.info('\nOptional variables (for Sprint 2+):');
  for (const varName of optional) {
    if (process.env[varName]) {
      log.success(`${varName}: ✓ Set`);
    } else {
      log.warning(`${varName}: Not set (optional)`);
    }
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI) {
    if (
      !process.env.MONGODB_URI.startsWith('mongodb+srv://') &&
      !process.env.MONGODB_URI.startsWith('mongodb://')
    ) {
      log.error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
      allValid = false;
    } else if (process.env.MONGODB_URI.includes('<') || process.env.MONGODB_URI.includes('>')) {
      log.error('MONGODB_URI contains placeholders (< >). Replace with actual values.');
      allValid = false;
    }
  }

  // Validate Redis URL format
  if (process.env.UPSTASH_REDIS_URL) {
    if (
      !process.env.UPSTASH_REDIS_URL.startsWith('redis://') &&
      !process.env.UPSTASH_REDIS_URL.startsWith('rediss://')
    ) {
      log.error('UPSTASH_REDIS_URL must start with redis:// or rediss://');
      allValid = false;
    }
  }

  // Validate JWT secrets strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log.warning('JWT_SECRET should be at least 32 characters for security');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    log.warning('JWT_REFRESH_SECRET should be at least 32 characters for security');
  }

  if (!allValid) {
    throw new Error('Environment validation failed. Please check your .env file.');
  }

  log.success('All required environment variables are valid!');
  return true;
}

// Connect to MongoDB
async function connectMongoDB() {
  log.info('Connecting to MongoDB Atlas...');
  log.info(`Connection URI: ${config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);

  const client = new MongoClient(config.mongodb.uri, config.mongodb.options);

  try {
    await client.connect();

    // Test connection
    await client.db('admin').command({ ping: 1 });

    log.success('Connected to MongoDB Atlas successfully!');

    // Display connection info
    const admin = client.db('admin').admin();
    const serverInfo = await admin.serverInfo();

    log.info(`MongoDB Version: ${serverInfo.version}`);
    log.info(`Database Name: ${config.mongodb.dbName}`);
    log.info(
      `Connection Pool: ${config.mongodb.options.minPoolSize}-${config.mongodb.options.maxPoolSize} connections`
    );

    return client;
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

// Setup database with collections and indexes
async function setupDatabase(db) {
  log.info(`Setting up database: ${db.databaseName}`);

  let collectionsCount = 0;
  let indexesCount = 0;

  for (const collectionDef of collections) {
    try {
      // Check if collection exists
      const existingCollections = await db.listCollections({ name: collectionDef.name }).toArray();

      if (existingCollections.length === 0) {
        // Create collection with validation
        if (collectionDef.validation) {
          await db.createCollection(collectionDef.name, {
            validator: collectionDef.validation,
          });
          log.success(`Created collection: ${collectionDef.name} (with validation)`);
        } else {
          await db.createCollection(collectionDef.name);
          log.success(`Created collection: ${collectionDef.name}`);
        }
        collectionsCount++;
      } else {
        log.info(`Collection ${collectionDef.name} already exists`);
      }

      // Create indexes
      if (collectionDef.indexes && collectionDef.indexes.length > 0) {
        const collection = db.collection(collectionDef.name);

        for (const indexDef of collectionDef.indexes) {
          try {
            const indexName = await collection.createIndex(indexDef.key, indexDef.options || {});
            log.success(`  ↳ Index created: ${indexName}`);
            indexesCount++;
          } catch (error) {
            if (error.code === 85 || error.code === 86) {
              // Index already exists
              log.info(`  ↳ Index already exists: ${JSON.stringify(indexDef.key)}`);
            } else {
              log.warning(`  ↳ Index creation failed: ${error.message}`);
            }
          }
        }
      }
    } catch (error) {
      log.error(`Failed to setup collection ${collectionDef.name}: ${error.message}`);
    }
  }

  log.success(
    `Database setup complete: ${collectionsCount} collections created, ${indexesCount} indexes created`
  );

  return { collectionsCount, indexesCount };
}

// Create admin user
async function createAdminUser(db) {
  log.info('Creating default admin user...');

  const usersCollection = db.collection('users');

  // Check if admin already exists
  const existingAdmin = await usersCollection.findOne({ email: 'admin@gacp.go.th' });

  if (existingAdmin) {
    log.info('Admin user already exists');
    return false;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@GACP2025', 12);

  const adminUser = {
    email: 'admin@gacp.go.th',
    phone: '+66800000000',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: false,
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      title: 'Admin',
    },
    permissions: ['*'], // All permissions
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  await usersCollection.insertOne(adminUser);

  log.success('Admin user created successfully!');
  log.info('  Email: admin@gacp.go.th');
  log.info('  Password: Admin@GACP2025');
  log.warning('  ⚠️  Please change this password after first login!');

  return true;
}

// Connect to Redis
async function connectRedis() {
  log.info('Connecting to Upstash Redis...');
  log.info(`Redis URL: ${config.redis.url.replace(/\/\/.*@/, '//***@')}`);

  const client = createClient({
    url: config.redis.url,
    socket: {
      reconnectStrategy: retries => {
        if (retries > 3) {
          return new Error('Redis connection failed after 3 retries');
        }
        return retries * 500;
      },
    },
  });

  client.on('error', err => {
    log.error(`Redis error: ${err.message}`);
  });

  try {
    await client.connect();

    // Test Redis with PING
    const pong = await client.ping();

    if (pong === 'PONG') {
      log.success('Connected to Upstash Redis successfully!');

      // Test SET and GET
      await client.set('gacp:setup:test', 'success', { EX: 60 });
      const value = await client.get('gacp:setup:test');

      if (value === 'success') {
        log.success('Redis read/write test passed!');
      }

      // Get Redis info
      const info = await client.info('server');
      const version = info.match(/redis_version:([0-9.]+)/)?.[1];

      if (version) {
        log.info(`Redis Version: ${version}`);
      }

      return client;
    } else {
      throw new Error('Redis PING failed');
    }
  } catch (error) {
    log.error(`Redis connection failed: ${error.message}`);
    throw error;
  }
}

// Display setup summary
function displaySummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log(
    `${colors.bright}${colors.cyan}GACP Platform - Infrastructure Setup Summary${colors.reset}`
  );
  console.log('='.repeat(60) + '\n');

  const statusIcon = value =>
    value ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;

  console.log(`${statusIcon(results.envValidation)} Environment Validation`);
  console.log(`${statusIcon(results.mongoConnection)} MongoDB Connection`);
  console.log(`${statusIcon(results.databaseCreation)} Database Creation`);
  console.log(`  ↳ Collections Created: ${results.collectionsCreated}`);
  console.log(`  ↳ Indexes Created: ${results.indexesCreated}`);
  console.log(`${statusIcon(results.adminUserCreated)} Admin User Created`);
  console.log(`${statusIcon(results.redisConnection)} Redis Connection`);

  if (results.errors.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\n' + '='.repeat(60));

  const allSuccess =
    results.envValidation &&
    results.mongoConnection &&
    results.databaseCreation &&
    results.redisConnection;

  if (allSuccess) {
    console.log(
      `${colors.green}${colors.bright}✓ Infrastructure setup completed successfully!${colors.reset}`
    );
    console.log('\nNext steps:');
    console.log('1. Start backend server: cd apps/backend && pnpm dev');
    console.log('2. Start frontend portals: cd apps/[portal] && pnpm dev');
    console.log('3. Login with admin credentials: admin@gacp.go.th / Admin@GACP2025');
    console.log('4. Change admin password immediately!');
  } else {
    console.log(`${colors.red}${colors.bright}✗ Infrastructure setup incomplete!${colors.reset}`);
    console.log('\nPlease check the errors above and:');
    console.log('1. Fix .env configuration');
    console.log('2. Verify MongoDB Atlas cluster is running');
    console.log('3. Verify Upstash Redis instance is active');
    console.log('4. Re-run this script');
  }

  console.log('='.repeat(60) + '\n');
}

// Run setup
if (require.main === module) {
  setupInfrastructure()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      log.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { setupInfrastructure };
