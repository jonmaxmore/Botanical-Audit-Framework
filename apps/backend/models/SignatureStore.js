/**
 * SignatureStore Model
 *
 * Stores cryptographic keys and signature metadata for audit trail.
 *
 * @module models/SignatureStore
 */

const mongoose = require('mongoose');

const SignatureStoreSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: [true, 'Key version is required'],
      unique: true,
      index: true,
    },

    publicKey: {
      type: String,
      required: [true, 'Public key is required'],
      validate: {
        validator: function (v) {
          return v.includes('BEGIN PUBLIC KEY') && v.includes('END PUBLIC KEY');
        },
        message: 'Invalid PEM public key format',
      },
    },

    algorithm: {
      type: String,
      required: [true, 'Algorithm is required'],
      enum: ['RSA-SHA256', 'ECDSA-SHA256'],
      default: 'RSA-SHA256',
    },

    keySize: {
      type: Number,
      required: [true, 'Key size is required'],
      enum: [2048, 4096],
      default: 2048,
    },

    keySource: {
      type: String,
      required: [true, 'Key source is required'],
      enum: ['local', 'kms'],
      default: 'local',
    },

    kmsKeyId: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'ROTATED', 'REVOKED'],
      default: 'ACTIVE',
      index: true,
    },

    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
      default: Date.now,
    },

    validUntil: {
      type: Date,
      required: false,
    },

    rotatedAt: {
      type: Date,
    },

    revokedAt: {
      type: Date,
    },

    revokedReason: {
      type: String,
    },

    statistics: {
      signaturesCreated: {
        type: Number,
        default: 0,
      },
      signaturesVerified: {
        type: Number,
        default: 0,
      },
      lastUsed: Date,
    },

    metadata: {
      environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        required: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    },
  },
  {
    timestamps: true,
    collection: 'signature_store',
  },
);

// Indexes
SignatureStoreSchema.index({ status: 1, version: -1 }); // Active keys
SignatureStoreSchema.index({ validFrom: 1, validUntil: 1 }); // Validity period

// Virtual fields
SignatureStoreSchema.virtual('isActive').get(function () {
  return this.status === 'ACTIVE';
});

SignatureStoreSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.status === 'ACTIVE' &&
    this.validFrom <= now &&
    (!this.validUntil || this.validUntil >= now)
  );
});

SignatureStoreSchema.virtual('expiresIn').get(function () {
  if (!this.validUntil) {
    return null;
  }

  const now = new Date();
  const diff = this.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
});

// Instance methods
SignatureStoreSchema.methods.rotate = async function (newPublicKey, newVersion) {
  this.status = 'ROTATED';
  this.rotatedAt = new Date();

  // Create new key entry
  const newKey = new this.constructor({
    version: newVersion,
    publicKey: newPublicKey,
    algorithm: this.algorithm,
    keySize: this.keySize,
    keySource: this.keySource,
    kmsKeyId: this.kmsKeyId,
    status: 'ACTIVE',
    validFrom: new Date(),
    metadata: this.metadata,
  });

  await this.save();
  await newKey.save();

  return newKey;
};

SignatureStoreSchema.methods.revoke = async function (reason) {
  this.status = 'REVOKED';
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return await this.save();
};

SignatureStoreSchema.methods.recordSignature = async function () {
  this.statistics.signaturesCreated += 1;
  this.statistics.lastUsed = new Date();
  return await this.save();
};

SignatureStoreSchema.methods.recordVerification = async function () {
  this.statistics.signaturesVerified += 1;
  this.statistics.lastUsed = new Date();
  return await this.save();
};

// Static methods
SignatureStoreSchema.statics.getActive = async function () {
  return await this.findOne({ status: 'ACTIVE' }).sort('-version');
};

SignatureStoreSchema.statics.getByVersion = async function (version) {
  return await this.findOne({ version });
};

SignatureStoreSchema.statics.getAll = async function () {
  return await this.find().sort('-version');
};

SignatureStoreSchema.statics.createInitial = async function (publicKey, environment, createdBy) {
  const existing = await this.findOne();

  if (existing) {
    throw new Error('Keys already initialized');
  }

  return await this.create({
    version: 1,
    publicKey,
    algorithm: 'RSA-SHA256',
    keySize: 2048,
    keySource: 'local',
    status: 'ACTIVE',
    validFrom: new Date(),
    metadata: {
      environment,
      createdBy,
      notes: 'Initial key pair',
    },
  });
};

SignatureStoreSchema.statics.getStats = async function () {
  const keys = await this.find();

  return {
    total: keys.length,
    active: keys.filter(k => k.status === 'ACTIVE').length,
    rotated: keys.filter(k => k.status === 'ROTATED').length,
    revoked: keys.filter(k => k.status === 'REVOKED').length,
    totalSignatures: keys.reduce((sum, k) => sum + k.statistics.signaturesCreated, 0),
    totalVerifications: keys.reduce((sum, k) => sum + k.statistics.signaturesVerified, 0),
  };
};

// Pre-save hooks
SignatureStoreSchema.pre('save', async function (next) {
  // Ensure only one active key at a time
  if (this.status === 'ACTIVE' && !this.isNew) {
    const others = await this.constructor.find({
      _id: { $ne: this._id },
      status: 'ACTIVE',
    });

    for (const other of others) {
      other.status = 'ROTATED';
      other.rotatedAt = new Date();
      await other.save();
    }
  }

  next();
});

// Post-save hooks
SignatureStoreSchema.post('save', function (doc) {
  this.constructor.emit('keyCreated', {
    version: doc.version,
    algorithm: doc.algorithm,
    status: doc.status,
  });
});

// JSON transform
SignatureStoreSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    // Truncate public key for display
    if (ret.publicKey && ret.publicKey.length > 100) {
      ret.publicKeyPreview = ret.publicKey.substring(0, 100) + '...';
      delete ret.publicKey; // Full key available via API endpoint
    }

    return ret;
  },
});

const SignatureStoreModel = mongoose.model('SignatureStore', SignatureStoreSchema);

module.exports = SignatureStoreModel;
