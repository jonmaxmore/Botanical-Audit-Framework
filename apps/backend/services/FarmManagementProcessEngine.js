/**
 * 🌱 Farm Management Process Engine
 * ระบบจัดการฟาร์มแบบครบวงจร - Cannabis GACP Specific
 */

const EventEmitter = require('events');

class FarmManagementProcessEngine extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    this.db = dependencies.db || null;
    this.notificationService = dependencies.notificationService || null;

    // Cultivation Cycle Phases
    this.PHASES = {
      PLANNING: 'planning',
      PROPAGATION: 'propagation',
      VEGETATIVE: 'vegetative',
      FLOWERING: 'flowering',
      HARVEST: 'harvest',
      POST_HARVEST: 'post_harvest',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    // SOP Activity Types
    this.ACTIVITY_TYPES = {
      SITE_PREPARATION: 'site_preparation',
      SEED_SELECTION: 'seed_selection',
      PLANTING: 'planting',
      IRRIGATION: 'irrigation',
      FERTILIZATION: 'fertilization',
      PEST_CONTROL: 'pest_control',
      PRUNING: 'pruning',
      MONITORING: 'monitoring',
      HARVESTING: 'harvesting',
      DRYING: 'drying',
      CURING: 'curing',
      QUALITY_TEST: 'quality_test',
      PACKAGING: 'packaging',
    };

    // Compliance Check Points
    this.COMPLIANCE_CHECKPOINTS = {
      SITE_SELECTION: 'site_selection',
      WATER_QUALITY: 'water_quality',
      SOIL_TESTING: 'soil_testing',
      SEED_CERTIFICATION: 'seed_certification',
      INPUT_MATERIALS: 'input_materials',
      PEST_MANAGEMENT: 'pest_management',
      HARVEST_TIMING: 'harvest_timing',
      POST_HARVEST_HANDLING: 'post_harvest_handling',
      STORAGE_CONDITIONS: 'storage_conditions',
      RECORD_KEEPING: 'record_keeping',
    };

    console.log('[FarmManagementProcessEngine] Initialized successfully');
  }

  /**
   * สร้างรอบการเพาะปลูกใหม่
   */
  async createCultivationCycle(cycleData) {
    const cycle = {
      id: this._generateCycleId(),
      ...cycleData,
      phase: this.PHASES.PLANNING,
      startDate: cycleData.startDate || new Date(),
      status: 'active',
      activities: [],
      complianceChecks: [],
      history: [
        {
          phase: this.PHASES.PLANNING,
          timestamp: new Date(),
          note: 'Cultivation cycle created',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate default activities for the cycle
    cycle.plannedActivities = this._generatePlannedActivities(cycle);

    // Save to database
    if (this.db) {
      const collection = this.db.collection('cultivationcycles');
      await collection.insertOne(cycle);
    }

    this.emit('cycle:created', cycle);

    return cycle;
  }

  /**
   * สร้างกิจกรรมตามแผน SOP
   */
  _generatePlannedActivities(cycle) {
    const activities = [];
    let dayOffset = 0;

    // Phase 1: Planning (Days 1-7)
    activities.push(
      this._createPlannedActivity('Site Preparation', this.ACTIVITY_TYPES.SITE_PREPARATION, 1, 3),
      this._createPlannedActivity('Soil Testing', this.ACTIVITY_TYPES.MONITORING, 3, 5),
      this._createPlannedActivity('Seed Selection', this.ACTIVITY_TYPES.SEED_SELECTION, 5, 7)
    );

    // Phase 2: Propagation (Days 7-21)
    activities.push(
      this._createPlannedActivity('Seed Germination', this.ACTIVITY_TYPES.PLANTING, 7, 14),
      this._createPlannedActivity('Seedling Care', this.ACTIVITY_TYPES.IRRIGATION, 14, 21)
    );

    // Phase 3: Vegetative (Days 21-60)
    activities.push(
      this._createPlannedActivity('Transplanting', this.ACTIVITY_TYPES.PLANTING, 21, 23),
      this._createPlannedActivity(
        'Regular Watering',
        this.ACTIVITY_TYPES.IRRIGATION,
        23,
        60,
        'daily'
      ),
      this._createPlannedActivity(
        'Fertilization',
        this.ACTIVITY_TYPES.FERTILIZATION,
        25,
        60,
        'weekly'
      ),
      this._createPlannedActivity(
        'Pest Monitoring',
        this.ACTIVITY_TYPES.PEST_CONTROL,
        25,
        60,
        'weekly'
      ),
      this._createPlannedActivity('Pruning', this.ACTIVITY_TYPES.PRUNING, 35, 50)
    );

    // Phase 4: Flowering (Days 60-120)
    activities.push(
      this._createPlannedActivity('Light Cycle Adjustment', this.ACTIVITY_TYPES.MONITORING, 60, 61),
      this._createPlannedActivity(
        'Bloom Nutrients',
        this.ACTIVITY_TYPES.FERTILIZATION,
        65,
        110,
        'weekly'
      ),
      this._createPlannedActivity(
        'Flower Monitoring',
        this.ACTIVITY_TYPES.MONITORING,
        70,
        120,
        'daily'
      ),
      this._createPlannedActivity(
        'Trichome Inspection',
        this.ACTIVITY_TYPES.MONITORING,
        110,
        120,
        'daily'
      )
    );

    // Phase 5: Harvest (Days 120-130)
    activities.push(
      this._createPlannedActivity(
        'Pre-Harvest Inspection',
        this.ACTIVITY_TYPES.QUALITY_TEST,
        118,
        120
      ),
      this._createPlannedActivity('Harvesting', this.ACTIVITY_TYPES.HARVESTING, 120, 122),
      this._createPlannedActivity('Drying', this.ACTIVITY_TYPES.DRYING, 122, 130),
      this._createPlannedActivity('Curing', this.ACTIVITY_TYPES.CURING, 130, 145),
      this._createPlannedActivity('Quality Testing', this.ACTIVITY_TYPES.QUALITY_TEST, 145, 147),
      this._createPlannedActivity('Packaging', this.ACTIVITY_TYPES.PACKAGING, 147, 150)
    );

    return activities;
  }

  _createPlannedActivity(name, type, startDay, endDay, frequency = 'once') {
    return {
      name,
      type,
      startDay,
      endDay,
      frequency,
      status: 'planned',
      required: true,
    };
  }

  /**
   * บันทึกกิจกรรม SOP
   */
  async recordActivity(cycleId, activityData) {
    const cycle = await this._getCycle(cycleId);

    const activity = {
      id: this._generateActivityId(),
      ...activityData,
      recordedAt: new Date(),
      recordedBy: activityData.userId,
      cyclePhase: cycle.phase,
    };

    // Validate activity for current phase
    await this._validateActivityForPhase(activity, cycle.phase);

    // Add to cycle
    cycle.activities = cycle.activities || [];
    cycle.activities.push(activity);
    cycle.updatedAt = new Date();

    await this._updateCycle(cycle);

    // Check if phase should advance
    await this._checkPhaseCompletion(cycle);

    this.emit('activity:recorded', { cycle, activity });

    return activity;
  }

  /**
   * ตรวจสอบว่ากิจกรรมเหมาะสมกับ Phase หรือไม่
   */
  async _validateActivityForPhase(activity, phase) {
    const validActivities = {
      [this.PHASES.PLANNING]: [
        this.ACTIVITY_TYPES.SITE_PREPARATION,
        this.ACTIVITY_TYPES.SEED_SELECTION,
      ],
      [this.PHASES.PROPAGATION]: [
        this.ACTIVITY_TYPES.PLANTING,
        this.ACTIVITY_TYPES.IRRIGATION,
        this.ACTIVITY_TYPES.MONITORING,
      ],
      [this.PHASES.VEGETATIVE]: [
        this.ACTIVITY_TYPES.IRRIGATION,
        this.ACTIVITY_TYPES.FERTILIZATION,
        this.ACTIVITY_TYPES.PEST_CONTROL,
        this.ACTIVITY_TYPES.PRUNING,
        this.ACTIVITY_TYPES.MONITORING,
      ],
      [this.PHASES.FLOWERING]: [
        this.ACTIVITY_TYPES.IRRIGATION,
        this.ACTIVITY_TYPES.FERTILIZATION,
        this.ACTIVITY_TYPES.MONITORING,
        this.ACTIVITY_TYPES.PEST_CONTROL,
      ],
      [this.PHASES.HARVEST]: [this.ACTIVITY_TYPES.HARVESTING, this.ACTIVITY_TYPES.QUALITY_TEST],
      [this.PHASES.POST_HARVEST]: [
        this.ACTIVITY_TYPES.DRYING,
        this.ACTIVITY_TYPES.CURING,
        this.ACTIVITY_TYPES.QUALITY_TEST,
        this.ACTIVITY_TYPES.PACKAGING,
      ],
    };

    const allowed = validActivities[phase] || [];

    if (!allowed.includes(activity.type)) {
      console.warn(`[Warning] Activity ${activity.type} not typical for phase ${phase}`);
    }

    return true;
  }

  /**
   * ตรวจสอบว่าควรเปลี่ยน Phase หรือไม่
   */
  async _checkPhaseCompletion(cycle) {
    const phaseTransitions = {
      [this.PHASES.PLANNING]: {
        requiredActivities: [
          this.ACTIVITY_TYPES.SITE_PREPARATION,
          this.ACTIVITY_TYPES.SEED_SELECTION,
        ],
        nextPhase: this.PHASES.PROPAGATION,
        minDays: 7,
      },
      [this.PHASES.PROPAGATION]: {
        requiredActivities: [this.ACTIVITY_TYPES.PLANTING],
        nextPhase: this.PHASES.VEGETATIVE,
        minDays: 14,
      },
      [this.PHASES.VEGETATIVE]: {
        requiredActivities: [this.ACTIVITY_TYPES.IRRIGATION, this.ACTIVITY_TYPES.FERTILIZATION],
        nextPhase: this.PHASES.FLOWERING,
        minDays: 30,
      },
      [this.PHASES.FLOWERING]: {
        requiredActivities: [this.ACTIVITY_TYPES.MONITORING],
        nextPhase: this.PHASES.HARVEST,
        minDays: 60,
      },
      [this.PHASES.HARVEST]: {
        requiredActivities: [this.ACTIVITY_TYPES.HARVESTING],
        nextPhase: this.PHASES.POST_HARVEST,
        minDays: 2,
      },
      [this.PHASES.POST_HARVEST]: {
        requiredActivities: [this.ACTIVITY_TYPES.DRYING, this.ACTIVITY_TYPES.QUALITY_TEST],
        nextPhase: this.PHASES.COMPLETED,
        minDays: 20,
      },
    };

    const transition = phaseTransitions[cycle.phase];
    if (!transition) return;

    // Check if required activities completed
    const completedTypes = cycle.activities.map(a => a.type);
    const allRequired = transition.requiredActivities.every(reqType =>
      completedTypes.includes(reqType)
    );

    // Check minimum days
    const daysSinceStart = Math.floor(
      (new Date() - new Date(cycle.startDate)) / (1000 * 60 * 60 * 24)
    );

    if (allRequired && daysSinceStart >= transition.minDays) {
      await this._advancePhase(cycle, transition.nextPhase);
    }
  }

  /**
   * เปลี่ยนไปยัง Phase ถัดไป
   */
  async _advancePhase(cycle, nextPhase) {
    const oldPhase = cycle.phase;
    cycle.phase = nextPhase;
    cycle.updatedAt = new Date();

    cycle.history.push({
      from: oldPhase,
      to: nextPhase,
      timestamp: new Date(),
      note: `Advanced from ${oldPhase} to ${nextPhase}`,
    });

    await this._updateCycle(cycle);

    // Send notification
    if (this.notificationService) {
      await this.notificationService.sendNotification({
        type: 'PHASE_ADVANCED',
        userId: cycle.farmerId,
        data: {
          cycleId: cycle.id,
          oldPhase,
          newPhase: nextPhase,
        },
      });
    }

    this.emit('phase:advanced', { cycle, oldPhase, newPhase: nextPhase });

    return cycle;
  }

  /**
   * บันทึกผลการตรวจสอบความสอดคล้อง (Compliance Check)
   */
  async recordComplianceCheck(cycleId, checkData) {
    const cycle = await this._getCycle(cycleId);

    const complianceCheck = {
      id: this._generateCheckId(),
      ...checkData,
      checkedAt: new Date(),
      checkedBy: checkData.inspectorId,
      cyclePhase: cycle.phase,
    };

    cycle.complianceChecks = cycle.complianceChecks || [];
    cycle.complianceChecks.push(complianceCheck);
    cycle.updatedAt = new Date();

    await this._updateCycle(cycle);

    // Calculate compliance score
    const complianceScore = this._calculateComplianceScore(cycle);
    cycle.complianceScore = complianceScore;

    await this._updateCycle(cycle);

    this.emit('compliance:checked', { cycle, complianceCheck, complianceScore });

    return complianceCheck;
  }

  /**
   * คำนวณคะแนนความสอดคล้อง
   */
  _calculateComplianceScore(cycle) {
    const checks = cycle.complianceChecks || [];

    if (checks.length === 0) {
      return {
        score: 0,
        status: 'pending',
        details: {},
      };
    }

    const totalScore = checks.reduce((sum, check) => sum + (check.score || 0), 0);
    const avgScore = totalScore / checks.length;

    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;

    return {
      score: avgScore,
      totalChecks: checks.length,
      passed,
      failed,
      status: avgScore >= 80 ? 'compliant' : 'non_compliant',
      lastChecked: new Date(),
    };
  }

  /**
   * บันทึกข้อมูลการเก็บเกี่ยว
   */
  async recordHarvest(cycleId, harvestData) {
    const cycle = await this._getCycle(cycleId);

    if (cycle.phase !== this.PHASES.HARVEST && cycle.phase !== this.PHASES.POST_HARVEST) {
      throw new Error(`Cannot record harvest in ${cycle.phase} phase`);
    }

    const harvest = {
      id: this._generateHarvestId(),
      cycleId: cycle.id,
      ...harvestData,
      harvestedAt: new Date(),
      harvestedBy: harvestData.userId,
    };

    // Save to harvest records
    if (this.db) {
      const collection = this.db.collection('harvestrecords');
      await collection.insertOne(harvest);
    }

    // Update cycle
    cycle.harvestRecords = cycle.harvestRecords || [];
    cycle.harvestRecords.push(harvest.id);
    cycle.updatedAt = new Date();

    await this._updateCycle(cycle);

    this.emit('harvest:recorded', { cycle, harvest });

    return harvest;
  }

  /**
   * บันทึกผลการทดสอบคุณภาพ
   */
  async recordQualityTest(cycleId, testData) {
    const cycle = await this._getCycle(cycleId);

    const qualityTest = {
      id: this._generateTestId(),
      cycleId: cycle.id,
      ...testData,
      testedAt: new Date(),
      testedBy: testData.laboratorianId,
    };

    // Save to quality tests
    if (this.db) {
      const collection = this.db.collection('qualitytests');
      await collection.insertOne(qualityTest);
    }

    // Update cycle
    cycle.qualityTests = cycle.qualityTests || [];
    cycle.qualityTests.push(qualityTest.id);
    cycle.updatedAt = new Date();

    await this._updateCycle(cycle);

    this.emit('quality:tested', { cycle, qualityTest });

    return qualityTest;
  }

  /**
   * ปิดรอบการเพาะปลูก
   */
  async completeCycle(cycleId, completionData) {
    const cycle = await this._getCycle(cycleId);

    // Validate completion requirements
    await this._validateCycleCompletion(cycle);

    cycle.phase = this.PHASES.COMPLETED;
    cycle.completedAt = new Date();
    cycle.completionData = completionData;
    cycle.status = 'completed';

    cycle.history.push({
      to: this.PHASES.COMPLETED,
      timestamp: new Date(),
      note: 'Cultivation cycle completed',
    });

    await this._updateCycle(cycle);

    // Generate final report
    const report = await this._generateCycleReport(cycle);

    this.emit('cycle:completed', { cycle, report });

    return { cycle, report };
  }

  /**
   * ตรวจสอบว่าสามารถปิดรอบได้หรือไม่
   */
  async _validateCycleCompletion(cycle) {
    const requirements = {
      harvestRecorded: cycle.harvestRecords && cycle.harvestRecords.length > 0,
      qualityTested: cycle.qualityTests && cycle.qualityTests.length > 0,
      complianceChecked: cycle.complianceChecks && cycle.complianceChecks.length > 0,
      allActivitiesRecorded: cycle.activities && cycle.activities.length >= 10,
    };

    const missing = Object.entries(requirements)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Cannot complete cycle. Missing: ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * สร้างรายงานสรุปรอบการเพาะปลูก
   */
  async _generateCycleReport(cycle) {
    return {
      cycleId: cycle.id,
      farmId: cycle.farmId,
      strain: cycle.strain,
      duration: {
        startDate: cycle.startDate,
        endDate: cycle.completedAt,
        totalDays: Math.floor(
          (new Date(cycle.completedAt) - new Date(cycle.startDate)) / (1000 * 60 * 60 * 24)
        ),
      },
      yield: {
        totalWeight: cycle.harvestRecords?.reduce((sum, h) => sum + (h.weight || 0), 0) || 0,
        quality: cycle.qualityTests?.[0]?.overallQuality || 'unknown',
      },
      compliance: cycle.complianceScore,
      activities: {
        total: cycle.activities?.length || 0,
        byType: this._groupActivitiesByType(cycle.activities),
      },
      generatedAt: new Date(),
    };
  }

  _groupActivitiesByType(activities = []) {
    return activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * ดึงข้อมูล Cycle
   */
  async _getCycle(cycleId) {
    if (this.db) {
      const collection = this.db.collection('cultivationcycles');
      const cycle = await collection.findOne({ id: cycleId });

      if (!cycle) {
        throw new Error(`Cultivation cycle not found: ${cycleId}`);
      }

      return cycle;
    }

    throw new Error('Database not configured');
  }

  /**
   * อัพเดท Cycle
   */
  async _updateCycle(cycle) {
    if (this.db) {
      const collection = this.db.collection('cultivationcycles');
      await collection.updateOne({ id: cycle.id }, { $set: cycle });
    }

    return cycle;
  }

  /**
   * Helper: Generate IDs
   */
  _generateCycleId() {
    return `CYCLE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  _generateActivityId() {
    return `ACT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  _generateCheckId() {
    return `CHK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  _generateHarvestId() {
    return `HRV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  _generateTestId() {
    return `TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}

module.exports = FarmManagementProcessEngine;
