import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { Phone, MapPin } from 'lucide-react';

const LandingFooter: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        color: '#1e293b'
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          {/* Company Info - Left Side */}
          <Box sx={{ mb: { xs: 4, md: 0 } }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: 'inline-block', textDecoration: 'none' }}
            >
              <Box
                component="img"
                src="/jaxsaver-golden-logo.svg"
                alt="JaxSaver"
                sx={{ height: 32 }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: '#64748b',
                fontSize: '0.875rem',
                maxWidth: 300
              }}
            >
              Search and Save Local.
            </Typography>
          </Box>

          {/* Navigation and Contact - Right Side */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 6, lg: 8 }
            }}
          >
            {/* Quick Links Column */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#fbbf24',
                  mb: 2
                }}
              >
                Quick Links
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  component={Link}
                  to="/contact"
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#fbbf24'
                    }
                  }}
                >
                  Contact Us
                </Typography>
                <Typography
                  component="a"
                  href="https://business.jaxsaver.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#fbbf24'
                    }
                  }}
                >
                  Business Login
                </Typography>
              </Stack>
            </Box>

            {/* Legal Column */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#fbbf24',
                  mb: 2
                }}
              >
                Legal
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  component={Link}
                  to="/terms"
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#fbbf24'
                    }
                  }}
                >
                  Terms & Disclosures
                </Typography>
                <Typography
                  component={Link}
                  to="/privacy-policy"
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#fbbf24'
                    }
                  }}
                >
                  Privacy Policy
                </Typography>
              </Stack>
            </Box>

            {/* Contact Column */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#fbbf24',
                  mb: 2
                }}
              >
                Contact
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  component="a"
                  href="tel:904-856-7283"
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      color: '#fbbf24'
                    }
                  }}
                >
                  <Phone size={16} style={{ marginRight: 8 }} />
                  904-856-SAVE
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <MapPin size={16} style={{ marginRight: 8 }} />
                  Jacksonville, FL
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}
          >
            {new Date().getFullYear()} Jax Saver. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
