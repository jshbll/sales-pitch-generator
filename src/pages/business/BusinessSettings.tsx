import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  Alert,
  Card,
  CardContent,
  alpha,
  MenuItem,
  useTheme,
  FormControlLabel,
  Chip,
  Divider,
  Stack,
  Container
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  ContactMail as ContactMailIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CreditCard as SubscriptionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { businessService } from '../../services/serviceSelector';
import { useSnackbar } from 'notistack';
import LoginEmailManager from '../../components/business/LoginEmailManager';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../hooks/useAuth';
import SubscriptionPlans from '../../components/business/SubscriptionPlans';

const BusinessSettings: React.FC = () => {
  usePageTitle('Business Settings');
  const [saved, setSaved] = useState(false);
  const theme = useTheme();
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Add mount/unmount logging
  useEffect(() => {
    console.log('[BusinessSettings] Component mounted');
    return () => {
      console.log('[BusinessSettings] Component unmounted');
    };
  }, []);
  
  // Get current subscription - use ref to store businessId to prevent re-renders
  const businessIdRef = useRef<string | undefined>(undefined);
  
  // Only update businessId on first load or when user changes
  useEffect(() => {
    const newBusinessId = user?.id || user?.businessId || businessProfile?.id;
    if (newBusinessId && !businessIdRef.current) {
      businessIdRef.current = newBusinessId;
    }
  }, [user?.id, user?.businessId, businessProfile?.id]);
  
  const businessId = businessIdRef.current;
  
  const getSubscription = useAction(api.subscriptions.getBusinessSubscription);
  const createPortalSession = useAction(api.subscriptions.portal.createPortalSession);
  const syncFromStripe = useAction(api.subscriptions.sync.syncFromStripe);
  const clearTestSubscription = useMutation(api.subscriptions.clearTestSubscription);
  const cleanupDuplicateSubscriptions = useMutation(api.subscriptions.cleanupDuplicateSubscriptions);
  const [currentSubscription, setCurrentSubscription] = useState<any>(undefined);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [clearingTest, setClearingTest] = useState(false);
  const hasSyncedRef = useRef(false); // Use ref to track sync status

  // Fetch subscription data on component mount
  // Check for Stripe return and trigger sync
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromStripe = urlParams.get('return_from_stripe') === 'true' || 
                                  document.referrer.includes('billing.stripe.com');
    
    if (isReturningFromStripe) {
      // Reset the sync flag to force a re-sync
      hasSyncedRef.current = false;
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Run once on mount
  
  // Fetch subscription data on page load (without auto-sync)
  useEffect(() => {
    // Only run if we have a businessId
    if (!businessId) {
      setSubscriptionLoading(false);
      return;
    }
    
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true);
        
        // Check URL params to see if we're returning from Stripe and need to sync
        const urlParams = new URLSearchParams(window.location.search);
        const isReturningFromStripe = urlParams.get('return_from_stripe') === 'true' || 
                                      document.referrer.includes('billing.stripe.com');
        
        // Only sync if explicitly returning from Stripe portal
        if (isReturningFromStripe && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          console.log('[BusinessSettings] Returning from Stripe, syncing...');
          setIsUpdating(true);
          
          try {
            const syncResult = await syncFromStripe({ businessId });
            console.log('[BusinessSettings] Sync completed:', syncResult);
            
            // Small delay to ensure database is updated
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.log('[BusinessSettings] Sync failed (non-critical):', error);
          } finally {
            setIsUpdating(false);
          }
        }
        
        // Get subscription data (without forcing a sync)
        const subscription = await getSubscription({ businessId });
        setCurrentSubscription(subscription);
        console.log('[BusinessSettings] Current subscription:', subscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        setCurrentSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [businessId, getSubscription, syncFromStripe]); // Include stable deps

  // Also get the subscription plan details from the business record
  const businessSubscriptionPlan = businessProfile?.subscription_plan;
  const businessSubscriptionStatus = businessProfile?.subscription_status;
  const businessSubscriptionTier = businessProfile?.subscription_tier;
  const pendingSubscriptionPlan = businessProfile?.pending_subscription_plan;
  const pendingSubscriptionTier = businessProfile?.pending_subscription_tier;
  const subscriptionPendingChangeAt = businessProfile?.subscription_pending_change_at;
  
  // Helper function to get display name for subscription tier
  const getTierDisplayName = (tier: string | undefined, plan: string | undefined, subscription: any = null) => {
    
    // Check if we have plan name from the subscription's plan object
    if (subscription?.plan?.name) {
      return subscription.plan.name;
    }
    
    // Check currentSubscription's plan object
    if (currentSubscription?.plan?.name) {
      return currentSubscription.plan.name;
    }
    
    // Check currentSubscription first as it's the most up-to-date source
    if (subscription?.planName) {
      return subscription.planName;
    }
    
    // Check if we have product metadata from currentSubscription
    if (currentSubscription?.planName) {
      return currentSubscription.planName;
    }
    
    // Check currentSubscription for plan_id
    if (currentSubscription?.plan_id) {
      const planId = currentSubscription.plan_id;
      switch (planId) {
        case 'bronze': return 'Bronze';
        case 'silver': return 'Silver';
        case 'gold': return 'Gold';
        case 'diamond': return 'Diamond';
        case 'enterprise': return 'Enterprise';
        case 'starter': return 'Bronze';
        case 'professional': return 'Gold';
        default: return planId.charAt(0).toUpperCase() + planId.slice(1);
      }
    }
    
    // Check currentSubscription for priceId and map it to plan name
    if (currentSubscription?.priceId) {
      // Extract plan name from priceId if it follows pattern like "price_bronze_monthly"
      const priceIdParts = currentSubscription.priceId.toLowerCase().split('_');
      if (priceIdParts.includes('bronze')) return 'Bronze';
      if (priceIdParts.includes('silver')) return 'Silver';
      if (priceIdParts.includes('gold')) return 'Gold';
      if (priceIdParts.includes('diamond')) return 'Diamond';
      if (priceIdParts.includes('enterprise')) return 'Enterprise';
    }
    
    // Prioritize plan over tier (since plan is what we actually have)
    if (plan) {
      // Map plan names to display names
      switch (plan) {
        case 'bronze': return 'Bronze';
        case 'silver': return 'Silver';
        case 'gold': return 'Gold';
        case 'diamond': return 'Diamond';
        case 'enterprise': return 'Enterprise';
        case 'starter': return 'Bronze';
        case 'professional': return 'Gold';
        default: return plan.charAt(0).toUpperCase() + plan.slice(1);
      }
    }
    if (tier) {
      // Capitalize tier name (bronze -> Bronze)
      return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
    return 'No Active Plan';
  };

  // Helper function to get status display
  const getStatusDisplay = (status: string | undefined) => {
    if (!status) return 'inactive';
    
    // Fix "trialing" status display
    switch (status.toLowerCase()) {
      case 'trialing':
        return 'active'; // Show as active since there's no actual trial
      case 'active':
        return 'active';
      case 'past_due':
        return 'past due';
      case 'cancelled':
        return 'cancelled';
      default:
        return status;
    }
  };

  // Handle manual sync from Stripe
  const handleSyncFromStripe = async () => {
    if (!businessId) {
      enqueueSnackbar('Business ID not found', { variant: 'error' });
      return;
    }

    setSyncing(true);
    try {
      const result = await syncFromStripe({ businessId });
      console.log('[Settings] Sync result:', result);
      
      enqueueSnackbar(result.message || 'Subscription synced successfully!', { variant: 'success' });
      
      // Refresh subscription data
      const subscription = await getSubscription({ businessId });
      setCurrentSubscription(subscription);
      
      // Refresh business profile and subscription data
      refreshBusinessProfile();
      
      // Force refetch of subscription data without page reload
      setTimeout(async () => {
        const refreshedSubscription = await getSubscription({ businessId });
        setCurrentSubscription(refreshedSubscription);
        refreshBusinessProfile(); // Refetch business profile again
      }, 500);
    } catch (error) {
      console.error('[Settings] Sync error:', error);
      enqueueSnackbar('Failed to sync subscription from Stripe', { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearTestSubscription = async () => {
    if (!businessId) return;
    
    setClearingTest(true);
    try {
      const result = await clearTestSubscription({ businessId });
      console.log('[Settings] Clear test subscription result:', result);
      
      enqueueSnackbar('Test subscription cleared successfully! You can now create a real subscription.', { variant: 'success' });
      
      // Reset subscription state
      setCurrentSubscription(null);
      
      // Refresh business profile
      refreshBusinessProfile();
      
      // Redirect to subscription page after a short delay
      setTimeout(() => {
        window.location.href = '/business/subscription';
      }, 1500);
    } catch (error: any) {
      console.error('[Settings] Clear test subscription error:', error);
      enqueueSnackbar(error.message || 'Failed to clear test subscription', { variant: 'error' });
    } finally {
      setClearingTest(false);
    }
  };

  // Check if current subscription is a test subscription (only for local mocks) - memoized
  const isTestSubscription = useMemo(() => {
    // Use both businessProfile and currentSubscription data
    const customerId = businessProfile?.stripe_customer_id || currentSubscription?.stripe_customer_id;
    const subscriptionId = businessProfile?.stripe_subscription_id || currentSubscription?.stripe_subscription_id;
    
    // Only check for local development mock prefixes, not Stripe test mode
    const hasTestCustomerId = customerId?.includes('cus_local_') || 
                             customerId?.includes('mock_');
    const hasTestSubscriptionId = subscriptionId?.includes('mock_') ||
                                 subscriptionId?.includes('sub_local_');
    
    return hasTestCustomerId || hasTestSubscriptionId;
  }, [businessProfile?.stripe_customer_id, businessProfile?.stripe_subscription_id, 
      currentSubscription?.stripe_customer_id, currentSubscription?.stripe_subscription_id]);
  
  // Get plan details if business has a subscription plan
  const planDetails = useQuery(
    api.subscriptions.getSubscriptionPlan,
    businessSubscriptionPlan ? { planId: businessSubscriptionPlan } : 'skip'
  );
  
  // Settings state - initialized from business profile
  const [settings, setSettings] = useState({
    // Contact Information
    firstName: '',
    lastName: '',
    accountEmail: '',
    contactPhone: '',
    
    // Notification Preferences
    notifyOnRedeem: true,
    notifyOnExpire: true,
    pushNotifications: false,
    
    // Account Settings
    autoRenewSubscription: true,
    twoFactorEnabled: false,
    dataSharing: true,
    promotionVisibility: 'public'
  });

  // Update settings when business profile loads
  useEffect(() => {
    if (businessProfile) {
      setSettings(prev => ({
        ...prev,
        firstName: businessProfile.first_name || '',
        lastName: businessProfile.last_name || '',
        accountEmail: businessProfile.email || '',
        contactPhone: businessProfile.phone || ''
      }));
    }
  }, [businessProfile]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    if (!businessProfile?.id) {
      enqueueSnackbar('Business profile not found', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Save contact information to business profile
      const response = await businessService.updateBusiness(businessProfile.id, {
        first_name: settings.firstName,
        last_name: settings.lastName,
        phone: settings.contactPhone
        // Note: Account email changes should go through the security verification process
      });

      if (response.success) {
        enqueueSnackbar('Settings saved successfully!', { variant: 'success' });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        refreshBusinessProfile(); // Refresh business profile data
      } else {
        enqueueSnackbar(response.error || 'Failed to save settings', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      enqueueSnackbar('An error occurred while saving settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your business account, subscription, and preferences
          </Typography>
        </Box>
        
        {/* Success Alert */}
        {saved && (
          <Alert severity="success">
            <Typography variant="subtitle2" gutterBottom>
              Settings saved successfully!
            </Typography>
            <Typography variant="body2">
              Your changes have been applied to your account.
            </Typography>
          </Alert>
        )}
        
        {/* Test Subscription Alert */}
        {isTestSubscription && (
          <Alert 
            severity="warning"
            action={
              <Button 
                color="warning" 
                size="small"
                onClick={handleClearTestSubscription}
                disabled={clearingTest}
              >
                {clearingTest ? 'Clearing...' : 'Clear & Upgrade'}
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              Test Subscription Active
            </Typography>
            <Typography variant="body2">
              You're using a test subscription that cannot be managed through Stripe. Clear it to create a real subscription with payment processing.
            </Typography>
          </Alert>
        )}
        
        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* First Row - Personal Information and Subscription Plan */}
          <Grid item xs={12} md={7} lg={8} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="firstName"
                        value={settings.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        placeholder="Enter your first name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="lastName"
                        value={settings.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        placeholder="Enter your last name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Contact Phone
                      </Typography>
                      <TextField
                        fullWidth
                        name="contactPhone"
                        value={settings.contactPhone}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        placeholder="Enter your contact phone"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Subscription Plan - Moved to First Row */}
          <Grid item xs={12} md={5} lg={4} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Subscription Plan
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {getTierDisplayName(businessSubscriptionTier, businessSubscriptionPlan, currentSubscription)}
                      </Typography>
                      {(planDetails || currentSubscription?.plan) && (
                        <Typography variant="h6" color="text.secondary">
                          ${((planDetails?.price_monthly || currentSubscription?.plan?.price_monthly) / 100).toFixed(0)}/month
                        </Typography>
                      )}
                    </Box>
                    {businessSubscriptionStatus && (
                      <Chip 
                        label={businessSubscriptionStatus === 'active' ? 'Active' : businessSubscriptionStatus} 
                        color={businessSubscriptionStatus === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {currentSubscription?.current_period_end && (
                    <Typography variant="body2" color="text.secondary">
                      Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  {pendingSubscriptionPlan && subscriptionPendingChangeAt && (
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Scheduled Change:</strong> Your subscription will change to{' '}
                        <strong>{getTierDisplayName(pendingSubscriptionTier, pendingSubscriptionPlan)}</strong> on{' '}
                        <strong>{new Date(subscriptionPendingChangeAt).toLocaleDateString()}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        You've been credited for the unused portion of your current plan.
                      </Typography>
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant={businessSubscriptionTier && businessSubscriptionTier !== 'none' ? "outlined" : "contained"}
                      color={businessSubscriptionTier && businessSubscriptionTier !== 'none' ? "inherit" : "primary"}
                      onClick={() => {
                        // If no subscription tier or tier is 'none', go to subscription page to select a plan
                        // Go to subscription page which handles both selection and management
                        window.location.href = '/business/subscription';
                      }}
                      disabled={isOpeningPortal}
                      startIcon={businessSubscriptionTier && businessSubscriptionTier !== 'none' ? <SettingsIcon /> : null}
                      fullWidth
                      sx={businessSubscriptionTier && businessSubscriptionTier !== 'none' ? {} : {
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                        }
                      }}
                    >
                      {businessSubscriptionTier && businessSubscriptionTier !== 'none' 
                        ? 'Manage Subscription' 
                        : 'Select A Plan'}
                    </Button>
                    
                    {isTestSubscription && (
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleClearTestSubscription}
                        disabled={clearingTest}
                        fullWidth
                      >
                        {clearingTest ? 'Clearing...' : 'Clear Test Subscription'}
                      </Button>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Login Credentials - Second Row */}
          <Grid item xs={12}>
            <LoginEmailManager 
              businessProfile={businessProfile}
              onUpdate={refreshBusinessProfile}
            />
          </Grid>
          {/* Notification Preferences - Third Row */}
          {/* Hidden for now
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifyOnRedeem}
                          onChange={handleChange}
                          name="notifyOnRedeem"
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Coupon Redemption Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get notified when customers redeem your coupons
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifyOnExpire}
                          onChange={handleChange}
                          name="notifyOnExpire"
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Promotion Expiry Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get reminders when your promotions are about to expire
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          */}
        </Grid>
        
        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{ px: 4 }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default React.memo(BusinessSettings);