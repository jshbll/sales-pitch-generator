import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Stack,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Checkbox,
} from '@mui/material';
import {
  Category as CategoryIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { DEFAULT_BUSINESS_CATEGORIES } from '../../../utils/defaultCategories';
import FloatingActionBar from './FloatingActionBar';
import useAutoSave from '../../../hooks/useAutoSave';
import '../../../styles/profileStyles.css';

interface BusinessCategoriesSectionProps {
  businessData: any;
  onBusinessDataUpdate: (data: any) => void;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
    locationId?: string | null;
}

const BusinessCategoriesSection: React.FC<BusinessCategoriesSectionProps> = ({
  businessData,
  onBusinessDataUpdate,
  onProfileItemUpdate,
  locationId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Load categories from database (4000+ categories)
  const categoriesFromDB = useQuery(api.businessCategories.getPrimaryCategories, {});
  
  // Convex mutation
  const updateLocation = useMutation(api.businessLocations.updateLocation);
  
  // Get location-specific data
  const locationData = useQuery(
    api.businessLocations.getLocationById,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );

  // Map category from location data
  const getCategoryFromLocationData = (locationData: any) => {
    if (!locationData) return '';
    // When using database categories, we store names directly
    if (locationData.category) {
      return locationData.category;
    }
    // Check if we have categories array (primary)
    if (locationData.categories && locationData.categories.length > 0) {
      return locationData.categories[0];
    }
    return '';
  };

  const initialCategoryId = getCategoryFromLocationData(locationData);

  const [localData, setLocalData] = useState({
    category: initialCategoryId || '',
    additionalCategories: locationData?.categories || [],
  });

  // Update local data when location data changes
  useEffect(() => {
    if (locationData) {
      setLocalData({
        category: getCategoryFromLocationData(locationData),
        additionalCategories: locationData.categories || [],
      });
    }
  }, [locationData]);

  // Auto-save hook
  const autoSave = useAutoSave({
    delay: 2000,
    onSave: async (changes) => {
      try {
        if (!locationId) return false;

        await updateLocation({
          locationId: locationId as Id<"business_locations">,
          ...changes,
        });
        
        // Update profile completion
        const hasCategory = !!(changes.category || localData.category);
        onProfileItemUpdate('categories', hasCategory);
        
        return true;
      } catch (error) {
        console.error('Error saving categories:', error);
        return false;
      }
    },
    showNotifications: true,
  });

  const handleFieldSave = useCallback(async (fieldName: string, value: any) => {
    setLocalData(prev => ({ ...prev, [fieldName]: value }));
    autoSave.trackChange(fieldName, value);
    return true;
  }, [autoSave]);

    
  // Get all category options
  const getAllCategoryOptions = () => {
    // Use database categories if available (4000+ options), otherwise fall back to defaults
    if (categoriesFromDB && categoriesFromDB.length > 0) {
      return categoriesFromDB.map(cat => cat.name).sort();
    }
    
    // Fallback to default categories
    const options: string[] = [];
    DEFAULT_BUSINESS_CATEGORIES.forEach(cat => {
      options.push(cat.name);
      if (cat.subcategories) {
        cat.subcategories.forEach(subcat => {
          options.push(subcat.name);
        });
      }
    });
    return [...new Set(options)].sort();
  };

  // Show loading state if no location is selected or data is loading
  if (!locationId || locationData === undefined) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          {!locationId ? 'Select a location to manage categories' : 'Loading categories...'}
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
          {locationData?.name || 'Location'} - Business Location Categories
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 0.5 }}
        >
          Select categories that best describe your business to help customers find you
        </Typography>
      </Box>

      {/* Categories Cards - Horizontal Layout */}
      <Box sx={{ 
        display: 'flex', 
        gap: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        width: '100%'
      }}>
        {/* Primary Category Card */}
        <Card 
            sx={{
            boxShadow: 'none',
            flex: 1,
            minWidth: 0,
            overflow: 'visible',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              boxShadow: 4,
              borderColor: 'primary.main',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2
            }}>
              <CategoryIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                Primary Location Category
              </Typography>
              <Chip 
                label="Required" 
                size="small" 
                color="error" 
                sx={{ 
                  height: 20,
                  '& .MuiChip-label': { 
                    px: 1, 
                    fontSize: '0.7rem',
                    fontWeight: 700 
                  }
                }}
              />
            </Box>
            
            <Autocomplete
              value={localData.category || null}
              onChange={(event, newValue) => {
                setLocalData(prev => ({ ...prev, category: newValue || '' }));
                autoSave.trackChange('category', newValue || '');
              }}
              options={getAllCategoryOptions()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search and select a category..."
                  helperText="Choose the main category that best describes your business"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'background.paper',
                      }
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': {
                  color: 'primary.main',
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: 'text.secondary',
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Additional Categories Card */}
        <Card 
            sx={{
            boxShadow: 'none',
            flex: 1,
            minWidth: 0,
            overflow: 'visible',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              boxShadow: 4,
              borderColor: 'primary.main',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 2
            }}>
              <CategoryIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                Additional Categories
              </Typography>
              <Chip 
                label="Optional" 
                size="small" 
                color="info" 
                sx={{ 
                  height: 20,
                  '& .MuiChip-label': { 
                    px: 1, 
                    fontSize: '0.7rem',
                    fontWeight: 700 
                  }
                }}
              />
            </Box>
            
            <Autocomplete
              multiple
              options={getAllCategoryOptions()}
              value={localData.additionalCategories || []}
              onChange={(event, newValue) => {
                setLocalData(prev => ({ ...prev, additionalCategories: newValue }));
                autoSave.trackChange('categories', newValue);
              }}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search and select categories..."
                  helperText="Select any other categories that apply to your business"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'background.paper',
                      }
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': {
                  color: 'primary.main',
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: 'text.secondary',
                }
              }}
            />

            {localData.additionalCategories && localData.additionalCategories.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Selected Categories ({localData.additionalCategories.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {localData.additionalCategories.map((cat, index) => (
                    <Chip
                      key={index}
                      label={cat}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onDelete={() => {
                        const newCategories = localData.additionalCategories.filter((_, i) => i !== index);
                        setLocalData(prev => ({ ...prev, additionalCategories: newCategories }));
                        autoSave.trackChange('categories', newCategories);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Bar */}
      <FloatingActionBar autoSave={autoSave} />
    </Box>
  );
};

export default BusinessCategoriesSection;