/**
 * GACP Platform - CCP Assessment Service
 *
 * PURPOSE: Handle Critical Control Points assessment with proper business logic
 * COMPLIANCE: WHO GACP 2003, Thai FDA GACP 2018, FAO Guidelines
 * METHODOLOGY: HACCP-based assessment for medicinal plants
 *
 * BUSINESS LOGIC FOUNDATION:
 * - 8 Critical Control Points framework
 * - Weighted scoring system (Total: 100%, Passing: 75%)
 * - Certificate levels (Gold/Silver/Bronze)
 * - Risk-based assessment and monitoring
 * - Evidence validation and compliance tracking
 */

import { gacpApiClient } from './gacp-api-client';

// ============================================================================
// TYPE DEFINITIONS - CCP Assessment Specific
// ============================================================================

export interface CCPAssessmentData {
  applicationId: string;
  farmId: string;
  inspectorId: string;
  inspectionDate: string;

  // CCP Assessment scores (0-100 for each CCP)
  ccpScores: {
    CCP01_SeedQuality: number; // Weight: 15%
    CCP02_SoilManagement: number; // Weight: 12%
    CCP03_PestManagement: number; // Weight: 18%
    CCP04_HarvestingPractices: number; // Weight: 15%
    CCP05_PostHarvestHandling: number; // Weight: 13%
    CCP06_StoragePackaging: number; // Weight: 10%
    CCP07_Documentation: number; // Weight: 9%
    CCP08_PersonnelHygiene: number; // Weight: 8%
  };

  // Evidence and documentation
  evidence: {
    [ccpId: string]: {
      photos: string[];
      documents: string[];
      observations: string;
      compliance: 'compliant' | 'minor_deviation' | 'major_deviation' | 'critical_deviation';
      corrective_actions?: string[];
    };
  };

  // Overall assessment
  overallComments: string;
  recommendations: string[];
  followUpRequired: boolean;
  nextInspectionDate?: string;
}

export interface CCPAssessmentResult {
  applicationId: string;
  totalScore: number;
  weightedScore: number;
  passingStatus: 'passed' | 'failed' | 'conditional';
  certificateLevel: 'gold' | 'silver' | 'bronze' | 'none';
  riskLevel: 'low' | 'medium' | 'high';

  // Individual CCP results
  ccpResults: {
    [ccpId: string]: {
      score: number;
      weight: number;
      weightedScore: number;
      status: 'passed' | 'failed';
      minScore: number;
      compliance: string;
    };
  };

  // Certificate information
  certificate: {
    eligible: boolean;
    level: 'gold' | 'silver' | 'bronze' | 'none';
    validityPeriod: number; // months
    conditions?: string[];
    restrictions?: string[];
  };

  // Follow-up requirements
  followUp: {
    required: boolean;
    timeline: string;
    requirements: string[];
    nextInspection?: string;
  };
}

export interface CCPFrameworkInfo {
  totalCCPs: number;
  ccps: CCPDefinition[];
  scoringSystem: {
    TOTAL_SCORE_MAX: number;
    OVERALL_PASSING_SCORE: number;
    CERTIFICATE_LEVELS: {
      GOLD: { minScore: number; requirements: string[] };
      SILVER: { minScore: number; requirements: string[] };
      BRONZE: { minScore: number; requirements: string[] };
    };
    RISK_LEVELS: {
      LOW: { maxScore: number; description: string };
      MEDIUM: { scoreRange: [number, number]; description: string };
      HIGH: { minScore: number; description: string };
    };
  };
  framework: string;
  methodology: string;
}

export interface CCPDefinition {
  id: string;
  name: string;
  name_th: string;
  criteria: CCPCriteria[];
  weight: number;
  minScore: number;
  complianceStandards: string[];
}

export interface CCPCriteria {
  id: string;
  description: string;
  description_th: string;
  maxPoints: number;
  assessmentMethod: 'observation' | 'document_review' | 'interview' | 'measurement';
  evidence_required: string[];
  compliance_level: 'critical' | 'major' | 'minor';
}

// ============================================================================
// GACP CCP ASSESSMENT SERVICE CLASS
// ============================================================================

class GACPCCPService {
  private static instance: GACPCCPService;
  private ccpFramework: CCPFrameworkInfo | null = null;

  public static getInstance(): GACPCCPService {
    if (!GACPCCPService.instance) {
      GACPCCPService.instance = new GACPCCPService();
    }
    return GACPCCPService.instance;
  }

  /**
   * Initialize CCP service by loading framework information
   */
  async initialize(): Promise<void> {
    try {
      const response = await gacpApiClient.getGACPCCPs();

      if (response.success && response.data) {
        this.ccpFramework = response.data as CCPFrameworkInfo;

        console.log('[GACP CCP] Service initialized with', {
          totalCCPs: this.ccpFramework.totalCCPs,
          framework: this.ccpFramework.framework,
          methodology: this.ccpFramework.methodology,
        });
      } else {
        throw new Error('Failed to load CCP framework information');
      }
    } catch (error) {
      console.error('[GACP CCP] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get CCP framework information
   */
  async getCCPFramework(): Promise<CCPFrameworkInfo> {
    if (!this.ccpFramework) {
      await this.initialize();
    }
    return this.ccpFramework!;
  }

  /**
   * Get specific CCP definition
   */
  async getCCPDefinition(ccpId: string): Promise<CCPDefinition | null> {
    const framework = await this.getCCPFramework();
    return framework.ccps.find(ccp => ccp.id === ccpId) || null;
  }

  /**
   * Calculate CCP assessment score
   */
  async calculateAssessmentScore(assessmentData: CCPAssessmentData): Promise<CCPAssessmentResult> {
    try {
      // Validate assessment data
      this.validateAssessmentData(assessmentData);

      const framework = await this.getCCPFramework();
      const result: CCPAssessmentResult = {
        applicationId: assessmentData.applicationId,
        totalScore: 0,
        weightedScore: 0,
        passingStatus: 'failed',
        certificateLevel: 'none',
        riskLevel: 'high',
        ccpResults: {},
        certificate: {
          eligible: false,
          level: 'none',
          validityPeriod: 0,
        },
        followUp: {
          required: true,
          timeline: '',
          requirements: [],
        },
      };

      // Calculate individual CCP scores
      let totalWeightedScore = 0;
      let allCCPsPassed = true;

      for (const ccp of framework.ccps) {
        const ccpScore = this.getCCPScore(ccp.id, assessmentData.ccpScores);
        const weightedScore = (ccpScore * ccp.weight) / 100;
        const passed = ccpScore >= ccp.minScore;

        if (!passed) {
          allCCPsPassed = false;
        }

        result.ccpResults[ccp.id] = {
          score: ccpScore,
          weight: ccp.weight,
          weightedScore: weightedScore,
          status: passed ? 'passed' : 'failed',
          minScore: ccp.minScore,
          compliance: this.getComplianceStatus(ccpScore, ccp.minScore),
        };

        totalWeightedScore += weightedScore;
      }

      // Set overall scores
      result.totalScore = totalWeightedScore;
      result.weightedScore = totalWeightedScore;

      // Determine passing status
      const passingScore = framework.scoringSystem.OVERALL_PASSING_SCORE;
      result.passingStatus = totalWeightedScore >= passingScore ? 'passed' : 'failed';

      // Determine certificate level
      result.certificateLevel = this.determineCertificateLevel(totalWeightedScore, framework);
      result.certificate = this.generateCertificateInfo(
        totalWeightedScore,
        allCCPsPassed,
        framework,
      );

      // Determine risk level
      result.riskLevel = this.determineRiskLevel(totalWeightedScore, framework);

      // Generate follow-up requirements
      result.followUp = this.generateFollowUpRequirements(result, assessmentData);

      // Log assessment result
      console.log('[GACP CCP] Assessment calculated:', {
        applicationId: assessmentData.applicationId,
        totalScore: result.totalScore,
        passingStatus: result.passingStatus,
        certificateLevel: result.certificateLevel,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('[GACP CCP] Assessment calculation failed:', error);
      throw error;
    }
  }

  /**
   * Submit CCP assessment
   */
  async submitAssessment(assessmentData: CCPAssessmentData): Promise<any> {
    try {
      // Calculate scores first
      const result = await this.calculateAssessmentScore(assessmentData);

      // Submit via API
      const response = await gacpApiClient.post('/api/assessments/ccp', {
        assessmentData,
        calculatedResult: result,
      });

      console.log('[GACP CCP] Assessment submitted:', {
        applicationId: assessmentData.applicationId,
        totalScore: result.totalScore,
        certificateLevel: result.certificateLevel,
      });

      return response;
    } catch (error) {
      console.error('[GACP CCP] Assessment submission failed:', error);
      throw error;
    }
  }

  /**
   * Get assessment history for an application
   */
  async getAssessmentHistory(applicationId: string): Promise<any> {
    try {
      return await gacpApiClient.get(`/api/assessments/ccp/${applicationId}/history`);
    } catch (error) {
      console.error('[GACP CCP] Get assessment history failed:', error);
      throw error;
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Validate assessment data
   */
  private validateAssessmentData(data: CCPAssessmentData): void {
    if (!data.applicationId) throw new Error('Application ID is required');
    if (!data.farmId) throw new Error('Farm ID is required');
    if (!data.inspectorId) throw new Error('Inspector ID is required');
    if (!data.inspectionDate) throw new Error('Inspection date is required');

    // Validate CCP scores
    const requiredCCPs = [
      'CCP01_SeedQuality',
      'CCP02_SoilManagement',
      'CCP03_PestManagement',
      'CCP04_HarvestingPractices',
      'CCP05_PostHarvestHandling',
      'CCP06_StoragePackaging',
      'CCP07_Documentation',
      'CCP08_PersonnelHygiene',
    ];

    for (const ccp of requiredCCPs) {
      const score = (data.ccpScores as any)[ccp];
      if (score === undefined || score < 0 || score > 100) {
        throw new Error(`Invalid score for ${ccp}: must be between 0-100`);
      }
    }
  }

  /**
   * Get CCP score from assessment data
   */
  private getCCPScore(ccpId: string, ccpScores: any): number {
    const scoreMap: { [key: string]: keyof CCPAssessmentData['ccpScores'] } = {
      CCP01: 'CCP01_SeedQuality',
      CCP02: 'CCP02_SoilManagement',
      CCP03: 'CCP03_PestManagement',
      CCP04: 'CCP04_HarvestingPractices',
      CCP05: 'CCP05_PostHarvestHandling',
      CCP06: 'CCP06_StoragePackaging',
      CCP07: 'CCP07_Documentation',
      CCP08: 'CCP08_PersonnelHygiene',
    };

    const scoreKey = scoreMap[ccpId];
    return scoreKey ? ccpScores[scoreKey] : 0;
  }

  /**
   * Get compliance status based on score
   */
  private getComplianceStatus(score: number, minScore: number): string {
    if (score >= minScore) return 'compliant';
    if (score >= minScore * 0.8) return 'minor_deviation';
    if (score >= minScore * 0.6) return 'major_deviation';
    return 'critical_deviation';
  }

  /**
   * Determine certificate level
   */
  private determineCertificateLevel(
    score: number,
    framework: CCPFrameworkInfo,
  ): 'gold' | 'silver' | 'bronze' | 'none' {
    if (score >= 90) return 'gold';
    if (score >= 85) return 'silver';
    if (score >= 75) return 'bronze';
    return 'none';
  }

  /**
   * Generate certificate information
   */
  private generateCertificateInfo(
    score: number,
    allCCPsPassed: boolean,
    framework: CCPFrameworkInfo,
  ): CCPAssessmentResult['certificate'] {
    const level = this.determineCertificateLevel(score, framework);
    const eligible = score >= framework.scoringSystem.OVERALL_PASSING_SCORE && allCCPsPassed;

    const validityPeriods = {
      gold: 36, // 3 years
      silver: 24, // 2 years
      bronze: 12, // 1 year
      none: 0,
    };

    return {
      eligible,
      level,
      validityPeriod: validityPeriods[level],
      conditions: eligible ? [] : ['All CCPs must meet minimum requirements'],
      restrictions: level === 'bronze' ? ['Annual monitoring required'] : undefined,
    };
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    score: number,
    framework: CCPFrameworkInfo,
  ): 'low' | 'medium' | 'high' {
    if (score >= 85) return 'low';
    if (score >= 75) return 'medium';
    return 'high';
  }

  /**
   * Generate follow-up requirements
   */
  private generateFollowUpRequirements(
    result: CCPAssessmentResult,
    assessmentData: CCPAssessmentData,
  ): CCPAssessmentResult['followUp'] {
    const requirements: string[] = [];

    // Check for failed CCPs
    const failedCCPs = Object.entries(result.ccpResults)
      .filter(([_, ccpResult]) => ccpResult.status === 'failed')
      .map(([ccpId, _]) => ccpId);

    if (failedCCPs.length > 0) {
      requirements.push(`Address deficiencies in: ${failedCCPs.join(', ')}`);
    }

    // Risk-based follow-up
    if (result.riskLevel === 'high') {
      requirements.push('Immediate corrective action required');
      requirements.push('Re-inspection within 30 days');
    } else if (result.riskLevel === 'medium') {
      requirements.push('Corrective action plan required');
      requirements.push('Follow-up inspection within 90 days');
    }

    // Certificate level based follow-up
    if (result.certificateLevel === 'bronze') {
      requirements.push('Annual monitoring visits required');
    }

    return {
      required: requirements.length > 0,
      timeline: result.riskLevel === 'high' ? '30 days' : '90 days',
      requirements,
      nextInspection: assessmentData.nextInspectionDate,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

// Create singleton instance
const gacpCCPService = GACPCCPService.getInstance();

export { gacpCCPService };

export type {
  CCPAssessmentData,
  CCPAssessmentResult,
  CCPFrameworkInfo,
  CCPDefinition,
  CCPCriteria,
};

export default gacpCCPService;
