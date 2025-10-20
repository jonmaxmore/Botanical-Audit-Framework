/**
 * Get Survey Details Use Case
 *
 * Business logic for retrieving survey details.
 * Farmers can only see their own surveys, DTAM can see all.
 *
 * @class GetSurveyDetailsUseCase
 */

class GetSurveyDetailsUseCase {
  constructor({ surveyRepository }) {
    this.surveyRepository = surveyRepository;
  }

  async execute({ surveyId, userId, userType }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check permissions
    if (userType === 'farmer') {
      if (!survey.belongsTo(userId)) {
        throw new Error('You do not have permission to view this survey');
      }
    }
    // DTAM staff can view all surveys

    return survey;
  }
}

module.exports = GetSurveyDetailsUseCase;
