/**
 * Seed Repository Interface - Track & Trace Infrastructure Layer
 *
 * Business Logic & Data Access Pattern:
 * การจัดการข้อมูลเมล็ดพันธุ์และการเข้าถึงข้อมูลอย่างมีประสิทธิภาพ
 *
 * Repository Pattern Implementation:
 * 1. Abstraction Layer → 2. Data Access Methods → 3. Query Optimization →
 * 4. Caching Strategy → 5. Transaction Management → 6. Error Handling
 *
 * Business Rules:
 * - ข้อมูลเมล็ดพันธุ์ต้องมีความสมบูรณ์และสามารถติดตามย้อนกลับได้
 * - การค้นหาข้อมูลต้องรวดเร็วและมีประสิทธิภาพ
 * - รักษาความสมบูรณ์ของข้อมูลและ referential integrity
 * - รองรับการ batch operations สำหรับข้อมูลจำนวนมาก
 * - มีระบบ caching สำหรับข้อมูลที่เข้าถึงบ่อย
 */

class SeedRepository {
  constructor(options = {}) {
    this.database = options.database;
    this.cache = options.cache;
    this.logger = options.logger || console;

    // Collection/table names
    this.collections = {
      seeds: 'seeds',
      seedBatches: 'seed_batches',
      seedSuppliers: 'seed_suppliers',
      seedAuditLogs: 'seed_audit_logs',
      seedQualityTests: 'seed_quality_tests',
    };

    // Index configurations for query optimization
    this.indexConfigurations = {
      // Primary indexes
      seedId: { unique: true, sparse: false },
      batchNumber: { compound: ['batchNumber', 'supplier.supplierId'] },

      // Search indexes
      strain: { text: ['strain.strainName', 'strain.strainType'] },
      supplier: { field: 'supplier.supplierId' },

      // Date range indexes
      harvestDate: { field: 'harvestInfo.harvestDate' },
      expiryDate: { field: 'storageInfo.expiryDate' },

      // Quality indexes
      qualityScore: { field: 'qualityMetrics.overallQualityScore' },

      // Status indexes
      status: { field: 'currentStatus' },
      availability: { field: 'availability.status' },

      // Geospatial indexes (for location-based queries)
      location: { geoSpatial: 'supplier.location' },
    };

    // Cache TTL configurations
    this.cacheTTL = {
      seedDetails: 3600, // 1 hour
      seedBatch: 7200, // 2 hours
      supplierSeeds: 1800, // 30 minutes
      qualityReports: 3600, // 1 hour
      searchResults: 900, // 15 minutes
    };
  }

  /**
   * Business Method: Find seed by ID with complete information
   *
   * Query Strategy:
   * 1. Check cache first for performance
   * 2. Query database with optimized joins
   * 3. Include related data (supplier, quality tests, audit logs)
   * 4. Cache result for future queries
   */
  async findById(seedId) {
    try {
      this.logger.log(`[SeedRepository] Finding seed by ID: ${seedId}`);

      // Step 1: Check cache first
      const cacheKey = `seed:${seedId}`;
      const cachedSeed = await this.getCachedData(cacheKey);

      if (cachedSeed) {
        this.logger.log(`[SeedRepository] Seed found in cache: ${seedId}`);
        return this.deserializeSeed(cachedSeed);
      }

      // Step 2: Query database with optimized projection
      const seedQuery = {
        seedId: seedId,
      };

      const seedDocument = await this.database
        .collection(this.collections.seeds)
        .findOne(seedQuery);

      if (!seedDocument) {
        this.logger.log(`[SeedRepository] Seed not found: ${seedId}`);
        return null;
      }

      // Step 3: Enrich seed data with related information
      const enrichedSeed = await this.enrichSeedData(seedDocument);

      // Step 4: Create seed entity from document
      const seed = this.createSeedFromDocument(enrichedSeed);

      // Step 5: Cache the result
      await this.setCachedData(cacheKey, this.serializeSeed(seed), this.cacheTTL.seedDetails);

      this.logger.log(`[SeedRepository] Seed found and cached: ${seedId}`);
      return seed;
    } catch (error) {
      this.logger.error(`[SeedRepository] Error finding seed by ID ${seedId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Method: Find seeds by batch number
   *
   * Batch Query Strategy:
   * 1. Optimize for batch operations and pagination
   * 2. Include batch-level metadata and statistics
   * 3. Support filtering and sorting options
   * 4. Cache batch results for performance
   */
  async findByBatchNumber(batchNumber, options = {}) {
    try {
      this.logger.log(`[SeedRepository] Finding seeds by batch: ${batchNumber}`);

      // Step 1: Check cache for batch results
      const cacheKey = `seed_batch:${batchNumber}:${this.hashOptions(options)}`;
      const cachedBatch = await this.getCachedData(cacheKey);

      if (cachedBatch) {
        this.logger.log(`[SeedRepository] Seed batch found in cache: ${batchNumber}`);
        return this.deserializeSeedBatch(cachedBatch);
      }

      // Step 2: Build optimized query with options
      const batchQuery = {
        batchNumber: batchNumber,
      };

      // Apply filters if provided
      if (options.supplierId) {
        batchQuery['supplier.supplierId'] = options.supplierId;
      }

      if (options.status) {
        batchQuery.currentStatus = options.status;
      }

      if (options.qualityThreshold) {
        batchQuery['qualityMetrics.overallQualityScore'] = {
          $gte: options.qualityThreshold,
        };
      }

      // Step 3: Execute query with pagination
      const queryOptions = {
        limit: options.limit || 100,
        skip: options.offset || 0,
        sort: options.sort || { createdAt: -1 },
      };

      const [seedDocuments, totalCount] = await Promise.all([
        this.database.collection(this.collections.seeds).find(batchQuery, queryOptions).toArray(),
        this.database.collection(this.collections.seeds).countDocuments(batchQuery),
      ]);

      // Step 4: Enrich seeds with related data
      const enrichedSeeds = await Promise.all(seedDocuments.map(doc => this.enrichSeedData(doc)));

      // Step 5: Create seed entities
      const seeds = enrichedSeeds.map(doc => this.createSeedFromDocument(doc));

      // Step 6: Get batch metadata
      const batchMetadata = await this.getBatchMetadata(batchNumber, seedDocuments);

      // Step 7: Prepare batch result
      const batchResult = {
        batchNumber: batchNumber,
        seeds: seeds,
        metadata: batchMetadata,
        pagination: {
          total: totalCount,
          limit: queryOptions.limit,
          offset: queryOptions.skip,
          hasMore: queryOptions.skip + seeds.length < totalCount,
        },
      };

      // Step 8: Cache batch result
      await this.setCachedData(
        cacheKey,
        this.serializeSeedBatch(batchResult),
        this.cacheTTL.seedBatch
      );

      this.logger.log(`[SeedRepository] Found ${seeds.length} seeds in batch: ${batchNumber}`);
      return batchResult;
    } catch (error) {
      this.logger.error(
        `[SeedRepository] Error finding seeds by batch ${batchNumber}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Business Method: Search seeds with advanced filtering and sorting
   *
   * Search Strategy:
   * 1. Support full-text search on strain and supplier information
   * 2. Advanced filtering by quality, location, date ranges
   * 3. Optimize queries with proper indexing
   * 4. Implement faceted search for better user experience
   */
  async searchSeeds(searchCriteria) {
    try {
      this.logger.log('[SeedRepository] Searching seeds with criteria');

      // Step 1: Check search cache
      const cacheKey = `seed_search:${this.hashSearchCriteria(searchCriteria)}`;
      const cachedResults = await this.getCachedData(cacheKey);

      if (cachedResults) {
        this.logger.log('[SeedRepository] Search results found in cache');
        return this.deserializeSearchResults(cachedResults);
      }

      // Step 2: Build complex search query
      const searchQuery = await this.buildSearchQuery(searchCriteria);

      // Step 3: Execute search with aggregation pipeline for facets
      const aggregationPipeline = [
        { $match: searchQuery },

        // Add computed fields for search ranking
        {
          $addFields: {
            searchScore: {
              $sum: [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: '$strain.strainName',
                        regex: searchCriteria.textQuery || '',
                        options: 'i',
                      },
                    },
                    10,
                    0,
                  ],
                },
                { $cond: [{ $gte: ['$qualityMetrics.overallQualityScore', 80] }, 5, 0] },
                { $cond: [{ $eq: ['$currentStatus', 'AVAILABLE'] }, 3, 0] },
              ],
            },
          },
        },

        // Faceted search for filters
        {
          $facet: {
            // Main search results
            results: [
              { $sort: { searchScore: -1, createdAt: -1 } },
              { $skip: searchCriteria.offset || 0 },
              { $limit: searchCriteria.limit || 50 },
            ],

            // Search facets for filtering
            facets: [
              {
                $group: {
                  _id: null,
                  strainTypes: { $addToSet: '$strain.strainType' },
                  suppliers: {
                    $addToSet: {
                      supplierId: '$supplier.supplierId',
                      supplierName: '$supplier.supplierName',
                    },
                  },
                  qualityRanges: {
                    $push: {
                      $switch: {
                        branches: [
                          {
                            case: { $gte: ['$qualityMetrics.overallQualityScore', 90] },
                            then: 'PREMIUM',
                          },
                          {
                            case: { $gte: ['$qualityMetrics.overallQualityScore', 80] },
                            then: 'HIGH',
                          },
                          {
                            case: { $gte: ['$qualityMetrics.overallQualityScore', 70] },
                            then: 'GOOD',
                          },
                        ],
                        default: 'STANDARD',
                      },
                    },
                  },
                  locations: { $addToSet: '$supplier.location.region' },
                },
              },
            ],

            // Total count for pagination
            totalCount: [{ $count: 'total' }],
          },
        },
      ];

      const searchResults = await this.database
        .collection(this.collections.seeds)
        .aggregate(aggregationPipeline)
        .toArray();

      const results = searchResults[0];

      // Step 4: Enrich search results with related data
      const enrichedResults = await Promise.all(
        results.results.map(doc => this.enrichSeedData(doc))
      );

      // Step 5: Create seed entities from results
      const seeds = enrichedResults.map(doc => this.createSeedFromDocument(doc));

      // Step 6: Prepare search response
      const searchResponse = {
        seeds: seeds,
        facets: results.facets[0] || {},
        pagination: {
          total: results.totalCount[0]?.total || 0,
          limit: searchCriteria.limit || 50,
          offset: searchCriteria.offset || 0,
          hasMore:
            (searchCriteria.offset || 0) + seeds.length < (results.totalCount[0]?.total || 0),
        },
        searchMetadata: {
          query: searchCriteria,
          executionTime: Date.now(),
          resultsFound: seeds.length,
        },
      };

      // Step 7: Cache search results
      await this.setCachedData(
        cacheKey,
        this.serializeSearchResults(searchResponse),
        this.cacheTTL.searchResults
      );

      this.logger.log(`[SeedRepository] Search completed: ${seeds.length} seeds found`);
      return searchResponse;
    } catch (error) {
      this.logger.error(`[SeedRepository] Error searching seeds: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Method: Save seed with transaction support
   *
   * Save Strategy:
   * 1. Validate seed data integrity
   * 2. Use transactions for data consistency
   * 3. Update related collections (audit logs, indexes)
   * 4. Invalidate relevant caches
   * 5. Generate audit trail
   */
  async save(seed) {
    const session = await this.database.startSession();

    try {
      this.logger.log(`[SeedRepository] Saving seed: ${seed.seedId}`);

      await session.withTransaction(async () => {
        // Step 1: Validate seed data
        await this.validateSeedForSave(seed);

        // Step 2: Prepare seed document
        const seedDocument = this.prepareSeedDocument(seed);

        // Step 3: Check for existing seed (upsert logic)
        const existingSeed = await this.database
          .collection(this.collections.seeds)
          .findOne({ seedId: seed.seedId }, { session });

        let savedDocument;

        if (existingSeed) {
          // Update existing seed
          seedDocument.updatedAt = new Date();
          seedDocument.version = (existingSeed.version || 1) + 1;

          const updateResult = await this.database
            .collection(this.collections.seeds)
            .replaceOne({ seedId: seed.seedId }, seedDocument, { session, upsert: false });

          if (updateResult.matchedCount === 0) {
            throw new Error(`Failed to update seed: ${seed.seedId}`);
          }

          savedDocument = seedDocument;
        } else {
          // Insert new seed
          seedDocument.createdAt = new Date();
          seedDocument.updatedAt = new Date();
          seedDocument.version = 1;

          const insertResult = await this.database
            .collection(this.collections.seeds)
            .insertOne(seedDocument, { session });

          if (!insertResult.insertedId) {
            throw new Error(`Failed to insert seed: ${seed.seedId}`);
          }

          savedDocument = seedDocument;
        }

        // Step 4: Update audit log
        await this.createSeedAuditLog(
          {
            seedId: seed.seedId,
            action: existingSeed ? 'UPDATE' : 'CREATE',
            changes: existingSeed
              ? this.calculateChanges(existingSeed, seedDocument)
              : 'INITIAL_CREATE',
            timestamp: new Date(),
            version: seedDocument.version,
          },
          session
        );

        // Step 5: Update search indexes if needed
        await this.updateSearchIndexes(seed, session);
      });

      // Step 6: Invalidate related caches (outside transaction)
      await this.invalidateRelatedCaches(seed);

      // Step 7: Create and return saved seed entity
      const savedSeed = this.createSeedFromDocument(await this.findById(seed.seedId));

      this.logger.log(`[SeedRepository] Seed saved successfully: ${seed.seedId}`);
      return savedSeed;
    } catch (error) {
      this.logger.error(`[SeedRepository] Error saving seed ${seed.seedId}: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Business Method: Update seed with optimistic locking
   *
   * Update Strategy:
   * 1. Implement optimistic locking with version control
   * 2. Track field-level changes for audit
   * 3. Maintain data integrity across related collections
   * 4. Handle concurrent updates gracefully
   */
  async update(seed) {
    const session = await this.database.startSession();

    try {
      this.logger.log(`[SeedRepository] Updating seed: ${seed.seedId}`);

      await session.withTransaction(async () => {
        // Step 1: Get current version for optimistic locking
        const currentSeed = await this.database
          .collection(this.collections.seeds)
          .findOne({ seedId: seed.seedId }, { session });

        if (!currentSeed) {
          throw new Error(`Seed not found for update: ${seed.seedId}`);
        }

        // Step 2: Check version for optimistic locking
        if (seed.version && currentSeed.version !== seed.version) {
          throw new Error(
            `Concurrent modification detected for seed: ${seed.seedId}. Current version: ${currentSeed.version}, provided version: ${seed.version}`
          );
        }

        // Step 3: Prepare update document
        const updateDocument = this.prepareSeedDocument(seed);
        updateDocument.updatedAt = new Date();
        updateDocument.version = currentSeed.version + 1;

        // Step 4: Calculate changes for audit
        const changes = this.calculateChanges(currentSeed, updateDocument);

        // Step 5: Update seed document
        const updateResult = await this.database
          .collection(this.collections.seeds)
          .replaceOne({ seedId: seed.seedId, version: currentSeed.version }, updateDocument, {
            session,
          });

        if (updateResult.matchedCount === 0) {
          throw new Error(`Failed to update seed (version mismatch): ${seed.seedId}`);
        }

        // Step 6: Create audit log for changes
        if (Object.keys(changes).length > 0) {
          await this.createSeedAuditLog(
            {
              seedId: seed.seedId,
              action: 'UPDATE',
              changes: changes,
              timestamp: new Date(),
              version: updateDocument.version,
              previousVersion: currentSeed.version,
            },
            session
          );
        }

        // Step 7: Update related collections if needed
        await this.updateRelatedCollections(seed, changes, session);
      });

      // Step 8: Invalidate caches (outside transaction)
      await this.invalidateRelatedCaches(seed);

      // Step 9: Return updated seed
      const updatedSeed = await this.findById(seed.seedId);

      this.logger.log(`[SeedRepository] Seed updated successfully: ${seed.seedId}`);
      return updatedSeed;
    } catch (error) {
      this.logger.error(`[SeedRepository] Error updating seed ${seed.seedId}: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Business Method: Delete seed with cascade operations
   *
   * Delete Strategy:
   * 1. Check for dependencies before deletion
   * 2. Cascade delete related records (audit logs, quality tests)
   * 3. Maintain referential integrity
   * 4. Create deletion audit trail
   */
  async delete(seedId) {
    const session = await this.database.startSession();

    try {
      this.logger.log(`[SeedRepository] Deleting seed: ${seedId}`);

      await session.withTransaction(async () => {
        // Step 1: Check if seed exists
        const existingSeed = await this.database
          .collection(this.collections.seeds)
          .findOne({ seedId: seedId }, { session });

        if (!existingSeed) {
          throw new Error(`Seed not found for deletion: ${seedId}`);
        }

        // Step 2: Check for dependencies (plants, harvests, etc.)
        const dependencies = await this.checkSeedDependencies(seedId, session);

        if (dependencies.length > 0) {
          throw new Error(
            `Cannot delete seed ${seedId}: has dependencies in ${dependencies.join(', ')}`
          );
        }

        // Step 3: Delete related records in correct order
        await this.deleteRelatedSeedRecords(seedId, session);

        // Step 4: Create final audit log before deletion
        await this.createSeedAuditLog(
          {
            seedId: seedId,
            action: 'DELETE',
            changes: { deletedSeed: existingSeed },
            timestamp: new Date(),
            version: existingSeed.version,
            finalRecord: true,
          },
          session
        );

        // Step 5: Delete the seed document
        const deleteResult = await this.database
          .collection(this.collections.seeds)
          .deleteOne({ seedId: seedId }, { session });

        if (deleteResult.deletedCount === 0) {
          throw new Error(`Failed to delete seed: ${seedId}`);
        }
      });

      // Step 6: Invalidate all related caches
      await this.invalidateAllSeedCaches(seedId);

      this.logger.log(`[SeedRepository] Seed deleted successfully: ${seedId}`);
      return true;
    } catch (error) {
      this.logger.error(`[SeedRepository] Error deleting seed ${seedId}: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Helper methods for data transformation and entity creation

  /**
   * Create seed entity from database document
   */
  createSeedFromDocument(document) {
    if (!document) return null;

    const SeedEntity = require('../domain/entities/Seed');

    return new SeedEntity({
      seedId: document.seedId,
      batchNumber: document.batchNumber,
      strain: document.strain,
      supplier: document.supplier,
      harvestInfo: document.harvestInfo,
      qualityMetrics: document.qualityMetrics,
      storageInfo: document.storageInfo,
      plantingHistory: document.plantingHistory || [],
      availability: document.availability,
      currentStatus: document.currentStatus,
      compliance: document.compliance,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      version: document.version,
    });
  }

  /**
   * Prepare database document from seed entity
   */
  prepareSeedDocument(seed) {
    return {
      seedId: seed.seedId,
      batchNumber: seed.batchNumber,
      strain: seed.strain,
      supplier: seed.supplier,
      harvestInfo: seed.harvestInfo,
      qualityMetrics: seed.qualityMetrics,
      storageInfo: seed.storageInfo,
      plantingHistory: seed.plantingHistory || [],
      availability: seed.availability,
      currentStatus: seed.currentStatus,
      compliance: seed.compliance,
      version: seed.version || 1,
    };
  }

  // Placeholder methods for complex operations
  async enrichSeedData(seedDocument) {
    return seedDocument;
  }
  async getBatchMetadata(batchNumber, seedDocuments) {
    return {};
  }
  async buildSearchQuery(searchCriteria) {
    return {};
  }
  async validateSeedForSave(seed) {
    /* Validation */
  }
  async createSeedAuditLog(auditData, session) {
    /* Audit logging */
  }
  async updateSearchIndexes(seed, session) {
    /* Index updates */
  }
  async updateRelatedCollections(seed, changes, session) {
    /* Related updates */
  }
  async checkSeedDependencies(seedId, session) {
    return [];
  }
  async deleteRelatedSeedRecords(seedId, session) {
    /* Cleanup */
  }
  calculateChanges(oldDoc, newDoc) {
    return {};
  }
  hashOptions(options) {
    return JSON.stringify(options);
  }
  hashSearchCriteria(criteria) {
    return JSON.stringify(criteria);
  }

  // Cache management methods
  async getCachedData(key) {
    if (!this.cache) return null;
    try {
      return await this.cache.get(key);
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async setCachedData(key, data, ttl) {
    if (!this.cache) return;
    try {
      await this.cache.set(key, data, ttl);
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}: ${error.message}`);
    }
  }

  async invalidateRelatedCaches(seed) {
    if (!this.cache) return;

    const keysToInvalidate = [
      `seed:${seed.seedId}`,
      `seed_batch:${seed.batchNumber}*`,
      'seed_search:*',
      `supplier_seeds:${seed.supplier.supplierId}*`,
    ];

    await Promise.all(
      keysToInvalidate.map(key =>
        this.cache
          .del(key)
          .catch(err => this.logger.warn(`Cache invalidation error for ${key}: ${err.message}`))
      )
    );
  }

  async invalidateAllSeedCaches(seedId) {
    if (!this.cache) return;

    try {
      await this.cache.flushPattern('seed*');
    } catch (error) {
      this.logger.warn(`Cache flush error: ${error.message}`);
    }
  }

  // Serialization methods for caching
  serializeSeed(seed) {
    return JSON.stringify(seed);
  }
  deserializeSeed(data) {
    return JSON.parse(data);
  }
  serializeSeedBatch(batch) {
    return JSON.stringify(batch);
  }
  deserializeSeedBatch(data) {
    return JSON.parse(data);
  }
  serializeSearchResults(results) {
    return JSON.stringify(results);
  }
  deserializeSearchResults(data) {
    return JSON.parse(data);
  }
}

module.exports = SeedRepository;
