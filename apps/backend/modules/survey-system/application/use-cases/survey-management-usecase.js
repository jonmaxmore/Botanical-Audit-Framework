/**
 * Survey Management Use Case - Survey System Application Layer
 *
 * Business Logic & Process Orchestration:
 * การจัดการแบบสอบถามและการประเมินตามมาตรฐาน GACP
 *
 * Complete Survey Management Workflow:
 * 1. Survey Creation & Configuration → 2. Question Management → 3. Publication & Distribution →
 * 4. Response Collection → 5. Progress Monitoring → 6. Scoring & Assessment →
 * 7. Report Generation → 8. Follow-up Management
 *
 * Business Rules:
 * - แบบสอบถามต้องครอบคลุมมาตรฐาน GACP ที่เกี่ยวข้อง
 * - การให้คะแนนต้องยุติธรรมและสะท้อนระดับการปฏิบัติตามมาตรฐาน
 * - รายงานผลต้องให้ข้อมูลที่เป็นประโยชน์และข้อเสนะแนะที่ชัดเจน
 * - การติดตามความก้าวหน้าต้องช่วยผู้ประเมินปรับปรุงการปฏิบัติ
 * - ระบบต้องรองรับการประเมินหลายรูปแบบและหลายระดับ
 */

class SurveyManagementUseCase {
  constructor(options = {}) {
    this.surveyRepository = options.surveyRepository;
    this.responseRepository = options.responseRepository;
    this.userRepository = options.userRepository;
    this.farmRepository = options.farmRepository;
    this.gacpStandardsService = options.gacpStandardsService;
    this.notificationService = options.notificationService;
    this.reportingService = options.reportingService;
    this.validationService = options.validationService;
    this.auditService = options.auditService;
    this.logger = options.logger || console;

    // Business configuration
    this.businessConfig = {
      // Survey configuration limits
      maxQuestionsPerSurvey: 200,
      maxSectionsPerSurvey: 15,
      minQuestionsPerSection: 1,
      maxOptionsPerQuestion: 10,

      // Scoring configuration
      defaultPassingScore: 70,
      minPassingScore: 50,
      maxPassingScore: 95,

      // Time limits
      defaultTimeLimit: 120, // minutes
      maxTimeLimit: 480, // 8 hours
      autoSaveInterval: 300, // 5 minutes

      // GACP compliance requirements
      mandatoryGACPCategories: [
        'CULTIVATION',
        'HARVESTING',
        'POST_HARVEST',
        'STORAGE',
        'QUALITY_CONTROL',
        'DOCUMENTATION'
      ],

      // Response management
      maxResponsesPerUser: 10,
      responseRetentionDays: 2555, // 7 years
      reportingLevels: ['INDIVIDUAL', 'FARM', 'ORGANIZATION', 'AGGREGATE']
    };

    // GACP standard question templates
    this.gacpQuestionTemplates = {
      CULTIVATION: this.getCultivationQuestionTemplates(),
      HARVESTING: this.getHarvestingQuestionTemplates(),
      POST_HARVEST: this.getPostHarvestQuestionTemplates(),
      STORAGE: this.getStorageQuestionTemplates(),
      QUALITY_CONTROL: this.getQualityControlQuestionTemplates(),
      DOCUMENTATION: this.getDocumentationQuestionTemplates()
    };
  }

  /**
   * Business Process: Create comprehensive GACP assessment survey
   *
   * Survey Creation Workflow:
   * 1. Define survey scope and requirements based on GACP standards
   * 2. Configure survey parameters and assessment criteria
   * 3. Generate question sets for each GACP category
   * 4. Set up scoring algorithms and compliance thresholds
   * 5. Validate survey completeness and accuracy
   * 6. Prepare survey for publication
   */
  async createGACPAssessmentSurvey(surveyData) {
    try {
      this.logger.log(`[SurveyManagement] Creating GACP assessment survey: ${surveyData.title}`);

      // Step 1: Validate survey creation data
      await this.validateSurveyCreationData(surveyData);

      // Step 2: Initialize survey entity
      const Survey = require('../domain/entities/Survey');
      const survey = new Survey({
        surveyTitle: surveyData.title,
        description: surveyData.description,
        surveyType: surveyData.type || 'GACP_ASSESSMENT',
        gacpStandard: surveyData.gacpStandard || 'GACP_2023',
        language: surveyData.language || 'th',
        passingScore: surveyData.passingScore || this.businessConfig.defaultPassingScore,
        estimatedDuration: surveyData.estimatedDuration || 90,
        createdBy: surveyData.createdBy,
        configuration: {
          allowPartialSave: true,
          randomizeQuestions: surveyData.randomizeQuestions || false,
          timeLimit: surveyData.timeLimit || this.businessConfig.defaultTimeLimit,
          maxAttempts: surveyData.maxAttempts || 3,
          showScoreImmediately: surveyData.showScoreImmediately !== false,
          requireAllAnswers: surveyData.requireAllAnswers || false
        }
      });

      // Step 3: Generate sections based on GACP categories
      const gacpCategories =
        surveyData.gacpCategories || this.businessConfig.mandatoryGACPCategories;

      for (const category of gacpCategories) {
        const sectionData = await this.generateGACPSection(
          category,
          surveyData.complexity || 'STANDARD'
        );
        survey.addSection(sectionData);
      }

      // Step 4: Add custom sections if provided
      if (surveyData.customSections && surveyData.customSections.length > 0) {
        for (const customSection of surveyData.customSections) {
          const processedSection = await this.processCustomSection(customSection);
          survey.addSection(processedSection);
        }
      }

      // Step 5: Validate survey completeness and GACP compliance
      const validationResult = survey.validateSurveyCompletion();
      if (!validationResult.isComplete) {
        throw new Error(`Survey validation failed: ${validationResult.issues.join(', ')}`);
      }

      // Step 6: Perform GACP compliance check
      const complianceCheck = await this.validateGACPCompliance(survey);
      if (!complianceCheck.compliant) {
        this.logger.warn(
          `[SurveyManagement] GACP compliance warnings: ${complianceCheck.warnings.join(', ')}`
        );
      }

      // Step 7: Save survey to repository
      const savedSurvey = await this.surveyRepository.save(survey);

      // Step 8: Create audit trail
      await this.auditService.log({
        action: 'SURVEY_CREATED',
        entityType: 'SURVEY',
        entityId: savedSurvey.surveyId,
        userId: surveyData.createdBy,
        data: {
          title: savedSurvey.surveyTitle,
          type: savedSurvey.surveyType,
          sections: savedSurvey.sections.length,
          totalQuestions: savedSurvey.totalQuestions,
          gacpCategories: gacpCategories
        }
      });

      this.logger.log(`[SurveyManagement] GACP assessment survey created: ${savedSurvey.surveyId}`);

      return {
        success: true,
        surveyId: savedSurvey.surveyId,
        surveyDetails: {
          title: savedSurvey.surveyTitle,
          sections: savedSurvey.sections.length,
          totalQuestions: savedSurvey.totalQuestions,
          estimatedDuration: savedSurvey.estimatedDuration,
          passingScore: savedSurvey.passingScore,
          gacpCompliance: complianceCheck.compliant
        },
        validationResult: validationResult,
        complianceCheck: complianceCheck,
        surveyUrl: this.generateSurveyUrl(savedSurvey.surveyId),
        nextSteps: {
          canPublish: validationResult.isComplete && complianceCheck.compliant,
          recommendedActions: validationResult.recommendations.concat(
            complianceCheck.recommendations
          )
        }
      };
    } catch (error) {
      this.logger.error(`[SurveyManagement] Survey creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Process: Start survey response session for farmer/organization
   *
   * Response Session Workflow:
   * 1. Validate user eligibility and survey availability
   * 2. Check for existing responses and attempt limits
   * 3. Initialize response session with proper tracking
   * 4. Set up progress monitoring and auto-save
   * 5. Prepare personalized survey experience
   * 6. Send session start notifications
   */
  async startSurveyResponse(sessionData) {
    try {
      this.logger.log(
        `[SurveyManagement] Starting survey response session - Survey: ${sessionData.surveyId}, User: ${sessionData.userId}`
      );

      // Step 1: Validate session start data
      await this.validateSessionStartData(sessionData);

      // Step 2: Get survey and validate availability
      const survey = await this.surveyRepository.findById(sessionData.surveyId);
      if (!survey) {
        throw new Error(`Survey not found: ${sessionData.surveyId}`);
      }

      if (survey.status !== 'ACTIVE') {
        throw new Error('Survey is not currently available');
      }

      // Step 3: Check user eligibility
      const eligibilityCheck = await this.checkUserEligibility(sessionData.userId, survey);
      if (!eligibilityCheck.eligible) {
        throw new Error(`User not eligible: ${eligibilityCheck.reason}`);
      }

      // Step 4: Check for existing responses and attempt limits
      const existingResponses = await this.responseRepository.findByUserAndSurvey(
        sessionData.userId,
        sessionData.surveyId
      );

      const completedResponses = existingResponses.filter(
        r => r.status === 'COMPLETED' || r.status === 'SUBMITTED'
      );

      if (completedResponses.length >= survey.configuration.maxAttempts) {
        throw new Error(`Maximum attempts (${survey.configuration.maxAttempts}) exceeded`);
      }

      // Step 5: Check for in-progress response
      const inProgressResponse = existingResponses.find(r => r.status === 'IN_PROGRESS');
      let surveyResponse;

      if (inProgressResponse && sessionData.resumeSession) {
        // Resume existing session
        surveyResponse = inProgressResponse;
        this.logger.log(
          `[SurveyManagement] Resuming existing response session: ${surveyResponse.responseId}`
        );
      } else {
        // Create new response session
        const SurveyResponse = require('../domain/entities/SurveyResponse');

        // Get user and farm information for context
        const userInfo = await this.userRepository.findById(sessionData.userId);
        const farmInfo = sessionData.farmId
          ? await this.farmRepository.findById(sessionData.farmId)
          : null;

        surveyResponse = new SurveyResponse({
          surveyId: sessionData.surveyId,
          respondentId: sessionData.userId,
          respondentInfo: {
            userId: userInfo.userId,
            name: `${userInfo.firstName} ${userInfo.lastName}`,
            email: userInfo.email,
            organization: farmInfo ? farmInfo.farmName : userInfo.organization,
            role: userInfo.role,
            farmId: farmInfo ? farmInfo.farmId : null,
            contactInfo: {
              phone: userInfo.phone,
              address: farmInfo ? farmInfo.address : userInfo.address
            }
          },
          metadata: {
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            browserInfo: sessionData.browserInfo,
            deviceInfo: sessionData.deviceInfo,
            geoLocation: sessionData.geoLocation
          }
        });

        // Save new response
        surveyResponse = await this.responseRepository.save(surveyResponse);
      }

      // Step 6: Start or resume the response session
      const sessionResult = surveyResponse.startResponse(survey);

      // Step 7: Update response in repository
      const updatedResponse = await this.responseRepository.update(surveyResponse);

      // Step 8: Set up progress tracking and notifications
      await this.setupProgressTracking(updatedResponse, survey);

      // Step 9: Send session start notifications
      await this.sendSessionStartNotifications(updatedResponse, survey);

      // Step 10: Create audit trail
      await this.auditService.log({
        action: inProgressResponse ? 'RESPONSE_SESSION_RESUMED' : 'RESPONSE_SESSION_STARTED',
        entityType: 'SURVEY_RESPONSE',
        entityId: updatedResponse.responseId,
        userId: sessionData.userId,
        data: {
          surveyId: sessionData.surveyId,
          surveyTitle: survey.surveyTitle,
          sessionId: updatedResponse.sessionId,
          attemptNumber: completedResponses.length + 1
        }
      });

      this.logger.log(
        `[SurveyManagement] Survey response session started: ${updatedResponse.responseId}`
      );

      return {
        success: true,
        responseId: updatedResponse.responseId,
        sessionId: updatedResponse.sessionId,
        surveyInfo: {
          title: survey.surveyTitle,
          description: survey.description,
          totalQuestions: survey.totalQuestions,
          estimatedDuration: survey.estimatedDuration,
          passingScore: survey.passingScore,
          sections: survey.sections.map(s => ({
            sectionId: s.sectionId,
            title: s.title,
            description: s.description,
            questions: s.questions.length
          }))
        },
        sessionInfo: {
          ...sessionResult,
          currentProgress: updatedResponse.overallProgress,
          timeRemaining: sessionResult.estimatedTimeRemaining,
          autoSaveEnabled: true,
          autoSaveInterval: this.businessConfig.autoSaveInterval
        },
        userContext: {
          previousAttempts: completedResponses.length,
          maxAttempts: survey.configuration.maxAttempts,
          canRetake: completedResponses.length < survey.configuration.maxAttempts - 1
        }
      };
    } catch (error) {
      this.logger.error(`[SurveyManagement] Session start failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Process: Process survey answer submission with real-time validation
   *
   * Answer Processing Workflow:
   * 1. Validate answer format and business rules
   * 2. Record answer with context and metadata
   * 3. Update response progress and section completion
   * 4. Perform real-time quality checks and validation
   * 5. Calculate provisional scores and provide feedback
   * 6. Auto-save progress and update tracking
   */
  async processSurveyAnswer(answerData) {
    try {
      this.logger.log(
        `[SurveyManagement] Processing survey answer - Response: ${answerData.responseId}, Question: ${answerData.questionId}`
      );

      // Step 1: Validate answer submission data
      await this.validateAnswerData(answerData);

      // Step 2: Get response and survey information
      const [surveyResponse, survey] = await Promise.all([
        this.responseRepository.findById(answerData.responseId),
        this.surveyRepository.findById(answerData.surveyId)
      ]);

      if (!surveyResponse) {
        throw new Error(`Survey response not found: ${answerData.responseId}`);
      }

      if (!survey) {
        throw new Error(`Survey not found: ${answerData.surveyId}`);
      }

      // Step 3: Find question information
      const questionInfo = this.findQuestion(survey, answerData.questionId);
      if (!questionInfo) {
        throw new Error(`Question not found: ${answerData.questionId}`);
      }

      // Step 4: Process the answer
      const answerResult = surveyResponse.recordAnswer(
        answerData.questionId,
        {
          value: answerData.answer,
          type: questionInfo.type,
          confidence: answerData.confidence,
          notes: answerData.notes,
          evidenceFiles: answerData.evidenceFiles || [],
          timeToAnswer: answerData.timeToAnswer || 0
        },
        questionInfo
      );

      // Step 5: Perform additional business validations
      const businessValidation = await this.performBusinessValidation(
        answerData,
        questionInfo,
        surveyResponse
      );

      // Step 6: Update response in repository
      const updatedResponse = await this.responseRepository.update(surveyResponse);

      // Step 7: Calculate provisional scoring if requested
      let provisionalScoring = null;
      if (answerData.calculateProvisionalScore && updatedResponse.overallProgress > 50) {
        provisionalScoring = await this.calculateProvisionalScoring(updatedResponse, survey);
      }

      // Step 8: Generate personalized feedback
      const feedback = await this.generateAnswerFeedback(
        questionInfo,
        answerData,
        businessValidation
      );

      // Step 9: Check for recommendations or alerts
      const recommendations = await this.generateProgressRecommendations(updatedResponse, survey);

      // Step 10: Create audit trail
      await this.auditService.log({
        action: 'SURVEY_ANSWER_PROCESSED',
        entityType: 'SURVEY_RESPONSE',
        entityId: updatedResponse.responseId,
        userId: updatedResponse.respondentId,
        data: {
          questionId: answerData.questionId,
          sectionId: questionInfo.sectionId,
          answerLength: answerData.answer?.length || 0,
          timeToAnswer: answerData.timeToAnswer,
          progressUpdated: answerResult.overallProgress
        }
      });

      this.logger.log(
        `[SurveyManagement] Survey answer processed successfully: ${answerData.responseId}`
      );

      return {
        success: true,
        answerResult: answerResult,
        businessValidation: businessValidation,
        feedback: feedback,
        recommendations: recommendations,
        provisionalScoring: provisionalScoring,
        nextActions: {
          nextQuestion: answerResult.nextQuestion,
          canProceedToNextSection: this.canProceedToNextSection(
            updatedResponse,
            questionInfo.sectionId
          ),
          canComplete: this.canCompleteResponse(updatedResponse, survey),
          suggestedBreak: this.shouldSuggestBreak(updatedResponse)
        },
        progressInfo: {
          overallProgress: updatedResponse.overallProgress,
          sectionProgress: answerResult.sectionProgress,
          timeSpent: updatedResponse.timeTracking.totalTimeSpent,
          estimatedTimeRemaining: this.estimateTimeRemaining(updatedResponse, survey)
        }
      };
    } catch (error) {
      this.logger.error(`[SurveyManagement] Answer processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Process: Complete survey response and generate comprehensive assessment
   *
   * Response Completion Workflow:
   * 1. Validate completion requirements and data quality
   * 2. Calculate final scores using GACP assessment algorithms
   * 3. Generate compliance assessment and gap analysis
   * 4. Create personalized improvement recommendations
   * 5. Generate certificates or completion documents
   * 6. Setup follow-up actions and monitoring
   */
  async completeSurveyResponse(completionData) {
    try {
      this.logger.log(
        `[SurveyManagement] Completing survey response: ${completionData.responseId}`
      );

      // Step 1: Validate completion data
      await this.validateCompletionData(completionData);

      // Step 2: Get response and survey
      const [surveyResponse, survey] = await Promise.all([
        this.responseRepository.findById(completionData.responseId),
        this.surveyRepository.findById(completionData.surveyId)
      ]);

      if (!surveyResponse) {
        throw new Error(`Survey response not found: ${completionData.responseId}`);
      }

      if (surveyResponse.respondentId !== completionData.userId) {
        throw new Error('Unauthorized: User cannot complete this response');
      }

      // Step 3: Complete the response
      const completionResult = surveyResponse.completeResponse(survey);

      // Step 4: Generate comprehensive GACP assessment
      const gacpAssessment = await this.generateGACPAssessment(surveyResponse, survey);

      // Step 5: Create improvement action plan
      const actionPlan = await this.createImprovementActionPlan(surveyResponse, gacpAssessment);

      // Step 6: Generate certificates if eligible
      let certificate = null;
      if (completionResult.certificateEligible) {
        certificate = await this.generateComplianceCertificate(surveyResponse, gacpAssessment);
      }

      // Step 7: Setup follow-up monitoring
      const followUpPlan = await this.createFollowUpPlan(
        surveyResponse,
        gacpAssessment,
        actionPlan
      );

      // Step 8: Update response in repository
      const finalResponse = await this.responseRepository.update(surveyResponse);

      // Step 9: Generate comprehensive report
      const assessmentReport = await this.generateAssessmentReport(
        finalResponse,
        survey,
        gacpAssessment
      );

      // Step 10: Send completion notifications
      await this.sendCompletionNotifications(finalResponse, survey, completionResult);

      // Step 11: Create audit trail
      await this.auditService.log({
        action: 'SURVEY_RESPONSE_COMPLETED',
        entityType: 'SURVEY_RESPONSE',
        entityId: finalResponse.responseId,
        userId: completionData.userId,
        data: {
          finalScore: completionResult.scoring.percentage,
          passed: completionResult.passed,
          complianceLevel: completionResult.scoring.complianceLevel,
          certificateIssued: certificate !== null,
          completionTime: finalResponse.completedAt
        }
      });

      this.logger.log(
        `[SurveyManagement] Survey response completed: ${finalResponse.responseId} - Score: ${completionResult.scoring.percentage}%`
      );

      return {
        success: true,
        completionResult: completionResult,
        gacpAssessment: gacpAssessment,
        actionPlan: actionPlan,
        certificate: certificate,
        followUpPlan: followUpPlan,
        assessmentReport: {
          reportId: assessmentReport.reportId,
          reportUrl: assessmentReport.url,
          downloadUrl: assessmentReport.downloadUrl
        },
        nextSteps: {
          canRetake: !completionResult.passed && finalResponse.canRetake,
          followUpDate: followUpPlan.nextReviewDate,
          immediateActions: actionPlan.immediateActions,
          trainingRecommended: actionPlan.trainingRecommendations.length > 0
        }
      };
    } catch (error) {
      this.logger.error(`[SurveyManagement] Response completion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Business Process: Generate comprehensive progress report for ongoing responses
   *
   * Progress Reporting Workflow:
   * 1. Gather current response status and completion data
   * 2. Analyze section-by-section performance and gaps
   * 3. Calculate preliminary compliance indicators
   * 4. Identify areas needing attention or evidence
   * 5. Generate actionable recommendations for completion
   * 6. Provide timeline estimates and next steps
   */
  async generateProgressReport(reportData) {
    try {
      this.logger.log(`[SurveyManagement] Generating progress report: ${reportData.responseId}`);

      // Step 1: Get response and survey data
      const [surveyResponse, survey] = await Promise.all([
        this.responseRepository.findById(reportData.responseId),
        this.surveyRepository.findById(reportData.surveyId)
      ]);

      if (!surveyResponse) {
        throw new Error(`Survey response not found: ${reportData.responseId}`);
      }

      // Step 2: Generate progress report
      const progressReport = surveyResponse.generateProgressReport(survey);

      // Step 3: Enhance with GACP-specific analysis
      const gacpAnalysis = await this.analyzeGACPProgress(surveyResponse, survey);

      // Step 4: Calculate completion readiness
      const completionReadiness = await this.assessCompletionReadiness(surveyResponse, survey);

      // Step 5: Generate targeted recommendations
      const targetedRecommendations = await this.generateTargetedRecommendations(
        surveyResponse,
        survey,
        gacpAnalysis
      );

      // Step 6: Estimate completion timeline
      const completionEstimate = await this.estimateCompletionTimeline(surveyResponse, survey);

      // Step 7: Create enhanced progress report
      const enhancedReport = {
        ...progressReport,

        // GACP-specific insights
        gacpInsights: {
          complianceProgress: gacpAnalysis.complianceProgress,
          strongAreas: gacpAnalysis.strongAreas,
          improvementAreas: gacpAnalysis.improvementAreas,
          missingEvidence: gacpAnalysis.missingEvidence,
          criticalGaps: gacpAnalysis.criticalGaps
        },

        // Completion readiness
        completionReadiness: {
          overallReadiness: completionReadiness.percentage,
          readyToComplete: completionReadiness.ready,
          blockers: completionReadiness.blockers,
          requirements: completionReadiness.requirements
        },

        // Enhanced recommendations
        recommendations: {
          ...progressReport.recommendations,
          targeted: targetedRecommendations,
          evidenceNeeded: gacpAnalysis.evidenceRequirements,
          priorityOrder: this.prioritizeRecommendations(targetedRecommendations)
        },

        // Timeline and planning
        timeline: {
          estimatedCompletion: completionEstimate.completionDate,
          remainingEffort: completionEstimate.effortHours,
          suggestedSchedule: completionEstimate.schedule,
          milestones: completionEstimate.milestones
        }
      };

      // Step 8: Save report for future reference
      const savedReport = await this.reportingService.saveProgressReport(enhancedReport);

      // Step 9: Create audit trail
      await this.auditService.log({
        action: 'PROGRESS_REPORT_GENERATED',
        entityType: 'SURVEY_RESPONSE',
        entityId: surveyResponse.responseId,
        userId: reportData.userId,
        data: {
          reportId: savedReport.reportId,
          overallProgress: progressReport.summary.overallProgress,
          completionReadiness: completionReadiness.percentage
        }
      });

      this.logger.log(`[SurveyManagement] Progress report generated: ${savedReport.reportId}`);

      return {
        success: true,
        report: enhancedReport,
        reportId: savedReport.reportId,
        reportUrl: savedReport.url,
        insights: {
          progressSummary: `${Math.round(progressReport.summary.overallProgress)}% เสร็จสิ้น`,
          readinessSummary: completionReadiness.ready
            ? 'พร้อมสำเร็จ'
            : `ต้องปรับปรุง ${completionReadiness.blockers.length} รายการ`,
          timeEstimate: `ประมาณ ${completionEstimate.effortHours} ชั่วโมงที่เหลือ`,
          nextMilestone: completionEstimate.milestones[0]?.title || 'ไม่มีขั้นตอนถัดไป'
        }
      };
    } catch (error) {
      this.logger.error(`[SurveyManagement] Progress report generation failed: ${error.message}`);
      throw error;
    }
  }

  // Helper methods for GACP question generation

  /**
   * Generate GACP-compliant section with appropriate questions
   */
  async generateGACPSection(category, complexity = 'STANDARD') {
    const templates = this.gacpQuestionTemplates[category] || [];
    const sectionConfig = this.getGACPSectionConfig(category);

    // Filter questions based on complexity level
    let selectedQuestions = templates.filter(template => {
      if (complexity === 'BASIC') return template.complexity === 'BASIC';
      if (complexity === 'ADVANCED') return ['STANDARD', 'ADVANCED'].includes(template.complexity);
      return template.complexity === 'STANDARD'; // Default
    });

    // Ensure minimum coverage
    if (selectedQuestions.length < sectionConfig.minQuestions) {
      // Add additional questions to meet minimum requirements
      const additionalQuestions = templates
        .filter(t => !selectedQuestions.includes(t))
        .slice(0, sectionConfig.minQuestions - selectedQuestions.length);
      selectedQuestions = selectedQuestions.concat(additionalQuestions);
    }

    return {
      title: sectionConfig.title,
      description: sectionConfig.description,
      category: category,
      weight: sectionConfig.weight,
      isRequired: sectionConfig.required,
      passingScore: sectionConfig.passingScore,
      questions: selectedQuestions.map((template, index) => ({
        ...template,
        order: index + 1,
        questionId: null // Will be generated by Survey entity
      }))
    };
  }

  // GACP question templates - these would be comprehensive question sets
  getCultivationQuestionTemplates() {
    return [
      {
        text: 'ฟาร์มของท่านมีแผนการปลูกที่เป็นลายลักษณ์อักษรหรือไม่?',
        type: 'YES_NO',
        complexity: 'BASIC',
        category: 'CULTIVATION',
        isRequired: true,
        weight: 1.0,
        points: 5,
        correctAnswers: ['YES'],
        gacpSection: 'GACP-4.1',
        gacpRequirement: 'การวางแผนการปลูก',
        complianceLevel: 'MANDATORY',
        evidenceRequired: true,
        helpText: 'แผนการปลูกควรระบุพันธุ์พืช ระยะปลูก และแผนการดูแล',
        examples: ['แผนการปลูกรายปี', 'ตารางการปลูกรายเดือน']
      },
      {
        text: 'ท่านใช้เมล็ดพันธุ์หรือกิ่งพันธุ์จากแหล่งใด?',
        type: 'MULTIPLE_CHOICE',
        complexity: 'STANDARD',
        category: 'CULTIVATION',
        isRequired: true,
        weight: 1.5,
        points: 10,
        options: [
          { value: 'CERTIFIED_SUPPLIER', text: 'ผู้จำหน่ายที่ได้รับการรับรอง' },
          { value: 'GOVERNMENT_AGENCY', text: 'หน่วยงานราชการ' },
          { value: 'RESEARCH_INSTITUTE', text: 'สถาบันวิจัย' },
          { value: 'OWN_PRODUCTION', text: 'ผลิตเอง' },
          { value: 'OTHER_FARMERS', text: 'เกษตรกรอื่น' }
        ],
        correctAnswers: ['CERTIFIED_SUPPLIER', 'GOVERNMENT_AGENCY', 'RESEARCH_INSTITUTE'],
        gacpSection: 'GACP-4.2',
        gacpRequirement: 'การเลือกใช้วัสดุปลูก',
        complianceLevel: 'MANDATORY',
        evidenceRequired: true
      }
      // More cultivation questions would be added here
    ];
  }

  getHarvestingQuestionTemplates() {
    return [
      {
        text: 'ท่านมีเกณฑ์การตัดสินใจเก็บเกี่ยวที่ชัดเจนหรือไม่?',
        type: 'YES_NO',
        complexity: 'BASIC',
        category: 'HARVESTING',
        isRequired: true,
        weight: 1.0,
        points: 5,
        correctAnswers: ['YES'],
        gacpSection: 'GACP-5.1',
        gacpRequirement: 'เกณฑ์การเก็บเกี่ยว',
        complianceLevel: 'MANDATORY',
        evidenceRequired: true
      }
      // More harvesting questions would be added here
    ];
  }

  // Placeholder methods for other GACP categories
  getPostHarvestQuestionTemplates() {
    return [];
  }
  getStorageQuestionTemplates() {
    return [];
  }
  getQualityControlQuestionTemplates() {
    return [];
  }
  getDocumentationQuestionTemplates() {
    return [];
  }

  // GACP section configuration
  getGACPSectionConfig(category) {
    const configs = {
      CULTIVATION: {
        title: 'การปลูก',
        description: 'การปฏิบัติในการปลูกและการดูแลพืช',
        weight: 1.5,
        required: true,
        passingScore: 70,
        minQuestions: 10
      },
      HARVESTING: {
        title: 'การเก็บเกี่ยว',
        description: 'การปฏิบัติในการเก็บเกี่ยวและการจัดการหลังการเก็บเกี่ยว',
        weight: 1.3,
        required: true,
        passingScore: 75,
        minQuestions: 8
      },
      POST_HARVEST: {
        title: 'หลังการเก็บเกี่ยว',
        description: 'การจัดการและการแปรรูปหลังการเก็บเกี่ยว',
        weight: 1.2,
        required: true,
        passingScore: 70,
        minQuestions: 6
      },
      STORAGE: {
        title: 'การเก็บรักษา',
        description: 'การเก็บรักษาและการควบคุมคุณภาพ',
        weight: 1.0,
        required: true,
        passingScore: 75,
        minQuestions: 5
      },
      QUALITY_CONTROL: {
        title: 'การควบคุมคุณภาพ',
        description: 'ระบบการควบคุมและการประกันคุณภาพ',
        weight: 1.4,
        required: true,
        passingScore: 80,
        minQuestions: 7
      },
      DOCUMENTATION: {
        title: 'การจัดทำเอกสาร',
        description: 'การบันทึกและการจัดทำเอกสารตามมาตรฐาน',
        weight: 1.1,
        required: true,
        passingScore: 70,
        minQuestions: 5
      }
    };

    return (
      configs[category] || {
        title: category,
        description: '',
        weight: 1.0,
        required: false,
        passingScore: 70,
        minQuestions: 3
      }
    );
  }

  // Utility and helper methods
  generateSurveyUrl(surveyId) {
    return `/survey/${surveyId}`;
  }

  findQuestion(survey, questionId) {
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.questionId === questionId);
      if (question) {
        return { ...question, sectionId: section.sectionId };
      }
    }
    return null;
  }

  // Placeholder methods for complex operations
  async validateSurveyCreationData(_surveyData) {
    /* Validation logic */
  }
  async processCustomSection(customSection) {
    return customSection;
  }
  async validateGACPCompliance(_survey) {
    return { compliant: true, warnings: [], recommendations: [] };
  }
  async validateSessionStartData(_sessionData) {
    /* Validation logic */
  }
  async checkUserEligibility(_userId, _survey) {
    return { eligible: true };
  }
  async setupProgressTracking(_response, _survey) {
    /* Setup tracking */
  }
  async sendSessionStartNotifications(_response, _survey) {
    /* Send notifications */
  }
  async validateAnswerData(_answerData) {
    /* Validation logic */
  }
  async performBusinessValidation(_answerData, _questionInfo, _response) {
    return { isValid: true };
  }
  async calculateProvisionalScoring(_response, _survey) {
    return null;
  }
  async generateAnswerFeedback(_questionInfo, _answerData, _validation) {
    return {};
  }
  async generateProgressRecommendations(_response, _survey) {
    return [];
  }
  canProceedToNextSection(_response, _sectionId) {
    return true;
  }
  canCompleteResponse(response, _survey) {
    return response.overallProgress >= 80;
  }
  shouldSuggestBreak(_response) {
    return false;
  }
  estimateTimeRemaining(_response, _survey) {
    return 30;
  }
  async validateCompletionData(_completionData) {
    /* Validation logic */
  }
  async generateGACPAssessment(_response, _survey) {
    return {};
  }
  async createImprovementActionPlan(_response, _assessment) {
    return {};
  }
  async generateComplianceCertificate(_response, _assessment) {
    return null;
  }
  async createFollowUpPlan(_response, _assessment, _actionPlan) {
    return {};
  }
  async generateAssessmentReport(_response, _survey, _assessment) {
    return { reportId: 'RPT-001', url: '/report', downloadUrl: '/download' };
  }
  async sendCompletionNotifications(_response, _survey, _result) {
    /* Send notifications */
  }
  async analyzeGACPProgress(_response, _survey) {
    return {};
  }
  async assessCompletionReadiness(_response, _survey) {
    return { ready: false, percentage: 75, blockers: [] };
  }
  async generateTargetedRecommendations(_response, _survey, _analysis) {
    return [];
  }
  async estimateCompletionTimeline(_response, _survey) {
    return { completionDate: new Date(), effortHours: 5, schedule: [], milestones: [] };
  }
  prioritizeRecommendations(recommendations) {
    return recommendations;
  }
}

module.exports = SurveyManagementUseCase;
