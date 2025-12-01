import { ApplicationStatus } from '../types/application.types';
import { UserRole } from '../types/user.types';

// กำหนด workflow transitions ที่ถูกต้อง
export const WORKFLOW_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.DOCUMENT_CHECKING],
  [ApplicationStatus.DOCUMENT_CHECKING]: [
    ApplicationStatus.DOCUMENT_APPROVED,
    ApplicationStatus.DOCUMENT_REJECTED
  ],
  [ApplicationStatus.DOCUMENT_APPROVED]: [ApplicationStatus.INSPECTION_SCHEDULED],
  [ApplicationStatus.DOCUMENT_REJECTED]: [ApplicationStatus.SUBMITTED], // ให้แก้ไขและส่งใหม่
  [ApplicationStatus.INSPECTION_SCHEDULED]: [ApplicationStatus.INSPECTING],
  [ApplicationStatus.INSPECTING]: [ApplicationStatus.INSPECTION_COMPLETED],
  [ApplicationStatus.INSPECTION_COMPLETED]: [
    ApplicationStatus.INSPECTION_PASSED,
    ApplicationStatus.INSPECTION_FAILED
  ],
  [ApplicationStatus.INSPECTION_PASSED]: [ApplicationStatus.PENDING_APPROVAL],
  [ApplicationStatus.INSPECTION_FAILED]: [ApplicationStatus.SUBMITTED], // ให้ปรับปรุงและส่งใหม่
  [ApplicationStatus.PENDING_APPROVAL]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  [ApplicationStatus.APPROVED]: [ApplicationStatus.CERTIFICATE_ISSUED],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.SUBMITTED], // ให้แก้ไขและส่งใหม่
  [ApplicationStatus.CERTIFICATE_ISSUED]: [] // สถานะสุดท้าย
};

// กำหนดสิทธิ์ในการเปลี่ยนสถานะตาม Role
export const ROLE_PERMISSIONS: Record<UserRole, ApplicationStatus[]> = {
  [UserRole.FARMER]: [ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED],
  [UserRole.DOCUMENT_CHECKER]: [
    ApplicationStatus.DOCUMENT_CHECKING,
    ApplicationStatus.DOCUMENT_APPROVED,
    ApplicationStatus.DOCUMENT_REJECTED
  ],
  [UserRole.INSPECTOR]: [
    ApplicationStatus.INSPECTION_SCHEDULED,
    ApplicationStatus.INSPECTING,
    ApplicationStatus.INSPECTION_COMPLETED,
    ApplicationStatus.INSPECTION_PASSED,
    ApplicationStatus.INSPECTION_FAILED
  ],
  [UserRole.APPROVER]: [
    ApplicationStatus.PENDING_APPROVAL,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.CERTIFICATE_ISSUED
  ],
  [UserRole.ADMIN]: Object.values(ApplicationStatus) // Admin มีสิทธิ์ทุกสถานะ
};

// เพิ่มการรองรับกรณีพิเศษในระบบ
export const SPECIAL_TRANSITIONS: Record<string, ApplicationStatus[]> = {
  // กรณีผู้ตรวจเอกสารติดภารกิจ สามารถส่งต่อให้ผู้ตรวจคนอื่น
  REASSIGN_DOCUMENT_CHECKER: [ApplicationStatus.DOCUMENT_CHECKING],

  // กรณีเลื่อนวันตรวจประเมิน
  RESCHEDULE_INSPECTION: [ApplicationStatus.INSPECTION_SCHEDULED],

  // กรณีฉุกเฉินต้องหยุดกระบวนการ
  EMERGENCY_STOP: Object.values(ApplicationStatus),

  // กรณีเกษตรกรต้องการยกเลิกคำขอ
  FARMER_CANCEL: [
    ApplicationStatus.DRAFT,
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.DOCUMENT_CHECKING,
    ApplicationStatus.DOCUMENT_APPROVED,
    ApplicationStatus.DOCUMENT_REJECTED
  ],

  // กรณีต้องการปรับปรุงระบบ
  ADMIN_OVERRIDE: Object.values(ApplicationStatus)
};

export class WorkflowService {
  // ตรวจสอบว่าสามารถเปลี่ยนสถานะได้หรือไม่
  static canTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean {
    const allowedTransitions = WORKFLOW_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  // ตรวจสอบว่า Role มีสิทธิ์จัดการสถานะนี้หรือไม่
  static hasPermission(role: UserRole, status: ApplicationStatus): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(status);
  }

  // ตรวจสอบว่า Role สามารถเปลี่ยนจากสถานะปัจจุบันไปสถานะใหม่ได้หรือไม่
  static canUserPerformTransition(
    role: UserRole,
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus
  ): boolean {
    return this.canTransition(currentStatus, newStatus) && this.hasPermission(role, newStatus);
  }

  // รับสถานะถัดไปที่เป็นไปได้สำหรับ Role นั้นๆ
  static getNextPossibleStatuses(
    role: UserRole,
    currentStatus: ApplicationStatus
  ): ApplicationStatus[] {
    const possibleTransitions = WORKFLOW_TRANSITIONS[currentStatus] || [];
    return possibleTransitions.filter(status => this.hasPermission(role, status));
  }

  // รับป้ายกำกับสถานะภาษาไทย
  static getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DRAFT]: 'ฉบับร่าง',
      [ApplicationStatus.SUBMITTED]: 'ยื่นคำขอแล้ว',
      [ApplicationStatus.DOCUMENT_CHECKING]: 'กำลังตรวจสอบเอกสาร',
      [ApplicationStatus.DOCUMENT_APPROVED]: 'เอกสารผ่านการตรวจสอบ',
      [ApplicationStatus.DOCUMENT_REJECTED]: 'เอกสารไม่ผ่าน',
      [ApplicationStatus.INSPECTION_SCHEDULED]: 'กำหนดวันตรวจประเมิน',
      [ApplicationStatus.INSPECTING]: 'กำลังตรวจประเมิน',
      [ApplicationStatus.INSPECTION_COMPLETED]: 'ตรวจประเมินเสร็จสิ้น',
      [ApplicationStatus.INSPECTION_PASSED]: 'ผ่านการตรวจประเมิน',
      [ApplicationStatus.INSPECTION_FAILED]: 'ไม่ผ่านการตรวจประเมิน',
      [ApplicationStatus.PENDING_APPROVAL]: 'รอการอนุมัติ',
      [ApplicationStatus.APPROVED]: 'อนุมัติแล้ว',
      [ApplicationStatus.REJECTED]: 'ไม่อนุมัติ',
      [ApplicationStatus.CERTIFICATE_ISSUED]: 'ออกใบรับรองแล้ว'
    };
    return labels[status] || status;
  }

  // รับสีสำหรับแสดงสถานะ
  static getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DRAFT]: '#9e9e9e',
      [ApplicationStatus.SUBMITTED]: '#2196f3',
      [ApplicationStatus.DOCUMENT_CHECKING]: '#ff9800',
      [ApplicationStatus.DOCUMENT_APPROVED]: '#4caf50',
      [ApplicationStatus.DOCUMENT_REJECTED]: '#f44336',
      [ApplicationStatus.INSPECTION_SCHEDULED]: '#2196f3',
      [ApplicationStatus.INSPECTING]: '#ff9800',
      [ApplicationStatus.INSPECTION_COMPLETED]: '#4caf50',
      [ApplicationStatus.INSPECTION_PASSED]: '#4caf50',
      [ApplicationStatus.INSPECTION_FAILED]: '#f44336',
      [ApplicationStatus.PENDING_APPROVAL]: '#ff9800',
      [ApplicationStatus.APPROVED]: '#4caf50',
      [ApplicationStatus.REJECTED]: '#f44336',
      [ApplicationStatus.CERTIFICATE_ISSUED]: '#9c27b0'
    };
    return colors[status] || '#9e9e9e';
  }

  // เพิ่มเมธอดสำหรับกรณีพิเศษ
  static canPerformSpecialTransition(
    specialCase: string,
    currentStatus: ApplicationStatus,
    role: UserRole
  ): boolean {
    // ตรวจสอบว่าสถานะปัจจุบันอยู่ในรายการที่อนุญาตหรือไม่
    const allowedStatuses = SPECIAL_TRANSITIONS[specialCase] || [];
    if (!allowedStatuses.includes(currentStatus)) return false;

    // ตรวจสอบสิทธิ์พิเศษตามบทบาท
    switch (specialCase) {
      case 'REASSIGN_DOCUMENT_CHECKER':
        return role === UserRole.ADMIN || role === UserRole.DOCUMENT_CHECKER;

      case 'RESCHEDULE_INSPECTION':
        return role === UserRole.ADMIN || role === UserRole.INSPECTOR;

      case 'EMERGENCY_STOP':
        return role === UserRole.ADMIN;

      case 'FARMER_CANCEL':
        return role === UserRole.ADMIN || role === UserRole.FARMER;

      case 'ADMIN_OVERRIDE':
        return role === UserRole.ADMIN;

      default:
        return false;
    }
  }

  // เพิ่มเมธอดวิเคราะห์ขั้นตอนที่ขาดหายไป
  static analyzeMissingSteps(
    applicationHistory: Array<{ fromStatus: ApplicationStatus; toStatus: ApplicationStatus }>
  ): { hasMissingSteps: boolean; missingSteps: string[] } {
    const result = {
      hasMissingSteps: false,
      missingSteps: [] as string[]
    };

    if (!applicationHistory.length) return result;

    let currentStatus = applicationHistory[0].fromStatus;

    for (let i = 0; i < applicationHistory.length; i++) {
      const { fromStatus, toStatus } = applicationHistory[i];

      // ตรวจสอบว่า fromStatus ตรงกับ currentStatus หรือไม่
      if (fromStatus !== currentStatus) {
        result.hasMissingSteps = true;
        result.missingSteps.push(
          `Missing transition from ${this.getStatusLabel(currentStatus)} to ${this.getStatusLabel(fromStatus)}`
        );
      }

      // อัพเดท currentStatus
      currentStatus = toStatus;
    }

    return result;
  }

  // ตรวจสอบว่ามีความขัดแย้งในการเปลี่ยนสถานะหรือไม่
  static validateWorkflowIntegrity(
    applicationHistory: Array<{
      fromStatus: ApplicationStatus;
      toStatus: ApplicationStatus;
      timestamp: Date;
    }>
  ): { isValid: boolean; errors: string[] } {
    const result = {
      isValid: true,
      errors: [] as string[]
    };

    if (!applicationHistory.length) return result;

    // เรียงลำดับตาม timestamp
    const sortedHistory = [...applicationHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let currentStatus = sortedHistory[0].fromStatus;

    for (let i = 0; i < sortedHistory.length; i++) {
      const { fromStatus, toStatus } = sortedHistory[i];

      // ตรวจสอบความสอดคล้อง
      if (fromStatus !== currentStatus) {
        result.isValid = false;
        result.errors.push(
          `Inconsistent workflow: Expected ${this.getStatusLabel(currentStatus)} but found ${this.getStatusLabel(fromStatus)}`
        );
      }

      // ตรวจสอบว่าการเปลี่ยนสถานะถูกต้องตาม WORKFLOW_TRANSITIONS
      if (!this.canTransition(fromStatus, toStatus)) {
        result.isValid = false;
        result.errors.push(
          `Invalid transition from ${this.getStatusLabel(fromStatus)} to ${this.getStatusLabel(toStatus)}`
        );
      }

      // อัพเดท currentStatus
      currentStatus = toStatus;
    }

    return result;
  }
}
