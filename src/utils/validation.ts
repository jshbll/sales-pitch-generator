/**
 * Validation utility functions for form validation
 */
import { isValidUSPhoneNumber } from './phoneUtils';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (US format) - uses phoneUtils for consistency
export const isValidPhoneNumber = (phone: string): boolean => {
  // Allow empty phone numbers
  if (!phone) return true;
  
  // Use the centralized phone validation
  return isValidUSPhoneNumber(phone);
};

// Name validation
export const isValidName = (name: string): boolean => {
  // Names should be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
  if (!name) return true; // Allow empty names
  
  const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
  return nameRegex.test(name);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // Password should be at least 8 characters with at least one number, one uppercase, and one lowercase letter
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return passwordRegex.test(password);
};

// Image file validation
export const isValidImageFile = (file: File): { valid: boolean; message?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: 'File is too large. Maximum size is 5MB.' 
    };
  }
  
  return { valid: true };
};

// Profile data validation
export interface ProfileValidationResult {
  valid: boolean;
  errors: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export const validateProfileData = (data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): ProfileValidationResult => {
  const result: ProfileValidationResult = {
    valid: true,
    errors: {}
  };
  
  // Validate first name if provided
  if (data.firstName !== undefined && !isValidName(data.firstName)) {
    result.valid = false;
    result.errors.firstName = 'Please enter a valid first name';
  }
  
  // Validate last name if provided
  if (data.lastName !== undefined && !isValidName(data.lastName)) {
    result.valid = false;
    result.errors.lastName = 'Please enter a valid last name';
  }
  
  // Validate phone number if provided
  if (data.phoneNumber !== undefined && !isValidPhoneNumber(data.phoneNumber)) {
    result.valid = false;
    result.errors.phoneNumber = 'Please enter a valid phone number';
  }
  
  return result;
};
