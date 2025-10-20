#!/usr/bin/env node

/**
 * UAT Server Starter
 * Loads .env.uat and starts the backend server
 */

const path = require('path');
const { spawn } = require('child_process');

// Load UAT environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.uat') });

console.log('🚀 Starting UAT Server...\n');
console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   DTAM_JWT_SECRET: ${process.env.DTAM_JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log('\n');

// Start the server
const serverPath = path.join(__dirname, 'apps', 'backend', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env },
});

server.on('error', error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', code => {
  if (code !== 0) {
    console.error(`\n❌ Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping UAT server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Stopping UAT server...');
  server.kill('SIGTERM');
});
