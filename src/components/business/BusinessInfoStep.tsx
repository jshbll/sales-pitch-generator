import React from 'react';
import { Box, TextField, Typography, Grid, InputAdornment } from '@mui/material';

interface BusinessInfoStepProps {
  businessData: { 
    description?: string;
    website?: string;
  };
  updateBusinessData: (data: { 
    description?: string;
    website?: string;
  }) => void;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ businessData, updateBusinessData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateBusinessData({ [name]: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Business Information
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Tell us about your business. This information will be displayed to potential customers.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Business Description"
            name="description"
            value={businessData.description || ''}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={4}
            helperText="Provide a detailed description of your business, services, and unique selling points"
            autoFocus
          />
        </Grid>
        
        <Grid size={12}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={businessData.website || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="example.com"
            helperText="Optional: Enter your business website URL (without http://)"
            InputProps={{
              startAdornment: <InputAdornment position="start">http://</InputAdornment>
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessInfoStep;
