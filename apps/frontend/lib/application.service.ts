import { GACPApplication, ApplicationStatus, WorkflowHistory } from '../types/application.types';
import { UserRole } from '../types/user.types';
import { WorkflowService } from './workflow.service';

export class ApplicationService {
  private static STORAGE_KEY = 'gacp_applications';
  private static HISTORY_KEY = 'gacp_workflow_history';

  // ดึงรายการใบสมัครทั้งหมด
  static getAllApplications(): GACPApplication[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // ดึงใบสมัครตาม ID
  static getApplicationById(id: string): GACPApplication | null {
    const applications = this.getAllApplications();
    return applications.find(app => app.id === id) || null;
  }

  // ดึงใบสมัครของเกษตรกร
  static getApplicationsByFarmer(farmerId: string): GACPApplication[] {
    return this.getAllApplications().filter(app => app.farmerId === farmerId);
  }

  // ดึงใบสมัครตามสถานะ
  static getApplicationsByStatus(status: ApplicationStatus): GACPApplication[] {
    return this.getAllApplications().filter(app => app.status === status);
  }

  // ดึงใบสมัครที่ต้องตรวจสอบเอกสาร
  static getApplicationsForDocumentChecker(): GACPApplication[] {
    return this.getApplicationsByStatus(ApplicationStatus.SUBMITTED);
  }

  // ดึงใบสมัครที่ต้องตรวจประเมิน
  static getApplicationsForInspector(inspectorId?: string): GACPApplication[] {
    const apps = this.getAllApplications();
    return apps.filter(
      app =>
        app.status === ApplicationStatus.DOCUMENT_APPROVED ||
        app.status === ApplicationStatus.INSPECTION_SCHEDULED ||
        app.status === ApplicationStatus.INSPECTING ||
        (inspectorId && app.inspectorId === inspectorId)
    );
  }

  // ดึงใบสมัครที่รออนุมัติ
  static getApplicationsForApprover(): GACPApplication[] {
    return this.getApplicationsByStatus(ApplicationStatus.PENDING_APPROVAL);
  }

  // สร้างใบสมัครใหม่
  static createApplication(data: Partial<GACPApplication>): GACPApplication {
    const applications = this.getAllApplications();
    const newApp: GACPApplication = {
      id: `APP${(applications.length + 1).toString().padStart(3, '0')}`,
      applicationNumber: `GACP-${new Date().getFullYear()}-${(applications.length + 1).toString().padStart(3, '0')}`,
      status: ApplicationStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    } as GACPApplication;

    applications.push(newApp);
    this.saveApplications(applications);

    this.addWorkflowHistory({
      applicationId: newApp.id,
      fromStatus: ApplicationStatus.DRAFT,
      toStatus: ApplicationStatus.DRAFT,
      performedBy: data.farmerId || '',
      performedByName: data.farmerName || '',
      performedByRole: UserRole.FARMER,
      notes: 'สร้างใบสมัครใหม่',
      timestamp: new Date()
    });

    return newApp;
  }

  // อัพเดทสถานะใบสมัคร
  static updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    performedBy: string,
    performedByName: string,
    performedByRole: UserRole,
    notes?: string,
    additionalData?: Partial<GACPApplication>
  ): boolean {
    const applications = this.getAllApplications();
    const appIndex = applications.findIndex(app => app.id === applicationId);

    if (appIndex === -1) return false;

    const app = applications[appIndex];

    // ตรวจสอบ workflow
    if (!WorkflowService.canTransition(app.status, newStatus)) {
      console.error('Invalid workflow transition');
      return false;
    }

    if (!WorkflowService.hasPermission(performedByRole, newStatus)) {
      console.error('User does not have permission');
      return false;
    }

    const oldStatus = app.status;

    applications[appIndex] = {
      ...app,
      ...additionalData,
      status: newStatus,
      updatedAt: new Date()
    };

    this.saveApplications(applications);

    this.addWorkflowHistory({
      applicationId,
      fromStatus: oldStatus,
      toStatus: newStatus,
      performedBy,
      performedByName,
      performedByRole,
      notes,
      timestamp: new Date()
    });

    return true;
  }

  // อัพเดทข้อมูลใบสมัคร
  static updateApplication(id: string, data: Partial<GACPApplication>): boolean {
    const applications = this.getAllApplications();
    const appIndex = applications.findIndex(app => app.id === id);

    if (appIndex === -1) return false;

    applications[appIndex] = {
      ...applications[appIndex],
      ...data,
      updatedAt: new Date()
    };

    this.saveApplications(applications);
    return true;
  }

  // ลบใบสมัคร (เฉพาะ DRAFT)
  static deleteApplication(id: string): boolean {
    const applications = this.getAllApplications();
    const app = applications.find(a => a.id === id);

    if (!app || app.status !== ApplicationStatus.DRAFT) {
      return false;
    }

    const filtered = applications.filter(a => a.id !== id);
    this.saveApplications(filtered);
    return true;
  }

  // บันทึกใบสมัครทั้งหมด
  private static saveApplications(applications: GACPApplication[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(applications));
    }
  }

  // Workflow History
  static getWorkflowHistory(applicationId: string): WorkflowHistory[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.HISTORY_KEY);
    const allHistory: WorkflowHistory[] = data ? JSON.parse(data) : [];

    return allHistory.filter(h => h.applicationId === applicationId);
  }

  private static addWorkflowHistory(history: Omit<WorkflowHistory, 'id'>): void {
    if (typeof window === 'undefined') return;

    const data = localStorage.getItem(this.HISTORY_KEY);
    const allHistory: WorkflowHistory[] = data ? JSON.parse(data) : [];

    const newHistory: WorkflowHistory = {
      id: `WH${(allHistory.length + 1).toString().padStart(6, '0')}`,
      ...history
    };

    allHistory.push(newHistory);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(allHistory));
  }

  // สถิติ
  static getStatistics() {
    const applications = this.getAllApplications();

    return {
      total: applications.length,
      draft: applications.filter(a => a.status === ApplicationStatus.DRAFT).length,
      submitted: applications.filter(a => a.status === ApplicationStatus.SUBMITTED).length,
      documentChecking: applications.filter(a => a.status === ApplicationStatus.DOCUMENT_CHECKING)
        .length,
      documentApproved: applications.filter(a => a.status === ApplicationStatus.DOCUMENT_APPROVED)
        .length,
      documentRejected: applications.filter(a => a.status === ApplicationStatus.DOCUMENT_REJECTED)
        .length,
      inspectionScheduled: applications.filter(
        a => a.status === ApplicationStatus.INSPECTION_SCHEDULED
      ).length,
      inspecting: applications.filter(a => a.status === ApplicationStatus.INSPECTING).length,
      inspectionPassed: applications.filter(a => a.status === ApplicationStatus.INSPECTION_PASSED)
        .length,
      inspectionFailed: applications.filter(a => a.status === ApplicationStatus.INSPECTION_FAILED)
        .length,
      pendingApproval: applications.filter(a => a.status === ApplicationStatus.PENDING_APPROVAL)
        .length,
      approved: applications.filter(a => a.status === ApplicationStatus.APPROVED).length,
      rejected: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
      certificateIssued: applications.filter(a => a.status === ApplicationStatus.CERTIFICATE_ISSUED)
        .length
    };
  }
}
