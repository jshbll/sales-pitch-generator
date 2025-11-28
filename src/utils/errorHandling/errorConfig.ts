/**
 * Error Configuration
 * 
 * Configuration for the error handling system
 */

import { ErrorCategory } from './errorTypes';

/**
 * Global configuration for error handling
 */
export interface ErrorHandlerConfig {
  /** Default user-friendly messages for each error category */
  defaultMessages: Record<ErrorCategory, string>;
  /** Regular expressions for error detection */
  patterns: {
    [key in ErrorCategory]?: RegExp[];
  };
  /** HTTP status codes mapping to error categories */
  statusCodeMapping: Record<number, ErrorCategory>;
  /** Retry configuration */
  retry: {
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Base delay between retries in milliseconds */
    baseDelay: number;
    /** Categories of errors that should be retried */
    retryableCategories: ErrorCategory[];
    /** Whether to use exponential backoff */
    useExponentialBackoff: boolean;
  };
  /** Whether to include stack traces in error details (dev mode) */
  includeStackTraces: boolean;
}

/**
 * Default configuration for error handling
 */
export const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
  defaultMessages: {
    [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet connection.',
    [ErrorCategory.VALIDATION]: 'The provided information is invalid.',
    [ErrorCategory.AUTHENTICATION]: 'Authentication error. Please log in again.',
    [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorCategory.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCategory.SERVER]: 'Server error. Please try again later.',
    [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please try again later.',
    [ErrorCategory.TIMEOUT]: 'The request timed out. Please try again.',
    [ErrorCategory.UNKNOWN]: 'An unexpected error occurred.'
  },
  patterns: {
    [ErrorCategory.NETWORK]: [
      /network|connectivity|offline|internet|connection|fetch|cors|cross-origin/i,
      /failed to fetch|net::/i
    ],
    [ErrorCategory.VALIDATION]: [
      /validation|invalid|not valid|incorrect format|required|missing field|constraint/i
    ],
    [ErrorCategory.AUTHENTICATION]: [
      /auth|login|log in|signin|sign in|unauthenticated|unauthorized|token|jwt|expired|credentials/i,
      /401/i
    ],
    [ErrorCategory.AUTHORIZATION]: [
      /forbidden|permission|access denied|not allowed|restricted|403/i
    ],
    [ErrorCategory.NOT_FOUND]: [
      /not found|doesn't exist|no longer exists|404/i
    ],
    [ErrorCategory.SERVER]: [
      /server|internal|500|502|503|504/i
    ],
    [ErrorCategory.RATE_LIMIT]: [
      /rate limit|too many requests|throttl|429/i
    ],
    [ErrorCategory.TIMEOUT]: [
      /timeout|timed out|too long|deadline exceeded|408/i
    ]
  },
  statusCodeMapping: {
    400: ErrorCategory.VALIDATION,
    401: ErrorCategory.AUTHENTICATION,
    403: ErrorCategory.AUTHORIZATION,
    404: ErrorCategory.NOT_FOUND,
    408: ErrorCategory.TIMEOUT,
    429: ErrorCategory.RATE_LIMIT,
    500: ErrorCategory.SERVER,
    502: ErrorCategory.SERVER,
    503: ErrorCategory.SERVER,
    504: ErrorCategory.TIMEOUT
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    retryableCategories: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT, ErrorCategory.RATE_LIMIT],
    useExponentialBackoff: true
  },
  includeStackTraces: process.env.NODE_ENV === 'development'
};

// Global configuration instance
let errorConfig: ErrorHandlerConfig = { ...DEFAULT_ERROR_CONFIG };

/**
 * Configure the error handler
 * 
 * @param config - Partial configuration to override defaults
 */
export function configureErrorHandler(config: Partial<ErrorHandlerConfig>): void {
  errorConfig = {
    ...errorConfig,
    ...config,
    defaultMessages: {
      ...errorConfig.defaultMessages,
      ...config.defaultMessages
    },
    patterns: {
      ...errorConfig.patterns,
      ...config.patterns
    },
    statusCodeMapping: {
      ...errorConfig.statusCodeMapping,
      ...config.statusCodeMapping
    },
    retry: {
      ...errorConfig.retry,
      ...config.retry
    }
  };
}

/**
 * Get the current error handler configuration
 * 
 * @returns The current error handler configuration
 */
export function getErrorConfig(): ErrorHandlerConfig {
  return { ...errorConfig };
}
