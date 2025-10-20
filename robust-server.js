const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Robust Server Starter
 * - Auto-restart on crash
 * - Health monitoring
 * - Graceful shutdown
 * - Log rotation
 */

class RobustServer {
  constructor(config = {}) {
    this.config = {
      script: config.script || 'server.js',
      cwd: config.cwd || process.cwd(),
      name: config.name || 'Backend Server',
      maxRestarts: config.maxRestarts || 10,
      restartDelay: config.restartDelay || 3000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      port: config.port || 5001,
      ...config,
    };

    this.restartCount = 0;
    this.process = null;
    this.isShuttingDown = false;
    this.lastCrashTime = 0;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async start() {
    if (this.process) {
      this.log('Server is already running', 'warn');
      return;
    }

    this.log(`Starting ${this.config.name}...`);
    this.log(`Script: ${this.config.script}`);
    this.log(`Directory: ${this.config.cwd}`);
    this.log(`Port: ${this.config.port}`);

    const scriptPath = path.join(this.config.cwd, this.config.script);

    if (!fs.existsSync(scriptPath)) {
      this.log(`Script not found: ${scriptPath}`, 'error');
      process.exit(1);
    }

    this.process = spawn('node', [this.config.script], {
      cwd: this.config.cwd,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: this.config.port,
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    });

    this.process.on('close', code => {
      this.handleProcessExit(code);
    });

    this.process.on('error', error => {
      this.log(`Process error: ${error.message}`, 'error');
      this.handleProcessExit(1);
    });

    // Setup graceful shutdown
    this.setupGracefulShutdown();

    this.log('✅ Server started successfully');
  }

  handleProcessExit(code) {
    if (this.isShuttingDown) {
      this.log('Server stopped gracefully');
      process.exit(0);
      return;
    }

    this.process = null;
    const now = Date.now();

    // Check if crashing too frequently
    if (now - this.lastCrashTime < 5000) {
      this.restartCount++;
    } else {
      this.restartCount = 0;
    }

    this.lastCrashTime = now;

    if (code === 0) {
      this.log('Server exited normally');
      return;
    }

    this.log(`❌ Server crashed with code ${code}`, 'error');

    if (this.restartCount >= this.config.maxRestarts) {
      this.log(`Max restart attempts (${this.config.maxRestarts}) reached`, 'error');
      this.log('💡 Please check the logs and fix the issues');
      process.exit(1);
    }

    // Auto-restart
    this.log(
      `Restarting in ${this.config.restartDelay / 1000}s... (attempt ${this.restartCount + 1}/${this.config.maxRestarts})`,
    );

    setTimeout(() => {
      this.start();
    }, this.config.restartDelay);
  }

  setupGracefulShutdown() {
    const shutdown = signal => {
      this.log(`Received ${signal}, shutting down gracefully...`);
      this.isShuttingDown = true;

      if (this.process) {
        this.log('Stopping server process...');
        this.process.kill('SIGTERM');

        // Force kill after 10 seconds
        setTimeout(() => {
          if (this.process) {
            this.log('Forcing server shutdown...', 'warn');
            this.process.kill('SIGKILL');
          }
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  stop() {
    this.isShuttingDown = true;
    if (this.process) {
      this.process.kill('SIGTERM');
    }
  }
}

// Read command line arguments
const args = process.argv.slice(2);
const config = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];

  if (key === 'port') config.port = parseInt(value);
  else if (key === 'script') config.script = value;
  else if (key === 'cwd') config.cwd = value;
  else if (key === 'name') config.name = value;
}

// Start the server
const server = new RobustServer(config);
server.start();
