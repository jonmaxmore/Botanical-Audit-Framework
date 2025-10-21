/**
 * Quick Test Verification Script
 * ทดสอบเบื้องต้นว่าระบบพร้อมรัน QA/QC Tests หรือไม่
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 GACP Platform - Test Environment Verification\n');
console.log('═'.repeat(70));

let allPassed = true;

// Test 1: Check required files
console.log('\n📁 Test 1: Checking required files...');
const requiredFiles = [
  'test/comprehensive-qa-test.js',
  'test/mock-api-server.js',
  'scripts/run-qa-tests.js',
  'start-qa-testing.ps1',
  'docs/QA_TESTING_GUIDE.md',
  'docs/QA_TESTING_SUMMARY_REPORT.md',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✓ ${file} (${stats.size.toLocaleString()} bytes)`);
  } else {
    console.log(`  ✗ ${file} - MISSING!`);
    allPassed = false;
  }
});

// Test 2: Check dependencies
console.log('\n📦 Test 2: Checking dependencies...');
const requiredDeps = ['axios', 'chalk', 'express', 'cors', 'body-parser', 'uuid'];

try {
  const packageJson = require('../package.json');
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  requiredDeps.forEach((dep) => {
    if (allDeps[dep]) {
      console.log(`  ✓ ${dep} (${allDeps[dep]})`);
    } else {
      console.log(`  ✗ ${dep} - NOT INSTALLED!`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('  ✗ Error reading package.json');
  allPassed = false;
}

// Test 3: Verify test files can be loaded
console.log('\n🔬 Test 3: Verifying test modules...');
try {
  const testModule = require('../test/comprehensive-qa-test.js');
  if (testModule.GACPQATester) {
    console.log('  ✓ comprehensive-qa-test.js - GACPQATester class found');
  } else {
    console.log('  ✗ comprehensive-qa-test.js - GACPQATester class not found');
    allPassed = false;
  }
} catch (error) {
  console.log(`  ✗ Error loading test module: ${error.message}`);
  allPassed = false;
}

// Test 4: Check if port 3000 is available
console.log('\n🌐 Test 4: Checking port availability...');
const net = require('net');
const server = net.createServer();

server.listen(3000, '127.0.0.1', () => {
  console.log('  ✓ Port 3000 is available');
  server.close();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('  ⚠️  Port 3000 is in use (will need to stop existing server)');
  } else {
    console.log(`  ✗ Port check error: ${err.message}`);
    allPassed = false;
  }
});

// Final result
setTimeout(() => {
  console.log('\n' + '═'.repeat(70));
  if (allPassed) {
    console.log('\n✅ All checks passed! Ready to run QA/QC tests.');
    console.log('\nTo start testing, run:');
    console.log('  PowerShell: .\\start-qa-testing.ps1');
    console.log('  OR Manual: node test/mock-api-server.js (Terminal 1)');
    console.log('             node test/comprehensive-qa-test.js (Terminal 2)');
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.');
    console.log('\nTo install dependencies:');
    console.log('  pnpm add -D axios chalk express cors body-parser -w');
  }
  console.log('\n' + '═'.repeat(70) + '\n');
}, 1000);
