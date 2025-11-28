import React, { useState } from 'react';
import { Box, TextField, Typography, Grid, Autocomplete } from '@mui/material';
import PhoneInput from '../common/PhoneInput';

// US states list for dropdown
const usStates = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

// Define props based on the fields actually used from WizardData
interface BusinessContactStepProps {
  businessData: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
  };
  updateBusinessData: (data: { 
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
  }) => void;
}

const BusinessContactStep: React.FC<BusinessContactStepProps> = ({ businessData, updateBusinessData }) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zipMain, setZipMain] = useState<string>(businessData.zip?.split('-')[0] || '');
  const [zipExt, setZipExt] = useState<string>(businessData.zip?.split('-')[1] || '');
  const validators: Record<string, (val: string) => string> = {
    address: val => val.trim() ? '' : 'Address is required',
    city: val => /^[A-Za-z\s]+$/.test(val) ? '' : 'City must contain only letters',
    state: val => val.trim() ? '' : 'State is required',
    zipMain: val => /^\d{5}$/.test(val) ? '' : 'ZIP must be 5 digits',
    zipExt: val => val === '' || /^\d{4}$/.test(val) ? '' : 'ZIP extension must be 4 digits',
    facebookUrl: val => {
      try {
        const url = new URL(val);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must start with http:// or https://';
        }
      } catch {
        return 'Invalid URL structure.';
      }
      return '';
    },
    instagramUrl: val => {
      try {
        const url = new URL(val);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must start with http:// or https://';
        }
      } catch {
        return 'Invalid URL structure.';
      }
      return '';
    },
    twitterUrl: val => {
      try {
        const url = new URL(val);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must start with http:// or https://';
        }
      } catch {
        return 'Invalid URL structure.';
      }
      return '';
    }
  };
  const handleBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = _e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validators[name](value || '') }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'zipMain') {
      setZipMain(value);
      if (touched.zipMain) setErrors(prev => ({ ...prev, zipMain: validators.zipMain(value) }));
      updateBusinessData({ zip: value + (zipExt ? `-${zipExt}` : '') });
      return;
    }
    if (name === 'zipExt') {
      setZipExt(value);
      if (touched.zipExt) setErrors(prev => ({ ...prev, zipExt: validators.zipExt(value) }));
      updateBusinessData({ zip: zipMain + (value ? `-${value}` : '') });
      return;
    }
    updateBusinessData({ [name]: value });
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Contact Details
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Provide contact information for your business. This will help customers reach you.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            required
            fullWidth
            label="Business Address"
            name="address"
            value={businessData.address || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.address)}
            helperText={touched.address ? errors.address : 'Enter your full business address'}
            variant="outlined"
            autoFocus
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={businessData.city || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.city)}
            helperText={touched.city ? errors.city : ''}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            freeSolo
            options={usStates}
            value={businessData.state || ''}
            onChange={(_e, newValue) => {
              updateBusinessData({ state: newValue || '' });
              if (touched.state) setErrors(prev => ({ ...prev, state: validators.state(newValue || '') }));
            }}
            onInputChange={(_e, newInput) => {
              updateBusinessData({ state: newInput });
              if (touched.state) setErrors(prev => ({ ...prev, state: validators.state(newInput) }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="State"
                name="state"
                variant="outlined"
                error={Boolean(errors.state)}
                helperText={touched.state ? errors.state : ''}
                onBlur={handleBlur}
              />
            )}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zipMain"
            value={zipMain}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.zipMain)}
            helperText={touched.zipMain ? errors.zipMain : ''}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="ZIP Ext (Optional)"
            name="zipExt"
            value={zipExt}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.zipExt)}
            helperText={touched.zipExt ? errors.zipExt : 'Optional 4 digits'}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <PhoneInput
            required
            fullWidth
            label="Phone Number"
            value={businessData.phone || ''}
            onChange={(formatted, normalized, isValid) => {
              updateBusinessData({ phone: formatted });
              if (!isValid && touched.phone) {
                setErrors(prev => ({ ...prev, phone: 'Invalid phone number' }));
              } else {
                setErrors(prev => ({ ...prev, phone: '' }));
              }
            }}
            onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
            error={touched.phone && Boolean(errors.phone)}
            helperText={touched.phone && errors.phone ? errors.phone : 'Enter a business phone number'}
            variant="outlined"
            validateOnBlur
            clearable
          />
        </Grid>
        
        <Grid size={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Social Media (Optional)
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Facebook URL"
            name="facebookUrl"
            value={businessData.facebookUrl || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.facebookUrl)}
            helperText={touched.facebookUrl ? errors.facebookUrl : ''}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Instagram URL"
            name="instagramUrl"
            value={businessData.instagramUrl || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.instagramUrl)}
            helperText={touched.instagramUrl ? errors.instagramUrl : ''}
            variant="outlined"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Twitter/X URL"
            name="twitterUrl"
            value={businessData.twitterUrl || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.twitterUrl)}
            helperText={touched.twitterUrl ? errors.twitterUrl : ''}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessContactStep;
