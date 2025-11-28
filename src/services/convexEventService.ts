import { ConvexClientManager } from '../shared/convex-client';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Event interfaces matching the component expectations
interface EventData {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string; // Add missing zip_code field
  latitude?: number;
  longitude?: number;
  status: 'draft' | 'active' | 'cancelled' | 'completed' | 'postponed';
  is_public: boolean;
  is_featured: boolean;
  max_capacity?: number;
  current_rsvp_count: number;
  image_url?: string;
  // Add category fields that the edit form expects
  event_category_id?: string;
  categoryId?: string;
  subcategory?: string;
  category?: {
    id: string;
    name: string;
  };
  // Add RSVP options that the edit form expects
  rsvp_options?: {
    required: boolean;
  };
  keywords?: string[]; // Search keywords
  business_id: string;
  created_at: string;
  updated_at: string;
}

interface BusinessEventStats {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  past_events: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Convert Convex event to frontend format
function convertFromConvexEvent(convexEvent: any): EventData {
  console.log('[ConvexEventService] Converting Convex event:', convexEvent);
  const converted = {
    id: convexEvent._id,
    title: convexEvent.title,
    description: convexEvent.description,
    start_datetime: new Date(convexEvent.start_datetime).toISOString(),
    end_datetime: new Date(convexEvent.end_datetime).toISOString(),
    location_name: convexEvent.location_name,
    address: convexEvent.address,
    city: convexEvent.city,
    state: convexEvent.state,
    zip_code: convexEvent.zip, // Map from Convex 'zip' field to expected 'zip_code'
    latitude: convexEvent.latitude,
    longitude: convexEvent.longitude,
    status: convexEvent.status,
    is_public: convexEvent.is_public,
    is_featured: convexEvent.is_featured || false,
    max_capacity: convexEvent.max_capacity,
    current_rsvp_count: convexEvent.current_rsvp_count || 0,
    image_url: convexEvent.image_url,
    // Add category information if available
    event_category_id: convexEvent.category_id,
    categoryId: convexEvent.category_id,
    subcategory: convexEvent.subcategory,
    category: convexEvent.category ? {
      id: convexEvent.category.id || convexEvent.category._id,
      name: convexEvent.category.name
    } : undefined,
    // Add RSVP options if available
    rsvp_options: convexEvent.rsvp_options || {
      required: convexEvent.rsvp_required !== undefined ? convexEvent.rsvp_required : true
    },
    keywords: convexEvent.keywords || [], // Include keywords
    business_id: convexEvent.business_id,
    created_at: new Date(convexEvent._creationTime).toISOString(),
    updated_at: new Date(convexEvent._creationTime).toISOString(), // Convex doesn't have updated_at by default
  };
  console.log('[ConvexEventService] Converted event data:', converted);
  return converted;
}

/**
 * Convex-based service for managing business events
 */
class ConvexEventService {
  private cache = new Map<string, { data: EventData[]; timestamp: number }>();
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
   * Validate that a business ID exists in Convex
   * Since we're using Convex-only, businessId should already be a valid Convex ID
   */
  private async validateConvexBusinessId(businessId: string): Promise<boolean> {
    try {
      const client = this.getClient();
      console.log(`[ConvexEventService] Validating Convex business ID: ${businessId}`);
      
      // Get the business directly by ID to validate it exists
      const business = await client.query(api.businesses.getBusiness, { 
        businessId: businessId as any 
      });
      
      if (business) {
        console.log(`[ConvexEventService] Valid business found:`, business._id);
        return true;
      } else {
        console.log(`[ConvexEventService] Business not found for ID: ${businessId}`);
        return false;
      }
    } catch (error) {
      console.error('[ConvexEventService] Error validating business ID:', error);
      return false;
    }
  }

  /**
   * Clear cache for a specific business
   */
  private clearBusinessCache(businessId: string) {
    const keys = Array.from(this.cache.keys()).filter(key => key.startsWith(businessId));
    keys.forEach(key => this.cache.delete(key));
    console.log(`[ConvexEventService] Cleared cache for business: ${businessId}`);
  }

  /**
   * Get all events for a business (Convex-only)
   */
  async getBusinessEvents(businessId: string): Promise<ApiResponse<EventData[]>> {
    console.log(`[ConvexEventService] Getting events for business ID: ${businessId}`);
    if (!businessId) {
      console.error('[ConvexEventService] No business ID provided to getBusinessEvents');
      return {
        success: false,
        error: 'Business ID is required'
      };
    }
    
    // Check cache first
    const cacheKey = `${businessId}-events`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`[ConvexEventService] Returning cached events for business ID: ${businessId}`);
      return {
        success: true,
        data: cached.data
      };
    }
    
    try {
      console.log(`[ConvexEventService] Fetching events from Convex for business: ${businessId}`);
      
      const client = this.getClient();
      
      // Validate the business ID exists in Convex
      const isValidBusiness = await this.validateConvexBusinessId(businessId);
      if (!isValidBusiness) {
        console.log(`[ConvexEventService] Invalid business ID: ${businessId}`);
        return {
          success: false,
          error: 'Business not found'
        };
      }
      
      // Get events directly with the Convex business ID
      const convexEvents = await client.query(api.businessEvents.getEventsByBusiness, { 
        businessId: businessId as Id<"businesses"> 
      });
      
      console.log(`[ConvexEventService] Found ${Array.isArray(convexEvents) ? convexEvents.length : 0} events`);
      
      // Convert events to local format
      const events = Array.isArray(convexEvents) 
        ? convexEvents.map(convertFromConvexEvent)
        : [];

      // Cache the successful result
      this.cache.set(cacheKey, {
        data: events,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: events
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching events'
      };
    }
  }

  /**
   * Get business event statistics (Convex-only)
   */
  async getBusinessEventStats(businessId: string): Promise<ApiResponse<BusinessEventStats>> {
    console.log(`[ConvexEventService] Getting event stats for business ID: ${businessId}`);
    
    try {
      const client = this.getClient();
      
      // Validate the business ID exists in Convex
      const isValidBusiness = await this.validateConvexBusinessId(businessId);
      if (!isValidBusiness) {
        console.log(`[ConvexEventService] Invalid business ID for stats: ${businessId}`);
        return {
          success: true,
          data: {
            total_events: 0,
            active_events: 0,
            upcoming_events: 0,
            past_events: 0
          }
        };
      }
      
      // Get stats directly with the Convex business ID
      const stats = await client.query(api.businessEvents.getBusinessEventStats, { 
        businessId: businessId as Id<"businesses"> 
      });
      
      console.log(`[ConvexEventService] Found event stats:`, stats);
      
      return {
        success: true,
        data: {
          total_events: stats.total_events || 0,
          active_events: stats.active_events || 0,
          upcoming_events: stats.upcoming_events || 0,
          past_events: stats.past_events || 0
        }
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching event stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching event stats'
      };
    }
  }

  /**
   * Get a specific event by ID
   */
  async getEvent(eventId: string): Promise<ApiResponse<EventData>> {
    console.log(`[ConvexEventService] Getting event for ID: ${eventId}`);
    
    try {
      const client = this.getClient();
      const convexEvent = await client.query(api.businessEvents.getEvent, { 
        eventId: eventId as Id<"events"> 
      });
      
      if (!convexEvent) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      const event = convertFromConvexEvent(convexEvent);
      
      return {
        success: true,
        data: event
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching event'
      };
    }
  }

  /**
   * Extract event data from FormData
   */
  private extractEventDataFromFormData(formData: FormData): Partial<EventData> {
    const eventData: Partial<EventData> = {};
    
    // Extract basic fields
    const title = formData.get('title');
    if (title) eventData.title = title.toString();
    
    const description = formData.get('description');
    if (description) eventData.description = description.toString();
    
    const startDatetime = formData.get('start_datetime');
    if (startDatetime) eventData.start_datetime = startDatetime.toString();
    
    const endDatetime = formData.get('end_datetime');
    if (endDatetime) eventData.end_datetime = endDatetime.toString();
    
    const locationName = formData.get('location_name');
    if (locationName) eventData.location_name = locationName.toString();
    
    const address = formData.get('address');
    if (address) eventData.address = address.toString();
    
    const city = formData.get('city');
    if (city) eventData.city = city.toString();
    
    const state = formData.get('state');
    if (state) eventData.state = state.toString();
    
    const businessId = formData.get('business_id');
    if (businessId) eventData.business_id = businessId.toString();
    
    const status = formData.get('status');
    if (status) eventData.status = status.toString() as any;
    
    const isPublic = formData.get('is_public');
    if (isPublic) eventData.is_public = isPublic.toString() === 'true';
    
    const isFeatured = formData.get('is_featured');
    if (isFeatured) eventData.is_featured = isFeatured.toString() === 'true';
    
    const maxCapacity = formData.get('max_capacity');
    if (maxCapacity) eventData.max_capacity = parseInt(maxCapacity.toString());
    
    const imageUrl = formData.get('image_url');
    if (imageUrl) eventData.image_url = imageUrl.toString();
    
    // Extract category fields
    const eventCategoryId = formData.get('event_category_id');
    if (eventCategoryId) {
      eventData.event_category_id = eventCategoryId.toString();
      eventData.categoryId = eventCategoryId.toString();
    }
    
    const subcategory = formData.get('subcategory');
    if (subcategory) {
      eventData.subcategory = subcategory.toString();
    }
    
    // Extract zip code if not already extracted
    const zipCode = formData.get('zip_code');
    if (zipCode) eventData.zip_code = zipCode.toString();

    // Extract latitude and longitude
    const latitude = formData.get('latitude');
    if (latitude) eventData.latitude = parseFloat(latitude.toString());

    const longitude = formData.get('longitude');
    if (longitude) eventData.longitude = parseFloat(longitude.toString());

    // Extract keywords if present
    const keywords = formData.get('keywords');
    if (keywords) {
      // Keywords might be JSON stringified array or comma-separated string
      try {
        eventData.keywords = JSON.parse(keywords.toString());
      } catch {
        // If not JSON, treat as comma-separated string
        eventData.keywords = keywords.toString().split(',').map(k => k.trim()).filter(k => k.length > 0);
      }
    }

    // Extract gallery images if present
    const galleryImages = formData.get('galleryImages');
    if (galleryImages) {
      try {
        (eventData as any).galleryImages = JSON.parse(galleryImages.toString());
      } catch (error) {
        console.error('[ConvexEventService] Failed to parse galleryImages:', error);
      }
    }

    // Extract age restriction fields
    const isAgeRestricted = formData.get('is_age_restricted');
    if (isAgeRestricted !== null) {
      (eventData as any).is_age_restricted = isAgeRestricted.toString() === 'true';
    }

    const minimumAge = formData.get('minimum_age');
    if (minimumAge) {
      (eventData as any).minimum_age = parseInt(minimumAge.toString());
    }

    return eventData;
  }

  /**
   * Create a new event (supports FormData)
   */
  async createEvent(eventDataOrFormData: Partial<EventData> | FormData): Promise<ApiResponse<EventData>> {
    let eventData: Partial<EventData>;
    
    if (eventDataOrFormData instanceof FormData) {
      eventData = this.extractEventDataFromFormData(eventDataOrFormData);
    } else {
      eventData = eventDataOrFormData;
    }
    // Get business ID for fallback auth and cache clearing
    const businessId = eventData.business_id;

    try {
      console.log(`[ConvexEventService] Creating event with data:`, eventData);
      
      const client = this.getClient();
      
      // Include business_id for Business Auth fallback
      const convexEventData = {
        business_id: businessId as any,
        title: eventData.title!,
        description: eventData.description!,
        start_datetime: new Date(eventData.start_datetime!).getTime(),
        end_datetime: new Date(eventData.end_datetime!).getTime(),
        location_name: eventData.location_name,
        address: eventData.address,
        city: eventData.city,
        state: eventData.state,
        zip: eventData.zip_code,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        category_id: eventData.event_category_id || eventData.categoryId,
        subcategory: eventData.subcategory,
        status: eventData.status || 'draft',
        is_public: eventData.is_public !== undefined ? eventData.is_public : true,
        is_featured: eventData.is_featured,
        max_capacity: eventData.max_capacity,
        image_url: eventData.image_url,
        keywords: eventData.keywords,
        is_age_restricted: (eventData as any).is_age_restricted,
        minimum_age: (eventData as any).minimum_age,
      };
      
      // Remove undefined fields to avoid sending them to the API
      Object.keys(convexEventData).forEach(key => {
        if (convexEventData[key as keyof typeof convexEventData] === undefined) {
          delete convexEventData[key as keyof typeof convexEventData];
        }
      });
      
      console.log('[ConvexEventService] Calling createEvent mutation with data:', convexEventData);
      const createdEventId = await client.mutation(api.businessEvents.createEvent, convexEventData);
      console.log('[ConvexEventService] Event created successfully with ID:', createdEventId);
      
      if (!createdEventId) {
        return {
          success: false,
          error: 'Failed to create event'
        };
      }

      // Save gallery images if provided
      if ((eventData as any).galleryImages && Array.isArray((eventData as any).galleryImages)) {
        console.log(`[ConvexEventService] Saving ${(eventData as any).galleryImages.length} gallery images for event:`, createdEventId);

        for (const galleryImage of (eventData as any).galleryImages) {
          // Only save images that aren't already in the database (temp IDs start with 'temp-')
          if (galleryImage.id.startsWith('temp-') || !galleryImage.id) {
            try {
              console.log(`[ConvexEventService] Saving gallery image with display_order ${galleryImage.display_order}:`, galleryImage);
              await client.mutation(api.businessEvents.addEventImage, {
                eventId: createdEventId,
                imageId: galleryImage.image_id,
                image_url: galleryImage.image_url,
                isPrimary: galleryImage.is_primary,
                displayOrder: galleryImage.display_order
              });
            } catch (imageError) {
              console.error(`[ConvexEventService] Failed to save gallery image:`, imageError);
              // Continue with other images, don't fail the whole event
            }
          }
        }
      }

      // Clear cache for this business since we created a new event
      if (businessId) {
        this.clearBusinessCache(businessId);
      }

      // Return the created event
      const createdEvent: EventData = {
        ...eventData,
        id: createdEventId,
        current_rsvp_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as EventData;

      return {
        success: true,
        data: createdEvent
      };
    } catch (error) {
      console.error('[ConvexEventService] Error creating event:', error);
      
      // Check if this is a subscription required error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating event';
      
      // If it's a subscription error, throw it to be handled by the page
      if (errorMessage.includes('SUBSCRIPTION_REQUIRED')) {
        throw new Error('SUBSCRIPTION_REQUIRED');
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update an existing event (supports FormData)
   */
  async updateEvent(eventId: string, eventDataOrFormData: Partial<EventData> | FormData): Promise<ApiResponse<EventData>> {
    let eventData: Partial<EventData>;
    
    if (eventDataOrFormData instanceof FormData) {
      eventData = this.extractEventDataFromFormData(eventDataOrFormData);
    } else {
      eventData = eventDataOrFormData;
    }
    try {
      const client = this.getClient();
      
      const updates: any = {};
      if (eventData.title) updates.title = eventData.title;
      if (eventData.description) updates.description = eventData.description;
      if (eventData.start_datetime) updates.start_datetime = new Date(eventData.start_datetime).getTime();
      if (eventData.end_datetime) updates.end_datetime = new Date(eventData.end_datetime).getTime();
      if (eventData.location_name) updates.location_name = eventData.location_name;
      if (eventData.address) updates.address = eventData.address;
      if (eventData.city) updates.city = eventData.city;
      if (eventData.state) updates.state = eventData.state;
      if (eventData.zip_code) updates.zip = eventData.zip_code;
      if (eventData.latitude !== undefined) updates.latitude = eventData.latitude;
      if (eventData.longitude !== undefined) updates.longitude = eventData.longitude;
      if (eventData.event_category_id || eventData.categoryId) updates.category_id = eventData.event_category_id || eventData.categoryId;
      if (eventData.subcategory !== undefined) updates.subcategory = eventData.subcategory;
      if (eventData.status) updates.status = eventData.status;
      if (eventData.is_public !== undefined) updates.is_public = eventData.is_public;
      if (eventData.is_featured !== undefined) updates.is_featured = eventData.is_featured;
      if (eventData.max_capacity) updates.max_capacity = eventData.max_capacity;
      if (eventData.image_url) updates.image_url = eventData.image_url;
      if (eventData.keywords !== undefined) updates.keywords = eventData.keywords;
      if ((eventData as any).is_age_restricted !== undefined) updates.is_age_restricted = (eventData as any).is_age_restricted;
      if ((eventData as any).minimum_age !== undefined) updates.minimum_age = (eventData as any).minimum_age;
      
      await client.mutation(api.businessEvents.updateEvent, { 
        eventId: eventId as Id<"events">, 
        updates,
        business_id: eventData.business_id as any // Pass business_id for auth fallback
      });
      
      // Clear cache if update was successful
      if (eventData.business_id) {
        this.clearBusinessCache(eventData.business_id);
      }
      
      // Return updated event (in real implementation, we'd fetch the updated data)
      const updatedEvent: EventData = {
        ...eventData,
        id: eventId,
        updated_at: new Date().toISOString(),
      } as EventData;

      return {
        success: true,
        data: updatedEvent
      };
    } catch (error) {
      console.error('[ConvexEventService] Error updating event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while updating event'
      };
    }
  }

  /**
   * Archive an event (soft delete)
   */
  async deleteEvent(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const client = this.getClient();
      
      // Get the event first to find the business ID for cache clearing
      const event = await client.query(api.businessEvents.getEvent, { eventId: eventId as Id<"events"> });
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }
      
      // Instead of permanently deleting, update status to archived
      console.log('[ConvexEventService] Archiving event:', eventId);
      const result = await client.mutation(api.businessEvents.updateEvent, { 
        eventId: eventId as Id<"events">,
        business_id: event.business_id as Id<"businesses">, // Include for auth fallback
        updates: { status: 'archived' }
      });
      console.log('[ConvexEventService] Archive result:', result);
      
      // Clear cache for this business since we archived an event
      this.clearBusinessCache(event.business_id);
      
      return {
        success: true,
        data: { success: true }
      };
    } catch (error) {
      console.error('[ConvexEventService] Error archiving event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while archiving event'
      };
    }
  }

  /**
   * Permanently delete an event (only for archived events)
   */
  async permanentlyDeleteEvent(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const client = this.getClient();
      
      // First check if the event exists
      const event = await client.query(api.businessEvents.getEvent, { 
        eventId: eventId as Id<"events"> 
      });
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found. It may have already been deleted.'
        };
      }
      
      // Clear cache for this business before deletion
      this.clearBusinessCache(event.business_id);
      
      // Use the permanent delete mutation for permanent deletion
      await client.mutation(api.businessEvents.permanentlyDeleteEvent, { 
        eventId: eventId as Id<"events">,
        business_id: event.business_id as Id<"businesses"> // Include for auth fallback
      });
      
      return {
        success: true,
        data: { success: true }
      };
    } catch (error) {
      console.error('[ConvexEventService] Error permanently deleting event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while permanently deleting event'
      };
    }
  }

  /**
   * Update event status
   */
  async updateEventStatus(eventId: string, status: string, businessId?: string): Promise<ApiResponse<EventData>> {
    try {
      const client = this.getClient();
      
      await client.mutation(api.businessEvents.updateEvent, { 
        eventId: eventId as Id<"events">, 
        updates: { status },
        business_id: businessId as any // Pass business_id for auth fallback
      });
      
      // Get the updated event
      const updatedEvent = await this.getEvent(eventId);
      
      return updatedEvent;
    } catch (error) {
      console.error('[ConvexEventService] Error updating event status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while updating event status'
      };
    }
  }

  /**
   * Get event categories
   */
  async getEventCategories(): Promise<ApiResponse<any[]>> {
    console.log('[ConvexEventService] Getting event categories');
    
    try {
      const client = this.getClient();
      const categories = await client.query(api.eventCategories.getEventCategories, { activeOnly: true });
      
      // Transform Convex response to match expected format
      const transformedCategories = categories.map(category => ({
        id: category._id,
        category_id: category.category_id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sort_order: category.sort_order,
        subcategories: category.subcategories || []
      }));
      
      return {
        success: true,
        data: transformedCategories
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching event categories:', error);
      
      // Fallback to default categories
      const defaultCategories = [
        { id: '1', category_id: 'food_and_drink', name: 'Food & Drink', description: 'Restaurant openings, tastings, cooking classes, and dining events' },
        { id: '2', category_id: 'arts_and_culture', name: 'Arts & Culture', description: 'Art exhibitions, performances, and cultural events' },
        { id: '3', category_id: 'music', name: 'Music', description: 'Live music performances and musical events' },
        { id: '4', category_id: 'sports_and_fitness', name: 'Sports & Fitness', description: 'Fitness classes, sports events, and outdoor activities' },
        { id: '5', category_id: 'business_and_networking', name: 'Business & Networking', description: 'Professional networking, workshops, and business events' },
        { id: '6', category_id: 'family_and_education', name: 'Family & Education', description: 'Family-friendly activities and educational events' },
        { id: '7', category_id: 'shopping_and_retail', name: 'Shopping & Retail', description: 'Sales events, markets, and retail experiences' },
        { id: '8', category_id: 'community_and_social', name: 'Community & Social', description: 'Community gatherings, fundraisers, and social events' }
      ];
      
      return {
        success: true,
        data: defaultCategories
      };
    }
  }

  /**
   * Alias for getBusinessEvents to maintain compatibility with dashboard
   */
  async getEventsByBusiness(businessId: string): Promise<ApiResponse<EventData[]>> {
    return this.getBusinessEvents(businessId);
  }

  // ========================
  // EVENT GALLERY METHODS
  // ========================

  /**
   * Get event with gallery images included
   */
  async getEventWithGallery(eventId: string): Promise<ApiResponse<any>> {
    console.log(`[ConvexEventService] Getting event with gallery for ID: ${eventId}`);

    try {
      const client = this.getClient();
      const eventWithGallery = await client.query(api.businessEvents.getEventWithGallery, {
        eventId: eventId as Id<"events">
      });

      if (!eventWithGallery) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      // Convert category_id to event_category_id and categoryId for frontend compatibility
      const convertedEvent = {
        ...eventWithGallery,
        event_category_id: eventWithGallery.category_id,
        categoryId: eventWithGallery.category_id,
        zip_code: eventWithGallery.zip,
        // Ensure latitude and longitude are included
        latitude: eventWithGallery.latitude,
        longitude: eventWithGallery.longitude,
        // Convert age restriction fields
        is_age_restricted: eventWithGallery.is_age_restricted,
        minimum_age: eventWithGallery.minimum_age,
      };

      return {
        success: true,
        data: convertedEvent
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching event with gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching event with gallery'
      };
    }
  }

  /**
   * Add image to event gallery
   */
  async addEventImage(
    eventId: string,
    imageId: string,
    imageUrl: string,
    options: { isPrimary?: boolean; displayOrder?: number } = {}
  ): Promise<ApiResponse<string>> {
    console.log(`[ConvexEventService] Adding image to event gallery:`, { eventId, imageId, imageUrl, options });

    try {
      const client = this.getClient();
      const galleryImageId = await client.mutation(api.businessEvents.addEventImage, {
        eventId: eventId as Id<"events">,
        imageId,
        image_url: imageUrl,
        isPrimary: options.isPrimary,
        displayOrder: options.displayOrder
      });

      console.log(`[ConvexEventService] Image added to gallery with ID:`, galleryImageId);

      return {
        success: true,
        data: galleryImageId
      };
    } catch (error) {
      console.error('[ConvexEventService] Error adding image to event gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while adding image to gallery'
      };
    }
  }

  /**
   * Remove image from event gallery
   */
  async removeEventImage(eventId: string, imageId: string): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexEventService] Removing image from event gallery:`, { eventId, imageId });
    
    try {
      const client = this.getClient();
      await client.mutation(api.businessEvents.removeEventImage, {
        eventId: eventId as Id<"events">,
        imageId: imageId as Id<"event_gallery">
      });

      console.log(`[ConvexEventService] Image removed from gallery`);
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexEventService] Error removing image from event gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while removing image from gallery'
      };
    }
  }

  /**
   * Set primary image in event gallery
   */
  async setEventPrimaryImage(eventId: string, imageId: string): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexEventService] Setting primary image in event gallery:`, { eventId, imageId });

    try {
      const client = this.getClient();
      await client.mutation(api.businessEvents.setEventPrimaryImage, {
        eventId: eventId as Id<"events">,
        imageId: imageId as Id<"event_gallery">
      });

      console.log(`[ConvexEventService] Primary image set in gallery`);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexEventService] Error setting primary image in event gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while setting primary image'
      };
    }
  }

  /**
   * Reorder event gallery images
   */
  async reorderEventImages(eventId: string, imageIds: string[]): Promise<ApiResponse<boolean>> {
    console.log(`[ConvexEventService] Reordering event images:`, { eventId, imageIds });

    try {
      const client = this.getClient();
      await client.mutation(api.businessEvents.reorderEventImages, {
        eventId: eventId as Id<"events">,
        imageIds: imageIds as Id<"event_gallery">[]
      });

      console.log(`[ConvexEventService] Event images reordered successfully`);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('[ConvexEventService] Error reordering event images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while reordering event images'
      };
    }
  }

  /**
   * Get event gallery images
   */
  async getEventGallery(eventId: string): Promise<ApiResponse<any[]>> {
    console.log(`[ConvexEventService] Getting event gallery for ID: ${eventId}`);
    
    try {
      const client = this.getClient();
      const galleryImages = await client.query(api.businessEvents.getEventGallery, { 
        eventId: eventId as Id<"events"> 
      });

      return {
        success: true,
        data: galleryImages || []
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching event gallery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching event gallery'
      };
    }
  }

  // ========================
  // EVENT RSVP METHODS
  // ========================

  /**
   * Get event RSVPs with user details for business owners
   */
  async getEventRSVPsWithUsers(eventId: string, businessId: string): Promise<ApiResponse<any>> {
    console.log(`[ConvexEventService] Getting RSVPs with user details for event: ${eventId}, business: ${businessId}`);
    
    try {
      const client = this.getClient();
      const rsvpData = await client.query(api.businessEvents.getEventRSVPsWithUsers, { 
        eventId: eventId as Id<"events">,
        businessId: businessId as Id<"businesses">
      });

      console.log(`[ConvexEventService] Found RSVP data:`, rsvpData);
      
      return {
        success: true,
        data: rsvpData
      };
    } catch (error) {
      console.error('[ConvexEventService] Error fetching RSVPs with user details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching RSVP data'
      };
    }
  }
}

// Create and export a singleton instance
export const convexEventService = new ConvexEventService();

export default convexEventService;