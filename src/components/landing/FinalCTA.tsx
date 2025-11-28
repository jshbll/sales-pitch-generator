import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useClerk, useAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { ArrowRight, Phone } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  // Query subscription to determine button state
  const directSubscription = useQuery(api.clerkBilling.getCurrentSubscription);
  const hasActiveSubscription = directSubscription?.hasSubscription &&
    (directSubscription?.status === 'active' || directSubscription?.status === 'trialing');

  const handleGetStarted = () => {
    if (isSignedIn && hasActiveSubscription) {
      navigate('/business/dashboard');
    } else {
      // Go to pricing page - users will sign up from there
      navigate('/pricing');
    }
  };

  // Determine button text
  const buttonText = isSignedIn
    ? (hasActiveSubscription ? 'Dashboard' : 'Complete Signup')
    : 'Get Started Free';

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 12, md: 16 },
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Enhanced Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(252, 211, 77, 0.15) 0%, rgba(245, 158, 11, 0.05) 40%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Bordered card wrapper */}
        <Box
          sx={{
            border: (theme) => `2px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 10, 10, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
              }
            }
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 3,
              lineHeight: 1.2
            }}
          >
            Start Reaching{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Local Customers Today
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: 'text.secondary',
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Join local businesses using JaxSaver to grow their customer base.
            Start your 7-day free trial—no credit card required.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              onClick={handleGetStarted}
              sx={{
                background: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#000',
                color: (theme) => theme.palette.mode === 'dark' ? '#000' : '#FFFFFF',
                px: 5,
                py: 2,
                fontSize: '1.125rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                minWidth: 200,
                position: 'relative',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 10px 30px rgba(255, 255, 255, 0.3)'
                  : '0 10px 30px rgba(0, 0, 0, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: '0 10px 30px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'
                  },
                  '50%': {
                    boxShadow: '0 10px 30px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
                  }
                },
                '&:hover': {
                  background: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#000',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 50px rgba(251, 191, 36, 0.7), 0 0 80px rgba(251, 191, 36, 0.5)',
                  animation: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {buttonText}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Phone />}
              onClick={() => navigate('/contact')}
              sx={{
                borderColor: 'text.primary',
                color: 'text.primary',
                px: 5,
                py: 2,
                fontSize: '1.125rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                minWidth: 200,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#fbbf24',
                  color: '#fbbf24',
                  bgcolor: 'rgba(251, 191, 36, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Contact Sales
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 4,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Questions? Email us at{' '}
            <Box
              component="a"
              href="mailto:info@jaxsaver.com"
              sx={{
                color: '#FCD34D',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              info@jaxsaver.com
            </Box>
          </Typography>
        </Box>
        </Box>
      </Container>
    </Box>
  );
};
