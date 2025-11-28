/**
 * Business User Authentication Functions
 * 
 * These functions handle authentication for business platform users
 * who create and manage deals. Mobile users should use authMobile.ts instead.
 */

import { action, query, internalQuery, internalMutation } from "./_generated/server";
import { getAuthenticatedBusiness, requireAuth } from "./lib/authHelpers";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { internalSafe } from "./lib/apiHelpers";
import { api, internal } from "./_generated/api";

/**
 * Internal mutation to create a business for a Clerk user
 */
export const createBusinessForUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()), // Optional for OAuth users
    name: v.optional(v.string()), // Optional - user sets during onboarding
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if business already exists for this Clerk user
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();

    if (existingBusiness) {
      console.log("[authClerk.createBusinessForUser] Business already exists for Clerk user:", args.clerkUserId);

      // Check if it has a primary location
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", existingBusiness._id))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();

      // If no primary location exists, create one (for businesses created before this fix)
      if (!primaryLocation) {
        console.log("[authClerk.createBusinessForUser] Creating missing primary location for existing business:", existingBusiness._id);
        await ctx.db.insert("business_locations", {
          business_id: existingBusiness._id,
          is_primary: true,
          is_active: true,
          name: "",
          profile_name: "",
          phone: "",
          category: "",
          description: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          service_zip: "",
          service_radius: 0,
          website: "",
          business_hours: null,
          logo_url: "",
          instagram_url: "",
          facebook_url: "",
          tiktok_url: "",
          linkedin_url: "",
          twitter_url: "",
          pinterest_url: "",
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }

      return existingBusiness._id;
    }
    
    // Create new business (email and name are optional)
    // Set no_access subscription by default until user completes checkout
    const businessData: any = {
      clerk_user_id: args.clerkUserId,
      first_name: args.firstName || '',
      last_name: args.lastName || '',
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now(),

      // Set no_access subscription by default to block dashboard access
      clerk_subscription_status: 'no_access',
      clerk_plan_name: 'No Access',
      max_locations_limit: 0,
      max_active_promotions_limit: 0,
      max_active_events_limit: 0,
      max_draft_promotions_limit: 0,
      max_draft_events_limit: 0,

      onboarding_completed_at: undefined,
    };
    
    // Only add name if provided and not empty
    if (args.name && args.name.trim()) {
      businessData.name = args.name;
    }
    
    // Only add email if provided
    if (args.email) {
      businessData.email = args.email;
    }

    const businessId = await ctx.db.insert("businesses", businessData);

    // Create empty primary location for the new business
    // User will fill in details during onboarding
    await ctx.db.insert("business_locations", {
      business_id: businessId,
      is_primary: true,
      is_active: true,
      name: "",
      profile_name: "",
      phone: "",
      category: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      service_zip: "",
      service_radius: 0,
      website: "",
      business_hours: null,
      logo_url: "",
      instagram_url: "",
      facebook_url: "",
      tiktok_url: "",
      linkedin_url: "",
      twitter_url: "",
      pinterest_url: "",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log("[authClerk.createBusinessForUser] Created new business and primary location:", businessId);

    return businessId;
  },
});

// getOrCreateBusiness action removed - businesses are now created via webhook on user.created event

/**
 * Query to get the current authenticated business (read-only)
 * This does NOT create a business if one doesn't exist
 */
export const getCurrentBusinessQuery = query({
  args: {},
  handler: async (ctx) => {
    console.log("[authClerk.getCurrentBusinessQuery] Starting authentication check...");
    
    try {
      // Get Clerk identity to check authentication status
      const identity = await ctx.auth.getUserIdentity();
      console.log("[authClerk.getCurrentBusinessQuery] Clerk identity:", {
        hasIdentity: !!identity,
        subject: identity?.subject,
        email: identity?.email,
        name: identity?.name,
        emailVerified: identity?.emailVerified,
        tokenIdentifier: identity?.tokenIdentifier?.substring(0, 20) + '...'
      });
      
      // If no identity, user is not authenticated
      if (!identity) {
        console.log("[authClerk.getCurrentBusinessQuery] No identity found - user not authenticated");
        return null;
      }
      
      // This will use the Clerk user ID from the JWT token
      const business = await getAuthenticatedBusiness(ctx);
      console.log("[authClerk.getCurrentBusinessQuery] Business found:", {
        businessId: business._id,
        businessName: business.name,
        email: business.email,
        clerkUserId: business.clerk_user_id,
        subscriptionPlan: business.subscription_plan,
        subscriptionStatus: business.subscription_status
      });
      
      // Return the business with primary location data merged
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();
      
      console.log("[authClerk.getCurrentBusinessQuery] Primary location found:", !!primaryLocation);
      
      // Merge business with location data for backward compatibility
      const mergedBusiness = {
        ...business,
        // Ensure name comes from businesses table
        name: business.name || primaryLocation?.profile_name || "",
        // Include location data for components that need it
        address: primaryLocation?.address || "",
        city: primaryLocation?.city || "",
        state: primaryLocation?.state || "",
        zip: primaryLocation?.zip || "",
      };
      
      console.log("[authClerk.getCurrentBusinessQuery] Returning merged business with name:", mergedBusiness.name);
      
      return mergedBusiness;
    } catch (error) {
      // User is not authenticated or has no business
      console.error("[authClerk.getCurrentBusinessQuery] Authentication failed:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  },
});

/**
 * Lightweight query to check onboarding status
 * Returns minimal data to determine if onboarding is complete
 * Use this instead of getCurrentBusinessQuery when you only need status
 */
export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    console.log("[authClerk.getOnboardingStatus] Checking onboarding status...");

    try {
      // Get Clerk identity to check authentication status
      const identity = await ctx.auth.getUserIdentity();

      // If no identity, user is not authenticated
      if (!identity) {
        console.log("[authClerk.getOnboardingStatus] No identity - not authenticated");
        return {
          isAuthenticated: false,
          isComplete: false,
          currentStep: 'login',
        };
      }

      // Find business for this Clerk user
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", identity.subject))
        .first();

      // If no business exists, user needs to start onboarding
      if (!business) {
        console.log("[authClerk.getOnboardingStatus] No business found - needs onboarding");
        return {
          isAuthenticated: true,
          isComplete: false,
          currentStep: 'business_info',
        };
      }

      // Check if onboarding is complete
      const isComplete = !!business.onboarding_completed_at;

      console.log("[authClerk.getOnboardingStatus] Business found:", {
        businessId: business._id,
        isComplete,
        hasName: !!business.name,
        hasCompletedAt: !!business.onboarding_completed_at,
      });

      return {
        isAuthenticated: true,
        isComplete,
        currentStep: isComplete ? 'complete' : 'business_info',
        businessId: business._id,
        hasName: !!business.name,
      };
    } catch (error) {
      console.error("[authClerk.getOnboardingStatus] Error:", {
        error: error instanceof Error ? error.message : error,
      });

      return {
        isAuthenticated: false,
        isComplete: false,
        currentStep: 'error',
      };
    }
  },
});

/**
 * Internal query for getting business without circular reference
 */
export const getCurrentBusinessInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    try {
      const business = await getAuthenticatedBusiness(ctx);
      return business;
    } catch (error) {
      return null;
    }
  },
});

/**
 * Sync subscription data from Clerk on login
 * This ensures the business has the latest subscription info
 */
export const syncSubscriptionOnLogin = action({
  args: {},
  handler: async (ctx) => {
    console.log("[authClerk.syncSubscriptionOnLogin] Starting subscription sync...");
    
    try {
      // Get the current user's identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("[authClerk.syncSubscriptionOnLogin] No authenticated user");
        return { success: false, message: "Not authenticated" };
      }
      
      const clerkUserId = identity.subject;
      console.log("[authClerk.syncSubscriptionOnLogin] Checking for business:", clerkUserId);
      
      // Query the business directly by clerk user ID
      const business = await ctx.runQuery(internalSafe.businesses.getBusinessByClerkUserId, {
        clerkUserId
      });
      
      if (!business) {
        console.log("[authClerk.syncSubscriptionOnLogin] No business found for user:", clerkUserId);
        return { success: false, message: "No business found" };
      }
      
      console.log("[authClerk.syncSubscriptionOnLogin] Found business:", business._id);
      
      // Always sync on login to ensure we have the latest subscription data
      // This is important for when users upgrade/downgrade their plans
      console.log("[authClerk.syncSubscriptionOnLogin] Syncing subscription data on login...");
      
      console.log("[authClerk.syncSubscriptionOnLogin] Fetching latest subscription from Clerk Billing API...");
      
      // Fetch subscription data from Clerk API
      const clerkApiKey = process.env.CLERK_SECRET_KEY;
      if (!clerkApiKey) {
        console.error("[authClerk.syncSubscriptionOnLogin] CLERK_SECRET_KEY not found");
        return { success: false, message: "Clerk API key not configured" };
      }
      
      try {
        // Fetch subscription data from Clerk Billing API
        const billingUrl = `https://api.clerk.com/v1/users/${clerkUserId}/billing/subscription`;
        console.log("[authClerk.syncSubscriptionOnLogin] Fetching from:", billingUrl);
        
        const response = await fetch(billingUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${clerkApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[authClerk.syncSubscriptionOnLogin] Clerk Billing API error:", response.status, errorText);
          throw new Error(`Clerk Billing API returned ${response.status}: ${errorText}`);
        }
        
        const billingData = await response.json();
        console.log("[authClerk.syncSubscriptionOnLogin] Clerk billing data:", {
          id: billingData.id,
          status: billingData.status,
          plan: billingData.subscription_items?.[0]?.plan?.name,
          features: billingData.subscription_items?.[0]?.plan?.features?.map((f: any) => f.slug)
        });
        
        // Parse billing data to extract subscription info and features
        const subscription = billingData.subscription_items?.[0];
        const plan = subscription?.plan;
        const features = plan?.features || [];
        
        // Helper to extract limit from feature slug (e.g., "max_locations_1" -> 1)
        const extractLimitFromSlug = (slug: string): number | undefined => {
          const match = slug.match(/max_\w+_(\d+)/);
          if (match && match[1]) {
            return parseInt(match[1], 10);
          }
          return undefined;
        };
        
        // Parse features array to extract limits
        let maxLocations = 1;
        let maxActivePromotions = 0;
        let maxActiveEvents = 0;
        let maxDraftPromotions = 1;
        let maxDraftEvents = 1;
        
        console.log("[authClerk.syncSubscriptionOnLogin] Raw features from Clerk:", features);
        
        for (const feature of features) {
          const slug = feature.slug;
          const limit = extractLimitFromSlug(slug);
          
          console.log(`[authClerk.syncSubscriptionOnLogin] Processing: slug="${slug}", extracted limit=${limit}`);
          
          if (slug.includes('max_locations_') && limit !== undefined) {
            maxLocations = limit;
            console.log(`[authClerk.syncSubscriptionOnLogin] Set maxLocations to ${limit}`);
          } else if (slug.includes('max_active_promotions_') && limit !== undefined) {
            maxActivePromotions = limit;
          } else if (slug.includes('max_active_events_') && limit !== undefined) {
            maxActiveEvents = limit;
          } else if (slug.includes('max_draft_promotions_') && limit !== undefined) {
            maxDraftPromotions = limit;
          } else if (slug.includes('max_draft_events_') && limit !== undefined) {
            maxDraftEvents = limit;
          }
        }
        
        // Extract subscription status and plan info
        const subscriptionStatus = billingData.status || 'free';
        const subscriptionId = billingData.id;
        const planId = plan?.id;
        const planName = plan?.name || 'Free';
        const planSlug = plan?.slug;
        
        console.log("[authClerk.syncSubscriptionOnLogin] Extracted subscription data:", {
          status: subscriptionStatus,
          subscriptionId,
          planId,
          planName,
          planSlug,
          limits: { maxLocations, maxActivePromotions, maxActiveEvents, maxDraftPromotions, maxDraftEvents }
        });
        
        // Update business with subscription data using new retry mutation
        // We need to use the legacy mutation which will redirect to the retry version
        await ctx.runMutation(internalSafe.clerkBilling.updateBusinessSubscriptionInternal, {
          clerkUserId,
          clerk_subscription_id: subscriptionId,
          clerk_subscription_status: subscriptionStatus,
          clerk_plan_id: planId,
          clerk_plan_name: planName,
          max_locations_limit: maxLocations,
          max_active_promotions_limit: maxActivePromotions,
          max_active_events_limit: maxActiveEvents,
          max_draft_promotions_limit: maxDraftPromotions,
          max_draft_events_limit: maxDraftEvents,
        });
        
        console.log("[authClerk.syncSubscriptionOnLogin] Successfully scheduled subscription sync");
        return { success: true, message: `Syncing ${planName} plan data` };
        
      } catch (clerkError: any) {
        console.error("[authClerk.syncSubscriptionOnLogin] Clerk Billing API error:", clerkError);
        
        // If billing API fails, set no_access status to require checkout
        if (clerkError.message?.includes('404') || clerkError.message?.includes('Not Found')) {
          console.log("[authClerk.syncSubscriptionOnLogin] No billing subscription found, setting no_access status");
        } else {
          console.warn("[authClerk.syncSubscriptionOnLogin] Unexpected error, setting no_access status");
        }

        await ctx.runMutation(internalSafe.clerkBilling.updateBusinessSubscriptionInternal, {
          clerkUserId,
          clerk_subscription_status: 'no_access',
          clerk_plan_name: 'No Access',
          max_locations_limit: 0,
          max_active_promotions_limit: 0,
          max_active_events_limit: 0,
          max_draft_promotions_limit: 0,
          max_draft_events_limit: 0,
        });

        return { success: true, message: "Set no_access status - user must select a plan" };
      }
      
    } catch (error) {
      console.error("[authClerk.syncSubscriptionOnLogin] Error:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Deprecated getCurrentBusiness alias removed - use getCurrentBusinessQuery directly