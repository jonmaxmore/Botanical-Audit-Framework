/**
 * Approve Survey Use Case
 *
 * DTAM staff approves a survey under review.
 *
 * @class ApproveSurveyUseCase
 */

const SurveyReviewCompleted = require('../../domain/events/SurveyReviewCompleted');

class ApproveSurveyUseCase {
  constructor({ surveyRepository, eventBus }) {
    this.surveyRepository = surveyRepository;
    this.eventBus = eventBus;
  }

  async execute({ surveyId, staffId, notes }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Approve survey
    survey.approve(staffId, notes);

    // Save
    const approvedSurvey = await this.surveyRepository.save(survey);

    // Publish event
    this.eventBus.publish(
      new SurveyReviewCompleted({
        surveyId: approvedSurvey.id,
        farmId: approvedSurvey.farmId,
        farmerId: approvedSurvey.farmerId,
        surveyYear: approvedSurvey.surveyYear,
        surveyPeriod: approvedSurvey.surveyPeriod,
        status: approvedSurvey.status,
        reviewedBy: approvedSurvey.reviewedBy,
        reviewedAt: approvedSurvey.reviewedAt,
        reviewNotes: approvedSurvey.reviewNotes,
        rejectionReason: null,
        revisionNotes: null
      })
    );

    return approvedSurvey;
  }
}

module.exports = ApproveSurveyUseCase;
