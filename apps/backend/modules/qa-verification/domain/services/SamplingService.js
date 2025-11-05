/**
 * Sampling Service
 *
 * Risk-based sampling for QA verification
 * - HIGH_RISK: 100% sampling
 * - MEDIUM: 30% sampling
 * - LOW: 10% sampling
 */

class SamplingService {
  constructor({ logger }) {
    this.logger = logger;
  }

  /**
   * Determine if application should be sampled for QA
   * @param {Object} application - Application to evaluate
   * @returns {Object} Sampling decision
   */
  shouldSample(application) {
    const riskLevel = this.determineRiskLevel(application);
    const samplingRate = this.getSamplingRate(riskLevel);
    const shouldSample = Math.random() < samplingRate;

    this.logger.info('Sampling decision', {
      applicationId: application._id,
      riskLevel,
      samplingRate,
      shouldSample
    });

    return {
      shouldSample,
      riskLevel,
      samplingRate,
      reason: this.getSamplingReason(riskLevel, shouldSample)
    };
  }

  /**
   * Determine risk level for sampling
   * @param {Object} application
   * @returns {string} Risk level
   */
  determineRiskLevel(application) {
    const flags = [];

    // Check AI Pre-Check risk
    if (application.aiPreCheck?.riskLevel === 'HIGH') {
      flags.push('high_ai_risk');
    }

    // Check inspector quality score
    const inspectorQuality = application.routing?.assignedInspector?.workloadMetrics?.qualityScore || 100;
    if (inspectorQuality < 85) {
      flags.push('low_inspector_quality');
    }

    // Check if new inspector (less experience)
    const inspectorCasesCompleted = application.routing?.assignedInspector?.workloadMetrics?.completedThisMonth || 0;
    if (inspectorCasesCompleted < 5) {
      flags.push('new_inspector');
    }

    // Check if complex inspection type
    if (application.routing?.inspectionType === 'FULL_ONSITE') {
      flags.push('complex_inspection');
    }

    // Check if high-value farm (large size)
    const farmSize = application.farm?.size || 0;
    if (farmSize > 20) {
      flags.push('large_farm');
    }

    // Check rejection history
    if (application.farmer?.history?.previousRejected) {
      flags.push('previous_rejection');
    }

    // Check QC review concerns
    if (application.qcReview?.flags?.length > 3) {
      flags.push('multiple_qc_flags');
    }

    // Determine overall risk level
    if (flags.length >= 3) {
      return 'HIGH';
    } else if (flags.length >= 1) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Get sampling rate based on risk level
   * @param {string} riskLevel
   * @returns {number} Sampling rate (0-1)
   */
  getSamplingRate(riskLevel) {
    const rates = {
      'HIGH': 1.0,    // 100% sampling
      'MEDIUM': 0.3,  // 30% sampling
      'LOW': 0.1      // 10% sampling
    };

    return rates[riskLevel] || 0.1;
  }

  /**
   * Get human-readable sampling reason
   * @param {string} riskLevel
   * @param {boolean} shouldSample
   * @returns {string} Reason
   */
  getSamplingReason(riskLevel, shouldSample) {
    if (!shouldSample) {
      return `Not selected for QA verification (${riskLevel} risk - random sampling)`;
    }

    const reasons = {
      'HIGH': 'High-risk case - requires QA verification',
      'MEDIUM': 'Medium risk - selected for QA verification',
      'LOW': 'Low risk - randomly selected for QA verification'
    };

    return reasons[riskLevel] || 'Selected for QA verification';
  }

  /**
   * Get QA verification queue (sampled applications)
   * @param {Array} applications - Completed applications
   * @returns {Array} Applications requiring QA verification
   */
  buildQAQueue(applications) {
    const queue = [];

    applications.forEach(app => {
      // Only sample completed applications
      if (app.status !== 'INSPECTION_COMPLETED') {
        return;
      }

      // Skip if already QA verified
      if (app.qaVerification?.status === 'VERIFIED') {
        return;
      }

      const samplingDecision = this.shouldSample(app);

      if (samplingDecision.shouldSample) {
        queue.push({
          application: app,
          riskLevel: samplingDecision.riskLevel,
          samplingReason: samplingDecision.reason,
          priority: this.calculateQAPriority(samplingDecision.riskLevel),
          queuedAt: new Date()
        });
      }
    });

    // Sort by priority (HIGH first)
    queue.sort((a, b) => b.priority - a.priority);

    return queue;
  }

  /**
   * Calculate QA priority (higher = more urgent)
   * @param {string} riskLevel
   * @returns {number} Priority score
   */
  calculateQAPriority(riskLevel) {
    const priorities = {
      'HIGH': 100,
      'MEDIUM': 50,
      'LOW': 10
    };

    return priorities[riskLevel] || 10;
  }

  /**
   * Check if QA verification is overdue
   * @param {Date} inspectionCompletedAt
   * @param {string} riskLevel
   * @returns {boolean} Is overdue
   */
  isQAOverdue(inspectionCompletedAt, riskLevel) {
    if (!inspectionCompletedAt) return false;

    const now = new Date();
    const daysSinceCompletion = (now - inspectionCompletedAt) / (1000 * 60 * 60 * 24);

    // SLA: HIGH = 1 day, MEDIUM = 3 days, LOW = 7 days
    const sla = {
      'HIGH': 1,
      'MEDIUM': 3,
      'LOW': 7
    };

    return daysSinceCompletion > (sla[riskLevel] || 7);
  }

  /**
   * Get sampling statistics
   * @param {Array} applications
   * @returns {Object} Statistics
   */
  getSamplingStats(applications) {
    const total = applications.length;
    let sampled = 0;
    const byRisk = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    applications.forEach(app => {
      if (app.qaVerification?.sampled) {
        sampled++;
        const risk = app.qaVerification.riskLevel || 'LOW';
        byRisk[risk]++;
      }
    });

    return {
      total,
      sampled,
      samplingRate: total > 0 ? (sampled / total * 100).toFixed(1) : 0,
      byRisk,
      notSampled: total - sampled
    };
  }
}

module.exports = SamplingService;
