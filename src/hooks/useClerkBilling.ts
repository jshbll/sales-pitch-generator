import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useOnboardingStatus } from './useOnboardingStatus';

/**
 * Custom hook for Clerk Billing operations (B2C SaaS)
 * Provides utilities for subscription management
 *
 * ⚠️ IMPORTANT: This hook now uses conditional queries based on onboarding status.
 * Subscription queries will not run until onboarding is complete, preventing
 * unnecessary API calls and "business not found" errors during onboarding.
 */
export const useClerkBilling = () => {
  const { userId, has, isLoaded } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check onboarding status first - this is a lightweight query
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboardingStatus();

  // Convex queries and actions
  // ✅ Skip subscription query until onboarding is complete
  // Pass query function with "skip" as args when not ready
  const subscription = useQuery(
    api.clerkBilling.getCurrentSubscription,
    isOnboardingComplete ? {} : "skip"
  );
  const createCheckoutUrl = useAction(api.clerkBilling.createCheckoutUrl);
  const createBillingPortalUrl = useAction(api.clerkBilling.createBillingPortalUrl);
  const refreshSubscription = useMutation(api.clerkBilling.refreshSubscriptionData);
  
  // Track if we're actively in checkout
  const checkoutInProgressRef = useRef(false);
  
  /**
   * Start checkout for a subscription plan
   */
  const startCheckout = useCallback(async (planId: string) => {
    if (!userId) {
      setError('Not signed in');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Clerk's checkout flow
      // In a real implementation, this would use Clerk's SDK
      const successUrl = `${window.location.origin}/business/subscription/success`;
      const cancelUrl = `${window.location.origin}/business/subscription`;
      
      const result = await createCheckoutUrl({
        planId,
        successUrl,
        cancelUrl,
      });
      
      // Mark that we're starting checkout
      checkoutInProgressRef.current = true;
      
      // In production, Clerk's SDK would handle checkout client-side
      // For now, log the request
      if (result.url) {
        window.location.href = result.url;
      } else {
        console.log('[ClerkBilling] Checkout should be initiated with Clerk SDK for plan:', result.planId);
        // In production: clerk.openCheckout({ planId })
      }
      
      return result.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, createCheckoutUrl]);
  
  /**
   * Open billing portal for subscription management
   */
  const openBillingPortal = useCallback(async () => {
    if (!userId) {
      setError('Not signed in');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const returnUrl = window.location.href;
      const result = await createBillingPortalUrl({ returnUrl });
      
      if (result.url) {
        window.location.href = result.url;
      }
      
      return result.url;
    } catch (err) {
      console.error('Portal error:', err);
      setError('Failed to open billing portal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, createBillingPortalUrl]);
  
  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async () => {
    // This would typically be handled through the billing portal
    // Or via a Clerk API call
    await openBillingPortal();
  }, [openBillingPortal]);
  
  /**
   * Upgrade or downgrade subscription
   */
  const changePlan = useCallback(async (newPlanId: string) => {
    // Start checkout for the new plan
    // Clerk handles proration automatically
    await startCheckout(newPlanId);
  }, [startCheckout]);
  
  /**
   * Check if user has access to a feature using Clerk's built-in has() method
   * Features created in Clerk Dashboard:
   * - max_locations_1, max_locations_3, max_locations_5
   * - max_promotions_1, max_promotions_5, max_promotions_10
   * - max_events_1, max_events_2, max_events_5
   */
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!isLoaded) return false;
    
    // Use Clerk's built-in has() method to check for features
    // This checks against features configured in Clerk Dashboard
    return has({ feature }) || false;
  }, [has, isLoaded]);
  
  /**
   * Check if user has a specific plan using Clerk's built-in has() method
   */
  const hasPlanAccess = useCallback((plan: string): boolean => {
    if (!isLoaded) return false;
    
    // Use Clerk's built-in has() method to check for plans
    // This checks against plans configured in Clerk Dashboard
    return has({ plan }) || false;
  }, [has, isLoaded]);
  
  /**
   * DISABLED: Clerk session listener (causing excessive re-renders)
   *
   * This listener was triggering on EVERY Clerk event (session updates, token refreshes, user activity),
   * causing refreshSubscription() to be called constantly. This led to:
   * - Excessive re-renders across the app
   * - Form inputs losing focus while typing
   * - Poor user experience
   *
   * Convex queries are already reactive - when Clerk webhooks update the database,
   * Convex automatically re-runs affected queries. The only edge case is returning
   * from external checkout, which is handled by the visibility change listener below.
   *
   * If subscription updates seem delayed in the future, consider adding a DEBOUNCED
   * version of this listener that only refreshes once every 5-10 seconds maximum.
   */
  // useEffect(() => {
  //   if (!userId || !clerk) return;
  //   const isBusinessArea = window.location.pathname.startsWith('/business');
  //   if (!isBusinessArea) return;
  //   if (!isOnboardingComplete) return;
  //   const unsubscribe = clerk.addListener((event) => {
  //     refreshSubscription()...
  //   });
  //   return () => { if (unsubscribe) unsubscribe(); };
  // }, [userId, clerk, refreshSubscription, isOnboardingComplete]);

  /**
   * Auto-refresh subscription data when user returns from checkout
   * Convex queries automatically update when webhooks modify the database,
   * so we only need to handle the edge case of returning from external checkout
   * ONLY runs after onboarding is complete
   */
  useEffect(() => {
    // ✅ Skip if onboarding not complete - no business to refresh subscription for
    if (!isOnboardingComplete) {
      console.log('[useClerkBilling] Onboarding incomplete, skipping visibility listener');
      return;
    }

    const handleVisibilityChange = async () => {
      // Only refresh if we were in checkout and page becomes visible
      if (document.visibilityState === 'visible' && checkoutInProgressRef.current) {
        console.log('[useClerkBilling] Page visible after checkout, refreshing subscription...');
        checkoutInProgressRef.current = false;

        try {
          // Wait a moment for Clerk webhooks to process
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Refresh subscription data
          const result = await refreshSubscription();
          console.log('[useClerkBilling] Subscription refreshed:', result);

          // The Convex query will automatically re-run due to reactivity
        } catch (err) {
          console.error('[useClerkBilling] Failed to refresh subscription:', err);
        }
      }
    };

    // Add listener for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also handle focus event as a fallback
    const handleFocus = () => {
      if (checkoutInProgressRef.current) {
        handleVisibilityChange();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshSubscription, isOnboardingComplete]);

  /**
   * REMOVED: Smart polling no longer needed
   *
   * With the fallback-to-plan-config pattern in backend mutations (clerkWebhooks.ts, promotions.ts),
   * the system will self-heal if webhook parsing fails. The backend now uses getPlanDetails()
   * as a fallback when limits are missing from the database, making client-side polling unnecessary.
   *
   * Convex queries automatically update via reactivity when webhooks modify the database,
   * so we rely on that for real-time updates instead of polling.
   */

  /**
   * Get user's current limits from subscription data
   * Uses the authoritative limits from the backend subscription query
   */
  const getUserLimits = useCallback(() => {
    // Use subscription limits from backend if available
    if (subscription?.limits) {
      return {
        maxLocations: subscription.limits.maxLocations || 1,
        maxPromotions: subscription.limits.maxPromotions || 0,
        maxEvents: subscription.limits.maxEvents || 0,
      };
    }

    // Fallback to defaults if subscription data not loaded
    return {
      maxLocations: 1,
      maxPromotions: 0, // Free tier: 0 active, 1 draft
      maxEvents: 0,     // Free tier: 0 active, 1 draft
    };
  }, [subscription]);
  
  /**
   * Get subscription display information
   */
  const getSubscriptionDisplay = useCallback(() => {
    if (!subscription || !subscription.hasSubscription) {
      return {
        name: 'Unavailable',
        status: 'No subscription',
        color: 'default',
        icon: '❌',
      };
    }
    
    const tierDisplay = {
      bronze: { name: 'Bronze', color: '#CD7F32', icon: '🥉' },
      gold: { name: 'Gold', color: '#FFD700', icon: '🥇' },
      diamond: { name: 'Diamond', color: '#B9F2FF', icon: '💎' },
    };
    
    const display = tierDisplay[subscription.tier as keyof typeof tierDisplay] || {
      name: 'Unknown',
      color: 'inherit',
      icon: '❓',
    };
    
    return {
      ...display,
      status: subscription.status,
      expiresAt: subscription.currentPeriodEnd,
    };
  }, [subscription]);
  
  /**
   * Manually refresh subscription data (useful after upgrades)
   */
  const forceRefresh = useCallback(async () => {
    console.log('[useClerkBilling] Manual subscription refresh requested');
    try {
      const result = await refreshSubscription();
      console.log('[useClerkBilling] Manual refresh completed:', result);
      return result;
    } catch (err) {
      console.error('[useClerkBilling] Manual refresh failed:', err);
      throw err;
    }
  }, [refreshSubscription]);
  
  // Get limits from subscription data (memoized to prevent new object references)
  const limits = useMemo(() => getUserLimits(), [getUserLimits]);

  // Subscription status check
  const hasActiveSubscription = subscription?.hasSubscription &&
    (subscription?.status === 'active' || subscription?.status === 'trialing');

  return {
    // State
    subscription: isOnboardingComplete ? subscription : null, // Return null if onboarding incomplete
    loading,
    isLoading: onboardingLoading || (isOnboardingComplete && subscription === undefined), // Loading if onboarding check or subscription query is loading
    error,
    user,
    userId,

    // Actions
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    changePlan,
    forceRefresh, // Add manual refresh function

    // Utilities
    hasFeatureAccess,
    hasPlanAccess,
    getSubscriptionDisplay,
    getUserLimits,

    // Computed values
    hasActiveSubscription,
    isTrialing: subscription?.status === 'trialing',
    isPastDue: subscription?.status === 'past_due',
    // Use subscription-based limits from backend
    maxLocations: limits.maxLocations,
    maxPromotions: limits.maxPromotions,
    maxEvents: limits.maxEvents,

    // Onboarding status
    isOnboardingComplete,
  };
};