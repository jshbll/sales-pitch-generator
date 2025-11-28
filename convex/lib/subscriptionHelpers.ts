/**
 * Get the effective limit based on subscription tier
 */
export function getEffectiveLimit(
  tier: string | undefined,
  limitType: "locations" | "promotions" | "events"
): number {
  const limits: Record<string, Record<string, number>> = {
    free: { locations: 1, promotions: 3, events: 5 },
    starter: { locations: 3, promotions: 10, events: 20 },
    pro: { locations: 10, promotions: 50, events: 100 },
    enterprise: { locations: -1, promotions: -1, events: -1 }, // unlimited
  };

  const tierLimits = limits[tier?.toLowerCase() || "free"] || limits.free;
  return tierLimits[limitType];
}
