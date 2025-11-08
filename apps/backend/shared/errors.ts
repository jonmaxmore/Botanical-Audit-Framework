/**
 * Domain Error Classes
 * Typed error classes for business logic failures
 *
 * These errors represent domain-level failures, not technical exceptions.
 * Use with Result<T, E> pattern for explicit error handling.
 */

/**
 * Base Domain Error
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * Used when input data fails validation rules
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Conflict Error (409)
 * Used when operation conflicts with existing state (e.g., duplicate email)
 */
export class ConflictError extends DomainError {
  constructor(
    message: string,
    public readonly resource?: string,
  ) {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

/**
 * Not Found Error (404)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends DomainError {
  constructor(
    message: string,
    public readonly resource?: string,
  ) {
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

/**
 * Unauthorized Error (401)
 * Used when authentication fails
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'UNAUTHORIZED_ERROR', 401);
  }
}

/**
 * Forbidden Error (403)
 * Used when user lacks permission for operation
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN_ERROR', 403);
  }
}

/**
 * Authentication-specific errors
 */

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Email ${email} is already registered`, 'email');
  }
}

export class IdCardAlreadyExistsError extends ConflictError {
  constructor(idCard: string) {
    super(`ID card ${idCard} is already registered`, 'idCard');
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid email or password');
  }
}

export class AccountLockedError extends ForbiddenError {
  constructor(public readonly lockedUntil: Date) {
    super(`Account is locked until ${lockedUntil.toISOString()}`);
  }
}

export class AccountNotVerifiedError extends ForbiddenError {
  constructor() {
    super('Email verification required');
  }
}

export class AccountSuspendedError extends ForbiddenError {
  constructor(reason?: string) {
    super(reason ? `Account suspended: ${reason}` : 'Account is suspended');
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(tokenType: string = 'token') {
    super(`Invalid or expired ${tokenType}`);
  }
}

export class WeakPasswordError extends ValidationError {
  constructor(requirements: string) {
    super(`Password does not meet requirements: ${requirements}`, 'password');
  }
}

export class InvalidEmailFormatError extends ValidationError {
  constructor(email: string) {
    super(`Invalid email format: ${email}`, 'email');
  }
}
