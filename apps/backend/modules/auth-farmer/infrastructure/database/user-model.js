/**
 * MongoDB User Repository Implementation
 * Infrastructure Layer - Clean Architecture
 *
 * Purpose: Implement IUserRepository interface for MongoDB
 * - Mongoose schema and model
 * - Domain ↔ MongoDB conversion
 * - All repository methods implementation
 */

const mongoose = require('mongoose');
const User = require('../../domain/entities/User');
const IUserRepository = require('../../domain/interfaces/IUserRepository');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-farmer-user');

// Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    idCard: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    idCardImage: {
      type: String,
      required: false, // Optional for now, or true if strictly required
    },
    laserCode: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    province: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    subdistrict: {
      type: String,
      default: '',
    },
    zipCode: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['FARMER', 'ADMIN'],
      default: 'FARMER',
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      sparse: true,
      index: true,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      sparse: true,
      index: true,
    },
    passwordResetExpiry: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lockedUntil: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: process.env.FARMER_USERS_COLLECTION || 'users_farmer',
  },
);

// Indexes for performance
userSchema.index({ email: 1, status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isEmailVerified: 1, status: 1 });

class MongoDBUserRepository extends IUserRepository {
  constructor(database) {
    super();
    this.database = database;
    this.model = database.model('UserFarmer', userSchema);
  }

  /**
   * Convert MongoDB document to Domain entity
   * @param {Object} doc - MongoDB document
   * @returns {User}
   */
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    return new User({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phoneNumber: doc.phoneNumber,
      idCard: doc.idCard,
      idCardImage: doc.idCardImage,
      laserCode: doc.laserCode,
      address: doc.address,
      province: doc.province,
      district: doc.district,
      subdistrict: doc.subdistrict,
      zipCode: doc.zipCode,
      role: doc.role,
      status: doc.status,
      verificationStatus: doc.verificationStatus,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerificationExpiry: doc.emailVerificationExpiry,
      passwordResetToken: doc.passwordResetToken,
      passwordResetExpiry: doc.passwordResetExpiry,
      lastLoginAt: doc.lastLoginAt,
      loginAttempts: doc.loginAttempts,
      isLocked: doc.isLocked,
      lockedUntil: doc.lockedUntil,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Domain entity to MongoDB document
   * @param {User} user - User entity
   * @returns {Object}
   */
  toMongoDB(user) {
    return {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      idCard: user.idCard,
      idCardImage: user.idCardImage,
      laserCode: user.laserCode,
      address: user.address,
      province: user.province,
      district: user.district,
      subdistrict: user.subdistrict,
      zipCode: user.zipCode,
      role: user.role,
      status: user.status,
      verificationStatus: user.verificationStatus,
      isEmailVerified: user.isEmailVerified,
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpiry: user.emailVerificationExpiry,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpiry: user.passwordResetExpiry,
      lastLoginAt: user.lastLoginAt,
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil,
      metadata: user.metadata,
      updatedAt: new Date(),
    };
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      const doc = await this.model.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const doc = await this.model.findOne({ email: email.toLowerCase() });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID card
   */
  async findByIdCard(idCard) {
    try {
      const doc = await this.model.findOne({ idCard });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding user by ID card:', error);
      return null;
    }
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token) {
    try {
      const doc = await this.model.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: new Date() },
      });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding user by verification token:', error);
      return null;
    }
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token) {
    try {
      const doc = await this.model.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: new Date() },
      });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding user by reset token:', error);
      return null;
    }
  }

  /**
   * Save user (create or update)
   */
  async save(user) {
    try {
      const mongoData = this.toMongoDB(user);

      let doc;
      if (user.id) {
        // Update existing user
        doc = await this.model.findByIdAndUpdate(user.id, mongoData, {
          new: true,
          runValidators: true,
        });
      } else {
        // Create new user
        doc = await this.model.create(mongoData);
      }

      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error saving user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Find users with filters
   */
  async findWithFilters(filters) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.role) {
        query.role = filters.role;
      }
      if (filters.isEmailVerified !== undefined) {
        query.isEmailVerified = filters.isEmailVerified;
      }
      if (filters.province) {
        query.province = filters.province;
      }

      const docs = await this.model
        .find(query)
        .sort(filters.sort || { createdAt: -1 })
        .skip(filters.skip || 0)
        .limit(filters.limit || 20);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding users with filters:', error);
      return [];
    }
  }

  /**
   * Count users by status
   */
  async countByStatus(status) {
    try {
      return await this.model.countDocuments({ status });
    } catch (error) {
      logger.error('Error counting users:', error);
      return 0;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    try {
      const count = await this.model.countDocuments({
        email: email.toLowerCase(),
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking email exists:', error);
      return false;
    }
  }

  /**
   * Check if ID card exists
   */
  async idCardExists(idCard) {
    try {
      const count = await this.model.countDocuments({ idCard });
      return count > 0;
    } catch (error) {
      logger.error('Error checking ID card exists:', error);
      return false;
    }
  }

  /**
   * Find recently registered users
   */
  async findRecentlyRegistered(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const docs = await this.model
        .find({ createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(100);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding recently registered users:', error);
      return [];
    }
  }
}

module.exports = MongoDBUserRepository;
