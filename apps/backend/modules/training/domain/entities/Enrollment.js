/**
 * Enrollment Entity - Domain Model for Course Enrollments
 *
 * Represents a farmer's enrollment in a training course.
 * Tracks progress, completion, and certificate issuance.
 * Part of Clean Architecture - Domain Layer (Business Logic)
 *
 * Business Rules:
 * - Farmer can only enroll once per course
 * - Cannot enroll in DRAFT or ARCHIVED courses
 * - Must complete prerequisites before enrolling
 * - Progress tracked per module and lesson
 * - Certificate issued upon successful completion (score >= passing score)
 * - Enrollment can be cancelled before completion
 */

class Enrollment {
  // Enrollment Status Constants
  static STATUS = {
    ACTIVE: 'ACTIVE', // Currently learning
    COMPLETED: 'COMPLETED', // Finished all modules and passed
    FAILED: 'FAILED', // Finished but didn't pass
    CANCELLED: 'CANCELLED', // Cancelled by farmer or admin
    EXPIRED: 'EXPIRED', // Expired due to time limit
  };

  constructor(data = {}) {
    this.id = data.id || null;

    // Relationships
    this.farmerId = data.farmerId || null;
    this.courseId = data.courseId || null;

    // Status
    this.status = data.status || Enrollment.STATUS.ACTIVE;

    // Progress Tracking
    this.progress = data.progress || {
      completedModules: [], // Array of module IDs
      completedLessons: [], // Array of lesson IDs
      currentModuleId: null, // Current module being studied
      currentLessonId: null, // Current lesson being studied
      progressPercentage: 0, // 0-100
      totalTimeSpentMinutes: 0, // Total study time
    };

    // Assessment Results
    this.assessments = data.assessments || []; // Array of assessment results
    this.finalScore = data.finalScore || null; // Final assessment score (0-100)
    this.passingScore = data.passingScore || 70; // Required to pass
    this.attemptCount = data.attemptCount || 0; // Number of attempts
    this.maxAttempts = data.maxAttempts || 3; // Maximum allowed attempts

    // Certificate
    this.certificateId = data.certificateId || null; // Training certificate ID
    this.certificateIssuedAt = data.certificateIssuedAt || null;

    // Timestamps
    this.enrolledAt = data.enrolledAt || new Date();
    this.startedAt = data.startedAt || null; // First access
    this.completedAt = data.completedAt || null;
    this.expiresAt = data.expiresAt || null; // Enrollment expiry (optional)
    this.lastAccessedAt = data.lastAccessedAt || null;

    // Metadata
    this.enrolledBy = data.enrolledBy || null; // Who enrolled (farmer or admin)
    this.notes = data.notes || null; // Admin notes
  }

  // Factory Method
  static create({ farmerId, courseId, passingScore, maxAttempts, expiresAt, enrolledBy }) {
    if (!farmerId || !courseId) {
      throw new Error('Farmer ID and Course ID are required');
    }

    return new Enrollment({
      farmerId,
      courseId,
      passingScore: passingScore || 70,
      maxAttempts: maxAttempts || 3,
      expiresAt,
      enrolledBy: enrolledBy || farmerId,
      enrolledAt: new Date(),
      status: Enrollment.STATUS.ACTIVE,
    });
  }

  // Business Logic Methods

  /**
   * Start the course (first access)
   */
  start() {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Cannot start inactive enrollment');
    }

    if (!this.startedAt) {
      this.startedAt = new Date();
    }
    this.lastAccessedAt = new Date();
  }

  /**
   * Update last accessed time
   */
  recordAccess() {
    this.lastAccessedAt = new Date();
  }

  /**
   * Complete a lesson
   */
  completeLesson(lessonId, timeSpentMinutes = 0) {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Cannot complete lesson in inactive enrollment');
    }

    if (!lessonId) {
      throw new Error('Lesson ID is required');
    }

    // Add to completed lessons if not already there
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
      this.progress.totalTimeSpentMinutes += timeSpentMinutes;
    }

    this.lastAccessedAt = new Date();
  }

  /**
   * Complete a module
   */
  completeModule(moduleId, totalLessons) {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Cannot complete module in inactive enrollment');
    }

    if (!moduleId) {
      throw new Error('Module ID is required');
    }

    // Add to completed modules if not already there
    if (!this.progress.completedModules.includes(moduleId)) {
      this.progress.completedModules.push(moduleId);
    }

    this.lastAccessedAt = new Date();
  }

  /**
   * Update current position
   */
  updatePosition(moduleId, lessonId) {
    this.progress.currentModuleId = moduleId;
    this.progress.currentLessonId = lessonId;
    this.lastAccessedAt = new Date();
  }

  /**
   * Calculate and update progress percentage
   */
  updateProgress(totalModules, totalLessons) {
    const moduleProgress = this.progress.completedModules.length / totalModules;
    const lessonProgress = this.progress.completedLessons.length / totalLessons;

    // Weight: 50% modules, 50% lessons
    this.progress.progressPercentage = Math.round(
      (moduleProgress * 0.5 + lessonProgress * 0.5) * 100,
    );
  }

  /**
   * Submit assessment
   */
  submitAssessment({ assessmentId, score, answers, timeSpentMinutes }) {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Cannot submit assessment in inactive enrollment');
    }

    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    this.assessments.push({
      assessmentId,
      score,
      answers,
      timeSpentMinutes,
      submittedAt: new Date(),
    });

    this.attemptCount++;
    this.lastAccessedAt = new Date();
  }

  /**
   * Submit final assessment and complete course
   */
  submitFinalAssessment(score, certificateId = null) {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Cannot submit final assessment in inactive enrollment');
    }

    if (this.attemptCount >= this.maxAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    this.finalScore = score;
    this.attemptCount++;
    this.completedAt = new Date();

    if (score >= this.passingScore) {
      this.status = Enrollment.STATUS.COMPLETED;

      // Issue certificate if provided
      if (certificateId) {
        this.certificateId = certificateId;
        this.certificateIssuedAt = new Date();
      }
    } else {
      // Check if can retry
      if (this.attemptCount >= this.maxAttempts) {
        this.status = Enrollment.STATUS.FAILED;
      }
      // Otherwise stays ACTIVE for retry
    }

    this.lastAccessedAt = new Date();
  }

  /**
   * Issue certificate (after passing)
   */
  issueCertificate(certificateId) {
    if (this.status !== Enrollment.STATUS.COMPLETED) {
      throw new Error('Certificate can only be issued for completed enrollments');
    }

    if (!this.hasPassed()) {
      throw new Error('Cannot issue certificate without passing score');
    }

    this.certificateId = certificateId;
    this.certificateIssuedAt = new Date();
  }

  /**
   * Reset for retry (after failure)
   */
  resetForRetry() {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Can only reset active enrollments');
    }

    if (this.attemptCount >= this.maxAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    // Keep completed modules/lessons but reset assessments
    this.assessments = [];
    this.finalScore = null;
  }

  /**
   * Cancel enrollment
   */
  cancel(reason = null) {
    if (this.status === Enrollment.STATUS.COMPLETED) {
      throw new Error('Cannot cancel completed enrollment');
    }

    if (this.status === Enrollment.STATUS.CANCELLED) {
      throw new Error('Enrollment is already cancelled');
    }

    this.status = Enrollment.STATUS.CANCELLED;
    this.notes = reason || this.notes;
  }

  /**
   * Mark as expired
   */
  expire() {
    if (this.status !== Enrollment.STATUS.ACTIVE) {
      throw new Error('Only active enrollments can expire');
    }

    this.status = Enrollment.STATUS.EXPIRED;
  }

  /**
   * Add admin notes
   */
  addNotes(notes) {
    this.notes = notes;
  }

  // Query Methods

  /**
   * Check if enrollment is active
   */
  isActive() {
    return this.status === Enrollment.STATUS.ACTIVE;
  }

  /**
   * Check if enrollment is completed
   */
  isCompleted() {
    return this.status === Enrollment.STATUS.COMPLETED;
  }

  /**
   * Check if enrollment has failed
   */
  hasFailed() {
    return this.status === Enrollment.STATUS.FAILED;
  }

  /**
   * Check if enrollment is cancelled
   */
  isCancelled() {
    return this.status === Enrollment.STATUS.CANCELLED;
  }

  /**
   * Check if enrollment has expired
   */
  isExpired() {
    // Check both status and expiry date
    if (this.status === Enrollment.STATUS.EXPIRED) return true;
    if (this.expiresAt && new Date() > this.expiresAt) return true;
    return false;
  }

  /**
   * Check if has passed
   */
  hasPassed() {
    return this.finalScore !== null && this.finalScore >= this.passingScore;
  }

  /**
   * Check if has certificate
   */
  hasCertificate() {
    return this.certificateId !== null;
  }

  /**
   * Check if can retry
   */
  canRetry() {
    return (
      this.isActive() &&
      this.finalScore !== null &&
      this.finalScore < this.passingScore &&
      this.attemptCount < this.maxAttempts
    );
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts() {
    return Math.max(0, this.maxAttempts - this.attemptCount);
  }

  /**
   * Get days since enrollment
   */
  getDaysSinceEnrollment() {
    const now = new Date();
    const diffTime = Math.abs(now - this.enrolledAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry() {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if module is completed
   */
  isModuleCompleted(moduleId) {
    return this.progress.completedModules.includes(moduleId);
  }

  /**
   * Check if lesson is completed
   */
  isLessonCompleted(lessonId) {
    return this.progress.completedLessons.includes(lessonId);
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      id: this.id,
      farmerId: this.farmerId,
      courseId: this.courseId,
      status: this.status,
      progressPercentage: this.progress.progressPercentage,
      finalScore: this.finalScore,
      hasPassed: this.hasPassed(),
      hasCertificate: this.hasCertificate(),
      attemptCount: this.attemptCount,
      remainingAttempts: this.getRemainingAttempts(),
      enrolledAt: this.enrolledAt,
      completedAt: this.completedAt,
      daysActive: this.getDaysSinceEnrollment(),
    };
  }

  /**
   * Validate enrollment data
   */
  validate() {
    const errors = [];

    if (!this.farmerId) errors.push('Farmer ID is required');
    if (!this.courseId) errors.push('Course ID is required');
    if (this.passingScore < 0 || this.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
    if (this.maxAttempts < 1) {
      errors.push('Max attempts must be at least 1');
    }
    if (this.finalScore !== null && (this.finalScore < 0 || this.finalScore > 100)) {
      errors.push('Final score must be between 0 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Enrollment;
