// robust-gacp-server.mjs - Enterprise-grade GACP Server with Auto-recovery
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class RobustGACPServer {
  constructor() {
    this.server = null;
    this.port = 3000;
    this.isRunning = false;
    this.startTime = null;
    this.requestCount = 0;
    this.errorCount = 0;
    this.healthCheckInterval = null;
    this.maxRetries = 5;
    this.retryCount = 0;

    // Bind methods to preserve context
    this.handleRequest = this.handleRequest.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
    this.gracefulShutdown = this.gracefulShutdown.bind(this);

    // Setup graceful shutdown
    process.on('SIGINT', this.gracefulShutdown);
    process.on('SIGTERM', this.gracefulShutdown);
    process.on('uncaughtException', this.handleError.bind(this));
    process.on('unhandledRejection', this.handleError.bind(this));
  }

  async findAvailablePort(startPort = 3000) {
    const net = await import('node:net');

    return new Promise(resolve => {
      const server = net.createServer();
      server.listen(startPort, err => {
        if (err) {
          server.close();
          resolve(this.findAvailablePort(startPort + 1));
        } else {
          const port = server.address().port;
          server.close();
          resolve(port);
        }
      });
    });
  }

  async start() {
    try {
      // Find available port
      this.port = await this.findAvailablePort(3000);

      // Create server
      this.server = createServer(this.handleRequest);

      // Start server
      this.server.listen(this.port, '127.0.0.1', () => {
        this.isRunning = true;
        this.startTime = new Date();
        this.retryCount = 0;

        console.log('🌿 GACP Robust Server');
        console.log(`🚀 Server running on http://127.0.0.1:${this.port}`);
        console.log(`📋 Demo: http://127.0.0.1:${this.port}/demo`);
        console.log(`💚 Health: http://127.0.0.1:${this.port}/api/health`);
        console.log(`📊 Status: http://127.0.0.1:${this.port}/api/status`);
        console.log('');
        console.log('✅ Auto-restart enabled');
        console.log('✅ Health monitoring active');
        console.log('✅ Error recovery enabled');
        console.log('');

        // Start health monitoring
        this.startHealthMonitoring();
      });

      // Handle server errors
      this.server.on('error', this.handleServerError.bind(this));
    } catch (error) {
      this.handleError(error);
    }
  }

  handleRequest(req, res) {
    this.requestCount++;

    try {
      const url = new URL(req.url, `http://${req.headers.host}`);

      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      this.routeRequest(url, req, res);
    } catch (error) {
      this.errorCount++;
      this.sendError(res, error);
    }
  }

  routeRequest(url, req, res) {
    switch (url.pathname) {
      case '/':
        this.serveHomePage(res);
        break;
      case '/demo':
        this.serveDemoPage(res);
        break;
      case '/api/health':
        this.serveHealthCheck(res);
        break;
      case '/api/status':
        this.serveStatus(res);
        break;
      case '/api/gacp/workflow':
        this.serveWorkflow(res);
        break;
      case '/api/gacp/ccps':
        this.serveCCPs(res);
        break;
      case '/api/restart':
        this.serveRestart(res);
        break;
      default:
        this.serve404(res);
    }
  }

  serveHomePage(res) {
    const uptime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    const html = `
            <html>
                <head>
                    <title>🌿 GACP Robust Server</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
                        .status.healthy { background: #d4edda; color: #155724; }
                        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
                        .links { margin: 20px 0; }
                        .links a { display: inline-block; margin: 10px 15px 10px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                        .links a:hover { background: #0056b3; }
                        .refresh { float: right; }
                    </style>
                    <meta http-equiv="refresh" content="30">
                </head>
                <body>
                    <div class="container">
                        <h1>🌿 GACP Robust Server</h1>
                        <p><span class="status healthy">✅ HEALTHY</span> Server is running with auto-recovery</p>
                        
                        <div class="metric">
                            <strong>📊 Server Metrics:</strong><br>
                            Uptime: ${uptime} seconds<br>
                            Requests: ${this.requestCount}<br>
                            Errors: ${this.errorCount}<br>
                            Port: ${this.port}<br>
                            Started: ${this.startTime?.toLocaleString() || 'Unknown'}
                        </div>

                        <div class="links">
                            <h3>🔗 Available Services:</h3>
                            <a href="/demo" target="_blank">📋 Interactive Demo</a>
                            <a href="/api/health" target="_blank">💚 Health Check</a>
                            <a href="/api/status" target="_blank">📊 Server Status</a>
                            <a href="/api/gacp/workflow" target="_blank">🔄 GACP Workflow</a>
                            <a href="/api/gacp/ccps" target="_blank">🎯 Control Points</a>
                            <a href="/api/restart" target="_blank">🔄 Restart Server</a>
                        </div>

                        <div class="metric">
                            <strong>🛡️ Enterprise Features:</strong><br>
                            ✅ Auto-restart on crash<br>
                            ✅ Health monitoring (30s intervals)<br>
                            ✅ Automatic port detection<br>
                            ✅ Error recovery and logging<br>
                            ✅ Graceful shutdown handling<br>
                            ✅ Request/error metrics tracking
                        </div>

                        <p class="refresh"><em>Auto-refresh every 30 seconds</em></p>
                    </div>
                </body>
            </html>
        `;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  serveDemoPage(res) {
    try {
      const demoContent = readFileSync(join(__dirname, 'demo-standalone.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(demoContent);
    } catch (error) {
      this.sendError(
        res,
        new Error('Demo file not found. Please ensure demo-standalone.html exists.')
      );
    }
  }

  serveHealthCheck(res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      server: 'gacp-robust-server',
      version: '2.0.0',
      port: this.port,
      metrics: {
        requests: this.requestCount,
        errors: this.errorCount,
        errorRate:
          this.requestCount > 0
            ? ((this.errorCount / this.requestCount) * 100).toFixed(2) + '%'
            : '0%',
      },
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  serveStatus(res) {
    const status = {
      server: {
        name: 'GACP Robust Server',
        version: '2.0.0',
        status: 'running',
        uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
        startTime: this.startTime?.toISOString(),
        port: this.port,
        pid: process.pid,
      },
      metrics: {
        requests: this.requestCount,
        errors: this.errorCount,
        errorRate:
          this.requestCount > 0
            ? ((this.errorCount / this.requestCount) * 100).toFixed(2) + '%'
            : '0%',
      },
      memory: process.memoryUsage(),
      features: [
        'Auto-restart on crash',
        'Health monitoring',
        'Automatic port detection',
        'Error recovery',
        'Graceful shutdown',
        'Metrics tracking',
      ],
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  serveWorkflow(res) {
    const workflow = {
      success: true,
      data: {
        workflowStates: 17,
        currentWorkflow: 'WHO-GACP-2024',
        totalApplications: 156,
        activeApplications: 23,
        completedApplications: 133,
        serverInfo: {
          uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
          requests: this.requestCount,
        },
      },
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(workflow, null, 2));
  }

  serveCCPs(res) {
    const ccps = {
      success: true,
      data: {
        totalCCPs: 8,
        methodology: 'HACCP-based',
        complianceStandard: 'WHO-GACP 2024.1',
        serverInfo: {
          uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
          requests: this.requestCount,
        },
      },
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ccps, null, 2));
  }

  serveRestart(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Server restart initiated...',
        timestamp: new Date().toISOString(),
      })
    );

    // Restart server after response
    setTimeout(() => {
      this.restart();
    }, 1000);
  }

  serve404(res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Not Found',
        message: 'The requested resource was not found',
        availableEndpoints: [
          '/',
          '/demo',
          '/api/health',
          '/api/status',
          '/api/gacp/workflow',
          '/api/gacp/ccps',
        ],
      })
    );
  }

  sendError(res, error) {
    this.errorCount++;
    console.error('❌ Server Error:', error.message);

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      })
    );
  }

  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(this.healthCheck, 30000); // 30 seconds
    console.log('💚 Health monitoring started (30s intervals)');
  }

  healthCheck() {
    const uptime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    const memUsage = process.memoryUsage();

    console.log(`💚 Health Check [${new Date().toLocaleTimeString()}]:`);
    console.log(
      `   Uptime: ${uptime}s | Requests: ${this.requestCount} | Errors: ${this.errorCount}`
    );
    console.log(`   Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB RSS`);

    // Auto-restart if too many errors
    if (this.requestCount > 100 && this.errorCount / this.requestCount > 0.5) {
      console.log('⚠️  High error rate detected, restarting server...');
      this.restart();
    }
  }

  handleError(error) {
    this.errorCount++;
    console.error('💥 Unhandled Error:', error);

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Auto-restarting server (attempt ${this.retryCount}/${this.maxRetries})...`);
      setTimeout(() => this.restart(), 2000);
    } else {
      console.log('❌ Max retry attempts reached, shutting down');
      this.gracefulShutdown();
    }
  }

  handleServerError(error) {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${this.port} in use, trying next port...`);
      this.findAvailablePort(this.port + 1).then(newPort => {
        this.port = newPort;
        this.start();
      });
    } else {
      this.handleError(error);
    }
  }

  async restart() {
    console.log('🔄 Restarting server...');

    if (this.server) {
      this.server.close();
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.isRunning = false;

    // Wait a moment then restart
    setTimeout(() => {
      this.start();
    }, 1000);
  }

  gracefulShutdown() {
    console.log('\n🛑 Graceful shutdown initiated...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.server) {
      this.server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

// Start the robust server
console.log('🚀 Starting GACP Robust Server...');
const server = new RobustGACPServer();
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
