/**
 * Business Profile Error Message Provider
 * 
 * A centralized provider for error messages in the Business Profile Service.
 * This module handles localization, message customization, and context-aware
 * error message generation.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { 
  BusinessProfileError, 
  BusinessProfileErrorType, 
  BusinessProfileErrorCode 
} from './errorTypes';
import { 
  errorTypeMessages, 
  errorCodeMessages, 
  UserFriendlyErrorMessage, 
  formatErrorMessage 
} from './errorMessages';

// Default language for error messages
const DEFAULT_LANGUAGE = 'en';

// Supported languages
type SupportedLanguage = 'en' | 'es' | 'fr';

// Current language (can be updated at runtime)
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * Set the language for error messages
 * 
 * @param language - The language to use for error messages
 */
export function setErrorMessageLanguage(language: SupportedLanguage): void {
  currentLanguage = language;
}

/**
 * Get the current language for error messages
 * 
 * @returns The current language
 */
export function getErrorMessageLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Get customized error message based on context and field
 * 
 * @param errorType - The error type
 * @param field - The field that caused the error (if applicable)
 * @param context - Additional context information
 * @returns A context-aware error message
 */
export function getFieldErrorMessage(
  errorType: BusinessProfileErrorType,
  field?: string,
  context?: Record<string, unknown>
): string {
  // Get base message
  const baseMessage = errorTypeMessages[errorType];
  
  // If no field is specified, return the default message
  if (!field) {
    return formatErrorMessage(baseMessage);
  }
  
  // Field-specific messages for validation errors
  if (errorType === BusinessProfileErrorType.VALIDATION_ERROR && field) {
    const fieldName = humanizeFieldName(field);
    
    // Handle specific validation scenarios based on field and context
    if (context?.reason === 'required') {
      return `${fieldName} is required.`;
    }
    
    if (context?.reason === 'format') {
      return `${fieldName} has an invalid format.`;
    }
    
    if (context?.reason === 'minLength' && typeof context.minLength === 'number') {
      return `${fieldName} must be at least ${context.minLength} characters.`;
    }
    
    if (context?.reason === 'maxLength' && typeof context.maxLength === 'number') {
      return `${fieldName} cannot exceed ${context.maxLength} characters.`;
    }
    
    // Default field validation message
    return `The ${fieldName.toLowerCase()} you provided is invalid.`;
  }
  
  // For other error types, use default message
  return formatErrorMessage(baseMessage);
}

/**
 * Get an error message for a specific error code and field
 * 
 * @param errorCode - The error code
 * @param field - The field that caused the error (if applicable)
 * @returns A specific error message
 */
export function getErrorCodeMessage(
  errorCode: BusinessProfileErrorCode,
  field?: string
): string {
  // Get code-specific message
  const codeMessage = errorCodeMessages[errorCode];
  
  // If no field is specified or error is not field-related, return the code message
  if (!field || !isFieldRelatedError(errorCode)) {
    return formatErrorMessage(codeMessage);
  }
  
  // For field-related errors, customize the message
  const fieldName = humanizeFieldName(field);
  
  switch (errorCode) {
    case BusinessProfileErrorCode.MISSING_REQUIRED_FIELD:
      return `${fieldName} is required.`;
      
    case BusinessProfileErrorCode.INVALID_INPUT:
      return `The ${fieldName.toLowerCase()} you entered is invalid.`;
      
    case BusinessProfileErrorCode.INVALID_EMAIL_FORMAT:
      return `Please enter a valid email address.`;
      
    case BusinessProfileErrorCode.INVALID_PHONE_FORMAT:
      return `Please enter a valid phone number with area code.`;
      
    case BusinessProfileErrorCode.INVALID_URL_FORMAT:
      return `Please enter a valid website URL starting with http:// or https://.`;
      
    default:
      return formatErrorMessage(codeMessage);
  }
}

/**
 * Get a complete user-friendly error message with recovery instructions
 * 
 * @param error - The business profile error
 * @param customContext - Optional custom context to override error context
 * @returns A user-friendly error message
 */
export function getBusinessErrorMessage(
  error: BusinessProfileError,
  customContext?: Record<string, unknown>
): UserFriendlyErrorMessage {
  // Merge custom context with error context
  const context = {
    ...error.context,
    ...customContext
  };
  
  // Get field information if available
  const field = context?.field as string | undefined;
  
  // Start with default message
  let message: UserFriendlyErrorMessage;
  
  // If error has a code, use code-specific message
  if (error.code) {
    const codeMessage = errorCodeMessages[error.code];
    message = { ...codeMessage };
    
    // For field-related errors, customize the message
    if (field && isFieldRelatedError(error.code)) {
      message.message = getErrorCodeMessage(error.code, field);
    }
  } else {
    // Otherwise use type-based message
    const typeMessage = errorTypeMessages[error.type];
    message = { ...typeMessage };
    
    // For field-related errors, customize the message
    if (field && error.type === BusinessProfileErrorType.VALIDATION_ERROR) {
      message.message = getFieldErrorMessage(error.type, field, context);
    }
  }
  
  // Add help links for specific business contexts
  if (context?.businessId && !message.helpLinks) {
    message.helpLinks = [`/help/business/${context.businessId}`];
  }
  
  return message;
}

/**
 * Check if an error code is field-related
 * 
 * @param errorCode - The error code to check
 * @returns Whether the error is field-related
 */
function isFieldRelatedError(errorCode: BusinessProfileErrorCode): boolean {
  return [
    BusinessProfileErrorCode.INVALID_INPUT,
    BusinessProfileErrorCode.MISSING_REQUIRED_FIELD,
    BusinessProfileErrorCode.INVALID_EMAIL_FORMAT,
    BusinessProfileErrorCode.INVALID_PHONE_FORMAT,
    BusinessProfileErrorCode.INVALID_URL_FORMAT
  ].includes(errorCode);
}

/**
 * Convert a field name to a human-readable form
 * 
 * @param field - The field name (e.g., businessName, phone_number)
 * @returns A human-readable field name (e.g., Business Name, Phone Number)
 */
function humanizeFieldName(field: string): string {
  // Handle specific known fields
  const knownFields: Record<string, string> = {
    'business_name': 'Business Name',
    'businessName': 'Business Name',
    'email': 'Email Address',
    'phone': 'Phone Number',
    'phoneNumber': 'Phone Number',
    'phone_number': 'Phone Number',
    'website': 'Website URL',
    'websiteUrl': 'Website URL',
    'website_url': 'Website URL',
    'address': 'Business Address',
    'city': 'City',
    'state': 'State',
    'zipCode': 'Zip Code',
    'zip_code': 'Zip Code',
    'category': 'Business Category',
    'subcategory': 'Business Subcategory',
    'description': 'Business Description',
    'logoUrl': 'Logo Image',
    'logo_url': 'Logo Image'
  };
  
  // Return known field if it exists
  if (field in knownFields) {
    return knownFields[field];
  }
  
  // Otherwise, convert camelCase or snake_case to Title Case
  return field
    // Convert camelCase to space-separated
    .replace(/([A-Z])/g, ' $1')
    // Convert snake_case to space-separated
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, (str) => str.toUpperCase())
    // Remove extra spaces
    .trim();
}
