/**
 * Survey DTOs (Data Transfer Objects)
 *
 * Transform Survey entities to different response formats.
 *
 * @module presentation/dto/SurveyDTO
 */

class SurveyDTO {
  /**
   * Convert Survey entity to public DTO (for farmers)
   */
  static toPublicDTO(survey) {
    return {
      id: survey.id,
      farmId: survey.farmId,
      surveyYear: survey.surveyYear,
      surveyPeriod: survey.surveyPeriod,

      // Cultivation information
      purpose: survey.purpose,
      plantType: survey.plantType,
      strainName: survey.strainName,
      numberOfPlants: survey.numberOfPlants,
      cultivationArea: survey.cultivationArea,
      areaUnit: survey.areaUnit,
      plantingDate: survey.plantingDate,
      expectedHarvestDate: survey.expectedHarvestDate,

      // Growing methods
      growingMethod: survey.growingMethod,
      seedSource: survey.seedSource,
      fertilizerUsed: survey.fertilizerUsed,
      pesticideUsed: survey.pesticideUsed,
      irrigationMethod: survey.irrigationMethod,

      // Expected production
      expectedYield: survey.expectedYield,
      yieldUnit: survey.yieldUnit,
      targetMarket: survey.targetMarket,

      // Documentation
      photos: survey.photos,
      documents: survey.documents,
      additionalNotes: survey.additionalNotes,

      // Status and review
      status: survey.status,
      submittedAt: survey.submittedAt,
      reviewedAt: survey.reviewedAt,
      reviewNotes: survey.reviewNotes,
      rejectionReason: survey.rejectionReason,
      revisionNotes: survey.revisionNotes,

      // Compliance
      complianceChecklist: survey.complianceChecklist,
      thcContent: survey.thcContent,
      cbdContent: survey.cbdContent,

      // Computed fields
      canEdit: survey.canEdit(),
      canSubmit: survey.canSubmit(),
      isApproved: survey.isApproved(),
      cultivationDensity: survey.getCultivationDensity(),
      daysUntilHarvest: survey.getDaysUntilHarvest(),
      cultivationDuration: survey.getCultivationDuration(),
      isOverdue: survey.isOverdue(),

      // Timestamps
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt
    };
  }

  /**
   * Convert Survey entity to detailed DTO (for DTAM staff)
   */
  static toDetailedDTO(survey) {
    return {
      ...this.toPublicDTO(survey),
      farmerId: survey.farmerId,
      reviewedBy: survey.reviewedBy,

      // Additional DTAM-specific fields
      summary: survey.getSummary()
    };
  }

  /**
   * Convert Survey entity to list item DTO
   */
  static toListItemDTO(survey, userType = 'farmer') {
    const baseDTO = {
      id: survey.id,
      farmId: survey.farmId,
      surveyYear: survey.surveyYear,
      surveyPeriod: survey.surveyPeriod,
      purpose: survey.purpose,
      plantType: survey.plantType,
      strainName: survey.strainName,
      numberOfPlants: survey.numberOfPlants,
      cultivationArea: survey.cultivationArea,
      areaUnit: survey.areaUnit,
      status: survey.status,
      submittedAt: survey.submittedAt,
      reviewedAt: survey.reviewedAt,
      expectedHarvestDate: survey.expectedHarvestDate,
      daysUntilHarvest: survey.getDaysUntilHarvest(),
      isOverdue: survey.isOverdue(),
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt
    };

    if (userType === 'dtam') {
      baseDTO.farmerId = survey.farmerId;
      baseDTO.reviewedBy = survey.reviewedBy;
    }

    return baseDTO;
  }

  /**
   * Transform create survey request to Survey entity data
   */
  static fromCreateRequest(body, farmerId) {
    return {
      farmId: body.farmId,
      farmerId,
      surveyYear: body.surveyYear,
      surveyPeriod: body.surveyPeriod,
      purpose: body.purpose,
      plantType: body.plantType,
      strainName: body.strainName,
      numberOfPlants: body.numberOfPlants,
      cultivationArea: body.cultivationArea,
      areaUnit: body.areaUnit,
      plantingDate: body.plantingDate,
      expectedHarvestDate: body.expectedHarvestDate,
      growingMethod: body.growingMethod,
      seedSource: body.seedSource,
      fertilizerUsed: body.fertilizerUsed,
      pesticideUsed: body.pesticideUsed,
      irrigationMethod: body.irrigationMethod,
      expectedYield: body.expectedYield,
      yieldUnit: body.yieldUnit,
      targetMarket: body.targetMarket,
      photos: body.photos,
      documents: body.documents,
      additionalNotes: body.additionalNotes,
      complianceChecklist: body.complianceChecklist,
      thcContent: body.thcContent,
      cbdContent: body.cbdContent
    };
  }

  /**
   * Transform update survey request (only changed fields)
   */
  static fromUpdateRequest(body) {
    const updates = {};

    // Only include fields that are present in the request
    const allowedFields = [
      'surveyYear',
      'surveyPeriod',
      'purpose',
      'plantType',
      'strainName',
      'numberOfPlants',
      'cultivationArea',
      'areaUnit',
      'plantingDate',
      'expectedHarvestDate',
      'growingMethod',
      'seedSource',
      'fertilizerUsed',
      'pesticideUsed',
      'irrigationMethod',
      'expectedYield',
      'yieldUnit',
      'targetMarket',
      'photos',
      'documents',
      'additionalNotes',
      'complianceChecklist',
      'thcContent',
      'cbdContent'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    return updates;
  }

  /**
   * Success response wrapper
   */
  static successResponse(message, data) {
    return {
      success: true,
      message,
      data
    };
  }

  /**
   * Error response wrapper
   */
  static errorResponse(message, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }
}

module.exports = SurveyDTO;
