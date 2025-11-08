/**
 * Record Model (Main Traceability Collection)
 *
 * Stores all cannabis cultivation activity records with:
 * - Hash chain for tamper-proof linking
 * - Digital signatures for authenticity
 * - Geospatial data for location tracking
 * - Audit trail for compliance
 *
 * @module models/Record
 */

const mongoose = require('mongoose');
const cryptoService = require('../services/crypto-utils');

const RecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: [true, 'Record ID is required'],
      unique: true,
      index: true,
      trim: true,
      maxlength: [100, 'Record ID cannot exceed 100 characters'],
    },

    type: {
      type: String,
      required: [true, 'Record type is required'],
      enum: {
        values: [
          'PLANTING',
          'WATERING',
          'FERTILIZING',
          'PEST_CONTROL',
          'PRUNING',
          'FLOWERING',
          'HARVEST',
          'DRYING',
          'CURING',
          'TESTING',
          'PACKAGING',
          'SHIPPING',
          'DISPOSAL',
          'INSPECTION',
          'OTHER',
        ],
        message: '{VALUE} is not a valid record type',
      },
      index: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm ID is required'],
      index: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Record data is required'],
      validate: {
        validator: function (v) {
          return v && typeof v === 'object' && Object.keys(v).length > 0;
        },
        message: 'Record data cannot be empty',
      },
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
        validate: {
          validator: function (v) {
            return (
              !v ||
              (Array.isArray(v) &&
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90)
            );
          },
          message: 'Invalid coordinates [longitude, latitude]',
        },
      },
    },

    hash: {
      type: String,
      required: [true, 'Hash is required'],
      unique: true,
      index: true,
      match: [/^[0-9a-f]{64}$/, 'Hash must be 64-character hex string'],
    },

    signature: {
      type: String,
      required: [true, 'Signature is required'],
      match: [/^[0-9a-f]+$/, 'Signature must be hex string'],
    },

    previousHash: {
      type: String,
      required: [true, 'Previous hash is required'],
      index: true,
      match: [/^[0-9a-f]{64}$/, 'Previous hash must be 64-character hex string'],
    },

    timestamp: {
      timestamp: {
        type: Date,
        required: false,
      },
      token: {
        type: String,
        required: false,
      },
      provider: {
        type: String,
        enum: ['FreeTSA', 'DigiCert', 'GlobalSign', 'fallback', null],
        required: false,
      },
      algorithm: {
        type: String,
        enum: ['sha256', null],
        required: false,
      },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    metadata: {
      device: String,
      ipAddress: String,
      userAgent: String,
      notes: String,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'records',
  },
);

// Indexes
RecordSchema.index({ farmId: 1, createdAt: -1 }); // Farm timeline
RecordSchema.index({ userId: 1, createdAt: -1 }); // User activity
RecordSchema.index({ type: 1, createdAt: -1 }); // Type filter
RecordSchema.index({ location: '2dsphere' }); // Geospatial queries
RecordSchema.index({ hash: 1, previousHash: 1 }); // Chain verification
RecordSchema.index({ verified: 1, createdAt: -1 }); // Verification status

// Virtual fields
RecordSchema.virtual('isGenesis').get(function () {
  return this.previousHash === '0'.repeat(64);
});

RecordSchema.virtual('hasTimestamp').get(function () {
  return this.timestamp && this.timestamp.token;
});

RecordSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Instance methods
RecordSchema.methods.verify = async function (previousHash = null) {
  const verification = await cryptoService.verifyRecord(
    {
      id: this.recordId,
      type: this.type,
      data: this.data,
      hash: this.hash,
      signature: this.signature,
      timestamp: this.timestamp,
      userId: this.userId.toString(),
    },
    previousHash,
  );

  return verification;
};

RecordSchema.methods.getPreviousRecord = async function () {
  if (this.isGenesis) {
    return null;
  }

  return await this.constructor.findOne({ hash: this.previousHash });
};

RecordSchema.methods.getNextRecord = async function () {
  return await this.constructor.findOne({ previousHash: this.hash });
};

RecordSchema.methods.getChain = async function (direction = 'backward', limit = 10) {
  const chain = [this];
  let current = this;

  if (direction === 'backward') {
    // Traverse backward to genesis
    for (let i = 0; i < limit; i++) {
      const previous = await current.getPreviousRecord();
      if (!previous) {
        break;
      }
      chain.unshift(previous);
      current = previous;
    }
  } else {
    // Traverse forward to latest
    for (let i = 0; i < limit; i++) {
      const next = await current.getNextRecord();
      if (!next) {
        break;
      }
      chain.push(next);
      current = next;
    }
  }

  return chain;
};

RecordSchema.methods.markVerified = async function (verifiedBy) {
  this.verified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  return await this.save();
};

// Static methods
RecordSchema.statics.createRecord = async function (recordData, previousHash = null) {
  // Ensure crypto service is initialized
  if (!cryptoService.initialized) {
    throw new Error('CryptoService not initialized');
  }

  // If no previousHash provided, get last record
  if (!previousHash) {
    const lastRecord = await this.findOne({ farmId: recordData.farmId })
      .sort('-createdAt')
      .select('hash');

    previousHash = lastRecord?.hash || null;
  }

  // Sign the record
  const signedData = await cryptoService.signRecord(
    {
      id: recordData.recordId,
      type: recordData.type,
      data: recordData.data,
      timestamp: new Date().toISOString(),
      userId: recordData.userId.toString(),
    },
    previousHash,
    false, // No timestamp for speed (enable in production if needed)
  );

  // Create record
  const record = new this({
    ...recordData,
    hash: signedData.hash,
    signature: signedData.signature,
    previousHash: signedData.previousHash,
    timestamp: signedData.timestamp,
  });

  return await record.save();
};

RecordSchema.statics.verifyChain = async function (farmId, limit = 100) {
  const records = await this.find({ farmId }).sort('createdAt').limit(limit).lean();

  if (records.length === 0) {
    return { valid: true, totalRecords: 0, message: 'No records found' };
  }

  const verification = await cryptoService.verifyRecordChain(
    records.map(r => ({
      id: r.recordId,
      type: r.type,
      data: r.data,
      hash: r.hash,
      signature: r.signature,
      previousHash: r.previousHash,
      timestamp: r.timestamp,
      userId: r.userId.toString(),
    })),
  );

  return verification;
};

RecordSchema.statics.getGenesisRecords = function () {
  return this.find({ previousHash: '0'.repeat(64) });
};

RecordSchema.statics.findByLocation = function (longitude, latitude, maxDistanceMeters = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  });
};

RecordSchema.statics.getStatsByType = async function (farmId) {
  return await this.aggregate([
    { $match: { farmId: mongoose.Types.ObjectId(farmId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Pre-save hooks
RecordSchema.pre('save', async function (next) {
  // Generate recordId if not provided
  if (!this.recordId) {
    this.recordId = `REC-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  next();
});

// Post-save hooks (for audit logging and Change Streams alternative)
RecordSchema.post('save', async function (doc) {
  // Emit event for audit logging
  this.constructor.emit('recordCreated', {
    recordId: doc.recordId,
    type: doc.type,
    farmId: doc.farmId,
    userId: doc.userId,
    timestamp: doc.createdAt,
  });
});

RecordSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    this.model.emit('recordUpdated', {
      recordId: doc.recordId,
      changes: this.getUpdate(),
    });
  }
});

RecordSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    this.model.emit('recordDeleted', {
      recordId: doc.recordId,
      farmId: doc.farmId,
    });
  }
});

// Prevent direct updates to hash/signature/previousHash
RecordSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.$set) {
    const immutableFields = ['hash', 'signature', 'previousHash', 'recordId'];
    const hasImmutableUpdate = immutableFields.some(field => field in update.$set);

    if (hasImmutableUpdate) {
      return next(new Error('Cannot update hash, signature, previousHash, or recordId'));
    }
  }

  next();
});

// JSON transform (hide sensitive fields in API responses)
RecordSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const RecordModel = mongoose.model('Record', RecordSchema);

module.exports = RecordModel;
