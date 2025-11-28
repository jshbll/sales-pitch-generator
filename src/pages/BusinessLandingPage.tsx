import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { LandingLayout } from '../layouts/LandingLayout';
import {
  HeroSection,
  UseCasesSection,
  HowItWorksSection,
  FeaturesSection,
  QuoteSection,
  FinalCTASection,
} from '../components/landing/ColdPitchLanding';

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
        {/* Hero - Audio Player with Play Me button */}
        <HeroSection />

        {/* Use Cases - Voicemail, Training, Cold Calls, Presentations */}
        <UseCasesSection />

        {/* Testimonial */}
        <QuoteSection
          quote="Cold Pitch cut our script creation time by 90%. Our SDRs now have professional pitches ready for every campaign in minutes."
          author="Sarah Chen"
          role="VP of Sales, TechStart Inc."
        />

        {/* How It Works - 3 Steps */}
        <HowItWorksSection />

        {/* Features/Benefits */}
        <FeaturesSection />

        {/* Second Testimonial */}
        <QuoteSection
          quote="The voicemail drops we create with Cold Pitch get 3x more callbacks than our old scripts. It's like having a professional copywriter on demand."
          author="Marcus Johnson"
          role="Sales Manager"
        />

        {/* Final CTA */}
        <FinalCTASection />
      </Box>
    </LandingLayout>
  );
};

export default BusinessLandingPage;
