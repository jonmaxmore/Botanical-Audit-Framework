/**
 * Standards Comparison Controller
 *
 * HTTP request handlers for standards comparison endpoints
 */

class StandardsComparisonController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Health check endpoint
   * GET /api/standards-comparison/health
   */
  async healthCheck(req, res) {
    try {
      const standardsCount = this.service.standards.length;

      res.json({
        status: 'healthy',
        service: 'Standards Comparison',
        initialized: this.service.initialized,
        standardsLoaded: standardsCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Get list of available standards
   * GET /api/standards-comparison
   */
  async getAvailableStandards(req, res) {
    try {
      const standards = await this.service.getAvailableStandards();

      res.json({
        success: true,
        count: standards.length,
        standards,
      });
    } catch (error) {
      logger.error('Error getting available standards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available standards',
        error: error.message,
      });
    }
  }

  /**
   * Get standard details by ID
   * GET /api/standards-comparison/:id
   */
  async getStandardDetails(req, res) {
    try {
      const { id } = req.params;
      const standard = await this.service.getStandard(id);

      res.json({
        success: true,
        standard,
      });
    } catch (error) {
      logger.error('Error getting standard details:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Standard not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve standard details',
        error: error.message,
      });
    }
  }

  /**
   * Compare farm against standards
   * POST /api/standards-comparison/compare
   */
  async compareFarm(req, res) {
    try {
      const { farmId, standardIds, farmData } = req.body;

      // Validate required fields
      if (!farmId) {
        return res.status(400).json({
          success: false,
          message: 'farmId is required',
        });
      }

      if (!standardIds || !Array.isArray(standardIds) || standardIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'standardIds must be a non-empty array',
        });
      }

      if (!farmData) {
        return res.status(400).json({
          success: false,
          message: 'farmData is required',
        });
      }

      // Validate farmData structure
      if (!farmData.farmName) {
        return res.status(400).json({
          success: false,
          message: 'farmData.farmName is required',
        });
      }

      const result = await this.service.compareAgainstStandards({
        farmId,
        standardIds,
        farmData,
      });

      res.json({
        success: true,
        message: 'Comparison completed successfully',
        ...result,
      });
    } catch (error) {
      logger.error('Error comparing farm:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'One or more standards not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to compare farm against standards',
        error: error.message,
      });
    }
  }

  /**
   * Get comparison results by ID
   * GET /api/standards-comparison/comparison/:id
   */
  async getComparisonResults(req, res) {
    try {
      const { id } = req.params;
      const comparison = await this.service.getComparison(id);

      res.json({
        success: true,
        comparison,
      });
    } catch (error) {
      logger.error('Error getting comparison results:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Comparison not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve comparison results',
        error: error.message,
      });
    }
  }

  /**
   * Analyze gaps for a comparison
   * GET /api/standards-comparison/gaps/:comparisonId
   */
  async analyzeGaps(req, res) {
    try {
      const { comparisonId } = req.params;
      const gapAnalysis = await this.service.analyzeGaps({ comparisonId });

      res.json({
        success: true,
        ...gapAnalysis,
      });
    } catch (error) {
      logger.error('Error analyzing gaps:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Comparison not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to analyze gaps',
        error: error.message,
      });
    }
  }

  /**
   * Get comparison history for a farm
   * GET /api/standards-comparison/history/:farmId
   */
  async getComparisonHistory(req, res) {
    try {
      const { farmId } = req.params;
      const { limit = 10 } = req.query;

      const history = await this.service.getComparisonHistory(farmId, parseInt(limit, 10));

      res.json({
        success: true,
        farmId,
        count: history.length,
        history,
      });
    } catch (error) {
      logger.error('Error getting comparison history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve comparison history',
        error: error.message,
      });
    }
  }

  /**
   * Get recommendations for a comparison
   * GET /api/standards-comparison/recommendations/:comparisonId
   */
  async getRecommendations(req, res) {
    try {
      const { comparisonId } = req.params;
      const gapAnalysis = await this.service.analyzeGaps({ comparisonId });

      // Group recommendations by priority
      const groupedRecommendations = {
        critical: gapAnalysis.recommendations.filter(r => r.priority === 'critical'),
        important: gapAnalysis.recommendations.filter(r => r.priority === 'important'),
        optional: gapAnalysis.recommendations.filter(r => r.priority === 'optional'),
      };

      res.json({
        success: true,
        comparisonId,
        totalRecommendations: gapAnalysis.recommendations.length,
        breakdown: {
          critical: groupedRecommendations.critical.length,
          important: groupedRecommendations.important.length,
          optional: groupedRecommendations.optional.length,
        },
        recommendations: groupedRecommendations,
      });
    } catch (error) {
      logger.error('Error getting recommendations:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Comparison not found',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recommendations',
        error: error.message,
      });
    }
  }
}

module.exports = StandardsComparisonController;
