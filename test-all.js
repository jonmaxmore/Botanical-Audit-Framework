const { spawn } = require('child_process');
const logger = require('./apps/backend/shared').logger;

/**
 * Comprehensive System Test
 * Tests database connections, backend, and frontend
 */

const appLogger = logger.createLogger('system-test');

function runTest(scriptPath, name) {
  return new Promise((resolve, reject) => {
    appLogger.info(`\n${'='.repeat(70)}`);
    appLogger.info(`Running: ${name}`);
    appLogger.info('='.repeat(70));

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', code => {
      if (code === 0) {
        appLogger.info(`✅ ${name} completed successfully\n`);
        resolve({ success: true, name });
      } else {
        appLogger.error(`❌ ${name} failed with code ${code}\n`);
        resolve({ success: false, name, code });
      }
    });

    child.on('error', error => {
      appLogger.error(`❌ ${name} error: ${error.message}\n`);
      reject({ success: false, name, error: error.message });
    });
  });
}

async function runAllTests() {
  appLogger.info('\n\n🚀 GACP Platform - Comprehensive System Test');
  appLogger.info('='.repeat(70));
  appLogger.info('Testing: Database → Backend → Frontend');
  appLogger.info('='.repeat(70));

  const startTime = Date.now();
  const results = [];

  // Test 1: Database Connections
  const dbTest = await runTest('test-connections.js', 'Database Connection Test');
  results.push(dbTest);

  // Test 2: Backend Server (only if database is OK)
  if (dbTest.success) {
    const backendTest = await runTest('test-backend.js', 'Backend Server Test');
    results.push(backendTest);
  } else {
    appLogger.warn('⚠️  Skipping backend test due to database connection failure');
    results.push({ success: false, name: 'Backend Server Test', skipped: true });
  }

  // Test 3: Frontend Server
  const frontendTest = await runTest('test-frontend.js', 'Frontend Application Test');
  results.push(frontendTest);

  // Final Summary
  const totalTime = Date.now() - startTime;

  appLogger.info('\n\n');
  appLogger.info('╔' + '═'.repeat(68) + '╗');
  appLogger.info('║' + ' '.repeat(20) + 'FINAL TEST SUMMARY' + ' '.repeat(30) + '║');
  appLogger.info('╠' + '═'.repeat(68) + '╣');

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  results.forEach((result, index) => {
    const num = `${index + 1}.`;
    const status = result.skipped ? '⏭️  SKIPPED' : result.success ? '✅ PASSED' : '❌ FAILED';
    const line = `║ ${num} ${result.name.padEnd(45)} ${status.padEnd(14)} ║`;
    appLogger.info(line);

    if (result.skipped) {
      skipCount++;
    } else if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  });

  appLogger.info('╠' + '═'.repeat(68) + '╣');
  appLogger.info(`║ Total Tests: ${results.length.toString().padEnd(55)} ║`);
  appLogger.info(`║ Passed: ${successCount.toString().padEnd(60)} ║`);
  appLogger.info(`║ Failed: ${failCount.toString().padEnd(60)} ║`);
  appLogger.info(`║ Skipped: ${skipCount.toString().padEnd(59)} ║`);
  appLogger.info(`║ Time: ${(totalTime / 1000).toFixed(2)}s ${' '.repeat(57)} ║`);
  appLogger.info('╚' + '═'.repeat(68) + '╝');

  // Exit status
  if (failCount > 0) {
    appLogger.info('\n❌ System test failed. Please check the logs above.');
    appLogger.info('\n💡 Quick troubleshooting:');
    appLogger.info('  1. Database: Check if MongoDB is running');
    appLogger.info('  2. Backend: Start with `cd apps/backend && node server.js`');
    appLogger.info('  3. Frontend: Start with `cd apps/frontend && pnpm dev`');
    process.exit(1);
  } else {
    appLogger.info('\n✅ All system tests passed successfully!');
    appLogger.info('\n🎉 Your GACP Platform is ready to use!');
    appLogger.info('\n📍 Access points:');
    appLogger.info('  • Frontend: http://localhost:3000');
    appLogger.info('  • Backend:  http://localhost:5001');
    appLogger.info('  • Health:   http://localhost:5001/health');
    process.exit(0);
  }
}

// Run all tests
runAllTests().catch(error => {
  appLogger.error('\n💥 Fatal error:', error);
  process.exit(1);
});
