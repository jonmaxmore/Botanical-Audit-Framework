/**
 * 🤖 GACP AI Assistant System - 3-Layer Intelligence Architecture
 * ระบบผู้ช่วย AI แบบ 3 ชั้นสำหรับแพลตฟอร์ม GACP อัจฉริยะ
 *
 * Layer 1: Intelligent Document Processing (IDP) - OCR/NLP
 * Layer 2: Real-Time Form Validation
 * Layer 3: Contextual Guidance Engine
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

// Mock AI/ML services (ในระบบจริงจะเชื่อมต่อกับ OpenAI, Google Vision API, etc.)
class MockOCRService {
  async extractText(imageBuffer, documentType) {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockData = {
      id_card: {
        fullName: 'นายสมชาย ใจดี',
        idNumber: '1234567890123',
        address: '123 หมู่ 1 ตำบลบางขุนเทียน เขตบางขุนเทียน กรุงเทพมหานคร 10150',
        dateOfBirth: '1985-03-15',
        issueDate: '2020-03-15',
        expiryDate: '2030-03-15'
      },
      land_deed: {
        deedNumber: 'ข.21234',
        landSize: '5-2-75',
        location: 'ตำบลบางขุนเทียน เขตบางขุนเทียน กรุงเทพมหานคร',
        ownerName: 'นายสมชาย ใจดี',
        coordinates: '13.686159, 100.414374'
      },
      business_registration: {
        businessName: 'วิสาหกิจชุมชนเกษตรอินทรีย์บางขุนเทียน',
        registrationNumber: 'สวช.1234/2566',
        businessType: 'วิสาหกิจชุมชน',
        registrationDate: '2023-01-15'
      }
    };

    return {
      success: true,
      confidence: 0.95,
      extractedData: mockData[documentType] || {},
      rawText: `Extracted text from ${documentType}`,
      processingTime: 1000
    };
  }
}

class MockNLPService {
  async analyzeText(text, intent) {
    // Simulate NLP processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const intents = {
      validate_thai_id: /^\d{13}$/,
      extract_land_size: /(\d+)-(\d+)-(\d+)/,
      validate_business_name: /วิสาหกิจชุมชน|สหกรณ์|บริษัท|ห้างหุ้นส่วน/,
      extract_coordinates: /(-?\d+\.\d+),\s*(-?\d+\.\d+)/
    };

    const pattern = intents[intent];
    const matches = pattern ? text.match(pattern) : null;

    return {
      success: !!matches,
      confidence: matches ? 0.9 : 0.2,
      matches: matches || [],
      intent: intent,
      suggestions: matches ? [] : [`รูปแบบ ${intent} ไม่ถูกต้อง`]
    };
  }
}

// Layer 1: Intelligent Document Processing (IDP)
class DocumentProcessingLayer extends EventEmitter {
  constructor() {
    super();
    this.ocrService = new MockOCRService();
    this.nlpService = new MockNLPService();
    this.processingQueue = new Map();

    console.log('🔍 Layer 1: Document Processing Layer initialized');
  }

  /**
   * ประมวลผลเอกสารด้วย OCR และ NLP
   */
  async processDocument(documentFile, documentType, applicantType) {
    const processId = uuidv4();
    const startTime = Date.now();

    this.processingQueue.set(processId, {
      status: 'processing',
      documentType,
      applicantType,
      startTime
    });

    try {
      console.log(`🔍 Processing document: ${documentType} for ${applicantType}`);

      // Step 1: OCR - Extract text from document
      const ocrResult = await this.ocrService.extractText(documentFile, documentType);

      if (!ocrResult.success) {
        throw new Error(`OCR failed for ${documentType}`);
      }

      // Step 2: NLP - Analyze and validate extracted data
      const validatedData = await this.validateExtractedData(
        ocrResult.extractedData,
        documentType,
        applicantType
      );

      // Step 3: Cross-reference validation
      const crossRefResult = await this.crossReferenceValidation(validatedData, documentType);

      const result = {
        processId,
        success: true,
        documentType,
        applicantType,
        extractedData: validatedData.data,
        validation: {
          ocrConfidence: ocrResult.confidence,
          nlpConfidence: validatedData.confidence,
          crossRefPassed: crossRefResult.passed,
          issues: [...validatedData.issues, ...crossRefResult.issues]
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      this.processingQueue.set(processId, {
        ...this.processingQueue.get(processId),
        status: 'completed',
        result
      });

      this.emit('document_processed', result);

      console.log(`✅ Document processed: ${documentType} - Confidence: ${ocrResult.confidence}`);
      return result;
    } catch (error) {
      const errorResult = {
        processId,
        success: false,
        error: error.message,
        documentType,
        applicantType,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      this.processingQueue.set(processId, {
        ...this.processingQueue.get(processId),
        status: 'failed',
        error: errorResult
      });

      this.emit('document_processing_failed', errorResult);

      console.error(`❌ Document processing failed: ${error.message}`);
      return errorResult;
    }
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูลที่ดึงได้
   */
  async validateExtractedData(extractedData, documentType, applicantType) {
    const issues = [];
    let confidence = 0.95;

    // Validation rules based on document type
    const validationRules = {
      id_card: {
        required: ['fullName', 'idNumber', 'address'],
        validators: {
          idNumber: value => /^\d{13}$/.test(value),
          fullName: value => value && value.length > 5,
          address: value => value && value.includes('จังหวัด')
        }
      },
      land_deed: {
        required: ['deedNumber', 'landSize', 'ownerName'],
        validators: {
          deedNumber: value => /^[ขค]\.\d+$/.test(value),
          landSize: value => /^\d+-\d+-\d+$/.test(value),
          ownerName: value => value && value.length > 5
        }
      },
      business_registration: {
        required: ['businessName', 'registrationNumber'],
        validators: {
          businessName: value => {
            if (applicantType === 'วิสาหกิจชุมชน') {
              return value && value.includes('วิสาหกิจชุมชน');
            }
            return value && value.length > 5;
          },
          registrationNumber: value => /^สวช\.\d+\/\d{4}$/.test(value)
        }
      }
    };

    const rules = validationRules[documentType];
    if (!rules) {
      issues.push(`ไม่พบกฎการตรวจสอบสำหรับเอกสารประเภท ${documentType}`);
      confidence = 0.5;
    } else {
      // Check required fields
      for (const field of rules.required) {
        if (!extractedData[field]) {
          issues.push(`ไม่พบข้อมูล ${field} ในเอกสาร`);
          confidence -= 0.1;
        }
      }

      // Run validators
      for (const [field, validator] of Object.entries(rules.validators)) {
        if (extractedData[field] && !validator(extractedData[field])) {
          issues.push(`รูปแบบข้อมูล ${field} ไม่ถูกต้อง: ${extractedData[field]}`);
          confidence -= 0.1;
        }
      }
    }

    // Use NLP for additional validation
    for (const [field, value] of Object.entries(extractedData)) {
      if (typeof value === 'string') {
        const nlpResult = await this.nlpService.analyzeText(value, `validate_${field}`);
        if (!nlpResult.success && nlpResult.confidence > 0.7) {
          issues.push(...nlpResult.suggestions);
          confidence -= 0.05;
        }
      }
    }

    return {
      data: extractedData,
      confidence: Math.max(confidence, 0.1),
      issues: issues
    };
  }

  /**
   * ตรวจสอบข้อมูลข้ามแหล่ง (Cross-reference validation)
   */
  async crossReferenceValidation(validatedData, documentType) {
    const issues = [];
    let passed = true;

    // Example: Check if name in ID card matches land deed
    if (documentType === 'land_deed' && validatedData.data.ownerName) {
      // This would connect to previous ID card data in real system
      const previousIdCard = this.getStoredData('id_card');
      if (previousIdCard && previousIdCard.fullName !== validatedData.data.ownerName) {
        issues.push('ชื่อในโฉนดที่ดินไม่ตรงกับบัตรประชาชน');
        passed = false;
      }
    }

    // Check against government databases (mock)
    if (documentType === 'id_card' && validatedData.data.idNumber) {
      const govCheck = await this.mockGovernmentDatabaseCheck(validatedData.data.idNumber);
      if (!govCheck.valid) {
        issues.push('หมายเลขบัตรประชาชนไม่ถูกต้องตามฐานข้อมูลราชการ');
        passed = false;
      }
    }

    return { passed, issues };
  }

  /**
   * Mock government database check
   */
  async mockGovernmentDatabaseCheck(idNumber) {
    // Simulate API call to government database
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock validation (in real system, this would be actual API call)
    return {
      valid: idNumber.length === 13,
      name: 'นายสมชาย ใจดี',
      status: 'active'
    };
  }

  /**
   * Get stored data from previous processing
   */
  getStoredData(documentType) {
    // This would retrieve from database in real system
    return null;
  }

  /**
   * Get processing status
   */
  getProcessingStatus(processId) {
    return this.processingQueue.get(processId);
  }

  /**
   * Get all processing history
   */
  getProcessingHistory() {
    return Array.from(this.processingQueue.values());
  }
}

// Layer 2: Real-Time Form Validation
class ValidationLayer extends EventEmitter {
  constructor() {
    super();
    this.validationRules = new Map();
    this.crossFieldValidators = new Map();
    this.loadValidationRules();

    console.log('✅ Layer 2: Real-Time Validation Layer initialized');
  }

  /**
   * โหลดกฎการตรวจสอบตามแผนงาน (ตารางที่ 3)
   */
  loadValidationRules() {
    // ข้อมูลผู้ขอใบรับรอง
    this.validationRules.set('applicant_name', {
      required: true,
      pattern: /^[ก-๏\s]+$/,
      minLength: 5,
      maxLength: 100,
      message: 'กรุณากรอกชื่อ-นามสกุลเป็นภาษาไทย'
    });

    this.validationRules.set('thai_id', {
      required: true,
      pattern: /^\d{13}$/,
      validator: this.validateThaiID,
      message: 'กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก'
    });

    // ข้อมูลที่ดิน
    this.validationRules.set('land_deed_number', {
      required: true,
      pattern: /^[ขค]\.\d+$/,
      message: 'รูปแบบเลขที่โฉนดไม่ถูกต้อง (เช่น ข.12345)'
    });

    this.validationRules.set('land_size', {
      required: true,
      pattern: /^\d+-\d+-\d+$/,
      validator: this.validateLandSize,
      message: 'รูปแบบขนาดที่ดินไม่ถูกต้อง (เช่น 5-2-75)'
    });

    // ข้อมูลการเพาะปลูก
    this.validationRules.set('cultivation_area', {
      required: true,
      type: 'number',
      min: 0.1,
      max: 1000000,
      validator: this.validateCultivationArea,
      message: 'พื้นที่เพาะปลูกต้องมากกว่า 0.1 ตารางเมตร'
    });

    this.validationRules.set('plant_quantity', {
      required: true,
      type: 'number',
      min: 1,
      max: 100000,
      validator: this.validatePlantQuantity,
      message: 'จำนวนต้นปลูกต้องมากกว่า 0 ต้น'
    });

    // Cross-field validation rules
    this.crossFieldValidators.set('area_vs_quantity', {
      fields: ['cultivation_area', 'plant_quantity'],
      validator: this.validateAreaVsQuantity,
      message: 'จำนวนต้นปลูกมากเกินไปเมื่อเทียบกับพื้นที่'
    });

    console.log('📋 Validation rules loaded: ' + this.validationRules.size + ' rules');
  }

  /**
   * ตรวจสอบฟิลด์เดียวแบบเรียลไทม์
   */
  async validateField(fieldName, value, context = {}) {
    const rule = this.validationRules.get(fieldName);
    if (!rule) {
      return { valid: true, field: fieldName, value };
    }

    const result = {
      field: fieldName,
      value: value,
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Required check
      if (rule.required && (!value || value.toString().trim() === '')) {
        result.valid = false;
        result.errors.push('ข้อมูลนี้จำเป็นต้องกรอก');
        return result;
      }

      // Skip validation if empty and not required
      if (!value && !rule.required) {
        return result;
      }

      // Type validation
      if (rule.type === 'number' && isNaN(value)) {
        result.valid = false;
        result.errors.push('กรุณากรอกตัวเลข');
        return result;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        result.valid = false;
        result.errors.push(rule.message || 'รูปแบบข้อมูลไม่ถูกต้อง');
      }

      // Length validation
      if (rule.minLength && value.toString().length < rule.minLength) {
        result.valid = false;
        result.errors.push(`ข้อมูลต้องมีความยาวอย่างน้อย ${rule.minLength} ตัวอักษร`);
      }

      if (rule.maxLength && value.toString().length > rule.maxLength) {
        result.valid = false;
        result.errors.push(`ข้อมูลต้องมีความยาวไม่เกิน ${rule.maxLength} ตัวอักษร`);
      }

      // Range validation for numbers
      if (rule.type === 'number') {
        const numValue = parseFloat(value);
        if (rule.min !== undefined && numValue < rule.min) {
          result.valid = false;
          result.errors.push(`ค่าต้องมากกว่าหรือเท่ากับ ${rule.min}`);
        }
        if (rule.max !== undefined && numValue > rule.max) {
          result.valid = false;
          result.errors.push(`ค่าต้องน้อยกว่าหรือเท่ากับ ${rule.max}`);
        }
      }

      // Custom validator
      if (rule.validator && typeof rule.validator === 'function') {
        const customResult = await rule.validator(value, context);
        if (!customResult.valid) {
          result.valid = false;
          result.errors.push(...(customResult.errors || []));
          result.warnings.push(...(customResult.warnings || []));
          result.suggestions.push(...(customResult.suggestions || []));
        }
      }

      // Emit validation event
      this.emit('field_validated', result);

      return result;
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      return {
        field: fieldName,
        value: value,
        valid: false,
        errors: ['เกิดข้อผิดพลาดในการตรวจสอบข้อมูล'],
        warnings: [],
        suggestions: []
      };
    }
  }

  /**
   * ตรวจสอบข้อมูลข้ามฟิลด์ (Cross-field validation)
   */
  async validateCrossFields(formData) {
    const results = [];

    for (const [validatorName, config] of this.crossFieldValidators) {
      const fieldValues = {};
      let hasAllFields = true;

      // Collect field values
      for (const fieldName of config.fields) {
        if (formData[fieldName] !== undefined && formData[fieldName] !== '') {
          fieldValues[fieldName] = formData[fieldName];
        } else {
          hasAllFields = false;
          break;
        }
      }

      // Skip if not all required fields are present
      if (!hasAllFields) continue;

      try {
        const validationResult = await config.validator(fieldValues);

        results.push({
          validator: validatorName,
          fields: config.fields,
          valid: validationResult.valid,
          errors: validationResult.errors || [],
          warnings: validationResult.warnings || [],
          suggestions: validationResult.suggestions || []
        });

        this.emit('cross_field_validated', {
          validator: validatorName,
          fields: config.fields,
          result: validationResult
        });
      } catch (error) {
        console.error(`Cross-field validation error for ${validatorName}:`, error);
        results.push({
          validator: validatorName,
          fields: config.fields,
          valid: false,
          errors: ['เกิดข้อผิดพลาดในการตรวจสอบข้อมูล'],
          warnings: [],
          suggestions: []
        });
      }
    }

    return results;
  }

  /**
   * ตรวจสอบฟอร์มทั้งหมด
   */
  async validateForm(formData) {
    const fieldResults = {};
    const crossFieldResults = [];
    let overallValid = true;

    // Validate individual fields
    for (const [fieldName, value] of Object.entries(formData)) {
      const result = await this.validateField(fieldName, value, formData);
      fieldResults[fieldName] = result;
      if (!result.valid) {
        overallValid = false;
      }
    }

    // Validate cross-field relationships
    const crossResults = await this.validateCrossFields(formData);
    crossFieldResults.push(...crossResults);

    if (crossResults.some(r => !r.valid)) {
      overallValid = false;
    }

    const formValidationResult = {
      valid: overallValid,
      fieldResults,
      crossFieldResults,
      timestamp: new Date()
    };

    this.emit('form_validated', formValidationResult);

    return formValidationResult;
  }

  // ==================== Custom Validators ====================

  /**
   * ตรวจสอบหมายเลขบัตรประชาชนไทย
   */
  async validateThaiID(idNumber) {
    if (!/^\d{13}$/.test(idNumber)) {
      return {
        valid: false,
        errors: ['หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก']
      };
    }

    // Thai ID checksum validation
    const digits = idNumber.split('').map(Number);
    const sum = digits.slice(0, 12).reduce((acc, digit, index) => {
      return acc + digit * (13 - index);
    }, 0);

    const checkDigit = (11 - (sum % 11)) % 10;

    if (checkDigit !== digits[12]) {
      return {
        valid: false,
        errors: ['หมายเลขบัตรประชาชนไม่ถูกต้อง (checksum ผิด)']
      };
    }

    return { valid: true };
  }

  /**
   * ตรวจสอบขนาดที่ดิน
   */
  async validateLandSize(landSize) {
    const match = landSize.match(/^(\d+)-(\d+)-(\d+)$/);
    if (!match) {
      return {
        valid: false,
        errors: ['รูปแบบขนาดที่ดินไม่ถูกต้อง ต้องเป็น ไร่-งาน-วา (เช่น 5-2-75)']
      };
    }

    const [, rai, ngan, wa] = match;

    // Validate ranges (งาน max 4, วา max 100)
    if (parseInt(ngan) > 4) {
      return {
        valid: false,
        errors: ['งานต้องไม่เกิน 4'],
        suggestions: ['1 ไร่ = 4 งาน']
      };
    }

    if (parseInt(wa) > 100) {
      return {
        valid: false,
        errors: ['วาต้องไม่เกิน 100'],
        suggestions: ['1 งาน = 100 วา']
      };
    }

    // Calculate total area in square meters
    const totalWa = parseInt(rai) * 400 + parseInt(ngan) * 100 + parseInt(wa);
    const sqm = totalWa * 4; // 1 วา = 4 ตร.ม.

    return {
      valid: true,
      metadata: {
        totalWa,
        totalSqm: sqm,
        displayText: `${landSize} (${sqm.toLocaleString()} ตร.ม.)`
      }
    };
  }

  /**
   * ตรวจสอบพื้นที่เพาะปลูก
   */
  async validateCultivationArea(area, context) {
    const numArea = parseFloat(area);

    if (numArea <= 0) {
      return {
        valid: false,
        errors: ['พื้นที่เพาะปลูกต้องมากกว่า 0']
      };
    }

    // Warning for very large areas
    if (numArea > 10000) {
      return {
        valid: true,
        warnings: ['พื้นที่เพาะปลูกขนาดใหญ่มาก กรุณาตรวจสอบอีกครั้ง']
      };
    }

    return { valid: true };
  }

  /**
   * ตรวจสอบจำนวนต้นปลูก
   */
  async validatePlantQuantity(quantity, context) {
    const numQuantity = parseInt(quantity);

    if (numQuantity <= 0) {
      return {
        valid: false,
        errors: ['จำนวนต้นปลูกต้องมากกว่า 0']
      };
    }

    // Warning for very large quantities
    if (numQuantity > 1000) {
      return {
        valid: true,
        warnings: ['จำนวนต้นปลูกจำนวนมาก กรุณาตรวจสอบอีกครั้ง']
      };
    }

    return { valid: true };
  }

  /**
   * ตรวจสอบความสมเหตุสมผลระหว่างพื้นที่และจำนวนต้น
   */
  async validateAreaVsQuantity(values) {
    const area = parseFloat(values.cultivation_area);
    const quantity = parseInt(values.plant_quantity);

    // Calculate plants per square meter
    const plantsPerSqm = quantity / area;

    // Reasonable range: 1-4 plants per square meter for cannabis
    if (plantsPerSqm > 4) {
      return {
        valid: false,
        errors: ['จำนวนต้นปลูกมากเกินไปเมื่อเทียบกับพื้นที่'],
        suggestions: [
          `ปัจจุบัน: ${plantsPerSqm.toFixed(2)} ต้น/ตร.ม.`,
          'แนะนำ: 1-4 ต้น/ตร.ม. สำหรับกัญชา'
        ]
      };
    }

    if (plantsPerSqm < 0.1) {
      return {
        valid: true,
        warnings: ['จำนวนต้นปลูกน้อยเมื่อเทียบกับพื้นที่ อาจไม่คุ้มค่าทางเศรษฐกิจ'],
        suggestions: [`ปัจจุบัน: ${plantsPerSqm.toFixed(2)} ต้น/ตร.ม.`]
      };
    }

    return {
      valid: true,
      metadata: {
        plantsPerSqm: plantsPerSqm.toFixed(2),
        efficiency: plantsPerSqm >= 1 ? 'ดี' : 'ต่ำ'
      }
    };
  }
}

// Layer 3: Contextual Guidance Engine
class GuidanceLayer extends EventEmitter {
  constructor() {
    super();
    this.guidanceRules = new Map();
    this.contextualHints = new Map();
    this.loadGuidanceRules();

    console.log('💡 Layer 3: Contextual Guidance Engine initialized');
  }

  /**
   * โหลดกฎการให้คำแนะนำตามบริบท (ตารางที่ 3)
   */
  loadGuidanceRules() {
    // Guidance for cultivation area selection
    this.guidanceRules.set('cultivation_area_outdoor', {
      trigger: { field: 'cultivation_type', value: 'outdoor' },
      guidance: {
        type: 'requirement_reminder',
        title: 'ข้อกำหนด GACP สำหรับการปลูกกลางแจ้ง',
        message: 'เนื่องจากเลือกปลูกกลางแจ้ง จำเป็นต้องปฏิบัติตามข้อกำหนด GACP ข้อ 5.1',
        requirements: [
          'ตรวจสอบคุณภาพดินและน้ำก่อนปลูก',
          'ห่างจากแหล่งมลพิษอย่างน้อย 500 เมตร',
          'อัปโหลดผลการวิเคราะห์ดินล่าสุด',
          'อัปโหลดผลการวิเคราะห์คุณภาพน้ำ'
        ],
        relatedDocuments: ['soil_analysis', 'water_quality_test'],
        severity: 'high'
      }
    });

    // Guidance for pest control
    this.guidanceRules.set('pest_control_guidance', {
      trigger: { section: 'pest_control_plan' },
      guidance: {
        type: 'compliance_warning',
        title: 'ข้อกำหนดการควบคุมศัตรูพืช',
        message:
          'ตามข้อกำหนด GACP ข้อ 9.5 และ 9.6 อนุญาตให้ใช้เฉพาะสารอินทรีย์หรือสารชีวภัณฑ์เท่านั้น',
        requirements: [
          'ห้ามใช้วัตถุอันตรายทางการเกษตร (สารเคมีสังเคราะห์)',
          'ใช้หลัก IPM (Integrated Pest Management)',
          'บันทึกการใช้สารควบคุมศัตรูพืชทุกครั้ง',
          'เก็บใบรับรองสารชีวภัณฑ์ที่ใช้'
        ],
        severity: 'critical'
      }
    });

    // Guidance for land ownership
    this.guidanceRules.set('land_rental_guidance', {
      trigger: { field: 'land_ownership', value: 'rental' },
      guidance: {
        type: 'document_requirement',
        title: 'เอกสารเพิ่มเติมสำหรับที่ดินเช่า',
        message: 'เนื่องจากเลือกใช้ที่ดินเช่า จำเป็นต้องเตรียมเอกสารเพิ่มเติม',
        requiredDocuments: [
          'หนังสือให้ความยินยอมจากผู้ให้เช่า',
          'สัญญาเช่าที่ดิน (หากมี)',
          'หนังสือแสดงกรรมสิทธิ์ของผู้ให้เช่า'
        ],
        nextSteps: [
          'อัปโหลดเอกสารในส่วน "เอกสารประกอบ"',
          'ตรวจสอบให้แน่ใจว่าสัญญาเช่ายังไม่หมดอายุ'
        ],
        severity: 'medium'
      }
    });

    // Business type specific guidance
    this.guidanceRules.set('business_community_guidance', {
      trigger: { field: 'applicant_type', value: 'วิสาหกิจชุมชน' },
      guidance: {
        type: 'procedural_info',
        title: 'ข้อมูลสำคัญสำหรับวิสาหกิจชุมชน',
        message: 'วิสาหกิจชุมชนมีข้อกำหนดพิเศษในการยื่นขอใบรับรอง GACP',
        requirements: [
          'ต้องดำเนินการภายใต้ความร่วมมือกับหน่วยงานรัฐ',
          'ต้องมีสมาชิกชุมชนเข้าร่วมโครงการ',
          'จำเป็นต้องมีแผนการแบ่งปันผลประโยชน์กับชุมชน'
        ],
        nextSteps: [
          'เตรียมหนังสือยืนยันจากหน่วยงานรัฐที่ให้ความร่วมมือ',
          'จัดทำบัญชีรายชื่อสมาชิกวิสาหกิจชุมชน'
        ],
        severity: 'medium'
      }
    });

    console.log('💡 Guidance rules loaded: ' + this.guidanceRules.size + ' rules');
  }

  /**
   * ประเมินบริบทและให้คำแนะนำ
   */
  async provideGuidance(context) {
    const applicableGuidance = [];
    const currentField = context.currentField;
    const formData = context.formData || {};
    const userAction = context.action;

    // Check field-specific guidance
    for (const [ruleId, rule] of this.guidanceRules) {
      if (this.isRuleApplicable(rule, context)) {
        const guidance = await this.generateContextualGuidance(rule.guidance, context);

        applicableGuidance.push({
          id: ruleId,
          ...guidance,
          triggeredBy: rule.trigger,
          timestamp: new Date()
        });
      }
    }

    // Generate dynamic guidance based on current context
    const dynamicGuidance = await this.generateDynamicGuidance(context);
    applicableGuidance.push(...dynamicGuidance);

    // Emit guidance event
    this.emit('guidance_provided', {
      context,
      guidance: applicableGuidance
    });

    return applicableGuidance;
  }

  /**
   * ตรวจสอบว่ากฎใดใช้ได้กับบริบทปัจจุบัน
   */
  isRuleApplicable(rule, context) {
    const trigger = rule.trigger;
    const formData = context.formData || {};

    // Field-value trigger
    if (trigger.field && trigger.value) {
      return formData[trigger.field] === trigger.value;
    }

    // Section-based trigger
    if (trigger.section) {
      return context.currentSection === trigger.section;
    }

    // Current field trigger
    if (trigger.currentField) {
      return context.currentField === trigger.currentField;
    }

    // Action-based trigger
    if (trigger.action) {
      return context.action === trigger.action;
    }

    return false;
  }

  /**
   * สร้างคำแนะนำตามบริบท
   */
  async generateContextualGuidance(guidanceTemplate, context) {
    const guidance = { ...guidanceTemplate };

    // Personalize guidance based on applicant type
    if (context.formData?.applicant_type) {
      guidance.personalizedFor = context.formData.applicant_type;
    }

    // Add progress information
    if (context.formProgress) {
      guidance.progressInfo = {
        currentStep: context.formProgress.currentStep,
        totalSteps: context.formProgress.totalSteps,
        completionPercent: context.formProgress.completionPercent
      };
    }

    // Add estimated time to complete
    guidance.estimatedTime = this.estimateCompletionTime(guidance.type, context);

    return guidance;
  }

  /**
   * สร้างคำแนะนำแบบไดนามิกตามบริบท
   */
  async generateDynamicGuidance(context) {
    const dynamicGuidance = [];
    const formData = context.formData || {};

    // Missing required documents guidance
    const missingDocs = this.identifyMissingDocuments(formData);
    if (missingDocs.length > 0) {
      dynamicGuidance.push({
        id: 'missing_documents',
        type: 'document_checklist',
        title: 'เอกสารที่ยังไม่ได้อัปโหลด',
        message: 'กรุณาเตรียมเอกสารต่อไปนี้ให้ครบถ้วน',
        missingDocuments: missingDocs,
        severity: 'high'
      });
    }

    // Form completion guidance
    const completionStatus = this.analyzeFormCompletion(formData);
    if (completionStatus.completionPercent < 100) {
      dynamicGuidance.push({
        id: 'form_completion',
        type: 'progress_guidance',
        title: `กรอกข้อมูลแล้ว ${completionStatus.completionPercent}%`,
        message: 'ส่วนที่ยังไม่ได้กรอก',
        incompleteSections: completionStatus.incompleteSections,
        nextRecommendedSection: completionStatus.nextSection,
        severity: 'low'
      });
    }

    // Compliance risk assessment
    const complianceRisks = await this.assessComplianceRisks(formData);
    if (complianceRisks.length > 0) {
      dynamicGuidance.push({
        id: 'compliance_risks',
        type: 'risk_warning',
        title: 'ความเสี่ยงด้านการปฏิบัติตามข้อกำหนด',
        message: 'พบความเสี่ยงที่อาจส่งผลต่อการได้รับใบรับรอง',
        risks: complianceRisks,
        severity: 'high'
      });
    }

    return dynamicGuidance;
  }

  /**
   * ระบุเอกสารที่ขาดหาย
   */
  identifyMissingDocuments(formData) {
    const requiredDocs = {
      วิสาหกิจชุมชน: [
        'หนังสือรับรองวิสาหกิจชุมชน',
        'บัญชีรายชื่อสมาชิก',
        'หนังสือยินยอมจากหน่วยงานรัฐ'
      ],
      บุคคลธรรมดา: ['บัตรประจำตัวประชาชน', 'หนังสือยินยอมจากผู้รับอนุญาตผลิตยา'],
      นิติบุคคล: ['หนังสือรับรองนิติบุคคล', 'หนังสือมอบอำนาจ']
    };

    const applicantType = formData.applicant_type;
    if (!applicantType || !requiredDocs[applicantType]) {
      return [];
    }

    const required = requiredDocs[applicantType];
    const uploaded = formData.uploadedDocuments || [];

    return required.filter(doc => !uploaded.includes(doc));
  }

  /**
   * วิเคราะห์ความสมบูรณ์ของฟอร์ม
   */
  analyzeFormCompletion(formData) {
    const requiredSections = [
      'applicant_info',
      'land_info',
      'cultivation_plan',
      'pest_control_plan',
      'harvest_plan',
      'documents'
    ];

    const sectionCompleteness = {
      applicant_info: ['applicant_name', 'thai_id', 'address'],
      land_info: ['land_deed_number', 'land_size', 'land_ownership'],
      cultivation_plan: ['cultivation_area', 'plant_quantity', 'cultivation_type'],
      pest_control_plan: ['pest_control_method', 'approved_substances'],
      harvest_plan: ['harvest_season', 'expected_yield'],
      documents: ['uploadedDocuments']
    };

    let completedSections = 0;
    const incompleteSections = [];

    for (const [section, fields] of Object.entries(sectionCompleteness)) {
      const sectionComplete = fields.every(field => formData[field] && formData[field] !== '');

      if (sectionComplete) {
        completedSections++;
      } else {
        incompleteSections.push({
          section,
          missingFields: fields.filter(field => !formData[field] || formData[field] === '')
        });
      }
    }

    const completionPercent = Math.round((completedSections / requiredSections.length) * 100);
    const nextSection = incompleteSections.length > 0 ? incompleteSections[0].section : null;

    return {
      completionPercent,
      completedSections,
      totalSections: requiredSections.length,
      incompleteSections,
      nextSection
    };
  }

  /**
   * ประเมินความเสี่ยงด้านการปฏิบัติตามข้อกำหนด
   */
  async assessComplianceRisks(formData) {
    const risks = [];

    // Risk: Using chemicals in pest control
    if (formData.pest_control_method && formData.pest_control_method.includes('chemical')) {
      risks.push({
        type: 'regulatory_violation',
        severity: 'critical',
        issue: 'ใช้สารเคมีในการควบคุมศัตรูพืช',
        impact: 'ขัดต่อข้อกำหนด GACP ข้อ 9.6',
        recommendation: 'เปลี่ยนไปใช้สารชีวภัณฑ์หรือวิธีการอินทรีย์'
      });
    }

    // Risk: Cultivation area too close to pollution source
    if (formData.distance_from_pollution && parseFloat(formData.distance_from_pollution) < 500) {
      risks.push({
        type: 'environmental_risk',
        severity: 'high',
        issue: 'อยู่ใกล้แหล่งมลพิษเกินไป',
        impact: 'อาจไม่ผ่านการตรวจสอบสภาพแวดล้อม',
        recommendation: 'หาพื้นที่ปลูกที่ห่างจากแหล่งมลพิษอย่างน้อย 500 เมตร'
      });
    }

    // Risk: Incomplete documentation
    const missingDocs = this.identifyMissingDocuments(formData);
    if (missingDocs.length > 2) {
      risks.push({
        type: 'documentation_risk',
        severity: 'medium',
        issue: 'เอกสารไม่ครบถ้วน',
        impact: 'อาจทำให้การอนุมัติล่าช้า',
        recommendation: 'เตรียมเอกสารให้ครบถ้วนก่อนส่งคำขอ'
      });
    }

    return risks;
  }

  /**
   * ประมาณเวลาที่ใช้ในการดำเนินการ
   */
  estimateCompletionTime(guidanceType, context) {
    const timeEstimates = {
      document_requirement: 15, // 15 minutes to prepare documents
      compliance_warning: 5, // 5 minutes to read and understand
      procedural_info: 10, // 10 minutes to review process
      risk_warning: 20 // 20 minutes to address risks
    };

    return timeEstimates[guidanceType] || 10;
  }

  /**
   * ให้คำแนะนำเฉพาะสำหรับข้อผิดพลาดที่เกิดขึ้น
   */
  async provideErrorGuidance(error, context) {
    const errorGuidance = {
      id: 'error_guidance',
      type: 'error_resolution',
      title: 'วิธีแก้ไขข้อผิดพลาด',
      error: error.message,
      timestamp: new Date()
    };

    // Specific guidance based on error type
    if (error.field === 'thai_id' && error.message.includes('checksum')) {
      errorGuidance.solutions = [
        'ตรวจสอบการพิมพ์หมายเลขบัตรประชาชนอีกครั้ง',
        'ตรวจสอบหน้าบัตรประชาชนว่าชัดเจนหรือไม่',
        'ลองถ่ายรูปบัตรประชาชนใหม่ในแสงที่เพียงพอ'
      ];
    } else if (error.field === 'land_deed_number') {
      errorGuidance.solutions = [
        'ตรวจสอบเลขที่โฉนดจากเอกสารต้นฉบับ',
        'รูปแบบที่ถูกต้อง: ข.12345 หรือ ค.67890',
        'อัปโหลดรูปภาพโฉนดที่ชัดเจน'
      ];
    } else {
      errorGuidance.solutions = [
        'ตรวจสอบข้อมูลที่กรอกอีกครั้ง',
        'อ่านคำแนะนำและตัวอย่างที่ให้ไว้',
        'ติดต่อเจ้าหน้าที่หากยังมีปัญหา'
      ];
    }

    this.emit('error_guidance_provided', errorGuidance);

    return errorGuidance;
  }
}

// Main AI Assistant System - integrates all 3 layers
class GACPAIAssistantSystem extends EventEmitter {
  constructor() {
    super();

    // Initialize all 3 layers
    this.documentProcessor = new DocumentProcessingLayer();
    this.validator = new ValidationLayer();
    this.guidanceProvider = new GuidanceLayer();

    // Setup inter-layer communication
    this.setupLayerIntegration();

    console.log('🤖 GACP AI Assistant System fully initialized');
  }

  /**
   * ตั้งค่าการทำงานร่วมกันระหว่าง 3 ชั้น
   */
  setupLayerIntegration() {
    // Document processing results feed into validation
    this.documentProcessor.on('document_processed', result => {
      if (result.success && result.extractedData) {
        // Auto-populate form fields with extracted data
        this.emit('form_data_extracted', {
          documentType: result.documentType,
          extractedData: result.extractedData,
          confidence: result.validation.ocrConfidence
        });
      }
    });

    // Validation results trigger contextual guidance
    this.validator.on('field_validated', result => {
      if (!result.valid) {
        this.guidanceProvider.provideErrorGuidance(
          {
            field: result.field,
            message: result.errors[0]
          },
          { currentField: result.field }
        );
      }
    });

    // Form validation completion triggers comprehensive guidance
    this.validator.on('form_validated', async result => {
      const guidance = await this.guidanceProvider.provideGuidance({
        formData: result.fieldResults,
        formValidation: result,
        action: 'form_validation_completed'
      });

      this.emit('comprehensive_guidance', guidance);
    });
  }

  /**
   * หน้าจอหลักสำหรับการประมวลผลเอกสาร
   */
  async processDocument(documentFile, documentType, applicantType) {
    console.log(`🤖 AI Processing: ${documentType} for ${applicantType}`);

    try {
      const result = await this.documentProcessor.processDocument(
        documentFile,
        documentType,
        applicantType
      );

      this.emit('ai_processing_completed', {
        layer: 'document_processing',
        result
      });

      return result;
    } catch (error) {
      this.emit('ai_processing_error', {
        layer: 'document_processing',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * ตรวจสอบฟิลด์แบบเรียลไทม์
   */
  async validateFieldRealTime(fieldName, value, context = {}) {
    const result = await this.validator.validateField(fieldName, value, context);

    // Trigger guidance if there are issues
    if (!result.valid || result.warnings.length > 0) {
      const guidance = await this.guidanceProvider.provideGuidance({
        currentField: fieldName,
        fieldResult: result,
        formData: context,
        action: 'field_validation_failed'
      });

      this.emit('real_time_assistance', {
        field: fieldName,
        validation: result,
        guidance
      });
    }

    return result;
  }

  /**
   * ตรวจสอบฟอร์มทั้งหมดและให้คำแนะนำ
   */
  async validateFormAndProvideGuidance(formData) {
    console.log('🤖 AI Full Form Analysis started');

    // Step 1: Comprehensive form validation
    const validationResult = await this.validator.validateForm(formData);

    // Step 2: Generate contextual guidance
    const guidance = await this.guidanceProvider.provideGuidance({
      formData,
      formValidation: validationResult,
      action: 'comprehensive_review'
    });

    // Step 3: Compile comprehensive report
    const aiAnalysisReport = {
      timestamp: new Date(),
      formValidation: validationResult,
      guidance: guidance,
      readinessScore: this.calculateReadinessScore(validationResult, guidance),
      recommendations: this.generateFinalRecommendations(validationResult, guidance),
      estimatedApprovalChance: this.estimateApprovalChance(validationResult, guidance)
    };

    this.emit('ai_analysis_completed', aiAnalysisReport);

    console.log('🤖 AI Analysis completed - Readiness Score:', aiAnalysisReport.readinessScore);

    return aiAnalysisReport;
  }

  /**
   * คำนวณคะแนนความพร้อมในการยื่นขอ
   */
  calculateReadinessScore(validationResult, guidance) {
    let score = 100;

    // Deduct for validation errors
    Object.values(validationResult.fieldResults).forEach(result => {
      if (!result.valid) {
        score -= 10; // -10 for each field error
      }
      score -= result.warnings.length * 2; // -2 for each warning
    });

    // Deduct for cross-field validation issues
    validationResult.crossFieldResults.forEach(result => {
      if (!result.valid) {
        score -= 15; // -15 for each cross-field error
      }
    });

    // Deduct for high-severity guidance issues
    guidance.forEach(guide => {
      if (guide.severity === 'critical') {
        score -= 20;
      } else if (guide.severity === 'high') {
        score -= 10;
      } else if (guide.severity === 'medium') {
        score -= 5;
      }
    });

    return Math.max(score, 0);
  }

  /**
   * สร้างคำแนะนำสุดท้าย
   */
  generateFinalRecommendations(validationResult, guidance) {
    const recommendations = [];

    // Critical issues first
    const criticalGuidance = guidance.filter(g => g.severity === 'critical');
    if (criticalGuidance.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'ปัญหาร้ายแรงที่ต้องแก้ไขก่อนยื่นขอ',
        items: criticalGuidance.map(g => g.message)
      });
    }

    // High priority issues
    const highGuidance = guidance.filter(g => g.severity === 'high');
    if (highGuidance.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'ปัญหาสำคัญที่ควรแก้ไข',
        items: highGuidance.map(g => g.message)
      });
    }

    // Document preparation
    const docGuidance = guidance.filter(g => g.type === 'document_requirement');
    if (docGuidance.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'เอกสารที่ต้องเตรียม',
        items: docGuidance.flatMap(g => g.requiredDocuments || [])
      });
    }

    return recommendations;
  }

  /**
   * ประมาณโอกาสในการได้รับอนุมัติ
   */
  estimateApprovalChance(validationResult, guidance) {
    const readinessScore = this.calculateReadinessScore(validationResult, guidance);

    if (readinessScore >= 90) {
      return { percentage: 95, level: 'สูงมาก', color: 'green' };
    } else if (readinessScore >= 80) {
      return { percentage: 85, level: 'สูง', color: 'lightgreen' };
    } else if (readinessScore >= 70) {
      return { percentage: 70, level: 'ปานกลาง', color: 'yellow' };
    } else if (readinessScore >= 50) {
      return { percentage: 50, level: 'ต่ำ', color: 'orange' };
    } else {
      return { percentage: 30, level: 'ต่ำมาก', color: 'red' };
    }
  }

  /**
   * รับสถานะการทำงานของทุกชั้น
   */
  getSystemStatus() {
    return {
      documentProcessor: {
        queueSize: this.documentProcessor.processingQueue.size,
        processingHistory: this.documentProcessor.getProcessingHistory().length
      },
      validator: {
        rulesLoaded: this.validator.validationRules.size,
        crossFieldRules: this.validator.crossFieldValidators.size
      },
      guidanceProvider: {
        guidanceRules: this.guidanceProvider.guidanceRules.size,
        contextualHints: this.guidanceProvider.contextualHints.size
      },
      status: 'operational',
      timestamp: new Date()
    };
  }

  /**
   * ให้คำแนะนำสำหรับ SOP activities
   */
  async provideSOPGuidance(context) {
    try {
      const { action, phase, sessionContext, activityContext } = context;

      let guidance = {
        type: 'sop_guidance',
        timestamp: new Date(),
        phase,
        action
      };

      switch (action) {
        case 'session_start':
          guidance = {
            ...guidance,
            title: 'เริ่มต้น SOP Session',
            message: `ยินดีต้อนรับสู่ขั้นตอน ${this.getPhaseDisplayName(phase)}!`,
            severity: 'info'
          };
          break;

        case 'phase_transition':
          guidance = {
            ...guidance,
            title: `เปลี่ยนขั้นตอน`,
            message: `เสร็จสิ้นแล้ว กำลังเริ่มต้นขั้นตอนใหม่`,
            severity: 'success'
          };
          break;

        default:
          guidance.message = 'ระบบ AI พร้อมให้คำแนะนำ';
          guidance.severity = 'info';
      }

      return guidance;
    } catch (error) {
      console.error('[AIAssistant] Error providing SOP guidance:', error);
      return {
        type: 'error',
        message: 'ไม่สามารถให้คำแนะนำได้',
        severity: 'error',
        timestamp: new Date()
      };
    }
  }

  /**
   * รับชื่อ phase แบบแสดงผล
   */
  getPhaseDisplayName(phaseId) {
    const phaseNames = {
      pre_planting: 'ขั้นตอนก่อนปลูก',
      planting: 'ขั้นตอนการปลูก',
      growing: 'ขั้นตอนการเพาะปลูก',
      harvesting: 'ขั้นตอนการเก็บเกี่ยว',
      post_harvest: 'ขั้นตอนหลังการเก็บเกี่ยว'
    };
    return phaseNames[phaseId] || phaseId;
  }
}

module.exports = {
  GACPAIAssistantSystem,
  DocumentProcessingLayer,
  ValidationLayer,
  GuidanceLayer
};
