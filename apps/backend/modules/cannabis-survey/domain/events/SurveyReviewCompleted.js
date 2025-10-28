/**
 * SurveyReviewCompleted Event
 *
 * Domain event published when survey review is completed (approved/rejected/revision requested).
 */

class SurveyReviewCompleted {
  constructor({
    surveyId,
    farmId,
    farmerId,
    surveyYear,
    surveyPeriod,
    status,
    reviewedBy,
    reviewedAt,
    reviewNotes,
    rejectionReason,
    revisionNotes
  }) {
    this.surveyId = surveyId;
    this.farmId = farmId;
    this.farmerId = farmerId;
    this.surveyYear = surveyYear;
    this.surveyPeriod = surveyPeriod;
    this.status = status;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = reviewedAt;
    this.reviewNotes = reviewNotes;
    this.rejectionReason = rejectionReason;
    this.revisionNotes = revisionNotes;
    this.eventName = 'SurveyReviewCompleted';
    this.occurredAt = new Date();
  }
}

module.exports = SurveyReviewCompleted;
