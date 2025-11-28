/**
 * Clerk Webhook Handler for Business Users
 * 
 * Handles webhook events from the business Clerk instance including:
 * - User creation/updates
 * - Business auto-creation
 * - Billing/subscription events
 */

import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent, createClerkClient } from "@clerk/clerk-sdk-node";
import { internalSafe, apiSafe } from "./lib/apiHelpers";
// import * as stripeService from "./services/stripeService"; // Removed - Stripe integration disabled
import * as clerkBillingService from "./services/clerkBillingService";
import { getPlanById, FREE_TIER_LIMITS, PLAN_CONFIGS } from "./constants/clerkPlans";

// Extend WebhookEvent type for billing events
type BillingWebhookEvent = WebhookEvent | {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.active' |
        'subscription.pastDue' | 'subscriptionItem.created' | 'subscriptionItem.updated' |
        'subscriptionItem.active' | 'subscriptionItem.canceled' | 'subscriptionItem.ended' |
        'subscriptionItem.pastDue' | 'subscriptionItem.upcoming' | 'subscriptionItem.abandoned' |
        'subscriptionItem.freeTrialEnding' | 'subscriptionItem.incomplete';
  data: any;
};

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const LOG_PREFIX = '[CLERK_WEBHOOK_TRACE]';

  // Get the webhook secret from environment variables (business users)
  const webhookSecret = process.env.CLERK_BUSINESS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(`${LOG_PREFIX} No CLERK_BUSINESS_WEBHOOK_SECRET found`);
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  // If any are missing, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error(`${LOG_PREFIX} Missing svix headers`);
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const body = await request.text();

  console.log(`${LOG_PREFIX} ============ WEBHOOK RECEIVED ============`);
  console.log(`${LOG_PREFIX} Svix ID: ${svixId}`);
  console.log(`${LOG_PREFIX} Timestamp: ${svixTimestamp}`);

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
    console.log(`${LOG_PREFIX} Webhook signature verified successfully`);
  } catch (err) {
    console.error(`${LOG_PREFIX} Webhook verification failed:`, err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle the webhook event
  console.log(`${LOG_PREFIX} Event Type: ${evt.type}`);
  console.log(`${LOG_PREFIX} Raw Event Data:`, JSON.stringify(evt.data, null, 2));

  // Idempotency: skip if we've already processed this svix event id
  try {
    const result = await ctx.runMutation(internal.webhookIdempotency.recordIfNew, {
      provider: "clerk",
      eventId: svixId,
      type: evt.type,
    });
    if (result?.duplicate) {
      console.log("[clerkWebhooks] Duplicate event detected, skipping:", svixId, evt.type);
      return new Response("Duplicate", { status: 200 });
    }
  } catch (idempError) {
    console.warn("[clerkWebhooks] Idempotency check failed, continuing defensively:", idempError);
  }
  
  // Cast to BillingWebhookEvent to handle billing events
  const event = evt as BillingWebhookEvent;

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, username, unsafe_metadata } = event.data;

      // Get primary email if available (optional for OAuth users)
      const primaryEmail = email_addresses?.find(e => e.id === event.data.primary_email_address_id);
      const email = primaryEmail?.email_address;

      console.log("[clerkWebhooks] Creating business for new user:", id, email ? `with email: ${email}` : 'without email (OAuth user)');

      // Check if user selected a plan during signup
      const selectedPlanId = unsafe_metadata?.selected_plan as string | undefined;
      const selectedPlanName = unsafe_metadata?.plan_name as string | undefined;

      if (selectedPlanId) {
        console.log("[clerkWebhooks] User selected plan during signup:", selectedPlanName, selectedPlanId);
      }

      // Create business for the new user
      let businessId: string | null = null;
      let stripeCustomerId: string | null = null;

      try {
        // Don't prefill business name - let user choose during onboarding
        businessId = await ctx.runMutation(internalSafe.authClerk.createBusinessForUser, {
          clerkUserId: id,
          email: email, // Optional - may be undefined for OAuth users
          name: '', // Empty business name - user will set during onboarding
          firstName: first_name || undefined,
          lastName: last_name || undefined,
        });

        console.log("[clerkWebhooks] Successfully created business for user:", id, "with business ID:", businessId);

        // If user selected a plan, create subscription via Clerk Billing API
        if (selectedPlanId && businessId) {
          try {
            const clerkApiKey = process.env.CLERK_SECRET_KEY;
            if (clerkApiKey) {
              console.log("[clerkWebhooks] Creating Clerk billing subscription for plan:", selectedPlanId);

              const billingUrl = `https://api.clerk.com/v1/users/${id}/billing/subscription`;
              const subscriptionResponse = await fetch(billingUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${clerkApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  plan_id: selectedPlanId,
                  payment_method: 'card', // User will add payment method in billing portal
                })
              });

              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                console.log("[clerkWebhooks] Successfully created subscription:", subscriptionData);

                // The subscription.created webhook will handle updating the business record
              } else {
                const errorText = await subscriptionResponse.text();
                console.error("[clerkWebhooks] Failed to create subscription:", subscriptionResponse.status, errorText);
                // Non-critical - user can subscribe later from dashboard
              }
            }
          } catch (subscriptionError) {
            console.error("[clerkWebhooks] Error creating subscription:", subscriptionError);
            // Non-critical - user can subscribe later from dashboard
          }
        }

        // Stripe customer creation removed - using Clerk billing
        // Update Clerk user metadata with business ID only
        if (businessId) {
          try {
            const clerkApiKey = process.env.CLERK_SECRET_KEY;
            if (clerkApiKey) {
              // Initialize Clerk client with the API key
              const clerk = createClerkClient({ secretKey: clerkApiKey });

              await clerk.users.updateUserMetadata(id, {
                publicMetadata: {
                  business_id: businessId,
                }
              });

              console.log("[clerkWebhooks] Updated Clerk user metadata with business ID");
            } else {
              console.warn("[clerkWebhooks] CLERK_SECRET_KEY not found, skipping metadata update");
            }
          } catch (metadataError) {
            console.error("[clerkWebhooks] Failed to update Clerk metadata:", metadataError);
            // Non-critical error - continue
          }
        }

      } catch (error) {
        console.error("[clerkWebhooks] Failed to create business:", error);
        // Don't fail the webhook - Clerk will retry
        // The user can still get a business created on first login
      }
      break;
    }
    
    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const previous_attributes = (event.data as any).previous_attributes;
      
      console.log("[clerkWebhooks] User updated:", id);
      
      // Get the new primary email
      const primaryEmail = email_addresses?.find(e => e.id === event.data.primary_email_address_id);
      const newEmail = primaryEmail?.email_address;
      
      // Check if email has changed
      const previousPrimaryEmailId = previous_attributes?.primary_email_address_id;
      const emailChanged = previousPrimaryEmailId !== event.data.primary_email_address_id;
      
      if (!newEmail) {
        console.log("[clerkWebhooks] No email found for updated user, skipping");
        break;
      }
      
      try {
        // Get the business for this Clerk user
        const business = await ctx.runQuery(apiSafe.businesses.getBusinessByClerkUserId, {
          clerkUserId: id,
        });
        
        if (!business) {
          console.log("[clerkWebhooks] No business found for Clerk user:", id);
          break;
        }
        
        // Update business email if changed
        if (emailChanged && newEmail !== business.email) {
          console.log("[clerkWebhooks] Email changed from", business.email, "to", newEmail);
          
          // Update business email in database
          await ctx.runMutation(apiSafe.businesses.updateBusiness, {
            businessId: business._id,
            updates: { 
              email: newEmail,
              first_name: first_name || business.first_name,
              last_name: last_name || business.last_name,
            },
          });
          
          // Stripe customer update removed - using Clerk billing
        }
        
        // Update name if changed
        const nameChanged = first_name !== previous_attributes?.first_name || 
                          last_name !== previous_attributes?.last_name;
        
        // Stripe customer name update removed - using Clerk billing
        
        // Update Clerk metadata only to set business_id if missing (avoid update loops)
        try {
          const clerkApiKey = process.env.CLERK_SECRET_KEY;
          const hasBusinessId = !!event.data.public_metadata?.business_id;
          if (clerkApiKey && !hasBusinessId) {
            const clerk = createClerkClient({ secretKey: clerkApiKey });
            await clerk.users.updateUserMetadata(id, {
              publicMetadata: {
                business_id: business._id,
              }
            });
            console.log("[clerkWebhooks] Set Clerk publicMetadata.business_id only (idempotent)");
          }
        } catch (metadataError) {
          console.error("[clerkWebhooks] Failed to update Clerk metadata:", metadataError);
          // Non-critical error - continue
        }
        
      } catch (error) {
        console.error("[clerkWebhooks] Error handling user update:", error);
        // Don't fail the webhook - Clerk will retry
      }
      break;
    }
    
    case "user.deleted": {
      // Handle user deletion - archive all business data
      const userId = event.data.id;
      console.log("[clerkWebhooks] User deleted:", userId);
      
      if (!userId) {
        console.log("[clerkWebhooks] No user ID in deletion event");
        break;
      }
      
      try {
        // Archive the business and all related data
        const result = await ctx.runMutation(internal.businesses.archiveBusinessForDeletedUser, {
          clerkUserId: userId,
          reason: "clerk_user_deleted",
        });
        
        if (result.success) {
          console.log("[clerkWebhooks] Successfully archived business for deleted user:", result.archivedData);
        } else {
          console.log("[clerkWebhooks] No business found to archive for user:", event.data.id);
        }
      } catch (error) {
        console.error("[clerkWebhooks] Error archiving business for deleted user:", error);
        // Don't throw - let webhook succeed to prevent Clerk retries
      }
      
      break;
    }
    
    // Clerk Billing Events - subscription level events
    case "subscription.created":
    case "subscription.active": {
      console.log(`${LOG_PREFIX} -------- SUBSCRIPTION CREATED/ACTIVE --------`);
      const eventData = event.data as any;

      // Extract user ID and subscription info from the event
      const userId = eventData.payer?.user_id || eventData.user_id || eventData.userId || eventData.object?.user_id;
      const planId = eventData.plan_id || eventData.planId || eventData.object?.plan?.id;
      const planName = (eventData.plan_name || eventData.planName || eventData.object?.plan?.name || '').toLowerCase();
      const status = eventData.status || eventData.object?.status || 'active';
      const currentPeriodEnd = eventData.current_period_end || eventData.currentPeriodEnd || eventData.object?.current_period_end;

      console.log(`${LOG_PREFIX} Extracted from webhook:`, {
        userId,
        planId,
        planName,
        status,
        currentPeriodEnd,
        subscriptionId: eventData.id || eventData.object?.id
      });

      // CRITICAL: Ignore free/trial plans - users must select a paid plan to get access
      // Clerk auto-creates these plans, but they should NOT grant dashboard access
      if (planName === 'trial' || planName === '' || planName.toLowerCase() === 'free') {
        console.log(`${LOG_PREFIX} ❌ BLOCKING free/trial plan - User: ${userId}, Plan: ${planName}`);
        console.log(`${LOG_PREFIX} This subscription will NOT grant dashboard access`);
        break;
      }

      // SIMPLE: Look up plan limits directly by plan ID
      // Clerk is the source of truth for WHICH plan, we define WHAT limits each plan gets
      const planConfig = getPlanById(planId);

      if (!planConfig) {
        console.warn(`${LOG_PREFIX} ⚠️ Unknown plan ID: ${planId} - Using FREE_TIER_LIMITS (no access)`);
      } else {
        console.log(`${LOG_PREFIX} ✅ Found plan config:`, {
          planName: planConfig.name,
          tier: planConfig.tier,
          limits: planConfig.limits
        });
      }

      // Use plan limits or fallback to FREE_TIER_LIMITS (no access)
      const limits = planConfig ? planConfig.limits : FREE_TIER_LIMITS;

      const maxLocations = limits.maxLocations;
      const maxPromotions = limits.maxActivePromotions;
      const maxEvents = limits.maxActiveEvents;
      const maxDraftPromotions = limits.maxDraftPromotions;
      const maxDraftEvents = limits.maxDraftEvents;
      const maxPromotionDurationDays = limits.maxPromotionDurationDays;

      console.log(`${LOG_PREFIX} Applied limits:`, {
        maxLocations,
        maxPromotions,
        maxEvents,
        maxDraftPromotions,
        maxDraftEvents,
        maxPromotionDurationDays
      });

      if (!userId) {
        console.error(`${LOG_PREFIX} ❌ ERROR: No user ID found in subscription event`);
        break;
      }

      try {
        const syncData = {
          clerkUserId: userId,
          clerk_subscription_id: eventData.id || eventData.object?.id,
          clerk_plan_id: planId,
          clerk_plan_name: eventData.plan_name || eventData.planName || eventData.object?.plan?.name,
          clerk_subscription_status: status,
          clerk_period_end: currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : undefined,
          max_locations_limit: maxLocations,
          max_active_promotions_limit: maxPromotions,
          max_active_events_limit: maxEvents,
          max_draft_promotions_limit: maxDraftPromotions,
          max_draft_events_limit: maxDraftEvents,
          max_promotion_duration_days: maxPromotionDurationDays,
        };

        console.log(`${LOG_PREFIX} 📝 Writing to database:`, JSON.stringify(syncData, null, 2));

        // Update business with Clerk subscription data using the new retry mutation
        // Schedule with 0 delay to run immediately but asynchronously
        await ctx.scheduler.runAfter(0, internal.clerkBilling.syncSubscriptionWithRetry, syncData);

        // Cache pricing data from webhook (plan.amount, plan.currency)
        const plan = eventData.plan || eventData.object?.plan;
        if (plan && planId) {
          const priceCents = plan.amount || plan.fee?.amount || 0;
          const currency = plan.currency || plan.fee?.currency || 'USD';
          const displayPlanName = plan.name || eventData.plan_name || eventData.planName || 'Unknown';

          if (priceCents > 0) {
            console.log(`${LOG_PREFIX} 💰 Caching pricing for ${displayPlanName}: ${priceCents} ${currency}`);
            await ctx.scheduler.runAfter(0, internal.clerkPlans.upsertPlanPricing, {
              plan_id: planId,
              plan_name: displayPlanName,
              monthly_price_cents: priceCents,
              annual_price_cents: null, // Webhooks don't include annual pricing
              annual_monthly_equivalent_cents: null,
              currency: currency.toLowerCase(),
              has_trial: true, // Assume trial for founder plans
              trial_days: 7,
              last_updated: Date.now(),
            });
          }
        }

        console.log(`${LOG_PREFIX} ✅ Successfully scheduled subscription sync for user ${userId}`);
        console.log(`${LOG_PREFIX} -------- END SUBSCRIPTION CREATED/ACTIVE --------`);
      } catch (error) {
        console.error(`${LOG_PREFIX} ❌ ERROR handling subscription.created/active:`, error);
      }
      break;
    }

    case "subscription.updated": {
      console.log(`${LOG_PREFIX} -------- SUBSCRIPTION UPDATED --------`);
      const eventData = event.data as any;

      // Look for user ID in payer object first (new Clerk billing structure)
      const userId = eventData.payer?.user_id || eventData.user_id || eventData.userId || eventData.object?.user_id;
      // Get the active plan from items array (most recent active item)
      const activeItem = eventData.items?.find((item: any) => item.status === 'active') || eventData.items?.[0];
      const planId = activeItem?.plan?.id || eventData.plan_id || eventData.planId || eventData.object?.plan?.id;
      const status = eventData.status || eventData.object?.status;
      const currentPeriodEnd = activeItem?.period_end || eventData.current_period_end || eventData.currentPeriodEnd || eventData.object?.current_period_end;
      const planName = activeItem?.plan?.name || eventData.plan_name || eventData.planName;
      const planSlug = activeItem?.plan?.slug || eventData.plan_slug;

      console.log(`${LOG_PREFIX} Extracted from webhook:`, {
        userId,
        planId,
        planName,
        planSlug,
        status,
        currentPeriodEnd,
        activeItemStatus: activeItem?.status
      });
      
      // Since webhook doesn't include features, we need to fetch from Clerk API
      console.log("[clerkWebhooks] Webhook doesn't include features, fetching from Clerk API...");

      // Get default limits from plan config (fallback if API fetch fails)
      const planConfig = getPlanById(planId);
      let maxLocations: number = planConfig?.limits.maxLocations ?? 1;
      let maxPromotions: number = planConfig?.limits.maxActivePromotions ?? 0;
      let maxEvents: number = planConfig?.limits.maxActiveEvents ?? 0;
      let maxDraftPromotions: number = planConfig?.limits.maxDraftPromotions ?? 1;
      let maxDraftEvents: number = planConfig?.limits.maxDraftEvents ?? 1;
      let maxPromotionDurationDays: number | undefined = planConfig?.limits.maxPromotionDurationDays;

      console.log(`${LOG_PREFIX} Using plan config defaults for ${planConfig?.name || planId}:`, {
        maxLocations,
        maxPromotions,
        maxEvents,
        maxDraftPromotions,
        maxDraftEvents,
        maxPromotionDurationDays
      });

      // Fetch the actual subscription data with features from Clerk API
      try {
        const clerkApiKey = process.env.CLERK_SECRET_KEY;
        if (clerkApiKey && userId) {
          const billingUrl = `https://api.clerk.com/v1/users/${userId}/billing/subscription`;
          const response = await fetch(billingUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${clerkApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const billingData = await response.json();
            const subscription = billingData.subscription_items?.[0];
            const plan = subscription?.plan;
            const apiFeatures = plan?.features || [];
            
            console.log("[clerkWebhooks] Fetched features from API:", apiFeatures);
            
            // Parse features from API response
            // Supports both old format (max_locations_1) and new format (locations_1)
            let hasRestrictedDuration = false;
            for (const feature of apiFeatures) {
              const slug = feature.slug;

              // Check for restricted_duration feature flag
              if (slug === 'restricted_duration') {
                hasRestrictedDuration = true;
                continue;
              }

              // Try new simplified format first: locations_1, promotions_2, events_1
              const newFormatMatch = slug.match(/^(locations|promotions|events)_(\d+)$/i);
              if (newFormatMatch) {
                const [_, type, value] = newFormatMatch;
                const limit = parseInt(value, 10);
                const typeLower = type.toLowerCase();

                if (typeLower === 'locations') {
                  maxLocations = limit;
                } else if (typeLower === 'promotions') {
                  maxPromotions = limit;
                } else if (typeLower === 'events') {
                  maxEvents = limit;
                }
                continue;
              }

              // Fall back to old format: max_locations_1, max_active_promotions_2, etc.
              const oldFormatMatch = slug.match(/max_(\w+)_(\d+)/);
              if (oldFormatMatch) {
                const [_, type, value] = oldFormatMatch;
                const limit = parseInt(value, 10);

                if (slug.includes('max_locations_')) {
                  maxLocations = limit;
                } else if (slug.includes('max_active_promotions_')) {
                  maxPromotions = limit;
                } else if (slug.includes('max_active_events_')) {
                  maxEvents = limit;
                } else if (slug.includes('max_draft_promotions_')) {
                  maxDraftPromotions = limit;
                } else if (slug.includes('max_draft_events_')) {
                  maxDraftEvents = limit;
                }
              }
            }

            maxPromotionDurationDays = hasRestrictedDuration ? 30 : undefined;
          }
        }
      } catch (apiError) {
        console.error("[clerkWebhooks] Failed to fetch features from API:", apiError);
      }

      // FALLBACK: If API fetch failed or didn't return limits, use plan config
      // This provides a safety net when Clerk API is down or returns incomplete data
      if (planId && maxPromotions === 0) {
        console.log("[LIMIT_FALLBACK] clerkWebhooks subscription.updated - TRIGGERED for plan:", planId);
        const planConfig = getPlanById(planId);

        if (planConfig) {
          console.log("[LIMIT_FALLBACK] clerkWebhooks - Using plan config:", {
            planName: planConfig.name,
            limits: planConfig.limits
          });
          maxLocations = maxLocations || planConfig.limits.maxLocations;
          maxPromotions = maxPromotions || planConfig.limits.maxActivePromotions;
          maxEvents = maxEvents || planConfig.limits.maxActiveEvents;
          maxDraftPromotions = maxDraftPromotions ?? undefined; // Keep undefined for unlimited
          maxDraftEvents = maxDraftEvents ?? undefined; // Keep undefined for unlimited
          maxPromotionDurationDays = maxPromotionDurationDays ?? planConfig.limits.maxPromotionDurationDays;
        } else {
          console.warn("[LIMIT_FALLBACK] clerkWebhooks - No plan config found for planId:", planId);
        }
      }

      console.log(`${LOG_PREFIX} Final computed limits:`, {
        userId,
        planId,
        status,
        limits: { maxLocations, maxPromotions, maxEvents, maxDraftPromotions, maxDraftEvents, maxPromotionDurationDays }
      });

      if (!userId) {
        console.error(`${LOG_PREFIX} ❌ ERROR: No user ID found in subscription update`);
        break;
      }

      try {
        const syncData = {
          clerkUserId: userId,
          clerk_subscription_id: eventData.id || eventData.object?.id,
          clerk_plan_id: planId,
          clerk_plan_name: planName,
          clerk_subscription_status: status,
          clerk_period_end: currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : undefined,
          max_locations_limit: maxLocations,
          max_active_promotions_limit: maxPromotions,
          max_active_events_limit: maxEvents,
          max_draft_promotions_limit: maxDraftPromotions,
          max_draft_events_limit: maxDraftEvents,
          max_promotion_duration_days: maxPromotionDurationDays,
        };

        console.log(`${LOG_PREFIX} 📝 Writing to database:`, JSON.stringify(syncData, null, 2));

        // Use the new retry mutation for better race condition handling
        await ctx.scheduler.runAfter(0, internal.clerkBilling.syncSubscriptionWithRetry, syncData);

        // Cache pricing data from webhook (activeItem.plan.amount)
        const activeItem = eventData.items?.find((item: any) => item.status === 'active') || eventData.items?.[0];
        const plan = activeItem?.plan;
        if (plan && planId) {
          const priceCents = plan.amount || plan.fee?.amount || 0;
          const currency = plan.currency || plan.fee?.currency || 'USD';
          const displayPlanName = plan.name || planName || 'Unknown';

          if (priceCents > 0) {
            console.log(`${LOG_PREFIX} 💰 Caching pricing for ${displayPlanName}: ${priceCents} ${currency}`);
            await ctx.scheduler.runAfter(0, internal.clerkPlans.upsertPlanPricing, {
              plan_id: planId,
              plan_name: displayPlanName,
              monthly_price_cents: priceCents,
              annual_price_cents: null,
              annual_monthly_equivalent_cents: null,
              currency: currency.toLowerCase(),
              has_trial: true,
              trial_days: 7,
              last_updated: Date.now(),
            });
          }
        }

        console.log(`${LOG_PREFIX} ✅ Successfully scheduled subscription sync for user ${userId}`);
        console.log(`${LOG_PREFIX} -------- END SUBSCRIPTION UPDATED --------`);
      } catch (error) {
        console.error(`${LOG_PREFIX} ❌ ERROR handling subscription.updated:`, error);
      }
      break;
    }
    
    case "subscription.pastDue": {
      const eventData = event.data as any;
      const userId = eventData.user_id || eventData.userId || eventData.object?.user_id;
      
      console.log("[clerkWebhooks] Subscription past due:", userId);
      
      if (!userId) {
        console.error("[clerkWebhooks] No user ID found in past due event:", eventData);
        break;
      }
      
      try {
        await ctx.scheduler.runAfter(0, internal.clerkBilling.updateBusinessSubscriptionInternal, {
          clerkUserId: userId,
          clerk_subscription_status: 'past_due',
        });
        
        console.log(`[clerkWebhooks] Updated subscription status to past_due for user ${userId}`);
      } catch (error) {
        console.error("[clerkWebhooks] Error handling subscription.pastDue:", error);
      }
      break;
    }
    
    // Clerk Billing Events - subscription item level events
    case "subscriptionItem.created":
    case "subscriptionItem.updated":
    case "subscriptionItem.active": {
      const eventData = event.data as any;
      // SubscriptionItem events may have different structure
      const userId = eventData.payer?.user_id || eventData.user_id || eventData.userId || eventData.subscription?.user_id;
      const planId = eventData.price?.product || eventData.plan_id || eventData.planId;
      const planName = (eventData.plan_name || eventData.planName || eventData.plan?.name || '').toLowerCase();
      const status = eventData.status || 'active';

      console.log("[clerkWebhooks] SubscriptionItem event:", event.type, { userId, planId, planName, status });

      // CRITICAL: Ignore free/trial plans - users must select a paid plan to get access
      if (planName === 'trial' || planName === '' || planName.toLowerCase() === 'free') {
        console.log("[clerkWebhooks] Ignoring free/trial plan subscriptionItem for user:", userId, "- plan:", planName);
        break;
      }

      if (!userId) {
        console.log("[clerkWebhooks] No user ID in subscriptionItem event, skipping");
        break;
      }
      
      try {
        await ctx.scheduler.runAfter(0, internal.clerkBilling.updateBusinessSubscriptionInternal, {
          clerkUserId: userId,
          clerk_subscription_id: eventData.subscription_id || eventData.subscription?.id,
          clerk_plan_id: planId,
          clerk_subscription_status: status,
        });
        
        console.log(`[clerkWebhooks] Updated business from subscriptionItem event for user ${userId}`);
      } catch (error) {
        console.error("[clerkWebhooks] Error handling subscriptionItem event:", error);
      }
      break;
    }
    
    case "subscriptionItem.canceled":
    case "subscriptionItem.ended": {
      const eventData = event.data as any;
      const userId = eventData.user_id || eventData.userId || eventData.subscription?.user_id;
      
      console.log("[clerkWebhooks] SubscriptionItem canceled/ended:", userId);
      
      if (!userId) {
        console.log("[clerkWebhooks] No user ID in cancellation event, skipping");
        break;
      }
      
      try {
        await ctx.scheduler.runAfter(0, internal.clerkBilling.clearBusinessSubscriptionInternal, {
          clerkUserId: userId,
        });
        
        console.log(`[clerkWebhooks] Cleared subscription for user ${userId}`);
      } catch (error) {
        console.error("[clerkWebhooks] Error handling subscriptionItem cancellation:", error);
      }
      break;
    }
    
    case "subscriptionItem.pastDue": {
      const eventData = event.data as any;
      const userId = eventData.user_id || eventData.userId || eventData.subscription?.user_id;
      
      if (!userId) {
        console.log("[clerkWebhooks] No user ID in pastDue event, skipping");
        break;
      }
      
      try {
        await ctx.scheduler.runAfter(0, internal.clerkBilling.updateBusinessSubscriptionInternal, {
          clerkUserId: userId,
          clerk_subscription_status: 'past_due',
        });
        
        console.log(`[clerkWebhooks] Updated status to past_due for user ${userId}`);
      } catch (error) {
        console.error("[clerkWebhooks] Error handling subscriptionItem.pastDue:", error);
      }
      break;
    }
    
    case "subscriptionItem.upcoming":
    case "subscriptionItem.freeTrialEnding":
    case "subscriptionItem.incomplete":
    case "subscriptionItem.abandoned": {
      // Log these events but don't necessarily take action
      console.log(`[clerkWebhooks] Received ${event.type} event:`, event.data);
      break;
    }
    
    default: {
      console.log(`${LOG_PREFIX} ⚠️ Unhandled event type: ${event.type}`);
    }
  }

  console.log(`${LOG_PREFIX} ============ WEBHOOK COMPLETED ============`);
  console.log(`${LOG_PREFIX} Event ${evt.type} processed successfully for svix-id: ${svixId}`);

  return new Response("Webhook processed", { status: 200 });
});