/**
 * Seed Entity - Track & Trace Domain
 *
 * Business Logic & Process:
 * Seed เป็นจุดเริ่มต้นของการติดตาม ควบคุมคุณภาพตั้งแต่เมล็ดพันธุ์
 * - ต้องมีการรับรองคุณภาพ และติดตาม lineage
 * - บันทึกข้อมูลพันธุกรรมและแหล่งที่มา
 * - ติดตามการกระจายไปยังฟาร์มต่างๆ
 *
 * Workflow:
 * 1. Seed Registration → 2. Quality Certification → 3. Distribution Tracking
 * 4. Planting Monitoring → 5. Growth Phase Tracking
 */

class Seed {
  constructor({
    seedId,
    batchNumber,
    strain,
    geneticLineage,
    supplier,
    certificationDetails,
    qualityMetrics
  }) {
    // Core identification
    this.seedId = seedId;
    this.batchNumber = batchNumber;
    this.strain = strain;

    // Genetic information for tracking lineage
    this.geneticLineage = {
      parentStrains: geneticLineage?.parentStrains || [],
      generationNumber: geneticLineage?.generationNumber || 1,
      breedingHistory: geneticLineage?.breedingHistory || [],
      geneticMarkers: geneticLineage?.geneticMarkers || []
    };

    // Supply chain information
    this.supplier = {
      supplierId: supplier?.supplierId,
      supplierName: supplier?.supplierName,
      licenseNumber: supplier?.licenseNumber,
      contactInfo: supplier?.contactInfo,
      certification: supplier?.certification
    };

    // Quality and certification
    this.certificationDetails = {
      certificationNumber: certificationDetails?.certificationNumber,
      certifyingAuthority: certificationDetails?.certifyingAuthority,
      certificationDate: certificationDetails?.certificationDate,
      expiryDate: certificationDetails?.expiryDate,
      certificationType: certificationDetails?.certificationType || 'ORGANIC_SEED',
      complianceStatus: certificationDetails?.complianceStatus || 'PENDING'
    };

    // Quality metrics and testing results
    this.qualityMetrics = {
      germinationRate: qualityMetrics?.germinationRate || 0,
      purityPercentage: qualityMetrics?.purityPercentage || 0,
      moistureContent: qualityMetrics?.moistureContent || 0,
      viabilityScore: qualityMetrics?.viabilityScore || 0,
      testingDate: qualityMetrics?.testingDate,
      testingLab: qualityMetrics?.testingLab,
      testResults: qualityMetrics?.testResults || []
    };

    // Tracking information
    this.trackingInfo = {
      createdAt: new Date(),
      updatedAt: new Date(),
      currentStatus: 'REGISTERED',
      distributionHistory: [],
      plantingRecords: [],
      locationHistory: []
    };

    // Business rules validation
    this.validateBusinessRules();
  }

  /**
   * Business Logic: Validate seed quality requirements
   *
   * Process Flow:
   * 1. Check germination rate meets minimum standards (≥85%)
   * 2. Verify purity percentage is acceptable (≥95%)
   * 3. Ensure moisture content is within safe range (5-8%)
   * 4. Validate certification is current and valid
   */
  validateBusinessRules() {
    const validationErrors = [];

    // Germination rate validation
    if (this.qualityMetrics.germinationRate < 85) {
      validationErrors.push({
        field: 'germinationRate',
        message: 'Germination rate must be at least 85%',
        currentValue: this.qualityMetrics.germinationRate,
        requiredValue: 85
      });
    }

    // Purity validation
    if (this.qualityMetrics.purityPercentage < 95) {
      validationErrors.push({
        field: 'purityPercentage',
        message: 'Seed purity must be at least 95%',
        currentValue: this.qualityMetrics.purityPercentage,
        requiredValue: 95
      });
    }

    // Moisture content validation
    if (this.qualityMetrics.moistureContent < 5 || this.qualityMetrics.moistureContent > 8) {
      validationErrors.push({
        field: 'moistureContent',
        message: 'Moisture content must be between 5-8%',
        currentValue: this.qualityMetrics.moistureContent,
        acceptableRange: '5-8%'
      });
    }

    // Certification validation
    if (
      this.certificationDetails.expiryDate &&
      new Date(this.certificationDetails.expiryDate) < new Date()
    ) {
      validationErrors.push({
        field: 'certification',
        message: 'Seed certification has expired',
        expiryDate: this.certificationDetails.expiryDate
      });
    }

    if (validationErrors.length > 0) {
      throw new Error(`Seed validation failed: ${JSON.stringify(validationErrors)}`);
    }
  }

  /**
   * Business Process: Update seed quality metrics
   *
   * Workflow:
   * 1. Validate new quality data
   * 2. Update metrics with timestamp
   * 3. Recalculate overall quality score
   * 4. Update compliance status if needed
   */
  updateQualityMetrics(newMetrics, testingInfo) {
    // Validate testing information
    if (!testingInfo.testingDate || !testingInfo.testingLab) {
      throw new Error('Testing date and lab information are required');
    }

    // Update metrics
    this.qualityMetrics = {
      ...this.qualityMetrics,
      ...newMetrics,
      testingDate: testingInfo.testingDate,
      testingLab: testingInfo.testingLab,
      lastUpdated: new Date()
    };

    // Recalculate overall quality score
    this.qualityMetrics.overallQualityScore = this.calculateOverallQualityScore();

    // Update compliance status based on new metrics
    this.updateComplianceStatus();

    // Update tracking info
    this.trackingInfo.updatedAt = new Date();
    this.trackingInfo.qualityUpdateHistory = this.trackingInfo.qualityUpdateHistory || [];
    this.trackingInfo.qualityUpdateHistory.push({
      updatedAt: new Date(),
      previousMetrics: { ...this.qualityMetrics },
      newMetrics: newMetrics,
      testingInfo: testingInfo
    });

    // Re-validate business rules
    this.validateBusinessRules();

    return this;
  }

  /**
   * Business Logic: Calculate overall quality score
   *
   * Algorithm:
   * - Germination Rate: 40% weight
   * - Purity Percentage: 30% weight
   * - Viability Score: 20% weight
   * - Moisture Content (optimal range): 10% weight
   */
  calculateOverallQualityScore() {
    const weights = {
      germinationRate: 0.4,
      purityPercentage: 0.3,
      viabilityScore: 0.2,
      moistureContent: 0.1
    };

    // Normalize moisture content score (optimal range: 6-7%)
    const moistureScore = this.calculateMoistureScore(this.qualityMetrics.moistureContent);

    const overallScore =
      this.qualityMetrics.germinationRate * weights.germinationRate +
      this.qualityMetrics.purityPercentage * weights.purityPercentage +
      this.qualityMetrics.viabilityScore * weights.viabilityScore +
      moistureScore * weights.moistureContent;

    return Math.round(overallScore * 100) / 100;
  }

  /**
   * Calculate moisture content score (optimal range scoring)
   */
  calculateMoistureScore(moistureContent) {
    const optimal = 6.5; // Optimal moisture content
    const tolerance = 1.5; // Acceptable deviation

    const deviation = Math.abs(moistureContent - optimal);
    if (deviation <= tolerance) {
      return 100 - (deviation / tolerance) * 20; // Linear decrease within tolerance
    } else {
      return Math.max(0, 80 - (deviation - tolerance) * 10); // Rapid decrease outside tolerance
    }
  }

  /**
   * Business Process: Record distribution to farm
   *
   * Workflow:
   * 1. Validate farm eligibility
   * 2. Record distribution details
   * 3. Update seed status and location
   * 4. Create distribution certificate
   * 5. Initialize planting tracking
   */
  recordDistribution(farmInfo, distributionDetails) {
    // Validate farm information
    if (!farmInfo.farmId || !farmInfo.licenseNumber) {
      throw new Error('Farm ID and license number are required for distribution tracking');
    }

    // Validate distribution details
    if (!distributionDetails.quantity || !distributionDetails.distributionDate) {
      throw new Error('Distribution quantity and date are required');
    }

    // Create distribution record
    const distributionRecord = {
      distributionId: `DIST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      farmId: farmInfo.farmId,
      farmName: farmInfo.farmName,
      farmLicenseNumber: farmInfo.licenseNumber,
      quantity: distributionDetails.quantity,
      distributionDate: distributionDetails.distributionDate,
      distributedBy: distributionDetails.distributedBy,
      transportMethod: distributionDetails.transportMethod,
      expectedPlantingDate: distributionDetails.expectedPlantingDate,
      distributionStatus: 'DISTRIBUTED',
      timestamp: new Date()
    };

    // Add to distribution history
    this.trackingInfo.distributionHistory.push(distributionRecord);

    // Update current status and location
    this.trackingInfo.currentStatus = 'DISTRIBUTED';
    this.trackingInfo.currentLocation = {
      type: 'FARM',
      farmId: farmInfo.farmId,
      farmName: farmInfo.farmName,
      locationCoordinates: farmInfo.coordinates,
      updatedAt: new Date()
    };

    // Update location history
    this.trackingInfo.locationHistory.push({
      location: this.trackingInfo.currentLocation,
      timestamp: new Date(),
      action: 'DISTRIBUTION',
      distributionId: distributionRecord.distributionId
    });

    this.trackingInfo.updatedAt = new Date();

    return distributionRecord;
  }

  /**
   * Business Process: Record planting initiation
   *
   * Workflow:
   * 1. Validate planting conditions and timing
   * 2. Create planting record with plot information
   * 3. Initialize growth phase tracking
   * 4. Update seed status to PLANTED
   * 5. Set up monitoring schedule
   */
  recordPlanting(plantingInfo) {
    // Validate planting information
    if (!plantingInfo.plotId || !plantingInfo.plantingDate) {
      throw new Error('Plot ID and planting date are required');
    }

    // Check if seed is in correct status for planting
    if (this.trackingInfo.currentStatus !== 'DISTRIBUTED') {
      throw new Error(`Cannot plant seed in status: ${this.trackingInfo.currentStatus}`);
    }

    // Create planting record
    const plantingRecord = {
      plantingId: `PLANT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      plotId: plantingInfo.plotId,
      plotLocation: plantingInfo.plotLocation,
      plantingDate: plantingInfo.plantingDate,
      plantingMethod: plantingInfo.plantingMethod || 'DIRECT_SEEDING',
      seedsPlanted: plantingInfo.seedsPlanted,
      plantingDepth: plantingInfo.plantingDepth,
      soilConditions: plantingInfo.soilConditions,
      weatherConditions: plantingInfo.weatherConditions,
      plantedBy: plantingInfo.plantedBy,
      expectedGerminationDate: this.calculateExpectedGerminationDate(plantingInfo.plantingDate),
      expectedHarvestDate: this.calculateExpectedHarvestDate(plantingInfo.plantingDate),
      timestamp: new Date()
    };

    // Add to planting records
    this.trackingInfo.plantingRecords.push(plantingRecord);

    // Update status
    this.trackingInfo.currentStatus = 'PLANTED';
    this.trackingInfo.updatedAt = new Date();

    // Initialize growth tracking
    this.initializeGrowthTracking(plantingRecord);

    return plantingRecord;
  }

  /**
   * Calculate expected germination date based on strain characteristics
   */
  calculateExpectedGerminationDate(plantingDate) {
    const germinationDays = this.getStrainGerminationPeriod();
    const plantingDateObj = new Date(plantingDate);
    plantingDateObj.setDate(plantingDateObj.getDate() + germinationDays);
    return plantingDateObj;
  }

  /**
   * Calculate expected harvest date based on strain flowering period
   */
  calculateExpectedHarvestDate(plantingDate) {
    const totalGrowthDays = this.getStrainTotalGrowthPeriod();
    const plantingDateObj = new Date(plantingDate);
    plantingDateObj.setDate(plantingDateObj.getDate() + totalGrowthDays);
    return plantingDateObj;
  }

  /**
   * Get strain-specific germination period
   */
  getStrainGerminationPeriod() {
    const strainGerminationPeriods = {
      INDICA: 3, // 3-5 days typical
      SATIVA: 4, // 4-7 days typical
      HYBRID: 3, // 3-6 days typical
      AUTO_FLOWERING: 2 // 2-4 days typical
    };

    return strainGerminationPeriods[this.strain?.type] || 4;
  }

  /**
   * Get strain-specific total growth period
   */
  getStrainTotalGrowthPeriod() {
    const strainGrowthPeriods = {
      INDICA: 90, // ~90 days seed to harvest
      SATIVA: 120, // ~120 days seed to harvest
      HYBRID: 105, // ~105 days seed to harvest
      AUTO_FLOWERING: 75 // ~75 days seed to harvest
    };

    return strainGrowthPeriods[this.strain?.type] || 100;
  }

  /**
   * Initialize growth phase tracking
   */
  initializeGrowthTracking(plantingRecord) {
    this.growthTracking = {
      plantingId: plantingRecord.plantingId,
      currentPhase: 'GERMINATION',
      phaseHistory: [
        {
          phase: 'GERMINATION',
          startDate: plantingRecord.plantingDate,
          expectedEndDate: plantingRecord.expectedGerminationDate,
          status: 'IN_PROGRESS',
          timestamp: new Date()
        }
      ],
      monitoringSchedule: this.createMonitoringSchedule(plantingRecord),
      growthMetrics: {
        germinationRate: null,
        plantHeight: [],
        leafCount: [],
        healthScore: [],
        environmentalConditions: []
      }
    };
  }

  /**
   * Create monitoring schedule based on growth phases
   */
  createMonitoringSchedule(plantingRecord) {
    const schedule = [];
    const plantingDate = new Date(plantingRecord.plantingDate);

    // Germination monitoring (daily for first week)
    for (let day = 1; day <= 7; day++) {
      const monitoringDate = new Date(plantingDate);
      monitoringDate.setDate(monitoringDate.getDate() + day);

      schedule.push({
        date: monitoringDate,
        phase: 'GERMINATION',
        frequency: 'DAILY',
        checkPoints: ['germination_progress', 'soil_moisture', 'temperature']
      });
    }

    // Vegetative monitoring (weekly)
    for (let week = 2; week <= 8; week++) {
      const monitoringDate = new Date(plantingDate);
      monitoringDate.setDate(monitoringDate.getDate() + week * 7);

      schedule.push({
        date: monitoringDate,
        phase: 'VEGETATIVE',
        frequency: 'WEEKLY',
        checkPoints: ['plant_height', 'leaf_development', 'pest_check', 'nutrient_levels']
      });
    }

    return schedule;
  }

  /**
   * Update compliance status based on current metrics and certifications
   */
  updateComplianceStatus() {
    const overallScore =
      this.qualityMetrics.overallQualityScore || this.calculateOverallQualityScore();

    if (overallScore >= 90 && this.isCertificationValid()) {
      this.certificationDetails.complianceStatus = 'FULLY_COMPLIANT';
    } else if (overallScore >= 80 && this.isCertificationValid()) {
      this.certificationDetails.complianceStatus = 'COMPLIANT';
    } else if (overallScore >= 70) {
      this.certificationDetails.complianceStatus = 'CONDITIONALLY_COMPLIANT';
    } else {
      this.certificationDetails.complianceStatus = 'NON_COMPLIANT';
    }
  }

  /**
   * Check if certification is valid and current
   */
  isCertificationValid() {
    return (
      this.certificationDetails.expiryDate &&
      new Date(this.certificationDetails.expiryDate) > new Date() &&
      this.certificationDetails.certificationNumber
    );
  }

  /**
   * Get comprehensive tracking report
   */
  getTrackingReport() {
    return {
      seedInfo: {
        seedId: this.seedId,
        batchNumber: this.batchNumber,
        strain: this.strain,
        supplier: this.supplier.supplierName
      },
      qualityStatus: {
        overallScore:
          this.qualityMetrics.overallQualityScore || this.calculateOverallQualityScore(),
        complianceStatus: this.certificationDetails.complianceStatus,
        certificationValid: this.isCertificationValid()
      },
      trackingStatus: {
        currentStatus: this.trackingInfo.currentStatus,
        currentLocation: this.trackingInfo.currentLocation,
        distributionCount: this.trackingInfo.distributionHistory.length,
        plantingCount: this.trackingInfo.plantingRecords.length
      },
      timeline: {
        registered: this.trackingInfo.createdAt,
        lastUpdated: this.trackingInfo.updatedAt,
        distributionHistory: this.trackingInfo.distributionHistory.map(d => ({
          date: d.distributionDate,
          farm: d.farmName,
          quantity: d.quantity
        })),
        plantingHistory: this.trackingInfo.plantingRecords.map(p => ({
          date: p.plantingDate,
          plot: p.plotId,
          quantity: p.seedsPlanted
        }))
      }
    };
  }
}

module.exports = Seed;
