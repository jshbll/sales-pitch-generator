import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button } from '@mui/material';
import { useClerk, useAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../../convex/_generated/api';
import DashboardImage from '../../assets/Dashboard.png';

export const BusinessHero: React.FC = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

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

  const handlePricing = () => {
    navigate('/pricing');
  };

  // Determine button text
  const buttonText = isSignedIn
    ? (hasActiveSubscription ? 'Dashboard' : 'Complete Signup')
    : 'Get started';

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      sx={{
        pt: { xs: 16, sm: 20, md: 24 },
        pb: { xs: 8, md: 12 },
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        {/* Centered Content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{
            textAlign: 'center',
            mb: { xs: 6, md: 8 }
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: { xs: 2, md: 3 },
              lineHeight: 1.1
            }}
          >
            Magically simplify{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              local marketing
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              color: 'text.secondary',
              mb: { xs: 4, md: 5 },
              lineHeight: 1.7,
              maxWidth: '540px',
              mx: 'auto'
            }}
          >
            Automated marketing, effortless AI-assisted builder, real-time insights. Set up in 5 mins. Back to running your business.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: '#fbbf24',
                color: '#000',
                px: { xs: 3, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: '0.9375rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#f59e0b',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {buttonText}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handlePricing}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                px: { xs: 3, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: '0.9375rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#fbbf24',
                  bgcolor: 'rgba(251, 191, 36, 0.04)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Pricing
            </Button>
          </Box>

        </Box>
      </Container>

      {/* Dashboard Screenshot */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 1000,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Box
          component="img"
          src={DashboardImage}
          alt="JaxSaver Business Dashboard"
          sx={{
            width: '100%',
            display: 'block',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        />
      </Box>
    </Box>
  );
};
