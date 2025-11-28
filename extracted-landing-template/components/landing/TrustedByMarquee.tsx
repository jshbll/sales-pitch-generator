import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import IslandGlassLogo from '../../assets/Island glass.png';

// Logos - add actual business logos here
// The marquee will automatically duplicate them for seamless looping
const logos = [
  { id: 1, name: 'Island Glass', image: IslandGlassLogo },
  { id: 2, name: 'Rye', image: null },
  { id: 3, name: 'Unthread', image: null },
  { id: 4, name: 'Relay', image: null },
  { id: 5, name: 'Magic Patterns', image: null },
  { id: 6, name: 'Instant', image: null },
  { id: 7, name: 'Resend', image: null },
  { id: 8, name: 'CircleBack', image: null },
];

const LogoItem = ({ logo }: { logo: typeof logos[0] }) => (
  <Box
    sx={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {logo.image ? (
      <Box
        component="img"
        src={logo.image}
        alt={logo.name}
        sx={{
          width: 'auto',
          height: { xs: 20, md: 24 },
          objectFit: 'contain',
          opacity: 0.5,
          filter: 'grayscale(100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            opacity: 0.8,
            filter: 'grayscale(0%)',
          },
        }}
      />
    ) : (
      <Typography
        sx={{
          fontSize: { xs: '0.75rem', md: '0.875rem' },
          fontWeight: 600,
          color: 'text.disabled',
          opacity: 0.5,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        {logo.name}
      </Typography>
    )}
  </Box>
);

export const TrustedByMarquee: React.FC = () => {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: { xs: 3, md: 4 },
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            fontWeight: 500,
          }}
        >
          Trusted by fast-growing local businesses
        </Typography>

        {/* Marquee container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '40px',
              zIndex: 2,
            },
            '&::before': {
              left: 0,
              background: (theme) =>
                `linear-gradient(to right, ${theme.palette.background.default}, transparent)`,
            },
            '&::after': {
              right: 0,
              background: (theme) =>
                `linear-gradient(to left, ${theme.palette.background.default}, transparent)`,
            },
          }}
        >
          {/* Scrolling track */}
          <Box
            sx={{
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            {/* Content strip with duplicated logos for seamless loop */}
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: '32px', md: '48px' },
                animation: 'marquee 30s linear infinite',
                '@keyframes marquee': {
                  from: { transform: 'translateX(0)' },
                  to: { transform: 'translateX(-50%)' },
                },
                '&:hover': {
                  animationPlayState: 'paused',
                },
              }}
            >
              {/* First set */}
              {logos.map((logo) => (
                <LogoItem key={logo.id} logo={logo} />
              ))}
              {/* Second set for seamless loop */}
              {logos.map((logo) => (
                <LogoItem key={`dup-${logo.id}`} logo={logo} />
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
