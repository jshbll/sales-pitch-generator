/**
 * Business Profile Type Utilities
 * 
 * Provides type utilities for business profile operations to ensure
 * proper type safety and compatibility.
 */
import { BusinessProfile } from '../../../types/businessProfile';
import { getCloudflareImageUrl } from '../../../utils/imageUtils';

/**
 * Convert a partial business profile to a complete business profile
 * 
 * This utility helps safely convert a partial business profile to a complete one
 * by providing default values for required fields or properly merging with existing data.
 * 
 * @param partial - Partial business profile data
 * @param existing - Optional existing business profile data to merge with
 * @returns Complete business profile
 */
export function toCompleteBusinessProfile(
  partial: Partial<BusinessProfile>,
  existing?: BusinessProfile
): BusinessProfile {
  // If we have an existing profile, merge the partial with it
  if (existing) {
    return {
      ...existing,
      ...partial,
      // Preserve required fields from existing if partial doesn't include them
      id: partial.id ?? existing.id,
      ownerId: partial.ownerId ?? existing.ownerId,
      name: partial.name ?? existing.name
    };
  }
  
  // If no existing profile, ensure required fields are present or use defaults
  if (!partial.id || !partial.ownerId || !partial.name) {
    throw new Error('Required fields missing for business profile conversion: id, ownerId, and name are required');
  }
  
  // Return partial as complete since it has all required fields
  return partial as BusinessProfile;
}

/**
 * Convert partial business profile to database record format
 * 
 * Converts a partial business profile object to a format suitable for
 * database operations, using snake_case names and handling special fields.
 * 
 * @param profile - Partial business profile
 * @returns Database record object
 */
export function toDbRecord(profile: Partial<BusinessProfile>): Record<string, any> {
  const data: Record<string, any> = {};
  
  // Map each property if it exists
  if (profile.id !== undefined) data.id = profile.id;
  if (profile.ownerId !== undefined) data.owner_id = profile.ownerId;
  if (profile.name !== undefined) data.name = profile.name;
  if (profile.description !== undefined) data.description = profile.description;
  if (profile.phone !== undefined) data.phone = profile.phone;
  if (profile.email !== undefined) data.email = profile.email;
  if (profile.website !== undefined) data.website = profile.website;
  if (profile.address !== undefined) data.address = profile.address;
  if (profile.city !== undefined) data.city = profile.city;
  if (profile.state !== undefined) data.state = profile.state;
  if (profile.zip !== undefined) data.zip = profile.zip;
  if (profile.country !== undefined) data.country = profile.country;
  if (profile.logoUrl !== undefined) data.logo_url = profile.logoUrl;
  if (profile.bannerUrl !== undefined) data.banner_url = profile.bannerUrl;
  if (profile.categoryIds !== undefined) data.category_ids = profile.categoryIds;
  
  // Add timestamp if present (typically only for testing)
  if (profile.createdAt !== undefined) data.created_at = profile.createdAt;
  if (profile.updatedAt !== undefined) data.updated_at = profile.updatedAt;
  
  return data;
}

/**
 * Convert database record to business profile
 * 
 * @param record - Database record
 * @returns Business profile object
 */
export function fromDbRecord(record: Record<string, any>): BusinessProfile {
  // Generate Cloudflare URLs from IDs when available
  const logoUrl = record.logo_id ? getCloudflareImageUrl(record.logo_id) : (record.logo_url || record.logoUrl);
  const bannerUrl = record.banner_id ? getCloudflareImageUrl(record.banner_id) : (record.banner_url || record.bannerUrl);

  // Build the profile object including both camelCase and snake_case fields
  const profile: BusinessProfile = {
    id: record.id,
    // Include both field name variants
    ownerId: record.owner_id || record.user_id || record.userId,
    user_id: record.user_id || record.owner_id,
    // Handle both 'name' and 'business_name' fields
    name: record.business_name || record.businessName || record.name || '',
    business_name: record.business_name || record.businessName || record.name || '',
    description: record.description,
    phone: record.phone || record.phone_number || record.phoneNumber,
    phone_number: record.phone_number || record.phone,
    email: record.email,
    website: record.website || record.website_url || record.websiteUrl,
    website_url: record.website_url || record.website,
    address: record.address,
    city: record.city,
    state: record.state,
    zip: record.zip || record.zip_code || record.zipCode,
    zip_code: record.zip_code || record.zip,
    country: record.country || 'US',
    logoUrl: logoUrl,
    logo_url: logoUrl,
    bannerUrl: bannerUrl,
    banner_url: bannerUrl,
    categoryIds: record.category_ids || record.categoryIds || [],
    createdAt: record.created_at ? new Date(record.created_at) : undefined,
    updatedAt: record.updated_at ? new Date(record.updated_at) : undefined
  };
  
  // Include any additional fields from the record that might be useful
  // This ensures we don't lose any data from the API response
  Object.keys(record).forEach(key => {
    if (!(key in profile)) {
      (profile as any)[key] = record[key];
    }
  });
  
  return profile;
}

/**
 * Check if a partial business profile has all required fields to be a complete profile
 * 
 * @param partial - Partial business profile
 * @returns Whether the partial has all required fields
 */
export function isCompleteBusinessProfile(partial: Partial<BusinessProfile>): partial is BusinessProfile {
  return (
    typeof partial.id === 'string' && 
    typeof partial.ownerId === 'string' && 
    typeof partial.name === 'string'
  );
}
