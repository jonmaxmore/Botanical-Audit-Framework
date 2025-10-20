// Health Check Monitoring and Alerting System
const { logger } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');

class HealthMonitor {
  constructor(healthService, options = {}) {
    this.healthService = healthService;
    this.options = {
      checkInterval: options.checkInterval || 60000, // 1 minute
      alertThreshold: options.alertThreshold || 3, // 3 consecutive failures
      emailEnabled: options.emailEnabled || false,
      webhookEnabled: options.webhookEnabled || false,
      ...options,
    };

    this.consecutiveFailures = 0;
    this.lastStatus = 'unknown';
    this.isMonitoring = false;
    this.intervalId = null;
    this.alertHistory = [];

    // Email transporter
    if (this.options.emailEnabled) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  // Start monitoring
  startMonitoring() {
    if (this.isMonitoring) {
      logger.warn('Health monitoring is already running');
      return;
    }

    logger.info(`🏥 Starting health monitoring (interval: ${this.options.checkInterval}ms)`);
    this.isMonitoring = true;

    this.intervalId = setInterval(async () => {
      await this.performHealthCheck();
    }, this.options.checkInterval);

    // Perform initial check
    this.performHealthCheck();
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    logger.info('🛑 Stopping health monitoring');
    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const healthResult = await this.healthService.fullHealthCheck();
      const currentStatus = healthResult.status;

      // Log health status
      this.logHealthStatus(healthResult);

      // Check for status changes
      if (currentStatus !== this.lastStatus) {
        await this.handleStatusChange(this.lastStatus, currentStatus, healthResult);
        this.lastStatus = currentStatus;
      }

      // Handle failures
      if (currentStatus === 'unhealthy' || currentStatus === 'error') {
        this.consecutiveFailures++;

        if (this.consecutiveFailures >= this.options.alertThreshold) {
          await this.triggerAlert(
            'CRITICAL',
            `System unhealthy for ${this.consecutiveFailures} consecutive checks`,
            healthResult
          );
        }
      } else {
        // Reset failure counter on success
        if (this.consecutiveFailures > 0) {
          logger.info(`✅ System recovered after ${this.consecutiveFailures} failures`);
          this.consecutiveFailures = 0;
        }
      }

      return healthResult;
    } catch (error) {
      logger.error('Health check monitoring error:', error);
      this.consecutiveFailures++;

      if (this.consecutiveFailures >= this.options.alertThreshold) {
        await this.triggerAlert('CRITICAL', `Health check failed: ${error.message}`, {
          error: error.message,
        });
      }
    }
  }

  // Log health status
  logHealthStatus(healthResult) {
    const { status, database, system, application } = healthResult;

    const logData = {
      status,
      mongodb: database.mongodb.status,
      redis: database.redis.status,
      memory_usage: system.memory.heapUsagePercentage,
      uptime: Math.round(process.uptime()),
      services_count: Object.keys(application.services).length,
    };

    if (status === 'healthy') {
      logger.info('🟢 Health check passed', logData);
    } else if (status === 'degraded') {
      logger.warn('🟡 Health check degraded', logData);
    } else {
      logger.error('🔴 Health check failed', logData);
    }
  }

  // Handle status changes
  async handleStatusChange(oldStatus, newStatus, healthResult) {
    logger.info(`🔄 Health status changed: ${oldStatus} → ${newStatus}`);

    const statusChangeData = {
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      healthData: healthResult,
    };

    // Determine alert level
    let alertLevel = 'INFO';
    if (newStatus === 'unhealthy' || newStatus === 'error') {
      alertLevel = 'CRITICAL';
    } else if (newStatus === 'degraded') {
      alertLevel = 'WARNING';
    } else if (oldStatus === 'unhealthy' && newStatus === 'healthy') {
      alertLevel = 'RECOVERY';
    }

    await this.triggerAlert(
      alertLevel,
      `System status changed from ${oldStatus} to ${newStatus}`,
      statusChangeData
    );
  }

  // Trigger alert
  async triggerAlert(level, message, data = {}) {
    const alert = {
      id: this.generateAlertId(),
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      hostname: require('os').hostname(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Add to alert history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100); // Keep last 100 alerts
    }

    logger.warn(`🚨 Health Alert [${level}]: ${message}`, alert);

    // Send email alert
    if (this.options.emailEnabled) {
      await this.sendEmailAlert(alert);
    }

    // Send webhook alert
    if (this.options.webhookEnabled) {
      await this.sendWebhookAlert(alert);
    }

    // Store alert in database (if needed)
    await this.storeAlert(alert);
  }

  // Send email alert
  async sendEmailAlert(alert) {
    if (!this.emailTransporter) {
      return;
    }

    try {
      const subject = `[${alert.level}] GACP Health Alert - ${alert.message}`;
      const html = this.generateEmailTemplate(alert);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.HEALTH_ALERT_EMAILS,
        subject,
        html,
      });

      logger.info('📧 Health alert email sent');
    } catch (error) {
      logger.error('Failed to send health alert email:', error);
    }
  }

  // Send webhook alert
  async sendWebhookAlert(alert) {
    if (!this.options.webhookUrl) {
      return;
    }

    try {
      const axios = require('axios');

      await axios.post(
        this.options.webhookUrl,
        {
          alert,
          service: 'gacp-standards-system',
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GACP-Health-Monitor',
          },
        }
      );

      logger.info('🔗 Health alert webhook sent');
    } catch (error) {
      logger.error('Failed to send health alert webhook:', error);
    }
  }

  // Store alert in database
  async storeAlert(alert) {
    try {
      // Create HealthAlert model if it doesn't exist
      const mongoose = require('mongoose');

      const HealthAlertSchema = new mongoose.Schema({
        alertId: { type: String, required: true, unique: true },
        level: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed },
        hostname: String,
        environment: String,
        createdAt: { type: Date, default: Date.now },
      });

      const HealthAlert =
        mongoose.models.HealthAlert || mongoose.model('HealthAlert', HealthAlertSchema);

      await HealthAlert.create({
        alertId: alert.id,
        level: alert.level,
        message: alert.message,
        data: alert.data,
        hostname: alert.hostname,
        environment: alert.environment,
      });
    } catch (error) {
      logger.error('Failed to store health alert:', error);
    }
  }

  // Generate email template
  generateEmailTemplate(alert) {
    const levelColors = {
      CRITICAL: '#dc3545',
      WARNING: '#ffc107',
      INFO: '#17a2b8',
      RECOVERY: '#28a745',
    };

    const color = levelColors[alert.level] || '#6c757d';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>GACP Health Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: ${color}; color: white; padding: 20px;">
                <h1 style="margin: 0; font-size: 24px;">🚨 GACP Health Alert</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">${alert.level} Level Alert</p>
            </div>
            
            <div style="padding: 20px;">
                <h2 style="color: #333; margin-top: 0;">${alert.message}</h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <strong>Alert Details:</strong><br>
                    <strong>ID:</strong> ${alert.id}<br>
                    <strong>Time:</strong> ${alert.timestamp}<br>
                    <strong>Environment:</strong> ${alert.environment}<br>
                    <strong>Hostname:</strong> ${alert.hostname}
                </div>
                
                ${
                  alert.data.status
                    ? `
                <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <strong>System Status:</strong> ${alert.data.status}<br>
                    ${alert.data.database ? `<strong>Database:</strong> ${alert.data.database.mongodb.status}<br>` : ''}
                    ${alert.data.system ? `<strong>Memory Usage:</strong> ${alert.data.system.memory.heapUsagePercentage}%<br>` : ''}
                </div>
                `
                    : ''
                }
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
                    This alert was generated by the GACP Standards Comparison Health Monitoring System.
                    <br>Please investigate and take appropriate action if necessary.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate unique alert ID
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.options.checkInterval,
      lastStatus: this.lastStatus,
      consecutiveFailures: this.consecutiveFailures,
      alertsToday: this.getAlertsToday(),
      totalAlerts: this.alertHistory.length,
      uptime: process.uptime(),
    };
  }

  // Get alerts from today
  getAlertsToday() {
    const today = new Date().toDateString();
    return this.alertHistory.filter(alert => new Date(alert.timestamp).toDateString() === today)
      .length;
  }

  // Get alert history
  getAlertHistory(limit = 50) {
    return this.alertHistory.slice(-limit).reverse();
  }

  // Clear alert history
  clearAlertHistory() {
    this.alertHistory = [];
    logger.info('Alert history cleared');
  }
}

// Create monitoring routes
const createMonitoringRoutes = healthMonitor => {
  const express = require('express');
  const router = express.Router();

  // Get monitoring status
  router.get('/status', (req, res) => {
    const status = healthMonitor.getMonitoringStatus();
    res.json({
      success: true,
      data: status,
    });
  });

  // Get alert history
  router.get('/alerts', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = healthMonitor.getAlertHistory(limit);
    res.json({
      success: true,
      data: {
        alerts,
        total: healthMonitor.alertHistory.length,
      },
    });
  });

  // Clear alert history
  router.delete('/alerts', (req, res) => {
    healthMonitor.clearAlertHistory();
    res.json({
      success: true,
      message: 'Alert history cleared',
    });
  });

  // Start monitoring
  router.post('/start', (req, res) => {
    healthMonitor.startMonitoring();
    res.json({
      success: true,
      message: 'Health monitoring started',
    });
  });

  // Stop monitoring
  router.post('/stop', (req, res) => {
    healthMonitor.stopMonitoring();
    res.json({
      success: true,
      message: 'Health monitoring stopped',
    });
  });

  return router;
};

module.exports = {
  HealthMonitor,
  createMonitoringRoutes,
};
