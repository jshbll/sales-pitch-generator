import { ConvexClientManager } from '../shared/convex-client';
import { createConvexAPI, BaseBusiness as ConvexBusiness } from '../shared/convex-api';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { BusinessProfile, ApiResponse } from '../types';
import { toBackendFormat, toFrontendFormat } from '../utils/fieldMapper';

// Convert Convex business to local BusinessProfile interface
function convertFromConvexBusiness(convexBusiness: any): BusinessProfile {
  return {
    id: convexBusiness._id,
    // NOTE: owner_id removed since businesses are now independent
    first_name: convexBusiness.first_name,
    last_name: convexBusiness.last_name,
    business_name: convexBusiness.name,
    name: convexBusiness.name, // Also include as 'name' for compatibility
    description: convexBusiness.description,
    address: convexBusiness.address,
    city: convexBusiness.city,
    state: convexBusiness.state,
    zip: convexBusiness.zip,
    phone: convexBusiness.phone,
    email: convexBusiness.email,
    contact_email: convexBusiness.contact_email,
    public_business_email: convexBusiness.public_business_email,
    website: convexBusiness.website,
    facebookUrl: convexBusiness.facebook_url,
    instagramUrl: convexBusiness.instagram_url,
    twitterUrl: convexBusiness.twitter_url,
    linkedinUrl: convexBusiness.linkedin_url,
    tiktokUrl: convexBusiness.tiktok_url,
    pinterestUrl: convexBusiness.pinterest_url,
    logoUrl: convexBusiness.logo_url,
    logo_id: convexBusiness.logo_id,
    category: convexBusiness.category,
    categories: convexBusiness.categories || [],
    latitude: convexBusiness.latitude,
    longitude: convexBusiness.longitude,
    serviceZip: convexBusiness.serviceZip,
    serviceRadius: convexBusiness.serviceRadius,
    customersDoNotVisit: convexBusiness.customersDoNotVisit,
    businessHours: convexBusiness.business_hours,
    internalName: convexBusiness.internal_name,
    profileName: convexBusiness.profile_name,
    subscription_tier: convexBusiness.subscription_tier,
    subscription_status: convexBusiness.subscription_status,
    subscription_plan: convexBusiness.subscription_plan,
    pending_subscription_plan: convexBusiness.pending_subscription_plan,
    pending_subscription_tier: convexBusiness.pending_subscription_tier,
    subscription_pending_change_at: convexBusiness.subscription_pending_change_at,
    subscription_current_period_end: convexBusiness.subscription_current_period_end,
    onboarding_completed_at: convexBusiness.onboarding_completed_at,
    createdAt: convexBusiness._creationTime ? new Date(convexBusiness._creationTime).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(), // Convex doesn't track update time automatically
  };
}

// Convert local BusinessProfile to Convex business format
function convertToConvexBusiness(business: Partial<BusinessProfile>): any {
  return {
    // NOTE: owner_id removed since businesses are now independent
    first_name: business.first_name,
    last_name: business.last_name,
    name: business.business_name!,
    description: business.description,
    address: business.address,
    city: business.city,
    state: business.state,
    zip: business.zip,
    phone: business.phone,
    email: business.email, // Login/authentication email
    contact_email: business.contact_email, // Private contact email
    public_business_email: business.public_business_email, // Public business email
    website: business.website,
    facebook_url: business.facebookUrl || business.facebook_url,
    instagram_url: business.instagramUrl || business.instagram_url,
    twitter_url: business.twitterUrl || business.twitter_url,
    linkedin_url: business.linkedinUrl || business.linkedin_url,
    tiktok_url: business.tiktokUrl || business.tiktok_url,
    pinterest_url: business.pinterestUrl || business.pinterest_url,
    logo_url: business.logoUrl || business.logo_url,
    logo_id: business.logo_id,
    // Ensure category is set - if not provided but categories exists, use first item
    category: business.category || (business.categories && business.categories.length > 0 ? business.categories[0] : undefined),
    categories: business.categories,
    latitude: business.latitude,
    longitude: business.longitude,
    serviceZip: business.serviceZip,
    serviceRadius: business.serviceRadius,
    customersDoNotVisit: business.customersDoNotVisit,
    business_hours: business.businessHours || business.business_hours,
    // Add dual naming fields for business locations
    internal_name: business.internal_name,
    profile_name: business.profile_name,
  };
}

/**
 * Convex-based service for managing business profiles
 */
class ConvexBusinessService {
  private api: ReturnType<typeof createConvexAPI> | null;

  constructor() {
    // Initialize the API lazily to avoid initialization order issues
    this.api = null;
  }

  private getAPI() {
    if (!this.api) {
      const convexClient = ConvexClientManager.getInstance();
      this.api = createConvexAPI(convexClient);
    }
    return this.api;
  }

  /**
   * Get business profile by business ID or email (since businesses are now independent)
   */
  async getBusinessByIdOrEmail(businessIdOrEmail: string): Promise<ApiResponse<BusinessProfile>> {
    console.log(`[ConvexBusinessService] Getting business: ${businessIdOrEmail}`);
    
    try {
      let convexBusiness;
      
      // Check if it looks like an email (contains @)
      if (businessIdOrEmail.includes('@')) {
        console.log('[ConvexBusinessService] Using email-based lookup');
        convexBusiness = await this.getAPI().query(api.businesses.getBusinessByEmail, { email: businessIdOrEmail });
      } else {
        console.log('[ConvexBusinessService] Using business ID lookup');
        convexBusiness = await this.getAPI().query(api.businesses.getBusiness, { businessId: businessIdOrEmail as Id<"businesses"> });
      }
      
      if (!convexBusiness) {
        console.log('[ConvexBusinessService] No business found');
        return {
          success: false,
          error: 'Business not found'
        };
      }

      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail RAW DATA:', convexBusiness);
      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail RAW ZIP:', convexBusiness.zip);
      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail RAW HOURS:', convexBusiness.business_hours);
      
      const business = convertFromConvexBusiness(convexBusiness);
      console.log(`[ConvexBusinessService] Found business: ${business.business_name}`);
      
      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail CONVERTED:', business);
      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail CONVERTED ZIP:', business.zip);
      console.log('[ConvexBusinessService] 🔍 getBusinessByIdOrEmail CONVERTED HOURS:', business.businessHours);

      return {
        success: true,
        data: business
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching business'
      };
    }
  }

  /**
   * Backward compatibility alias for getBusinessByOwner
   * @deprecated Use getBusinessByIdOrEmail instead
   */
  async getBusinessByOwner(ownerIdOrEmail: string): Promise<ApiResponse<BusinessProfile>> {
    return this.getBusinessByIdOrEmail(ownerIdOrEmail);
  }

  /**
   * Get business profile by ID
   */
  async getBusiness(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    console.log(`[ConvexBusinessService] Getting business for ID: ${businessId}`);
    
    try {
      const convexBusiness = await this.getAPI().query(api.businesses.getBusiness, { businessId: businessId as Id<"businesses"> });
      
      if (!convexBusiness) {
        return {
          success: false,
          error: 'Business not found'
        };
      }

      console.log('[ConvexBusinessService] 🔍 RAW CONVEX BUSINESS DATA:', convexBusiness);
      console.log('[ConvexBusinessService] 🔍 RAW ZIP FROM CONVEX:', convexBusiness.zip);
      console.log('[ConvexBusinessService] 🔍 RAW BUSINESS HOURS FROM CONVEX:', convexBusiness.business_hours);
      
      const businessProfile = convertFromConvexBusiness(convexBusiness);
      
      console.log('[ConvexBusinessService] 🔍 CONVERTED BUSINESS PROFILE:', businessProfile);
      console.log('[ConvexBusinessService] 🔍 CONVERTED ZIP:', businessProfile.zip);
      console.log('[ConvexBusinessService] 🔍 CONVERTED BUSINESS HOURS:', businessProfile.businessHours);
      
      return {
        success: true,
        data: businessProfile
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching business'
      };
    }
  }

  /**
   * Create a new business profile (independent business entity)
   */
  async createBusiness(businessData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    // NOTE: owner_id no longer required since businesses are independent
    if (!businessData.business_name) {
      return {
        success: false,
        error: 'Business name is required'
      };
    }

    try {
      console.log(`[ConvexBusinessService] Creating independent business with data:`, businessData);
      console.log(`[ConvexBusinessService] 🔍 ZIP CODE DEBUG:`, businessData.zip);
      console.log(`[ConvexBusinessService] 🔍 BUSINESS HOURS DEBUG:`, businessData.businessHours);
      
      const convexBusinessData = convertToConvexBusiness(businessData);
      console.log(`[ConvexBusinessService] 🔍 CONVERTED ZIP CODE:`, convexBusinessData.zip);
      console.log(`[ConvexBusinessService] 🔍 CONVERTED BUSINESS HOURS:`, convexBusinessData.business_hours);
      
      const createdBusinessId = await this.getAPI().mutation(api.businesses.createBusiness, convexBusinessData);
      
      if (!createdBusinessId) {
        return {
          success: false,
          error: 'Failed to create business'
        };
      }

      // Fetch the created business using the business ID
      const createdBusiness = await this.getAPI().query(api.businesses.getBusiness, { businessId: createdBusinessId });
      
      if (!createdBusiness) {
        return {
          success: false,
          error: 'Failed to retrieve created business'
        };
      }

      const business = convertFromConvexBusiness(createdBusiness);
      console.log(`[ConvexBusinessService] Created business: ${business.business_name}`);

      return {
        success: true,
        data: business
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error creating business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while creating business'
      };
    }
  }

  /**
   * Create a new business profile linked to the authenticated Clerk user
   * This is used for OAuth users during onboarding
   */
  async createBusinessProfile(businessData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      console.log(`[ConvexBusinessService] Creating business profile for Clerk user with data:`, businessData);
      
      // Call the Clerk-aware mutation that links business to authenticated user
      const createdBusinessId = await this.getAPI().mutation(api.businessRegistration.createBusinessProfile, {
        businessName: businessData.businessName || businessData.business_name || businessData.name || '',
        firstName: businessData.firstName || businessData.first_name,
        lastName: businessData.lastName || businessData.last_name,
        phone: businessData.phone,
        category: businessData.category,
        description: businessData.description,
      });
      
      if (!createdBusinessId) {
        throw new Error('Failed to create business profile');
      }
      
      // Fetch the created business to return full data
      const createdBusiness = await this.getAPI().query(api.businesses.getBusiness, { businessId: createdBusinessId });
      
      if (!createdBusiness) {
        throw new Error('Business created but could not be fetched');
      }
      
      const profile = convertFromConvexBusiness(createdBusiness);
      return {
        success: true,
        data: profile
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error creating business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create business profile'
      };
    }
  }

  /**
   * Update business profile
   */
  async updateBusiness(businessId: string, businessData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      console.log(`[ConvexBusinessService] Updating business ${businessId} with data:`, businessData);
      console.log(`[ConvexBusinessService] 🔍 UPDATE ZIP CODE DEBUG:`, businessData.zip);
      console.log(`[ConvexBusinessService] 🔍 UPDATE BUSINESS HOURS DEBUG (camelCase):`, businessData.businessHours);
      console.log(`[ConvexBusinessService] 🔍 UPDATE BUSINESS HOURS DEBUG (snake_case):`, businessData.business_hours);
      
      const updates = convertToConvexBusiness(businessData);
      console.log(`[ConvexBusinessService] 🔍 CONVERTED UPDATE ZIP CODE:`, updates.zip);
      console.log(`[ConvexBusinessService] 🔍 CONVERTED UPDATE BUSINESS HOURS:`, updates.business_hours);
      const result = await this.getAPI().mutation(api.businesses.updateBusiness, { businessId: businessId as Id<"businesses">, updates });
      
      // Handle the new response structure with validation
      if (result && result.business) {
        const updatedBusiness = convertFromConvexBusiness(result.business);
        
        // Log warnings if any URLs were auto-corrected
        if (result.warnings) {
          console.log('[ConvexBusinessService] ⚠️ URLs were auto-corrected:', result.warnings);
        }
        
        return {
          success: true,
          data: updatedBusiness,
          warnings: result.warnings
        };
      } else {
        // Fallback for old response format (backward compatibility)
        const updatedBusiness: BusinessProfile = {
          ...businessData,
          id: businessId,
          updatedAt: new Date().toISOString(),
        } as BusinessProfile;
        return {
          success: true,
          data: updatedBusiness
        };
      }
    } catch (error) {
      console.error('[ConvexBusinessService] Error updating business:', error);
      
      // Check if this is a validation error
      try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const validationError = JSON.parse(errorMessage);
        
        if (validationError.type === 'VALIDATION_ERROR') {
          // Return structured validation error for frontend to handle
          return {
            success: false,
            error: validationError.message,
            validationErrors: validationError.errors
          };
        }
      } catch (parseError) {
        // Not a JSON validation error, handle as regular error
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while updating business'
      };
    }
  }

  /**
   * Update business profile (alias for updateBusiness for compatibility)
   */
  async updateBusinessProfile(businessId: string, profileData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    console.log('[ConvexBusinessService] updateBusinessProfile - delegating to updateBusiness');
    return this.updateBusiness(businessId, profileData);
  }

  /**
   * Get current user's business (using email lookup for UUID compatibility)
   */
  async getCurrentUserBusiness(user: { id: string; businessId?: string; email?: string } | null): Promise<ApiResponse<BusinessProfile>> {
    console.log('[ConvexBusinessService] getCurrentUserBusiness - in business-only architecture');
    
    if (!user?.id) {
      return {
        success: false,
        error: 'User ID is required to get current user business'
      };
    }

    try {
      // In business-only architecture, the user ID IS the business ID
      const businessId = user.businessId || user.id;
      console.log('[ConvexBusinessService] Fetching business with ID:', businessId);
      
      const convexBusiness = await this.getAPI().query(api.businesses.getBusiness, { businessId });
      
      if (!convexBusiness) {
        console.log('[ConvexBusinessService] No business found for ID:', businessId);
        return {
          success: false,
          error: 'Business not found'
        };
      }

      const business = convertFromConvexBusiness(convexBusiness);
      console.log(`[ConvexBusinessService] Found business: ${business.business_name || business.name}`);

      return {
        success: true,
        data: business
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching business'
      };
    }
  }

  /**
   * Get business profile (alias for getBusiness for compatibility)
   */
  async getBusinessProfile(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    console.log('[ConvexBusinessService] getBusinessProfile - delegating to getBusiness');
    return this.getBusiness(businessId);
  }

  /**
   * Get business categories
   */
  async getBusinessCategories(): Promise<ApiResponse<any[]>> {
    console.log('[ConvexBusinessService] getBusinessCategories - returning static categories');
    
    try {
      // For now, return static categories that match the legacy service
      // TODO: Move this to Convex when categories are stored there
      const categories = [
        { id: 'restaurant', name: 'Restaurant', subcategories: ['Fast Food', 'Fine Dining', 'Casual', 'Coffee Shop'] },
        { id: 'retail', name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Grocery', 'Home & Garden'] },
        { id: 'services', name: 'Services', subcategories: ['Beauty', 'Automotive', 'Health', 'Professional'] },
        { id: 'entertainment', name: 'Entertainment', subcategories: ['Bars', 'Movies', 'Recreation', 'Events'] },
        { id: 'health', name: 'Health & Fitness', subcategories: ['Gym', 'Medical', 'Spa', 'Wellness'] }
      ];

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error getting business categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get business categories'
      };
    }
  }

  /**
   * Upload business logo (File-based for compatibility)
   */
  async uploadBusinessLogo(businessId: string, file: File): Promise<ApiResponse<BusinessProfile>> {
    console.log('[ConvexBusinessService] uploadBusinessLogo - converting File to base64');
    
    try {
      // Convert File to base64 data URL
      const dataUrl = await this.fileToDataUrl(file);
      
      // Use existing uploadLogo method
      const uploadResult = await this.uploadLogo(businessId, dataUrl);
      
      if (!uploadResult.success) {
        return uploadResult as any;
      }

      // Return the business profile with updated logo
      return this.getBusiness(businessId);
    } catch (error) {
      console.error('[ConvexBusinessService] Error uploading business logo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload business logo'
      };
    }
  }

  // Banner upload removed - use business_photos table instead

  /**
   * Upload business images (both logo and banner)
   */
  async uploadBusinessImages(businessId: string, files: { logo?: File | null }): Promise<ApiResponse<BusinessProfile>> {
    console.log('[ConvexBusinessService] uploadBusinessImages');
    
    try {
      const promises = [];
      
      if (files.logo) {
        promises.push(this.uploadBusinessLogo(businessId, files.logo));
      }
      
      // Banner upload removed - use business_photos table instead
      
      if (promises.length === 0) {
        return this.getBusiness(businessId);
      }
      
      // Wait for all uploads to complete
      const results = await Promise.all(promises);
      
      // Check if any uploads failed
      const failedUpload = results.find(result => !result.success);
      if (failedUpload) {
        return failedUpload;
      }
      
      // Return the updated business profile
      return this.getBusiness(businessId);
    } catch (error) {
      console.error('[ConvexBusinessService] Error uploading business images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload business images'
      };
    }
  }

  /**
   * Helper method to convert File to data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Search businesses
   */
  async searchBusinesses(searchTerm: string): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      const convexBusinesses = await this.getAPI().query(api.businesses.searchBusinesses, { searchTerm });
      
      if (!convexBusinesses) {
        return {
          success: true,
          data: []
        };
      }

      const businesses = Array.isArray(convexBusinesses) 
        ? convexBusinesses.map(convertFromConvexBusiness)
        : [convertFromConvexBusiness(convexBusinesses)];

      return {
        success: true,
        data: businesses
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error searching businesses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while searching businesses'
      };
    }
  }

  /**
   * Get nearby businesses
   */
  async getNearbyBusinesses(
    latitude: number, 
    longitude: number, 
    radiusKm?: number
  ): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      const convexBusinesses = await this.getAPI().query(api.businesses.getNearbyBusinesses, { latitude, longitude, radiusKm });
      
      if (!convexBusinesses) {
        return {
          success: true,
          data: []
        };
      }

      const businesses = Array.isArray(convexBusinesses) 
        ? convexBusinesses.map(convertFromConvexBusiness)
        : [convertFromConvexBusiness(convexBusinesses)];

      return {
        success: true,
        data: businesses
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching nearby businesses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching nearby businesses'
      };
    }
  }

  /**
   * Get businesses by category
   */
  async getBusinessesByCategory(category: string): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      // Note: This would need to be implemented in the Convex API
      console.warn('[ConvexBusinessService] getBusinessesByCategory not yet implemented in Convex API');
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching businesses by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching businesses by category'
      };
    }
  }

  /**
   * Delete business (archive instead)
   */
  async deleteBusiness(businessId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Instead of deleting, we could mark as inactive
      // For now, return success without actual deletion
      console.log('[ConvexBusinessService] Business deletion not implemented - would archive instead');
      
      return {
        success: true,
        data: { success: true }
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error deleting business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while deleting business'
      };
    }
  }

  /**
   * Get business analytics
   */
  async getBusinessAnalytics(
    businessId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any>> {
    try {
      const analytics = await this.getAPI().query(api.businesses.getBusinessAnalytics, {
        businessId: businessId as Id<"businesses">,
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime()
      });
      
      return {
        success: true,
        data: analytics || {}
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching business analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching analytics'
      };
    }
  }

  /**
   * Get promotion redemption history
   */
  async getPromotionRedemptionHistory(
    promotionId: string,
    limit?: number
  ): Promise<ApiResponse<any>> {
    try {
      const history = await this.getAPI().query(api.analytics.getPromotionRedemptionHistory, {
        promotionId: promotionId as Id<"promotions">,
        limit: limit || 100
      });
      
      return {
        success: true,
        data: history || {}
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching redemption history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching redemption history'
      };
    }
  }

  /**
   * Get business redemption analytics
   */
  async getBusinessRedemptionAnalytics(
    businessId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any>> {
    try {
      const analytics = await this.getAPI().query(api.analytics.getBusinessRedemptionAnalytics, {
        businessId: businessId as Id<"businesses">,
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime()
      });
      
      return {
        success: true,
        data: analytics || {}
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching redemption analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching redemption analytics'
      };
    }
  }

  /**
   * Get boost pricing information
   */
  async getBoostPricing(): Promise<ApiResponse<any>> {
    try {
      const pricing = await this.getAPI().query(api.tierBoosts.getBoostPricing, {});
      return {
        success: true,
        data: pricing
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching boost pricing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get boost pricing'
      };
    }
  }

  /**
   * Get boost options for a business content
   */
  async getBoostOptions(businessId: string, contentId: string, contentType: 'promotion' | 'event'): Promise<ApiResponse<any>> {
    try {
      const options = await this.getAPI().query(api.tierBoosts.getBoostOptions, {
        businessId: businessId as Id<"businesses">,
        contentId,
        contentType
      });
      return {
        success: true,
        data: options
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error fetching boost options:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get boost options'
      };
    }
  }

  /**
   * Create boost payment intent
   */
  async createBoostPaymentIntent(
    businessId: string,
    contentId: string,
    contentType: 'promotion' | 'event',
    fromTier: 'bronze' | 'gold' | 'diamond',
    toTier: 'bronze' | 'gold' | 'diamond',
    days: number = 1
  ): Promise<ApiResponse<{ client_secret: string; payment_intent_id: string; amount: number; currency: string }>> {
    try {
      const result = await this.getAPI().action(api.tierBoosts.createBoostPaymentIntent, {
        businessId: businessId as Id<"businesses">,
        contentId,
        contentType,
        fromTier,
        toTier,
        days
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error creating boost payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create boost payment intent'
      };
    }
  }

  /**
   * Confirm boost purchase
   */
  async confirmBoostPurchase(
    businessId: string,
    paymentIntentId: string,
    contentId: string,
    contentType: 'promotion' | 'event',
    fromTier: 'bronze' | 'gold' | 'diamond',
    toTier: 'bronze' | 'gold' | 'diamond',
    days: number = 1
  ): Promise<ApiResponse<{ boost_id: string; expires_at: number; message: string }>> {
    try {
      const result = await this.getAPI().mutation(api.tierBoosts.confirmBoostPurchase, {
        businessId: businessId as Id<"businesses">,
        paymentIntentId,
        contentId,
        contentType,
        fromTier,
        toTier,
        days
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error confirming boost purchase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm boost purchase'
      };
    }
  }

  /**
   * Upload business logo
   */
  async uploadLogo(businessId: string, imageData: string): Promise<ApiResponse<{ imageUrl: string; imageId: string }>> {
    try {
      const uploadResult = await this.getAPI().action(api.images.uploadImageFromBase64, { 
        dataUrl: imageData, 
        filename: `business_logo_${Date.now()}.jpg`,
        metadata: { category: 'business-logo', businessId } 
      });
      
      if (!uploadResult) {
        return {
          success: false,
          error: 'Failed to upload image'
        };
      }

      // Update business with new logo
      await this.getAPI().mutation(api.businesses.updateBusiness, {
        businessId: businessId as Id<"businesses">,
        updates: {
          logo_url: uploadResult.url,
          logo_id: uploadResult.id
        }
      });

      // ALSO update the primary business location's logo
      // The logo is stored in business_locations for the dual-table pattern
      try {
        await this.getAPI().mutation(api.businessLocations.updatePrimaryLocationLogo, {
          businessId: businessId as Id<"businesses">,
          logo_url: uploadResult.url,
          logo_id: uploadResult.id
        });
        console.log('[ConvexBusinessService] Updated primary location logo');
      } catch (locationError) {
        console.error('[ConvexBusinessService] Failed to update location logo:', locationError);
        // Don't fail the whole operation - business logo is updated
      }

      return {
        success: true,
        data: {
          imageUrl: uploadResult.url,
          imageId: uploadResult.id
        }
      };
    } catch (error) {
      console.error('[ConvexBusinessService] Error uploading logo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while uploading logo'
      };
    }
  }

  // Banner upload removed - use business_photos table instead

  /**
   * Get the Convex client for direct API calls
   */
  getConvexClient() {
    return ConvexClientManager.getInstance();
  }
}

// Export factory function instead of singleton to avoid initialization order issues
let _instance: ConvexBusinessService | null = null;

export function getConvexBusinessService(): ConvexBusinessService {
  if (!_instance) {
    _instance = new ConvexBusinessService();
  }
  return _instance;
}

// Export singleton instance to match legacy service pattern
export default getConvexBusinessService();