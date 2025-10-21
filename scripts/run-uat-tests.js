#!/usr/bin/env node

/**
 * UAT Test Runner - User Acceptance Testing
 *
 * Runs UAT test suite for GACP Platform
 *
 * Usage:
 *   node scripts/run-uat-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Path to UAT test suite
const uatTestPath = path.join(__dirname, '../test/uat-test-suite.js');

console.log('🎯 Starting User Acceptance Testing (UAT)...\n');
console.log('📁 Test File:', uatTestPath);
console.log('─'.repeat(60));
console.log('');

// Run UAT tests
const testProcess = spawn('node', [uatTestPath], {
  stdio: 'inherit',
  shell: true,
});

testProcess.on('error', error => {
  console.error('❌ Error running UAT tests:', error);
  process.exit(1);
});

testProcess.on('exit', code => {
  console.log('');
  console.log('─'.repeat(60));

  if (code === 0) {
    console.log('✅ UAT completed successfully!');
  } else {
    console.log('❌ UAT failed with exit code:', code);
  }

  process.exit(code);
});
