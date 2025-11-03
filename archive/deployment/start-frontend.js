#!/usr/bin/env node
/**
 * Frontend Wrapper for PM2
 * Starts Next.js dev server with proper process management
 */

const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'apps', 'frontend');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('Starting Next.js development server...');
console.log('Directory:', frontendDir);

const child = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: false,
  detached: false,
  windowsHide: false,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    FORCE_COLOR: '1'
  }
});

child.on('error', error => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Next.js was killed with signal ${signal}`);
    process.exit(1);
  }
  console.log(`Next.js exited with code ${code}`);
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down Next.js...');
  child.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down Next.js...');
  child.kill('SIGTERM');
});
