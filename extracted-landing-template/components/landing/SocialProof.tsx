import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Building2, Megaphone, Heart } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const stats = [
    {
      icon: <Building2 size={32} />,
      number: '150+',
      label: 'Active Businesses',
      color: '#3B82F6'
    },
    {
      icon: <Megaphone size={32} />,
      number: '2,500+',
      label: 'Promotions Created',
      color: '#10B981'
    },
    {
      icon: <Heart size={32} />,
      number: '50K+',
      label: 'Customer Saves',
      color: '#F59E0B'
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
        bgcolor: '#000',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              mb: 3
            }}
          >
            Trusted by{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Jacksonville Businesses
            </Box>
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch" justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={stat.label} sx={{ display: 'flex' }}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: { xs: 4, md: 5 },
                  bgcolor: '#111827',
                  border: '1px solid #1F2937',
                  borderRadius: 3,
                  boxShadow: 'none',
                  textAlign: 'center',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${stat.color}20`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: `${stat.color}20`,
                    color: stat.color,
                    mb: 3
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    fontWeight: 700,
                    color: stat.color,
                    mb: 1
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    color: '#9CA3AF',
                    fontWeight: 500
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Optional: Add a testimonial section here in the future */}
      </Container>
    </Box>
  );
};
