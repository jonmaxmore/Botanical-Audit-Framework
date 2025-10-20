/**
 * GACP Application Workflow Engine
 * State Machine for GACP Certification Process
 *
 * Based on Thai FDA GACP Certification Workflow
 * Implements finite state machine with proper validation and business rules
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 * @compliance Thai-FDA-GACP-2018
 */

const { GACPApplicationStatus, GACPComplianceFramework } = require('../models/GACPBusinessLogic');

class GACPWorkflowEngine {
  constructor() {
    this.currentState = null;
    this.stateHistory = [];
    this.workflowRules = this.initializeWorkflowRules();
    this.validationRules = this.initializeValidationRules();
  }

  /**
   * Initialize GACP Workflow State Transition Rules
   * Based on Thai FDA GACP Certification Process Manual
   */
  initializeWorkflowRules() {
    return {
      // Phase 1: Application Submission
      [GACPApplicationStatus.DRAFT]: {
        allowedTransitions: [
          GACPApplicationStatus.SUBMITTED,
          GACPApplicationStatus.DRAFT, // Allow editing
        ],
        requiredActors: ['applicant'],
        requiredDocuments: [],
        timeLimit: null, // No time limit for draft
        businessRules: ['applicant_must_be_authenticated', 'basic_farm_info_required'],
      },

      [GACPApplicationStatus.SUBMITTED]: {
        allowedTransitions: [
          GACPApplicationStatus.UNDER_REVIEW,
          GACPApplicationStatus.DOCUMENT_INCOMPLETE,
          GACPApplicationStatus.DRAFT, // Allow return to draft for corrections
        ],
        requiredActors: ['dtam_officer'],
        requiredDocuments: GACPComplianceFramework.REQUIRED_DOCUMENTS,
        timeLimit: 7, // 7 days for initial review
        businessRules: [
          'all_required_documents_uploaded',
          'application_fee_paid',
          'farm_location_in_thailand',
        ],
      },

      // Phase 2: Document Review
      [GACPApplicationStatus.UNDER_REVIEW]: {
        allowedTransitions: [
          GACPApplicationStatus.DOCUMENT_APPROVED,
          GACPApplicationStatus.DOCUMENT_INCOMPLETE,
          GACPApplicationStatus.REJECTED,
        ],
        requiredActors: ['dtam_officer', 'document_reviewer'],
        requiredDocuments: 'all_submitted_documents',
        timeLimit: 15, // 15 days for document review
        businessRules: [
          'document_completeness_check',
          'technical_document_validation',
          'legal_compliance_verification',
        ],
      },

      [GACPApplicationStatus.DOCUMENT_INCOMPLETE]: {
        allowedTransitions: [
          GACPApplicationStatus.SUBMITTED,
          GACPApplicationStatus.REJECTED, // If not corrected within time limit
        ],
        requiredActors: ['applicant'],
        requiredDocuments: 'missing_documents_list',
        timeLimit: 30, // 30 days to complete documents
        businessRules: ['specific_deficiencies_identified', 'correction_guidance_provided'],
      },

      [GACPApplicationStatus.DOCUMENT_APPROVED]: {
        allowedTransitions: [GACPApplicationStatus.INSPECTION_SCHEDULED],
        requiredActors: ['dtam_officer', 'inspector_coordinator'],
        requiredDocuments: 'approved_document_set',
        timeLimit: 10, // 10 days to schedule inspection
        businessRules: [
          'inspector_assignment_required',
          'inspection_date_coordination',
          'site_accessibility_confirmed',
        ],
      },

      // Phase 3: Field Inspection
      [GACPApplicationStatus.INSPECTION_SCHEDULED]: {
        allowedTransitions: [
          GACPApplicationStatus.INSPECTION_IN_PROGRESS,
          GACPApplicationStatus.INSPECTION_SCHEDULED, // Reschedule if needed
        ],
        requiredActors: ['certified_inspector', 'applicant'],
        requiredDocuments: 'inspection_checklist',
        timeLimit: 45, // 45 days maximum to start inspection
        businessRules: [
          'inspector_certified_for_crop_type',
          'weather_conditions_suitable',
          'farm_accessible_for_inspection',
        ],
      },

      [GACPApplicationStatus.INSPECTION_IN_PROGRESS]: {
        allowedTransitions: [GACPApplicationStatus.INSPECTION_COMPLETED],
        requiredActors: ['certified_inspector'],
        requiredDocuments: 'inspection_forms',
        timeLimit: 3, // 3 days maximum for field inspection
        businessRules: [
          'all_ccps_must_be_assessed',
          'photographic_evidence_required',
          'farmer_interview_conducted',
        ],
      },

      [GACPApplicationStatus.INSPECTION_COMPLETED]: {
        allowedTransitions: [
          GACPApplicationStatus.INSPECTION_PASSED,
          GACPApplicationStatus.INSPECTION_FAILED,
          GACPApplicationStatus.CORRECTIVE_ACTION_REQUIRED,
        ],
        requiredActors: ['certified_inspector', 'technical_reviewer'],
        requiredDocuments: 'completed_inspection_report',
        timeLimit: 7, // 7 days to complete assessment
        businessRules: [
          'ccp_scores_calculated',
          'overall_score_determined',
          'recommendations_provided',
        ],
      },

      // Phase 4: Assessment Results
      [GACPApplicationStatus.INSPECTION_PASSED]: {
        allowedTransitions: [GACPApplicationStatus.APPROVED],
        requiredActors: ['approving_authority'],
        requiredDocuments: 'inspection_pass_report',
        timeLimit: 10, // 10 days for final approval
        businessRules: ['minimum_score_achieved', 'no_critical_violations', 'compliance_confirmed'],
      },

      [GACPApplicationStatus.INSPECTION_FAILED]: {
        allowedTransitions: [
          GACPApplicationStatus.REJECTED,
          GACPApplicationStatus.CORRECTIVE_ACTION_REQUIRED, // If minor issues
        ],
        requiredActors: ['certified_inspector', 'approving_authority'],
        requiredDocuments: 'failure_report_detailed',
        timeLimit: 7, // 7 days to issue decision
        businessRules: [
          'failure_reasons_documented',
          'improvement_recommendations_provided',
          'reapplication_eligibility_determined',
        ],
      },

      [GACPApplicationStatus.CORRECTIVE_ACTION_REQUIRED]: {
        allowedTransitions: [
          GACPApplicationStatus.INSPECTION_SCHEDULED, // Re-inspection after corrections
          GACPApplicationStatus.REJECTED, // If corrections not made in time
        ],
        requiredActors: ['applicant'],
        requiredDocuments: 'corrective_action_plan',
        timeLimit: 90, // 90 days to implement corrections
        businessRules: [
          'corrective_actions_specified',
          'implementation_timeline_agreed',
          'follow_up_inspection_required',
        ],
      },

      // Phase 5: Final Decision
      [GACPApplicationStatus.APPROVED]: {
        allowedTransitions: [GACPApplicationStatus.CERTIFICATE_ISSUED],
        requiredActors: ['certificate_issuer'],
        requiredDocuments: 'approval_certificate_template',
        timeLimit: 5, // 5 days to issue certificate
        businessRules: [
          'certificate_number_assigned',
          'validity_period_determined',
          'monitoring_schedule_established',
        ],
      },

      [GACPApplicationStatus.REJECTED]: {
        allowedTransitions: [], // Terminal state - new application required
        requiredActors: ['approving_authority'],
        requiredDocuments: 'rejection_notice',
        timeLimit: null,
        businessRules: [
          'rejection_reasons_documented',
          'appeal_process_explained',
          'reapplication_guidance_provided',
        ],
      },

      // Phase 6: Certificate Management
      [GACPApplicationStatus.CERTIFICATE_ISSUED]: {
        allowedTransitions: [
          GACPApplicationStatus.CERTIFICATE_SUSPENDED,
          GACPApplicationStatus.CERTIFICATE_EXPIRED,
        ],
        requiredActors: ['certificate_manager'],
        requiredDocuments: 'issued_certificate',
        timeLimit: null, // Valid until expiry or suspension
        businessRules: [
          'certificate_registered_in_database',
          'qr_code_generated',
          'monitoring_schedule_activated',
        ],
      },

      [GACPApplicationStatus.CERTIFICATE_SUSPENDED]: {
        allowedTransitions: [
          GACPApplicationStatus.CERTIFICATE_ISSUED, // Reinstatement
          GACPApplicationStatus.CERTIFICATE_REVOKED,
        ],
        requiredActors: ['compliance_officer'],
        requiredDocuments: 'suspension_order',
        timeLimit: 180, // 180 days to resolve suspension issues
        businessRules: [
          'suspension_cause_documented',
          'corrective_measures_required',
          'reinstatement_criteria_specified',
        ],
      },

      [GACPApplicationStatus.CERTIFICATE_REVOKED]: {
        allowedTransitions: [], // Terminal state
        requiredActors: ['approving_authority'],
        requiredDocuments: 'revocation_order',
        timeLimit: null,
        businessRules: [
          'revocation_reasons_documented',
          'legal_implications_explained',
          'database_status_updated',
        ],
      },

      [GACPApplicationStatus.CERTIFICATE_EXPIRED]: {
        allowedTransitions: [
          GACPApplicationStatus.DRAFT, // New application for renewal
        ],
        requiredActors: ['system'],
        requiredDocuments: 'expiry_notification',
        timeLimit: null,
        businessRules: [
          'renewal_notification_sent',
          'grace_period_applied',
          'status_updated_in_database',
        ],
      },
    };
  }

  /**
   * Initialize Business Rule Validation Functions
   */
  initializeValidationRules() {
    return {
      // Applicant Authentication Rules
      applicant_must_be_authenticated: context => {
        return context.user && context.user.role === 'farmer' && context.user.verified;
      },

      // Document Requirements
      all_required_documents_uploaded: context => {
        const required = GACPComplianceFramework.REQUIRED_DOCUMENTS;
        const uploaded = context.documents || [];
        return required.every(doc => uploaded.some(u => u.type === doc));
      },

      // Geographic Validation
      farm_location_in_thailand: context => {
        const location = context.application?.farm_location;
        return location && location.country === 'Thailand' && location.province;
      },

      // Technical Validation
      minimum_score_achieved: context => {
        const score = context.inspection?.total_score;
        return score && score >= 75; // 75% minimum passing score
      },

      // CCP Assessment Rules
      all_ccps_must_be_assessed: context => {
        const assessment = context.inspection?.ccp_assessment;
        const requiredCCPs = Object.keys(
          require('../models/GACPBusinessLogic').GACPCriticalControlPoints
        );
        return assessment && requiredCCPs.every(ccp => assessment[ccp] !== undefined);
      },

      // Time-based Validation
      within_time_limit: (context, state) => {
        const rule = this.workflowRules[state];
        if (!rule.timeLimit) return true;

        const stateEntry = context.state_history?.find(h => h.status === state);
        if (!stateEntry) return true;

        const daysSince = (Date.now() - new Date(stateEntry.timestamp)) / (1000 * 60 * 60 * 24);
        return daysSince <= rule.timeLimit;
      },
    };
  }

  /**
   * Transition to New State with Validation
   * @param {string} currentState - Current application state
   * @param {string} targetState - Desired target state
   * @param {object} context - Application context and data
   * @param {object} actor - User performing the transition
   * @returns {object} Transition result
   */
  async transitionTo(currentState, targetState, context, actor) {
    try {
      // Validate current state exists
      if (!this.workflowRules[currentState]) {
        return this.createResult(false, `Invalid current state: ${currentState}`);
      }

      // Check if transition is allowed
      const allowedTransitions = this.workflowRules[currentState].allowedTransitions;
      if (!allowedTransitions.includes(targetState)) {
        return this.createResult(
          false,
          `Transition from ${currentState} to ${targetState} is not allowed. Allowed: ${allowedTransitions.join(', ')}`
        );
      }

      // Validate actor permissions
      const requiredActors = this.workflowRules[currentState].requiredActors;
      if (!this.validateActor(actor, requiredActors)) {
        return this.createResult(
          false,
          `Actor ${actor?.role} not authorized. Required: ${requiredActors.join(' or ')}`
        );
      }

      // Validate business rules
      const businessRules = this.workflowRules[currentState].businessRules;
      const ruleValidation = this.validateBusinessRules(businessRules, context, currentState);
      if (!ruleValidation.valid) {
        return this.createResult(
          false,
          `Business rule violation: ${ruleValidation.errors.join(', ')}`
        );
      }

      // Check time limits
      if (!this.validationRules.within_time_limit(context, currentState)) {
        return this.createResult(false, `Time limit exceeded for state ${currentState}`);
      }

      // Transition successful
      const result = this.createResult(
        true,
        `Successfully transitioned from ${currentState} to ${targetState}`
      );
      result.newState = targetState;
      result.timestamp = new Date();
      result.actor = actor;
      result.businessRulesPassed = ruleValidation.passedRules;

      return result;
    } catch (error) {
      return this.createResult(false, `Workflow transition error: ${error.message}`);
    }
  }

  /**
   * Validate Actor Permissions
   */
  validateActor(actor, requiredActors) {
    if (!actor || !actor.role) return false;
    return requiredActors.includes(actor.role) || requiredActors.includes('system');
  }

  /**
   * Validate Business Rules
   */
  validateBusinessRules(rules, context, currentState) {
    const errors = [];
    const passedRules = [];

    for (const rule of rules) {
      if (this.validationRules[rule]) {
        try {
          if (this.validationRules[rule](context, currentState)) {
            passedRules.push(rule);
          } else {
            errors.push(rule);
          }
        } catch (error) {
          errors.push(`${rule}: ${error.message}`);
        }
      } else {
        errors.push(`Unknown business rule: ${rule}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      passedRules,
    };
  }

  /**
   * Get Available Transitions from Current State
   */
  getAvailableTransitions(currentState, actor, context) {
    const rule = this.workflowRules[currentState];
    if (!rule) return [];

    return rule.allowedTransitions.filter(targetState => {
      // Check actor permissions
      if (!this.validateActor(actor, rule.requiredActors)) {
        return false;
      }

      // Check basic business rules (simplified for UI)
      const businessRules = rule.businessRules || [];
      const criticalRules = businessRules.filter(r => r.includes('required') || r.includes('must'));

      for (const criticalRule of criticalRules) {
        if (
          this.validationRules[criticalRule] &&
          !this.validationRules[criticalRule](context, currentState)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get Workflow Requirements for Current State
   */
  getStateRequirements(state) {
    const rule = this.workflowRules[state];
    if (!rule) return null;

    return {
      requiredActors: rule.requiredActors,
      requiredDocuments: rule.requiredDocuments,
      businessRules: rule.businessRules,
      timeLimit: rule.timeLimit,
      allowedTransitions: rule.allowedTransitions,
    };
  }

  /**
   * Create Standardized Result Object
   */
  createResult(success, message, data = {}) {
    return {
      success,
      message,
      timestamp: new Date(),
      ...data,
    };
  }

  /**
   * Get Complete Workflow Graph for Visualization
   */
  getWorkflowGraph() {
    const nodes = Object.keys(this.workflowRules).map(state => ({
      id: state,
      label: state.replace(/_/g, ' ').toUpperCase(),
      ...this.workflowRules[state],
    }));

    const edges = [];
    Object.entries(this.workflowRules).forEach(([from, rule]) => {
      rule.allowedTransitions.forEach(to => {
        edges.push({ from, to, weight: rule.timeLimit || 0 });
      });
    });

    return { nodes, edges };
  }
}

module.exports = GACPWorkflowEngine;
