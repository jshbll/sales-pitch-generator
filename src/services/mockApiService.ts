/**
 * API Service Redirector
 * 
 * This service redirects all calls to the real API service.
 * Previously, this file contained mock data for development, but we now
 * always use real data from the database.
 */

import { BusinessProfile, ApiResponse } from '../types';

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function generateMockBusinessProfile(id?: string): BusinessProfile {
  console.warn('[DEPRECATED] generateMockBusinessProfile should not be used. Use real API calls instead.');
  
  // Return a minimal object that satisfies the type but with clear indicators this is not real data
  return {
    id: id || 'deprecated',
    name: '[DEPRECATED] Mock data is no longer supported',
    description: 'This is a deprecated function. Use real API calls instead.',
    owner_id: 'deprecated',
    business_name: '[DEPRECATED]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as BusinessProfile;
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function getMockBusinessCategories(): string[] {
  console.warn('[DEPRECATED] getMockBusinessCategories should not be used. Use real API calls instead.');
  return [];
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function getMockBusinessProfile(_businessId: string): ApiResponse<BusinessProfile> {
  console.warn('[DEPRECATED] getMockBusinessProfile should not be used. Use real API calls instead.');
  
  return {
    success: false,
    error: 'Mock data is no longer supported. Use real API calls instead.'
  };
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function getMockBusinessCategoriesResponse(): ApiResponse<string[]> {
  console.warn('[DEPRECATED] getMockBusinessCategoriesResponse should not be used. Use real API calls instead.');
  
  return {
    success: false,
    error: 'Mock data is no longer supported. Use real API calls instead.'
  };
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function createMockBusinessProfile(_profileData: Partial<BusinessProfile>): ApiResponse<BusinessProfile> {
  console.warn('[DEPRECATED] createMockBusinessProfile should not be used. Use real API calls instead.');
  
  return {
    success: false,
    error: 'Mock data is no longer supported. Use real API calls instead.'
  };
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function updateMockBusinessProfile(
  _businessId: string, 
  _profileData: Partial<BusinessProfile>
): ApiResponse<BusinessProfile> {
  console.warn('[DEPRECATED] updateMockBusinessProfile should not be used. Use real API calls instead.');
  
  return {
    success: false,
    error: 'Mock data is no longer supported. Use real API calls instead.'
  };
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function mockImageUpload(_businessId: string, _imageType: 'logo' | 'banner'): ApiResponse<{[key: string]: string}> {
  console.warn('[DEPRECATED] mockImageUpload should not be used. Use real API calls instead.');
  
  return {
    success: false,
    error: 'Mock data is no longer supported. Use real API calls instead.'
  };
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function shouldUseMockData(): boolean {
  console.warn('[DEPRECATED] shouldUseMockData should not be used. Mock data is no longer supported.');
  return false;
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function enableMockDataMode(): void {
  console.warn('[DEPRECATED] enableMockDataMode should not be used. Mock data is no longer supported.');
}

/**
 * DEPRECATED: This function is kept for backward compatibility
 * but should not be used in new code. All data should come from the database.
 */
export function disableMockDataMode(): void {
  console.warn('[DEPRECATED] disableMockDataMode should not be used. Mock data is no longer supported.');
}

// Export the mock API service (deprecated)
export const mockApiService = {
  getMockBusinessProfile,
  getMockBusinessCategories,
  getMockBusinessCategoriesResponse,
  createMockBusinessProfile,
  updateMockBusinessProfile,
  mockImageUpload,
  shouldUseMockData,
  enableMockDataMode,
  disableMockDataMode
};

// Add a console warning when this module is imported
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] mockApiService is deprecated and will be removed in a future version. ' +
    'All data should come from the database.'
  );
}

export default mockApiService;
