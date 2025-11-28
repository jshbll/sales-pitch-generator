import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// User roles
export const UserRole = v.union(
  v.literal("super_admin"),
  v.literal("admin"),
  v.literal("business"),
  v.literal("user")
);

// Business subscription tiers
export const BusinessTier = v.union(
  v.literal("none"),
  v.literal("bronze"),
  v.literal("gold"),
  v.literal("legacy_gold"),
  v.literal("legacy_gold_plus"),
  v.literal("diamond")
);

export default defineSchema({
  // Users table (authentication handled by Clerk)
  users: defineTable({
    // Clerk authentication
    clerk_id: v.optional(v.string()),
    user_type: v.optional(v.union(v.literal("consumer"), v.literal("business"))),

    // Core user fields
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),

    // Convex Auth fields
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Profile fields
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    role: v.optional(UserRole),
    profile_image_id: v.optional(v.string()),
    profile_image: v.optional(v.string()),
    image_url: v.optional(v.string()),

    // Authentication & security
    is_active: v.optional(v.boolean()),
    email_verified: v.optional(v.boolean()),
    email_verified_at: v.optional(v.number()),

    // Timestamps
    created_at: v.optional(v.number()),
    updated_at: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"])
    .index("by_clerk_id", ["clerk_id"])
    .index("by_user_type", ["user_type"]),

  // Businesses table
  businesses: defineTable({
    // Authentication fields
    email: v.optional(v.string()),
    password_hash: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    is_active: v.optional(v.boolean()),

    // Password management
    passwordUpdatedAt: v.optional(v.number()),

    // Contact emails
    contact_email: v.optional(v.string()),
    public_business_email: v.optional(v.string()),

    // Authentication linkage
    auth_user_id: v.optional(v.id("users")),
    clerk_user_id: v.optional(v.string()),
    owner_id: v.optional(v.id("users")),

    // Business profile fields
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),

    // Social media URLs
    facebook_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),
    twitter_url: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    tiktok_url: v.optional(v.string()),
    pinterest_url: v.optional(v.string()),

    // Images
    logo_url: v.optional(v.string()),
    logo_id: v.optional(v.string()),

    // Location and categorization
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    geocoded_address: v.optional(v.string()),
    geocoded_at: v.optional(v.number()),

    // Service area fields
    serviceZip: v.optional(v.string()),
    serviceRadius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),

    // Business hours
    business_hours: v.optional(v.any()),

    // Clerk Billing fields
    clerk_subscription_id: v.optional(v.string()),
    clerk_plan_id: v.optional(v.string()),
    clerk_plan_name: v.optional(v.string()),
    clerk_subscription_status: v.optional(v.string()),
    clerk_period_end: v.optional(v.number()),
    last_subscription_sync: v.optional(v.number()),

    // Admin overrides
    override_subscription_tier: v.optional(BusinessTier),
    override_unlimited: v.optional(v.boolean()),

    // Subscription limits
    max_locations_limit: v.optional(v.number()),
    max_active_promotions_limit: v.optional(v.number()),
    max_active_events_limit: v.optional(v.number()),
    max_draft_promotions_limit: v.optional(v.number()),
    max_draft_events_limit: v.optional(v.number()),
    max_promotion_duration_days: v.optional(v.number()),

    // Onboarding tracking
    onboarding_completed_at: v.optional(v.number()),

    // Timestamps
    created_at: v.optional(v.number()),
    updated_at: v.optional(v.number()),

    // User activity tracking
    sign_in_count: v.optional(v.number()),
    last_sign_in_at: v.optional(v.number()),

    // Soft delete
    deleted_at: v.optional(v.number()),
    deletion_reason: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_auth_user", ["auth_user_id"])
    .index("by_clerk_user_id", ["clerk_user_id"])
    .index("by_category", ["category"])
    .index("by_location", ["city", "state"]),

  // Business locations (Business Backgrounds for AI reference)
  business_locations: defineTable({
    // Parent business reference
    business_id: v.id("businesses"),

    // Contact information
    email: v.optional(v.string()),
    manager_name: v.optional(v.string()),

    // Location identification
    name: v.string(),
    profile_name: v.string(),
    location_code: v.optional(v.string()),
    is_primary: v.boolean(),

    // Address fields
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    country: v.optional(v.string()),

    // Geocoding
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    geocoded_address: v.optional(v.string()),
    geocoded_at: v.optional(v.number()),

    // Contact information
    phone: v.optional(v.string()),

    // Business hours
    business_hours: v.optional(v.any()),

    // Service area
    service_zip: v.optional(v.string()),
    service_radius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),

    // Status
    is_active: v.boolean(),
    temporarily_closed: v.optional(v.boolean()),
    closure_reason: v.optional(v.string()),
    reopening_date: v.optional(v.number()),

    // Images
    storefront_image_id: v.optional(v.string()),
    interior_image_ids: v.optional(v.array(v.string())),
    logo_url: v.optional(v.string()),
    logo_id: v.optional(v.string()),

    // Location-specific content
    description: v.optional(v.string()),

    // Business categorization
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    website: v.optional(v.string()),

    // Social media
    social_media: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      website: v.optional(v.string()),
    })),

    // Individual social media URLs
    instagram_url: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    tiktok_url: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    twitter_url: v.optional(v.string()),
    pinterest_url: v.optional(v.string()),

    // Onboarding tracking
    onboarding_completed_at: v.optional(v.number()),

    // Timestamps
    created_at: v.number(),
    updated_at: v.number(),

    // Soft delete
    deleted_at: v.optional(v.number()),
  })
    .index("by_business", ["business_id"])
    .index("by_primary", ["business_id", "is_primary"])
    .index("by_active", ["business_id", "is_active"])
    .index("by_location", ["city", "state"])
    .index("by_zip", ["zip"])
    .index("by_email", ["email"]),

  // Clerk plan pricing cache
  clerk_plan_pricing: defineTable({
    plan_id: v.string(),
    plan_name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    monthly_price_cents: v.number(),
    annual_price_cents: v.optional(v.number()),
    annual_monthly_equivalent_cents: v.optional(v.number()),
    currency: v.string(),
    has_trial: v.boolean(),
    trial_days: v.optional(v.number()),
    features: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
    }))),
    last_updated: v.number(),
  })
    .index("by_plan_id", ["plan_id"])
    .index("by_last_updated", ["last_updated"]),

  // Audio Script Generator - Sales Pitch Audio Generation
  audio_generations: defineTable({
    // User/business association
    business_id: v.optional(v.id("businesses")),
    clerk_user_id: v.optional(v.string()),

    // Wizard answers
    answers: v.any(),

    // Generated content
    prompt: v.string(),
    script_text: v.optional(v.string()),

    // Audio files
    preview_storage_id: v.optional(v.id("_storage")),
    preview_url: v.optional(v.string()),
    preview_duration: v.optional(v.number()),
    hq_storage_id: v.optional(v.id("_storage")),
    hq_url: v.optional(v.string()),
    hq_duration: v.optional(v.number()),

    // TTS settings
    voice: v.string(),
    model: v.string(),

    // Status tracking
    status: v.union(
      v.literal("draft"),
      v.literal("script_generating"),
      v.literal("script_ready"),
      v.literal("preview_generating"),
      v.literal("preview_ready"),
      v.literal("hq_generating"),
      v.literal("hq_ready"),
      v.literal("failed")
    ),
    error_message: v.optional(v.string()),

    // Cost tracking
    preview_char_count: v.optional(v.number()),
    hq_char_count: v.optional(v.number()),
    estimated_cost: v.optional(v.number()),

    // Timestamps
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_business", ["business_id"])
    .index("by_clerk_user", ["clerk_user_id"])
    .index("by_status", ["status"])
    .index("by_created", ["created_at"]),

  // AI Usage Tracking (for development cost monitoring)
  ai_usage_tracking: defineTable({
    // Service identification
    service: v.union(
      v.literal("qwen"),
      v.literal("elevenlabs")
    ),
    operation: v.string(),

    // Usage metrics
    input_tokens: v.optional(v.number()),
    output_tokens: v.optional(v.number()),
    characters: v.optional(v.number()),

    // Cost calculation (in cents)
    estimated_cost_cents: v.number(),

    // Associated records
    generation_id: v.optional(v.id("audio_generations")),
    business_id: v.optional(v.id("businesses")),
    clerk_user_id: v.optional(v.string()),

    // Request/response metadata
    model: v.optional(v.string()),
    voice_id: v.optional(v.string()),
    success: v.boolean(),
    error_message: v.optional(v.string()),

    // Timestamp
    created_at: v.number(),
  })
    .index("by_service", ["service"])
    .index("by_operation", ["operation"])
    .index("by_generation", ["generation_id"])
    .index("by_business", ["business_id"])
    .index("by_created", ["created_at"])
    .index("by_service_created", ["service", "created_at"]),

  // Webhook idempotency store
  webhook_events: defineTable({
    provider: v.string(),
    event_id: v.string(),
    type: v.string(),
    received_at: v.number(),
  })
    .index("by_event", ["event_id"]),
});
