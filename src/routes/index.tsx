import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Layout components
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import { LandingLayout } from '../layouts/LandingLayout';

// Lazy load pages
const BusinessLandingPage = React.lazy(() => import('../pages/BusinessLandingPage'));
const ClerkSignIn = React.lazy(() => import('../pages/ClerkSignIn'));
const ClerkSignUp = React.lazy(() => import('../pages/ClerkSignUp'));
const PricingPage = React.lazy(() => import('../pages/PricingPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));

// Audio Generator pages
const AudioWizard = React.lazy(() => import('../pages/audio-generator/AudioWizard').then(m => ({ default: m.AudioWizard })));
const AudioPreview = React.lazy(() => import('../pages/audio-generator/AudioPreview').then(m => ({ default: m.AudioPreview })));

// Loading component
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// 404 Page
const NotFound = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </Box>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<BusinessLandingPage />} />

        {/* Public pages */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth routes */}
        <Route path="/sign-in/*" element={<ClerkSignIn />} />
        <Route path="/sign-up/*" element={<ClerkSignUp />} />
        <Route path="/login" element={<ClerkSignIn />} />
        <Route path="/register" element={<ClerkSignUp />} />

        {/* Audio Generator routes */}
        <Route path="/create" element={<AudioWizard />} />
        <Route path="/create/new" element={<AudioWizard />} />
        <Route path="/pitch/:id" element={<AudioPreview />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
