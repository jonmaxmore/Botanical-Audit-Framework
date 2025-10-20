/**
 * Submit Survey Use Case
 *
 * Business logic for submitting a survey for DTAM review.
 *
 * @class SubmitSurveyUseCase
 */

const SurveySubmitted = require('../../domain/events/SurveySubmitted');

class SubmitSurveyUseCase {
  constructor({ surveyRepository, eventBus }) {
    this.surveyRepository = surveyRepository;
    this.eventBus = eventBus;
  }

  async execute({ surveyId, farmerId }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (!survey.belongsTo(farmerId)) {
      throw new Error('You do not have permission to submit this survey');
    }

    // Check if survey can be submitted
    if (!survey.canSubmit()) {
      throw new Error('Survey validation failed or status does not allow submission');
    }

    // Submit survey
    survey.submitForReview();

    // Save
    const submittedSurvey = await this.surveyRepository.save(survey);

    // Publish event
    this.eventBus.publish(
      new SurveySubmitted({
        surveyId: submittedSurvey.id,
        farmId: submittedSurvey.farmId,
        farmerId: submittedSurvey.farmerId,
        surveyYear: submittedSurvey.surveyYear,
        surveyPeriod: submittedSurvey.surveyPeriod,
        submittedAt: submittedSurvey.submittedAt,
      })
    );

    return submittedSurvey;
  }
}

module.exports = SubmitSurveyUseCase;
