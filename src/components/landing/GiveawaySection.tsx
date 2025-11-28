import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper, useTheme } from '@mui/material';
import { Gift, Mail, Trophy } from 'lucide-react';

export const GiveawaySection: React.FC = () => {
  const theme = useTheme();
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

  const steps = [
    {
      icon: <Mail size={24} />,
      title: '1. Download',
      description: 'Simply download the free JaxSaver app and create your account. That\'s it! No purchase necessary.',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: <Gift size={24} />,
      title: '2. Automatic Entry',
      description: 'Every user get\'s a chance to enter into weekly giveaways from local businesses. It\'s that easy!',
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.1)'
    },
    {
      icon: <Trophy size={24} />,
      title: '3. Win Prizes',
      description: 'Winners are randomly selected each month and notified in the app. Sign Up Today!',
      color: '#EAB308',
      bgColor: 'rgba(234, 179, 8, 0.1)'
    }
  ];

  return (
    <Box
      component={motion.section}
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 12, sm: 16, md: 24, lg: 32 },
        bgcolor: '#000',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Grid
          container
          spacing={{ xs: 6, sm: 8 }}
          sx={{ mb: { xs: 8, sm: 10, md: 12 } }}
          direction={{ xs: 'column', md: 'row-reverse' }}
          alignItems="center"
        >
          {/* Image */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                maxWidth: { xs: '100%', sm: 400 },
                mx: 'auto'
              }}
            >
              <Box
                component="img"
                src="/monthly-giveaways.png"
                alt="Monthly Giveaways"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Grid>

          {/* Text */}
          <Grid item xs={12} md={8}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.25rem' },
                  fontWeight: 700,
                  color: '#FCD34D',
                  mb: { xs: 3, sm: 4 }
                }}
              >
                Multiple Giveaways Every Month!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                  color: '#9CA3AF',
                  lineHeight: 1.6
                }}
              >
                We partner with local businesses to offer free giveaways! Download the app and sign up to enter to win amazing prizes!
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Steps Grid */}
        <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={4} key={step.title}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                sx={{
                  p: { xs: 4, sm: 6 },
                  bgcolor: '#111827',
                  border: '1px solid #1F2937',
                  borderRadius: 2,
                  boxShadow: 'none',
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: step.bgColor,
                    color: step.color,
                    mb: { xs: 3, sm: 4 },
                    mx: 'auto'
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    fontWeight: 600,
                    color: '#fff',
                    mb: { xs: 2, sm: 3 }
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: '#9CA3AF',
                    lineHeight: 1.6
                  }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
