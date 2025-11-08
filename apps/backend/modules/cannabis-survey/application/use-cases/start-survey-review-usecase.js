/**
 * Start Survey Review Use Case
 *
 * DTAM staff starts reviewing a submitted survey.
 *
 * @class StartSurveyReviewUseCase
 */

class StartSurveyReviewUseCase {
  constructor({ surveyRepository }) {
    this.surveyRepository = surveyRepository;
  }

  async execute({ surveyId, staffId }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Start review
    survey.startReview(staffId);

    // Save
    const updatedSurvey = await this.surveyRepository.save(survey);

    return updatedSurvey;
  }
}

module.exports = StartSurveyReviewUseCase;
