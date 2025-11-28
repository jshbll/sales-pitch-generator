/**
 * Business Profile Error Messages
 * 
 * This module provides user-friendly, actionable error messages for the Business Profile Service.
 * It includes both generic messages for error types and specific messages for error codes.
 * 
 * Features:
 * - Clear, concise messages that explain what went wrong
 * - Actionable suggestions to help users resolve common issues
 * - Consistent formatting across all error messages
 * - Support for different message formats based on error category
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { 
  BusinessProfileErrorType, 
  BusinessProfileErrorCode, 
  BusinessProfileError 
} from './errorTypes';
import { ErrorCategory } from '../../../utils/errorHandling/errorTypes';

/**
 * Interface for user-friendly error message details
 */
export interface UserFriendlyErrorMessage {
  /** The main error message shown to the user */
  message: string;
  /** Additional suggestion to help resolve the issue */
  suggestion?: string;
  /** Whether this error is potentially resolvable by the user */
  userResolvable: boolean;
  /** Links to relevant help documentation */
  helpLinks?: string[];
}

/**
 * Generic user-friendly messages for business profile error types
 */
export const errorTypeMessages: Record<BusinessProfileErrorType, UserFriendlyErrorMessage> = {
  // Validation errors
  [BusinessProfileErrorType.VALIDATION_ERROR]: {
    message: 'Some of the information you provided is invalid or incomplete.',
    suggestion: 'Please review the highlighted fields and correct any errors.',
    userResolvable: true
  },
  
  // Authentication and authorization errors
  [BusinessProfileErrorType.AUTHENTICATION_ERROR]: {
    message: 'You need to be logged in to perform this action.',
    suggestion: 'Please log in again and retry.',
    userResolvable: true
  },
  [BusinessProfileErrorType.AUTHORIZATION_ERROR]: {
    message: 'You don\'t have permission to perform this action.',
    suggestion: 'If you believe this is an error, please contact support.',
    userResolvable: false,
    helpLinks: ['/help/business-permissions']
  },
  
  // New system error types
  [BusinessProfileErrorType.CRITICAL_ERROR]: {
    message: 'A critical system error has occurred.',
    suggestion: 'Please contact support with the error reference number.',
    userResolvable: false,
    helpLinks: ['/help/system-errors']
  },
  [BusinessProfileErrorType.SYSTEM_ERROR]: {
    message: 'An unexpected system error has occurred.',
    suggestion: 'Please try again later or contact support if the problem persists.',
    userResolvable: false
  },
  
  // Business logic errors
  [BusinessProfileErrorType.BUSINESS_LOGIC_ERROR]: {
    message: 'Your request could not be processed due to business rule violations.',
    suggestion: 'Please review your business profile requirements.',
    userResolvable: true,
    helpLinks: ['/help/business-rules']
  },
  
  // Rate limit errors
  [BusinessProfileErrorType.RATE_LIMIT_ERROR]: {
    message: 'You\'ve made too many requests in a short period of time.',
    suggestion: 'Please wait a few minutes before trying again.',
    userResolvable: true
  },
  
  // Unknown errors
  [BusinessProfileErrorType.UNKNOWN_ERROR]: {
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again later or contact support if the problem persists.',
    userResolvable: false
  },
  
  // Resource errors
  [BusinessProfileErrorType.NOT_FOUND_ERROR]: {
    message: 'The requested business profile could not be found.',
    suggestion: 'Please check that you have the correct business ID or try searching for the business.',
    userResolvable: true
  },
  [BusinessProfileErrorType.CONFLICT_ERROR]: {
    message: 'This change conflicts with existing data.',
    suggestion: 'The information you\'re trying to update may have changed. Please refresh and try again.',
    userResolvable: true
  },
  
  // Database errors
  [BusinessProfileErrorType.DATABASE_ERROR]: {
    message: 'We encountered a problem accessing business data.',
    suggestion: 'Please try again later. If the problem persists, contact support.',
    userResolvable: false
  },
  [BusinessProfileErrorType.DATABASE_CONNECTION_ERROR]: {
    message: 'We\'re having trouble connecting to our database.',
    suggestion: 'Please try again in a few moments.',
    userResolvable: false
  },
  [BusinessProfileErrorType.DATABASE_QUERY_ERROR]: {
    message: 'We encountered an issue while retrieving business information.',
    suggestion: 'Please try again later. If the problem persists, contact support.',
    userResolvable: false
  },
  [BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR]: {
    message: 'Your change couldn\'t be saved due to a data constraint.',
    suggestion: 'The information you provided conflicts with our requirements. Please review your changes.',
    userResolvable: true
  },
  
  // API errors
  [BusinessProfileErrorType.API_ERROR]: {
    message: 'We encountered an issue with our business service.',
    suggestion: 'Please try again later. Our team has been notified of this issue.',
    userResolvable: false
  },
  
  // Cache errors
  [BusinessProfileErrorType.CACHE_ERROR]: {
    message: 'We had trouble retrieving the latest business information.',
    suggestion: 'Please refresh the page to get the most up-to-date information.',
    userResolvable: true
  },
  
  // System errors
  [BusinessProfileErrorType.INTERNAL_ERROR]: {
    message: 'We encountered an unexpected error in the business service.',
    suggestion: 'Please try again later. Our team has been notified of this issue.',
    userResolvable: false
  },
  [BusinessProfileErrorType.TIMEOUT_ERROR]: {
    message: 'The business profile request took too long to complete.',
    suggestion: 'Please try again. If the problem persists, try again during non-peak hours.',
    userResolvable: true
  }
};

/**
 * Specific user-friendly messages for business profile error codes
 */
export const errorCodeMessages: Record<BusinessProfileErrorCode, UserFriendlyErrorMessage> = {
  // Not found errors
  [BusinessProfileErrorCode.USER_NOT_FOUND]: {
    message: 'We couldn\'t find your user account.',
    suggestion: 'Please ensure you\'re logged in with the correct account.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.BUSINESS_NOT_FOUND]: {
    message: 'We couldn\'t find this business profile.',
    suggestion: 'The business may have been removed or you may not have access to view it.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.CATEGORY_NOT_FOUND]: {
    message: 'The selected business category could not be found.',
    suggestion: 'Please select a different category from the available options.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.RESOURCE_NOT_FOUND]: {
    message: 'The requested business resource could not be found.',
    suggestion: 'Please check the URL or navigate using the menu.',
    userResolvable: true
  },
  
  // Validation errors
  [BusinessProfileErrorCode.INVALID_INPUT]: {
    message: 'Some of the business information you provided is invalid.',
    suggestion: 'Please review the highlighted fields and correct any errors.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.MISSING_REQUIRED_FIELD]: {
    message: 'Required business information is missing.',
    suggestion: 'Please complete all required fields marked with an asterisk (*).',
    userResolvable: true
  },
  [BusinessProfileErrorCode.INVALID_EMAIL_FORMAT]: {
    message: 'The email address format is invalid.',
    suggestion: 'Please provide a valid email address (e.g., name@example.com).',
    userResolvable: true
  },
  [BusinessProfileErrorCode.INVALID_PHONE_FORMAT]: {
    message: 'The phone number format is invalid.',
    suggestion: 'Please enter a valid phone number with area code.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.INVALID_URL_FORMAT]: {
    message: 'The website URL format is invalid.',
    suggestion: 'Please enter a valid URL beginning with http:// or https://.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.INVALID_IMAGE_FORMAT]: {
    message: 'The image file format is not supported.',
    suggestion: 'Please use a JPG, PNG, or GIF image file under 5MB.',
    userResolvable: true
  },
  
  // Authentication errors
  [BusinessProfileErrorCode.NOT_AUTHENTICATED]: {
    message: 'You need to be logged in to access business profiles.',
    suggestion: 'Please log in to continue.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.SESSION_EXPIRED]: {
    message: 'Your login session has expired.',
    suggestion: 'Please log in again to continue managing your business profile.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.INVALID_CREDENTIALS]: {
    message: 'The login credentials you provided are invalid.',
    suggestion: 'Please check your email and password and try again.',
    userResolvable: true
  },
  
  // Authorization errors
  [BusinessProfileErrorCode.NOT_AUTHORIZED]: {
    message: 'You don\'t have permission to perform this action.',
    suggestion: 'This action requires business owner or admin privileges.',
    userResolvable: false
  },
  [BusinessProfileErrorCode.NOT_BUSINESS_OWNER]: {
    message: 'Only the business owner can perform this action.',
    suggestion: 'Please contact the business owner for assistance.',
    userResolvable: false
  },
  [BusinessProfileErrorCode.INSUFFICIENT_ROLE]: {
    message: 'Your account doesn\'t have the necessary permissions.',
    suggestion: 'Please contact a business administrator to update your role.',
    userResolvable: false
  },
  
  // Resource errors
  [BusinessProfileErrorCode.BUSINESS_ALREADY_EXISTS]: {
    message: 'A business profile already exists for this account.',
    suggestion: 'You can only have one business profile per account. Please edit your existing profile.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.DUPLICATE_ENTRY]: {
    message: 'This business information already exists in our system.',
    suggestion: 'Please provide unique information or update the existing entry.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.RESOURCE_LOCKED]: {
    message: 'This business profile is currently being edited by another user.',
    suggestion: 'Please try again in a few minutes.',
    userResolvable: true
  },
  
  // Rate limiting
  [BusinessProfileErrorCode.RATE_LIMIT_EXCEEDED]: {
    message: 'You\'ve made too many requests in a short period.',
    suggestion: 'Please wait a moment before trying again.',
    userResolvable: true
  },
  [BusinessProfileErrorCode.TOO_MANY_REQUESTS]: {
    message: 'We\'ve detected too many requests from your account.',
    suggestion: 'Please wait a few minutes before trying again.',
    userResolvable: true
  },
  
  // Server errors
  [BusinessProfileErrorCode.SERVER_ERROR]: {
    message: 'We encountered an error on our servers.',
    suggestion: 'Our team has been notified. Please try again later.',
    userResolvable: false
  },
  [BusinessProfileErrorCode.SERVICE_UNAVAILABLE]: {
    message: 'The business profile service is temporarily unavailable.',
    suggestion: 'Please try again later.',
    userResolvable: false
  },
  [BusinessProfileErrorCode.DATABASE_ERROR]: {
    message: 'We encountered a database error while processing your request.',
    suggestion: 'Please try again later. If the problem persists, contact support.',
    userResolvable: false
  }
};

/**
 * Get a user-friendly error message based on the provided error
 * 
 * @param error - The business profile error
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: BusinessProfileError): UserFriendlyErrorMessage {
  // First check for specific error code message
  if (error.code && errorCodeMessages[error.code]) {
    return errorCodeMessages[error.code];
  }
  
  // Fall back to error type message
  if (errorTypeMessages[error.type]) {
    return errorTypeMessages[error.type];
  }
  
  // Default message if no matching type is found
  return {
    message: 'An unexpected error occurred with the business profile.',
    suggestion: 'Please try again or contact support if the problem persists.',
    userResolvable: false
  };
}

/**
 * Format an error message with suggestion
 * 
 * @param errorInfo - The user-friendly error message information
 * @returns A formatted error message string
 */
export function formatErrorMessage(errorInfo: UserFriendlyErrorMessage): string {
  let formattedMessage = errorInfo.message;
  
  if (errorInfo.suggestion) {
    formattedMessage += ` ${errorInfo.suggestion}`;
  }
  
  return formattedMessage;
}

/**
 * Get a recovery suggestion based on error category
 * 
 * @param category - The error category
 * @returns A suggestion for recovering from the error
 */
export function getRecoverySuggestion(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and try again.';
    case ErrorCategory.VALIDATION:
      return 'Review the highlighted fields and correct any errors.';
    case ErrorCategory.AUTHENTICATION:
      return 'Please log in again and retry.';
    case ErrorCategory.AUTHORIZATION:
      return 'Contact your account administrator if you need access.';
    case ErrorCategory.NOT_FOUND:
      return 'Check that the requested resource exists and you have permission to view it.';
    case ErrorCategory.SERVER:
      return 'Our team has been notified. Please try again later.';
    case ErrorCategory.RATE_LIMIT:
      return 'Please wait a moment before trying again.';
    case ErrorCategory.TIMEOUT:
      return 'Try again or retry during non-peak hours.';
    default:
      return 'Please try again later or contact support if the problem persists.';
  }
}
