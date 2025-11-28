import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import { businessService } from '../../services/serviceSelector';
import { useSnackbar } from 'notistack';
import { CloudUpload } from '@mui/icons-material';

interface BusinessImageUploadStepProps {
  businessData: {
    id?: number; 
    logoUrl?: string;
    logo?: string;
    logo_url?: string;
  };
  updateBusinessData: (data: {
    logoFile?: File | null;
    logoUrl?: string;
    logo?: string | undefined;
    logo_url?: string | undefined;
  }) => void;
}

/**
 * BusinessImageUploadStep component
 * 
 * This component handles the upload of business logo image
 * as part of the business profile wizard/onboarding flow.
 */
const BusinessImageUploadStep: React.FC<BusinessImageUploadStepProps> = ({ 
  businessData, 
  updateBusinessData 
}) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(businessData.logoUrl || businessData.logo || businessData.logo_url || null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setPreviewUrl(businessData.logoUrl || businessData.logo || businessData.logo_url || null);
  }, [businessData.logoUrl, businessData.logo, businessData.logo_url]);

  // Validate file before upload
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.' 
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        message: 'File is too large. Maximum size is 5MB.' 
      };
    }

    return { valid: true };
  };

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for AVIF format early
    if (file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif')) {
      setUploadError('AVIF format is not supported. If you\'re unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format');
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      enqueueSnackbar(validation.message, { variant: 'error' });
      // Clear the input if invalid
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    // Generate preview URL using createObjectURL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Update parent state with the File object and the preview URL
    updateBusinessData({
      logoFile: file, // Store the actual File object
      logoUrl: objectUrl, // Store the preview URL for display
      logo: undefined, // Clear potentially stale direct URLs
      logo_url: undefined
    });

    console.log('[BusinessImageUploadStep] Logo file selected, initiating background upload...');
    // Automatically attempt to upload the logo in the background
    handleLogoUpload(file); // Pass file only

    // Cleanup the object URL when the component unmounts or file changes
    // This is important to prevent memory leaks
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Upload logo directly when selected
  const handleLogoUpload = async (file: File) => { // Remove previewUrlFallback parameter
    setUploadingLogo(true);
    setUploadError(null); // Clear any previous errors
    
    try {
      // Check if we have a business ID to associate the upload with
      if (businessData.id) {
        const businessIdStr = String(businessData.id);
        
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`[BusinessImageUploadStep] Attempting API logo upload for business ID: ${businessIdStr}`);
        }
        
        // Add error handling for file size
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size exceeds 5MB limit. Please choose a smaller image.');
        }
        
        // Upload logo with just businessId and file
        const response = await businessService.uploadBusinessLogo(businessIdStr, file);

        if (response.success && response.data) {
          // Extract final logo URL from response, checking multiple possible fields
          let finalLogoUrl = '';
          if ('logoUrl' in response.data && typeof response.data.logoUrl === 'string') {
            finalLogoUrl = response.data.logoUrl;
          } else if ('logo_url' in response.data && typeof response.data.logo_url === 'string') {
            finalLogoUrl = response.data.logo_url;
          } else if ('logo' in response.data && typeof response.data.logo === 'string') {
            finalLogoUrl = response.data.logo;
          }

          if (finalLogoUrl) {
            console.log('[BusinessImageUploadStep] API Upload successful. Updating with final URL:', finalLogoUrl);
            // Update business data with the final logo URL from the API
            updateBusinessData({
              logoFile: file, // Keep the file object
              logo: finalLogoUrl,
              logo_url: finalLogoUrl,
              logoUrl: finalLogoUrl // Update preview URL as well if needed
            });
            // Update local preview state as well
            setPreviewUrl(finalLogoUrl);
            enqueueSnackbar('Logo uploaded successfully!', { variant: 'success' });
          } else {
            // If API succeeded but no URL found in response, warn and keep using preview
            console.warn('[BusinessImageUploadStep] API Upload succeeded but no logo URL found in response. Using local preview.');
            // State already updated with preview in handleLogoChange
            enqueueSnackbar('Logo upload complete (using local preview).', { variant: 'info' });
          }
        } else {
          // API call failed, keep using the local preview URL
          if (process.env.NODE_ENV === 'development') {
            console.error('[BusinessImageUploadStep] API logo upload failed:', response.error);
          }
          
          // Set the error message for display
          setUploadError(response.error || 'Unknown error');
          
          // Format a user-friendly error message
          let errorMessage = response.error || 'Unknown error';
          
          // Check for specific error types and provide helpful guidance
          if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Server connection issue. Please check your network and try again.';
          } else if (errorMessage.includes('Invalid upload URL')) {
            errorMessage = 'Configuration issue with the upload service. Please contact support.';
          }
          
          // State already updated with preview in handleLogoChange
          enqueueSnackbar(`Logo saved locally (Upload failed: ${errorMessage})`, { variant: 'warning' });
        }
      } else {
        // No business ID yet (e.g., during initial profile creation before first save)
        // Keep using the local preview URL. The file is stored in businessData.logoFile
        console.log('[BusinessImageUploadStep] No business ID yet. Logo stored locally for later upload.');
        // State already updated with preview in handleLogoChange
        enqueueSnackbar('Logo saved locally', { variant: 'info' });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[BusinessImageUploadStep] Error during logo upload:', error);
      }
      
      // Format a user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Set the error message for display
      setUploadError(errorMessage);
      
      // State already updated with preview in handleLogoChange
      enqueueSnackbar(`Logo saved locally (Upload error: ${errorMessage})`, { variant: 'warning' });
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Business Logo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload your business logo. This will be displayed on your business profile and in search results.
      </Typography>
      
      {/* Display error message if upload failed */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Upload Error</AlertTitle>
          {uploadError}
          {uploadError.includes('ERR_NAME_NOT_RESOLVED') && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              This may be due to an API URL configuration issue. Please contact support or check your network connection.
            </Typography>
          )}
          {(uploadError.includes('format') || uploadError.includes('AVIF')) && !uploadError.includes('picflow.com') && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              If you're unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Logo Upload - Now centered and full width */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Business Logo</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px dashed grey', padding: 2, borderRadius: 1 }}>
            {previewUrl && (
              <img 
                src={previewUrl} // Use state variable for preview
                alt="Business Logo Preview" 
                style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '16px' }} 
              />
            )}
            <Button
              variant="contained"
              component="label"
              disabled={uploadingLogo}
              startIcon={uploadingLogo ? <CircularProgress size={20} /> : <CloudUpload />}
            >
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              <input type="file" hidden onChange={handleLogoChange} accept="image/jpeg,image/png,image/gif" />
            </Button>
            <Typography variant="caption" sx={{ mt: 1 }}>Max 5MB (JPG, PNG, GIF)</Typography>
            {previewUrl && (
              <Button 
                size="small" 
                color="error" 
                onClick={() => {
                  // Remove logo with explicit null assignment rather than undefined
                  console.log('[BusinessImageUploadStep] Removing logo...');
                  updateBusinessData({ 
                    logoFile: null, 
                    logoUrl: '', // Clear preview URL
                    logo: '', 
                    logo_url: '' 
                  });
                  setPreviewUrl(null); // Clear local preview state
                  enqueueSnackbar('Logo removed', { variant: 'info' });
                }} 
                sx={{ mt: 1 }}
                disabled={uploadingLogo}
              >
                Remove Logo
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessImageUploadStep;
