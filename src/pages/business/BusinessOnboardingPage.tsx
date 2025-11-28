import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, Paper, CircularProgress, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from 'convex/react';
import InitialBusinessOnboardingWizard from '../../components/business/InitialBusinessOnboardingWizard';
import { businessService } from '../../services/serviceSelector';
import { BusinessProfile, BusinessCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding, OnboardingStatus } from '../../contexts/OnboardingContext';
// Removed AUTH_TOKEN_KEY import - no longer needed with Clerk auth
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { FormError, FormErrorType } from '../../components/business/utils/BusinessFormErrorHandler';
import useAsyncOperation from '../../hooks/useAsyncOperation';
import { usePageTitle } from '../../hooks/usePageTitle';
import { api } from '../../../../../convex/_generated/api';

// Extended BusinessCategory type that includes the CategoryLike index signature
type ExtendedBusinessCategory = BusinessCategory & { [key: string]: unknown };

/**
 * BusinessOnboardingPage
 * 
 * This page guides business users through the profile setup process
 * after account creation. It prevents users from accessing other parts
 * of the application until they complete their profile setup.
 */
const BusinessOnboardingPage: React.FC = () => {
  usePageTitle('Business Onboarding');
  
  const { 
    onboardingStatus,
    businessProfile 
  } = useOnboarding();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<FormError | null>(null);
  const [initialWizardData, setInitialWizardData] = useState<BusinessProfile | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  
  // Convex hooks for business creation
  const createBusinessAfterAuth = useMutation(api.businesses.createBusinessAfterAuth);
  const currentBusiness = useQuery(api.businesses.getCurrentBusiness);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location]);
  
  // Handle pending business info from registration
  useEffect(() => {
    const handlePendingBusiness = async () => {
      // Check if we have pending business info from registration
      const pendingInfo = sessionStorage.getItem('pendingBusinessInfo');
      
      if (pendingInfo && isAuthenticated && !currentBusiness) {
        try {
          const businessInfo = JSON.parse(pendingInfo);
          console.log('[BusinessOnboarding] Creating business from pending info:', businessInfo);
          
          const businessId = await createBusinessAfterAuth(businessInfo);
          
          if (businessId) {
            console.log('[BusinessOnboarding] Business created successfully:', businessId);
            enqueueSnackbar('Business account created successfully!', { variant: 'success' });
            // Clear the pending info
            sessionStorage.removeItem('pendingBusinessInfo');
          }
        } catch (error) {
          console.error('[BusinessOnboarding] Error creating business:', error);
          enqueueSnackbar('Failed to create business account. Please try again.', { variant: 'error' });
        }
      }
    };
    
    if (isAuthenticated) {
      handlePendingBusiness();
    }
  }, [isAuthenticated, currentBusiness, createBusinessAfterAuth, enqueueSnackbar]);

  // Use our enhanced async operation hook to fetch business categories
  const {
    loading: categoriesLoading,
    error: categoriesError
  } = useAsyncOperation(async () => {
    const response = await businessService.getBusinessCategories();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to load business categories');
    }
    
    // Define helper type for category objects
    type CategoryLike = {
      name?: string;
      title?: string;
      id?: string | number;
      [key: string]: unknown;
    };
    
    // Handle various possible response formats
    let categoriesArray: Array<string | CategoryLike | ExtendedBusinessCategory> | null = null;
    
    // Case 1: Direct array format
    if (Array.isArray(response.data)) {
      categoriesArray = response.data as Array<ExtendedBusinessCategory | string | CategoryLike>;
    } 
    // Case 2: Wrapped in a categories property
    else if (response.data && typeof response.data === 'object' && 
             'categories' in (response.data as Record<string, unknown>) && 
             Array.isArray((response.data as Record<string, unknown>).categories)) {
      categoriesArray = (response.data as Record<string, unknown>).categories as Array<ExtendedBusinessCategory | string | CategoryLike>;
    }
    // Case 3: Some other object structure with array properties
    else if (response.data && typeof response.data === 'object') {
      // Try to find any array property that might contain categories
      const keys = Object.keys(response.data as Record<string, unknown>);
      for (const key of keys) {
        const value = (response.data as Record<string, unknown>)[key];
        if (Array.isArray(value) && value.length > 0) {
          categoriesArray = value as Array<string | CategoryLike>;
          break;
        }
      }
    }
    
    if (!categoriesArray || categoriesArray.length === 0) {
      throw new Error('Categories data is in an unexpected format');
    }
    
    // Create a new array of strings from the categories array
    return categoriesArray.map((cat) => {
      if (typeof cat === 'string') {
        return cat;
      } else if (cat && typeof cat === 'object') {
        // First check for BusinessCategory type
        if ('name' in cat && typeof cat.name === 'string') {
          return cat.name;
        } else if ('title' in cat && typeof cat.title === 'string') {
          return cat.title;
        } else if ('id' in cat) {
          // If we have an ID but no name/title, use ID as fallback
          return `Category ${String(cat.id)}`;
        } else {
          // Last resort - stringify the object
          return JSON.stringify(cat);
        }
      } else {
        return String(cat);
      }
    });
  }, {
    executeOnMount: true,
    autoRetry: true,
    maxRetries: 2,
    context: {
      component: 'BusinessOnboardingPage',
      functionName: 'fetchCategories'
    }
  });
  
  // Categories data will be used directly in the wizard component
  
  // Convert categories error to form error for display
  useEffect(() => {
    if (categoriesError) {
      const formError: FormError = {
        type: FormErrorType.API,
        message: 'Failed to load business categories',
        details: {
          originalError: categoriesError
        }
      };
      setFormError(formError);
      
      // Show a snackbar notification
      enqueueSnackbar('Failed to load business categories. Some features may not work correctly.', {
        variant: 'warning',
        autoHideDuration: 5000
      });
    }
  }, [categoriesError, enqueueSnackbar]);

  // Track if we've already processed the business profile to prevent redundant processing
  const hasProcessedProfileRef = useRef<boolean>(false);
  
  // Check onboarding status and prepare initial data when the component mounts or context changes
  const {
    loading: profileChecking,
    error: statusError,
    execute: checkStatus
  } = useAsyncOperation(async () => {
    // CRITICAL: Clear any mock business profile to ensure onboarding works
    if (localStorage.getItem('mock_business_profile')) {
      localStorage.removeItem('mock_business_profile');
    }
    
    // Clear any session storage that might interfere with onboarding
    sessionStorage.removeItem('onboardingComplete');
    
    // With Clerk, we don't need to manage tokens manually
    // Clerk handles authentication internally
    // Remove legacy token management code
    
    // No longer need to fetch profile here, rely on context
    if (businessProfile) {
      // Return the business profile to be set as initial data
      return businessProfile;
    }
    
    // If no profile is available, return undefined
    return undefined;
  }, {
    context: {
      component: 'BusinessOnboardingPage',
      functionName: 'checkStatus'
    }
  });
  
  // Track if checkStatus has been called in this render cycle
  const hasCalledCheckStatusRef = useRef<boolean>(false);

  // Update initial wizard data when profile is available
  useEffect(() => {
    // Skip if we've already processed the profile and nothing has changed
    if (hasProcessedProfileRef.current && initialWizardData && businessProfile && 
        initialWizardData.id === businessProfile.id) {
      return;
    }
    
    // Prevent multiple calls to checkStatus in the same render cycle
    if (!hasCalledCheckStatusRef.current) {
      hasCalledCheckStatusRef.current = true;
      checkStatus();
      
      // Mark that we've processed this profile to prevent infinite loops
      if (businessProfile) {
        hasProcessedProfileRef.current = true;
      }
    }
    
    // Reset the flag when the component unmounts
    return () => {
      hasCalledCheckStatusRef.current = false;
    };
  }, [businessProfile, initialWizardData]);
  
  // Reset the hasCalledCheckStatus flag when checkStatus changes
  useEffect(() => {
    hasCalledCheckStatusRef.current = false;
  }, [checkStatus]);
  
  // Separate effect for logging status changes to avoid infinite loops
  useEffect(() => {
    // Only log status changes in development mode
    if (process.env.NODE_ENV === 'development' && onboardingStatus !== OnboardingStatus.PENDING) {
      console.log('[BusinessOnboardingPage] Status:', onboardingStatus);
    }
  }, [onboardingStatus]);
  
  // Update initial wizard data when status check completes
  useEffect(() => {
    if (statusError) {
      const formError: FormError = {
        type: FormErrorType.API,
        message: 'Failed to process profile status',
        details: {
          originalError: statusError
        }
      };
      setFormError(formError);
      
      // Show a snackbar notification
      enqueueSnackbar('Failed to process profile status. Please try again.', {
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  }, [statusError, enqueueSnackbar]);

  // Track if we've already set the initial wizard data to prevent infinite loops
  const hasSetInitialDataRef = useRef<boolean>(false);

  // Process profile data and check onboarding status
  useEffect(() => {
    console.log('════════════════════════════════════════════════════');
    console.log('📄 [BusinessOnboardingPage] useEffect TRIGGERED');
    console.log('════════════════════════════════════════════════════');
    console.log('[BusinessOnboardingPage] Current location:', window.location.pathname);
    console.log('[BusinessOnboardingPage] Onboarding status:', onboardingStatus);
    console.log('[BusinessOnboardingPage] Has businessProfile:', !!businessProfile);
    console.log('[BusinessOnboardingPage] Business name:', businessProfile?.name || businessProfile?.business_name);

    // FIXED: Don't auto-redirect from onboarding page after status becomes COMPLETED
    // This was causing redirect loops when user completes checkout:
    // 1. Checkout completes → profile marked COMPLETED
    // 2. This useEffect redirects to /business/dashboard
    // 3. SubscriptionGuardRoute checks subscription (might not be updated yet)
    // 4. Redirects to /checkout
    // 5. CheckoutPage sees no planId → redirects to /
    //
    // Instead: Let the wizard component handle completion and navigation
    // The wizard will redirect when the user clicks "Continue" or "Get Started"

    // ONLY redirect if there's an explicit redirectAfterOnboarding URL (from external flows)
    if (onboardingStatus === OnboardingStatus.COMPLETED) {
      const redirectUrl = sessionStorage.getItem('redirectAfterOnboarding');
      console.log('[BusinessOnboardingPage] Status is COMPLETED');
      console.log('[BusinessOnboardingPage] Saved redirect URL:', redirectUrl || 'NONE');

      if (redirectUrl) {
        console.log('[BusinessOnboardingPage] 🔄 REDIRECTING to saved URL:', redirectUrl);
        console.log('════════════════════════════════════════════════════');
        sessionStorage.removeItem('redirectAfterOnboarding');
        navigate(redirectUrl);
      } else {
        // Don't auto-redirect - let user complete wizard manually
        console.log('[BusinessOnboardingPage] ✅ NO AUTO-REDIRECT - Staying on onboarding page');
        console.log('[BusinessOnboardingPage] User must complete wizard manually');
        console.log('════════════════════════════════════════════════════');
      }
    } else {
      console.log('[BusinessOnboardingPage] Status is NOT complete:', onboardingStatus);
      console.log('[BusinessOnboardingPage] ✅ Allowing user to complete onboarding');
      console.log('════════════════════════════════════════════════════');
    }

    // If we have a business profile, use it as initial data (only once)
    if (businessProfile && !initialWizardData && !hasSetInitialDataRef.current) {
      hasSetInitialDataRef.current = true;
      setInitialWizardData({
        ...businessProfile,
        timestamp: Date.now() // Add a timestamp for cache invalidation
      });
    }
  }, [onboardingStatus, businessProfile, navigate, user?.id, user?.businessId, user?.role]);

  // REMOVED: Duplicate redirect logic that was causing issues
  // This was a duplicate of the logic above and caused redirect loops
  // Keeping only the single redirect handler above

  /* REMOVED DUPLICATE:
  useEffect(() => {
    if (onboardingStatus === OnboardingStatus.COMPLETED) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[BusinessOnboardingPage] Redirecting to dashboard');
        console.log('[BusinessOnboardingPage] User state:', {
          id: user?.id,
          businessId: user?.businessId,
          role: user?.role,
          timestamp: new Date().toISOString()
        });
      }
      navigate('/business/dashboard', { replace: true });

      // Add a fallback navigation in case the first one doesn't work
      setTimeout(() => {
        console.log('[BusinessOnboardingPage] Checking if navigation was successful (from useEffect)...');
        if (window.location.pathname.includes('onboarding')) {
          console.log('[BusinessOnboardingPage] Navigation may have failed, trying again (from useEffect)...');
          window.location.href = '/business/dashboard';
        }
      }, 1500);
    }
  }, [onboardingStatus, navigate, user?.id, user?.businessId, user?.role]);
  */

  // Combine loading states: wait for both profile check and category fetch
  const isLoading = profileChecking || categoriesLoading;

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              {profileChecking ? 'Checking profile status...' : 'Loading business categories...'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            This may take a moment. Please wait...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Display form errors if any occurred
  if (formError) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <ErrorDisplay 
            error={formError}
            variant="outlined"
            showDetails={process.env.NODE_ENV === 'development'}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please try again. If the problem persists, contact support.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 1 }}
            >
              Refresh Page
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <InitialBusinessOnboardingWizard redirectAfterCompletion="/business/dashboard" />
  );
};

export default BusinessOnboardingPage;
