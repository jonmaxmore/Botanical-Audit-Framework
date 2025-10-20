/**
 * 📊 GACP Status Manager
 * จัดการสถานะและการแสดงผลที่เข้าใจง่ายสำหรับเกษตรกร
 *
 * Features:
 * - แปลงสถานะทางเทคนิคเป็นภาษาไทยที่เข้าใจง่าย
 * - สร้าง Progress Bar แสดงความคืบหนา
 * - ประมาณการเวลาที่เหลือ
 * - คำแนะนำสำหรับแต่ละขั้นตอน
 */

const { EventEmitter } = require('events');

// สถานะที่เป็นมิตรกับเกษตรกร
const USER_FRIENDLY_STATES = {
  // สถานะการสมัคร
  draft: {
    th: 'กำลังเตรียมเอกสาร',
    en: 'Preparing Documents',
    description: 'ยังไม่ได้ส่งใบสมัคร กำลังเตรียมเอกสารประกอบการสมัคร',
    color: '#6B7280',
    icon: '📝',
    progress: 0,
    nextStep: 'ส่งใบสมัครและชำระเงินงวดแรก',
    estimatedDays: null,
    userAction: 'กรุณาตรวจสอบเอกสารให้ครบถ้วนและส่งใบสมัคร'
  },

  submitted: {
    th: 'ส่งใบสมัครแล้ว',
    en: 'Application Submitted',
    description: 'ได้รับใบสมัครเรียบร้อยแล้ว รอการตรวจสอบเบื้องต้น',
    color: '#3B82F6',
    icon: '📤',
    progress: 12.5,
    nextStep: 'รอเจ้าหน้าที่ตรวจสอบเอกสาร',
    estimatedDays: 2,
    userAction: 'รอการแจ้งผลการตรวจสอบเอกสารเบื้องต้น'
  },

  payment_first_pending: {
    th: 'รอชำระเงินงวดแรก',
    en: 'Awaiting First Payment',
    description: 'รอชำระค่าธรรมเนียมงวดแรก 5,000 บาท เพื่อเริ่มตรวจสอบเอกสาร',
    color: '#EF4444',
    icon: '💰',
    progress: 12.5,
    nextStep: 'ชำระเงิน 5,000 บาท',
    estimatedDays: null,
    userAction: 'กรุณาชำระเงินตามช่องทางที่กำหนดภายใน 7 วัน'
  },

  payment_first_paid: {
    th: 'ชำระเงินงวดแรกแล้ว',
    en: 'First Payment Completed',
    description: 'ได้รับเงินงวดแรกเรียบร้อย เริ่มตรวจสอบเอกสารแล้ว',
    color: '#10B981',
    icon: '✅',
    progress: 25,
    nextStep: 'ตรวจสอบเอกสารโดยเจ้าหน้าที่',
    estimatedDays: 5,
    userAction: 'รอผลการตรวจสอบเอกสาร (ใช้เวลา 3-5 วันทำการ)'
  },

  document_review: {
    th: 'กำลังตรวจสอบเอกสาร',
    en: 'Document Under Review',
    description: 'เจ้าหน้าที่กำลังตรวจสอบเอกสารประกอบการสมัครของท่าน',
    color: '#F59E0B',
    icon: '📋',
    progress: 37.5,
    nextStep: 'รอผลการตรวจสอบเอกสาร',
    estimatedDays: 3,
    userAction: 'รอผลการตรวจสอบ หากมีปัญหาจะแจ้งให้ทราบ'
  },

  document_approved: {
    th: 'เอกสารผ่านการตรวจสอบ',
    en: 'Documents Approved',
    description: 'เอกสารครบถ้วนและถูกต้อง พร้อมเข้าสู่ขั้นตอนตรวจฟาร์ม',
    color: '#10B981',
    icon: '📄',
    progress: 50,
    nextStep: 'ชำระเงินงวดที่สอง 25,000 บาท',
    estimatedDays: null,
    userAction: 'กรุณาชำระเงินงวดที่สองเพื่อเข้าสู่ขั้นตอนตรวจฟาร์ม'
  },

  document_rejected: {
    th: 'เอกสารไม่ผ่านการตรวจสอบ',
    en: 'Documents Rejected',
    description: 'เอกสารมีปัญหาต้องแก้ไข กรุณาตรวจสอบรายละเอียด',
    color: '#EF4444',
    icon: '❌',
    progress: 25,
    nextStep: 'แก้ไขเอกสารตามที่แจ้ง',
    estimatedDays: null,
    userAction: 'แก้ไขเอกสารตามคำแนะนำและส่งใหม่'
  },

  payment_second_pending: {
    th: 'รอชำระเงินงวดที่สอง',
    en: 'Awaiting Second Payment',
    description: 'รอชำระค่าธรรมเนียมงวดที่สอง 25,000 บาท เพื่อเริ่มตรวจฟาร์ม',
    color: '#EF4444',
    icon: '💳',
    progress: 50,
    nextStep: 'ชำระเงิน 25,000 บาท',
    estimatedDays: null,
    userAction: 'ชำระเงินเพื่อให้เจ้าหน้าที่มาตรวจฟาร์ม'
  },

  payment_second_paid: {
    th: 'ชำระเงินครบแล้ว',
    en: 'Full Payment Completed',
    description: 'ได้รับเงินครบทั้ง 30,000 บาท พร้อมนัดหมายตรวจฟาร์ม',
    color: '#10B981',
    icon: '💰',
    progress: 62.5,
    nextStep: 'นัดหมายตรวจฟาร์ม',
    estimatedDays: 3,
    userAction: 'รอเจ้าหน้าที่ติดต่อนัดหมายวันตรวจฟาร์ม'
  },

  inspection_scheduled: {
    th: 'นัดหมายตรวจฟาร์มแล้ว',
    en: 'Farm Inspection Scheduled',
    description: 'กำหนดวันเวลาตรวจฟาร์มเรียบร้อย',
    color: '#8B5CF6',
    icon: '📅',
    progress: 75,
    nextStep: 'เจ้าหน้าที่มาตรวจฟาร์ม',
    estimatedDays: 7,
    userAction: 'เตรียมฟาร์มและเอกสารให้พร้อมสำหรับวันตรวจ'
  },

  inspection_in_progress: {
    th: 'กำลังตรวจฟาร์ม',
    en: 'Farm Inspection in Progress',
    description: 'เจ้าหน้าที่กำลังตรวจสอบฟาร์มของท่าน',
    color: '#F59E0B',
    icon: '🔍',
    progress: 87.5,
    nextStep: 'รอผลการตรวจฟาร์ม',
    estimatedDays: 1,
    userAction: 'ให้ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ'
  },

  inspection_passed: {
    th: 'ผ่านการตรวจฟาร์ม',
    en: 'Farm Inspection Passed',
    description: 'ฟาร์มผ่านการตรวจสอบตามมาตรฐาน GACP',
    color: '#10B981',
    icon: '✅',
    progress: 100,
    nextStep: 'รับใบรับรอง GACP',
    estimatedDays: 2,
    userAction: 'รอรับใบรับรอง GACP ภายใน 2-3 วันทำการ'
  },

  inspection_failed: {
    th: 'ไม่ผ่านการตรวจฟาร์ม',
    en: 'Farm Inspection Failed',
    description: 'ฟาร์มยังไม่ผ่านตามมาตรฐาน กรุณาปรับปรุงตามคำแนะนำ',
    color: '#EF4444',
    icon: '❌',
    progress: 75,
    nextStep: 'ปรับปรุงฟาร์มตามคำแนะนำ',
    estimatedDays: null,
    userAction: 'ปรับปรุงฟาร์มและขอตรวจใหม่ (ไม่เสียค่าใช้จ่ายเพิ่ม)'
  },

  certificate_issued: {
    th: 'ได้รับใบรับรอง GACP',
    en: 'GACP Certificate Issued',
    description: 'ยินดีด้วย! ได้รับใบรับรอง GACP เรียบร้อยแล้ว',
    color: '#059669',
    icon: '🏆',
    progress: 100,
    nextStep: 'เสร็จสิ้นกระบวนการ',
    estimatedDays: null,
    userAction: 'ดาวน์โหลดใบรับรองและเริ่มใช้งาน'
  },

  certificate_expired: {
    th: 'ใบรับรองหมดอายุ',
    en: 'Certificate Expired',
    description: 'ใบรับรอง GACP หมดอายุแล้ว กรุณาต่ออายุ',
    color: '#DC2626',
    icon: '⏰',
    progress: 0,
    nextStep: 'ต่ออายุใบรับรอง',
    estimatedDays: null,
    userAction: 'ติดต่อเจ้าหน้าที่เพื่อขอต่ออายุใบรับรอง'
  },

  cancelled: {
    th: 'ยกเลิกคำขอ',
    en: 'Application Cancelled',
    description: 'คำขอได้รับการยกเลิกแล้ว',
    color: '#6B7280',
    icon: '🚫',
    progress: 0,
    nextStep: 'สมัครใหม่ (หากต้องการ)',
    estimatedDays: null,
    userAction: 'หากต้องการสมัครใหม่ กรุณาเริ่มกระบวนการใหม่'
  }
};

// สีสำหรับ Progress Bar
const PROGRESS_COLORS = {
  low: '#EF4444', // แดง (0-33%)
  medium: '#F59E0B', // เหลือง (34-66%)
  high: '#10B981', // เขียว (67-89%)
  complete: '#059669' // เขียวเข้ม (90-100%)
};

class GACPStatusManager extends EventEmitter {
  constructor() {
    super();
    this.states = USER_FRIENDLY_STATES;
    this.progressColors = PROGRESS_COLORS;
  }

  /**
   * แปลงสถานะเทคนิคเป็นข้อมูลที่เข้าใจง่าย
   */
  getStatusInfo(technicalStatus, additionalData = {}) {
    const status = this.states[technicalStatus];

    if (!status) {
      return {
        th: 'สถานะไม่ทราบ',
        en: 'Unknown Status',
        description: 'ไม่สามารถระบุสถานะได้ กรุณาติดต่อเจ้าหน้าที่',
        color: '#6B7280',
        icon: '❓',
        progress: 0,
        nextStep: 'ติดต่อเจ้าหน้าที่',
        estimatedDays: null,
        userAction: 'กรุณาติดต่อเจ้าหน้าที่เพื่อสอบถามสถานะ'
      };
    }

    // เพิ่มข้อมูลเสริม
    return {
      ...status,
      technicalStatus,
      timestamp: new Date(),
      ...additionalData
    };
  }

  /**
   * สร้าง Progress Bar HTML
   */
  generateProgressBar(progress, options = {}) {
    const {
      width = 300,
      height = 24,
      showPercentage = true,
      showText = true,
      animated = true
    } = options;

    // เลือกสี
    let color = PROGRESS_COLORS.low;
    if (progress >= 90) color = PROGRESS_COLORS.complete;
    else if (progress >= 67) color = PROGRESS_COLORS.high;
    else if (progress >= 34) color = PROGRESS_COLORS.medium;

    const progressBarHtml = `
      <div class="gacp-progress-container" style="width: ${width}px; background-color: #E5E7EB; border-radius: 12px; overflow: hidden;">
        <div class="gacp-progress-bar ${animated ? 'animated' : ''}" 
             style="width: ${progress}%; height: ${height}px; background-color: ${color}; 
                    transition: width 0.5s ease-in-out; display: flex; align-items: center; justify-content: center;">
          ${showText && progress > 10 ? `<span style="color: white; font-size: 12px; font-weight: bold;">${progress.toFixed(0)}%</span>` : ''}
        </div>
        ${showPercentage && progress <= 10 ? `<div style="text-align: center; margin-top: 4px; font-size: 12px; color: #6B7280;">${progress.toFixed(0)}%</div>` : ''}
      </div>
    `;

    return progressBarHtml;
  }

  /**
   * คำนวณเวลาที่เหลือโดยประมาณ
   */
  calculateEstimatedCompletion(currentStatus, createdDate = null) {
    const statusInfo = this.getStatusInfo(currentStatus);
    const baseDate = createdDate || new Date();
    console.log(`Calculating completion for status ${currentStatus} from date ${baseDate}`);

    if (!statusInfo.estimatedDays) {
      return {
        message: 'ไม่สามารถประมาณเวลาได้',
        daysRemaining: null,
        estimatedDate: null
      };
    }

    const now = new Date();
    const estimatedDate = new Date(now);
    estimatedDate.setDate(now.getDate() + statusInfo.estimatedDays);

    return {
      message: `ประมาณ ${statusInfo.estimatedDays} วันทำการ`,
      daysRemaining: statusInfo.estimatedDays,
      estimatedDate: estimatedDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }

  /**
   * สร้างการแจ้งเตือนสำหรับสถานะ
   */
  generateStatusNotification(currentStatus, previousStatus = null) {
    const statusInfo = this.getStatusInfo(currentStatus);
    const isUpgrade = previousStatus && this.isStatusUpgrade(previousStatus, currentStatus);

    return {
      title: statusInfo.th,
      message: statusInfo.description,
      type: this.getNotificationType(currentStatus),
      icon: statusInfo.icon,
      action: statusInfo.userAction,
      nextStep: statusInfo.nextStep,
      isUpgrade,
      urgency: this.getUrgencyLevel(currentStatus),
      showInApp: true,
      sendEmail: this.shouldSendEmail(currentStatus),
      sendSMS: this.shouldSendSMS(currentStatus)
    };
  }

  /**
   * ตรวจสอบว่าเป็นการอัพเกรดสถานะหรือไม่
   */
  isStatusUpgrade(oldStatus, newStatus) {
    const oldProgress = this.states[oldStatus]?.progress || 0;
    const newProgress = this.states[newStatus]?.progress || 0;
    return newProgress > oldProgress;
  }

  /**
   * กำหนดประเภทการแจ้งเตือน
   */
  getNotificationType(status) {
    const statusInfo = this.states[status];
    if (!statusInfo) return 'info';

    if (status.includes('rejected') || status.includes('failed') || status.includes('cancelled')) {
      return 'error';
    }

    if (status.includes('pending') || status.includes('expired')) {
      return 'warning';
    }

    if (status.includes('approved') || status.includes('passed') || status.includes('issued')) {
      return 'success';
    }

    return 'info';
  }

  /**
   * กำหนดระดับความเร่งด่วน
   */
  getUrgencyLevel(status) {
    if (status.includes('pending') || status.includes('expired')) {
      return 'high';
    }

    if (status.includes('rejected') || status.includes('failed')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * ตัดสินใจว่าควรส่งอีเมลหรือไม่
   */
  shouldSendEmail(status) {
    const emailStatuses = [
      'payment_first_pending',
      'payment_second_pending',
      'document_approved',
      'document_rejected',
      'inspection_scheduled',
      'inspection_passed',
      'inspection_failed',
      'certificate_issued',
      'certificate_expired'
    ];

    return emailStatuses.includes(status);
  }

  /**
   * ตัดสินใจว่าควรส่ง SMS หรือไม่
   */
  shouldSendSMS(status) {
    const smsStatuses = [
      'payment_first_pending',
      'payment_second_pending',
      'inspection_scheduled',
      'certificate_issued'
    ];

    return smsStatuses.includes(status);
  }

  /**
   * สร้างไทม์ไลน์ของสถานะ
   */
  generateTimeline(statusHistory = []) {
    return statusHistory.map((entry, index) => {
      const statusInfo = this.getStatusInfo(entry.status);
      const isCompleted = index < statusHistory.length - 1; // ไม่ใช่สถานะปัจจุบัน

      return {
        id: index + 1,
        status: entry.status,
        name: statusInfo.th,
        description: statusInfo.description,
        icon: statusInfo.icon,
        color: statusInfo.color,
        timestamp: entry.timestamp,
        isCompleted,
        isCurrent: index === statusHistory.length - 1,
        details: entry.details || null,
        actor: entry.actor || 'system',
        note: entry.note || null
      };
    });
  }

  /**
   * สร้างการ์ดแสดงสถานะสำหรับหน้าเว็บ
   */
  generateStatusCard(applicationId, currentStatus, additionalData = {}) {
    const statusInfo = this.getStatusInfo(currentStatus, additionalData);
    const progressBar = this.generateProgressBar(statusInfo.progress);
    const estimation = this.calculateEstimatedCompletion(currentStatus);

    return {
      applicationId,
      status: {
        ...statusInfo,
        progressBar,
        estimation
      },
      html: this.generateStatusCardHTML(statusInfo, progressBar, estimation)
    };
  }

  /**
   * สร้าง HTML สำหรับการ์ดสถานะ
   */
  generateStatusCardHTML(statusInfo, progressBar, estimation) {
    return `
      <div class="gacp-status-card" style="border: 2px solid ${statusInfo.color}; border-radius: 16px; padding: 24px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 32px; margin-right: 12px;">${statusInfo.icon}</span>
          <div>
            <h3 style="margin: 0; color: ${statusInfo.color}; font-size: 20px;">${statusInfo.th}</h3>
            <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 14px;">${statusInfo.description}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          ${progressBar}
        </div>
        
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">ขั้นตอนถัดไป</h4>
          <p style="margin: 0; color: #6B7280;">${statusInfo.nextStep}</p>
          ${estimation.estimatedDate ? `<p style="margin: 8px 0 0 0; color: #10B981; font-size: 14px;">⏱️ ${estimation.message} (${estimation.estimatedDate})</p>` : ''}
        </div>
        
        <div style="background: #EFF6FF; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 16px;">คำแนะนำ</h4>
          <p style="margin: 0; color: #1E40AF;">${statusInfo.userAction}</p>
        </div>
      </div>
    `;
  }

  /**
   * ดึงข้อมูลสถิติการดำเนินการ
   */
  getProcessingStatistics() {
    return {
      averageProcessingTime: {
        total: 21, // วัน
        documentReview: 5,
        farmInspection: 7,
        certificateIssue: 3
      },
      successRate: {
        overall: 85, // %
        documentApproval: 92,
        farmInspection: 87
      },
      currentBacklog: {
        documentReview: 45,
        farmInspection: 23,
        certificateIssue: 12
      }
    };
  }

  /**
   * คำนวณ SLA (Service Level Agreement)
   */
  calculateSLA(applicationCreated, currentStatus) {
    const created = new Date(applicationCreated);
    const now = new Date();
    const daysPassed = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    // SLA ตามสถานะ (วันทำการ)
    const slaTargets = {
      document_review: 5,
      inspection_scheduled: 14,
      certificate_issued: 21
    };

    const currentTarget = slaTargets[currentStatus] || 21;
    const remainingDays = Math.max(0, currentTarget - daysPassed);
    const isWithinSLA = daysPassed <= currentTarget;

    return {
      daysPassed,
      targetDays: currentTarget,
      remainingDays,
      isWithinSLA,
      slaPercentage: Math.min(100, (daysPassed / currentTarget) * 100),
      status: isWithinSLA ? 'within_sla' : 'overdue'
    };
  }
}

// ฟังก์ชันช่วยสำหรับใช้งานภายนอก
function getStatusDisplay(technicalStatus) {
  const manager = new GACPStatusManager();
  return manager.getStatusInfo(technicalStatus);
}

function createProgressBar(progress, width = 300) {
  const manager = new GACPStatusManager();
  return manager.generateProgressBar(progress, { width });
}

// Export
module.exports = {
  GACPStatusManager,
  USER_FRIENDLY_STATES,
  PROGRESS_COLORS,
  getStatusDisplay,
  createProgressBar
};
