/**
 * Authentication helper functions for secure business operations
 * Uses Clerk authentication via ConvexProviderWithClerk integration
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

type AuthenticatedCtx = QueryCtx | MutationCtx;

/**
 * Determines the user type based on the JWT token issuer domain
 */
export async function getUserType(ctx: AuthenticatedCtx): Promise<"mobile" | "business" | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // The tokenIdentifier contains the issuer domain
  // Format: "https://domain.clerk.accounts.dev|user_id"
  const tokenIdentifier = identity.tokenIdentifier;

  // Extract the domain from the token identifier
  if (!tokenIdentifier) {
    console.warn("[getUserType] No tokenIdentifier found");
    return null;
  }

  // Enhanced logging to debug mobile authentication issues
  console.log("[getUserType] Full tokenIdentifier:", tokenIdentifier);
  console.log("[getUserType] Email:", identity.email);
  console.log("[getUserType] Subject:", identity.subject);

  // Check if this is a mobile user (from various Clerk mobile domains)
  if (tokenIdentifier.includes("clerk.jaxsaver.app") ||
      tokenIdentifier.includes("jaxsaver.app") ||
      tokenIdentifier.includes("uncommon-wombat-29.clerk.accounts.dev")) {
    console.log("[getUserType] Detected as MOBILE user");
    return "mobile";
  }

  // Check if this is a business user (from up-kit-64 or clerk.business.jaxsaver.com)
  if (tokenIdentifier.includes("up-kit-64.clerk.accounts.dev") ||
      tokenIdentifier.includes("clerk.business.jaxsaver.com")) {
    console.log("[getUserType] Detected as BUSINESS user");
    return "business";
  }

  // Only log when we encounter an unknown token issuer
  console.warn("[getUserType] Unknown token issuer domain:", tokenIdentifier);
  console.warn("[getUserType] Full identity object:", JSON.stringify(identity, null, 2));
  return null;
}

/**
 * Get the currently authenticated Clerk user ID from context
 * @throws ConvexError if not authenticated
 */
export async function requireAuth(ctx: AuthenticatedCtx): Promise<string> {
  // ConvexProviderWithClerk sets the user identity in ctx.auth
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    console.error("[authHelpers.requireAuth] Authentication failed - no identity found");
    throw new ConvexError("Authentication required");
  }

  // The subject field contains the Clerk user ID
  return identity.subject;
}

/**
 * Get the currently authenticated user
 * Note: With Clerk, we don't have a users table entry by default
 * This function returns the Clerk user identity with userType
 */
export async function getAuthenticatedUser(ctx: AuthenticatedCtx): Promise<any> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }
  
  // Add userType to the identity
  const userType = await getUserType(ctx);
  
  // Return the Clerk user identity with userType
  // Contains: subject (user ID), email, name, userType, etc.
  return { ...identity, userType };
}

/**
 * Get the business associated with the authenticated user
 * @throws ConvexError if not authenticated, not a business user, or business not found
 */
export async function getAuthenticatedBusiness(ctx: AuthenticatedCtx): Promise<Doc<"businesses">> {
  // First check if this is a business user
  const userType = await getUserType(ctx);
  if (userType !== "business") {
    console.error("[authHelpers.getAuthenticatedBusiness] Not a business user, userType:", userType);
    throw new ConvexError("This operation requires business authentication");
  }
  
  const clerkUserId = await requireAuth(ctx);
  const identity = await ctx.auth.getUserIdentity();

  // Find business linked to this Clerk user
  const business = await ctx.db
    .query("businesses")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
    .first();
  
  if (!business && identity?.email) {
    // Fallback: try to find by email match (for migration period)
    const businessByEmail = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (businessByEmail) {
      // Auto-link for migration (only in mutations)
      if ('patch' in ctx.db) {
        await ctx.db.patch(businessByEmail._id, { clerk_user_id: clerkUserId });
        console.log(`[MIGRATION] Linked business ${businessByEmail._id} to Clerk user`);
      }
      return businessByEmail;
    }

    console.error("[authHelpers] No business found for authenticated user");
    throw new ConvexError("No business associated with this account");
  }

  if (!business) {
    console.error("[authHelpers] No business found for Clerk user:", clerkUserId);
    throw new ConvexError("No business associated with this account");
  }

  return business;
}

/**
 * Require that the current user owns the specified business
 * @throws ConvexError if not authenticated or doesn't own the business
 */
export async function requireBusinessOwnership(
  ctx: AuthenticatedCtx,
  businessId: Id<"businesses">
): Promise<Doc<"businesses">> {
  const clerkUserId = await requireAuth(ctx);
  const business = await ctx.db.get(businessId);
  
  if (!business) {
    throw new ConvexError("Business not found");
  }
  
  // Check if Clerk user owns this business
  if (business.clerk_user_id !== clerkUserId) {
    throw new ConvexError("You don't have permission to access this business");
  }
  
  return business;
}

/**
 * Require that the business has an active subscription
 * @throws ConvexError if subscription is not active
 */
export async function requireActiveSubscription(
  ctx: AuthenticatedCtx,
  business: Doc<"businesses">
): Promise<void> {
  // Check Clerk subscription fields first, fallback to legacy fields
  const planId = business.clerk_plan_id || business.subscription_plan || "none";
  const status = business.clerk_subscription_status || business.subscription_status || "none";
  
  // Accept active, trialing, or past_due statuses as valid
  const validStatuses = ["active", "trialing", "past_due"];
  
  if (planId === "none" || planId === "" || !validStatuses.includes(status)) {
    throw new ConvexError({
      code: "SUBSCRIPTION_REQUIRED",
      message: "Active subscription required for this action",
      requiresUpgrade: true,
      currentPlan: planId,
      currentStatus: status
    });
  }
}

/**
 * Check if the authenticated user is an admin
 */
export async function isAdmin(ctx: AuthenticatedCtx): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser(ctx);
    return user.role === "admin" || user.role === "super_admin";
  } catch {
    return false;
  }
}

/**
 * Require admin privileges
 * @throws ConvexError if not an admin
 */
export async function requireAdmin(ctx: AuthenticatedCtx): Promise<Doc<"users">> {
  const user = await getAuthenticatedUser(ctx);
  
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new ConvexError("Admin privileges required");
  }
  
  return user;
}

/**
 * Get session information for audit logging
 */
export async function getSessionInfo(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  
  return {
    sessionId: identity?.tokenIdentifier || null, // Clerk session token identifier
    userId: identity?.subject || null, // Clerk user ID
    timestamp: Date.now()
  };
}

/**
 * Wrapper for mutations that require business authentication
 */
export async function withBusinessAuth<T>(
  ctx: MutationCtx,
  handler: (business: Doc<"businesses">) => Promise<T>
): Promise<T> {
  const business = await getAuthenticatedBusiness(ctx);
  await requireActiveSubscription(ctx, business);
  return handler(business);
}

/**
 * Check subscription limits for a specific feature
 */
export async function checkSubscriptionLimit(
  ctx: AuthenticatedCtx,
  business: Doc<"businesses">,
  feature: "promotions" | "events" | "locations"
): Promise<{ allowed: boolean; reason?: string; limit?: number; current?: number }> {
  const plan = await ctx.db
    .query("subscription_plans")
    .withIndex("by_plan_id", (q) => q.eq("plan_id", business.subscription_plan || "none"))
    .first();
  
  if (!plan) {
    return { allowed: false, reason: "No subscription plan found" };
  }
  
  // Check limits based on feature
  let limit: number | undefined;
  let current = 0;
  
  switch (feature) {
    case "promotions":
      limit = plan.max_promotions ?? -1;
      if (limit !== -1) {
        const promotions = await ctx.db
          .query("promotions")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        current = promotions.filter(p => p.status === "active").length;
      }
      break;
      
    case "events":
      limit = plan.max_events ?? -1;
      if (limit !== -1) {
        const events = await ctx.db
          .query("events")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        current = events.filter(e => e.status === "active").length;
      }
      break;
      
    case "locations":
      limit = plan.max_locations ?? -1;
      if (limit !== -1) {
        const locations = await ctx.db
          .query("business_locations")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        current = locations.filter(l => l.is_active).length;
      }
      break;
  }
  
  if (limit === -1) {
    return { allowed: true };
  }
  
  if (current >= limit) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} ${feature}`,
      limit,
      current
    };
  }
  
  return { allowed: true, limit, current };
}