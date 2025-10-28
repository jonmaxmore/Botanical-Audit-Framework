/**
 * SurveyCreated Event
 *
 * Domain event published when a new survey is created.
 */

class SurveyCreated {
  constructor({
    surveyId,
    farmId,
    farmerId,
    surveyYear,
    surveyPeriod,
    purpose,
    plantType,
    createdAt
  }) {
    this.surveyId = surveyId;
    this.farmId = farmId;
    this.farmerId = farmerId;
    this.surveyYear = surveyYear;
    this.surveyPeriod = surveyPeriod;
    this.purpose = purpose;
    this.plantType = plantType;
    this.createdAt = createdAt;
    this.eventName = 'SurveyCreated';
    this.occurredAt = new Date();
  }
}

module.exports = SurveyCreated;
