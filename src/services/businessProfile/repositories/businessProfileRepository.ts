/**
 * Business Profile Repository
 * 
 * Provides data access methods for business profiles using PostgreSQL database.
 * This repository implements the repository pattern to separate data access
 * concerns from business logic.
 */
import { v4 as uuidv4 } from 'uuid';
// Removed dbConnection import - using API calls instead of direct database connections
import logger from '../utils/loggerService';
import { createErrorContext, BusinessProfileErrorContext } from '../utils/errorContext';
import { toDbRecord, fromDbRecord } from '../utils/typeUtils';
import { BusinessProfile } from '../../../types/businessProfile';
import { ApiResponse } from '../../../types/api';
import { User } from '../../../types/user';

/**
 * Business Profile Repository
 * 
 * Provides data access methods for business profiles.
 */
export class BusinessProfileRepository {
  /**
   * Get a business profile by ID
   * 
   * @param businessId - Business ID
   * @param userId - User ID for context
   * @returns Business profile or error response
   */
  async getById(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    const context = createErrorContext({
      component: 'BusinessProfileRepository',
      functionName: 'getById',
      // Pass only the business ID and let createErrorContext create the simplified objects
      businessId: businessId
    });
    
    logger.debug(`Getting business profile by ID: ${businessId}`, context);
    
    const result = await this.getByIdFromDatabase(businessId, context);
    
    if (result.success && result.data) {
      // Extract business data from the response
      // API returns { success: true, business: {...} }
      const businessData = (result.data as any).business || result.data;
      const profile = this.mapRowToBusinessProfile(businessData);
      
      return {
        success: true,
        data: profile
      };
    }
    
    return result as ApiResponse<BusinessProfile>;
  }
  
  private async getByIdFromDatabase(businessId: string, context: BusinessProfileErrorContext): Promise<ApiResponse<Record<string, unknown>>> {
    // Import the API utils for making HTTP requests instead of direct database connections
    const { getFromApi } = await import('../utils/apiUtils');
    
    // Use the config service to get the correct API endpoint
    const configService = (await import('../config/configService')).default;
    const endpoint = configService.getApiEndpoint(businessId);
    
    const result = await getFromApi<Record<string, unknown>>(endpoint, {
      transformResponse: true,
      context: context
    });
    
    console.log(`[DEBUG] Business Profile Repository - API response:`, result);
    
    return result;
  }
  
  /**
   * Get a business profile by owner ID
   * 
   * @param ownerId - Owner ID
   * @returns Business profile or error response
   */
  async getByOwnerId(ownerId: string): Promise<ApiResponse<BusinessProfile>> {
    const context = createErrorContext({
      component: 'BusinessProfileRepository',
      functionName: 'getByOwnerId'
      // Only set the function name and component
    });
    
    logger.debug(`Getting business profile by owner ID: ${ownerId}`, context);
    
    // Import the API utils for making HTTP requests instead of direct database connections
    const { getFromApi } = await import('../utils/apiUtils');
    
    // Use the config service to get the correct API endpoint (no businessId = current user)
    const configService = (await import('../config/configService')).default;
    const endpoint = configService.getApiEndpoint(); // This will return /businesses/me
    
    logger.debug(`Making API call to: ${endpoint}`, context);
    
    const result = await getFromApi<Record<string, unknown>>(endpoint, {
      transformResponse: true,
      context: context
    });
    
    if (result.success && result.data) {
      // Extract business data from the response
      // API returns { success: true, business: {...} }
      const businessData = (result.data as any).business || result.data;
      const profile = this.mapRowToBusinessProfile(businessData);
      
      return {
        success: true,
        data: profile
      };
    }
    
    return result as ApiResponse<BusinessProfile>;
  }
  
  /**
   * Create a business profile
   * 
   * @param profile - Business profile data
   * @param user - User creating the profile
   * @returns Created business profile or error response
   */
  async create(profile: Partial<BusinessProfile>, user: User): Promise<ApiResponse<BusinessProfile>> {
    const context = createErrorContext({
      component: 'BusinessProfileRepository',
      functionName: 'create',
      // Pass the complete user object as it's already a User type
      user
    });
    
    logger.debug(`Creating business profile for user: ${user.id}`, context);
    
    // Generate a new UUID for the business profile
    const businessId = profile.id || uuidv4();
    
    // Prepare data for insertion
    const data = {
      id: businessId,
      owner_id: user.id,
      name: profile.name || '',
      description: profile.description || '',
      phone: profile.phone || '',
      email: profile.email || user.email || '',
      website: profile.website || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip: profile.zip || '',
      country: profile.country || 'US',
      logo_url: profile.logoUrl || '',
      banner_url: profile.bannerUrl || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Update context with business ID
    context.business = { id: businessId };
    
    const result = await this.createInDatabase(data, context);
    
    if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
      // Map database row to business profile
      const createdProfile = this.mapRowToBusinessProfile(result.data.rows[0]);
      
      return {
        success: true,
        data: createdProfile
      };
    }
    
    return result as ApiResponse<BusinessProfile>;
  }
  
  private async createInDatabase(data: Record<string, unknown>, context: BusinessProfileErrorContext): Promise<ApiResponse<Record<string, unknown>>> {
    const result = await dbConnection.createBusinessProfile<Record<string, unknown>>(data, context);
    
    return result;
  }
  
  /**
   * Update a business profile
   * 
   * @param businessId - Business ID
   * @param profile - Business profile data
   * @param userId - User ID for context
   * @returns Updated business profile or error response
   */
  async update(businessId: string, profile: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    const context = createErrorContext({
      component: 'BusinessProfileRepository',
      functionName: 'update',
      // Pass only the business ID and let createErrorContext create the simplified objects
      businessId: businessId
    });
    
    logger.debug(`Updating business profile: ${businessId}`, context);
    
    // Convert partial profile to database record format using our type utility
    const data = {
      ...toDbRecord(profile),
      updated_at: new Date()
    };
    
    const result = await dbConnection.updateBusinessProfile<Record<string, unknown>>(businessId, data, context);
    
    if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
      // Map database row to business profile using our type utility
      const updatedProfile = fromDbRecord(result.data.rows[0]);
      
      return {
        success: true,
        data: updatedProfile
      };
    }
    
    return result as ApiResponse<BusinessProfile>;
  }
  
  /**
   * Get a business profile by ID (alias for getById)
   * 
   * @param businessId - Business ID
   * @returns Business profile or error response
   */
  async getProfileById(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    return this.getById(businessId);
  }
  
  /**
   * Get business profile for a user
   * 
   * @param userId - User ID
   * @returns Business profile or error response
   */
  async getUserBusiness(userId: string): Promise<ApiResponse<BusinessProfile>> {
    return this.getByOwnerId(userId);
  }
  
  /**
   * Update a business profile (alias for update)
   * 
   * @param businessId - Business ID
   * @param data - Update data
   * @returns Updated business profile or error response
   */
  async updateProfile(businessId: string, data: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    return this.update(businessId, data);
  }
  
  /**
   * Delete a business profile
   * 
   * @param businessId - Business ID
   * @param userId - User ID for context
   * @returns Deleted business profile or error response
   */
  async delete(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    // Create error context
    const context = createErrorContext({
      component: 'BusinessProfileRepository',
      functionName: 'delete',
      // Pass a null user and let createErrorContext create the simplified user object internally
      // Set only the business ID
      businessId: businessId
    });
    
    logger.debug(`Deleting business profile: ${businessId}`, context);
    
    const result = await dbConnection.deleteBusinessProfile<any>(businessId, context);
    
    if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
      // Map database row to business profile
      const deletedProfile = this.mapRowToBusinessProfile(result.data.rows[0]);
      
      return {
        success: true,
        data: deletedProfile
      };
    }
    
    return result as ApiResponse<BusinessProfile>;
  }
  
  /**
   * Map a database row to a business profile
   * 
   * @param row - Database row
   * @returns Business profile
   */
  private mapRowToBusinessProfile(row: Record<string, unknown>): BusinessProfile {
    // Use the fromDbRecord utility for consistent mapping
    return fromDbRecord(row);
  }
}

// Create and export a default instance
const businessProfileRepository = new BusinessProfileRepository();
export default businessProfileRepository;
