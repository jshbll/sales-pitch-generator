import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';

interface BusinessSocialMediaStepProps {
  businessData: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    snapchatUrl?: string;
    website?: string;
  };
  updateBusinessData: (data: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    snapchatUrl?: string;
    website?: string;
  }) => void;
}

const BusinessSocialMediaStep: React.FC<BusinessSocialMediaStepProps> = ({ 
  businessData,
  updateBusinessData
}) => {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateBusinessData({ [name]: value });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Social Media Links (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your social profiles to help customers find you.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Facebook URL"
            name="facebookUrl"
            value={businessData.facebookUrl || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.facebookUrl }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Instagram URL"
            name="instagramUrl"
            value={businessData.instagramUrl || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.instagramUrl }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Twitter (X) URL"
            name="twitterUrl"
            value={businessData.twitterUrl || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.twitterUrl }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="LinkedIn URL"
            name="linkedinUrl"
            value={businessData.linkedinUrl || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.linkedinUrl }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Snapchat URL"
            name="snapchatUrl"
            value={businessData.snapchatUrl || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.snapchatUrl }}
          />
        </Grid>
        {/* Add website field here as well for consistency? */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Website URL"
            name="website"
            value={businessData.website || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: !!businessData.website }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessSocialMediaStep;
