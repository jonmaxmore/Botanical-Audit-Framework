/**
 * Request Survey Revision Use Case
 *
 * DTAM staff requests revision on a survey under review.
 *
 * @class RequestSurveyRevisionUseCase
 */

const SurveyReviewCompleted = require('../../domain/events/SurveyReviewCompleted');

class RequestSurveyRevisionUseCase {
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

    // Request revision
    survey.requestRevision(staffId, notes);

    // Save
    const updatedSurvey = await this.surveyRepository.save(survey);

    // Publish event
    this.eventBus.publish(
      new SurveyReviewCompleted({
        surveyId: updatedSurvey.id,
        farmId: updatedSurvey.farmId,
        farmerId: updatedSurvey.farmerId,
        surveyYear: updatedSurvey.surveyYear,
        surveyPeriod: updatedSurvey.surveyPeriod,
        status: updatedSurvey.status,
        reviewedBy: updatedSurvey.reviewedBy,
        reviewedAt: updatedSurvey.reviewedAt,
        reviewNotes: null,
        rejectionReason: null,
        revisionNotes: updatedSurvey.revisionNotes,
      }),
    );

    return updatedSurvey;
  }
}

module.exports = RequestSurveyRevisionUseCase;
