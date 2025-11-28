/**
 * Clerk Plan Configuration - Single Source of Truth
 *
 * SIMPLIFIED ARCHITECTURE (Jordan Walke style):
 * - Direct plan ID → limits mapping
 * - Environment-aware (dev vs prod plan IDs)
 * - No Clerk feature parsing
 * - One file to change, obviously correct
 *
 * Last updated: 2025-01-13 - Simplified to direct mapping
 */

export type SubscriptionTier = 'essential' | 'starter' | 'pro' | 'business' | 'legacy_gold' | 'legacy_gold_plus' | 'none';

/**
 * Environment detection
 * Uses Convex deployment URL to determine environment
 */
const isProduction = process.env.CONVEX_CLOUD_URL?.includes('disciplined-sandpiper-478');

/**
 * Plan IDs by environment
 */
const PLAN_IDS = {
  essential: isProduction
    ? 'cplan_35TQvsOEIbOPSqDiuGhA3Kf6qoU'  // Production: Essential Founder
    : 'cplan_35TNowqxFZGpFsLdDv7Ka3IA6e8',  // Dev: Essential Founder
  starter: isProduction
    ? 'cplan_35TR4cEGfBFEA8jLPpfsjsl4qTK'  // Production: Starter Founder
    : 'cplan_35TO8BBG2AxsHTEaCY92gYdrxkC',  // Dev: Starter Founder
  pro: isProduction
    ? 'cplan_33HmPI3tbA2HDinmShWYJgbamz6'  // Production: Pro Founder
    : 'cplan_33COg9y6zdXLGkVQ2z2OY1XeKYn',  // Dev: Pro Founder
  business: isProduction
    ? 'cplan_33HmexxCiqIln66sLOHZnhZIWSF'  // Production: Business Founder
    : 'cplan_33COjz2CHScWZcCGnuFVsceguzu',  // Dev: Business Founder
};

// Essential Founder config (lowest tier)
const ESSENTIAL_CONFIG = {
  name: 'Essential Founder',
  tier: 'essential' as const,
  price: 4900, // $49/month in cents
  priceDisplay: '$49',
  interval: 'month',
  billingNote: 'when billed annually*',
  trialDays: 7,
  features: [
    '1 Business Location',
    '1 Active Promotion',
    'Basic Support',
    'Monthly Newsletter Spots',
    'Standard Analytics',
  ],
  limits: {
    maxLocations: 1,
    maxActivePromotions: 1,
    maxActiveEvents: 0,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: 30,
  },
};

// Starter Founder config
const STARTER_CONFIG = {
  name: 'Starter Founder',
  tier: 'starter' as const,
  price: 8900, // $89/month in cents
  priceDisplay: '$89',
  interval: 'month',
  billingNote: 'when billed annually*',
  trialDays: 7,
  features: [
    '1 Business Location',
    '2 Active Promotions',
    '2 Active Events',
    '1x Exposure',
    'Basic Support',
    'Monthly Newsletter Spots',
    'Advanced Analytics',
  ],
  limits: {
    maxLocations: 1,
    maxActivePromotions: 2,
    maxActiveEvents: 2,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: undefined, // No duration limit
  },
};

// Pro Founder config
const PRO_CONFIG = {
  name: 'Pro Founder',
  tier: 'pro' as const,
  price: 14900, // $149/month in cents
  priceDisplay: '$149',
  interval: 'month',
  billingNote: 'when billed annually*',
  trialDays: 7,
  features: [
    '3 Business Locations',
    '4 Active Promotions',
    '2 Active Events',
    '2x Exposure',
    'Custom Redemption Codes',
    'Custom Scheduling',
    'Event RSVP',
    'Priority Support',
    'Weekly Newsletter Spots',
    'Advanced Analytics',
  ],
  limits: {
    maxLocations: 3,
    maxActivePromotions: 4,
    maxActiveEvents: 2,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: undefined, // No duration limit
  },
};

// Business Founder config (highest tier)
const BUSINESS_CONFIG = {
  name: 'Business Founder',
  tier: 'business' as const,
  price: 29900, // $299/month in cents
  priceDisplay: '$299',
  interval: 'month',
  billingNote: 'when billed annually*',
  trialDays: 7,
  features: [
    '5 Business Locations',
    '10 Active Promotions',
    '5 Active Events',
    '3x Exposure',
    'Custom Redemption Codes',
    'Custom Scheduling',
    'Event RSVP',
    'Priority Support',
    'Weekly Newsletter Spots',
    'Advanced Analytics',
  ],
  limits: {
    maxLocations: 5,
    maxActivePromotions: 10,
    maxActiveEvents: 5,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: undefined, // No duration limit
  },
};

// Legacy Gold config (GRANDFATHERED - DO NOT USE FOR NEW SIGNUPS)
// This plan is for 1 existing production user with custom limits
// Production plan ID: cplan_33HmPI3tbA2HDinmShWYJgbamz6
const LEGACY_GOLD_CONFIG = {
  name: 'Legacy Gold',
  tier: 'legacy_gold' as const,
  price: 19900, // Historical price
  priceDisplay: 'Grandfathered',
  interval: 'month',
  billingNote: 'legacy plan',
  trialDays: 0,
  features: [
    '3 Business Locations',
    '5 Active Promotions (total)',
    '2 Active Events (total)',
    'Custom Redemption Codes',
    'Custom Scheduling',
    'Event RSVP',
    'Priority Support',
    'GRANDFATHERED PLAN',
  ],
  limits: {
    maxLocations: 3,
    maxActivePromotions: 5,
    maxActiveEvents: 2,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: undefined, // No duration limit
  },
};

// Legacy Gold Plus config (GRANDFATHERED - DO NOT USE FOR NEW SIGNUPS)
// This plan is for 1 existing production user with enhanced limits
// Production plan ID: cplan_35TSwKzKeYpwlKMYalEORWTMMQV
const LEGACY_GOLD_PLUS_CONFIG = {
  name: 'Legacy Gold Plus',
  tier: 'legacy_gold_plus' as const,
  price: 19900, // Historical price
  priceDisplay: 'Grandfathered',
  interval: 'month',
  billingNote: 'legacy plan',
  trialDays: 0,
  features: [
    '5 Business Locations',
    '10 Active Promotions (total)',
    '5 Active Events (total)',
    'Unlimited Promotion Drafts',
    'Unlimited Event Drafts',
    'Custom Redemption Codes',
    'Custom Scheduling',
    'Event RSVP',
    'Priority Support',
    'GRANDFATHERED PLAN',
  ],
  limits: {
    maxLocations: 5,
    maxActivePromotions: 10,
    maxActiveEvents: 5,
    maxDraftPromotions: undefined, // Unlimited drafts
    maxDraftEvents: undefined, // Unlimited drafts
    maxPromotionDurationDays: undefined, // No duration limit
  },
};

/**
 * Plan configuration mapped directly by Clerk plan ID
 * This is the ONLY place you need to change limits
 * Includes both dev and production plan IDs mapping to the same configs
 */
export const PLAN_CONFIGS = {
  // Dev Essential Founder
  'cplan_35TNowqxFZGpFsLdDv7Ka3IA6e8': { ...ESSENTIAL_CONFIG, id: 'cplan_35TNowqxFZGpFsLdDv7Ka3IA6e8' },
  // Dev Starter Founder
  'cplan_35TO8BBG2AxsHTEaCY92gYdrxkC': { ...STARTER_CONFIG, id: 'cplan_35TO8BBG2AxsHTEaCY92gYdrxkC' },
  // Dev Pro Founder
  'cplan_33COg9y6zdXLGkVQ2z2OY1XeKYn': { ...PRO_CONFIG, id: 'cplan_33COg9y6zdXLGkVQ2z2OY1XeKYn' },
  // Dev Business Founder
  'cplan_33COjz2CHScWZcCGnuFVsceguzu': { ...BUSINESS_CONFIG, id: 'cplan_33COjz2CHScWZcCGnuFVsceguzu' },
  // Prod Essential Founder
  'cplan_35TQvsOEIbOPSqDiuGhA3Kf6qoU': { ...ESSENTIAL_CONFIG, id: 'cplan_35TQvsOEIbOPSqDiuGhA3Kf6qoU' },
  // Prod Starter Founder
  'cplan_35TR4cEGfBFEA8jLPpfsjsl4qTK': { ...STARTER_CONFIG, id: 'cplan_35TR4cEGfBFEA8jLPpfsjsl4qTK' },
  // Prod Pro Founder
  'cplan_33HmPI3tbA2HDinmShWYJgbamz6': { ...PRO_CONFIG, id: 'cplan_33HmPI3tbA2HDinmShWYJgbamz6' },
  // Prod Business Founder
  'cplan_33HmexxCiqIln66sLOHZnhZIWSF': { ...BUSINESS_CONFIG, id: 'cplan_33HmexxCiqIln66sLOHZnhZIWSF' },
  // Legacy Bronze (production - keep for backwards compatibility)
  'cplan_354EhdAwbeqgyXcGZxAgcuDBco8': { ...ESSENTIAL_CONFIG, id: 'cplan_354EhdAwbeqgyXcGZxAgcuDBco8' },
  // Legacy Gold (production - keep for backwards compatibility)
  'cplan_354F87kX8jcYzo16SbW4pTkDaZt': { ...STARTER_CONFIG, id: 'cplan_354F87kX8jcYzo16SbW4pTkDaZt' },
  // Legacy Gold Plus (production only - grandfathered user, DO NOT USE FOR NEW SIGNUPS)
  'cplan_35TSwKzKeYpwlKMYalEORWTMMQV': { ...LEGACY_GOLD_PLUS_CONFIG, id: 'cplan_35TSwKzKeYpwlKMYalEORWTMMQV' },
} as const;

/**
 * Default limits for free/no subscription
 * Applied when no plan or unknown plan
 */
export const FREE_TIER_LIMITS = {
  maxLocations: 0,
  maxActivePromotions: 0,
  maxActiveEvents: 0,
  maxDraftPromotions: 0,
  maxDraftEvents: 0,
  maxPromotionDurationDays: 30,
} as const;

/**
 * Get plan configuration by Clerk plan ID
 * Returns null if plan not found (use FREE_TIER_LIMITS as fallback)
 */
export function getPlanById(planId: string | null | undefined): typeof PLAN_CONFIGS[keyof typeof PLAN_CONFIGS] | null {
  if (!planId) return null;
  // Type-safe lookup with explicit check
  if (planId in PLAN_CONFIGS) {
    return PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];
  }
  return null;
}

/**
 * Get limits for a plan ID
 * Defaults to FREE_TIER_LIMITS if plan not found
 */
export function getPlanLimits(planId: string | null | undefined) {
  const plan = getPlanById(planId);
  return plan ? plan.limits : FREE_TIER_LIMITS;
}

/**
 * Get plan tier by ID
 */
export function getPlanTier(planId: string | null | undefined): SubscriptionTier {
  const plan = getPlanById(planId);
  return plan ? plan.tier : 'none';
}

/**
 * Get all plan IDs
 */
export function getAllPlanIds(): string[] {
  return Object.keys(PLAN_CONFIGS);
}

/**
 * Check if a plan ID is valid
 */
export function isValidPlanId(planId: string): boolean {
  return planId in PLAN_CONFIGS;
}

/**
 * Get all plan configs as array (for frontend display)
 */
export function getAllPlans() {
  return Object.values(PLAN_CONFIGS);
}

/**
 * Legacy compatibility: getPlanDetails()
 * Returns PLAN_CONFIGS for backward compatibility
 */
export function getPlanDetails() {
  return PLAN_CONFIGS;
}

/**
 * Get the current environment's plan IDs
 * Returns the correct plan IDs for dev or production
 */
export function getEnvironmentPlanIds() {
  return {
    essential: PLAN_IDS.essential,
    starter: PLAN_IDS.starter,
    pro: PLAN_IDS.pro,
    business: PLAN_IDS.business,
  };
}
