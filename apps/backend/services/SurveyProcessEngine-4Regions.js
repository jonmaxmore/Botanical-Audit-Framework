/**
 * Survey Process Engine - 4 Regions Version
 * Manages GACP survey workflow with 4 regions support
 * Regions: Central (ภาคกลาง), South (ภาคใต้), North (ภาคเหนือ), Northeast (ภาคอีสาน)
 *
 * Features:
 * - 7 Steps Wizard Interface
 * - Region-specific questions
 * - Auto-calculation (Cost, Revenue, Profit)
 * - Auto-scoring with regional bonus
 * - Regional analytics and comparison
 *
 * States: DRAFT → IN_PROGRESS → SUBMITTED → SCORED → COMPLETED
 */

const EventEmitter = require('events');

class SurveyProcessEngine extends EventEmitter {
  constructor(db) {
    super();
    this.db = db;
    this.surveys = db.collection('surveys');
    this.surveyResponses = db.collection('survey_responses');
    this.regionalAnalytics = db.collection('regional_analytics');

    // Survey states
    this.STATES = {
      DRAFT: 'draft',
      IN_PROGRESS: 'in_progress',
      SUBMITTED: 'submitted',
      SCORED: 'scored',
      COMPLETED: 'completed',
    };

    // 4 Regions
    this.REGIONS = {
      CENTRAL: 'central',
      SOUTH: 'south',
      NORTH: 'north',
      NORTHEAST: 'northeast',
    };

    // Region names (Thai)
    this.REGION_NAMES = {
      central: 'ภาคกลาง',
      south: 'ภาคใต้',
      north: 'ภาคเหนือ',
      northeast: 'ภาคตะวันออกเฉียงเหนือ',
    };

    // 7 Wizard Steps
    this.WIZARD_STEPS = {
      REGION_SELECTION: 1,
      PERSONAL_INFO: 2,
      FARM_INFO: 3,
      MANAGEMENT: 4,
      COST_REVENUE: 5,
      MARKET_SALES: 6,
      PROBLEMS_NEEDS: 7,
    };

    // Question types
    this.QUESTION_TYPES = {
      TEXT: 'text',
      NUMBER: 'number',
      SELECT: 'select',
      RADIO: 'radio',
      CHECKBOX: 'checkbox',
      TEXTAREA: 'textarea',
    };

    // Scoring weights
    this.SCORING_WEIGHTS = {
      FARM_QUALITY: 0.4,
      PRODUCTION_EFFICIENCY: 0.4,
      COMPETITIVENESS: 0.2,
    };

    // Regional bonus points (max)
    this.REGIONAL_BONUS = {
      central: 15, // เทคโนโลยี, IoT, Automation
      south: 10, // การจัดการความชื้น, ป้องกันเชื้อรา
      north: 15, // ออร์แกนิก, ความสูง, สายพันธุ์ดั้งเดิม
      northeast: 15, // ระบบชลประทาน, ถังเก็บน้ำ, ต้นทุนต่ำ
    };

    console.log('[SurveyProcessEngine-4Regions] Initialized successfully');
  }

  // ============================================================================
  // SURVEY CREATION & MANAGEMENT
  // ============================================================================

  /**
   * Create a new survey response (Start wizard)
   */
  async createSurveyResponse(data) {
    try {
      const surveyResponse = {
        surveyId: data.surveyId,
        userId: data.userId,
        region: data.region, // central/south/north/northeast

        // Wizard progress
        currentStep: this.WIZARD_STEPS.REGION_SELECTION,
        progress: 0, // 0-100%

        // State
        state: this.STATES.DRAFT,
        startedAt: new Date(),
        lastSavedAt: new Date(),

        // Data sections
        regionSelection: null,
        personalInfo: null,
        farmInfo: null,
        managementProduction: null,
        costRevenue: null,
        marketSales: null,
        problemsNeeds: null,

        // Calculated fields
        calculatedFields: {
          totalCost: 0,
          totalRevenue: 0,
          netProfit: 0,
          profitMargin: 0,
          costPerKg: 0,
          costPerPlant: 0,
        },

        // Scores
        scores: null,

        // Metadata
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      };

      const result = await this.surveyResponses.insertOne(surveyResponse);
      surveyResponse._id = result.insertedId;

      this.emit('survey:created', {
        surveyResponseId: result.insertedId,
        userId: data.userId,
        region: data.region,
      });

      console.log(`[Survey] Created new response: ${result.insertedId} for region: ${data.region}`);

      return {
        success: true,
        data: surveyResponse,
      };
    } catch (error) {
      console.error('[Survey] Error creating survey response:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update wizard step data
   * @param {string} surveyId - Survey response ID
   * @param {number} stepId - Step number (1-7)
   * @param {object} stepData - Step data to save
   * @param {string} userId - User ID
   * @returns {object} Updated survey response
   */
  async updateWizardStep(surveyId, stepId, stepData, userId) {
    try {
      const { ObjectId } = require('mongodb');

      // Validate step ID
      if (stepId < 1 || stepId > 7) {
        throw new Error('Invalid step ID. Must be between 1-7');
      }

      // Get current survey response
      const surveyResponse = await this.surveyResponses.findOne({
        _id: new ObjectId(surveyId),
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Check if user owns this survey
      if (surveyResponse.userId !== userId) {
        throw new Error('Unauthorized: You do not own this survey');
      }

      // Map step ID to field name
      const stepFieldMap = {
        1: 'regionSelection',
        2: 'personalInfo',
        3: 'farmInfo',
        4: 'managementProduction',
        5: 'costRevenue',
        6: 'marketSales',
        7: 'problemsNeeds',
      };

      const fieldName = stepFieldMap[stepId];

      // Update step data
      const updateData = {
        [fieldName]: stepData,
        currentStep: Math.max(surveyResponse.currentStep || 1, stepId),
        progress: Math.round((stepId / 7) * 100),
        lastSavedAt: new Date(),
        'metadata.updatedAt': new Date(),
      };

      // If all steps completed, change state to SUBMITTED
      if (stepId === 7 && stepData) {
        updateData.state = this.STATES.SUBMITTED;
      } else if (surveyResponse.state === this.STATES.DRAFT) {
        updateData.state = this.STATES.IN_PROGRESS;
      }

      // Perform update
      const result = await this.surveyResponses.findOneAndUpdate(
        { _id: new ObjectId(surveyId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Failed to update survey response');
      }

      const updatedResponse = result;

      // Emit event
      this.emit('survey:step-updated', {
        surveyResponseId: surveyId,
        stepId,
        userId,
        currentStep: updatedResponse.currentStep,
        progress: updatedResponse.progress,
      });

      console.log(`[Survey] Updated step ${stepId} for survey: ${surveyId}`);

      return {
        success: true,
        data: updatedResponse,
        currentStep: updatedResponse.currentStep,
        progress: updatedResponse.progress,
        isComplete: updatedResponse.state === this.STATES.SUBMITTED,
      };
    } catch (error) {
      console.error('[Survey] Error updating wizard step:', error);
      throw error;
    }
  }

  /**
   * Save draft (Auto-save every 30 seconds from frontend)
   */
  async saveDraft(surveyResponseId, stepData) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Determine which section to update based on current step
      const updateData = {
        'metadata.updatedAt': new Date(),
        lastSavedAt: new Date(),
      };

      switch (surveyResponse.currentStep) {
        case this.WIZARD_STEPS.REGION_SELECTION:
          updateData.regionSelection = stepData;
          break;
        case this.WIZARD_STEPS.PERSONAL_INFO:
          updateData.personalInfo = stepData;
          break;
        case this.WIZARD_STEPS.FARM_INFO:
          updateData.farmInfo = stepData;
          break;
        case this.WIZARD_STEPS.MANAGEMENT:
          updateData.managementProduction = stepData;
          break;
        case this.WIZARD_STEPS.COST_REVENUE:
          updateData.costRevenue = stepData;
          // Auto-calculate
          updateData.calculatedFields = this.calculateFinancials(stepData);
          break;
        case this.WIZARD_STEPS.MARKET_SALES:
          updateData.marketSales = stepData;
          break;
        case this.WIZARD_STEPS.PROBLEMS_NEEDS:
          updateData.problemsNeeds = stepData;
          break;
      }

      // Update progress
      updateData.progress = this.calculateProgress(surveyResponse.currentStep);

      await this.surveyResponses.updateOne({ _id: surveyResponseId }, { $set: updateData });

      const updated = await this.surveyResponses.findOne({ _id: surveyResponseId });

      this.emit('survey:draft_saved', {
        surveyResponseId,
        step: surveyResponse.currentStep,
        progress: updateData.progress,
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('[Survey] Error saving draft:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Move to next wizard step
   */
  async nextStep(surveyResponseId, currentStepData) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Validate current step data
      const validation = await this.validateStepData(
        surveyResponse.currentStep,
        currentStepData,
        surveyResponse.region
      );

      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Save current step data
      await this.saveDraft(surveyResponseId, currentStepData);

      // Move to next step
      const nextStep = surveyResponse.currentStep + 1;

      if (nextStep > 7) {
        return {
          success: false,
          error: 'Already at final step',
        };
      }

      // Update state if moving from DRAFT to IN_PROGRESS
      const newState =
        surveyResponse.state === this.STATES.DRAFT ? this.STATES.IN_PROGRESS : surveyResponse.state;

      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            currentStep: nextStep,
            state: newState,
            'metadata.updatedAt': new Date(),
          },
        }
      );

      const updated = await this.surveyResponses.findOne({ _id: surveyResponseId });

      this.emit('survey:step_changed', {
        surveyResponseId,
        fromStep: surveyResponse.currentStep,
        toStep: nextStep,
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('[Survey] Error moving to next step:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Move to previous wizard step
   */
  async previousStep(surveyResponseId) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      const prevStep = surveyResponse.currentStep - 1;

      if (prevStep < 1) {
        return {
          success: false,
          error: 'Already at first step',
        };
      }

      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            currentStep: prevStep,
            'metadata.updatedAt': new Date(),
          },
        }
      );

      const updated = await this.surveyResponses.findOne({ _id: surveyResponseId });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('[Survey] Error moving to previous step:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // SUBMISSION & SCORING
  // ============================================================================

  /**
   * Submit completed survey
   */
  async submitSurvey(surveyResponseId, userId) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        throw new Error('Survey response not found');
      }

      // Check if all steps are complete
      if (surveyResponse.progress < 100) {
        return {
          success: false,
          error: 'Please complete all steps before submitting',
        };
      }

      // Validate all data
      const validation = await this.validateAllData(surveyResponse);

      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Calculate final scores
      const scores = await this.calculateScores(surveyResponse);

      // Update to SUBMITTED state
      await this.surveyResponses.updateOne(
        { _id: surveyResponseId },
        {
          $set: {
            state: this.STATES.SCORED,
            submittedAt: new Date(),
            scores: scores,
            progress: 100,
            'metadata.updatedAt': new Date(),
            'metadata.submittedBy': userId,
          },
        }
      );

      const submitted = await this.surveyResponses.findOne({ _id: surveyResponseId });

      // Update regional analytics
      await this.updateRegionalAnalytics(submitted);

      this.emit('survey:submitted', {
        surveyResponseId,
        userId,
        region: surveyResponse.region,
        totalScore: scores.totalScore,
        rank: scores.rank,
      });

      console.log(
        `[Survey] Submitted: ${surveyResponseId}, Score: ${scores.totalScore}, Rank: ${scores.rank}`
      );

      return {
        success: true,
        data: submitted,
        scores: scores,
      };
    } catch (error) {
      console.error('[Survey] Error submitting survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate step data
   */
  async validateStepData(step, data, region) {
    const errors = [];

    switch (step) {
      case this.WIZARD_STEPS.REGION_SELECTION:
        if (!data.region || !Object.values(this.REGIONS).includes(data.region)) {
          errors.push('กรุณาเลือกภูมิภาค');
        }
        if (!data.province) errors.push('กรุณาเลือกจังหวัด');
        break;

      case this.WIZARD_STEPS.PERSONAL_INFO:
        if (!data.firstName) errors.push('กรุณาระบุชื่อ');
        if (!data.lastName) errors.push('กรุณาระบุนามสกุล');
        if (!data.phone) errors.push('กรุณาระบุเบอร์โทรศัพท์');
        if (data.phone && !/^0\d{8,9}$/.test(data.phone.replace(/-/g, ''))) {
          errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง');
        }
        if (!data.cannabisExperienceYears || data.cannabisExperienceYears < 0) {
          errors.push('กรุณาระบุประสบการณ์ปลูกกัญชา');
        }
        break;

      case this.WIZARD_STEPS.FARM_INFO:
        if (!data.totalLandSize || data.totalLandSize.rai < 0) {
          errors.push('กรุณาระบุขนาดพื้นที่');
        }
        if (!data.cannabisAreaSize || data.cannabisAreaSize.rai < 0) {
          errors.push('กรุณาระบุพื้นที่ปลูกกัญชา');
        }
        if (!data.cultivationType || data.cultivationType.length === 0) {
          errors.push('กรุณาเลือกประเภทการปลูก');
        }
        break;

      case this.WIZARD_STEPS.MANAGEMENT:
        if (!data.cyclesPerYear || data.cyclesPerYear < 1) {
          errors.push('กรุณาระบุจำนวนรอบการปลูกต่อปี');
        }
        if (!data.plantsPerCycle || data.plantsPerCycle < 1) {
          errors.push('กรุณาระบุจำนวนต้นต่อรอบ');
        }
        break;

      case this.WIZARD_STEPS.COST_REVENUE:
        if (data.costs) {
          if (data.costs.seeds < 0) errors.push('ต้นทุนเมล็ดพันธุ์ต้องไม่ติดลบ');
          if (data.costs.fertilizer < 0) errors.push('ต้นทุนปุ๋ยต้องไม่ติดลบ');
          if (data.costs.labor < 0) errors.push('ต้นทุนแรงงานต้องไม่ติดลบ');
        }
        if (!data.yieldPerCycle || data.yieldPerCycle < 0) {
          errors.push('กรุณาระบุผลผลิตต่อรอบ');
        }
        if (!data.pricePerKg || data.pricePerKg < 0) {
          errors.push('กรุณาระบุราคาขายต่อกิโลกรัม');
        }
        break;

      case this.WIZARD_STEPS.MARKET_SALES:
        if (!data.salesChannels || data.salesChannels.length === 0) {
          errors.push('กรุณาเลือกช่องทางการขาย');
        }
        break;

      case this.WIZARD_STEPS.PROBLEMS_NEEDS:
        // Optional fields, no validation needed
        break;
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Validate all survey data before submission
   */
  async validateAllData(surveyResponse) {
    const errors = [];

    // Check all required sections are filled
    if (!surveyResponse.regionSelection) {
      errors.push('ข้อมูลภูมิภาคไม่ครบถ้วน');
    }
    if (!surveyResponse.personalInfo) {
      errors.push('ข้อมูลส่วนตัวไม่ครบถ้วน');
    }
    if (!surveyResponse.farmInfo) {
      errors.push('ข้อมูลฟาร์มไม่ครบถ้วน');
    }
    if (!surveyResponse.managementProduction) {
      errors.push('ข้อมูลการจัดการไม่ครบถ้วน');
    }
    if (!surveyResponse.costRevenue) {
      errors.push('ข้อมูลต้นทุนและรายได้ไม่ครบถ้วน');
    }
    if (!surveyResponse.marketSales) {
      errors.push('ข้อมูลการตลาดไม่ครบถ้วน');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  /**
   * Calculate financial metrics
   */
  calculateFinancials(costRevenueData) {
    const costs = costRevenueData.costs || {};

    // Total cost
    const totalCost =
      (costs.seeds || 0) +
      (costs.fertilizer || 0) +
      (costs.pesticides || 0) +
      (costs.labor || 0) +
      (costs.utilities || 0) +
      (costs.equipment || 0) +
      (costs.other || 0);

    // Revenue
    const yieldPerCycle = costRevenueData.yieldPerCycle || 0;
    const pricePerKg = costRevenueData.pricePerKg || 0;
    const totalRevenue = yieldPerCycle * pricePerKg;

    // Profit
    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Cost per unit
    const costPerKg = yieldPerCycle > 0 ? totalCost / yieldPerCycle : 0;
    const plantsPerCycle = costRevenueData.plantsPerCycle || 1;
    const costPerPlant = plantsPerCycle > 0 ? totalCost / plantsPerCycle : 0;

    return {
      totalCost: Math.round(totalCost),
      totalRevenue: Math.round(totalRevenue),
      netProfit: Math.round(netProfit),
      profitMargin: Math.round(profitMargin * 10) / 10,
      costPerKg: Math.round(costPerKg),
      costPerPlant: Math.round(costPerPlant),
    };
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(currentStep) {
    return Math.round((currentStep / 7) * 100);
  }

  /**
   * Calculate all scores (Farm Quality, Production Efficiency, Competitiveness)
   */
  async calculateScores(surveyResponse) {
    try {
      // 1. Farm Quality Score (0-100, weight 40%)
      const farmQuality = this.calculateFarmQualityScore(surveyResponse);

      // 2. Production Efficiency Score (0-100, weight 40%)
      const productionEfficiency = this.calculateProductionEfficiencyScore(surveyResponse);

      // 3. Competitiveness Score (0-100, weight 20%)
      const competitiveness = this.calculateCompetitivenessScore(surveyResponse);

      // 4. Regional Bonus
      const regionalBonus = this.calculateRegionalBonus(surveyResponse);

      // 5. Total Score (weighted average + bonus, max 100)
      const totalScore = Math.min(
        farmQuality * this.SCORING_WEIGHTS.FARM_QUALITY +
          productionEfficiency * this.SCORING_WEIGHTS.PRODUCTION_EFFICIENCY +
          competitiveness * this.SCORING_WEIGHTS.COMPETITIVENESS +
          regionalBonus,
        100
      );

      // 6. Determine rank
      let rank;
      if (totalScore >= 80)
        rank = 'excellent'; // ดีเยี่ยม
      else if (totalScore >= 65)
        rank = 'good'; // ดี
      else if (totalScore >= 50)
        rank = 'fair'; // พอใช้
      else rank = 'poor'; // ต้องปรับปรุง

      return {
        farmQuality: Math.round(farmQuality * 10) / 10,
        productionEfficiency: Math.round(productionEfficiency * 10) / 10,
        competitiveness: Math.round(competitiveness * 10) / 10,
        regionalBonus: Math.round(regionalBonus * 10) / 10,
        totalScore: Math.round(totalScore * 10) / 10,
        rank: rank,
        calculatedAt: new Date(),
      };
    } catch (error) {
      console.error('[Survey] Error calculating scores:', error);
      return null;
    }
  }

  /**
   * Calculate Farm Quality Score (0-100)
   */
  calculateFarmQualityScore(surveyResponse) {
    let score = 0;
    const farmInfo = surveyResponse.farmInfo || {};
    const management = surveyResponse.managementProduction || {};

    // 1. ขนาดพื้นที่ (20 คะแนน)
    const cannabisArea = farmInfo.cannabisAreaSize || {};
    const totalRai = (cannabisArea.rai || 0) + (cannabisArea.ngan || 0) / 4;

    if (totalRai >= 10) score += 20;
    else if (totalRai >= 5) score += 15;
    else if (totalRai >= 2) score += 10;
    else score += 5;

    // 2. ประเภทการปลูก (20 คะแนน)
    const cultivationType = farmInfo.cultivationType || [];
    if (cultivationType.includes('indoor')) score += 20;
    else if (cultivationType.includes('greenhouse')) score += 18;
    else if (cultivationType.includes('mixed')) score += 17;
    else if (cultivationType.includes('outdoor')) score += 15;

    // 3. แหล่งน้ำ (15 คะแนน)
    const waterSources = farmInfo.waterSources || [];
    if (waterSources.length >= 3) score += 15;
    else if (waterSources.length >= 2) score += 10;
    else score += 5;

    // 4. การจัดการ (25 คะแนน)
    let managementScore = 0;

    // Fertilizer type
    if (management.fertilizer) {
      if (management.fertilizer.type === 'organic') managementScore += 8;
      else if (management.fertilizer.type === 'mixed') managementScore += 6;
      else managementScore += 4;
    }

    // Pest control method
    if (management.pestControl) {
      if (management.pestControl.method === 'biological') managementScore += 8;
      else if (management.pestControl.method === 'mixed') managementScore += 6;
      else managementScore += 4;
    }

    // Labor
    if (management.labor) {
      const permanentWorkers = management.labor.permanent || 0;
      if (permanentWorkers >= 3) managementScore += 9;
      else if (permanentWorkers >= 1) managementScore += 6;
      else managementScore += 3;
    }

    score += managementScore;

    // 5. จำนวนรอบ/ปี (20 คะแนน)
    const cyclesPerYear = management.cyclesPerYear || 0;
    if (cyclesPerYear >= 4) score += 20;
    else if (cyclesPerYear >= 3) score += 15;
    else if (cyclesPerYear >= 2) score += 10;
    else score += 5;

    return Math.min(score, 100);
  }

  /**
   * Calculate Production Efficiency Score (0-100)
   */
  calculateProductionEfficiencyScore(surveyResponse) {
    let score = 0;
    const farmInfo = surveyResponse.farmInfo || {};
    const calculated = surveyResponse.calculatedFields || {};

    // 1. ผลผลิตต่อไร่ (40 คะแนน)
    const cannabisArea = farmInfo.cannabisAreaSize || {};
    const totalRai = (cannabisArea.rai || 0) + (cannabisArea.ngan || 0) / 4;
    const yieldPerCycle = surveyResponse.costRevenue?.yieldPerCycle || 0;
    const yieldPerRai = totalRai > 0 ? yieldPerCycle / totalRai : 0;

    if (yieldPerRai >= 200) score += 40;
    else if (yieldPerRai >= 150) score += 35;
    else if (yieldPerRai >= 100) score += 30;
    else if (yieldPerRai >= 50) score += 20;
    else score += 10;

    // 2. กำไรสุทธิ (40 คะแนน)
    const netProfit = calculated.netProfit || 0;

    if (netProfit >= 500000) score += 40;
    else if (netProfit >= 300000) score += 35;
    else if (netProfit >= 150000) score += 30;
    else if (netProfit >= 50000) score += 20;
    else if (netProfit > 0) score += 10;
    else score += 0;

    // 3. ต้นทุนต่อหน่วย (20 คะแนน)
    const costPerKg = calculated.costPerKg || 0;

    if (costPerKg <= 500) score += 20;
    else if (costPerKg <= 1000) score += 15;
    else if (costPerKg <= 1500) score += 10;
    else score += 5;

    return Math.min(score, 100);
  }

  /**
   * Calculate Competitiveness Score (0-100)
   */
  calculateCompetitivenessScore(surveyResponse) {
    let score = 0;
    const costRevenue = surveyResponse.costRevenue || {};
    const marketSales = surveyResponse.marketSales || {};
    const personalInfo = surveyResponse.personalInfo || {};

    // 1. ราคาขาย (30 คะแนน)
    const pricePerKg = costRevenue.pricePerKg || 0;

    if (pricePerKg >= 5000) score += 30;
    else if (pricePerKg >= 3000) score += 25;
    else if (pricePerKg >= 2000) score += 20;
    else if (pricePerKg >= 1000) score += 15;
    else score += 10;

    // 2. ช่องทางการขาย (30 คะแนน)
    const salesChannels = marketSales.salesChannels || [];
    const channelScores = {
      export: 10,
      hospital: 9,
      distributor: 7,
      direct: 6,
      pharmacy: 5,
    };

    const maxChannelScore = Math.max(...salesChannels.map(ch => channelScores[ch] || 0), 0);
    score += maxChannelScore * 3;

    // 3. ประสบการณ์ (20 คะแนน)
    const experience = personalInfo.cannabisExperienceYears || 0;

    if (experience >= 5) score += 20;
    else if (experience >= 3) score += 15;
    else if (experience >= 1) score += 10;
    else score += 5;

    // 4. ระดับการศึกษา (20 คะแนน)
    const education = personalInfo.education || 'other';
    const educationScores = {
      master: 20,
      bachelor: 18,
      vocational: 15,
      secondary: 12,
      elementary: 10,
      other: 10,
    };

    score += educationScores[education] || 10;

    return Math.min(score, 100);
  }

  /**
   * Calculate Regional Bonus (0-15 points)
   */
  calculateRegionalBonus(surveyResponse) {
    let bonus = 0;
    const region = surveyResponse.region;
    const farmInfo = surveyResponse.farmInfo || {};
    const management = surveyResponse.managementProduction || {};
    const calculated = surveyResponse.calculatedFields || {};
    const regionSpecific = farmInfo.regionSpecific || {};

    switch (region) {
      case this.REGIONS.CENTRAL:
        // ภาคกลาง - โบนัสจากเทคโนโลยี
        if (regionSpecific.useTechnology) bonus += 5;
        if (regionSpecific.iotSensors) bonus += 5;
        if (regionSpecific.automatedSystem) bonus += 5;
        break;

      case this.REGIONS.SOUTH:
        // ภาคใต้ - โบนัสจากการจัดการความชื้น
        if (regionSpecific.drainageSystem) bonus += 5;
        if (regionSpecific.fungusPreventionMethod) bonus += 5;
        break;

      case this.REGIONS.NORTH:
        // ภาคเหนือ - โบนัสจากออร์แกนิกและคุณภาพ
        if (regionSpecific.organicCertified) bonus += 5;
        if (regionSpecific.traditionalStrains) bonus += 5;
        if ((regionSpecific.altitude || 0) > 500) bonus += 5;
        break;

      case this.REGIONS.NORTHEAST:
        // ภาคอีสาน - โบนัสจากการจัดการน้ำและต้นทุน
        if (regionSpecific.irrigationSystem && regionSpecific.irrigationSystem !== 'none')
          bonus += 5;
        if (regionSpecific.waterStorageTank) bonus += 5;
        if ((calculated.costPerKg || 9999) < 800) bonus += 5;
        break;
    }

    return Math.min(bonus, this.REGIONAL_BONUS[region] || 0);
  }

  // ============================================================================
  // REGIONAL ANALYTICS
  // ============================================================================

  /**
   * Update regional analytics after survey submission
   */
  async updateRegionalAnalytics(surveyResponse) {
    try {
      const region = surveyResponse.region;
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Find or create analytics document
      const analyticsId = `${region}_${year}_${month}`;

      const analytics = await this.regionalAnalytics.findOne({
        _id: analyticsId,
      });

      if (!analytics) {
        // Create new analytics document
        await this.regionalAnalytics.insertOne({
          _id: analyticsId,
          region: region,
          year: year,
          month: month,
          period: 'monthly',
          statistics: {
            totalResponses: 1,
            completionRate: 100,
            averageScores: surveyResponse.scores,
            averageYield: surveyResponse.costRevenue?.yieldPerCycle || 0,
            averageProfit: surveyResponse.calculatedFields?.netProfit || 0,
            averagePrice: surveyResponse.costRevenue?.pricePerKg || 0,
          },
          generatedAt: new Date(),
        });
      } else {
        // Update existing analytics (simplified - should use aggregation)
        await this.regionalAnalytics.updateOne(
          { _id: analyticsId },
          {
            $inc: {
              'statistics.totalResponses': 1,
            },
            $set: {
              generatedAt: new Date(),
            },
          }
        );
      }

      console.log(`[Analytics] Updated regional analytics for ${region}`);
    } catch (error) {
      console.error('[Analytics] Error updating regional analytics:', error);
    }
  }

  /**
   * Get regional analytics
   */
  async getRegionalAnalytics(region, year, month) {
    try {
      const analyticsId = `${region}_${year}_${month}`;

      const analytics = await this.regionalAnalytics.findOne({
        _id: analyticsId,
      });

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      console.error('[Analytics] Error getting regional analytics:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Compare regions
   */
  async compareRegions(year, month) {
    try {
      const regions = Object.values(this.REGIONS);
      const comparison = {};

      for (const region of regions) {
        const result = await this.getRegionalAnalytics(region, year, month);
        if (result.success && result.data) {
          comparison[region] = result.data.statistics;
        }
      }

      return {
        success: true,
        data: comparison,
      };
    } catch (error) {
      console.error('[Analytics] Error comparing regions:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get survey response by ID
   */
  async getSurveyResponse(surveyResponseId) {
    try {
      const surveyResponse = await this.surveyResponses.findOne({
        _id: surveyResponseId,
      });

      if (!surveyResponse) {
        return {
          success: false,
          error: 'Survey response not found',
        };
      }

      return {
        success: true,
        data: surveyResponse,
      };
    } catch (error) {
      console.error('[Survey] Error getting survey response:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's draft survey
   */
  async getDraftSurvey(userId) {
    try {
      const draft = await this.surveyResponses.findOne({
        userId: userId,
        state: { $in: [this.STATES.DRAFT, this.STATES.IN_PROGRESS] },
      });

      return {
        success: true,
        data: draft,
      };
    } catch (error) {
      console.error('[Survey] Error getting draft survey:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's survey responses
   */
  async getUserSurveyResponses(userId) {
    try {
      const responses = await this.surveyResponses
        .find({
          userId: userId,
        })
        .sort({ 'metadata.createdAt': -1 })
        .toArray();

      return {
        success: true,
        data: responses,
      };
    } catch (error) {
      console.error('[Survey] Error getting user surveys:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete draft survey
   */
  async deleteDraft(surveyResponseId, userId) {
    try {
      const result = await this.surveyResponses.deleteOne({
        _id: surveyResponseId,
        userId: userId,
        state: { $in: [this.STATES.DRAFT, this.STATES.IN_PROGRESS] },
      });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Draft not found or cannot be deleted',
        };
      }

      this.emit('survey:deleted', { surveyResponseId, userId });

      return {
        success: true,
      };
    } catch (error) {
      console.error('[Survey] Error deleting draft:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = SurveyProcessEngine;
