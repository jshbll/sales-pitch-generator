import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DebugAuthInfo from '../components/DebugAuthInfo';
import { UserRole } from '../types/user';
import BusinessOnboardingRoute from '../components/BusinessOnboardingRoute';

// Define role arrays as constants to prevent recreation on every render
const BUSINESS_ADMIN_ROLES = [UserRole.BUSINESS, UserRole.ADMIN];
import { PromotionsProvider } from '../contexts/PromotionsContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { ExitConfirmationProvider } from '../contexts/ExitConfirmationContext';
import { ImageMigrationProvider } from '../contexts/ImageMigrationContext';

// Layout components
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import BusinessLayout from '../layouts/BusinessLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import Home from '../pages/Home';
import MarketingLandingPage from '../pages/MarketingLandingPage';
import BusinessAuthPage from '../pages/BusinessAuthPage';
import ClerkSignIn from '../pages/ClerkSignIn';
import ClerkSignUp from '../pages/ClerkSignUp';
import SSOCallback from '../pages/SSOCallback';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import EmailVerification from '../pages/EmailVerification';
// ARCHIVED: Newsletter features moved to future roadmap
// import NewsletterPage from '../pages/newsletter/NewsletterPage';
import NotFound from '../pages/NotFound';
import BusinessRedirect from '../components/BusinessRedirect';
import TermsPage from '../pages/TermsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import ContactPage from '../pages/ContactPage';
import PricingPage from '../pages/PricingPage';
import PublicBusinessProfile from '../pages/PublicBusinessProfile';
import ProfilePage from '../pages/ProfilePage';
import TestPhoneValidation from '../pages/TestPhoneValidation';
import EnvDebug from '../pages/EnvDebug';
import StyleGuide from '../pages/StyleGuide';
import TestSubscription from '../pages/TestSubscription';
import TestClerkAuth from '../pages/TestClerkAuth';
import LinkBusinessToClerk from '../pages/LinkBusinessToClerk';
import AuthDebugPage from '../pages/AuthDebugPage';
import FoundersBannerSquare from '../pages/FoundersBannerSquare';

// User dashboard pages removed - web-business is now business-only

// Business dashboard pages
import BusinessDashboard from '../pages/business/BusinessDashboard';
import BusinessDashboardTest from '../pages/business/BusinessDashboardTest';
import BusinessOnboardingPage from '../pages/business/BusinessOnboardingPage';
import BusinessProfile from '../pages/dashboard/BusinessProfile';
import EditBusinessProfile from '../pages/dashboard/EditBusinessProfile';
import ViewBusinessProfile from '../pages/dashboard/ViewBusinessProfile';
import ManagePromotions from '../pages/business/ManagePromotions';
import BusinessProfilePreviewPage from '../pages/business/BusinessProfilePreviewPage';
import BusinessProfilePreviewSimple from '../pages/business/BusinessProfilePreviewSimple';
import BusinessProfileWithPreview from '../pages/business/BusinessProfileWithPreview';
import BusinessProfilePage from '../pages/business/BusinessProfilePage';
import BusinessProfilePageMinimal from '../pages/business/BusinessProfilePageMinimal';
// ARCHIVED: Newsletter promotion booking moved to future roadmap
// import NewsletterPromotionBookingPage from '../pages/business/NewsletterPromotionBookingPage';
import CreatePromotionPage from '../pages/business/CreatePromotionPage'; // Old 5,304 line version
// import CreatePromotionPage from '../pages/business/CreatePromotionPageRefactored'; // New modular version
// import BusinessAnalytics from '../pages/business/BusinessAnalyticsDoNotDelete';
import BusinessSettings from '../pages/business/BusinessSettings';
import PaymentSuccessPage from '../pages/business/PaymentSuccessPage';
// import PaymentHistoryPage from '../pages/business/PaymentHistoryPage'; // ARCHIVED: Using Stripe portal
import BusinessNotifications from '../pages/business/BusinessNotifications';
import AnalyticsDashboard from '../pages/dashboard/AnalyticsDashboard';
import CheckoutPage from '../pages/business/CheckoutPage';

// Event management pages
import CreateEvent from '../pages/business/CreateEvent'; // Original version
// import CreateEvent from '../pages/business/CreateEventRefactored'; // Incomplete refactored version
import EditEvent from '../pages/business/EditEvent';
import ManageEvents from '../pages/business/ManageEvents';
import BusinessEventCalendar from '../components/business/event/BusinessEventCalendar';

// Test pages
import TestPhoneInput from '../pages/TestPhoneInput';

// Unified promotion management

// Promotion builder pages
import PromotionsListPage from '../pages/dashboard/PromotionsListPage';
import EditPromotion from '../pages/business/EditPromotion';

// Admin pages
import DatabaseAdmin from '../pages/admin/DatabaseAdmin';
import SubscriptionSetupSimple from '../pages/admin/SubscriptionSetupSimple';
import FixSubscriptionPrices from '../pages/admin/FixSubscriptionPrices';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminBusinesses from '../pages/admin/AdminBusinesses';
import AdminGiveaways from '../pages/admin/AdminGiveaways';
import CreateGiveawayPage from '../pages/admin/CreateGiveawayPage';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminContent from '../pages/admin/AdminContent';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSystem from '../pages/admin/AdminSystem';
import AdminPricing from '../pages/admin/AdminPricing';
import AdminNotifications from '../pages/admin/AdminNotifications';

// Audio Generator pages (hidden feature)
import AudioGeneratorIndex from '../pages/audio-generator/index';
import AudioWizard from '../pages/audio-generator/AudioWizard';
import AudioPreview from '../pages/audio-generator/AudioPreview';

// Protected route component
import ProtectedRoute from '../components/ProtectedRoute';
import { SubscriptionGuardRoute } from '../components/SubscriptionGuardRoute';
import EventCreationGuard from '../components/EventCreationGuard';
import PromotionCreationGuard from '../components/PromotionCreationGuard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing page - uses its own layout */}
      <Route path="/" element={<Home />} />

      {/* Marketing landing page - Google Business Profile style */}
      <Route path="/marketing" element={<MarketingLandingPage />} />

      {/* Public pages with landing layout */}
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Public routes with main layout */}
      <Route element={<MainLayout />}>
        <Route path="/business-login" element={<BusinessAuthPage />} />
        <Route path="/login" element={<ClerkSignIn />} />
        <Route path="/register" element={<ClerkSignUp />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        {/* ARCHIVED: Newsletter features moved to future roadmap */}
        {/* <Route path="/newsletter/:newsletterId" element={<NewsletterPage />} /> */}
        <Route path="/env-debug" element={<EnvDebug />} />
      </Route>

      {/* User dashboard routes removed - web-business is now business-only */}

      {/* Public business profile route with MainLayout - using /biz prefix to avoid conflicts */}
      <Route element={<MainLayout />}>
        <Route path="/biz/:businessId" element={<PublicBusinessProfile />} />
      </Route>
      
      {/* Root business path redirect */}
      <Route path="/business" element={<BusinessRedirect />} />

      {/* Checkout page - public access (users can sign up from this page) */}
      <Route path="/checkout" element={<CheckoutPage />} />

      {/* Protected business routes - only business users and admins */}
      <Route element={<ProtectedRoute allowedRoles={BUSINESS_ADMIN_ROLES} />}>
        {/* Subscription Guard - requires active subscription for all business routes */}
        <Route element={<SubscriptionGuardRoute />}>
          {/* Business Onboarding Route - enforces onboarding flow AFTER subscription */}
          <Route element={<BusinessOnboardingRoute />}>
            {/* All business routes - requires active subscription */}
            <Route element={<PromotionsProvider />}>
              <Route element={<BusinessLayout />}>
                <Route path="/business/profile" element={<BusinessProfilePage />} />
                <Route path="/business/dashboard" element={<BusinessDashboard />} />
                <Route path="/business/settings" element={<BusinessSettings />} />
                {/* <Route path="/business/analytics" element={<BusinessAnalytics />} /> */}
                <Route path="/business/notifications" element={<BusinessNotifications />} />
                <Route path="/business/promotions" element={<ManagePromotions />} />
                {/* Promotion Creation Guard - blocks users at subscription limit from creating promotions */}
                <Route element={<PromotionCreationGuard />}>
                  <Route path="/business/promotions/create" element={<CreatePromotionPage />} />
                </Route>
                <Route path="/business/promotions/:promotionId/edit" element={<CreatePromotionPage />} />
                <Route path="/business/events" element={<ManageEvents />} />
                {/* Event Creation Guard - blocks Starter users from creating events */}
                <Route element={<EventCreationGuard />}>
                  <Route path="/business/events/create" element={<CreateEvent />} />
                </Route>
                <Route path="/business/events/:eventId/edit" element={<CreateEvent />} />
                {/* <Route path="/business/payment-history" element={<PaymentHistoryPage />} /> ARCHIVED: Using Stripe portal */}
                <Route path="/business/payment-success" element={<PaymentSuccessPage />} />
              </Route>
            </Route>
          </Route>
          {/* End BusinessOnboardingRoute */}

          {/* Legacy event creation routes - redirect to new paths */}
          <Route path="/business/create-event" element={<Navigate to="/business/events/create" replace />} />
          <Route path="/business/edit-event/:eventId" element={<Navigate to="/business/events/:eventId/edit" replace />} />

          {/* Routes that bypass onboarding check - for editing existing profiles */}
          <Route path="/dashboard/business" element={<BusinessProfile />} />
          <Route path="/dashboard/business/edit/:businessId" element={<EditBusinessProfile />} />
          <Route path="/dashboard/business/view/:businessId" element={<ViewBusinessProfile />} />
        </Route>
        {/* End SubscriptionGuardRoute */}
      </Route>
      {/* End ProtectedRoute */}
      
      {/* Business Onboarding Page - requires authentication but no specific role */}
      <Route element={<ProtectedRoute />}>
        <Route path="/business/onboarding" element={<BusinessOnboardingPage />} />
      </Route>

      {/* Super Admin Routes - Only accessible by product owner */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/businesses" element={<AdminBusinesses />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/giveaways" element={<AdminGiveaways />} />
        <Route path="/admin/giveaways/create" element={<CreateGiveawayPage />} />
        <Route path="/admin/giveaways/edit/:id" element={<CreateGiveawayPage />} />
        <Route path="/admin/system" element={<AdminSystem />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        {/* Audio Generator - hidden feature */}
        <Route path="/admin/audio-generator" element={<AudioGeneratorIndex />} />
        <Route path="/admin/audio-generator/new" element={<AudioWizard />} />
        <Route path="/admin/audio-generator/:id" element={<AudioPreview />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Debug routes - only for development */}
      <Route path="/debug/auth" element={<DebugAuthInfo />} />
      <Route path="/auth-debug" element={<AuthDebugPage />} />
      <Route path="/test/clerk-auth" element={<TestClerkAuth />} />
      <Route path="/link-business" element={<LinkBusinessToClerk />} />
      <Route path="/test/phone-validation" element={<TestPhoneValidation />} />
      <Route path="/test/phone-input" element={<TestPhoneInput />} />
      <Route path="/test/subscription" element={<TestSubscription />} />
      <Route path="/temp/founders-banner-square" element={<FoundersBannerSquare />} />
      <Route path="/admin/fix-subscription-prices" element={<FixSubscriptionPrices />} />
      <Route path="/admin/subscription-setup" element={<SubscriptionSetupSimple />} />

      {/* Legacy /dashboard redirect - redirect to /business/dashboard */}
      <Route path="/dashboard" element={<Navigate to="/business/dashboard" replace />} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
