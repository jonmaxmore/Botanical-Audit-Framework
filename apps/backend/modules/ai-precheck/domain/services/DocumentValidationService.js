/**
 * Document Validation Service
 *
 * Core business logic for validating application documents
 * - Check document completeness
 * - Validate document quality
 * - Calculate risk scores
 * - Generate recommendations
 */

class DocumentValidationService {
  constructor({ ocrService, aiConfigRepository, logger }) {
    this.ocrService = ocrService;
    this.aiConfigRepository = aiConfigRepository;
    this.logger = logger;
  }

  /**
   * Validate complete application
   * @param {Object} application - Application to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateApplication(application) {
    const startTime = Date.now();

    try {
      this.logger.info('Starting AI Pre-Check', { applicationId: application._id });

      // 1. Check document completeness
      const completeness = await this.checkCompleteness(application);

      // 2. OCR and extract text (if documents present)
      let extractedData = {};
      if (completeness.score >= 60) {
        extractedData = await this.ocrService.extractDocumentData(application.documents);
      }

      // 3. Validate extracted data
      const validation = await this.validateExtractedData(extractedData, application);

      // 4. Calculate risk score
      const riskScore = await this.calculateRiskScore({
        completeness,
        validation,
        farmerHistory: application.farmer?.history || {},
        farmSize: application.farm?.size || 0,
        cropType: application.cropType || 'unknown',
      });

      // 5. Generate recommendation
      const recommendation = this.generateRecommendation(riskScore);

      const processingTime = Date.now() - startTime;

      const result = {
        completenessScore: completeness.score,
        riskLevel: riskScore.level,
        flags: validation.issues || [],
        recommendation: recommendation,
        checkedAt: new Date(),
        processingTimeMs: processingTime,
        details: {
          completeness,
          extractedData,
          validation,
          riskScore,
        },
      };

      this.logger.info('AI Pre-Check completed', {
        applicationId: application._id,
        score: completeness.score,
        recommendation,
        processingTime,
      });

      return result;
    } catch (error) {
      this.logger.error('AI Pre-Check failed', {
        applicationId: application._id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check document completeness
   * @param {Object} application - Application
   * @returns {Promise<Object>} Completeness result
   */
  async checkCompleteness(application) {
    const requiredDocuments = [
      'NATIONAL_ID',
      'FARM_LICENSE',
      'FARM_MAP',
      'LAND_DEED',
      'PAYMENT_RECEIPT',
    ];

    const documents = application.documents || [];
    const present = requiredDocuments.filter(docType => documents.find(d => d.type === docType));

    const score = (present.length / requiredDocuments.length) * 100;
    const missing = requiredDocuments.filter(doc => !present.includes(doc));

    return {
      score: Math.round(score),
      total: requiredDocuments.length,
      present: present.length,
      missing,
      presentDocs: present,
    };
  }

  /**
   * Validate extracted data
   * @param {Object} extractedData - OCR extracted data
   * @param {Object} application - Original application
   * @returns {Promise<Object>} Validation result
   */
  async validateExtractedData(extractedData, application) {
    const issues = [];

    // Check if extracted name matches application
    if (extractedData.farmerName && application.farmer?.name) {
      if (!this.namesMatch(extractedData.farmerName, application.farmer.name)) {
        issues.push('Farmer name mismatch between document and application');
      }
    }

    // Check if farm location matches
    if (extractedData.farmLocation && application.farm?.location) {
      if (extractedData.farmLocation !== application.farm.location) {
        issues.push('Farm location mismatch');
      }
    }

    // Check payment verification
    const paymentVerified = application.payment?.status === 'verified';

    return {
      passed: issues.length === 0,
      issues,
      paymentVerified,
      extractedData,
    };
  }

  /**
   * Calculate risk score
   * @param {Object} params - Scoring parameters
   * @returns {Object} Risk score and level
   */
  calculateRiskScore({ completeness, validation, farmerHistory, farmSize, cropType }) {
    const config = this.aiConfigRepository.getConfig('PRE_CHECK');
    const weights = config?.weights || {
      documentCompleteness: 30,
      farmerHistory: 20,
      farmSize: 15,
      cropType: 10,
      paymentStatus: 25,
    };

    let score = 0;

    // Document completeness (30%)
    score += (completeness.score / 100) * weights.documentCompleteness;

    // Farmer history (20%)
    const historyScore = farmerHistory.previousCertified
      ? 100
      : farmerHistory.previousRejected
        ? 0
        : 50;
    score += (historyScore / 100) * weights.farmerHistory;

    // Farm size (15%) - smaller farms = lower risk
    const sizeScore = farmSize < 5 ? 100 : farmSize < 10 ? 80 : 60;
    score += (sizeScore / 100) * weights.farmSize;

    // Crop type (10%) - cannabis = higher scrutiny
    const cropScore = cropType === 'cannabis' ? 70 : 90;
    score += (cropScore / 100) * weights.cropType;

    // Payment status (25%)
    const paymentScore = validation.paymentVerified ? 100 : 0;
    score += (paymentScore / 100) * weights.paymentStatus;

    // Determine risk level
    let level = 'MEDIUM';
    if (score >= 80) {
      level = 'LOW';
    } else if (score < 60) {
      level = 'HIGH';
    }

    return {
      score: Math.round(score),
      level,
      breakdown: {
        completeness: Math.round((completeness.score / 100) * weights.documentCompleteness),
        history: Math.round((historyScore / 100) * weights.farmerHistory),
        size: Math.round((sizeScore / 100) * weights.farmSize),
        crop: Math.round((cropScore / 100) * weights.cropType),
        payment: Math.round((paymentScore / 100) * weights.paymentStatus),
      },
    };
  }

  /**
   * Generate recommendation based on risk score
   * @param {Object} riskScore - Risk score object
   * @returns {string} Recommendation
   */
  generateRecommendation(riskScore) {
    if (riskScore.score < 50) {
      return 'AUTO_REJECT';
    }
    if (riskScore.score >= 90) {
      return 'FAST_TRACK';
    }
    return 'PROCEED_TO_QC';
  }

  /**
   * Check if two names match (fuzzy matching)
   * @param {string} name1
   * @param {string} name2
   * @returns {boolean}
   */
  namesMatch(name1, name2) {
    const normalize = str => str.toLowerCase().replace(/\s+/g, '');
    return normalize(name1) === normalize(name2);
  }
}

module.exports = DocumentValidationService;
