/**
 * formValidation.ts
 * Common validation utility functions for form inputs
 */

/**
 * Interface for validation results
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates if a field has a value (not empty)
 * @param value The field value
 * @param fieldName Human-readable name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export const validateRequired = (
  value: string | undefined | null,
  fieldName = 'This field'
): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      errorMessage: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

/**
 * Validates if a field meets minimum length requirements
 * @param value The field value
 * @param minLength The minimum allowed length
 * @param fieldName Human-readable name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export const validateMinLength = (
  value: string | undefined | null,
  minLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (!value) {
    return {
      isValid: false,
      errorMessage: `${fieldName} is required`,
    };
  }

  if (value.trim().length < minLength) {
    return {
      isValid: false,
      errorMessage: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validates if a field meets maximum length requirements
 * @param value The field value
 * @param maxLength The maximum allowed length
 * @param fieldName Human-readable name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export const validateMaxLength = (
  value: string | undefined | null,
  maxLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (!value) {
    return { isValid: true }; // If field is optional
  }

  if (value.trim().length > maxLength) {
    return {
      isValid: false,
      errorMessage: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validates if a field matches a specific pattern (regex)
 * @param value The field value
 * @param pattern The regex pattern to match
 * @param errorMessage Custom error message for validation failure
 * @returns Validation result with isValid flag and optional error message
 */
export const validatePattern = (
  value: string | undefined | null,
  pattern: RegExp,
  errorMessage = 'Invalid format'
): ValidationResult => {
  if (!value) {
    return { isValid: true }; // If field is optional
  }

  if (!pattern.test(value)) {
    return {
      isValid: false,
      errorMessage,
    };
  }

  return { isValid: true };
};

/**
 * Validates if an email address is in valid format
 * @param email The email address to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validateEmail = (
  email: string | undefined | null
): ValidationResult => {
  if (!email) {
    return {
      isValid: false,
      errorMessage: 'Email address is required',
    };
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validatePattern(
    email,
    emailPattern,
    'Please enter a valid email address'
  );
};

/**
 * Validates if a phone number is in valid format
 * @param phone The phone number to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validatePhone = (
  phone: string | undefined | null
): ValidationResult => {
  if (!phone) {
    return {
      isValid: false,
      errorMessage: 'Phone number is required',
    };
  }

  // Allow various formats like (123) 456-7890, 123-456-7890, or 1234567890
  const phonePattern = /^(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
  return validatePattern(
    phone,
    phonePattern,
    'Please enter a valid phone number'
  );
};

/**
 * Validates if a URL is in valid format
 * @param url The URL to validate
 * @param requireProtocol Whether to require http:// or https:// protocol
 * @returns Validation result with isValid flag and optional error message
 */
export const validateUrl = (
  url: string | undefined | null,
  requireProtocol = true
): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URLs are typically optional
  }

  // If protocol is required, check for it first
  if (requireProtocol && !/^https?:\/\//i.test(url)) {
    return {
      isValid: false,
      errorMessage: 'URL must start with http:// or https://',
    };
  }

  // Basic URL validation
  const urlPattern = requireProtocol
    ? /^https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
    : /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  return validatePattern(url, urlPattern, 'Please enter a valid URL');
};

/**
 * Combine multiple validation functions and return the first failure
 * @param validations Array of validation results
 * @returns The first validation failure or a success result
 */
export const combineValidations = (
  validations: ValidationResult[]
): ValidationResult => {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
};
