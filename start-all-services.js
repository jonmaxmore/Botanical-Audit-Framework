/**
 * Start All Services
 * Starts MongoDB, Backend, and Frontend with auto-restart
 */

const { spawn } = require('child_process');
const http = require('http');

const services = [];

function log(service, message, level = 'info') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`[${timestamp}] ${emoji} [${service}] ${message}`);
}

function checkPort(port) {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        method: 'GET',
        path: '/health',
        timeout: 3000,
      },
      res => {
        resolve(res.statusCode === 200);
      },
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function waitForService(name, port, maxAttempts = 30) {
  log(name, `Waiting for service on port ${port}...`);

  for (let i = 0; i < maxAttempts; i++) {
    const isReady = await checkPort(port);

    if (isReady) {
      log(name, `✅ Service is ready on port ${port}`);
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  log(name, `Failed to connect after ${maxAttempts} attempts`, 'error');
  return false;
}

function startService(config) {
  log(config.name, 'Starting...');

  const child = spawn(
    'node',
    [
      'robust-server.js',
      '--script',
      config.script,
      '--cwd',
      config.cwd,
      '--port',
      config.port,
      '--name',
      config.name,
    ],
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    },
  );

  services.push({
    name: config.name,
    process: child,
    port: config.port,
  });

  child.on('error', error => {
    log(config.name, `Error: ${error.message}`, 'error');
  });

  return child;
}

async function startAll() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Starting GACP Platform Services');
  console.log('='.repeat(70) + '\n');

  // Start Backend
  log('Backend', 'Starting backend server...');
  startService({
    name: 'Backend',
    script: 'server.js',
    cwd: 'apps/backend',
    port: 5001,
  });

  // Wait for backend
  const backendReady = await waitForService('Backend', 5001, 60);

  if (!backendReady) {
    log('Backend', 'Failed to start backend server', 'error');
    log('System', '💡 Check apps/backend/server.js for errors', 'warn');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ All Services Started Successfully!');
  console.log('='.repeat(70));
  console.log('\n📍 Access Points:');
  console.log('  • Backend API:  http://localhost:5001');
  console.log('  • Health Check: http://localhost:5001/health');
  console.log('  • API Docs:     http://localhost:5001/api-docs');
  console.log('\n💡 Press Ctrl+C to stop all services\n');
}

// Graceful shutdown
let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`Received ${signal} - Shutting down gracefully...`);
  console.log('='.repeat(70) + '\n');

  services.forEach(service => {
    log(service.name, 'Stopping...');
    try {
      service.process.kill('SIGTERM');
    } catch (e) {
      // Ignore
    }
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('\n⚠️  Forcing shutdown...\n');
    process.exit(0);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start all services
startAll().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
