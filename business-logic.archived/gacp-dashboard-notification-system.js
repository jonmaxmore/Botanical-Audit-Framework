/**
 * 📊 GACP Dashboard & Notification System
 * ระบบ Dashboard และการแจ้งเตือนที่ชัดเจนสำหรับทุกบทบาท
 *
 * บทบาทผู้ใช้งาน:
 * - เกษตรกร (Farmer): ติดตามสถานะใบสมัครของตนเอง
 * - เจ้าหน้าที่ (Staff): จัดการงานตรวจสอบและอนุมัติ
 * - ผู้บริหาร (Admin): ดูภาพรวมและสถิติระบบ
 * - ระบบ (System): แจ้งเตือนอัตโนมัติ
 */

const { EventEmitter } = require('events');
const { GACPStatusManager } = require('./gacp-status-manager');

// ประเภทการแจ้งเตือน
const NOTIFICATION_TYPES = {
  // การแจ้งเตือนสำหรับเกษตรกร
  FARMER: {
    PAYMENT_DUE: {
      type: 'payment_due',
      priority: 'high',
      title: 'แจ้งชำระเงิน',
      template: 'กรุณาชำระค่าธรรมเนียม {amount} บาท ภายใน {days} วัน',
      actions: ['ชำระเงิน', 'ดูรายละเอียด'],
      category: 'payment'
    },
    DOCUMENT_REVISION: {
      type: 'document_revision',
      priority: 'high',
      title: 'เอกสารต้องแก้ไข',
      template: 'เอกสารของท่านต้องแก้ไข กรุณาตรวจสอบและส่งใหม่',
      actions: ['แก้ไขเอกสาร', 'ดูรายละเอียด'],
      category: 'document'
    },
    INSPECTION_SCHEDULED: {
      type: 'inspection_scheduled',
      priority: 'high',
      title: 'นัดหมายตรวจฟาร์ม',
      template: 'มีการนัดหมาย {inspection_type} วันที่ {date} เวลา {time}',
      actions: ['ยืนยันเข้าร่วม', 'ดูรายละเอียด'],
      category: 'inspection'
    },
    CERTIFICATE_READY: {
      type: 'certificate_ready',
      priority: 'high',
      title: 'ใบรับรองพร้อมแล้ว',
      template: 'ใบรับรอง GACP ของท่านพร้อมดาวน์โหลดแล้ว',
      actions: ['ดาวน์โหลด', 'ดูรายละเอียด'],
      category: 'certificate'
    },
    STATUS_UPDATE: {
      type: 'status_update',
      priority: 'medium',
      title: 'อัพเดตสถานะ',
      template: 'สถานะใบสมัครของท่านเปลี่ยนเป็น "{status}"',
      actions: ['ดูรายละเอียด'],
      category: 'status'
    }
  },

  // การแจ้งเตือนสำหรับเจ้าหน้าที่
  STAFF: {
    NEW_APPLICATION: {
      type: 'new_application',
      priority: 'medium',
      title: 'ใบสมัครใหม่',
      template: 'มีใบสมัครใหม่จาก {farmer_name} รอการตรวจสอบ',
      actions: ['ตรวจสอบ', 'มอบหมายงาน'],
      category: 'work'
    },
    DOCUMENT_READY: {
      type: 'document_ready',
      priority: 'medium',
      title: 'เอกสารพร้อมตรวจ',
      template: 'เอกสารจาก {farmer_name} พร้อมสำหรับการตรวจสอบ',
      actions: ['เริ่มตรวจสอบ', 'ดูเอกสาร'],
      category: 'work'
    },
    INSPECTION_DUE: {
      type: 'inspection_due',
      priority: 'high',
      title: 'งานตรวจฟาร์มรอดำเนินการ',
      template: 'มีงานตรวจฟาร์ม {count} รายการที่ต้องดำเนินการ',
      actions: ['ดูรายการ', 'จัดตารางงาน'],
      category: 'work'
    },
    OVERDUE_TASK: {
      type: 'overdue_task',
      priority: 'high',
      title: 'งานเกินกำหนด',
      template: 'มีงาน {task_type} เกินกำหนด {days} วันแล้ว',
      actions: ['ดำเนินการทันที', 'ดูรายละเอียด'],
      category: 'urgent'
    }
  },

  // การแจ้งเตือนสำหรับผู้บริหาร
  ADMIN: {
    APPROVAL_PENDING: {
      type: 'approval_pending',
      priority: 'medium',
      title: 'รออนุมัติ',
      template: 'มีใบสมัคร {count} รายการรอการอนุมัติ',
      actions: ['ดูรายการ', 'อนุมัติทั้งหมด'],
      category: 'approval'
    },
    MONTHLY_REPORT: {
      type: 'monthly_report',
      priority: 'low',
      title: 'รายงานประจำเดือน',
      template: 'รายงานประจำเดือน {month} พร้อมแล้ว',
      actions: ['ดูรายงาน', 'ส่งออกข้อมูล'],
      category: 'report'
    },
    SYSTEM_ALERT: {
      type: 'system_alert',
      priority: 'high',
      title: 'แจ้งเตือนระบบ',
      template: 'ระบบตรวจพบปัญหา: {issue}',
      actions: ['ตรวจสอบ', 'แก้ไข'],
      category: 'system'
    }
  }
};

// ช่องทางการแจ้งเตือน
const NOTIFICATION_CHANNELS = {
  IN_APP: {
    channel: 'in_app',
    name: 'แจ้งเตือนในระบบ',
    immediate: true,
    supports: ['text', 'actions', 'rich_content']
  },
  EMAIL: {
    channel: 'email',
    name: 'อีเมล',
    immediate: false,
    supports: ['text', 'html', 'attachments']
  },
  SMS: {
    channel: 'sms',
    name: 'SMS',
    immediate: true,
    supports: ['text']
  },
  LINE: {
    channel: 'line',
    name: 'LINE Notify',
    immediate: true,
    supports: ['text', 'stickers', 'images']
  }
};

class GACPDashboardNotificationSystem extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.statusManager = new GACPStatusManager();
    this.notificationTypes = NOTIFICATION_TYPES;
    this.channels = NOTIFICATION_CHANNELS;
    this.notifications = new Map(); // In-memory storage
  }

  /**
   * สร้าง Dashboard สำหรับเกษตรกร
   */
  async generateFarmerDashboard(farmerId) {
    try {
      // ดึงข้อมูลใบสมัครของเกษตรกร
      const applications = await this.getApplicationsByFarmer(farmerId);

      if (applications.length === 0) {
        return this.createEmptyFarmerDashboard();
      }

      const currentApplication = applications[0]; // ใบสมัครล่าสุด
      const status = this.statusManager.getDisplayStatus(currentApplication.currentState);
      const progressBar = this.statusManager.generateProgressBar(currentApplication.currentState);

      return {
        farmerId,
        farmerName: currentApplication.farmerName,
        currentApplication: {
          id: currentApplication.id,
          applicationNumber: currentApplication.applicationNumber,
          submittedAt: currentApplication.submittedAt,
          status: status,
          progressBar: progressBar
        },
        quickActions: this.generateFarmerQuickActions(currentApplication),
        notifications: await this.getFarmerNotifications(farmerId),
        payments: this.generatePaymentSummary(currentApplication),
        timeline: this.generateTimeline(currentApplication),
        documents: this.generateDocumentStatus(currentApplication),
        nextSteps: this.generateNextSteps(currentApplication),
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate farmer dashboard: ${error.message}`);
    }
  }

  /**
   * สร้าง Dashboard สำหรับเจ้าหน้าที่
   */
  async generateStaffDashboard(staffId) {
    try {
      const workItems = await this.getStaffWorkItems(staffId);
      const stats = await this.getStaffStatistics(staffId);

      return {
        staffId,
        role: 'staff',
        workQueue: {
          urgent: workItems.filter(item => item.priority === 'urgent'),
          today: workItems.filter(item => this.isDueToday(item.dueDate)),
          thisWeek: workItems.filter(item => this.isDueThisWeek(item.dueDate)),
          overdue: workItems.filter(item => this.isOverdue(item.dueDate))
        },
        statistics: {
          todayCompleted: stats.todayCompleted || 0,
          weekCompleted: stats.weekCompleted || 0,
          monthCompleted: stats.monthCompleted || 0,
          averageProcessingTime: stats.averageProcessingTime || 0
        },
        notifications: await this.getStaffNotifications(staffId),
        quickActions: this.generateStaffQuickActions(),
        recentActivities: await this.getRecentActivities(staffId),
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate staff dashboard: ${error.message}`);
    }
  }

  /**
   * สร้าง Dashboard สำหรับผู้บริหาร
   */
  async generateAdminDashboard(adminId) {
    try {
      const overallStats = await this.getOverallStatistics();
      const recentApplications = await this.getRecentApplications(10);

      return {
        adminId,
        role: 'admin',
        overview: {
          totalApplications: overallStats.totalApplications || 0,
          pendingApproval: overallStats.pendingApproval || 0,
          completedThisMonth: overallStats.completedThisMonth || 0,
          successRate: overallStats.successRate || 0,
          averageProcessingDays: overallStats.averageProcessingDays || 0
        },
        charts: {
          applicationsByStatus: overallStats.applicationsByStatus || {},
          monthlyTrends: overallStats.monthlyTrends || [],
          paymentSummary: overallStats.paymentSummary || {}
        },
        alerts: await this.getSystemAlerts(),
        pendingApprovals: await this.getPendingApprovals(),
        recentApplications: recentApplications,
        notifications: await this.getAdminNotifications(adminId),
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate admin dashboard: ${error.message}`);
    }
  }

  /**
   * ส่งการแจ้งเตือน
   */
  async sendNotification(recipientId, notificationType, data = {}, channels = ['in_app']) {
    try {
      const notification = this.createNotification(recipientId, notificationType, data);

      // ส่งผ่านช่องทางที่กำหนด
      const sendPromises = channels.map(channel => this.sendThroughChannel(notification, channel));

      await Promise.all(sendPromises);

      // บันทึกการแจ้งเตือน
      await this.saveNotification(notification);

      // ส่ง event
      this.emit('notification_sent', {
        notificationId: notification.id,
        recipientId,
        type: notificationType,
        channels
      });

      return notification;
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * สร้างการแจ้งเตือนสำหรับกรณีต่างๆ
   */
  createNotification(recipientId, notificationType, data) {
    const typeConfig = this.findNotificationTypeConfig(notificationType);

    if (!typeConfig) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    const notification = {
      id: this.generateNotificationId(),
      recipientId,
      type: notificationType,
      priority: typeConfig.priority,
      category: typeConfig.category,
      title: typeConfig.title,
      message: this.formatMessage(typeConfig.template, data),
      data: data,
      actions: typeConfig.actions || [],
      createdAt: new Date(),
      readAt: null,
      status: 'unread'
    };

    return notification;
  }

  /**
   * แจ้งเตือนอัตโนมัติตาม workflow events
   */
  async handleWorkflowEvent(eventType, eventData) {
    try {
      switch (eventType) {
        case 'application_submitted':
          await this.sendNotification(
            eventData.farmerId,
            'status_update',
            { status: 'ส่งใบสมัครแล้ว - รอการชำระเงิน' },
            ['in_app', 'email']
          );
          break;

        case 'payment_requested':
          await this.sendNotification(
            eventData.farmerId,
            'payment_due',
            {
              amount: eventData.amount,
              phase: eventData.phase,
              days: 7
            },
            ['in_app', 'sms', 'email']
          );
          break;

        case 'document_revision_required':
          await this.sendNotification(
            eventData.farmerId,
            'document_revision',
            {
              applicationId: eventData.applicationId,
              findings: eventData.findings
            },
            ['in_app', 'email']
          );
          break;

        case 'vdo_call_scheduled':
          await this.sendNotification(
            eventData.farmerId,
            'inspection_scheduled',
            {
              inspection_type: 'VDO Call',
              date: eventData.scheduledDateTime.toLocaleDateString('th-TH'),
              time: eventData.scheduledDateTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              meetingUrl: eventData.meetingUrl
            },
            ['in_app', 'sms', 'email']
          );
          break;

        case 'certificate_issued':
          await this.sendNotification(
            eventData.farmerId,
            'certificate_ready',
            {
              certificateNumber: eventData.certificateNumber,
              downloadUrl: eventData.downloadUrl
            },
            ['in_app', 'sms', 'email']
          );
          break;

        default:
          // ไม่ทำอะไร สำหรับ events ที่ไม่ต้องแจ้งเตือน
          break;
      }
    } catch (error) {
      console.error(`Failed to handle workflow event ${eventType}:`, error);
    }
  }

  /**
   * ดึงการแจ้งเตือนของผู้ใช้
   */
  async getUserNotifications(userId, options = {}) {
    const { unreadOnly = false, limit = 50, category = null, priority = null } = options;

    // TODO: Implement database query
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.recipientId === userId)
      .filter(n => !unreadOnly || n.status === 'unread')
      .filter(n => !category || n.category === category)
      .filter(n => !priority || n.priority === priority)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return notifications;
  }

  /**
   * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
   */
  async markNotificationAsRead(notificationId, userId) {
    const notification = this.notifications.get(notificationId);

    if (!notification || notification.recipientId !== userId) {
      throw new Error('Notification not found');
    }

    notification.status = 'read';
    notification.readAt = new Date();

    await this.saveNotification(notification);

    this.emit('notification_read', {
      notificationId,
      userId
    });

    return notification;
  }

  /**
   * ดึงสถิติการแจ้งเตือน
   */
  async getNotificationStatistics(userId) {
    const notifications = await this.getUserNotifications(userId);

    return {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byCategory: this.groupBy(notifications, 'category'),
      byPriority: this.groupBy(notifications, 'priority'),
      recent: notifications.slice(0, 5)
    };
  }

  // ==================== Helper Methods ====================

  createEmptyFarmerDashboard() {
    return {
      farmerId: null,
      farmerName: 'ยังไม่ได้สมัคร',
      currentApplication: null,
      quickActions: [{ action: 'create_application', label: 'สมัครใหม่', icon: '📝' }],
      notifications: [],
      payments: { total: 0, paid: 0, pending: 0 },
      timeline: [],
      documents: { total: 0, uploaded: 0, approved: 0 },
      nextSteps: ['สมัครใช้งานระบบ GACP'],
      lastUpdated: new Date()
    };
  }

  generateFarmerQuickActions(application) {
    const actions = [];
    const status = application.currentState;

    switch (status) {
      case 'payment_pending_1':
      case 'payment_pending_2':
        actions.push({
          action: 'make_payment',
          label: 'ชำระเงิน',
          icon: '💰',
          urgent: true
        });
        break;
      case 'document_revision':
        actions.push({
          action: 'upload_documents',
          label: 'แก้ไขเอกสาร',
          icon: '📄',
          urgent: true
        });
        break;
      case 'certificate_issued':
        actions.push({
          action: 'download_certificate',
          label: 'ดาวน์โหลดใบรับรอง',
          icon: '📜'
        });
        break;
    }

    actions.push({
      action: 'view_status',
      label: 'ดูสถานะ',
      icon: '📊'
    });

    return actions;
  }

  generateStaffQuickActions() {
    return [
      { action: 'review_documents', label: 'ตรวจสอบเอกสาร', icon: '📋' },
      { action: 'schedule_inspection', label: 'นัดตรวจฟาร์ม', icon: '📅' },
      { action: 'view_workqueue', label: 'ดูงานรอดำเนินการ', icon: '📝' },
      { action: 'generate_report', label: 'สร้างรายงาน', icon: '📊' }
    ];
  }

  generatePaymentSummary(application) {
    const phase1 = application.payments?.phase1 || {};
    const phase2 = application.payments?.phase2 || {};

    return {
      total: 30000,
      paid:
        (phase1.status === 'completed' ? 5000 : 0) + (phase2.status === 'completed' ? 25000 : 0),
      pending: (phase1.status === 'pending' ? 5000 : 0) + (phase2.status === 'pending' ? 25000 : 0),
      phases: [
        {
          phase: 1,
          amount: 5000,
          status: phase1.status || 'pending',
          description: 'ค่าธรรมเนียมตรวจสอบเอกสาร'
        },
        {
          phase: 2,
          amount: 25000,
          status: phase2.status || 'pending',
          description: 'ค่าธรรมเนียมตรวจสอบภาคสนาม'
        }
      ]
    };
  }

  generateTimeline(application) {
    return (application.history || [])
      .map(event => ({
        date: event.timestamp,
        action: event.action,
        note: event.note,
        actor: event.actor,
        icon: this.getTimelineIcon(event.action)
      }))
      .sort((a, b) => b.date - a.date);
  }

  generateDocumentStatus(application) {
    const requiredDocs = 8; // จำนวนเอกสารที่จำเป็น
    const uploadedDocs = Object.keys(application.documents || {}).length;
    const approvedDocs = application.documentReview?.status === 'approved' ? uploadedDocs : 0;

    return {
      total: requiredDocs,
      uploaded: uploadedDocs,
      approved: approvedDocs,
      completion: Math.round((uploadedDocs / requiredDocs) * 100)
    };
  }

  generateNextSteps(application) {
    const status = this.statusManager.getDisplayStatus(application.currentState);
    return [status.nextAction];
  }

  getTimelineIcon(action) {
    const icons = {
      APPLICATION_CREATED: '📝',
      APPLICATION_SUBMITTED: '📤',
      PAYMENT_1_CONFIRMED: '💰',
      DOCUMENT_APPROVED: '✅',
      PAYMENT_2_CONFIRMED: '💰',
      INSPECTION_COMPLETED: '🔍',
      FINAL_APPROVAL_GRANTED: '👍',
      CERTIFICATE_ISSUED: '🏆'
    };
    return icons[action] || '📋';
  }

  findNotificationTypeConfig(notificationType) {
    for (const role of Object.values(this.notificationTypes)) {
      if (role[notificationType.toUpperCase()]) {
        return role[notificationType.toUpperCase()];
      }
    }
    return null;
  }

  formatMessage(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  async sendThroughChannel(notification, channel) {
    // TODO: Implement actual channel integration
    switch (channel) {
      case 'email':
        return this.sendEmail(notification);
      case 'sms':
        return this.sendSMS(notification);
      case 'line':
        return this.sendLineNotify(notification);
      default:
        return this.saveToInApp(notification);
    }
  }

  async sendEmail(notification) {
    // TODO: Implement email sending
    return { channel: 'email', status: 'sent', notification };
  }

  async sendSMS(notification) {
    // TODO: Implement SMS sending
    return { channel: 'sms', status: 'sent', notification };
  }

  async sendLineNotify(notification) {
    // TODO: Implement LINE Notify
    return { channel: 'line', status: 'sent', notification };
  }

  async saveToInApp(notification) {
    this.notifications.set(notification.id, notification);
    return { channel: 'in_app', status: 'saved', notification };
  }

  async saveNotification(notification) {
    // TODO: Implement database save
    this.notifications.set(notification.id, notification);
    return notification;
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  isDueToday(date) {
    if (!date) return false;
    const today = new Date();
    const due = new Date(date);
    return due.toDateString() === today.toDateString();
  }

  isDueThisWeek(date) {
    if (!date) return false;
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const due = new Date(date);
    return due >= today && due <= weekFromNow;
  }

  isOverdue(date) {
    if (!date) return false;
    const today = new Date();
    const due = new Date(date);
    return due < today;
  }

  // TODO: Implement these methods with actual database queries
  async getApplicationsByFarmer(farmerId) {
    throw new Error(`Database integration needed for farmer ID: ${farmerId}`);
  }

  async getFarmerNotifications(farmerId) {
    return await this.getUserNotifications(farmerId, { limit: 10 });
  }

  async getStaffWorkItems(staffId) {
    // TODO: Implement work items for staff
    console.log(`Getting work items for staff: ${staffId}`);
    return [];
  }

  async getStaffStatistics(staffId) {
    // TODO: Implement statistics for staff
    console.log(`Getting statistics for staff: ${staffId}`);
    return {};
  }

  async getStaffNotifications(staffId) {
    return await this.getUserNotifications(staffId, { limit: 10 });
  }

  async getRecentActivities(staffId) {
    // TODO: Implement recent activities
    console.log(`Getting recent activities for staff: ${staffId}`);
    return [];
  }

  async getOverallStatistics() {
    // TODO: Implement overall statistics
    return {};
  }

  async getRecentApplications(limit) {
    // TODO: Implement recent applications
    console.log(`Getting recent applications with limit: ${limit}`);
    return [];
  }

  async getSystemAlerts() {
    // TODO: Implement
    return [];
  }

  async getPendingApprovals() {
    // TODO: Implement
    return [];
  }

  async getAdminNotifications(adminId) {
    return await this.getUserNotifications(adminId, { limit: 10 });
  }
}

// Export
module.exports = {
  GACPDashboardNotificationSystem,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS
};
