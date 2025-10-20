/**
 * Update Survey Use Case
 *
 * Business logic for updating an existing survey.
 * Only DRAFT or REVISION_REQUIRED surveys can be updated.
 *
 * @class UpdateSurveyUseCase
 */

class UpdateSurveyUseCase {
  constructor({ surveyRepository }) {
    this.surveyRepository = surveyRepository;
  }

  async execute({ surveyId, farmerId, updates }) {
    // Find survey
    const survey = await this.surveyRepository.findById(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (!survey.belongsTo(farmerId)) {
      throw new Error('You do not have permission to update this survey');
    }

    // Check if survey can be edited
    if (!survey.canEdit()) {
      throw new Error(`Cannot edit survey in ${survey.status} status`);
    }

    // Check for period uniqueness if changing year/period
    if (updates.surveyYear || updates.surveyPeriod) {
      const year = updates.surveyYear || survey.surveyYear;
      const period = updates.surveyPeriod || survey.surveyPeriod;

      const exists = await this.surveyRepository.surveyExistsForPeriod(
        survey.farmId,
        year,
        period,
        surveyId
      );

      if (exists) {
        throw new Error(`Survey already exists for this period`);
      }
    }

    // Update survey
    survey.update(updates);

    // Save
    const updatedSurvey = await this.surveyRepository.save(survey);

    return updatedSurvey;
  }
}

module.exports = UpdateSurveyUseCase;
