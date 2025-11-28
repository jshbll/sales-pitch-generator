/**
 * Business Profile Schema
 * 
 * Zod schema for validating BusinessProfile objects with enhanced validation
 * and utility functions for data transformation.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { ApiResponse } from '../types';

// Import all schema modules and utilities from the business directory
import {
  // Schema modules
  businessCoreSchema,
  businessHoursSchema,
  businessContactSchema,
  businessSocialSchema,
  businessLocationSchema,
  businessClassificationSchema,
  businessImageSchema,
  
  // Utility functions
  validateWithZod,
  transformBusinessProfileData
} from './business';

/**
 * Note: transformBusinessProfileData is now properly imported from './business/businessTransformation.utils.ts'
 * This provides a centralized implementation for transforming business profile data
 * that can be used consistently across the application.
 */

/**
 * Schema for validating BusinessProfile objects
 * Composed from modular schema components
 */
export const businessProfileSchema = businessCoreSchema
  .merge(businessContactSchema)
  .merge(businessSocialSchema)
  .merge(businessLocationSchema)
  .merge(businessClassificationSchema)
  .merge(businessImageSchema)
  .extend({
    businessHours: businessHoursSchema.optional()
  });

/**
 * Type definition derived from the schema
 */
export type BusinessProfileValidated = z.infer<typeof businessProfileSchema>;

/**
 * Enhanced schema for business profile updates with stricter validation
 */
export const businessProfileUpdateSchema = businessProfileSchema.partial().refine(
  (data) => {
    // Ensure at least one field is provided
    return Object.keys(data).length > 0;
  },
  {
    message: "At least one field must be provided for an update",
    path: ["_any"]
  }
);

/**
 * Type definition for partial business profile updates
 */
export type BusinessProfileUpdate = z.infer<typeof businessProfileUpdateSchema>;

/**
 * Validate a BusinessProfile object
 * 
 * @param data - The data to validate
 * @returns The validation result with standardized error handling
 */
export function validateBusinessProfile(data: unknown): ApiResponse<BusinessProfileValidated> {
  return validateWithZod(businessProfileSchema, data, 'validateBusinessProfile');
}

/**
/**
 * Validate a BusinessProfile update object
 * 
 * @param data - The data to validate
 * @returns The validation result with standardized error handling
 */
export function validateBusinessProfileUpdate(data: unknown): ApiResponse<BusinessProfileUpdate> {
  return validateWithZod(businessProfileUpdateSchema, data, 'validateBusinessProfileUpdate');
}

/**
 * Validate and transform a business profile in one step
 * 
 * @param data - The raw business profile data
 * @returns Validated and transformed business profile
 */
export function validateAndTransformBusinessProfile(data: unknown): ApiResponse<BusinessProfileValidated> {
  try {
    // First transform the data
    const transformed = typeof data === 'object' && data !== null 
      ? transformBusinessProfileData(data as Record<string, unknown>)
      : data;
    
    // Then validate it
    return validateBusinessProfile(transformed);
  } catch {
    // Catch any errors and return a standardized error response
    return {
      success: false,
      error: 'Error validating and transforming business profile'
    };
  }
}
