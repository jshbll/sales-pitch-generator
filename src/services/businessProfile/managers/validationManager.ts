/**
 * Business Profile Validation Manager
 * 
 * Handles all validation operations for business profiles.
 * Extracted from BusinessProfileService to reduce file length
 * and improve separation of concerns.
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { validateProfile, validateProfileUpdate } from '../utils/validationUtils';
import { createBusinessProfileError } from '../utils/errorUtils';

/**
 * Validation Manager for Business Profiles
 * 
 * Centralizes all validation-related operations to reduce duplication
 * and improve maintainability.
 * 
 * Enhanced with advanced validation capabilities, consistent error handling,
 * and improved type safety.
 */
export class BusinessProfileValidationManager {
  /**
   * Validate a business profile with enhanced options
   * 
   * @param data - The data to validate
   * @param functionName - The calling function name
   * @param strictMode - Whether to use strict validation mode
   * @param returnDataOnError - Whether to return data even if validation fails
   * @returns Validation result
   */
  validateBusinessProfile(
    data: unknown,
    functionName = 'validateBusinessProfile',
    strictMode = false,
    returnDataOnError = true
  ): ApiResponse<BusinessProfile> {
    return validateProfile(data, {
      returnDataOnError,
      mode: strictMode ? 'strict' : 'standard',
      includeDetailedErrors: true, 
      context: {
        functionName,
        component: 'BusinessProfileValidationManager'
      }
    });
  }
  
  /**
   * Validate a business profile update with enhanced options
   * 
   * @param data - The data to validate
   * @param functionName - The calling function name
   * @param strictMode - Whether to use strict validation mode
   * @param returnDataOnError - Whether to return data even if validation fails
   * @returns Validation result with complete BusinessProfile type
   */
  validateBusinessProfileUpdate(
    data: unknown,
    functionName = 'validateBusinessProfileUpdate',
    strictMode = false,
    returnDataOnError = false
  ): ApiResponse<BusinessProfile> {
    // Additional pre-validation checks for common issues
    if (!data || typeof data !== 'object') {
      return this.createValidationError(
        'Update data must be an object',
        'Update data must be an object',
        { functionName, info: { dataType: typeof data } }
      );
    }
    
    if (strictMode && Object.keys(data as object).length === 0) {
      return this.createValidationError(
        'Update must contain at least one property',
        'Update must contain at least one field to update',
        { functionName, info: { isEmptyUpdate: true } }
      );
    }
    
    // Validate the update data with enhanced options
    const validationResult = validateProfileUpdate(data, {
      returnDataOnError,
      mode: strictMode ? 'strict' : 'standard',
      includeDetailedErrors: true,
      context: {
        functionName,
        component: 'BusinessProfileValidationManager'
      }
    });
    
    // If validation failed, return the error
    if (!validationResult.success) {
      return validationResult as ApiResponse<BusinessProfile>;
    }
    
    // If validation succeeded, cast the partial data to full BusinessProfile type
    // This is safe because the business profile service will merge this with existing data
    return {
      success: true,
      data: validationResult.data as unknown as BusinessProfile,
      message: validationResult.message || 'Business profile update validated successfully'
    };
  }
  
  /**
   * Check if a business ID is valid
   * 
   * @param businessId - The business ID to check
   * @returns Whether the business ID is valid
   */
  isValidBusinessId(businessId: string): boolean {
    return Boolean(businessId && businessId.trim() !== '');
  }
  
  /**
   * Create an invalid business ID error
   * 
   * @param businessId - The invalid business ID
   * @param functionName - The calling function name
   * @returns Error response
   */
  createInvalidBusinessIdError(
    businessId: string,
    functionName: string
  ): ApiResponse<BusinessProfile> {
    return createBusinessProfileError<BusinessProfile>('Invalid business ID', {
      context: {
        functionName,
        component: 'BusinessProfileValidationManager',
        info: { businessId }
      }
    });
  }
  
  /**
   * Create a validation error response
   * 
   * @param error - Error message or object
   * @param userMessage - User-friendly error message
   * @param context - Error context information
   * @returns Error response
   */
  createValidationError<T = BusinessProfile>(
    error: string | unknown,
    userMessage: string,
    context: {
      functionName: string;
      info?: Record<string, unknown>;
    }
  ): ApiResponse<T> {
    return createBusinessProfileError<T>(userMessage, {
      additionalInfo: { originalError: error },
      context: {
        functionName: context.functionName,
        component: 'BusinessProfileValidationManager',
        info: context.info
      }
    });
  }
  
  /**
   * Perform additional custom validations for business profiles
   * 
   * @param data - The business profile data to validate
   * @param context - Validation context
   * @returns Validation result with any custom validation errors
   */
  performCustomValidations(data: Partial<BusinessProfile>, context: {
    functionName: string;
  }): ApiResponse<BusinessProfile> {
    // This method can be extended with custom business logic validations
    // that go beyond simple schema validation
    
    // Example: validate business hours consistency
    if (data.businessHours) {
      // Check for overlapping hours, invalid time formats, etc.
      // This is just a placeholder for where custom validation would go
    }
    
    // Example: validate that if certain fields are present, other required fields are also present
    // This is just a placeholder example
    const instagramUrl = data.instagramUrl;
    const website = data.website;
    
    if (instagramUrl && !website) {
      return this.createValidationError(
        'A website must be provided when Instagram is specified',
        'Please provide a website URL along with social media handles',
        { functionName: context.functionName, info: { missingWebsite: true } }
      );
    }
    
    // If all custom validations pass, return success
    return {
      success: true,
      data: data as BusinessProfile
    };
  }
}

// Create and export a default instance
const validationManager = new BusinessProfileValidationManager();
export default validationManager;
