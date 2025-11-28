import { ConvexClientManager } from '../shared/convex-client';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Promotion, ApiResponse } from '../types';
import { AUTH_USER_KEY } from '../utils/config';

// Convert Convex promotion to local Promotion interface
function convertFromConvexPromotion(convexPromotion: any): Promotion {
  console.log('[ConvexPromotionService] Converting promotion:', {
    id: convexPromotion._id,
    title: convexPromotion.title,
    image_url: convexPromotion.image_url,
    image_id: convexPromotion.image_id
  });
  
  console.log('[ConvexPromotionService] Lock fields from backend:', {
    published_at: convexPromotion.published_at,
    grace_period_expires_at: convexPromotion.grace_period_expires_at,
    grace_period_hours: convexPromotion.grace_period_hours,
    is_locked: convexPromotion.is_locked,
    first_saved_at: convexPromotion.first_saved_at,
    save_count: convexPromotion.save_count,
    locked_reason: convexPromotion.locked_reason,
    has_is_locked: 'is_locked' in convexPromotion,
    has_save_count: 'save_count' in convexPromotion
  });
  
  const promotion: Promotion = {
    id: convexPromotion._id,
    businessId: convexPromotion.business_id,
    title: convexPromotion.title,
    description: convexPromotion.description,
    termsConditions: convexPromotion.terms_conditions,
    discountValue: convexPromotion.discount_value,
    discountType: convexPromotion.discount_type,
    imageUrl: convexPromotion.image_url, // Computed by Convex
    image_url: convexPromotion.image_url, // For compatibility  
    image_id: convexPromotion.image_id,
    startDate: new Date(convexPromotion.start_date),
    endDate: new Date(convexPromotion.end_date),
    status: convexPromotion.status,
    newsletterStatus: convexPromotion.newsletter_status,
    category: convexPromotion.category,
    redemptionCount: convexPromotion.redemption_count,
    claimCount: convexPromotion.claim_count,
    claims: convexPromotion.claim_count, // For compatibility with table display
    valueRating: convexPromotion.value_rating,
    upvoteCount: convexPromotion.upvote_count,
    downvoteCount: convexPromotion.downvote_count,
    hotnessScore: convexPromotion.hotness_score,
    redemptionLimit: convexPromotion.redemption_limit,
    redemptionsCount: convexPromotion.redemptions_count,
    isFollowerExclusive: convexPromotion.is_follower_exclusive,
    profileActiveDate: convexPromotion.profile_active_date ? new Date(convexPromotion.profile_active_date) : undefined,
    isNewsletterBoost: convexPromotion.is_newsletter_boost,
    newsletterBoostDate: convexPromotion.newsletter_boost_date ? new Date(convexPromotion.newsletter_boost_date) : undefined,
    promotionSource: convexPromotion.promotion_source,
    paymentIntentId: convexPromotion.payment_intent_id,
    stripePaymentId: convexPromotion.stripe_payment_id,
    // Flash Sale fields
    isFlashSale: convexPromotion.is_flash_sale,
    flashSaleHours: convexPromotion.flash_sale_hours,
    // Age restriction fields
    isAgeRestricted: convexPromotion.is_age_restricted,
    minimumAge: convexPromotion.minimum_age,
    // Search keywords
    keywords: convexPromotion.keywords || [],
    // Location verification fields
    requireInPerson: convexPromotion.require_in_person || false,
    maxRedemptionDistance: convexPromotion.max_redemption_distance,
    // Location selection fields
    location_ids: convexPromotion.location_ids || [],
    // Custom redemption code fields
    useCustomCode: convexPromotion.use_custom_code || false,
    customRedemptionCode: convexPromotion.custom_redemption_code || '',
    // Per customer limit fields
    hasPerCustomerLimit: !!convexPromotion.per_user_limit,
    perCustomerLimit: convexPromotion.per_user_limit,
    createdAt: convexPromotion.created_at ? new Date(convexPromotion.created_at) : new Date(),
    updatedAt: convexPromotion.updated_at ? new Date(convexPromotion.updated_at) : new Date(),
    // Grace period and locking fields
    publishedAt: convexPromotion.published_at ? new Date(convexPromotion.published_at) : undefined,
    gracePeriodExpiresAt: convexPromotion.grace_period_expires_at ? new Date(convexPromotion.grace_period_expires_at) : undefined,
    gracePeriodHours: convexPromotion.grace_period_hours,
    isLocked: convexPromotion.is_locked || false,
    firstSavedAt: convexPromotion.first_saved_at ? new Date(convexPromotion.first_saved_at) : undefined,
    saveCount: convexPromotion.save_count || 0,
    lockedReason: convexPromotion.locked_reason,
    // Analytics fields
    impression_count: convexPromotion.impression_count || 0,
    impressionCount: convexPromotion.impression_count || 0, // Alias for backwards compatibility
    // Engagement conversion tracking
    follow_conversions: convexPromotion.follow_conversions || 0,
    followConversions: convexPromotion.follow_conversions || 0, // Alias for backwards compatibility
    share_count: convexPromotion.share_count || 0,
    shareCount: convexPromotion.share_count || 0, // Alias for backwards compatibility
  } as any;

  console.log('[ConvexPromotionService] Mapped lock fields to frontend:', {
    publishedAt: promotion.publishedAt,
    gracePeriodExpiresAt: promotion.gracePeriodExpiresAt,
    gracePeriodHours: promotion.gracePeriodHours,
    isLocked: promotion.isLocked,
    firstSavedAt: promotion.firstSavedAt,
    saveCount: promotion.saveCount,
    lockedReason: promotion.lockedReason
  });

  // Add gallery images if available
  if (convexPromotion.gallery_images) {
    console.log('[ConvexPromotionService] Raw gallery_images from Convex:', convexPromotion.gallery_images);
    // Map gallery images to the GalleryImage interface format
    const mappedGalleryImages = convexPromotion.gallery_images.map((image: any) => ({
      id: image._id, // Map _id to id for the component
      image_id: image.image_id,
      image_url: image.image_url,
      display_order: image.display_order,
      is_primary: image.is_primary
    }));
    
    console.log('[ConvexPromotionService] Mapped gallery images:', mappedGalleryImages);
    (promotion as any).gallery_images = mappedGalleryImages;
    (promotion as any).total_images = convexPromotion.total_images;
    (promotion as any).primary_image = convexPromotion.primary_image;
  } else {
    console.log('[ConvexPromotionService] No gallery_images found in promotion response');
  }

  return promotion;
}

// Convert local Promotion to Convex promotion format
function convertToConvexPromotion(promotion: Partial<Promotion>, includeBusinessId: boolean = false): any {
  // Handle dates that might be strings or Date objects
  const getTimestamp = (date: any): number => {
    if (!date) return Date.now();
    if (typeof date === 'string') return new Date(date).getTime();
    if (date instanceof Date) return date.getTime();
    return Date.now();
  };

  // Extract image_id from imageUrl if present
  let image_id = promotion.image_id;
  if (!image_id && (promotion as any).imageUrl) {
    // Extract image_id from Cloudflare URL
    const imageUrlMatch = (promotion as any).imageUrl.match(/\/([a-f0-9-]+)\/public$/);
    if (imageUrlMatch) {
      image_id = imageUrlMatch[1];
    }
  }

  const convexPromotion: any = {
    title: promotion.title!,
    description: promotion.description!,
    terms_conditions: promotion.termsConditions,
    discount_value: parseFloat(String(promotion.discountValue)) || 0,
    discount_type: promotion.discountType!,
    // Discount application type fields
    discount_applies_to: (promotion as any).discountAppliesTo,
    applies_to_item: (promotion as any).appliesToItem,
    tiered_discounts: (promotion as any).tieredDiscounts?.map((tier: any) => ({
      minimum_spend: tier.minimumSpend,
      discount_value: tier.discountValue
    })),
    image_id: image_id,
    start_date: promotion.startDate ? getTimestamp(promotion.startDate) : Date.now(),
    end_date: promotion.endDate ? getTimestamp(promotion.endDate) : Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: promotion.status || 'draft',
    newsletter_status: promotion.newsletterStatus,
    category: promotion.category || 'General',
    redemption_count: promotion.redemptionCount,
    claim_count: promotion.claimCount || promotion.claims,
    value_rating: promotion.valueRating,
    upvote_count: promotion.upvoteCount,
    downvote_count: promotion.downvoteCount,
    hotness_score: promotion.hotnessScore,
    redemption_limit: promotion.redemptionLimit ? parseInt(String(promotion.redemptionLimit)) : undefined,
    redemptions_count: promotion.redemptionsCount,
    is_follower_exclusive: promotion.isFollowerExclusive,
    profile_active_date: promotion.profileActiveDate ? getTimestamp(promotion.profileActiveDate) : undefined,
    is_newsletter_boost: promotion.isNewsletterBoost,
    newsletter_boost_date: promotion.newsletterBoostDate ? getTimestamp(promotion.newsletterBoostDate) : undefined,
    promotion_source: promotion.promotionSource,
    payment_intent_id: promotion.paymentIntentId,
    stripe_payment_id: promotion.stripePaymentId,
    // Flash Sale fields
    is_flash_sale: promotion.isFlashSale,
    flash_sale_hours: promotion.flashSaleHours,
    // Age restriction fields
    is_age_restricted: promotion.isAgeRestricted,
    minimum_age: promotion.minimumAge,
    // Search keywords - use promotion.keywords directly since it's defined in the Promotion type
    keywords: promotion.keywords || [],
    // Location verification fields
    require_in_person: promotion.requireInPerson || false,
    max_redemption_distance: promotion.maxRedemptionDistance,
    // Custom redemption code fields
    use_custom_code: (promotion as any).useCustomCode || false,
    custom_redemption_code: (promotion as any).customRedemptionCode || undefined,
    // Per customer limit fields - using per_user_limit as per schema
    per_user_limit: (promotion as any).hasPerCustomerLimit && (promotion as any).perCustomerLimit 
      ? parseInt(String((promotion as any).perCustomerLimit)) 
      : undefined,
    // Location selection - empty array means all locations
    location_ids: promotion.location_ids || [],
    // Learn More button fields
    learn_more_enabled: (promotion as any).learn_more_enabled || false,
    learn_more_url: (promotion as any).learn_more_url || '',
    learn_more_button_text: (promotion as any).learn_more_button_text || '',
  };

  // Log learn_more fields for debugging
  console.log('[convertToConvexPromotion] Learn More fields:', {
    learn_more_enabled: convexPromotion.learn_more_enabled,
    learn_more_url: convexPromotion.learn_more_url,
    learn_more_button_text: convexPromotion.learn_more_button_text
  });

  // Include business_id for fallback authentication during migration period
  // TODO: Remove this once full Clerk auth migration is complete
  // Only include business_id when explicitly requested (for create operations)
  if (includeBusinessId && promotion.businessId) {
    convexPromotion.business_id = promotion.businessId as Id<"businesses">;
  }

  return convexPromotion;
}

/**
 * Convex-based service for managing business promotions
 */
class ConvexPromotionService {
  private cache = new Map<string, { data: Promotion[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // No initialization needed
  }

  /**
   * Get the Convex client instance
   */
  private getClient() {
    return ConvexClientManager.getInstance();
  }


  /**
   * Clear cache for a specific business
   */
  private clearBusinessCache(businessId: string) {
    const keys = Array.from(this.cache.keys()).filter(key => key.startsWith(businessId));
    keys.forEach(key => this.cache.delete(key));
    console.log(`[ConvexPromotionService] Cleared cache for business: ${businessId}`);
  }

  /**
   * Process promotions response from Convex
   */
  private processPromotionsResponse(convexPromotions: any, businessId: string, isPublic: boolean = false): ApiResponse<Promotion[]> {
    if (!convexPromotions) {
      console.log('[ConvexPromotionService] No promotions found for business');
      return {
        success: true,
        data: []
      };
    }

    // Convert promotions to local format
    const promotions = Array.isArray(convexPromotions) 
      ? convexPromotions.map(convertFromConvexPromotion)
      : [convertFromConvexPromotion(convexPromotions)];

    console.log(`[ConvexPromotionService] Found ${promotions.length} promotions`);

    // Cache the successful result
    const cacheKey = `${businessId}-${isPublic}`;
    this.cache.set(cacheKey, {
      data: promotions,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: promotions
    };
  }

  /**
   * Get all promotions for a business (OPTIMIZED VERSION)
   */
  async getBusinessPromotions(businessId: string, isPublic: boolean = false): Promise<ApiResponse<Promotion[]>> {
    console.log(`[ConvexPromotionService] Getting promotions for business ID: ${businessId}`);
    if (!businessId) {
      console.error('[ConvexPromotionService] No business ID provided to getBusinessPromotions');
      return {
        success: false,
        error: 'Business ID is required'
      };
    }
    
    // Check cache first
    const cacheKey = `${businessId}-${isPublic}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`[ConvexPromotionService] Returning cached promotions for business ID: ${businessId}`);
      return {
        success: true,
        data: cached.data
      };
    }
    
    try {
      console.log(`[ConvexPromotionService] Fetching promotions from Convex for business: ${businessId}`);
      
      const client = this.getClient();
      
      try {
        // Use the optimized query that computes status on-the-fly
        // This avoids database updates and improves performance
        const result = await client.query(api.promotionsOptimized.getBusinessPromotionsOptimized, { 
          businessId: businessId as Id<"businesses">,
          limit: 50 // Get more items since we're not updating the database
        });
        
        // Handle paginated result
        const convexPromotions = result.items || result;
        
        console.log(`[ConvexPromotionService] Found ${Array.isArray(convexPromotions) ? convexPromotions.length : 0} promotions for business`);
        
        // Process promotions and use computed_status if available
        const processedPromotions = Array.isArray(convexPromotions) 
          ? convexPromotions.map((p: any) => ({
              ...p,
              status: p.computed_status || p.status // Use computed status
            }))
          : [];
        
        return this.processPromotionsResponse(processedPromotions, businessId, isPublic);
      } catch (error) {
        console.error('[ConvexPromotionService] Error with direct business ID lookup:', error);
        
        // Fallback: Try to find business by email if direct ID lookup fails
        try {
          console.log(`[ConvexPromotionService] Trying fallback business lookup by email: ${businessId}`);
          
          const allBusinesses = await client.query(api.businesses.searchBusinessesByLocation, {});
          const matchingBusiness = allBusinesses.find((b: any) => 
            // Match by email as fallback (in case businessId is actually an email)
            b.email === businessId
          );
          
          if (matchingBusiness) {
            console.log(`[ConvexPromotionService] Found business by email fallback:`, matchingBusiness._id);
            
            const convexPromotions = await client.query(api.promotions.getPromotionsByBusiness, { 
              businessId: matchingBusiness._id as Id<"businesses"> 
            });
            
            return this.processPromotionsResponse(convexPromotions, businessId, isPublic);
          } else {
            console.log(`[ConvexPromotionService] No business found with ID or email: ${businessId}`);
            return {
              success: true,
              data: []
            };
          }
        } catch (fallbackError) {
          console.error('[ConvexPromotionService] Fallback lookup also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching promotions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching promotions'
      };
    }
  }

  /**
   * Get active promotions for the newsletter
   */
  async getActivePromotions(): Promise<ApiResponse<Promotion[]>> {
    try {
      const client = this.getClient();
      const convexPromotions = await client.query(api.promotions.getActivePromotions, {});
      
      if (!convexPromotions) {
        return {
          success: true,
          data: []
        };
      }

      const promotions = Array.isArray(convexPromotions) 
        ? convexPromotions.map(convertFromConvexPromotion)
        : [convertFromConvexPromotion(convexPromotions)];

      return {
        success: true,
        data: promotions
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching active promotions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching active promotions'
      };
    }
  }

  /**
   * Get a specific promotion by ID
   */
  async getPromotion(promotionId: string): Promise<ApiResponse<Promotion>> {
    console.log(`[ConvexPromotionService] Getting single promotion for ID: ${promotionId}`);
    
    try {
      const client = this.getClient();
      const convexPromotion = await client.query(api.promotions.getPromotion, { 
        promotionId: promotionId as Id<"promotions"> 
      });
      
      if (!convexPromotion) {
        return {
          success: false,
          error: 'Promotion not found'
        };
      }

      console.log('[ConvexPromotionService] Raw convex promotion keywords:', convexPromotion.keywords);
      const promotion = convertFromConvexPromotion(convexPromotion);
      console.log('[ConvexPromotionService] Converted promotion keywords:', promotion.keywords);
      
      return {
        success: true,
        data: promotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching promotion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching promotion'
      };
    }
  }

  /**
   * Get a specific promotion by ID with gallery images
   */
  async getPromotionWithGallery(promotionId: string): Promise<ApiResponse<Promotion>> {
    console.log(`[ConvexPromotionService] Getting promotion with gallery for ID: ${promotionId}`);
    
    try {
      const client = this.getClient();
      const convexPromotion = await client.query(api.promotions.getPromotionWithGallery, { 
        promotionId: promotionId as Id<"promotions"> 
      });
      
      if (!convexPromotion) {
        return {
          success: false,
          error: 'Promotion not found'
        };
      }

      const promotion = convertFromConvexPromotion(convexPromotion);
      
      return {
        success: true,
        data: promotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching promotion with gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching promotion with gallery'
      };
    }
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotionData: Partial<Promotion>): Promise<ApiResponse<Promotion>> {
    // Business ID is required for backward compatibility (until auth migration is complete)
    const businessId = promotionData.businessId; // Keep for cache clearing

    try {
      console.log(`[ConvexPromotionService] Creating promotion with data:`, promotionData);
      
      const client = this.getClient();
      
      // Since businesses are now independent, businessId should be a valid Convex ID
      console.log(`[ConvexPromotionService] Creating promotion for business ID:`, businessId);
      
      try {
        // Include business_id for backward compatibility (until auth migration is complete)
        console.log('[ConvexPromotionService] Input promotionData.keywords:', (promotionData as any).keywords);
        const convexPromotionData = convertToConvexPromotion(promotionData, true);
        console.log('[ConvexPromotionService] Converted convexPromotionData.keywords:', convexPromotionData.keywords);
        
        const createdPromotionId = await client.mutation(api.promotions.createPromotion, convexPromotionData);
        
        if (!createdPromotionId) {
          return {
            success: false,
            error: 'Failed to create promotion'
          };
        }

        // Save gallery images if provided
        if ((promotionData as any).galleryImages && Array.isArray((promotionData as any).galleryImages)) {
          console.log(`[ConvexPromotionService] Saving ${(promotionData as any).galleryImages.length} gallery images for promotion:`, createdPromotionId);

          for (const galleryImage of (promotionData as any).galleryImages) {
            // Only save images that aren't already in the database (temp IDs start with 'temp-')
            if (galleryImage.id.startsWith('temp-') || !galleryImage.id) {
              try {
                console.log(`[ConvexPromotionService] Saving gallery image with display_order ${galleryImage.display_order}:`, galleryImage);
                await client.mutation(api.promotions.addPromotionImage, {
                  promotionId: createdPromotionId,
                  imageId: galleryImage.image_id,
                  image_url: galleryImage.image_url,
                  isPrimary: galleryImage.is_primary,
                  displayOrder: galleryImage.display_order
                });
              } catch (imageError) {
                console.error(`[ConvexPromotionService] Failed to save gallery image:`, imageError);
                // Continue with other images, don't fail the whole promotion
              }
            }
          }
        }

        // Clear cache for this business since we created a new promotion
        this.clearBusinessCache(businessId);
        
        // Return the created promotion data
        const createdPromotion: Promotion = {
          ...promotionData,
          id: createdPromotionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Promotion;

        return {
          success: true,
          data: createdPromotion
        };
      } catch (directError) {
        console.error('[ConvexPromotionService] Direct creation failed:', directError);
        
        // Fallback: Try to find business by email and retry
        try {
          console.log(`[ConvexPromotionService] Trying fallback business lookup for promotion creation`);
          
          // First check if businessId is provided
          if (!businessId) {
            console.error('[ConvexPromotionService] No business ID provided for fallback');
            return {
              success: false,
              error: 'BUSINESS_NOT_FOUND',
              errorDetails: {
                type: 'business_not_found',
                message: 'Unable to identify your business. Please refresh the page and try again.'
              }
            };
          }
          
          const allBusinesses = await client.query(api.businesses.searchBusinessesByLocation, {});
          const matchingBusiness = allBusinesses.find(b => 
            b.email === businessId || b._id === businessId
          );
          
          if (matchingBusiness) {
            console.log(`[ConvexPromotionService] Found business for creation fallback:`, matchingBusiness._id);
            
            // Include business_id for backward compatibility (until auth migration is complete)  
            const convexPromotionData = convertToConvexPromotion(promotionData, true);
            
            // Debug logging for keywords
            console.log('[ConvexPromotionService] createPromotion - promotionData.keywords:', promotionData.keywords);
            console.log('[ConvexPromotionService] createPromotion - convexPromotionData.keywords:', convexPromotionData.keywords);
            
            const createdPromotionId = await client.mutation(api.promotions.createPromotion, convexPromotionData);
            
            if (!createdPromotionId) {
              return {
                success: false,
                error: 'Failed to create promotion'
              };
            }

            // Save gallery images if provided (fallback path)
            if ((promotionData as any).galleryImages && Array.isArray((promotionData as any).galleryImages)) {
              console.log(`[ConvexPromotionService] Saving ${(promotionData as any).galleryImages.length} gallery images for promotion (fallback):`, createdPromotionId);
              
              for (const galleryImage of (promotionData as any).galleryImages) {
                // Only save images that aren't already in the database (temp IDs start with 'temp-')
                if (galleryImage.id.startsWith('temp-') || !galleryImage.id) {
                  try {
                    console.log(`[ConvexPromotionService] Saving gallery image (fallback):`, galleryImage);
                    await client.mutation(api.promotions.addPromotionImage, {
                      promotionId: createdPromotionId,
                      imageId: galleryImage.image_id,
                      image_url: galleryImage.image_url,
                      isPrimary: galleryImage.is_primary
                    });
                  } catch (imageError) {
                    console.error(`[ConvexPromotionService] Failed to save gallery image (fallback):`, imageError);
                    // Continue with other images, don't fail the whole promotion
                  }
                }
              }
            }

            // Clear cache and return success
            this.clearBusinessCache(businessId);
            
            const createdPromotion: Promotion = {
              ...promotionData,
              id: createdPromotionId,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Promotion;

            return {
              success: true,
              data: createdPromotion
            };
          } else {
            console.error(`[ConvexPromotionService] No business found for promotion creation:`, businessId);
            return {
              success: false,
              error: 'Business not found'
            };
          }
        } catch (fallbackError) {
          console.error('[ConvexPromotionService] Fallback creation also failed:', fallbackError);
          throw directError; // Throw original error
        }
      }
    } catch (error) {
      console.error('[ConvexPromotionService] Error creating promotion:', error);
      
      // Check if this is a subscription required error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating promotion';
      
      // Try to parse JSON error messages from backend
      let parsedError = null;
      try {
        parsedError = JSON.parse(errorMessage);
      } catch {
        // Not a JSON error, continue with string parsing
      }
      
      // Handle structured errors from backend
      if (parsedError && parsedError.type) {
        if (parsedError.type === 'SUBSCRIPTION_REQUIRED') {
          return {
            success: false,
            error: 'SUBSCRIPTION_REQUIRED',
            errorDetails: {
              type: 'subscription_required',
              message: parsedError.message || 'A subscription is required to publish promotions. Please upgrade your plan.'
            }
          };
        }
        
        if (parsedError.type === 'LIMIT_REACHED') {
          return {
            success: false,
            error: 'LIMIT_REACHED',
            errorDetails: {
              type: 'limit_reached',
              message: parsedError.message || `You have reached your ${parsedError.feature || 'plan'} limit.`,
              limit: parsedError.limit,
              current: parsedError.current,
              requiresUpgrade: parsedError.requiresUpgrade
            }
          };
        }
      }
      
      // Handle subscription-related errors gracefully (fallback for non-JSON errors)
      if (errorMessage.includes('SUBSCRIPTION_REQUIRED') || errorMessage.includes('subscription')) {
        // Don't throw - return structured error response
        return {
          success: false,
          error: 'SUBSCRIPTION_REQUIRED',
          errorDetails: {
            type: 'subscription_required',
            message: 'A subscription is required to publish promotions. You can save one draft without a subscription.'
          }
        };
      }
      
      // Handle "Business not found" errors gracefully
      if (errorMessage.includes('Business not found') || errorMessage.includes('not found')) {
        return {
          success: false,
          error: 'BUSINESS_NOT_FOUND',
          errorDetails: {
            type: 'business_not_found',
            message: 'Unable to find your business profile. Please try refreshing the page.'
          }
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update an existing promotion
   */
  async updatePromotion(promotionId: string, promotionData: Partial<Promotion>): Promise<ApiResponse<Promotion>> {
    try {
      const client = this.getClient();
      
      // Get business ID from promotion data or from the authenticated user
      let businessId = promotionData.businessId;
      
      if (!businessId) {
        // Try to get from localStorage (stored by auth context)
        const storedUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          businessId = userData.businessId || userData.business_id;
        }
      }
      
      if (!businessId) {
        throw new Error('Business ID is required for updating promotion');
      }
      
      // Don't include business_id in updates
      const updates = convertToConvexPromotion(promotionData, false);
      
      // Debug logging for keywords
      console.log('[ConvexPromotionService] updatePromotion - promotionData.keywords:', promotionData.keywords);
      console.log('[ConvexPromotionService] updatePromotion - updates.keywords:', updates.keywords);
      
      await client.mutation(api.promotions.updatePromotion, { 
        business_id: businessId as Id<"businesses">, // Include for auth fallback
        promotionId: promotionId as Id<"promotions">, 
        updates 
      });
      
      // Handle gallery images for updates
      if ((promotionData as any).galleryImages && Array.isArray((promotionData as any).galleryImages)) {
        console.log(`[ConvexPromotionService] Updating gallery images for promotion:`, promotionId);

        // For updates, we need to:
        // 1. Add new images (temp IDs)
        // 2. Reorder existing images
        const newImages = (promotionData as any).galleryImages.filter((img: any) => img.id.startsWith('temp-') || !img.id);
        const existingImages = (promotionData as any).galleryImages.filter((img: any) => !img.id.startsWith('temp-') && img.id);

        // Add new images
        for (const galleryImage of newImages) {
          try {
            console.log(`[ConvexPromotionService] Adding new gallery image during update with display_order ${galleryImage.display_order}:`, galleryImage);
            await client.mutation(api.promotions.addPromotionImage, {
              promotionId: promotionId as Id<"promotions">,
              imageId: galleryImage.image_id,
              image_url: galleryImage.image_url,
              isPrimary: galleryImage.is_primary,
              displayOrder: galleryImage.display_order
            });
          } catch (imageError) {
            console.error(`[ConvexPromotionService] Failed to add gallery image during update:`, imageError);
            // Continue with other images, don't fail the whole update
          }
        }

        // Reorder existing images if any exist
        if (existingImages.length > 0) {
          try {
            const imageIds = existingImages.map((img: any) => img.id as Id<"promotion_gallery">);
            console.log(`[ConvexPromotionService] Reordering ${existingImages.length} existing images:`, imageIds);
            await client.mutation(api.promotions.reorderPromotionImages, {
              promotionId: promotionId as Id<"promotions">,
              imageIds
            });
          } catch (reorderError) {
            console.error(`[ConvexPromotionService] Failed to reorder images during update:`, reorderError);
          }
        }
      }
      
      // Clear cache if update was successful
      if (promotionData.businessId) {
        this.clearBusinessCache(promotionData.businessId);
      }
      
      // Return updated promotion (in real implementation, we'd fetch the updated data)
      const updatedPromotion: Promotion = {
        ...promotionData,
        id: promotionId,
        updatedAt: new Date(),
      } as Promotion;

      return {
        success: true,
        data: updatedPromotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error updating promotion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while updating promotion'
      };
    }
  }
  
  /**
   * Update promotion status
   */
  async updatePromotionStatus(businessId: string, promotionId: string, status: string): Promise<ApiResponse<Promotion>> {
    try {
      const client = this.getClient();
      await client.mutation(api.promotions.updatePromotion, { 
        business_id: businessId as Id<"businesses">, // Include for ownership verification
        promotionId: promotionId as Id<"promotions">, 
        updates: { status: status as any }
      });
      
      // Return success (in real implementation, we'd fetch the updated promotion)
      return {
        success: true,
        data: { id: promotionId, status } as Promotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error updating promotion status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while updating promotion status'
      };
    }
  }
  
  /**
   * Get available status transitions for a promotion
   */
  async getAvailableStatusTransitions(promotionId: string): Promise<ApiResponse<{
    availableTransitions: string[];
    currentStatus: string;
  }>> {
    // This would need to be implemented based on business logic
    // For now, return common transitions
    return {
      success: true,
      data: {
        availableTransitions: ['draft', 'active', 'paused', 'expired'],
        currentStatus: 'draft'
      }
    };
  }

  /**
   * Archive a promotion (mark as archived instead of permanent deletion)
   */
  async deletePromotion(businessId: string, promotionId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const client = this.getClient();
      // Instead of permanently deleting, update status to archived
      await client.mutation(api.promotions.updatePromotion, { 
        business_id: businessId as Id<"businesses">, // Include for auth fallback
        promotionId: promotionId as Id<"promotions">, 
        updates: { status: 'archived' }
      });
      
      // Clear cache for this business since we archived a promotion
      this.clearBusinessCache(businessId);
      
      return {
        success: true,
        data: { success: true }
      };
    } catch (error: any) {
      // Check if this is a locked promotion error - these are expected and shouldn't be logged as errors
      const isLockError = error?.message && (
        error.message.includes('saved by users') || 
        error.message.includes('cannot be modified') ||
        error.message.includes('locked') ||
        error.message.includes('grace period')
      );
      
      if (!isLockError) {
        console.error('[ConvexPromotionService] Error archiving promotion:', error);
      } else {
        console.log('[ConvexPromotionService] Archive blocked: Promotion is locked');
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while archiving promotion'
      };
    }
  }

  /**
   * Permanently delete a promotion (only for archived promotions)
   */
  async permanentlyDeletePromotion(businessId: string, promotionId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const client = this.getClient();
      // Use the actual delete mutation for permanent deletion
      await client.mutation(api.promotions.deletePromotion, { 
        promotionId: promotionId as Id<"promotions">,
        business_id: businessId as Id<"businesses"> // Include for auth fallback
      });
      
      // Clear cache for this business since we deleted a promotion
      this.clearBusinessCache(businessId);
      
      return {
        success: true,
        data: { success: true }
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error permanently deleting promotion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while permanently deleting promotion'
      };
    }
  }

  /**
   * Schedule a promotion for the newsletter
   */
  async schedulePromotion(
    promotionId: string, 
    scheduleDate: string
  ): Promise<ApiResponse<Promotion>> {
    try {
      const client = this.getClient();
      const scheduleTimestamp = new Date(scheduleDate).getTime();
      await client.mutation(api.promotions.updatePromotion, { 
        promotionId: promotionId as Id<"promotions">, 
        updates: {
          newsletter_status: 'scheduled',
          newsletter_boost_date: scheduleTimestamp
        }
      });
      
      return {
        success: true,
        data: { id: promotionId, newsletterStatus: 'scheduled' } as Promotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error scheduling promotion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while scheduling promotion'
      };
    }
  }

  /**
   * Cancel a scheduled promotion
   */
  async cancelPromotion(promotionId: string): Promise<ApiResponse<Promotion>> {
    try {
      const client = this.getClient();
      await client.mutation(api.promotions.updatePromotion, { 
        promotionId: promotionId as Id<"promotions">, 
        updates: { newsletter_status: 'cancelled' }
      });
      
      return {
        success: true,
        data: { id: promotionId, newsletterStatus: 'cancelled' } as Promotion
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error cancelling promotion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while cancelling promotion'
      };
    }
  }

  /**
   * Process payment for a promotion
   */
  async processPayment(
    promotionId: string,
    paymentDetails: {
      amount: number;
      currency: string;
      isPremium: boolean;
    }
  ): Promise<ApiResponse<{ success: boolean; checkoutUrl: string }>> {
    try {
      // This would integrate with the Stripe payment processing in Convex
      // For now, return a mock response
      console.log('[ConvexPromotionService] Payment processing not yet implemented for Convex');
      
      return {
        success: false,
        error: 'Payment processing not yet implemented'
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while processing payment'
      };
    }
  }

  /**
   * Get analytics for a promotion
   */
  async getPromotionAnalytics(
    promotionId: string
  ): Promise<ApiResponse<{
    impressions: number;
    saves: number;
    redemptions: number;
    clickRate: number;
  }>> {
    try {
      const client = this.getClient();
      // Note: getPromotionAnalytics may not exist in Convex yet
      // This is a placeholder for future implementation
      console.log('[ConvexPromotionService] Analytics not yet implemented for Convex');
      const analytics = null;
      
      if (!analytics) {
        return {
          success: true,
          data: {
            impressions: 0,
            saves: 0,
            redemptions: 0,
            clickRate: 0
          }
        };
      }

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching promotion analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching analytics'
      };
    }
  }
  
  /**
   * Get redeemed coupons for a business
   */
  async getRedeemedCoupons(options: { 
    businessId?: string; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<ApiResponse<{ coupons: any[]; total: number }>> {
    try {
      console.log(`[ConvexPromotionService] Getting redeemed coupons for business ID: ${options.businessId}`);
      
      // Get business ID from user if not provided
      let businessId = options.businessId;
      const client = this.getClient();
      
      if (!businessId) {
        const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || '{}');
        businessId = user.businessId;
      }

      try {
        // Since businesses are now independent, try direct lookup first
        const result = await client.query(api.coupons.getBusinessRedeemedCoupons, {
          businessId: businessId as Id<"businesses">,
          limit: options.limit,
          offset: options.offset,
        });

        return {
          success: true,
          data: result
        };
      } catch (directError) {
        console.error('[ConvexPromotionService] Direct business lookup failed:', directError);
        
        // Fallback: Try to find business by email
        try {
          console.log(`[ConvexPromotionService] Trying fallback business lookup by email for coupons`);
          
          const allBusinesses = await client.query(api.businesses.searchBusinessesByLocation, {});
          const matchingBusiness = allBusinesses.find((b: any) => 
            b.email === businessId
          );
          
          if (matchingBusiness) {
            console.log(`[ConvexPromotionService] Found business by email for coupons:`, matchingBusiness._id);
            
            const result = await client.query(api.coupons.getBusinessRedeemedCoupons, {
              businessId: matchingBusiness._id as Id<"businesses">,
              limit: options.limit,
              offset: options.offset,
            });

            return {
              success: true,
              data: result
            };
          } else {
            console.log(`[ConvexPromotionService] No business found for redeemed coupons`);
            return {
              success: true,
              data: { coupons: [], total: 0 }
            };
          }
        } catch (fallbackError) {
          console.error('[ConvexPromotionService] Fallback lookup also failed:', fallbackError);
          throw directError;
        }
      }
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching redeemed coupons:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching redeemed coupons'
      };
    }
  }

  /**
   * Process automatic status transitions
   */
  async processAutomaticStatusTransitions(): Promise<ApiResponse<void>> {
    // This would be implemented as a Convex scheduled function
    console.log('[ConvexPromotionService] Automatic status transitions would be handled by Convex scheduled functions');
    
    return {
      success: true,
      data: undefined
    };
  }

  /**
   * Get coupon details by unique code
   * @param couponCode - The unique coupon code
   * @returns Promise with coupon details
   */
  async getCouponByCode(couponCode: string): Promise<ApiResponse<any>> {
    console.log(`[ConvexPromotionService] Getting coupon by code: ${couponCode}`);
    
    try {
      const client = this.getClient();
      const formattedCode = couponCode.trim().toUpperCase();
      
      const coupon = await client.query(api.coupons.getCouponByCode, { 
        code: formattedCode 
      });
      
      if (!coupon) {
        return {
          success: false,
          error: 'Coupon not found'
        };
      }

      return {
        success: true,
        data: coupon
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error fetching coupon by code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching coupon'
      };
    }
  }

  /**
   * Redeem a coupon
   * @param couponId - The ID of the coupon to redeem
   * @returns Promise with redemption result
   */
  async redeemCoupon(couponId: string): Promise<ApiResponse<any>> {
    console.log(`[ConvexPromotionService] Redeeming coupon ID: ${couponId}`);
    
    try {
      const client = this.getClient();
      
      const result = await client.mutation(api.coupons.redeemCoupon, { 
        couponId: couponId as Id<"coupons"> 
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error redeeming coupon:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while redeeming coupon'
      };
    }
  }

  /**
   * Refresh a specific promotion's status based on its dates
   * @param promotionId - The ID of the promotion to refresh
   * @returns Promise with the updated promotion
   */
  async refreshPromotionStatus(promotionId: string): Promise<ApiResponse<Promotion>> {
    console.log(`[ConvexPromotionService] Refreshing status for promotion ID: ${promotionId}`);
    
    try {
      const client = this.getClient();
      
      const updatedPromotion = await client.mutation(api.promotions.refreshPromotionStatus, { 
        promotionId: promotionId as Id<"promotions"> 
      });
      
      if (!updatedPromotion) {
        return {
          success: false,
          error: 'Promotion not found'
        };
      }

      return {
        success: true,
        data: convertFromConvexPromotion(updatedPromotion)
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error refreshing promotion status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while refreshing promotion status'
      };
    }
  }

  /**
   * Bulk update all promotion statuses based on their dates
   * @returns Promise with update statistics
   */
  async updateAllPromotionStatuses(): Promise<ApiResponse<{ updatedCount: number; totalPromotions: number }>> {
    console.log(`[ConvexPromotionService] Status update disabled - using computed statuses`);
    
    // Status updates are now computed on-the-fly, no need to update database
    // This significantly improves performance and reduces database load
    return {
      success: true,
      data: {
        updatedCount: 0,
        totalPromotions: 0
      }
    };
  }

  /**
   * Add an image to a promotion's gallery
   */
  async addPromotionImage(
    promotionId: string,
    imageId: string,
    imageUrl: string,
    options?: {
      isPrimary?: boolean;
      displayOrder?: number;
    }
  ): Promise<ApiResponse<string>> {
    console.log(`[ConvexPromotionService] Adding image to promotion gallery: ${promotionId} with displayOrder: ${options?.displayOrder}`);

    try {
      const client = this.getClient();

      const galleryImageId = await client.mutation(api.promotions.addPromotionImage, {
        promotionId: promotionId as Id<"promotions">,
        imageId,
        image_url: imageUrl,
        isPrimary: options?.isPrimary,
        displayOrder: options?.displayOrder
      });

      return {
        success: true,
        data: galleryImageId
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error adding promotion image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while adding promotion image'
      };
    }
  }

  /**
   * Remove an image from a promotion's gallery
   */
  async removePromotionImage(
    promotionId: string,
    imageId: string
  ): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexPromotionService] Removing image from promotion gallery: ${promotionId}`);
    
    try {
      const client = this.getClient();
      
      await client.mutation(api.promotions.removePromotionImage, {
        promotionId: promotionId as Id<"promotions">,
        imageId: imageId as Id<"promotion_gallery">
      });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error removing promotion image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while removing promotion image'
      };
    }
  }

  /**
   * Set the primary image for a promotion
   */
  async setPromotionPrimaryImage(
    promotionId: string,
    imageId: string
  ): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexPromotionService] Setting primary image for promotion: ${promotionId}`);
    
    try {
      const client = this.getClient();
      
      await client.mutation(api.promotions.setPromotionPrimaryImage, {
        promotionId: promotionId as Id<"promotions">,
        imageId: imageId as Id<"promotion_gallery">
      });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error setting primary image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while setting primary image'
      };
    }
  }

  /**
   * Reorder promotion gallery images
   */
  async reorderPromotionImages(
    promotionId: string,
    imageIds: string[]
  ): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexPromotionService] Reordering promotion images: ${promotionId}`);
    
    try {
      const client = this.getClient();
      
      await client.mutation(api.promotions.reorderPromotionImages, {
        promotionId: promotionId as Id<"promotions">,
        imageIds: imageIds as Id<"promotion_gallery">[]
      });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexPromotionService] Error reordering promotion images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while reordering promotion images'
      };
    }
  }
}

// Create and export a singleton instance
export const convexPromotionService = new ConvexPromotionService();

export default convexPromotionService;