/**
 * Business Common Schema Patterns
 * 
 * Reusable Zod schema components for business-related data validation.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';

/**
 * Schema for validating email addresses
 */
export const emailSchema = z.string().email('Invalid email format').optional();

/**
 * Schema for validating URLs with proper formatting
 * Accepts empty strings or valid URLs
 */
export const urlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''));

/**
 * Schema for validating phone numbers
 * This is a simple schema that just ensures it's a string
 * In a real application, you might want to add more validation
 */
export const phoneSchema = z.string().optional();

/**
 * Schema for validating string IDs
 */
export const idSchema = z.string();

/**
 * Schema for validating optional string IDs
 */
export const optionalIdSchema = z.string().optional();

/**
 * Schema for validating required string fields
 * @param errorMessage - Custom error message
 */
export const requiredStringSchema = (errorMessage = 'This field is required') => 
  z.string().min(1, errorMessage);

/**
 * Schema for validating optional string fields
 */
export const optionalStringSchema = z.string().optional();

/**
 * Schema for validating optional number fields
 */
export const optionalNumberSchema = z.number().optional();

/**
 * Schema for validating timestamp strings
 */
export const timestampStringSchema = z.string().optional();

/**
 * Schema for validating timestamp numbers
 */
export const timestampNumberSchema = z.number().optional();

/**
 * Schema for validating boolean fields
 */
export const booleanSchema = z.boolean();

/**
 * Schema for validating optional boolean fields
 */
export const optionalBooleanSchema = z.boolean().optional();

/**
 * Schema for validating coordinates (latitude/longitude)
 */
export const coordinateSchema = z.number().min(-180).max(180).optional();

/**
 * Create a schema that ensures at least one field is provided
 * 
 * @param schema - The Zod schema to refine
 * @returns A refined schema that requires at least one field
 */
export function requireAtLeastOneField<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided",
      path: ["_any"]
    }
  );
}

/**
 * Create a schema for a day's business hours
 */
export const dayHoursBaseSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean()
});

/**
 * Create a schema for weekly business hours
 */
export const weekdaySchema = z.enum([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]);

/**
 * Type definition for weekdays
 */
export type Weekday = z.infer<typeof weekdaySchema>;

/**
 * Create a schema for image URLs
 */
export const imageUrlSchema = z.string().optional();

/**
 * Create a schema for social media platforms
 */
export const socialPlatformSchema = z.enum([
  'instagram', 'linkedin', 'twitter', 'facebook', 'snapchat'
]);

/**
 * Type definition for social media platforms
 */
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
