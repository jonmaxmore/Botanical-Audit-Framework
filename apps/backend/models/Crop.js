const mongoose = require('mongoose');

const GrowingCycleSchema = new mongoose.Schema({
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm.plots'
  },
  plantingDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: Date,
  actualHarvestDate: Date,
  status: {
    type: String,
    enum: ['planned', 'planted', 'growing', 'harvested', 'failed'],
    default: 'planned'
  },
  plantingDensity: {
    value: Number,
    unit: String
  },
  inputs: [
    {
      type: {
        type: String,
        enum: ['fertilizer', 'pesticide', 'herbicide', 'water', 'other']
      },
      name: String,
      applicationDate: Date,
      quantity: {
        value: Number,
        unit: String
      },
      notes: String
    }
  ],
  activities: [
    {
      type: {
        type: String,
        enum: [
          'planting',
          'watering',
          'fertilizing',
          'pestControl',
          'weeding',
          'pruning',
          'harvesting',
          'other'
        ]
      },
      date: Date,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String,
      images: [String]
    }
  ],
  yield: {
    expected: {
      value: Number,
      unit: String
    },
    actual: {
      value: Number,
      unit: String
    }
  },
  notes: String,
  weather: [
    {
      date: Date,
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      notes: String
    }
  ],

  // === Phase 2: Sensor Data Integration ===
  sensorData: {
    deviceIds: [String],
    avgSoilMoisture: Number, // %
    avgSoilPH: Number,
    avgTemperature: Number, // Celsius
    avgHumidity: Number, // %
    totalWaterUsed: Number, // liters
    avgNPK: {
      nitrogen: Number, // ppm
      phosphorus: Number, // ppm
      potassium: Number // ppm
    },
    dataCollectionPeriod: {
      start: Date,
      end: Date
    }
  },

  // === Phase 3: AI Insights & ML Features ===
  aiInsights: {
    yieldPrediction: {
      predictedYield: Number, // kg
      confidence: Number, // 0-100
      generatedAt: Date,
      factors: [String], // List of factors affecting yield
      comparisonToPrediction: Number // % difference (actual vs predicted)
    },
    healthAssessment: {
      overallScore: Number, // 0-100
      issues: [String], // Current problems detected
      recommendations: [String], // Suggested actions
      lastAssessment: Date
    },
    nextActions: [
      {
        action: String, // "Apply fertilizer", "Increase watering", etc.
        dueDate: Date,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent']
        },
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }
    ]
  },

  // === ML Features (Calculated for Machine Learning) ===
  mlFeatures: {
    growingDegreeDays: Number, // Accumulated heat units
    waterUseEfficiency: Number, // kg yield per m³ water
    nutrientUseEfficiency: Number, // kg yield per kg NPK
    successScore: Number, // 0-100 overall success rating
    daysToHarvest: Number,
    stressEvents: [
      {
        type: {
          type: String,
          enum: ['drought', 'flood', 'heat', 'cold', 'pest', 'disease']
        },
        date: Date,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'severe']
        },
        duration: Number // days
      }
    ]
  }
});

const CropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    scientificName: String,
    variety: String,
    category: {
      type: String,
      enum: ['vegetable', 'fruit', 'grain', 'herb', 'flower', 'tree', 'other'],
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    growingCycles: [GrowingCycleSchema],
    averageGrowingPeriod: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
      }
    },
    optimalConditions: {
      soilType: String,
      soilPH: {
        min: Number,
        max: Number
      },
      temperature: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        }
      },
      sunlight: String,
      waterRequirements: String
    },
    images: [
      {
        url: String,
        caption: String
      }
    ],
    notes: String,
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

module.exports = mongoose.model('Crop', CropSchema);
