/**
 * Business Registration with Clerk Authentication
 * 
 * Handles business account creation and links it to a Clerk user
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/authHelpers";

/**
 * Create a minimal business account with just business name during signup
 * This allows users to access the dashboard immediately after account creation
 */
export const createMinimalBusinessAccount = mutation({
  args: {
    businessName: v.string(),
  },
  handler: async (ctx, args) => {
    // Require authentication - user must be logged in with Clerk
    const clerkUserId = await requireAuth(ctx);
    
    // Get the user's email from Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("User identity not found or missing email");
    }
    
    // Check if business already exists for this Clerk user
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (existingBusiness) {
      throw new Error("Business profile already exists for this user");
    }
    
    // Check if business exists with this email
    const businessByEmail = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (businessByEmail) {
      throw new Error("Business with this email already exists");
    }
    
    // Create minimal business record with just business name
    // This allows immediate dashboard access without forcing onboarding
    const businessId = await ctx.db.insert("businesses", {
      // Auth and identity fields
      clerk_user_id: clerkUserId,
      email: identity.email!,
      first_name: "",
      last_name: "",
      name: args.businessName,
      
      // Set as active (Clerk handles email verification)
      is_active: true,
      
      // DO NOT set onboarding_completed_at - user hasn't completed profile yet
      onboarding_completed_at: undefined,
      
      // Timestamps
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    
    // Create minimal primary location with just business name
    // Other fields will be filled during profile completion
    const locationId = await ctx.db.insert("business_locations", {
      business_id: businessId,
      is_primary: true,
      is_active: true,
      
      // Minimal business info
      name: args.businessName,
      profile_name: args.businessName, // Customer-facing business name (same as name initially)
      phone: "",
      category: "",
      description: "",
      
      // Empty address fields - to be filled during profile completion
      address: "",
      city: "",
      state: "",
      zip: "",
      
      // Empty service area fields
      service_zip: "",
      service_radius: 0,
      
      // Empty additional fields
      website: "",
      business_hours: null,
      logo_url: "",
      
      // Empty social media
      instagram_url: "",
      facebook_url: "",
      tiktok_url: "",
      linkedin_url: "",
      twitter_url: "",
      pinterest_url: "",
      
      // Timestamps
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    
    console.log(`[BusinessRegistration] Created minimal business account for Clerk user ${clerkUserId}: ${args.businessName}`);
    console.log(`[BusinessRegistration] Created minimal primary location ${locationId} for business ${businessId}`);
    
    return businessId;
  },
});

/**
 * Create a business profile for the authenticated user
 */
export const createBusinessProfile = mutation({
  args: {
    businessName: v.string(),
    profileName: v.optional(v.string()), // Customer-facing name for location
    internalName: v.optional(v.string()), // Internal name for location
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    // Additional optional fields for partial onboarding
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    geocoded_address: v.optional(v.string()),
    serviceZip: v.optional(v.string()),
    serviceRadius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),
    website: v.optional(v.string()),
    businessHours: v.optional(v.any()),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    pinterestUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication - user must be logged in with Clerk
    const clerkUserId = await requireAuth(ctx);
    
    // Get the user's email from Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("User identity not found or missing email");
    }
    
    // Check if business already exists for this Clerk user
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (existingBusiness) {
      throw new Error("Business profile already exists for this user");
    }
    
    // Check if business exists with this email
    const businessByEmail = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (businessByEmail) {
      throw new Error("Business with this email already exists");
    }
    
    // Determine onboarding completion level
    const hasBusinessName = !!args.businessName;
    const hasLogo = !!args.logoUrl;
    const hasLocation = !!(args.address && args.city && args.state && args.zip) || 
                       !!(args.serviceZip && args.serviceRadius);
    const hasPhone = !!args.phone;
    const hasCategory = !!args.category;
    const hasDescription = !!args.description;
    const hasHours = !!args.businessHours;
    const hasWebsite = !!args.website;
    const hasSocialMedia = !!(args.instagramUrl || args.facebookUrl || args.tiktokUrl || 
                             args.linkedinUrl || args.twitterUrl || args.pinterestUrl);
    
    // Check completion levels
    const hasBaselineFields = hasBusinessName && hasLogo && hasLocation && hasPhone && hasCategory;
    const hasAllOptionalFields = hasDescription && hasHours && hasWebsite && hasSocialMedia;

    // Set onboarding completion timestamp when baseline fields are complete
    // Baseline fields are the minimum required to use the platform (create promotions/events)
    const onboardingCompletedAt = hasBaselineFields ? Date.now() : undefined;
    
    // DUAL-TABLE PATTERN: Create business with auth fields only
    const businessId = await ctx.db.insert("businesses", {
      // Auth and identity fields only
      clerk_user_id: clerkUserId,
      email: identity.email!,
      first_name: args.firstName || "",
      last_name: args.lastName || "",
      name: args.businessName, // Legal business name for identification
      
      // Set as active (Clerk handles email verification)
      is_active: true,
      
      // Onboarding status
      onboarding_completed_at: onboardingCompletedAt,
      
      // Timestamps
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    
    // DUAL-TABLE PATTERN: Create primary location with all profile data
    const locationId = await ctx.db.insert("business_locations", {
      business_id: businessId,
      is_primary: true,
      is_active: true,
      
      // Business info
      name: args.internalName || "Headquarters", // Internal name for the location
      profile_name: args.profileName || "", // Customer-facing name (no fallback to prevent contamination)
      phone: args.phone || "",
      category: args.category || "",
      description: args.description || "",
      
      // Address fields
      address: args.address || "",
      city: args.city || "",
      state: args.state || "",
      zip: args.zip || "",
      latitude: args.latitude,
      longitude: args.longitude,
      geocoded_address: args.geocoded_address,
      geocoded_at: args.latitude && args.longitude ? Date.now() : undefined,

      // Service area fields
      service_zip: args.serviceZip || "",
      service_radius: args.serviceRadius || 0,
      
      // Additional fields
      website: args.website || "",
      business_hours: args.businessHours || null,
      logo_url: args.logoUrl || "",
      
      // Social media
      instagram_url: args.instagramUrl || "",
      facebook_url: args.facebookUrl || "",
      tiktok_url: args.tiktokUrl || "",
      linkedin_url: args.linkedinUrl || "",
      twitter_url: args.twitterUrl || "",
      pinterest_url: args.pinterestUrl || "",
      
      // Timestamps
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    
    console.log(`[BusinessRegistration] Created business profile for Clerk user ${clerkUserId}: ${args.businessName}`);
    console.log(`[BusinessRegistration] Created primary location ${locationId} for business ${businessId}`);
    
    // Return just the businessId for simplicity
    return businessId;
  },
});

/**
 * Update business profile with partial data
 */
export const updateBusinessProfile = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    businessName: v.optional(v.string()), // Legal business name -> businesses.name
    profileName: v.optional(v.string()), // Customer-facing name -> business_locations.profile_name
    internalName: v.optional(v.string()), // Internal location name -> business_locations.name
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    serviceZip: v.optional(v.string()),
    serviceRadius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),
    website: v.optional(v.string()),
    businessHours: v.optional(v.any()),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    pinterestUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireAuth(ctx);
    
    // Find business for this user
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (!business) {
      throw new Error("Business profile not found");
    }
    
    // DUAL-TABLE PATTERN: Separate updates for each table
    
    // Build business table updates (auth fields only)
    const businessUpdates: any = {
      updated_at: Date.now(),
    };
    if (args.firstName !== undefined) businessUpdates.first_name = args.firstName;
    if (args.lastName !== undefined) businessUpdates.last_name = args.lastName;
    if (args.businessName !== undefined) businessUpdates.name = args.businessName;
    
    // Build location table updates (profile fields)
    const locationUpdates: any = {};
    if (args.internalName !== undefined) locationUpdates.name = args.internalName;
    if (args.profileName !== undefined) locationUpdates.profile_name = args.profileName;
    if (args.phone !== undefined) locationUpdates.phone = args.phone;
    if (args.category !== undefined) locationUpdates.category = args.category;
    if (args.description !== undefined) locationUpdates.description = args.description;
    if (args.address !== undefined) locationUpdates.address = args.address;
    if (args.city !== undefined) locationUpdates.city = args.city;
    if (args.state !== undefined) locationUpdates.state = args.state;
    if (args.zip !== undefined) locationUpdates.zip = args.zip;
    if (args.serviceZip !== undefined) locationUpdates.service_zip = args.serviceZip;
    if (args.serviceRadius !== undefined) locationUpdates.service_radius = args.serviceRadius;
    if (args.website !== undefined) locationUpdates.website = args.website;
    if (args.businessHours !== undefined) locationUpdates.business_hours = args.businessHours;
    if (args.logoUrl !== undefined) locationUpdates.logo_url = args.logoUrl;
    if (args.instagramUrl !== undefined) locationUpdates.instagram_url = args.instagramUrl;
    if (args.facebookUrl !== undefined) locationUpdates.facebook_url = args.facebookUrl;
    if (args.tiktokUrl !== undefined) locationUpdates.tiktok_url = args.tiktokUrl;
    if (args.linkedinUrl !== undefined) locationUpdates.linkedin_url = args.linkedinUrl;
    if (args.twitterUrl !== undefined) locationUpdates.twitter_url = args.twitterUrl;
    if (args.pinterestUrl !== undefined) locationUpdates.pinterest_url = args.pinterestUrl;
    
    // Update or create primary location
    let primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    if (Object.keys(locationUpdates).length > 0) {
      if (primaryLocation) {
        // Update existing location
        await ctx.db.patch(primaryLocation._id, {
          ...locationUpdates,
          updated_at: Date.now(),
        });
      } else {
        // Create primary location if it doesn't exist
        await ctx.db.insert("business_locations", {
          business_id: business._id,
          is_primary: true,
          is_active: true,
          name: business.name || "",
          ...locationUpdates,
          // Required fields with defaults
          address: locationUpdates.address || "",
          city: locationUpdates.city || "",
          state: locationUpdates.state || "",
          zip: locationUpdates.zip || "",
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
    }
    
    // Get updated location data
    primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // Check if profile is now fully complete using location data
    if (!primaryLocation) {
      // No location data yet, profile is not complete
      return business._id;
    }

    // Check business name from businesses table (updated above)
    const hasBusinessName = !!(businessUpdates.name || business.name);
    const hasLogo = !!primaryLocation.logo_url;
    const hasLocation = !!(primaryLocation.address && primaryLocation.city &&
                          primaryLocation.state && primaryLocation.zip) ||
                       !!(primaryLocation.service_zip && primaryLocation.service_radius);
    const hasPhone = !!primaryLocation.phone;
    const hasCategory = !!primaryLocation.category;
    const hasDescription = !!primaryLocation.description;
    const hasHours = !!primaryLocation.business_hours;
    const hasWebsite = !!primaryLocation.website;
    const hasSocialMedia = !!(primaryLocation.instagram_url || primaryLocation.facebook_url ||
                             primaryLocation.tiktok_url || primaryLocation.linkedin_url ||
                             primaryLocation.twitter_url || primaryLocation.pinterest_url);

    const hasBaselineFields = hasBusinessName && hasLogo && hasLocation && hasPhone && hasCategory;
    const hasAllOptionalFields = hasDescription && hasHours && hasWebsite && hasSocialMedia;

    // Update onboarding completion when baseline fields are complete
    // Baseline fields are the minimum required to use the platform (create promotions/events)
    if (hasBaselineFields && !business.onboarding_completed_at) {
      businessUpdates.onboarding_completed_at = Date.now();
      console.log(`[BusinessRegistration] Marking onboarding as complete - baseline fields present`);
    }
    
    // Update the business table with auth fields
    await ctx.db.patch(business._id, businessUpdates);
    
    console.log(`[BusinessRegistration] Updated business profile for ${business.name}`);
    
    return business._id;
  },
});

/**
 * Get business profile for the authenticated user
 */
export const getMyBusinessProfile = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const clerkUserId = await requireAuth(ctx);
      
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
        .first();
      
      return {
        success: true,
        business,
        hasProfile: !!business,
      };
    } catch (error) {
      return {
        success: false,
        business: null,
        hasProfile: false,
        error: error instanceof Error ? error.message : "Authentication required",
      };
    }
  },
});

// Business registration for Clerk users is now handled automatically by the
// Clerk webhook on user.created event (see clerkWebhooks.ts)