import { ConvexError } from "convex/values";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import {
  getAllPlanIds,
  getPlanTier,
  getPlanById,
  getPlanLimits as getPlanLimitsFromConstants,
  PLAN_CONFIGS,
  type SubscriptionTier
} from "../constants/clerkPlans";

/**
 * Clerk Billing Service
 * Handles all subscription and billing operations through Clerk
 *
 * Note: Clerk Billing is in BETA - APIs may change
 */

// Initialize Clerk client
function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new ConvexError("CLERK_SECRET_KEY is not configured");
  }
  return createClerkClient({ secretKey });
}

/**
 * Get user's subscription status
 * Returns default/free state for now since Clerk Billing manages subscriptions
 * In production, this would be populated via Clerk webhooks
 */
export async function getUserSubscription(businessRecord: any) {
  try {
    // Check for admin overrides FIRST (bypasses Clerk)
    if (businessRecord?.override_unlimited) {
      // Comp account - unlimited access
      return {
        hasSubscription: true,
        status: 'active',
        plan: 'Unlimited (Comp Account)',
        planId: null,
        tier: 'diamond', // Treat as diamond tier
        currentPeriodEnd: null, // Never expires
        cancelAtPeriodEnd: false,
        isOverride: true,
      };
    }

    if (businessRecord?.override_subscription_tier) {
      // Admin manually set a tier
      const overrideTier = businessRecord.override_subscription_tier;
      return {
        hasSubscription: true,
        status: 'active',
        plan: `${overrideTier.charAt(0).toUpperCase() + overrideTier.slice(1)} (Override)`,
        planId: null,
        tier: overrideTier,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        isOverride: true,
      };
    }

    // Check if business has Clerk subscription data (would be set via webhooks)
    const hasClerkSubscription = businessRecord?.clerk_subscription_id ||
                                businessRecord?.clerk_plan_id;

    // Check if data is stale (older than 1 hour)
    const lastSync = businessRecord?.last_subscription_sync || 0;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const isStale = lastSync < oneHourAgo;

    // If data exists but is stale, we should trigger a refresh
    // NOTE: This is informational only - actual refresh happens via manualSyncSubscription
    if (hasClerkSubscription && isStale) {
      console.warn(`[ClerkBilling] Subscription data is stale for business ${businessRecord._id}. Last sync: ${new Date(lastSync).toISOString()}`);
      // TODO: Consider triggering automatic refresh here via scheduler
    }

    if (hasClerkSubscription) {
      // Use Clerk subscription data from webhooks
      // This is the PRIMARY source (fast, real-time via webhooks)
      return {
        hasSubscription: true,
        status: businessRecord?.clerk_subscription_status || 'active',
        plan: businessRecord?.clerk_plan_name || null,
        planId: businessRecord?.clerk_plan_id || null,
        tier: mapPlanToTier(businessRecord?.clerk_plan_id || ''),
        currentPeriodEnd: businessRecord?.clerk_period_end || null,
        cancelAtPeriodEnd: false,
        dataSource: 'webhook', // Indicate this came from webhooks
        lastSynced: businessRecord?.last_subscription_sync,
      };
    }
    
    // Default free tier for users without Clerk subscription
    return {
      hasSubscription: false,
      status: 'none',
      plan: null,
      planId: null,
      tier: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  } catch (error: any) {
    console.error("[ClerkBilling] Error in getUserSubscription:", error);
    // Return default state if error
    return {
      hasSubscription: false,
      status: 'none',
      plan: null,
      planId: null,
      tier: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
}

/**
 * Create a checkout session URL for a subscription plan
 * Note: This is handled client-side with Clerk's redirect methods
 */
export async function createCheckoutUrl(
  clerkUserId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  // In Clerk Billing, checkout is handled client-side through their SDK
  // The frontend should use Clerk's client-side methods to start checkout
  console.log("[ClerkBilling] Checkout should be initiated client-side with Clerk SDK");
  
  // Return a placeholder URL
  // In production, use Clerk's client-side checkout methods
  return `#clerk-checkout-${planId}`;
}

/**
 * Create a billing portal session URL
 * Allows users to manage their subscription
 */
export async function createBillingPortalUrl(
  clerkUserId: string,
  returnUrl: string
): Promise<string> {
  // In Clerk Billing, portal is handled client-side through their SDK
  // The frontend should use Clerk's client-side methods to open the portal
  console.log("[ClerkBilling] Billing portal should be opened client-side with Clerk SDK");
  
  // Return a placeholder URL
  // In production, use Clerk's client-side portal methods
  return `#clerk-billing-portal`;
}

/**
 * Update user's subscription data in Clerk metadata
 * Called by webhook handlers when subscription events occur
 */
export async function updateUserSubscriptionMetadata(
  clerkUserId: string,
  subscriptionData: {
    status: string;
    planId: string;
    planName?: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
) {
  try {
    const clerk = getClerkClient();
    
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        subscription: {
          status: subscriptionData.status,
          planId: subscriptionData.planId,
          planName: subscriptionData.planName,
          currentPeriodEnd: subscriptionData.currentPeriodEnd,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
          updatedAt: new Date().toISOString(),
        },
        // Keep Stripe references for debugging/migration
        stripe: {
          customerId: subscriptionData.stripeCustomerId,
          subscriptionId: subscriptionData.stripeSubscriptionId,
        }
      }
    });
    
    console.log(`[ClerkBilling] Updated subscription metadata for user ${clerkUserId}`);
  } catch (error: any) {
    console.error("[ClerkBilling] Failed to update subscription metadata:", error);
    throw new ConvexError(`Failed to update subscription: ${error.message}`);
  }
}

/**
 * Clear user's subscription data (for cancellations)
 */
export async function clearUserSubscriptionMetadata(clerkUserId: string) {
  try {
    const clerk = getClerkClient();
    
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        subscription: null,
        stripe: null,
      }
    });
    
    console.log(`[ClerkBilling] Cleared subscription metadata for user ${clerkUserId}`);
  } catch (error: any) {
    console.error("[ClerkBilling] Failed to clear subscription metadata:", error);
    throw new ConvexError(`Failed to clear subscription: ${error.message}`);
  }
}

/**
 * Map Clerk plan ID to internal tier system
 * Using plan IDs from Convex environment variables
 */
export function mapPlanToTier(planId: string): SubscriptionTier {
  return getPlanTier(planId);
}

/**
 * Get plan details from plan ID
 * Uses centralized plan configuration from constants
 */
export function getPlanDetails(planId: string) {
  return getPlanById(planId);
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(clerkUserId: string): Promise<boolean> {
  const subscription = await getUserSubscription(clerkUserId);
  return subscription.hasSubscription && subscription.status === 'active';
}

/**
 * Get subscription limits based on plan
 * Uses centralized plan configuration from constants
 */
export function getSubscriptionLimits(planId: string | null) {
  return getPlanLimitsFromConstants(planId);
}