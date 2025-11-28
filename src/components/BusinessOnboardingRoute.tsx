import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useOnboarding, OnboardingStatus } from '../contexts/OnboardingContext';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';

/**
 * BusinessOnboardingRoute component
 * 
 * This component enforces the business onboarding flow by checking if the business
 * profile is complete. If not, it redirects to the onboarding page.
 * 
 * It wraps around protected business routes to ensure users complete their profile
 * before accessing other parts of the application.
 */
const BusinessOnboardingRoute: React.FC = () => {
  const { onboardingStatus, checkOnboardingStatus, businessProfile } = useOnboarding();
  const { user, isLoading: isAuthLoading } = useAuth(); // Renamed for clarity
  const location = useLocation();

  // Only log significant state changes, not every render
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Only log in development mode
      console.log('[BusinessOnboardingRoute] Status change:', onboardingStatus);
    }
  }, [onboardingStatus]);

  // Track if we've already checked onboarding status to prevent redundant checks
  const hasCheckedRef = useRef<boolean>(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Force a check of onboarding status when the component mounts or user changes
  useEffect(() => {
    // Skip onboarding checks for SUPER_ADMIN users
    if (user?.role === UserRole.SUPER_ADMIN) {
      return;
    }

    // Handle case-insensitive role comparison
    const isBusinessUser = user?.role === UserRole.BUSINESS || 
                         (typeof user?.role === 'string' && user?.role.toLowerCase() === 'business');
    
    if (isBusinessUser && !isAuthLoading && !hasCheckedRef.current) {
      // Single consolidated log instead of multiple logs
      if (process.env.NODE_ENV === 'development') {
        console.log('[BusinessOnboardingRoute] Checking status for business user:', user?.id);
      }
      
      // Remove any mock business profile to ensure proper onboarding
      localStorage.removeItem('mock_business_profile');
      
      // Clear any existing timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      // Set a timeout to debounce multiple calls
      checkTimeoutRef.current = setTimeout(() => {
        // Only check if we haven't already checked and onboarding context isn't currently checking
        if (!hasCheckedRef.current) {
          checkOnboardingStatus();
          hasCheckedRef.current = true;
        }
      }, 300);
    }
    
    // Cleanup on unmount
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [user?.id, user?.role, isAuthLoading]); // Remove checkOnboardingStatus from dependencies

  // --- Simplified Logic: ALWAYS Allow Dashboard and Profile Access ---
  const isDashboardPath = location.pathname.startsWith('/business/dashboard');
  const isProfilePath = location.pathname.startsWith('/business/profile');
  const isOnboardingPath = location.pathname === '/business/onboarding';
  
  // ALWAYS allow dashboard access - no conditions
  if (isDashboardPath) {
    console.log('[BusinessOnboardingRoute] Dashboard access - always allowed');
    return <Outlet />;
  }
  
  // ALWAYS allow profile access
  if (isProfilePath) {
    console.log('[BusinessOnboardingRoute] Profile access - always allowed');
    return <Outlet />;
  }
  
  // For onboarding page, ALWAYS allow access
  // Users should be able to edit their profile even after completing onboarding
  // This prevents redirect loops after checkout completion
  if (isOnboardingPath) {
    console.log('════════════════════════════════════════════════════');
    console.log('🛡️ [BusinessOnboardingRoute] ONBOARDING PAGE ACCESS CHECK');
    console.log('════════════════════════════════════════════════════');
    console.log('[BusinessOnboardingRoute] Path:', location.pathname);
    console.log('[BusinessOnboardingRoute] Onboarding status:', onboardingStatus);
    console.log('[BusinessOnboardingRoute] Has businessProfile:', !!businessProfile);
    console.log('[BusinessOnboardingRoute] ✅ ALLOWING ACCESS - No redirect');
    console.log('════════════════════════════════════════════════════');
    return <Outlet />;
  }
  
  // For other business pages (promotions, events, etc), only restrict create pages
  const restrictedPaths = ['/business/promotions/create', '/business/events/create'];
  const currentPath = location.pathname;
  
  if (restrictedPaths.some(path => currentPath.startsWith(path))) {
    // Check if profile is incomplete
    if (onboardingStatus === OnboardingStatus.PENDING || !businessProfile) {
      console.log(`[BusinessOnboardingRoute] Profile required for ${currentPath}, redirecting to profile`);
      return <Navigate to="/business/profile" replace />;
    }
  }
  
  // Default: allow access to all other pages
  return <Outlet />;
};

export default BusinessOnboardingRoute;
