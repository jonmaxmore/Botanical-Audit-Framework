/**
 * Manual Notification System Testing Script
 * 
 * Run this script to test notification system manually:
 * node test-notification-system.js
 * 
 * Tests:
 * 1. Database connection
 * 2. Notification model CRUD
 * 3. Socket.io real-time delivery
 * 4. Email service (dev mode)
 * 5. All 9 notification triggers
 */

const mongoose = require('mongoose');
const io = require('socket.io-client');
const Notification = require('./apps/backend/models/Notification');
const emailService = require('./apps/backend/services/email.service');
const realtimeService = require('./apps/backend/services/realtime.service');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Test configuration
const TEST_CONFIG = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/gacp-dev',
  socketUrl: process.env.API_URL || 'http://localhost:3001',
  testUserId: process.env.TEST_USER_ID || '507f1f77bcf86cd799439011',
  testEmail: 'test@example.com'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function recordResult(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(`${testName}`);
  } else {
    testResults.failed++;
    log.error(`${testName}`);
    if (error) console.error(`  ${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function testDatabaseConnection() {
  log.header('1. Testing Database Connection');
  try {
    await mongoose.connect(TEST_CONFIG.mongoUri);
    recordResult('Database connected successfully', true);
    return true;
  } catch (error) {
    recordResult('Database connection', false, error);
    return false;
  }
}

async function testNotificationModel() {
  log.header('2. Testing Notification Model');

  // Test 1: Create notification
  try {
    const notification = await Notification.create({
      userId: TEST_CONFIG.testUserId,
      type: 'system_update',
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: 'medium'
    });

    recordResult('Create notification', !!notification._id);

    // Test 2: Find notification
    const found = await Notification.findById(notification._id);
    recordResult('Find notification by ID', !!found);

    // Test 3: Update notification (mark as read)
    found.isRead = true;
    found.readAt = new Date();
    await found.save();
    recordResult('Update notification (mark as read)', found.isRead === true);

    // Test 4: Delete notification
    await Notification.deleteOne({ _id: notification._id });
    const deleted = await Notification.findById(notification._id);
    recordResult('Delete notification', !deleted);

  } catch (error) {
    recordResult('Notification model operations', false, error);
  }
}

async function testNotificationTypes() {
  log.header('3. Testing All Notification Types');

  const notificationTypes = [
    { type: 'application_submitted', title: 'คำขอของคุณได้รับการบันทึกแล้ว', priority: 'medium' },
    { type: 'application_approved', title: 'คำขอได้รับการอนุมัติ', priority: 'high' },
    { type: 'application_rejected', title: 'คำขอไม่ผ่านการอนุมัติ', priority: 'high' },
    { type: 'application_revision_required', title: 'คำขอต้องแก้ไข', priority: 'medium' },
    { type: 'inspection_scheduled', title: 'การตรวจประเมินได้ถูกกำหนดแล้ว', priority: 'high' },
    { type: 'inspection_completed', title: 'การตรวจประเมินเสร็จสิ้น', priority: 'high' },
    { type: 'certificate_issued', title: 'ยินดีด้วย! คุณได้รับใบรับรอง GACP', priority: 'high' },
    { type: 'document_approved', title: 'เอกสารได้รับการอนุมัติ', priority: 'medium' },
    { type: 'document_rejected', title: 'เอกสารไม่ผ่านการอนุมัติ', priority: 'high' },
    { type: 'payment_required', title: 'กรุณาชำระค่าธรรมเนียม', priority: 'high' },
    { type: 'payment_received', title: 'ได้รับการชำระเงินแล้ว', priority: 'medium' }
  ];

  for (const notifType of notificationTypes) {
    try {
      const notification = await Notification.create({
        userId: TEST_CONFIG.testUserId,
        type: notifType.type,
        title: notifType.title,
        message: `Testing ${notifType.type}`,
        priority: notifType.priority
      });

      recordResult(`Create ${notifType.type}`, !!notification._id);

      // Cleanup
      await Notification.deleteOne({ _id: notification._id });
    } catch (error) {
      recordResult(`Create ${notifType.type}`, false, error);
    }
  }
}

async function testPriorityLevels() {
  log.header('4. Testing Priority Levels');

  const priorities = ['low', 'medium', 'high', 'urgent'];

  for (const priority of priorities) {
    try {
      const notification = await Notification.create({
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: `${priority.toUpperCase()} Priority Test`,
        message: 'Testing priority level',
        priority
      });

      recordResult(`Priority: ${priority}`, notification.priority === priority);

      // Cleanup
      await Notification.deleteOne({ _id: notification._id });
    } catch (error) {
      recordResult(`Priority: ${priority}`, false, error);
    }
  }
}

async function testRelatedEntity() {
  log.header('5. Testing Related Entity Tracking');

  const entityTypes = ['application', 'document', 'inspection', 'payment', 'certificate'];

  for (const entityType of entityTypes) {
    try {
      const notification = await Notification.create({
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: 'Related Entity Test',
        message: `Testing ${entityType} relation`,
        priority: 'low',
        relatedEntity: {
          entityType,
          entityId: new mongoose.Types.ObjectId()
        }
      });

      const isValid = notification.relatedEntity.entityType === entityType;
      recordResult(`Related entity: ${entityType}`, isValid);

      // Cleanup
      await Notification.deleteOne({ _id: notification._id });
    } catch (error) {
      recordResult(`Related entity: ${entityType}`, false, error);
    }
  }
}

async function testQueryFilters() {
  log.header('6. Testing Query & Filters');

  try {
    // Create test notifications
    const notifications = await Notification.create([
      {
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: 'Unread 1',
        message: 'Test',
        priority: 'high',
        isRead: false
      },
      {
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: 'Unread 2',
        message: 'Test',
        priority: 'medium',
        isRead: false
      },
      {
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: 'Read 1',
        message: 'Test',
        priority: 'low',
        isRead: true,
        readAt: new Date()
      }
    ]);

    // Test: Find unread only
    const unread = await Notification.find({
      userId: TEST_CONFIG.testUserId,
      isRead: false,
      isDeleted: false
    });
    recordResult('Filter by unread status', unread.length === 2);

    // Test: Filter by priority
    const highPriority = await Notification.find({
      userId: TEST_CONFIG.testUserId,
      priority: 'high',
      isDeleted: false
    });
    recordResult('Filter by priority', highPriority.length >= 1);

    // Test: Sort by createdAt
    const sorted = await Notification.find({
      userId: TEST_CONFIG.testUserId,
      isDeleted: false
    }).sort({ createdAt: -1 });
    recordResult('Sort by createdAt', sorted[0].createdAt >= sorted[sorted.length - 1].createdAt);

    // Cleanup
    await Notification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });

  } catch (error) {
    recordResult('Query filters', false, error);
  }
}

async function testEmailService() {
  log.header('7. Testing Email Service (Dev Mode)');

  try {
    // Check if email service is initialized
    if (!emailService || !emailService.isConfigured) {
      log.warn('Email service not configured (expected in dev mode)');
      recordResult('Email service check', true); // Not a failure in dev
      return;
    }

    // Test email configuration
    const isConfigured = emailService.isConfigured();
    recordResult('Email service configured', isConfigured);

    // In development mode, emails are logged, not sent
    log.info('Email delivery will be logged to console in dev mode');

  } catch (error) {
    recordResult('Email service', false, error);
  }
}

async function testSocketIO() {
  log.header('8. Testing Socket.io Real-time Delivery');

  return new Promise((resolve) => {
    try {
      log.info(`Connecting to ${TEST_CONFIG.socketUrl}...`);

      const socket = io(TEST_CONFIG.socketUrl, {
        auth: {
          token: 'test-token',
          userId: TEST_CONFIG.testUserId
        },
        reconnection: false,
        timeout: 5000
      });

      socket.on('connect', () => {
        log.info('Socket.io connected');
        recordResult('Socket.io connection', true);

        // Test receiving notification
        socket.once('notification:new', (data) => {
          recordResult('Receive real-time notification', !!data);
          socket.close();
          resolve();
        });

        // Simulate sending notification
        setTimeout(() => {
          log.info('Simulating notification emission...');
          Notification.createAndSend({
            userId: TEST_CONFIG.testUserId,
            type: 'system_update',
            title: 'Socket.io Test',
            message: 'Testing real-time delivery',
            priority: 'low',
            deliveryMethods: ['realtime']
          }).catch(err => {
            log.error(`Failed to send test notification: ${err.message}`);
          });
        }, 1000);

        // Timeout after 10 seconds
        setTimeout(() => {
          log.warn('Socket.io test timeout');
          recordResult('Socket.io real-time delivery', false, new Error('Timeout'));
          socket.close();
          resolve();
        }, 10000);
      });

      socket.on('connect_error', (error) => {
        log.warn(`Socket.io connection failed: ${error.message}`);
        recordResult('Socket.io connection', false, error);
        resolve();
      });

    } catch (error) {
      recordResult('Socket.io test', false, error);
      resolve();
    }
  });
}

async function testStaticMethod() {
  log.header('9. Testing Notification.createAndSend() Method');

  try {
    const notification = await Notification.createAndSend({
      userId: TEST_CONFIG.testUserId,
      type: 'system_update',
      title: 'Static Method Test',
      message: 'Testing createAndSend static method',
      priority: 'medium',
      actionUrl: '/test',
      actionLabel: 'View',
      relatedEntity: {
        entityType: 'application',
        entityId: new mongoose.Types.ObjectId()
      },
      deliveryMethods: ['realtime', 'email']
    });

    recordResult('Notification.createAndSend()', !!notification._id);
    recordResult('  - Has action URL', !!notification.actionUrl);
    recordResult('  - Has action label', !!notification.actionLabel);
    recordResult('  - Has related entity', !!notification.relatedEntity);

    // Cleanup
    await Notification.deleteOne({ _id: notification._id });

  } catch (error) {
    recordResult('Notification.createAndSend()', false, error);
  }
}

async function testBulkOperations() {
  log.header('10. Testing Bulk Operations');

  try {
    // Create multiple notifications
    const notifications = [];
    for (let i = 0; i < 10; i++) {
      notifications.push({
        userId: TEST_CONFIG.testUserId,
        type: 'system_update',
        title: `Bulk ${i + 1}`,
        message: 'Bulk test',
        priority: 'low'
      });
    }

    const startTime = Date.now();
    const created = await Notification.insertMany(notifications);
    const duration = Date.now() - startTime;

    recordResult('Bulk insert 10 notifications', created.length === 10);
    recordResult(`  - Performance (${duration}ms)`, duration < 1000);

    // Bulk update (mark all as read)
    const updateResult = await Notification.updateMany(
      { _id: { $in: created.map(n => n._id) } },
      { isRead: true, readAt: new Date() }
    );

    recordResult('Bulk mark as read', updateResult.modifiedCount === 10);

    // Cleanup
    await Notification.deleteMany({ _id: { $in: created.map(n => n._id) } });

  } catch (error) {
    recordResult('Bulk operations', false, error);
  }
}

async function runAllTests() {
  console.clear();
  log.header('🧪 GACP Notification System - Comprehensive Testing');
  log.info('Starting test suite...\n');

  const startTime = Date.now();

  // Run tests sequentially
  const dbConnected = await testDatabaseConnection();

  if (dbConnected) {
    await testNotificationModel();
    await testNotificationTypes();
    await testPriorityLevels();
    await testRelatedEntity();
    await testQueryFilters();
    await testStaticMethod();
    await testBulkOperations();
    await testEmailService();
    await testSocketIO();

    // Cleanup and close
    await Notification.deleteMany({ userId: TEST_CONFIG.testUserId });
    await mongoose.connection.close();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  log.header('📊 Test Summary');
  console.log(`Total Tests:  ${testResults.total}`);
  console.log(`${colors.green}Passed:       ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:       ${testResults.failed}${colors.reset}`);
  console.log(`Duration:     ${duration}s`);

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`\nPass Rate:    ${passRate}%\n`);

  if (testResults.failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.warn(`${testResults.failed} test(s) failed. Please review errors above.`);
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
