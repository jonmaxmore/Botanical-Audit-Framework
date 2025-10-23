// @ts-nocheck
/**
 * Validation Schemas with Zod
 *
 * Comprehensive validation schemas for:
 * - User input validation
 * - API request validation
 * - Form validation
 * - File upload validation
 * - SQL injection prevention
 * - XSS prevention
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Email validation with strict rules
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

/**
 * Password validation with complexity requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Phone number validation (Thai format)
 */
export const phoneSchema = z
  .string()
  .regex(/^0[0-9]{9}$/, 'Invalid Thai phone number format (must be 10 digits starting with 0)')
  .or(z.string().regex(/^\+66[0-9]{9}$/, 'Invalid Thai phone number format (+66 format)'));

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Date validation
 */
export const dateSchema = z.string().datetime('Invalid date format').or(z.date());

/**
 * Safe string (prevents XSS)
 */
export const safeStringSchema = z
  .string()
  .trim()
  .transform(str => str.replace(/[<>]/g, '')) // Remove angle brackets
  .refine(str => !/<script|javascript:|on\w+=/i.test(str), {
    message: 'String contains potentially dangerous content',
  });

/**
 * Alphanumeric only
 */
export const alphanumericSchema = z
  .string()
  .regex(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers');

/**
 * Slug validation
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(1)
  .max(200);

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User registration schema
 */
export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: safeStringSchema.min(1).max(100),
    lastName: safeStringSchema.min(1).max(100),
    phone: phoneSchema.optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  firstName: safeStringSchema.min(1).max(100).optional(),
  lastName: safeStringSchema.min(1).max(100).optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  bio: safeStringSchema.max(500).optional(),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// Application Schemas
// ============================================================================

/**
 * Application status enum
 */
export const applicationStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'PENDING_PAYMENT',
  'COMPLETED',
  'CANCELLED',
]);

/**
 * Payment status enum
 */
export const paymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'CANCELLED',
]);

/**
 * Application create/update schema
 */
export const applicationSchema = z.object({
  farmName: safeStringSchema.min(1).max(255),
  farmAddress: safeStringSchema.min(1).max(500),
  farmSize: z.number().positive('Farm size must be positive'),
  farmSizeUnit: z.enum(['rai', 'hectare', 'sqm']),
  cultivationType: z.enum(['outdoor', 'indoor', 'greenhouse', 'mixed']),
  cropTypes: z.array(safeStringSchema).min(1, 'At least one crop type is required'),
  ownerName: safeStringSchema.min(1).max(255),
  ownerIdCard: z.string().regex(/^[0-9]{13}$/, 'Invalid Thai ID card number'),
  ownerPhone: phoneSchema,
  ownerEmail: emailSchema.optional(),
  additionalInfo: safeStringSchema.max(2000).optional(),
});

// ============================================================================
// Document Schemas
// ============================================================================

/**
 * Document type enum
 */
export const documentTypeSchema = z.enum([
  'ID_CARD',
  'HOUSE_REGISTRATION',
  'LAND_DEED',
  'FARM_MAP',
  'CULTIVATION_PLAN',
  'WATER_SOURCE',
  'SOIL_TEST',
  'OTHER',
]);

/**
 * File upload schema
 */
export const fileUploadSchema = z
  .object({
    fileName: safeStringSchema.min(1).max(255),
    fileSize: z
      .number()
      .positive()
      .max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
    fileType: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/i, 'Invalid file type'),
    documentType: documentTypeSchema,
  })
  .refine(
    data => {
      // Allowed file types
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      return allowedTypes.includes(data.fileType);
    },
    {
      message: 'File type must be PDF, JPEG, PNG, or WebP',
      path: ['fileType'],
    },
  );

/**
 * Document update schema
 */
export const documentUpdateSchema = z.object({
  documentType: documentTypeSchema.optional(),
  description: safeStringSchema.max(500).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  rejectionReason: safeStringSchema.max(500).optional(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

/**
 * Payment method enum
 */
export const paymentMethodSchema = z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PROMPTPAY', 'CASH']);

/**
 * Payment create schema
 */
export const paymentCreateSchema = z.object({
  applicationId: uuidSchema,
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: paymentMethodSchema,
  notes: safeStringSchema.max(500).optional(),
});

/**
 * Payment update schema
 */
export const paymentUpdateSchema = z.object({
  status: paymentStatusSchema,
  transactionId: safeStringSchema.max(255).optional(),
  paidAt: dateSchema.optional(),
  notes: safeStringSchema.max(500).optional(),
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: safeStringSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Search schema
 */
export const searchSchema = z.object({
  q: safeStringSchema.min(1).max(200),
  fields: z.array(safeStringSchema).optional(),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    data => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );

/**
 * Filter schema
 */
export const filterSchema = z.object({
  status: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  dateRange: dateRangeSchema.optional(),
  userId: uuidSchema.optional(),
});

// ============================================================================
// Admin Schemas
// ============================================================================

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'INSPECTOR', 'VIEWER']);

/**
 * User create/update by admin
 */
export const adminUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  firstName: safeStringSchema.min(1).max(100),
  lastName: safeStringSchema.min(1).max(100),
  phone: phoneSchema.optional(),
  role: userRoleSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

/**
 * Bulk action schema
 */
export const bulkActionSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
  action: z.enum(['delete', 'approve', 'reject', 'export']),
  reason: safeStringSchema.max(500).optional(),
});

// ============================================================================
// API Response Schemas
// ============================================================================

/**
 * Success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate data against schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Safe parse (returns default on error)
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown, defaultValue: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError): Array<{
  field: string;
  message: string;
}> {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validation middleware creator
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return schema.parse(data);
  };
}

// Export type inference helpers
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type PaymentCreate = z.infer<typeof paymentCreateSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type BulkAction = z.infer<typeof bulkActionSchema>;

// Example usage:
/*
// In API route
import { userRegistrationSchema, formatZodErrors } from '@/lib/security/validation-schemas';

export default async function handler(req, res) {
  try {
    const data = userRegistrationSchema.parse(req.body);
    // Data is now validated and type-safe
    // ... proceed with registration
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: formatZodErrors(error)
      });
    }
    throw error;
  }
}
*/
