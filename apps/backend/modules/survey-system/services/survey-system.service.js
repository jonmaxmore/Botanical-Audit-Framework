/**
 * 📊 Survey System Service
 * Business logic for 4-region GACP survey system with 7-step wizard
 */

const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const { AppError } = require('../../shared/utils/error-handler');
const logger = require('../../shared/utils/logger');

class SurveySystemService {
  constructor(db) {
    this.db = db;
    this.surveysCollection = db ? db.collection('surveys') : null;
    this.responsesCollection = db ? db.collection('surveyresponses') : null;
    logger.info('[SurveyService] Service initialized');
  }

  /**
   * Create new survey response (start wizard)
   */
  async createSurveyResponse(data) {
    try {
      const { surveyId, userId, region, farmId } = data;

      const response = {
        _id: new ObjectId(),
        surveyId: new ObjectId(surveyId),
        userId,
        region: region.toLowerCase(),
        farmId: farmId || null,
        state: 'DRAFT',
        currentStep: 1,
        progress: 0,

        // 7-step wizard data
        regionSelection: null,
        personalInfo: null,
        farmInfo: null,
        managementProduction: null,
        costRevenue: null,
        marketSales: null,
        problemsNeeds: null,

        scores: {
          overall: 0,
          gacp: 0,
          sustainability: 0,
          market: 0,
          regionalBonus: 0,
        },

        metadata: {
          createdAt: new Date(),
          lastSavedAt: new Date(),
          submittedAt: null,
        },
      };

      if (this.responsesCollection) {
        await this.responsesCollection.insertOne(response);
      }

      logger.info(`[SurveyService] Survey response created`, { userId, region });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error('[SurveyService] Error creating survey response:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update wizard step data
   */
  async updateWizardStep(surveyId, stepId, stepData, userId) {
    try {
      if (!this.responsesCollection) {
        throw new AppError('Database not initialized', 500);
      }

      const response = await this.responsesCollection.findOne({
        _id: new ObjectId(surveyId),
      });

      if (!response) {
        throw new AppError('Survey not found', 404);
      }

      // Check ownership
      if (response.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Map step ID to field name
      const stepFieldMap = {
        1: 'regionSelection',
        2: 'personalInfo',
        3: 'farmInfo',
        4: 'managementProduction',
        5: 'costRevenue',
        6: 'marketSales',
        7: 'problemsNeeds',
      };

      const fieldName = stepFieldMap[stepId];
      if (!fieldName) {
        throw new AppError('Invalid step ID', 400);
      }

      // Calculate progress
      const progress = this._calculateProgress(response, stepId, stepData);

      // Update response
      const updateData = {
        [fieldName]: stepData,
        progress,
        currentStep: stepId,
        'metadata.lastSavedAt': new Date(),
      };

      // If all steps complete, mark as ready for submission
      if (progress === 100) {
        updateData.state = 'COMPLETE';
      }

      await this.responsesCollection.updateOne(
        { _id: new ObjectId(surveyId) },
        { $set: updateData }
      );

      logger.info(`[SurveyService] Step ${stepId} updated`, { surveyId, progress });

      return {
        currentStep: stepId,
        progress,
        isComplete: progress === 100,
      };
    } catch (error) {
      logger.error('[SurveyService] Error updating wizard step:', error);
      throw error;
    }
  }

  /**
   * Submit wizard (calculate scores)
   */
  async submitWizard(surveyId, userId) {
    try {
      if (!this.responsesCollection) {
        throw new AppError('Database not initialized', 500);
      }

      const response = await this.responsesCollection.findOne({
        _id: new ObjectId(surveyId),
      });

      if (!response) {
        throw new AppError('Survey not found', 404);
      }

      // Check ownership
      if (response.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Check if complete
      if (response.progress < 100) {
        throw new AppError('Survey is incomplete', 400);
      }

      // Calculate scores
      const scores = this._calculateScores(response);
      const regionalBonus = this._calculateRegionalBonus(response.region, scores);
      const totalScore = scores.overall + regionalBonus;

      // Generate recommendations
      const recommendations = this._generateRecommendations(response, scores);

      // Update response
      await this.responsesCollection.updateOne(
        { _id: new ObjectId(surveyId) },
        {
          $set: {
            state: 'SUBMITTED',
            scores: {
              ...scores,
              regionalBonus,
              total: totalScore,
            },
            recommendations,
            'metadata.submittedAt': new Date(),
          },
        }
      );

      logger.info(`[SurveyService] Survey submitted`, {
        surveyId,
        totalScore,
        region: response.region,
      });

      return {
        status: 'SUBMITTED',
        scores,
        regionalBonus,
        totalScore,
        recommendations,
        submittedAt: new Date(),
      };
    } catch (error) {
      logger.error('[SurveyService] Error submitting wizard:', error);
      throw error;
    }
  }

  /**
   * Get regional analytics
   */
  async getRegionalAnalytics(region) {
    try {
      if (!this.responsesCollection) {
        throw new AppError('Database not initialized', 500);
      }

      const responses = await this.responsesCollection
        .find({
          region: region.toLowerCase(),
          state: 'SUBMITTED',
        })
        .toArray();

      if (responses.length === 0) {
        return {
          totalResponses: 0,
          averageScore: 0,
          scoreDistribution: {},
          commonIssues: [],
          recommendations: [],
        };
      }

      // Calculate statistics
      const totalScore = responses.reduce((sum, r) => sum + (r.scores?.total || 0), 0);
      const averageScore = totalScore / responses.length;

      // Score distribution
      const scoreDistribution = {
        excellent: responses.filter(r => (r.scores?.total || 0) >= 90).length,
        good: responses.filter(r => (r.scores?.total || 0) >= 70 && (r.scores?.total || 0) < 90)
          .length,
        fair: responses.filter(r => (r.scores?.total || 0) >= 50 && (r.scores?.total || 0) < 70)
          .length,
        poor: responses.filter(r => (r.scores?.total || 0) < 50).length,
      };

      // Common issues
      const commonIssues = this._extractCommonIssues(responses);

      // Regional recommendations
      const recommendations = this._getRegionalRecommendations(region, averageScore);

      return {
        totalResponses: responses.length,
        averageScore: Math.round(averageScore),
        scoreDistribution,
        commonIssues,
        recommendations,
      };
    } catch (error) {
      logger.error('[SurveyService] Error getting regional analytics:', error);
      throw error;
    }
  }

  /**
   * Compare multiple regions
   */
  async compareRegions(regions) {
    try {
      const comparison = {};

      for (const region of regions) {
        comparison[region] = await this.getRegionalAnalytics(region);
      }

      // Add comparative insights
      const insights = this._generateComparisonInsights(comparison);

      return {
        regions: comparison,
        insights,
      };
    } catch (error) {
      logger.error('[SurveyService] Error comparing regions:', error);
      throw error;
    }
  }

  /**
   * Get survey statistics (admin)
   */
  async getSurveyStatistics() {
    try {
      if (!this.responsesCollection) {
        throw new AppError('Database not initialized', 500);
      }

      const stats = await this.responsesCollection
        .aggregate([
          {
            $group: {
              _id: '$state',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      const total = await this.responsesCollection.countDocuments();

      // By region
      const byRegion = await this.responsesCollection
        .aggregate([
          {
            $group: {
              _id: '$region',
              count: { $sum: 1 },
              avgScore: { $avg: '$scores.total' },
            },
          },
        ])
        .toArray();

      return {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byRegion: byRegion.reduce((acc, reg) => {
          acc[reg._id] = {
            count: reg.count,
            avgScore: Math.round(reg.avgScore || 0),
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[SurveyService] Error getting statistics:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate progress percentage
   */
  _calculateProgress(response, currentStepId, newStepData) {
    const steps = [
      'regionSelection',
      'personalInfo',
      'farmInfo',
      'managementProduction',
      'costRevenue',
      'marketSales',
      'problemsNeeds',
    ];

    let completedSteps = 0;

    steps.forEach((step, index) => {
      if (index + 1 < currentStepId) {
        // Previous steps
        if (response[step]) completedSteps++;
      } else if (index + 1 === currentStepId) {
        // Current step
        if (newStepData && Object.keys(newStepData).length > 0) completedSteps++;
      }
    });

    return Math.round((completedSteps / 7) * 100);
  }

  /**
   * Calculate scores based on survey responses
   */
  _calculateScores(response) {
    let gacpScore = 0;
    let sustainabilityScore = 0;
    let marketScore = 0;

    // GACP compliance score (farm info, management)
    if (response.farmInfo) {
      gacpScore += response.farmInfo.hasGACPCertification ? 25 : 0;
      gacpScore += response.farmInfo.useOrganicPractices ? 15 : 0;
    }

    if (response.managementProduction) {
      gacpScore += response.managementProduction.followsSOPs ? 20 : 0;
      gacpScore += response.managementProduction.hasQualityControl ? 15 : 0;
    }

    // Sustainability score
    if (response.managementProduction) {
      sustainabilityScore += response.managementProduction.waterConservation ? 20 : 0;
      sustainabilityScore += response.managementProduction.organicFertilizer ? 15 : 0;
    }

    if (response.problemsNeeds) {
      sustainabilityScore += response.problemsNeeds.environmentalConcern ? 15 : 0;
    }

    // Market score
    if (response.marketSales) {
      marketScore += response.marketSales.hasMarketAccess ? 20 : 0;
      marketScore += response.marketSales.directToConsumer ? 15 : 0;
      marketScore += response.marketSales.exportMarket ? 10 : 0;
    }

    const overall = Math.round((gacpScore + sustainabilityScore + marketScore) / 3);

    return {
      overall,
      gacp: gacpScore,
      sustainability: sustainabilityScore,
      market: marketScore,
    };
  }

  /**
   * Calculate regional bonus points
   */
  _calculateRegionalBonus(region, scores) {
    const bonusRules = {
      northern: {
        condition: scores.sustainability >= 60,
        bonus: 10,
        reason: 'Mountain farming sustainability practices',
      },
      central: {
        condition: scores.market >= 60,
        bonus: 10,
        reason: 'Central market access advantages',
      },
      southern: {
        condition: scores.gacp >= 60,
        bonus: 10,
        reason: 'Southern GACP implementation excellence',
      },
      northeastern: {
        condition: scores.sustainability >= 60,
        bonus: 10,
        reason: 'Northeastern organic farming practices',
      },
    };

    const rule = bonusRules[region.toLowerCase()];
    return rule && rule.condition ? rule.bonus : 0;
  }

  /**
   * Generate personalized recommendations
   */
  _generateRecommendations(response, scores) {
    const recommendations = [];

    // GACP recommendations
    if (scores.gacp < 60) {
      recommendations.push({
        category: 'GACP Compliance',
        priority: 'HIGH',
        text: 'Consider attending GACP certification training workshops',
        impact: 'Will improve overall compliance score by 20-30%',
      });
    }

    // Sustainability recommendations
    if (scores.sustainability < 60) {
      recommendations.push({
        category: 'Sustainability',
        priority: 'MEDIUM',
        text: 'Implement water conservation and organic practices',
        impact: 'Reduces costs and improves environmental score',
      });
    }

    // Market recommendations
    if (scores.market < 60) {
      recommendations.push({
        category: 'Market Access',
        priority: 'MEDIUM',
        text: 'Explore cooperative memberships for better market access',
        impact: 'Can increase revenue by 15-25%',
      });
    }

    // Regional-specific recommendations
    const regionalRecs = this._getRegionalRecommendations(response.region, scores.overall);
    recommendations.push(
      ...regionalRecs.map(text => ({
        category: 'Regional',
        priority: 'LOW',
        text,
        impact: 'Optimizes regional advantages',
      }))
    );

    return recommendations;
  }

  /**
   * Extract common issues from responses
   */
  _extractCommonIssues(responses) {
    const issues = {};

    responses.forEach(response => {
      if (response.problemsNeeds?.challenges) {
        response.problemsNeeds.challenges.forEach(challenge => {
          issues[challenge] = (issues[challenge] || 0) + 1;
        });
      }
    });

    // Sort by frequency
    return Object.entries(issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Get regional recommendations
   */
  _getRegionalRecommendations(region, avgScore) {
    const regionalRecs = {
      northern: [
        'Implement terraced farming for mountain terrain',
        'Focus on highland crop varieties',
        'Establish community water management',
      ],
      central: [
        'Optimize rice-herb rotation systems',
        'Leverage central market access',
        'Implement mechanization for efficiency',
      ],
      southern: [
        'Improve monsoon drainage systems',
        'Focus on medicinal plant certification',
        'Develop agrotourism opportunities',
      ],
      northeastern: [
        'Implement drought-resistant varieties',
        'Establish farmer cooperative networks',
        'Develop value-added processing',
      ],
    };

    return regionalRecs[region.toLowerCase()] || regionalRecs.central;
  }

  /**
   * Generate comparison insights
   */
  _generateComparisonInsights(comparison) {
    const insights = [];

    // Find highest scoring region
    let highestRegion = null;
    let highestScore = 0;

    Object.entries(comparison).forEach(([region, data]) => {
      if (data.averageScore > highestScore) {
        highestScore = data.averageScore;
        highestRegion = region;
      }
    });

    if (highestRegion) {
      insights.push({
        type: 'BEST_PERFORMER',
        text: `${highestRegion} region leads with average score of ${highestScore}`,
        data: { region: highestRegion, score: highestScore },
      });
    }

    // Find region with most responses
    let mostActive = null;
    let mostResponses = 0;

    Object.entries(comparison).forEach(([region, data]) => {
      if (data.totalResponses > mostResponses) {
        mostResponses = data.totalResponses;
        mostActive = region;
      }
    });

    if (mostActive) {
      insights.push({
        type: 'MOST_ACTIVE',
        text: `${mostActive} region has highest participation with ${mostResponses} surveys`,
        data: { region: mostActive, responses: mostResponses },
      });
    }

    return insights;
  }
}

module.exports = SurveySystemService;
