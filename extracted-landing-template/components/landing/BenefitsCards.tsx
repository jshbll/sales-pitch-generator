import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Target, Shield, DollarSign } from 'lucide-react';

export const BenefitsCards: React.FC = () => {
  const benefits = [
    {
      icon: <Target size={40} />,
      title: 'Qualified Audience',
      description: 'Every person who sees your promotion is in your area and actively looking for local deals. No wasted impressions on tourists or people hundreds of miles away.',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: <Shield size={40} />,
      title: 'Zero Competition',
      description: 'Unlike Facebook or Instagram, you\'re not competing with Starbucks, Amazon, or viral cat videos. It\'s just you and other local businesses serving different customers.',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Simple Pricing',
      description: 'No pay-per-click guessing games. One flat monthly rate. Create unlimited promotions within your tier. That\'s it.',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
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
        py: { xs: 12, md: 20 },
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            Why Local Businesses{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Choose JaxSaver
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Everything you need to reach more customers without wasting money
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch" justifyContent="center">
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={benefit.title} sx={{ display: 'flex' }}>
              <Paper
                component={motion.div}
                initial={{ borderColor: '#1F1F1F', boxShadow: 'none' }}
                whileInView={{
                  borderColor: '#fbbf24',
                  boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2)'
                }}
                viewport={{ amount: 0.5 }}
                transition={{ duration: 0.5 }}
                sx={{
                  p: { xs: 4, md: 5 },
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`,
                  borderRadius: 3,
                  boxShadow: 'none',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: benefit.bgColor,
                    color: benefit.color,
                    mb: 3
                  }}
                >
                  {benefit.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'text.secondary',
                    lineHeight: 1.7
                  }}
                >
                  {benefit.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
