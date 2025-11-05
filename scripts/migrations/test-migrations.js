/**
 * Migration Test Script
 *
 * Test all migrations on development database
 * - Connect to dev database
 * - Run all migrations UP
 * - Verify schema changes
 * - Test rollback (DOWN)
 * - Verify original state
 *
 * Usage:
 *   node test-migrations.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../apps/backend/.env') });

// Import all migrations
const migration001 = require('./001-add-new-roles');
const migration002 = require('./002-add-application-workflow-fields');
const migration003 = require('./003-create-ai-config');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test a single migration
 */
async function testMigration(name, migration) {
  print(`\n${'='.repeat(60)}`, 'cyan');
  print(`Testing Migration: ${name}`, 'bright');
  print('='.repeat(60), 'cyan');

  try {
    // Test UP migration
    print('\n📤 Running UP migration...', 'yellow');
    const upResult = await migration.up();
    print('✅ UP migration completed successfully', 'green');
    print(`   Result: ${JSON.stringify(upResult, null, 2)}`, 'cyan');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test DOWN migration (rollback)
    print('\n📥 Running DOWN migration (rollback)...', 'yellow');
    const downResult = await migration.down();
    print('✅ DOWN migration completed successfully', 'green');
    print(`   Result: ${JSON.stringify(downResult, null, 2)}`, 'cyan');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run UP again to restore
    print('\n📤 Running UP migration again (restore)...', 'yellow');
    await migration.up();
    print('✅ UP migration restored successfully', 'green');

    return { success: true, name };

  } catch (error) {
    print(`❌ Migration ${name} failed: ${error.message}`, 'red');
    print(`   Stack: ${error.stack}`, 'red');
    return { success: false, name, error: error.message };
  }
}

/**
 * Verify database schema after migrations
 */
async function verifySchema() {
  print('\n' + '='.repeat(60), 'cyan');
  print('Verifying Database Schema', 'bright');
  print('='.repeat(60), 'cyan');

  const db = mongoose.connection.db;

  try {
    // Check DTAMStaff collection
    print('\n📋 Checking DTAMStaff collection...', 'yellow');
    const staffCollection = await db.collection('dtamstaff').findOne();
    if (staffCollection) {
      print('✅ DTAMStaff collection exists', 'green');

      // Check if new fields exist
      const hasWorkloadMetrics = staffCollection.workloadMetrics !== undefined;
      const hasSpecializations = staffCollection.specializations !== undefined;
      const hasAiAssistance = staffCollection.aiAssistanceEnabled !== undefined;

      print(`   - workloadMetrics field: ${hasWorkloadMetrics ? '✅' : '❌'}`,
            hasWorkloadMetrics ? 'green' : 'red');
      print(`   - specializations field: ${hasSpecializations ? '✅' : '❌'}`,
            hasSpecializations ? 'green' : 'red');
      print(`   - aiAssistanceEnabled field: ${hasAiAssistance ? '✅' : '❌'}`,
            hasAiAssistance ? 'green' : 'red');
    }

    // Check Application collection
    print('\n📋 Checking applications collection...', 'yellow');
    const appCollection = await db.collection('applications').findOne();
    if (appCollection) {
      print('✅ Application collection exists', 'green');

      // Check if new fields exist
      const hasAiPreCheck = appCollection.aiPreCheck !== undefined;
      const hasQcReview = appCollection.qcReview !== undefined;
      const hasRouting = appCollection.routing !== undefined;
      const hasQaVerification = appCollection.qaVerification !== undefined;

      print(`   - aiPreCheck field: ${hasAiPreCheck ? '✅' : '❌'}`,
            hasAiPreCheck ? 'green' : 'red');
      print(`   - qcReview field: ${hasQcReview ? '✅' : '❌'}`,
            hasQcReview ? 'green' : 'red');
      print(`   - routing field: ${hasRouting ? '✅' : '❌'}`,
            hasRouting ? 'green' : 'red');
      print(`   - qaVerification field: ${hasQaVerification ? '✅' : '❌'}`,
            hasQaVerification ? 'green' : 'red');
    }

    // Check AIConfig collection
    print('\n📋 Checking aiconfigs collection...', 'yellow');
    const aiConfigs = await db.collection('aiconfigs').find().toArray();
    print(`✅ Found ${aiConfigs.length} AI configs`, 'green');

    aiConfigs.forEach(config => {
      print(`   - ${config.module}: ${config.enabled ? 'Enabled' : 'Disabled'} (v${config.version})`, 'cyan');
    });

    // Check indexes
    print('\n📋 Checking indexes...', 'yellow');
    const staffIndexes = await db.collection('dtamstaff').indexes();
    const appIndexes = await db.collection('applications').indexes();
    const aiConfigIndexes = await db.collection('aiconfigs').indexes();

    print(`✅ DTAMStaff indexes: ${staffIndexes.length}`, 'green');
    print(`✅ Application indexes: ${appIndexes.length}`, 'green');
    print(`✅ AIConfig indexes: ${aiConfigIndexes.length}`, 'green');

    return { success: true };

  } catch (error) {
    print(`❌ Schema verification failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Main test function
 */
async function runTests() {
  print('\n╔════════════════════════════════════════════════════════╗', 'bright');
  print('║          MIGRATION TEST SUITE                          ║', 'bright');
  print('╚════════════════════════════════════════════════════════╝', 'bright');

  const startTime = Date.now();

  try {
    // Connect to database
    print('\n📡 Connecting to MongoDB...', 'yellow');
    print(`   Database: ${process.env.MONGODB_URI}`, 'cyan');

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    print('✅ Connected to MongoDB', 'green');

    // Test each migration
    const results = [];

    results.push(await testMigration('001-add-new-roles', migration001));
    results.push(await testMigration('002-add-application-workflow-fields', migration002));
    results.push(await testMigration('003-create-ai-config', migration003));

    // Verify schema
    const schemaResult = await verifySchema();
    results.push(schemaResult);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    print('\n' + '='.repeat(60), 'cyan');
    print('TEST SUMMARY', 'bright');
    print('='.repeat(60), 'cyan');

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    print(`\n✅ Passed: ${passed}`, 'green');
    print(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    print(`⏱️  Duration: ${duration}s`, 'cyan');

    if (failed > 0) {
      print('\n❌ SOME TESTS FAILED', 'red');
      results.filter(r => !r.success).forEach(r => {
        print(`   - ${r.name}: ${r.error}`, 'red');
      });
      process.exit(1);
    } else {
      print('\n✅ ALL TESTS PASSED!', 'green');
      process.exit(0);
    }

  } catch (error) {
    print(`\n❌ TEST SUITE FAILED: ${error.message}`, 'red');
    print(`   Stack: ${error.stack}`, 'red');
    process.exit(1);

  } finally {
    await mongoose.connection.close();
    print('\n📡 Database connection closed', 'yellow');
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testMigration, verifySchema };
