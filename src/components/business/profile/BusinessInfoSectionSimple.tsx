import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { StyledTextField } from '../../common/StyledFormComponents';
import PhoneInput from '../../common/PhoneInput';
import {
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { businessService } from '../../../services/serviceSelector';
import { useAuth } from '../../../hooks/useAuth';

interface BusinessInfoSectionSimpleProps {
  businessData: any;
  selectedLocationId: string | null;
  onFieldUpdate?: (field: string, value: any) => void;
  readOnly?: boolean;
}

const BusinessInfoSectionSimple: React.FC<BusinessInfoSectionSimpleProps> = ({
  businessData,
  selectedLocationId,
  onFieldUpdate,
  readOnly = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  // Fetch location-specific data
  const locationData = useQuery(
    api.businessLocations.getLocationById,
    selectedLocationId ? { locationId: selectedLocationId as Id<"business_locations"> } : "skip"
  );

  // Fetch all locations to check count
  const allLocations = useQuery(
    api.businessLocations.getBusinessLocations,
    businessData?._id ? { businessId: businessData._id as Id<"businesses">, activeOnly: false } : "skip"
  );

  // Mutations
  const updateLocation = useMutation(api.businessLocations.updateLocation);
  const updateBusiness = useMutation(api.businesses.updateBusiness);
  const deleteLocation = useMutation(api.businessLocations.deleteLocation);

  // Local state for form fields
  const [formData, setFormData] = useState({
    internalName: locationData?.name || '',
    name: locationData?.profile_name || '',
    email: locationData?.email || '',
    phone: locationData?.phone || '',
    website: locationData?.website || '',
    address: locationData?.address || '',
    city: locationData?.city || '',
    state: locationData?.state || '',
    zipCode: locationData?.zip || '',
    about: locationData?.description || businessData?.description || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(businessData?.logo || businessData?.logoUrl || businessData?.logo_url || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);

  // Update form data when location data changes
  React.useEffect(() => {
    if (locationData) {
      const newFormData = {
        internalName: locationData.name || '',
        name: locationData.profile_name || '',
        email: locationData.email || '',
        phone: locationData.phone || '',
        website: locationData.website || '',
        address: locationData.address || '',
        city: locationData.city || '',
        state: locationData.state || '',
        zipCode: locationData.zip || '',
        about: locationData.description || businessData?.description || '',
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setHasChanges(false);
    }
  }, [locationData, businessData]);

  // Detect changes in form data
  React.useEffect(() => {
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasChanges(hasFormChanges);
  }, [formData, initialFormData]);

  // Update logo URL when location data changes
  React.useEffect(() => {
    // If a location is selected, use location-specific logo
    // Otherwise fall back to business-level logo
    const newLogoUrl = locationData?.logo_url ||
                       locationData?.logo ||
                       businessData?.logo ||
                       businessData?.logoUrl ||
                       businessData?.logo_url ||
                       '';
    setLogoUrl(newLogoUrl);
  }, [locationData, businessData]);

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file', { variant: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image must be less than 5MB', { variant: 'error' });
      return;
    }

    const businessId = user?.id || user?.businessId || businessData?._id || businessData?.id;
    console.log('[BusinessInfoSectionSimple] Upload starting - businessId:', businessId, 'user:', user);
    
    if (!businessId) {
      enqueueSnackbar('No business ID found', { variant: 'error' });
      console.error('[BusinessInfoSectionSimple] No business ID available:', { user, businessData });
      return;
    }

    try {
      setIsUploadingLogo(true);

      const uploadResponse = await businessService.uploadBusinessLogo(businessId, file);
      console.log('[BusinessInfoSectionSimple] Upload response:', uploadResponse);

      if (uploadResponse.success && uploadResponse.data) {
        // The response returns the full business profile with updated logo
        const updatedBusiness = uploadResponse.data;
        const newLogoUrl = updatedBusiness.logo || updatedBusiness.logoUrl || updatedBusiness.logo_url || '';
        const newLogoId = updatedBusiness.logo_id;

        if (newLogoUrl) {
          // If a location is selected, save logo to location
          // Otherwise it's already saved to business by uploadBusinessLogo
          if (selectedLocationId) {
            console.log('[BusinessInfoSectionSimple] Updating location logo:', selectedLocationId);
            await updateLocation({
              locationId: selectedLocationId as Id<"business_locations">,
              logo_url: newLogoUrl,
              logo_id: newLogoId,
            });
          }

          setLogoUrl(newLogoUrl);

          if (onFieldUpdate) {
            onFieldUpdate('logo_url', newLogoUrl);
            if (newLogoId) {
              onFieldUpdate('logo_id', newLogoId);
            }
          }

          enqueueSnackbar('Logo uploaded successfully', { variant: 'success' });
        } else {
          throw new Error('No logo URL in response');
        }
      } else {
        throw new Error(uploadResponse.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      enqueueSnackbar('Failed to upload logo', { variant: 'error' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (onFieldUpdate) {
      onFieldUpdate(field, value);
    }
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!selectedLocationId || readOnly) return;

    setIsSaving(true);
    try {
      // Save location-specific fields
      await updateLocation({
        locationId: selectedLocationId as Id<"business_locations">,
        name: formData.internalName,
        profile_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
      });
      
      // Save business-level fields (description) if we have a businessId
      if (businessData?._id && formData.about) {
        await updateBusiness({
          businessId: businessData._id as Id<"businesses">,
          updates: {
            description: formData.about,
          },
        });
      }
      
      enqueueSnackbar('Changes saved successfully', { variant: 'success' });
      setInitialFormData(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      enqueueSnackbar('Failed to save changes', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete location
  const handleDeleteLocation = async () => {
    if (!selectedLocationId || readOnly) return;

    // Prevent deleting the only location
    if (allLocations && allLocations.length === 1) {
      enqueueSnackbar('Cannot delete your only location. Businesses must have at least one location.', {
        variant: 'warning',
        autoHideDuration: 5000,
      });
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this location? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteLocation({
        locationId: selectedLocationId as Id<"business_locations">
      });
      enqueueSnackbar('Location deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting location:', error);
      enqueueSnackbar('Failed to delete location', { variant: 'error' });
    }
  };

  return (
    <Box>
      {/* Two Cards Layout */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Left Card - Profile Photo */}
        <Card
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
          <Stack alignItems="center" spacing={2.5}>
            <Box 
              sx={{ 
                position: 'relative',
                '&:hover .upload-overlay': {
                  opacity: 1,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 180,
                  height: 180,
                  bgcolor: 'grey.200',
                  border: '8px solid',
                  borderColor: 'background.default',
                  boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                }}
                src={logoUrl}
              >
                <PhotoIcon sx={{ fontSize: 64, color: 'grey.400' }} />
              </Avatar>
              
              {!readOnly && (
                <Box
                  className="upload-overlay"
                  component="label"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    bgcolor: 'rgba(22, 28, 36, 0.64)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    cursor: isUploadingLogo ? 'wait' : 'pointer',
                    pointerEvents: isUploadingLogo ? 'none' : 'auto',
                  }}
                >
                  {isUploadingLogo ? (
                    <CircularProgress size={32} sx={{ color: 'white' }} />
                  ) : (
                    <Stack alignItems="center" spacing={1}>
                      <PhotoIcon sx={{ fontSize: 32 }} />
                      <Typography variant="caption">
                        Update photo
                      </Typography>
                    </Stack>
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                </Box>
              )}
            </Box>
            
            <Stack spacing={0.5} alignItems="center">
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}
              >
                Allowed *.jpeg, *.jpg, *.png, *.gif
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}
              >
                Max size of 3 MB
              </Typography>
            </Stack>
          </Stack>
          </CardContent>
        </Card>

        {/* Right Card - Form Fields */}
        <Card 
          sx={{ 
            flex: 1,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Section 1: Internal and Customer-Facing Names */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <StyledTextField
                    fullWidth
                    label="Internal Location Name"
                    value={formData.internalName}
                    onChange={(e) => handleFieldChange('internalName', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                    helperText="For internal reference only"
                  />
                </FormControl>
                <FormControl fullWidth>
                  <StyledTextField
                    fullWidth
                    label="Customer-Facing Name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                    helperText="Name shown to customers"
                  />
                </FormControl>              
              </Stack>

              {/* Section 2: About */}
              <FormControl fullWidth>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="About"
                  value={formData.about}
                  onChange={(e) => handleFieldChange('about', e.target.value)}
                  disabled={readOnly}
                  variant="outlined"
                />
              </FormControl>

              {/* Section 3: Contact Information */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <StyledTextField
                    fullWidth
                    label="Public Business Email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                    helperText="Contact email shown to customers"
                  />
                </FormControl>
                <FormControl fullWidth>
                  <PhoneInput
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(formatted, normalized, isValid) => {
                      handleFieldChange('phone', normalized);
                    }}
                    disabled={readOnly}
                    validateOnBlur={true}
                    showCountryCode={false}
                    clearable={false}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '& fieldset': {
                          borderColor: 'divider',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: 'text.primary',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        '&.Mui-focused': {
                          color: 'primary.main',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        mt: 0.5,
                        fontSize: '0.75rem',
                      },
                      // Hide the phone icon to match other fields
                      '& .MuiInputAdornment-positionStart': {
                        display: 'none',
                      },
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <StyledTextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                    placeholder="https://www.example.com"
                  />
                </FormControl>
              </Stack>

              {/* Section 4: Location */}
              <FormControl fullWidth>
                <StyledTextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  disabled={readOnly}
                  variant="outlined"
                />
              </FormControl>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <StyledTextField
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl fullWidth sx={{ minWidth: { md: 120 } }}>
                  <StyledTextField
                    fullWidth
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl fullWidth sx={{ maxWidth: { md: 150 } }}>
                  <StyledTextField
                    fullWidth
                    label="Zip Code"
                    value={formData.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    disabled={readOnly}
                    variant="outlined"
                  />
                </FormControl>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Location Button - Only show if there are multiple locations */}
      {!readOnly && allLocations && allLocations.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleDeleteLocation}
            sx={{
              textTransform: 'none',
              minWidth: 120,
            }}
          >
            Delete location
          </Button>
        </Box>
      )}

      {/* Save Changes Button - Fixed position when there are changes */}
      {!readOnly && hasChanges && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80, // 80px to clear bottom nav (49px) + safe margin on mobile
            right: 32,
            zIndex: 1000,
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.24)',
            borderRadius: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 1.5,
              minWidth: 150,
            }}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BusinessInfoSectionSimple;