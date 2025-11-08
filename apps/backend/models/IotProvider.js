/**
 * IotProvider Model
 *
 * Stores IoT provider configurations and API credentials.
 *
 * @module models/IotProvider
 */

const mongoose = require('mongoose');

const IotProviderSchema = new mongoose.Schema(
  {
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
      match: [/^IOT-[A-Z0-9-]+$/, 'Provider ID must start with IOT-'],
    },

    name: {
      type: String,
      required: [true, 'Provider name is required'],
      enum: ['dygis', 'malin', 'sensecap', 'thaismartfarm', 'custom'],
      index: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm ID is required'],
      index: true,
    },

    config: {
      apiEndpoint: String,
      apiKey: String,
      apiSecret: String,
      webhookUrl: String,
      webhookSecret: String,
      mqtt: {
        broker: String,
        port: Number,
        username: String,
        password: String,
        clientId: String,
        topics: [String],
      },
    },

    devices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        name: String,
        type: String,
        location: String,
        sensors: [
          {
            sensorType: String,
            unit: String,
            min: Number,
            max: Number,
            critical: Number,
          },
        ],
        lastSeen: Date,
        status: {
          type: String,
          enum: ['online', 'offline', 'error', 'unknown'],
          default: 'unknown',
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    thresholds: [
      {
        sensorType: String,
        min: Number,
        max: Number,
        critical: Number,
        alertEmail: [String],
        alertPhone: [String],
      },
    ],

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ERROR', 'TESTING'],
      default: 'TESTING',
      index: true,
    },

    lastSync: Date,

    statistics: {
      totalReadings: {
        type: Number,
        default: 0,
      },
      lastReading: Date,
      errors: {
        type: Number,
        default: 0,
      },
      uptime: Number,
    },

    metadata: {
      notes: String,
      supportContact: String,
      documentationUrl: String,
    },
  },
  {
    timestamps: true,
    collection: 'iot_providers',
  },
);

// Indexes
IotProviderSchema.index({ farmId: 1, name: 1 }); // Farm providers
IotProviderSchema.index({ status: 1 }); // Active providers
IotProviderSchema.index({ 'devices.deviceId': 1 }); // Device lookup

// Virtual fields
IotProviderSchema.virtual('isActive').get(function () {
  return this.status === 'ACTIVE';
});

IotProviderSchema.virtual('deviceCount').get(function () {
  return this.devices.length;
});

IotProviderSchema.virtual('onlineDevices').get(function () {
  return this.devices.filter(d => d.status === 'online').length;
});

// Instance methods
IotProviderSchema.methods.activate = async function () {
  this.status = 'ACTIVE';
  return await this.save();
};

IotProviderSchema.methods.deactivate = async function () {
  this.status = 'INACTIVE';
  return await this.save();
};

IotProviderSchema.methods.addDevice = async function (device) {
  if (this.devices.some(d => d.deviceId === device.deviceId)) {
    throw new Error('Device already exists');
  }

  this.devices.push({
    ...device,
    lastSeen: new Date(),
    status: 'unknown',
  });

  return await this.save();
};

IotProviderSchema.methods.removeDevice = async function (deviceId) {
  this.devices = this.devices.filter(d => d.deviceId !== deviceId);
  return await this.save();
};

IotProviderSchema.methods.updateDeviceStatus = async function (deviceId, status) {
  const device = this.devices.find(d => d.deviceId === deviceId);

  if (!device) {
    throw new Error('Device not found');
  }

  device.status = status;
  device.lastSeen = new Date();

  return await this.save();
};

IotProviderSchema.methods.recordReading = async function () {
  this.statistics.totalReadings += 1;
  this.statistics.lastReading = new Date();
  this.lastSync = new Date();
  return await this.save();
};

IotProviderSchema.methods.recordError = async function () {
  this.statistics.errors += 1;
  return await this.save();
};

IotProviderSchema.methods.getDevice = function (deviceId) {
  return this.devices.find(d => d.deviceId === deviceId);
};

IotProviderSchema.methods.getThreshold = function (sensorType) {
  return this.thresholds.find(t => t.sensorType === sensorType);
};

// Static methods
IotProviderSchema.statics.findByFarm = function (farmId) {
  return this.find({ farmId }).sort('-createdAt');
};

IotProviderSchema.statics.findActive = function () {
  return this.find({ status: 'ACTIVE' }).sort('-createdAt');
};

IotProviderSchema.statics.findByDevice = async function (deviceId) {
  return await this.findOne({ 'devices.deviceId': deviceId });
};

IotProviderSchema.statics.getStatsByProvider = async function () {
  return await this.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $group: {
        _id: '$name',
        count: { $sum: 1 },
        totalDevices: { $sum: { $size: '$devices' } },
        totalReadings: { $sum: '$statistics.totalReadings' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Pre-save hooks
IotProviderSchema.pre('save', function (next) {
  // Auto-generate providerId if not provided
  if (!this.providerId) {
    this.providerId = `IOT-${this.name.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  next();
});

// Post-save hooks
IotProviderSchema.post('save', function (doc) {
  this.constructor.emit('providerCreated', {
    providerId: doc.providerId,
    name: doc.name,
    farmId: doc.farmId,
    deviceCount: doc.devices.length,
  });
});

// JSON transform (hide sensitive fields)
IotProviderSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    // Hide sensitive credentials
    if (ret.config) {
      delete ret.config.apiKey;
      delete ret.config.apiSecret;
      delete ret.config.webhookSecret;
      if (ret.config.mqtt) {
        delete ret.config.mqtt.password;
      }
    }

    return ret;
  },
});

const IotProviderModel = mongoose.model('IotProvider', IotProviderSchema);

module.exports = IotProviderModel;
