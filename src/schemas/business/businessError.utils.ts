/**
 * Business Error Utilities
 * 
 * Error handling utilities specific to business schema validation.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { ZodError } from 'zod';
import { ApiResponse } from '../../types';
import { ErrorCategory } from '../../utils/errorHandling/errorHandler';

/**
 * Format Zod validation errors into a user-friendly format
 * 
 * @param error - The Zod error to format
 * @returns Formatted error object with field-specific messages
 */
export function formatZodError(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const field = path || '_general';
    
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    
    formattedErrors[field].push(err.message);
  });
  
  return formattedErrors;
}

/**
 * Create an error response for validation errors
 * 
 * @param error - The validation error
 * @param context - Additional context for the error
 * @returns A standardized error response
 */
export function createValidationErrorResponse<T>(
  _error: ZodError,
  _context: Record<string, unknown> = {}
): ApiResponse<T> {
  return {
    success: false,
    error: 'Validation failed'
  };
}

/**
 * Create a generic error response
 * 
 * @param message - The error message
 * @param category - The error category
 * @param context - Additional context for the error
 * @returns A standardized error response
 */
export function createErrorResponse<T>(
  message: string,
  _category: ErrorCategory,
  _context: Record<string, unknown> = {}
): ApiResponse<T> {
  return {
    success: false,
    error: message
  };
}

/**
 * Check if a field exists in an object and has a non-empty value
 * 
 * @param obj - The object to check
 * @param field - The field to check for
 * @returns True if the field exists and has a value
 */
export function hasField(obj: unknown, field: string): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    field in obj &&
    (obj as Record<string, unknown>)[field] !== undefined &&
    (obj as Record<string, unknown>)[field] !== null &&
    (obj as Record<string, unknown>)[field] !== ''
  );
}

/**
 * Get field validation errors for a specific field
 * 
 * @param errors - The formatted Zod errors
 * @param field - The field to get errors for
 * @returns Array of error messages for the field
 */
export function getFieldErrors(errors: Record<string, string[]>, field: string): string[] {
  return errors[field] || [];
}

/**
 * Check if an object has any validation errors
 * 
 * @param errors - The formatted Zod errors
 * @returns True if there are any errors
 */
export function hasErrors(errors: Record<string, string[]>): boolean {
  return Object.keys(errors).length > 0;
}
