/**
 * Business Profile Error Handlers
 * 
 * This file has been refactored to split error handling into smaller modules.
 * It now re-exports all the functionality from these modules for backward compatibility.
 * 
 * For new code, it's recommended to import directly from the specific modules:
 * - commonErrorHandlers.ts - Common error handling functions
 * - databaseErrorHandlers.ts - Database-specific error handling
 * - apiErrorHandlers.ts - API error handling
 * - cacheErrorHandlers.ts - Cache error handling
 * - authErrorHandlers.ts - Authentication error handling
 * - notFoundErrorHandlers.ts - Not found error handling
 */

// Common error handlers
export type { CommonErrorOptions } from './commonErrorHandlers';
export {
  formatValidationError,
  detectBusinessProfileError,
  createBusinessProfileError,
  tryBusinessOperation
} from './commonErrorHandlers';

// Database error handlers
export type { DatabaseErrorOptions } from './databaseErrorHandlers';
export {
  createDatabaseErrorResponse,
  processDatabaseError,
  handleDatabaseError
} from './databaseErrorHandlers';

// API error handlers
export type { ApiErrorOptions } from './apiErrorHandlers';
export {
  handleBusinessProfileApiError
} from './apiErrorHandlers';

// Cache error handlers
export type { CacheErrorOptions } from './cacheErrorHandlers';
export {
  handleCacheError
} from './cacheErrorHandlers';

// Authentication error handlers
export type { AuthErrorOptions } from './authErrorHandlers';
export {
  handleAuthenticationError,
  handleAdminAuthenticationError
} from './authErrorHandlers';

// Not found error handlers
export type { NotFoundErrorOptions } from './notFoundErrorHandlers';
export {
  createNotFoundError,
  createBusinessNotFoundError,
  createUserNotFoundError
} from './notFoundErrorHandlers';

// Error types and codes
export {
  BusinessProfileErrorType,
  BusinessProfileErrorCode,
  ERROR_CATEGORY_MAPPING
} from './errorTypes';

// Error categorization
export {
  categorizeDatabaseError,
  categorizeError,
  DATABASE_ERROR_PATTERNS
} from './errorCategorization';

// For backward compatibility
export type BusinessProfileErrorOptions = CommonErrorOptions;
