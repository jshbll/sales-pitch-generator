import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';
import ActivePromotionsCard from '../business/dashboard/ActivePromotionsCard';

interface FeatureSection {
  title: string;
  description: string;
  features: string[];
  imagePosition: 'left' | 'right';
  imageSrc?: string;
  imageAlt?: string;
  hasLiveDemo?: boolean;
}

const featureSections: FeatureSection[] = [
  {
    title: 'Track every save, redemption, and follow',
    description: 'No more counting coupon redemptions. With our real-time analytics, you see exactly how your promotions are performing.',
    features: [
      'Real-time impression tracking',
      'Save and redemption analytics',
      'Follow conversion metrics',
      'Export reports anytime'
    ],
    imagePosition: 'right',
    hasLiveDemo: true,
    imageAlt: 'Live promotion analytics dashboard'
  },
  {
    title: 'Free your time to build',
    description: 'Create promotions in minutes with our AI-assisted builder. No marketing skills needed—just describe what you want.',
    features: [
      'AI-powered promotion creation',
      'Auto-generated images and copy',
      'Schedule promotions ahead',
      'One-click publishing'
    ],
    imagePosition: 'left',
    imageSrc: '/promotion-creation.png',
    imageAlt: 'Promotion creation wizard'
  },
  {
    title: 'Connect with real local customers',
    description: "JaxSaver isn't social media—just simple, quiet local promotions and events without all the noise.",
    features: [
      'Verified local audience',
      'No competing with viral content',
      'Direct business-to-customer connection',
      'Build a loyal following'
    ],
    imagePosition: 'right',
    imageSrc: '/connect-with-real-customers.png',
    imageAlt: 'Local customers connecting with businesses'
  }
];

export const FeatureSections: React.FC = () => {
  // Demo data for the ActivePromotionsCard with animated stats
  const [demoPromotions, setDemoPromotions] = useState([
    {
      id: '1',
      title: '$50 Off Any Service Over $100',
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
      title: '$50 Off Any Service Over $100',
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
        const maxReached = prev.some(promo => promo.impression_count >= 2000);

        if (maxReached) {
          return initialPromotions;
        }

        return prev.map(promo => {
          const random = Math.random();

          if (random < 0.7) {
            return {
              ...promo,
              impression_count: Math.min(2000, promo.impression_count + Math.floor(Math.random() * 5) + 1)
            };
          } else if (random < 0.9) {
            return {
              ...promo,
              claim_count: promo.claim_count + Math.floor(Math.random() * 3) + 1
            };
          } else if (random < 0.97) {
            return {
              ...promo,
              redemption_count: promo.redemption_count + Math.floor(Math.random() * 2) + 1
            };
          } else {
            return {
              ...promo,
              follow_conversions: promo.follow_conversions + 1
            };
          }
        });
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {featureSections.map((section, index) => (
        <Box
          key={section.title}
          component={motion.section}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          sx={{
            py: { xs: 8, md: 12 },
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={{ xs: 4, md: 8 }}
              alignItems="center"
              direction={section.imagePosition === 'left' ? 'row-reverse' : 'row'}
            >
              {/* Text Content */}
              <Grid item xs={12} md={6}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: section.imagePosition === 'left' ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                      lineHeight: 1.2
                    }}
                  >
                    {section.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      color: 'text.secondary',
                      mb: 4,
                      lineHeight: 1.7
                    }}
                  >
                    {section.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {section.features.map((feature) => (
                      <Box
                        key={feature}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }}
                      >
                        <CheckCircle2 size={20} color="#fbbf24" />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            color: 'text.primary',
                            fontWeight: 500
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Image/Demo Content */}
              <Grid item xs={12} md={6}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: section.imagePosition === 'left' ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {section.hasLiveDemo ? (
                    <Box sx={{ maxWidth: 400, width: '100%' }}>
                      <ActivePromotionsCard
                        count={3}
                        promotions={demoPromotions}
                      />
                    </Box>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <Box
                        component="img"
                        src={section.imageSrc}
                        alt={section.imageAlt}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </Paper>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      ))}
    </Box>
  );
};
