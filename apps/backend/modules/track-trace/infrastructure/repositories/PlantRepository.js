/**
 * Plant Repository Interface - Track & Trace Infrastructure Layer
 *
 * Business Logic & Data Access Pattern:
 * การจัดการข้อมูลพืชและการติดตามวงจรชีวิตของพืชอย่างมีประสิทธิภาพ
 *
 * Repository Pattern Implementation:
 * 1. Advanced Query Patterns → 2. Time-Series Data Management → 3. Lifecycle Tracking →
 * 4. Performance Optimization → 5. Historical Data Archival → 6. Real-time Updates
 *
 * Business Rules:
 * - ติดตามข้อมูลพืชแบบ real-time ตั้งแต่เพาะปลูกจนเก็บเกี่ยว
 * - จัดเก็บข้อมูล time-series สำหรับการเจริญเติบโตและสภาพแวดล้อม
 * - รักษา traceability ย้อนกลับถึงเมล็ดและแปลง
 * - รองรับ bulk operations สำหรับการจัดการพืชจำนวนมาก
 * - ประสิทธิภาพการค้นหาสำหรับ dashboard และ reporting
 */

class PlantRepository {
  constructor(options = {}) {
    this.database = options.database;
    this.timeSeriesDB = options.timeSeriesDB; // Separate DB for time-series data
    this.cache = options.cache;
    this.logger = options.logger || console;

    // Collection/table names
    this.collections = {
      plants: 'plants',
      plantGrowthHistory: 'plant_growth_history',
      plantEnvironmentalData: 'plant_environmental_data',
      plantHealthAssessments: 'plant_health_assessments',
      plantMilestones: 'plant_milestones',
      plantAuditLogs: 'plant_audit_logs'
    };

    // Time-series collections for high-frequency data
    this.timeSeriesCollections = {
      growthMeasurements: 'ts_growth_measurements',
      environmentalReadings: 'ts_environmental_readings',
      healthMetrics: 'ts_health_metrics'
    };

    // Index configurations for query optimization
    this.indexConfigurations = {
      // Primary indexes
      plantId: { unique: true, sparse: false },
      seedTraceability: { compound: ['seedId', 'farmId', 'plotId'] },

      // Lifecycle indexes
      growthPhase: { compound: ['growthPhases.current', 'growthPhases.currentStartDate'] },
      plantingDate: { field: 'plantingInfo.plantingDate' },
      expectedHarvest: { field: 'harvestInfo.expectedHarvestDate' },

      // Status and health indexes
      healthScore: { field: 'currentHealthScore' },
      plantStatus: { field: 'currentStatus' },

      // Location indexes
      farmLocation: { compound: ['farmId', 'plotId'] },
      geoLocation: { geoSpatial: 'location.coordinates' },

      // Time-series indexes for performance
      timeSeriesTimestamp: { field: 'timestamp' },
      timeSeriesPlantId: { compound: ['plantId', 'timestamp'] },

      // Search and reporting indexes
      strain: { field: 'strainInfo.strainName' },
      batchTracking: { field: 'batchId' }
    };

    // Cache strategies for different data types
    this.cacheStrategies = {
      plantDetails: {
        ttl: 1800, // 30 minutes
        pattern: 'plant:details:{plantId}'
      },
      plantSummary: {
        ttl: 300, // 5 minutes (more frequent updates)
        pattern: 'plant:summary:{plantId}'
      },
      farmPlants: {
        ttl: 600, // 10 minutes
        pattern: 'farm:plants:{farmId}:{plotId?}'
      },
      batchPlants: {
        ttl: 900, // 15 minutes
        pattern: 'batch:plants:{batchId}'
      },
      timeSeriesData: {
        ttl: 120, // 2 minutes (real-time data)
        pattern: 'timeseries:{type}:{plantId}:{timeRange}'
      }
    };

    // Query optimization configurations
    this.queryOptimizations = {
      batchSize: 1000, // For bulk operations
      maxTimeSeriesPoints: 10000, // Maximum points to return
      defaultTimeRange: 30, // Days
      aggregationTimeout: 30000 // 30 seconds
    };
  }

  /**
   * Business Method: Find plant by ID with complete lifecycle data
   *
   * Query Strategy:
   * 1. Multi-layer caching (summary → details → complete)
   * 2. Lazy loading of time-series data
   * 3. Optimized joins with related entities
   * 4. Real-time health and status calculation
   */
  async findById(plantId, options = {}) {
    try {
      this.logger.log(`[PlantRepository] Finding plant by ID: ${plantId}`);

      // Step 1: Determine data completeness level
      const includeTimeSeries = options.includeTimeSeries || false;
      const includeHistory = options.includeHistory || true;
      const timeRange = options.timeRange || this.queryOptimizations.defaultTimeRange;

      // Step 2: Check cache based on data completeness
      const cacheKey = includeTimeSeries
        ? `plant:complete:${plantId}:${timeRange}`
        : `plant:details:${plantId}`;

      const cachedPlant = await this.getCachedData(cacheKey);
      if (cachedPlant && !options.bypassCache) {
        this.logger.log(`[PlantRepository] Plant found in cache: ${plantId}`);
        return this.deserializePlant(cachedPlant);
      }

      // Step 3: Query main plant document
      const plantDocument = await this.database
        .collection(this.collections.plants)
        .findOne({ plantId: plantId });

      if (!plantDocument) {
        this.logger.log(`[PlantRepository] Plant not found: ${plantId}`);
        return null;
      }

      // Step 4: Enrich with related data based on options
      const enrichedData = await this.enrichPlantData(plantDocument, {
        includeHistory,
        includeTimeSeries,
        timeRange
      });

      // Step 5: Create plant entity
      const plant = this.createPlantFromDocument(plantDocument, enrichedData);

      // Step 6: Cache the result with appropriate TTL
      const cacheTTL = includeTimeSeries
        ? this.cacheStrategies.timeSeriesData.ttl
        : this.cacheStrategies.plantDetails.ttl;

      await this.setCachedData(cacheKey, this.serializePlant(plant), cacheTTL);

      this.logger.log(`[PlantRepository] Plant found and enriched: ${plantId}`);
      return plant;
    } catch (error) {
      this.logger.error(`[PlantRepository] Error finding plant by ID ${plantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Method: Find plants by batch with performance optimization
   *
   * Batch Query Strategy:
   * 1. Optimized aggregation for batch statistics
   * 2. Parallel loading of time-series data
   * 3. Batch-level health and growth analytics
   * 4. Efficient pagination and filtering
   */
  async findByBatch(batchId, options = {}) {
    try {
      this.logger.log(`[PlantRepository] Finding plants by batch: ${batchId}`);

      // Step 1: Check batch cache
      const cacheKey = `batch:plants:${batchId}:${this.hashOptions(options)}`;
      const cachedBatch = await this.getCachedData(cacheKey);

      if (cachedBatch && !options.bypassCache) {
        this.logger.log(`[PlantRepository] Batch plants found in cache: ${batchId}`);
        return this.deserializeBatchResult(cachedBatch);
      }

      // Step 2: Build batch query with filters
      const batchQuery = { batchId: batchId };

      if (options.status) {
        batchQuery.currentStatus = options.status;
      }

      if (options.healthThreshold) {
        batchQuery.currentHealthScore = { $gte: options.healthThreshold };
      }

      if (options.growthPhase) {
        batchQuery['growthPhases.current'] = options.growthPhase;
      }

      // Step 3: Execute optimized aggregation query
      const aggregationPipeline = [
        { $match: batchQuery },

        // Add computed fields for batch analytics
        {
          $addFields: {
            plantAge: {
              $divide: [
                { $subtract: [new Date(), '$plantingInfo.plantingDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            },
            daysToExpectedHarvest: {
              $divide: [
                { $subtract: ['$harvestInfo.expectedHarvestDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },

        // Faceted results for batch analytics
        {
          $facet: {
            plants: [
              { $sort: options.sort || { 'plantingInfo.plantingDate': -1 } },
              { $skip: options.offset || 0 },
              { $limit: options.limit || 100 }
            ],
            analytics: [
              {
                $group: {
                  _id: '$batchId',
                  totalPlants: { $sum: 1 },
                  avgHealthScore: { $avg: '$currentHealthScore' },
                  avgAge: { $avg: '$plantAge' },
                  phaseDistribution: {
                    $push: '$growthPhases.current'
                  },
                  healthDistribution: {
                    $push: {
                      $switch: {
                        branches: [
                          { case: { $gte: ['$currentHealthScore', 90] }, then: 'EXCELLENT' },
                          { case: { $gte: ['$currentHealthScore', 80] }, then: 'GOOD' },
                          { case: { $gte: ['$currentHealthScore', 70] }, then: 'FAIR' }
                        ],
                        default: 'POOR'
                      }
                    }
                  }
                }
              }
            ],
            totalCount: [{ $count: 'total' }]
          }
        }
      ];

      const results = await this.database
        .collection(this.collections.plants)
        .aggregate(aggregationPipeline)
        .toArray();

      const batchResults = results[0];

      // Step 4: Enrich plants with recent time-series data if requested
      let enrichedPlants = batchResults.plants;

      if (options.includeRecentData) {
        enrichedPlants = await Promise.all(
          batchResults.plants.map(async plantDoc => {
            const recentData = await this.getRecentTimeSeriesData(plantDoc.plantId);
            return { ...plantDoc, recentTimeSeries: recentData };
          })
        );
      }

      // Step 5: Create plant entities
      const plants = enrichedPlants.map(doc => this.createPlantFromDocument(doc));

      // Step 6: Process batch analytics
      const batchAnalytics = this.processBatchAnalytics(
        batchResults.analytics[0],
        batchResults.plants
      );

      // Step 7: Prepare batch result
      const batchResult = {
        batchId: batchId,
        plants: plants,
        analytics: batchAnalytics,
        pagination: {
          total: batchResults.totalCount[0]?.total || 0,
          limit: options.limit || 100,
          offset: options.offset || 0,
          hasMore: (options.offset || 0) + plants.length < (batchResults.totalCount[0]?.total || 0)
        }
      };

      // Step 8: Cache batch result
      await this.setCachedData(
        cacheKey,
        this.serializeBatchResult(batchResult),
        this.cacheStrategies.batchPlants.ttl
      );

      this.logger.log(`[PlantRepository] Found ${plants.length} plants in batch: ${batchId}`);
      return batchResult;
    } catch (error) {
      this.logger.error(
        `[PlantRepository] Error finding plants by batch ${batchId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Business Method: Save plant with time-series data management
   *
   * Save Strategy:
   * 1. Separate handling of static vs. time-series data
   * 2. Optimized bulk inserts for measurements
   * 3. Automatic index management
   * 4. Real-time cache updates
   */
  async save(plant) {
    const session = await this.database.startSession();

    try {
      this.logger.log(`[PlantRepository] Saving plant: ${plant.plantId}`);

      await session.withTransaction(async () => {
        // Step 1: Validate plant data
        await this.validatePlantForSave(plant);

        // Step 2: Prepare main plant document
        const plantDocument = this.preparePlantDocument(plant);

        // Step 3: Check for existing plant
        const existingPlant = await this.database
          .collection(this.collections.plants)
          .findOne({ plantId: plant.plantId }, { session });

        let savedDocument;

        if (existingPlant) {
          // Update existing plant
          plantDocument.updatedAt = new Date();
          plantDocument.version = (existingPlant.version || 1) + 1;

          const updateResult = await this.database
            .collection(this.collections.plants)
            .replaceOne({ plantId: plant.plantId }, plantDocument, { session, upsert: false });

          if (updateResult.matchedCount === 0) {
            throw new Error(`Failed to update plant: ${plant.plantId}`);
          }

          savedDocument = plantDocument;
        } else {
          // Insert new plant
          plantDocument.createdAt = new Date();
          plantDocument.updatedAt = new Date();
          plantDocument.version = 1;

          const insertResult = await this.database
            .collection(this.collections.plants)
            .insertOne(plantDocument, { session });

          if (!insertResult.insertedId) {
            throw new Error(`Failed to insert plant: ${plant.plantId}`);
          }

          savedDocument = plantDocument;
        }

        // Step 4: Handle time-series data separately
        await this.saveTimeSeriesData(plant, session);

        // Step 5: Update audit log
        await this.createPlantAuditLog(
          {
            plantId: plant.plantId,
            action: existingPlant ? 'UPDATE' : 'CREATE',
            changes: existingPlant
              ? this.calculatePlantChanges(existingPlant, savedDocument)
              : 'INITIAL_CREATE',
            timestamp: new Date(),
            version: savedDocument.version
          },
          session
        );
      });

      // Step 6: Update caches and indexes (outside transaction)
      await this.updatePlantCaches(plant);

      // Step 7: Return saved plant entity
      const savedPlant = await this.findById(plant.plantId);

      this.logger.log(`[PlantRepository] Plant saved successfully: ${plant.plantId}`);
      return savedPlant;
    } catch (error) {
      this.logger.error(`[PlantRepository] Error saving plant ${plant.plantId}: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Business Method: Get plant growth analytics with time-series analysis
   *
   * Analytics Strategy:
   * 1. Efficient time-series aggregation
   * 2. Growth trend calculations
   * 3. Comparative analysis with batch peers
   * 4. Predictive modeling data preparation
   */
  async getPlantGrowthAnalytics(plantId, options = {}) {
    try {
      this.logger.log(`[PlantRepository] Getting growth analytics for plant: ${plantId}`);

      // Step 1: Check analytics cache
      const cacheKey = `analytics:growth:${plantId}:${this.hashOptions(options)}`;
      const cachedAnalytics = await this.getCachedData(cacheKey);

      if (cachedAnalytics && !options.bypassCache) {
        this.logger.log(`[PlantRepository] Growth analytics found in cache: ${plantId}`);
        return this.deserializeAnalytics(cachedAnalytics);
      }

      // Step 2: Get plant base information
      const plant = await this.findById(plantId, { includeHistory: false });
      if (!plant) {
        throw new Error(`Plant not found: ${plantId}`);
      }

      // Step 3: Build time-series analytics pipeline
      const timeRange = options.timeRange || 30; // Days
      const fromDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);

      const analyticsPipeline = [
        {
          $match: {
            plantId: plantId,
            timestamp: { $gte: fromDate }
          }
        },

        // Group by day for trend analysis
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              measurementType: '$measurementType'
            },
            avgValue: { $avg: '$value' },
            maxValue: { $max: '$value' },
            minValue: { $min: '$value' },
            count: { $sum: 1 }
          }
        },

        // Reshape for easier consumption
        {
          $group: {
            _id: '$_id.date',
            measurements: {
              $push: {
                type: '$_id.measurementType',
                avgValue: '$avgValue',
                maxValue: '$maxValue',
                minValue: '$minValue',
                count: '$count'
              }
            }
          }
        },

        { $sort: { _id: 1 } }
      ];

      // Step 4: Execute analytics queries in parallel
      const [timeSeriesAnalytics, healthTrends, environmentalAnalytics, batchComparison] =
        await Promise.all([
          this.timeSeriesDB
            ? this.timeSeriesDB
                .collection(this.timeSeriesCollections.growthMeasurements)
                .aggregate(analyticsPipeline)
                .toArray()
            : this.database
                .collection(this.collections.plantGrowthHistory)
                .aggregate(analyticsPipeline)
                .toArray(),

          this.getHealthTrendsAnalytics(plantId, fromDate),
          this.getEnvironmentalAnalytics(plantId, fromDate),
          this.getBatchComparisonAnalytics(plant.batchId, plantId)
        ]);

      // Step 5: Process and combine analytics
      const growthAnalytics = {
        plantInfo: {
          plantId: plantId,
          age: this.calculatePlantAge(plant),
          currentPhase: plant.growthPhases.current,
          strain: plant.strainInfo.strainName
        },

        timeSeries: {
          measurements: timeSeriesAnalytics,
          dateRange: {
            from: fromDate,
            to: new Date(),
            days: timeRange
          }
        },

        trends: {
          growth: this.calculateGrowthTrends(timeSeriesAnalytics),
          health: this.calculateHealthTrends(healthTrends),
          environmental: this.calculateEnvironmentalTrends(environmentalAnalytics)
        },

        performance: {
          batchComparison: batchComparison,
          benchmarkPosition: this.calculateBenchmarkPosition(plant, batchComparison),
          performanceScore: this.calculatePerformanceScore(plant, timeSeriesAnalytics)
        },

        predictions: {
          nextMilestone: this.predictNextMilestone(plant, timeSeriesAnalytics),
          harvestProjection: this.projectHarvestDate(plant, timeSeriesAnalytics),
          yieldEstimate: this.estimateYield(plant, timeSeriesAnalytics)
        },

        metadata: {
          generatedAt: new Date(),
          dataPoints: timeSeriesAnalytics.length,
          analysisQuality: this.assessAnalysisQuality(timeSeriesAnalytics)
        }
      };

      // Step 6: Cache analytics result
      await this.setCachedData(
        cacheKey,
        this.serializeAnalytics(growthAnalytics),
        this.cacheStrategies.timeSeriesData.ttl
      );

      this.logger.log(`[PlantRepository] Growth analytics generated for plant: ${plantId}`);
      return growthAnalytics;
    } catch (error) {
      this.logger.error(
        `[PlantRepository] Error getting plant analytics ${plantId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Business Method: Bulk update plants with batch optimization
   *
   * Bulk Strategy:
   * 1. Batch operations for performance
   * 2. Parallel processing where safe
   * 3. Rollback capability on failures
   * 4. Progress tracking for large operations
   */
  async bulkUpdatePlants(updates, options = {}) {
    const session = await this.database.startSession();

    try {
      this.logger.log(`[PlantRepository] Bulk updating ${updates.length} plants`);

      const batchSize = options.batchSize || this.queryOptimizations.batchSize;
      const results = [];

      await session.withTransaction(async () => {
        // Step 1: Process updates in batches
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);

          // Step 2: Prepare bulk operations
          const bulkOperations = batch.map(update => ({
            updateOne: {
              filter: { plantId: update.plantId },
              update: {
                $set: {
                  ...this.preparePlantUpdateDocument(update),
                  updatedAt: new Date(),
                  $inc: { version: 1 }
                }
              }
            }
          }));

          // Step 3: Execute bulk operation
          const bulkResult = await this.database
            .collection(this.collections.plants)
            .bulkWrite(bulkOperations, { session, ordered: false });

          results.push(bulkResult);

          // Step 4: Create audit logs for batch
          await this.createBulkAuditLogs(batch, session);

          // Progress callback if provided
          if (options.onProgress) {
            options.onProgress({
              completed: i + batch.length,
              total: updates.length,
              batchResult: bulkResult
            });
          }
        }
      });

      // Step 5: Invalidate related caches
      await this.invalidateBulkCaches(updates);

      const totalResults = this.aggregateBulkResults(results);

      this.logger.log(
        `[PlantRepository] Bulk update completed: ${totalResults.modifiedCount} plants updated`
      );
      return totalResults;
    } catch (error) {
      this.logger.error(`[PlantRepository] Bulk update failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Helper methods for data transformation and entity creation

  /**
   * Create plant entity from database document with enriched data
   */
  createPlantFromDocument(document, enrichedData = {}) {
    if (!document) return null;

    const PlantEntity = require('../domain/entities/Plant');

    return new PlantEntity({
      plantId: document.plantId,
      seedId: document.seedId,
      farmId: document.farmId,
      plotId: document.plotId,
      batchId: document.batchId,
      plantingInfo: document.plantingInfo,
      strainInfo: document.strainInfo,
      growthPhases: {
        ...document.growthPhases,
        history: enrichedData.phaseHistory || document.growthPhases.history
      },
      growthMetrics: {
        ...document.growthMetrics,
        timeSeriesData: enrichedData.timeSeriesData || {}
      },
      environmentalRequirements: document.environmentalRequirements,
      healthAssessment: document.healthAssessment,
      currentStatus: document.currentStatus,
      currentHealthScore: document.currentHealthScore,
      harvestInfo: document.harvestInfo,
      compliance: document.compliance,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      version: document.version
    });
  }

  /**
   * Prepare database document from plant entity
   */
  preparePlantDocument(plant) {
    const document = {
      plantId: plant.plantId,
      seedId: plant.seedId,
      farmId: plant.farmId,
      plotId: plant.plotId,
      batchId: plant.batchId,
      plantingInfo: plant.plantingInfo,
      strainInfo: plant.strainInfo,
      growthPhases: {
        current: plant.growthPhases.current,
        currentStartDate: plant.growthPhases.currentStartDate,
        history: plant.growthPhases.history?.slice(-10) || [] // Keep last 10 phases
      },
      growthMetrics: {
        // Store only summary metrics in main document
        height: plant.growthMetrics.height?.slice(-30) || [], // Last 30 measurements
        nodeCount: plant.growthMetrics.nodeCount?.slice(-30) || [],
        overallGrowthRate: plant.growthMetrics.overallGrowthRate,
        healthTrend: plant.growthMetrics.healthTrend
      },
      environmentalRequirements: plant.environmentalRequirements,
      healthAssessment: plant.healthAssessment,
      currentStatus: plant.currentStatus,
      currentHealthScore: plant.currentHealthScore,
      harvestInfo: plant.harvestInfo,
      compliance: plant.compliance,
      version: plant.version || 1
    };

    return document;
  }

  calculatePlantAge(plant) {
    if (!plant.plantingInfo?.plantingDate) return 0;
    const plantingDate = new Date(plant.plantingInfo.plantingDate);
    const now = new Date();
    return Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
  }

  // Placeholder methods for complex operations
  async enrichPlantData(_plantDocument, _options) {
    return {};
  }
  async getRecentTimeSeriesData(_plantId) {
    return {};
  }
  processBatchAnalytics(_analytics, _plants) {
    return {};
  }
  async validatePlantForSave(_plant) {
    /* Validation */
  }
  async saveTimeSeriesData(_plant, _session) {
    /* Time-series handling */
  }
  async createPlantAuditLog(_auditData, _session) {
    /* Audit logging */
  }
  async updatePlantCaches(_plant) {
    /* Cache management */
  }
  calculatePlantChanges(_oldDoc, _newDoc) {
    return {};
  }
  async getHealthTrendsAnalytics(_plantId, _fromDate) {
    return [];
  }
  async getEnvironmentalAnalytics(_plantId, _fromDate) {
    return [];
  }
  async getBatchComparisonAnalytics(_batchId, _plantId) {
    return {};
  }
  calculateGrowthTrends(_timeSeriesData) {
    return {};
  }
  calculateHealthTrends(_healthData) {
    return {};
  }
  calculateEnvironmentalTrends(_environmentalData) {
    return {};
  }
  calculateBenchmarkPosition(_plant, _batchComparison) {
    return 'AVERAGE';
  }
  calculatePerformanceScore(_plant, _timeSeriesData) {
    return 85;
  }
  predictNextMilestone(_plant, _timeSeriesData) {
    return {};
  }
  projectHarvestDate(_plant, _timeSeriesData) {
    return new Date();
  }
  estimateYield(_plant, _timeSeriesData) {
    return 'MEDIUM';
  }
  assessAnalysisQuality(_timeSeriesData) {
    return 'HIGH';
  }
  preparePlantUpdateDocument(update) {
    return update;
  }
  async createBulkAuditLogs(_batch, _session) {
    /* Bulk audit logging */
  }
  async invalidateBulkCaches(_updates) {
    /* Bulk cache invalidation */
  }
  aggregateBulkResults(results) {
    return { modifiedCount: results.length };
  }
  hashOptions(options) {
    return JSON.stringify(options);
  }

  // Cache management methods (inherited from base)
  async getCachedData(_key) {
    return null;
  } // Implement with cache service
  async setCachedData(_key, _data, _ttl) {
    /* Cache implementation */
  }

  // Serialization methods
  serializePlant(plant) {
    return JSON.stringify(plant);
  }
  deserializePlant(data) {
    return JSON.parse(data);
  }
  serializeBatchResult(result) {
    return JSON.stringify(result);
  }
  deserializeBatchResult(data) {
    return JSON.parse(data);
  }
  serializeAnalytics(analytics) {
    return JSON.stringify(analytics);
  }
  deserializeAnalytics(data) {
    return JSON.parse(data);
  }
}

module.exports = PlantRepository;
