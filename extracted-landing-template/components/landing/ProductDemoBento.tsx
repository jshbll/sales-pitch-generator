import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Zap, BarChart3, Store, Smartphone, MapPin } from 'lucide-react';

export const ProductDemoBento: React.FC = () => {
  // Large featured tile
  const featuredTile = {
    icon: <MapPin size={48} />,
    title: 'Reach Customers Where They Are',
    subtitle: 'Where Locals Shop Local',
    color: '#FCD34D',
    imagePlaceholder: '/demo-featured-map.png',
    imageAlt: 'Local customer reach visualization',
    large: true
  };

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'From Idea to Promotion in Minutes',
      description: 'Creating a promotion is easy with our promotion management platform.',
      color: '#3B82F6',
      imagePlaceholder: '/promotion-creation.png',
      imageAlt: 'Promotion creation wizard',
      hasScreenshot: true
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Track Every Save, Redemption, and Follow',
      description: 'No more counting coupon redemptions. With our analytics, you see how your promotion is doing in real time.',
      color: '#10B981',
      imagePlaceholder: '/track-every-promo.png',
      imageAlt: 'Analytics dashboard',
      hasScreenshot: true
    },
    {
      icon: <Store size={32} />,
      title: 'No Viral Videos Here, Just Hot Promotions and Events',
      description: 'JaxSaver isn\'t social media—just simple, quiet local promotions and events without all the noise.',
      color: '#F59E0B',
      imagePlaceholder: '/no-viral-videos-here.png',
      imageAlt: 'Mobile promotion detail view',
      hasScreenshot: true
    },
    {
      icon: <Smartphone size={32} />,
      title: 'Connect with Real Customers',
      description: 'We provide a great experience for local customers to discover, follow, and connect with local businesses and events.',
      color: '#8B5CF6',
      imagePlaceholder: '/connect-with-real-customers.png',
      imageAlt: 'Local customers connecting with businesses',
      hasScreenshot: true
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
            Everything You Need to{' '}
            <Box component="span" sx={{ color: '#FCD34D' }}>
              Grow Your Business
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
            A complete platform designed for local businesses
          </Typography>
        </Box>

        {/* Bento Box Grid - Using CSS Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Large featured tile - Top left, spans 2 columns */}
          <Paper
            component={motion.div}
            initial={{ borderColor: '#1F1F1F', boxShadow: 'none' }}
            whileInView={{
              borderColor: '#fbbf24',
              boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2)'
            }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.5 }}
            sx={{
              p: 0,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`,
              borderRadius: 3,
              boxShadow: 'none',
              overflow: 'hidden',
              gridColumn: { xs: '1', sm: 'span 2' },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
              }
            }}
          >
            {/* Large image area - Left side */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRight: (theme) => ({ xs: 'none', sm: `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}` }),
                borderBottom: (theme) => ({ xs: `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`, sm: 'none' }),
                minHeight: { xs: 250, sm: 'auto' }
              }}
            >
              <Box
                component="img"
                src="/man-in-san-marco-looking-at-phone.jpg"
                alt="Local business owner engaging with customers in San Marco"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </Box>

            {/* Large content area - Right side */}
            <Box sx={{
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1.5,
                  lineHeight: 1.2
                }}
              >
                {featuredTile.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.125rem', md: '1.25rem' },
                  color: '#FCD34D',
                  fontWeight: 600
                }}
              >
                {featuredTile.subtitle}
              </Typography>
            </Box>
          </Paper>

          {/* Top right tile */}
          {features.slice(0, 1).map((feature, index) => (
            <Paper
              key={feature.title}
              component={motion.div}
              initial={{ borderColor: '#1F1F1F', boxShadow: 'none' }}
              whileInView={{
                borderColor: '#fbbf24',
                boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2)'
              }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.5 }}
              sx={{
                p: 0,
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`,
                borderRadius: 3,
                boxShadow: 'none',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              {/* Image/Screenshot Placeholder */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 200, sm: 250, md: 300 },
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`
                }}
              >
                {feature.hasScreenshot ? (
                  <Box
                    component="img"
                    src={feature.imagePlaceholder}
                    alt={feature.imageAlt}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2
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
                        bgcolor: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}
                    >
                      Screenshot
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Content */}
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Paper>
          ))}

          {/* Bottom row: Three equal tiles */}
          {features.slice(1, 4).map((feature, index) => (
            <Paper
              key={feature.title}
              component={motion.div}
              initial={{ borderColor: '#1F1F1F', boxShadow: 'none' }}
              whileInView={{
                borderColor: '#fbbf24',
                boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2)'
              }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.5 }}
              sx={{
                p: 0,
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`,
                borderRadius: 3,
                boxShadow: 'none',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 200, sm: 250, md: 300 },
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#1F1F1F' : '#E5E7EB'}`
                }}
              >
                {feature.hasScreenshot ? (
                  <Box
                    component="img"
                    src={feature.imagePlaceholder}
                    alt={feature.imageAlt}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2
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
                        bgcolor: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}
                    >
                      Screenshot
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
