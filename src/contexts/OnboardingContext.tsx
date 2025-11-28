import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { UserRole } from '../types/user';
import { OnboardingStatus } from '../types/onboarding';
import { BusinessProfile } from '../types';
import { useAuthClerk } from '../hooks/useAuthClerk';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Define the context shape
interface OnboardingContextType {
  onboardingStatus: OnboardingStatus | null;
  setOnboardingStatus: (status: OnboardingStatus | null) => void;
  isOnboardingComplete: boolean;
  checkOnboardingStatus: () => Promise<void>;
  markOnboardingCompleted: (profile?: any) => void;
  businessProfile: BusinessProfile | null;
  createBusinessProfile?: (args: any) => Promise<any>;
}

// Create the context with a default value
const OnboardingContext = createContext<OnboardingContextType>({
  onboardingStatus: null,
  setOnboardingStatus: () => {},
  isOnboardingComplete: false,
  checkOnboardingStatus: async () => {},
  markOnboardingCompleted: () => {},
  businessProfile: null,
});

// Create a hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Re-export OnboardingStatus for convenience
export { OnboardingStatus };

// Provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use Clerk auth integration
  console.log('[OnboardingProvider] Initializing...');
  const clerkAuth = useAuthClerk();
  const { user, isAuthenticated, isLoaded: authLoaded, clerkUser, businessProfile: business } = clerkAuth;
  const authLoading = !authLoaded;
  
  // Add mutation to create business profile
  const createBusinessProfile = useMutation(api.businessRegistration.createBusinessProfile);
  console.log('[OnboardingProvider] clerkAuth state:', { clerkUser, isAuthenticated, authLoading });
  
  // Debug logging
  useEffect(() => {
    console.log('[OnboardingContext] Clerk auth data:', {
      hasUser: !!clerkUser,
      hasBusiness: !!business,
      isAuthenticated,
      authLoading,
      business: business,
      businessId: business?._id,
      businessName: business?.name,
      hasOnboardingCompleted: business?.onboarding_completed_at
    });
  }, [clerkUser, business, isAuthenticated, authLoading]);
  
  // Start with null to indicate we haven't checked yet
  // This prevents premature redirects on page refresh
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  // Function to check the onboarding status - now simplified with direct Convex queries
  const checkOnboardingStatus = useCallback(async () => {
    console.log('[OnboardingContext] checkOnboardingStatus called', {
      isAuthenticated,
      authLoading,
      hasUser: !!clerkUser,
      hasBusiness: !!business,
      businessData: business
    });
    
    // Don't check if auth is still loading
    if (authLoading) {
      console.log('[OnboardingContext] Auth still loading, skipping check');
      return;
    }
    
    // If not authenticated, set status to pending
    if (!isAuthenticated || !clerkUser) {
      console.log('[OnboardingContext] Not authenticated, setting status to PENDING');
      setOnboardingStatus(OnboardingStatus.PENDING);
      setIsOnboardingComplete(false);
      setBusinessProfile(null);
      return;
    }

    // Use business from auth
    const businessData = business;
    
    // If we have business data, check if onboarding is complete
    if (businessData) {
      console.log('[OnboardingContext] Business found:', {
        businessId: businessData._id,
        businessName: businessData.name,
        hasCompletedOnboarding: !!businessData.onboarding_completed_at
      });

      // Convert Convex business to BusinessProfile format for compatibility
      const profile: BusinessProfile = {
        id: businessData._id,
        business_name: businessData.name,
        name: businessData.name, // Also include 'name' field
        first_name: businessData.first_name,
        last_name: businessData.last_name,
        email: businessData.email,
        contact_email: businessData.contact_email,
        public_business_email: businessData.public_business_email,
        phone: businessData.phone,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        zip: businessData.zip,
        description: businessData.description,
        website: businessData.website,
        category: businessData.category,
        categories: businessData.categories,
        subscription_tier: businessData.subscription_tier,
        subscription_status: businessData.subscription_status,
        onboarding_completed_at: businessData.onboarding_completed_at,
        // Additional fields for onboarding
        logo_url: businessData.logo_url,
        logo_id: businessData.logo_id,
        business_hours: businessData.business_hours,
        instagram_url: businessData.instagram_url,
        facebook_url: businessData.facebook_url,
        twitter_url: businessData.twitter_url,
        linkedin_url: businessData.linkedin_url,
        tiktok_url: businessData.tiktok_url,
        pinterest_url: businessData.pinterest_url,
        customersDoNotVisit: businessData.customersDoNotVisit,
        serviceZip: businessData.serviceZip,
        serviceRadius: businessData.serviceRadius,
        // Pass through all other fields
        ...businessData
      } as BusinessProfile;

      setBusinessProfile(profile);
      
      // Determine onboarding status based on completed fields
      const hasBusinessName = !!businessData.name;
      const hasLogo = !!businessData.logo_url;
      const hasAddress = !!(businessData.address && businessData.city && businessData.state && businessData.zip);
      const hasServiceArea = !!(businessData.serviceZip && businessData.serviceRadius);
      const hasLocation = hasAddress || hasServiceArea;
      const hasPhone = !!businessData.phone;
      const hasCategory = !!businessData.category;
      const hasDescription = !!businessData.description;
      const hasHours = !!businessData.business_hours;
      const hasWebsite = !!businessData.website;
      const hasSocialMedia = !!(businessData.instagram_url || businessData.facebook_url || 
                                businessData.tiktok_url || businessData.linkedin_url || 
                                businessData.twitter_url || businessData.pinterest_url);
      
      // Check status levels
      const hasBaselineFields = hasBusinessName && hasLogo && hasLocation && hasPhone && hasCategory;
      const hasAllOptionalFields = hasDescription && hasHours && hasWebsite && hasSocialMedia;
      
      // Debug logging to see which fields are missing
      console.log('[OnboardingContext] Field status check:', {
        hasBusinessName,
        hasLogo,
        hasLocation,
        hasPhone,
        hasCategory,
        hasBaselineFields,
        businessData: {
          name: businessData.name,
          logo_url: businessData.logo_url,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zip: businessData.zip,
          serviceZip: businessData.serviceZip,
          serviceRadius: businessData.serviceRadius,
          phone: businessData.phone,
          category: businessData.category
        }
      });
      
      // First check if onboarding_completed_at is set in database (highest priority)
      if (businessData.onboarding_completed_at) {
        console.log('[OnboardingContext] onboarding_completed_at is set - checking field completion');
        // Even if marked complete, verify baseline fields exist
        if (hasBaselineFields) {
          if (hasAllOptionalFields) {
            console.log('[OnboardingContext] Database marked complete + all fields present - FULLY_COMPLETE');
            setOnboardingStatus(OnboardingStatus.FULLY_COMPLETE);
            setIsOnboardingComplete(true);
          } else {
            console.log('[OnboardingContext] Database marked complete + baseline fields present - BASELINE_COMPLETE');
            setOnboardingStatus(OnboardingStatus.BASELINE_COMPLETE);
            setIsOnboardingComplete(true);
          }
        } else {
          // Database says complete but fields missing - trust database
          console.log('[OnboardingContext] Database marked complete but fields missing - trusting database - BASELINE_COMPLETE');
          setOnboardingStatus(OnboardingStatus.BASELINE_COMPLETE);
          setIsOnboardingComplete(true);
        }
      }
      // Otherwise evaluate based on field completion
      // If has all fields including optional ones
      else if (hasBaselineFields && hasAllOptionalFields) {
        console.log('[OnboardingContext] All fields complete - FULLY_COMPLETE');
        setOnboardingStatus(OnboardingStatus.FULLY_COMPLETE);
        setIsOnboardingComplete(true);
      }
      // If has minimum fields for promotions/events (baseline)
      else if (hasBaselineFields) {
        console.log('[OnboardingContext] Baseline fields complete - BASELINE_COMPLETE');
        setOnboardingStatus(OnboardingStatus.BASELINE_COMPLETE);
        setIsOnboardingComplete(false); // Not officially complete until database says so
      }
      // If only has business name (minimum for dashboard access)
      else if (hasBusinessName) {
        console.log('[OnboardingContext] Only business name - PARTIALLY_COMPLETE (dashboard access allowed)');
        setOnboardingStatus(OnboardingStatus.PARTIALLY_COMPLETE);
        setIsOnboardingComplete(false); // Not complete, but can access dashboard
      }
      // No fields completed yet
      else {
        console.log('[OnboardingContext] No fields complete - PENDING');
        setOnboardingStatus(OnboardingStatus.PENDING);
        setIsOnboardingComplete(false);
      }
    } else {
      // No business profile found yet
      console.log('[OnboardingContext] No business profile found yet, business query state:', business);
      
      // CRITICAL: Distinguish between loading and not found
      // business === undefined means the query is still loading
      // business === null means the query completed but found no business
      
      if (business === undefined) {
        // Query is still loading - DO NOT redirect to onboarding
        console.log('[OnboardingContext] Business query still loading - keeping current status to avoid premature redirect');
        // Don't change the status while loading to prevent flashing/redirects
        return;
      }
      
      // If user is authenticated but no business found (business === null)
      if (isAuthenticated && clerkUser && business === null) {
        // Now we know for sure they need onboarding
        console.log('[OnboardingContext] User authenticated but no business exists - needs onboarding');
        setOnboardingStatus(OnboardingStatus.PENDING);
        setIsOnboardingComplete(false);
        setBusinessProfile(null);
      } else if (!isAuthenticated || !clerkUser) {
        // Not authenticated or no user - stay pending
        console.log('[OnboardingContext] No user or not authenticated - staying PENDING');
        setOnboardingStatus(OnboardingStatus.PENDING);
        setIsOnboardingComplete(false);
        setBusinessProfile(null);
      }
    }
  }, [isAuthenticated, authLoading, clerkUser, business]);

  // Auto-check onboarding status when auth state or business data changes
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Mark onboarding as completed - simplified version
  const markOnboardingCompleted = useCallback((profile?: any) => {
    console.log('[OnboardingContext] markOnboardingCompleted called', profile);
    
    if (profile) {
      // Check what level of completion based on profile data
      const hasBusinessName = !!profile.business_name || !!profile.name;
      const hasLogo = !!profile.logo_url || !!profile.logoUrl;
      const hasAddress = !!(profile.address && profile.city && profile.state && profile.zip);
      const hasServiceArea = !!(profile.serviceZip && profile.serviceRadius);
      const hasLocation = hasAddress || hasServiceArea;
      const hasPhone = !!profile.phone;
      const hasCategory = !!profile.category;
      const hasDescription = !!profile.description;
      
      // Check status levels
      const hasBaselineFields = hasBusinessName && hasLogo && hasLocation && hasPhone && hasCategory;
      
      if (hasBaselineFields) {
        // At least baseline complete
        setOnboardingStatus(OnboardingStatus.BASELINE_COMPLETE);
        setIsOnboardingComplete(false); // Not fully complete yet
      } else if (hasBusinessName) {
        // Only partial completion
        setOnboardingStatus(OnboardingStatus.PARTIALLY_COMPLETE);
        setIsOnboardingComplete(false);
      } else {
        // Default to the legacy COMPLETED status for backward compatibility
        setOnboardingStatus(OnboardingStatus.COMPLETED);
        setIsOnboardingComplete(true);
      }
      
      setBusinessProfile(profile);
    } else {
      // No profile provided, default to completed for backward compatibility
      setOnboardingStatus(OnboardingStatus.COMPLETED);
      setIsOnboardingComplete(true);
    }
  }, []);

  // Update businessProfile when business data changes
  useEffect(() => {
    if (business) {
      console.log('[OnboardingContext] Setting business profile from Clerk auth:', business);
      // Convert Convex business to BusinessProfile format for compatibility
      const profile: BusinessProfile = {
        id: business._id,
        business_name: business.name,
        first_name: business.first_name,
        last_name: business.last_name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        description: business.description,
        website: business.website,
        category: business.category,
        subscription_tier: business.subscription_tier,
        subscription_status: business.subscription_status,
        onboarding_completed_at: business.onboarding_completed_at,
        // Add other fields as needed...
      } as BusinessProfile;
      setBusinessProfile(profile);
    }
  }, [business]);

  // Context value
  const value = {
    onboardingStatus,
    setOnboardingStatus,
    isOnboardingComplete,
    checkOnboardingStatus,
    markOnboardingCompleted,
    businessProfile: businessProfile, // Always use the mapped businessProfile
    createBusinessProfile, // Expose the Convex mutation for creating business profiles
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;