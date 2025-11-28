import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid } from '@mui/material';

export const NewsletterBenefits: React.FC = () => {
  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 12, sm: 16, md: 24, lg: 32 },
        bgcolor: '#111827',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          sx={{ mb: { xs: 8, sm: 10, md: 12 } }}
          direction={{ xs: 'column', md: 'row-reverse' }}
          alignItems="center"
        >
          {/* Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                maxWidth: { xs: 280, sm: 320, md: 360, lg: 400 },
                mx: 'auto'
              }}
            >
              <Box
                component="img"
                src="/jax-saver-hero-graphic.png"
                alt="JaxSaver App Categories"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '40px'
                }}
              />
            </Box>
          </Grid>

          {/* Text */}
          <Grid item xs={12} md={6}>
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
                Your Jacksonville Discovery Hub
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                  color: '#9CA3AF',
                  lineHeight: 1.6
                }}
              >
                Browse exclusive savings, promotions, and events from local businesses - all in one personalized feed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
