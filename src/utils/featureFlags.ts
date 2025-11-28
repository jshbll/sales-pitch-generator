/**
 * Feature Flags
 *
 * Controls access to features for specific businesses or accounts.
 *
 * To enable features for new businesses, edit:
 * packages/web-business/src/config/featureConfig.ts
 */

import { getLearnMoreEnabledBusinesses, getCustomRsvpEnabledBusinesses } from '../config/featureConfig';

/**
 * Check if a business has access to the Learn More button feature.
 *
 * @param businessId - The Convex business ID (_id)
 * @returns true if the business can use the Learn More button feature
 */
export const canUseLearnMoreButton = (businessId: string | undefined): boolean => {
  if (!businessId) return false;

  const enabledBusinesses = getLearnMoreEnabledBusinesses();
  console.log('[featureFlags] canUseLearnMoreButton check:', {
    businessId,
    enabledBusinesses,
    isEnabled: enabledBusinesses.includes(businessId),
  });

  return enabledBusinesses.includes(businessId);
};

/**
 * Check if a business has access to the Custom RSVP button feature for events.
 *
 * @param businessId - The Convex business ID (_id)
 * @returns true if the business can use the Custom RSVP button feature
 */
export const canUseCustomRsvpButton = (businessId: string | undefined): boolean => {
  if (!businessId) return false;

  const enabledBusinesses = getCustomRsvpEnabledBusinesses();
  console.log('[featureFlags] canUseCustomRsvpButton check:', {
    businessId,
    enabledBusinesses,
    isEnabled: enabledBusinesses.includes(businessId),
  });

  return enabledBusinesses.includes(businessId);
};
