import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useSnackbar } from 'notistack';
import SubscriptionRequiredModal from './SubscriptionRequiredModal';
import { useClerkBilling } from '../../hooks/useClerkBilling';

interface LocationContextSelectorProps {
  businessId: Id<"businesses">;
  selectedLocationId: string | null;
  onLocationChange: (locationId: string | null) => void;
  onAddLocation?: () => void;
  businessData?: any;
}

const LocationContextSelector: React.FC<LocationContextSelectorProps> = ({
  businessId,
  selectedLocationId,
  onLocationChange,
  onAddLocation,
  businessData,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [subscriptionRequiredModalOpen, setSubscriptionRequiredModalOpen] = useState(false);

  // Use Clerk Billing hook to check features
  const { getUserLimits } = useClerkBilling();
  const userLimits = getUserLimits();

  // Fetch locations for this business
  const locations = useQuery(api.businessLocations.getBusinessLocations, {
    businessId,
    activeOnly: false,
  });
  
  // Calculate if user can add more locations based on Clerk features
  const currentLocationCount = locations?.length || 0;
  const canAddLocation = currentLocationCount < userLimits.maxLocations;

  // Delete location mutation
  const deleteLocationMutation = useMutation(api.businessLocations.deleteLocation);



  // Handle location selection change
  const handleLocationChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onLocationChange(value);
  };

  // Get display name for current selection
  const getLocationDisplayName = () => {
    const location = locations?.find(loc => loc._id === selectedLocationId);
    return location?.name || 'Select a location';
  };

  // Auto-select first location if none selected OR if selected location no longer exists
  React.useEffect(() => {
    if (!locations || locations.length === 0) {
      // No locations available
      if (selectedLocationId) {
        onLocationChange(null);
      }
      return;
    }

    // Check if current selection still exists
    const selectedStillExists = selectedLocationId && locations.some(loc => loc._id === selectedLocationId);

    // Auto-select if no selection OR if selected location was deleted
    if (!selectedLocationId || !selectedStillExists) {
      console.log('[LocationContextSelector] Auto-selecting location. Reason:', !selectedLocationId ? 'No selection' : 'Selected location deleted');
      // Prefer primary location, otherwise use first
      const primaryLocation = locations.find(loc => loc.is_primary);
      const defaultLocation = primaryLocation || locations[0];
      onLocationChange(defaultLocation._id);
    }
  }, [locations, selectedLocationId, onLocationChange]);

  // Handle add location click
  const handleAddLocation = () => {
    console.log('[LocationContextSelector] handleAddLocation called. Can add:', canAddLocation, 'Current:', currentLocationCount, 'Max:', userLimits.maxLocations);
    
    if (!canAddLocation) {
      // User cannot add more locations - show subscription required modal
      // This modal will guide them to upgrade their subscription
      console.log('[LocationContextSelector] Cannot add location. Current count:', currentLocationCount, 'Limit:', userLimits.maxLocations);
      setSubscriptionRequiredModalOpen(true);
      return;
    }
    
    if (onAddLocation) {
      onAddLocation();
    }
  };

  // Handle delete current location
  const handleDeleteCurrentLocation = async () => {
    if (!selectedLocationId) return;

    const currentLocation = locations?.find(loc => loc._id === selectedLocationId);
    if (!currentLocation) return;

    // Prevent deleting the only location (defensive check)
    if (locations && locations.length === 1) {
      enqueueSnackbar('Cannot delete your only location. Businesses must have at least one location.', {
        variant: 'warning',
        autoHideDuration: 5000,
      });
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${currentLocation.name}" location?\n\nThis will permanently remove the location and all its profile information. This action cannot be undone.`
    );

    if (!isConfirmed) return;

    try {
      setLoading(true);
      await deleteLocationMutation({ locationId: selectedLocationId as Id<"business_locations"> });

      // Switch to another location after deletion
      const remainingLocations = locations?.filter(loc => loc._id !== selectedLocationId) || [];
      if (remainingLocations.length > 0) {
        const newSelection = remainingLocations.find(loc => loc.is_primary) || remainingLocations[0];
        onLocationChange(newSelection._id);
      } else {
        onLocationChange(null);
      }

      enqueueSnackbar(`Location "${currentLocation.name}" deleted successfully`, { variant: 'success' });
    } catch (error: any) {
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to delete location';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };


  // Show loading if locations haven't loaded yet
  if (locations === undefined) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading locations...</Typography>
      </Box>
    );
  }

  // Handle null or empty locations array
  const locationsList = locations || [];

  return (
    <Box sx={{ mb: 3, width: '100%', boxSizing: 'border-box' }}>
      {/* Always show the location management UI */}
      {locationsList.length > 0 ? (
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems={isMobile ? "stretch" : "center"}
          sx={{ width: '100%', boxSizing: 'border-box' }}
        >
          {/* Location Selector */}
          <FormControl
            size={isMobile ? "medium" : "small"}
            sx={{
              minWidth: isMobile ? '100%' : 250,
              maxWidth: '100%',
              flex: isMobile ? '1 1 auto' : '0 1 auto'
            }}
          >
            <Select
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              displayEmpty
              startAdornment={
                <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              }
              sx={{
                backgroundColor: 'background.paper',
                minHeight: isMobile ? 48 : undefined,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              {locationsList.map((location) => (
              <MenuItem key={location._id} value={location._id}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                  <StoreIcon sx={{ fontSize: 18 }} />
                  <Typography>{location.name}</Typography>
                  {location.is_primary && (
                    <Chip
                      label="Primary"
                      size="small"
                      color="primary"
                      sx={{ ml: 'auto', height: 20 }}
                    />
                  )}
                  {location.temporarily_closed && (
                    <Chip
                      label="Closed"
                      size="small"
                      color="warning"
                      sx={{ ml: location.is_primary ? 1 : 'auto', height: 20 }}
                    />
                  )}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

          {/* Add Location Button - After location selector */}
          <Button
            variant="outlined"
            size={isMobile ? "large" : "small"}
            startIcon={<AddIcon />}
            onClick={handleAddLocation}
            fullWidth={isMobile}
            sx={{
              ml: isMobile ? 0 : 1,
              minWidth: isMobile ? 'auto' : 'fit-content',
              minHeight: isMobile ? 48 : undefined,
              flexShrink: 0,
            }}
          >
            Add Location
          </Button>
        </Stack>
      ) : (
        /* No Locations Message - Show when there are no locations */
        <Box sx={{ 
          mt: 2, 
          p: 3, 
          bgcolor: 'background.default', 
          borderRadius: 1,
          textAlign: 'center' 
        }}>
          <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Locations Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add your first business location to get started. This will be your primary location.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLocation}
          >
            Add Your First Location
          </Button>
        </Box>
      )}
      

      
      {/* Subscription Required Modal - for users with no subscription */}
      <SubscriptionRequiredModal
        open={subscriptionRequiredModalOpen}
        onClose={() => setSubscriptionRequiredModalOpen(false)}
        itemType="location"
        actionType="add"
        draftSaved={false}
        returnUrl={window.location.pathname}
      />
    </Box>
  );
};

export default LocationContextSelector;