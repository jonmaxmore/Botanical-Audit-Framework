/**
 * Alert Manager
 * Manage alerts, notifications, and incident escalation
 */

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Alert channels
 */
export enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

/**
 * Alert rule
 */
export interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  cooldown?: number; // Minutes between alerts
  escalationPolicy?: string;
}

/**
 * Alert condition
 */
export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // Seconds
}

/**
 * Alert
 */
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  value?: number;
  metadata?: Record<string, any>;
  acknowledged?: boolean;
  resolvedAt?: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  alertId: string;
  channel: AlertChannel;
  recipient: string;
  sentAt: string;
  success: boolean;
  error?: string;
}

/**
 * Alert Manager Service
 */
export class AlertManager {
  private static instance: AlertManager;
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private lastAlertTime: Map<string, number> = new Map();

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // High error rate
    this.addRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      condition: {
        metric: 'error_rate',
        operator: 'gt',
        threshold: 5, // 5% error rate
        duration: 300, // Over 5 minutes
      },
      severity: AlertSeverity.ERROR,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
      enabled: true,
      cooldown: 30,
    });

    // Slow response time
    this.addRule({
      id: 'slow_response',
      name: 'Slow API Response Time',
      condition: {
        metric: 'response_time_p95',
        operator: 'gt',
        threshold: 3000, // 3 seconds
        duration: 300,
      },
      severity: AlertSeverity.WARNING,
      channels: [AlertChannel.SLACK],
      enabled: true,
      cooldown: 15,
    });

    // Database connection failure
    this.addRule({
      id: 'db_connection_failed',
      name: 'Database Connection Failed',
      condition: {
        metric: 'db_health',
        operator: 'eq',
        threshold: 0,
      },
      severity: AlertSeverity.CRITICAL,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.SMS],
      enabled: true,
      cooldown: 5,
    });

    // High memory usage
    this.addRule({
      id: 'high_memory',
      name: 'High Memory Usage',
      condition: {
        metric: 'memory_usage',
        operator: 'gt',
        threshold: 90, // 90%
        duration: 600,
      },
      severity: AlertSeverity.WARNING,
      channels: [AlertChannel.SLACK],
      enabled: true,
      cooldown: 30,
    });
  }

  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove alert rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Check metric against rules
   */
  async checkMetric(metric: string, value: number, metadata?: Record<string, any>): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.condition.metric !== metric) {
        continue;
      }

      // Check if condition is met
      if (this.evaluateCondition(rule.condition, value)) {
        await this.triggerAlert(rule, value, metadata);
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > condition.threshold;
      case 'gte':
        return value >= condition.threshold;
      case 'lt':
        return value < condition.threshold;
      case 'lte':
        return value <= condition.threshold;
      case 'eq':
        return value === condition.threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(
    rule: AlertRule,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Check cooldown
    const lastAlert = this.lastAlertTime.get(rule.id);
    if (lastAlert && rule.cooldown) {
      const minutesSinceLastAlert = (Date.now() - lastAlert) / 60000;
      if (minutesSinceLastAlert < rule.cooldown) {
        return; // Still in cooldown period
      }
    }

    const alert: Alert = {
      id: this.generateId(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: this.formatAlertMessage(rule, value),
      timestamp: new Date().toISOString(),
      value,
      metadata,
      acknowledged: false,
    };

    this.activeAlerts.set(alert.id, alert);
    this.lastAlertTime.set(rule.id, Date.now());

    // Send notifications
    await this.sendNotifications(alert, rule.channels);

    // Log alert
    console.error(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(rule: AlertRule, value: number): string {
    const { name, condition } = rule;
    const operator = this.operatorToString(condition.operator);

    return `${name}: ${condition.metric} is ${value} (${operator} ${condition.threshold})`;
  }

  /**
   * Convert operator to string
   */
  private operatorToString(operator: string): string {
    const map: Record<string, string> = {
      gt: 'greater than',
      gte: 'greater than or equal to',
      lt: 'less than',
      lte: 'less than or equal to',
      eq: 'equal to',
    };
    return map[operator] || operator;
  }

  /**
   * Send notifications to channels
   */
  private async sendNotifications(alert: Alert, channels: AlertChannel[]): Promise<void> {
    const promises = channels.map(channel => this.sendNotification(alert, channel));
    await Promise.all(promises);
  }

  /**
   * Send notification to specific channel
   */
  private async sendNotification(alert: Alert, channel: AlertChannel): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      alertId: alert.id,
      channel,
      recipient: this.getRecipient(channel),
      sentAt: new Date().toISOString(),
      success: false,
    };

    try {
      switch (channel) {
        case AlertChannel.EMAIL:
          await this.sendEmail(alert);
          break;
        case AlertChannel.SLACK:
          await this.sendSlack(alert);
          break;
        case AlertChannel.SMS:
          await this.sendSMS(alert);
          break;
        case AlertChannel.WEBHOOK:
          await this.sendWebhook(alert);
          break;
      }

      notification.success = true;
    } catch (error) {
      notification.error = (error as Error).message;
      console.error(`Failed to send ${channel} notification:`, error);
    }

    return notification;
  }

  /**
   * Get recipient for channel
   */
  private getRecipient(channel: AlertChannel): string {
    const recipients: Record<AlertChannel, string> = {
      [AlertChannel.EMAIL]: process.env.ALERT_EMAIL || 'admin@example.com',
      [AlertChannel.SLACK]: process.env.SLACK_WEBHOOK || 'slack-channel',
      [AlertChannel.SMS]: process.env.ALERT_PHONE || '+66xxxxxxxxx',
      [AlertChannel.WEBHOOK]: process.env.ALERT_WEBHOOK || 'https://example.com/alerts',
    };
    return recipients[channel];
  }

  /**
   * Send email notification
   */
  private async sendEmail(alert: Alert): Promise<void> {
    // TODO: Implement email sending
    console.log(`[EMAIL] Alert: ${alert.message}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(alert: Alert): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK;
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const color = this.getSeverityColor(alert.severity);
    const payload = {
      attachments: [
        {
          color,
          title: `🚨 ${alert.ruleName}`,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Value',
              value: alert.value?.toString() || 'N/A',
              short: true,
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: false,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: AlertSeverity): string {
    const colors: Record<AlertSeverity, string> = {
      [AlertSeverity.INFO]: '#0099ff',
      [AlertSeverity.WARNING]: '#ffaa00',
      [AlertSeverity.ERROR]: '#ff4444',
      [AlertSeverity.CRITICAL]: '#cc0000',
    };
    return colors[severity];
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(alert: Alert): Promise<void> {
    // TODO: Implement SMS sending (Twilio, etc.)
    console.log(`[SMS] Alert: ${alert.message}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(alert: Alert): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK;
    if (!webhookUrl) {
      throw new Error('Alert webhook URL not configured');
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.metadata = {
      ...alert.metadata,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
    };

    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date().toISOString();
    this.activeAlerts.delete(alertId);

    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(severity?: AlertSeverity): Alert[] {
    const alerts = Array.from(this.activeAlerts.values());

    if (severity) {
      return alerts.filter(a => a.severity === severity);
    }

    return alerts;
  }

  /**
   * Generate ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Singleton instance
 */
export const alertManager = AlertManager.getInstance();

/**
 * Helper functions
 */

export function checkMetric(
  metric: string,
  value: number,
  metadata?: Record<string, any>
): Promise<void> {
  return alertManager.checkMetric(metric, value, metadata);
}

export function getActiveAlerts(severity?: AlertSeverity): Alert[] {
  return alertManager.getActiveAlerts(severity);
}

export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  return alertManager.acknowledgeAlert(alertId, acknowledgedBy);
}
