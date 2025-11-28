import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { LandingLayout } from '../layouts/LandingLayout';
import { PricingPreview } from '../components/landing/PricingPreview';
import { Sparkles, Zap, BarChart3, Check } from 'lucide-react';

const HowItWorksStep: React.FC<{
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ step, title, description, icon }) => (
  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '16px',
        bgcolor: '#fef3c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#f59e0b',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        mb: 1,
      }}
    >
      Step {step}
    </Typography>
    <Typography
      sx={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#1e293b',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        fontSize: '0.9375rem',
        color: '#64748b',
        lineHeight: 1.6,
      }}
    >
      {description}
    </Typography>
  </Box>
);

export const PricingPage: React.FC = () => {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 16, md: 20 },
          pb: { xs: 6, md: 8 },
          background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Headline */}
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 700,
                color: '#1e293b',
                mb: 2,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Get Started In 3 Simple Steps
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                color: '#64748b',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Start your 7-day free trial today.
            </Typography>
          </Box>

          {/* How It Works Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              mb: { xs: 6, md: 8 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 4, md: 3 },
              }}
            >
              <HowItWorksStep
                step={1}
                title="Create Your Profile"
                description="Sign up and build your business profile in minutes. Add your logo, photos, and business details."
                icon={<Sparkles size={28} color="#f59e0b" />}
              />
              <HowItWorksStep
                step={2}
                title="Create Promotions"
                description="Use our AI-assisted builder to create compelling promotions and deals for your customers."
                icon={<Zap size={28} color="#f59e0b" />}
              />
              <HowItWorksStep
                step={3}
                title="Reach Local Customers"
                description="Your promotions go live in the JaxSaver app. Track views, saves, and customer engagement."
                icon={<BarChart3 size={28} color="#f59e0b" />}
              />
            </Box>

            {/* Benefits List */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, md: 4 },
                mt: 4,
                pt: 4,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              {[
                '7-day free trial',
                'Cancel anytime',
                'No contracts',
              ].map((benefit) => (
                <Box
                  key={benefit}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Check size={18} color="#10b981" />
                  <Typography sx={{ fontSize: '0.9375rem', color: '#64748b' }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Pricing Section - Full width */}
      <Box
        sx={{
          pb: { xs: 8, md: 12 },
          bgcolor: '#ffffff',
        }}
      >
        <PricingPreview />
      </Box>
    </LandingLayout>
  );
};

export default PricingPage;
