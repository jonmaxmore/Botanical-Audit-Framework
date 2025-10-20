/**
 * Security Integration Examples
 * How to integrate GACP security middleware in your services
 */

const express = require('express');
const { securityPresets, securityUtils } = require('../shared/security');

const app = express();

// Example 1: Using security presets for different service types

// For API services
const apiSecurity = securityPresets.api({
  rateLimitMax: 1000,
  domain: 'gacp-platform.com',
});

// Apply all security middleware
app.use(apiSecurity.stack());

// Example 2: Using individual security middleware

// Apply headers first
app.use(apiSecurity.headers);

// Apply rate limiting
app.use(apiSecurity.rateLimit);

// Apply XSS protection
app.use(apiSecurity.xss);

// Apply CSRF protection
app.use(apiSecurity.csrf);

// Example 3: Route-specific validation

// User registration with validation
app.post(
  '/api/auth/register',
  apiSecurity.validate({
    body: Joi.object({
      email: apiSecurity.schemas.email,
      password: apiSecurity.schemas.password,
      firstName: apiSecurity.schemas.name,
      lastName: apiSecurity.schemas.name,
      phone: apiSecurity.schemas.phone,
    }),
  }),
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Hash password
      const hashedPassword = await securityUtils.hashPassword(password);

      // Create user logic here
      const user = await createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      });

      // Generate JWT
      const token = securityUtils.generateJWT(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
      );

      res.json({
        success: true,
        message: 'User registered successfully',
        token: token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'REGISTRATION_FAILED',
        message: error.message,
      });
    }
  },
);

// Example 4: Farm application with comprehensive validation
app.post(
  '/api/applications',
  apiSecurity.validate({
    body: Joi.object({
      farmName: apiSecurity.schemas.farmName,
      farmSize: apiSecurity.schemas.farmSize,
      coordinates: apiSecurity.schemas.coordinates,
      applicationTitle: apiSecurity.schemas.applicationTitle,
      description: apiSecurity.schemas.description.optional(),
      documents: Joi.array().items(apiSecurity.schemas.fileUpload).max(10),
    }),
  }),
  async (req, res) => {
    try {
      // Application creation logic
      const application = await createApplication(req.body);

      res.json({
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'APPLICATION_FAILED',
        message: error.message,
      });
    }
  },
);

// Example 5: Different security for admin routes
const adminSecurity = securityPresets.admin();

app.use('/api/admin', adminSecurity.stack());

app.get(
  '/api/admin/users',
  adminSecurity.validate({
    query: adminSecurity.schemas.pagination,
  }),
  async (req, res) => {
    // Admin-only functionality with strict security
    const { page, limit, sort, sortBy } = req.query;
    const users = await getUsers({ page, limit, sort, sortBy });

    res.json({
      success: true,
      data: users,
    });
  },
);

// Example 6: Public routes with lenient security
const publicSecurity = securityPresets.public();

app.use('/api/public', publicSecurity.stack());

app.get(
  '/api/public/standards',
  publicSecurity.validate({
    query: Joi.object({
      category: Joi.string().max(50).optional(),
      search: Joi.string().max(100).optional(),
    }),
  }),
  async (req, res) => {
    const standards = await getPublicStandards(req.query);

    res.json({
      success: true,
      data: standards,
    });
  },
);

// Example 7: Custom validation schemas
const customValidation = apiSecurity.validate({
  body: Joi.object({
    // Custom Thai address validation
    address: Joi.object({
      houseNumber: Joi.string().max(20).required(),
      street: Joi.string().max(100).optional(),
      subdistrict: Joi.string().max(100).required(),
      district: Joi.string().max(100).required(),
      province: Joi.string().max(100).required(),
      postalCode: Joi.string()
        .pattern(/^\d{5}$/)
        .required(),
    }),

    // Custom certification type validation
    certificationType: Joi.string()
      .valid(
        'ORGANIC_CERTIFICATION',
        'GAP_CERTIFICATION',
        'HACCP_CERTIFICATION',
        'ISO_CERTIFICATION',
      )
      .required(),

    // Custom date validation
    applicationDate: Joi.date().min('now').required(),
    expectedCompletionDate: Joi.date().min(Joi.ref('applicationDate')).required(),
  }),
});

// Example 8: Error handling with security context
app.use((error, req, res, next) => {
  // Log security-related errors
  if (
    error.code === 'CSRF_TOKEN_INVALID' ||
    error.code === 'XSS_DETECTED' ||
    error.code === 'RATE_LIMIT_EXCEEDED'
  ) {
    console.error('Security violation:', {
      error: error.code,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  }

  // Return appropriate error response
  res.status(error.status || 500).json({
    success: false,
    error: error.code || 'INTERNAL_ERROR',
    message: error.message || 'An error occurred',
  });
});

module.exports = { app };
