import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { BarChart3, Smartphone, Target, Calendar, CreditCard, Bell } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 size={28} />,
      title: 'Real-time Analytics',
      description: 'Track views, saves, and redemptions with detailed insights',
      color: '#3B82F6'
    },
    {
      icon: <Smartphone size={28} />,
      title: 'Mobile-First Platform',
      description: 'Reach customers on the go with our native mobile app',
      color: '#8B5CF6'
    },
    {
      icon: <Target size={28} />,
      title: 'Targeted Local Reach',
      description: 'Connect with customers in your specific area',
      color: '#10B981'
    },
    {
      icon: <Calendar size={28} />,
      title: 'Event Management',
      description: 'Promote special events and track RSVPs',
      color: '#F59E0B'
    },
    {
      icon: <CreditCard size={28} />,
      title: 'Simple Payment Processing',
      description: 'Easy subscription management with Stripe',
      color: '#EC4899'
    },
    {
      icon: <Bell size={28} />,
      title: 'Customer Notifications',
      description: 'Automatic push notifications to engaged users',
      color: '#EF4444'
    }
  ];

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: 12, md: 20 },
        bgcolor: '#111827',
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
              color: '#FFFFFF',
              mb: 3
            }}
          >
            Everything You Need to{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Succeed
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: '#9CA3AF',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Powerful features designed to help your business grow
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch" justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title} sx={{ display: 'flex' }}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                sx={{
                  p: { xs: 4, md: 5 },
                  bgcolor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: 3,
                  boxShadow: 'none',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: feature.color,
                    boxShadow: `0 20px 40px ${feature.color}20`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: `${feature.color}20`,
                    color: feature.color,
                    mb: 3
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    mb: 1.5
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '1rem',
                    color: '#9CA3AF',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
