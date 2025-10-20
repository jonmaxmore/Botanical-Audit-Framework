/**
 * Standards Comparison Engine - GACP Platform Phase 2
 *
 * Compares farm practices against multiple certification standards:
 * - GACP Thailand (DTAM)
 * - WHO GACP Guidelines
 * - EU Organic Regulation
 *
 * Features:
 * - Multi-standard comparison
 * - Gap analysis
 * - Compliance scoring
 * - Recommendations generation
 * - Certification readiness assessment
 *
 * @author GACP Development Team
 * @since Phase 2 - October 12, 2025
 */

const fs = require('fs').promises;
const path = require('path');
const { ObjectId } = require('mongodb');

class StandardsEngine {
  constructor(db = null) {
    this.db = db;
    this.comparisons = null;
    this.certifications = null;
    this.standards = new Map();
    this.initialized = false;

    if (db) {
      this.comparisons = db.collection('standards_comparisons');
      this.certifications = db.collection('certifications');
      this.initialized = true;
      console.log('[StandardsEngine] Initialized successfully');
    }
  }

  /**
   * Initialize engine with database connection
   */
  async initialize(db) {
    if (!db) {
      throw new Error('Database connection required');
    }

    this.db = db;
    this.comparisons = db.collection('standards_comparisons');
    this.certifications = db.collection('certifications');
    this.initialized = true;

    // Load standards from files
    await this.loadStandards();

    console.log('[StandardsEngine] Initialized with database and standards loaded');
    return this;
  }

  /**
   * Load all standards from data/standards directory
   */
  async loadStandards() {
    try {
      const standardsDir = path.join(__dirname, '../data/standards');
      const files = await fs.readdir(standardsDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(standardsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const standard = JSON.parse(content);
          this.standards.set(standard.id, standard);
          console.log(`[StandardsEngine] Loaded standard: ${standard.id}`);
        }
      }

      console.log(`[StandardsEngine] Total standards loaded: ${this.standards.size}`);
    } catch (error) {
      console.error('[StandardsEngine] Error loading standards:', error);
      throw error;
    }
  }

  /**
   * Get list of available standards
   */
  getAvailableStandards() {
    const standards = [];
    for (const [id, standard] of this.standards) {
      standards.push({
        id: standard.id,
        name: standard.name,
        version: standard.version,
        authority: standard.authority,
        country: standard.country,
        applicableProducts: standard.applicableProducts,
        description: standard.description,
      });
    }
    return standards;
  }

  /**
   * Get detailed standard by ID
   */
  getStandard(standardId) {
    return this.standards.get(standardId) || null;
  }

  /**
   * Compare farm data against one or more standards
   * @param {Object} params - { farmId, farmData, standardIds[] }
   */
  async compareAgainstStandards({ farmId, farmData, standardIds }) {
    try {
      if (!this.initialized) {
        throw new Error('StandardsEngine not initialized');
      }

      const results = [];

      for (const standardId of standardIds) {
        const standard = this.standards.get(standardId);
        if (!standard) {
          results.push({
            standardId,
            error: `Standard not found: ${standardId}`,
          });
          continue;
        }

        const comparison = await this.evaluateStandard(farmData, standard);
        results.push({
          standardId,
          standardName: standard.name,
          ...comparison,
        });
      }

      // Save comparison to database
      const comparisonRecord = {
        _id: new ObjectId(),
        farmId,
        comparisons: results,
        farmData: {
          farmName: farmData.farmName,
          location: farmData.location,
          cropType: farmData.cropType,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.comparisons.insertOne(comparisonRecord);

      return {
        success: true,
        comparisonId: comparisonRecord._id.toString(),
        results,
      };
    } catch (error) {
      console.error('[StandardsEngine] Comparison error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Evaluate farm data against a specific standard
   */
  async evaluateStandard(farmData, standard) {
    const categoryResults = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    let mandatoryPassed = 0;
    let mandatoryFailed = 0;

    for (const category of standard.categories) {
      const categoryResult = this.evaluateCategory(farmData, category);
      categoryResults.push(categoryResult);

      totalScore += categoryResult.score;
      maxPossibleScore += categoryResult.maxScore;
      mandatoryPassed += categoryResult.mandatoryPassed;
      mandatoryFailed += categoryResult.mandatoryFailed;
    }

    const percentageScore =
      maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Determine certification level
    const certificationLevel = this.determineCertificationLevel(
      percentageScore,
      standard.scoring.levels
    );

    // Check if all mandatory requirements passed
    const allMandatoryPassed = mandatoryFailed === 0;

    return {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: percentageScore,
      certificationLevel: certificationLevel.level,
      certificationName: certificationLevel.certification,
      certified: percentageScore >= standard.scoring.passingScore && allMandatoryPassed,
      categoryResults,
      mandatoryPassed,
      mandatoryFailed,
      allMandatoryPassed,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Evaluate a single category
   */
  evaluateCategory(farmData, category) {
    const criteriaResults = [];
    let categoryScore = 0;
    let categoryMaxScore = 0;
    let mandatoryPassed = 0;
    let mandatoryFailed = 0;

    for (const criterion of category.criteria) {
      const result = this.evaluateCriterion(farmData, criterion);
      criteriaResults.push(result);

      categoryScore += result.score;
      categoryMaxScore += result.maxScore;

      if (criterion.requirement === 'mandatory') {
        if (result.passed) {
          mandatoryPassed++;
        } else {
          mandatoryFailed++;
        }
      }
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      score: categoryScore,
      maxScore: categoryMaxScore,
      percentage: categoryMaxScore > 0 ? Math.round((categoryScore / categoryMaxScore) * 100) : 0,
      criteriaResults,
      mandatoryPassed,
      mandatoryFailed,
    };
  }

  /**
   * Evaluate a single criterion against farm data
   */
  evaluateCriterion(farmData, criterion) {
    // Check farm data for evidence of this criterion
    const evidence = this.checkEvidence(farmData, criterion);
    const checkpointResults = this.evaluateCheckpoints(farmData, criterion.checkpoints);

    const passedCheckpoints = checkpointResults.filter(c => c.met).length;
    const totalCheckpoints = checkpointResults.length;
    const completionRate = totalCheckpoints > 0 ? passedCheckpoints / totalCheckpoints : 0;

    // Determine score based on completion rate
    let score = 0;
    let status = 'fail';

    if (completionRate >= 1.0) {
      score = criterion.scoring.pass;
      status = 'pass';
    } else if (completionRate >= 0.5) {
      score = criterion.scoring.partial || 0;
      status = 'partial';
    } else {
      score = criterion.scoring.fail || 0;
      status = 'fail';
    }

    return {
      criterionId: criterion.id,
      criterionCode: criterion.code,
      criterionName: criterion.name,
      requirement: criterion.requirement,
      score,
      maxScore: criterion.scoring.pass,
      status,
      passed: status === 'pass',
      completionRate: Math.round(completionRate * 100),
      checkpointResults,
      evidence: evidence.found,
      evidenceItems: evidence.items,
    };
  }

  /**
   * Check if farm data contains required evidence
   */
  checkEvidence(farmData, criterion) {
    const found = [];
    const missing = [];

    if (!criterion.evidence || criterion.evidence.length === 0) {
      return { found: true, items: [], missing: [] };
    }

    for (const evidenceType of criterion.evidence) {
      // Check various farm data fields for evidence
      const hasEvidence = this.searchForEvidence(farmData, evidenceType);

      if (hasEvidence) {
        found.push(evidenceType);
      } else {
        missing.push(evidenceType);
      }
    }

    return {
      found: found.length > 0,
      items: found,
      missing,
    };
  }

  /**
   * Search farm data for specific evidence type
   */
  searchForEvidence(farmData, evidenceType) {
    // Check documents
    if (farmData.documents && Array.isArray(farmData.documents)) {
      const hasDoc = farmData.documents.some(
        doc => doc.type && doc.type.toLowerCase().includes(evidenceType.toLowerCase())
      );
      if (hasDoc) return true;
    }

    // Check certifications
    if (farmData.certifications && Array.isArray(farmData.certifications)) {
      const hasCert = farmData.certifications.some(
        cert => cert.name && cert.name.toLowerCase().includes(evidenceType.toLowerCase())
      );
      if (hasCert) return true;
    }

    // Check records
    if (farmData.records && typeof farmData.records === 'object') {
      for (const [key, value] of Object.entries(farmData.records)) {
        if (key.toLowerCase().includes(evidenceType.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Evaluate checkpoints
   */
  evaluateCheckpoints(farmData, checkpoints) {
    if (!checkpoints || checkpoints.length === 0) {
      return [];
    }

    return checkpoints.map((checkpoint, index) => {
      // Simple heuristic: check if farm data mentions this checkpoint
      const met = this.checkCheckpointMet(farmData, checkpoint);

      return {
        checkpoint,
        met,
        index: index + 1,
      };
    });
  }

  /**
   * Check if a checkpoint is met based on farm data
   */
  checkCheckpointMet(farmData, checkpoint) {
    // Convert checkpoint to searchable terms
    const terms = checkpoint
      .toLowerCase()
      .split(' ')
      .filter(t => t.length > 3);

    // Search in various farm data fields
    const searchFields = [
      JSON.stringify(farmData.practices || {}),
      JSON.stringify(farmData.records || {}),
      JSON.stringify(farmData.documents || []),
      JSON.stringify(farmData.procedures || []),
    ]
      .join(' ')
      .toLowerCase();

    // If at least 2 terms match, consider checkpoint potentially met
    const matches = terms.filter(term => searchFields.includes(term)).length;
    return matches >= Math.min(2, terms.length);
  }

  /**
   * Determine certification level based on score
   */
  determineCertificationLevel(score, levels) {
    for (const level of levels) {
      if (score >= level.minScore && score <= level.maxScore) {
        return level;
      }
    }
    return levels[levels.length - 1]; // Return lowest level if no match
  }

  /**
   * Analyze gaps and generate recommendations
   */
  async analyzeGaps({ comparisonId }) {
    try {
      const comparison = await this.comparisons.findOne({
        _id: new ObjectId(comparisonId),
      });

      if (!comparison) {
        throw new Error('Comparison not found');
      }

      const gaps = [];
      const recommendations = [];

      for (const result of comparison.comparisons) {
        if (result.error) continue;

        for (const category of result.categoryResults) {
          for (const criterion of category.criteriaResults) {
            if (!criterion.passed) {
              gaps.push({
                standardId: result.standardId,
                standardName: result.standardName,
                categoryName: category.categoryName,
                criterionName: criterion.criterionName,
                criterionCode: criterion.criterionCode,
                requirement: criterion.requirement,
                status: criterion.status,
                completionRate: criterion.completionRate,
                missingEvidence: criterion.evidenceItems.missing || [],
              });

              // Generate recommendation
              recommendations.push(this.generateRecommendation(criterion, category));
            }
          }
        }
      }

      // Priority ranking: mandatory > higher impact > lower completion
      gaps.sort((a, b) => {
        if (a.requirement === 'mandatory' && b.requirement !== 'mandatory') return -1;
        if (a.requirement !== 'mandatory' && b.requirement === 'mandatory') return 1;
        return a.completionRate - b.completionRate;
      });

      return {
        success: true,
        gapCount: gaps.length,
        gaps,
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
        priority: {
          critical: gaps.filter(g => g.requirement === 'mandatory').length,
          high: gaps.filter(g => g.completionRate < 25).length,
          medium: gaps.filter(g => g.completionRate >= 25 && g.completionRate < 50).length,
          low: gaps.filter(g => g.completionRate >= 50).length,
        },
      };
    } catch (error) {
      console.error('[StandardsEngine] Gap analysis error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate recommendation for failed criterion
   */
  generateRecommendation(criterion, category) {
    const actions = [];

    // Based on missing checkpoints
    if (criterion.checkpointResults) {
      const unmetCheckpoints = criterion.checkpointResults.filter(c => !c.met);
      unmetCheckpoints.forEach(checkpoint => {
        actions.push(`Implement: ${checkpoint.checkpoint}`);
      });
    }

    // Based on missing evidence
    if (criterion.evidenceItems && criterion.evidenceItems.missing) {
      criterion.evidenceItems.missing.forEach(evidence => {
        actions.push(`Provide: ${evidence}`);
      });
    }

    return {
      priority: criterion.requirement === 'mandatory' ? 'Critical' : 'Important',
      category: category.categoryName,
      criterion: criterion.criterionName,
      code: criterion.criterionCode,
      currentStatus: criterion.status,
      completionRate: criterion.completionRate,
      actions,
      estimatedEffort: actions.length > 3 ? 'High' : actions.length > 1 ? 'Medium' : 'Low',
      timeframe: criterion.requirement === 'mandatory' ? '1-2 weeks' : '1-3 months',
    };
  }

  /**
   * Get comparison history for a farm
   */
  async getComparisonHistory(farmId, limit = 10) {
    try {
      const history = await this.comparisons
        .find({ farmId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return {
        success: true,
        count: history.length,
        comparisons: history.map(c => ({
          id: c._id.toString(),
          farmName: c.farmData.farmName,
          standardsCompared: c.comparisons.map(comp => comp.standardName),
          createdAt: c.createdAt,
          summary: {
            certified: c.comparisons.filter(comp => comp.certified).length,
            total: c.comparisons.length,
          },
        })),
      };
    } catch (error) {
      console.error('[StandardsEngine] History error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = StandardsEngine;
