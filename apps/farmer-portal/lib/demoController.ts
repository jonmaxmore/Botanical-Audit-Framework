/**
 * GACP Platform Demo Flow Controller
 *
 * จัดการ demo workflow และ navigation ระหว่างระบบต่างๆ
 */

import { demoData, demoUsers, demoApplications } from './demoData';

export class DemoFlowController {
  private currentUser: any = null;
  private currentScenario: string | null = null;
  private currentStep: number = 0;

  constructor() {
    // Initialize demo session
    this.loadDemoSession();
  }

  /**
   * เริ่มต้น demo scenario
   */
  startScenario(scenarioId: string, userRole: string = 'farmer') {
    const scenario = demoData.workflows.find(w => w.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    this.currentScenario = scenarioId;
    this.currentStep = 0;
    this.currentUser = this.getDemoUser(userRole);

    // Save to session storage
    this.saveDemoSession();

    return {
      scenario,
      currentStep: this.getCurrentStep(),
      user: this.currentUser,
    };
  }

  /**
   * ไปขั้นตอนถัดไป
   */
  nextStep() {
    if (!this.currentScenario) {
      throw new Error('No active scenario');
    }

    const scenario = demoData.workflows.find(w => w.id === this.currentScenario);
    if (!scenario) {
      throw new Error('Current scenario not found');
    }

    if (this.currentStep < scenario.steps.length - 1) {
      this.currentStep++;
      this.saveDemoSession();
    }

    return this.getCurrentStep();
  }

  /**
   * กลับขั้นตอนก่อนหน้า
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.saveDemoSession();
    }

    return this.getCurrentStep();
  }

  /**
   * ไปขั้นตอนที่ระบุ
   */
  goToStep(stepIndex: number) {
    const scenario = demoData.workflows.find(w => w.id === this.currentScenario);
    if (!scenario) {
      throw new Error('No active scenario');
    }

    if (stepIndex >= 0 && stepIndex < scenario.steps.length) {
      this.currentStep = stepIndex;
      this.saveDemoSession();
    }

    return this.getCurrentStep();
  }

  /**
   * เปลี่ยน user role
   */
  switchRole(userRole: string) {
    this.currentUser = this.getDemoUser(userRole);
    this.saveDemoSession();
    return this.currentUser;
  }

  /**
   * รีเซ็ต demo
   */
  resetDemo() {
    this.currentScenario = null;
    this.currentStep = 0;
    this.currentUser = null;
    this.clearDemoSession();
  }

  /**
   * ดึงข้อมูลขั้นตอนปัจจุบัน
   */
  getCurrentStep() {
    if (!this.currentScenario) return null;

    const scenario = demoData.workflows.find(w => w.id === this.currentScenario);
    if (!scenario) return null;

    return {
      scenario,
      currentStepIndex: this.currentStep,
      currentStepData: scenario.steps[this.currentStep],
      totalSteps: scenario.steps.length,
      isFirstStep: this.currentStep === 0,
      isLastStep: this.currentStep === scenario.steps.length - 1,
    };
  }

  /**
   * ดึงข้อมูล demo user
   */
  getDemoUser(role: string) {
    const users = demoData.users as any;
    return users[role] || users.farmer;
  }

  /**
   * ดึงข้อมูลสำหรับ role ปัจจุบัน
   */
  getCurrentUserData() {
    if (!this.currentUser) return null;

    const role = this.currentUser.role;

    switch (role) {
      case 'farmer':
        return {
          user: this.currentUser,
          applications: demoApplications.filter(app => app.applicantId === this.currentUser.id),
          certificates: demoData.certificates.filter(cert =>
            demoApplications.find(
              app => app.applicantId === this.currentUser.id && app.id === cert.applicationId,
            ),
          ),
        };

      case 'inspector':
        return {
          user: this.currentUser,
          assignedInspections: demoData.inspections.filter(
            ins => ins.inspectorId === this.currentUser.id,
          ),
          pendingApplications: demoApplications.filter(
            app => app.status === 'inspection_scheduled' && app.inspector === this.currentUser.id,
          ),
        };

      case 'reviewer':
        return {
          user: this.currentUser,
          pendingReviews: demoApplications.filter(
            app => app.status === 'under_review' && app.reviewer === this.currentUser.id,
          ),
          completedReviews: demoApplications
            .filter(app => app.status === 'approved' || app.status === 'rejected')
            .slice(0, 10), // Show last 10
        };

      case 'admin':
        return {
          user: this.currentUser,
          statistics: demoData.statistics,
          allApplications: demoApplications,
          allUsers: Object.values(demoData.users),
        };

      default:
        return { user: this.currentUser };
    }
  }

  /**
   * จำลองการทำงานตามขั้นตอน
   */
  simulateAction(action: string, data?: any) {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return null;

    const { currentStepData } = currentStep;

    // จำลองการทำงานตาม action ที่ต่างกัน
    switch (action) {
      case 'submit_application':
        return this.simulateApplicationSubmission(data);

      case 'review_documents':
        return this.simulateDocumentReview(data);

      case 'schedule_inspection':
        return this.simulateInspectionScheduling(data);

      case 'conduct_inspection':
        return this.simulateInspectionConduct(data);

      case 'approve_application':
        return this.simulateApplicationApproval(data);

      default:
        return {
          success: true,
          message: `ดำเนินการ ${action} เรียบร้อยแล้ว`,
          nextAction: this.getNextAction(),
        };
    }
  }

  /**
   * จำลองการยื่นคำขอ
   */
  private simulateApplicationSubmission(data: any) {
    return {
      success: true,
      applicationId: `APP-DEMO-${Date.now()}`,
      message: 'ยื่นคำขอเรียบร้อยแล้ว รอการตรวจสอบเอกสาร',
      timeline: [
        { date: new Date().toISOString(), event: 'ยื่นคำขอ', status: 'completed' },
        { date: null, event: 'ตรวจสอบเอกสาร', status: 'pending' },
      ],
    };
  }

  /**
   * จำลองการตรวจสอบเอกสาร
   */
  private simulateDocumentReview(data: any) {
    return {
      success: true,
      reviewResult: 'approved',
      message: 'เอกสารถูกต้องครบถ้วน อนุมัติให้ดำเนินการขั้นตอนถัดไป',
      nextStep: 'schedule_inspection',
    };
  }

  /**
   * จำลองการกำหนดวันตรวจ
   */
  private simulateInspectionScheduling(data: any) {
    const inspectionDate = new Date();
    inspectionDate.setDate(inspectionDate.getDate() + 7); // 7 วันถัดไป

    return {
      success: true,
      inspectionId: `INS-DEMO-${Date.now()}`,
      scheduledDate: inspectionDate.toISOString(),
      inspector: demoData.users.inspector,
      message: `กำหนดวันตรวจประเมิน ${inspectionDate.toLocaleDateString('th-TH')}`,
    };
  }

  /**
   * จำลองการตรวจประเมิน
   */
  private simulateInspectionConduct(data: any) {
    return {
      success: true,
      inspectionResult: {
        overallScore: 85,
        passedItems: 42,
        totalItems: 50,
        recommendations: [
          'ปรับปรุงการจัดเก็บอุปกรณ์ให้เป็นระเบียบมากขึ้น',
          'เพิ่มการระบายอากาศในห้องเก็บผลผลิต',
        ],
      },
      message: 'ผ่านการประเมิน คะแนน 85/100 ส่งผลการตรวจสอบแล้ว',
    };
  }

  /**
   * จำลองการอนุมัติ
   */
  private simulateApplicationApproval(data: any) {
    return {
      success: true,
      certificateId: `CERT-DEMO-${Date.now()}`,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 ปี
      message: 'อนุมัติการออกใบรับรองเรียบร้อยแล้ว',
    };
  }

  /**
   * ดึง action ถัดไป
   */
  private getNextAction() {
    const currentStep = this.getCurrentStep();
    if (!currentStep || currentStep.isLastStep) return null;

    const nextStep = currentStep.scenario.steps[currentStep.currentStepIndex + 1];
    return nextStep ? nextStep.action : null;
  }

  /**
   * บันทึก demo session
   */
  private saveDemoSession() {
    if (typeof window !== 'undefined') {
      const sessionData = {
        currentUser: this.currentUser,
        currentScenario: this.currentScenario,
        currentStep: this.currentStep,
      };
      localStorage.setItem('gacp_demo_session', JSON.stringify(sessionData));
    }
  }

  /**
   * โหลด demo session
   */
  private loadDemoSession() {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('gacp_demo_session');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          this.currentUser = parsed.currentUser;
          this.currentScenario = parsed.currentScenario;
          this.currentStep = parsed.currentStep || 0;
        } catch (error) {
          console.warn('Failed to load demo session:', error);
        }
      }
    }
  }

  /**
   * ลบ demo session
   */
  private clearDemoSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gacp_demo_session');
    }
  }

  /**
   * ดึงข้อมูลสถิติสำหรับ demo
   */
  getDemoStatistics() {
    return demoData.statistics;
  }

  /**
   * ดึงข้อมูล workflow ทั้งหมด
   */
  getAllWorkflows() {
    return demoData.workflows;
  }

  /**
   * ตรวจสอบสถานะปัจจุบัน
   */
  getStatus() {
    return {
      hasActiveSession: !!this.currentScenario,
      currentUser: this.currentUser,
      currentScenario: this.currentScenario,
      currentStep: this.currentStep,
      stepData: this.getCurrentStep(),
    };
  }
}

// Singleton instance
let demoController: DemoFlowController | null = null;

export function getDemoController(): DemoFlowController {
  if (!demoController) {
    demoController = new DemoFlowController();
  }
  return demoController;
}

export default DemoFlowController;
