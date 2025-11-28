import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Bell, Apple } from 'lucide-react';
import { useFeatureFlagPayload } from 'posthog-js/react';

// Default heading text (fallback if PostHog flag not loaded)
const DEFAULT_HEADING = "Jacksonville's Local Savings and Events App";

interface H1Payload {
  heading?: string;
}

export const HeroSection: React.FC = () => {
  // Get heading from PostHog feature flag payload - editable in PostHog dashboard
  const h1Payload = useFeatureFlagPayload('homepage-h1-test') as H1Payload | null;
  const headingText = h1Payload?.heading || DEFAULT_HEADING;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Connect to Convex newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '' });

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        position: 'relative',
        py: { xs: 2, sm: 3, md: 4, lg: 5 },
        bgcolor: '#000',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.2), #000)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: { xs: 'flex', md: 'grid' },
            flexDirection: { xs: 'column', md: 'initial' },
            gridTemplateColumns: { xs: '1fr', md: '40% 60%' },
            gap: { xs: 2, md: 5, lg: 6 },
            alignItems: 'flex-start'
          }}
        >
          {/* Device/GIF - Left 40% */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              order: { xs: 1, md: 1 },
              width: '100%'
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 280, sm: 320, md: 360, lg: 400 },
                mx: { xs: 'auto', md: 0 }
              }}
            >
              <Box
                component="img"
                src="/scrolling.gif"
                alt="JaxSaver App Preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '40px'
                }}
              />
            </Box>
          </Box>

          {/* Headings - Mobile only, between GIF and form */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, order: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.875rem', sm: '2.25rem' },
                fontWeight: 600,
                lineHeight: 1.2
              }}
            >
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  color: '#9CA3AF'
                }}
              >
                Search and Save Local
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  mt: { xs: 0.5, sm: 1 },
                  color: '#FCD34D',
                  fontWeight: 700
                }}
              >
                {headingText}
              </Typography>
            </Typography>
          </Box>

          {/* All Content - Right 60% */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{
              textAlign: 'left',
              order: { xs: 3, md: 2 },
              maxWidth: '100%',
              overflow: 'visible'
            }}
          >
            {/* Headings - Desktop only */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.875rem', sm: '2.25rem', md: '3rem', lg: '3.75rem' },
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem', lg: '1.875rem' },
                    color: '#9CA3AF'
                  }}
                >
                  Search and Save Local
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    mt: { xs: 0.5, sm: 1 },
                    color: '#FCD34D',
                    fontWeight: 700
                  }}
                >
                  {headingText}
                </Typography>
              </Typography>
            </Box>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                mt: { xs: 0, md: 2 },
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: '#9CA3AF',
                lineHeight: 1.6,
                wordBreak: 'break-word'
              }}
            >
              Find exclusive savings, promotions, and events from your local restaurants, shops, services, and entertainment - all in one convenient mobile app. Support local while saving money!
            </Typography>

            {/* Email Notification Form */}
            <Box sx={{ mt: { xs: 3, sm: 4 } }}>
              <Paper
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  p: { xs: 2, sm: 3 },
                  overflow: 'hidden',
                  backdropFilter: 'blur(12px)',
                  background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(31, 41, 55, 0.6) 50%, rgba(31, 41, 55, 0.8) 100%)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  boxShadow: 'none'
                }}
              >
                {isSuccess ? (
                  <Alert
                    severity="success"
                    sx={{
                      textAlign: 'center',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10B981',
                      border: 'none',
                      '& .MuiAlert-icon': {
                        fontSize: 48
                      }
                    }}
                  >
                    Thanks! We'll notify you when the app launches.
                  </Alert>
                ) : (
                  <>
                    {/* Decorative gradient orbs */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 128,
                        height: 128,
                        background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(251, 146, 60, 0.1))',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: -40,
                        width: 128,
                        height: 128,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1))',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                      }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 10 }}>
                      {/* Launch Badge */}
                      <Box
                        component={motion.div}
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(245, 158, 11, 0.7)',
                            '0 0 0 10px rgba(245, 158, 11, 0)',
                            '0 0 0 0 rgba(245, 158, 11, 0.7)'
                          ],
                          scale: [1, 1.03, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.25 },
                          background: 'linear-gradient(to right, #fde68a, #f59e0b)',
                          color: '#000',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          fontWeight: 700,
                          borderRadius: '9999px',
                          mb: 2.5
                        }}
                      >
                        🚀 Launching Fall 2025
                      </Box>

                      {/* App Store Buttons */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            bgcolor: '#000',
                            color: '#fff',
                            borderRadius: 2,
                            border: '1px solid #374151',
                            cursor: 'not-allowed',
                            opacity: 0.7
                          }}
                        >
                          <Apple size={32} />
                          <Box>
                            <Typography sx={{ fontSize: '10px', lineHeight: 1.2 }}>
                              Coming Soon on
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.2 }}>
                              App Store
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            bgcolor: '#000',
                            color: '#fff',
                            borderRadius: 2,
                            border: '1px solid #374151',
                            cursor: 'not-allowed',
                            opacity: 0.7
                          }}
                        >
                          <Box
                            component="svg"
                            sx={{ width: 32, height: 32 }}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '10px', lineHeight: 1.2 }}>
                              Coming Soon on
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.2 }}>
                              Google Play
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Form */}
                      <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600, mb: 2, color: '#FCD34D' }}>
                        Get notified when the app launches!
                      </Typography>

                      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="First name"
                              variant="outlined"
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'rgba(31, 41, 55, 0.8)',
                                  backdropFilter: 'blur(4px)',
                                  '& fieldset': {
                                    borderColor: 'rgba(75, 85, 99, 0.5)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(234, 179, 8, 0.5)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#EAB308',
                                    borderWidth: '2px'
                                  }
                                },
                                '& .MuiOutlinedInput-input': {
                                  color: '#fff',
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  py: { xs: 1.25, sm: 1.5 },
                                  '&::placeholder': {
                                    color: '#9CA3AF',
                                    opacity: 1
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Last name"
                              variant="outlined"
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'rgba(31, 41, 55, 0.8)',
                                  backdropFilter: 'blur(4px)',
                                  '& fieldset': {
                                    borderColor: 'rgba(75, 85, 99, 0.5)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(234, 179, 8, 0.5)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#EAB308',
                                    borderWidth: '2px'
                                  }
                                },
                                '& .MuiOutlinedInput-input': {
                                  color: '#fff',
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  py: { xs: 1.25, sm: 1.5 },
                                  '&::placeholder': {
                                    color: '#9CA3AF',
                                    opacity: 1
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </Grid>

                        <TextField
                          fullWidth
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(31, 41, 55, 0.8)',
                              backdropFilter: 'blur(4px)',
                              '& fieldset': {
                                borderColor: 'rgba(75, 85, 99, 0.5)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(234, 179, 8, 0.5)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#EAB308',
                                borderWidth: '2px'
                              }
                            },
                            '& .MuiOutlinedInput-input': {
                              color: '#fff',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              py: { xs: 1.25, sm: 1.5 },
                              '&::placeholder': {
                                color: '#9CA3AF',
                                opacity: 1
                              }
                            }
                          }}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Bell size={20} />}
                          sx={{
                            bgcolor: '#FCD34D',
                            color: '#000',
                            py: { xs: 1.25, sm: 1.5 },
                            px: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: '#F59E0B'
                            },
                            '&:disabled': {
                              opacity: 0.5,
                              bgcolor: '#FCD34D',
                              color: '#000'
                            }
                          }}
                        >
                          {isSubmitting ? 'Sending...' : 'Notify Me'}
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
