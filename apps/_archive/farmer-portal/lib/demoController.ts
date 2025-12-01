/**
 * Demo Controller
 * Controls demo mode state and navigation for the farmer portal
 */

export class DemoController {
  private static instance: DemoController;
  private demoMode: boolean = false;
  private currentStep: number = 0;

  private constructor() {}

  static getInstance(): DemoController {
    if (!DemoController.instance) {
      DemoController.instance = new DemoController();
    }
    return DemoController.instance;
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }

  setDemoMode(enabled: boolean): void {
    this.demoMode = enabled;
    if (!enabled) {
      this.currentStep = 0;
    }
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  setCurrentStep(step: number): void {
    this.currentStep = step;
  }

  nextStep(): void {
    this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  reset(): void {
    this.currentStep = 0;
  }

  getStatus() {
    return {
      isDemoMode: this.demoMode,
      currentStep: this.currentStep
    };
  }
}

export const getDemoController = () => DemoController.getInstance();
