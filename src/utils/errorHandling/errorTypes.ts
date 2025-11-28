/**
 * Error Types
 * 
 * Type definitions for the error handling system
 */

/**
 * Error categories for better error handling and user feedback
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Interface for standardized error objects
 */
export interface StandardError {
  /** User-friendly error message */
  message: string;
  /** Error category for handling different types of errors */
  category: ErrorCategory;
  /** Original error object for debugging */
  originalError?: unknown;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Error code if available */
  code?: string;
  /** HTTP status code if available */
  statusCode?: number;
  /** Stack trace for debugging (only in development) */
  stack?: string;
  /** Context information about where the error occurred */
  context?: {
    /** Function or method where the error occurred */
    functionName?: string;
    /** Component or module where the error occurred */
    component?: string;
    /** Additional contextual information */
    info?: Record<string, unknown>;
    /** Timestamp when the error occurred */
    timestamp: number;
  };
  /** Whether this error has been processed by the error handler */
  processed?: boolean;
}

/**
 * Interface for enhanced errors with additional properties
 */
export interface EnhancedError extends Error {
  originalError: unknown;
  category: ErrorCategory;
  context?: StandardError['context'];
  standardError: StandardError;
}
