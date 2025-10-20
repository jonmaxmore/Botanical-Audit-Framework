/**
 * Get Farmer Enrollments Use Case
 *
 * Business Logic: Get all enrollments for a farmer
 * Access: Farmer (own enrollments), DTAM (any farmer)
 */

class GetFarmerEnrollmentsUseCase {
  constructor(enrollmentRepository) {
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute(farmerId, filters = {}, options = {}) {
    return await this.enrollmentRepository.findByFarmerId(farmerId, filters, options);
  }
}

module.exports = GetFarmerEnrollmentsUseCase;
