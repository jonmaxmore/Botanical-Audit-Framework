/**
 * List Surveys Use Case
 *
 * Business logic for listing surveys with filters.
 * Farmers see only their own surveys, DTAM sees all with filters.
 *
 * @class ListSurveysUseCase
 */

class ListSurveysUseCase {
  constructor({ surveyRepository }) {
    this.surveyRepository = surveyRepository;
  }

  async execute({ userId, userType, filters = {}, options = {} }) {
    let surveys;

    if (userType === 'farmer') {
      // Farmers see only their own surveys
      surveys = await this.surveyRepository.findByFarmerId(userId, options);
    } else {
      // DTAM staff can see all surveys with filters
      surveys = await this.surveyRepository.findWithFilters(filters, options);
    }

    return surveys;
  }
}

module.exports = ListSurveysUseCase;
