/**
 * Subscription cache utilities
 * Manages cache invalidation for subscription-related data
 */

const BUSINESS_PROFILE_CACHE_KEY = 'business_profile_cache';
const SUBSCRIPTION_CACHE_KEY = 'subscription_cache';
const SUBSCRIPTION_STATUS_CACHE_KEY = 'subscription_status_cache';
const LAST_SUBSCRIPTION_PLAN_KEY = 'last_subscription_plan';

/**
 * Clear all subscription-related caches
 * Should be called after subscription changes
 */
export function clearSubscriptionCache(): void {
  localStorage.removeItem(BUSINESS_PROFILE_CACHE_KEY);
  localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
  localStorage.removeItem(SUBSCRIPTION_STATUS_CACHE_KEY);
  console.log('[SubscriptionCache] Cleared subscription caches');
}

/**
 * Check if subscription has changed and clear cache if needed
 * @param currentPlan - The current subscription plan
 * @returns true if subscription changed
 */
export function checkSubscriptionChange(currentPlan: string | null | undefined): boolean {
  const lastPlan = localStorage.getItem(LAST_SUBSCRIPTION_PLAN_KEY);
  
  if (currentPlan !== lastPlan) {
    console.log('[SubscriptionCache] Subscription plan changed from', lastPlan, 'to', currentPlan);
    
    // Store the new plan
    if (currentPlan) {
      localStorage.setItem(LAST_SUBSCRIPTION_PLAN_KEY, currentPlan);
    } else {
      localStorage.removeItem(LAST_SUBSCRIPTION_PLAN_KEY);
    }
    
    // Clear all caches since subscription changed
    clearSubscriptionCache();
    
    return true;
  }
  
  return false;
}

/**
 * Force refresh of business profile by clearing cache
 */
export function forceRefreshBusinessProfile(): void {
  localStorage.removeItem(BUSINESS_PROFILE_CACHE_KEY);
  console.log('[SubscriptionCache] Forced business profile refresh');
}