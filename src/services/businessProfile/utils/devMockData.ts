/**
 * Development Mock Data
 * 
 * This module provides mock data for development environments when
 * real data is not available. This helps separate mock data from
 * service logic for better maintainability.
 */
import { BusinessProfile } from '../../../types';

/**
 * Get a development fallback business profile
 * Used when no authenticated user is available in development mode
 */
export function getDevelopmentBusinessProfile(): BusinessProfile {
  return {
    id: 'dev-business-id',
    business_name: 'Development Business',
    owner_id: 'dev-owner-id',
    description: 'Development business profile for testing',
    contact_email: 'dev@example.com',
    contact_phone: '555-555-5555',
    business_type: 'restaurant',
    industry: 'food_service',
    website_url: 'https://example.com',
    social_media: {
      facebook: 'https://facebook.com/dev-business',
      instagram: 'https://instagram.com/dev-business',
      twitter: 'https://twitter.com/dev-business'
    },
    address: {
      street: '123 Dev Street',
      city: 'Dev City',
      state: 'DS',
      postal_code: '12345',
      country: 'Dev Country'
    },
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { closed: true },
      sunday: { closed: true }
    },
    logo_url: 'https://example.com/logo.png',
    cover_image_url: 'https://example.com/cover.png',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    viewLoadTimestamp: Date.now(),
    subscription_tier: 'free'
  };
}

/**
 * Log development fallback usage
 * @param context - Additional context information
 */
export function logDevelopmentFallbackUsage(context: string): void {
  console.log(`[BusinessProfileService] No authenticated user found - using development fallback (${context})`);
  console.log('[BusinessProfileService] Using DEVELOPMENT fallback for business profile');
  console.log('[BusinessProfileService] Attempting to use the most current business name');
}
