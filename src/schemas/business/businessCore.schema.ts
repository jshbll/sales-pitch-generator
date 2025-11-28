/**
 * Business Core Schema
 * 
 * Zod schema for validating core business information.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { 
  idSchema, 
  optionalIdSchema, 
  requiredStringSchema, 
  optionalStringSchema,
  timestampStringSchema,
  timestampNumberSchema
} from './businessCommon.schema';

/**
 * Schema for core business information
 */
export const businessCoreSchema = z.object({
  id: idSchema,
  owner_id: optionalIdSchema,
  business_name: requiredStringSchema('Business name is required'),
  description: optionalStringSchema,
  createdAt: timestampStringSchema,
  updatedAt: timestampStringSchema,
  lastUpdated: timestampStringSchema,
  viewLoadTimestamp: timestampNumberSchema
});

/**
 * Type definition for BusinessCore
 */
export type BusinessCore = z.infer<typeof businessCoreSchema>;

/**
 * Create a new business core object with default values
 * 
 * @param name - The business name
 * @param ownerId - The owner ID (optional)
 * @returns A new business core object
 */
export function createBusinessCore(name: string, ownerId?: string): BusinessCore {
  const now = new Date().toISOString();
  
  return {
    id: crypto.randomUUID(),
    owner_id: ownerId,
    business_name: name,
    createdAt: now,
    updatedAt: now,
    lastUpdated: now,
    viewLoadTimestamp: Date.now()
  };
}

/**
 * Update a business core object
 * 
 * @param core - The existing business core object
 * @param updates - The updates to apply
 * @returns The updated business core object
 */
export function updateBusinessCore(
  core: BusinessCore, 
  updates: Partial<BusinessCore>
): BusinessCore {
  const now = new Date().toISOString();
  
  return {
    ...core,
    ...updates,
    updatedAt: now,
    lastUpdated: now,
    viewLoadTimestamp: Date.now()
  };
}

/**
 * Get the display name for a business
 * 
 * @param core - The business core object
 * @returns The display name
 */
export function getBusinessDisplayName(core: BusinessCore): string {
  return core.business_name;
}

/**
 * Check if a business is new (created within the last 30 days)
 * 
 * @param core - The business core object
 * @returns True if the business is new
 */
export function isNewBusiness(core: BusinessCore): boolean {
  if (!core.createdAt) {
    return false;
  }
  
  const createdDate = new Date(core.createdAt);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  return createdDate >= thirtyDaysAgo;
}
