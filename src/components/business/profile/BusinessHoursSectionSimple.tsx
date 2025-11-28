import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface BusinessHoursSectionSimpleProps {
  businessData: any;
  locationId?: string | null;
  onProfileItemUpdate?: (itemId: string, completed: boolean) => void;
  readOnly?: boolean;
}

interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

const BusinessHoursSectionSimple: React.FC<BusinessHoursSectionSimpleProps> = ({
  businessData,
  locationId,
  onProfileItemUpdate,
  readOnly = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch location-specific business hours
  const locationHours = useQuery(
    api.businessLocations.getLocationBusinessHours,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );
  
  // Mutation to update location hours
  const updateLocationHours = useMutation(api.businessLocations.updateLocationBusinessHours);
  
  // Initialize with default hours
  const getDefaultHours = (): BusinessHours => {
    const defaultHours: BusinessHours = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      defaultHours[day] = {
        isOpen: false,
        openTime: '09:00',
        closeTime: '17:00',
      };
    });
    return defaultHours;
  };
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(getDefaultHours());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialHours, setInitialHours] = useState<BusinessHours>(getDefaultHours());

  // Helper function to round time to nearest 15-minute interval
  const roundToNearest15Min = (time: string): string => {
    if (!time) return '09:00';
    const [hours, minutes] = time.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 15) * 15;
    if (roundedMinutes === 60) {
      return `${String(hours + 1).padStart(2, '0')}:00`;
    }
    return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
  };

  // Update state when location hours are loaded
  useEffect(() => {
    if (locationHours?.business_hours) {
      const formattedHours: BusinessHours = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      days.forEach(day => {
        const dayHours = locationHours.business_hours[day];
        if (dayHours) {
          const openTime = dayHours.openTime || dayHours.open || '09:00';
          const closeTime = dayHours.closeTime || dayHours.close || '17:00';

          formattedHours[day] = {
            isOpen: dayHours.isOpen === true || (dayHours.closed === false),
            openTime: roundToNearest15Min(openTime),
            closeTime: roundToNearest15Min(closeTime),
          };
        } else {
          formattedHours[day] = {
            isOpen: false,
            openTime: '09:00',
            closeTime: '17:00',
          };
        }
      });

      setBusinessHours(formattedHours);
      setInitialHours(formattedHours);
      setHasChanges(false);
    } else if (locationHours && !locationHours.business_hours) {
      const defaultHours = getDefaultHours();
      setBusinessHours(defaultHours);
      setInitialHours(defaultHours);
      setHasChanges(false);
    }
  }, [locationHours]);

  // Detect changes
  useEffect(() => {
    const hasFormChanges = JSON.stringify(businessHours) !== JSON.stringify(initialHours);
    setHasChanges(hasFormChanges);
  }, [businessHours, initialHours]);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const minuteStr = minute.toString().padStart(2, '0');
    const time24 = `${hour.toString().padStart(2, '0')}:${minuteStr}`;
    const time12 = hour === 0 ? `12:${minuteStr} AM` :
                  hour < 12 ? `${hour}:${minuteStr} AM` :
                  hour === 12 ? `12:${minuteStr} PM` :
                  `${hour - 12}:${minuteStr} PM`;
    return { value: time24, label: time12 };
  });

  const handleBusinessHoursChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: any) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!locationId || readOnly) return;

    setIsSaving(true);
    try {
      // Convert component format to database format
      const dbHours: any = {};
      Object.keys(businessHours).forEach(day => {
        const dayHours = businessHours[day];
        dbHours[day] = {
          isOpen: dayHours.isOpen,
          openTime: dayHours.openTime,
          closeTime: dayHours.closeTime,
          closed: !dayHours.isOpen,
          open: dayHours.openTime,
          close: dayHours.closeTime,
        };
      });
      
      await updateLocationHours({
        locationId: locationId as Id<"business_locations">,
        business_hours: dbHours,
      });
      
      enqueueSnackbar('Business hours saved successfully', { variant: 'success' });
      setInitialHours(businessHours);
      setHasChanges(false);
      
      // Update profile completion
      if (onProfileItemUpdate) {
        const hasBusinessHours = Object.keys(businessHours).some(day => businessHours[day].isOpen);
        onProfileItemUpdate('business_hours', hasBusinessHours);
      }
    } catch (error) {
      console.error('Error saving business hours:', error);
      enqueueSnackbar('Failed to save business hours', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Show message if no location selected
  if (!locationId || locationHours === undefined) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          {!locationId ? 'Select a location to manage business hours' : 'Loading business hours...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Single Card Layout */}
      <Card
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 3,
          }}
        >
          Business Hours
        </Typography>
        
        {/* Days Grid - Custom layout for weekdays and weekends */}
        <Stack spacing={2}>
          {/* Weekdays Row - Monday to Friday */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // 1 column on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on tablet
                md: 'repeat(5, 1fr)' // 5 columns on desktop for weekdays
              },
              gap: 2,
            }}
          >
            {daysOfWeek.slice(0, 5).map(day => (
            <Box 
              key={day.key}
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: businessHours[day.key]?.isOpen ? 'background.paper' : 'action.hover',
                minHeight: 140,
              }}
            >
              {/* Top row: Name and Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontWeight: businessHours[day.key]?.isOpen ? 600 : 400,
                  }}
                >
                  {day.label}
                </Typography>
                <Switch
                  checked={businessHours[day.key]?.isOpen || false}
                  onChange={(e) => handleBusinessHoursChange(day.key, 'isOpen', e.target.checked)}
                  disabled={readOnly}
                  size="small"
                />
              </Box>
              
              {businessHours[day.key]?.isOpen ? (
                <Stack spacing={1} flex={1}>
                  {/* Open time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                      Open:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={businessHours[day.key]?.openTime || '09:00'}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'openTime', e.target.value)}
                        disabled={readOnly}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Close time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                      Close:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={businessHours[day.key]?.closeTime || '17:00'}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'closeTime', e.target.value)}
                        disabled={readOnly}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Closed
                  </Typography>
                </Box>
              )}
            </Box>
            ))}
          </Box>

          {/* Weekend Row - Saturday and Sunday */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // 1 column on mobile
                sm: '1fr 1fr', // 2 columns on tablet
                md: '1fr 1fr', // 2 columns on desktop for weekend
              },
              gap: 2,
              maxWidth: { md: '40%' }, // Limit width on desktop to align with weekdays
            }}
          >
            {daysOfWeek.slice(5, 7).map(day => (
            <Box 
              key={day.key}
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: businessHours[day.key]?.isOpen ? 'background.paper' : 'action.hover',
                minHeight: 140,
              }}
            >
              {/* Top row: Name and Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontWeight: businessHours[day.key]?.isOpen ? 600 : 400,
                  }}
                >
                  {day.label}
                </Typography>
                <Switch
                  checked={businessHours[day.key]?.isOpen || false}
                  onChange={(e) => handleBusinessHoursChange(day.key, 'isOpen', e.target.checked)}
                  disabled={readOnly}
                  size="small"
                />
              </Box>
              
              {businessHours[day.key]?.isOpen ? (
                <Stack spacing={1} flex={1}>
                  {/* Open time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                      Open:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={businessHours[day.key]?.openTime || '09:00'}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'openTime', e.target.value)}
                        disabled={readOnly}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Close time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                      Close:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={businessHours[day.key]?.closeTime || '17:00'}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'closeTime', e.target.value)}
                        disabled={readOnly}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Closed
                  </Typography>
                </Box>
              )}
            </Box>
            ))}
          </Box>
        </Stack>
        </CardContent>
      </Card>

      {/* Save Changes Button - Fixed position when there are changes */}
      {!readOnly && hasChanges && (
        <Box
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 32, // 80px on mobile to clear bottom nav (49px) + safe margin
            right: isMobile ? 16 : 32,
            left: isMobile ? 16 : 'auto',
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
            fullWidth={isMobile}
            sx={{
              textTransform: 'none',
              px: 3,
              py: isMobile ? 2 : 1.5,
              borderRadius: 1.5,
              minWidth: isMobile ? 'auto' : 150,
              minHeight: isMobile ? 48 : 'auto',
            }}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BusinessHoursSectionSimple;