import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Tooltip,
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Pinterest as PinterestIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { businessService } from '../../../services/serviceSelector';
import { useSnackbar } from 'notistack';

interface BusinessSocialMediaSectionProps {
  businessData: any;
  onBusinessDataUpdate: (data: any) => void;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
}

const BusinessSocialMediaSection: React.FC<BusinessSocialMediaSectionProps> = ({
  businessData,
  onBusinessDataUpdate,
  onProfileItemUpdate,
}) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [socialData, setSocialData] = useState({
    instagram_url: businessData.instagram_url || businessData.instagramUrl || '',
    facebook_url: businessData.facebook_url || businessData.facebookUrl || '',
    tiktok_url: businessData.tiktok_url || businessData.tiktokUrl || '',
    linkedin_url: businessData.linkedin_url || businessData.linkedinUrl || '',
    twitter_url: businessData.twitter_url || businessData.twitterUrl || '',
    pinterest_url: businessData.pinterest_url || businessData.pinterestUrl || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldHelpers, setFieldHelpers] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSocialData, setInitialSocialData] = useState(socialData);

  // Update state when businessData changes (for async loading)
  useEffect(() => {
    if (businessData) {
      const newData = {
        instagram_url: businessData.instagram_url || businessData.instagramUrl || '',
        facebook_url: businessData.facebook_url || businessData.facebookUrl || '',
        tiktok_url: businessData.tiktok_url || businessData.tiktokUrl || '',
        linkedin_url: businessData.linkedin_url || businessData.linkedinUrl || '',
        twitter_url: businessData.twitter_url || businessData.twitterUrl || '',
        pinterest_url: businessData.pinterest_url || businessData.pinterestUrl || '',
      };
      setSocialData(newData);
      setInitialSocialData(newData);
      setHasChanges(false);
    }
  }, [businessData]);

  // Detect changes in form data
  useEffect(() => {
    const hasFormChanges = JSON.stringify(socialData) !== JSON.stringify(initialSocialData);
    setHasChanges(hasFormChanges);
  }, [socialData, initialSocialData]);

  const socialPlatforms = [
    {
      key: 'instagram_url',
      label: 'Instagram',
      icon: <InstagramIcon sx={{ fontSize: 24 }} />,
      placeholder: 'https://instagram.com/yourbusiness',
      color: '#E4405F',
      prefix: 'instagram.com/',
    },
    {
      key: 'facebook_url',
      label: 'Facebook',
      icon: <FacebookIcon sx={{ fontSize: 24 }} />,
      placeholder: 'https://facebook.com/yourbusiness',
      color: '#1877F2',
      prefix: 'facebook.com/',
    },
    {
      key: 'tiktok_url',
      label: 'TikTok',
      icon: (
        <Box component="span" sx={{ fontWeight: 900, fontSize: '24px', lineHeight: 1 }}>
          T
        </Box>
      ),
      placeholder: 'https://tiktok.com/@yourbusiness',
      color: '#000000',
      prefix: 'tiktok.com/@',
    },
    {
      key: 'linkedin_url',
      label: 'LinkedIn',
      icon: <LinkedInIcon sx={{ fontSize: 24 }} />,
      placeholder: 'https://linkedin.com/company/yourbusiness',
      color: '#0A66C2',
      prefix: 'linkedin.com/',
    },
    {
      key: 'twitter_url',
      label: 'X (Twitter)',
      icon: <TwitterIcon sx={{ fontSize: 24 }} />,
      placeholder: 'https://x.com/yourbusiness',
      color: '#000000',
      prefix: 'x.com/',
    },
    {
      key: 'pinterest_url',
      label: 'Pinterest',
      icon: <PinterestIcon sx={{ fontSize: 24 }} />,
      placeholder: 'https://pinterest.com/yourbusiness',
      color: '#E60023',
      prefix: 'pinterest.com/',
    },
  ];

  const validateUrl = (field: string, value: string) => {
    // Clear validation for empty values
    if (!value || value.trim() === '') {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      setFieldHelpers(prev => ({ ...prev, [field]: '' }));
      return;
    }

    const trimmedValue = value.trim();
    
    // Check for missing protocol
    if (!trimmedValue.includes('://')) {
      setFieldErrors(prev => ({ ...prev, [field]: 'URL must start with https://' }));
      setFieldHelpers(prev => ({ 
        ...prev, 
        [field]: `Tip: Try adding https:// at the beginning` 
      }));
      return;
    }

    // Check for http instead of https
    if (trimmedValue.startsWith('http://')) {
      setFieldErrors(prev => ({ ...prev, [field]: 'Please use https:// for security' }));
      setFieldHelpers(prev => ({ 
        ...prev, 
        [field]: `Change http:// to https://` 
      }));
      return;
    }

    // Clear errors if valid
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setFieldHelpers(prev => ({ ...prev, [field]: '' }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setSocialData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Validate the URL as user types (with debounce effect)
    validateUrl(field, value);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const businessId = user.id || user.businessId;

      const updateResponse = await businessService.updateBusiness(businessId, socialData);
      
      if (updateResponse.success) {
        // Show warnings if URLs were auto-corrected
        if (updateResponse.warnings) {
          Object.entries(updateResponse.warnings).forEach(([field, warning]) => {
            enqueueSnackbar(`${field}: ${warning}`, { variant: 'info' });
          });
        }
        
        enqueueSnackbar('Social media links updated successfully!', { variant: 'success' });
        onBusinessDataUpdate({ ...businessData, ...socialData });
        setInitialSocialData(socialData);
        setHasChanges(false);
        
        // Update profile completion
        const hasSocialMedia = !!(
          socialData.instagram_url || 
          socialData.facebook_url || 
          socialData.website ||
          socialData.tiktok_url ||
          socialData.linkedin_url ||
          socialData.twitter_url ||
          socialData.pinterest_url
        );
        onProfileItemUpdate('social_media', hasSocialMedia);
        
      } else {
        // Check for validation errors
        if (updateResponse.validationErrors) {
          // Show specific validation errors
          Object.entries(updateResponse.validationErrors).forEach(([field, error]) => {
            enqueueSnackbar(`${field}: ${error}`, { variant: 'error' });
          });
        } else {
          enqueueSnackbar(updateResponse.error || 'Failed to update social media links', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error saving social media data:', error);
      enqueueSnackbar('Error saving social media links', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    enqueueSnackbar('Copied to clipboard!', { variant: 'info' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const extractUsername = (url: string, platform: string) => {
    if (!url) return '';
    
    try {
      if (platform === 'instagram_url') {
        const match = url.match(/instagram\.com\/([^\/\?]+)/);
        return match ? `@${match[1]}` : '';
      } else if (platform === 'facebook_url') {
        const match = url.match(/facebook\.com\/([^\/\?]+)/);
        return match ? match[1] : '';
      } else if (platform === 'tiktok_url') {
        const match = url.match(/tiktok\.com\/@([^\/\?]+)/);
        return match ? `@${match[1]}` : '';
      } else if (platform === 'linkedin_url') {
        const match = url.match(/linkedin\.com\/company\/([^\/\?]+)/);
        return match ? match[1] : '';
      } else if (platform === 'twitter_url') {
        const match = url.match(/(?:twitter|x)\.com\/([^\/\?]+)/);
        return match ? `@${match[1]}` : '';
      } else if (platform === 'pinterest_url') {
        const match = url.match(/pinterest\.com\/([^\/\?]+)/);
        return match ? `@${match[1]}` : '';
      }
    } catch (e) {
      return '';
    }
    
    return '';
  };

  const getConnectedPlatforms = () => {
    return socialPlatforms.filter(platform => socialData[platform.key]).length;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 1,
              }}
            >
              Photo Gallery
            </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isSmallMobile ? 'column' : 'row',
          alignItems: isSmallMobile ? 'flex-start' : 'center', 
          gap: isSmallMobile ? 1 : 2 
        }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              Manage your business photos and showcase your products, services, and location
            </Typography>
        </Box>
      </Box>

      <Stack spacing={2}>
        {socialPlatforms.map((platform) => {
          const username = extractUsername(socialData[platform.key], platform.key);
          const isConnected = !!socialData[platform.key];

          return (
            <Card
              key={platform.key}
              sx={{
                boxShadow: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                width: '100%'
              }}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Header with Icon and Connected Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Icon */}
                        <Box sx={{ 
                          color: platform.color,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {platform.key === 'tiktok_url' ? (
                            <Box 
                              component="span" 
                              sx={{ 
                                fontWeight: 900, 
                                fontSize: '24px', 
                                lineHeight: 1 
                              }}
                            >
                              T
                            </Box>
                          ) : (
                            React.cloneElement(platform.icon as React.ReactElement, {
                              sx: { fontSize: 24 }
                            })
                          )}
                        </Box>
                        
                        {/* Platform Name */}
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}
                        >
                          {platform.label}
                        </Typography>
                      </Box>
                      
                      {isConnected && (
                        <Chip 
                          label="Connected" 
                          size="small" 
                          color="success"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Text Field with Label */}
                    <Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          mb: 0.5, 
                          display: 'block',
                          fontSize: '0.75rem'
                        }}
                      >
                        {platform.label} URL
                      </Typography>
                      <TextField
                        fullWidth
                        value={socialData[platform.key]}
                        onChange={(e) => handleFieldChange(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        variant="outlined"
                        size="small"
                        error={!!fieldErrors[platform.key]}
                        helperText={fieldErrors[platform.key] || fieldHelpers[platform.key]}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                            backgroundColor: isConnected && !fieldErrors[platform.key] ? `${platform.color}05` : 'transparent',
                          },
                          '& .MuiInputBase-input': {
                            padding: '8.5px 14px',
                          },
                          '& .MuiFormHelperText-root': {
                            marginLeft: 0,
                            fontSize: '0.75rem',
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ ml: -0.5, mr: -0.5 }}>
                              <Box sx={{ 
                                color: platform.color,
                                display: 'flex',
                                alignItems: 'center',
                                opacity: 0.7
                              }}>
                                {platform.key === 'tiktok_url' ? (
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      fontWeight: 900, 
                                      fontSize: '16px', 
                                      lineHeight: 1 
                                    }}
                                  >
                                    T
                                  </Box>
                                ) : (
                                  React.cloneElement(platform.icon as React.ReactElement, {
                                    sx: { fontSize: 16 }
                                  })
                                )}
                              </Box>
                            </InputAdornment>
                          ),
                          endAdornment: socialData[platform.key] && (
                            <InputAdornment position="end">
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Copy URL">
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(socialData[platform.key], platform.key)}
                                    sx={{ padding: '4px' }}
                                  >
                                    {copiedField === platform.key ? (
                                      <CheckIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                      <CopyIcon sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Visit page">
                                  <IconButton
                                    size="small"
                                    component={Link}
                                    href={socialData[platform.key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ padding: '4px' }}
                                  >
                                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {username && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            display: 'block',
                            color: platform.color,
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        >
                          {username}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Floating Save Button - appears when there are changes */}
      {hasChanges && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80, // 80px to clear bottom nav (49px) + safe margin on mobile
            right: 32,
            zIndex: 1000,
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.24)',
            borderRadius: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 1.5,
              minWidth: 150,
            }}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BusinessSocialMediaSection;