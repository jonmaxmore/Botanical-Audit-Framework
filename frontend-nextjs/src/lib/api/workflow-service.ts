/**
 * GACP Platform - Workflow Management Service
 *
 * PURPOSE: Handle GACP certification workflow with proper business logic
 * COMPLIANCE: Thai FDA GACP 2018 workflow requirements
 * WORKFLOW: 17-state finite state machine with business rule validation
 *
 * BUSINESS LOGIC FOUNDATION:
 * - State transition validation according to Thai FDA process
 * - Role-based authorization for each workflow step
 * - Document requirement validation per state
 * - Time limit enforcement and monitoring
 * - Audit trail and compliance logging
 */

import { gacpApiClient, type GACPApiResponse, type GACPWorkflowInfo } from './gacp-api-client';

// ============================================================================
// TYPE DEFINITIONS - Workflow Specific
// ============================================================================

export interface GACPWorkflowState {
  id: string;
  label: string;
  allowedTransitions: string[];
  requiredActors: string[];
  requiredDocuments: string[] | string;
  timeLimit: number | null;
  businessRules: string[];
}

export interface GACPWorkflowTransition {
  from: string;
  to: string;
  weight: number;
  actor: string;
  reason?: string;
  data?: any;
  timestamp?: string;
}

export interface GACPApplication {
  id: string;
  applicantId: string;
  currentState: string;
  workflowHistory: GACPWorkflowTransition[];

  // Application basic info
  farmerName: string;
  farmName: string;
  farmLocation: string;
  farmSize: number;
  cropTypes: string[];

  // Documents tracking
  documents: {
    [key: string]: {
      uploaded: boolean;
      fileName?: string;
      uploadedAt?: string;
      status: 'pending' | 'approved' | 'rejected';
      reviewComments?: string;
    };
  };

  // Workflow timing
  submittedAt?: string;
  currentStateEnteredAt: string;
  timeLimit?: string;
  isOverdue?: boolean;

  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface WorkflowTransitionRequest {
  applicationId: string;
  fromState: string;
  toState: string;
  actor: string;
  reason?: string;
  documents?: string[];
  data?: {
    reviewComments?: string;
    inspectionDate?: string;
    correctionRequired?: string[];
    certificateLevel?: 'gold' | 'silver' | 'bronze';
  };
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredDocuments: string[];
  requiredActors: string[];
  businessRules: string[];
}

// ============================================================================
// GACP WORKFLOW SERVICE CLASS
// ============================================================================

class GACPWorkflowService {
  private static instance: GACPWorkflowService;
  private workflowInfo: GACPWorkflowInfo | null = null;
  private workflowStates: Map<string, GACPWorkflowState> = new Map();

  public static getInstance(): GACPWorkflowService {
    if (!GACPWorkflowService.instance) {
      GACPWorkflowService.instance = new GACPWorkflowService();
    }
    return GACPWorkflowService.instance;
  }

  /**
   * Initialize workflow service by loading workflow information
   */
  async initialize(): Promise<void> {
    try {
      const response = await gacpApiClient.getGACPWorkflow();

      if (response.success && response.data) {
        this.workflowInfo = response.data;

        // Build workflow states map for quick access
        this.workflowStates.clear();
        this.workflowInfo.workflowGraph.nodes.forEach(state => {
          this.workflowStates.set(state.id, state);
        });

        console.log('[GACP Workflow] Service initialized with', {
          states: this.workflowInfo.workflowStates,
          transitions: this.workflowInfo.transitions,
          framework: this.workflowInfo.framework,
        });
      } else {
        throw new Error('Failed to load workflow information');
      }
    } catch (error) {
      console.error('[GACP Workflow] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get complete workflow information
   */
  async getWorkflowInfo(): Promise<GACPWorkflowInfo> {
    if (!this.workflowInfo) {
      await this.initialize();
    }
    return this.workflowInfo!;
  }

  /**
   * Get all available workflow states
   */
  async getWorkflowStates(): Promise<GACPWorkflowState[]> {
    if (!this.workflowInfo) {
      await this.initialize();
    }
    return this.workflowInfo!.workflowGraph.nodes;
  }

  /**
   * Get specific workflow state by ID
   */
  async getWorkflowState(stateId: string): Promise<GACPWorkflowState | null> {
    if (!this.workflowInfo) {
      await this.initialize();
    }
    return this.workflowStates.get(stateId) || null;
  }

  /**
   * Get all possible transitions from a given state
   */
  async getAvailableTransitions(fromState: string): Promise<string[]> {
    const state = await this.getWorkflowState(fromState);
    return state?.allowedTransitions || [];
  }

  /**
   * Validate workflow transition before execution
   */
  async validateTransition(request: WorkflowTransitionRequest): Promise<WorkflowValidationResult> {
    try {
      const result: WorkflowValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        requiredDocuments: [],
        requiredActors: [],
        businessRules: [],
      };

      // Get workflow state information
      const fromState = await this.getWorkflowState(request.fromState);
      const toState = await this.getWorkflowState(request.toState);

      if (!fromState) {
        result.isValid = false;
        result.errors.push(`Invalid source state: ${request.fromState}`);
        return result;
      }

      if (!toState) {
        result.isValid = false;
        result.errors.push(`Invalid target state: ${request.toState}`);
        return result;
      }

      // Validate transition is allowed
      if (!fromState.allowedTransitions.includes(request.toState)) {
        result.isValid = false;
        result.errors.push(
          `Transition from ${request.fromState} to ${request.toState} is not allowed`
        );
        return result;
      }

      // Validate actor authorization
      if (!fromState.requiredActors.includes(request.actor)) {
        result.isValid = false;
        result.errors.push(
          `Actor ${request.actor} is not authorized for state ${request.fromState}`
        );
      }

      // Collect required information
      result.requiredActors = fromState.requiredActors;
      result.businessRules = fromState.businessRules;

      if (Array.isArray(fromState.requiredDocuments)) {
        result.requiredDocuments = fromState.requiredDocuments;
      } else if (typeof fromState.requiredDocuments === 'string') {
        result.requiredDocuments = [fromState.requiredDocuments];
      }

      // Business rule validation
      await this.validateBusinessRules(request, result);

      // Time limit validation
      if (fromState.timeLimit) {
        result.warnings.push(
          `State ${request.fromState} has time limit of ${fromState.timeLimit} days`
        );
      }

      return result;
    } catch (error) {
      console.error('[GACP Workflow] Validation failed:', error);
      return {
        isValid: false,
        errors: [`Validation error: ${error}`],
        warnings: [],
        requiredDocuments: [],
        requiredActors: [],
        businessRules: [],
      };
    }
  }

  /**
   * Execute workflow transition
   */
  async executeTransition(request: WorkflowTransitionRequest): Promise<GACPApiResponse<any>> {
    try {
      // Validate transition first
      const validation = await this.validateTransition(request);

      if (!validation.isValid) {
        throw new Error(`Transition validation failed: ${validation.errors.join(', ')}`);
      }

      // Log transition attempt
      console.log('[GACP Workflow] Executing transition:', {
        applicationId: request.applicationId,
        from: request.fromState,
        to: request.toState,
        actor: request.actor,
        timestamp: new Date().toISOString(),
      });

      // Execute transition via API
      const response = await gacpApiClient.performWorkflowTransition(request.applicationId, {
        from: request.fromState,
        to: request.toState,
        actor: request.actor,
        data: request.data,
      });

      // Log successful transition
      if (response.success) {
        console.log('[GACP Workflow] Transition successful:', {
          applicationId: request.applicationId,
          from: request.fromState,
          to: request.toState,
          timestamp: new Date().toISOString(),
        });
      }

      return response;
    } catch (error) {
      console.error('[GACP Workflow] Transition execution failed:', error);
      throw error;
    }
  }

  /**
   * Get workflow transition history for an application
   */
  async getTransitionHistory(
    applicationId: string
  ): Promise<GACPApiResponse<GACPWorkflowTransition[]>> {
    try {
      return await gacpApiClient.get<GACPWorkflowTransition[]>(
        `/api/applications/${applicationId}/workflow-history`
      );
    } catch (error) {
      console.error('[GACP Workflow] Get transition history failed:', error);
      throw error;
    }
  }

  /**
   * Get applications by workflow state
   */
  async getApplicationsByState(state: string): Promise<GACPApiResponse<GACPApplication[]>> {
    try {
      return await gacpApiClient.get<GACPApplication[]>(`/api/applications?state=${state}`);
    } catch (error) {
      console.error('[GACP Workflow] Get applications by state failed:', error);
      throw error;
    }
  }

  /**
   * Get overdue applications
   */
  async getOverdueApplications(): Promise<GACPApiResponse<GACPApplication[]>> {
    try {
      return await gacpApiClient.get<GACPApplication[]>('/api/applications?overdue=true');
    } catch (error) {
      console.error('[GACP Workflow] Get overdue applications failed:', error);
      throw error;
    }
  }

  // ========================================================================
  // BUSINESS RULES VALIDATION
  // ========================================================================

  /**
   * Validate business rules for workflow transition
   */
  private async validateBusinessRules(
    request: WorkflowTransitionRequest,
    result: WorkflowValidationResult
  ): Promise<void> {
    const state = await this.getWorkflowState(request.fromState);
    if (!state) return;

    // Validate each business rule
    for (const rule of state.businessRules) {
      try {
        await this.validateBusinessRule(rule, request, result);
      } catch (error) {
        result.errors.push(`Business rule validation failed for ${rule}: ${error}`);
        result.isValid = false;
      }
    }
  }

  /**
   * Validate individual business rule
   */
  private async validateBusinessRule(
    rule: string,
    request: WorkflowTransitionRequest,
    result: WorkflowValidationResult
  ): Promise<void> {
    switch (rule) {
      case 'applicant_must_be_authenticated':
        if (!request.actor || request.actor === 'anonymous') {
          result.errors.push('Applicant must be authenticated');
          result.isValid = false;
        }
        break;

      case 'basic_farm_info_required':
        if (!request.data?.farmName || !request.data?.farmLocation) {
          result.errors.push('Basic farm information is required');
          result.isValid = false;
        }
        break;

      case 'all_required_documents_uploaded':
        if (!request.documents || request.documents.length === 0) {
          result.errors.push('All required documents must be uploaded');
          result.isValid = false;
        }
        break;

      case 'application_fee_paid':
        if (!request.data?.paymentConfirmed) {
          result.warnings.push('Application fee payment should be confirmed');
        }
        break;

      case 'farm_location_in_thailand':
        if (request.data?.farmLocation && !this.isThailandLocation(request.data.farmLocation)) {
          result.errors.push('Farm must be located in Thailand');
          result.isValid = false;
        }
        break;

      case 'inspector_certified_for_crop_type':
        if (request.actor === 'inspector' && !request.data?.inspectorCertification) {
          result.warnings.push('Inspector certification for crop type should be verified');
        }
        break;

      case 'minimum_score_achieved':
        if (request.data?.score !== undefined && request.data.score < 75) {
          result.errors.push('Minimum score of 75% must be achieved');
          result.isValid = false;
        }
        break;

      default:
        result.warnings.push(`Unknown business rule: ${rule}`);
    }
  }

  /**
   * Check if location is in Thailand (simplified validation)
   */
  private isThailandLocation(location: string): boolean {
    const thailandProvinces = [
      'bangkok',
      'nonthaburi',
      'pathum thani',
      'samut prakan',
      'samut sakhon',
      'chiang mai',
      'chiang rai',
      'phuket',
      'krabi',
      'surat thani',
      // Add more provinces as needed
    ];

    const lowerLocation = location.toLowerCase();
    return thailandProvinces.some(province => lowerLocation.includes(province));
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get human-readable state name
   */
  async getStateDisplayName(stateId: string): Promise<string> {
    const state = await this.getWorkflowState(stateId);
    return state?.label || stateId;
  }

  /**
   * Check if transition is allowed
   */
  async isTransitionAllowed(fromState: string, toState: string): Promise<boolean> {
    const state = await this.getWorkflowState(fromState);
    return state?.allowedTransitions.includes(toState) || false;
  }

  /**
   * Get workflow progress percentage
   */
  async getWorkflowProgress(currentState: string): Promise<number> {
    const states = await this.getWorkflowStates();
    const stateIndex = states.findIndex(state => state.id === currentState);

    if (stateIndex === -1) return 0;

    // Calculate progress based on state position in workflow
    return Math.round((stateIndex / (states.length - 1)) * 100);
  }

  /**
   * Get next possible states
   */
  async getNextStates(currentState: string): Promise<GACPWorkflowState[]> {
    const transitions = await this.getAvailableTransitions(currentState);
    const nextStates: GACPWorkflowState[] = [];

    for (const stateId of transitions) {
      const state = await this.getWorkflowState(stateId);
      if (state) {
        nextStates.push(state);
      }
    }

    return nextStates;
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

// Create singleton instance
const gacpWorkflowService = GACPWorkflowService.getInstance();

// Export types and service
export { gacpWorkflowService };

export type {
  GACPWorkflowState,
  GACPWorkflowTransition,
  GACPApplication,
  WorkflowTransitionRequest,
  WorkflowValidationResult,
};

// Default export
export default gacpWorkflowService;
