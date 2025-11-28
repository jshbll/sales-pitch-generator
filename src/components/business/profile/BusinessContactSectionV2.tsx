import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { businessService } from '../../../services/serviceSelector';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import EditableFieldV2 from './EditableFieldV2';
import '../../../styles/profileStyles.css';
import FloatingActionBar from './FloatingActionBar';
import useAutoSave from '../../../hooks/useAutoSave';

interface BusinessContactSectionV2Props {
  businessData: any;
  onBusinessDataUpdate: (data: any) => void;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
  locationId?: string | null;
}

const BusinessContactSectionV2: React.FC<BusinessContactSectionV2Props> = ({
  businessData,
  onBusinessDataUpdate,
  onProfileItemUpdate,
  locationId,
}) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get location-specific data
  const locationData = useQuery(
    api.businessLocations.getLocationById,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );
  
  // Convex mutations
  const updateLocation = useMutation(api.businessLocations.updateLocation);
  
  const [localData, setLocalData] = useState({
    phone: locationData?.phone || '',
    email: locationData?.email || '',
    website: locationData?.website || '',
    display_phone_publicly: locationData?.display_phone_publicly ?? true,
    display_email_publicly: locationData?.display_email_publicly ?? true,
  });
  
  // Update local data when location data changes
  React.useEffect(() => {
    if (locationData) {
      setLocalData({
        phone: locationData.phone || '',
        email: locationData.email || '',
        website: locationData.website || '',
        display_phone_publicly: locationData.display_phone_publicly ?? true,
        display_email_publicly: locationData.display_email_publicly ?? true,
      });
    }
  }, [locationData]);

  // Auto-save hook for location updates
  const autoSave = useAutoSave({
    delay: 2000,
    onSave: async (changes) => {
      try {
        if (!locationId) return false;

        await updateLocation({
          locationId: locationId as Id<"business_locations">,
          ...changes,
        });
        
        // Update profile completion based on location data
        const hasPhone = !!(changes.phone || localData.phone);
        const hasEmail = !!(changes.email || localData.email);
        const hasContact = hasPhone || hasEmail || !!(changes.website || localData.website);
        onProfileItemUpdate('contact_info', hasContact);
        
        return true;
      } catch (error) {
        console.error('Error saving location contact info:', error);
        return false;
      }
    },
    showNotifications: true,
  });

  // Field save handlers
  const handleFieldSave = useCallback(async (fieldName: string, value: any) => {
    setLocalData(prev => ({ ...prev, [fieldName]: value }));
    autoSave.trackChange(fieldName, value);
    return true;
  }, [autoSave]);

  // Toggle handlers for visibility switches
  const handleToggleVisibility = useCallback((field: 'display_phone_publicly' | 'display_email_publicly', value: boolean) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    autoSave.trackChange(field, value);
  }, [autoSave]);

  // Validation functions
  const validatePhone = (value: string): string | null => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number format';
    if (value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  };

  const validateWebsite = (value: string): string | null => {
    if (!value) return null; // Website is optional
    
    const trimmedValue = value.trim();
    
    // Check if it starts with http:// or https://
    if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      return 'Website must start with http:// or https://';
    }
    
    // Basic URL validation
    try {
      const urlObj = new URL(trimmedValue);
      // Must have a domain with at least one dot
      if (!urlObj.hostname.includes('.')) {
        return 'Please enter a valid website URL';
      }
      return null;
    } catch {
      return 'Please enter a valid website URL';
    }
  };

  // Format phone for display
  const formatPhoneDisplay = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Format phone input
  const formatPhoneInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return value;
  };

  // Show loading state if no location is selected or data is loading
  if (!locationId || locationData === undefined) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          {!locationId ? 'Select a location to manage contact information' : 'Loading contact information...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      sx={{ 
                        fontWeight: 700,
                        color: 'text.primary'
                      }}
                    >
          {locationData?.name || 'Location'} - Contact Info
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mt: 0.5 }}
                    >
                      Location-specific contact information for {locationData?.name || 'this location'} location.
                    </Typography>
                  </Box>  


      {/* Primary Contact Card */}
      <Card 
        sx={{ 
          boxShadow: 'none',
          mb: isMobile ? 2 : 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          overflow: 'visible',
          maxWidth: 800,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography 
            variant={isMobile ? "body1" : "subtitle1"} 
            sx={{ 
              mb: isMobile ? 2 : 3, 
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : undefined
            }}
          >
            {locationData?.name || 'Location'} Contact Details
          </Typography>
          
          <Stack spacing={isMobile ? 2 : 3}>
            {/* Phone Number */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <EditableFieldV2
                  label="Phone Number"
                  value={localData.phone}
                  onSave={(value) => handleFieldSave('phone', value)}
                  validation={validatePhone}
                  type="tel"
                  placeholder="(555) 555-5555"
                  helperText="Your business phone number"
                  required
                  formatDisplay={formatPhoneDisplay}
                  formatInput={formatPhoneInput}
                  startAdornment={<PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localData.display_phone_publicly}
                      onChange={(e) => handleToggleVisibility('display_phone_publicly', e.target.checked)}
                      disabled={!localData.phone}
                      size="small"
                    />
                  }
                  label={
                    localData.phone ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {localData.display_phone_publicly ? (
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityOffIcon sx={{ fontSize: 16 }} />
                        )}
                        <Typography variant="caption">
                          {localData.display_phone_publicly ? 'Show on Profile' : 'Hide from Profile'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Enter phone to enable
                      </Typography>
                    )
                  }
                  sx={{ ml: 2 }}
                />
              </Box>
            </Box>

            {/* Email */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <EditableFieldV2
                  label="Public Email"
                  value={localData.email}
                  onSave={(value) => handleFieldSave('email', value)}
                  validation={validateEmail}
                  type="email"
                  placeholder="contact@yourbusiness.com"
                  helperText="Email address for customer inquiries"
                  startAdornment={<EmailIcon sx={{ mr: 1, color: 'primary.main' }} />}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localData.display_email_publicly}
                      onChange={(e) => handleToggleVisibility('display_email_publicly', e.target.checked)}
                      disabled={!localData.email}
                      size="small"
                    />
                  }
                  label={
                    localData.email ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {localData.display_email_publicly ? (
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityOffIcon sx={{ fontSize: 16 }} />
                        )}
                        <Typography variant="caption">
                          {localData.display_email_publicly ? 'Show on Profile' : 'Hide from Profile'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Enter email to enable
                      </Typography>
                    )
                  }
                  sx={{ ml: 2 }}
                />
              </Box>
            </Box>

            {/* Website */}
            <EditableFieldV2
              label="Website"
              value={localData.website}
              onSave={(value) => handleFieldSave('website', value)}
              validation={validateWebsite}
              type="url"
              placeholder="https://www.yourbusiness.com"
              helperText="Your business website URL"
              startAdornment={<WebsiteIcon sx={{ mr: 1, color: 'primary.main' }} />}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <FloatingActionBar
        hasUnsavedChanges={autoSave.hasUnsavedChanges}
        unsavedCount={autoSave.unsavedFields.size}
        onSaveAll={autoSave.saveNow}
        onDiscardAll={autoSave.discardChanges}
        onUndo={autoSave.undo}
        canUndo={autoSave.canUndo}
        isSaving={autoSave.isSaving}
        showPreview={false}
      />
    </Box>
  );
};

export default BusinessContactSectionV2;