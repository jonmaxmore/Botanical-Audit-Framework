#!/usr/bin/env node

/**
 * GACP Platform - Watch Mode Fix Script
 * Resolves exec-error and unknown 3 issues in watch mode
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 GACP Watch Mode Fix Script');
console.log('='.repeat(50));

// Configuration
const config = {
  backend: {
    cwd: path.join(__dirname, 'apps', 'backend'),
    command: '"C:\\Program Files\\nodejs\\node.exe"',
    args: ['atlas-server.js'],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PATH: process.env.PATH + ';C:\\Program Files\\nodejs'
    }
  },
  frontend: {
    cwd: path.join(__dirname, 'frontend-nextjs'),
    command: '"C:\\Program Files\\nodejs\\npm.cmd"',
    args: ['run', 'dev'],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PATH: process.env.PATH + ';C:\\Program Files\\nodejs'
    }
  }
};

// Process tracking
const processes = new Map();

// Cleanup function
function cleanup() {
  console.log('\n🛑 Shutting down all processes...');
  processes.forEach((proc, name) => {
    if (proc && !proc.killed) {
      console.log(`   Stopping ${name}...`);
      proc.kill('SIGTERM');
    }
  });
  process.exit(0);
}

// Start a process with proper error handling
function startProcess(name, { cwd, command, args, env }) {
  console.log(`🚀 Starting ${name}...`);
  console.log(`   CWD: ${cwd}`);
  console.log(`   Command: ${command} ${args.join(' ')}`);

  // Check if directory exists
  if (!fs.existsSync(cwd)) {
    console.error(`❌ Directory not found: ${cwd}`);
    return null;
  }

  const proc = spawn(command, args, {
    cwd,
    env,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    windowsVerbatimArguments: false
  });

  // Handle process output
  proc.stdout.on('data', data => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[${name}] ${output}`);
    }
  });

  proc.stderr.on('data', data => {
    const output = data.toString().trim();
    if (output && !output.includes('Warning:') && !output.includes('deprecated')) {
      console.error(`[${name}] ERROR: ${output}`);
    }
  });

  // Handle process events
  proc.on('error', err => {
    console.error(`❌ ${name} process error:`, err.message);
    if (err.code === 'ENOENT') {
      console.error(`   Command not found: ${command}`);
      console.error(`   Make sure Node.js is installed and in PATH`);
    }
  });

  proc.on('exit', (code, signal) => {
    console.log(`⚠️ ${name} exited with code ${code} (signal: ${signal})`);
    processes.delete(name);

    // Restart if unexpected exit
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      console.log(`🔄 Restarting ${name} in 3 seconds...`);
      setTimeout(() => {
        if (!processes.has(name)) {
          const newProc = startProcess(name, { cwd, command, args, env });
          if (newProc) {
            processes.set(name, newProc);
          }
        }
      }, 3000);
    }
  });

  return proc;
}

// Main execution
async function main() {
  console.log('📋 Starting GACP Platform in development mode...\n');

  // Start backend
  const backendProc = startProcess('Backend', config.backend);
  if (backendProc) {
    processes.set('Backend', backendProc);

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Start frontend
  const frontendProc = startProcess('Frontend', config.frontend);
  if (frontendProc) {
    processes.set('Frontend', frontendProc);
  }

  // Setup cleanup handlers
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  console.log('\n✅ All services started!');
  console.log('📋 Services running:');
  console.log('   - Backend: http://localhost:3004');
  console.log('   - Frontend: http://localhost:3000');
  console.log('\n💡 Press Ctrl+C to stop all services');

  // Keep the process alive
  setInterval(() => {
    const runningCount = processes.size;
    if (runningCount === 0) {
      console.log('⚠️ No processes running, exiting...');
      process.exit(1);
    }
  }, 5000);
}

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('💥 Uncaught Exception:', err.message);
  cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup();
});

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = { startProcess, cleanup, main };
