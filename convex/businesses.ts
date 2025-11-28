import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { validateBusinessSocialMedia } from "./socialMediaValidation";
import { filterByRadius } from "./lib/geo";

// Helper function to merge business auth data with location profile data  
// Returns a merged object with all fields for backward compatibility
const mergeBusinessWithLocation = (business: any, location: any): any => {
  if (!location) {
    // If no location exists, return business with default values for location fields
    return {
      ...business,
      // Keep the business name from businesses table when no location exists
      name: business.name || "",
      // Provide defaults for location fields to maintain backward compatibility
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "", // Public business email
      website: "",
      description: "",
      latitude: null,
      longitude: null,
      geocoded_address: null,
      geocoded_at: null,
      business_hours: null,
      serviceZip: "",
      serviceRadius: null,
      customersDoNotVisit: false,
      category: "",
      categories: [],
      facebook_url: "",
      instagram_url: "",
      twitter_url: "",
      linkedin_url: "",
      tiktok_url: "",
      pinterest_url: "",
      logo_url: "",
      logo_id: "",
      primaryLocation: null,
    };
  }
  
  // Merge location data with business, with location taking precedence
  return {
    ...business,
    // Use customer-facing profile_name as primary display name
    // Fallback to account-level business name if profile_name not set
    name: location.profile_name || business.name || "", // Location profile name takes precedence
    address: location.address || "",
    city: location.city || "",
    state: location.state || "",
    zip: location.zip || "",
    phone: location.phone || "",
    email: location.email || "", // Public business email from business_locations
    website: location.website || "",
    description: location.description || "",
    
    // Location data
    latitude: location.latitude || null,
    longitude: location.longitude || null,
    geocoded_address: location.geocoded_address || null,
    geocoded_at: location.geocoded_at || null,
    
    // Business settings
    business_hours: location.business_hours || null,
    serviceZip: location.service_zip || "",
    serviceRadius: location.service_radius || null,
    customersDoNotVisit: false, // This field stays at business level
    category: location.category || "",
    categories: location.categories || [],
    
    // Social media
    facebook_url: location.facebook_url || "",
    instagram_url: location.instagram_url || "",
    twitter_url: location.twitter_url || "",
    linkedin_url: location.linkedin_url || "",
    tiktok_url: location.tiktok_url || "",
    pinterest_url: location.pinterest_url || "",
    
    // Media
    logo_url: location.logo_url || "",
    logo_id: location.logo_id || "",
    
    // Internal naming fields (for reference)
    internal_name: location.name || "", // Internal location identifier
    profile_name: location.profile_name || "", // Customer-facing business name
    
    // Keep reference to primary location
    primaryLocation: location,
  };
};

// Get business by ID (now merges with primary location)
export const getBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    // Get the business record (for auth and subscription data)
    const business = await ctx.db.get(args.businessId);
    if (!business) return null;
    
    // Get the primary location for this business
    let primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // If no primary location, get the first location for this business
    if (!primaryLocation) {
      primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
        .first();
    }
    
    // Debug logging
    console.log("[getBusiness] Business ID:", args.businessId);
    console.log("[getBusiness] Business name from businesses table:", business.name);
    console.log("[getBusiness] Primary location found:", !!primaryLocation);
    if (primaryLocation) {
      console.log("[getBusiness] Location profile_name:", primaryLocation.profile_name);
      console.log("[getBusiness] Location name (internal):", primaryLocation.name);
    }
    
    // Return merged data
    const merged = mergeBusinessWithLocation(business, primaryLocation);
    console.log("[getBusiness] Final merged name field:", merged.name);
    return merged;
  },
});

// Get business by email (checks both tables for compatibility)
export const getBusinessByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // First check businesses table for auth lookup
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!business) return null;
    
    // Get the primary location for this business
    let primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // If no primary location, get the first location for this business
    if (!primaryLocation) {
      primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .first();
    }
    
    // Return merged data
    return mergeBusinessWithLocation(business, primaryLocation);
  },
});

// Get business by auth user ID (auth lookup stays in businesses table)
export const getBusinessByAuthUserId = query({
  args: { authUserId: v.id("users") },
  handler: async (ctx, args) => {
    // Auth lookups must use businesses table
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_auth_user", (q) => q.eq("auth_user_id", args.authUserId))
      .first();
    
    if (!business) return null;
    
    // Get the primary location for this business
    let primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // If no primary location, get the first location for this business
    if (!primaryLocation) {
      primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .first();
    }
    
    // Return merged data
    return mergeBusinessWithLocation(business, primaryLocation);
  },
});

// Get business by Clerk user ID
export const getBusinessByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Find business linked to this Clerk user
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();
    
    if (!business) return null;
    
    // Get the primary location for this business
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // Return merged data
    return mergeBusinessWithLocation(business, primaryLocation);
  },
});

// Create business after Convex Auth registration
export const createBusinessAfterAuth = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const clerkUserId = identity.subject;
    
    // Check if business already exists for this user
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (existingBusiness) {
      console.log("[createBusinessAfterAuth] Business already exists for user");
      return existingBusiness._id;
    }
    
    // Check if business already exists with this email (migration case)
    const businessByEmail = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (businessByEmail) {
      // Link existing business to the new Clerk user
      await ctx.db.patch(businessByEmail._id, {
        clerk_user_id: clerkUserId,
        updated_at: Date.now()
      });
      console.log("[createBusinessAfterAuth] Linked existing business to Clerk user");
      return businessByEmail._id;
    }
    
    // DUAL-TABLE PATTERN: Create business with auth fields only
    const businessId = await ctx.db.insert("businesses", {
      email: args.email,
      name: args.name,
      first_name: args.first_name || "",
      last_name: args.last_name || "",
      clerk_user_id: clerkUserId, // Link to Clerk user
      is_active: true,
      // email_verified removed - Clerk handles this
      created_at: Date.now(),
      updated_at: Date.now()
    });
    
    // DUAL-TABLE PATTERN: Create primary location with business name
    await ctx.db.insert("business_locations", {
      business_id: businessId,
      is_primary: true,
      is_active: true,
      name: args.name, // Internal location name
      profile_name: args.name, // Customer-facing business name (same as name initially)
      // Required fields with defaults
      address: "",
      city: "",
      state: "",
      zip: "",
      created_at: Date.now(),
      updated_at: Date.now()
    });
    
    console.log("[createBusinessAfterAuth] Created new business with primary location:", businessId);
    return businessId;
  },
});

// Get current business for authenticated user
export const getCurrentBusiness = query({
  args: {},
  handler: async (ctx) => {
    // Get Clerk user identity from context
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }
    
    const clerkUserId = identity.subject;
    
    // Find business linked to this Clerk user
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerkUserId))
      .first();
    
    if (business) {
      // Get primary location data
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();
      
      return mergeBusinessWithLocation(business, primaryLocation);
    }
    
    // Fallback: try to find by email match (for migration period)
    if (identity.email) {
      const businessByEmail = await ctx.db
        .query("businesses")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      
      if (businessByEmail) {
        // Get primary location data
        const primaryLocation = await ctx.db
          .query("business_locations")
          .withIndex("by_business", (q) => q.eq("business_id", businessByEmail._id))
          .filter((q) => q.eq(q.field("is_primary"), true))
          .first();
        
        // Note: Cannot patch in a query, but we can return the business
        // The linking will happen in a mutation when needed
        console.log(`[getCurrentBusiness] Found business by email match for ${identity.email}`);
        return mergeBusinessWithLocation(businessByEmail, primaryLocation);
      }
    }
    
    return null;
  },
});

// Get businesses by Stripe customer ID
// DISABLED: Stripe integration removed
// export const getBusinessesByCustomerId = query({
//   args: { customerId: v.string() },
//   handler: async (ctx, args) => {
//     const businesses = await ctx.db
//       .query("businesses")
//       .collect();
    
//     return businesses.filter(b => b.stripe_customer_id === args.customerId);
//   },
// });

// Get all businesses (for migration purposes)
export const getAllBusinesses = query({
  args: {},
  handler: async (ctx) => {
    // Only return active businesses (filter out archived/deleted ones)
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.neq(q.field("is_active"), false))
      .collect();

    // Fetch all primary locations in a single query (also filter out archived locations)
    const locations = await ctx.db
      .query("business_locations")
      .filter((q) =>
        q.and(
          q.eq(q.field("is_primary"), true),
          q.neq(q.field("is_active"), false)
        )
      )
      .collect();

    // Create a map for O(1) lookup
    const locationsByBusinessId = new Map(
      locations.map(loc => [loc.business_id, loc])
    );

    // Merge businesses with their primary locations
    return businesses.map(business => {
      const primaryLocation = locationsByBusinessId.get(business._id);
      return mergeBusinessWithLocation(business, primaryLocation);
    });
  },
});

// Update subscription limits (for migration)
export const updateLimits = mutation({
  args: {
    businessId: v.id("businesses"),
    max_locations_limit: v.number(),
    max_active_promotions_limit: v.number(),
    max_active_events_limit: v.number(),
  },
  handler: async (ctx, args) => {
    const { businessId, ...limits } = args;
    await ctx.db.patch(businessId, {
      ...limits,
      updated_at: Date.now()
    });
    return { success: true };
  },
});

// Get businesses by category
export const getBusinessesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    // Query active locations by category (location data takes precedence)
    const locations = await ctx.db
      .query("business_locations")
      .filter((q) =>
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("is_primary"), true),
          q.neq(q.field("is_active"), false)
        )
      )
      .collect();

    // Get business auth data for each location
    const businessIds = [...new Set(locations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    // Create map for business data (filter out inactive businesses)
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && b.is_active !== false)
        .map(b => [b!._id, b])
    );

    // Merge and return
    return locations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);
  },
});

// Get businesses by multiple categories (new multi-category support)
export const getBusinessesByCategories = query({
  args: { categories: v.array(v.string()) },
  handler: async (ctx, args) => {
    // Get all primary active locations
    const locations = await ctx.db
      .query("business_locations")
      .filter((q) =>
        q.and(
          q.eq(q.field("is_primary"), true),
          q.neq(q.field("is_active"), false)
        )
      )
      .collect();

    // Filter locations by categories
    const matchingLocations = locations.filter((location) => {
      // Check if location has any of the requested categories
      if (location.categories && location.categories.length > 0) {
        return location.categories.some(cat => args.categories.includes(cat));
      }
      // Fallback to legacy single category field
      if (location.category) {
        return args.categories.includes(location.category);
      }
      return false;
    });

    // Get business auth data
    const businessIds = [...new Set(matchingLocations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    // Create map for business data (filter out inactive businesses)
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && b.is_active !== false)
        .map(b => [b!._id, b])
    );

    // Merge and return
    return matchingLocations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);
  },
});

// Search businesses by location - PUBLIC ONLY for directory
export const searchBusinessesByLocation = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let locations;

    if (args.city && args.state) {
      locations = await ctx.db
        .query("business_locations")
        .withIndex("by_location", (q) =>
          q.eq("city", args.city!).eq("state", args.state!)
        )
        .filter((q) => q.eq(q.field("is_primary"), true))
        .filter((q) => q.eq(q.field("is_active"), true))
        .collect();
    } else {
      // For public directory - only return active primary locations (indexed)
      locations = await ctx.db
        .query("business_locations")
        .withIndex("by_primary_active", q => q.eq("is_primary", true).eq("is_active", true))
        .collect();
    }

    // Get business auth data
    const businessIds = [...new Set(locations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );
    
    // Create map for business data and filter inactive
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && b.is_active !== false)
        .map(b => [b!._id, b])
    );
    
    // Merge and return
    return locations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);
  },
});

// Search businesses by name or description with server-side filters
export const searchBusinesses = query({
  args: {
    searchTerm: v.string(),
    // Optional filters
    categories: v.optional(v.array(v.string())),
    radius: v.optional(v.number()),
    // Support both location object format and separate lat/lng fields
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    })),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const {
      searchTerm,
      categories,
      radius,
      location: locationObj,
      latitude,
      longitude,
      limit = 50,
      includeInactive = false
    } = args;

    // Support both location object and separate lat/lng fields
    const location = locationObj || (latitude !== undefined && longitude !== undefined
      ? { lat: latitude, lng: longitude }
      : undefined);

    // Get all primary active locations for searching
    const locations = await ctx.db
      .query("business_locations")
      .filter((q) =>
        q.and(
          q.eq(q.field("is_primary"), true),
          q.neq(q.field("is_active"), false)
        )
      )
      .collect();

    // Get all active promotions and events for searching
    const promotions = await ctx.db.query("promotions")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    const events = await ctx.db.query("events")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    const searchTermLower = searchTerm.toLowerCase();

    console.log('[searchBusinesses] Search parameters:', {
      searchTerm,
      categories,
      radius,
      location,
      limit,
      includeInactive
    });
    console.log(`[searchBusinesses] Initial locations found: ${locations.length}`);
    console.log(`[searchBusinesses] Active promotions: ${promotions.length}, Active events: ${events.length}`);

    // Filter locations that match search criteria
    let matchingLocations = locations.filter((location) => {
      // Search in location fields (use profile_name for customer-facing search, NOT internal name)
      const locationMatch =
        location.profile_name.toLowerCase().includes(searchTermLower) ||
        location.description?.toLowerCase().includes(searchTermLower) ||
        location.category?.toLowerCase().includes(searchTermLower) ||
        location.address?.toLowerCase().includes(searchTermLower) ||
        location.city?.toLowerCase().includes(searchTermLower);

      if (locationMatch) return true;

      // Search in business promotions
      const businessPromotions = promotions.filter(p => p.business_id === location.business_id);
      const promotionMatch = businessPromotions.some(promotion =>
        promotion.title?.toLowerCase().includes(searchTermLower) ||
        promotion.description?.toLowerCase().includes(searchTermLower) ||
        promotion.terms_conditions?.toLowerCase().includes(searchTermLower)
      );

      if (promotionMatch) return true;

      // Search in business events
      const businessEvents = events.filter(e => e.business_id === location.business_id);
      const eventMatch = businessEvents.some(event =>
        event.title?.toLowerCase().includes(searchTermLower) ||
        event.description?.toLowerCase().includes(searchTermLower)
      );

      return eventMatch;
    });

    console.log(`[searchBusinesses] After search term filter: ${matchingLocations.length} locations`);

    // Check if specific business is in results
    const targetBusinessId = "q578sd1bwdk0ntrg5543bfw8157vbegr";
    const targetInResults = matchingLocations.find(loc => loc._id === targetBusinessId);
    if (targetInResults) {
      console.log(`[searchBusinesses] ✓ Target business ${targetBusinessId} FOUND after search term filter`);
    } else {
      const wasInInitial = locations.find(loc => loc._id === targetBusinessId);
      if (wasInInitial) {
        console.log(`[searchBusinesses] ✗ Target business ${targetBusinessId} was in initial results but FILTERED OUT by search term`);
        console.log(`[searchBusinesses] Business name: "${wasInInitial.name}", category: "${wasInInitial.category}", city: "${wasInInitial.city}"`);
      } else {
        console.log(`[searchBusinesses] ✗ Target business ${targetBusinessId} NOT in initial results (not primary or inactive)`);
      }
    }

    // Filter by category
    if (categories && categories.length > 0) {
      matchingLocations = matchingLocations.filter(location =>
        location.category && categories.includes(location.category)
      );
      console.log(`[searchBusinesses] After category filter (${categories.join(', ')}): ${matchingLocations.length} locations`);
    }

    // Filter by radius (if location provided)
    if (location && radius) {
      const locationsWithCoords = matchingLocations.filter(loc =>
        loc.latitude !== undefined && loc.longitude !== undefined
      ).map(loc => ({
        ...loc,
        latitude: loc.latitude!,
        longitude: loc.longitude!
      }));

      const withinRadius = filterByRadius(
        locationsWithCoords,
        location.lat,
        location.lng,
        radius
      );

      // Create set of location IDs within radius
      const withinRadiusIds = new Set(withinRadius.map(loc => loc._id));
      matchingLocations = matchingLocations.filter(loc => withinRadiusIds.has(loc._id));
      console.log(`[searchBusinesses] After radius filter (${radius} miles from ${location.lat},${location.lng}): ${matchingLocations.length} locations`);
    }

    // Get business auth data for matching locations
    const businessIds = [...new Set(matchingLocations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    // Create map for business data and filter inactive if needed
    const businessesBeforeFilter = businesses.filter(b => b !== null).length;
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && (includeInactive || b.is_active !== false))
        .map(b => [b!._id, b])
    );

    console.log(`[searchBusinesses] Businesses: ${businessesBeforeFilter} total, ${businessMap.size} active (filtered ${businessesBeforeFilter - businessMap.size} inactive)`);

    // Merge and return with limit
    const results = matchingLocations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);

    console.log(`[searchBusinesses] After merge: ${results.length} results (before limit)`);
    console.log(`[searchBusinesses] Final results: ${Math.min(results.length, limit)} (limit: ${limit})`);

    if (results.length > limit) {
      console.log(`[searchBusinesses] ⚠️  ${results.length - limit} results excluded due to limit`);
    }

    return results.slice(0, limit);
  },
});

// Create a new business
export const createBusiness = mutation({
  args: {
    // Authentication fields
    email: v.string(),
    password_hash: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    email_verified: v.optional(v.boolean()),
    clerk_user_id: v.optional(v.string()),
    
    // Business fields
    name: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),
    twitter_url: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    tiktok_url: v.optional(v.string()),
    pinterest_url: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    logo_id: v.optional(v.string()),
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    serviceZip: v.optional(v.string()),
    serviceRadius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),
    business_hours: v.optional(v.any()),
    public_business_email: v.optional(v.string()),
    contact_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if business with this email already exists
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingBusiness) {
      throw new Error("Business with this email already exists");
    }

    // DUAL-TABLE PATTERN: Separate auth fields from profile fields
    const businessData = {
      // Auth fields only
      email: args.email,
      password_hash: args.password_hash,
      clerk_user_id: args.clerk_user_id,
      first_name: args.first_name || "",
      last_name: args.last_name || "",
      name: args.name, // Keep name for identification
      is_active: args.is_active ?? true,
      email_verified: args.email_verified ?? false,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    // Create business with auth fields only
    const businessId = await ctx.db.insert("businesses", businessData);
    
    // DUAL-TABLE PATTERN: Create primary location with profile data
    const locationData = {
      business_id: businessId,
      is_primary: true,
      is_active: true,
      name: args.name, // Internal location name
      profile_name: args.name, // Customer-facing business name (same as name initially)
      description: args.description || "",
      address: args.address || "",
      city: args.city || "",
      state: args.state || "",
      zip: args.zip || "",
      phone: args.phone || "",
      website: args.website || "",
      facebook_url: args.facebook_url || "",
      instagram_url: args.instagram_url || "",
      twitter_url: args.twitter_url || "",
      linkedin_url: args.linkedin_url || "",
      tiktok_url: args.tiktok_url || "",
      pinterest_url: args.pinterest_url || "",
      logo_url: args.logo_url || "",
      logo_id: args.logo_id || "",
      category: args.category || "",
      categories: args.categories || [],
      latitude: args.latitude,
      longitude: args.longitude,
      service_zip: args.serviceZip || "",
      service_radius: args.serviceRadius || 0,
      business_hours: args.business_hours || null,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    
    await ctx.db.insert("business_locations", locationData);
    
    console.log(`[createBusiness] Created business ${businessId} with primary location`);
    return businessId;
  },
});

// Update business
export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    updates: v.object({
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
      facebook_url: v.optional(v.string()),
      instagram_url: v.optional(v.string()),
      twitter_url: v.optional(v.string()),
      linkedin_url: v.optional(v.string()),
      tiktok_url: v.optional(v.string()),
      pinterest_url: v.optional(v.string()),
      logo_url: v.optional(v.string()),
      logo_id: v.optional(v.string()),
      category: v.optional(v.string()),
        categories: v.optional(v.array(v.string())),
        latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      serviceZip: v.optional(v.string()),
      serviceRadius: v.optional(v.number()),
      customersDoNotVisit: v.optional(v.boolean()),
      business_hours: v.optional(v.any()),
      public_business_email: v.optional(v.string()),
      contact_email: v.optional(v.string()),
      // stripe_customer_id: v.optional(v.string()), // Removed - using Clerk billing
      // stripe_subscription_id: v.optional(v.string()), // Removed - using Clerk billing
      subscription_plan: v.optional(v.union(
        v.literal("starter"), v.literal("professional"), v.literal("enterprise"), // Legacy plan IDs
        v.literal("bronze"), v.literal("gold"), v.literal("diamond") // New tier-based plan IDs
      )),
      subscription_status: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due"), v.literal("unpaid"), v.literal("trialing"))),
      subscription_tier: v.optional(v.union(v.literal("bronze"), v.literal("gold"), v.literal("diamond"))),
      subscription_created_at: v.optional(v.number()),
      subscription_current_period_start: v.optional(v.number()),
      subscription_current_period_end: v.optional(v.number()),
      subscription_updated_at: v.optional(v.number()),
      // Pending subscription changes (for downgrades)
      pending_subscription_plan: v.optional(v.union(
        v.literal("starter"), v.literal("professional"), v.literal("enterprise"), // Legacy plan IDs
        v.literal("bronze"), v.literal("gold"), v.literal("diamond") // New tier-based plan IDs
      )),
      pending_subscription_tier: v.optional(v.union(v.literal("bronze"), v.literal("gold"), v.literal("diamond"))),
      subscription_pending_change_at: v.optional(v.number()),
      onboarding_completed_at: v.optional(v.number()),
      // Dual naming fields for business locations
      internal_name: v.optional(v.string()),
      profile_name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    console.log('[updateBusiness] 🔍 Received args:', args);
    console.log('[updateBusiness] 🔍 Updates object:', args.updates);
    console.log('[updateBusiness] 🔍 Business hours in updates:', args.updates.business_hours);
    
    // Validate and auto-correct social media URLs
    const { validatedUpdates, errors, warnings } = validateBusinessSocialMedia(args.updates);
    
    // If there are critical errors, throw with detailed message
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join('; ');
      
      // Return structured error for frontend to handle
      throw new Error(JSON.stringify({
        type: 'VALIDATION_ERROR',
        field: 'social_media',
        errors,
        message: `Please fix the following URL issues: ${errorMessages}`
      }));
    }
    
    // Log warnings for auto-corrections
    if (Object.keys(warnings).length > 0) {
      console.log('[updateBusiness] ⚠️ Auto-corrected URLs:', warnings);
    }
    
    // Ensure category field is set if only categories array is provided
    if (validatedUpdates.categories && validatedUpdates.categories.length > 0 && !validatedUpdates.category) {
      validatedUpdates.category = validatedUpdates.categories[0];
      console.log('[updateBusiness] Auto-setting category from categories[0]:', validatedUpdates.category);
    }
    
    // DUAL-WRITE PATTERN: Separate fields for each table
    
    // 1. Fields that stay in businesses table (auth/subscription only)
    const businessTableFields: any = {};
    const authFields = ['email', 'first_name', 'last_name', 
                       // NOTE: public_business_email and contact_email go to locations table only
                       // 'stripe_customer_id', 'stripe_subscription_id', // Removed - using Clerk billing 
                       'subscription_plan', 'subscription_status', 'subscription_tier',
                       'subscription_created_at', 'subscription_current_period_start',
                       'subscription_current_period_end', 'subscription_updated_at',
                       'pending_subscription_plan', 'pending_subscription_tier',
                       'subscription_pending_change_at', 'onboarding_completed_at'];
    
    authFields.forEach(field => {
      if (field in validatedUpdates) {
        businessTableFields[field] = validatedUpdates[field as keyof typeof validatedUpdates];
      }
    });
    
    // 2. Fields that go to business_locations (profile/location data)
    const locationTableFields: any = {};
    const locationFields = ['description', 'address', 'city', 'state', 'zip',
                           'phone', 'website', 'facebook_url', 'instagram_url', 
                           'twitter_url', 'linkedin_url', 'tiktok_url', 'pinterest_url',
                           'logo_url', 'logo_id', 'category', 'categories',
                           'latitude', 'longitude', 'business_hours',
                           'public_business_email', 'contact_email',
                           'internal_name', 'profile_name']; // Added dual naming fields
    
    // Debug log for dual naming fields
    console.log('[updateBusiness] 🔍 Checking dual naming fields:');
    console.log('[updateBusiness] - internal_name in validatedUpdates:', 'internal_name' in validatedUpdates, '=', validatedUpdates.internal_name);
    console.log('[updateBusiness] - profile_name in validatedUpdates:', 'profile_name' in validatedUpdates, '=', validatedUpdates.profile_name);
    
    locationFields.forEach(field => {
      if (field in validatedUpdates) {
        // Convert serviceZip/serviceRadius field names for location table
        if (field === 'serviceZip') {
          locationTableFields['service_zip'] = validatedUpdates[field as keyof typeof validatedUpdates];
        } else if (field === 'serviceRadius') {
          locationTableFields['service_radius'] = validatedUpdates[field as keyof typeof validatedUpdates];
        } else if (field === 'internal_name') {
          // Map internal_name from form to name field in location table
          console.log('[updateBusiness] 🔍 Mapping internal_name to name:', validatedUpdates[field as keyof typeof validatedUpdates]);
          locationTableFields['name'] = validatedUpdates[field as keyof typeof validatedUpdates];
        } else if (field === 'public_business_email' || field === 'contact_email') {
          // Map public_business_email or contact_email to email field in location table
          // Use public_business_email if available, otherwise use contact_email
          console.log(`[updateBusiness] 📧 Mapping ${field} to location email:`, validatedUpdates[field as keyof typeof validatedUpdates]);
          if (!locationTableFields['email']) {
            locationTableFields['email'] = validatedUpdates[field as keyof typeof validatedUpdates];
          }
        } else {
          locationTableFields[field] = validatedUpdates[field as keyof typeof validatedUpdates];
        }
      }
    });
    
    console.log('[updateBusiness] 🔍 Final locationTableFields:', locationTableFields);
    
    // Handle service area fields with proper naming
    if ('serviceZip' in validatedUpdates) {
      locationTableFields['service_zip'] = validatedUpdates.serviceZip;
    }
    if ('serviceRadius' in validatedUpdates) {
      locationTableFields['service_radius'] = validatedUpdates.serviceRadius;
    }
    
    // 3. Update businesses table with auth/subscription fields only
    if (Object.keys(businessTableFields).length > 0) {
      await ctx.db.patch(args.businessId, businessTableFields);
    }
    
    // 4. Update or create primary location with profile data
    if (Object.keys(locationTableFields).length > 0) {
      // Find existing primary location
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();
      
      if (primaryLocation) {
        // Update existing primary location
        await ctx.db.patch(primaryLocation._id, {
          ...locationTableFields,
          updated_at: Date.now(),
        });
      } else {
        // Create primary location if it doesn't exist
        await ctx.db.insert("business_locations", {
          business_id: args.businessId,
          is_primary: true,
          is_active: true,
          ...locationTableFields,
          // Provide defaults for required fields if not present
          name: locationTableFields.name || "",
          profile_name: locationTableFields.profile_name || locationTableFields.name || "", // Customer-facing business name
          address: locationTableFields.address || "",
          city: locationTableFields.city || "",
          state: locationTableFields.state || "",
          zip: locationTableFields.zip || "",
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
    }
    
    // 5. Fetch updated business with merged location data
    const updatedBusiness = await ctx.db.get(args.businessId);
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // Merge for response (using our helper function)
    const mergedBusiness = mergeBusinessWithLocation(updatedBusiness, primaryLocation);
    
    console.log('[updateBusiness] 🔍 Updated business from DB:', mergedBusiness);
    console.log('[updateBusiness] 🔍 Business hours after update:', mergedBusiness?.business_hours);
    
    // Check if onboarding requirements are met to mark onboarding as complete
    if (mergedBusiness && !mergedBusiness.onboarding_completed_at) {
      // Detailed logging for debugging
      console.log('[updateBusiness] Checking onboarding completion for business:', mergedBusiness._id);
      console.log('[updateBusiness] Business fields:', {
        name: mergedBusiness.name,
        description: mergedBusiness.description,
        phone: mergedBusiness.phone,
        category: mergedBusiness.category,
        address: mergedBusiness.address,
        city: mergedBusiness.city,
        state: mergedBusiness.state,
        zip: mergedBusiness.zip,
        serviceZip: mergedBusiness.serviceZip,
        serviceRadius: mergedBusiness.serviceRadius,
        customersDoNotVisit: mergedBusiness.customersDoNotVisit,
      });
      
      const onboardingComplete = calculateOnboardingCompleteness(mergedBusiness);
      const profileCompleteness = calculateProfileCompleteness(mergedBusiness);
      
      console.log('[updateBusiness] Onboarding complete:', onboardingComplete);
      console.log('[updateBusiness] Profile completeness:', profileCompleteness + '%');
      
      // If all required fields for onboarding are present, mark onboarding as complete
      if (onboardingComplete) {
        console.log('[updateBusiness] All required fields present, marking onboarding as completed');
        await ctx.db.patch(args.businessId, {
          onboarding_completed_at: Date.now(),
        });
        
        // Return merged business with onboarding status
        mergedBusiness.onboarding_completed_at = Date.now();
        return {
          business: mergedBusiness,
          warnings: Object.keys(warnings).length > 0 ? warnings : undefined,
          onboardingCompleted: true
        };
      } else {
        console.log('[updateBusiness] Onboarding NOT complete - missing required fields');
      }
    } else if (mergedBusiness?.onboarding_completed_at) {
      console.log('[updateBusiness] Onboarding already completed at:', mergedBusiness.onboarding_completed_at);
    }
    
    // Return the merged business along with any warnings
    return {
      business: mergedBusiness,
      warnings: Object.keys(warnings).length > 0 ? warnings : undefined
    };
  },
});

// Validate social media URLs without saving
export const validateSocialMediaUrls = query({
  args: {
    facebook_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),
    twitter_url: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    tiktok_url: v.optional(v.string()),
    pinterest_url: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { validatedUpdates, errors, warnings } = validateBusinessSocialMedia(args);
    
    return {
      isValid: Object.keys(errors).length === 0,
      validatedUrls: validatedUpdates,
      errors,
      warnings,
      suggestions: {
        facebook: args.facebook_url && errors.facebook_url ? 
          'Example: https://facebook.com/yourbusiness' : undefined,
        instagram: args.instagram_url && errors.instagram_url ? 
          'Example: https://instagram.com/yourbusiness' : undefined,
        twitter: args.twitter_url && errors.twitter_url ? 
          'Example: https://x.com/yourbusiness' : undefined,
        linkedin: args.linkedin_url && errors.linkedin_url ? 
          'Example: https://linkedin.com/company/yourbusiness' : undefined,
        tiktok: args.tiktok_url && errors.tiktok_url ? 
          'Example: https://tiktok.com/@yourbusiness' : undefined,
        pinterest: args.pinterest_url && errors.pinterest_url ? 
          'Example: https://pinterest.com/yourbusiness' : undefined,
        website: args.website && errors.website ? 
          'Example: https://yourdomain.com' : undefined,
      }
    };
  },
});

// Update business hours (dual-write pattern)
export const updateBusinessHours = mutation({
  args: {
    businessId: v.id("businesses"),
    business_hours: v.any(),
  },
  handler: async (ctx, args) => {
    // Business hours belong in business_locations table
    // Find and update primary location
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    if (primaryLocation) {
      // Update existing primary location
      await ctx.db.patch(primaryLocation._id, {
        business_hours: args.business_hours,
        updated_at: Date.now(),
      });
    } else {
      // Create primary location if it doesn't exist
      const business = await ctx.db.get(args.businessId);
      if (!business) {
        throw new Error("Business not found");
      }
      
      await ctx.db.insert("business_locations", {
        business_id: args.businessId,
        is_primary: true,
        is_active: true,
        name: business.name || "",
        profile_name: business.name || "", // Customer-facing business name (same as name initially)
        business_hours: args.business_hours,
        // Required fields with defaults
        address: "",
        city: "",
        state: "",
        zip: "",
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }
    
    // Return merged business data
    const business = await ctx.db.get(args.businessId);
    const updatedLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    return mergeBusinessWithLocation(business, updatedLocation);
  },
});

// Get businesses with complete profiles
export const getCompleteProfiles = query({
  args: {},
  handler: async (ctx) => {
    // Get all primary locations with complete profiles
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_primary_active", q => q.eq("is_primary", true).eq("is_active", true))
      .collect();
    
    // Filter for complete profiles
    const completeLocations = locations.filter(
      (location) =>
        location.name &&
        location.description &&
        (location.logo_url || location.logo_id) &&
        location.phone
    );
    
    // Get business auth data
    const businessIds = [...new Set(completeLocations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    // Create map and filter for active businesses with email
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && b.email && b.is_active !== false)
        .map(b => [b!._id, b])
    );

    // Merge and return
    return completeLocations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);
  },
});


// Get nearby businesses (requires lat/lng)
export const getNearbyBusinesses = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all primary locations
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_primary_active", q => q.eq("is_primary", true).eq("is_active", true))
      .collect();
    const radius = args.radiusKm || 10;

    // Filter locations by distance
    const nearbyLocations = locations.filter((location) => {
      if (!location.latitude || !location.longitude) return false;

      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = ((location.latitude - args.latitude) * Math.PI) / 180;
      const dLon = ((location.longitude - args.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((args.latitude * Math.PI) / 180) *
          Math.cos((location.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= radius;
    });
    
    // Get business auth data
    const businessIds = [...new Set(nearbyLocations.map(loc => loc.business_id))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    // Create map for business data (filter out inactive businesses)
    const businessMap = new Map(
      businesses
        .filter(b => b !== null && b.is_active !== false)
        .map(b => [b!._id, b])
    );

    // Merge and return
    return nearbyLocations
      .map(location => {
        const business = businessMap.get(location.business_id);
        if (!business) return null;
        return mergeBusinessWithLocation(business, location);
      })
      .filter(b => b !== null);
  },
});

// Get business statistics
export const getBusinessStats = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    // Get business details
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get follower count
    const followers = await ctx.db
      .query("business_followers")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();
    const followerCount = followers.length;

    // Get promotions
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();

    // Count active promotions
    const now = Date.now();
    const activePromotions = promotions.filter(
      (p) => p.status === "active" && p.start_date <= now && p.end_date >= now
    );

    // Calculate total redemptions across all promotions
    const totalRedemptions = promotions.reduce(
      (sum, p) => sum + (p.redemption_count || 0),
      0
    );

    // Calculate average rating (if value_rating is used)
    const ratedPromotions = promotions.filter((p) => p.value_rating && p.value_rating > 0);
    const averageRating = ratedPromotions.length > 0
      ? ratedPromotions.reduce((sum, p) => sum + (p.value_rating || 0), 0) / ratedPromotions.length
      : 0;

    return {
      businessId: args.businessId,
      followerCount,
      totalPromotions: promotions.length,
      activePromotions: activePromotions.length,
      totalRedemptions,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      subscription: {
        plan: business.subscription_plan || null,
        status: business.subscription_status || null,
        tier: business.subscription_tier || null,
      },
      profileCompleteness: calculateProfileCompleteness(business),
    };
  },
});

// Helper function to calculate profile completeness
// Calculate if onboarding is complete (all required fields present)
function calculateOnboardingCompleteness(business: any): boolean {
  // Core required fields for onboarding
  const hasName = !!business.name;
  const hasDescription = !!business.description;
  const hasPhone = !!business.phone;
  const hasCategory = !!business.category;
  
  // Location requirement - either physical address OR service area
  const hasPhysicalAddress = !!(business.address && business.city && business.state && business.zip);
  const hasServiceArea = !!(business.serviceZip && business.serviceRadius);
  const hasValidLocation = hasPhysicalAddress || hasServiceArea;
  
  // Debug logging
  console.log('[calculateOnboardingCompleteness] Field checks:', {
    hasName,
    hasDescription,
    hasPhone,
    hasCategory,
    hasPhysicalAddress,
    hasServiceArea,
    hasValidLocation,
    customersDoNotVisit: business.customersDoNotVisit,
  });
  
  // All required fields must be present for onboarding to be complete
  const isComplete = hasName && hasDescription && hasPhone && hasCategory && hasValidLocation;
  console.log('[calculateOnboardingCompleteness] Result:', isComplete);
  
  return isComplete;
}

// Calculate overall profile completeness percentage (includes optional fields)
function calculateProfileCompleteness(business: any): number {
  // Core required fields (always required)
  const coreRequiredFields = [
    'name',
    'description',
    'phone',
    'category',
  ];
  
  // Physical address is always required
  const hasPhysicalAddress = business.address && business.city && business.state && business.zip;
  
  // Service area is required if customersDoNotVisit is true
  const hasRequiredServiceArea = !business.customersDoNotVisit || 
    (business.customersDoNotVisit && business.serviceZip && business.serviceRadius);
  
  const hasValidLocation = hasPhysicalAddress && hasRequiredServiceArea;
  
  const optionalButImportantFields = [
    'logo_url',
    'logo_id',
    'website',
    'business_hours',
    'public_business_email',
  ];

  let score = 0;
  let total = coreRequiredFields.length + 1 + optionalButImportantFields.length; // +1 for location requirement

  // Check core required fields
  coreRequiredFields.forEach(field => {
    if (business[field]) score++;
  });

  // Check location requirement (either address or service area)
  if (hasValidLocation) score++;

  // Check optional but important fields
  optionalButImportantFields.forEach(field => {
    if (field === 'logo_url' || field === 'logo_id') {
      if (business.logo_url || business.logo_id) {
        score++;
        return;
      }
    } else if (business[field]) {
      score++;
    }
  });

  return Math.round((score / total) * 100);
}

// Delete business (basic - deletes business and associated locations)
export const deleteBusiness = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    // Delete all associated locations first
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const location of locations) {
      await ctx.db.delete(location._id);
    }
    
    // Then delete the business
    await ctx.db.delete(args.businessId);
    
    console.log(`[deleteBusiness] Deleted business ${args.businessId} and ${locations.length} location(s)`);
    return true;
  },
});

// Comprehensive business deletion - removes EVERYTHING linked to the business
export const deleteBusinessCompletely = mutation({
  args: { 
    businessId: v.id("businesses"),
    confirmDeletion: v.optional(v.boolean()) // Safety check
  },
  handler: async (ctx, args) => {
    // Safety check - require explicit confirmation
    if (!args.confirmDeletion) {
      throw new Error("Please confirm deletion by setting confirmDeletion: true");
    }
    
    // First, verify the business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error(`Business ${args.businessId} not found`);
    }
    
    console.log(`[DeleteBusiness] Starting comprehensive deletion for business: ${business.name} (${args.businessId})`);
    
    const deletionReport = {
      businessName: business.name,
      businessEmail: business.email,
      businessId: args.businessId,
      deletedRecords: {
        promotions: 0,
        payments: 0,
        followers: 0,
        newsletterReservations: 0,
        businessPhotos: 0,
        menuCategories: 0,
        menuItems: 0,
        businessEvents: 0,
        businessLocations: 0,
        tierBoosts: 0,
        emailChangeRequests: 0,
        passwordChangeRequests: 0,
        giveawayPartners: 0,
        savedContent: 0,
      }
    };
    
    // 1. Delete all promotions
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const promotion of promotions) {
      await ctx.db.delete(promotion._id);
      deletionReport.deletedRecords.promotions++;
    }
    
    // 2. Delete all payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
      deletionReport.deletedRecords.payments++;
    }
    
    // 3. Delete all followers
    const followers = await ctx.db
      .query("business_followers")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const follower of followers) {
      await ctx.db.delete(follower._id);
      deletionReport.deletedRecords.followers++;
    }
    
    // 4. Delete newsletter reservations
    const newsletters = await ctx.db
      .query("newsletter_reservations")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const newsletter of newsletters) {
      await ctx.db.delete(newsletter._id);
      deletionReport.deletedRecords.newsletterReservations++;
    }
    
    // 5. Analytics events don't exist in current schema - skip this section
    // If you add analytics_events table later, uncomment this section
    
    // 6. Delete business photos
    const photos = await ctx.db
      .query("business_photos")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const photo of photos) {
      await ctx.db.delete(photo._id);
      deletionReport.deletedRecords.businessPhotos++;
    }
    
    // 7. Delete menu categories and items
    const menuCategories = await ctx.db
      .query("business_menu_categories")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const category of menuCategories) {
      // First delete all menu items in this category
      const menuItems = await ctx.db
        .query("business_menu_items")
        .withIndex("by_category", q => q.eq("category_id", category._id))
        .collect();
      
      for (const item of menuItems) {
        await ctx.db.delete(item._id);
        deletionReport.deletedRecords.menuItems++;
      }
      
      await ctx.db.delete(category._id);
      deletionReport.deletedRecords.menuCategories++;
    }
    
    // Also delete any menu items directly linked to business (without category)
    const directMenuItems = await ctx.db
      .query("business_menu_items")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const item of directMenuItems) {
      await ctx.db.delete(item._id);
      deletionReport.deletedRecords.menuItems++;
    }
    
    // 8. Delete business events
    const events = await ctx.db
      .query("events")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const event of events) {
      await ctx.db.delete(event._id);
      deletionReport.deletedRecords.businessEvents++;
    }
    
    // 9. Delete business locations
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const location of locations) {
      await ctx.db.delete(location._id);
      deletionReport.deletedRecords.businessLocations++;
    }
    
    // 10. Delete tier boosts
    const boosts = await ctx.db
      .query("tier_boosts")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();
    
    for (const boost of boosts) {
      await ctx.db.delete(boost._id);
      deletionReport.deletedRecords.tierBoosts++;
    }
    
    // 11. Delete email change requests
    const emailRequests = await ctx.db
      .query("emailChangeRequests")
      .withIndex("by_business", q => q.eq("businessId", args.businessId))
      .collect();
    
    for (const request of emailRequests) {
      await ctx.db.delete(request._id);
      deletionReport.deletedRecords.emailChangeRequests++;
    }
    
    // 12. Delete password change requests
    const passwordRequests = await ctx.db
      .query("passwordChangeRequests")
      .withIndex("by_business", q => q.eq("businessId", args.businessId))
      .collect();
    
    for (const request of passwordRequests) {
      await ctx.db.delete(request._id);
      deletionReport.deletedRecords.passwordChangeRequests++;
    }
    
    // 13. Check for giveaways where this business is a partner
    const giveaways = await ctx.db
      .query("giveaways")
      .collect();
    
    for (const giveaway of giveaways) {
      if (giveaway.partner_business_id === args.businessId) {
        // Remove the partner business reference
        await ctx.db.patch(giveaway._id, {
          partner_business_id: undefined,
          require_partner_follow: false
        });
        deletionReport.deletedRecords.giveawayPartners++;
        console.log(`[DeleteBusiness] Removed as partner from giveaway: ${giveaway.title}`);
      }
    }
    
    // 14. Delete any saved content (users saving this business's promotions)
    // Note: We're keeping the saved_content records but the promotions are already deleted
    // This is intentional to maintain user history
    
    // 15. Finally, delete the business itself
    await ctx.db.delete(args.businessId);
    
    console.log(`[DeleteBusiness] Completed deletion for business: ${business.name}`);
    console.log(`[DeleteBusiness] Deletion report:`, deletionReport);
    
    return {
      success: true,
      message: `Successfully deleted business "${business.name}" and all related data`,
      report: deletionReport
    };
  },
});

// Delete business and all related data by Clerk user ID
export const deleteBusinessByClerkId = mutation({
  args: {
    clerkUserId: v.string(),
    confirmDeletion: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Safety check - require explicit confirmation
    if (!args.confirmDeletion) {
      throw new Error("Please confirm deletion by setting confirmDeletion: true");
    }

    // Find the business by clerk_user_id
    const business = await ctx.db
      .query("businesses")
      .filter(q => q.eq(q.field("clerk_user_id"), args.clerkUserId))
      .first();

    if (!business) {
      throw new Error(`No business found with Clerk user ID: ${args.clerkUserId}`);
    }

    console.log(`[DeleteBusinessByClerkId] Found business: ${business.name} (${business._id})`);

    // Now use the existing comprehensive deletion logic
    const businessId = business._id;

    console.log(`[DeleteBusiness] Starting comprehensive deletion for business: ${business.name} (${businessId})`);

    const deletionReport = {
      businessName: business.name,
      businessEmail: business.email,
      businessId: businessId,
      clerkUserId: args.clerkUserId,
      deletedRecords: {
        promotions: 0,
        payments: 0,
        followers: 0,
        newsletterReservations: 0,
        businessPhotos: 0,
        galleryPhotos: 0,
        menuCategories: 0,
        menuItems: 0,
        businessEvents: 0,
        businessLocations: 0,
        tierBoosts: 0,
        emailChangeRequests: 0,
        passwordChangeRequests: 0,
        giveawayPartners: 0,
        subscriptions: 0,
      }
    };

    // 1. Delete all promotions
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const promotion of promotions) {
      await ctx.db.delete(promotion._id);
      deletionReport.deletedRecords.promotions++;
    }

    // 2. Delete all payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const payment of payments) {
      await ctx.db.delete(payment._id);
      deletionReport.deletedRecords.payments++;
    }

    // 3. Delete all followers
    const followers = await ctx.db
      .query("business_followers")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const follower of followers) {
      await ctx.db.delete(follower._id);
      deletionReport.deletedRecords.followers++;
    }

    // 4. Delete newsletter reservations
    const newsletters = await ctx.db
      .query("newsletter_reservations")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const newsletter of newsletters) {
      await ctx.db.delete(newsletter._id);
      deletionReport.deletedRecords.newsletterReservations++;
    }

    // 5. Delete business photos
    const photos = await ctx.db
      .query("business_photos")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const photo of photos) {
      await ctx.db.delete(photo._id);
      deletionReport.deletedRecords.businessPhotos++;
    }

    // 6. Delete gallery photos
    const galleryPhotos = await ctx.db
      .query("gallery_photos")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const photo of galleryPhotos) {
      await ctx.db.delete(photo._id);
      deletionReport.deletedRecords.galleryPhotos++;
    }

    // 7. Delete menu categories and items
    const menuCategories = await ctx.db
      .query("business_menu_categories")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const category of menuCategories) {
      // First delete all menu items in this category
      const menuItems = await ctx.db
        .query("business_menu_items")
        .withIndex("by_category", q => q.eq("category_id", category._id))
        .collect();

      for (const item of menuItems) {
        await ctx.db.delete(item._id);
        deletionReport.deletedRecords.menuItems++;
      }

      await ctx.db.delete(category._id);
      deletionReport.deletedRecords.menuCategories++;
    }

    // Also delete any menu items directly linked to business (without category)
    const directMenuItems = await ctx.db
      .query("business_menu_items")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const item of directMenuItems) {
      await ctx.db.delete(item._id);
      deletionReport.deletedRecords.menuItems++;
    }

    // 8. Delete business events
    const events = await ctx.db
      .query("events")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
      deletionReport.deletedRecords.businessEvents++;
    }

    // 9. Delete business locations
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const location of locations) {
      await ctx.db.delete(location._id);
      deletionReport.deletedRecords.businessLocations++;
    }

    // 10. Delete tier boosts
    const boosts = await ctx.db
      .query("tier_boosts")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const boost of boosts) {
      await ctx.db.delete(boost._id);
      deletionReport.deletedRecords.tierBoosts++;
    }

    // 11. Delete email change requests
    const emailRequests = await ctx.db
      .query("emailChangeRequests")
      .withIndex("by_business", q => q.eq("businessId", businessId))
      .collect();

    for (const request of emailRequests) {
      await ctx.db.delete(request._id);
      deletionReport.deletedRecords.emailChangeRequests++;
    }

    // 12. Delete password change requests
    const passwordRequests = await ctx.db
      .query("passwordChangeRequests")
      .withIndex("by_business", q => q.eq("businessId", businessId))
      .collect();

    for (const request of passwordRequests) {
      await ctx.db.delete(request._id);
      deletionReport.deletedRecords.passwordChangeRequests++;
    }

    // 13. Check for giveaways where this business is a partner
    const giveaways = await ctx.db
      .query("giveaways")
      .collect();

    for (const giveaway of giveaways) {
      if (giveaway.partner_business_id === businessId) {
        // Remove the partner business reference
        await ctx.db.patch(giveaway._id, {
          partner_business_id: undefined,
          require_partner_follow: false
        });
        deletionReport.deletedRecords.giveawayPartners++;
        console.log(`[DeleteBusiness] Removed as partner from giveaway: ${giveaway.title}`);
      }
    }

    // 14. Delete business subscriptions
    const subscriptions = await ctx.db
      .query("business_subscriptions")
      .withIndex("by_business", q => q.eq("business_id", businessId))
      .collect();

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id);
      deletionReport.deletedRecords.subscriptions++;
    }

    // 15. Finally, delete the business itself
    await ctx.db.delete(businessId);

    console.log(`[DeleteBusiness] Completed deletion for business: ${business.name}`);
    console.log(`[DeleteBusiness] Deletion report:`, deletionReport);

    return {
      success: true,
      message: `Successfully deleted business "${business.name}" and all related data`,
      report: deletionReport
    };
  },
});

// Clean up deprecated fields from all businesses
export const cleanupDeprecatedFields = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    let updated = 0;
    for (const business of businesses) {
      const cleanBusiness = { ...business };
      let hasChanges = false;
      
      // Remove deprecated fields if they exist
      if ('banner_id' in cleanBusiness) {
        delete (cleanBusiness as any).banner_id;
        hasChanges = true;
      }
      if ('banner_url' in cleanBusiness) {
        delete (cleanBusiness as any).banner_url;
        hasChanges = true;
      }
      if ('subcategory' in cleanBusiness) {
        delete (cleanBusiness as any).subcategory;
        hasChanges = true;
      }
      if ('subcategories' in cleanBusiness) {
        delete (cleanBusiness as any).subcategories;
        hasChanges = true;
      }
      if ('trial_end' in cleanBusiness) {
        delete (cleanBusiness as any).trial_end;
        hasChanges = true;
      }
      if ('user_id' in cleanBusiness) {
        delete (cleanBusiness as any).user_id;
        hasChanges = true;
      }
      if ('onboarding_completed' in cleanBusiness) {
        delete (cleanBusiness as any).onboarding_completed;
        hasChanges = true;
      }
      if ('email_verified' in cleanBusiness) {
        delete (cleanBusiness as any).email_verified;
        hasChanges = true;
      }
      
      if (hasChanges) {
        await ctx.db.replace(business._id, cleanBusiness);
        updated++;
      }
    }
    
    return {
      message: `Cleaned up ${updated} businesses`,
      updated,
      total: businesses.length
    };
  },
});

// Migration: Remove email_verified field (Clerk handles this now)
export const removeEmailVerifiedField = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    let updated = 0;
    let skipped = 0;
    
    for (const business of businesses) {
      if ('email_verified' in business) {
        // Create a clean copy without email_verified
        const cleanBusiness = { ...business };
        delete (cleanBusiness as any).email_verified;
        
        // Replace the document
        await ctx.db.replace(business._id, cleanBusiness);
        updated++;
        console.log(`[Migration] Removed email_verified from business ${business._id} (${business.email})`);
      } else {
        skipped++;
      }
    }
    
    return {
      message: `Removed email_verified field from ${updated} businesses`,
      updated,
      skipped,
      total: businesses.length
    };
  },
});

// Migration: Remove old onboarding_completed boolean field
export const migrateOnboardingField = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    let migrated = 0;
    let skipped = 0;
    
    for (const business of businesses) {
      // Check if business has the old boolean field
      if ('onboarding_completed' in business) {
        const cleanBusiness = { ...business };
        
        // Remove the old boolean field
        delete (cleanBusiness as any).onboarding_completed;
        
        // Replace the document with the cleaned version
        await ctx.db.replace(business._id, cleanBusiness);
        migrated++;
        
        console.log(`[Migration] Removed onboarding_completed boolean from business ${business._id}`);
      } else {
        skipped++;
      }
    }
    
    return {
      message: `Migration complete: Removed onboarding_completed boolean from ${migrated} businesses`,
      migrated,
      skipped,
      total: businesses.length
    };
  },
});

// Backfill onboarding_completed fields for businesses with active subscriptions
export const backfillOnboardingStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    let updated = 0;
    let skipped = 0;
    
    for (const business of businesses) {
      // Check if business has active subscription but no onboarding_completed_at timestamp
      const hasActiveSubscription = business.subscription_status === 'active';
      const missingOnboardingTimestamp = !business.onboarding_completed_at;
      
      if (hasActiveSubscription && missingOnboardingTimestamp) {
        // Set onboarding completion timestamp
        await ctx.db.patch(business._id, {
          onboarding_completed_at: business.subscription_created_at || Date.now(),
        });
        updated++;
      } else {
        skipped++;
      }
    }
    
    return {
      message: `Updated ${updated} businesses with onboarding status`,
      updated,
      skipped,
      total: businesses.length
    };
  },
});

// Backfill category field from categories array (works with business_locations)
export const backfillCategoryFromCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query("business_locations").collect();
    
    let updated = 0;
    let skipped = 0;
    let alreadyHasCategory = 0;
    
    for (const location of locations) {
      // If location has categories array but no category field, use first item
      if (location.categories && location.categories.length > 0 && !location.category) {
        await ctx.db.patch(location._id, {
          category: location.categories[0],
        });
        updated++;
        console.log(`[Backfill] Set category to "${location.categories[0]}" for location ${location._id}`);
      } else if (location.category) {
        alreadyHasCategory++;
      } else {
        skipped++;
      }
    }
    
    return {
      message: `Backfilled category field for ${updated} locations`,
      updated,
      skipped,
      alreadyHasCategory,
      total: locations.length
    };
  },
});

// Bulk create businesses for seeding/testing
export const bulkCreateBusinesses = mutation({
  args: {
    businesses: v.array(v.object({
      // Core required fields for profile completeness
      email: v.string(),
      name: v.string(),
      description: v.string(), // Required for profile completeness
      phone: v.string(),       // Required for profile completeness  
      category: v.string(),    // Required for profile completeness
      
      // Optional authentication fields
      password_hash: v.optional(v.string()),
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      is_active: v.optional(v.boolean()),
      email_verified: v.optional(v.boolean()),
      
      // Contact emails
      contact_email: v.optional(v.string()),
      public_business_email: v.optional(v.string()),
      
      // Business profile fields  
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      website: v.optional(v.string()),
      
      // Categories
        categories: v.optional(v.array(v.string())),
        
      // Location
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      geocoded_address: v.optional(v.string()),
      geocoded_at: v.optional(v.number()),
      serviceZip: v.optional(v.string()),
      serviceRadius: v.optional(v.number()),
      customersDoNotVisit: v.optional(v.boolean()),
      
      // Images
      logo_url: v.optional(v.string()),
      logo_id: v.optional(v.string()),
      
      // Social media
      facebook_url: v.optional(v.string()),
      instagram_url: v.optional(v.string()),
      twitter_url: v.optional(v.string()),
      linkedin_url: v.optional(v.string()),
      tiktok_url: v.optional(v.string()),
      pinterest_url: v.optional(v.string()),
      
      // Business hours (JSON object)
      business_hours: v.optional(v.any()),
      
      // Subscription fields
      subscription_plan: v.optional(v.union(
        v.literal("starter"), v.literal("professional"), v.literal("enterprise"), // Legacy plan IDs
        v.literal("bronze"), v.literal("gold"), v.literal("diamond") // New tier-based plan IDs
      )),
      subscription_status: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due"), v.literal("unpaid"), v.literal("trialing"), v.literal("incomplete"), v.literal("incomplete_expired"))),
      subscription_tier: v.optional(v.union(v.literal("bronze"), v.literal("gold"), v.literal("diamond"))),
      // stripe_customer_id: v.optional(v.string()), // Removed - using Clerk billing
      // stripe_subscription_id: v.optional(v.string()), // Removed - using Clerk billing
    }))
  },
  handler: async (ctx, args) => {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < args.businesses.length; i++) {
      const business = args.businesses[i];
      
      try {
        // Validate required fields
        if (!business.email || !business.name || !business.description || !business.phone || !business.category) {
          errors.push({
            index: i,
            email: business.email || 'unknown',
            error: `Missing required fields: email, name, description, phone, and category are all required`
          });
          continue;
        }

        // Validate location requirement - physical address is always required
        const hasPhysicalAddress = business.address && business.city && business.state && business.zip;
        
        if (!hasPhysicalAddress) {
          errors.push({
            index: i,
            email: business.email,
            error: `Physical address required: provide address, city, state, and zip`
          });
          continue;
        }
        
        // If customersDoNotVisit is true, service area is also required
        if (business.customersDoNotVisit && (!business.serviceZip || !business.serviceRadius)) {
          errors.push({
            index: i,
            email: business.email,
            error: `Service area required when customersDoNotVisit is true: provide serviceZip and serviceRadius`
          });
          continue;
        }
        
        // Check if business with this email already exists
        const existingBusiness = await ctx.db
          .query("businesses")
          .withIndex("by_email", (q) => q.eq("email", business.email))
          .first();
          
        if (existingBusiness) {
          errors.push({
            index: i,
            email: business.email,
            error: `Business with email ${business.email} already exists`
          });
          continue;
        }
        
        // Clean up subscription_status to remove "trialing" if present
        const cleanedSubscriptionStatus = business.subscription_status === "trialing" 
          ? "active" 
          : business.subscription_status;
        
        // DUAL-TABLE PATTERN: Separate auth fields from profile fields
        // Extract auth fields for businesses table
        const businessData = {
          email: business.email,
          name: business.name,
          first_name: business.first_name || "",
          last_name: business.last_name || "",
          password_hash: business.password_hash,
          is_active: business.is_active ?? true,
          // Subscription fields stay in businesses table
          subscription_plan: business.subscription_plan,
          subscription_status: cleanedSubscriptionStatus,
          subscription_tier: business.subscription_tier,
          // stripe_customer_id: business.stripe_customer_id, // Removed - using Clerk billing
          // stripe_subscription_id: business.stripe_subscription_id, // Removed - using Clerk billing
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        
        // Create the business with auth fields only
        const businessId = await ctx.db.insert("businesses", businessData);
        
        // DUAL-TABLE PATTERN: Create primary location with profile data
        const locationData = {
          business_id: businessId,
          is_primary: true,
          is_active: true,
          name: business.name, // Internal location name
          profile_name: business.name, // Customer-facing business name (same as name initially)
          description: business.description,
          phone: business.phone,
          category: business.category,
          categories: business.categories || [],
          // Address fields
          address: business.address || "",
          city: business.city || "",
          state: business.state || "",
          zip: business.zip || "",
          service_zip: business.serviceZip || "",
          service_radius: business.serviceRadius || 0,
          // Contact email (unified field)
          email: business.public_business_email || business.contact_email || business.email,
          // Location coordinates
          latitude: business.latitude,
          longitude: business.longitude,
          geocoded_address: business.geocoded_address,
          geocoded_at: business.geocoded_at,
          // Business details
          website: business.website || "",
          business_hours: business.business_hours || null,
          logo_url: business.logo_url || "",
          logo_id: business.logo_id || "",
          // Social media
          facebook_url: business.facebook_url || "",
          instagram_url: business.instagram_url || "",
          twitter_url: business.twitter_url || "",
          linkedin_url: business.linkedin_url || "",
          tiktok_url: business.tiktok_url || "",
          pinterest_url: business.pinterest_url || "",
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        
        await ctx.db.insert("business_locations", locationData);
        
        results.push({
          index: i,
          businessId,
          email: business.email,
          name: business.name,
          success: true
        });
      } catch (error) {
        errors.push({
          index: i,
          email: business.email,
          error: `Failed to create business: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    return {
      success: results,
      errors: errors,
      totalCreated: results.length,
      totalErrors: errors.length,
      totalAttempted: args.businesses.length
    };
  },
});

// Update business coordinates (dual-write pattern)
export const updateBusinessCoordinates = mutation({
  args: {
    businessId: v.id("businesses"),
    latitude: v.number(),
    longitude: v.number(),
    geocoded_address: v.optional(v.string()),
    geocoded_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Coordinates belong in business_locations table
    // Find and update primary location
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    const locationUpdate = {
      latitude: args.latitude,
      longitude: args.longitude,
      geocoded_address: args.geocoded_address,
      geocoded_at: args.geocoded_at || Date.now(),
      updated_at: Date.now(),
    };
    
    if (primaryLocation) {
      // Update existing primary location
      await ctx.db.patch(primaryLocation._id, locationUpdate);
    } else {
      // Create primary location if it doesn't exist
      const business = await ctx.db.get(args.businessId);
      if (!business) {
        throw new Error("Business not found");
      }
      
      await ctx.db.insert("business_locations", {
        business_id: args.businessId,
        is_primary: true,
        is_active: true,
        name: business.name || "",
        profile_name: business.name || "", // Customer-facing business name (same as name initially)
        ...locationUpdate,
        // Required fields with defaults
        address: "",
        city: "",
        state: "",
        zip: "",
        created_at: Date.now(),
      });
    }
    
    // Return merged business data
    const business = await ctx.db.get(args.businessId);
    const updatedLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    return mergeBusinessWithLocation(business, updatedLocation);
  },
});

// Bulk geocode businesses that have addresses but no coordinates (works with locations)
export const bulkGeocodeBusinesses = mutation({
  args: {
    businessIds: v.optional(v.array(v.id("businesses"))), // Optional: specific business IDs
    limit: v.optional(v.number()), // Optional: limit number of businesses to geocode
  },
  handler: async (ctx, args) => {
    let locationsToGeocode = [];
    
    if (args.businessIds && args.businessIds.length > 0) {
      // Get primary locations for specific businesses
      for (const businessId of args.businessIds) {
        const primaryLocation = await ctx.db
          .query("business_locations")
          .withIndex("by_business", (q) => q.eq("business_id", businessId))
          .filter((q) => q.eq(q.field("is_primary"), true))
          .first();
        
        if (primaryLocation) {
          locationsToGeocode.push(primaryLocation);
        }
      }
    } else {
      // Find all primary locations that have addresses but no coordinates
      const allLocations = await ctx.db
        .query("business_locations")
        .filter((q) => q.eq(q.field("is_primary"), true))
        .collect();
      
      locationsToGeocode = allLocations.filter(location => {
        const hasAddress = location.address && location.city && location.state;
        const hasCoordinates = location.latitude && location.longitude;
        return hasAddress && !hasCoordinates;
      });
    }
    
    // Apply limit if specified
    if (args.limit && args.limit > 0) {
      locationsToGeocode = locationsToGeocode.slice(0, args.limit);
    }
    
    const results = {
      total: locationsToGeocode.length,
      geocoded: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    console.log(`Starting geocoding for ${locationsToGeocode.length} locations...`);
    
    for (const location of locationsToGeocode) {
      try {
        if (!location.address || !location.city || !location.state) {
          results.errors.push({
            locationId: location._id,
            businessId: location.business_id,
            name: location.name,
            error: "Missing address components"
          });
          results.failed++;
          continue;
        }
        
        const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip || ''}`.trim();
        
        // Note: This is a placeholder for actual geocoding
        // You'll need to integrate with a geocoding service like Google Maps, Mapbox, etc.
        console.log(`Would geocode: ${fullAddress} for location: ${location.name}`);
        
        // For now, we'll skip the actual geocoding and just mark it as attempted
        // In a real implementation, you'd call your geocoding service here
        // and then update the location with:
        // await ctx.db.patch(location._id, {
        //   latitude: geocodedLat,
        //   longitude: geocodedLng,
        //   geocoded_address: formattedAddress,
        //   geocoded_at: Date.now(),
        //   updated_at: Date.now(),
        // });
        
        results.geocoded++;
        
      } catch (error) {
        results.errors.push({
          locationId: location._id,
          businessId: location.business_id,
          name: location.name,
          error: error instanceof Error ? error.message : String(error)
        });
        results.failed++;
      }
    }
    
    return results;
  },
});

// Complete business onboarding (marks as fully set up) - dual-write pattern
export const completeBusinessOnboarding = mutation({
  args: {
    businessId: v.id("businesses"),
    onboardingData: v.object({
      // Required for completion
      name: v.string(),
      description: v.string(),
      phone: v.string(),
      category: v.string(),
      
      // Location (either physical address OR service area required)
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      serviceZip: v.optional(v.string()),
      serviceRadius: v.optional(v.number()),
      customersDoNotVisit: v.optional(v.boolean()),
      
      // Optional but recommended
        website: v.optional(v.string()),
      logo_url: v.optional(v.string()),
      logo_id: v.optional(v.string()),
      business_hours: v.optional(v.any()),
      public_business_email: v.optional(v.string()),
      
      // Social media
      facebook_url: v.optional(v.string()),
      instagram_url: v.optional(v.string()),
      twitter_url: v.optional(v.string()),
      linkedin_url: v.optional(v.string()),
      tiktok_url: v.optional(v.string()),
      pinterest_url: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    // DUAL-WRITE PATTERN: Update business with auth fields only
    await ctx.db.patch(args.businessId, {
      name: args.onboardingData.name, // Only the name stays in businesses table
      onboarding_completed_at: Date.now(),
      updated_at: Date.now(),
    });
    
    // Find or create the primary location
    let primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // Prepare location data
    const locationData = {
      name: args.onboardingData.name, // Internal location name
      profile_name: args.onboardingData.name, // Customer-facing business name (same as name initially)
      description: args.onboardingData.description,
      phone: args.onboardingData.phone,
      category: args.onboardingData.category,
      address: args.onboardingData.address || "",
      city: args.onboardingData.city || "",
      state: args.onboardingData.state || "",
      zip: args.onboardingData.zip || "",
      latitude: args.onboardingData.latitude,
      longitude: args.onboardingData.longitude,
      service_zip: args.onboardingData.serviceZip || "",
      service_radius: args.onboardingData.serviceRadius || 0,
      website: args.onboardingData.website || "",
      logo_url: args.onboardingData.logo_url || "",
      logo_id: args.onboardingData.logo_id || "",
      business_hours: args.onboardingData.business_hours || null,
      email: args.onboardingData.public_business_email || "",
      // Social media
      facebook_url: args.onboardingData.facebook_url || "",
      instagram_url: args.onboardingData.instagram_url || "",
      twitter_url: args.onboardingData.twitter_url || "",
      linkedin_url: args.onboardingData.linkedin_url || "",
      tiktok_url: args.onboardingData.tiktok_url || "",
      pinterest_url: args.onboardingData.pinterest_url || "",
      updated_at: Date.now(),
    };
    
    if (primaryLocation) {
      // Update existing location
      await ctx.db.patch(primaryLocation._id, locationData);
    } else {
      // Create primary location if it doesn't exist
      await ctx.db.insert("business_locations", {
        business_id: args.businessId,
        is_primary: true,
        is_active: true,
        ...locationData,
        created_at: Date.now(),
      });
    }
    
    // Return the merged business data
    const updatedBusiness = await ctx.db.get(args.businessId);
    const updatedLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    return mergeBusinessWithLocation(updatedBusiness, updatedLocation);
  },
});

// Mark onboarding as complete for a specific business (checks location data)
export const markOnboardingAsComplete = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    console.log(`[markOnboardingAsComplete] Marking onboarding complete for business: ${args.businessId}`);
    
    // Get the business to check current state
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Get primary location for profile data
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();
    
    // Merge business and location data for checking
    const mergedBusiness = mergeBusinessWithLocation(business, primaryLocation);
    
    // Check if baseline fields are complete (now checking from merged data)
    const hasBusinessName = !!mergedBusiness.name;
    const hasLogo = !!mergedBusiness.logo_url;
    const hasAddress = !!(mergedBusiness.address && mergedBusiness.city && mergedBusiness.state && mergedBusiness.zip);
    const hasServiceArea = !!(mergedBusiness.serviceZip && mergedBusiness.serviceRadius);
    const hasLocation = hasAddress || hasServiceArea;
    const hasPhone = !!mergedBusiness.phone;
    const hasCategory = !!mergedBusiness.category;
    
    const hasBaselineFields = hasBusinessName && hasLogo && hasLocation && hasPhone && hasCategory;
    
    if (!hasBaselineFields) {
      console.warn('[markOnboardingAsComplete] Business does not have all baseline fields:', {
        hasBusinessName,
        hasLogo,
        hasLocation,
        hasPhone,
        hasCategory
      });
    }
    
    // Update the onboarding_completed_at timestamp in businesses table
    await ctx.db.patch(args.businessId, {
      onboarding_completed_at: Date.now(),
      updated_at: Date.now(),
    });
    
    console.log(`[markOnboardingAsComplete] Successfully marked onboarding complete for business: ${args.businessId}`);
    
    // Return the merged business data
    const updatedBusiness = await ctx.db.get(args.businessId);
    const updatedLocation = primaryLocation ? await ctx.db.get(primaryLocation._id) : null;
    return mergeBusinessWithLocation(updatedBusiness, updatedLocation);
  },
});

// Get all photos for a business using the new gallery_photos system
export const getBusinessPhotos = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    console.log(`[getBusinessPhotos] Querying photos for business: ${args.businessId}`);
    
    // Get all gallery photos for this business (from the new system)
    const galleryPhotos = await ctx.db
      .query("gallery_photos")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();

    console.log(`[getBusinessPhotos] Found ${galleryPhotos.length} gallery photos:`, galleryPhotos);

    // Get location names for organization
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .collect();

    const locationMap = new Map(locations.map(loc => [loc._id, loc.name]));

    // Transform gallery photos to match expected format
    const transformedPhotos = galleryPhotos.map(photo => ({
      id: photo._id,
      business_id: photo.business_id,
      image_id: photo.image_id,
      image_url: photo.image_url || `https://imagedelivery.net/oHneE33gQKYCWaM5v3qjCg/${photo.image_id}/public`,
      caption: photo.caption || '',
      alt_text: photo.alt_text || '',
      photo_type: photo.photo_type,
      gallery_name: photo.gallery_name,
      is_featured: photo.is_featured || false,
      display_order: photo.display_order,
      source_location_name: locationMap.get(photo.location_id) || 'Unknown Location',
      location_id: photo.location_id,
    }));

    // Sort by location name, then by gallery name, then by display order
    return transformedPhotos.sort((a, b) => {
      if (a.source_location_name !== b.source_location_name) {
        return a.source_location_name.localeCompare(b.source_location_name);
      }
      if (a.gallery_name !== b.gallery_name) {
        return a.gallery_name.localeCompare(b.gallery_name);
      }
      return a.display_order - b.display_order;
    });
  },
});

// Link a business to an auth user (for auth migration)
export const linkToAuthUser = mutation({
  args: {
    businessId: v.id("businesses"),
    authUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.businessId, {
      auth_user_id: args.authUserId,
      updated_at: Date.now(),
    });
    
    console.log(`[Businesses] Linked business ${args.businessId} to auth user ${args.authUserId}`);
    return await ctx.db.get(args.businessId);
  },
});

// Archive/soft-delete a business when Clerk user is deleted
export const archiveBusinessForDeletedUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[archiveBusinessForDeletedUser] Archiving business for deleted Clerk user:", args.clerkUserId);
    
    // Find the business by Clerk user ID
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();
    
    if (!business) {
      console.log("[archiveBusinessForDeletedUser] No business found for Clerk user:", args.clerkUserId);
      return { success: false, message: "No business found" };
    }
    
    const now = Date.now();
    const deletionReason = args.reason || "clerk_user_deleted";
    
    console.log("[archiveBusinessForDeletedUser] Found business to archive:", {
      businessId: business._id,
      businessName: business.name,
      email: business.email,
    });
    
    // 1. Archive the business itself
    await ctx.db.patch(business._id, {
      is_active: false,
      deleted_at: now,
      deletion_reason: deletionReason,
      updated_at: now,
      // Optionally anonymize personal data for GDPR compliance
      // Keeping email for potential recovery, but could be anonymized
      // email: `deleted_${business._id}@archived.local`,
      // first_name: "Deleted",
      // last_name: "User",
    });
    
    // 2. Archive all business locations
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();
    
    for (const location of locations) {
      await ctx.db.patch(location._id, {
        is_active: false,
        deleted_at: now,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${locations.length} locations`);
    
    // 3. Archive all active promotions
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => 
        q.and(
          q.neq(q.field("status"), "archived"),
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "expired")
        )
      )
      .collect();
    
    for (const promotion of promotions) {
      await ctx.db.patch(promotion._id, {
        status: "archived" as const,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${promotions.length} promotions`);
    
    // 4. Archive all active events
    const events = await ctx.db
      .query("events")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => 
        q.and(
          q.neq(q.field("status"), "archived"),
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "completed")
        )
      )
      .collect();
    
    for (const event of events) {
      await ctx.db.patch(event._id, {
        status: "archived" as const,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${events.length} events`);
    
    // 5. Remove all business followers
    const followers = await ctx.db
      .query("business_followers")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();
    
    for (const follower of followers) {
      await ctx.db.delete(follower._id);
    }
    console.log(`[archiveBusinessForDeletedUser] Removed ${followers.length} followers`);
    
    // 6. Archive tier boosts
    const tierBoosts = await ctx.db
      .query("tier_boosts")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    for (const boost of tierBoosts) {
      await ctx.db.patch(boost._id, {
        status: "cancelled" as const,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Cancelled ${tierBoosts.length} tier boosts`);
    
    // 7. Cancel any active Clerk subscriptions
    if (business.clerk_subscription_id && business.clerk_subscription_status === "active") {
      console.log("[archiveBusinessForDeletedUser] Business had active subscription - will be cancelled by Clerk");
      // Clerk will handle subscription cancellation when user is deleted
      // Just update our records
      await ctx.db.patch(business._id, {
        clerk_subscription_status: "cancelled",
        subscription_status: "cancelled",
        subscription_updated_at: now,
      });
    }
    
    // 8. Archive business photos
    const businessPhotos = await ctx.db
      .query("business_photos")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();

    for (const photo of businessPhotos) {
      await ctx.db.patch(photo._id, {
        deleted_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${businessPhotos.length} business photos`);

    // 9. Archive gallery photos
    const galleryPhotos = await ctx.db
      .query("gallery_photos")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();

    for (const photo of galleryPhotos) {
      await ctx.db.patch(photo._id, {
        deleted_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${galleryPhotos.length} gallery photos`);

    // 10. Archive menu categories
    const menuCategories = await ctx.db
      .query("business_menu_categories")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();

    for (const category of menuCategories) {
      await ctx.db.patch(category._id, {
        is_active: false,
        deleted_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${menuCategories.length} menu categories`);

    // 11. Archive menu items
    const menuItems = await ctx.db
      .query("business_menu_items")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();

    for (const item of menuItems) {
      await ctx.db.patch(item._id, {
        is_active: false as boolean,
        deleted_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${menuItems.length} menu items`);

    // 12. Archive menu item photos
    const menuItemPhotos = await ctx.db
      .query("menu_item_photos")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .collect();

    for (const photo of menuItemPhotos) {
      await ctx.db.patch(photo._id, {
        deleted_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Archived ${menuItemPhotos.length} menu item photos`);

    // 13. Cancel newsletter reservations
    const newsletters = await ctx.db
      .query("newsletter_reservations")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const newsletter of newsletters) {
      await ctx.db.patch(newsletter._id, {
        status: "cancelled" as const,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Cancelled ${newsletters.length} newsletter reservations`);

    // 14. Delete email and password change requests
    const emailRequests = await ctx.db
      .query("emailChangeRequests")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    for (const request of emailRequests) {
      await ctx.db.delete(request._id);
    }
    console.log(`[archiveBusinessForDeletedUser] Deleted ${emailRequests.length} email change requests`);

    const passwordRequests = await ctx.db
      .query("passwordChangeRequests")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    for (const request of passwordRequests) {
      await ctx.db.delete(request._id);
    }
    console.log(`[archiveBusinessForDeletedUser] Deleted ${passwordRequests.length} password change requests`);

    // 15. Remove from giveaways as partner
    const giveaways = await ctx.db
      .query("giveaways")
      .collect();

    let giveawayPartnerships = 0;
    for (const giveaway of giveaways) {
      if (giveaway.partner_business_id === business._id) {
        await ctx.db.patch(giveaway._id, {
          partner_business_id: undefined,
          require_partner_follow: false,
        });
        giveawayPartnerships++;
        console.log(`[archiveBusinessForDeletedUser] Removed as partner from giveaway: ${giveaway.title}`);
      }
    }
    console.log(`[archiveBusinessForDeletedUser] Removed from ${giveawayPartnerships} giveaway partnerships`);

    // 16. Cancel business subscriptions (separate from Clerk subscriptions)
    const subscriptions = await ctx.db
      .query("business_subscriptions")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const subscription of subscriptions) {
      await ctx.db.patch(subscription._id, {
        status: "cancelled" as const,
        cancelled_at: now,
        updated_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Cancelled ${subscriptions.length} business subscriptions`);

    // 17. Archive business notifications
    const notifications = await ctx.db
      .query("business_notifications")
      .withIndex("by_business", (q) => q.eq("business_id", business._id))
      .filter((q) => q.eq(q.field("is_read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        is_read: true,
        read_at: now,
      });
    }
    console.log(`[archiveBusinessForDeletedUser] Marked ${notifications.length} notifications as read`);

    // Note: Keeping payment records for financial/legal compliance
    // Note: Saved items and coupon claims are user-side data, not shown in business listings

    console.log("[archiveBusinessForDeletedUser] Successfully archived business and all related data");

    return {
      success: true,
      message: "Business and all related data archived",
      archivedData: {
        businessId: business._id,
        businessName: business.name,
        locationsArchived: locations.length,
        promotionsArchived: promotions.length,
        eventsArchived: events.length,
        followersRemoved: followers.length,
        boostsCancelled: tierBoosts.length,
        businessPhotosArchived: businessPhotos.length,
        galleryPhotosArchived: galleryPhotos.length,
        menuCategoriesArchived: menuCategories.length,
        menuItemsArchived: menuItems.length,
        menuItemPhotosArchived: menuItemPhotos.length,
        newslettersArchived: newsletters.length,
        emailRequestsDeleted: emailRequests.length,
        passwordRequestsDeleted: passwordRequests.length,
        giveawayPartnershipsRemoved: giveawayPartnerships,
        subscriptionsCancelled: subscriptions.length,
        notificationsCleared: notifications.length,
      },
    };
  },
});

// Hard delete businesses that have been soft-deleted for more than 90 days (GDPR compliance)
// This runs daily via cron job
export const hardDeleteExpiredBusinesses = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000); // 90 days in milliseconds

    console.log("[hardDeleteExpiredBusinesses] Starting hard delete for businesses deleted before:", new Date(ninetyDaysAgo).toISOString());

    // Find all businesses that were soft-deleted more than 90 days ago
    const expiredBusinesses = await ctx.db
      .query("businesses")
      .filter((q) =>
        q.and(
          q.eq(q.field("is_active"), false),
          q.neq(q.field("deleted_at"), undefined),
          q.lt(q.field("deleted_at"), ninetyDaysAgo)
        )
      )
      .collect();

    console.log(`[hardDeleteExpiredBusinesses] Found ${expiredBusinesses.length} businesses to hard delete`);

    let deletedCount = 0;

    for (const business of expiredBusinesses) {
      try {
        console.log(`[hardDeleteExpiredBusinesses] Hard deleting business:`, {
          id: business._id,
          name: business.name,
          deletedAt: new Date(business.deleted_at!).toISOString(),
          clerkUserId: business.clerk_user_id,
        });

        // 1. Delete all business locations
        const locations = await ctx.db
          .query("business_locations")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const location of locations) {
          await ctx.db.delete(location._id);
        }

        // 2. Delete all promotions
        const promotions = await ctx.db
          .query("promotions")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const promotion of promotions) {
          await ctx.db.delete(promotion._id);
        }

        // 3. Delete all events
        const events = await ctx.db
          .query("events")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const event of events) {
          await ctx.db.delete(event._id);
        }

        // 4. Delete all followers
        const followers = await ctx.db
          .query("business_followers")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const follower of followers) {
          await ctx.db.delete(follower._id);
        }

        // 5. Delete all tier boosts
        const tierBoosts = await ctx.db
          .query("tier_boosts")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const boost of tierBoosts) {
          await ctx.db.delete(boost._id);
        }

        // 6. Delete all notifications
        const notifications = await ctx.db
          .query("business_notifications")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const notification of notifications) {
          await ctx.db.delete(notification._id);
        }

        // 7. Delete business photos (if any)
        const photos = await ctx.db
          .query("business_photos")
          .withIndex("by_business", (q) => q.eq("business_id", business._id))
          .collect();
        for (const photo of photos) {
          await ctx.db.delete(photo._id);
        }

        // 8. Finally, delete the business itself
        await ctx.db.delete(business._id);

        deletedCount++;
        console.log(`[hardDeleteExpiredBusinesses] Successfully hard deleted business ${business._id} and all related data`);

      } catch (error) {
        console.error(`[hardDeleteExpiredBusinesses] Error deleting business ${business._id}:`, error);
        // Continue with next business even if one fails
      }
    }

    console.log(`[hardDeleteExpiredBusinesses] Hard delete complete. Deleted ${deletedCount} of ${expiredBusinesses.length} businesses`);

    return {
      success: true,
      businessesDeleted: deletedCount,
      businessesFound: expiredBusinesses.length,
    };
  },
});

// Mark businesses with complete profiles as onboarding complete (checks location data)
export const markCompleteProfilesAsOnboarded = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    let updated = 0;
    let skipped = 0;
    const updatedBusinesses = [];
    
    for (const business of businesses) {
      // Skip if already marked as onboarded
      if (business.onboarding_completed_at) {
        skipped++;
        continue;
      }
      
      // Get primary location for this business
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();
      
      // Merge business and location data
      const mergedBusiness = mergeBusinessWithLocation(business, primaryLocation);
      
      // Check if merged business has required fields for a complete profile
      const hasRequiredFields = !!(
        mergedBusiness.name && 
        mergedBusiness.phone && 
        mergedBusiness.address && 
        mergedBusiness.city && 
        mergedBusiness.state
      );
      
      // If has required fields, mark as onboarding complete
      if (hasRequiredFields) {
        await ctx.db.patch(business._id, {
          onboarding_completed_at: Date.now(),
          updated_at: Date.now(),
        });
        updated++;
        updatedBusinesses.push({
          id: business._id,
          email: business.email,
          name: mergedBusiness.name
        });
        console.log(`[markCompleteProfilesAsOnboarded] Marked complete: ${business.email}`);
      } else {
        skipped++;
      }
    }
    
    return {
      success: true,
      updated,
      skipped,
      total: businesses.length,
      updatedBusinesses,
      message: `Marked ${updated} businesses with complete profiles as onboarding complete`,
    };
  },
});

// DISABLED: Stripe integration removed - using Clerk billing
// // Get all businesses with Stripe customer IDs
// export const getAllBusinessesWithStripe = query({
//   args: {},
//   handler: async (ctx) => {
//     const businesses = await ctx.db
//       .query("businesses")
//       .filter((q) => q.neq(q.field("stripe_customer_id"), undefined))
//       .collect();
    
//     return businesses.filter(b => 
//       b.stripe_customer_id && 
//       !b.stripe_customer_id.startsWith('cus_local_')
//     );
//   },
// });
// 
// // Sync business email with Stripe (manual sync/verification)
// export const syncBusinessEmailWithStripe = mutation({
//   args: { 
//     businessId: v.id("businesses"),
//     forceSync: v.optional(v.boolean()), // Force sync even if emails appear to match
//   },
//   handler: async (ctx, args) => {
//     // Import stripe service dynamically to avoid circular dependencies
//     const stripeService = await import("./services/stripeService");
//     
//     // Get the business
//     const business = await ctx.db.get(args.businessId);
//     if (!business) {
//       throw new Error("Business not found");
//     }
//     
//     // Check if business has Stripe customer
//     if (!business.stripe_customer_id) {
//       console.log(`[syncBusinessEmailWithStripe] Business ${args.businessId} has no Stripe customer`);
//       return {
//         success: false,
//         message: "No Stripe customer associated with this business",
//         businessEmail: business.email,
//       };
//     }
//     
//     try {
//       // Get current Stripe customer to verify email
//       const stripe = stripeService.getStripeClient();
//       const customer = await stripe.customers.retrieve(business.stripe_customer_id);
//       
//       if ('deleted' in customer && customer.deleted) {
//         console.warn(`[syncBusinessEmailWithStripe] Stripe customer ${business.stripe_customer_id} is deleted`);
//         return {
//           success: false,
//           message: "Stripe customer has been deleted",
//           businessEmail: business.email,
//         };
//       }
//       
//       const stripeEmail = 'email' in customer ? customer.email : null;
//       const needsSync = args.forceSync || stripeEmail !== business.email;
//       
//       if (needsSync && business.email) {
//         console.log(`[syncBusinessEmailWithStripe] Syncing email from ${stripeEmail} to ${business.email}`);
//         
//         // Update Stripe customer email
//         await stripeService.updateStripeCustomerEmail(
//           business.stripe_customer_id,
//           business.email
//         );
//         
//         // Update sync metadata in business
//         await ctx.db.patch(args.businessId, {
//           stripe_email_synced_at: Date.now(),
//           updated_at: Date.now(),
//         });
//         
//         console.log(`[syncBusinessEmailWithStripe] Successfully synced email for business ${args.businessId}`);
//         
//         return {
//           success: true,
//           message: "Email successfully synced with Stripe",
//           businessEmail: business.email,
//           stripeEmailBefore: stripeEmail,
//           stripeEmailAfter: business.email,
//         };
//       } else {
//         console.log(`[syncBusinessEmailWithStripe] Emails already match, no sync needed`);
//         
//         return {
//           success: true,
//           message: "Email already in sync with Stripe",
//           businessEmail: business.email,
//           stripeEmail: stripeEmail,
//         };
//       }
//     } catch (error) {
//       console.error(`[syncBusinessEmailWithStripe] Error syncing email:`, error);
//       
//       return {
//         success: false,
//         message: `Failed to sync email: ${error instanceof Error ? error.message : String(error)}`,
//         businessEmail: business.email,
//       };
//     }
//   },
// });
// 
// // Verify all business Stripe email sync status
// export const verifyAllStripeEmailSync = query({
//   args: {},
//   handler: async (ctx) => {
//     // Import stripe service dynamically
//     const stripeService = await import("./services/stripeService");
//     const stripe = stripeService.getStripeClient();
//     
//     // Get all businesses with Stripe customers
//     const businesses = await ctx.db
//       .query("businesses")
//       .filter((q) => q.neq(q.field("stripe_customer_id"), undefined))
//       .collect();
//     
//     const syncStatus = [];
//     
//     for (const business of businesses) {
//       if (!business.stripe_customer_id || business.stripe_customer_id.startsWith('cus_local_')) {
//         continue; // Skip local test customers
//       }
//       
//       try {
//         const customer = await stripe.customers.retrieve(business.stripe_customer_id);
//         
//         if ('deleted' in customer && customer.deleted) {
//           syncStatus.push({
//             businessId: business._id,
//             businessEmail: business.email,
//             businessName: business.name,
//             status: 'deleted',
//             stripeEmail: null,
//             inSync: false,
//           });
//         } else {
//           const stripeEmail = 'email' in customer ? customer.email : null;
//           const inSync = stripeEmail === business.email;
//           
//           syncStatus.push({
//             businessId: business._id,
//             businessEmail: business.email,
//             businessName: business.name,
//             status: 'active',
//             stripeEmail: stripeEmail,
//             inSync: inSync,
//           });
//         }
//       } catch (error) {
//         syncStatus.push({
//           businessId: business._id,
//           businessEmail: business.email,
//           businessName: business.name,
//           status: 'error',
//           stripeEmail: null,
//           inSync: false,
//           error: error instanceof Error ? error.message : String(error),
//         });
//       }
//     }
//     
//     const outOfSync = syncStatus.filter(s => !s.inSync);
//     
//     return {
//       total: syncStatus.length,
//       inSync: syncStatus.filter(s => s.inSync).length,
//       outOfSync: outOfSync.length,
//       deleted: syncStatus.filter(s => s.status === 'deleted').length,
//       errors: syncStatus.filter(s => s.status === 'error').length,
//       details: syncStatus,
//       outOfSyncBusinesses: outOfSync,
//     };
//   },
// });
// 
// // Update business subscription data from Clerk Billing
// export const updateBusinessSubscription = mutation({
//   args: {
//     businessId: v.id("businesses"),
//     subscriptionData: v.object({
//       clerk_subscription_id: v.optional(v.string()),
//       stripe_subscription_id: v.optional(v.string()), // Keep for backwards compatibility
//       subscription_plan: v.optional(v.string()), // Now using Clerk plan IDs like cplan_33CNogWHAplBFWy0wtXZZ5hoC7S
//       subscription_tier: v.optional(v.union(
//         v.literal("none"),
//         v.literal("bronze"), 
//         v.literal("gold"), 
//         v.literal("diamond")
//       )),
//       subscription_status: v.optional(v.union(
//         v.literal("active"),
//         v.literal("cancelled"),
//         v.literal("past_due"),
//         v.literal("unpaid"),
//         v.literal("incomplete"),
//         v.literal("incomplete_expired"),
//         v.literal("trialing"),
//         v.literal("none")
//       )),
//       subscription_current_period_end: v.optional(v.number()),
//       subscription_created_at: v.optional(v.number()),
//       subscription_updated_at: v.optional(v.number()),
//     }),
//   },
//   handler: async (ctx, { businessId, subscriptionData }) => {
//     await ctx.db.patch(businessId, {
//       ...subscriptionData,
//       updated_at: Date.now(),
//     });
//     
//     return { success: true };
//   },
// });

// Track user sign-ins for welcome message customization
export const trackSignIn = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let business;
    
    // Find business by ID or Clerk user ID
    if (args.businessId) {
      business = await ctx.db.get(args.businessId);
    } else if (args.clerkUserId) {
      business = await ctx.db
        .query("businesses")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
        .first();
    }
    
    if (!business) {
      console.log("[trackSignIn] Business not found");
      return { success: false, message: "Business not found" };
    }
    
    const currentCount = business.sign_in_count || 0;
    const now = Date.now();
    
    // Update sign-in count and last sign-in timestamp
    await ctx.db.patch(business._id, {
      sign_in_count: currentCount + 1,
      last_sign_in_at: now,
      updated_at: now,
    });
    
    console.log(`[trackSignIn] Updated sign-in count for business ${business._id}: ${currentCount + 1}`);
    
    return {
      success: true,
      signInCount: currentCount + 1,
      isNewUser: currentCount === 0
    };
  },
});

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Optimized query for mobile app search - returns businesses with promotion/event counts
 * Filters by location and radius in the backend for better performance
 */
export const getBusinessesWithCountsForSearch = query({
  args: {
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    radiusMiles: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const limit = args.limit || 50;
      const radiusMiles = args.radiusMiles || 25;

      console.log('[getBusinessesWithCountsForSearch] Starting with args:', {
        hasLat: args.latitude !== undefined,
        hasLng: args.longitude !== undefined,
        radiusMiles,
        categories: args.categories?.length || 0,
        limit
      });

      // Get all active primary locations
      let locations = await ctx.db
        .query("business_locations")
        .withIndex("by_primary_active", q => q.eq("is_primary", true).eq("is_active", true))
        .collect();

      console.log('[getBusinessesWithCountsForSearch] Found', locations.length, 'active locations');

    // Filter by category if specified
    if (args.categories && args.categories.length > 0) {
      locations = locations.filter(loc =>
        loc.category && args.categories!.includes(loc.category)
      );
    }

    // Filter by location and calculate distances if lat/lng provided
    if (args.latitude !== undefined && args.longitude !== undefined) {
      locations = locations
        .filter(loc => loc.latitude !== undefined && loc.longitude !== undefined)
        .map(loc => ({
          ...loc,
          distance: calculateDistance(
            args.latitude!,
            args.longitude!,
            loc.latitude!,
            loc.longitude!
          )
        }))
        .filter(loc => loc.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } else {
      // No location filtering, just take first N
      locations = locations.slice(0, limit);
    }

    console.log(`[getBusinessesWithCountsForSearch] Found ${locations.length} locations after filtering`);

    // Get unique business IDs
    const businessIds = [...new Set(locations.map(loc => loc.business_id))];

    // Fetch businesses and their counts in parallel
    const businessesWithCounts = await Promise.all(
      businessIds.map(async (businessId) => {
        const business = await ctx.db.get(businessId);
        if (!business) return null;

        // Get location for this business
        const location = locations.find(loc => loc.business_id === businessId);
        if (!location) return null;

        // Count active promotions
        const promotions = await ctx.db
          .query("promotions")
          .withIndex("by_business", q => q.eq("business_id", businessId))
          .filter(q => q.eq(q.field("status"), "active"))
          .collect();

        // Count active events
        const events = await ctx.db
          .query("events")
          .withIndex("by_business", q => q.eq("business_id", businessId))
          .filter(q => q.eq(q.field("status"), "active"))
          .collect();

        // Merge business auth data with location profile data
        const merged = mergeBusinessWithLocation(business, location);

        return {
          ...merged,
          promotions_count: promotions.length,
          events_count: events.length,
          active_promotions_count: promotions.length,
          active_events_count: events.length,
          distance: (location as any).distance || undefined,
        };
      })
    );

      // Filter out nulls and return
      const results = businessesWithCounts.filter(b => b !== null);

      console.log(`[getBusinessesWithCountsForSearch] Returning ${results.length} businesses with counts`);

      return results;
    } catch (error) {
      console.error('[getBusinessesWithCountsForSearch] Error:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },
});

// Simple list query for seed data script
export const list = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    return businesses.map(b => ({
      _id: b._id,
      email: b.email,
      name: b.name,
      clerk_user_id: b.clerk_user_id,
    }));
  },
});

/**
 * Mobile Geofencing: Get nearby businesses optimized for geofence registration
 * Returns top 20 businesses prioritized by distance, active content, and engagement
 */
export const getNearbyBusinessesForGeofencing = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusMiles: v.optional(v.number()),
    userId: v.optional(v.id("users")), // Optional authenticated user for follow status
  },
  handler: async (ctx, args) => {
    const radiusMiles = args.radiusMiles || 5; // Default 5 mile radius for geofencing
    const now = Date.now();

    // Get all active primary locations within radius
    const allLocations = await ctx.db
      .query("business_locations")
      .withIndex("by_primary_active", q => q.eq("is_primary", true).eq("is_active", true))
      .collect();

    // Filter by distance and calculate for each
    const locationsWithDistance = allLocations
      .filter(loc => loc.latitude && loc.longitude)
      .map(loc => ({
        location: loc,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          loc.latitude!,
          loc.longitude!
        ),
      }))
      .filter(item => item.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    // Get user's followed businesses if authenticated
    let followedBusinessIds = new Set<string>();
    if (args.userId) {
      const follows = await ctx.db
        .query("business_followers")
        .withIndex("by_user", q => q.eq("user_id", args.userId!))
        .collect();
      followedBusinessIds = new Set(follows.map(f => f.business_id));
    }

    // Enrich with active content counts and engagement data
    const enrichedBusinesses = await Promise.all(
      locationsWithDistance.map(async ({ location, distance }) => {
        const business = await ctx.db.get(location.business_id);
        if (!business) return null;

        // Get active promotions count
        const promotions = await ctx.db
          .query("promotions")
          .withIndex("by_business", q => q.eq("business_id", location.business_id))
          .filter(q => q.eq(q.field("status"), "active"))
          .collect();

        const activePromotions = promotions.filter(
          p => p.start_date <= now && p.end_date >= now
        );

        // Get active events count
        const events = await ctx.db
          .query("events")
          .withIndex("by_business", q => q.eq("business_id", location.business_id))
          .filter(q => q.eq(q.field("status"), "active"))
          .collect();

        const activeEvents = events.filter(
          e => e.start_datetime <= now && e.end_datetime >= now
        );

        // Get follower count for engagement metric
        const followers = await ctx.db
          .query("business_followers")
          .withIndex("by_business", q => q.eq("business_id", location.business_id))
          .collect();

        // Calculate engagement score (for priority algorithm)
        const engagementScore =
          (activePromotions.length * 10) + // Active content weighted heavily
          (activeEvents.length * 10) +
          (followers.length * 0.1) + // Popularity factor
          (followedBusinessIds.has(location.business_id) ? 50 : 0); // Followed businesses get priority

        // Select the featured deal (most recent active promotion or event)
        let featuredDeal: { dealId: string; title: string; type: 'promotion' | 'event' } | undefined;

        if (activePromotions.length > 0) {
          // Sort by created time and pick the most recent
          const mostRecentPromotion = activePromotions.sort((a, b) => b._creationTime - a._creationTime)[0];
          featuredDeal = {
            dealId: mostRecentPromotion._id,
            title: mostRecentPromotion.title,
            type: 'promotion',
          };
        } else if (activeEvents.length > 0) {
          // If no promotions, use the most recent event
          const mostRecentEvent = activeEvents.sort((a, b) => b._creationTime - a._creationTime)[0];
          featuredDeal = {
            dealId: mostRecentEvent._id,
            title: mostRecentEvent.title,
            type: 'event',
          };
        }

        return {
          businessId: location.business_id,
          locationId: location._id,
          name: location.profile_name || business.name || "",
          latitude: location.latitude!,
          longitude: location.longitude!,
          distance,
          category: location.category || "",
          categories: location.categories || [],
          activePromotionsCount: activePromotions.length,
          activeEventsCount: activeEvents.length,
          followerCount: followers.length,
          isFollowed: followedBusinessIds.has(location.business_id),
          engagementScore,
          hasActiveContent: activePromotions.length > 0 || activeEvents.length > 0,
          featuredDeal, // Optional: only present if there's an active deal
        };
      })
    );

    // Filter out nulls and sort by engagement score
    const validBusinesses = enrichedBusinesses
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a, b) => b.engagementScore - a.engagementScore);

    // Return top 20 for geofencing (iOS limit)
    return validBusinesses.slice(0, 20);
  },
});

/**
 * Mobile Geofencing: Get all unique business categories for user preference matching
 */
export const getAllBusinessCategories = query({
  args: {},
  handler: async (ctx) => {
    // Get all locations (we can't filter by is_active without business_id in the index)
    const allLocations = await ctx.db
      .query("business_locations")
      .collect();

    // Filter to active locations
    const locations = allLocations.filter(loc => loc.is_active);

    // Collect all unique categories
    const categoriesSet = new Set<string>();
    locations.forEach(loc => {
      if (loc.category) {
        categoriesSet.add(loc.category);
      }
      if (loc.categories && Array.isArray(loc.categories)) {
        loc.categories.forEach(cat => categoriesSet.add(cat));
      }
    });

    return Array.from(categoriesSet).sort();
  },
});

/**
 * Mobile Geofencing: Check if there are active deals near a specific business location
 * Used when user enters a geofence to determine if notification should be sent
 */
export const hasActiveDealsNearby = query({
  args: {
    businessId: v.id("businesses"),
    locationId: v.optional(v.id("business_locations")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get active promotions for this business
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    const activePromotions = promotions.filter(
      p => p.start_date <= now && p.end_date >= now
    );

    // Get active events for this business
    const events = await ctx.db
      .query("events")
      .withIndex("by_business", q => q.eq("business_id", args.businessId))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    const activeEvents = events.filter(
      e => e.start_datetime <= now && e.end_datetime >= now
    );

    // If location_id is provided, filter to promotions/events valid at that location
    let locationFilteredPromotions = activePromotions;
    let locationFilteredEvents = activeEvents;

    if (args.locationId) {
      // Filter promotions that apply to this location
      locationFilteredPromotions = activePromotions.filter(p => {
        // If no location_ids specified, promotion applies to all locations
        if (!p.location_ids || p.location_ids.length === 0) return true;
        // Otherwise check if this location is in the list
        return p.location_ids.includes(args.locationId!);
      });

      // Filter events that apply to this location
      locationFilteredEvents = activeEvents.filter(e => {
        // If no location_ids specified, event applies to all locations
        if (!e.location_ids || e.location_ids.length === 0) return true;
        // Otherwise check if this location is in the list
        return e.location_ids.includes(args.locationId!);
      });
    }

    return {
      hasActiveDeals: locationFilteredPromotions.length > 0 || locationFilteredEvents.length > 0,
      activePromotionsCount: locationFilteredPromotions.length,
      activeEventsCount: locationFilteredEvents.length,
      totalActiveContent: locationFilteredPromotions.length + locationFilteredEvents.length,
    };
  },
});

/**
 * Migration: Copy location name to business name for businesses missing name
 * This fixes businesses created before the dual-table pattern was finalized
 */
export const migrateBusinessNames = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('[migrateBusinessNames] Starting migration...');
    
    // Find all businesses without a name
    const businesses = await ctx.db.query("businesses").collect();
    const businessesWithoutName = businesses.filter(b => !b.name);
    
    console.log(`[migrateBusinessNames] Found ${businessesWithoutName.length} businesses without names`);
    
    let fixed = 0;
    for (const business of businessesWithoutName) {
      // Get primary location for this business
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .first();
      
      if (primaryLocation && (primaryLocation.profile_name || primaryLocation.name)) {
        const businessName = primaryLocation.profile_name || primaryLocation.name;
        await ctx.db.patch(business._id, {
          name: businessName
        });
        console.log(`[migrateBusinessNames] Fixed business ${business._id}: ${businessName}`);
        fixed++;
      } else {
        console.log(`[migrateBusinessNames] No name found for business ${business._id}`);
      }
    }
    
    console.log(`[migrateBusinessNames] Migration complete. Fixed ${fixed} businesses.`);
    return { total: businessesWithoutName.length, fixed };
  }
});
