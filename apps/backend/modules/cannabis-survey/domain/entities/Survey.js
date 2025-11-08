/**
 * Survey Entity - Cannabis Cultivation Survey
 *
 * Domain entity representing cannabis cultivation survey data.
 * Contains business logic and validation rules.
 *
 * @module domain/entities/Survey
 */

// Survey Status Constants
const STATUS = {
  DRAFT: 'DRAFT', // Survey being filled by farmer
  SUBMITTED: 'SUBMITTED', // Submitted to DTAM for review
  UNDER_REVIEW: 'UNDER_REVIEW', // Being reviewed by DTAM staff
  APPROVED: 'APPROVED', // Approved by DTAM
  REJECTED: 'REJECTED', // Rejected with reason
  REVISION_REQUIRED: 'REVISION_REQUIRED', // Needs farmer revision
};

// Cultivation Purpose Constants
const PURPOSE = {
  RESEARCH: 'RESEARCH', // Research purposes
  MEDICAL: 'MEDICAL', // Medical production
  INDUSTRIAL: 'INDUSTRIAL', // Industrial hemp
  EDUCATION: 'EDUCATION', // Educational purposes
};

// Plant Type Constants
const PLANT_TYPE = {
  CANNABIS_SATIVA: 'CANNABIS_SATIVA',
  CANNABIS_INDICA: 'CANNABIS_INDICA',
  HEMP: 'HEMP',
  HYBRID: 'HYBRID',
};

class Survey {
  constructor({
    id,
    farmId,
    farmerId,
    surveyYear,
    surveyPeriod,

    // Cultivation Information
    purpose,
    plantType,
    strainName,
    numberOfPlants,
    cultivationArea,
    areaUnit = 'rai',
    plantingDate,
    expectedHarvestDate,

    // Growing Methods
    growingMethod,
    seedSource,
    fertilizerUsed,
    pesticideUsed,
    irrigationMethod,

    // Expected Production
    expectedYield,
    yieldUnit = 'kg',
    targetMarket,

    // Documentation
    photos = [],
    documents = [],
    additionalNotes,

    // Review Information
    status = STATUS.DRAFT,
    submittedAt,
    reviewedBy,
    reviewedAt,
    reviewNotes,
    rejectionReason,
    revisionNotes,

    // Compliance
    complianceChecklist = {},
    thcContent,
    cbdContent,

    // Timestamps
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    // Identifiers
    this.id = id;
    this.farmId = farmId;
    this.farmerId = farmerId;
    this.surveyYear = surveyYear;
    this.surveyPeriod = surveyPeriod;

    // Cultivation Information
    this.purpose = purpose;
    this.plantType = plantType;
    this.strainName = strainName;
    this.numberOfPlants = numberOfPlants;
    this.cultivationArea = cultivationArea;
    this.areaUnit = areaUnit;
    this.plantingDate = plantingDate;
    this.expectedHarvestDate = expectedHarvestDate;

    // Growing Methods
    this.growingMethod = growingMethod;
    this.seedSource = seedSource;
    this.fertilizerUsed = fertilizerUsed;
    this.pesticideUsed = pesticideUsed;
    this.irrigationMethod = irrigationMethod;

    // Expected Production
    this.expectedYield = expectedYield;
    this.yieldUnit = yieldUnit;
    this.targetMarket = targetMarket;

    // Documentation
    this.photos = photos;
    this.documents = documents;
    this.additionalNotes = additionalNotes;

    // Review Information
    this.status = status;
    this.submittedAt = submittedAt;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = reviewedAt;
    this.reviewNotes = reviewNotes;
    this.rejectionReason = rejectionReason;
    this.revisionNotes = revisionNotes;

    // Compliance
    this.complianceChecklist = complianceChecklist;
    this.thcContent = thcContent;
    this.cbdContent = cbdContent;

    // Timestamps
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Create a new survey
   */
  static create({ farmId, farmerId, surveyYear, surveyPeriod, ...surveyData }) {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!farmerId) {
      throw new Error('Farmer ID is required');
    }
    if (!surveyYear) {
      throw new Error('Survey year is required');
    }
    if (!surveyPeriod) {
      throw new Error('Survey period is required');
    }

    return new Survey({
      farmId,
      farmerId,
      surveyYear,
      surveyPeriod,
      ...surveyData,
      status: STATUS.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update survey data
   */
  update(updates) {
    if (!this.canEdit()) {
      throw new Error(`Cannot edit survey in ${this.status} status`);
    }

    // Update allowed fields
    const allowedFields = [
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
      'cbdContent',
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        this[field] = updates[field];
      }
    });

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Submit survey for review
   */
  submitForReview() {
    if (this.status !== STATUS.DRAFT && this.status !== STATUS.REVISION_REQUIRED) {
      throw new Error(`Cannot submit survey in ${this.status} status`);
    }

    this.validate();
    this.status = STATUS.SUBMITTED;
    this.submittedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Start review process (DTAM)
   */
  startReview(staffId) {
    if (this.status !== STATUS.SUBMITTED) {
      throw new Error(`Cannot start review for survey in ${this.status} status`);
    }

    this.status = STATUS.UNDER_REVIEW;
    this.reviewedBy = staffId;
    this.updatedAt = new Date();
  }

  /**
   * Approve survey (DTAM)
   */
  approve(staffId, notes) {
    if (this.status !== STATUS.UNDER_REVIEW) {
      throw new Error(`Cannot approve survey in ${this.status} status`);
    }

    this.status = STATUS.APPROVED;
    this.reviewedBy = staffId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Reject survey (DTAM)
   */
  reject(staffId, reason) {
    if (this.status !== STATUS.UNDER_REVIEW) {
      throw new Error(`Cannot reject survey in ${this.status} status`);
    }
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    this.status = STATUS.REJECTED;
    this.reviewedBy = staffId;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Request revision (DTAM)
   */
  requestRevision(staffId, notes) {
    if (this.status !== STATUS.UNDER_REVIEW) {
      throw new Error(`Cannot request revision for survey in ${this.status} status`);
    }
    if (!notes || notes.trim().length < 10) {
      throw new Error('Revision notes must be at least 10 characters');
    }

    this.status = STATUS.REVISION_REQUIRED;
    this.reviewedBy = staffId;
    this.reviewedAt = new Date();
    this.revisionNotes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Validate survey data
   */
  validate() {
    const errors = [];

    // Basic information
    if (!this.farmId) {
      errors.push('Farm ID is required');
    }
    if (!this.farmerId) {
      errors.push('Farmer ID is required');
    }
    if (!this.surveyYear) {
      errors.push('Survey year is required');
    }
    if (!this.surveyPeriod) {
      errors.push('Survey period is required');
    }

    // Cultivation information
    if (!this.purpose) {
      errors.push('Cultivation purpose is required');
    }
    if (!Object.values(PURPOSE).includes(this.purpose)) {
      errors.push(`Invalid purpose: ${this.purpose}`);
    }

    if (!this.plantType) {
      errors.push('Plant type is required');
    }
    if (!Object.values(PLANT_TYPE).includes(this.plantType)) {
      errors.push(`Invalid plant type: ${this.plantType}`);
    }

    if (!this.numberOfPlants || this.numberOfPlants <= 0) {
      errors.push('Number of plants must be greater than 0');
    }

    if (!this.cultivationArea || this.cultivationArea <= 0) {
      errors.push('Cultivation area must be greater than 0');
    }

    // Dates validation
    if (this.plantingDate && this.expectedHarvestDate) {
      if (new Date(this.plantingDate) >= new Date(this.expectedHarvestDate)) {
        errors.push('Expected harvest date must be after planting date');
      }
    }

    // Expected yield
    if (this.expectedYield && this.expectedYield < 0) {
      errors.push('Expected yield cannot be negative');
    }

    // THC/CBD content validation for hemp
    if (this.plantType === PLANT_TYPE.HEMP && this.thcContent > 1.0) {
      errors.push('Hemp THC content must not exceed 1.0%');
    }

    if (errors.length > 0) {
      throw new Error(`Survey validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Check if survey can be edited
   */
  canEdit() {
    return this.status === STATUS.DRAFT || this.status === STATUS.REVISION_REQUIRED;
  }

  /**
   * Check if survey can be submitted
   */
  canSubmit() {
    try {
      this.validate();
      return this.status === STATUS.DRAFT || this.status === STATUS.REVISION_REQUIRED;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if survey is approved
   */
  isApproved() {
    return this.status === STATUS.APPROVED;
  }

  /**
   * Check if survey is under review
   */
  isUnderReview() {
    return this.status === STATUS.SUBMITTED || this.status === STATUS.UNDER_REVIEW;
  }

  /**
   * Check if survey belongs to farmer
   */
  belongsTo(farmerId) {
    return this.farmerId === farmerId;
  }

  /**
   * Get survey summary
   */
  getSummary() {
    return {
      id: this.id,
      farmId: this.farmId,
      surveyYear: this.surveyYear,
      surveyPeriod: this.surveyPeriod,
      purpose: this.purpose,
      plantType: this.plantType,
      numberOfPlants: this.numberOfPlants,
      cultivationArea: this.cultivationArea,
      areaUnit: this.areaUnit,
      status: this.status,
      submittedAt: this.submittedAt,
      reviewedAt: this.reviewedAt,
    };
  }

  /**
   * Calculate cultivation density (plants per unit area)
   */
  getCultivationDensity() {
    if (!this.numberOfPlants || !this.cultivationArea) {
      return 0;
    }
    return (this.numberOfPlants / this.cultivationArea).toFixed(2);
  }

  /**
   * Get days until harvest
   */
  getDaysUntilHarvest() {
    if (!this.expectedHarvestDate) {
      return null;
    }
    const today = new Date();
    const harvestDate = new Date(this.expectedHarvestDate);
    const diffTime = harvestDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get cultivation duration (days)
   */
  getCultivationDuration() {
    if (!this.plantingDate || !this.expectedHarvestDate) {
      return null;
    }
    const planting = new Date(this.plantingDate);
    const harvest = new Date(this.expectedHarvestDate);
    const diffTime = harvest - planting;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if survey is overdue for harvest
   */
  isOverdue() {
    if (!this.expectedHarvestDate) {
      return false;
    }
    return new Date() > new Date(this.expectedHarvestDate);
  }
}

module.exports = {
  Survey,
  STATUS,
  PURPOSE,
  PLANT_TYPE,
};
