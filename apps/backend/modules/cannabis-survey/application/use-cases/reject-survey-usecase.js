/**
 * Reject Survey Use Case
 *
 * DTAM staff rejects a survey under review.
 *
 * @class RejectSurveyUseCase
 */

const SurveyReviewCompleted = require('../../domain/events/SurveyReviewCompleted');

class RejectSurveyUseCase {
  constructor({ surveyRepository, eventBus }) {
    this.surveyRepository = surveyRepository;
    this.eventBus = eventBus;
  }

  async execute({ surveyId, staffId, reason }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Reject survey
    survey.reject(staffId, reason);

    // Save
    const rejectedSurvey = await this.surveyRepository.save(survey);

    // Publish event
    this.eventBus.publish(
      new SurveyReviewCompleted({
        surveyId: rejectedSurvey.id,
        farmId: rejectedSurvey.farmId,
        farmerId: rejectedSurvey.farmerId,
        surveyYear: rejectedSurvey.surveyYear,
        surveyPeriod: rejectedSurvey.surveyPeriod,
        status: rejectedSurvey.status,
        reviewedBy: rejectedSurvey.reviewedBy,
        reviewedAt: rejectedSurvey.reviewedAt,
        reviewNotes: null,
        rejectionReason: rejectedSurvey.rejectionReason,
        revisionNotes: null
      })
    );

    return rejectedSurvey;
  }
}

module.exports = RejectSurveyUseCase;
