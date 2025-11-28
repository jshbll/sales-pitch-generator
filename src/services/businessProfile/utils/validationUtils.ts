/**
 * Business Profile Validation Utilities
 * 
 * Provides utilities for validating business profile data
 * with consistent error handling.
 */
import { ApiResponse } from '../../../types';
import { 
  validateBusinessProfile, 
  validateBusinessProfileUpdate,
  validateAndTransformBusinessProfile,
  BusinessProfileValidated,
  BusinessProfileUpdate
} from '../../../schemas/businessProfile.schema';
import { ErrorCategory } from '../../../utils/errorHandling/errorTypes';
import { ZodError } from 'zod';

/**
 * Format a validation error for consistent output with improved structure and clarity
 * 
 * @param error - The error to format
 * @returns Formatted error details with path information
 */
function formatValidationError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;
  
  if (typeof error === 'object' && error !== null) {
    // Handle ZodError with improved formatting
    if (error instanceof ZodError) {
      try {
        const formattedErrors = error.format();
        
        // Create a more user-friendly error structure
        const simplifiedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        return {
          details: formattedErrors,
          errors: simplifiedErrors,
          errorCount: error.errors.length
        };
      } catch {
        // If format fails, return the error as is
        return { error: String(error) };
      }
    }
    
    // Handle other error types that have a format method
    if ('format' in error && typeof error === 'object') {
      const formattableError = error as { format?: () => Record<string, unknown> };
      if (typeof formattableError.format === 'function') {
        try {
          return formattableError.format();
        } catch {
          return { error: String(error) };
        }
      }
    }
    
    // Return object as is
    return error as Record<string, unknown>;
  }
  
  // Convert primitives to object
  return { error: String(error) };
}

/**
 * Enhanced options for validation functions
 */
export interface ValidationOptions {
  /** Whether to return data even if validation fails */
  returnDataOnError?: boolean;
  /** Whether to log validation errors */
  logValidationErrors?: boolean;
  /** Context for error tracking */
  context?: {
    /** Function name for error context */
    functionName?: string;
    /** Component name for error context */
    component?: string;
  };
  /** Validation mode - strict mode enables additional validations */
  mode?: 'standard' | 'strict' | 'permissive';
  /** Whether to include detailed error information in response */
  includeDetailedErrors?: boolean;
  /** Custom transformation function to apply after validation */
  transform?: (data: unknown) => unknown;
}

/**
 * Validate a complete business profile with enhanced validation options
 * 
 * @param data - The data to validate
 * @param options - Enhanced validation options
 * @returns Validation result with detailed error information if validation fails
 */
export function validateProfile(
  data: unknown, 
  options: ValidationOptions = {}
): ApiResponse<BusinessProfileValidated> {
  const {
    returnDataOnError = false,
    logValidationErrors = true,
    mode = 'standard',
    includeDetailedErrors = true,
    transform,
    context = {
      functionName: 'validateProfile',
      component: 'BusinessProfileValidationUtils'
    }
  } = options;
  
  // Apply validation based on mode
  let validationResult;
  if (mode === 'strict') {
    // Use the transform variant which applies additional validations
    validationResult = validateAndTransformBusinessProfile(data);
  } else {
    // Use standard validation
    validationResult = validateBusinessProfile(data);
  }
  
  // Apply custom transformation if provided and validation succeeded
  if (validationResult.success && transform) {
    try {
      const transformedData = transform(validationResult.data);
      validationResult = {
        ...validationResult,
        data: transformedData as BusinessProfileValidated
      };
    } catch (transformError) {
      console.error(
        `[${context.component}] ${context.functionName} - Transformation error:`,
        transformError
      );
      // Return error response for transformation failure
      return {
        success: false,
        error: 'Error transforming validated data',
        message: 'Error transforming validated data',
        errorCategory: ErrorCategory.VALIDATION,
        errorDetails: { transformError: String(transformError) }
      };
    }
  }
  
  // Return early if validation succeeded
  if (validationResult.success) {
    return validationResult;
  }
  
  // Handle validation failure
  if (logValidationErrors && validationResult.error) {
    console.warn(
      `[${context.component}] ${context.functionName} - Business profile validation failed:`, 
      mode === 'strict' ? 'Using strict validation mode' : '',
      validationResult.error
    );
  }
  
  // Return the data anyway if requested, with appropriate warnings
  if (returnDataOnError && typeof data === 'object' && data !== null) {
    return {
      success: true,
      data: data as BusinessProfileValidated,
      warning: `Business profile data contains validation issues (validation mode: ${mode})`,
      errorDetails: includeDetailedErrors ? formatValidationError(validationResult.error) : undefined
    };
  }
  
  // Return validation failure response with appropriate level of detail
  return {
    success: false,
    error: 'Invalid business profile data',
    message: 'Invalid business profile data',
    errorCategory: ErrorCategory.VALIDATION,
    errorDetails: includeDetailedErrors ? formatValidationError(validationResult.error) : undefined
  };
}

/**
 * Validate a business profile update with enhanced validation options
 * 
 * @param data - The data to validate
 * @param options - Enhanced validation options
 * @returns Validation result with detailed error information if validation fails
 */
export function validateProfileUpdate(
  data: unknown, 
  options: ValidationOptions = {}
): ApiResponse<BusinessProfileUpdate> {
  const {
    returnDataOnError = false,
    logValidationErrors = true,
    mode = 'standard',
    includeDetailedErrors = true,
    transform,
    context = {
      functionName: 'validateProfileUpdate',
      component: 'BusinessProfileValidationUtils'
    }
  } = options;
  
  // Ensure data is an object
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: 'Update data must be an object',
      message: 'Update data must be an object',
      errorCategory: ErrorCategory.VALIDATION
    };
  }
  
  // Add additional validations in strict mode
  if (mode === 'strict') {
    // Check for at least one property being present
    if (Object.keys(data).length === 0) {
      return {
        success: false,
        error: 'Update must contain at least one property',
        message: 'Update must contain at least one property',
        errorCategory: ErrorCategory.VALIDATION
      };
    }
    
    // This would be the place to add more specific business rules
    // For example, checking interdependent fields
  }
  
  // Validate the business profile update data
  const validationResult = validateBusinessProfileUpdate(data);
  
  // Apply custom transformation if provided and validation succeeded
  if (validationResult.success && transform) {
    try {
      const transformedData = transform(validationResult.data);
      validationResult.data = transformedData as BusinessProfileUpdate;
    } catch (transformError) {
      console.error(
        `[${context.component}] ${context.functionName} - Transformation error:`,
        transformError
      );
      // Return error response for transformation failure
      return {
        success: false,
        error: 'Error transforming validated data',
        message: 'Error transforming validated data',
        errorCategory: ErrorCategory.VALIDATION,
        errorDetails: { transformError: String(transformError) }
      };
    }
  }
  
  if (validationResult.success) {
    return validationResult;
  }
  
  // Handle validation failure
  if (logValidationErrors && validationResult.error) {
    console.warn(
      `[${context.component}] ${context.functionName} - Business profile update validation failed:`, 
      mode === 'strict' ? 'Using strict validation mode' : '',
      validationResult.error
    );
  }
  
  // Return the data anyway if requested, with appropriate warnings
  if (returnDataOnError && typeof data === 'object') {
    return {
      success: true,
      data: data as BusinessProfileUpdate,
      warning: `Business profile update data contains validation issues (validation mode: ${mode})`,
      errorDetails: includeDetailedErrors ? formatValidationError(validationResult.error) : undefined
    };
  }
  
  // Return validation failure response with appropriate level of detail
  return {
    success: false,
    error: 'Invalid business profile update data',
    message: 'Invalid business profile update data',
    errorCategory: ErrorCategory.VALIDATION,
    errorDetails: includeDetailedErrors ? formatValidationError(validationResult.error) : undefined
  };
}

/**
 * Validate and transform a business profile
 * 
 * @param data - The data to validate and transform
 * @param options - Validation options
 * @returns Validation and transformation result
 */
export function validateAndTransformProfile(
  data: unknown, 
  options: ValidationOptions = {}
): ApiResponse<BusinessProfileValidated> {
  const {
    returnDataOnError = false,
    logValidationErrors = true,
    context = {
      functionName: 'validateAndTransformProfile',
      component: 'BusinessProfileValidationUtils'
    }
  } = options;
  
  // Validate and transform the data
  const result = validateAndTransformBusinessProfile(data);
  
  if (result.success) {
    return result;
  }
  
  // Handle validation failure
  if (logValidationErrors && result.error) {
    console.warn(
      `[${context.component}] ${context.functionName} - Business profile validation and transformation failed:`, 
      result.error
    );
  }
  
  // Return the data anyway if requested
  if (returnDataOnError && typeof data === 'object' && data !== null) {
    return {
      success: true,
      data: data as BusinessProfileValidated,
      warning: 'Business profile data contains validation issues',
      errorDetails: formatValidationError(result.error)
    };
  }
  
  // Return validation error
  return {
    success: false,
    error: 'Invalid business profile data',
    errorCategory: ErrorCategory.VALIDATION,
    errorDetails: formatValidationError(result.error)
  };
}
