import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Box, Typography, Container, Button, useTheme } from '@mui/material';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Check if Clerk is available
const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export const AdvertiseSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [viewThreshold, setViewThreshold] = useState(0.5);

  useEffect(() => {
    const checkIfDesktop = () => {
      const isDesktopView = window.innerWidth >= 768;
      setViewThreshold(isDesktopView ? 0.5 : 0.1);
    };

    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  const isInView = useInView(sectionRef, {
    amount: viewThreshold,
    once: true
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <Box
      component={motion.section}
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 12, sm: 16, md: 24, lg: 32 },
        bgcolor: '#111827',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            p: { xs: 4, sm: 6 },
            bgcolor: '#1F2937',
            borderRadius: 2,
            border: '1px solid #374151',
            boxShadow: 'none'
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              width: { xs: '100%', md: '25%' },
              mb: { xs: 4, sm: 6, md: 0 },
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                width: '100%',
                maxWidth: { xs: '100%', sm: 400 }
              }}
            >
              <Box
                component="img"
                src="/allie-standing-in-her-store.png"
                alt="Allie Standing In Her Store"
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Box>

          {/* Content Section */}
          <Box
            sx={{
              width: { xs: '100%', md: '75%' },
              pl: { xs: 0, md: 6, lg: 8 },
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                color: '#FCD34D',
                mb: 2
              }}
            >
              Looking to advertise?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: '#9CA3AF',
                mb: 4
              }}
            >
              Reach 100's of Thousands Locals, Ready To Support Local Businesses!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(HAS_CLERK ? '/sign-in' : '/admin/audio-generator')}
              endIcon={<Rocket size={20} />}
              sx={{
                bgcolor: '#FCD34D',
                color: '#000',
                px: { xs: 4, sm: 6 },
                py: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#F59E0B'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
