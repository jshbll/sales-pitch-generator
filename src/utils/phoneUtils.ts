/**
 * Phone number utilities for formatting, validation, and normalization
 */

/**
 * Format phone number for display - handles various input formats
 * Supports: +1XXXXXXXXXX, 1XXXXXXXXXX, XXXXXXXXXX, (XXX) XXX-XXXX, XXX-XXX-XXXX
 */
export const formatPhoneNumber = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Remove all non-digit characters except + at the beginning
  const cleaned = input.replace(/[^\d+]/g, '').replace(/\+(?!\d*$)/g, '');
  
  // Handle international format with country code
  if (cleaned.startsWith('+1') || cleaned.startsWith('1')) {
    const digits = cleaned.replace(/^\+?1/, '');
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  }
  
  // Handle standard 10-digit US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if format is unrecognized
  return input;
};

/**
 * Format phone number as user types - provides real-time formatting
 */
export const formatPhoneAsYouType = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // Limit to 10 digits for US phone numbers (no country code in typing)
  const limitedDigits = digits.slice(0, 10);

  // Format based on length
  if (limitedDigits.length === 0) {
    return '';
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`;
  }
};

/**
 * Normalize phone number for storage - strips formatting and ensures consistent format
 */
export const normalizePhoneNumber = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // If 11 digits starting with 1, it's a US number with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If 10 digits, assume US number and add country code
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If already has + and correct length, keep it
  if (input.startsWith('+') && digits.length === 11) {
    return `+${digits}`;
  }
  
  // Return cleaned digits if format is unrecognized
  return digits;
};

/**
 * Validate phone number - checks if it's a valid US phone number
 */
export const isValidUSPhoneNumber = (input: string | null | undefined): boolean => {
  if (!input) return false;
  
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // Valid if 10 digits, or 11 digits starting with 1
  if (digits.length === 10) {
    // Check for valid area code (first digit can't be 0 or 1)
    return /^[2-9]\d{9}$/.test(digits);
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // Check for valid area code after country code
    return /^1[2-9]\d{9}$/.test(digits);
  }
  
  return false;
};

/**
 * Get validation error message for phone number
 */
export const getPhoneValidationError = (input: string | null | undefined): string | null => {
  if (!input) {
    return 'Phone number is required';
  }
  
  const digits = input.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return 'Please enter a phone number';
  }
  
  if (digits.length < 10) {
    return 'Phone number is too short';
  }
  
  if (digits.length > 11) {
    return 'Phone number is too long';
  }
  
  if (digits.length === 11 && !digits.startsWith('1')) {
    return 'Invalid country code (US numbers start with 1)';
  }
  
  if (!isValidUSPhoneNumber(input)) {
    return 'Please enter a valid US phone number';
  }
  
  return null;
};

/**
 * Extract digits from phone input
 */
export const extractPhoneDigits = (input: string): string => {
  return input.replace(/\D/g, '');
};

/**
 * Format phone for tel: links
 */
export const formatPhoneForTel = (input: string | null | undefined): string => {
  if (!input) return '';
  
  const normalized = normalizePhoneNumber(input);
  // tel: links work best with +1XXXXXXXXXX format
  return normalized;
};

/**
 * Parse phone number from various formats including copy-paste from different sources
 */
export const parsePhoneNumber = (input: string): {
  countryCode?: string;
  areaCode?: string;
  prefix?: string;
  lineNumber?: string;
  formatted?: string;
  normalized?: string;
  isValid: boolean;
} => {
  const digits = input.replace(/\D/g, '');
  
  let countryCode: string | undefined;
  let phoneDigits = digits;
  
  // Check for country code
  if (digits.length === 11 && digits.startsWith('1')) {
    countryCode = '1';
    phoneDigits = digits.slice(1);
  } else if (digits.length === 10) {
    phoneDigits = digits;
  } else {
    return { isValid: false };
  }
  
  if (phoneDigits.length === 10) {
    const areaCode = phoneDigits.slice(0, 3);
    const prefix = phoneDigits.slice(3, 6);
    const lineNumber = phoneDigits.slice(6);
    
    return {
      countryCode,
      areaCode,
      prefix,
      lineNumber,
      formatted: formatPhoneNumber(input),
      normalized: normalizePhoneNumber(input),
      isValid: isValidUSPhoneNumber(input)
    };
  }
  
  return { isValid: false };
};