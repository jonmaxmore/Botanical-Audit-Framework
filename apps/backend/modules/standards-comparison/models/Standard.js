/**
 * Standard Model
 *
 * MongoDB schema for standards (GACP, GAP, etc.)
 */

const mongoose = require('mongoose');

const criterionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    requirement: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['critical', 'important', 'optional'],
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    description: String,
    examples: [String]
  },
  { _id: false }
);

const requirementSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    criteria: [criterionSchema]
  },
  { _id: false }
);

const standardSchema = new mongoose.Schema(
  {
    // Standard identification
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    description: String,

    // Standard organization
    issuingOrganization: String,
    website: String,

    // Status
    active: {
      type: Boolean,
      default: true,
      index: true
    },

    // Requirements
    requirements: [requirementSchema],

    // Metadata
    applicableRegions: [String],
    applicableCropTypes: [String],
    certificationDuration: {
      years: Number,
      description: String
    },

    // Timestamps
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
    collection: 'standards'
  }
);

// Indexes
standardSchema.index({ id: 1, active: 1 });
standardSchema.index({ name: 1 });

// Update timestamp on save
standardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for total criteria count
standardSchema.virtual('totalCriteria').get(function() {
  return this.requirements.reduce((total, req) => total + req.criteria.length, 0);
});

// Virtual for category count
standardSchema.virtual('categoryCount').get(function() {
  return this.requirements.length;
});

// Method to get criteria by priority
standardSchema.methods.getCriteriaByPriority = function(priority) {
  const criteria = [];

  for (const requirement of this.requirements) {
    const filteredCriteria = requirement.criteria.filter(c => c.priority === priority);
    criteria.push(
      ...filteredCriteria.map(c => ({
        ...c.toObject(),
        category: requirement.category,
        categoryTitle: requirement.title
      }))
    );
  }

  return criteria;
};

// Method to get critical criteria
standardSchema.methods.getCriticalCriteria = function() {
  return this.getCriteriaByPriority('critical');
};

// Method to calculate max possible score
standardSchema.methods.getMaxScore = function() {
  let maxScore = 0;

  for (const requirement of this.requirements) {
    for (const criterion of requirement.criteria) {
      maxScore += criterion.weight;
    }
  }

  return maxScore;
};

// Method to get category by name
standardSchema.methods.getCategory = function(categoryName) {
  return this.requirements.find(req => req.category === categoryName);
};

// Static method to find active standards
standardSchema.statics.findActive = function() {
  return this.find({ active: true }).sort({ name: 1 });
};

// Static method to find by crop type
standardSchema.statics.findByCropType = function(cropType) {
  return this.find({
    active: true,
    applicableCropTypes: cropType
  });
};

// Static method to search standards
standardSchema.statics.search = function(query) {
  return this.find({
    active: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { issuingOrganization: { $regex: query, $options: 'i' } }
    ]
  });
};

const Standard = mongoose.model('Standard', standardSchema);

module.exports = Standard;
