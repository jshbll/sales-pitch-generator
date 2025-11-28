import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  ContentCopy as CopyIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { businessService } from '../../../services/serviceSelector';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface BusinessHoursSectionProps {
  businessData: any;
  onBusinessDataUpdate: (data: any) => void;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
  locationId?: string | null;
}

interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

const BusinessHoursSection: React.FC<BusinessHoursSectionProps> = ({
  businessData,
  onBusinessDataUpdate,
  onProfileItemUpdate,
  locationId,
}) => {
  const { user } = useAuth();
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
  
  // Initialize with default hours for all days to prevent uncontrolled/controlled warning
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

  // Update state when location hours are loaded
  useEffect(() => {
    if (locationHours?.business_hours) {
      // Convert from database format to component format
      const formattedHours: BusinessHours = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach(day => {
        const dayHours = locationHours.business_hours[day];
        if (dayHours) {
          formattedHours[day] = {
            isOpen: dayHours.isOpen === true || (dayHours.isOpen !== false && !dayHours.closed),
            openTime: dayHours.openTime || dayHours.open || '09:00',
            closeTime: dayHours.closeTime || dayHours.close || '17:00',
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
    } else if (locationHours && !locationHours.business_hours) {
      // If location has no hours set, use defaults
      setBusinessHours(getDefaultHours());
    }
  }, [locationHours]);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time12 = hour === 0 ? `12:${minute} AM` : 
                  hour < 12 ? `${hour}:${minute} AM` : 
                  hour === 12 ? `12:${minute} PM` : 
                  `${hour - 12}:${minute} PM`;
    const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
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

  const handleSave = async () => {
    if (!user || !locationId) {
      enqueueSnackbar('Please select a location first', { variant: 'warning' });
      return;
    }

    try {
      setIsSaving(true);
      
      // Convert component format back to database format
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
      
      // Update location-specific hours
      await updateLocationHours({
        locationId: locationId as Id<"business_locations">,
        business_hours: dbHours,
      });
      
      enqueueSnackbar('Business hours updated successfully!', { variant: 'success' });
      
      // Update profile completion
      const hasBusinessHours = Object.keys(businessHours).some(day => businessHours[day].isOpen);
      onProfileItemUpdate('business_hours', hasBusinessHours);
      
    } catch (error) {
      console.error('Error saving business hours:', error);
      enqueueSnackbar('Error saving business hours', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyHoursToAll = (fromDay: string) => {
    const sourceHours = businessHours[fromDay];
    if (!sourceHours) return;

    const updatedHours = { ...businessHours };
    daysOfWeek.forEach(day => {
      if (day.key !== fromDay) {
        updatedHours[day.key] = { ...sourceHours };
      }
    });

    setBusinessHours(updatedHours);
    enqueueSnackbar(`Copied ${fromDay} hours to all days`, { variant: 'info' });
  };

  const setCommonHours = (type: 'weekdays' | 'weekends' | '24hours' | 'closed') => {
    const updatedHours = { ...businessHours };
    
    switch (type) {
      case 'weekdays':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          updatedHours[day] = { isOpen: true, openTime: '09:00', closeTime: '17:00' };
        });
        break;
      case 'weekends':
        ['saturday', 'sunday'].forEach(day => {
          updatedHours[day] = { isOpen: true, openTime: '10:00', closeTime: '16:00' };
        });
        break;
      case '24hours':
        daysOfWeek.forEach(day => {
          updatedHours[day.key] = { isOpen: true, openTime: '00:00', closeTime: '23:59' };
        });
        break;
      case 'closed':
        daysOfWeek.forEach(day => {
          updatedHours[day.key] = { isOpen: false, openTime: '09:00', closeTime: '17:00' };
        });
        break;
    }
    
    setBusinessHours(updatedHours);
  };

  const formatTimeDisplay = (time: string) => {
    const timeOption = timeOptions.find(t => t.value === time);
    return timeOption ? timeOption.label : time;
  };

  const getOpenStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const todayHours = businessHours[currentDay];
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, status: 'Closed Today' };
    }
    
    const isCurrentlyOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
    return {
      isOpen: isCurrentlyOpen,
      status: isCurrentlyOpen ? 'Open Now' : 'Closed Now'
    };
  };

  const openStatus = getOpenStatus();

  // Show loading state while fetching location hours
  if (locationId && !locationHours) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show message if no location selected
  if (!locationId) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LocationIcon />
          <Typography>Please select a location from the dropdown above to manage its business hours.</Typography>
        </Stack>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        mb: isMobile ? 2 : 3,
        gap: isMobile ? 2 : 0
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            sx={{ 
              fontWeight: 600, 
              mb: 0.5,
              fontSize: isMobile ? '1.25rem' : undefined
            }}
          >
            Business Hours
          </Typography>
          {locationHours && (
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {locationHours.locationName}
                {locationHours.is_primary && (
                  <Chip label="Primary" size="small" sx={{ ml: 1, height: 18 }} color="primary" />
                )}
              </Typography>
            </Stack>
          )}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center', 
            gap: isMobile ? 1 : 2 
          }}>
            <Typography 
              variant={isMobile ? "body2" : "body2"} 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
            >
              Set your operating hours so customers know when you're open dude.
            </Typography>
            <Chip 
              label={openStatus.status}
              color={openStatus.isOpen ? 'success' : 'default'}
              size={isMobile ? "medium" : "small"}
              sx={{ 
                alignSelf: isMobile ? 'flex-start' : 'center',
                mt: isMobile ? 0.5 : 0
              }}
            />
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={!isMobile && <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
          size={isMobile ? "large" : "medium"}
          fullWidth={isMobile}
          sx={{
            minHeight: isMobile ? 48 : 'auto',
            py: isMobile ? 1.5 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Save Hours'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? "body2" : "body1"}>
          These hours appear on your mobile profile and help customers know when you're available.
          You can set different hours for each day or use quick presets below.
        </Typography>
      </Alert>

      {/* Quick Presets */}
      <Card sx={{ boxShadow: 'none', mb: isMobile ? 2 : 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography 
            variant={isMobile ? "body1" : "subtitle1"} 
            sx={{ 
              fontWeight: 600, 
              mb: isMobile ? 2 : 2,
              fontSize: isMobile ? '1.1rem' : undefined
            }}
          >
            Quick Presets
          </Typography>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 1.5 : 2} 
            flexWrap="wrap"
            sx={{ gap: isMobile ? 1.5 : 2 }}
          >
            <Button
              variant="outlined"
              size={isMobile ? "large" : "small"}
              onClick={() => setCommonHours('weekdays')}
              fullWidth={isMobile}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                py: isMobile ? 1.25 : undefined
              }}
            >
              Standard Weekdays (9 AM - 5 PM)
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? "large" : "small"}
              onClick={() => setCommonHours('weekends')}
              fullWidth={isMobile}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                py: isMobile ? 1.25 : undefined
              }}
            >
              Weekend Hours (10 AM - 4 PM)
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? "large" : "small"}
              onClick={() => setCommonHours('24hours')}
              fullWidth={isMobile}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                py: isMobile ? 1.25 : undefined
              }}
            >
              24/7 Operations
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? "large" : "small"}
              color="error"
              onClick={() => setCommonHours('closed')}
              fullWidth={isMobile}
              sx={{
                minHeight: isMobile ? 44 : 'auto',
                py: isMobile ? 1.25 : undefined
              }}
            >
              Temporarily Closed
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Business Hours Grid */}
      <Card sx={{ boxShadow: 'none', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 2 : 3 }}>
            <ScheduleIcon color="primary" />
            <Typography 
              variant={isMobile ? "body1" : "subtitle1"} 
              sx={{ 
                fontWeight: 600,
                fontSize: isMobile ? '1.1rem' : undefined
              }}
            >
              Weekly Schedule
            </Typography>
          </Box>

          {/* Column Headers - Hidden on mobile for cleaner look */}
          {!isMobile && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={2}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Day
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Open Time
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Close Time
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                {/* Empty column for Copy to All button */}
              </Grid>
            </Grid>
          )}

          <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />

          <Stack spacing={isMobile ? 3 : 2}>
            {daysOfWeek.map((day, index) => {
              const dayHours = businessHours[day.key] || { open: '09:00', close: '17:00', closed: false };
              
              return (
                <Box key={day.key}>
                  {isMobile ? (
                    // Mobile Layout - Stack vertically for better touch interaction
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {day.label}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={dayHours?.isOpen === true}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'isOpen', e.target.checked)}
                              size="medium"
                            />
                          }
                          label="Open"
                          sx={{ marginLeft: 0, marginRight: 0 }}
                        />
                      </Box>
                      
                      {dayHours.isOpen ? (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="medium">
                              <InputLabel sx={{ fontSize: '0.9rem' }}>Open Time</InputLabel>
                              <Select
                                value={dayHours.openTime}
                                onChange={(e) => handleBusinessHoursChange(day.key, 'openTime', e.target.value)}
                                label="Open Time"
                                sx={{
                                  minHeight: 48,
                                  '& .MuiSelect-select': {
                                    fontSize: '0.95rem'
                                  }
                                }}
                              >
                                {timeOptions.map((time) => (
                                  <MenuItem key={time.value} value={time.value}>
                                    {time.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth size="medium">
                              <InputLabel sx={{ fontSize: '0.9rem' }}>Close Time</InputLabel>
                              <Select
                                value={dayHours.closeTime}
                                onChange={(e) => handleBusinessHoursChange(day.key, 'closeTime', e.target.value)}
                                label="Close Time"
                                sx={{
                                  minHeight: 48,
                                  '& .MuiSelect-select': {
                                    fontSize: '0.95rem'
                                  }
                                }}
                              >
                                {timeOptions.map((time) => (
                                  <MenuItem key={time.value} value={time.value}>
                                    {time.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          {day.key === 'monday' && (
                            <Grid item xs={12} sx={{ mt: 1 }}>
                              <Button
                                size="large"
                                startIcon={<CopyIcon />}
                                onClick={() => copyHoursToAll(day.key)}
                                variant="outlined"
                                fullWidth
                                sx={{
                                  minHeight: 44,
                                  py: 1.25
                                }}
                              >
                                Copy to All Days
                              </Button>
                            </Grid>
                          )}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                          <Chip 
                            label="Closed" 
                            color="default" 
                            variant="outlined" 
                            size="medium"
                          />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    // Desktop Layout - Original grid layout
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body1" sx={{ fontWeight: 500, minWidth: '100px' }}>
                          {day.label}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={dayHours?.isOpen === true}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'isOpen', e.target.checked)}
                              size="small"
                            />
                          }
                          label="Open"
                          sx={{ marginLeft: 0, marginRight: 0 }}
                        />
                      </Grid>
                      
                      {dayHours.isOpen && (
                        <>
                          <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Open Time</InputLabel>
                              <Select
                                value={dayHours.openTime}
                                onChange={(e) => handleBusinessHoursChange(day.key, 'openTime', e.target.value)}
                                label="Open Time"
                              >
                                {timeOptions.map((time) => (
                                  <MenuItem key={time.value} value={time.value}>
                                    {time.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Close Time</InputLabel>
                              <Select
                                value={dayHours.closeTime}
                                onChange={(e) => handleBusinessHoursChange(day.key, 'closeTime', e.target.value)}
                                label="Close Time"
                              >
                                {timeOptions.map((time) => (
                                  <MenuItem key={time.value} value={time.value}>
                                    {time.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          {day.key === 'monday' && (
                            <Grid item xs={6} sm={2}>
                              <Button
                                size="small"
                                startIcon={<CopyIcon />}
                                onClick={() => copyHoursToAll(day.key)}
                                variant="outlined"
                                fullWidth
                              >
                                Copy to All
                              </Button>
                            </Grid>
                          )}
                        </>
                      )}
                      
                      {!dayHours.isOpen && (
                        <Grid item xs={12} sm={8}>
                          <Chip label="Closed" color="default" variant="outlined" />
                        </Grid>
                      )}
                    </Grid>
                  )}
                  
                  {index < daysOfWeek.length - 1 && !isMobile && <Divider sx={{ my: 1 }} />}
                </Box>
              );
            })}
          </Stack>

          {/* Hours Summary */}
          <Box sx={{ 
            mt: isMobile ? 2.5 : 3, 
            p: isMobile ? 2 : 2, 
            backgroundColor: 'background.default', 
            borderRadius: 1 
          }}>
            <Typography 
              variant={isMobile ? "body1" : "subtitle2"} 
              sx={{ 
                fontWeight: 600, 
                mb: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '1.05rem' : undefined
              }}
            >
              Hours Summary
            </Typography>
            <Grid container spacing={isMobile ? 1.5 : 2}>
              {daysOfWeek.map((day) => {
                const dayHours = businessHours[day.key];
                const displayHours = dayHours?.closed ? 'Closed' : 
                  dayHours ? `${formatTimeDisplay(dayHours.openTime)} - ${formatTimeDisplay(dayHours.closeTime)}` : 
                  'Not Set';
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={day.key}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                    >
                      {day.label}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body2" : "body2"} 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: isMobile ? '0.9rem' : undefined,
                        lineHeight: isMobile ? 1.3 : undefined
                      }}
                    >
                      {displayHours}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BusinessHoursSection;