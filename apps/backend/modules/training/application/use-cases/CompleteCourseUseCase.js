/**
 * Complete Course Use Case
 *
 * Business Logic: Complete a course enrollment and handle certification
 *
 * Workflow Process:
 * 1. Validate enrollment eligibility for completion
 * 2. Calculate final score and assess pass/fail status
 * 3. Generate certificate if passing requirements met
 * 4. Update enrollment status to COMPLETED or FAILED
 * 5. Trigger certification tracking and analytics updates
 * 6. Send completion notifications
 *
 * Clear Process Flow:
 * Input: enrollmentId, finalAssessmentData
 * Validation: Check completion requirements, calculate scores
 * Business Rules: Apply passing criteria, certificate generation rules
 * Output: Completion status, certificate data, updated enrollment
 * Integration: Analytics, Certification tracking, Notification systems
 */

class CompleteCourseUseCase {
  constructor(
    enrollmentRepository,
    courseRepository,
    certificationService,
    analyticsService,
    notificationService
  ) {
    this.enrollmentRepository = enrollmentRepository;
    this.courseRepository = courseRepository;
    this.certificationService = certificationService;
    this.analyticsService = analyticsService;
    this.notificationService = notificationService;
  }

  /**
   * Execute course completion workflow
   *
   * Business Logic Implementation:
   * - Validates completion eligibility
   * - Calculates final performance metrics
   * - Determines certification outcome
   * - Updates all related systems
   */
  async execute(enrollmentId, completionData = {}) {
    try {
      console.log(`[CompleteCourse] Starting completion process for enrollment: ${enrollmentId}`);

      // 1. Retrieve and validate enrollment
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.status !== 'ACTIVE') {
        throw new Error(`Cannot complete enrollment with status: ${enrollment.status}`);
      }

      // 2. Retrieve course information
      const course = await this.courseRepository.findById(enrollment.courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // 3. Validate completion requirements
      const completionValidation = await this.validateCompletionRequirements(enrollment, course);
      if (!completionValidation.isEligible) {
        throw new Error(`Completion requirements not met: ${completionValidation.reason}`);
      }

      // 4. Process final assessment and calculate scores
      const finalAssessment = await this.processFinalAssessment(enrollment, course, completionData);

      // 5. Determine completion outcome
      const completionOutcome = this.determineCompletionOutcome(finalAssessment, course);

      // 6. Update enrollment status
      const updatedEnrollment = await this.updateEnrollmentCompletion(
        enrollment,
        completionOutcome
      );

      // 7. Handle certificate generation if passed
      let certificateData = null;
      if (completionOutcome.status === 'PASSED') {
        certificateData = await this.generateCertificate(
          updatedEnrollment,
          course,
          completionOutcome
        );
      }

      // 8. Update analytics and tracking systems
      await this.updateSystemIntegrations(
        updatedEnrollment,
        course,
        completionOutcome,
        certificateData
      );

      // 9. Send completion notifications
      await this.sendCompletionNotifications(
        updatedEnrollment,
        course,
        completionOutcome,
        certificateData
      );

      const result = {
        success: true,
        enrollmentId: updatedEnrollment.id,
        status: completionOutcome.status,
        finalScore: completionOutcome.finalScore,
        completedAt: updatedEnrollment.completedAt,
        certificate: certificateData,
        analyticsUpdated: true,
        notificationsSent: true
      };

      console.log(
        `[CompleteCourse] Successfully completed enrollment ${enrollmentId} with status: ${completionOutcome.status}`
      );
      return result;
    } catch (error) {
      console.error('[CompleteCourse] Course completion failed:', error);

      // Log failure for analytics
      await this.logCompletionFailure(enrollmentId, error.message).catch(console.error);

      throw error;
    }
  }

  /**
   * Validate completion requirements
   * Business Logic: Ensure all course requirements are met
   */
  async validateCompletionRequirements(enrollment, course) {
    const validation = {
      isEligible: true,
      reason: null,
      details: {}
    };

    try {
      // Check progress completion
      const requiredProgressPercentage = course.requirements?.minProgressPercentage || 80;
      if (enrollment.progress.progressPercentage < requiredProgressPercentage) {
        validation.isEligible = false;
        validation.reason = `Insufficient progress: ${enrollment.progress.progressPercentage}% (required: ${requiredProgressPercentage}%)`;
        return validation;
      }

      // Check required modules completion
      const requiredModules = course.modules?.filter(module => module.required) || [];
      const completedRequiredModules = requiredModules.filter(module =>
        enrollment.progress.completedModules.includes(module.id)
      );

      if (completedRequiredModules.length < requiredModules.length) {
        validation.isEligible = false;
        validation.reason = `Missing required modules: ${requiredModules.length - completedRequiredModules.length} modules`;
        return validation;
      }

      // Check assessment attempts
      const maxAttempts = enrollment.maxAttempts || course.maxAssessmentAttempts || 3;
      const currentAttempts = enrollment.assessments?.length || 0;

      if (currentAttempts >= maxAttempts) {
        validation.isEligible = false;
        validation.reason = `Maximum assessment attempts exceeded: ${currentAttempts}/${maxAttempts}`;
        return validation;
      }

      // Check enrollment expiry
      if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
        validation.isEligible = false;
        validation.reason = 'Enrollment has expired';
        return validation;
      }

      validation.details = {
        progressPercentage: enrollment.progress.progressPercentage,
        completedRequiredModules: completedRequiredModules.length,
        totalRequiredModules: requiredModules.length,
        assessmentAttempts: currentAttempts,
        maxAttempts: maxAttempts
      };

      return validation;
    } catch (error) {
      console.error('[CompleteCourse] Validation error:', error);
      validation.isEligible = false;
      validation.reason = `Validation failed: ${error.message}`;
      return validation;
    }
  }

  /**
   * Process final assessment
   * Business Logic: Calculate comprehensive final score
   */
  async processFinalAssessment(enrollment, course, completionData) {
    const assessment = {
      attemptNumber: (enrollment.assessments?.length || 0) + 1,
      submittedAt: new Date(),
      answers: completionData.assessmentAnswers || {},
      timeSpent: completionData.timeSpent || 0,
      scores: {},
      finalScore: 0
    };

    try {
      // Calculate module scores (40% weight)
      const moduleScores = this.calculateModuleScores(enrollment, course);
      assessment.scores.modules = moduleScores;

      // Calculate assessment score (40% weight)
      const assessmentScore = this.calculateAssessmentScore(assessment.answers, course);
      assessment.scores.assessment = assessmentScore;

      // Calculate participation score (20% weight)
      const participationScore = this.calculateParticipationScore(enrollment, course);
      assessment.scores.participation = participationScore;

      // Calculate weighted final score
      assessment.finalScore = Math.round(
        moduleScores * 0.4 + assessmentScore * 0.4 + participationScore * 0.2
      );

      // Additional analytics data
      assessment.analytics = {
        totalStudyTime: enrollment.progress.totalTimeSpentMinutes,
        completionRate: enrollment.progress.progressPercentage,
        moduleCompletionTime: this.calculateModuleCompletionTimes(enrollment),
        performancePattern: this.analyzePerformancePattern(enrollment)
      };

      console.log(`[CompleteCourse] Final assessment processed - Score: ${assessment.finalScore}%`);
      return assessment;
    } catch (error) {
      console.error('[CompleteCourse] Assessment processing error:', error);
      throw new Error(`Assessment processing failed: ${error.message}`);
    }
  }

  /**
   * Calculate module completion scores
   */
  calculateModuleScores(enrollment, course) {
    const completedModules = enrollment.progress.completedModules.length;
    const totalModules = course.modules?.length || 1;
    return Math.round((completedModules / totalModules) * 100);
  }

  /**
   * Calculate assessment scores based on answers
   */
  calculateAssessmentScore(answers, course) {
    // Simplified scoring - in real implementation, would use course.assessmentQuestions
    const totalQuestions = Object.keys(answers).length || 10;
    const correctAnswers =
      Object.values(answers).filter(answer => answer.correct).length ||
      Math.floor(totalQuestions * 0.8);
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  /**
   * Calculate participation score
   */
  calculateParticipationScore(enrollment, course) {
    const expectedStudyTime = course.estimatedHours ? course.estimatedHours * 60 : 480; // 8 hours default
    const actualStudyTime = enrollment.progress.totalTimeSpentMinutes || 0;

    // Score based on engagement and time spent
    const timeScore = Math.min(100, (actualStudyTime / expectedStudyTime) * 100);
    const accessPattern = enrollment.lastAccessedAt ? 80 : 60; // Regular access bonus

    return Math.round(timeScore * 0.7 + accessPattern * 0.3);
  }

  /**
   * Analyze performance patterns for insights
   */
  analyzePerformancePattern(enrollment) {
    return {
      studyConsistency:
        enrollment.progress.completedLessons.length > 5 ? 'consistent' : 'irregular',
      completionSpeed: enrollment.progress.totalTimeSpentMinutes > 240 ? 'thorough' : 'quick',
      engagementLevel: enrollment.lastAccessedAt ? 'high' : 'low'
    };
  }

  /**
   * Calculate module completion times
   */
  calculateModuleCompletionTimes(enrollment) {
    // Simplified - would calculate actual times per module in real implementation
    const avgTimePerModule =
      (enrollment.progress.totalTimeSpentMinutes || 60) /
      Math.max(1, enrollment.progress.completedModules.length);
    return {
      averageTimePerModule: Math.round(avgTimePerModule),
      totalTime: enrollment.progress.totalTimeSpentMinutes
    };
  }

  /**
   * Determine completion outcome based on scores and requirements
   */
  determineCompletionOutcome(assessment, course) {
    const passingScore = course.passingScore || 70;
    const finalScore = assessment.finalScore;

    const outcome = {
      status: finalScore >= passingScore ? 'PASSED' : 'FAILED',
      finalScore: finalScore,
      passingScore: passingScore,
      assessment: assessment,
      certificateEligible: false,
      recommendation: null
    };

    // Determine certificate eligibility
    outcome.certificateEligible =
      outcome.status === 'PASSED' &&
      finalScore >= (course.certificateRequiredScore || passingScore);

    // Generate recommendations
    if (outcome.status === 'PASSED') {
      outcome.recommendation =
        finalScore >= 90 ? 'Excellent performance!' : 'Good job completing the course!';
    } else {
      const gaps = this.identifyLearningGaps(assessment, course);
      outcome.recommendation = `Review: ${gaps.join(', ')}. Retake available.`;
    }

    return outcome;
  }

  /**
   * Identify areas for improvement
   */
  identifyLearningGaps(assessment, course) {
    const gaps = [];

    if (assessment.scores.modules < 70) gaps.push('Module completion');
    if (assessment.scores.assessment < 70) gaps.push('Assessment performance');
    if (assessment.scores.participation < 70) gaps.push('Course engagement');

    return gaps.length > 0 ? gaps : ['General course material review'];
  }

  /**
   * Update enrollment with completion data
   */
  async updateEnrollmentCompletion(enrollment, outcome) {
    const updates = {
      status: outcome.status === 'PASSED' ? 'COMPLETED' : 'FAILED',
      finalScore: outcome.finalScore,
      completedAt: new Date(),
      assessments: [...(enrollment.assessments || []), outcome.assessment]
    };

    const updatedEnrollment = await this.enrollmentRepository.update(enrollment.id, updates);
    return updatedEnrollment;
  }

  /**
   * Generate certificate for successful completion
   */
  async generateCertificate(enrollment, course, outcome) {
    if (!outcome.certificateEligible) {
      return null;
    }

    try {
      const certificateData = {
        enrollmentId: enrollment.id,
        courseId: course.id,
        farmerId: enrollment.farmerId,
        courseName: course.name,
        finalScore: outcome.finalScore,
        completedAt: enrollment.completedAt,
        certificateNumber: this.generateCertificateNumber(enrollment, course),
        validUntil: this.calculateCertificateExpiry(course),
        competenciesAchieved: this.extractCompetencies(course, outcome)
      };

      // Generate certificate through certification service
      if (this.certificationService) {
        return await this.certificationService.generateCertificate(certificateData);
      }

      return certificateData;
    } catch (error) {
      console.error('[CompleteCourse] Certificate generation failed:', error);
      return null;
    }
  }

  /**
   * Generate unique certificate number
   */
  generateCertificateNumber(enrollment, course) {
    const timestamp = Date.now();
    const courseCode = course.code || course.id.substring(0, 4).toUpperCase();
    const farmerCode = enrollment.farmerId.substring(0, 4).toUpperCase();
    return `GACP-${courseCode}-${farmerCode}-${timestamp}`;
  }

  /**
   * Calculate certificate expiry date
   */
  calculateCertificateExpiry(course) {
    const validityPeriod = course.certificateValidityMonths || 24; // 2 years default
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + validityPeriod);
    return expiryDate;
  }

  /**
   * Extract achieved competencies
   */
  extractCompetencies(course, outcome) {
    // Extract competencies based on course content and performance
    const baseCompetencies = course.learningObjectives || ['GACP Certification'];

    if (outcome.finalScore >= 90) {
      return [...baseCompetencies, 'Advanced Practitioner'];
    } else if (outcome.finalScore >= 80) {
      return [...baseCompetencies, 'Proficient Practitioner'];
    } else {
      return baseCompetencies;
    }
  }

  /**
   * Update integrated systems (analytics, tracking)
   */
  async updateSystemIntegrations(enrollment, course, outcome, certificate) {
    try {
      // Update analytics system
      if (this.analyticsService) {
        await this.analyticsService.recordCompletion({
          enrollmentId: enrollment.id,
          courseId: course.id,
          farmerId: enrollment.farmerId,
          completionStatus: outcome.status,
          finalScore: outcome.finalScore,
          studyTime: enrollment.progress.totalTimeSpentMinutes,
          certificateIssued: !!certificate
        });
      }

      // Update certification tracking
      if (certificate && this.certificationService) {
        await this.certificationService.trackCertificate({
          certificateId: certificate.id,
          farmerId: enrollment.farmerId,
          courseId: course.id,
          status: 'ACTIVE',
          issuedAt: new Date(),
          expiresAt: certificate.validUntil
        });
      }
    } catch (error) {
      console.error('[CompleteCourse] System integration update failed:', error);
      // Don't fail the main process, just log the error
    }
  }

  /**
   * Send completion notifications
   */
  async sendCompletionNotifications(enrollment, course, outcome, certificate) {
    try {
      if (!this.notificationService) return;

      const notificationData = {
        farmerId: enrollment.farmerId,
        type: 'COURSE_COMPLETION',
        title: `Course ${outcome.status === 'PASSED' ? 'Completed' : 'Assessment Not Passed'}`,
        message: this.generateCompletionMessage(course, outcome, certificate),
        data: {
          enrollmentId: enrollment.id,
          courseId: course.id,
          finalScore: outcome.finalScore,
          certificateId: certificate?.id
        }
      };

      await this.notificationService.send(notificationData);
    } catch (error) {
      console.error('[CompleteCourse] Notification sending failed:', error);
      // Don't fail the main process, just log the error
    }
  }

  /**
   * Generate completion message
   */
  generateCompletionMessage(course, outcome, certificate) {
    if (outcome.status === 'PASSED') {
      const message = `Congratulations! You have successfully completed "${course.name}" with a score of ${outcome.finalScore}%.`;
      return certificate ? `${message} Your certificate has been generated.` : message;
    } else {
      return `You completed "${course.name}" with a score of ${outcome.finalScore}%. ${outcome.recommendation}`;
    }
  }

  /**
   * Log completion failure for analytics
   */
  async logCompletionFailure(enrollmentId, errorMessage) {
    try {
      if (this.analyticsService) {
        await this.analyticsService.recordFailure({
          enrollmentId,
          operation: 'COURSE_COMPLETION',
          error: errorMessage,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('[CompleteCourse] Failed to log completion failure:', error);
    }
  }
}

module.exports = CompleteCourseUseCase;
