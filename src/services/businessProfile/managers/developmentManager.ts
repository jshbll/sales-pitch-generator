/**
 * Business Profile Development Manager
 * 
 * Handles all development and mock data operations for business profiles.
 * Extracted from BusinessProfileService to reduce file length
 * and improve separation of concerns.
 */
import { BusinessProfile } from '../../../types';
import logger from '../utils/loggerService';

/**
 * Development Manager for Business Profiles
 * 
 * Centralizes all development-related operations to reduce duplication
 * and improve maintainability.
 */
export class BusinessProfileDevelopmentManager {
  /**
   * Get a development fallback business profile
   * 
   * @returns A mock business profile for development
   */
  getDevelopmentBusinessProfile(): BusinessProfile {
    logger.debug('Using development fallback business profile', {
      functionName: 'getDevelopmentBusinessProfile',
      component: 'BusinessProfileDevelopmentManager'
    });
    
    return {
      id: 'dev-business-id',
      business_name: 'Development Business',
      description: 'This is a development fallback business profile',
      logo_url: 'https://via.placeholder.com/150',
      address: '123 Dev Street',
      city: 'Development City',
      state: 'DS',
      zip: '12345',
      phone: '555-123-4567',
      email: 'dev@example.com',
      website: 'https://example.com',
      category: 'Development',
      subcategory: 'Testing',
      owner_id: 'dev-owner-id'
    };
  }
}

// Create and export a default instance
const developmentManager = new BusinessProfileDevelopmentManager();
export default developmentManager;
