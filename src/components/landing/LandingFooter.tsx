import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Stack } from '@mui/material';
import { Mail } from 'lucide-react';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e293b',
        color: 'white',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Company Info - Left Side */}
          <Box sx={{ mb: { xs: 4, md: 0 } }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#0f172a',
                }}
              >
                CP
              </Box>
              <Box
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                Cold Pitch
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: '#94a3b8',
                fontSize: '0.875rem',
                maxWidth: 300,
              }}
            >
              AI-powered sales scripts and audio for modern sales teams.
            </Typography>
          </Box>

          {/* Navigation - Right Side */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 6, lg: 8 },
            }}
          >
            {/* Product Column */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#fbbf24',
                  mb: 2,
                }}
              >
                Product
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  component={Link}
                  to="/#features"
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { color: '#fbbf24' },
                  }}
                >
                  Features
                </Typography>
                <Typography
                  component={Link}
                  to="/#how-it-works"
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { color: '#fbbf24' },
                  }}
                >
                  How It Works
                </Typography>
                <Typography
                  component="span"
                  onClick={() => navigate('/admin/audio-generator/new')}
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { color: '#fbbf24' },
                  }}
                >
                  Get Started
                </Typography>
              </Stack>
            </Box>

            {/* Use Cases Column */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#fbbf24',
                  mb: 2,
                }}
              >
                Use Cases
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8', fontSize: '0.875rem' }}
                >
                  Voicemail Drops
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8', fontSize: '0.875rem' }}
                >
                  Sales Training
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8', fontSize: '0.875rem' }}
                >
                  Cold Calling
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
                  mb: 2,
                }}
              >
                Contact
              </Typography>
              <Stack spacing={1.5}>
                <Typography
                  component="a"
                  href="mailto:hello@coldpitch.ai"
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { color: '#fbbf24' },
                  }}
                >
                  <Mail size={16} style={{ marginRight: 8 }} />
                  hello@coldpitch.ai
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Copyright */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid #334155',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {new Date().getFullYear()} Cold Pitch. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
