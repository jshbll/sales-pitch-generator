import React from 'react';
import { Box } from '@mui/material';
import { HeroSection } from '../components/landing/HeroSection';
import { NewsletterBenefits } from '../components/landing/NewsletterBenefits';
import { GiveawaySection } from '../components/landing/GiveawaySection';
import { AdvertiseSection } from '../components/landing/AdvertiseSection';
import { FloatingBusinessButton } from '../components/landing/FloatingBusinessButton';
import { LandingLayout } from '../layouts/LandingLayout';

export const LandingPage: React.FC = () => {
  return (
    <LandingLayout>
      {/* Floating Business Button */}
      <FloatingBusinessButton />

      {/* Main Content */}
      <Box sx={{ minHeight: '100vh' }}>
        <div id="home">
          <HeroSection />
        </div>
        <div id="benefits">
          <NewsletterBenefits />
        </div>
        <div id="giveaways">
          <GiveawaySection />
        </div>
        <AdvertiseSection />
      </Box>
    </LandingLayout>
  );
};

export default LandingPage;
