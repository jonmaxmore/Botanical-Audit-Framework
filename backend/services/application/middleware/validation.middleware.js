/**
 * Application Validation Middleware
 *
 * Request validation for application endpoints.
 * Uses Joi for schema validation.
 *
 * @module middleware/validation.middleware
 * @requires joi
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-16
 */

const Joi = require('joi');

/**
 * Validate application ID format
 * Format: APP-YYYY-XXXXXXXX
 */
exports.validateApplicationId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^APP-\d{4}-[A-Z0-9]{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid application ID format. Expected: APP-YYYY-XXXXXXXX',
        'any.required': 'Application ID is required',
      }),
  });

  const { error } = schema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validate create application request
 */
exports.validateCreateApplication = (req, res, next) => {
  const schema = Joi.object({
    farmName: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Farm name must be at least 2 characters',
      'string.max': 'Farm name cannot exceed 200 characters',
      'any.required': 'Farm name is required',
    }),

    farmAddress: Joi.object({
      houseNo: Joi.string().required().messages({
        'any.required': 'House number is required',
      }),

      moo: Joi.string().allow(null, '').default(null),

      tambon: Joi.string().required().messages({
        'any.required': 'Tambon (sub-district) is required',
      }),

      amphoe: Joi.string().required().messages({
        'any.required': 'Amphoe (district) is required',
      }),

      province: Joi.string().required().messages({
        'any.required': 'Province is required',
      }),

      postalCode: Joi.string()
        .pattern(/^[0-9]{5}$/)
        .required()
        .messages({
          'string.pattern.base': 'Postal code must be 5 digits',
          'any.required': 'Postal code is required',
        }),

      gpsCoordinates: Joi.object({
        type: Joi.string().valid('Point').required(),

        coordinates: Joi.array()
          .length(2)
          .items(
            Joi.number().min(-180).max(180), // longitude
            Joi.number().min(-90).max(90) // latitude
          )
          .required()
          .messages({
            'array.length': 'GPS coordinates must have exactly 2 values [longitude, latitude]',
            'any.required': 'GPS coordinates are required',
          }),
      }).required(),
    }).required(),

    farmSize: Joi.number().min(0.1).max(10000).required().messages({
      'number.min': 'Farm size must be at least 0.1',
      'number.max': 'Farm size cannot exceed 10,000',
      'any.required': 'Farm size is required',
    }),

    farmSizeUnit: Joi.string().valid('rai', 'sqm', 'hectare').default('rai'),

    cultivationType: Joi.string().valid('INDOOR', 'OUTDOOR', 'GREENHOUSE').required().messages({
      'any.only': 'Cultivation type must be INDOOR, OUTDOOR, or GREENHOUSE',
      'any.required': 'Cultivation type is required',
    }),

    cannabisVariety: Joi.string().valid('CBD', 'THC', 'MIXED').required().messages({
      'any.only': 'Cannabis variety must be CBD, THC, or MIXED',
      'any.required': 'Cannabis variety is required',
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validate update application request
 * Same as create but all fields optional
 */
exports.validateUpdateApplication = (req, res, next) => {
  const schema = Joi.object({
    farmName: Joi.string().min(2).max(200).messages({
      'string.min': 'Farm name must be at least 2 characters',
      'string.max': 'Farm name cannot exceed 200 characters',
    }),

    farmAddress: Joi.object({
      houseNo: Joi.string(),
      moo: Joi.string().allow(null, ''),
      tambon: Joi.string(),
      amphoe: Joi.string(),
      province: Joi.string(),
      postalCode: Joi.string().pattern(/^[0-9]{5}$/),
      gpsCoordinates: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array()
          .length(2)
          .items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90)),
      }),
    }),

    farmSize: Joi.number().min(0.1).max(10000),

    farmSizeUnit: Joi.string().valid('rai', 'sqm', 'hectare'),

    cultivationType: Joi.string().valid('INDOOR', 'OUTDOOR', 'GREENHOUSE'),

    cannabisVariety: Joi.string().valid('CBD', 'THC', 'MIXED'),
  }).min(1); // At least one field must be present

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validate query parameters for list applications
 */
exports.validateListQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(10),

    state: Joi.string()
      .valid(
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFIED',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'PHASE2_PAYMENT_PENDING',
        'PHASE2_PAYMENT_VERIFIED',
        'APPROVED',
        'CERTIFICATE_ISSUED',
        'REJECTED',
        'REVISION_REQUIRED',
        'EXPIRED'
      )
      .optional(),

    province: Joi.string().optional(),

    sortBy: Joi.string()
      .valid('createdAt', 'submittedAt', 'farmName', 'state')
      .default('createdAt'),

    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message,
      })),
    });
  }

  // Replace query with validated values
  req.query = value;
  next();
};
