/**
 * Track Seed Use Case - Track & Trace Application Layer
 *
 * Business Logic & Process Flow:
 * การติดตามเมล็ดพันธุ์ตั้งแต่การลงทะเบียนจนถึงการปลูก
 *
 * Complete Workflow:
 * 1. Seed Registration → 2. Quality Verification → 3. Distribution Management →
 * 4. Planting Tracking → 5. Growth Monitoring → 6. Compliance Validation
 *
 * Business Rules:
 * - ทุกเมล็ดต้องผ่านการตรวจสอบคุณภาพก่อนการจำหน่าย
 * - การกระจายต้องมีใบรับรองและการติดตาม
 * - การปลูกต้องบันทึกทันทีเพื่อการติดตาม
 * - ต้องปฏิบัติตามมาตรฐาน GACP ตลอดกระบวนการ
 */

class TrackSeedUseCase {
  constructor(options = {}) {
    this.seedRepository = options.seedRepository;
    this.farmRepository = options.farmRepository;
    this.auditService = options.auditService;
    this.notificationService = options.notificationService;
    this.complianceService = options.complianceService;
    this.logger = options.logger || console;

    // Business validation rules
    this.businessRules = {
      minGerminationRate: 85, // Minimum 85% germination rate
      minPurityPercentage: 95, // Minimum 95% purity
      maxMoistureContent: 8, // Maximum 8% moisture
      minMoistureContent: 5, // Minimum 5% moisture
      certificationValidityDays: 365, // Certification valid for 1 year
      maxDistributionDays: 180, // Seeds must be distributed within 180 days
      auditFrequencyDays: 30 // Audit every 30 days
    };
  }

  /**
   * Business Process: Register new seed batch
   *
   * Complete Workflow:
   * 1. Validate seed information and supplier credentials
   * 2. Perform quality assessment and compliance check
   * 3. Generate unique tracking ID and create seed record
   * 4. Initialize monitoring and audit schedule
   * 5. Notify relevant stakeholders of new seed registration
   */
  async registerSeed(seedData) {
    try {
      this.logger.log(`[TrackSeed] Starting seed registration for batch: ${seedData.batchNumber}`);

      // Step 1: Validate seed data and supplier
      await this.validateSeedRegistration(seedData);

      // Step 2: Perform quality assessment
      const qualityAssessment = await this.performQualityAssessment(seedData.qualityMetrics);

      // Step 3: Create seed entity with business logic
      const seed = new (require('../domain/entities/Seed'))({
        seedId: this.generateSeedId(seedData.batchNumber),
        batchNumber: seedData.batchNumber,
        strain: seedData.strain,
        geneticLineage: seedData.geneticLineage,
        supplier: seedData.supplier,
        certificationDetails: seedData.certificationDetails,
        qualityMetrics: qualityAssessment.validatedMetrics
      });

      // Step 4: Store seed in repository
      const savedSeed = await this.seedRepository.save(seed);

      // Step 5: Initialize compliance monitoring
      await this.initializeComplianceMonitoring(savedSeed);

      // Step 6: Create audit trail
      await this.createAuditTrail('SEED_REGISTERED', {
        seedId: savedSeed.seedId,
        batchNumber: savedSeed.batchNumber,
        supplier: savedSeed.supplier.supplierName,
        qualityScore: qualityAssessment.overallScore
      });

      // Step 7: Send notifications
      await this.sendRegistrationNotifications(savedSeed, qualityAssessment);

      this.logger.log(`[TrackSeed] Seed registration completed: ${savedSeed.seedId}`);

      return {
        success: true,
        seedId: savedSeed.seedId,
        batchNumber: savedSeed.batchNumber,
        qualityAssessment: qualityAssessment,
        complianceStatus: savedSeed.certificationDetails.complianceStatus,
        trackingUrl: this.generateTrackingUrl(savedSeed.seedId)
      };
    } catch (error) {
      this.logger.error(`[TrackSeed] Seed registration failed: ${error.message}`);

      // Log failure for audit
      await this.createAuditTrail('SEED_REGISTRATION_FAILED', {
        batchNumber: seedData?.batchNumber,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Business Process: Track seed distribution
   *
   * Workflow:
   * 1. Validate farm eligibility and licensing
   * 2. Check seed availability and quality status
   * 3. Record distribution details with timestamps
   * 4. Update seed location and tracking status
   * 5. Generate distribution certificate
   * 6. Initialize farm-level monitoring
   */
  async distributeSeed(seedId, farmId, distributionDetails) {
    try {
      this.logger.log(
        `[TrackSeed] Processing seed distribution - Seed: ${seedId}, Farm: ${farmId}`
      );

      // Step 1: Validate distribution request
      const validationResult = await this.validateSeedDistribution(
        seedId,
        farmId,
        distributionDetails
      );

      // Step 2: Get seed and farm information
      const seed = await this.seedRepository.findById(seedId);
      if (!seed) {
        throw new Error(`Seed not found: ${seedId}`);
      }

      const farm = await this.farmRepository.findById(farmId);
      if (!farm) {
        throw new Error(`Farm not found: ${farmId}`);
      }

      // Step 3: Verify farm compliance and licensing
      await this.verifyFarmCompliance(farm);

      // Step 4: Record distribution in seed entity
      const distributionRecord = seed.recordDistribution(
        {
          farmId: farm.farmId,
          farmName: farm.farmName,
          licenseNumber: farm.licenseNumber,
          coordinates: farm.location.coordinates
        },
        distributionDetails
      );

      // Step 5: Update seed in repository
      const updatedSeed = await this.seedRepository.update(seed);

      // Step 6: Generate distribution certificate
      const distributionCertificate = await this.generateDistributionCertificate(
        updatedSeed,
        farm,
        distributionRecord
      );

      // Step 7: Initialize farm monitoring
      await this.initializeFarmMonitoring(updatedSeed, farm, distributionRecord);

      // Step 8: Create audit trail
      await this.createAuditTrail('SEED_DISTRIBUTED', {
        seedId: seed.seedId,
        farmId: farm.farmId,
        quantity: distributionDetails.quantity,
        distributionId: distributionRecord.distributionId
      });

      // Step 9: Send notifications
      await this.sendDistributionNotifications(updatedSeed, farm, distributionRecord);

      this.logger.log(
        `[TrackSeed] Seed distribution completed: ${distributionRecord.distributionId}`
      );

      return {
        success: true,
        distributionId: distributionRecord.distributionId,
        certificateNumber: distributionCertificate.certificateNumber,
        trackingStatus: updatedSeed.trackingInfo.currentStatus,
        monitoringSchedule: distributionRecord.monitoringSchedule,
        nextAudit: this.calculateNextAuditDate(updatedSeed)
      };
    } catch (error) {
      this.logger.error(`[TrackSeed] Seed distribution failed: ${error.message}`);

      await this.createAuditTrail('SEED_DISTRIBUTION_FAILED', {
        seedId: seedId,
        farmId: farmId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Business Process: Track seed planting
   *
   * Workflow:
   * 1. Validate planting conditions and timing
   * 2. Verify plot eligibility and soil conditions
   * 3. Record planting details with GPS coordinates
   * 4. Initialize plant growth tracking
   * 5. Set up monitoring alerts and schedules
   * 6. Update compliance status
   */
  async trackPlanting(seedId, plantingInfo) {
    try {
      this.logger.log(
        `[TrackSeed] Tracking seed planting - Seed: ${seedId}, Plot: ${plantingInfo.plotId}`
      );

      // Step 1: Validate planting information
      await this.validatePlantingInfo(plantingInfo);

      // Step 2: Get seed and validate status
      const seed = await this.seedRepository.findById(seedId);
      if (!seed) {
        throw new Error(`Seed not found: ${seedId}`);
      }

      if (seed.trackingInfo.currentStatus !== 'DISTRIBUTED') {
        throw new Error(
          `Seed not ready for planting. Current status: ${seed.trackingInfo.currentStatus}`
        );
      }

      // Step 3: Validate plot and soil conditions
      await this.validatePlotConditions(plantingInfo.plotId, plantingInfo.soilConditions);

      // Step 4: Record planting in seed entity
      const plantingRecord = seed.recordPlanting(plantingInfo);

      // Step 5: Create plant tracking entity
      const plantTrackingData = await this.initializePlantTracking(seed, plantingRecord);

      // Step 6: Update seed in repository
      const updatedSeed = await this.seedRepository.update(seed);

      // Step 7: Set up monitoring alerts
      await this.setupPlantingMonitoringAlerts(plantingRecord, plantTrackingData);

      // Step 8: Create audit trail
      await this.createAuditTrail('SEED_PLANTED', {
        seedId: seed.seedId,
        plotId: plantingInfo.plotId,
        plantingId: plantingRecord.plantingId,
        seedsPlanted: plantingInfo.seedsPlanted
      });

      // Step 9: Send planting notifications
      await this.sendPlantingNotifications(updatedSeed, plantingRecord);

      this.logger.log(`[TrackSeed] Seed planting tracked: ${plantingRecord.plantingId}`);

      return {
        success: true,
        plantingId: plantingRecord.plantingId,
        plantTrackingId: plantTrackingData.plantId,
        expectedGermination: plantingRecord.expectedGerminationDate,
        expectedHarvest: plantingRecord.expectedHarvestDate,
        monitoringSchedule: seed.growthTracking.monitoringSchedule,
        complianceStatus: updatedSeed.certificationDetails.complianceStatus
      };
    } catch (error) {
      this.logger.error(`[TrackSeed] Seed planting tracking failed: ${error.message}`);

      await this.createAuditTrail('SEED_PLANTING_FAILED', {
        seedId: seedId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Business Process: Get comprehensive seed tracking report
   *
   * Report includes:
   * 1. Complete seed lifecycle from registration to current status
   * 2. Quality metrics and compliance status
   * 3. Distribution history with farm details
   * 4. Planting records and growth tracking
   * 5. Audit trail and verification history
   */
  async getSeedTrackingReport(seedId) {
    try {
      this.logger.log(`[TrackSeed] Generating tracking report for seed: ${seedId}`);

      // Get seed with full tracking history
      const seed = await this.seedRepository.findByIdWithHistory(seedId);
      if (!seed) {
        throw new Error(`Seed not found: ${seedId}`);
      }

      // Get related farm and plant data
      const relatedData = await this.getRelatedTrackingData(seed);

      // Generate comprehensive report
      const trackingReport = {
        // Basic seed information
        seedInfo: seed.getTrackingReport().seedInfo,

        // Current status and quality
        currentStatus: {
          trackingStatus: seed.trackingInfo.currentStatus,
          location: seed.trackingInfo.currentLocation,
          qualityScore:
            seed.qualityMetrics.overallQualityScore || seed.calculateOverallQualityScore(),
          complianceStatus: seed.certificationDetails.complianceStatus,
          lastUpdated: seed.trackingInfo.updatedAt
        },

        // Complete lifecycle timeline
        lifecycle: {
          registered: seed.trackingInfo.createdAt,
          qualityTested: seed.qualityMetrics.testingDate,
          distributed:
            seed.trackingInfo.distributionHistory.length > 0
              ? seed.trackingInfo.distributionHistory[0].distributionDate
              : null,
          planted:
            seed.trackingInfo.plantingRecords.length > 0
              ? seed.trackingInfo.plantingRecords[0].plantingDate
              : null,
          currentPhase: seed.growthTracking?.currentPhase || 'STORAGE'
        },

        // Distribution history
        distributionHistory: seed.trackingInfo.distributionHistory.map(dist => ({
          distributionId: dist.distributionId,
          farm: {
            farmId: dist.farmId,
            farmName: dist.farmName,
            licenseNumber: dist.farmLicenseNumber
          },
          quantity: dist.quantity,
          distributionDate: dist.distributionDate,
          status: dist.distributionStatus
        })),

        // Planting and growth tracking
        plantingHistory: seed.trackingInfo.plantingRecords.map(plant => ({
          plantingId: plant.plantingId,
          plotId: plant.plotId,
          plantingDate: plant.plantingDate,
          seedsPlanted: plant.seedsPlanted,
          expectedGermination: plant.expectedGerminationDate,
          expectedHarvest: plant.expectedHarvestDate
        })),

        // Quality and compliance metrics
        quality: {
          germinationRate: seed.qualityMetrics.germinationRate,
          purityPercentage: seed.qualityMetrics.purityPercentage,
          moistureContent: seed.qualityMetrics.moistureContent,
          overallScore:
            seed.qualityMetrics.overallQualityScore || seed.calculateOverallQualityScore(),
          lastTested: seed.qualityMetrics.testingDate,
          testingLab: seed.qualityMetrics.testingLab
        },

        // Certification and compliance
        compliance: {
          certificationNumber: seed.certificationDetails.certificationNumber,
          certifyingAuthority: seed.certificationDetails.certifyingAuthority,
          certificationDate: seed.certificationDetails.certificationDate,
          expiryDate: seed.certificationDetails.expiryDate,
          complianceStatus: seed.certificationDetails.complianceStatus,
          isValid: seed.isCertificationValid()
        },

        // Related plant tracking (if planted)
        plantTracking: relatedData.plants.map(plant => ({
          plantId: plant.plantId,
          currentPhase: plant.growthPhases.current,
          healthScore:
            plant.growthMetrics.healthScores.length > 0
              ? plant.growthMetrics.healthScores[plant.growthMetrics.healthScores.length - 1]
                .overallScore
              : null,
          lastUpdate: plant.lifecycle.updatedAt
        })),

        // Audit trail
        auditTrail: await this.getAuditTrail(seedId),

        // Generated report metadata
        reportMetadata: {
          generatedAt: new Date(),
          generatedBy: 'TRACK_SEED_USE_CASE',
          reportVersion: '1.0',
          dataCompleteness: this.calculateDataCompleteness(seed),
          verificationStatus: await this.verifyDataIntegrity(seed)
        }
      };

      // Update access log
      await this.createAuditTrail('TRACKING_REPORT_GENERATED', {
        seedId: seedId,
        reportSize: JSON.stringify(trackingReport).length,
        accessedAt: new Date()
      });

      this.logger.log(`[TrackSeed] Tracking report generated for seed: ${seedId}`);

      return trackingReport;
    } catch (error) {
      this.logger.error(`[TrackSeed] Tracking report generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Process: Update seed quality metrics
   *
   * Workflow:
   * 1. Validate new quality data and testing credentials
   * 2. Compare with previous metrics for anomaly detection
   * 3. Update quality scores and compliance status
   * 4. Trigger alerts if quality degrades significantly
   * 5. Update audit trail and notify stakeholders
   */
  async updateSeedQuality(seedId, newQualityMetrics, testingInfo) {
    try {
      this.logger.log(`[TrackSeed] Updating quality metrics for seed: ${seedId}`);

      // Step 1: Validate quality data
      await this.validateQualityMetrics(newQualityMetrics, testingInfo);

      // Step 2: Get existing seed
      const seed = await this.seedRepository.findById(seedId);
      if (!seed) {
        throw new Error(`Seed not found: ${seedId}`);
      }

      // Step 3: Store previous metrics for comparison
      const previousMetrics = { ...seed.qualityMetrics };

      // Step 4: Update quality metrics in seed entity
      seed.updateQualityMetrics(newQualityMetrics, testingInfo);

      // Step 5: Detect significant changes
      const qualityChanges = this.analyzeQualityChanges(previousMetrics, seed.qualityMetrics);

      // Step 6: Update seed in repository
      const updatedSeed = await this.seedRepository.update(seed);

      // Step 7: Handle quality alerts if needed
      if (qualityChanges.significantChanges.length > 0) {
        await this.handleQualityAlerts(updatedSeed, qualityChanges);
      }

      // Step 8: Create audit trail
      await this.createAuditTrail('SEED_QUALITY_UPDATED', {
        seedId: seedId,
        previousScore: previousMetrics.overallQualityScore,
        newScore: updatedSeed.qualityMetrics.overallQualityScore,
        testingLab: testingInfo.testingLab,
        changes: qualityChanges.significantChanges
      });

      // Step 9: Send update notifications
      await this.sendQualityUpdateNotifications(updatedSeed, qualityChanges);

      this.logger.log(`[TrackSeed] Quality metrics updated for seed: ${seedId}`);

      return {
        success: true,
        seedId: seedId,
        qualityScore: updatedSeed.qualityMetrics.overallQualityScore,
        complianceStatus: updatedSeed.certificationDetails.complianceStatus,
        qualityChanges: qualityChanges,
        lastTested: updatedSeed.qualityMetrics.testingDate
      };
    } catch (error) {
      this.logger.error(`[TrackSeed] Quality update failed: ${error.message}`);

      await this.createAuditTrail('SEED_QUALITY_UPDATE_FAILED', {
        seedId: seedId,
        error: error.message
      });

      throw error;
    }
  }

  // Validation methods with business logic

  /**
   * Validate seed registration data against business rules
   */
  async validateSeedRegistration(seedData) {
    const errors = [];

    // Basic required fields
    if (!seedData.batchNumber) {
      errors.push('Batch number is required');
    }

    if (!seedData.strain || !seedData.strain.strainName) {
      errors.push('Strain information is required');
    }

    // Supplier validation
    if (!seedData.supplier || !seedData.supplier.licenseNumber) {
      errors.push('Valid supplier license number is required');
    }

    // Quality metrics validation
    if (!seedData.qualityMetrics) {
      errors.push('Quality metrics are required for registration');
    } else {
      if (seedData.qualityMetrics.germinationRate < this.businessRules.minGerminationRate) {
        errors.push(`Germination rate must be at least ${this.businessRules.minGerminationRate}%`);
      }

      if (seedData.qualityMetrics.purityPercentage < this.businessRules.minPurityPercentage) {
        errors.push(
          `Purity percentage must be at least ${this.businessRules.minPurityPercentage}%`
        );
      }

      const moisture = seedData.qualityMetrics.moistureContent;
      if (
        moisture < this.businessRules.minMoistureContent ||
        moisture > this.businessRules.maxMoistureContent
      ) {
        errors.push(
          `Moisture content must be between ${this.businessRules.minMoistureContent}% and ${this.businessRules.maxMoistureContent}%`
        );
      }
    }

    // Certification validation
    if (seedData.certificationDetails) {
      const expiryDate = new Date(seedData.certificationDetails.expiryDate);
      const today = new Date();
      const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);

      if (daysUntilExpiry < 30) {
        errors.push('Certification expires within 30 days - renewal required');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Seed registration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate seed distribution eligibility
   */
  async validateSeedDistribution(seedId, farmId, distributionDetails) {
    const seed = await this.seedRepository.findById(seedId);
    if (!seed) {
      throw new Error('Seed not found');
    }

    // Check seed status
    if (seed.trackingInfo.currentStatus !== 'REGISTERED') {
      throw new Error(`Seed cannot be distributed in status: ${seed.trackingInfo.currentStatus}`);
    }

    // Check seed age
    const seedAge = (new Date() - new Date(seed.trackingInfo.createdAt)) / (1000 * 60 * 60 * 24);
    if (seedAge > this.businessRules.maxDistributionDays) {
      throw new Error(`Seed too old for distribution (${Math.floor(seedAge)} days old)`);
    }

    // Validate quantity
    if (!distributionDetails.quantity || distributionDetails.quantity <= 0) {
      throw new Error('Valid quantity required for distribution');
    }

    // Check certification validity
    if (!seed.isCertificationValid()) {
      throw new Error('Seed certification invalid or expired');
    }

    return true;
  }

  // Helper methods

  generateSeedId(batchNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SEED-${batchNumber}-${timestamp}-${random}`.toUpperCase();
  }

  generateTrackingUrl(seedId) {
    return `${process.env.TRACKING_BASE_URL || 'https://gacp-tracking.com'}/track/${seedId}`;
  }

  async performQualityAssessment(qualityMetrics) {
    // Perform comprehensive quality assessment
    const assessment = {
      validatedMetrics: { ...qualityMetrics },
      overallScore: 0,
      compliance: 'PENDING',
      recommendations: []
    };

    // Calculate overall quality score
    const weights = { germinationRate: 0.4, purityPercentage: 0.3, viabilityScore: 0.3 };
    assessment.overallScore =
      qualityMetrics.germinationRate * weights.germinationRate +
      qualityMetrics.purityPercentage * weights.purityPercentage +
      (qualityMetrics.viabilityScore || 85) * weights.viabilityScore;

    // Determine compliance status
    if (assessment.overallScore >= 90) {
      assessment.compliance = 'EXCELLENT';
    } else if (assessment.overallScore >= 85) {
      assessment.compliance = 'GOOD';
    } else if (assessment.overallScore >= 80) {
      assessment.compliance = 'ACCEPTABLE';
    } else {
      assessment.compliance = 'BELOW_STANDARD';
    }

    return assessment;
  }

  // Placeholder methods for complex operations
  async verifyFarmCompliance(farm) {
    /* Implement farm compliance verification */
  }
  async generateDistributionCertificate(seed, farm, distributionRecord) {
    return { certificateNumber: 'CERT-001' };
  }
  async initializeFarmMonitoring(seed, farm, distributionRecord) {
    /* Implement monitoring setup */
  }
  async initializePlantTracking(seed, plantingRecord) {
    return { plantId: 'PLANT-001' };
  }
  async setupPlantingMonitoringAlerts(plantingRecord, plantTrackingData) {
    /* Implement alert setup */
  }
  async initializeComplianceMonitoring(seed) {
    /* Implement compliance monitoring */
  }
  async validatePlantingInfo(plantingInfo) {
    /* Validate planting information */
  }
  async validatePlotConditions(plotId, soilConditions) {
    /* Validate plot and soil */
  }
  async getRelatedTrackingData(seed) {
    return { plants: [] };
  }
  async getAuditTrail(seedId) {
    return [];
  }
  calculateDataCompleteness(seed) {
    return 95;
  }
  async verifyDataIntegrity(seed) {
    return 'VERIFIED';
  }
  async validateQualityMetrics(metrics, testingInfo) {
    /* Validate quality data */
  }
  analyzeQualityChanges(previous, current) {
    return { significantChanges: [] };
  }
  async handleQualityAlerts(seed, changes) {
    /* Handle quality alerts */
  }
  calculateNextAuditDate(seed) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Notification and audit methods
  async createAuditTrail(action, data) {
    if (this.auditService) {
      return await this.auditService.log({
        module: 'TRACK_TRACE',
        action: action,
        data: data,
        timestamp: new Date()
      });
    }
  }

  async sendRegistrationNotifications(seed, qualityAssessment) {
    /* Implement notifications */
  }
  async sendDistributionNotifications(seed, farm, distributionRecord) {
    /* Implement notifications */
  }
  async sendPlantingNotifications(seed, plantingRecord) {
    /* Implement notifications */
  }
  async sendQualityUpdateNotifications(seed, qualityChanges) {
    /* Implement notifications */
  }
}

module.exports = TrackSeedUseCase;
