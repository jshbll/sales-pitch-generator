/**
 * Business Classification Schema
 * 
 * Zod schema for validating business classification information.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { optionalStringSchema } from './businessCommon.schema';

/**
 * Schema for business classification
 */
export const businessClassificationSchema = z.object({
  category: optionalStringSchema,
  subcategory: optionalStringSchema,
  industry: optionalStringSchema,
  subIndustry: optionalStringSchema,
  founded: optionalStringSchema,
  employees: optionalStringSchema
});

/**
 * Type definition for BusinessClassification
 */
export type BusinessClassification = z.infer<typeof businessClassificationSchema>;

/**
 * Get the primary category for a business
 * 
 * @param classification - The business classification information
 * @returns The primary category
 */
export function getPrimaryCategory(classification: BusinessClassification): string | undefined {
  return classification.category || classification.industry;
}

/**
 * Get the secondary category for a business
 * 
 * @param classification - The business classification information
 * @returns The secondary category
 */
export function getSecondaryCategory(classification: BusinessClassification): string | undefined {
  return classification.subcategory || classification.subIndustry;
}

/**
 * Get the founding year for a business
 * 
 * @param classification - The business classification information
 * @returns The founding year
 */
export function getFoundingYear(classification: BusinessClassification): number | undefined {
  if (!classification.founded) {
    return undefined;
  }
  
  // Try to extract a year from the founded field
  const yearMatch = classification.founded.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0], 10);
  }
  
  // If it's just a year, try to parse it
  const parsedYear = parseInt(classification.founded, 10);
  if (!isNaN(parsedYear) && parsedYear >= 1800 && parsedYear <= new Date().getFullYear()) {
    return parsedYear;
  }
  
  return undefined;
}

/**
 * Get the employee count range for a business
 * 
 * @param classification - The business classification information
 * @returns The employee count range
 */
export function getEmployeeCountRange(classification: BusinessClassification): [number, number | null] | undefined {
  if (!classification.employees) {
    return undefined;
  }
  
  // Try to extract a range from the employees field
  const rangeMatch = classification.employees.match(/(\d+)\s*-\s*(\d+|unlimited|∞)/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const maxStr = rangeMatch[2].toLowerCase();
    const max = maxStr === 'unlimited' || maxStr === '∞' ? null : parseInt(maxStr, 10);
    return [min, max];
  }
  
  // If it's just a number, use it as both min and max
  const parsedCount = parseInt(classification.employees, 10);
  if (!isNaN(parsedCount)) {
    return [parsedCount, parsedCount];
  }
  
  return undefined;
}

/**
 * Check if a business is in a specific category
 * 
 * @param classification - The business classification information
 * @param categoryName - The category to check
 * @returns True if the business is in the specified category
 */
export function isInCategory(classification: BusinessClassification, categoryName: string): boolean {
  const normalizedCategory = categoryName.toLowerCase().trim();
  
  return !!(
    classification.category?.toLowerCase().includes(normalizedCategory) ||
    classification.subcategory?.toLowerCase().includes(normalizedCategory) ||
    classification.industry?.toLowerCase().includes(normalizedCategory) ||
    classification.subIndustry?.toLowerCase().includes(normalizedCategory)
  );
}

/**
 * Create a classification object with default values
 * 
 * @returns A new business classification object
 */
export function createDefaultClassification(): BusinessClassification {
  return {
    category: undefined,
    subcategory: undefined,
    industry: undefined,
    subIndustry: undefined,
    founded: undefined,
    employees: undefined
  };
}
