/**
 * Course Entity - Domain Model for GACP Training Courses
 *
 * Represents a GACP training course including modules, materials, and assessments.
 * Part of Clean Architecture - Domain Layer (Business Logic)
 *
 * Business Rules:
 * - Course must have title, description, and at least one module
 * - Course can be DRAFT, PUBLISHED, or ARCHIVED
 * - Only PUBLISHED courses can be enrolled
 * - Course duration is calculated from all modules
 * - Course can have prerequisites (other courses)
 * - Course can have passing score requirement
 * - Course materials can include documents, videos, and quizzes
 */

class Course {
  // Course Status Constants
  static STATUS = {
    DRAFT: 'DRAFT', // Being created/edited
    PUBLISHED: 'PUBLISHED', // Available for enrollment
    ARCHIVED: 'ARCHIVED' // No longer available
  };

  // Course Type Constants
  static TYPE = {
    MANDATORY: 'MANDATORY', // Required for GACP certification
    OPTIONAL: 'OPTIONAL', // Additional training
    ADVANCED: 'ADVANCED', // For certified farmers
    REFRESHER: 'REFRESHER' // Periodic recertification
  };

  // Course Level Constants
  static LEVEL = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED'
  };

  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || null; // Unique course code (e.g., GACP-101)
    this.title = data.title || '';
    this.titleEn = data.titleEn || '';
    this.description = data.description || '';
    this.descriptionEn = data.descriptionEn || '';

    // Course Classification
    this.type = data.type || Course.TYPE.MANDATORY;
    this.level = data.level || Course.LEVEL.BEGINNER;
    this.status = data.status || Course.STATUS.DRAFT;

    // Course Structure
    this.modules = data.modules || []; // Array of module objects
    this.totalDurationMinutes = data.totalDurationMinutes || 0;
    this.totalLessons = data.totalLessons || 0;

    // Requirements
    this.prerequisites = data.prerequisites || []; // Array of course IDs
    this.passingScore = data.passingScore || 70; // Percentage
    this.certificateTemplate = data.certificateTemplate || null;

    // Content
    this.objectives = data.objectives || []; // Learning objectives
    this.materials = data.materials || []; // Array of material objects
    this.assessments = data.assessments || []; // Array of assessment objects

    // Instructor Information
    this.instructors = data.instructors || []; // Array of instructor objects

    // Enrollment Info
    this.maxEnrollments = data.maxEnrollments || null; // null = unlimited
    this.currentEnrollments = data.currentEnrollments || 0;
    this.completionCount = data.completionCount || 0;

    // Metadata
    this.tags = data.tags || [];
    this.thumbnailUrl = data.thumbnailUrl || null;
    this.previewVideoUrl = data.previewVideoUrl || null;

    // Timestamps
    this.publishedAt = data.publishedAt || null;
    this.archivedAt = data.archivedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || null; // DTAM staff ID
    this.updatedBy = data.updatedBy || null; // DTAM staff ID
  }

  // Factory Method
  static create({ code, title, titleEn, description, descriptionEn, type, level, createdBy }) {
    if (!code || !title || !description) {
      throw new Error('Course code, title, and description are required');
    }

    return new Course({
      code,
      title,
      titleEn,
      description,
      descriptionEn,
      type: type || Course.TYPE.MANDATORY,
      level: level || Course.LEVEL.BEGINNER,
      status: Course.STATUS.DRAFT,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Business Logic Methods

  /**
   * Add a module to the course
   */
  addModule(module) {
    if (!module.title || !module.order) {
      throw new Error('Module must have title and order');
    }

    // Check for duplicate order
    if (this.modules.some(m => m.order === module.order)) {
      throw new Error(`Module with order ${module.order} already exists`);
    }

    this.modules.push({
      id: module.id || `module_${Date.now()}`,
      title: module.title,
      titleEn: module.titleEn,
      description: module.description,
      order: module.order,
      durationMinutes: module.durationMinutes || 0,
      lessons: module.lessons || [],
      isRequired: module.isRequired !== false
    });

    this.modules.sort((a, b) => a.order - b.order);
    this._recalculateDuration();
    this.updatedAt = new Date();
  }

  /**
   * Update a module
   */
  updateModule(moduleId, updates) {
    const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    this.modules[moduleIndex] = {
      ...this.modules[moduleIndex],
      ...updates,
      id: this.modules[moduleIndex].id // Preserve ID
    };

    if (updates.order) {
      this.modules.sort((a, b) => a.order - b.order);
    }

    this._recalculateDuration();
    this.updatedAt = new Date();
  }

  /**
   * Remove a module
   */
  removeModule(moduleId) {
    const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    this.modules.splice(moduleIndex, 1);
    this._recalculateDuration();
    this.updatedAt = new Date();
  }

  /**
   * Add learning objective
   */
  addObjective(objective) {
    if (!objective || typeof objective !== 'string') {
      throw new Error('Invalid objective');
    }

    if (!this.objectives.includes(objective)) {
      this.objectives.push(objective);
      this.updatedAt = new Date();
    }
  }

  /**
   * Add prerequisite course
   */
  addPrerequisite(courseId) {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    if (courseId === this.id) {
      throw new Error('Course cannot be prerequisite of itself');
    }

    if (!this.prerequisites.includes(courseId)) {
      this.prerequisites.push(courseId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Publish course (make available for enrollment)
   */
  publish(publishedBy) {
    if (this.status === Course.STATUS.PUBLISHED) {
      throw new Error('Course is already published');
    }

    if (this.modules.length === 0) {
      throw new Error('Cannot publish course without modules');
    }

    if (!this.title || !this.description) {
      throw new Error('Course must have title and description');
    }

    this.status = Course.STATUS.PUBLISHED;
    this.publishedAt = new Date();
    this.updatedBy = publishedBy;
    this.updatedAt = new Date();
  }

  /**
   * Unpublish course (revert to draft)
   */
  unpublish(unpublishedBy) {
    if (this.status !== Course.STATUS.PUBLISHED) {
      throw new Error('Only published courses can be unpublished');
    }

    this.status = Course.STATUS.DRAFT;
    this.publishedAt = null;
    this.updatedBy = unpublishedBy;
    this.updatedAt = new Date();
  }

  /**
   * Archive course (no longer available)
   */
  archive(archivedBy) {
    if (this.status === Course.STATUS.ARCHIVED) {
      throw new Error('Course is already archived');
    }

    this.status = Course.STATUS.ARCHIVED;
    this.archivedAt = new Date();
    this.updatedBy = archivedBy;
    this.updatedAt = new Date();
  }

  /**
   * Restore archived course
   */
  restore(restoredBy) {
    if (this.status !== Course.STATUS.ARCHIVED) {
      throw new Error('Only archived courses can be restored');
    }

    this.status = Course.STATUS.DRAFT;
    this.archivedAt = null;
    this.updatedBy = restoredBy;
    this.updatedAt = new Date();
  }

  /**
   * Update basic information
   */
  updateInfo(updates, updatedBy) {
    const allowedFields = [
      'title',
      'titleEn',
      'description',
      'descriptionEn',
      'type',
      'level',
      'passingScore',
      'maxEnrollments',
      'thumbnailUrl',
      'previewVideoUrl'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        this[key] = updates[key];
      }
    });

    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Increment enrollment count
   */
  incrementEnrollment() {
    if (!this.isPublished()) {
      throw new Error('Cannot enroll in unpublished course');
    }

    if (this.maxEnrollments && this.currentEnrollments >= this.maxEnrollments) {
      throw new Error('Course enrollment limit reached');
    }

    this.currentEnrollments++;
    this.updatedAt = new Date();
  }

  /**
   * Decrement enrollment count
   */
  decrementEnrollment() {
    if (this.currentEnrollments > 0) {
      this.currentEnrollments--;
      this.updatedAt = new Date();
    }
  }

  /**
   * Increment completion count
   */
  incrementCompletion() {
    this.completionCount++;
    this.updatedAt = new Date();
  }

  // Query Methods

  /**
   * Check if course is published
   */
  isPublished() {
    return this.status === Course.STATUS.PUBLISHED;
  }

  /**
   * Check if course is draft
   */
  isDraft() {
    return this.status === Course.STATUS.DRAFT;
  }

  /**
   * Check if course is archived
   */
  isArchived() {
    return this.status === Course.STATUS.ARCHIVED;
  }

  /**
   * Check if course is full
   */
  isFull() {
    return this.maxEnrollments && this.currentEnrollments >= this.maxEnrollments;
  }

  /**
   * Check if course is mandatory
   */
  isMandatory() {
    return this.type === Course.TYPE.MANDATORY;
  }

  /**
   * Check if enrollment is available
   */
  isEnrollmentAvailable() {
    return this.isPublished() && !this.isFull();
  }

  /**
   * Get completion rate
   */
  getCompletionRate() {
    if (this.currentEnrollments === 0) return 0;
    return Math.round((this.completionCount / this.currentEnrollments) * 100);
  }

  /**
   * Get enrollment utilization
   */
  getEnrollmentUtilization() {
    if (!this.maxEnrollments) return 0;
    return Math.round((this.currentEnrollments / this.maxEnrollments) * 100);
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      type: this.type,
      level: this.level,
      status: this.status,
      totalModules: this.modules.length,
      totalDurationMinutes: this.totalDurationMinutes,
      currentEnrollments: this.currentEnrollments,
      completionRate: this.getCompletionRate(),
      isEnrollmentAvailable: this.isEnrollmentAvailable()
    };
  }

  // Private Methods

  /**
   * Recalculate total duration from all modules
   */
  _recalculateDuration() {
    this.totalDurationMinutes = this.modules.reduce((total, module) => {
      return total + (module.durationMinutes || 0);
    }, 0);

    this.totalLessons = this.modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0);
    }, 0);
  }

  /**
   * Validate course data
   */
  validate() {
    const errors = [];

    if (!this.code) errors.push('Course code is required');
    if (!this.title) errors.push('Course title is required');
    if (!this.description) errors.push('Course description is required');
    if (this.passingScore < 0 || this.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
    if (this.maxEnrollments && this.maxEnrollments < 1) {
      errors.push('Max enrollments must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Course;
