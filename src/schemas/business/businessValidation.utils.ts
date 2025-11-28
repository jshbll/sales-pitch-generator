/**
 * Business Validation Utilities
 * 
 * Utility functions for validating business profile data.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { handleCatchError } from '../../utils/errorHandling/errorHandler';
import { ApiResponse } from '../../types';
import { transformBusinessProfileData } from './businessTransformation.utils';

/**
 * Generic validation function for Zod schemas
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param functionName - The name of the function for error context
 * @returns The validation result with standardized error handling
 */
export function validateWithZod<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  functionName: string
): ApiResponse<z.infer<T>> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return handleCatchError<z.infer<T>>(
        result.error,
        {
          context: {
            functionName,
            info: {
              zodErrors: result.error.format(),
              errorCount: result.error.errors.length
            }
          }
        }
      );
    }
  } catch (error) {
    return handleCatchError<z.infer<T>>(
      error,
      {
        context: {
          functionName,
          info: {
            unexpectedError: true
          }
        }
      }
    );
  }
}

/**
 * Validate and transform data using a Zod schema
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate and transform
 * @param functionName - The name of the function for error context
 * @returns The validation result with standardized error handling
 */
export function validateAndTransform<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  functionName: string
): ApiResponse<z.infer<T>> {
  try {
    // First transform the data
    const transformed = typeof data === 'object' && data !== null 
      ? transformBusinessProfileData(data as Record<string, unknown>)
      : data;
    
    // Then validate it
    return validateWithZod(schema, transformed, functionName);
  } catch (error) {
    return handleCatchError<z.infer<T>>(
      error,
      {
        context: {
          functionName,
          info: {
            unexpectedError: true
          }
        }
      }
    );
  }
}

/**
 * Create a partial schema validator function
 * 
 * @param schema - The Zod schema to create a partial validator for
 * @param functionName - The name of the function for error context
 * @returns A function that validates partial data against the schema
 */
export function createPartialValidator<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  functionName: string
): (data: unknown) => ApiResponse<Partial<z.infer<T>>> {
  return (data: unknown) => {
    const partialSchema = schema.partial().refine(
      (obj) => {
        // Ensure at least one field is provided
        return Object.keys(obj).length > 0;
      },
      {
        message: "At least one field must be provided for an update",
        path: ["_any"]
      }
    );
    
    return validateWithZod(partialSchema, data, functionName);
  };
}

/**
 * Create a validator function for a specific schema
 * 
 * @param schema - The Zod schema to create a validator for
 * @param functionName - The name of the function for error context
 * @returns A function that validates data against the schema
 */
export function createValidator<T extends z.ZodTypeAny>(
  schema: T,
  functionName: string
): (data: unknown) => ApiResponse<z.infer<T>> {
  return (data: unknown) => validateWithZod(schema, data, functionName);
}

/**
 * Create a validator and transformer function for a specific schema
 * 
 * @param schema - The Zod schema to create a validator and transformer for
 * @param functionName - The name of the function for error context
 * @returns A function that validates and transforms data against the schema
 */
export function createValidatorAndTransformer<T extends z.ZodTypeAny>(
  schema: T,
  functionName: string
): (data: unknown) => ApiResponse<z.infer<T>> {
  return (data: unknown) => validateAndTransform(schema, data, functionName);
}
