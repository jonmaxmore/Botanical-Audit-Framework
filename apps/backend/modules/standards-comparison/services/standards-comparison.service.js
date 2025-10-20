/**
 * Standards Comparison Service
 *
 * Service for comparing farms against GACP/GAP standards
 * Provides gap analysis and certification recommendations
 */

const { ObjectId } = require('mongodb');

class StandardsComparisonService {
  constructor(db) {
    this.db = db;
    this.comparisonsCollection = null;
    this.standardsCollection = null;
    this.standards = [];
    this.initialized = false;
  }

  /**
   * Initialize the service and load standards
   */
  async initialize() {
    try {
      this.comparisonsCollection = this.db.collection('standards_comparisons');
      this.standardsCollection = this.db.collection('standards');

      // Create indexes
      await this.comparisonsCollection.createIndex({ farmId: 1 });
      await this.comparisonsCollection.createIndex({ createdAt: -1 });
      await this.comparisonsCollection.createIndex({ 'farmData.farmName': 1 });

      // Load standards from database
      await this.loadStandards();

      this.initialized = true;
      console.log(
        `Standards Comparison Service initialized with ${this.standards.length} standards`
      );
    } catch (error) {
      console.error('Failed to initialize Standards Comparison Service:', error);
      throw error;
    }
  }

  /**
   * Load standards from database
   */
  async loadStandards() {
    try {
      const loadedStandards = await this.standardsCollection.find({ active: true }).toArray();

      if (loadedStandards.length === 0) {
        // Load default standards if none exist
        const defaultStandards = this.getDefaultStandards();
        await this.standardsCollection.insertMany(defaultStandards);
        this.standards = defaultStandards;
      } else {
        this.standards = loadedStandards;
      }

      console.log(`Loaded ${this.standards.length} standards`);
    } catch (error) {
      console.error('Error loading standards:', error);
      throw error;
    }
  }

  /**
   * Get default GACP/GAP standards
   */
  getDefaultStandards() {
    return [
      {
        _id: new ObjectId(),
        id: 'gacp-thailand-2023',
        name: 'GACP Thailand 2023',
        version: '2.0',
        description:
          'Good Agricultural and Collection Practices for Medicinal Plants - Thailand Standards',
        active: true,
        requirements: [
          {
            category: 'site_selection',
            title: 'Site Selection and Management',
            criteria: [
              {
                id: 'site_01',
                requirement: 'Appropriate soil conditions',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'site_02',
                requirement: 'Water quality testing',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'site_03',
                requirement: 'Environmental impact assessment',
                priority: 'important',
                weight: 8,
              },
              {
                id: 'site_04',
                requirement: 'Land use history documentation',
                priority: 'important',
                weight: 7,
              },
            ],
          },
          {
            category: 'cultivation',
            title: 'Cultivation Practices',
            criteria: [
              {
                id: 'cult_01',
                requirement: 'Proper seed/planting material',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'cult_02',
                requirement: 'Cultivation techniques documentation',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'cult_03',
                requirement: 'Pest management plan',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'cult_04',
                requirement: 'Fertilizer usage records',
                priority: 'important',
                weight: 8,
              },
              {
                id: 'cult_05',
                requirement: 'Irrigation management',
                priority: 'important',
                weight: 7,
              },
            ],
          },
          {
            category: 'harvesting',
            title: 'Harvesting and Post-Harvest',
            criteria: [
              {
                id: 'harv_01',
                requirement: 'Proper harvesting time and methods',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'harv_02',
                requirement: 'Post-harvest handling procedures',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'harv_03',
                requirement: 'Drying and storage conditions',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'harv_04',
                requirement: 'Contamination prevention',
                priority: 'critical',
                weight: 10,
              },
            ],
          },
          {
            category: 'quality_control',
            title: 'Quality Control',
            criteria: [
              {
                id: 'qc_01',
                requirement: 'Quality testing procedures',
                priority: 'critical',
                weight: 10,
              },
              { id: 'qc_02', requirement: 'Heavy metal testing', priority: 'critical', weight: 10 },
              {
                id: 'qc_03',
                requirement: 'Microbiological testing',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'qc_04',
                requirement: 'Pesticide residue testing',
                priority: 'critical',
                weight: 10,
              },
            ],
          },
          {
            category: 'documentation',
            title: 'Documentation and Traceability',
            criteria: [
              {
                id: 'doc_01',
                requirement: 'Complete farm records',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'doc_02',
                requirement: 'Batch tracking system',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'doc_03',
                requirement: 'Supplier documentation',
                priority: 'important',
                weight: 8,
              },
              { id: 'doc_04', requirement: 'Training records', priority: 'important', weight: 7 },
            ],
          },
          {
            category: 'safety',
            title: 'Personnel Safety and Welfare',
            criteria: [
              {
                id: 'safe_01',
                requirement: 'Worker safety training',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'safe_02',
                requirement: 'Protective equipment provision',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'safe_03',
                requirement: 'First aid facilities',
                priority: 'important',
                weight: 7,
              },
              {
                id: 'safe_04',
                requirement: 'Fair labor practices',
                priority: 'important',
                weight: 8,
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        id: 'globalgap-v5',
        name: 'GLOBALG.A.P. v5.4',
        version: '5.4',
        description: 'Global Good Agricultural Practices - Integrated Farm Assurance',
        active: true,
        requirements: [
          {
            category: 'food_safety',
            title: 'Food Safety and Quality',
            criteria: [
              {
                id: 'fs_01',
                requirement: 'HACCP-based approach',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'fs_02',
                requirement: 'Contamination risk assessment',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'fs_03',
                requirement: 'Product handling procedures',
                priority: 'critical',
                weight: 9,
              },
            ],
          },
          {
            category: 'environmental',
            title: 'Environmental Management',
            criteria: [
              {
                id: 'env_01',
                requirement: 'Biodiversity conservation',
                priority: 'important',
                weight: 8,
              },
              {
                id: 'env_02',
                requirement: 'Waste management plan',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'env_03',
                requirement: 'Energy efficiency measures',
                priority: 'optional',
                weight: 5,
              },
            ],
          },
          {
            category: 'traceability',
            title: 'Traceability',
            criteria: [
              {
                id: 'trace_01',
                requirement: 'Product identification system',
                priority: 'critical',
                weight: 10,
              },
              {
                id: 'trace_02',
                requirement: 'Supply chain documentation',
                priority: 'critical',
                weight: 9,
              },
              {
                id: 'trace_03',
                requirement: 'Recall procedures',
                priority: 'important',
                weight: 8,
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Get available standards
   */
  async getAvailableStandards() {
    return this.standards.map(standard => ({
      id: standard.id,
      name: standard.name,
      version: standard.version,
      description: standard.description,
      categoryCount: standard.requirements.length,
      criteriaCount: standard.requirements.reduce((sum, req) => sum + req.criteria.length, 0),
    }));
  }

  /**
   * Get standard by ID
   */
  async getStandard(standardId) {
    const standard = this.standards.find(s => s.id === standardId);
    if (!standard) {
      throw new Error(`Standard not found: ${standardId}`);
    }
    return standard;
  }

  /**
   * Compare farm against standards
   */
  async compareAgainstStandards({ farmId, standardIds, farmData }) {
    try {
      const results = [];

      for (const standardId of standardIds) {
        const standard = await this.getStandard(standardId);
        const comparisonResult = await this.compareFarmToStandard(farmData, standard);
        results.push({
          standardId,
          standardName: standard.name,
          version: standard.version,
          ...comparisonResult,
        });
      }

      // Calculate overall summary
      const summary = {
        standardsCompared: standardIds.length,
        certified: results.filter(r => r.certified).length,
        notCertified: results.filter(r => !r.certified).length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      };

      // Store comparison in database
      const comparison = {
        farmId,
        farmData,
        comparisons: results,
        summary,
        createdAt: new Date(),
      };

      const insertResult = await this.comparisonsCollection.insertOne(comparison);

      return {
        comparisonId: insertResult.insertedId.toString(),
        results,
        summary,
      };
    } catch (error) {
      console.error('Error comparing against standards:', error);
      throw error;
    }
  }

  /**
   * Compare farm to a single standard
   */
  async compareFarmToStandard(farmData, standard) {
    const categoryResults = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const requirement of standard.requirements) {
      const categoryResult = this.evaluateCategory(farmData, requirement);
      categoryResults.push(categoryResult);
      totalScore += categoryResult.score;
      maxScore += categoryResult.maxScore;
    }

    const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const certified = overallScore >= 80; // 80% threshold for certification

    return {
      score: Math.round(overallScore * 10) / 10,
      certified,
      categoryResults,
      totalScore,
      maxScore,
    };
  }

  /**
   * Evaluate a single category
   */
  evaluateCategory(farmData, requirement) {
    const { category, title, criteria } = requirement;
    let categoryScore = 0;
    let maxCategoryScore = 0;
    const criteriaResults = [];

    for (const criterion of criteria) {
      const met = this.evaluateCriterion(farmData, criterion);
      const score = met ? criterion.weight : 0;

      criteriaResults.push({
        id: criterion.id,
        requirement: criterion.requirement,
        priority: criterion.priority,
        weight: criterion.weight,
        met,
        score,
      });

      categoryScore += score;
      maxCategoryScore += criterion.weight;
    }

    return {
      category,
      title,
      score: categoryScore,
      maxScore: maxCategoryScore,
      percentage: maxCategoryScore > 0 ? Math.round((categoryScore / maxCategoryScore) * 100) : 0,
      criteria: criteriaResults,
    };
  }

  /**
   * Evaluate a single criterion
   */
  evaluateCriterion(farmData, criterion) {
    const { practices = {}, documents = [], certifications = [], records = {} } = farmData;

    // Simple evaluation logic based on criterion ID
    // This is a simplified version - real implementation would be more sophisticated
    const criterionId = criterion.id;

    // Site selection criteria
    if (criterionId.startsWith('site_')) {
      return practices.soilManagement || practices.waterManagement || false;
    }

    // Cultivation criteria
    if (criterionId.startsWith('cult_')) {
      return practices.organicFarming || practices.pestManagement || records.cultivation || false;
    }

    // Harvesting criteria
    if (criterionId.startsWith('harv_')) {
      return practices.postHarvest || records.harvesting || false;
    }

    // Quality control criteria
    if (criterionId.startsWith('qc_')) {
      return documents.some(doc => doc.type === 'lab_test' || doc.type === 'quality_certificate');
    }

    // Documentation criteria
    if (criterionId.startsWith('doc_')) {
      return documents.length > 0 || records.complete || false;
    }

    // Safety criteria
    if (criterionId.startsWith('safe_')) {
      return practices.workerSafety || documents.some(doc => doc.type === 'safety_training');
    }

    // Food safety criteria
    if (criterionId.startsWith('fs_')) {
      return practices.foodSafety || certifications.some(cert => cert.includes('HACCP'));
    }

    // Environmental criteria
    if (criterionId.startsWith('env_')) {
      return practices.environmental || practices.wasteManagement || false;
    }

    // Traceability criteria
    if (criterionId.startsWith('trace_')) {
      return practices.traceability || records.batchTracking || false;
    }

    return false;
  }

  /**
   * Analyze gaps for a comparison
   */
  async analyzeGaps({ comparisonId }) {
    try {
      const comparison = await this.comparisonsCollection.findOne({
        _id: new ObjectId(comparisonId),
      });

      if (!comparison) {
        throw new Error('Comparison not found');
      }

      const gaps = [];
      const recommendations = [];

      for (const result of comparison.comparisons) {
        for (const categoryResult of result.categoryResults) {
          for (const criterion of categoryResult.criteria) {
            if (!criterion.met) {
              const gap = {
                standardId: result.standardId,
                standardName: result.standardName,
                category: categoryResult.category,
                categoryTitle: categoryResult.title,
                requirement: criterion.requirement,
                priority: criterion.priority,
                weight: criterion.weight,
              };

              gaps.push(gap);

              // Generate recommendation
              const recommendation = this.generateRecommendation(gap);
              recommendations.push(recommendation);
            }
          }
        }
      }

      // Group gaps by priority
      const gapsByPriority = {
        critical: gaps.filter(g => g.priority === 'critical').length,
        important: gaps.filter(g => g.priority === 'important').length,
        optional: gaps.filter(g => g.priority === 'optional').length,
      };

      return {
        comparisonId,
        totalGaps: gaps.length,
        gapsByPriority,
        gaps,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      throw error;
    }
  }

  /**
   * Generate recommendation for a gap
   */
  generateRecommendation(gap) {
    const recommendations = {
      site_selection:
        'Conduct soil and water testing. Document land use history and environmental conditions.',
      cultivation:
        'Implement proper cultivation practices. Maintain detailed records of all farming activities.',
      harvesting:
        'Establish standard operating procedures for harvesting and post-harvest handling.',
      quality_control:
        'Set up quality testing procedures. Partner with certified laboratories for testing.',
      documentation:
        'Implement a comprehensive record-keeping system. Document all farm activities.',
      safety:
        'Provide safety training to all workers. Ensure availability of protective equipment.',
      food_safety:
        'Implement HACCP-based approach. Conduct regular contamination risk assessments.',
      environmental:
        'Develop environmental management plan. Implement waste management procedures.',
      traceability: 'Establish product identification and tracking system. Document supply chain.',
    };

    const action =
      recommendations[gap.category] || 'Review and implement best practices for this requirement.';

    return {
      standardId: gap.standardId,
      standardName: gap.standardName,
      category: gap.category,
      categoryTitle: gap.categoryTitle,
      requirement: gap.requirement,
      priority: gap.priority,
      action,
      estimatedCost: this.estimateCost(gap.priority),
      timeframe: this.estimateTimeframe(gap.priority),
    };
  }

  /**
   * Estimate implementation cost
   */
  estimateCost(priority) {
    const costs = {
      critical: 'High (฿50,000 - ฿200,000)',
      important: 'Medium (฿20,000 - ฿50,000)',
      optional: 'Low (฿5,000 - ฿20,000)',
    };
    return costs[priority] || 'Variable';
  }

  /**
   * Estimate implementation timeframe
   */
  estimateTimeframe(priority) {
    const timeframes = {
      critical: '1-3 months',
      important: '2-6 months',
      optional: '3-12 months',
    };
    return timeframes[priority] || 'Varies';
  }

  /**
   * Get comparison history for a farm
   */
  async getComparisonHistory(farmId, limit = 10) {
    try {
      const history = await this.comparisonsCollection
        .find({ farmId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return history.map(comparison => ({
        comparisonId: comparison._id.toString(),
        farmId: comparison.farmId,
        standardsCompared: comparison.comparisons.map(c => ({
          standardId: c.standardId,
          standardName: c.standardName,
          score: c.score,
          certified: c.certified,
        })),
        summary: comparison.summary,
        createdAt: comparison.createdAt,
      }));
    } catch (error) {
      console.error('Error getting comparison history:', error);
      throw error;
    }
  }

  /**
   * Get comparison by ID
   */
  async getComparison(comparisonId) {
    try {
      const comparison = await this.comparisonsCollection.findOne({
        _id: new ObjectId(comparisonId),
      });

      if (!comparison) {
        throw new Error('Comparison not found');
      }

      return {
        comparisonId: comparison._id.toString(),
        farmId: comparison.farmId,
        farmData: comparison.farmData,
        comparisons: comparison.comparisons,
        summary: comparison.summary,
        createdAt: comparison.createdAt,
      };
    } catch (error) {
      console.error('Error getting comparison:', error);
      throw error;
    }
  }
}

module.exports = StandardsComparisonService;
