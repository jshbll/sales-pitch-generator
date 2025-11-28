/**
 * Clerk Plans API - Exposes plan configuration to frontend
 * Last updated: 2025-01-08 - Fixed plan ID mapping
 */
import { query, internalAction, internalMutation, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { getAllPlanIds, PLAN_CONFIGS, getPlanTier, getPlanById, getEnvironmentPlanIds } from './constants/clerkPlans';

/**
 * Get Clerk plan IDs for frontend use
 * This allows the frontend to use plan IDs without hardcoding them
 */
export const getPlanIds = query({
  args: {},
  handler: async () => {
    return getAllPlanIds();
  },
});

/**
 * Fetch pricing from Clerk Backend API and cache in database
 * Uses GET /v1/commerce/plans to fetch all plans at once
 */
export const refreshPlanPricing = internalAction({
  args: {},
  handler: async (ctx) => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!clerkSecretKey) {
      console.error('[refreshPlanPricing] CLERK_SECRET_KEY not found in environment variables');
      throw new Error('CLERK_SECRET_KEY is required to fetch pricing from Clerk');
    }

    // Get our known plan IDs to match against
    const envPlanIds = getEnvironmentPlanIds();
    const knownPlanIds = new Set(Object.values(envPlanIds));
    const tierByPlanId = Object.entries(envPlanIds).reduce((acc, [tier, planId]) => {
      acc[planId] = tier;
      return acc;
    }, {} as Record<string, string>);

    const results = {
      success: [] as string[],
      errors: [] as { planId: string; error: string }[],
    };

    try {
      console.log('[refreshPlanPricing] Fetching all plans from /v1/commerce/plans');

      // Fetch all plans from Clerk Backend API
      const response = await fetch('https://api.clerk.com/v1/commerce/plans', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[refreshPlanPricing] Clerk API error:', response.status, errorText);
        throw new Error(`Clerk API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const plans = data.data || data || [];

      console.log(`[refreshPlanPricing] Received ${plans.length} plans from Clerk`);

      // Process each plan
      for (const planData of plans) {
        const planId = planData.id;

        // Only process plans we know about
        if (!knownPlanIds.has(planId)) {
          console.log(`[refreshPlanPricing] Skipping unknown plan: ${planId} (${planData.name})`);
          continue;
        }

        const tier = tierByPlanId[planId];

        try {
          console.log(`[refreshPlanPricing] Processing ${tier} plan: ${planId}`, JSON.stringify(planData, null, 2));

          // Extract pricing from Clerk's response
          // Based on BillingPlanResource structure: fee, annualFee, annualMonthlyFee
          const monthlyPriceCents = planData.fee?.amount || planData.amount || 0;
          const annualPriceCents = planData.annualFee?.amount || planData.annual_fee?.amount;
          const annualMonthlyEquivalent = planData.annualMonthlyFee?.amount || planData.annual_monthly_fee?.amount;
          const currency = planData.fee?.currency || planData.currency || 'usd';
          const hasTrial = planData.freeTrialEnabled || planData.free_trial_enabled || false;
          const trialDays = planData.freeTrialDays || planData.free_trial_days || null;
          const description = planData.description || null;
          const slug = planData.slug || null;

          // Extract features array
          const features = planData.features?.map((f: any) => ({
            id: f.id,
            name: f.name,
            slug: f.slug,
            description: f.description || undefined,
          })) || null;

          // Store in database via internal mutation
          await ctx.runMutation(internal.clerkPlans.upsertPlanPricing, {
            plan_id: planId,
            plan_name: planData.name || tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase(),
            slug: slug,
            description: description,
            monthly_price_cents: monthlyPriceCents,
            annual_price_cents: annualPriceCents || null,
            annual_monthly_equivalent_cents: annualMonthlyEquivalent || null,
            currency: currency,
            has_trial: hasTrial,
            trial_days: trialDays,
            features: features,
            last_updated: Date.now(),
          });

          results.success.push(tier);
          console.log(`[refreshPlanPricing] Successfully cached pricing for ${tier}: $${monthlyPriceCents / 100}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[refreshPlanPricing] Failed to process ${tier}:`, errorMessage);
          results.errors.push({ planId, error: errorMessage });
        }
      }

      // Check if any known plans were not found
      const foundPlanIds = new Set(results.success.map(tier => envPlanIds[tier as keyof typeof envPlanIds]));
      for (const [tier, planId] of Object.entries(envPlanIds)) {
        if (!foundPlanIds.has(planId) && !results.errors.some(e => e.planId === planId)) {
          console.warn(`[refreshPlanPricing] Plan not found in Clerk: ${tier} (${planId})`);
          results.errors.push({ planId, error: 'Plan not found in Clerk API response' });
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[refreshPlanPricing] Fatal error:', errorMessage);
      // Add error for all plans
      for (const [tier, planId] of Object.entries(envPlanIds)) {
        results.errors.push({ planId, error: errorMessage });
      }
    }

    console.log(`[refreshPlanPricing] Completed. Success: ${results.success.length}, Errors: ${results.errors.length}`);
    return results;
  },
});

/**
 * Internal mutation to upsert plan pricing in database
 */
export const upsertPlanPricing = internalMutation({
  args: {
    plan_id: v.string(),
    plan_name: v.string(),
    slug: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    monthly_price_cents: v.number(),
    annual_price_cents: v.union(v.number(), v.null()),
    annual_monthly_equivalent_cents: v.union(v.number(), v.null()),
    currency: v.string(),
    has_trial: v.boolean(),
    trial_days: v.union(v.number(), v.null()),
    features: v.optional(v.union(v.array(v.object({
      id: v.string(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
    })), v.null())),
    last_updated: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if pricing already exists for this plan
    const existing = await ctx.db
      .query('clerk_plan_pricing')
      .withIndex('by_plan_id', (q) => q.eq('plan_id', args.plan_id))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        plan_name: args.plan_name,
        slug: args.slug ?? undefined,
        description: args.description ?? undefined,
        monthly_price_cents: args.monthly_price_cents,
        annual_price_cents: args.annual_price_cents ?? undefined,
        annual_monthly_equivalent_cents: args.annual_monthly_equivalent_cents ?? undefined,
        currency: args.currency,
        has_trial: args.has_trial,
        trial_days: args.trial_days ?? undefined,
        features: args.features ?? undefined,
        last_updated: args.last_updated,
      });
      console.log(`[upsertPlanPricing] Updated pricing for ${args.plan_name}`);
    } else {
      // Insert new record
      await ctx.db.insert('clerk_plan_pricing', {
        plan_id: args.plan_id,
        plan_name: args.plan_name,
        slug: args.slug ?? undefined,
        description: args.description ?? undefined,
        monthly_price_cents: args.monthly_price_cents,
        annual_price_cents: args.annual_price_cents ?? undefined,
        annual_monthly_equivalent_cents: args.annual_monthly_equivalent_cents ?? undefined,
        currency: args.currency,
        has_trial: args.has_trial,
        trial_days: args.trial_days ?? undefined,
        features: args.features ?? undefined,
        last_updated: args.last_updated,
      });
      console.log(`[upsertPlanPricing] Inserted new pricing for ${args.plan_name}`);
    }
  },
});

/**
 * Get plan details for frontend pricing display
 * Reads from cached Clerk pricing table first, falls back to constants if empty
 */
export const getPlans = query({
  args: {},
  handler: async (ctx) => {
    // Use environment-specific plan IDs for all four tiers
    const envPlanIds = getEnvironmentPlanIds();
    const planIds = [envPlanIds.essential, envPlanIds.starter, envPlanIds.pro, envPlanIds.business];

    // Fetch cached pricing from Clerk API (if available)
    const cachedPricing = await Promise.all(
      planIds.map(planId =>
        ctx.db.query('clerk_plan_pricing').withIndex('by_plan_id', (q) => q.eq('plan_id', planId)).first()
      )
    );

    const [essentialCache, starterCache, proCache, businessCache] = cachedPricing;

    // Helper to merge Clerk pricing with fallback details
    const mergePlanData = (planId: string, cachedData: any, fallbackData: any) => {
      if (cachedData) {
        // Use cached pricing from Clerk Backend API
        console.log(`[getPlans] Using Clerk pricing for ${cachedData.plan_name}`);
        return {
          ...fallbackData,
          price: cachedData.monthly_price_cents,
          // Use annual monthly equivalent if available, otherwise calculate from annual
          priceDisplay: cachedData.annual_monthly_equivalent_cents
            ? `$${Math.floor(cachedData.annual_monthly_equivalent_cents / 100)}`
            : cachedData.annual_price_cents
            ? `$${Math.floor(cachedData.annual_price_cents / 12 / 100)}`
            : `$${Math.floor(cachedData.monthly_price_cents / 100)}`,
          trialDays: cachedData.trial_days || fallbackData.trialDays,
          // Use description from Clerk if available
          description: cachedData.description || fallbackData.description,
          // Use slug and features from Clerk if available
          slug: cachedData.slug || fallbackData.slug,
          clerkFeatures: cachedData.features || [],
        };
      }
      // Fallback to constants if Clerk pricing not cached yet
      console.log(`[getPlans] Using fallback pricing for ${fallbackData.name}`);
      return fallbackData;
    };

    // Use type-safe getPlanById with environment-specific plan IDs
    const essentialFallback = getPlanById(planIds[0]);
    const starterFallback = getPlanById(planIds[1]);
    const proFallback = getPlanById(planIds[2]);
    const businessFallback = getPlanById(planIds[3]);

    // Handle case where plan config might not exist (should never happen in production)
    if (!essentialFallback || !starterFallback || !proFallback || !businessFallback) {
      console.error('[getPlans] CRITICAL: Plan configuration missing!', {
        essentialPlanId: planIds[0],
        starterPlanId: planIds[1],
        proPlanId: planIds[2],
        businessPlanId: planIds[3],
        essentialFound: !!essentialFallback,
        starterFound: !!starterFallback,
        proFound: !!proFallback,
        businessFound: !!businessFallback,
      });
      throw new Error(`Plan configuration missing for environment`);
    }

    return {
      essential: mergePlanData(planIds[0], essentialCache, essentialFallback),
      starter: mergePlanData(planIds[1], starterCache, starterFallback),
      pro: mergePlanData(planIds[2], proCache, proFallback),
      business: mergePlanData(planIds[3], businessCache, businessFallback),
    };
  },
});

/**
 * Manual trigger to refresh plan pricing (for testing/debugging)
 * This mutation schedules the refreshPlanPricing action to run immediately
 */
export const triggerPricingRefresh = mutation({
  args: {},
  handler: async (ctx): Promise<{ message: string; jobId: string }> => {
    console.log('[triggerPricingRefresh] Manually triggering pricing refresh...');
    // Schedule the action to run immediately (0ms delay)
    const jobId: string = await ctx.scheduler.runAfter(0, internal.clerkPlans.refreshPlanPricing);
    console.log('[triggerPricingRefresh] Scheduled pricing refresh job:', jobId);
    return {
      message: 'Pricing refresh scheduled',
      jobId: jobId
    };
  },
});

/**
 * Stale-while-revalidate: refresh pricing only if cache is stale
 * Call this on page load - it's fast and won't hammer the API
 */
export const refreshIfStale = mutation({
  args: {},
  handler: async (ctx): Promise<{ refreshed: boolean }> => {
    const envPlanIds = getEnvironmentPlanIds();
    const planIds = Object.values(envPlanIds);

    // Check staleness of any cached plan
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();

    for (const planId of planIds) {
      const cache = await ctx.db
        .query('clerk_plan_pricing')
        .withIndex('by_plan_id', (q) => q.eq('plan_id', planId))
        .first();

      // If missing or stale, trigger refresh
      if (!cache || (now - (cache.last_updated || 0)) > ONE_HOUR) {
        await ctx.scheduler.runAfter(0, internal.clerkPlans.refreshPlanPricing);
        return { refreshed: true };
      }
    }

    return { refreshed: false };
  },
});

