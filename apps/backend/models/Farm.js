const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const PlotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    value: Number,
    unit: {
      type: String,
      enum: ['rai', 'acre', 'hectare', 'sqm'],
      default: 'rai'
    }
  },
  location: LocationSchema,
  boundary: {
    type: [[Number]], // Array of [longitude, latitude] points forming polygon
    default: []
  },
  soilType: String,
  crops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    }
  ],
  status: {
    type: String,
    enum: ['active', 'fallow', 'preparing', 'harvested'],
    default: 'active'
  }
});

const CertificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  issuingBody: String,
  certificateNumber: String,
  issueDate: Date,
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'active'
  },
  documents: [
    {
      title: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const FarmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      unique: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    contactDetails: {
      phone: String,
      email: String,
      address: {
        line1: String,
        line2: String,
        subdistrict: String,
        district: String,
        province: String,
        postalCode: String,
        country: {
          type: String,
          default: 'Thailand'
        }
      }
    },
    location: LocationSchema,
    region: {
      type: String,
      enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
      required: true
    },
    totalArea: {
      value: Number,
      unit: {
        type: String,
        enum: ['rai', 'acre', 'hectare', 'sqm'],
        default: 'rai'
      }
    },
    plots: [PlotSchema],
    farmingType: {
      type: String,
      enum: ['conventional', 'organic', 'gapHybrid', 'hydroponic', 'mixed'],
      default: 'conventional'
    },
    certifications: [CertificationSchema],
    waterSources: [
      {
        type: String,
        enum: ['river', 'reservoir', 'groundwater', 'rainfall', 'irrigation', 'other']
      }
    ],
    founded: Date,
    images: [
      {
        url: String,
        caption: String,
        isPrimary: Boolean
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active'
    },

    // === Membership & Feature Access Control ===
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free'
      },
      startDate: Date,
      expiryDate: Date,
      autoRenew: {
        type: Boolean,
        default: false
      },
      paymentStatus: {
        type: String,
        enum: ['active', 'pending', 'overdue', 'cancelled'],
        default: 'active'
      }
    },
    featureAccess: {
      // Phase 2: IoT Features (Optional - Free for now, may become premium)
      iotMonitoring: {
        enabled: {
          type: Boolean,
          default: false
        },
        availableInTier: {
          type: String,
          enum: ['free', 'basic', 'premium', 'enterprise'],
          default: 'free' // เบื้องต้นให้ฟรี
        },
        activatedAt: Date
      },
      // Phase 3: AI Features (Optional - Free for now, may become premium)
      aiRecommendations: {
        enabled: {
          type: Boolean,
          default: false
        },
        availableInTier: {
          type: String,
          enum: ['free', 'basic', 'premium', 'enterprise'],
          default: 'free' // เบื้องต้นให้ฟรี
        },
        activatedAt: Date,
        features: {
          fertilizer: {
            type: Boolean,
            default: false
          },
          irrigation: {
            type: Boolean,
            default: false
          },
          diseasePrediction: {
            type: Boolean,
            default: false
          },
          yieldPrediction: {
            type: Boolean,
            default: false
          }
        }
      },
      // Advanced Analytics (Future - Premium only)
      advancedAnalytics: {
        enabled: {
          type: Boolean,
          default: false
        },
        availableInTier: {
          type: String,
          enum: ['premium', 'enterprise'],
          default: 'premium'
        }
      }
    },

    // === Phase 2: IoT & Smart Farming (Optional) ===
    // ⚠️ Note: ฟีเจอร์นี้ optional - ไม่บังคับใช้
    // เบื้องต้นฟรี แต่อนาคตอาจต้องสมัครสมาชิก
    iotDevices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IoTDevice'
      }
    ],
    sensorMonitoring: {
      enabled: {
        type: Boolean,
        default: false
      },
      alertsEnabled: {
        type: Boolean,
        default: false
      },
      lastDataReceived: Date
    },
    realTimeData: {
      currentSoilMoisture: Number, // %
      currentSoilPH: Number,
      currentSoilTemperature: Number, // Celsius
      currentAirTemperature: Number, // Celsius
      currentHumidity: Number, // %
      npk: {
        nitrogen: Number, // ppm
        phosphorus: Number, // ppm
        potassium: Number // ppm
      },
      ec: Number, // Electrical Conductivity (mS/cm)
      lastUpdated: Date
    },

    // === Phase 3: AI Recommendations & ML (Optional) ===
    // ⚠️ Note: ฟีเจอร์นี้ optional - ไม่บังคับใช้
    // เบื้องต้นฟรี แต่อนาคตอาจต้องสมัครสมาชิก
    aiRecommendations: {
      fertilizer: {
        lastGenerated: Date,
        nextApplicationDate: Date,
        recommendedProduct: String,
        npkRatio: String,
        amountPerRai: Number,
        estimatedCost: Number,
        reason: String,
        confidence: Number // 0-100
      },
      irrigation: {
        lastScheduleGenerated: Date,
        weeklySchedule: [
          {
            date: Date,
            amount: Number, // liters or mm
            duration: Number, // minutes
            method: {
              type: String,
              enum: ['drip', 'sprinkler', 'flood', 'manual']
            },
            reason: String
          }
        ],
        estimatedWaterSavings: Number, // %
        estimatedCostSavings: Number // THB
      },
      disease: {
        lastPrediction: Date,
        riskLevel: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        },
        predictedDiseases: [
          {
            diseaseId: String,
            diseaseName: String,
            probability: Number, // 0-100
            peakRiskDate: Date,
            preventiveMeasures: [String]
          }
        ],
        overallRisk: Number // 0-100
      },
      yield: {
        lastPrediction: Date,
        predictedYieldPerRai: Number, // kg
        confidence: Number, // 0-100
        expectedHarvestDate: Date,
        factors: [String],
        comparisonToRegionalAverage: Number // % difference
      }
    },

    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create geo-spatial index for location
FarmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);
