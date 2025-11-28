/**
 * Business Image Schema
 * 
 * Zod schema for validating business image URLs.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { imageUrlSchema } from './businessCommon.schema';
import { normalizeImageUrl } from './businessTransformation.utils';

/**
 * Schema for business images
 */
export const businessImageSchema = z.object({
  logo: imageUrlSchema,
  logo_url: imageUrlSchema,
  logoUrl: imageUrlSchema,
  banner_url: imageUrlSchema,
  bannerUrl: imageUrlSchema,
  profileImage: imageUrlSchema
});

/**
 * Type definition for BusinessImage
 */
export type BusinessImage = z.infer<typeof businessImageSchema>;

/**
 * Get the logo URL for a business
 * 
 * @param image - The business image information
 * @returns The logo URL
 */
export function getLogoUrl(image: BusinessImage): string | undefined {
  return normalizeImageUrl(image.logo || image.logo_url || image.logoUrl);
}

/**
 * Get the banner URL for a business
 * 
 * @param image - The business image information
 * @returns The banner URL
 */
export function getBannerUrl(image: BusinessImage): string | undefined {
  return normalizeImageUrl(image.banner_url || image.bannerUrl);
}

/**
 * Get the profile image URL for a business
 * 
 * @param image - The business image information
 * @returns The profile image URL
 */
export function getProfileImageUrl(image: BusinessImage): string | undefined {
  return normalizeImageUrl(image.profileImage || getLogoUrl(image));
}

/**
 * Check if a business has a logo
 * 
 * @param image - The business image information
 * @returns True if the business has a logo
 */
export function hasLogo(image: BusinessImage): boolean {
  return !!(image.logo || image.logo_url || image.logoUrl);
}

/**
 * Check if a business has a banner
 * 
 * @param image - The business image information
 * @returns True if the business has a banner
 */
export function hasBanner(image: BusinessImage): boolean {
  return !!(image.banner_url || image.bannerUrl);
}

/**
 * Create an image object with default values
 * 
 * @returns A new business image object
 */
export function createDefaultImage(): BusinessImage {
  return {
    logo: undefined,
    logo_url: undefined,
    logoUrl: undefined,
    banner_url: undefined,
    bannerUrl: undefined,
    profileImage: undefined
  };
}
