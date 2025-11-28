/**
 * MVP Business Profile Utility
 * 
 * Provides guaranteed business profile data even when API fails
 * - First attempts to fetch real profile from API
 * - Falls back to cached data in localStorage
 * - Creates sensible defaults if no data available
 * 
 * IMPORTANT: This now returns both synchronous and async versions
 * to support both legacy components and newer async code
 */
import { businessService } from '../services/serviceSelector';
import { BusinessProfile } from '../types';

// For synchronous access, we maintain a cached copy with timestamp
let cachedBusinessProfile: BusinessProfile | null = null;
let lastCacheUpdateTime = 0;

// Cache TTL (Time To Live) in milliseconds - 5 seconds for MVP
const CACHE_TTL_MS = 5000;

// Debug flag - set to false to prevent excessive console logging
const DEBUG = false;

/**
 * Invalidates the business profile cache to force a fresh fetch
 * Call this function whenever the business profile is updated
 */
export const invalidateBusinessProfileCache = (): void => {
  if (DEBUG) console.log('[BusinessProfile] Cache invalidated manually');
  cachedBusinessProfile = null;
  lastCacheUpdateTime = 0;
  // Also clear localStorage cache
  localStorage.removeItem('business_profile_cache');
};

/**
 * Gets business profile synchronously - uses cached data or creates defaults
 * This maintains compatibility with existing components during MVP launch
 * @returns BusinessProfile object immediately (may use cached/default data)
 */
export const getBusinessProfileSync = (): BusinessProfile => {
  if (DEBUG) console.log('[BusinessProfile] Sync access requested');
  
  // Check if we have updated our profile recently (from localStorage)
  const profileLastUpdated = localStorage.getItem('profile_last_updated');
  const profileUpdateTime = profileLastUpdated ? parseInt(profileLastUpdated, 10) : 0;
  const currentTime = Date.now();
  
  // If profile was updated after our cache, invalidate the cache
  if (profileUpdateTime > lastCacheUpdateTime) {
    if (DEBUG) console.log('[BusinessProfile] Cache invalidated due to external update');
    cachedBusinessProfile = null;
  }
  
  // Check if cached profile is still fresh (within TTL)
  const isCacheFresh = currentTime - lastCacheUpdateTime < CACHE_TTL_MS;
  
  // Use cached profile if available and fresh
  if (cachedBusinessProfile && isCacheFresh) {
    if (DEBUG) console.log('[BusinessProfile] Returning cached profile (age: ' + 
                           (currentTime - lastCacheUpdateTime) + 'ms)');
    return cachedBusinessProfile;
  }
  
  // Try to get data from localStorage
  const cachedProfileStr = localStorage.getItem('business_profile_cache');
  if (cachedProfileStr) {
    try {
      const parsedProfile = JSON.parse(cachedProfileStr);
      cachedBusinessProfile = parsedProfile;
      
      // Update cache timestamp from localStorage or use current time
      const cachedTimeStr = localStorage.getItem('business_profile_cache_time');
      lastCacheUpdateTime = cachedTimeStr ? parseInt(cachedTimeStr, 10) : Date.now();
      
      return parsedProfile;
    } catch (e) {
      console.error('[BusinessProfile] Error parsing cached profile:', e);
    }
  }
  
  // Create default profile as last resort
  return createDefaultProfile();
};

/**
 * Asynchronously fetches the latest business profile
 * Will update the cache for synchronous access
 * @returns Promise<BusinessProfile>
 */
export const ensureBusinessProfile = async (): Promise<BusinessProfile> => {
  try {
    if (DEBUG) console.log('[BusinessProfile] Async fetch started');
    
    // Try to get the real profile from the API
    const response = await businessService.getCurrentUserBusiness(null);
    
    if (response.success && response.data) {
      if (DEBUG) console.log('[BusinessProfile] API fetch successful');
      
      // Update our in-memory cache with timestamp
      cachedBusinessProfile = response.data;
      lastCacheUpdateTime = Date.now();
      
      // Cache to localStorage for future sessions
      localStorage.setItem('business_profile_cache', JSON.stringify(response.data));
      localStorage.setItem('business_profile_cache_time', lastCacheUpdateTime.toString());
      return response.data;
    } else {
      console.warn('[BusinessProfile] API request succeeded but no profile data returned');
    }
  } catch (error) {
    console.error('[BusinessProfile] API fetch failed:', error);
  }
  
  // If API fails, fall back to synchronous version which handles all fallbacks
  return getBusinessProfileSync();
};

/**
 * Creates a default business profile when no real data is available
 * @returns A minimal business profile with sensible defaults
 */
function createDefaultProfile(): BusinessProfile {
  if (DEBUG) console.log('[BusinessProfile] Creating default profile');
  
  // Try to extract business name from auth user if available
  const authUserStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
  let businessName = 'Your Business';
  let businessEmail = '';

  
  if (authUserStr) {
    try {
      const authUser = JSON.parse(authUserStr);
      if (DEBUG) console.log('[ensureBusinessProfile] Found auth user', authUser);
      
      // If we have an email, extract a business name from the domain
      if (authUser.email) {
        const emailParts = authUser.email.split('@');
        if (emailParts.length > 1) {
          const domain = emailParts[1];
          const domainName = domain.split('.')[0];
          businessName = domainName
            .split(/[-_]/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          businessEmail = authUser.email;
          if (DEBUG) console.log('[ensureBusinessProfile] Extracted business name from email:', businessName);
        }
      }
    } catch (e) {
      console.error('[ensureBusinessProfile] Error parsing auth user:', e);
    }
  }
  
  // Create a default business profile
  // Use the Cosmic Web Studio logo URL consistently across the application
  const COSMIC_LOGO_URL = 'https://cosmic-web-studios.netlify.app/logo.png';
  
  const defaultProfile: BusinessProfile = {
    id: 'mock-business-id',
    business_name: businessName,
    name: businessName,
    logo: COSMIC_LOGO_URL,
    description: 'Premium Coffee Shop',
    email: businessEmail,
    contactEmail: businessEmail,
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    website: `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
    logo_url: COSMIC_LOGO_URL,
    logoUrl: COSMIC_LOGO_URL,
    category: 'Coffee Shop',
    subcategory: 'Bakery',
    industry: 'Technology',
    founded: '2020',
    employees: '1-10'
  };
  
  // Store the profile in localStorage
  localStorage.setItem('mock_business_profile', JSON.stringify(defaultProfile));
  if (DEBUG) console.log('[ensureBusinessProfile] Created and stored default profile');
  
  return defaultProfile;
};

// For backward compatibility with code that uses default import
// We prioritize the synchronous version since that's safest for legacy code
export default getBusinessProfileSync;
