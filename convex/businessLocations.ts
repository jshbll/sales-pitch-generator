import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { apiSafe } from "./lib/apiHelpers";
import { getEffectiveLimit } from "./lib/subscriptionHelpers";

// Note: Location limits are now managed through Clerk Billing
// The limits are stored on the business record and synced via webhooks
// This provides real-time subscription data from the billing provider

// Get the next recommended plan based on current plan
const getNextPlan = (currentPlan: string): string => {
  const planLower = currentPlan.toLowerCase();
  
  // Map current plan to next tier based on Clerk plan names
  if (planLower === 'free' || planLower === 'starter') return 'Gold';
  if (planLower === 'bronze') return 'Gold';
  if (planLower === 'gold') return 'Diamond';
  if (planLower === 'diamond') return 'Enterprise';
  
  // Already at max or unknown plan
  return 'Gold'; // Default suggestion
};

// Get all locations for a business
export const getBusinessLocations = query({
  args: {
    businessId: v.id("businesses"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    let locationsQuery = ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId));

    let locations = await locationsQuery.collect();

    // Filter active only if requested
    if (args.activeOnly) {
      locations = locations.filter(loc => loc.is_active && !loc.temporarily_closed);
    }

    // Sort primary location first
    locations.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });

    return locations;
  },
});

// Get a single location by ID
export const getLocation = query({
  args: { locationId: v.id("business_locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

// Get primary location for a business
export const getPrimaryLocation = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Find the primary location
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();

    return primaryLocation;
  },
});

// Check if business can add more locations based on subscription
export const canAddLocation = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get current location count
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();

    const currentCount = locations.length;

    // Get subscription limits using helper (includes admin override support)
    // Note: null = unlimited, 0 = none allowed
    const effectiveLimit = getEffectiveLimit(business, 'max_locations_limit');
    let plan = "Free";

    // Determine plan name from the stored data
    if (business.clerk_plan_name) {
      plan = business.clerk_plan_name;
    } else if (business.subscription_tier) {
      // Map tier to display name
      const tierMap: Record<string, string> = {
        'bronze': 'Bronze',
        'gold': 'Gold',
        'diamond': 'Diamond',
        'enterprise': 'Enterprise',
      };
      plan = tierMap[business.subscription_tier] || 'Unavailable';
    }

    // null means unlimited, otherwise check against limit
    const isUnlimited = effectiveLimit === null;
    const limit = effectiveLimit ?? 1; // Default to 1 for display if undefined
    const canAdd = isUnlimited || currentCount < limit;

    // Get suggested plan if they can't add more locations
    const suggestedPlan = !canAdd ? getNextPlan(plan) : null;

    return {
      canAdd,
      currentCount,
      limit: isUnlimited ? "Unlimited" : limit,
      plan,
      suggestedPlan,
    };
  },
});

// Calculate profile completion percentage for a specific location
export const getLocationProfileCompletion = query({
  args: { 
    businessId: v.id("businesses"),
    locationId: v.optional(v.id("business_locations"))
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    let locationData = null;
    if (args.locationId) {
      locationData = await ctx.db.get(args.locationId);
      if (!locationData || locationData.business_id !== args.businessId) {
        throw new Error("Location not found or doesn't belong to business");
      }
    }

    // Calculate completion based on location-specific or business-level data
    const businessName = business.name;
    const hasLogo = !!(business.logo_url || business.logo_id);
    const hasCategories = (business.categories && business.categories.length > 0) || !!business.category;
    
    // Use location-specific description if available, otherwise business description
    const hasDescription = locationData?.description || business.description;
    
    // Use location-specific contact info if available, otherwise business contact
    const hasPhone = locationData?.phone || business.phone;
    const hasEmail = locationData?.email || business.public_business_email || business.contact_email;
    
    // Location address (required for locations)
    const hasLocation = locationData ? 
      !!(locationData.address && locationData.city && locationData.state && locationData.zip) :
      !!(business.address && business.city && business.state && business.zip) ||
      (business.customersDoNotVisit === true && business.serviceZip && business.serviceRadius);
    
    // Use location-specific business hours if available, otherwise business hours
    const businessHours = locationData?.business_hours || business.business_hours;
    const hasBusinessHours = !!(businessHours && Object.keys(businessHours).length > 0);
    
    // Use location-specific social media if available, otherwise business social media
    const socialMedia = locationData?.social_media;
    const hasSocialMedia = socialMedia ? 
      [socialMedia.website, socialMedia.facebook, socialMedia.instagram, socialMedia.twitter].filter(Boolean).length >= 2 :
      [business.website, business.facebook_url, business.instagram_url, business.twitter_url, business.linkedin_url].filter(Boolean).length >= 2;
    
    // Check for location-specific photos
    const hasPhotos = locationData?.gallery_images && locationData.gallery_images.length > 0;
    
    // Check for location-specific menu
    const hasMenu = locationData?.menu_items && locationData.menu_items.length > 0;

    // Define completion criteria (location-aware)
    const completionCriteria = [
      {
        id: 'basic_info',
        label: 'Basic Information',
        completed: !!(businessName && hasDescription && hasCategories && hasLogo),
        required: true,
        weight: 2, // Higher weight for required items
      },
      {
        id: 'contact_info', 
        label: 'Contact Information',
        completed: !!(hasPhone && hasEmail),
        required: true,
        weight: 2,
      },
      {
        id: 'location_address',
        label: 'Location Address',
        completed: hasLocation,
        required: true,
        weight: 2,
      },
      {
        id: 'business_hours',
        label: 'Business Hours',
        completed: hasBusinessHours,
        required: false,
        weight: 1,
      },
      {
        id: 'photos',
        label: 'Photo Gallery',
        completed: hasPhotos,
        required: false,
        weight: 1,
      },
      {
        id: 'menu',
        label: 'Menu/Services',
        completed: hasMenu,
        required: false,
        weight: 1,
      },
      {
        id: 'social_media',
        label: 'Social Media',
        completed: hasSocialMedia,
        required: false,
        weight: 1,
      },
    ];

    // Calculate weighted completion percentage
    const totalWeight = completionCriteria.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = completionCriteria
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    
    // Get next actions (prioritize required items)
    const incompleteRequired = completionCriteria.filter(item => !item.completed && item.required);
    const incompleteOptional = completionCriteria.filter(item => !item.completed && !item.required);
    const nextActions = [...incompleteRequired, ...incompleteOptional].slice(0, 3);

    return {
      percentage,
      completionCriteria,
      nextActions,
      locationName: locationData?.name || 'Business Profile',
      isLocationSpecific: !!locationData,
    };
  },
});

// Get a specific location by ID
export const getLocationById = query({
  args: {
    locationId: v.id("business_locations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    // Return null if not found instead of throwing error
    // This allows components to handle missing locations gracefully
    return location || null;
  },
});

// Create a new location
export const createLocation = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    profile_name: v.optional(v.string()), // Customer-facing business name
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    country: v.optional(v.string()), // Country (defaults to "United States")
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    manager_name: v.optional(v.string()),
    business_hours: v.optional(v.any()),
    location_code: v.optional(v.string()),
    is_primary: v.optional(v.boolean()),
    // Additional fields from the frontend
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo_url: v.optional(v.string()), // Logo URL from Cloudflare upload
    logo_id: v.optional(v.string()), // Logo ID from Cloudflare
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    pinterestUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get subscription limits using helper (includes admin override support)
    // Note: null = unlimited, 0 = none allowed
    const effectiveLimit = getEffectiveLimit(business, 'max_locations_limit');
    const isUnlimited = effectiveLimit === null;
    let maxLocations = effectiveLimit ?? 1; // Default to 1 if undefined
    let planName = "Free";

    // Determine plan name from the stored data
    if (business.clerk_plan_name) {
      planName = business.clerk_plan_name;
    } else if (business.subscription_tier) {
      // Map tier to display name
      const tierMap: Record<string, string> = {
        'bronze': 'Bronze',
        'gold': 'Gold',
        'diamond': 'Diamond',
        'enterprise': 'Enterprise',
      };
      planName = tierMap[business.subscription_tier] || 'Free';
    }

    console.log("[createLocation] Using effective limits (with admin override support):", {
      maxLocations: isUnlimited ? 'Unlimited' : maxLocations,
      planName,
      hasOverride: business.override_unlimited || business.override_subscription_tier,
      clerk_plan_name: business.clerk_plan_name,
      subscription_tier: business.subscription_tier
    });

    // Check current location count
    const locations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();

    const currentCount = locations.length;

    console.log(`[createLocation] Location check: current=${currentCount}, limit=${isUnlimited ? 'Unlimited' : maxLocations}, plan=${planName}`);

    // Check if limit is reached (skip if unlimited)
    if (!isUnlimited && currentCount >= maxLocations) {
      throw new Error(`Location limit reached. Your ${planName} plan allows ${maxLocations} location(s).`);
    }

    // If this is the first location or marked as primary, ensure it's the only primary
    const isPrimary = args.is_primary || currentCount === 0;
    
    if (isPrimary) {
      // Unset any existing primary locations
      for (const loc of locations) {
        if (loc.is_primary) {
          await ctx.db.patch(loc._id, { is_primary: false });
        }
      }
    }

    const now = Date.now();

    // Create the location
    const locationId = await ctx.db.insert("business_locations", {
      business_id: args.businessId,
      name: args.name,
      profile_name: args.profile_name || args.name, // Customer-facing business name (defaults to internal name)
      address: args.address,
      city: args.city,
      state: args.state,
      zip: args.zip,
      country: args.country || "United States", // Default to US if not provided
      phone: args.phone,
      email: args.email,
      manager_name: args.manager_name,
      business_hours: args.business_hours,
      location_code: args.location_code,
      is_primary: isPrimary,
      is_active: true,
      // Additional fields
      category: args.category,
      categories: args.categories,
      description: args.description,
      website: args.website,
      logo_url: args.logo_url,
      logo_id: args.logo_id,
      instagram_url: args.instagramUrl,
      facebook_url: args.facebookUrl,
      tiktok_url: args.tiktokUrl,
      linkedin_url: args.linkedinUrl,
      twitter_url: args.twitterUrl,
      pinterest_url: args.pinterestUrl,
      created_at: now,
      updated_at: now,
    });

    return locationId;
  },
});

// Action wrapper to create location AND automatically geocode it
export const createLocationWithGeocode = action({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    profile_name: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    manager_name: v.optional(v.string()),
    business_hours: v.optional(v.any()),
    location_code: v.optional(v.string()),
    is_primary: v.optional(v.boolean()),
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    logo_id: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    pinterestUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Step 1: Create the location
    const locationId = await ctx.runMutation(apiSafe.businessLocations.createLocation, args);

    // Step 2: Automatically geocode it
    try {
      const geocodeResult = await ctx.runAction(apiSafe.businessLocations.geocodeLocation, {
        locationId,
      });

      console.log(`[createLocationWithGeocode] Location created and geocoded successfully:`, {
        locationId,
        confidence: geocodeResult.confidence,
        accuracy: geocodeResult.accuracy_type,
      });

      return {
        locationId,
        geocoded: true,
        geocodeResult,
      };
    } catch (geocodeError) {
      console.error(`[createLocationWithGeocode] Location created but geocoding failed:`, geocodeError);

      // Return success with warning - location exists but not geocoded
      return {
        locationId,
        geocoded: false,
        geocodeError: String(geocodeError),
        warning: "Location created successfully but could not be geocoded. Please verify the address and try geocoding manually.",
      };
    }
  },
});

// Update a location
export const updateLocation = mutation({
  args: {
    locationId: v.id("business_locations"),
    name: v.optional(v.string()),
    profile_name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    logo_id: v.optional(v.string()),
    manager_name: v.optional(v.string()),
    business_hours: v.optional(v.any()),
    location_code: v.optional(v.string()),
    is_primary: v.optional(v.boolean()),
    is_active: v.optional(v.boolean()),
    temporarily_closed: v.optional(v.boolean()),
    closure_reason: v.optional(v.string()),
    reopening_date: v.optional(v.number()),
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    // Service area fields
    service_zip: v.optional(v.string()),
    service_radius: v.optional(v.number()),
    customersDoNotVisit: v.optional(v.boolean()),
    // Geocoding fields
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    geocoded_address: v.optional(v.string()),
    geocoded_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    const updates: any = {
      updated_at: Date.now(),
    };

    // Handle primary location change
    if (args.is_primary === true) {
      // Unset any other primary locations for this business
      const otherLocations = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", location.business_id))
        .collect();

      for (const loc of otherLocations) {
        if (loc._id !== args.locationId && loc.is_primary) {
          await ctx.db.patch(loc._id, { is_primary: false });
        }
      }
    }

    // Copy all provided fields to updates
    Object.keys(args).forEach((key) => {
      if (key !== "locationId" && args[key as keyof typeof args] !== undefined) {
        updates[key] = args[key as keyof typeof args];
      }
    });

    await ctx.db.patch(args.locationId, updates);
    return args.locationId;
  },
});

// Delete a location
export const deleteLocation = mutation({
  args: {
    locationId: v.id("business_locations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    // Check if this is the only location
    const allLocations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", location.business_id))
      .collect();

    if (allLocations.length === 1) {
      throw new Error("Cannot delete your only location. Businesses must have at least one location.");
    }

    // If deleting primary location, make another one primary
    if (location.is_primary && allLocations.length > 1) {
      const newPrimary = allLocations.find(loc => loc._id !== args.locationId);
      if (newPrimary) {
        await ctx.db.patch(newPrimary._id, { is_primary: true });
      }
    }

    // Delete the location
    await ctx.db.delete(args.locationId);
    return { success: true };
  },
});

// Action to geocode a location using Geocodio
export const geocodeLocation = action({
  args: {
    locationId: v.id("business_locations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.runQuery(apiSafe.businessLocations.getLocation, {
      locationId: args.locationId,
    });

    if (!location) {
      throw new Error("Location not found");
    }

    // Construct full address
    const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
    console.log(`[Geocode] Attempting to geocode address with Geocodio: "${fullAddress}"`);

    try {
      // Use Geocodio service (more accurate and includes USPS standardization)
      const geocodioResult = await ctx.runAction(apiSafe.geocodioService.validateAddress, {
        address: fullAddress,
      });

      console.log(`[Geocode] Geocodio result:`, {
        valid: geocodioResult.valid,
        confidence: geocodioResult.confidence,
        standardized: geocodioResult.standardized,
        accuracy: geocodioResult.accuracy_type,
      });

      if (!geocodioResult.valid || !geocodioResult.coordinates) {
        throw new Error(`Geocodio could not validate address. Confidence: ${geocodioResult.confidence}%. Original: "${fullAddress}", Standardized: "${geocodioResult.standardized}"`);
      }

      // Update location with coordinates and standardized address
      await ctx.runMutation(apiSafe.businessLocations.updateLocationCoordinates, {
        locationId: args.locationId,
        latitude: geocodioResult.coordinates.latitude,
        longitude: geocodioResult.coordinates.longitude,
        geocoded_address: geocodioResult.standardized,
      });

      return {
        success: true,
        latitude: geocodioResult.coordinates.latitude,
        longitude: geocodioResult.coordinates.longitude,
        geocoded_address: geocodioResult.standardized,
        confidence: geocodioResult.confidence,
        accuracy_type: geocodioResult.accuracy_type,
      };
    } catch (error) {
      console.error("[Geocode] Error:", error);
      throw new Error(`Failed to geocode address "${fullAddress}": ${error}`);
    }
  },
});

// Helper mutation to update coordinates (called from action)
export const updateLocationCoordinates = mutation({
  args: {
    locationId: v.id("business_locations"),
    latitude: v.number(),
    longitude: v.number(),
    geocoded_address: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.locationId, {
      latitude: args.latitude,
      longitude: args.longitude,
      geocoded_address: args.geocoded_address,
      geocoded_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

// Get location-specific content with inheritance
export const getLocationContent = query({
  args: {
    locationId: v.id("business_locations"),
    field: v.optional(v.string()), // Specific field to get
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    // If inherit_from_primary is true and this is not the primary location
    if (location.inherit_from_primary && !location.is_primary) {
      // Get primary location
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_primary", (q) => 
          q.eq("business_id", location.business_id).eq("is_primary", true)
        )
        .first();

      if (primaryLocation) {
        // Check if specific field should be inherited
        const inheritedFields = location.inherited_fields || [];
        
        if (args.field) {
          // Return specific field with inheritance logic
          const shouldInherit = inheritedFields.includes(args.field);
          const primaryLocationAny = primaryLocation as any;
          const locationAny = location as any;
          return shouldInherit ? primaryLocationAny[args.field] : locationAny[args.field];
        }

        // Return merged content object
        const mergedContent: any = { ...location };
        const primaryLocationAny = primaryLocation as any;
        
        // Apply inheritance for each field
        inheritedFields.forEach(field => {
          if (primaryLocationAny[field] !== undefined) {
            mergedContent[field] = primaryLocationAny[field];
          }
        });

        return mergedContent;
      }
    }

    // No inheritance, return location content as-is
    const locationAny = location as any;
    return args.field ? locationAny[args.field] : location;
  },
});

// Update location-specific content
export const updateLocationContent = mutation({
  args: {
    locationId: v.id("business_locations"),
    updates: v.object({
      description: v.optional(v.string()),
      gallery_images: v.optional(v.array(v.object({
        image_id: v.string(),
        image_url: v.string(),
        caption: v.optional(v.string()),
        display_order: v.number(),
      }))),
      menu_items: v.optional(v.array(v.object({
        item_id: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        price: v.optional(v.string()),
        category: v.optional(v.string()),
        image_url: v.optional(v.string()),
        available: v.boolean(),
      }))),
      social_media: v.optional(v.object({
        facebook: v.optional(v.string()),
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        tiktok: v.optional(v.string()),
        youtube: v.optional(v.string()),
        website: v.optional(v.string()),
      })),
      amenities: v.optional(v.array(v.string())),
      accessibility_features: v.optional(v.array(v.string())),
      meta_title: v.optional(v.string()),
      meta_description: v.optional(v.string()),
      custom_fields: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    await ctx.db.patch(args.locationId, {
      ...args.updates,
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

// Update location inheritance settings
export const updateLocationInheritance = mutation({
  args: {
    locationId: v.id("business_locations"),
    inherit_from_primary: v.boolean(),
    inherited_fields: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    if (location.is_primary && args.inherit_from_primary) {
      throw new Error("Primary location cannot inherit from itself");
    }

    await ctx.db.patch(args.locationId, {
      inherit_from_primary: args.inherit_from_primary,
      inherited_fields: args.inherited_fields || [],
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

// Copy location content to other locations
export const copyLocationContent = mutation({
  args: {
    sourceLocationId: v.id("business_locations"),
    targetLocationIds: v.array(v.id("business_locations")),
    fields: v.array(v.string()), // Which fields to copy
  },
  handler: async (ctx, args) => {
    const sourceLocation = await ctx.db.get(args.sourceLocationId);
    if (!sourceLocation) {
      throw new Error("Source location not found");
    }

    // Prepare content to copy
    const contentToCopy: any = {};
    const sourceLocationAny = sourceLocation as any;
    args.fields.forEach(field => {
      if (sourceLocationAny[field] !== undefined) {
        contentToCopy[field] = sourceLocationAny[field];
      }
    });

    // Copy to each target location
    const results = await Promise.all(
      args.targetLocationIds.map(async (targetId) => {
        const targetLocation = await ctx.db.get(targetId);
        if (!targetLocation) {
          return { locationId: targetId, success: false, error: "Location not found" };
        }

        // Ensure we're copying within the same business
        if (targetLocation.business_id !== sourceLocation.business_id) {
          return { locationId: targetId, success: false, error: "Cannot copy between different businesses" };
        }

        await ctx.db.patch(targetId, {
          ...contentToCopy,
          updated_at: Date.now(),
        });

        return { locationId: targetId, success: true };
      })
    );

    return { results };
  },
});

// Get location content for display (with business fallback)
export const getLocationDisplayContent = query({
  args: {
    businessId: v.id("businesses"),
    locationId: v.optional(v.id("business_locations")),
  },
  handler: async (ctx, args): Promise<any> => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    let location = null;
    
    // If no location specified, use primary location or business defaults
    if (!args.locationId) {
      location = await ctx.db
        .query("business_locations")
        .withIndex("by_primary", (q) => 
          q.eq("business_id", args.businessId).eq("is_primary", true)
        )
        .first();

      if (!location) {
        // No locations yet, return business defaults
        return {
          description: business.description,
          social_media: {
            facebook: business.facebook_url,
            instagram: business.instagram_url,
            twitter: business.twitter_url,
            website: business.website,
          },
          // Add other business fields as needed
        };
      }
    } else {
      location = await ctx.db.get(args.locationId);
      if (!location) {
        throw new Error("Location not found");
      }
    }

    // Apply inheritance logic inline
    if (location.inherit_from_primary && !location.is_primary) {
      const primaryLocation = await ctx.db
        .query("business_locations")
        .withIndex("by_primary", (q) => 
          q.eq("business_id", location.business_id).eq("is_primary", true)
        )
        .first();

      if (primaryLocation) {
        const inheritedFields = location.inherited_fields || [];
        const mergedContent: any = { ...location };
        const primaryLocationAny = primaryLocation as any;
        
        inheritedFields.forEach(field => {
          if (primaryLocationAny[field] !== undefined) {
            mergedContent[field] = primaryLocationAny[field];
          }
        });

        return mergedContent;
      }
    }

    return location;
  },
});

// Migrate existing business to location system
export const migrateBusinessToLocation = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if already migrated
    const existingLocations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();

    if (existingLocations.length > 0) {
      return { message: "Business already has locations", locationId: existingLocations[0]._id };
    }

    // Create primary location from existing business data
    const now = Date.now();
    const locationId = await ctx.db.insert("business_locations", {
      business_id: args.businessId,
      name: "Main Location",
      profile_name: business.name || "Main Location", // Customer-facing business name
      address: business.address || "",
      city: business.city || "",
      state: business.state || "",
      zip: business.zip || "",
      country: "United States",
      phone: business.phone,
      email: business.public_business_email || business.contact_email,
      business_hours: business.business_hours,
      latitude: business.latitude,
      longitude: business.longitude,
      geocoded_address: business.geocoded_address,
      geocoded_at: business.geocoded_at,
      service_zip: business.serviceZip,
      service_radius: business.serviceRadius,
      is_primary: true,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return { message: "Business migrated to location system", locationId };
  },
});

// Automatically sync business profile to primary location
export const syncBusinessToLocation = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if business has address information
    if (!business.address || !business.city || !business.state || !business.zip) {
      return { message: "Business has no address information to sync" };
    }

    // Check for existing primary location
    const existingLocations = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .collect();

    const primaryLocation = existingLocations.find(loc => loc.is_primary);
    const now = Date.now();

    if (primaryLocation) {
      // Update existing primary location
      await ctx.db.patch(primaryLocation._id, {
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        phone: business.phone || primaryLocation.phone,
        email: business.public_business_email || business.contact_email || primaryLocation.email,
        business_hours: business.business_hours || primaryLocation.business_hours,
        latitude: business.latitude || primaryLocation.latitude,
        longitude: business.longitude || primaryLocation.longitude,
        geocoded_address: business.geocoded_address || primaryLocation.geocoded_address,
        geocoded_at: business.geocoded_at || primaryLocation.geocoded_at,
        service_zip: business.serviceZip || primaryLocation.service_zip,
        service_radius: business.serviceRadius || primaryLocation.service_radius,
        updated_at: now,
      });
      return { message: "Primary location updated from business profile", locationId: primaryLocation._id };
    } else if (existingLocations.length === 0) {
      // Create new primary location
      const locationId = await ctx.db.insert("business_locations", {
        business_id: args.businessId,
        name: business.name || "Main Location",
        profile_name: business.name || "Main Location", // Customer-facing business name
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        country: "United States",
        phone: business.phone,
        email: business.public_business_email || business.contact_email,
        business_hours: business.business_hours || {
          monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          saturday: { isOpen: false, openTime: '10:00', closeTime: '15:00' },
          sunday: { isOpen: false, openTime: '10:00', closeTime: '15:00' },
        },
        latitude: business.latitude,
        longitude: business.longitude,
        geocoded_address: business.geocoded_address,
        geocoded_at: business.geocoded_at,
        service_zip: business.serviceZip,
        service_radius: business.serviceRadius,
        is_primary: true,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      return { message: "Primary location created from business profile", locationId };
    } else {
      // Make first location primary
      const firstLocation = existingLocations[0];
      await ctx.db.patch(firstLocation._id, {
        is_primary: true,
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        updated_at: now,
      });
      return { message: "First location made primary and updated", locationId: firstLocation._id };
    }
  },
});

// Batch migrate all businesses
export const migrateAllBusinesses = mutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    let migrated = 0;
    let skipped = 0;

    for (const business of businesses) {
      // Check if already has locations
      const existingLocations = await ctx.db
        .query("business_locations")
        .withIndex("by_business", (q) => q.eq("business_id", business._id))
        .collect();

      if (existingLocations.length === 0) {
        // Create primary location from existing business data
        const now = Date.now();
        await ctx.db.insert("business_locations", {
          business_id: business._id,
          name: "Main Location",
          profile_name: business.name || "Main Location", // Customer-facing business name
          address: business.address || "",
          city: business.city || "",
          state: business.state || "",
          zip: business.zip || "",
          country: "United States",
          phone: business.phone,
          email: business.public_business_email || business.contact_email,
          business_hours: business.business_hours,
          latitude: business.latitude,
          longitude: business.longitude,
          geocoded_address: business.geocoded_address,
          geocoded_at: business.geocoded_at,
          service_zip: business.serviceZip,
          service_radius: business.serviceRadius,
          is_primary: true,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
        migrated++;
      } else {
        skipped++;
      }
    }

    return { migrated, skipped, total: businesses.length };
  },
});

// Get business hours for a specific location
export const getLocationBusinessHours = query({
  args: {
    locationId: v.id("business_locations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }
    
    return {
      locationId: location._id,
      locationName: location.name,
      business_hours: location.business_hours || null,
      is_primary: location.is_primary,
    };
  },
});

// Update the primary location's logo when business logo is uploaded
export const updatePrimaryLocationLogo = mutation({
  args: {
    businessId: v.id("businesses"),
    logo_url: v.string(),
    logo_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the primary location for this business
    const primaryLocation = await ctx.db
      .query("business_locations")
      .withIndex("by_business", (q) => q.eq("business_id", args.businessId))
      .filter((q) => q.eq(q.field("is_primary"), true))
      .first();

    if (!primaryLocation) {
      console.warn(`[updatePrimaryLocationLogo] No primary location found for business ${args.businessId}`);
      return { success: false, error: "No primary location found" };
    }

    // Update the location's logo
    await ctx.db.patch(primaryLocation._id, {
      logo_url: args.logo_url,
      logo_id: args.logo_id,
      updated_at: Date.now(),
    });

    console.log(`[updatePrimaryLocationLogo] Updated logo for location ${primaryLocation._id}`);
    return { success: true, locationId: primaryLocation._id };
  },
});

// Update business hours for a specific location
export const updateLocationBusinessHours = mutation({
  args: {
    locationId: v.id("business_locations"),
    business_hours: v.object({
      monday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      tuesday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      wednesday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      thursday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      friday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      saturday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
      sunday: v.object({
        isOpen: v.optional(v.boolean()),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
        closed: v.optional(v.boolean()),
        open: v.optional(v.string()),
        close: v.optional(v.string()),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const { locationId, business_hours } = args;
    
    // Verify location exists
    const location = await ctx.db.get(locationId);
    if (!location) {
      throw new Error("Location not found");
    }
    
    // Update the location's business hours
    await ctx.db.patch(locationId, {
      business_hours,
      updated_at: Date.now(),
    });
    
    return { success: true };
  },
});