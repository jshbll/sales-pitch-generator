import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid } from '@mui/material';
import ActivePromotionsCard from '../business/dashboard/ActivePromotionsCard';
import activePromotionMobileImg from '../../assets/active-promotion-mobile.png';

export const ProblemSolutionSplit: React.FC = () => {
  // Demo data for the ActivePromotionsCard with animated stats
  const [demoPromotions, setDemoPromotions] = useState([
    {
      id: '1',
      title: 'Copy of $50 Off Any Service Over $100',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&h=100&fit=crop',
      impression_count: 12,
      claim_count: 2,
      redemption_count: 0,
      follow_conversions: 0
    },
    {
      id: '2',
      title: 'Save $5 on Auto Detailing Package',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop',
      impression_count: 89,
      claim_count: 12,
      redemption_count: 3,
      follow_conversions: 1
    },
    {
      id: '3',
      title: '10% Off Repair Services Over $200',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop',
      impression_count: 457,
      claim_count: 45,
      redemption_count: 8,
      follow_conversions: 3
    }
  ]);

  // Initial values for reset
  const initialPromotions = [
    {
      id: '1',
      title: 'Copy of $50 Off Any Service Over $100',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&h=100&fit=crop',
      impression_count: 12,
      claim_count: 2,
      redemption_count: 0,
      follow_conversions: 0
    },
    {
      id: '2',
      title: 'Save $5 on Auto Detailing Package',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop',
      impression_count: 89,
      claim_count: 12,
      redemption_count: 3,
      follow_conversions: 1
    },
    {
      id: '3',
      title: '10% Off Repair Services Over $200',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop',
      impression_count: 457,
      claim_count: 45,
      redemption_count: 8,
      follow_conversions: 3
    }
  ];

  // Animate stats to simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoPromotions(prev => {
        // Check if any promotion has reached max impressions
        const maxReached = prev.some(promo => promo.impression_count >= 2000);

        if (maxReached) {
          // Reset to initial values
          return initialPromotions;
        }

        return prev.map(promo => {
          const random = Math.random();

          // Increment views most frequently (70% chance)
          if (random < 0.7) {
            return {
              ...promo,
              impression_count: Math.min(2000, promo.impression_count + Math.floor(Math.random() * 5) + 1)
            };
          }
          // Increment saves (20% chance)
          else if (random < 0.9) {
            return {
              ...promo,
              claim_count: promo.claim_count + Math.floor(Math.random() * 3) + 1
            };
          }
          // Increment redemptions (7% chance)
          else if (random < 0.97) {
            return {
              ...promo,
              redemption_count: promo.redemption_count + Math.floor(Math.random() * 2) + 1
            };
          }
          // Increment follows (3% chance)
          else {
            return {
              ...promo,
              follow_conversions: promo.follow_conversions + 1
            };
          }
        });
      });
    }, 800); // Update every 800ms

    return () => clearInterval(interval);
  }, []);

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
            Delivering the attention to{' '}
            <Box component="span" sx={{ color: '#fbbf24' }}>
              your offer
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
            Marketing on social media means competing with everyone for attention. JaxSaver puts you in front of local customers only.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="stretch" justifyContent="center" sx={{ maxWidth: 1000, mx: 'auto' }}>
          {/* Live Dashboard Component */}
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minWidth: 300,
                maxWidth: 450,
                mx: 'auto'
              }}
            >
              <ActivePromotionsCard
                count={3}
                promotions={demoPromotions}
              />
            </Box>
          </Grid>

          {/* Mobile Screenshot */}
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Box
                component="img"
                src={activePromotionMobileImg}
                alt="JaxSaver Mobile App Promotion View"
                sx={{
                  height: '100%',
                  maxHeight: 400,
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Bottom CTA line */}
        <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            No expensive ad budgets. No infuriating social media algorithms.{' '}
            <Box component="span" sx={{ color: '#FCD34D', fontWeight: 600 }}>
              Really real local customers.
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
