/**
 * Survey Process Engine
 * Manages GACP survey workflow with validation, scoring, and recommendations
 * States: DRAFT → IN_PROGRESS → SUBMITTED → REVIEWED → COMPLETED
 */

const EventEmitter = require('events');

class SurveyProcessEngine extends EventEmitter {
  constructor(db) {
    super();
    this.db = db;
    this.surveys = db.collection('surveys');
    this.surveyResponses = db.collection('survey_responses');

    // Survey states
    this.STATES = {
      DRAFT: 'DRAFT',
      IN_PROGRESS: 'IN_PROGRESS',
      SUBMITTED: 'SUBMITTED',
      REVIEWED: 'REVIEWED',
      COMPLETED: 'COMPLETED',
    };

    // Question types
    this.QUESTION_TYPES = {
      MULTIPLE_CHOICE: 'multiple_choice',
      TEXT: 'text',
      RATING: 'rating',
      CHECKBOX: 'checkbox',
      YES_NO: 'yes_no',
    };

    // Scoring weights by category
    this.CATEGORY_WEIGHTS = {
      'Soil Management': 0.2,
      'Water Management': 0.2,
      'Pest Control': 0.2,
      'Fertilizer Management': 0.15,
      'GACP Knowledge': 0.15,
      'Record Keeping': 0.1,
    };

    console.log('[SurveyProcessEngine] Initialized successfully');
  }

  /**
   * Create a new survey response
   */
  async createSurveyResponse(data) {
    try {
      const surveyResponse = {
        surveyId: data.surveyId,
        userId: data.userId,
        farmId: data.farmId,
        region: data.region,
        state: this.STATES.DRAFT,
        startedAt: new Date(),
        responses: [],
        completionPercentage: 0,
        score: null,
        recommendations: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: data.userId,
        },
      };

      const result = await this.surveyResponses.insertOne(surveyResponse);
      surveyResponse._id = result.insertedId;

      this.emit('survey:created', surveyResponse);

      return {
        success: true,
        data: surveyResponse,
      };
    } catch (error) {
      console.error('[SurveyEngine] Error creating survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update survey response progress
   */
  async updateSurveyResponse(surveyResponseId, responseData) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Validate response data
      const validation = await this.validateResponse(surveyResponse.surveyId, responseData);

      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors,
        };
      }

      // Update responses
      const updatedResponses = this.mergeResponses(surveyResponse.responses, responseData);

      // Calculate completion percentage
      const completionPercentage = await this.calculateCompletion(
        surveyResponse.surveyId,
        updatedResponses
      );

      // Update state if in progress
      const newState =
        surveyResponse.state === this.STATES.DRAFT ? this.STATES.IN_PROGRESS : surveyResponse.state;

      // Update database
      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            responses: updatedResponses,
            completionPercentage: completionPercentage,
            state: newState,
            'metadata.updatedAt': new Date(),
          },
        }
      );

      const updated = await this.surveyResponses.findOne({ _id: surveyResponseId });

      this.emit('survey:updated', updated);

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('[SurveyEngine] Error updating survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Submit completed survey
   */
  async submitSurvey(surveyResponseId, userId) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Check if survey is complete
      if (surveyResponse.completionPercentage < 100) {
        return {
          success: false,
          error: 'Survey is not complete. Please answer all required questions.',
        };
      }

      // Calculate score
      const score = await this.calculateScore(surveyResponse);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(surveyResponse, score);

      // Update to SUBMITTED state
      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            state: this.STATES.SUBMITTED,
            submittedAt: new Date(),
            score: score,
            recommendations: recommendations,
            'metadata.updatedAt': new Date(),
            'metadata.submittedBy': userId,
          },
        }
      );

      const submitted = await this.surveyResponses.findOne({ _id: surveyResponseId });

      this.emit('survey:submitted', submitted);

      return {
        success: true,
        data: submitted,
        score: score,
        recommendations: recommendations,
      };
    } catch (error) {
      console.error('[SurveyEngine] Error submitting survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Review submitted survey (for reviewers)
   */
  async reviewSurvey(surveyResponseId, reviewData) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      if (surveyResponse.state !== this.STATES.SUBMITTED) {
        return {
          success: false,
          error: 'Survey must be submitted before review',
        };
      }

      // Update with review data
      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            state: this.STATES.REVIEWED,
            reviewedAt: new Date(),
            reviewComments: reviewData.comments || '',
            reviewedBy: reviewData.reviewerId,
            'metadata.updatedAt': new Date(),
          },
        }
      );

      const reviewed = await this.surveyResponses.findOne({ _id: surveyResponseId });

      this.emit('survey:reviewed', reviewed);

      return {
        success: true,
        data: reviewed,
      };
    } catch (error) {
      console.error('[SurveyEngine] Error reviewing survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate response data against survey questions
   */
  async validateResponse(surveyId, responseData) {
    try {
      const survey = await this.surveys.findOne({ _id: surveyId });

      if (!survey) {
        return { valid: false, errors: ['Survey not found'] };
      }

      const errors = [];

      for (const response of responseData) {
        const question = survey.questions.find(q => q.id === response.questionId);

        if (!question) {
          errors.push(`Question ${response.questionId} not found in survey`);
          continue;
        }

        // Type-specific validation
        switch (question.type) {
          case this.QUESTION_TYPES.RATING:
            if (response.answer < question.min || response.answer > question.max) {
              errors.push(`Rating must be between ${question.min} and ${question.max}`);
            }
            break;

          case this.QUESTION_TYPES.MULTIPLE_CHOICE:
            if (!question.options.includes(response.answer)) {
              errors.push(`Invalid option for question ${question.id}`);
            }
            break;

          case this.QUESTION_TYPES.TEXT:
            if (question.required && (!response.answer || response.answer.trim() === '')) {
              errors.push(`Question ${question.id} requires an answer`);
            }
            break;
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors,
      };
    } catch (error) {
      console.error('[SurveyEngine] Validation error:', error);
      return { valid: false, errors: [error.message] };
    }
  }

  /**
   * Merge new responses with existing ones
   */
  mergeResponses(existingResponses, newResponses) {
    const merged = [...existingResponses];

    for (const newResponse of newResponses) {
      const existingIndex = merged.findIndex(r => r.questionId === newResponse.questionId);

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...newResponse,
          updatedAt: new Date(),
        };
      } else {
        merged.push({
          ...newResponse,
          answeredAt: new Date(),
        });
      }
    }

    return merged;
  }

  /**
   * Calculate completion percentage
   */
  async calculateCompletion(surveyId, responses) {
    try {
      const survey = await this.surveys.findOne({ _id: surveyId });

      if (!survey) return 0;

      const requiredQuestions = survey.questions.filter(q => q.required);
      const answeredRequired = responses.filter(r => {
        const question = survey.questions.find(q => q.id === r.questionId);
        return question && question.required && r.answer !== null && r.answer !== '';
      });

      return Math.round((answeredRequired.length / requiredQuestions.length) * 100);
    } catch (error) {
      console.error('[SurveyEngine] Error calculating completion:', error);
      return 0;
    }
  }

  /**
   * Calculate survey score based on responses
   */
  async calculateScore(surveyResponse) {
    try {
      const survey = await this.surveys.findOne({ _id: surveyResponse.surveyId });

      if (!survey) return null;

      let totalScore = 0;
      const categoryScores = {};

      // Group responses by category
      for (const response of surveyResponse.responses) {
        const question = survey.questions.find(q => q.id === response.questionId);

        if (!question) continue;

        if (!categoryScores[question.category]) {
          categoryScores[question.category] = {
            total: 0,
            count: 0,
            weight: this.CATEGORY_WEIGHTS[question.category] || 0.1,
          };
        }

        // Calculate individual question score
        let questionScore = 0;

        switch (question.type) {
          case this.QUESTION_TYPES.RATING:
            questionScore = (response.answer / question.max) * 100;
            break;

          case this.QUESTION_TYPES.MULTIPLE_CHOICE:
            // Score based on optimal answer (if defined)
            if (question.optimalAnswer === response.answer) {
              questionScore = 100;
            } else if (question.acceptableAnswers?.includes(response.answer)) {
              questionScore = 75;
            } else {
              questionScore = 50;
            }
            break;

          case this.QUESTION_TYPES.YES_NO:
            questionScore = response.answer === question.expectedAnswer ? 100 : 0;
            break;

          default:
            questionScore = 70; // Default neutral score
        }

        categoryScores[question.category].total += questionScore;
        categoryScores[question.category].count += 1;
      }

      // Calculate weighted total score
      for (const category in categoryScores) {
        const categoryData = categoryScores[category];
        const categoryAverage = categoryData.total / categoryData.count;
        totalScore += categoryAverage * categoryData.weight;
      }

      return {
        totalScore: Math.round(totalScore),
        categoryScores: Object.keys(categoryScores).reduce((acc, category) => {
          acc[category] = Math.round(
            categoryScores[category].total / categoryScores[category].count
          );
          return acc;
        }, {}),
        grade: this.getGrade(totalScore),
        passStatus: totalScore >= 60 ? 'PASS' : 'FAIL',
      };
    } catch (error) {
      console.error('[SurveyEngine] Error calculating score:', error);
      return null;
    }
  }

  /**
   * Get letter grade based on score
   */
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate recommendations based on survey responses and score
   */
  async generateRecommendations(surveyResponse, score) {
    const recommendations = [];

    // Score-based recommendations
    if (score.totalScore < 60) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Overall',
        message: 'Overall GACP compliance needs significant improvement',
        actions: [
          'Schedule GACP training session',
          'Review all GACP standard requirements',
          'Consider hiring a GACP consultant',
        ],
      });
    }

    // Category-based recommendations
    for (const [category, categoryScore] of Object.entries(score.categoryScores)) {
      if (categoryScore < 70) {
        recommendations.push({
          priority: categoryScore < 50 ? 'HIGH' : 'MEDIUM',
          category: category,
          message: `${category} practices need improvement (Score: ${categoryScore}%)`,
          actions: this.getCategoryActions(category),
        });
      }
    }

    // Best practices recommendations
    if (score.totalScore >= 80) {
      recommendations.push({
        priority: 'LOW',
        category: 'Certification',
        message: 'You are well-prepared for GACP certification',
        actions: [
          'Schedule official GACP audit',
          'Prepare required documentation',
          'Conduct internal pre-audit',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Get improvement actions for specific category
   */
  getCategoryActions(category) {
    const actionMap = {
      'Soil Management': [
        'Test soil pH and nutrient levels',
        'Implement organic composting',
        'Create soil management plan',
        'Train staff on soil conservation',
      ],
      'Water Management': [
        'Install water quality monitoring system',
        'Implement efficient irrigation methods',
        'Create water conservation plan',
        'Test water sources regularly',
      ],
      'Pest Control': [
        'Adopt integrated pest management (IPM)',
        'Use biological control methods',
        'Reduce chemical pesticide usage',
        'Train staff on pest identification',
      ],
      'Fertilizer Management': [
        'Switch to organic fertilizers',
        'Create fertilizer application schedule',
        'Keep detailed fertilizer records',
        'Train staff on proper application',
      ],
      'GACP Knowledge': [
        'Attend GACP training workshops',
        'Study GACP standard documentation',
        'Join farmer network groups',
        'Subscribe to GACP updates',
      ],
      'Record Keeping': [
        'Implement digital record system',
        'Train staff on documentation',
        'Create standard operating procedures',
        'Conduct regular record audits',
      ],
    };

    return actionMap[category] || ['Consult with GACP expert'];
  }

  /**
   * Get survey statistics
   */
  async getStatistics(userId = null, role = null) {
    try {
      const query = userId && role === 'farmer' ? { userId: userId } : {};

      const total = await this.surveyResponses.countDocuments(query);
      const completed = await this.surveyResponses.countDocuments({
        ...query,
        state: { $in: [this.STATES.SUBMITTED, this.STATES.REVIEWED, this.STATES.COMPLETED] },
      });
      const inProgress = await this.surveyResponses.countDocuments({
        ...query,
        state: this.STATES.IN_PROGRESS,
      });
      const draft = await this.surveyResponses.countDocuments({
        ...query,
        state: this.STATES.DRAFT,
      });

      // Average score for completed surveys
      const completedSurveys = await this.surveyResponses
        .find({
          ...query,
          'score.totalScore': { $exists: true },
        })
        .toArray();

      const avgScore =
        completedSurveys.length > 0
          ? Math.round(
              completedSurveys.reduce((sum, s) => sum + s.score.totalScore, 0) /
                completedSurveys.length
            )
          : 0;

      return {
        total,
        completed,
        inProgress,
        draft,
        averageScore: avgScore,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } catch (error) {
      console.error('[SurveyEngine] Error getting statistics:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        draft: 0,
        averageScore: 0,
        completionRate: 0,
      };
    }
  }
}

module.exports = SurveyProcessEngine;
