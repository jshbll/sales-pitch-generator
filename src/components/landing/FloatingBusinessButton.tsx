import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Check if Clerk is available
const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export const FloatingBusinessButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (HAS_CLERK) {
      // When Clerk is available, go to sign-in page
      navigate('/sign-in');
    } else {
      // Without Clerk, go directly to dashboard (for dev)
      navigate('/admin/audio-generator');
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      sx={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        zIndex: 40,
        width: '100%'
      }}
    >
      <Box
        component="button"
        onClick={handleClick}
        sx={{
          display: 'block',
          width: '100%',
          background: 'linear-gradient(to right, #FBBF24, #F59E0B, #D97706)',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.3s',
          '&:hover': {
            background: 'linear-gradient(to right, #F59E0B, #D97706, #B45309)',
            '& .arrow-icon': {
              transform: 'translateX(4px)'
            }
          }
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 1.5 }
          }}
        >
          <Briefcase size={24} style={{ flexShrink: 0 }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 0, sm: 1 }
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 700,
                lineHeight: 1.2
              }}
            >
              Onboarding Jacksonville Businesses Now
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                opacity: 0.9,
                lineHeight: 1.2
              }}
            >
              - click to sign up
            </Typography>
          </Box>
          <ArrowRight
            size={20}
            className="arrow-icon"
            style={{
              flexShrink: 0,
              transition: 'transform 0.3s'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
