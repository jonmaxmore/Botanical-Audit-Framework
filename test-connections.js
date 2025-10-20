const mongoose = require('mongoose');
const logger = require('./apps/backend/shared').logger;

/**
 * Test MongoDB Connection and Health Check
 * Tests all connection configurations and verifies database connectivity
 */

const appLogger = logger.createLogger('connection-test');

// Test configurations
const testConfigs = [
  {
    name: 'Local MongoDB',
    uri: process.env.MONGODB_URI_SIMPLE || 'mongodb://localhost:27017/gacp_platform',
    timeout: 3000,
  },
  {
    name: 'Atlas MongoDB',
    uri: process.env.MONGODB_URI,
    timeout: 10000,
  },
];

async function testConnection(config) {
  appLogger.info(`\n${'='.repeat(60)}`);
  appLogger.info(`Testing: ${config.name}`);
  appLogger.info(`${'='.repeat(60)}`);

  if (!config.uri) {
    appLogger.warn('⚠️  URI not configured - skipping');
    return { success: false, skipped: true };
  }

  const maskedUri = config.uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  appLogger.info(`URI: ${maskedUri}`);

  try {
    const startTime = Date.now();

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: config.timeout,
      socketTimeoutMS: 45000,
      connectTimeoutMS: config.timeout,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    // Attempt connection
    await mongoose.connect(config.uri, options);

    const connectionTime = Date.now() - startTime;
    const db = mongoose.connection.db;

    appLogger.info(`✅ Connected successfully in ${connectionTime}ms`);
    appLogger.info(`Database: ${db.databaseName}`);

    // Test database operations
    const stats = await db.stats();
    appLogger.info('\n📊 Database Statistics:');
    appLogger.info(`  Collections: ${stats.collections}`);
    appLogger.info(`  Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    appLogger.info(`  Indexes: ${stats.indexes}`);

    // List collections
    const collections = await db.listCollections().toArray();
    appLogger.info(`\n📁 Collections (${collections.length}):`);
    collections.slice(0, 10).forEach(col => {
      appLogger.info(`  - ${col.name}`);
    });
    if (collections.length > 10) {
      appLogger.info(`  ... and ${collections.length - 10} more`);
    }

    // Test write operation
    appLogger.info('\n📝 Testing write operation...');
    const testCollection = db.collection('_health_check');
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      source: 'connection-test',
    });
    appLogger.info('✅ Write test successful');

    // Cleanup
    await testCollection.deleteMany({ test: true });
    appLogger.info('✅ Cleanup successful');

    // Disconnect
    await mongoose.disconnect();
    appLogger.info('✅ Disconnected');

    return {
      success: true,
      connectionTime,
      stats: {
        collections: stats.collections,
        size: (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
        indexes: stats.indexes,
      },
    };
  } catch (error) {
    appLogger.error(`❌ Connection failed: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      appLogger.info('💡 Tip: Make sure MongoDB is running');
    } else if (error.message.includes('Authentication failed')) {
      appLogger.info('💡 Tip: Check your username and password');
    } else if (error.message.includes('timed out')) {
      appLogger.info('💡 Tip: Check your network connection and firewall');
    }

    // Ensure disconnection
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  appLogger.info('\n🔧 MongoDB Connection Test Suite');
  appLogger.info('='.repeat(60));

  const results = [];

  for (const config of testConfigs) {
    const result = await testConnection(config);
    results.push({
      name: config.name,
      ...result,
    });

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  appLogger.info('\n\n📊 Test Summary');
  appLogger.info('='.repeat(60));

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  results.forEach(result => {
    if (result.skipped) {
      appLogger.info(`⏭️  ${result.name}: Skipped (not configured)`);
      skipCount++;
    } else if (result.success) {
      appLogger.info(`✅ ${result.name}: Success (${result.connectionTime}ms)`);
      successCount++;
    } else {
      appLogger.info(`❌ ${result.name}: Failed - ${result.error}`);
      failCount++;
    }
  });

  appLogger.info('\n' + '='.repeat(60));
  appLogger.info(
    `Total: ${results.length} | Success: ${successCount} | Failed: ${failCount} | Skipped: ${skipCount}`,
  );
  appLogger.info('='.repeat(60) + '\n');

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  appLogger.error('Fatal error:', error);
  process.exit(1);
});
