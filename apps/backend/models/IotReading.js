/**
 * IotReading Model (Timeseries Collection)
 *
 * Stores IoT sensor readings with timeseries optimization.
 * Optimized for high-volume sensor data ingestion.
 *
 * @module models/IotReading
 */

const mongoose = require('mongoose');

const IotReadingSchema = new mongoose.Schema(
  {
    // Metadata (indexed for timeseries)
    metadata: {
      farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: [true, 'Farm ID is required']
      },
      deviceId: {
        type: String,
        required: [true, 'Device ID is required']
      },
      provider: {
        type: String,
        required: [true, 'Provider is required'],
        enum: ['dygis', 'malin', 'sensecap', 'thaismartfarm', 'custom']
      },
      sensorType: {
        type: String,
        required: [true, 'Sensor type is required'],
        enum: [
          'temperature',
          'humidity',
          'soil_moisture',
          'soil_temperature',
          'light',
          'co2',
          'ph',
          'ec',
          'water_level',
          'wind_speed',
          'rain',
          'pressure',
          'battery',
          'custom'
        ]
      }
    },

    // Timestamp (required for timeseries)
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required']
    },

    // Measurements
    value: {
      type: Number,
      required: [true, 'Value is required']
    },

    unit: {
      type: String,
      required: [true, 'Unit is required']
    },

    // Optional fields
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
    },

    quality: {
      type: String,
      enum: ['good', 'fair', 'poor', 'unknown'],
      default: 'unknown'
    },

    raw: mongoose.Schema.Types.Mixed, // Original data from provider

    processed: {
      type: Boolean,
      default: false
    },

    alert: {
      triggered: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        enum: ['high', 'low', 'critical', null]
      },
      notified: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    collection: 'iot_readings',
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'minutes'
    },
    expireAfterSeconds: 31536000, // 1 year retention
    versionKey: false
  }
);

// Indexes
IotReadingSchema.index({ 'metadata.farmId': 1, timestamp: -1 }); // Farm timeline
IotReadingSchema.index({ 'metadata.deviceId': 1, timestamp: -1 }); // Device timeline
IotReadingSchema.index({ 'metadata.sensorType': 1, timestamp: -1 }); // Sensor type
IotReadingSchema.index({ timestamp: -1 }); // Recent readings
IotReadingSchema.index({ 'alert.triggered': 1, 'alert.notified': 1 }); // Pending alerts

// Static methods
IotReadingSchema.statics.record = async function (reading) {
  return await this.create({
    metadata: {
      farmId: reading.farmId,
      deviceId: reading.deviceId,
      provider: reading.provider,
      sensorType: reading.sensorType
    },
    timestamp: reading.timestamp || new Date(),
    value: reading.value,
    unit: reading.unit,
    location: reading.location || null,
    quality: reading.quality || 'unknown',
    raw: reading.raw || null
  });
};

IotReadingSchema.statics.recordBatch = async function (readings) {
  const documents = readings.map(r => ({
    metadata: {
      farmId: r.farmId,
      deviceId: r.deviceId,
      provider: r.provider,
      sensorType: r.sensorType
    },
    timestamp: r.timestamp || new Date(),
    value: r.value,
    unit: r.unit,
    location: r.location || null,
    quality: r.quality || 'unknown',
    raw: r.raw || null
  }));

  return await this.insertMany(documents, { ordered: false });
};

IotReadingSchema.statics.getLatest = async function (farmId, deviceId, sensorType) {
  return await this.findOne({
    'metadata.farmId': farmId,
    'metadata.deviceId': deviceId,
    'metadata.sensorType': sensorType
  }).sort('-timestamp');
};

IotReadingSchema.statics.getTimeSeries = async function (
  farmId,
  sensorType,
  startDate,
  endDate,
  limit = 1000
) {
  return await this.find({
    'metadata.farmId': farmId,
    'metadata.sensorType': sensorType,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort('timestamp')
    .limit(limit)
    .lean();
};

IotReadingSchema.statics.getAggregates = async function (
  farmId,
  sensorType,
  startDate,
  endDate,
  interval = 'hour'
) {
  const dateFormat = {
    hour: {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' },
      hour: { $hour: '$timestamp' }
    },
    day: {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    },
    month: {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' }
    }
  };

  return await this.aggregate([
    {
      $match: {
        'metadata.farmId': mongoose.Types.ObjectId(farmId),
        'metadata.sensorType': sensorType,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: dateFormat[interval],
        avg: { $avg: '$value' },
        min: { $min: '$value' },
        max: { $max: '$value' },
        count: { $sum: 1 },
        unit: { $first: '$unit' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

IotReadingSchema.statics.checkThresholds = async function (farmId, rules) {
  const alerts = [];

  for (const rule of rules) {
    const latest = await this.getLatest(farmId, rule.deviceId, rule.sensorType);

    if (!latest) continue;

    let triggered = false;
    let type = null;

    if (rule.max && latest.value > rule.max) {
      triggered = true;
      type = latest.value > rule.critical ? 'critical' : 'high';
    }

    if (rule.min && latest.value < rule.min) {
      triggered = true;
      type = latest.value < rule.critical ? 'critical' : 'low';
    }

    if (triggered) {
      latest.alert = {
        triggered: true,
        type,
        notified: false
      };
      await latest.save();

      alerts.push({
        farmId,
        deviceId: rule.deviceId,
        sensorType: rule.sensorType,
        value: latest.value,
        unit: latest.unit,
        threshold: type === 'high' || type === 'critical' ? rule.max : rule.min,
        type,
        timestamp: latest.timestamp
      });
    }
  }

  return alerts;
};

IotReadingSchema.statics.getPendingAlerts = async function (farmId) {
  return await this.find({
    'metadata.farmId': farmId,
    'alert.triggered': true,
    'alert.notified': false
  }).sort('-timestamp');
};

IotReadingSchema.statics.markAlertsNotified = async function (readingIds) {
  return await this.updateMany({ _id: { $in: readingIds } }, { $set: { 'alert.notified': true } });
};

// JSON transform
IotReadingSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const IotReadingModel = mongoose.model('IotReading', IotReadingSchema);

module.exports = IotReadingModel;
