/**
 * Business Hours Service
 * 
 * This service handles business hours operations, including fetching,
 * creating, and updating business hours.
 */
import apiService from './api';
import { ApiResponse, BusinessProfile } from '../types';
import businessCircuitBreaker from './businessCircuitBreaker';

/**
 * Business Hours Service class
 * Provides methods for managing business hours
 */
export class BusinessHoursService {
  /**
   * Update business hours
   * @param businessId The ID of the business
   * @param hours The hours data to update
   * @returns ApiResponse with the updated business profile data
   */
  async updateBusinessHours(
    businessId: string, 
    hours: Record<string, { open: string; close: string; closed: boolean }>
  ): Promise<ApiResponse<BusinessProfile>> {
    console.log('[BusinessHoursService] Updating business hours for business:', businessId);
    
    if (!businessId) {
      console.error('[BusinessHoursService] No business ID provided for hours update');
      return {
        success: false,
        error: 'Business ID is required'
      };
    }
    
    // Check if the circuit breaker is open
    if (businessCircuitBreaker.isCircuitOpen()) {
      console.warn('[BusinessHoursService] Circuit breaker is open, cannot update hours');
      return {
        success: false,
        error: 'Service temporarily unavailable due to rate limiting or errors',
        circuitOpen: true
      };
    }
    
    try {
      // Validate hours format
      this.validateHoursFormat(hours);
      
      // Update the business hours
      console.log('[BusinessHoursService] Sending hours update request to API');
      const response = await apiService.patch(`/businesses/${businessId}`, { hours });
      
      if (response.success && response.data) {
        console.log('[BusinessHoursService] Business hours updated successfully');
        
        // Clear the business profile cache
        businessCircuitBreaker.clearBusinessProfileCache();
        
        // Record success in the circuit breaker
        businessCircuitBreaker.recordSuccess();
        
        return {
          success: true,
          data: response.data as BusinessProfile
        };
      } else {
        console.error('[BusinessHoursService] API returned error:', response.error);
        
        // Record failure in the circuit breaker
        businessCircuitBreaker.recordFailure();
        
        return {
          success: false,
          error: response.error || 'Failed to update business hours'
        };
      }
    } catch (error) {
      console.error('[BusinessHoursService] Error updating business hours:', error);
      
      // Record failure in the circuit breaker
      businessCircuitBreaker.recordFailure();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update business hours'
      };
    }
  }

  /**
   * Get default business hours structure
   * @returns A default business hours structure
   */
  getDefaultBusinessHours(): Record<string, { open: string; close: string; closed: boolean }> {
    return {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    };
  }

  /**
   * Validate hours format
   * @param hours The hours data to validate
   * @throws Error if the hours format is invalid
   */
  private validateHoursFormat(hours: Record<string, { open: string; close: string; closed: boolean }>): void {
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Check that all required days are present
    for (const day of requiredDays) {
      if (!hours[day]) {
        throw new Error(`Missing required day: ${day}`);
      }
      
      const dayHours = hours[day];
      
      // Check that each day has the required properties
      if (dayHours.closed === undefined) {
        throw new Error(`Missing 'closed' property for ${day}`);
      }
      
      // If the day is not closed, check that open and close times are present
      if (!dayHours.closed) {
        if (!dayHours.open) {
          throw new Error(`Missing 'open' time for ${day}`);
        }
        if (!dayHours.close) {
          throw new Error(`Missing 'close' time for ${day}`);
        }
        
        // Validate time format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(dayHours.open)) {
          throw new Error(`Invalid 'open' time format for ${day}: ${dayHours.open}`);
        }
        if (!timeRegex.test(dayHours.close)) {
          throw new Error(`Invalid 'close' time format for ${day}: ${dayHours.close}`);
        }
      }
    }
  }
}

// Create and export a default instance
const businessHoursService = new BusinessHoursService();
export default businessHoursService;
