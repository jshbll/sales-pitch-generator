import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { businessService } from '../services/serviceSelector';
import { BusinessProfile } from '../types';
import { debugLog } from '../utils/debugLogger';

// Constants for localStorage keys
const BUSINESS_PROFILE_CACHE_KEY = 'business_profile_cache';
const BUSINESS_NAME_CACHE_KEY = 'current_business_name';
const BUSINESS_LOGO_CACHE_KEY = 'current_business_logo';
const CACHE_VERSION_KEY = 'business_cache_version';

// Cache expiration time in milliseconds (10 minutes)
const CACHE_MAX_AGE_MS = 10 * 60 * 1000;

// Cache version - increment this to bust all caches
const CACHE_VERSION = '2.0';

/**
 * Custom hook to fetch and manage business profile data
 * @returns Business profile data and loading state
 */
export const useBusinessProfile = () => {
  const { user, businessProfile: authBusinessProfile } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Function to manually refresh the business profile data
  // This should only be called after a successful profile update
  const refreshBusinessProfile = useCallback(() => {
    localStorage.removeItem(BUSINESS_PROFILE_CACHE_KEY);
    setShouldRefresh(true);
    setLoading(true);
  }, []);

  // Load cached profile data on initial mount
  useEffect(() => {
    // Check cache version and clear if outdated
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion !== CACHE_VERSION) {
      debugLog.business('[useBusinessProfile] Cache version mismatch, clearing cache');
      localStorage.removeItem(BUSINESS_PROFILE_CACHE_KEY);
      localStorage.removeItem(BUSINESS_NAME_CACHE_KEY);
      localStorage.removeItem(BUSINESS_LOGO_CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
    
    // Try to load cached profile data immediately to avoid UI flicker
    try {
      const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
      if (cachedProfileStr) {
        const cachedProfile = JSON.parse(cachedProfileStr);
        
        // Check if cache is still valid
        if (cachedProfile && 
            cachedProfile.data && 
            cachedProfile.timestamp && 
            Date.now() - cachedProfile.timestamp < CACHE_MAX_AGE_MS) {
          debugLog.business('[useBusinessProfile] Using cached business profile data on initial mount', {
            hasPendingChanges: !!cachedProfile.data.pending_subscription_plan,
            pending_subscription_plan: cachedProfile.data.pending_subscription_plan,
            subscription_pending_change_at: cachedProfile.data.subscription_pending_change_at
          });
          setBusinessProfile(cachedProfile.data);
        }
      }
    } catch (err) {
      debugLog.business('[useBusinessProfile] Error loading cached profile:', err);
    }
  }, []);

  // Store individual business name and logo for quick access
  useEffect(() => {
    if (businessProfile) {
      // Store business name separately for quick access
      const businessName = businessProfile.business_name || businessProfile.name || '';
      if (businessName && typeof businessName === 'string') {
        localStorage.setItem(BUSINESS_NAME_CACHE_KEY, businessName);
      }
      
      // Store logo URL separately for quick access
      const logoUrl = businessProfile.logo_url || businessProfile.logoUrl || '';
      if (logoUrl && typeof logoUrl === 'string') {
        localStorage.setItem(BUSINESS_LOGO_CACHE_KEY, logoUrl);
      }
    }
  }, [businessProfile]);

  useEffect(() => {
    // Use the business profile from auth context if available
    if (authBusinessProfile) {
      debugLog.business('[useBusinessProfile] Using business profile from auth context:', {
        id: authBusinessProfile._id,
        name: authBusinessProfile.name,
        hasPendingChanges: !!authBusinessProfile.pending_subscription_plan
      });
      setBusinessProfile(authBusinessProfile);
      setLoading(false);
      setError(null);
      return;
    }
    
    const fetchBusinessProfile = async () => {
      // Early return if the user is not yet loaded or authenticated
      if (!user) {
        setLoading(false);
        return;
      }

      // If we don't have a businessId, check if it's stored in localStorage
      // This helps with page refreshes where the user object might be partially loaded
      if (!user?.businessId) {
        try {
          const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            if (cachedProfile?.data?.id) {
              debugLog.business('[useBusinessProfile] Using cached business ID:', cachedProfile.data.id);
              // We have a cached business profile with an ID, use it as a fallback
              setBusinessProfile(cachedProfile.data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          debugLog.business('[useBusinessProfile] Error checking cached profile for businessId:', err);
        }
        
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Check for a valid cached profile first
        try {
          const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            
            // Check if cache is still valid and matches current user's business
            // Also invalidate cache if subscription data might have changed
            const cacheAge = Date.now() - cachedProfile.timestamp;
            const isSubscriptionStale = cachedProfile.data.subscription_plan && cacheAge > (60 * 1000); // 1 minute for subscription data
            
            if (cachedProfile && 
                cachedProfile.data && 
                cachedProfile.timestamp && 
                !isSubscriptionStale &&
                cacheAge < CACHE_MAX_AGE_MS &&
                cachedProfile.data.id === user.businessId) {
              debugLog.business('[useBusinessProfile] Using cached business profile data', {
                hasPendingChanges: !!cachedProfile.data.pending_subscription_plan,
                pending_subscription_plan: cachedProfile.data.pending_subscription_plan,
                subscription_pending_change_at: cachedProfile.data.subscription_pending_change_at,
                cacheAge: Math.round(cacheAge / 1000) + 's'
              });
              setBusinessProfile(cachedProfile.data);
              setLoading(false);
              return;
            } else {
              debugLog.business('[useBusinessProfile] Cache expired or business ID mismatch, fetching fresh data');
            }
          }
        } catch (err) {
          debugLog.business('[useBusinessProfile] Error checking cache:', err);
        }
        
        // Pass the user object to the service function
        debugLog.business('[useBusinessProfile] Calling businessService.getCurrentUserBusiness with user:', {
          id: user.id,
          businessId: user.businessId,
          role: user.role
        });
        
        // Use the configured service from serviceSelector
        const response = await businessService.getCurrentUserBusiness(user);
        debugLog.business('[useBusinessProfile] API Response:', {
          success: response.success,
          error: response.error,
          data: response.data ? {
            id: response.data.id,
            business_name: response.data.business_name,
            name: response.data.name,
            // Include other important fields for debugging
            user_id: response.data.user_id,
            hasBusinessName: !!response.data.business_name,
            hasName: !!response.data.name
          } : null
        });
        
        if (response.success && response.data) {
          // Use full profile data returned by service
          const profileData: BusinessProfile = response.data;
          
          // Log detailed information about the profile data
          debugLog.business('[useBusinessProfile] Received business profile data:', {
            id: profileData.id,
            business_name: profileData.business_name,
            name: profileData.name,
            user_id: profileData.user_id,
            // Check for null/undefined/empty values
            hasBusinessName: !!profileData.business_name,
            hasName: !!profileData.name,
            businessNameType: typeof profileData.business_name,
            nameType: typeof profileData.name,
            // Log pending subscription fields
            pending_subscription_plan: profileData.pending_subscription_plan,
            pending_subscription_tier: profileData.pending_subscription_tier,
            subscription_pending_change_at: profileData.subscription_pending_change_at,
            hasPendingChanges: !!profileData.pending_subscription_plan
          });
          
          // Cache for frontend use
          localStorage.setItem(BUSINESS_PROFILE_CACHE_KEY, JSON.stringify({
            data: profileData,
            timestamp: Date.now()
          }));
          
          // Store business name separately for quick access
          const businessName = profileData.business_name || profileData.name || '';
          if (businessName && typeof businessName === 'string') {
            localStorage.setItem(BUSINESS_NAME_CACHE_KEY, businessName);
          }
          
          // Store logo URL separately for quick access
          const logoUrl = profileData.logo_url || profileData.logoUrl || '';
          if (logoUrl && typeof logoUrl === 'string') {
            localStorage.setItem(BUSINESS_LOGO_CACHE_KEY, logoUrl);
          }
          
          setBusinessProfile(profileData);
        } else if (response.error) {
          // Check if this is the special loading message from the circuit breaker
          if (response.error === 'Loading your business profile...' || response.requestInProgress) {
            // This is not a real error, just a loading state
            debugLog.business('[useBusinessProfile] Business profile loading in progress, waiting...');
            // Keep loading state true but don't set an error
            setLoading(true);
          } else {
            // This is a real error
            setError(response.error);
            debugLog.business('[useBusinessProfile] ERROR fetching business profile:', response.error);
            
            // Try to use cached data as fallback
            try {
              const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
              if (cachedProfileStr) {
                const cachedProfile = JSON.parse(cachedProfileStr);
                if (cachedProfile?.data) {
                  debugLog.business('[useBusinessProfile] Using cached profile as fallback after API error');
                  setBusinessProfile(cachedProfile.data);
                }
              }
            } catch (err) {
              debugLog.business('[useBusinessProfile] Error using cached profile as fallback:', err);
            }
          }
        } else {
          setError('Unknown error fetching business profile');
          debugLog.business('[useBusinessProfile] Unknown error fetching business profile - no error message provided');
          
          // Try to use cached data as fallback
          try {
            const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
            if (cachedProfileStr) {
              const cachedProfile = JSON.parse(cachedProfileStr);
              if (cachedProfile?.data) {
                debugLog.business('[useBusinessProfile] Using cached profile as fallback after unknown error');
                setBusinessProfile(cachedProfile.data);
              }
            }
          } catch (err) {
            debugLog.business('[useBusinessProfile] Error using cached profile as fallback:', err);
          }
        }
      } catch (err) {
        // Keep error logging but don't dump the entire error object
        debugLog.business('[useBusinessProfile] Fetch error:', err instanceof Error ? err.message : 'Unknown error');
        setError('An error occurred while fetching business profile');
        
        // Try to use cached data as fallback
        try {
          const cachedProfileStr = localStorage.getItem(BUSINESS_PROFILE_CACHE_KEY);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            if (cachedProfile?.data) {
              debugLog.business('[useBusinessProfile] Using cached profile as fallback after fetch error');
              setBusinessProfile(cachedProfile.data);
            }
          }
        } catch (err) {
          debugLog.business('[useBusinessProfile] Error using cached profile as fallback:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user, authBusinessProfile]);
  
  // Handle manual refresh requests
  useEffect(() => {
    if (shouldRefresh && user) {
      setShouldRefresh(false);
      
      const refreshProfile = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await businessService.getCurrentUserBusiness(user);
          
          if (response.success && response.data) {
            const profileData: BusinessProfile = response.data;
            
            // Update cache
            localStorage.setItem(BUSINESS_PROFILE_CACHE_KEY, JSON.stringify({
              data: profileData,
              timestamp: Date.now()
            }));
            
            setBusinessProfile(profileData);
          }
        } catch (err) {
          debugLog.business('[useBusinessProfile] Refresh error:', err instanceof Error ? err.message : 'Unknown error');
          setError('Failed to refresh business profile');
        } finally {
          setLoading(false);
        }
      };
      
      refreshProfile();
    }
  }, [shouldRefresh, user]);

  return { businessProfile, loading, error, refreshBusinessProfile };
};

export default useBusinessProfile;
