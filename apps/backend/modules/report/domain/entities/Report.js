/**
 * Report Entity
 *
 * Core business entity for report generation and management.
 * Supports multiple report types, formats, and scheduling.
 * Part of Clean Architecture - Domain Layer
 */

const { v4: uuidv4 } = require('uuid');

class Report {
  // Report Types
  static TYPE = {
    // Farmer Reports
    FARM_SUMMARY: 'FARM_SUMMARY', // ข้อมูลสรุปฟาร์ม
    CULTIVATION_HISTORY: 'CULTIVATION_HISTORY', // ประวัติการปลูก
    CERTIFICATE_STATUS: 'CERTIFICATE_STATUS', // สถานะใบรับรอง
    TRAINING_PROGRESS: 'TRAINING_PROGRESS', // ความก้าวหน้าการอบรม
    DOCUMENT_LIST: 'DOCUMENT_LIST', // รายการเอกสาร
    SURVEY_RESULTS: 'SURVEY_RESULTS', // ผลการสำรวจ

    // DTAM Reports
    APPLICATIONS_SUMMARY: 'APPLICATIONS_SUMMARY', // สรุปใบสมัคร
    CERTIFICATES_ISSUED: 'CERTIFICATES_ISSUED', // ใบรับรองที่ออก
    AUDIT_LOG: 'AUDIT_LOG', // บันทึกการตรวจสอบ
    FARMER_STATISTICS: 'FARMER_STATISTICS', // สถิติเกษตรกร
    TRAINING_STATISTICS: 'TRAINING_STATISTICS', // สถิติการอบรม
    SYSTEM_ACTIVITY: 'SYSTEM_ACTIVITY', // กิจกรรมระบบ

    // Analytics Reports
    PERFORMANCE_DASHBOARD: 'PERFORMANCE_DASHBOARD', // แดชบอร์ดประสิทธิภาพ
    COMPLIANCE_REPORT: 'COMPLIANCE_REPORT', // รายงานการปฏิบัติตาม
    MONTHLY_SUMMARY: 'MONTHLY_SUMMARY', // สรุปรายเดือน
    QUARTERLY_SUMMARY: 'QUARTERLY_SUMMARY', // สรุปรายไตรมาส
    ANNUAL_SUMMARY: 'ANNUAL_SUMMARY', // สรุปรายปี

    // Export Reports
    DATA_EXPORT: 'DATA_EXPORT', // ส่งออกข้อมูล
    CUSTOM_REPORT: 'CUSTOM_REPORT', // รายงานกำหนดเอง
  };

  // Report Formats
  static FORMAT = {
    PDF: 'PDF', // PDF document
    EXCEL: 'EXCEL', // Excel spreadsheet
    CSV: 'CSV', // CSV file
    JSON: 'JSON', // JSON data
    HTML: 'HTML', // HTML page
  };

  // Report Status
  static STATUS = {
    PENDING: 'PENDING', // รอการสร้าง
    GENERATING: 'GENERATING', // กำลังสร้าง
    COMPLETED: 'COMPLETED', // เสร็จสิ้น
    FAILED: 'FAILED', // ล้มเหลว
    EXPIRED: 'EXPIRED', // หมดอายุ
  };

  // Report Categories
  static CATEGORY = {
    FARMER: 'FARMER', // รายงานเกษตรกร
    DTAM: 'DTAM', // รายงาน DTAM
    ANALYTICS: 'ANALYTICS', // รายงานวิเคราะห์
    COMPLIANCE: 'COMPLIANCE', // รายงานการปฏิบัติตาม
    EXPORT: 'EXPORT', // ส่งออกข้อมูล
  };

  // Report Scheduling
  static SCHEDULE = {
    ONCE: 'ONCE', // ครั้งเดียว
    DAILY: 'DAILY', // รายวัน
    WEEKLY: 'WEEKLY', // รายสัปดาห์
    MONTHLY: 'MONTHLY', // รายเดือน
    QUARTERLY: 'QUARTERLY', // รายไตรมาส
    ANNUALLY: 'ANNUALLY', // รายปี
  };

  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.category = data.category || this._inferCategory(data.type);
    this.format = data.format;

    // Request information
    this.requestedBy = data.requestedBy;
    this.requestedByType = data.requestedByType || 'farmer'; // 'farmer' or 'dtam'

    // Report configuration
    this.parameters = data.parameters || {}; // { startDate, endDate, farmId, etc. }
    this.filters = data.filters || {}; // Additional filters
    this.columns = data.columns || []; // Selected columns for export
    this.sortBy = data.sortBy; // Sort field
    this.sortOrder = data.sortOrder || 'desc'; // 'asc' or 'desc'

    // Scheduling
    this.schedule = data.schedule || Report.SCHEDULE.ONCE;
    this.scheduledAt = data.scheduledAt; // When to generate
    this.nextRunAt = data.nextRunAt; // Next scheduled run
    this.lastRunAt = data.lastRunAt; // Last execution

    // Generation status
    this.status = data.status || Report.STATUS.PENDING;
    this.generatedAt = data.generatedAt;
    this.completedAt = data.completedAt;
    this.failureReason = data.failureReason;
    this.retryCount = data.retryCount || 0;
    this.maxRetries = data.maxRetries || 3;

    // Output information
    this.filePath = data.filePath; // Generated file path
    this.fileSize = data.fileSize; // File size in bytes
    this.fileName = data.fileName; // Generated file name
    this.downloadUrl = data.downloadUrl; // Download URL
    this.expiresAt = data.expiresAt; // When file expires

    // Report data (for in-memory reports)
    this.data = data.data; // Report data object
    this.summary = data.summary || {}; // Summary statistics
    this.recordCount = data.recordCount || 0; // Number of records

    // Access control
    this.isPublic = data.isPublic || false;
    this.sharedWith = data.sharedWith || []; // User IDs who can access

    // Metadata
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.downloadCount = data.downloadCount || 0;
    this.viewCount = data.viewCount || 0;

    // Timestamps
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Factory method
  static create(reportData) {
    return new Report(reportData);
  }

  // Infer category from type
  static _inferCategory(type) {
    const farmerTypes = [
      'FARM_SUMMARY',
      'CULTIVATION_HISTORY',
      'CERTIFICATE_STATUS',
      'TRAINING_PROGRESS',
      'DOCUMENT_LIST',
      'SURVEY_RESULTS',
    ];
    const dtamTypes = [
      'APPLICATIONS_SUMMARY',
      'CERTIFICATES_ISSUED',
      'AUDIT_LOG',
      'FARMER_STATISTICS',
      'TRAINING_STATISTICS',
      'SYSTEM_ACTIVITY',
    ];
    const analyticsTypes = [
      'PERFORMANCE_DASHBOARD',
      'COMPLIANCE_REPORT',
      'MONTHLY_SUMMARY',
      'QUARTERLY_SUMMARY',
      'ANNUAL_SUMMARY',
    ];
    const exportTypes = ['DATA_EXPORT', 'CUSTOM_REPORT'];

    if (farmerTypes.includes(type)) {
      return Report.CATEGORY.FARMER;
    }
    if (dtamTypes.includes(type)) {
      return Report.CATEGORY.DTAM;
    }
    if (analyticsTypes.includes(type)) {
      return Report.CATEGORY.ANALYTICS;
    }
    if (exportTypes.includes(type)) {
      return Report.CATEGORY.EXPORT;
    }

    return Report.CATEGORY.EXPORT;
  }

  // Status management methods
  startGeneration() {
    this.status = Report.STATUS.GENERATING;
    this.generatedAt = new Date();
    this.updatedAt = new Date();
  }

  completeGeneration(filePath, fileSize, fileName) {
    this.status = Report.STATUS.COMPLETED;
    this.completedAt = new Date();
    this.filePath = filePath;
    this.fileSize = fileSize;
    this.fileName = fileName;
    this.downloadUrl = `/api/reports/${this.id}/download`;

    // Set expiration (default 7 days)
    const expirationDays = this.metadata.expirationDays || 7;
    this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    this.updatedAt = new Date();
  }

  failGeneration(reason) {
    this.status = Report.STATUS.FAILED;
    this.failureReason = reason;
    this.retryCount++;
    this.updatedAt = new Date();
  }

  markAsExpired() {
    this.status = Report.STATUS.EXPIRED;
    this.updatedAt = new Date();
  }

  // Scheduling methods
  scheduleNext() {
    if (this.schedule === Report.SCHEDULE.ONCE) {
      this.nextRunAt = null;
      return;
    }

    const now = new Date();
    const nextRun = new Date(this.lastRunAt || now);

    switch (this.schedule) {
      case Report.SCHEDULE.DAILY:
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case Report.SCHEDULE.WEEKLY:
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case Report.SCHEDULE.MONTHLY:
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case Report.SCHEDULE.QUARTERLY:
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case Report.SCHEDULE.ANNUALLY:
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }

    this.nextRunAt = nextRun;
    this.lastRunAt = now;
    this.updatedAt = new Date();
  }

  // Retry logic
  canRetry() {
    return this.status === Report.STATUS.FAILED && this.retryCount < this.maxRetries;
  }

  resetForRetry() {
    this.status = Report.STATUS.PENDING;
    this.failureReason = null;
    this.updatedAt = new Date();
  }

  // Data methods
  setData(data, summary, recordCount) {
    this.data = data;
    this.summary = summary || {};
    this.recordCount = recordCount || (Array.isArray(data) ? data.length : 0);
    this.updatedAt = new Date();
  }

  clearData() {
    this.data = null;
    this.updatedAt = new Date();
  }

  // Access control methods
  canAccess(userId, userRole) {
    // Public reports
    if (this.isPublic) {
      return true;
    }

    // Owner can access
    if (this.requestedBy === userId) {
      return true;
    }

    // DTAM staff can access all reports
    if (userRole === 'dtam' || userRole === 'admin') {
      return true;
    }

    // Explicitly shared with user
    if (this.sharedWith.includes(userId)) {
      return true;
    }

    return false;
  }

  shareWith(userId) {
    if (!this.sharedWith.includes(userId)) {
      this.sharedWith.push(userId);
      this.updatedAt = new Date();
    }
  }

  unshareWith(userId) {
    this.sharedWith = this.sharedWith.filter(id => id !== userId);
    this.updatedAt = new Date();
  }

  // Tracking methods
  incrementDownloadCount() {
    this.downloadCount++;
    this.updatedAt = new Date();
  }

  incrementViewCount() {
    this.viewCount++;
    this.updatedAt = new Date();
  }

  // Query methods
  isPending() {
    return this.status === Report.STATUS.PENDING;
  }

  isGenerating() {
    return this.status === Report.STATUS.GENERATING;
  }

  isCompleted() {
    return this.status === Report.STATUS.COMPLETED;
  }

  isFailed() {
    return this.status === Report.STATUS.FAILED;
  }

  isExpired() {
    return (
      this.status === Report.STATUS.EXPIRED ||
      (this.expiresAt && new Date() > new Date(this.expiresAt))
    );
  }

  isScheduled() {
    return this.schedule !== Report.SCHEDULE.ONCE;
  }

  isDueForGeneration() {
    if (!this.isScheduled()) {
      return false;
    }
    if (!this.nextRunAt) {
      return true;
    } // First run
    return new Date() >= new Date(this.nextRunAt);
  }

  isPDF() {
    return this.format === Report.FORMAT.PDF;
  }

  isExcel() {
    return this.format === Report.FORMAT.EXCEL;
  }

  isCSV() {
    return this.format === Report.FORMAT.CSV;
  }

  // Utility methods
  getFileSizeFormatted() {
    if (!this.fileSize) {
      return 'N/A';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  getDaysUntilExpiration() {
    if (!this.expiresAt) {
      return null;
    }

    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  getGenerationDuration() {
    if (!this.generatedAt || !this.completedAt) {
      return null;
    }

    const duration = new Date(this.completedAt) - new Date(this.generatedAt);
    return Math.round(duration / 1000); // seconds
  }
}

module.exports = Report;
