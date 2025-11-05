/**
 * Routing Service
 *
 * Core business logic for intelligent routing
 * - Calculate routing priority
 * - Determine inspection type
 * - Find optimal inspector
 * - Estimate duration
 */

class RoutingService {
  constructor({ aiConfigRepository, inspectorRepository, logger }) {
    this.aiConfigRepository = aiConfigRepository;
    this.inspectorRepository = inspectorRepository;
    this.logger = logger;
  }

  /**
   * Route application to inspector
   * @param {Object} application - Application to route
   * @returns {Promise<Object>} Routing decision
   */
  async routeApplication(application) {
    try {
      this.logger.info('Starting Smart Router', { applicationId: application._id });

      // 1. Calculate priority
      const priority = await this.calculatePriority(application);

      // 2. Determine inspection type
      const inspectionType = this.determineInspectionType(application);

      // 3. Find optimal inspector
      const inspector = await this.findOptimalInspector({
        location: application.farm?.province || application.farm?.location,
        inspectionType,
        specialization: application.cropType,
        priority
      });

      // 4. Estimate duration
      const estimatedDuration = this.estimateDuration(
        inspectionType,
        application.farm?.size || 5
      );

      // 5. Generate routing reason
      const routingReason = this.generateRoutingReason({
        priority,
        inspectionType,
        reviewScore: application.qcReview?.preScore || 0
      });

      const result = {
        priority,
        inspectionType,
        assignedInspectorId: inspector?._id || null,
        estimatedDuration,
        routedAt: new Date(),
        routingReason
      };

      this.logger.info('Smart Router completed', {
        applicationId: application._id,
        priority,
        inspectionType,
        inspectorId: inspector?._id
      });

      return result;

    } catch (error) {
      this.logger.error('Smart Router failed', {
        applicationId: application._id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate routing priority
   * @param {Object} application
   * @returns {Promise<string>} Priority level
   */
  async calculatePriority(application) {
    const config = await this.aiConfigRepository.getConfig('SMART_ROUTER');
    const weights = config?.weights || {
      reviewScore: 40,
      farmerHistory: 30,
      farmSize: 20,
      cropType: 10
    };

    let score = 0;

    // Review score (40%)
    const reviewScore = application.qcReview?.preScore ||
                       application.aiPreCheck?.completenessScore || 50;
    score += (reviewScore / 100) * weights.reviewScore;

    // Farmer history (30%)
    const historyScore = application.farmer?.history?.previousCertified ? 100 :
                        application.farmer?.history?.previousRejected ? 0 : 50;
    score += (historyScore / 100) * weights.farmerHistory;

    // Farm size (20%)
    const farmSize = application.farm?.size || 5;
    const sizeScore = farmSize < 5 ? 100 : farmSize < 10 ? 80 : 60;
    score += (sizeScore / 100) * weights.farmSize;

    // Crop type (10%)
    const cropScore = application.cropType === 'cannabis' ? 70 : 90;
    score += (cropScore / 100) * weights.cropType;

    // Determine priority
    if (score >= 85) return 'FAST_TRACK';
    if (score < 60) return 'HIGH_RISK';
    return 'NORMAL';
  }

  /**
   * Determine inspection type based on score and history
   * @param {Object} application
   * @returns {string} Inspection type
   */
  determineInspectionType(application) {
    const reviewScore = application.qcReview?.preScore ||
                       application.aiPreCheck?.completenessScore || 50;
    const farmerHistory = application.farmer?.history || {};
    const farmSize = application.farm?.size || 5;

    // High-score farms (>= 90) + certified before → Video only
    if (reviewScore >= 90 && farmerHistory.previousCertified) {
      return 'VIDEO_ONLY';
    }

    // Medium-score farms (70-89) → Hybrid
    if (reviewScore >= 70 && reviewScore < 90) {
      return 'HYBRID';
    }

    // Large farms (> 20 rai) → Always full onsite
    if (farmSize > 20) {
      return 'FULL_ONSITE';
    }

    // Low-score farms (< 70) → Full onsite
    if (reviewScore < 70) {
      return 'FULL_ONSITE';
    }

    // Default to hybrid
    return 'HYBRID';
  }

  /**
   * Find optimal inspector for assignment
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object|null>} Inspector or null
   */
  async findOptimalInspector({ location, inspectionType, specialization, priority }) {
    try {
      // Find inspectors with:
      // 1. Active status
      // 2. Not overloaded (< 10 cases)
      // 3. Has specialization in crop type
      // 4. Prefer same location

      const inspectors = await this.inspectorRepository.findAvailable({
        maxWorkload: 10,
        specialization,
        isActive: true
      });

      if (!inspectors || inspectors.length === 0) {
        this.logger.warn('No available inspectors found');
        return null;
      }

      // Sort by: location match > workload > quality score
      const sorted = inspectors.sort((a, b) => {
        // Location match (same province)
        const aLocationMatch = a.department?.includes(location) ? 1 : 0;
        const bLocationMatch = b.department?.includes(location) ? 1 : 0;
        if (aLocationMatch !== bLocationMatch) {
          return bLocationMatch - aLocationMatch;
        }

        // Workload (lower is better)
        const aWorkload = a.workloadMetrics?.assignedCases || 0;
        const bWorkload = b.workloadMetrics?.assignedCases || 0;
        if (aWorkload !== bWorkload) {
          return aWorkload - bWorkload;
        }

        // Quality score (higher is better)
        const aQuality = a.workloadMetrics?.qualityScore || 100;
        const bQuality = b.workloadMetrics?.qualityScore || 100;
        return bQuality - aQuality;
      });

      return sorted[0];

    } catch (error) {
      this.logger.error('Find inspector failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Estimate inspection duration
   * @param {string} inspectionType
   * @param {number} farmSize
   * @returns {string} Duration estimate
   */
  estimateDuration(inspectionType, farmSize) {
    const baseTime = {
      'VIDEO_ONLY': 2,      // 2 hours
      'HYBRID': 4,          // 4 hours
      'FULL_ONSITE': 8      // 8 hours (1 day)
    };

    const sizeMultiplier = farmSize > 10 ? 1.5 : 1.0;
    const hours = (baseTime[inspectionType] || 4) * sizeMultiplier;

    if (hours <= 4) return `${hours} hours`;
    const days = Math.ceil(hours / 8);
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  /**
   * Generate human-readable routing reason
   * @param {Object} params
   * @returns {string} Routing reason
   */
  generateRoutingReason({ priority, inspectionType, reviewScore }) {
    const reasons = [];

    if (priority === 'FAST_TRACK') {
      reasons.push('High score application');
    } else if (priority === 'HIGH_RISK') {
      reasons.push('Low score - requires thorough inspection');
    }

    if (inspectionType === 'VIDEO_ONLY') {
      reasons.push('Video inspection sufficient (high confidence)');
    } else if (inspectionType === 'HYBRID') {
      reasons.push('Video first, onsite if needed');
    } else {
      reasons.push('Full onsite inspection required');
    }

    reasons.push(`Review score: ${reviewScore}`);

    return reasons.join('. ');
  }

  /**
   * Rebalance workload among inspectors
   * @returns {Promise<Object>} Rebalancing result
   */
  async rebalanceWorkload() {
    try {
      this.logger.info('Starting workload rebalancing');

      const inspectors = await this.inspectorRepository.findAll({
        isActive: true
      });

      // Calculate average workload
      const totalWorkload = inspectors.reduce((sum, i) =>
        sum + (i.workloadMetrics?.assignedCases || 0), 0
      );
      const avgWorkload = totalWorkload / inspectors.length;

      // Find overloaded and underloaded inspectors
      const overloaded = inspectors.filter(i =>
        (i.workloadMetrics?.assignedCases || 0) > avgWorkload * 1.3
      );
      const underloaded = inspectors.filter(i =>
        (i.workloadMetrics?.assignedCases || 0) < avgWorkload * 0.7
      );

      this.logger.info('Workload analysis', {
        total: inspectors.length,
        avgWorkload,
        overloaded: overloaded.length,
        underloaded: underloaded.length
      });

      return {
        avgWorkload,
        overloaded: overloaded.length,
        underloaded: underloaded.length,
        balanced: overloaded.length === 0 && underloaded.length === 0
      };

    } catch (error) {
      this.logger.error('Workload rebalancing failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = RoutingService;
