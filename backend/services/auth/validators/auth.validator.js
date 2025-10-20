/**
 * Authentication Validators (CORRECTED)
 *
 * Joi validation schemas matching User model field names.
 *
 * Field mappings:
 * - thaiId (NOT idCard)
 * - phoneNumber (NOT phone)
 * - address.houseNumber (NOT houseNo)
 *
 * @module validators/auth
 */

const Joi = require('joi');

/**
 * Validate Thai National ID card using Mod 11 algorithm
 */
function validateThaiID(id) {
  if (!/^\d{13}$/.test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12));
}

/**
 * Custom Joi validator for Thai ID
 */
const thaiIdValidator = (value, helpers) => {
  if (!validateThaiID(value)) {
    return helpers.error('custom.invalidThaiID');
  }
  return value;
};

/**
 * Registration validation schema
 */
const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'กรุณากรอกอีเมลที่ถูกต้อง',
    'any.required': 'กรุณากรอกอีเมล',
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
      'string.max': 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร',
      'string.pattern.base':
        'รหัสผ่านต้องประกอบด้วย: ตัวพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข, และอักขระพิเศษ (@$!%*?&)',
      'any.required': 'กรุณากรอกรหัสผ่าน',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'รหัสผ่านไม่ตรงกัน',
    'any.required': 'กรุณายืนยันรหัสผ่าน',
  }),

  fullName: Joi.string().min(2).max(200).trim().required().messages({
    'string.min': 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร',
    'string.max': 'ชื่อ-นามสกุลต้องไม่เกิน 200 ตัวอักษร',
    'any.required': 'กรุณากรอกชื่อ-นามสกุล',
  }),

  thaiId: Joi.string()
    .length(13)
    .pattern(/^\d+$/)
    .custom(thaiIdValidator, 'Thai ID validation')
    .required()
    .messages({
      'string.length': 'เลขบัตรประชาชนต้องมี 13 หลัก',
      'string.pattern.base': 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น',
      'custom.invalidThaiID': 'เลขบัตรประชาชนไม่ถูกต้อง',
      'any.required': 'กรุณากรอกเลขบัตรประชาชน',
    }),

  phoneNumber: Joi.string()
    .pattern(/^0\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 10 หลัก)',
      'any.required': 'กรุณากรอกเบอร์โทรศัพท์',
    }),

  address: Joi.object({
    houseNumber: Joi.string().required().messages({
      'any.required': 'กรุณากรอกบ้านเลขที่',
    }),
    village: Joi.string().optional().allow(''),
    lane: Joi.string().optional().allow(''),
    road: Joi.string().optional().allow(''),
    subDistrict: Joi.string().required().messages({
      'any.required': 'กรุณากรอกแขวง/ตำบล',
    }),
    district: Joi.string().required().messages({
      'any.required': 'กรุณากรอกเขต/อำเภอ',
    }),
    province: Joi.string().required().messages({
      'any.required': 'กรุณากรอกจังหวัด',
    }),
    postalCode: Joi.string()
      .length(5)
      .pattern(/^\d{5}$/)
      .required()
      .messages({
        'string.length': 'รหัสไปรษณีย์ต้องมี 5 หลัก',
        'string.pattern.base': 'รหัสไปรษณีย์ต้องเป็นตัวเลข',
        'any.required': 'กรุณากรอกรหัสไปรษณีย์',
      }),
  })
    .required()
    .messages({
      'any.required': 'กรุณากรอกที่อยู่',
    }),
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'กรุณากรอกอีเมลที่ถูกต้อง',
    'any.required': 'กรุณากรอกอีเมล',
  }),

  password: Joi.string().required().messages({
    'any.required': 'กรุณากรอกรหัสผ่าน',
  }),
});

/**
 * Email verification validation schema
 */
const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .length(64)
    .pattern(/^[a-f0-9]{64}$/)
    .required()
    .messages({
      'string.length': 'โทเค็นไม่ถูกต้อง',
      'string.pattern.base': 'โทเค็นไม่ถูกต้อง',
      'any.required': 'กรุณาระบุโทเค็น',
    }),
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'กรุณากรอกอีเมลที่ถูกต้อง',
    'any.required': 'กรุณากรอกอีเมล',
  }),
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .length(64)
    .pattern(/^[a-f0-9]+$/)
    .required()
    .messages({
      'string.length': 'โทเค็นไม่ถูกต้อง',
      'string.pattern.base': 'โทเค็นไม่ถูกต้อง',
      'any.required': 'กรุณาระบุโทเค็น',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
      'string.max': 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร',
      'string.pattern.base':
        'รหัสผ่านต้องประกอบด้วย: ตัวพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข, และอักขระพิเศษ (@$!%*?&)',
      'any.required': 'กรุณากรอกรหัสผ่าน',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'รหัสผ่านไม่ตรงกัน',
    'any.required': 'กรุณายืนยันรหัสผ่าน',
  }),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'กรุณากรอกรหัสผ่านปัจจุบัน',
    'string.empty': 'กรุณากรอกรหัสผ่านปัจจุบัน',
  }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
      'string.max': 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร',
      'string.pattern.base':
        'รหัสผ่านต้องประกอบด้วย: ตัวพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข, และอักขระพิเศษ (@$!%*?&)',
      'any.required': 'กรุณากรอกรหัสผ่านใหม่',
    }),
});

/**
 * Validate request body against schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'ข้อมูลไม่ถูกต้อง',
        details: errors,
      });
    }

    req.body = value;
    next();
  };
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  validateThaiID,
};
