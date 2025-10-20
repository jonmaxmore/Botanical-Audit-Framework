/**
 * ICertificateRepository Interface (Domain Layer)
 * Defines contract for certificate data access
 * No implementation here - just interface definition
 */

class ICertificateRepository {
  /**
   * Find certificate by ID
   * @param {string} id
   * @returns {Promise<Certificate|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find certificate by certificate number
   * @param {string} certificateNumber
   * @returns {Promise<Certificate|null>}
   */
  async findByCertificateNumber(certificateNumber) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all certificates by user ID
   * @param {string} userId
   * @returns {Promise<Certificate[]>}
   */
  async findByUserId(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all certificates by farm ID
   * @param {string} farmId
   * @returns {Promise<Certificate[]>}
   */
  async findByFarmId(farmId) {
    throw new Error('Method not implemented');
  }

  /**
   * Save certificate (create or update)
   * @param {Certificate} certificate
   * @returns {Promise<Certificate>}
   */
  async save(certificate) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete certificate
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find certificates with filters
   * @param {Object} filters
   * @returns {Promise<Certificate[]>}
   */
  async findWithFilters(filters) {
    throw new Error('Method not implemented');
  }

  /**
   * Count certificates by status
   * @param {string} status
   * @returns {Promise<number>}
   */
  async countByStatus(status) {
    throw new Error('Method not implemented');
  }

  /**
   * Find expiring certificates (within days)
   * @param {number} days
   * @returns {Promise<Certificate[]>}
   */
  async findExpiringSoon(days) {
    throw new Error('Method not implemented');
  }
}

module.exports = ICertificateRepository;
