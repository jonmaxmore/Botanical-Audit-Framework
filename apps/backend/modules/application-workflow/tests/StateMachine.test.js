/**
 * Application State Machine Tests
 *
 * Comprehensive tests for the Application State Machine.
 * Tests state transitions, business rules, and edge cases.
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const ApplicationStateMachine = require('../domain/StateMachine');

describe('Application State Machine', () => {
  let stateMachine;

  beforeEach(() => {
    stateMachine = new ApplicationStateMachine();
  });

  describe('State Definitions', () => {
    test('should have all required states', () => {
      const states = stateMachine.getAllStates();

      expect(states).toHaveProperty('DRAFT');
      expect(states).toHaveProperty('SUBMITTED');
      expect(states).toHaveProperty('UNDER_REVIEW');
      expect(states).toHaveProperty('REVISION_REQUIRED');
      expect(states).toHaveProperty('PAYMENT_PENDING');
      expect(states).toHaveProperty('PAYMENT_VERIFIED');
      expect(states).toHaveProperty('INSPECTION_SCHEDULED');
      expect(states).toHaveProperty('INSPECTION_COMPLETED');
      expect(states).toHaveProperty('PHASE2_PAYMENT_PENDING');
      expect(states).toHaveProperty('PHASE2_PAYMENT_VERIFIED');
      expect(states).toHaveProperty('APPROVED');
      expect(states).toHaveProperty('CERTIFICATE_ISSUED');
      expect(states).toHaveProperty('REJECTED');
      expect(states).toHaveProperty('EXPIRED');

      expect(Object.keys(states)).toHaveLength(14);
    });

    test('should have correct state values', () => {
      const states = stateMachine.getAllStates();

      expect(states.DRAFT).toBe('draft');
      expect(states.SUBMITTED).toBe('submitted');
      expect(states.CERTIFICATE_ISSUED).toBe('certificate_issued');
    });
  });

  describe('State Transitions', () => {
    test('should allow valid transitions from DRAFT', () => {
      expect(stateMachine.isValidTransition('draft', 'submitted')).toBe(true);
      expect(stateMachine.isValidTransition('draft', 'expired')).toBe(true);
    });

    test('should reject invalid transitions from DRAFT', () => {
      expect(stateMachine.isValidTransition('draft', 'under_review')).toBe(false);
      expect(stateMachine.isValidTransition('draft', 'payment_pending')).toBe(false);
      expect(stateMachine.isValidTransition('draft', 'approved')).toBe(false);
    });

    test('should allow valid transitions from UNDER_REVIEW', () => {
      expect(stateMachine.isValidTransition('under_review', 'payment_pending')).toBe(true);
      expect(stateMachine.isValidTransition('under_review', 'revision_required')).toBe(true);
      expect(stateMachine.isValidTransition('under_review', 'rejected')).toBe(true);
      expect(stateMachine.isValidTransition('under_review', 'expired')).toBe(true);
    });

    test('should handle payment flow correctly', () => {
      expect(stateMachine.isValidTransition('payment_pending', 'payment_verified')).toBe(true);
      expect(stateMachine.isValidTransition('payment_verified', 'inspection_scheduled')).toBe(true);
      expect(
        stateMachine.isValidTransition('phase2_payment_pending', 'phase2_payment_verified'),
      ).toBe(true);
    });

    test('should handle inspection flow correctly', () => {
      expect(stateMachine.isValidTransition('inspection_scheduled', 'inspection_completed')).toBe(
        true,
      );
      expect(stateMachine.isValidTransition('inspection_completed', 'phase2_payment_pending')).toBe(
        true,
      );
      expect(stateMachine.isValidTransition('inspection_scheduled', 'rejected')).toBe(true);
    });

    test('should handle approval flow correctly', () => {
      expect(stateMachine.isValidTransition('phase2_payment_verified', 'approved')).toBe(true);
      expect(stateMachine.isValidTransition('approved', 'certificate_issued')).toBe(true);
    });

    test('should not allow transitions from terminal states', () => {
      expect(stateMachine.getNextStates('certificate_issued')).toHaveLength(0);
      expect(stateMachine.getNextStates('rejected')).toHaveLength(0);
      expect(stateMachine.getNextStates('expired')).toHaveLength(0);
    });
  });

  describe('Role Permissions', () => {
    test('should allow FARMER to transition from draft to submitted', () => {
      expect(stateMachine.canUserTransition('FARMER', 'draft', 'submitted')).toBe(true);
    });

    test('should allow FARMER to handle revisions', () => {
      expect(stateMachine.canUserTransition('FARMER', 'revision_required', 'submitted')).toBe(true);
    });

    test('should not allow FARMER to approve applications', () => {
      expect(stateMachine.canUserTransition('FARMER', 'under_review', 'payment_pending')).toBe(
        false,
      );
      expect(stateMachine.canUserTransition('FARMER', 'phase2_payment_verified', 'approved')).toBe(
        false,
      );
    });

    test('should allow DTAM_REVIEWER to review applications', () => {
      expect(
        stateMachine.canUserTransition('DTAM_REVIEWER', 'under_review', 'payment_pending'),
      ).toBe(true);
      expect(
        stateMachine.canUserTransition('DTAM_REVIEWER', 'under_review', 'revision_required'),
      ).toBe(true);
      expect(stateMachine.canUserTransition('DTAM_REVIEWER', 'under_review', 'rejected')).toBe(
        true,
      );
    });

    test('should allow DTAM_INSPECTOR to handle inspections', () => {
      expect(
        stateMachine.canUserTransition(
          'DTAM_INSPECTOR',
          'payment_verified',
          'inspection_scheduled',
        ),
      ).toBe(true);
      expect(
        stateMachine.canUserTransition(
          'DTAM_INSPECTOR',
          'inspection_scheduled',
          'inspection_completed',
        ),
      ).toBe(true);
      expect(
        stateMachine.canUserTransition('DTAM_INSPECTOR', 'inspection_scheduled', 'rejected'),
      ).toBe(true);
    });

    test('should allow DTAM_ADMIN to final approve', () => {
      expect(
        stateMachine.canUserTransition('DTAM_ADMIN', 'phase2_payment_verified', 'approved'),
      ).toBe(true);
      expect(
        stateMachine.canUserTransition('DTAM_ADMIN', 'phase2_payment_verified', 'rejected'),
      ).toBe(true);
    });

    test('should allow SYSTEM to handle automatic transitions', () => {
      expect(stateMachine.canUserTransition('SYSTEM', 'submitted', 'under_review')).toBe(true);
      expect(stateMachine.canUserTransition('SYSTEM', 'approved', 'certificate_issued')).toBe(true);
    });
  });

  describe('State Metadata', () => {
    test('should return correct metadata for DRAFT state', () => {
      const metadata = stateMachine.getStateMetadata('draft');

      expect(metadata).toMatchObject({
        description: 'Farmer is creating or editing application',
        owner: 'FARMER',
        timeoutDays: 30,
        canEdit: true,
        paymentRequired: false,
      });
    });

    test('should return correct metadata for payment states', () => {
      const phase1Metadata = stateMachine.getStateMetadata('payment_pending');
      const phase2Metadata = stateMachine.getStateMetadata('phase2_payment_pending');

      expect(phase1Metadata.paymentRequired).toBe(true);
      expect(phase1Metadata.paymentAmount).toBe(5000);
      expect(phase1Metadata.paymentPhase).toBe(1);

      expect(phase2Metadata.paymentRequired).toBe(true);
      expect(phase2Metadata.paymentAmount).toBe(25000);
      expect(phase2Metadata.paymentPhase).toBe(2);
    });

    test('should identify terminal states correctly', () => {
      expect(stateMachine.isTerminalState('certificate_issued')).toBe(true);
      expect(stateMachine.isTerminalState('rejected')).toBe(true);
      expect(stateMachine.isTerminalState('expired')).toBe(true);
      expect(stateMachine.isTerminalState('draft')).toBe(false);
    });

    test('should identify payment states correctly', () => {
      expect(stateMachine.isPaymentState('payment_pending')).toBe(true);
      expect(stateMachine.isPaymentState('phase2_payment_pending')).toBe(true);
      expect(stateMachine.isPaymentState('draft')).toBe(false);
      expect(stateMachine.isPaymentState('under_review')).toBe(false);
    });
  });

  describe('Timeout Calculations', () => {
    test('should calculate expiration dates correctly', () => {
      const baseDate = new Date('2025-10-18T10:00:00Z');

      const draftExpiration = stateMachine.calculateExpirationDate('draft', baseDate);
      expect(draftExpiration.getTime()).toBe(new Date('2025-11-17T10:00:00Z').getTime());

      const reviewExpiration = stateMachine.calculateExpirationDate('under_review', baseDate);
      expect(reviewExpiration.getTime()).toBe(new Date('2025-11-01T10:00:00Z').getTime());
    });

    test('should return null for states without timeout', () => {
      expect(stateMachine.calculateExpirationDate('certificate_issued')).toBeNull();
      expect(stateMachine.calculateExpirationDate('rejected')).toBeNull();
    });
  });

  describe('Validation', () => {
    const mockApplication = {
      status: 'draft',
      documents: [{ type: 'farm_license' }],
    };

    test('should validate transitions with business rules', () => {
      const validation = stateMachine.validateTransition(mockApplication, 'submitted', 'FARMER');

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('MISSING_DOCUMENTS');
    });

    test('should allow valid transitions with proper context', () => {
      const applicationWithDocs = {
        ...mockApplication,
        documents: [
          { type: 'farm_license' },
          { type: 'land_deed' },
          { type: 'farmer_id' },
          { type: 'farm_photos' },
        ],
      };

      const validation = stateMachine.validateTransition(
        applicationWithDocs,
        'submitted',
        'FARMER',
      );

      expect(validation.valid).toBe(true);
    });

    test('should reject invalid user roles', () => {
      const validation = stateMachine.validateTransition(
        mockApplication,
        'submitted',
        'INVALID_ROLE',
      );

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('INSUFFICIENT_PERMISSIONS');
    });

    test('should validate payment context', () => {
      const paymentApp = { status: 'payment_pending' };

      const validationWithoutRef = stateMachine.validateTransition(
        paymentApp,
        'payment_verified',
        'SYSTEM',
      );
      expect(validationWithoutRef.valid).toBe(false);
      expect(validationWithoutRef.error).toBe('MISSING_PAYMENT_REFERENCE');

      const validationWithRef = stateMachine.validateTransition(
        paymentApp,
        'payment_verified',
        'SYSTEM',
        { paymentReference: 'PAY-123456' },
      );
      expect(validationWithRef.valid).toBe(true);
    });
  });

  describe('Workflow Summary', () => {
    test('should return workflow statistics', () => {
      const summary = stateMachine.getWorkflowSummary();

      expect(summary.totalStates).toBe(14);
      expect(summary.paymentStates).toContain('payment_pending');
      expect(summary.paymentStates).toContain('phase2_payment_pending');
      expect(summary.terminalStates).toContain('certificate_issued');
      expect(summary.terminalStates).toContain('rejected');
      expect(summary.terminalStates).toContain('expired');
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid state names', () => {
      expect(stateMachine.isValidTransition('invalid_state', 'submitted')).toBe(false);
      expect(stateMachine.isValidTransition('draft', 'invalid_state')).toBe(false);
    });

    test('should handle case sensitivity', () => {
      expect(stateMachine.isValidTransition('DRAFT', 'SUBMITTED')).toBe(false); // Should be lowercase
      expect(stateMachine.getStateMetadata('DRAFT')).toBeNull();
    });

    test('should handle undefined/null inputs', () => {
      expect(stateMachine.isValidTransition(null, 'submitted')).toBe(false);
      expect(stateMachine.isValidTransition('draft', null)).toBe(false);
      expect(stateMachine.getStateMetadata(null)).toBeNull();
    });
  });

  describe('Complex Workflow Scenarios', () => {
    test('should handle complete success workflow', () => {
      const successPath = [
        'draft',
        'submitted',
        'under_review',
        'payment_pending',
        'payment_verified',
        'inspection_scheduled',
        'inspection_completed',
        'phase2_payment_pending',
        'phase2_payment_verified',
        'approved',
        'certificate_issued',
      ];

      for (let i = 0; i < successPath.length - 1; i++) {
        const fromState = successPath[i];
        const toState = successPath[i + 1];

        expect(stateMachine.isValidTransition(fromState, toState)).toBe(true);
      }
    });

    test('should handle revision workflow', () => {
      const revisionPath = [
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'submitted',
        'under_review',
        'payment_pending',
      ];

      for (let i = 0; i < revisionPath.length - 1; i++) {
        const fromState = revisionPath[i];
        const toState = revisionPath[i + 1];

        expect(stateMachine.isValidTransition(fromState, toState)).toBe(true);
      }
    });

    test('should handle rejection scenarios', () => {
      const rejectionPoints = ['under_review', 'inspection_scheduled', 'phase2_payment_verified'];

      rejectionPoints.forEach(state => {
        expect(stateMachine.isValidTransition(state, 'rejected')).toBe(true);
      });
    });

    test('should handle expiration scenarios', () => {
      const expirableStates = [
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'payment_pending',
        'payment_verified',
        'inspection_scheduled',
        'inspection_completed',
        'phase2_payment_pending',
        'phase2_payment_verified',
      ];

      expirableStates.forEach(state => {
        expect(stateMachine.isValidTransition(state, 'expired')).toBe(true);
      });
    });
  });
});

// Performance tests
describe('Application State Machine Performance', () => {
  let stateMachine;

  beforeEach(() => {
    stateMachine = new ApplicationStateMachine();
  });

  test('should handle multiple state checks efficiently', () => {
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
      stateMachine.isValidTransition('draft', 'submitted');
      stateMachine.getStateMetadata('under_review');
      stateMachine.canUserTransition('FARMER', 'draft', 'submitted');
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('should handle state machine instantiation efficiently', () => {
    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      new ApplicationStateMachine();
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50); // Should complete in less than 50ms
  });
});
