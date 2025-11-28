/**
 * Custom error classes for JaxSaver application
 * Provides structured error handling with categorization, HTTP codes, and context data
 */

/**
 * Base error class that extends the standard Error
 * Includes additional properties for HTTP code, operational status, and context data
 */
export class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    name: string,
    httpCode: number,
    description: string,
    isOperational: boolean,
    context?: Record<string, any>
  ) {
    super(description);
    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.context = context;
    
    // Capture stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error related to business validation failures
 * Used for business rule violations and validation errors
 */
export class ValidationError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', 400, description, true, context);
  }
}

/**
 * Error related to reservation creation or management
 * Used when reservation operations fail due to business rules
 */
export class ReservationError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('RESERVATION_ERROR', 400, description, true, context);
  }
}

/**
 * Error related to payment processing
 * Used when payment operations fail (Stripe, etc.)
 */
export class PaymentError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('PAYMENT_ERROR', 400, description, true, context);
  }
}

/**
 * Error related to database operations
 * Used when database queries, transactions, or constraints fail
 */
export class DatabaseError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('DATABASE_ERROR', 500, description, true, context);
  }
}

/**
 * Error related to authentication or authorization
 * Used when users lack permission or authentication fails
 */
export class AuthError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('AUTH_ERROR', 401, description, true, context);
  }
}

/**
 * Error related to external service integrations
 * Used when calls to external APIs or services fail
 */
export class ExternalServiceError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('EXTERNAL_SERVICE_ERROR', 502, description, true, context);
  }
}

/**
 * Helper function to determine if an error is one of our custom errors
 */
export const isCustomError = (error: any): error is BaseError => {
  return error instanceof BaseError;
};

/**
 * Helper function to convert any error to a structured response
 */
export const formatErrorResponse = (error: any) => {
  if (isCustomError(error)) {
    return {
      status: 'error',
      message: error.message,
      errorCode: error.name,
      details: error.context
    };
  }
  
  // Default error response for unhandled errors
  return {
    status: 'error',
    message: error.message || 'An unexpected error occurred',
    errorCode: 'SERVER_ERROR'
  };
};
