/**
 * Code Audit Model
 *
 * MongoDB schema for storing code duplication and similarity audit results.
 * Supports cross-device drift detection and historical tracking.
 *
 * @version 1.0.0
 * @created November 4, 2025
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * File Duplicate Entry
 */
const DuplicateSchema = new Schema(
  {
    fileA: {
      type: String,
      required: true,
      index: true,
    },
    fileB: {
      type: String,
      required: true,
      index: true,
    },
    similarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    comment: {
      type: String,
      required: true,
    },
    hashA: {
      type: String,
      required: true,
    },
    hashB: {
      type: String,
      required: true,
    },
    linesA: {
      type: Number,
      required: true,
    },
    linesB: {
      type: Number,
      required: true,
    },
    duplicatedLines: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['modal', 'form', 'component', 'hook', 'utility', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'refactored', 'ignored'],
      default: 'pending',
    },
  },
  { _id: false },
);

/**
 * Cross-Device Drift Entry
 */
const DriftSchema = new Schema(
  {
    file: {
      type: String,
      required: true,
      index: true,
    },
    deviceA: {
      type: String,
      required: true,
    },
    deviceB: {
      type: String,
      required: true,
    },
    hashA: {
      type: String,
      required: true,
    },
    hashB: {
      type: String,
      required: true,
    },
    difference: {
      type: String,
      required: true,
    },
    diffLines: {
      type: Number,
      default: 0,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical'],
      default: 'moderate',
    },
  },
  { _id: false },
);

/**
 * File Hash Entry (for tracking file changes)
 */
const FileHashSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    lines: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    lastModified: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

/**
 * Audit Summary
 */
const SummarySchema = new Schema(
  {
    totalFiles: {
      type: Number,
      required: true,
      default: 0,
    },
    analyzedFiles: {
      type: Number,
      required: true,
      default: 0,
    },
    duplicateCount: {
      type: Number,
      required: true,
      default: 0,
    },
    driftCount: {
      type: Number,
      required: true,
      default: 0,
    },
    codeReduction: {
      type: Number,
      required: true,
      default: 0,
      comment: 'Estimated lines of code that can be eliminated',
    },
    similarityAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    criticalIssues: {
      type: Number,
      default: 0,
    },
    highPriorityIssues: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

/**
 * Code Audit Record Schema
 */
const CodeAuditSchema = new Schema(
  {
    scanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Unknown Device',
    },
    scanType: {
      type: String,
      enum: ['full', 'incremental', 'targeted'],
      default: 'full',
    },
    directories: [
      {
        type: String,
      },
    ],
    filePatterns: [
      {
        type: String,
      },
    ],
    duplicates: [DuplicateSchema],
    drifts: [DriftSchema],
    fileHashes: [FileHashSchema],
    summary: {
      type: SummarySchema,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      comment: 'Duration in milliseconds',
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'cancelled'],
      default: 'running',
    },
    errorMessage: {
      type: String,
    },
    config: {
      minSimilarity: {
        type: Number,
        default: 70,
        comment: 'Minimum similarity percentage to report',
      },
      excludePatterns: [
        {
          type: String,
        },
      ],
      compareDevices: [
        {
          type: String,
        },
      ],
    },
    metadata: {
      gitBranch: String,
      gitCommit: String,
      nodeVersion: String,
      npmVersion: String,
      platform: String,
    },
  },
  {
    timestamps: true,
    collection: 'code_audits',
  },
);

// Indexes
CodeAuditSchema.index({ deviceId: 1, createdAt: -1 });
CodeAuditSchema.index({ scanType: 1, status: 1 });
CodeAuditSchema.index({ 'duplicates.fileA': 1 });
CodeAuditSchema.index({ 'duplicates.fileB': 1 });
CodeAuditSchema.index({ 'drifts.file': 1 });

// Virtual: duration in seconds
CodeAuditSchema.virtual('durationSeconds').get(function () {
  return this.duration ? Math.round(this.duration / 1000) : 0;
});

// Method: Get critical duplicates
CodeAuditSchema.methods.getCriticalDuplicates = function () {
  return this.duplicates.filter(d => d.priority === 'critical');
};

// Method: Get high similarity duplicates
CodeAuditSchema.methods.getHighSimilarityDuplicates = function (threshold = 85) {
  return this.duplicates.filter(d => d.similarity >= threshold);
};

// Method: Get drifts by severity
CodeAuditSchema.methods.getDriftsBySeverity = function (severity) {
  return this.drifts.filter(d => d.severity === severity);
};

// Method: Calculate total duplicate lines
CodeAuditSchema.methods.getTotalDuplicateLines = function () {
  return this.duplicates.reduce((sum, d) => sum + d.duplicatedLines, 0);
};

// Static: Find latest scan for device
CodeAuditSchema.statics.findLatestForDevice = function (deviceId) {
  return this.findOne({ deviceId, status: 'completed' }).sort({ createdAt: -1 });
};

// Static: Find drifts between devices
CodeAuditSchema.statics.findDriftsBetweenDevices = async function (deviceA, deviceB) {
  const scanA = await this.findLatestForDevice(deviceA);
  const scanB = await this.findLatestForDevice(deviceB);

  if (!scanA || !scanB) {
    return [];
  }

  const drifts = [];
  const filesA = new Map(scanA.fileHashes.map(f => [f.path, f]));
  const filesB = new Map(scanB.fileHashes.map(f => [f.path, f]));

  // Check files that exist in both devices
  for (const [path, fileA] of filesA) {
    const fileB = filesB.get(path);
    if (fileB && fileA.hash !== fileB.hash) {
      drifts.push({
        file: path,
        deviceA,
        deviceB,
        hashA: fileA.hash,
        hashB: fileB.hash,
        difference: `File modified: ${fileA.lines} lines (A) vs ${fileB.lines} lines (B)`,
        diffLines: Math.abs(fileA.lines - fileB.lines),
        severity: Math.abs(fileA.lines - fileB.lines) > 50 ? 'major' : 'moderate',
      });
    }
  }

  return drifts;
};

// Pre-save: Calculate summary
CodeAuditSchema.pre('save', function (next) {
  if (this.isModified('duplicates')) {
    const criticalCount = this.duplicates.filter(d => d.priority === 'critical').length;
    const highPriorityCount = this.duplicates.filter(d => d.priority === 'high').length;
    const totalDuplicateLines = this.duplicates.reduce((sum, d) => sum + d.duplicatedLines, 0);
    const avgSimilarity =
      this.duplicates.length > 0
        ? this.duplicates.reduce((sum, d) => sum + d.similarity, 0) / this.duplicates.length
        : 0;

    this.summary.criticalIssues = criticalCount;
    this.summary.highPriorityIssues = highPriorityCount;
    this.summary.codeReduction = totalDuplicateLines;
    this.summary.similarityAverage = Math.round(avgSimilarity);
    this.summary.duplicateCount = this.duplicates.length;
  }

  if (this.isModified('drifts')) {
    this.summary.driftCount = this.drifts.length;
  }

  next();
});

/**
 * Refactoring Action Model
 * Tracks refactoring actions taken based on audit results
 */
const RefactoringActionSchema = new Schema(
  {
    auditId: {
      type: Schema.Types.ObjectId,
      ref: 'CodeAudit',
      required: true,
      index: true,
    },
    scanId: {
      type: String,
      required: true,
    },
    duplicateId: {
      type: String,
      comment: 'Reference to specific duplicate from audit',
    },
    action: {
      type: String,
      enum: ['merge', 'extract', 'refactor', 'ignore', 'archive'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    filesAffected: [
      {
        type: String,
      },
    ],
    filesCreated: [
      {
        type: String,
      },
    ],
    filesDeleted: [
      {
        type: String,
      },
    ],
    linesReduced: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned',
    },
    assignedTo: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    estimatedHours: {
      type: Number,
    },
    actualHours: {
      type: Number,
    },
    pullRequestUrl: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'refactoring_actions',
  },
);

// Indexes
RefactoringActionSchema.index({ auditId: 1, status: 1 });
RefactoringActionSchema.index({ status: 1, priority: -1 });

const CodeAudit = mongoose.model('CodeAudit', CodeAuditSchema);
const RefactoringAction = mongoose.model('RefactoringAction', RefactoringActionSchema);

module.exports = {
  CodeAudit,
  RefactoringAction,
};
