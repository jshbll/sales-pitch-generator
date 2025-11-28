import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Alert,
  TextField
} from '@mui/material';
import { INDUSTRY_CATEGORIES as industrySubMapping } from "@jaxsaver/shared/constants";

// Define a type for category objects
interface BusinessCategory {
  id: string;
  name: string;
}

interface BusinessCategoryStepProps {
  businessData: {
    category?: string;
    subcategory?: string;
  };
  updateBusinessData: (data: { 
    category?: string;
    subcategory?: string;
  }) => void;
  categories: BusinessCategory[];
  triedNext?: boolean;
}

const BusinessCategoryStep: React.FC<BusinessCategoryStepProps> = ({
  businessData,
  updateBusinessData,
  categories,
  triedNext = false
}) => {
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    updateBusinessData({ 
      category: event.target.value,
      subcategory: '' 
    });
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string>) => {
    updateBusinessData({ subcategory: event.target.value });
  };

  const subOptions = businessData.category ? industrySubMapping[businessData.category] || [] : [];
  const hasCategoryError = triedNext && !businessData.category;

  // DEBUG: Log categories prop right before rendering
  console.log('[BusinessCategoryStep] Categories prop:', categories, 'Type:', typeof categories, 'IsArray:', Array.isArray(categories));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Business Category
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Please select your primary category. This cannot be changed later.
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>The selected category cannot be updated later.</Alert>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth error={hasCategoryError}>
            <InputLabel id="category-select-label">Category *</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={businessData.category || ''}
              onChange={handleCategoryChange}
              label="Category *"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
              {!categories.some(cat => cat.name === 'Other') && (
                <MenuItem key="other-static" value="Other">Other</MenuItem>
              )}
            </Select>
            {hasCategoryError && <Typography color="error" variant="caption">Category is required.</Typography>}

            {businessData.category === 'Other' && (
              <>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Selecting 'Other' requires approval and may delay advertisements.
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Specify Your Category *"
                    value={businessData.subcategory || ''}
                    onChange={(e) => updateBusinessData({ subcategory: e.target.value })}
                    helperText="Enter your custom category for approval"
                    variant="outlined"
                    error={triedNext && businessData.category === 'Other' && !businessData.subcategory}
                    required
                  />
                  {triedNext && businessData.category === 'Other' && !businessData.subcategory && (
                    <Typography color="error" variant="caption">Please specify your category.</Typography>
                  )}
                </Box>
              </>
            )}
            {subOptions.length > 0 && businessData.category !== 'Other' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Subcategory</Typography>
                <FormControl fullWidth>
                  <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
                  <Select
                    labelId="subcategory-select-label"
                    id="subcategory-select"
                    value={businessData.subcategory || ''}
                    onChange={handleSubcategoryChange}
                    label="Subcategory"
                  >
                    {subOptions.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessCategoryStep;
