import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Stack,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  Business as BusinessIcon,
  Category as CategoryIcon,
  PhotoLibrary as PhotoIcon,
  Restaurant as MenuIcon,
  Schedule as HoursIcon,
  Share as SocialIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding, OnboardingStatus } from '../../contexts/OnboardingContext';
import { businessService } from '../../services/serviceSelector';
import { useSnackbar } from 'notistack';
import { useNotification } from '../../contexts/NotificationContext';
import { useBusinessWithLocation } from '../../hooks/useBusinessWithLocation';

// Import the sections (to be created)
import BusinessInfoSectionSimple from '../../components/business/profile/BusinessInfoSectionSimple';
import BusinessCategoriesSectionSimple from '../../components/business/profile/BusinessCategoriesSectionSimple';
import BusinessGallerySection from '../../components/business/profile/BusinessGallerySection';
import BusinessMenuSection from '../../components/business/profile/BusinessMenuSectionFixed';
import BusinessHoursSectionSimple from '../../components/business/profile/BusinessHoursSectionSimple';
import BusinessSocialMediaSection from '../../components/business/profile/BusinessSocialMediaSection';
import LocationContextSelector from '../../components/business/LocationContextSelector';
import LocationOnboardingWrapper from '../../components/business/LocationOnboardingWrapper';
import InitialBusinessOnboardingWizard from '../../components/business/InitialBusinessOnboardingWizard';
import { Id } from '../../../convex/_generated/dataModel';
import PageHeader from '../../components/common/PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ 
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {value === index && (
        <Box sx={{
          py: 3,
          px: 0,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const BusinessProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { onboardingStatus } = useOnboarding();
  const { enqueueSnackbar } = useSnackbar();
  const { showInfo, showSuccess, showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const syncFromStripe = useAction(api.subscriptions.sync.syncFromStripe);
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Use the new hook for business data with location merging
  const { businessData, isLoading, primaryLocation } = useBusinessWithLocation(businessId);
  
  // Create stable businessId to prevent infinite loops
  const stableBusinessId = useMemo(() => {
    if (!businessData) return null;
    return (businessData._id || businessData.id) as Id<"businesses">;
  }, [businessData?._id, businessData?.id]);

  // Create stable callback functions to prevent infinite loops
  const handleLocationChange = useCallback((locationId: string | null) => {
    setSelectedLocationId(locationId);
  }, []);

  const handleAddLocation = useCallback(() => {
    setLocationDialogOpen(true);
  }, []);

  const handleFieldUpdate = useCallback((field: string, value: any) => {
    // Handle field updates if needed
    console.log('Field updated:', field, value);
  }, []);

  // Set initial tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 5) {
        setActiveTab(tabIndex);
      }
    }
  }, [searchParams]);
  
  
  
  // Removed test notification - no longer needed

  // Handle upgrade success redirect
  useEffect(() => {
    const upgraded = searchParams.get('upgraded');
    if (upgraded === 'true' && businessData?._id) {
      // Sync subscription from Stripe
      syncFromStripe({ businessId: businessData._id })
        .then((result) => {
          if (result.synced) {
            enqueueSnackbar(`Successfully upgraded to ${result.planId} plan!`, { variant: 'success' });
            // Reload business data to show updated subscription
            loadBusinessData();
          }
        })
        .catch((error) => {
          console.error('Failed to sync subscription:', error);
          // Still show success message as the webhook will handle it
          enqueueSnackbar('Upgrade successful! Your subscription will be updated shortly.', { variant: 'success' });
        })
        .finally(() => {
          // Clean up URL
          setSearchParams({});
        });
    }
  }, [searchParams, businessData, syncFromStripe, enqueueSnackbar, setSearchParams]);

  // Load business data and calculate profile completion
  const loadBusinessData = async () => {
    if (!user) return;

    try {
      const userBusinessId = user.id || user.businessId;

      if (!userBusinessId) {
        enqueueSnackbar('No business ID found', { variant: 'error' });
        return;
      }

      // Just set the businessId - the hook will handle fetching
      setBusinessId(userBusinessId);

    } catch (error) {
      console.error('Error loading business data:', error);
      enqueueSnackbar('Error loading business data', { variant: 'error' });
    }
  };

  // Get business ID for queries
  const profileBusinessId = businessData?._id || businessData?.id;

  // Fetch locations for this business
  const locations = useQuery(
    api.businessLocations.getBusinessLocations,
    profileBusinessId ? {
      businessId: profileBusinessId as Id<"businesses">,
      activeOnly: false,
    } : "skip"
  );



  useEffect(() => {
    loadBusinessData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    console.log('Tab changed to:', newValue);
    setActiveTab(newValue);
    // Update URL with the current tab
    if (newValue > 0) {
      setSearchParams({ tab: newValue.toString() });
    } else {
      // Remove tab param for the first tab
      setSearchParams({});
    }
  };

  // Business data updates are now handled automatically by the useBusinessWithLocation hook


  const handleProfileItemUpdate = useCallback((itemId: string, completed: boolean) => {
    // This function is kept for backwards compatibility but doesn't do anything
    console.log('Profile item update (deprecated):', itemId, completed);
  }, []);

  const handleBusinessDataUpdate = useCallback((updatedData: any) => {
    // Refetch business data after update
    // The useBusinessWithLocation hook will automatically handle the update
    loadBusinessData();
  }, []);



  // Tab configuration for both desktop and mobile
  const tabsConfig = [
    {
      id: 'basic_info',
      label: isMobile ? 'Info' : 'Location Info',
      fullLabel: 'Location Info',
      icon: BusinessIcon,
      index: 0
    },
    {
      id: 'categories',
      label: isMobile ? 'Categories' : 'Categories',
      fullLabel: 'Categories',
      icon: CategoryIcon,
      index: 1
    },
    {
      id: 'business_hours',
      label: isMobile ? 'Hours' : 'Business Hours',
      fullLabel: 'Business Hours',
      icon: HoursIcon,
      index: 2
    },
    {
      id: 'photos',
      label: isMobile ? 'Photos' : 'Photo Gallery', 
      fullLabel: 'Photo Gallery',
      icon: PhotoIcon,
      index: 3
    },
    {
      id: 'menu',
      label: isMobile ? 'Menu' : 'Menu/Services',
      fullLabel: 'Menu/Services', 
      icon: MenuIcon,
      index: 4
    },
    {
      id: 'social_media',
      label: isMobile ? 'Social' : 'Social Media',
      fullLabel: 'Social Media',
      icon: SocialIcon,
      index: 5
    }
  ];

  // Check if baseline profile is complete - must be before conditional returns
  const baselineComplete = useMemo(() => {
    // Check OnboardingContext status only
    if (onboardingStatus === OnboardingStatus.BASELINE_COMPLETE || 
        onboardingStatus === OnboardingStatus.FULLY_COMPLETE) {
      return true;
    }
    
    // Default to false if onboarding status is not set
    return false;
  }, [onboardingStatus]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 2, pb: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!businessData) {
    return (
      <Container maxWidth="lg" sx={{ pt: 2, pb: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No business data available</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please complete your business profile setup.
          </Typography>
        </Box>
      </Container>
    );
  }

  // If baseline profile is not complete, show the onboarding wizard
  if (!baselineComplete && businessData) {
    return <InitialBusinessOnboardingWizard />;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        pt: 2,
        pb: { xs: 4, md: 6 },
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Business Profile"
        subtitle="Manage your business locations. Each location has its own profile"
      />


      {/* Unified Location-Aware Profile Editor */}
      {businessData && (businessData._id || businessData.id) && (
        <Box sx={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          {/* Integrated Location & Progress Section */}
          <Box sx={{
            mb: 3,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {stableBusinessId && (
              <LocationContextSelector
                businessId={stableBusinessId}
                selectedLocationId={selectedLocationId}
                onLocationChange={handleLocationChange}
                onAddLocation={handleAddLocation}
                businessData={businessData}
              />
            )}
          </Box>

          {/* Tabs - Desktop Tabs vs Mobile Dropdown */}
          {isMobile ? (
            /* Mobile Dropdown */
            <Box sx={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              <FormControl fullWidth size="medium" sx={{ maxWidth: '100%' }}>
                <InputLabel id="mobile-tab-select-label">Select Section</InputLabel>
                <Select
                  labelId="mobile-tab-select-label"
                  value={activeTab}
                  label="Select Section"
                  onChange={(e) => handleTabChange(null, e.target.value as number)}
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minHeight: 48
                    }
                  }}
                  renderValue={(value) => {
                    const selectedTab = tabsConfig.find(tab => tab.index === value);
                    if (!selectedTab) return '';
                    const IconComponent = selectedTab.icon;
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconComponent sx={{ fontSize: 20 }} />
                        <Typography variant="body1">{selectedTab.fullLabel}</Typography>
                      </Box>
                    );
                  }}
                >
                  {tabsConfig.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <MenuItem key={tab.index} value={tab.index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <IconComponent sx={{ fontSize: 20 }} />
                          <Typography variant="body1">{tab.fullLabel}</Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          ) : (
            /* Desktop Tabs */
            <Box sx={{ 
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="business profile tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabsConfig.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <Tab
                      key={tab.index}
                      icon={<IconComponent />} 
                      label={tab.fullLabel} 
                      iconPosition="start"
                      {...a11yProps(tab.index)} 
                    />
                  );
                })}
            </Tabs>
          </Box>
          )}

        {/* Tab Panels */}
        <Box sx={{ 
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
        <TabPanel value={activeTab} index={0}>
          <BusinessInfoSectionSimple
            businessData={businessData}
            selectedLocationId={selectedLocationId}
            onFieldUpdate={handleFieldUpdate}
            readOnly={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <BusinessCategoriesSectionSimple
            businessData={businessData}
            onProfileItemUpdate={handleProfileItemUpdate}
            locationId={selectedLocationId}
            readOnly={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BusinessHoursSectionSimple
            businessData={businessData}
            onProfileItemUpdate={handleProfileItemUpdate}
            locationId={selectedLocationId}
            readOnly={false}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <BusinessGallerySection
            businessData={businessData}
            onProfileItemUpdate={handleProfileItemUpdate}
            locationId={selectedLocationId}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <BusinessMenuSection
            businessData={businessData}
            onProfileItemUpdate={handleProfileItemUpdate}
            locationId={selectedLocationId}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <BusinessSocialMediaSection
            businessData={businessData}
            onBusinessDataUpdate={handleBusinessDataUpdate}
            onProfileItemUpdate={handleProfileItemUpdate}
          />
        </TabPanel>

        </Box>
        </Box>
      )}

      {/* Location Creation Dialog */}
      {locationDialogOpen && stableBusinessId && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            p: 2,
          }}
          onClick={() => setLocationDialogOpen(false)}
        >
          <Box 
            sx={{ 
              backgroundColor: 'background.paper', 
              borderRadius: 2, 
              maxWidth: '95vw', 
              maxHeight: '95vh', 
              overflow: 'auto',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LocationOnboardingWrapper
              businessId={stableBusinessId}
              onLocationCreated={(locationId) => {
                console.log('[BusinessProfilePage] New location created:', locationId);
                setLocationDialogOpen(false);
                // Auto-select the newly created location
                if (locationId) {
                  setSelectedLocationId(locationId);
                }
              }}
              onCancel={() => setLocationDialogOpen(false)}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default BusinessProfilePage;