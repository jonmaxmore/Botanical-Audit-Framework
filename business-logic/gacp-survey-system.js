/**
 * 📊 GACP Survey System - Standalone Survey Management Platform
 * ระบบสำรวจอิสระสำหรับการเก็บรวบรวมข้อมูล GACP จากเกษตรกร
 *
 * Features:
 * - 4-Region Survey Management (เหนือ, อีสาน, กลาง, ใต้)
 * - 7-Step Survey Wizard
 * - Multi-language Support (Thai, English)
 * - Real-time Analytics & Reporting
 * - Data Export & Visualization
 * - Mobile-responsive Design
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class GACPSurveySystem extends EventEmitter {
  constructor() {
    super();
    this.surveyData = new Map();
    this.templates = new Map();
    this.analytics = new Map();
    this.responses = new Map();

    this.regions = ['northern', 'northeastern', 'central', 'southern'];
    this.languages = ['th', 'en'];

    this.initializeSurveyTemplates();
  }

  async initialize() {
    console.log('🚀 Initializing GACP Survey System...');

    // Initialize survey templates
    this.initializeSurveyTemplates();

    // Setup analytics tracking
    this.setupAnalytics();

    // Load existing data
    await this.loadExistingData();

    console.log('✅ GACP Survey System initialized successfully');
    this.emit('system:initialized');
  }

  initializeSurveyTemplates() {
    // 📋 Survey Template: Farm Information & GACP Practices
    const farmSurveyTemplate = {
      id: 'gacp-farm-survey-2024',
      title: {
        th: 'แบบสำรวจการปฏิบัติ GACP ในฟาร์มกัญชา',
        en: 'GACP Cannabis Farm Practices Survey',
      },
      description: {
        th: 'สำรวจการปฏิบัติตามมาตรฐาน GACP ในฟาร์มกัญชาเพื่อการแพทย์',
        en: 'Survey on GACP compliance practices in medical cannabis farms',
      },
      version: '2.0',
      estimatedTime: 15, // minutes
      steps: [
        {
          stepId: 1,
          title: {
            th: 'ข้อมูลทั่วไปของฟาร์ม',
            en: 'General Farm Information',
          },
          fields: [
            {
              id: 'farm_name',
              type: 'text',
              label: { th: 'ชื่อฟาร์ม', en: 'Farm Name' },
              required: true,
              validation: { minLength: 2, maxLength: 100 },
            },
            {
              id: 'farm_region',
              type: 'select',
              label: { th: 'ภูมิภาค', en: 'Region' },
              required: true,
              options: [
                { value: 'northern', label: { th: 'ภาคเหนือ', en: 'Northern' } },
                { value: 'northeastern', label: { th: 'ภาคอีสาน', en: 'Northeastern' } },
                { value: 'central', label: { th: 'ภาคกลาง', en: 'Central' } },
                { value: 'southern', label: { th: 'ภาคใต้', en: 'Southern' } },
              ],
            },
            {
              id: 'farm_size',
              type: 'number',
              label: { th: 'ขนาดพื้นที่ (ตร.ม.)', en: 'Farm Size (sq.m.)' },
              required: true,
              validation: { min: 1, max: 1000000 },
            },
            {
              id: 'years_experience',
              type: 'number',
              label: { th: 'ประสบการณ์ปลูกกัญชา (ปี)', en: 'Cannabis Growing Experience (years)' },
              required: true,
              validation: { min: 0, max: 50 },
            },
          ],
        },
        {
          stepId: 2,
          title: {
            th: 'การจัดการดินและน้ำ',
            en: 'Soil and Water Management',
          },
          fields: [
            {
              id: 'soil_testing_frequency',
              type: 'select',
              label: { th: 'ความถี่ในการตรวจสอบดิน', en: 'Soil Testing Frequency' },
              required: true,
              options: [
                { value: 'monthly', label: { th: 'ทุกเดือน', en: 'Monthly' } },
                { value: 'quarterly', label: { th: 'ทุก 3 เดือน', en: 'Quarterly' } },
                { value: 'annually', label: { th: 'ทุกปี', en: 'Annually' } },
                { value: 'never', label: { th: 'ไม่เคยตรวจ', en: 'Never' } },
              ],
            },
            {
              id: 'water_source',
              type: 'checkbox',
              label: { th: 'แหล่งน้ำที่ใช้', en: 'Water Sources Used' },
              required: true,
              options: [
                { value: 'tap_water', label: { th: 'น้ำประปา', en: 'Tap Water' } },
                { value: 'well_water', label: { th: 'น้ำบาดาล', en: 'Well Water' } },
                { value: 'river_water', label: { th: 'น้ำแม่น้ำ', en: 'River Water' } },
                { value: 'rainwater', label: { th: 'น้ำฝน', en: 'Rainwater' } },
              ],
            },
            {
              id: 'irrigation_system',
              type: 'select',
              label: { th: 'ระบบการให้น้ำ', en: 'Irrigation System' },
              required: true,
              options: [
                { value: 'drip', label: { th: 'ระบบน้ำหยด', en: 'Drip System' } },
                { value: 'sprinkler', label: { th: 'ระบบสปริงเกลอร์', en: 'Sprinkler System' } },
                { value: 'manual', label: { th: 'รดน้ำด้วยมือ', en: 'Manual Watering' } },
                { value: 'flood', label: { th: 'ระบบน้ำท่วม', en: 'Flood System' } },
              ],
            },
          ],
        },
        {
          stepId: 3,
          title: {
            th: 'การจัดการพันธุ์และการปลูก',
            en: 'Genetics and Cultivation Management',
          },
          fields: [
            {
              id: 'seed_source',
              type: 'select',
              label: { th: 'แหล่งที่มาของเมล็ดพันธุ์', en: 'Seed Source' },
              required: true,
              options: [
                {
                  value: 'licensed_supplier',
                  label: { th: 'ผู้จำหน่ายที่ได้รับใบอนุญาต', en: 'Licensed Supplier' },
                },
                {
                  value: 'government_agency',
                  label: { th: 'หน่วยงานรัฐ', en: 'Government Agency' },
                },
                { value: 'self_bred', label: { th: 'พัฒนาพันธุ์เอง', en: 'Self-bred' } },
                { value: 'other', label: { th: 'อื่นๆ', en: 'Other' } },
              ],
            },
            {
              id: 'cultivation_method',
              type: 'select',
              label: { th: 'วิธีการปลูก', en: 'Cultivation Method' },
              required: true,
              options: [
                { value: 'indoor', label: { th: 'ในอาคาร', en: 'Indoor' } },
                { value: 'greenhouse', label: { th: 'เรือนกระจก', en: 'Greenhouse' } },
                { value: 'outdoor', label: { th: 'กลางแจ้ง', en: 'Outdoor' } },
                { value: 'mixed', label: { th: 'แบบผสม', en: 'Mixed' } },
              ],
            },
            {
              id: 'plant_training_techniques',
              type: 'checkbox',
              label: { th: 'เทคนิคการฝึกต้นกัญชา', en: 'Plant Training Techniques' },
              required: false,
              options: [
                { value: 'topping', label: { th: 'การตัดยอด (Topping)', en: 'Topping' } },
                {
                  value: 'lst',
                  label: { th: 'การผูกโค้ง (LST)', en: 'Low Stress Training (LST)' },
                },
                {
                  value: 'scrog',
                  label: { th: 'การใช้ตาข่าย (SCROG)', en: 'Screen of Green (SCROG)' },
                },
                { value: 'defoliation', label: { th: 'การตัดใบ', en: 'Defoliation' } },
              ],
            },
          ],
        },
        {
          stepId: 4,
          title: {
            th: 'การจัดการศัตรูพืชและโรค',
            en: 'Pest and Disease Management',
          },
          fields: [
            {
              id: 'pest_control_methods',
              type: 'checkbox',
              label: { th: 'วิธีการควบคุมศัตรูพืช', en: 'Pest Control Methods' },
              required: true,
              options: [
                {
                  value: 'organic_pesticides',
                  label: { th: 'ยาฆ่าแมลงอินทรีย์', en: 'Organic Pesticides' },
                },
                {
                  value: 'beneficial_insects',
                  label: { th: 'แมลงผู้ช่วย', en: 'Beneficial Insects' },
                },
                {
                  value: 'companion_planting',
                  label: { th: 'การปลูกพืชแบบเกื้อกูล', en: 'Companion Planting' },
                },
                {
                  value: 'physical_barriers',
                  label: { th: 'การป้องกันด้วยกายภาพ', en: 'Physical Barriers' },
                },
              ],
            },
            {
              id: 'disease_prevention',
              type: 'checkbox',
              label: { th: 'การป้องกันโรคพืช', en: 'Disease Prevention Methods' },
              required: true,
              options: [
                {
                  value: 'proper_ventilation',
                  label: { th: 'การระบายอากาศที่เหมาะสม', en: 'Proper Ventilation' },
                },
                {
                  value: 'humidity_control',
                  label: { th: 'การควบคุมความชื้น', en: 'Humidity Control' },
                },
                { value: 'sterilization', label: { th: 'การฆ่าเชื้อ', en: 'Sterilization' } },
                { value: 'quarantine', label: { th: 'การกักกัน', en: 'Quarantine' } },
              ],
            },
          ],
        },
        {
          stepId: 5,
          title: {
            th: 'การเก็บเกี่ยวและการแปรรูป',
            en: 'Harvesting and Processing',
          },
          fields: [
            {
              id: 'harvest_timing_method',
              type: 'select',
              label: { th: 'วิธีการตัดสินใจเวลาเก็บเกี่ยว', en: 'Harvest Timing Method' },
              required: true,
              options: [
                {
                  value: 'trichome_inspection',
                  label: { th: 'ตรวจดูไตรโคม', en: 'Trichome Inspection' },
                },
                {
                  value: 'flowering_days',
                  label: { th: 'นับวันออกดอก', en: 'Flowering Days Count' },
                },
                {
                  value: 'visual_appearance',
                  label: { th: 'ดูลักษณะภายนอก', en: 'Visual Appearance' },
                },
                { value: 'experience', label: { th: 'ประสบการณ์', en: 'Experience' } },
              ],
            },
            {
              id: 'drying_method',
              type: 'select',
              label: { th: 'วิธีการอบแห้ง', en: 'Drying Method' },
              required: true,
              options: [
                { value: 'hang_dry', label: { th: 'แขวนอบแห้ง', en: 'Hang Dry' } },
                { value: 'rack_dry', label: { th: 'อบบนชั้นวาง', en: 'Rack Dry' } },
                { value: 'machine_dry', label: { th: 'เครื่องอบแห้ง', en: 'Machine Dry' } },
              ],
            },
            {
              id: 'curing_duration',
              type: 'select',
              label: { th: 'ระยะเวลาการบ่ม', en: 'Curing Duration' },
              required: true,
              options: [
                { value: '1-2weeks', label: { th: '1-2 สัปดาห์', en: '1-2 weeks' } },
                { value: '3-4weeks', label: { th: '3-4 สัปดาห์', en: '3-4 weeks' } },
                { value: '1-2months', label: { th: '1-2 เดือน', en: '1-2 months' } },
                { value: 'longer', label: { th: 'มากกว่า 2 เดือน', en: 'Longer than 2 months' } },
              ],
            },
          ],
        },
        {
          stepId: 6,
          title: {
            th: 'การจัดเก็บและการขนส่ง',
            en: 'Storage and Transportation',
          },
          fields: [
            {
              id: 'storage_conditions',
              type: 'checkbox',
              label: { th: 'สภาพการจัดเก็บ', en: 'Storage Conditions' },
              required: true,
              options: [
                {
                  value: 'climate_controlled',
                  label: { th: 'ควบคุมอุณหภูมิและความชื้น', en: 'Climate Controlled' },
                },
                {
                  value: 'airtight_containers',
                  label: { th: 'ภาชนะปิดสนิท', en: 'Airtight Containers' },
                },
                { value: 'light_protection', label: { th: 'ป้องกันแสง', en: 'Light Protection' } },
                {
                  value: 'pest_protection',
                  label: { th: 'ป้องกันศัตรูพืช', en: 'Pest Protection' },
                },
              ],
            },
            {
              id: 'transportation_method',
              type: 'select',
              label: { th: 'วิธีการขนส่ง', en: 'Transportation Method' },
              required: true,
              options: [
                {
                  value: 'refrigerated_truck',
                  label: { th: 'รถห้องเย็น', en: 'Refrigerated Truck' },
                },
                { value: 'regular_vehicle', label: { th: 'รถยนต์ทั่วไป', en: 'Regular Vehicle' } },
                {
                  value: 'specialized_courier',
                  label: { th: 'บริษัทขนส่งเฉพาะทาง', en: 'Specialized Courier' },
                },
              ],
            },
          ],
        },
        {
          stepId: 7,
          title: {
            th: 'การปฏิบัติตามมาตรฐาน GACP',
            en: 'GACP Compliance Practices',
          },
          fields: [
            {
              id: 'documentation_practices',
              type: 'checkbox',
              label: { th: 'การจัดทำเอกสารประกอบ', en: 'Documentation Practices' },
              required: true,
              options: [
                { value: 'daily_logs', label: { th: 'บันทึกรายวัน', en: 'Daily Logs' } },
                { value: 'batch_records', label: { th: 'บันทึกชุดการผลิต', en: 'Batch Records' } },
                {
                  value: 'quality_tests',
                  label: { th: 'ผลการทดสอบคุณภาพ', en: 'Quality Test Results' },
                },
                {
                  value: 'traceability_system',
                  label: { th: 'ระบบตรวจสอบย้อนกลับ', en: 'Traceability System' },
                },
              ],
            },
            {
              id: 'staff_training',
              type: 'select',
              label: { th: 'การฝึกอบรมพนักงาน', en: 'Staff Training' },
              required: true,
              options: [
                {
                  value: 'regular_monthly',
                  label: { th: 'สม่ำเสมอทุกเดือน', en: 'Regular Monthly' },
                },
                { value: 'quarterly', label: { th: 'ทุกไตรมาส', en: 'Quarterly' } },
                { value: 'annually', label: { th: 'ทุกปี', en: 'Annually' } },
                { value: 'none', label: { th: 'ไม่มี', en: 'None' } },
              ],
            },
            {
              id: 'gacp_compliance_level',
              type: 'select',
              label: { th: 'ระดับการปฏิบัติตาม GACP', en: 'GACP Compliance Level' },
              required: true,
              options: [
                {
                  value: 'full_compliance',
                  label: { th: 'ปฏิบัติตามครบถ้วน 100%', en: 'Full Compliance 100%' },
                },
                {
                  value: 'mostly_compliant',
                  label: { th: 'ปฏิบัติตามส่วนใหญ่ 80%+', en: 'Mostly Compliant 80%+' },
                },
                {
                  value: 'partially_compliant',
                  label: { th: 'ปฏิบัติตามบางส่วน 50-80%', en: 'Partially Compliant 50-80%' },
                },
                {
                  value: 'minimal_compliance',
                  label: { th: 'ปฏิบัติตามน้อย <50%', en: 'Minimal Compliance <50%' },
                },
              ],
            },
          ],
        },
      ],
      scoring: {
        maxScore: 100,
        weights: {
          step1: 10, // Farm Info
          step2: 15, // Soil & Water
          step3: 15, // Genetics & Cultivation
          step4: 15, // Pest & Disease
          step5: 15, // Harvest & Process
          step6: 15, // Storage & Transport
          step7: 15, // GACP Compliance
        },
      },
    };

    this.templates.set('gacp-farm-survey-2024', farmSurveyTemplate);

    // 📊 Analytics Template for Regional Comparison
    const analyticsTemplate = {
      id: 'regional-analytics-2024',
      title: {
        th: 'การวิเคราะห์ข้อมูลแยกตามภูมิภาค',
        en: 'Regional Analytics Dashboard',
      },
      metrics: [
        'average_farm_size',
        'compliance_score_distribution',
        'cultivation_method_popularity',
        'pest_control_preferences',
        'harvest_timing_accuracy',
        'documentation_completeness',
      ],
      visualizations: [
        'regional_comparison_chart',
        'compliance_heatmap',
        'practice_adoption_rates',
        'seasonal_trends',
      ],
    };

    this.templates.set('regional-analytics-2024', analyticsTemplate);
  }

  setupAnalytics() {
    this.regions.forEach(region => {
      this.analytics.set(region, {
        totalResponses: 0,
        averageScore: 0,
        completionRate: 0,
        topPractices: [],
        improvementAreas: [],
        lastUpdated: new Date(),
      });
    });
  }

  async loadExistingData() {
    // Load existing survey responses from database
    // This would connect to MongoDB in production
    console.log('📂 Loading existing survey data...');

    // Mock data for demonstration
    this.generateMockSurveyData();
  }

  generateMockSurveyData() {
    // Generate sample survey responses for testing
    const sampleResponses = [
      {
        id: uuidv4(),
        surveyId: 'gacp-farm-survey-2024',
        respondentId: 'farmer-001',
        region: 'northern',
        responses: {
          farm_name: 'Green Valley Cannabis Farm',
          farm_region: 'northern',
          farm_size: 2500,
          years_experience: 8,
          soil_testing_frequency: 'quarterly',
          gacp_compliance_level: 'mostly_compliant',
        },
        score: 85,
        completedAt: new Date('2024-01-15'),
        language: 'th',
      },
      {
        id: uuidv4(),
        surveyId: 'gacp-farm-survey-2024',
        respondentId: 'farmer-002',
        region: 'central',
        responses: {
          farm_name: 'Bangkok Medical Cannabis',
          farm_region: 'central',
          farm_size: 1800,
          years_experience: 5,
          soil_testing_frequency: 'monthly',
          gacp_compliance_level: 'full_compliance',
        },
        score: 92,
        completedAt: new Date('2024-01-20'),
        language: 'en',
      },
    ];

    sampleResponses.forEach(response => {
      this.responses.set(response.id, response);
      this.updateRegionalAnalytics(response);
    });
  }

  // 🎯 Core Survey Functions

  async createSurvey(templateId, customization = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Survey template '${templateId}' not found`);
    }

    const surveyId = uuidv4();
    const survey = {
      id: surveyId,
      templateId,
      title: template.title,
      description: template.description,
      steps: template.steps,
      scoring: template.scoring,
      customization,
      createdAt: new Date(),
      status: 'active',
      responses: 0,
      analytics: {
        totalStarted: 0,
        totalCompleted: 0,
        averageCompletionTime: 0,
        dropoffPoints: [],
      },
    };

    this.surveyData.set(surveyId, survey);
    this.emit('survey:created', { surveyId, survey });

    return survey;
  }

  async startSurveyResponse(surveyId, respondentId, language = 'th') {
    const survey = this.surveyData.get(surveyId);
    if (!survey) {
      throw new Error(`Survey '${surveyId}' not found`);
    }

    const responseId = uuidv4();
    const response = {
      id: responseId,
      surveyId,
      respondentId,
      language,
      currentStep: 1,
      responses: {},
      startedAt: new Date(),
      lastUpdated: new Date(),
      status: 'in_progress',
      completionPercentage: 0,
    };

    this.responses.set(responseId, response);

    // Update survey analytics
    survey.analytics.totalStarted++;
    this.surveyData.set(surveyId, survey);

    this.emit('response:started', { responseId, response });
    return response;
  }

  async submitStepResponse(responseId, stepId, stepData) {
    const response = this.responses.get(responseId);
    if (!response) {
      throw new Error(`Response '${responseId}' not found`);
    }

    const survey = this.surveyData.get(response.surveyId);
    if (!survey) {
      throw new Error(`Survey '${response.surveyId}' not found`);
    }

    // Validate step data
    const step = survey.steps.find(s => s.stepId === stepId);
    if (!step) {
      throw new Error(`Step '${stepId}' not found in survey`);
    }

    const validation = this.validateStepData(step, stepData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Update response
    response.responses[`step_${stepId}`] = stepData;
    response.currentStep = Math.max(response.currentStep, stepId + 1);
    response.lastUpdated = new Date();
    response.completionPercentage = (stepId / survey.steps.length) * 100;

    // Check if survey is complete
    if (stepId === survey.steps.length) {
      await this.completeSurveyResponse(responseId);
    }

    this.responses.set(responseId, response);
    this.emit('step:completed', { responseId, stepId, stepData });

    return {
      success: true,
      response,
      nextStep: stepId < survey.steps.length ? stepId + 1 : null,
      isComplete: stepId === survey.steps.length,
    };
  }

  async completeSurveyResponse(responseId) {
    const response = this.responses.get(responseId);
    if (!response) {
      throw new Error(`Response '${responseId}' not found`);
    }

    const survey = this.surveyData.get(response.surveyId);
    if (!survey) {
      throw new Error(`Survey '${response.surveyId}' not found`);
    }

    // Calculate score
    const score = this.calculateSurveyScore(survey, response.responses);

    // Determine region from responses
    const region = response.responses.step_1?.farm_region || 'unknown';

    // Update response
    response.status = 'completed';
    response.completedAt = new Date();
    response.score = score;
    response.region = region;
    response.completionPercentage = 100;

    // Calculate completion time
    const completionTime = response.completedAt - response.startedAt;
    response.completionTimeMinutes = Math.round(completionTime / (1000 * 60));

    this.responses.set(responseId, response);

    // Update survey analytics
    survey.analytics.totalCompleted++;
    survey.responses++;

    // Update average completion time
    const allCompletedResponses = Array.from(this.responses.values()).filter(
      r => r.surveyId === survey.id && r.status === 'completed',
    );

    const totalTime = allCompletedResponses.reduce((sum, r) => sum + r.completionTimeMinutes, 0);
    survey.analytics.averageCompletionTime = totalTime / allCompletedResponses.length;

    this.surveyData.set(survey.id, survey);

    // Update regional analytics
    this.updateRegionalAnalytics(response);

    this.emit('response:completed', { responseId, response, score });
    return response;
  }

  validateStepData(step, stepData) {
    const errors = [];

    step.fields.forEach(field => {
      const value = stepData[field.id];

      // Check required fields
      if (field.required && (!value || value === '')) {
        errors.push(`Field '${field.id}' is required`);
        return;
      }

      // Skip validation if field is empty and not required
      if (!value) return;

      // Type-specific validation
      switch (field.type) {
        case 'text':
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            errors.push(
              `Field '${field.id}' must be at least ${field.validation.minLength} characters`,
            );
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            errors.push(
              `Field '${field.id}' must not exceed ${field.validation.maxLength} characters`,
            );
          }
          break;

        case 'number':
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push(`Field '${field.id}' must be a valid number`);
          } else {
            if (field.validation?.min && numValue < field.validation.min) {
              errors.push(`Field '${field.id}' must be at least ${field.validation.min}`);
            }
            if (field.validation?.max && numValue > field.validation.max) {
              errors.push(`Field '${field.id}' must not exceed ${field.validation.max}`);
            }
          }
          break;

        case 'select':
          const validOptions = field.options.map(opt => opt.value);
          if (!validOptions.includes(value)) {
            errors.push(`Field '${field.id}' contains invalid option`);
          }
          break;

        case 'checkbox':
          if (!Array.isArray(value)) {
            errors.push(`Field '${field.id}' must be an array`);
          } else {
            const validOptions = field.options.map(opt => opt.value);
            const invalidOptions = value.filter(v => !validOptions.includes(v));
            if (invalidOptions.length > 0) {
              errors.push(
                `Field '${field.id}' contains invalid options: ${invalidOptions.join(', ')}`,
              );
            }
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  calculateSurveyScore(survey, responses) {
    let totalScore = 0;
    const scoring = survey.scoring;

    survey.steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const stepData = responses[`step_${stepNumber}`] || {};
      const stepWeight = scoring.weights[`step${stepNumber}`] || 0;

      let stepScore = 0;
      let maxStepScore = 0;

      step.fields.forEach(field => {
        const value = stepData[field.id];
        maxStepScore += 1;

        if (value) {
          // Basic scoring - can be enhanced with more sophisticated logic
          if (field.type === 'select') {
            // Score based on GACP compliance value
            const complianceValues = {
              full_compliance: 1.0,
              mostly_compliant: 0.8,
              partially_compliant: 0.6,
              minimal_compliance: 0.3,
              monthly: 1.0,
              quarterly: 0.8,
              annually: 0.6,
              never: 0.0,
            };
            stepScore += complianceValues[value] || 0.7; // Default medium score
          } else if (field.type === 'checkbox') {
            // Score based on number of good practices selected
            stepScore += Math.min(value.length / 3, 1); // Max score if 3+ options selected
          } else {
            stepScore += 1; // Full score for completed field
          }
        }
      });

      // Normalize step score and apply weight
      const normalizedStepScore = maxStepScore > 0 ? stepScore / maxStepScore : 0;
      totalScore += normalizedStepScore * stepWeight;
    });

    return Math.round(totalScore);
  }

  updateRegionalAnalytics(response) {
    const region = response.region;
    if (!region || !this.analytics.has(region)) return;

    const analytics = this.analytics.get(region);

    // Update basic metrics
    analytics.totalResponses++;

    // Update average score
    const allRegionalResponses = Array.from(this.responses.values()).filter(
      r => r.region === region && r.status === 'completed',
    );

    const totalScore = allRegionalResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    analytics.averageScore = Math.round(totalScore / allRegionalResponses.length);

    // Update completion rate
    const startedResponses = Array.from(this.responses.values()).filter(r => r.region === region);
    analytics.completionRate = Math.round(
      (allRegionalResponses.length / startedResponses.length) * 100,
    );

    analytics.lastUpdated = new Date();
    this.analytics.set(region, analytics);
  }

  // 📊 Analytics and Reporting Functions

  async getRegionalAnalytics(region = null) {
    if (region) {
      return this.analytics.get(region) || null;
    }

    // Return all regional analytics
    const allAnalytics = {};
    this.regions.forEach(region => {
      allAnalytics[region] = this.analytics.get(region);
    });

    return allAnalytics;
  }

  async generateSurveyReport(surveyId, options = {}) {
    const survey = this.surveyData.get(surveyId);
    if (!survey) {
      throw new Error(`Survey '${surveyId}' not found`);
    }

    const responses = Array.from(this.responses.values()).filter(
      r => r.surveyId === surveyId && r.status === 'completed',
    );

    const report = {
      surveyInfo: {
        id: survey.id,
        title: survey.title,
        totalResponses: responses.length,
        generatedAt: new Date(),
      },
      overview: {
        averageScore:
          responses.length > 0
            ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length)
            : 0,
        averageCompletionTime: survey.analytics.averageCompletionTime,
        completionRate: (survey.analytics.totalCompleted / survey.analytics.totalStarted) * 100,
      },
      regionalBreakdown: {},
      practiceAnalysis: {},
      recommendations: [],
    };

    // Regional breakdown
    this.regions.forEach(region => {
      const regionalResponses = responses.filter(r => r.region === region);
      if (regionalResponses.length > 0) {
        report.regionalBreakdown[region] = {
          count: regionalResponses.length,
          averageScore: Math.round(
            regionalResponses.reduce((sum, r) => sum + r.score, 0) / regionalResponses.length,
          ),
          percentage: ((regionalResponses.length / responses.length) * 100).toFixed(1),
        };
      }
    });

    // Practice analysis
    report.practiceAnalysis = this.analyzePractices(responses);

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  analyzePractices(responses) {
    const analysis = {
      soilTesting: {},
      cultivationMethods: {},
      pestControl: {},
      gacpCompliance: {},
    };

    responses.forEach(response => {
      const step1 = response.responses.step_1 || {};
      const step2 = response.responses.step_2 || {};
      const step4 = response.responses.step_4 || {};
      const step7 = response.responses.step_7 || {};

      // Soil testing frequency analysis
      const soilFreq = step2.soil_testing_frequency;
      if (soilFreq) {
        analysis.soilTesting[soilFreq] = (analysis.soilTesting[soilFreq] || 0) + 1;
      }

      // Cultivation method analysis
      const cultivation = step1.cultivation_method;
      if (cultivation) {
        analysis.cultivationMethods[cultivation] =
          (analysis.cultivationMethods[cultivation] || 0) + 1;
      }

      // Pest control analysis
      const pestMethods = step4.pest_control_methods;
      if (Array.isArray(pestMethods)) {
        pestMethods.forEach(method => {
          analysis.pestControl[method] = (analysis.pestControl[method] || 0) + 1;
        });
      }

      // GACP compliance analysis
      const compliance = step7.gacp_compliance_level;
      if (compliance) {
        analysis.gacpCompliance[compliance] = (analysis.gacpCompliance[compliance] || 0) + 1;
      }
    });

    return analysis;
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Check overall score
    if (report.overview.averageScore < 70) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: {
          th: 'ปรับปรุงคะแนนโดยรวม',
          en: 'Improve Overall Score',
        },
        description: {
          th: 'คะแนนเฉลี่ยต่ำกว่า 70% ควรปรับปรุงการปฏิบัติตามมาตรฐาน GACP',
          en: 'Average score below 70%, should improve GACP compliance practices',
        },
      });
    }

    // Check regional disparities
    const regionalScores = Object.values(report.regionalBreakdown).map(r => r.averageScore);
    const scoreRange = Math.max(...regionalScores) - Math.min(...regionalScores);
    if (scoreRange > 20) {
      recommendations.push({
        type: 'training',
        priority: 'medium',
        title: {
          th: 'ลดความแตกต่างระหว่างภูมิภาค',
          en: 'Reduce Regional Disparities',
        },
        description: {
          th: 'มีความแตกต่างคะแนนระหว่างภูมิภาคมาก ควรจัดการฝึกอบรมเฉพาะพื้นที่',
          en: 'Large score differences between regions, consider region-specific training',
        },
      });
    }

    return recommendations;
  }

  // 🔍 Search and Query Functions

  async searchResponses(criteria = {}) {
    let results = Array.from(this.responses.values());

    // Filter by region
    if (criteria.region) {
      results = results.filter(r => r.region === criteria.region);
    }

    // Filter by score range
    if (criteria.minScore !== undefined) {
      results = results.filter(r => r.score >= criteria.minScore);
    }
    if (criteria.maxScore !== undefined) {
      results = results.filter(r => r.score <= criteria.maxScore);
    }

    // Filter by date range
    if (criteria.startDate) {
      results = results.filter(r => r.completedAt >= new Date(criteria.startDate));
    }
    if (criteria.endDate) {
      results = results.filter(r => r.completedAt <= new Date(criteria.endDate));
    }

    // Filter by completion status
    if (criteria.status) {
      results = results.filter(r => r.status === criteria.status);
    }

    return results;
  }

  // 📤 Export Functions

  async exportSurveyData(surveyId, format = 'json') {
    const responses = Array.from(this.responses.values()).filter(
      r => r.surveyId === surveyId && r.status === 'completed',
    );

    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(responses);
      case 'excel':
        return this.exportToExcel(responses);
      case 'json':
      default:
        return JSON.stringify(responses, null, 2);
    }
  }

  exportToCSV(responses) {
    if (responses.length === 0) return '';

    // Get all unique field names
    const fieldNames = new Set();
    responses.forEach(response => {
      Object.keys(response.responses).forEach(stepKey => {
        const stepData = response.responses[stepKey];
        Object.keys(stepData).forEach(fieldName => {
          fieldNames.add(fieldName);
        });
      });
    });

    // Create CSV header
    const headers = ['id', 'region', 'score', 'completedAt', ...Array.from(fieldNames)];
    let csv = headers.join(',') + '\n';

    // Add data rows
    responses.forEach(response => {
      const row = [
        response.id,
        response.region || '',
        response.score || '',
        response.completedAt ? response.completedAt.toISOString() : '',
      ];

      // Add field values
      fieldNames.forEach(fieldName => {
        let value = '';
        Object.values(response.responses).forEach(stepData => {
          if (stepData[fieldName] !== undefined) {
            value = Array.isArray(stepData[fieldName])
              ? stepData[fieldName].join(';')
              : stepData[fieldName];
          }
        });
        row.push(`"${value}"`);
      });

      csv += row.join(',') + '\n';
    });

    return csv;
  }

  exportToExcel(responses) {
    // This would require a library like 'xlsx' for full Excel export
    // For now, return CSV format with Excel-compatible structure
    return this.exportToCSV(responses);
  }

  // 🎯 Public API Methods

  getSurveyTemplates() {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      steps: template.steps.length,
      estimatedTime: template.estimatedTime,
    }));
  }

  getSurveyById(surveyId) {
    return this.surveyData.get(surveyId);
  }

  getResponseById(responseId) {
    return this.responses.get(responseId);
  }

  async getSystemStatistics() {
    const totalSurveys = this.surveyData.size;
    const totalResponses = this.responses.size;
    const completedResponses = Array.from(this.responses.values()).filter(
      r => r.status === 'completed',
    ).length;

    return {
      totalSurveys,
      totalResponses,
      completedResponses,
      completionRate:
        totalResponses > 0 ? ((completedResponses / totalResponses) * 100).toFixed(1) : 0,
      regionalBreakdown: await this.getRegionalAnalytics(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

module.exports = GACPSurveySystem;
