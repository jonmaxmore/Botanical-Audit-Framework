/**
 * User Model
 * User authentication and profile management
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const BaseModel = require('./BaseModel');
const { ValidationError } = require('../utils/errorHandler');

// User schema definition
const userSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't include in queries by default
    },

    // Profile fields
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters']
    },

    // Contact information
    phone: {
      type: String,
      trim: true,
      match: [/^(08|09|06)\d{8}$/, 'Please provide a valid Thai phone number']
    },
    address: {
      street: String,
      district: String,
      province: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Thailand'
      }
    },

    // User role and permissions
    role: {
      type: String,
      enum: {
        values: ['farmer', 'inspector', 'admin', 'auditor', 'customer'],
        message: 'Role must be one of: farmer, inspector, admin, auditor, customer'
      },
      default: 'farmer',
      index: true
    },
    permissions: [
      {
        type: String,
        enum: ['read', 'write', 'delete', 'admin', 'audit', 'inspect']
      }
    ],

    // Account status
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended', 'pending'],
        message: 'Status must be one of: active, inactive, suspended, pending'
      },
      default: 'pending',
      index: true
    },

    // Verification
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },

    // Password reset
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now
    },

    // Profile picture
    avatar: {
      type: String, // URL to profile image
      default: null
    },

    // Additional profile information
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null
    },
    nationality: {
      type: String,
      default: 'Thai'
    },

    // Preferences
    preferences: {
      language: {
        type: String,
        enum: ['th', 'en'],
        default: 'th'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        },
        push: {
          type: Boolean,
          default: true
        }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      }
    },

    // Activity tracking
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },

    // Related data
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'address.province': 1 });
userSchema.index({ createdAt: -1 });

// Text search index
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  displayName: 'text',
  email: 'text'
});

// Virtual fields
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('initials').get(function () {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Hash password if it's been modified
  if (this.isModified('password')) {
    if (this.password.length < 8) {
      return next(new ValidationError('Password must be at least 8 characters'));
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = new Date();
  }

  // Set display name if not provided
  if (!this.displayName) {
    this.displayName = this.fullName;
  }

  // Update last activity
  this.lastActivity = new Date();

  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.hasPermission = function (permission) {
  return (
    this.permissions.includes(permission) ||
    this.permissions.includes('admin') ||
    this.role === 'admin'
  );
};

userSchema.methods.hasRole = function (role) {
  if (Array.isArray(role)) {
    return role.includes(this.role);
  }
  return this.role === role;
};

userSchema.methods.isActive = function () {
  return this.status === 'active' && !this.isDeleted;
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.updateActivity = function () {
  this.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

userSchema.methods.getSafeProfile = function () {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    displayName: this.displayName,
    fullName: this.fullName,
    initials: this.initials,
    phone: this.phone,
    role: this.role,
    status: this.status,
    isEmailVerified: this.isEmailVerified,
    avatar: this.avatar,
    preferences: this.preferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOneActive({ email: email.toLowerCase() });
};

userSchema.statics.findByRole = function (role) {
  return this.findActive({ role });
};

userSchema.statics.findActiveUsers = function () {
  return this.findActive({ status: 'active' });
};

userSchema.statics.searchUsers = function (searchTerm, options = {}) {
  return this.search(searchTerm, { status: 'active' }, options);
};

userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
        farmers: { $sum: { $cond: [{ $eq: ['$role', 'farmer'] }, 1, 0] } },
        inspectors: { $sum: { $cond: [{ $eq: ['$role', 'inspector'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
      }
    }
  ]);

  return (
    stats[0] || {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
      farmers: 0,
      inspectors: 0,
      admins: 0
    }
  );
};

// Create and export model
const User = new BaseModel(userSchema, 'User');

module.exports = User.getModel();
