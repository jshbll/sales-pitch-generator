import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import * as clerkBillingService from "./services/clerkBillingService";
import { getPlanDetails, getPlanById, getEnvironmentPlanIds as getEnvironmentPlanIdsHelper } from "./constants/clerkPlans";

/**
 * Clerk Billing Integration
 * Handles subscription management through Clerk's billing system
 */

// Force refresh subscription data from Clerk
export const refreshSubscriptionData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Don't throw error - just return gracefully for marketing pages
      console.log('[refreshSubscriptionData] Not authenticated - skipping');
      return { success: false, error: 'Not authenticated', skipped: true };
    }

    const clerkUserId = identity.subject;
    console.log('[refreshSubscriptionData] Forcing subscription refresh for user:', clerkUserId);

    // Get the business associated with this user
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();

    if (!business) {
      console.log('[refreshSubscriptionData] No business found for user - skipping');
      // Return success with skipped flag instead of error
      return { success: true, error: 'No business found', skipped: true };
    }
    
    console.log('[refreshSubscriptionData] Found business, reading subscription data');
    
    // Get the current subscription data from the business record
    // This data is populated by Clerk webhooks
    const subscriptionData = await clerkBillingService.getUserSubscription(business);
    
    // Get the subscription limits based on the plan
    const limits = clerkBillingService.getSubscriptionLimits(business.clerk_plan_id || null);

    // Update the business with computed subscription limits
    const updates = {
      max_locations_limit: limits.maxLocations,
      max_active_promotions_limit: limits.maxActivePromotions,
      max_active_events_limit: limits.maxActiveEvents,
      last_subscription_sync: Date.now()
    };
    
    await ctx.db.patch(business._id, updates);
    
    console.log('[refreshSubscriptionData] Successfully refreshed subscription data', {
      subscription: subscriptionData,
      limits: limits,
      businessId: business._id
    });
    
    return { 
      success: true, 
      businessId: business._id,
      subscription: subscriptionData,
      limits: limits
    };
  }
});

// Manual fix for Gold plan limits
export const fixGoldPlanLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the business for the current user
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", identity.subject))
      .collect();
    
    if (businesses.length === 0) {
      throw new Error("No business found for user");
    }

    const business = businesses[0];
    
    // Check if on Gold plan (check both the exact ID and case variations)
    const planId = business.clerk_plan_id?.toLowerCase() || "";
    const planName = business.clerk_plan_name?.toLowerCase() || "";
    
    if (planId.includes("33cog9y6zdxlgkvq2z2oy1xekyn") || 
        planName === "gold" || 
        business.clerk_subscription_status === "active") {
      
      // Update with Gold plan limits
      await ctx.db.patch(business._id, {
        max_locations_limit: 3,
        max_active_promotions_limit: 5,
        max_active_events_limit: 2,
        max_draft_promotions_limit: 10,
        max_draft_events_limit: 5,
        updated_at: Date.now()
      });

      console.log("[fixGoldPlanLimits] Updated business with Gold plan limits");
      return { success: true, message: "Gold plan limits applied", business: business._id };
    }

    return { success: false, message: "Not on Gold plan", planId, planName };
  }
});

// Get current subscription status for authenticated user
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        hasSubscription: false,
        status: 'none',
        plan: null,
        tier: 'none',
        limits: {
          maxLocations: 1,
          maxPromotions: 0,
          maxEvents: 0,
        }
      };
    }
    
    const clerkUserId = identity.subject;
    
    // Get the business record from database - this is the source of truth
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (!business) {
      return {
        hasSubscription: false,
        status: 'none',
        plan: null,
        tier: 'none',
        limits: {
          maxLocations: 1,
          maxPromotions: 0,
          maxEvents: 0,
        }
      };
    }
    
    // Check for admin override - unlimited access
    const hasUnlimitedAccess = business.override_unlimited === true;

    // Get plan config - this is the source of truth for limits
    let planConfig = business.clerk_plan_id ? getPlanById(business.clerk_plan_id) : null;

    // Extract expected tier from plan name for validation
    // "Business Founder" -> "business", "Pro Founder" -> "pro", etc.
    let expectedTier = '';
    if (business.clerk_plan_name) {
      const planNameLower = business.clerk_plan_name.toLowerCase();
      if (planNameLower.includes('business')) expectedTier = 'business';
      else if (planNameLower.includes('pro')) expectedTier = 'pro';
      else if (planNameLower.includes('starter')) expectedTier = 'starter';
      else if (planNameLower.includes('essential')) expectedTier = 'essential';
    }

    // Validate: if plan config was found but tier doesn't match plan name, override it
    // This catches cases where old plan ID maps to wrong config (e.g., Legacy Gold ID → Starter config)
    if (planConfig && expectedTier && planConfig.tier !== expectedTier) {
      console.log('[getCurrentSubscription] Plan ID/name mismatch detected:', {
        clerkPlanId: business.clerk_plan_id,
        clerkPlanName: business.clerk_plan_name,
        foundConfigTier: planConfig.tier,
        expectedTier,
        overriding: true
      });
      // Clear the mismatched config so we use name-based lookup instead
      planConfig = null;
    }

    // Fallback: if plan ID not found OR mismatched, try to match by plan name
    if (!planConfig && business.clerk_plan_name) {
      const planDetails = getPlanDetails();

      // Find plan config by matching tier or exact name
      for (const [id, config] of Object.entries(planDetails)) {
        // Priority 1: Exact tier match
        if (expectedTier && config.tier === expectedTier) {
          planConfig = config;
          console.log('[getCurrentSubscription] Found plan config by tier match:', {
            planName: business.clerk_plan_name,
            expectedTier,
            matchedConfig: config.name,
            limits: config.limits
          });
          break;
        }
      }
    }

    console.log('[getCurrentSubscription] Plan config lookup:', {
      clerkPlanId: business.clerk_plan_id,
      clerkPlanName: business.clerk_plan_name,
      planConfig: planConfig ? { name: planConfig.name, limits: planConfig.limits } : null,
      businessLimits: {
        locations: business.max_locations_limit,
        promotions: business.max_active_promotions_limit,
        events: business.max_active_events_limit,
      }
    });

    // Use plan config as source of truth for limits
    // Priority: 1) Admin override (999), 2) Plan config, 3) Defaults
    // This ensures limits are always correct even if webhook didn't sync properly
    const limits = {
      maxLocations: hasUnlimitedAccess ? 999 :
        (planConfig?.limits.maxLocations ?? business.max_locations_limit ?? 1),
      maxPromotions: hasUnlimitedAccess ? 999 :
        (planConfig?.limits.maxActivePromotions ?? business.max_active_promotions_limit ?? 0),
      maxEvents: hasUnlimitedAccess ? 999 :
        (planConfig?.limits.maxActiveEvents ?? business.max_active_events_limit ?? 0),
    };
    
    // Determine tier from plan name
    const planName = (business.clerk_plan_name || '').toLowerCase();
    let tier = 'none';
    if (planName.includes('bronze')) tier = 'bronze';
    else if (planName.includes('legacy') && planName.includes('gold') && planName.includes('plus')) tier = 'legacy_gold_plus'; // Grandfathered plan
    else if (planName.includes('legacy') && planName.includes('gold')) tier = 'legacy_gold'; // Grandfathered plan
    else if (planName.includes('gold')) tier = 'gold';
    else if (planName.includes('diamond')) tier = 'diamond';

    // Check for no_access feature from Clerk (user signed up but hasn't selected a plan)
    // This is stored in unsafeMetadata by Clerk when user has the 'no_access' feature
    const metadata = identity.unsafeMetadata as { features?: string[] } | undefined;
    const hasNoAccessFeature = metadata?.features?.includes('no_access') || false;

    // Build subscription object from business record
    // CRITICAL: Only consider subscription active if BOTH ID and status are valid
    // AND it's not the free/trial plan (Clerk auto-creates these for all users)
    // AND it's not the buggy 'free' status (created before fix)
    // AND user doesn't have no_access feature
    // DEFENSIVE: Treat undefined/null status as 'no_access' (secure by default)
    const status = business.clerk_subscription_status || 'no_access';
    const isFreeTrialPlan = planName === 'trial' || planName === '' || planName.toLowerCase() === 'free';
    const isBuggyFreeStatus = status === 'free'; // Exclude buggy 'free' status
    const isNoAccess = status === 'no_access' || !business.clerk_subscription_status; // Defensive check

    // Admin override bypasses all subscription checks
    const hasValidSubscription = hasUnlimitedAccess || (
      !!business.clerk_subscription_id &&
      (status === 'active' || status === 'trialing') &&
      !isFreeTrialPlan && // Exclude free trial
      !isBuggyFreeStatus && // Exclude buggy 'free' status
      !hasNoAccessFeature && // Exclude users with no_access feature
      !isNoAccess // Exclude no_access status (defensive)
    );

    const subscription = {
      hasSubscription: hasValidSubscription,
      hasNoAccess: hasNoAccessFeature || isNoAccess, // Add flag to indicate no_access state
      status: hasNoAccessFeature || isNoAccess ? 'no_access' : status, // Override status if no_access
      plan: {
        id: business.clerk_plan_id,
        name: business.clerk_plan_name || 'Unavailable',
      },
      planId: business.clerk_plan_id,
      tier,
      limits,
      currentPeriodEnd: business.clerk_period_end || null,
      cancelAtPeriodEnd: false,
    };
    
    console.log('[getCurrentSubscription] Returning subscription data:', {
      userId: clerkUserId,
      businessId: business._id,
      clerk_subscription_id: business.clerk_subscription_id,
      clerk_subscription_status: business.clerk_subscription_status,
      clerk_plan_name: business.clerk_plan_name,
      isFreeTrialPlan,
      isBuggyFreeStatus,
      hasNoAccessFeature,
      hasValidSubscription,
      limits,
    });
    
    return subscription;
  },
});

// Check if user can access a feature based on subscription
export const checkFeatureAccess = query({
  args: {
    feature: v.union(
      v.literal('newsletter'),
      v.literal('multiple_locations'),
      v.literal('priority_support'),
      v.literal('featured_listings')
    ),
  },
  handler: async (ctx, { feature }) => {
    // Get the authenticated user directly instead of recursive call
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasAccess: false, reason: 'No active subscription', currentTier: 'none', requiredTier: 'bronze' };
    }
    
    const clerkUserId = identity.subject;
    
    // Get the business record from database
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    // Get subscription from business record
    const subscription = await clerkBillingService.getUserSubscription(business);
    const limits = clerkBillingService.getSubscriptionLimits(subscription.planId);
    const tier = clerkBillingService.mapPlanToTier(subscription.planId || '');
    
    if (!subscription.hasSubscription) {
      return { hasAccess: false, reason: 'No active subscription', currentTier: tier, requiredTier: getRequiredTierForFeature(feature) };
    }
    
    // Check feature access based on tier
    // Priority support and featured listings available for pro and business tiers
    const premiumTiers = ['pro', 'business', 'legacy_gold', 'legacy_gold_plus'];
    const featureAccess: Record<string, boolean> = {
      newsletter: tier !== 'none',
      multiple_locations: !limits.maxLocations || limits.maxLocations > 1, // undefined = unlimited
      priority_support: premiumTiers.includes(tier), // Pro and above have priority support
      featured_listings: premiumTiers.includes(tier), // Pro and above have featured listings
    };
    
    const hasAccess = featureAccess[feature] || false;
    
    return {
      hasAccess,
      reason: hasAccess ? 'Feature available' : 'Upgrade required',
      currentTier: tier,
      requiredTier: getRequiredTierForFeature(feature),
    };
  },
});

// Helper to determine required tier for a feature
function getRequiredTierForFeature(feature: string): string {
  const featureTiers = {
    newsletter: 'essential',
    multiple_locations: 'pro',
    priority_support: 'pro',
    featured_listings: 'pro',
  };
  return featureTiers[feature as keyof typeof featureTiers] || 'essential';
}

// Get subscription plans for display
export const getSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    // Get plan details from centralized configuration
    const planDetails = getPlanDetails();

    // Convert to array format expected by frontend
    return Object.values(planDetails).map((plan, index) => ({
      ...plan,
      highlighted: plan.tier === 'pro', // Pro is most popular
    }));
  },
});

// Get environment-specific plan IDs (dev vs production)
export const getEnvironmentPlanIds = query({
  args: {},
  handler: async (ctx) => {
    // Use centralized plan ID configuration
    const planIds = getEnvironmentPlanIdsHelper();
    const isProduction = process.env.CONVEX_CLOUD_URL?.includes('disciplined-sandpiper-478');

    return {
      isProduction,
      planIds,
    };
  },
});

// Create checkout URL (action because it's handled client-side)
export const createCheckoutUrl = action({
  args: {
    planId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, { planId, successUrl, cancelUrl }) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const clerkUserId = identity.subject;
    
    // Note: In production with Clerk Billing enabled,
    // checkout is initiated client-side using Clerk's SDK
    // This returns a placeholder - real checkout uses Clerk's client-side methods
    console.log(`[ClerkBilling] Checkout requested for plan: ${planId} by user: ${clerkUserId}`);
    
    // Return instruction for client-side checkout
    return { 
      url: null,
      message: "Use Clerk's client-side SDK to initiate checkout",
      planId,
    };
  },
});

// Create billing portal URL (action because it's handled client-side)
export const createBillingPortalUrl = action({
  args: {
    returnUrl: v.string(),
  },
  handler: async (ctx, { returnUrl }) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const clerkUserId = identity.subject;
    
    // Note: In production with Clerk Billing enabled,
    // billing portal is opened client-side using Clerk's SDK
    // This returns a placeholder - real portal uses Clerk's client-side methods
    console.log(`[ClerkBilling] Billing portal requested by user: ${clerkUserId}`);
    
    // Return instruction for client-side portal
    return { 
      url: null,
      message: "Use Clerk's client-side SDK to open billing portal",
    };
  },
});

// Public mutation to manually sync subscription from Clerk
// Safe because it only syncs the authenticated user's own subscription
export const manualSyncSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const clerkUserId = identity.subject;
    
    // Get the business
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Rate limiting: Check if synced recently (within last 30 seconds)
    const lastSyncTime = business.last_subscription_sync;
    if (lastSyncTime && Date.now() - lastSyncTime < 30000) {
      const waitTime = Math.ceil((30000 - (Date.now() - lastSyncTime)) / 1000);
      throw new Error(`Please wait ${waitTime} seconds before syncing again`);
    }
    
    console.log("[manualSyncSubscription] Syncing for user:", clerkUserId);
    
    // Fetch subscription data from Clerk API
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }
    
    const billingUrl = `https://api.clerk.com/v1/users/${clerkUserId}/billing/subscription`;
    const response = await fetch(billingUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${clerkApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[manualSyncSubscription] Clerk API error:", response.status, errorText);
      throw new Error(`Failed to fetch subscription: ${response.status}`);
    }
    
    const billingData = await response.json();
    const subscription = billingData.subscription_items?.[0];
    const plan = subscription?.plan;
    const features = plan?.features || [];
    
    // Parse features to extract limits
    let maxLocations = 1;
    let maxActivePromotions = 0;
    let maxActiveEvents = 0;
    let maxDraftPromotions = 1;
    let maxDraftEvents = 1;
    
    for (const feature of features) {
      const slug = feature.slug;
      const match = slug.match(/max_(\w+)_(\d+)/);
      if (match) {
        const [_, type, value] = match;
        const limit = parseInt(value, 10);
        
        if (slug.includes('max_locations_')) {
          maxLocations = limit;
        } else if (slug.includes('max_active_promotions_')) {
          maxActivePromotions = limit;
        } else if (slug.includes('max_active_events_')) {
          maxActiveEvents = limit;
        } else if (slug.includes('max_draft_promotions_')) {
          maxDraftPromotions = limit;
        } else if (slug.includes('max_draft_events_')) {
          maxDraftEvents = limit;
        }
      }
    }
    
    // Update business with subscription data
    await ctx.db.patch(business._id, {
      clerk_subscription_id: billingData.id,
      clerk_subscription_status: billingData.status,
      clerk_plan_id: plan?.id,
      clerk_plan_name: plan?.name,
      max_locations_limit: maxLocations,
      max_active_promotions_limit: maxActivePromotions,
      max_active_events_limit: maxActiveEvents,
      max_draft_promotions_limit: maxDraftPromotions,
      max_draft_events_limit: maxDraftEvents,
      last_subscription_sync: Date.now(),
    });
    
    console.log("[manualSyncSubscription] Successfully updated:", {
      planName: plan?.name,
      status: billingData.status,
      limits: { maxLocations, maxActivePromotions, maxActiveEvents, maxDraftPromotions, maxDraftEvents }
    });
    
    return {
      success: true,
      plan: plan?.name,
      status: billingData.status,
      limits: {
        locations: maxLocations,
        activePromotions: maxActivePromotions,
        activeEvents: maxActiveEvents,
        draftPromotions: maxDraftPromotions,
        draftEvents: maxDraftEvents,
      }
    };
  },
});

// Sync subscription status from Clerk to business record (legacy - keeping for compatibility)
export const syncSubscriptionStatus = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { businessId }) => {
    // Get the business
    const business = await ctx.db.get(businessId);
    if (!business || !business.clerk_user_id) {
      throw new Error("Business not found or not linked to Clerk user");
    }
    
    // Get subscription from Clerk
    const subscription = await clerkBillingService.getUserSubscription(business.clerk_user_id);

    // Update business record (only updating Clerk fields, not legacy fields)
    const updates = {
      // Legacy fields are deprecated - only update clerk_* fields and limits
      // subscription_plan: subscription.planId || undefined, // REMOVED: Deprecated
      // subscription_tier: clerkBillingService.mapPlanToTier(subscription.planId || ''), // REMOVED: Deprecated
      // subscription_status: subscription.status as any || 'none', // REMOVED: Deprecated
      // subscription_current_period_end: subscription.currentPeriodEnd || undefined, // REMOVED: Deprecated
      // subscription_updated_at: Date.now(), // REMOVED: Deprecated
      last_subscription_sync: Date.now(), // Use this instead of subscription_updated_at
    };

    await ctx.db.patch(businessId, updates);

    return { success: true, subscription };
  },
});

// Check if business has reached location limit
export const checkLocationLimit = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { businessId }) => {
    // Get business
    const business = await ctx.db.get(businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Get subscription limits directly
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        currentLocations: 0,
        maxLocations: 1,
        canAddMore: true,
        remainingSlots: 1,
        requiresUpgrade: false,
      };
    }
    
    const clerkUserId = identity.subject;
    
    // Get the business record from database
    const businessRecord = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    const subscription = await clerkBillingService.getUserSubscription(businessRecord);
    const limits = clerkBillingService.getSubscriptionLimits(subscription.planId);
    const maxLocations = limits.maxLocations;
    
    // Count current locations
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", businessId))
      .collect();
    
    const currentLocations = locations.filter(l => l.is_active).length;
    
    return {
      currentLocations,
      maxLocations,
      canAddMore: !maxLocations || currentLocations < maxLocations, // undefined = unlimited
      remainingSlots: maxLocations ? Math.max(0, maxLocations - currentLocations) : 999,
      requiresUpgrade: maxLocations ? currentLocations >= maxLocations : false,
    };
  },
});

// Check if business has reached promotion limit
export const checkPromotionLimit = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { businessId }) => {
    // Get subscription limits directly
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        currentPromotions: 0,
        maxPromotions: 5,
        canAddMore: true,
        remainingSlots: 5,
        requiresUpgrade: false,
      };
    }
    
    const clerkUserId = identity.subject;
    
    // Get the business record from database
    const businessRecord = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    const subscription = await clerkBillingService.getUserSubscription(businessRecord);
    const limits = clerkBillingService.getSubscriptionLimits(subscription.planId);
    const maxPromotions = limits.maxActivePromotions;
    
    // Count active promotions
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", (q) => q.eq("business_id", businessId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    const currentPromotions = promotions.length;
    
    return {
      currentPromotions,
      maxPromotions,
      canAddMore: !maxPromotions || currentPromotions < maxPromotions, // undefined = unlimited
      remainingSlots: maxPromotions ? Math.max(0, maxPromotions - currentPromotions) : 999,
      requiresUpgrade: maxPromotions ? currentPromotions >= maxPromotions : false,
    };
  },
});

/**
 * Internal mutation for webhook updates with retry logic
 * Handles race conditions with exponential backoff
 */
export const syncSubscriptionWithRetry = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerk_subscription_id: v.optional(v.string()),
    clerk_plan_id: v.optional(v.string()),
    clerk_plan_name: v.optional(v.string()),
    clerk_subscription_status: v.optional(v.string()),
    clerk_period_end: v.optional(v.number()),
    // Subscription limits from Clerk (null = unlimited, undefined = not provided)
    max_locations_limit: v.optional(v.union(v.number(), v.null())),
    max_active_promotions_limit: v.optional(v.union(v.number(), v.null())),
    max_active_events_limit: v.optional(v.union(v.number(), v.null())),
    max_draft_promotions_limit: v.optional(v.union(v.number(), v.null())),
    max_draft_events_limit: v.optional(v.union(v.number(), v.null())),
    max_promotion_duration_days: v.optional(v.union(v.number(), v.null())),
    // Retry control
    retryCount: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const retryCount = args.retryCount || 0;
    const maxRetries = args.maxRetries || 3;
    
    console.log(`[ClerkBilling] Sync attempt ${retryCount + 1} for user:`, args.clerkUserId);
    
    try {
      // Find business by Clerk user ID
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
        .first();
      
      if (!business) {
        console.error("[ClerkBilling] No business found for Clerk user:", args.clerkUserId);
        throw new Error(`No business found for Clerk user: ${args.clerkUserId}`);
      }
      
      // Always proceed with update to ensure consistency
      // The retry logic will handle race conditions if documents change
      
      // Build update object with only defined values
      const updates: any = { 
        updated_at: Date.now(),
        last_subscription_sync: Date.now() 
      };
      
      if (args.clerk_subscription_id !== undefined) updates.clerk_subscription_id = args.clerk_subscription_id;
      if (args.clerk_plan_id !== undefined) updates.clerk_plan_id = args.clerk_plan_id;
      if (args.clerk_plan_name !== undefined) updates.clerk_plan_name = args.clerk_plan_name;
      if (args.clerk_subscription_status !== undefined) updates.clerk_subscription_status = args.clerk_subscription_status;
      if (args.clerk_period_end !== undefined) updates.clerk_period_end = args.clerk_period_end;
      
      // Update limits if provided
      if (args.max_locations_limit !== undefined) updates.max_locations_limit = args.max_locations_limit;
      if (args.max_active_promotions_limit !== undefined) updates.max_active_promotions_limit = args.max_active_promotions_limit;
      if (args.max_active_events_limit !== undefined) updates.max_active_events_limit = args.max_active_events_limit;
      if (args.max_draft_promotions_limit !== undefined) updates.max_draft_promotions_limit = args.max_draft_promotions_limit;
      if (args.max_draft_events_limit !== undefined) updates.max_draft_events_limit = args.max_draft_events_limit;
      if (args.max_promotion_duration_days !== undefined) updates.max_promotion_duration_days = args.max_promotion_duration_days;

      // Default limits for free/cancelled subscriptions
      if (args.clerk_subscription_status && args.clerk_subscription_status !== 'active') {
        if (args.max_locations_limit === undefined) updates.max_locations_limit = 1;
        if (args.max_active_promotions_limit === undefined) updates.max_active_promotions_limit = 0;
        if (args.max_active_events_limit === undefined) updates.max_active_events_limit = 0;
        if (args.max_draft_promotions_limit === undefined) updates.max_draft_promotions_limit = 1;
        if (args.max_draft_events_limit === undefined) updates.max_draft_events_limit = 1;
      }
      
      // Attempt to update with optimistic concurrency control
      await ctx.db.patch(business._id, updates);
      
      console.log("[ClerkBilling] Successfully synced subscription for business:", business._id);
      return { success: true, businessId: business._id, retries: retryCount };
      
    } catch (error: any) {
      // Handle race condition errors
      if (error.message?.includes("changed while this mutation was being run")) {
        if (retryCount < maxRetries) {
          // Calculate exponential backoff delay: 100ms, 500ms, 1500ms
          const delay = Math.min(100 * Math.pow(3, retryCount), 1500);
          
          console.log(`[ClerkBilling] Race condition detected, retrying in ${delay}ms...`);
          
          // Schedule retry with exponential backoff
          await ctx.scheduler.runAfter(delay, internal.clerkBilling.syncSubscriptionWithRetry, {
            ...args,
            retryCount: retryCount + 1,
            maxRetries
          });
          
          return { success: false, businessId: null, retry: true, retryCount };
        } else {
          console.error(`[ClerkBilling] Max retries (${maxRetries}) exceeded for user:`, args.clerkUserId);
          // Don't throw - just log the error since the data will eventually be consistent
          return { success: false, businessId: null, maxRetriesExceeded: true };
        }
      }
      
      // Re-throw non-race-condition errors
      throw error;
    }
  },
});

/**
 * Internal mutation for webhook updates (legacy - redirects to retry version)
 */
export const updateBusinessSubscriptionInternal = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerk_subscription_id: v.optional(v.string()),
    clerk_plan_id: v.optional(v.string()),
    clerk_plan_name: v.optional(v.string()),
    clerk_subscription_status: v.optional(v.string()),
    clerk_period_end: v.optional(v.number()),
    // Subscription limits from Clerk (null = unlimited, undefined = not provided)
    max_locations_limit: v.optional(v.union(v.number(), v.null())),
    max_active_promotions_limit: v.optional(v.union(v.number(), v.null())),
    max_active_events_limit: v.optional(v.union(v.number(), v.null())),
    max_draft_promotions_limit: v.optional(v.union(v.number(), v.null())),
    max_draft_events_limit: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    console.log("[ClerkBilling] Legacy mutation redirecting to retry version for user:", args.clerkUserId);
    
    // Schedule the new retry version to avoid circular reference
    await ctx.scheduler.runAfter(0, internal.clerkBilling.syncSubscriptionWithRetry, {
      ...args,
      retryCount: 0,
      maxRetries: 3
    });
    
    return { success: true, scheduled: true };
  },
});

// Public mutation removed - use internal mutation via webhook handlers only

/**
 * Internal mutation to clear business subscription (for cancellations)
 */
export const clearBusinessSubscriptionInternal = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[ClerkBilling] Internal: Clearing subscription for user:", args.clerkUserId);
    
    // Find business by Clerk user ID
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();
    
    if (!business) {
      console.error("[ClerkBilling] Internal: No business found for Clerk user:", args.clerkUserId);
      throw new Error(`No business found for Clerk user: ${args.clerkUserId}`);
    }
    
    // Clear Clerk subscription data and reset to free tier limits
    await ctx.db.patch(business._id, {
      clerk_subscription_id: undefined,
      clerk_plan_id: undefined,
      clerk_plan_name: undefined,
      clerk_subscription_status: undefined,
      clerk_period_end: undefined,
      // Reset to free tier limits
      max_locations_limit: 1,
      max_active_promotions_limit: 0,
      max_active_events_limit: 0,
      max_draft_promotions_limit: 1,
      max_draft_events_limit: 1,
      updated_at: Date.now(),
    } as any);
    
    console.log("[ClerkBilling] Internal: Successfully cleared subscription for business:", business._id);
    return { success: true, businessId: business._id };
  },
});

// Public mutation removed - use internal mutation via webhook handlers only