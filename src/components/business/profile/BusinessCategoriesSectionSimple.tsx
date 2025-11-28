import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Autocomplete,
  Checkbox,
  FormControl,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { DEFAULT_BUSINESS_CATEGORIES } from '../../../utils/defaultCategories';
import { StyledTextField } from '../../common/StyledFormComponents';
import CategorySelectorModal from './CategorySelectorModal';

interface BusinessCategoriesSectionSimpleProps {
  businessData: any;
  locationId?: string | null;
  onProfileItemUpdate?: (itemId: string, completed: boolean) => void;
  readOnly?: boolean;
}

const BusinessCategoriesSectionSimple: React.FC<BusinessCategoriesSectionSimpleProps> = ({
  businessData,
  locationId,
  onProfileItemUpdate,
  readOnly = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Load categories from database (4000+ categories)
  const categoriesFromDB = useQuery(api.businessCategories.getPrimaryCategories, {});
  
  // Mutations
  const updateLocation = useMutation(api.businessLocations.updateLocation);
  
  // Get location-specific data
  const locationData = useQuery(
    api.businessLocations.getLocationById,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );

  // Local state for form fields
  const [formData, setFormData] = useState({
    primaryCategory: '',
    additionalCategories: [] as string[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'primary' | 'additional'>('additional');

  // Helper to get category from location data
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

  // Update form data when location data changes
  useEffect(() => {
    if (locationData) {
      const newFormData = {
        primaryCategory: getCategoryFromLocationData(locationData),
        additionalCategories: locationData.categories || [],
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setHasChanges(false);
    }
  }, [locationData]);

  // Detect changes in form data
  useEffect(() => {
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasChanges(hasFormChanges);
  }, [formData, initialFormData]);

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

  // Handle field changes
  const handlePrimaryCategoryChange = (value: string | null) => {
    setFormData(prev => ({ ...prev, primaryCategory: value || '' }));
  };

  const handleAdditionalCategoriesChange = (values: string[]) => {
    setFormData(prev => ({ ...prev, additionalCategories: values }));
  };

  const handleModalSelectionChange = (categories: string[], primary?: string) => {
    if (modalMode === 'primary') {
      // For primary category mode, categories array should have exactly 1 item
      setFormData(prev => ({
        ...prev,
        primaryCategory: primary || (categories.length > 0 ? categories[0] : ''),
      }));
    } else {
      // For additional categories mode
      setFormData(prev => ({ ...prev, additionalCategories: categories }));
    }
  };

  const openPrimaryCategoryModal = () => {
    setModalMode('primary');
    setModalOpen(true);
  };

  const openAdditionalCategoriesModal = () => {
    setModalMode('additional');
    setModalOpen(true);
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!locationId || readOnly) return;

    setIsSaving(true);
    try {
      await updateLocation({
        locationId: locationId as Id<"business_locations">,
        category: formData.primaryCategory,
        categories: formData.additionalCategories,
      });
      
      enqueueSnackbar('Categories saved successfully', { variant: 'success' });
      setInitialFormData(formData);
      setHasChanges(false);
      
      // Update profile completion
      if (onProfileItemUpdate) {
        onProfileItemUpdate('categories', !!formData.primaryCategory);
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      enqueueSnackbar('Failed to save categories', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state if no location is selected
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
      {/* Single Card Layout - Left Aligned */}
      <Card
        sx={{
          maxWidth: { xs: '100%', md: '600px' },
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={4}>
          {/* Primary Category Section */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Primary Category
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Choose the main category that best describes your business
            </Typography>

            {/* Display selected primary category */}
            {formData.primaryCategory ? (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={formData.primaryCategory}
                  color="primary"
                  onDelete={!readOnly ? () => setFormData(prev => ({ ...prev, primaryCategory: '' })) : undefined}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                No primary category selected
              </Typography>
            )}

            <Button
              variant="outlined"
              onClick={openPrimaryCategoryModal}
              disabled={readOnly}
              fullWidth
              sx={{
                textTransform: 'none',
                py: 1.5,
              }}
            >
              {formData.primaryCategory ? 'Change primary category' : 'Select primary category'}
            </Button>
          </Box>

          {/* Additional Categories Section */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Additional Categories
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Select any other categories that apply to your business
            </Typography>

            {/* Display selected additional categories */}
            {formData.additionalCategories && formData.additionalCategories.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {formData.additionalCategories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onDelete={!readOnly ? () => {
                        setFormData(prev => ({
                          ...prev,
                          additionalCategories: prev.additionalCategories.filter(c => c !== category)
                        }));
                      } : undefined}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                No additional categories selected
              </Typography>
            )}

            <Button
              variant="outlined"
              startIcon={<ViewListIcon />}
              onClick={openAdditionalCategoriesModal}
              disabled={readOnly}
              fullWidth
              sx={{
                textTransform: 'none',
                py: 1.5,
              }}
            >
              Manage additional categories ({getAllCategoryOptions().length} available)
            </Button>
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

      {/* Category Selector Modal */}
      <CategorySelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCategories={modalMode === 'primary' ? (formData.primaryCategory ? [formData.primaryCategory] : []) : formData.additionalCategories}
        onSelectionChange={handleModalSelectionChange}
        allCategories={getAllCategoryOptions()}
        primaryCategory={formData.primaryCategory}
        mode={modalMode}
        singleSelection={modalMode === 'primary'}
      />
    </Box>
  );
};

export default BusinessCategoriesSectionSimple;