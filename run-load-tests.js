#!/usr/bin/env node

/**
 * Load Test Runner
 * Executes Artillery load tests and generates performance reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, 'load-tests');
const REPORTS_DIR = path.join(__dirname, 'load-tests', 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const tests = [
  {
    name: 'Authentication Load Test (Light - Dev)',
    file: 'auth-load-test-light.yml',
    description: 'Light load test for dev environment (2-10 RPS)',
    duration: '3 minutes',
    recommended: true,
  },
  {
    name: 'Authentication Load Test (Full)',
    file: 'auth-load-test.yml',
    description: 'Full authentication load test (100-200 RPS) - Use in staging/production',
    duration: '5 minutes',
    recommended: false,
  },
  {
    name: 'API Endpoints Load Test',
    file: 'api-load-test.yml',
    description: 'Tests main API endpoints with application usage patterns',
    duration: '6 minutes',
    recommended: false,
  },
  {
    name: 'Stress Test',
    file: 'stress-test.yml',
    description: 'Finds system breaking point by gradually increasing load',
    duration: '7 minutes',
    recommended: false,
  },
  {
    name: 'Spike Test',
    file: 'spike-test.yml',
    description: 'Tests sudden traffic surge (viral content scenario)',
    duration: '5 minutes',
    recommended: false,
  },
  {
    name: 'Soak Test',
    file: 'soak-test.yml',
    description: 'Tests system stability over 1 hour sustained load',
    duration: '64 minutes',
    recommended: false,
  },
];

function runTest(test) {
  console.log('\n' + '='.repeat(60));
  console.log(`Running: ${test.name}`);
  console.log(`Description: ${test.description}`);
  console.log(`Duration: ${test.duration}`);
  console.log('='.repeat(60) + '\n');

  const testFile = path.join(TESTS_DIR, test.file);
  const reportFile = path.join(
    REPORTS_DIR,
    `${test.file.replace('.yml', '')}-${Date.now()}.json`,
  );

  try {
    // Run Artillery test using pnpm exec
    const command = `pnpm exec artillery run "${testFile}" --output "${reportFile}"`;
    console.log(`Command: ${command}\n`);

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    // Generate HTML report
    const htmlReport = reportFile.replace('.json', '.html');
    const reportCommand = `pnpm exec artillery report "${reportFile}" --output "${htmlReport}"`;
    
    console.log(`\nGenerating HTML report...`);
    execSync(reportCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log(`\n✅ Test completed successfully!`);
    console.log(`📊 JSON Report: ${reportFile}`);
    console.log(`📈 HTML Report: ${htmlReport}`);
  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
    return false;
  }

  return true;
}

function showMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('GACP Load Testing Suite');
  console.log('='.repeat(60));
  console.log('\nAvailable tests:\n');

  tests.forEach((test, index) => {
    const marker = test.recommended ? '⭐' : '  ';
    console.log(`${marker} ${index + 1}. ${test.name} (${test.duration})`);
    console.log(`   ${test.description}`);
  });

  console.log('\n0. Run all recommended tests');
  console.log('q. Quit');
  console.log('\n' + '='.repeat(60));
}

function runAllRecommended() {
  console.log('\n🚀 Running all recommended tests...\n');

  const recommendedTests = tests.filter((t) => t.recommended);
  let passed = 0;
  let failed = 0;

  recommendedTests.forEach((test) => {
    const success = runTest(test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Reports: ${REPORTS_DIR}`);
  console.log('='.repeat(60) + '\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // Interactive mode
  showMenu();
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nSelect test to run (0-5, q): ', (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'q') {
      console.log('Exiting...');
      process.exit(0);
    }

    const choice = parseInt(answer);

    if (choice === 0) {
      runAllRecommended();
    } else if (choice >= 1 && choice <= tests.length) {
      runTest(tests[choice - 1]);
    } else {
      console.log('Invalid choice');
      process.exit(1);
    }
  });
} else {
  // Command-line mode
  const command = args[0];

  switch (command) {
    case 'all':
      runAllRecommended();
      break;

    case 'auth':
      runTest(tests[0]);
      break;

    case 'api':
      runTest(tests[1]);
      break;

    case 'stress':
      runTest(tests[2]);
      break;

    case 'spike':
      runTest(tests[3]);
      break;

    case 'soak':
      runTest(tests[4]);
      break;

    case 'list':
      showMenu();
      break;

    default:
      console.log('Usage: node run-load-tests.js [command]');
      console.log('\nCommands:');
      console.log('  all     - Run all recommended tests');
      console.log('  auth    - Run authentication load test');
      console.log('  api     - Run API endpoints load test');
      console.log('  stress  - Run stress test');
      console.log('  spike   - Run spike test');
      console.log('  soak    - Run soak test (1 hour)');
      console.log('  list    - Show available tests');
      console.log('\nOr run without arguments for interactive mode');
      process.exit(1);
  }
}
