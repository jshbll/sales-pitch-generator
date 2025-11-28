// React is used implicitly by JSX
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';
import './styles/edge-focus-fix.css'; // Fix for Edge focus indicators
import { initGA, logPageView } from './utils/analytics';
import { PostHogProvider, PostHogPageviewTracker } from './providers/PostHogProvider';

// MUI Theme imports
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'; // Renamed to avoid conflict
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';
import getTheme from './theme'; // Import our custom theme function

// Convex Provider with Clerk integration
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { ConvexClientManager } from '@jaxsaver/shared/convex-client';
// import { ConvexAuthStorage } from './utils/convexAuthStorage'; // TEMPORARILY DISABLED

// Create Convex client as a singleton outside of React components
// This ensures it's only created once and prevents re-initialization
const convexUrl = import.meta.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error('[App] VITE_CONVEX_URL environment variable is required');
}
const convexClient = new ConvexReactClient(convexUrl);
console.log('[App] Convex client created once at module level');

// Routes
import AppRoutes from './routes';

// Context Providers
import { ExitConfirmationProvider } from './contexts/ExitConfirmationContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ImageMigrationProvider } from './contexts/ImageMigrationContext';
import { ThemeContextProvider, useThemeMode } from './contexts/ThemeContext'; // Import Theme Context
import { NotificationProvider } from './contexts/NotificationContext';

// Development utilities
import WebSocketDebugger from './components/dev/WebSocketDebugger';
import { FloatingAuthDebugger } from './components/FloatingAuthDebugger';
import { RefreshMonitor } from './components/RefreshMonitor';
import './utils/clearAuthStorage'; // Make clearAllAuthStorage available globally

// Mobile Navigation
import MobileBottomNavigation from './components/layout/MobileBottomNavigation';
import BusinessSidebarNavigation from './components/layout/BusinessSidebarNavigation';

// Development utilities
// import '../src/utils/forceBusinessRole'; // DISABLED: This was forcing all users to BUSINESS role

// Component to track page views
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    logPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

// Component to manage Tawk.to chat widget visibility
// Only show on sales/landing pages, hide on dashboard
function TawkToManager() {
  const location = useLocation();

  useEffect(() => {
    // Sales pages where chat should be visible
    const salesPages = ['/', '/business', '/pricing', '/login', '/register', '/signup', '/business-login'];
    const isSalesPage = salesPages.includes(location.pathname);

    // Access Tawk.to API
    const Tawk_API = (window as any).Tawk_API;

    if (Tawk_API) {
      if (isSalesPage) {
        Tawk_API.showWidget?.();
      } else {
        Tawk_API.hideWidget?.();
      }
    } else {
      // Tawk.to might not be loaded yet, set up onLoad callback
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_API.onLoad = function() {
        if (isSalesPage) {
          (window as any).Tawk_API.showWidget?.();
        } else {
          (window as any).Tawk_API.hideWidget?.();
        }
      };
    }
  }, [location.pathname]);

  return null;
}

// Inner component to access theme context
function AppContent() {
  const { mode } = useThemeMode(); // Get the theme mode from context
  const theme = getTheme(mode); // Now mode is 'light' | 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Public routes where bottom nav should be hidden
  const publicRoutes = ['/', '/login', '/business-login', '/register', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Only show bottom nav on authenticated routes
  const shouldShowBottomNav = isMobile && !isPublicRoute;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles and theme background */}
      <AnalyticsTracker />
      <PostHogPageviewTracker />
      <TawkToManager />
      <NotificationProvider>
        <OnboardingProvider>
          <ExitConfirmationProvider>
            <AppRoutes />
            {/* Mount mobile bottom navigation at app root level for proper fixed positioning */}
            {shouldShowBottomNav && (
              <>
                <MobileBottomNavigation onMenuClick={() => setDrawerOpen(true)} />
                {/* Mount drawer from BusinessSidebarNavigation for mobile menu */}
                <BusinessSidebarNavigation
                  drawerOpen={drawerOpen}
                  onDrawerClose={() => setDrawerOpen(false)}
                />
              </>
            )}
          </ExitConfirmationProvider>
        </OnboardingProvider>
      </NotificationProvider>
    </MuiThemeProvider>
  );
}

function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  // Use the singleton Convex client created at module level
  // This prevents re-creation and re-initialization issues
  
  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

function App() {
  // Initialize Convex client manager for backwards compatibility using the same URL
  ConvexClientManager.initialize(convexUrl);
  
  // Initialize custom storage for Convex Auth to fix token storage issues
  // TEMPORARILY DISABLED: Testing with default storage to fix auth issue
  // const authStorage = new ConvexAuthStorage(convexUrl);
  // console.log('[App] Using custom ConvexAuthStorage for token management');

  // Initialize app and ensure onboarding flow works properly
  useEffect(() => {
    console.log('[App] Initializing application with Convex');

    // Initialize Google Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      initGA(gaId);
      console.log('[App] Google Analytics initialized');
    } else {
      console.warn('[App] Google Analytics not initialized - VITE_GA_MEASUREMENT_ID not found');
    }

    // PostHog Analytics initialized via PostHogProvider wrapper

    // ALWAYS clear mock business profile to ensure proper onboarding flow
    // This is critical for the business onboarding flow to work correctly
    const hasMockProfile = localStorage.getItem('mock_business_profile');
    if (hasMockProfile) {
      console.log('[App] Found mock business profile, removing it to ensure proper onboarding flow');
      localStorage.removeItem('mock_business_profile');
    }

    // Clear any onboarding-related session storage to ensure a fresh start
    sessionStorage.removeItem('onboardingStartTime');
    sessionStorage.removeItem('missingProfileFields');
    sessionStorage.removeItem('redirectAfterOnboarding');

    // Check if we're in a testing mode where we want to skip onboarding
    const skipOnboarding = localStorage.getItem('dev_skip_onboarding');
    if (skipOnboarding === 'true') {
      console.log('[App] Development mode with skip onboarding enabled');
    } else {
      console.log('[App] Onboarding flow enabled');
    }

    // Log auth state for debugging
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        console.log('[App] Found authenticated user:', user.email, 'Role:', user.role);
      } catch (e) {
        console.error('[App] Error parsing auth user:', e);
      }
    }
  }, []);

  return (
    <PostHogProvider>
      <ConvexAuthProvider>
        {/* Add WebSocket debugger in development */}
        {/* Commented out to reduce console noise - uncomment to debug WebSocket issues */}
        {/* {process.env.NODE_ENV === 'development' && <WebSocketDebugger />} */}

        <BrowserRouter>
          <ThemeContextProvider> {/* Provide the theme mode context */}
            <AppContent /> {/* Render inner component that uses the context */}
            {/* Add floating auth debugger - accessible via Ctrl+Shift+D */}
            {/* hide process.env.NODE_ENV === 'development' && <FloatingAuthDebugger />*/}
            {/* Add refresh monitor to track page reloads */}
            {process.env.NODE_ENV === 'development' && <RefreshMonitor />}
          </ThemeContextProvider>
        </BrowserRouter>
      </ConvexAuthProvider>
    </PostHogProvider>
  );
}

export default App;
