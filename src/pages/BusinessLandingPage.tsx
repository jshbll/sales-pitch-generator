import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { LandingLayout } from '../layouts/LandingLayout';
import { AudioWizard } from './audio-generator/AudioWizard';
import {
  LogoBar,
  FeatureCardsSection,
  BigQuote,
  SupportFeaturesSection,
  AutomationSection,
  AutomationFeaturesSection,
  InsightsSection,
  ReportingFeaturesSection,
  IntegrationsSection,
  MenuShowcaseSection,
  TestimonialsGrid,
  FinalCTA
} from '../components/landing/FintaStyleLanding';

export const BusinessLandingPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <LandingLayout>
      <Box sx={{ minHeight: '100vh' }}>
        {/* 1. Hero - Sales Pitch Generator */}
        <Box
          component="section"
          sx={{
            pt: { xs: 12, md: 16 },
            pb: { xs: 6, md: 10 },
            background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                textAlign: 'center',
                mb: 2,
                color: '#1e293b',
              }}
            >
              AI Sales Pitch Generator
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 400,
                textAlign: 'center',
                mb: 4,
                color: '#64748b',
              }}
            >
              Answer 8 questions. Get a professional sales script + audio in minutes.
            </Typography>
            <AudioWizard />
          </Container>
        </Box>

        {/* 2. Logo bar - temporarily hidden */}
        {/* <LogoBar /> */}

        {/* 3. Feature cards - "Marketing success with zero stress" */}
        <Box id="features" sx={{ scrollMarginTop: { xs: '56px', sm: '64px' } }}>
          <FeatureCardsSection />
        </Box>

        {/* 4. Big testimonial */}
        <BigQuote
          quote="JaxSaver makes creating promotions so easy that anyone in our office can do it."
          author="Matthew Thomas"
          role="CEO at Island Glass"
        />

        {/* 5. Support features - Live chat & Expert guidance */}
        <SupportFeaturesSection />

        {/* 6. Automation section - "Free your time to build" */}
        <Box id="how-it-works" sx={{ scrollMarginTop: { xs: '56px', sm: '64px' } }}>
          <AutomationSection />
        </Box>

        {/* 6. Another quote */}
        <BigQuote
          quote="I don't have the time to manage ads and I don't want to pay thousands a month for someone to do it for me. Jax Saver gets me the exposure I need without breaking the bank."
          author="Emily McKinley"
          role="Owner at McKinley Medical"
        />

        {/* 7. Automation features - Auto-publish & Automation rules */}
        <AutomationFeaturesSection />

        {/* 8. Insights section - "Insights for smarter decisions" */}
        <InsightsSection />

        {/* 9. Mission statement */}
        <BigQuote
          quote="We want to build the place where local businesses thrive in their communities again."
        />

        {/* 10. Reporting features - Reports & Email notifications */}
        <ReportingFeaturesSection />

        {/* 11. Integrations - "Pull them into your orbit" */}
        <IntegrationsSection />

        {/* 12. Menu Showcase - Mobile menu display */}
        <MenuShowcaseSection />

        {/* Testimonials */}
        <TestimonialsGrid />

        {/* 12. Final CTA */}
        <FinalCTA />
      </Box>
    </LandingLayout>
  );
};

export default BusinessLandingPage;
