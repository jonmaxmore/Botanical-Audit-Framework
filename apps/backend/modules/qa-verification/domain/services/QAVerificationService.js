/**
 * QA Verification Service
 *
 * Quality assurance verification of inspector work
 * - Document review
 * - Photo verification
 * - Report quality check
 * - Compliance verification
 */

class QAVerificationService {
  constructor({ samplingService, applicationRepository, logger }) {
    this.samplingService = samplingService;
    this.applicationRepository = applicationRepository;
    this.logger = logger;
  }

  /**
   * Perform QA verification on an application
   * @param {string} applicationId - Application ID
   * @param {Object} verifier - QA Verifier user
   * @param {Object} verificationData - Verification results
   * @returns {Promise<Object>} Verification result
   */
  async verifyApplication(applicationId, verifier, verificationData) {
    try {
      this.logger.info('Starting QA verification', {
        applicationId,
        verifierId: verifier._id,
      });

      const application = await this.applicationRepository.findById(applicationId);

      if (!application) {
        throw new Error('Application not found');
      }

      // Perform verification checks
      const documentCheck = this.verifyDocuments(application, verificationData.documents);
      const photoCheck = this.verifyPhotos(application, verificationData.photos);
      const reportCheck = this.verifyReport(application, verificationData.report);
      const complianceCheck = this.verifyCompliance(application, verificationData.compliance);

      // Calculate overall QA score
      const qaScore = this.calculateQAScore({
        documentCheck,
        photoCheck,
        reportCheck,
        complianceCheck,
      });

      // Determine verification status
      const status = this.determineVerificationStatus(qaScore, verificationData);

      // Identify issues
      const issues = this.identifyIssues({
        documentCheck,
        photoCheck,
        reportCheck,
        complianceCheck,
      });

      const result = {
        status, // APPROVED, NEEDS_CORRECTION, REJECTED
        qaScore,
        checks: {
          documents: documentCheck,
          photos: photoCheck,
          report: reportCheck,
          compliance: complianceCheck,
        },
        issues,
        verifiedBy: verifier._id,
        verifiedAt: new Date(),
        comments: verificationData.comments || '',
        nextAction: this.determineNextAction(status, issues),
      };

      this.logger.info('QA verification completed', {
        applicationId,
        status,
        qaScore,
        issuesCount: issues.length,
      });

      return result;
    } catch (error) {
      this.logger.error('QA verification failed', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify document quality
   * @param {Object} application
   * @param {Object} documentFeedback
   * @returns {Object} Document check result
   */
  verifyDocuments(application, documentFeedback) {
    const checks = [];
    let score = 100;

    // Check if all required documents are present
    const requiredDocs = ['nationalId', 'landDeed', 'farmPhotos'];
    const missingDocs = requiredDocs.filter(doc => !application.documents?.[doc]);

    if (missingDocs.length > 0) {
      checks.push({
        type: 'MISSING_DOCUMENTS',
        severity: 'HIGH',
        message: `Missing documents: ${missingDocs.join(', ')}`,
      });
      score -= 30;
    }

    // Check document quality (clarity, completeness)
    if (documentFeedback?.quality === 'poor') {
      checks.push({
        type: 'POOR_QUALITY',
        severity: 'MEDIUM',
        message: 'Document quality is poor (blurry, incomplete, or illegible)',
      });
      score -= 20;
    }

    // Check if documents match application data
    if (documentFeedback?.dataMatch === false) {
      checks.push({
        type: 'DATA_MISMATCH',
        severity: 'HIGH',
        message: 'Document data does not match application data',
      });
      score -= 25;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      checks,
      issuesFound: checks.length,
    };
  }

  /**
   * Verify photo quality and compliance
   * @param {Object} application
   * @param {Object} photoFeedback
   * @returns {Object} Photo check result
   */
  verifyPhotos(application, photoFeedback) {
    const checks = [];
    let score = 100;

    // Check photo count (minimum 5 photos)
    const photoCount = application.documents?.farmPhotos?.length || 0;
    if (photoCount < 5) {
      checks.push({
        type: 'INSUFFICIENT_PHOTOS',
        severity: 'HIGH',
        message: `Only ${photoCount} photos provided (minimum 5 required)`,
      });
      score -= 30;
    }

    // Check photo quality
    if (photoFeedback?.quality === 'poor') {
      checks.push({
        type: 'POOR_PHOTO_QUALITY',
        severity: 'MEDIUM',
        message: 'Photos are poor quality (blurry, dark, or unclear)',
      });
      score -= 20;
    }

    // Check if photos show required areas
    const requiredAreas = ['farm_entrance', 'growing_area', 'storage', 'equipment'];
    const missingAreas = requiredAreas.filter(area => !photoFeedback?.coveredAreas?.includes(area));

    if (missingAreas.length > 0) {
      checks.push({
        type: 'MISSING_COVERAGE',
        severity: 'MEDIUM',
        message: `Missing photos of: ${missingAreas.join(', ')}`,
      });
      score -= 15 * missingAreas.length;
    }

    // Check for photo manipulation
    if (photoFeedback?.manipulated === true) {
      checks.push({
        type: 'PHOTO_MANIPULATION',
        severity: 'CRITICAL',
        message: 'Photos appear to be manipulated or edited',
      });
      score -= 50;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      checks,
      issuesFound: checks.length,
    };
  }

  /**
   * Verify inspector report quality
   * @param {Object} application
   * @param {Object} reportFeedback
   * @returns {Object} Report check result
   */
  verifyReport(application, reportFeedback) {
    const checks = [];
    let score = 100;

    // Check if report is complete
    if (!application.inspectionReport?.summary) {
      checks.push({
        type: 'INCOMPLETE_REPORT',
        severity: 'HIGH',
        message: 'Inspection report is incomplete or missing summary',
      });
      score -= 30;
    }

    // Check report clarity
    if (reportFeedback?.clarity === 'poor') {
      checks.push({
        type: 'UNCLEAR_REPORT',
        severity: 'MEDIUM',
        message: 'Report is unclear or poorly written',
      });
      score -= 20;
    }

    // Check if findings are well-documented
    if (reportFeedback?.findingsDocumented === false) {
      checks.push({
        type: 'POOR_DOCUMENTATION',
        severity: 'MEDIUM',
        message: 'Findings are not well-documented or lack detail',
      });
      score -= 25;
    }

    // Check if recommendations are appropriate
    if (reportFeedback?.recommendationsAppropriate === false) {
      checks.push({
        type: 'INAPPROPRIATE_RECOMMENDATIONS',
        severity: 'MEDIUM',
        message: 'Recommendations do not match findings',
      });
      score -= 20;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      checks,
      issuesFound: checks.length,
    };
  }

  /**
   * Verify GACP compliance
   * @param {Object} application
   * @param {Object} complianceFeedback
   * @returns {Object} Compliance check result
   */
  verifyCompliance(application, complianceFeedback) {
    const checks = [];
    let score = 100;

    // Check if all GACP criteria were evaluated
    const requiredCriteria = [
      'farmLocation',
      'waterQuality',
      'soilQuality',
      'pestControl',
      'storage',
      'hygiene',
      'recordKeeping',
    ];

    const missingCriteria = requiredCriteria.filter(
      criteria => !application.inspectionReport?.gacpChecklist?.[criteria],
    );

    if (missingCriteria.length > 0) {
      checks.push({
        type: 'MISSING_CRITERIA',
        severity: 'HIGH',
        message: `Missing GACP criteria: ${missingCriteria.join(', ')}`,
      });
      score -= 15 * missingCriteria.length;
    }

    // Check if decision is justified
    if (complianceFeedback?.decisionJustified === false) {
      checks.push({
        type: 'UNJUSTIFIED_DECISION',
        severity: 'HIGH',
        message: 'Approval/rejection decision is not properly justified',
      });
      score -= 30;
    }

    // Check if risk assessment is accurate
    if (complianceFeedback?.riskAssessmentAccurate === false) {
      checks.push({
        type: 'INACCURATE_RISK_ASSESSMENT',
        severity: 'MEDIUM',
        message: 'Risk assessment appears inaccurate',
      });
      score -= 20;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      checks,
      issuesFound: checks.length,
    };
  }

  /**
   * Calculate overall QA score
   * @param {Object} checks - All check results
   * @returns {number} Overall QA score
   */
  calculateQAScore({ documentCheck, photoCheck, reportCheck, complianceCheck }) {
    const weights = {
      documents: 0.25, // 25%
      photos: 0.25, // 25%
      report: 0.25, // 25%
      compliance: 0.25, // 25%
    };

    const score =
      documentCheck.score * weights.documents +
      photoCheck.score * weights.photos +
      reportCheck.score * weights.report +
      complianceCheck.score * weights.compliance;

    return Math.round(score);
  }

  /**
   * Determine verification status
   * @param {number} qaScore
   * @param {Object} verificationData
   * @returns {string} Status
   */
  determineVerificationStatus(qaScore, verificationData) {
    // Manual override by verifier
    if (verificationData.overrideStatus) {
      return verificationData.overrideStatus;
    }

    // Auto-determine based on score
    if (qaScore >= 85) {
      return 'APPROVED'; // QA passed
    } else if (qaScore >= 70) {
      return 'NEEDS_CORRECTION'; // Minor issues, inspector should fix
    } else {
      return 'REJECTED'; // Major issues, requires re-inspection
    }
  }

  /**
   * Identify all issues from checks
   * @param {Object} checks
   * @returns {Array} List of issues
   */
  identifyIssues({ documentCheck, photoCheck, reportCheck, complianceCheck }) {
    const allIssues = [
      ...documentCheck.checks,
      ...photoCheck.checks,
      ...reportCheck.checks,
      ...complianceCheck.checks,
    ];

    // Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return allIssues;
  }

  /**
   * Determine next action based on verification result
   * @param {string} status
   * @param {Array} issues
   * @returns {string} Next action
   */
  determineNextAction(status, issues) {
    if (status === 'APPROVED') {
      return 'PROCEED_TO_FINAL_APPROVAL';
    } else if (status === 'NEEDS_CORRECTION') {
      const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
      if (criticalIssues.length > 0) {
        return 'RE_INSPECTION_REQUIRED';
      }
      return 'INSPECTOR_CORRECTION_REQUIRED';
    } else {
      return 'RE_INSPECTION_REQUIRED';
    }
  }

  /**
   * Request re-inspection for failed QA
   * @param {string} applicationId
   * @param {Object} verifier
   * @param {string} reason
   * @returns {Promise<Object>} Re-inspection request
   */
  async requestReInspection(applicationId, verifier, reason) {
    try {
      this.logger.info('Requesting re-inspection', {
        applicationId,
        verifierId: verifier._id,
        reason,
      });

      const application = await this.applicationRepository.findById(applicationId);

      if (!application) {
        throw new Error('Application not found');
      }

      const reInspectionRequest = {
        requestedBy: verifier._id,
        requestedAt: new Date(),
        reason,
        originalInspectorId: application.routing?.assignedInspectorId,
        status: 'PENDING_REASSIGNMENT',
      };

      return reInspectionRequest;
    } catch (error) {
      this.logger.error('Re-inspection request failed', {
        applicationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get QA verification statistics
   * @param {Object} filters - Date range, verifier, etc.
   * @returns {Promise<Object>} Statistics
   */
  async getQAStatistics(filters = {}) {
    try {
      const applications = await this.applicationRepository.findAll({
        ...filters,
        hasQAVerification: true,
      });

      const total = applications.length;
      const approved = applications.filter(a => a.qaVerification?.status === 'APPROVED').length;
      const needsCorrection = applications.filter(
        a => a.qaVerification?.status === 'NEEDS_CORRECTION',
      ).length;
      const rejected = applications.filter(a => a.qaVerification?.status === 'REJECTED').length;

      const avgQAScore =
        total > 0
          ? applications.reduce((sum, a) => sum + (a.qaVerification?.qaScore || 0), 0) / total
          : 0;

      return {
        total,
        approved,
        needsCorrection,
        rejected,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
        avgQAScore: avgQAScore.toFixed(1),
        rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get QA statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = QAVerificationService;
