/**
 * Business Profile Error Handling
 * 
 * Central index file that exports all standardized error handling utilities
 * for the Business Profile Service. This provides a single import point for
 * all error handling functionality.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

// Import all modules first
import { 
  BusinessProfileErrorType, 
  BusinessProfileErrorCode,
  BusinessProfileError 
} from './errorTypes';

import { 
  createStandardErrorContext,
  enhanceErrorContext,
  logErrorWithContext,
  getUserFacingErrorContext,
  determineErrorType 
} from './standardErrorContext';

// Re-export StandardErrorContext interface directly from the file
import type { StandardErrorContext, StandardErrorContextOptions } from './standardErrorContext';

import {
  tryStandardBusinessOperation,
  handleStandardBusinessError,
  createStandardBusinessError
} from './standardErrorHandler';

import type { StandardBusinessOperationOptions } from './standardErrorHandler';

import {
  createUserBusinessContext,
  createBusinessProfileContext,
  createValidationContext,
  createCacheContext,
  createDatabaseContext,
  createApiContext
} from './errorContextFactory';

import {
  getBusinessErrorMessage
} from './errorMessageProvider';

import {
  getUserFriendlyErrorMessage,
  formatErrorMessage,
  getRecoverySuggestion
} from './errorMessages';

// Import the interface type separately
import type { UserFriendlyErrorMessage } from './errorMessages';

// Re-export everything
export {
  // Error types and codes
  BusinessProfileErrorType,
  BusinessProfileErrorCode,
  BusinessProfileError,
  
  // Error context utilities
  StandardErrorContext,
  StandardErrorContextOptions,
  createStandardErrorContext,
  enhanceErrorContext,
  logErrorWithContext,
  getUserFacingErrorContext,
  determineErrorType,
  
  // Standard error handler
  StandardBusinessOperationOptions,
  tryStandardBusinessOperation,
  handleStandardBusinessError,
  createStandardBusinessError,
  
  // Error context factory
  createUserBusinessContext,
  createBusinessProfileContext,
  createValidationContext,
  createCacheContext,
  createDatabaseContext,
  createApiContext,
  
  // Error message utilities
  getBusinessErrorMessage,
  getUserFriendlyErrorMessage,
  formatErrorMessage,
  getRecoverySuggestion,
  UserFriendlyErrorMessage
};

// Create a combined object for default export
const errorHandlingUtils = {
  // Error types and codes
  BusinessProfileErrorType,
  BusinessProfileErrorCode,
  BusinessProfileError,
  
  // Error context utilities
  createStandardErrorContext,
  enhanceErrorContext,
  logErrorWithContext,
  getUserFacingErrorContext,
  determineErrorType,
  
  // Standard error handler
  tryStandardBusinessOperation,
  handleStandardBusinessError,
  createStandardBusinessError,
  
  // Error context factory
  createUserBusinessContext,
  createBusinessProfileContext,
  createValidationContext,
  createCacheContext,
  createDatabaseContext,
  createApiContext,
  
  // Error message utilities
  getBusinessErrorMessage,
  getUserFriendlyErrorMessage,
  formatErrorMessage,
  getRecoverySuggestion
};

// Provide a default export with all main utilities
export default errorHandlingUtils;
