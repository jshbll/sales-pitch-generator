/**
 * Business Social Media Schema
 * 
 * Zod schema for validating business social media links.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { urlSchema } from './businessCommon.schema';
import { normalizeUrl } from './businessTransformation.utils';

/**
 * Schema for business social media
 */
export const businessSocialSchema = z.object({
  instagramUrl: urlSchema,
  linkedinUrl: urlSchema,
  twitterUrl: urlSchema,
  facebookUrl: urlSchema,
  snapchatUrl: urlSchema
});

/**
 * Type definition for BusinessSocial
 */
export type BusinessSocial = z.infer<typeof businessSocialSchema>;

/**
 * Get all social media links for a business
 * 
 * @param social - The business social media information
 * @returns Object with normalized social media links
 */
export function getSocialMediaLinks(social: BusinessSocial): Record<string, string> {
  const links: Record<string, string> = {};
  
  if (social.instagramUrl) {
    links.instagram = normalizeUrl(social.instagramUrl) || '';
  }
  
  if (social.linkedinUrl) {
    links.linkedin = normalizeUrl(social.linkedinUrl) || '';
  }
  
  if (social.twitterUrl) {
    links.twitter = normalizeUrl(social.twitterUrl) || '';
  }
  
  if (social.facebookUrl) {
    links.facebook = normalizeUrl(social.facebookUrl) || '';
  }
  
  if (social.snapchatUrl) {
    links.snapchat = normalizeUrl(social.snapchatUrl) || '';
  }
  
  return links;
}

/**
 * Check if a business has any social media links
 * 
 * @param social - The business social media information
 * @returns True if the business has at least one social media link
 */
export function hasSocialMedia(social: BusinessSocial): boolean {
  return !!(
    social.instagramUrl ||
    social.linkedinUrl ||
    social.twitterUrl ||
    social.facebookUrl ||
    social.snapchatUrl
  );
}

/**
 * Get the social media platforms that a business is on
 * 
 * @param social - The business social media information
 * @returns Array of social media platforms
 */
export function getSocialPlatforms(social: BusinessSocial): string[] {
  const platforms: string[] = [];
  
  if (social.instagramUrl) platforms.push('instagram');
  if (social.linkedinUrl) platforms.push('linkedin');
  if (social.twitterUrl) platforms.push('twitter');
  if (social.facebookUrl) platforms.push('facebook');
  if (social.snapchatUrl) platforms.push('snapchat');
  
  return platforms;
}

/**
 * Create a social media object with default values
 * 
 * @returns A new business social media object
 */
export function createDefaultSocial(): BusinessSocial {
  return {
    instagramUrl: undefined,
    linkedinUrl: undefined,
    twitterUrl: undefined,
    facebookUrl: undefined,
    snapchatUrl: undefined
  };
}
