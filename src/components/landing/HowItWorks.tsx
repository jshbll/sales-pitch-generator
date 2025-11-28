import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid } from '@mui/material';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Create your profile',
      description: 'Add your info, upload your logo, and choose a plan. Takes 5 minutes.',
    },
    {
      number: '2',
      title: 'Publish a promotion',
      description: 'Create an offer, set your rules, hit publish. Local customers see it instantly.',
    },
    {
      number: '3',
      title: 'Watch customers respond',
      description: "Track saves, redemptions, and foot traffic. See exactly what's working.",
    }
  ];

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            Get started in{' '}
            <Box component="span" sx={{ color: '#fbbf24' }}>
              10 minutes
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary',
              maxWidth: 480,
              mx: 'auto'
            }}
          >
            Set up your profile, launch a promotion, and start reaching local customers.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {steps.map((step) => (
            <Grid item xs={12} md={4} key={step.number}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Number(step.number) * 0.1 }}
                sx={{ textAlign: 'center' }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(251, 191, 36, 0.1)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    mx: 'auto',
                    mb: 2.5
                  }}
                >
                  {step.number}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
