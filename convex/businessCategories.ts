import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Business category data structure based on Google My Business categories
interface BusinessCategoryData {
  id: string;
  name: string;
  parent_id?: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_primary?: boolean; // Whether this can be selected as a primary category
  search_terms?: string[]; // Additional search terms for better matching
}

// Comprehensive Google My Business inspired categories
const businessCategoriesData: BusinessCategoryData[] = [
  // FOOD & DINING
  {
    id: "restaurant",
    name: "Restaurant",
    sort_order: 1,
    is_primary: true,
    icon: "restaurant",
    description: "General restaurant or dining establishment",
    search_terms: ["dining", "food", "eat", "meal"]
  },
  {
    id: "fast_food",
    name: "Fast food restaurant",
    sort_order: 2,
    is_primary: true,
    icon: "fastfood",
    description: "Quick service restaurant",
    search_terms: ["fast food", "quick", "drive thru", "takeout"]
  },
  {
    id: "cafe",
    name: "Cafe",
    sort_order: 3,
    is_primary: true,
    icon: "local_cafe",
    description: "Coffee shop or casual dining",
    search_terms: ["coffee", "coffee shop", "bistro", "espresso"]
  },
  {
    id: "bakery",
    name: "Bakery",
    sort_order: 4,
    is_primary: true,
    icon: "bakery_dining",
    description: "Bakery or pastry shop",
    search_terms: ["bread", "pastry", "cake", "baking"]
  },
  {
    id: "bar",
    name: "Bar",
    sort_order: 5,
    is_primary: true,
    icon: "local_bar",
    description: "Bar or pub",
    search_terms: ["pub", "tavern", "drinks", "cocktails", "beer"]
  },
  {
    id: "pizza_place",
    name: "Pizza restaurant",
    sort_order: 6,
    is_primary: true,
    icon: "local_pizza",
    description: "Pizza restaurant or pizzeria",
    search_terms: ["pizzeria", "pizza"]
  },

  // RETAIL & SHOPPING
  {
    id: "clothing_store",
    name: "Clothing store",
    sort_order: 10,
    is_primary: true,
    icon: "checkroom",
    description: "Clothing and apparel store",
    search_terms: ["apparel", "fashion", "clothes", "garments"]
  },
  {
    id: "shoe_store",
    name: "Shoe store",
    sort_order: 11,
    is_primary: true,
    icon: "shopping_bag",
    description: "Footwear retailer",
    search_terms: ["footwear", "shoes", "boots", "sneakers"]
  },
  {
    id: "electronics_store",
    name: "Electronics store",
    sort_order: 12,
    is_primary: true,
    icon: "devices",
    description: "Electronics and technology retailer",
    search_terms: ["tech", "technology", "gadgets", "computers"]
  },
  {
    id: "furniture_store",
    name: "Furniture store",
    sort_order: 13,
    is_primary: true,
    icon: "chair",
    description: "Furniture and home furnishing store",
    search_terms: ["home furnishing", "home decor", "interior"]
  },
  {
    id: "grocery_store",
    name: "Grocery store",
    sort_order: 14,
    is_primary: true,
    icon: "local_grocery_store",
    description: "Grocery or supermarket",
    search_terms: ["supermarket", "food store", "market", "groceries"]
  },
  {
    id: "convenience_store",
    name: "Convenience store",
    sort_order: 15,
    is_primary: true,
    icon: "store",
    description: "Convenience or corner store",
    search_terms: ["corner store", "mini mart", "quick stop"]
  },
  {
    id: "gift_shop",
    name: "Gift shop",
    sort_order: 16,
    is_primary: true,
    icon: "card_giftcard",
    description: "Gift and novelty store",
    search_terms: ["gifts", "souvenirs", "novelty"]
  },
  {
    id: "jewelry_store",
    name: "Jewelry store",
    sort_order: 17,
    is_primary: true,
    icon: "diamond",
    description: "Jewelry and accessories store",
    search_terms: ["jeweler", "accessories", "watches"]
  },
  {
    id: "bookstore",
    name: "Book store",
    sort_order: 18,
    is_primary: true,
    icon: "menu_book",
    description: "Bookstore or library",
    search_terms: ["books", "literature", "reading"]
  },
  {
    id: "toy_store",
    name: "Toy store",
    sort_order: 19,
    is_primary: true,
    icon: "toys",
    description: "Toy and game store",
    search_terms: ["toys", "games", "children", "kids"]
  },

  // HEALTH & WELLNESS
  {
    id: "gym",
    name: "Gym",
    sort_order: 20,
    is_primary: true,
    icon: "fitness_center",
    description: "Fitness center or gym",
    search_terms: ["fitness", "workout", "exercise", "fitness center"]
  },
  {
    id: "spa",
    name: "Spa",
    sort_order: 21,
    is_primary: true,
    icon: "spa",
    description: "Spa or wellness center",
    search_terms: ["wellness", "massage", "relaxation"]
  },
  {
    id: "hair_salon",
    name: "Hair salon",
    sort_order: 22,
    is_primary: true,
    icon: "content_cut",
    description: "Hair salon or barbershop",
    search_terms: ["barbershop", "hairdresser", "hair care", "styling"]
  },
  {
    id: "nail_salon",
    name: "Nail salon",
    sort_order: 23,
    is_primary: true,
    icon: "colorize",
    description: "Nail salon or manicure service",
    search_terms: ["manicure", "pedicure", "nail care"]
  },
  {
    id: "beauty_salon",
    name: "Beauty salon",
    sort_order: 24,
    is_primary: true,
    icon: "face_retouching_natural",
    description: "Beauty salon or cosmetic services",
    search_terms: ["beauty", "cosmetics", "makeup"]
  },
  {
    id: "dentist",
    name: "Dentist",
    sort_order: 25,
    is_primary: true,
    icon: "medical_services",
    description: "Dental office or dentist",
    search_terms: ["dental", "teeth", "oral health"]
  },
  {
    id: "doctor",
    name: "Doctor",
    sort_order: 26,
    is_primary: true,
    icon: "local_hospital",
    description: "Medical practice or doctor's office",
    search_terms: ["medical", "physician", "clinic", "healthcare"]
  },

  // PROFESSIONAL SERVICES
  {
    id: "lawyer",
    name: "Lawyer",
    sort_order: 30,
    is_primary: true,
    icon: "gavel",
    description: "Law firm or attorney",
    search_terms: ["attorney", "legal", "law firm", "legal services"]
  },
  {
    id: "accountant",
    name: "Accountant",
    sort_order: 31,
    is_primary: true,
    icon: "calculate",
    description: "Accounting or financial services",
    search_terms: ["accounting", "tax", "bookkeeping", "financial"]
  },
  {
    id: "real_estate",
    name: "Real estate agency",
    sort_order: 32,
    is_primary: true,
    icon: "home",
    description: "Real estate services",
    search_terms: ["realtor", "property", "homes", "real estate"]
  },
  {
    id: "insurance",
    name: "Insurance agency",
    sort_order: 33,
    is_primary: true,
    icon: "security",
    description: "Insurance services",
    search_terms: ["insurance", "coverage", "policy"]
  },
  {
    id: "bank",
    name: "Bank",
    sort_order: 34,
    is_primary: true,
    icon: "account_balance",
    description: "Bank or financial institution",
    search_terms: ["banking", "finance", "credit union"]
  },
  {
    id: "consultant",
    name: "Consultant",
    sort_order: 35,
    is_primary: true,
    icon: "business_center",
    description: "Business consulting services",
    search_terms: ["consulting", "advisor", "business services"]
  },

  // HOME SERVICES
  {
    id: "home_services",
    name: "Home Services",
    sort_order: 39,
    is_primary: true,
    icon: "home_repair_service",
    description: "General home services and maintenance",
    search_terms: ["home service", "home repair", "maintenance", "handyman"]
  },
  {
    id: "contractor",
    name: "Contractor",
    sort_order: 40,
    is_primary: true,
    icon: "construction",
    description: "General contractor or construction",
    search_terms: ["construction", "builder", "renovation", "remodeling"]
  },
  {
    id: "electrician",
    name: "Electrician",
    sort_order: 41,
    is_primary: true,
    icon: "electrical_services",
    description: "Electrical services",
    search_terms: ["electrical", "wiring", "electric"]
  },
  {
    id: "plumber",
    name: "Plumber",
    sort_order: 42,
    is_primary: true,
    icon: "plumbing",
    description: "Plumbing services",
    search_terms: ["plumbing", "pipes", "water", "drain"]
  },
  {
    id: "cleaning_service",
    name: "Cleaning service",
    sort_order: 43,
    is_primary: true,
    icon: "cleaning_services",
    description: "Cleaning and maintenance services",
    search_terms: ["cleaning", "janitorial", "housekeeping", "maid"]
  },
  {
    id: "landscaping",
    name: "Landscaping service",
    sort_order: 44,
    is_primary: true,
    icon: "park",
    description: "Landscaping and lawn care",
    search_terms: ["lawn care", "gardening", "yard work", "outdoor"]
  },
  {
    id: "pest_control",
    name: "Pest control service",
    sort_order: 45,
    is_primary: true,
    icon: "pest_control",
    description: "Pest control and extermination",
    search_terms: ["exterminator", "pest", "bug control"]
  },

  // AUTOMOTIVE
  {
    id: "auto_repair",
    name: "Auto repair shop",
    sort_order: 50,
    is_primary: true,
    icon: "car_repair",
    description: "Auto repair and maintenance",
    search_terms: ["car repair", "auto service", "mechanic", "automotive"]
  },
  {
    id: "car_dealer",
    name: "Car dealer",
    sort_order: 51,
    is_primary: true,
    icon: "directions_car",
    description: "Car dealership",
    search_terms: ["auto dealer", "car sales", "vehicle sales"]
  },
  {
    id: "gas_station",
    name: "Gas station",
    sort_order: 52,
    is_primary: true,
    icon: "local_gas_station",
    description: "Gas station or fuel service",
    search_terms: ["fuel", "petrol", "gas", "service station"]
  },
  {
    id: "car_wash",
    name: "Car wash",
    sort_order: 53,
    is_primary: true,
    icon: "local_car_wash",
    description: "Car wash and detailing service",
    search_terms: ["auto detailing", "car cleaning", "vehicle wash"]
  },

  // ENTERTAINMENT & RECREATION
  {
    id: "movie_theater",
    name: "Movie theater",
    sort_order: 60,
    is_primary: true,
    icon: "movie",
    description: "Cinema or movie theater",
    search_terms: ["cinema", "movies", "film", "theater"]
  },
  {
    id: "bowling_alley",
    name: "Bowling alley",
    sort_order: 61,
    is_primary: true,
    icon: "sports_bowling",
    description: "Bowling alley or entertainment center",
    search_terms: ["bowling", "entertainment", "recreation"]
  },
  {
    id: "amusement_park",
    name: "Amusement park",
    sort_order: 62,
    is_primary: true,
    icon: "attractions",
    description: "Amusement park or theme park",
    search_terms: ["theme park", "rides", "attractions", "fun park"]
  },
  {
    id: "museum",
    name: "Museum",
    sort_order: 63,
    is_primary: true,
    icon: "museum",
    description: "Museum or cultural center",
    search_terms: ["gallery", "cultural", "art", "history"]
  },
  {
    id: "zoo",
    name: "Zoo",
    sort_order: 64,
    is_primary: true,
    icon: "pets",
    description: "Zoo or animal park",
    search_terms: ["animals", "wildlife", "safari"]
  },

  // EDUCATION
  {
    id: "school",
    name: "School",
    sort_order: 70,
    is_primary: true,
    icon: "school",
    description: "Educational institution",
    search_terms: ["education", "learning", "academy", "institute"]
  },
  {
    id: "dance_studio",
    name: "Dance studio",
    sort_order: 71,
    is_primary: true,
    icon: "theater_comedy",
    description: "Dance studio or performing arts",
    search_terms: ["dance", "dancing", "performing arts", "studio"]
  },
  {
    id: "music_school",
    name: "Music school",
    sort_order: 72,
    is_primary: true,
    icon: "music_note",
    description: "Music instruction or lessons",
    search_terms: ["music lessons", "instrument", "music education"]
  },
  {
    id: "driving_school",
    name: "Driving school",
    sort_order: 73,
    is_primary: true,
    icon: "drive_eta",
    description: "Driving instruction",
    search_terms: ["driving lessons", "driver education", "traffic school"]
  },

  // TRAVEL & LODGING
  {
    id: "hotel",
    name: "Hotel",
    sort_order: 80,
    is_primary: true,
    icon: "hotel",
    description: "Hotel or lodging",
    search_terms: ["accommodation", "lodging", "inn", "motel"]
  },
  {
    id: "travel_agency",
    name: "Travel agency",
    sort_order: 81,
    is_primary: true,
    icon: "flight",
    description: "Travel planning and booking services",
    search_terms: ["travel", "vacation", "trip planning", "tourism"]
  },

  // TECHNOLOGY
  {
    id: "computer_repair",
    name: "Computer repair service",
    sort_order: 90,
    is_primary: true,
    icon: "computer",
    description: "Computer and electronics repair",
    search_terms: ["tech repair", "IT support", "computer service"]
  },
  {
    id: "web_design",
    name: "Web design service",
    sort_order: 91,
    is_primary: true,
    icon: "web",
    description: "Web design and development",
    search_terms: ["web development", "website", "digital", "online"]
  },

  // SPECIALTY RETAIL
  {
    id: "pet_store",
    name: "Pet store",
    sort_order: 100,
    is_primary: true,
    icon: "pets",
    description: "Pet supplies and services",
    search_terms: ["pet supplies", "animals", "pet care"]
  },
  {
    id: "florist",
    name: "Florist",
    sort_order: 101,
    is_primary: true,
    icon: "local_florist",
    description: "Flower shop or florist",
    search_terms: ["flowers", "floral", "plants", "garden"]
  },
  {
    id: "hardware_store",
    name: "Hardware store",
    sort_order: 102,
    is_primary: true,
    icon: "hardware",
    description: "Hardware and home improvement store",
    search_terms: ["tools", "home improvement", "supplies"]
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    sort_order: 103,
    is_primary: true,
    icon: "local_pharmacy",
    description: "Pharmacy or drugstore",
    search_terms: ["drugstore", "medicine", "prescriptions", "health"]
  },

  // SKATE SHOP (Special category for the user's example)
  {
    id: "skate_shop",
    name: "Skate shop",
    sort_order: 104,
    is_primary: true,
    icon: "skateboarding",
    description: "Skateboard and skating equipment store",
    search_terms: ["skateboard", "skating", "skate gear", "extreme sports"]
  },

  // OTHER/GENERAL
  {
    id: "other",
    name: "Other",
    sort_order: 999,
    is_primary: true,
    icon: "category",
    description: "Other business type",
    search_terms: ["general", "miscellaneous", "other"]
  }
];

/**
 * Seed business categories into the database
 * This function will create all business categories if they don't exist
 */
export const seedBusinessCategories = mutation({
  args: {
    force: v.optional(v.boolean()) // Optional flag to force re-seeding
  },
  handler: async (ctx, args) => {
    const { force = false } = args;

    try {
      // Check if categories already exist (unless forcing)
      if (!force) {
        const existingCategories = await ctx.db.query("business_categories").collect();
        if (existingCategories.length > 0) {
          return {
            success: true,
            message: `Business categories already exist (${existingCategories.length} found). Use force: true to re-seed.`,
            categoriesCreated: 0
          };
        }
      }

      // If forcing, clear existing categories
      if (force) {
        const existingCategories = await ctx.db.query("business_categories").collect();
        for (const category of existingCategories) {
          await ctx.db.delete(category._id);
        }
      }

      let categoriesCreated = 0;

      // Insert all business categories
      for (const categoryData of businessCategoriesData) {
        await ctx.db.insert("business_categories", {
          name: categoryData.name,
          parent_id: categoryData.parent_id ? undefined : undefined, // No parent for primary categories
          description: categoryData.description,
          icon: categoryData.icon,
          sort_order: categoryData.sort_order,
          is_active: true,
          // Store additional metadata as a JSON field (if schema supports it)
          // For now, we'll store search terms in the description
        });
        categoriesCreated++;
      }

      return {
        success: true,
        message: `Successfully seeded ${categoriesCreated} business categories`,
        categoriesCreated
      };

    } catch (error) {
      console.error("Error seeding business categories:", error);
      return {
        success: false,
        message: `Error seeding business categories: ${error}`,
        categoriesCreated: 0
      };
    }
  }
});

/**
 * Search business categories by name or search terms
 * This provides the searchable functionality for the onboarding form
 */
export const searchBusinessCategories = query({
  args: {
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { searchTerm = "", limit = 20 } = args;

    try {
      // Get all active categories
      let categoriesQuery = ctx.db.query("business_categories")
        .filter((q) => q.eq(q.field("is_active"), true));

      const allCategories = await categoriesQuery.collect();

      // If no search term, return all categories sorted by sort_order
      if (!searchTerm.trim()) {
        const sortedCategories = allCategories
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .slice(0, limit);
        
        return sortedCategories;
      }

      // Search functionality
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Filter categories based on name matching
      const matchingCategories = allCategories.filter(category => {
        const nameMatch = category.name.toLowerCase().includes(searchLower);
        const descriptionMatch = category.description?.toLowerCase().includes(searchLower);
        
        // Check against the predefined search terms from our data
        const categoryData = businessCategoriesData.find(c => c.name === category.name);
        const searchTermsMatch = categoryData?.search_terms?.some(term => 
          term.toLowerCase().includes(searchLower) || searchLower.includes(term.toLowerCase())
        );
        
        return nameMatch || descriptionMatch || searchTermsMatch;
      });

      // Sort by relevance (exact name match first, then partial matches)
      const sortedResults = matchingCategories.sort((a, b) => {
        const aNameExact = a.name.toLowerCase() === searchLower ? 1 : 0;
        const bNameExact = b.name.toLowerCase() === searchLower ? 1 : 0;
        
        if (aNameExact !== bNameExact) {
          return bNameExact - aNameExact; // Exact matches first
        }
        
        const aNameStarts = a.name.toLowerCase().startsWith(searchLower) ? 1 : 0;
        const bNameStarts = b.name.toLowerCase().startsWith(searchLower) ? 1 : 0;
        
        if (aNameStarts !== bNameStarts) {
          return bNameStarts - aNameStarts; // Starts with matches next
        }
        
        // Then by sort order
        return (a.sort_order || 0) - (b.sort_order || 0);
      });

      return sortedResults.slice(0, limit);
    } catch (error) {
      console.error("Error searching business categories:", error);
      return [];
    }
  }
});

/**
 * Get all business categories, sorted by sort_order
 */
export const getBusinessCategories = query({
  args: {
    activeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { activeOnly = true } = args;

    let categoriesQuery = ctx.db.query("business_categories");

    if (activeOnly) {
      categoriesQuery = categoriesQuery.filter((q) => q.eq(q.field("is_active"), true));
    }

    const categories = await categoriesQuery.collect();

    // Sort alphabetically by name
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }
});

/**
 * Get active business categories for mobile app - alias for getBusinessCategories
 */
export const getPrimaryCategories = query({
  args: {},
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("business_categories")
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();
    
    // Define priority categories that should appear first
    const priorityCategories = [
      "Restaurant",
      "Cafe",
      "Bar",
      "Fast food restaurant",
      "Bakery",
      "Pizza restaurant",
      "Coffee shop",
      "Retail Store",
      "Clothing store",
      "Gift shop",
      "Grocery store",
      "Convenience store",
      "Beauty salon",
      "Hair salon",
      "Nail salon",
      "Spa",
      "Gym",
      "Health & Medical",
      "Doctor",
      "Dentist",
      "Auto repair shop",
      "Car dealer",
      "Real estate agency",
      "Hotel",
      "Professional Services",
      "Lawyer",
      "Accountant",
      "Consultant",
      "Bank",
      "Insurance agency",
      "Home Services",
      "Contractor",
      "Plumber",
      "Electrician",
      "Cleaning service",
      "Landscaping service",
      "Pet store",
      "Pharmacy",
      "Florist",
      "Hardware store",
      "School",
      "Dance studio",
      "Music school",
      "Electronics store",
      "Furniture store",
      "Jewelry store",
      "Book store",
      "Toy store",
      "Other"
    ];
    
    // Create a Set for faster lookups
    const prioritySet = new Set(priorityCategories.map(c => c.toLowerCase()));
    
    // Separate categories into priority and non-priority
    const priorityMatches = [];
    const otherCategories = [];
    
    for (const cat of categories) {
      if (prioritySet.has(cat.name.toLowerCase())) {
        priorityMatches.push(cat);
      } else {
        otherCategories.push(cat);
      }
    }
    
    // Sort priority categories by their order in the priorityCategories array
    priorityMatches.sort((a, b) => {
      const aIndex = priorityCategories.findIndex(p => 
        p.toLowerCase() === a.name.toLowerCase()
      );
      const bIndex = priorityCategories.findIndex(p => 
        p.toLowerCase() === b.name.toLowerCase()
      );
      return aIndex - bIndex;
    });
    
    // Sort other categories alphabetically
    otherCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    // Combine: priority categories first, then all others
    const allCategories = [...priorityMatches, ...otherCategories];
    
    // Return ALL categories (priority ones first)
    return allCategories;
  },
});

export const getActiveCategories = query({
  args: {},
  handler: async (ctx, args) => {
    let categoriesQuery = ctx.db.query("business_categories")
      .filter((q) => q.eq(q.field("is_active"), true));

    const categories = await categoriesQuery.collect();

    // Sort by sort_order
    return categories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }
});

/**
 * Get count of business categories
 */
export const getCategoryCount = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("business_categories").collect();
    return {
      total: categories.length,
      active: categories.filter(c => c.is_active).length
    };
  }
});

/**
 * Simple test function to verify connection
 */
export const testConnection = query({
  args: {},
  handler: async (ctx) => {
    return {
      status: "success",
      message: "Connected to Convex!",
      timestamp: Date.now()
    };
  }
});

/**
 * Get all business category names for mobile app (simple list)
 */
export const getAllCategoryNames = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("business_categories")
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();
    
    console.log(`[getAllCategoryNames] Found ${categories.length} categories in database`);
    
    // If no categories found, return the default hardcoded ones for now
    if (categories.length === 0) {
      console.log('[getAllCategoryNames] No categories in database, returning default list');
      // Return a subset of the hardcoded categories as a fallback
      return businessCategoriesData
        .slice(0, 100) // Return first 100 hardcoded categories
        .map(cat => cat.name)
        .sort((a, b) => a.localeCompare(b));
    }
    
    // Return just the names sorted alphabetically
    return categories
      .map(cat => cat.name)
      .sort((a, b) => a.localeCompare(b));
  }
});

/**
 * Get a single business category by ID
 */
export const getBusinessCategory = query({
  args: {
    categoryId: v.id("business_categories")
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  }
});

/**
 * Create a new business category
 */
export const createBusinessCategory = mutation({
  args: {
    name: v.string(),
    parent_id: v.optional(v.id("business_categories")),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sort_order: v.optional(v.number()),
    is_active: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("business_categories", {
      name: args.name,
      parent_id: args.parent_id,
      description: args.description,
      icon: args.icon,
      sort_order: args.sort_order || 0,
      is_active: args.is_active ?? true
    });

    return {
      success: true,
      categoryId,
      message: "Business category created successfully"
    };
  }
});

/**
 * Update an existing business category
 */
export const updateBusinessCategory = mutation({
  args: {
    categoryId: v.id("business_categories"),
    updates: v.object({
      name: v.optional(v.string()),
      parent_id: v.optional(v.id("business_categories")),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      sort_order: v.optional(v.number()),
      is_active: v.optional(v.boolean())
    })
  },
  handler: async (ctx, args) => {
    const { categoryId, updates } = args;

    // Check if category exists
    const existingCategory = await ctx.db.get(categoryId);
    if (!existingCategory) {
      throw new Error("Business category not found");
    }

    // Update the category
    await ctx.db.patch(categoryId, updates);

    return {
      success: true,
      message: "Business category updated successfully"
    };
  }
});

/**
 * Delete a business category (soft delete by setting is_active to false)
 */
export const deleteBusinessCategory = mutation({
  args: {
    categoryId: v.id("business_categories"),
    hardDelete: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { categoryId, hardDelete = false } = args;

    // Check if category exists
    const existingCategory = await ctx.db.get(categoryId);
    if (!existingCategory) {
      throw new Error("Business category not found");
    }

    // Check if any businesses are using this category
    const businessesUsingCategory = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("category"), existingCategory.name))
      .collect();

    if (businessesUsingCategory.length > 0 && hardDelete) {
      throw new Error(`Cannot delete category: ${businessesUsingCategory.length} businesses are using this category`);
    }

    if (hardDelete) {
      await ctx.db.delete(categoryId);
    } else {
      // Soft delete
      await ctx.db.patch(categoryId, { is_active: false });
    }

    return {
      success: true,
      message: hardDelete ? "Business category deleted permanently" : "Business category deactivated"
    };
  }
});

/**
 * Merge priority categories from hardcoded list into database
 * This ensures that all categories referenced in getPrimaryCategories exist in the database
 * Preserves existing categories and only adds missing ones
 */
export const mergePriorityCategories = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Get the same priority list used in getPrimaryCategories
      const priorityCategories = [
        "Restaurant",
        "Cafe", 
        "Bar",
        "Fast food restaurant",
        "Bakery",
        "Pizza restaurant",
        "Coffee shop",
        "Retail Store",
        "Clothing store",
        "Gift shop",
        "Grocery store",
        "Convenience store",
        "Beauty salon",
        "Hair salon",
        "Nail salon",
        "Spa",
        "Gym",
        "Health & Medical",
        "Doctor",
        "Dentist",
        "Auto repair shop",
        "Car dealer",
        "Real estate agency",
        "Hotel",
        "Professional Services",
        "Lawyer",
        "Accountant",
        "Consultant",
        "Bank",
        "Insurance agency",
        "Home Services",
        "Contractor",
        "Plumber",
        "Electrician",
        "Cleaning service",
        "Landscaping service",
        "Pet store",
        "Pharmacy",
        "Florist",
        "Hardware store",
        "School",
        "Dance studio",
        "Music school",
        "Electronics store",
        "Furniture store",
        "Jewelry store",
        "Book store",
        "Toy store",
        "Other"
      ];

      // Get existing categories from database
      const existingCategories = await ctx.db.query("business_categories").collect();
      const existingNames = new Set(existingCategories.map(cat => cat.name));

      let categoriesAdded = 0;

      // Add missing categories from priority list
      for (let i = 0; i < priorityCategories.length; i++) {
        const categoryName = priorityCategories[i];
        
        if (!existingNames.has(categoryName)) {
          await ctx.db.insert("business_categories", {
            name: categoryName,
            description: `${categoryName} business category`,
            icon: "business", // Default icon
            sort_order: i + 1, // Use index + 1 for sort order
            is_active: true,
          });
          categoriesAdded++;
          console.log(`[mergePriorityCategories] Added missing category: ${categoryName}`);
        }
      }

      return {
        success: true,
        message: `Successfully merged priority categories. Added ${categoriesAdded} new categories.`,
        categoriesAdded,
        totalPriorityCategories: priorityCategories.length
      };

    } catch (error) {
      console.error("Error merging priority categories:", error);
      return {
        success: false,
        message: `Error merging priority categories: ${error}`,
        categoriesAdded: 0
      };
    }
  }
});