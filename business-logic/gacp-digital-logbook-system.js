/**
 * 📔 GACP Digital Logbook System
 * ระบบสมุดบันทึกดิจิทัลครอบคลุม GACP 14 ข้อกำหนด
 * พร้อม Batch Tracking และ Traceability แบบสมบูรณ์
 *
 * ครอบคลุม:
 * - GACP 14 Requirements Compliance
 * - Batch Number Generation & Tracking
 * - Full Traceability (Seed to Sale)
 * - Immutable Audit Trail
 * - Document Management
 * - QR Code Generation
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// GACP 14 Requirements Mapping
const GACP_REQUIREMENTS = {
  // 1. การประกันคุณภาพ (Quality Assurance)
  QUALITY_ASSURANCE: {
    id: 'QA',
    name: 'การประกันคุณภาพ',
    description: 'บันทึกมาตรการควบคุมการผลิตในแต่ละขั้นตอน',
    logTypes: ['quality_control', 'process_monitoring', 'batch_testing'],
    required: true,
  },

  // 2. สุขลักษณะส่วนบุคคล (Personal Hygiene)
  PERSONAL_HYGIENE: {
    id: 'PH',
    name: 'สุขลักษณะส่วนบุคคล',
    description: 'บันทึกการฝึกอบรมพนักงานและการตรวจสุขภาพ',
    logTypes: ['staff_training', 'health_checkup', 'hygiene_compliance'],
    required: true,
  },

  // 3. บันทึกเอกสาร (Documentation)
  DOCUMENTATION: {
    id: 'DOC',
    name: 'บันทึกเอกสาร',
    description: 'สมุดบันทึกหลักสำหรับกิจกรรมทั้งหมด',
    logTypes: ['daily_activities', 'batch_records', 'document_control'],
    required: true,
  },

  // 4. อุปกรณ์ (Equipment)
  EQUIPMENT: {
    id: 'EQ',
    name: 'อุปกรณ์',
    description: 'บันทึกการดูแลรักษาและสอบเทียบอุปกรณ์',
    logTypes: ['equipment_maintenance', 'calibration', 'cleaning_schedule'],
    required: true,
  },

  // 5. พื้นที่ปลูก (Site)
  SITE: {
    id: 'SITE',
    name: 'พื้นที่ปลูก',
    description: 'บันทึกผลการวิเคราะห์ดินและการจัดการพื้นที่',
    logTypes: ['soil_analysis', 'site_management', 'environmental_monitoring'],
    required: true,
  },

  // 6. น้ำ (Water)
  WATER: {
    id: 'WATER',
    name: 'น้ำ',
    description: 'บันทึกคุณภาพน้ำและการใช้น้ำ',
    logTypes: ['water_quality', 'irrigation', 'water_usage'],
    required: true,
  },

  // 7. ปุ๋ย (Fertilizer)
  FERTILIZER: {
    id: 'FERT',
    name: 'ปุ๋ย',
    description: 'บันทึกการใช้ปุ๋ยและสารอินทรีย์',
    logTypes: ['fertilizer_usage', 'organic_inputs', 'nutrient_management'],
    required: true,
  },

  // 8. เมล็ดพันธุ์และส่วนขยายพันธุ์ (Seeds & Propagation)
  SEEDS: {
    id: 'SEED',
    name: 'เมล็ดพันธุ์',
    description: 'บันทึกแหล่งที่มาและคุณภาพพันธุ์',
    logTypes: ['seed_source', 'propagation', 'variety_records'],
    required: true,
  },

  // 9. การเพาะปลูก (Cultivation)
  CULTIVATION: {
    id: 'CULT',
    name: 'การเพาะปลูก',
    description: 'บันทึกกิจกรรมการปลูกและ IPM',
    logTypes: ['planting', 'crop_care', 'ipm_activities'],
    required: true,
  },

  // 10. การเก็บเกี่ยว (Harvesting)
  HARVESTING: {
    id: 'HARV',
    name: 'การเก็บเกี่ยว',
    description: 'บันทึกการเก็บเกี่ยวและ Batch Number',
    logTypes: ['harvest_record', 'batch_creation', 'yield_tracking'],
    required: true,
  },

  // 11. กระบวนการแปรรูปเบื้องต้น (Primary Processing)
  PROCESSING: {
    id: 'PROC',
    name: 'การแปรรูป',
    description: 'บันทึกขั้นตอนการแปรรูปและควบคุมคุณภาพ',
    logTypes: ['drying', 'curing', 'processing_control'],
    required: true,
  },

  // 12. สถานที่ (Premises)
  PREMISES: {
    id: 'PREM',
    name: 'สถานที่',
    description: 'บันทึกการดูแลรักษาสถานที่และความสะอาด',
    logTypes: ['facility_maintenance', 'cleaning', 'security'],
    required: true,
  },

  // 13. การบรรจุและการติดฉลาก (Packaging & Labeling)
  PACKAGING: {
    id: 'PACK',
    name: 'การบรรจุและฉลาก',
    description: 'บันทึกการบรรจุและสร้างฉลากสินค้า',
    logTypes: ['packaging', 'labeling', 'product_coding'],
    required: true,
  },

  // 14. การจัดเก็บและการขนย้าย (Storage & Transportation)
  STORAGE: {
    id: 'STOR',
    name: 'การจัดเก็บและขนส่ง',
    description: 'บันทึกสภาพแวดล้อมการเก็บและการขนส่ง',
    logTypes: ['storage_conditions', 'inventory', 'transportation'],
    required: true,
  },
};

// Batch Management System
class BatchManager {
  constructor() {
    this.batches = new Map();
    this.batchSequence = 1;
  }

  /**
   * สร้าง Batch Number ใหม่
   */
  generateBatchNumber(farmId, plantVariety, harvestDate) {
    const year = harvestDate.getFullYear() + 543; // Buddhist year
    const month = String(harvestDate.getMonth() + 1).padStart(2, '0');
    const day = String(harvestDate.getDate()).padStart(2, '0');

    const sequence = String(this.batchSequence++).padStart(4, '0');
    const varietyCode = this.getVarietyCode(plantVariety);

    return `GACP-${farmId}-${varietyCode}-${year}${month}${day}-${sequence}`;
  }

  /**
   * สร้างรหัสพันธุ์
   */
  getVarietyCode(variety) {
    const varietyMap = {
      indica: 'IND',
      sativa: 'SAT',
      hybrid: 'HYB',
      ruderalis: 'RUD',
    };

    return varietyMap[variety.toLowerCase()] || 'UNK';
  }

  /**
   * สร้าง Batch ใหม่
   */
  async createBatch(farmId, batchData) {
    const batchId = uuidv4();
    const batchNumber = this.generateBatchNumber(
      farmId,
      batchData.plantVariety,
      batchData.harvestDate,
    );

    const batch = {
      id: batchId,
      batchNumber,
      farmId,
      status: 'active',

      // Plant Information
      plantVariety: batchData.plantVariety,
      seedSource: batchData.seedSource,
      plantingDate: batchData.plantingDate,
      harvestDate: batchData.harvestDate,

      // Cultivation Details
      cultivationArea: batchData.cultivationArea,
      plantQuantity: batchData.plantQuantity,
      cultivationType: batchData.cultivationType,

      // Harvest Information
      yieldAmount: batchData.yieldAmount,
      harvestMethod: batchData.harvestMethod,
      harvestWeather: batchData.harvestWeather,

      // Processing Information
      dryingMethod: batchData.dryingMethod,
      dryingDuration: batchData.dryingDuration,
      finalMoisture: batchData.finalMoisture,

      // Quality Control
      qualityTests: [],
      labResults: [],

      // Traceability
      traceabilityChain: [],
      qrCode: null,

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: batchData.createdBy,
    };

    // Generate QR Code for traceability
    batch.qrCode = await this.generateBatchQRCode(batch);

    // Add to traceability chain
    batch.traceabilityChain.push({
      stage: 'batch_created',
      timestamp: new Date(),
      actor: batchData.createdBy,
      location: batchData.location,
      data: {
        batchNumber,
        plantVariety: batchData.plantVariety,
        harvestDate: batchData.harvestDate,
      },
    });

    this.batches.set(batchId, batch);

    console.log(`📦 Batch created: ${batchNumber}`);
    return batch;
  }

  /**
   * สร้าง QR Code สำหรับ Batch
   */
  async generateBatchQRCode(batch) {
    const qrData = {
      type: 'GACP_BATCH',
      batchNumber: batch.batchNumber,
      farmId: batch.farmId,
      variety: batch.plantVariety,
      harvestDate: batch.harvestDate.toISOString(),
      verificationUrl: `https://gacp-platform.com/verify/${batch.batchNumber}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      return {
        data: qrData,
        imageUrl: qrCodeUrl,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  }

  /**
   * อัปเดต Batch
   */
  async updateBatch(batchId, updates, actor) {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    // Update batch data
    Object.assign(batch, updates);
    batch.updatedAt = new Date();

    // Add to traceability chain
    batch.traceabilityChain.push({
      stage: 'batch_updated',
      timestamp: new Date(),
      actor,
      updates: Object.keys(updates),
      data: updates,
    });

    this.batches.set(batchId, batch);

    console.log(`📦 Batch updated: ${batch.batchNumber}`);
    return batch;
  }

  /**
   * ดึงข้อมูล Batch
   */
  getBatch(batchId) {
    return this.batches.get(batchId);
  }

  /**
   * ค้นหา Batch ด้วย Batch Number
   */
  getBatchByNumber(batchNumber) {
    for (const batch of this.batches.values()) {
      if (batch.batchNumber === batchNumber) {
        return batch;
      }
    }
    return null;
  }

  /**
   * ดึง Batches ทั้งหมดของฟาร์ม
   */
  getFarmBatches(farmId) {
    const farmBatches = [];
    for (const batch of this.batches.values()) {
      if (batch.farmId === farmId) {
        farmBatches.push(batch);
      }
    }
    return farmBatches.sort((a, b) => b.createdAt - a.createdAt);
  }
}

// Digital Logbook System
class GACPDigitalLogbook extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.logs = new Map(); // In-memory storage if no database
    this.batchManager = new BatchManager();
    this.logSequence = 1;

    console.log('📔 GACP Digital Logbook System initialized');
  }

  /**
   * สร้างรายการบันทึกใหม่
   */
  async createLogEntry(farmId, logData) {
    const logId = uuidv4();
    const logNumber = this.generateLogNumber(logData.requirement, farmId);

    const logEntry = {
      id: logId,
      logNumber,
      farmId,

      // GACP Requirement Classification
      requirement: logData.requirement, // From GACP_REQUIREMENTS
      logType: logData.logType,

      // Basic Information
      title: logData.title,
      description: logData.description,
      date: logData.date || new Date(),

      // Personnel
      recordedBy: logData.recordedBy,
      approvedBy: logData.approvedBy,
      witnesses: logData.witnesses || [],

      // Location & Batch
      location: logData.location,
      batchNumber: logData.batchNumber,
      plotNumber: logData.plotNumber,

      // Data Fields (flexible for different log types)
      data: logData.data || {},

      // Attachments
      photos: logData.photos || [],
      documents: logData.documents || [],

      // Quality Control
      qcStatus: logData.qcStatus || 'pending',
      qcNotes: logData.qcNotes || '',

      // Compliance
      complianceStatus: 'compliant', // Will be validated
      nonComplianceReason: null,
      correctiveActions: [],

      // Audit Trail
      revisions: [],

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      isImmutable: false, // Will be set to true after approval
    };

    // Validate compliance
    const complianceCheck = await this.validateCompliance(logEntry);
    logEntry.complianceStatus = complianceCheck.status;
    if (!complianceCheck.compliant) {
      logEntry.nonComplianceReason = complianceCheck.reason;
    }

    // Save to storage
    if (this.db) {
      await this.db.collection('gacp_logs').insertOne(logEntry);
    } else {
      this.logs.set(logId, logEntry);
    }

    // Emit event
    this.emit('log_entry_created', logEntry);

    console.log(`📝 Log entry created: ${logNumber} (${logData.requirement})`);
    return logEntry;
  }

  /**
   * สร้างหมายเลขบันทึก
   */
  generateLogNumber(requirement, farmId) {
    const date = new Date();
    const year = date.getFullYear() + 543; // Buddhist year
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const requirementCode = GACP_REQUIREMENTS[requirement]?.id || 'GEN';
    const sequence = String(this.logSequence++).padStart(3, '0');

    return `LOG-${farmId}-${requirementCode}-${year}${month}${day}-${sequence}`;
  }

  /**
   * ตรวจสอบการปฏิบัติตามข้อกำหนด GACP
   */
  async validateCompliance(logEntry) {
    const requirement = GACP_REQUIREMENTS[logEntry.requirement];

    if (!requirement) {
      return {
        compliant: false,
        status: 'non-compliant',
        reason: 'ไม่พบข้อกำหนด GACP ที่ระบุ',
      };
    }

    // Basic validation rules
    const validationRules = {
      // Documentation requirements
      DOC: () => {
        return logEntry.data && logEntry.recordedBy && logEntry.date;
      },

      // Quality assurance requirements
      QA: () => {
        return logEntry.data.qualityMetrics && logEntry.approvedBy;
      },

      // Harvesting requirements
      HARV: () => {
        return logEntry.batchNumber && logEntry.data.yieldAmount && logEntry.data.harvestConditions;
      },

      // Water quality requirements
      WATER: () => {
        return logEntry.data.waterSource && logEntry.data.qualityParameters;
      },

      // Fertilizer usage requirements
      FERT: () => {
        return (
          logEntry.data.fertilizerType &&
          logEntry.data.applicationRate &&
          logEntry.data.registrationNumber
        );
      },
    };

    const validator = validationRules[requirement.id];
    if (validator && !validator()) {
      return {
        compliant: false,
        status: 'non-compliant',
        reason: `ข้อมูลไม่ครบถ้วนตามข้อกำหนด ${requirement.name}`,
      };
    }

    return {
      compliant: true,
      status: 'compliant',
      reason: null,
    };
  }

  /**
   * บันทึกการปลูก (Planting Log)
   */
  async recordPlantingActivity(farmId, plantingData) {
    const logData = {
      requirement: 'CULTIVATION',
      logType: 'planting',
      title: `บันทึกการปลูก - แปลง ${plantingData.plotNumber}`,
      description: `ปลูกพันธุ์ ${plantingData.variety} จำนวน ${plantingData.quantity} ต้น`,
      date: plantingData.plantingDate,
      recordedBy: plantingData.recordedBy,
      location: plantingData.location,
      plotNumber: plantingData.plotNumber,
      data: {
        variety: plantingData.variety,
        seedSource: plantingData.seedSource,
        seedLotNumber: plantingData.seedLotNumber,
        quantity: plantingData.quantity,
        plantingDensity: plantingData.plantingDensity,
        soilConditions: plantingData.soilConditions,
        weatherConditions: plantingData.weatherConditions,
        plantingMethod: plantingData.plantingMethod,
        spacingDistance: plantingData.spacingDistance,
      },
      photos: plantingData.photos || [],
    };

    return await this.createLogEntry(farmId, logData);
  }

  /**
   * บันทึกการให้น้ำ (Irrigation Log)
   */
  async recordIrrigationActivity(farmId, irrigationData) {
    const logData = {
      requirement: 'WATER',
      logType: 'irrigation',
      title: `บันทึกการให้น้ำ - แปลง ${irrigationData.plotNumber}`,
      description: `ให้น้ำปริมาณ ${irrigationData.waterAmount} ลิตร`,
      date: irrigationData.irrigationDate,
      recordedBy: irrigationData.recordedBy,
      location: irrigationData.location,
      plotNumber: irrigationData.plotNumber,
      data: {
        waterSource: irrigationData.waterSource,
        waterAmount: irrigationData.waterAmount,
        irrigationDuration: irrigationData.irrigationDuration,
        irrigationMethod: irrigationData.irrigationMethod,
        waterQuality: irrigationData.waterQuality,
        pH: irrigationData.pH,
        EC: irrigationData.EC,
        qualityParameters: irrigationData.qualityParameters,
      },
    };

    return await this.createLogEntry(farmId, logData);
  }

  /**
   * บันทึกการใช้ปุ๋ย (Fertilizer Application Log)
   */
  async recordFertilizerApplication(farmId, fertilizerData) {
    const logData = {
      requirement: 'FERTILIZER',
      logType: 'fertilizer_usage',
      title: `บันทึกการใช้ปุ๋ย - ${fertilizerData.fertilizerName}`,
      description: `ใช้ ${fertilizerData.fertilizerName} อัตรา ${fertilizerData.applicationRate}`,
      date: fertilizerData.applicationDate,
      recordedBy: fertilizerData.recordedBy,
      location: fertilizerData.location,
      plotNumber: fertilizerData.plotNumber,
      data: {
        fertilizerName: fertilizerData.fertilizerName,
        fertilizerType: fertilizerData.fertilizerType,
        registrationNumber: fertilizerData.registrationNumber,
        manufacturer: fertilizerData.manufacturer,
        batchNumber: fertilizerData.batchNumber,
        applicationRate: fertilizerData.applicationRate,
        applicationMethod: fertilizerData.applicationMethod,
        targetCrop: fertilizerData.targetCrop,
        cropStage: fertilizerData.cropStage,
        weatherConditions: fertilizerData.weatherConditions,
      },
      documents: fertilizerData.registrationDocuments || [],
    };

    return await this.createLogEntry(farmId, logData);
  }

  /**
   * บันทึกการควบคุมศัตรูพืช (IPM Log)
   */
  async recordIPMActivity(farmId, ipmData) {
    const logData = {
      requirement: 'CULTIVATION',
      logType: 'ipm_activities',
      title: `บันทึก IPM - ${ipmData.treatmentType}`,
      description: `จัดการ ${ipmData.pestType} ด้วย ${ipmData.treatmentMethod}`,
      date: ipmData.treatmentDate,
      recordedBy: ipmData.recordedBy,
      location: ipmData.location,
      plotNumber: ipmData.plotNumber,
      data: {
        pestType: ipmData.pestType,
        pestPressure: ipmData.pestPressure,
        treatmentType: ipmData.treatmentType,
        treatmentMethod: ipmData.treatmentMethod,
        biologicalAgent: ipmData.biologicalAgent,
        organicSubstance: ipmData.organicSubstance,
        applicationRate: ipmData.applicationRate,
        safetyPeriod: ipmData.safetyPeriod,
        effectivenessRating: ipmData.effectivenessRating,
      },
      photos: ipmData.photos || [],
    };

    return await this.createLogEntry(farmId, logData);
  }

  /**
   * บันทึกการเก็บเกี่ยว (Harvest Log) พร้อมสร้าง Batch
   */
  async recordHarvestActivity(farmId, harvestData) {
    // Create batch first
    const batch = await this.batchManager.createBatch(farmId, {
      plantVariety: harvestData.variety,
      seedSource: harvestData.seedSource,
      plantingDate: harvestData.plantingDate,
      harvestDate: harvestData.harvestDate,
      cultivationArea: harvestData.cultivationArea,
      plantQuantity: harvestData.plantQuantity,
      cultivationType: harvestData.cultivationType,
      yieldAmount: harvestData.yieldAmount,
      harvestMethod: harvestData.harvestMethod,
      harvestWeather: harvestData.weatherConditions,
      createdBy: harvestData.recordedBy,
      location: harvestData.location,
    });

    // Create harvest log
    const logData = {
      requirement: 'HARVESTING',
      logType: 'harvest_record',
      title: `บันทึกการเก็บเกี่ยว - Batch ${batch.batchNumber}`,
      description: `เก็บเกี่ยวได้ปริมาณ ${harvestData.yieldAmount} ${harvestData.yieldUnit}`,
      date: harvestData.harvestDate,
      recordedBy: harvestData.recordedBy,
      location: harvestData.location,
      batchNumber: batch.batchNumber,
      plotNumber: harvestData.plotNumber,
      data: {
        batchNumber: batch.batchNumber,
        variety: harvestData.variety,
        yieldAmount: harvestData.yieldAmount,
        yieldUnit: harvestData.yieldUnit,
        harvestMethod: harvestData.harvestMethod,
        harvestConditions: {
          weather: harvestData.weatherConditions,
          temperature: harvestData.temperature,
          humidity: harvestData.humidity,
          timeOfDay: harvestData.timeOfDay,
        },
        qualityObservations: harvestData.qualityObservations,
        plantHealth: harvestData.plantHealth,
        maturityLevel: harvestData.maturityLevel,
      },
      photos: harvestData.photos || [],
    };

    const harvestLog = await this.createLogEntry(farmId, logData);

    // Link harvest log to batch
    await this.batchManager.updateBatch(
      batch.id,
      {
        harvestLogId: harvestLog.id,
      },
      harvestData.recordedBy,
    );

    return {
      harvestLog,
      batch,
    };
  }

  /**
   * บันทึกการแปรรูป (Processing Log)
   */
  async recordProcessingActivity(farmId, processingData) {
    const logData = {
      requirement: 'PROCESSING',
      logType: 'drying',
      title: `บันทึกการแปรรูป - Batch ${processingData.batchNumber}`,
      description: `แปรรูปด้วยวิธี ${processingData.processingMethod}`,
      date: processingData.processingDate,
      recordedBy: processingData.recordedBy,
      batchNumber: processingData.batchNumber,
      data: {
        processingMethod: processingData.processingMethod,
        temperature: processingData.temperature,
        humidity: processingData.humidity,
        duration: processingData.duration,
        initialMoisture: processingData.initialMoisture,
        finalMoisture: processingData.finalMoisture,
        qualityParameters: processingData.qualityParameters,
        yieldLoss: processingData.yieldLoss,
      },
    };

    const processingLog = await this.createLogEntry(farmId, logData);

    // Update batch with processing information
    if (processingData.batchNumber) {
      const batch = this.batchManager.getBatchByNumber(processingData.batchNumber);
      if (batch) {
        await this.batchManager.updateBatch(
          batch.id,
          {
            processingLogId: processingLog.id,
            dryingMethod: processingData.processingMethod,
            dryingDuration: processingData.duration,
            finalMoisture: processingData.finalMoisture,
          },
          processingData.recordedBy,
        );
      }
    }

    return processingLog;
  }

  /**
   * บันทึกการบรรจุและติดฉลาก (Packaging Log)
   */
  async recordPackagingActivity(farmId, packagingData) {
    const logData = {
      requirement: 'PACKAGING',
      logType: 'packaging',
      title: `บันทึกการบรรจุ - Batch ${packagingData.batchNumber}`,
      description: `บรรจุในภาชนะ ${packagingData.containerType}`,
      date: packagingData.packagingDate,
      recordedBy: packagingData.recordedBy,
      batchNumber: packagingData.batchNumber,
      data: {
        containerType: packagingData.containerType,
        containerSize: packagingData.containerSize,
        totalContainers: packagingData.totalContainers,
        netWeight: packagingData.netWeight,
        labelInformation: {
          productName: packagingData.productName,
          batchNumber: packagingData.batchNumber,
          harvestDate: packagingData.harvestDate,
          packagingDate: packagingData.packagingDate,
          expiryDate: packagingData.expiryDate,
          storageInstructions: packagingData.storageInstructions,
        },
        qrCodes: packagingData.qrCodes || [],
      },
    };

    return await this.createLogEntry(farmId, logData);
  }

  /**
   * ดึงรายการบันทึกตามข้อกำหนด GACP
   */
  async getLogsByRequirement(farmId, requirement, startDate = null, endDate = null) {
    const logs = [];

    for (const log of this.logs.values()) {
      if (log.farmId === farmId && log.requirement === requirement) {
        // Date filter
        if (startDate && log.date < startDate) continue;
        if (endDate && log.date > endDate) continue;

        logs.push(log);
      }
    }

    return logs.sort((a, b) => b.date - a.date);
  }

  /**
   * ดึงรายการบันทึกของ Batch
   */
  async getBatchLogs(batchNumber) {
    const logs = [];

    for (const log of this.logs.values()) {
      if (log.batchNumber === batchNumber) {
        logs.push(log);
      }
    }

    return logs.sort((a, b) => a.date - b.date);
  }

  /**
   * สร้างรายงาน Traceability
   */
  async generateTraceabilityReport(batchNumber) {
    const batch = this.batchManager.getBatchByNumber(batchNumber);
    if (!batch) {
      throw new Error(`Batch not found: ${batchNumber}`);
    }

    const batchLogs = await this.getBatchLogs(batchNumber);

    const traceabilityReport = {
      batchInfo: {
        batchNumber: batch.batchNumber,
        farmId: batch.farmId,
        variety: batch.plantVariety,
        harvestDate: batch.harvestDate,
        yieldAmount: batch.yieldAmount,
      },

      seedToSaleChain: [
        {
          stage: 'seed_source',
          date: batch.plantingDate,
          description: `เมล็ดพันธุ์จาก: ${batch.seedSource}`,
          logs: batchLogs.filter(log => log.requirement === 'SEEDS'),
        },
        {
          stage: 'planting',
          date: batch.plantingDate,
          description: `ปลูกพันธุ์ ${batch.plantVariety}`,
          logs: batchLogs.filter(log => log.logType === 'planting'),
        },
        {
          stage: 'cultivation',
          description: 'การดูแลรักษา',
          logs: batchLogs.filter(log =>
            ['irrigation', 'fertilizer_usage', 'ipm_activities'].includes(log.logType),
          ),
        },
        {
          stage: 'harvesting',
          date: batch.harvestDate,
          description: 'การเก็บเกี่ยว',
          logs: batchLogs.filter(log => log.logType === 'harvest_record'),
        },
        {
          stage: 'processing',
          description: 'การแปรรูป',
          logs: batchLogs.filter(log => log.requirement === 'PROCESSING'),
        },
        {
          stage: 'packaging',
          description: 'การบรรจุ',
          logs: batchLogs.filter(log => log.requirement === 'PACKAGING'),
        },
      ],

      complianceStatus: this.checkBatchCompliance(batchLogs),
      qrCode: batch.qrCode,
      generatedAt: new Date(),
    };

    return traceabilityReport;
  }

  /**
   * ตรวจสอบการปฏิบัติตามข้อกำหนดของ Batch
   */
  checkBatchCompliance(batchLogs) {
    const requiredRequirements = ['CULTIVATION', 'WATER', 'FERTILIZER', 'HARVESTING', 'PROCESSING'];

    const compliance = {
      overall: 'compliant',
      details: {},
      score: 0,
    };

    for (const req of requiredRequirements) {
      const reqLogs = batchLogs.filter(log => log.requirement === req);
      const compliantLogs = reqLogs.filter(log => log.complianceStatus === 'compliant');

      compliance.details[req] = {
        required: true,
        totalLogs: reqLogs.length,
        compliantLogs: compliantLogs.length,
        status: compliantLogs.length > 0 ? 'compliant' : 'non-compliant',
      };

      if (compliantLogs.length === 0) {
        compliance.overall = 'non-compliant';
      }
    }

    // Calculate compliance score
    const totalCategories = Object.keys(compliance.details).length;
    const compliantCategories = Object.values(compliance.details).filter(
      detail => detail.status === 'compliant',
    ).length;

    compliance.score = (compliantCategories / totalCategories) * 100;

    return compliance;
  }

  /**
   * ค้นหาบันทึกด้วย QR Code
   */
  async verifyByQRCode(qrData) {
    if (qrData.type === 'GACP_BATCH') {
      const batch = this.batchManager.getBatchByNumber(qrData.batchNumber);
      if (batch) {
        const traceabilityReport = await this.generateTraceabilityReport(qrData.batchNumber);
        return {
          verified: true,
          type: 'batch',
          data: traceabilityReport,
        };
      }
    }

    return {
      verified: false,
      error: 'ไม่พบข้อมูลที่ตรงกับ QR Code',
    };
  }

  /**
   * สร้างรายงานสรุป GACP 14 ข้อ
   */
  async generateGACPComplianceReport(farmId, startDate, endDate) {
    const report = {
      farmId,
      reportPeriod: { startDate, endDate },
      requirements: {},
      overallCompliance: 'compliant',
      complianceScore: 0,
      generatedAt: new Date(),
    };

    let totalScore = 0;
    let maxScore = 0;

    for (const [reqKey, requirement] of Object.entries(GACP_REQUIREMENTS)) {
      const logs = await this.getLogsByRequirement(farmId, reqKey, startDate, endDate);
      const compliantLogs = logs.filter(log => log.complianceStatus === 'compliant');

      const reqReport = {
        name: requirement.name,
        description: requirement.description,
        required: requirement.required,
        totalLogs: logs.length,
        compliantLogs: compliantLogs.length,
        nonCompliantLogs: logs.length - compliantLogs.length,
        status: compliantLogs.length > 0 ? 'compliant' : 'non-compliant',
        score: logs.length > 0 ? (compliantLogs.length / logs.length) * 100 : 0,
        recentLogs: logs.slice(0, 5), // Latest 5 logs
      };

      report.requirements[reqKey] = reqReport;

      if (requirement.required && reqReport.status === 'non-compliant') {
        report.overallCompliance = 'non-compliant';
      }

      totalScore += reqReport.score;
      maxScore += 100;
    }

    report.complianceScore = (totalScore / maxScore) * 100;

    return report;
  }

  /**
   * ดึงสถิติการใช้งาน
   */
  async getUsageStatistics(farmId) {
    const logs = Array.from(this.logs.values()).filter(log => log.farmId === farmId);
    const batches = this.batchManager.getFarmBatches(farmId);

    const stats = {
      totalLogs: logs.length,
      totalBatches: batches.length,
      logsByRequirement: {},
      logsByMonth: {},
      batchesByStatus: {},
      averageComplianceScore: 0,
    };

    // Group by requirement
    for (const log of logs) {
      stats.logsByRequirement[log.requirement] =
        (stats.logsByRequirement[log.requirement] || 0) + 1;
    }

    // Group by month
    for (const log of logs) {
      const monthKey = log.date.toISOString().substring(0, 7); // YYYY-MM
      stats.logsByMonth[monthKey] = (stats.logsByMonth[monthKey] || 0) + 1;
    }

    // Group batches by status
    for (const batch of batches) {
      stats.batchesByStatus[batch.status] = (stats.batchesByStatus[batch.status] || 0) + 1;
    }

    // Calculate average compliance score
    const compliantLogs = logs.filter(log => log.complianceStatus === 'compliant');
    stats.averageComplianceScore = logs.length > 0 ? (compliantLogs.length / logs.length) * 100 : 0;

    return stats;
  }
}

module.exports = {
  GACPDigitalLogbook,
  BatchManager,
  GACP_REQUIREMENTS,
};
