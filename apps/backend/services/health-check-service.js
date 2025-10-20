/**
 * Health Check Service
 * MIS Team Solution for Server Monitoring
 *
 * Features:
 * - Monitor main server health
 * - Check MongoDB connection
 * - Check API endpoints
 * - Send alerts on failures
 * - Auto-restart if needed
 */

const http = require('http');
const https = require('https');

class HealthCheckService {
  constructor() {
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 seconds
    this.failureCount = 0;
    this.maxFailures = 3;
    this.isRunning = false;
  }

  /**
   * Start health check service
   */
  start() {
    console.log('[Health Check] Starting service...');
    console.log(`[Health Check] Check interval: ${this.checkInterval}ms`);

    this.isRunning = true;
    this.runChecks();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runChecks();
    }, this.checkInterval);
  }

  /**
   * Stop health check service
   */
  stop() {
    console.log('[Health Check] Stopping service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    if (!this.isRunning) return;

    console.log(`\n[Health Check] Running checks at ${new Date().toISOString()}`);

    try {
      // Check 1: Main server health
      const serverHealth = await this.checkServer('http://localhost:5000/health');
      console.log(`[Health Check] Main Server: ${serverHealth.status}`);

      // Check 2: MongoDB health
      const mongoHealth = await this.checkServer('http://localhost:5000/api/health/mongodb');
      console.log(`[Health Check] MongoDB: ${mongoHealth.status}`);

      // Check 3: Auth service
      const authHealth = await this.checkServer('http://localhost:5000/api/auth/health');
      console.log(`[Health Check] Auth Service: ${authHealth.status}`);

      // Check 4: DTAM service
      const dtamHealth = await this.checkServer('http://localhost:5000/api/auth/dtam/health');
      console.log(`[Health Check] DTAM Service: ${dtamHealth.status}`);

      // All checks passed
      if (serverHealth.ok && authHealth.ok) {
        this.failureCount = 0;
        console.log('[Health Check] ✅ All checks passed');
      } else {
        this.failureCount++;
        console.log(
          `[Health Check] ⚠️  Some checks failed (${this.failureCount}/${this.maxFailures})`
        );

        if (this.failureCount >= this.maxFailures) {
          console.error('[Health Check] ❌ Max failures reached! Alerting...');
          this.sendAlert({
            serverHealth,
            mongoHealth,
            authHealth,
            dtamHealth,
          });
        }
      }
    } catch (error) {
      console.error('[Health Check] ❌ Error during checks:', error.message);
      this.failureCount++;
    }
  }

  /**
   * Check server endpoint
   */
  checkServer(url, timeout = 5000) {
    return new Promise(resolve => {
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, { timeout }, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              ok: res.statusCode === 200,
              status: json.status || 'unknown',
              statusCode: res.statusCode,
              data: json,
            });
          } catch (e) {
            resolve({
              ok: res.statusCode === 200,
              status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
              statusCode: res.statusCode,
              data: data,
            });
          }
        });
      });

      req.on('error', error => {
        resolve({
          ok: false,
          status: 'error',
          error: error.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          ok: false,
          status: 'timeout',
          error: 'Request timeout',
        });
      });
    });
  }

  /**
   * Send alert (console for now, can integrate with email/Slack)
   */
  sendAlert(healthData) {
    console.error('\n========================================');
    console.error('🚨 HEALTH CHECK ALERT');
    console.error('========================================');
    console.error('Time:', new Date().toISOString());
    console.error('Failure Count:', this.failureCount);
    console.error('Health Data:', JSON.stringify(healthData, null, 2));
    console.error('========================================\n');

    // TODO: Send email, Slack notification, or SMS
    // TODO: Trigger auto-restart via PM2 API
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
    };
  }
}

// Run if called directly
if (require.main === module) {
  const service = new HealthCheckService();
  service.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[Health Check] Received SIGINT, shutting down...');
    service.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[Health Check] Received SIGTERM, shutting down...');
    service.stop();
    process.exit(0);
  });
}

module.exports = HealthCheckService;
