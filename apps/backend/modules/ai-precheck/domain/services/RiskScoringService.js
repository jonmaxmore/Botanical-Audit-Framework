/**
 * Risk Scoring Service
 *
 * Advanced risk assessment for applications
 * - Historical data analysis
 * - Pattern recognition
 * - Fraud detection
 * - Risk level classification
 */

class RiskScoringService {
  constructor({ logger }) {
    this.logger = logger;
  }

  /**
   * Calculate comprehensive risk score
   * @param {Object} application - Application data
   * @param {Object} extractedData - OCR extracted data
   * @returns {Promise<Object>} Risk assessment
   */
  async calculateRisk(application, extractedData) {
    try {
      this.logger.info('Calculating risk score', {
        applicationId: application._id,
      });

      // Calculate individual risk components
      const documentRisk = this.assessDocumentRisk(application, extractedData);
      const farmerRisk = this.assessFarmerRisk(application);
      const farmRisk = this.assessFarmRisk(application);
      const historicalRisk = await this.assessHistoricalRisk(application);
      const fraudRisk = this.assessFraudRisk(application, extractedData);

      // Weight each component
      const weights = {
        document: 0.25, // 25%
        farmer: 0.2, // 20%
        farm: 0.2, // 20%
        historical: 0.2, // 20%
        fraud: 0.15, // 15%
      };

      // Calculate weighted score
      const riskScore =
        documentRisk.score * weights.document +
        farmerRisk.score * weights.farmer +
        farmRisk.score * weights.farm +
        historicalRisk.score * weights.historical +
        fraudRisk.score * weights.fraud;

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);

      // Collect all flags
      const flags = [
        ...documentRisk.flags,
        ...farmerRisk.flags,
        ...farmRisk.flags,
        ...historicalRisk.flags,
        ...fraudRisk.flags,
      ];

      // Generate recommendation
      const recommendation = this.generateRecommendation(riskLevel, flags);

      const result = {
        riskScore: Math.round(riskScore),
        riskLevel,
        flags,
        recommendation,
        components: {
          document: documentRisk,
          farmer: farmerRisk,
          farm: farmRisk,
          historical: historicalRisk,
          fraud: fraudRisk,
        },
        calculatedAt: new Date(),
      };

      this.logger.info('Risk calculation completed', {
        applicationId: application._id,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        flagsCount: flags.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Risk calculation failed', {
        applicationId: application._id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Assess document-related risk
   * @param {Object} application
   * @param {Object} extractedData
   * @returns {Object} Document risk assessment
   */
  assessDocumentRisk(application, extractedData) {
    const flags = [];
    let score = 100;

    // Check for missing documents
    const requiredDocs = ['nationalId', 'landDeed', 'farmPhotos'];
    const missingDocs = requiredDocs.filter(doc => !application.documents?.[doc]);

    if (missingDocs.length > 0) {
      flags.push({
        type: 'MISSING_DOCUMENTS',
        severity: 'HIGH',
        message: `Missing: ${missingDocs.join(', ')}`,
      });
      score -= 30 * missingDocs.length;
    }

    // Check OCR quality issues
    if (extractedData?.qualityIssues?.length > 0) {
      flags.push({
        type: 'DOCUMENT_QUALITY_ISSUES',
        severity: 'MEDIUM',
        message: `Quality issues in ${extractedData.qualityIssues.length} documents`,
      });
      score -= 15 * extractedData.qualityIssues.length;
    }

    // Check data consistency
    if (extractedData?.nationalId) {
      const idMatch = this.checkNameConsistency(
        application.farmer?.name,
        extractedData.nationalId.name,
      );
      if (!idMatch) {
        flags.push({
          type: 'NAME_MISMATCH',
          severity: 'HIGH',
          message: 'Name on ID does not match application',
        });
        score -= 40;
      }
    }

    return {
      score: Math.max(0, score),
      flags,
    };
  }

  /**
   * Assess farmer-related risk
   * @param {Object} application
   * @returns {Object} Farmer risk assessment
   */
  assessFarmerRisk(application) {
    const flags = [];
    let score = 100;

    const farmer = application.farmer || {};
    const history = farmer.history || {};

    // Check previous rejections
    if (history.previousRejected) {
      flags.push({
        type: 'PREVIOUS_REJECTION',
        severity: 'HIGH',
        message: 'Farmer has previous rejected applications',
      });
      score -= 40;
    }

    // Check for multiple violations
    if (history.violations && history.violations.length > 0) {
      flags.push({
        type: 'COMPLIANCE_VIOLATIONS',
        severity: 'HIGH',
        message: `${history.violations.length} previous violations`,
      });
      score -= 20 * Math.min(history.violations.length, 3);
    }

    // Check incomplete profile
    const requiredFields = ['name', 'nationalId', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !farmer[field]);

    if (missingFields.length > 0) {
      flags.push({
        type: 'INCOMPLETE_PROFILE',
        severity: 'MEDIUM',
        message: `Missing: ${missingFields.join(', ')}`,
      });
      score -= 10 * missingFields.length;
    }

    // Boost score for good history
    if (history.previousCertified) {
      score = Math.min(100, score + 20);
    }

    return {
      score: Math.max(0, score),
      flags,
    };
  }

  /**
   * Assess farm-related risk
   * @param {Object} application
   * @returns {Object} Farm risk assessment
   */
  assessFarmRisk(application) {
    const flags = [];
    let score = 100;

    const farm = application.farm || {};

    // Check farm size (very large farms = higher risk)
    if (farm.size > 50) {
      flags.push({
        type: 'LARGE_FARM',
        severity: 'MEDIUM',
        message: 'Large farm size requires thorough inspection',
      });
      score -= 15;
    }

    // Check for high-risk crop types
    if (application.cropType === 'cannabis') {
      flags.push({
        type: 'HIGH_RISK_CROP',
        severity: 'MEDIUM',
        message: 'Cannabis cultivation requires additional oversight',
      });
      score -= 10;
    }

    // Check location risk (remote areas)
    if (farm.isRemote) {
      flags.push({
        type: 'REMOTE_LOCATION',
        severity: 'LOW',
        message: 'Remote farm location',
      });
      score -= 5;
    }

    // Check incomplete farm data
    const requiredFields = ['location', 'size', 'province'];
    const missingFields = requiredFields.filter(field => !farm[field]);

    if (missingFields.length > 0) {
      flags.push({
        type: 'INCOMPLETE_FARM_DATA',
        severity: 'MEDIUM',
        message: `Missing farm data: ${missingFields.join(', ')}`,
      });
      score -= 10 * missingFields.length;
    }

    return {
      score: Math.max(0, score),
      flags,
    };
  }

  /**
   * Assess historical patterns
   * @param {Object} application
   * @returns {Promise<Object>} Historical risk assessment
   */
  async assessHistoricalRisk(application) {
    const flags = [];
    let score = 100;

    // TODO: Query historical data from database
    // For now, use mock data

    const history = application.farmer?.history || {};

    // Check application frequency (too many applications = suspicious)
    const recentApplications = history.applicationCount || 0;
    if (recentApplications > 5) {
      flags.push({
        type: 'FREQUENT_APPLICATIONS',
        severity: 'MEDIUM',
        message: `${recentApplications} applications in past year`,
      });
      score -= 15;
    }

    // Check for pattern of quick re-applications after rejection
    if (history.quickReapplication) {
      flags.push({
        type: 'QUICK_REAPPLICATION',
        severity: 'MEDIUM',
        message: 'Quick re-application after rejection',
      });
      score -= 20;
    }

    // Check inspection history
    if (history.failedInspections > 2) {
      flags.push({
        type: 'MULTIPLE_FAILED_INSPECTIONS',
        severity: 'HIGH',
        message: `${history.failedInspections} failed inspections`,
      });
      score -= 25;
    }

    return {
      score: Math.max(0, score),
      flags,
    };
  }

  /**
   * Assess fraud risk
   * @param {Object} application
   * @param {Object} extractedData
   * @returns {Object} Fraud risk assessment
   */
  assessFraudRisk(application, extractedData) {
    const flags = [];
    let score = 100;

    // Check for duplicate National ID
    // TODO: Query database for duplicate IDs
    const duplicateId = false; // Mock
    if (duplicateId) {
      flags.push({
        type: 'DUPLICATE_NATIONAL_ID',
        severity: 'CRITICAL',
        message: 'National ID already used in another application',
      });
      score -= 60;
    }

    // Check for suspicious document patterns
    if (extractedData?.nationalId?.confidence < 0.7) {
      flags.push({
        type: 'LOW_OCR_CONFIDENCE',
        severity: 'MEDIUM',
        message: 'Low confidence in document authenticity',
      });
      score -= 20;
    }

    // Check for inconsistent addresses
    const addressMatch = this.checkAddressConsistency(
      application.farmer?.address,
      application.farm?.location,
    );
    if (!addressMatch) {
      flags.push({
        type: 'ADDRESS_INCONSISTENCY',
        severity: 'MEDIUM',
        message: 'Farmer address and farm location are very different',
      });
      score -= 15;
    }

    // Check for unusually perfect data (might be fabricated)
    const completeness = this.calculateDataCompleteness(application);
    if (completeness === 100 && !application.farmer?.history?.previousCertified) {
      flags.push({
        type: 'SUSPICIOUS_COMPLETENESS',
        severity: 'LOW',
        message: 'Unusually complete data for first-time applicant',
      });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      flags,
    };
  }

  /**
   * Determine risk level from score
   * @param {number} riskScore
   * @returns {string} Risk level
   */
  determineRiskLevel(riskScore) {
    if (riskScore < 50) return 'HIGH';
    if (riskScore < 70) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate recommendation based on risk
   * @param {string} riskLevel
   * @param {Array} flags
   * @returns {string} Recommendation
   */
  generateRecommendation(riskLevel, flags) {
    const criticalFlags = flags.filter(f => f.severity === 'CRITICAL');
    const highFlags = flags.filter(f => f.severity === 'HIGH');

    if (criticalFlags.length > 0) {
      return 'REJECT - Critical issues detected';
    }

    if (riskLevel === 'HIGH' || highFlags.length >= 3) {
      return 'MANUAL_REVIEW - High risk, requires thorough review';
    }

    if (riskLevel === 'MEDIUM' || highFlags.length > 0) {
      return 'STANDARD_REVIEW - Medium risk, standard review process';
    }

    return 'FAST_TRACK - Low risk, eligible for expedited review';
  }

  /**
   * Check name consistency
   * @param {string} name1
   * @param {string} name2
   * @returns {boolean} Names match
   */
  checkNameConsistency(name1, name2) {
    if (!name1 || !name2) return false;

    // Normalize and compare
    const normalize = str => str.trim().toLowerCase().replace(/\s+/g, ' ');
    return normalize(name1) === normalize(name2);
  }

  /**
   * Check address consistency
   * @param {string} farmerAddress
   * @param {string} farmLocation
   * @returns {boolean} Addresses are consistent
   */
  checkAddressConsistency(farmerAddress, farmLocation) {
    if (!farmerAddress || !farmLocation) return true; // Can't check

    // Check if they share the same province
    const provinces = [
      'เชียงใหม่',
      'กรุงเทพ',
      'ขอนแก่น',
      'นครราชสีมา',
      'เชียงราย',
      'ลำปาง',
      'พะเยา',
      'แม่ฮ่องสอน',
    ];

    for (const province of provinces) {
      const inFarmerAddress = farmerAddress.includes(province);
      const inFarmLocation = farmLocation.includes(province);

      if (inFarmerAddress && inFarmLocation) {
        return true; // Same province
      }
    }

    return false; // Different provinces or unknown
  }

  /**
   * Calculate data completeness
   * @param {Object} application
   * @returns {number} Completeness percentage
   */
  calculateDataCompleteness(application) {
    const allFields = [
      'farmer.name',
      'farmer.nationalId',
      'farmer.phone',
      'farmer.address',
      'farm.location',
      'farm.size',
      'farm.province',
      'documents.nationalId',
      'documents.landDeed',
      'documents.farmPhotos',
      'cropType',
    ];

    const presentFields = allFields.filter(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], application);
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((presentFields.length / allFields.length) * 100);
  }
}

module.exports = RiskScoringService;
