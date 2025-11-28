import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Users, Zap, BarChart3 } from 'lucide-react';

export const ValueProposition: React.FC = () => {
  const benefits = [
    {
      icon: <Users size={32} />,
      title: 'Reach Local Customers',
      description: 'Connect with thousands of engaged Jacksonville consumers actively looking for local deals and events',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: <Zap size={32} />,
      title: 'Easy Promotion Management',
      description: 'Create and manage deals, events, and promotions in minutes with our intuitive business portal',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Measure Your Impact',
      description: 'Track views, saves, and redemptions in real-time with detailed analytics and insights',
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
            Why Jacksonville Businesses{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Choose JaxSaver
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
            Everything you need to grow your business and reach more customers
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch" justifyContent="center">
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={benefit.title} sx={{ display: 'flex' }}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                    borderColor: '#FCD34D',
                    boxShadow: '0 20px 40px rgba(252, 211, 77, 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
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
                    color: '#FFFFFF',
                    mb: 2
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: '#9CA3AF',
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
