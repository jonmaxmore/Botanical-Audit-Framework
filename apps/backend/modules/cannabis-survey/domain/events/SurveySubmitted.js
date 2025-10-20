/**
 * SurveySubmitted Event
 *
 * Domain event published when a survey is submitted for review.
 */

class SurveySubmitted {
  constructor({ surveyId, farmId, farmerId, surveyYear, surveyPeriod, submittedAt }) {
    this.surveyId = surveyId;
    this.farmId = farmId;
    this.farmerId = farmerId;
    this.surveyYear = surveyYear;
    this.surveyPeriod = surveyPeriod;
    this.submittedAt = submittedAt;
    this.eventName = 'SurveySubmitted';
    this.occurredAt = new Date();
  }
}

module.exports = SurveySubmitted;
