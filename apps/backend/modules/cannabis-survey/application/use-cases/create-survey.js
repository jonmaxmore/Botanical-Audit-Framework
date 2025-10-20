/**
 * Create Survey Use Case
 *
 * Business logic for creating a new cannabis cultivation survey.
 *
 * @class CreateSurveyUseCase
 */

const { Survey } = require('../../domain/entities/Survey');
const SurveyCreated = require('../../domain/events/SurveyCreated');

class CreateSurveyUseCase {
  constructor({ surveyRepository, eventBus }) {
    this.surveyRepository = surveyRepository;
    this.eventBus = eventBus;
  }

  async execute({ farmId, farmerId, surveyYear, surveyPeriod, ...surveyData }) {
    // Check if survey already exists for this period
    const exists = await this.surveyRepository.surveyExistsForPeriod(
      farmId,
      surveyYear,
      surveyPeriod,
    );

    if (exists) {
      throw new Error(
        `Survey already exists for farm ${farmId} in ${surveyYear} period ${surveyPeriod}`,
      );
    }

    // Create survey entity
    const survey = Survey.create({
      farmId,
      farmerId,
      surveyYear,
      surveyPeriod,
      ...surveyData,
    });

    // Validate
    survey.validate();

    // Save
    const savedSurvey = await this.surveyRepository.save(survey);

    // Publish event
    this.eventBus.publish(
      new SurveyCreated({
        surveyId: savedSurvey.id,
        farmId: savedSurvey.farmId,
        farmerId: savedSurvey.farmerId,
        surveyYear: savedSurvey.surveyYear,
        surveyPeriod: savedSurvey.surveyPeriod,
        purpose: savedSurvey.purpose,
        plantType: savedSurvey.plantType,
        createdAt: savedSurvey.createdAt,
      }),
    );

    return savedSurvey;
  }
}

module.exports = CreateSurveyUseCase;
