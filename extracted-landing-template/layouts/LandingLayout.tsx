import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useClerk, UserButton } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import LandingFooter from '../components/landing/LandingFooter';
import { useThemeMode } from '../contexts/ThemeContext';
import { trackNavClick, trackGetStartedClick } from '../utils/marketingAnalytics';

interface NavLink {
  name: string;
  path?: string;
  section?: string;
  external?: string;
  action?: () => void;
}

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const theme = useTheme();
  const { setTheme } = useThemeMode();

  // Force light mode for marketing pages
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  // Handle hash navigation (scroll to section when arriving with hash)
  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      const sectionId = location.hash.replace('#', '');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash, location.pathname]);

  // Query subscription directly (not gated by onboarding like useClerkBilling)
  // This is for the landing page, so we need to show correct nav buttons regardless of onboarding status
  const directSubscription = useQuery(api.clerkBilling.getCurrentSubscription);
  const hasActiveSubscription = directSubscription?.hasSubscription &&
    (directSubscription?.status === 'active' || directSubscription?.status === 'trialing');

  // Check onboarding status to determine correct dashboard path
  const { isOnboardingComplete } = useOnboardingStatus();

  // Determine the correct path for Dashboard button
  const dashboardPath = hasActiveSubscription
    ? (isOnboardingComplete ? '/business/dashboard' : '/business/onboarding')
    : null;

  // Update nav links based on auth status and subscription
  const navLinks: NavLink[] = [
    { name: 'Home', action: () => {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }},
    { name: 'Why JaxSaver', section: 'features' },
    { name: 'Automation', section: 'how-it-works' },
    // If signed in WITH active subscription → Dashboard (or Onboarding if not complete)
    // If signed in WITHOUT active subscription → Complete Signup (go to pricing page)
    // If not signed in → Get Started (go to pricing page)
    isSignedIn
      ? (hasActiveSubscription && dashboardPath
          ? { name: 'Dashboard', path: dashboardPath }
          : { name: 'Complete Signup', path: '/pricing' })
      : { name: 'Get Started', action: () => {
          trackGetStartedClick('nav', 'signed_out');
          navigate('/pricing');
        }
      },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home with hash
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setIsMenuOpen(false);
      return;
    }

    // On home page, scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = (link: NavLink) => {
    // Track navigation click
    trackNavClick(link.name.toLowerCase().replace(' ', '_'));

    if (link.action) {
      link.action();
      setIsMenuOpen(false);
    } else if (link.external) {
      window.open(link.external, '_blank');
    } else if (link.path) {
      navigate(link.path);
      setIsMenuOpen(false);
    } else if (link.section) {
      scrollToSection(link.section);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      {/* Fixed Header */}
      <AppBar
        position="fixed"
        color="transparent"
        sx={{
          bgcolor: 'transparent !important',
          background: 'transparent !important',
          backgroundColor: 'transparent !important',
          boxShadow: 'none',
          border: 'none',
          borderBottom: 'none',
          zIndex: 1300,
          '&.MuiAppBar-colorPrimary': {
            backgroundColor: 'transparent !important',
            color: 'inherit'
          }
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200, // MUI lg container default
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            justifyContent: 'space-between',
            minHeight: '64px !important',
            height: '64px',
            bgcolor: 'transparent'
          }}
        >
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <Box
              component="img"
              src="/jaxsaver-golden-logo.svg"
              alt="JaxSaver Logo"
              sx={{
                height: { xs: 32, sm: 64, md: 32 },
                width: 'auto'
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '1.5rem' }}>
            {navLinks.map((link, index) => {
              // Special styling for Dashboard button (last item when logged in with subscription)
              const isDashboard = isSignedIn && hasActiveSubscription && index === navLinks.length - 1;
              // Special styling for View Plans button (last item when logged in WITHOUT subscription)
              const isPricing = isSignedIn && !hasActiveSubscription && index === navLinks.length - 1;
              const isActionButton = isDashboard || isPricing;

              return (
                <Box
                  key={link.name}
                  component="button"
                  onClick={() => handleNavClick(link)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: isActionButton ? '1rem' : '0.25rem',
                    py: isActionButton ? '0.5rem' : '0.25rem',
                    border: isActionButton ? '2px solid #fbbf24' : 'none',
                    background: isActionButton ? '#fbbf24' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: isActionButton ? 700 : 500,
                    color: isActionButton ? 'white' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: isActionButton ? '6px' : '0',
                    borderBottom: isActionButton ? 'none' : '2px solid transparent',
                    boxShadow: isActionButton ? '0 2px 8px rgba(251, 191, 36, 0.3)' : 'none',
                    '&:hover': {
                      color: isActionButton ? 'white' : '#fbbf24',
                      borderBottomColor: isActionButton ? 'transparent' : '#fbbf24',
                      background: isActionButton ? '#f59e0b' : 'transparent',
                      transform: isActionButton ? 'translateY(-2px)' : 'none',
                      boxShadow: isActionButton ? '0 4px 12px rgba(251, 191, 36, 0.4)' : 'none',
                    }
                  }}
                >
                  {link.name}
                </Box>
              );
            })}

            {/* UserButton for logged-in users */}
            {isSignedIn && (
              <Box sx={{ ml: 1 }}>
                <UserButton />
              </Box>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            sx={{
              display: { xs: 'block', md: 'none' },
              color: theme.palette.text.secondary,
              p: 1,
              borderRadius: 1.5,
              '&:hover': {
                color: theme.palette.text.primary
              }
            }}
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </IconButton>
        </Toolbar>

        {/* Mobile Menu */}
        {isMenuOpen && windowWidth < 768 && (
          <Box>
            <Box sx={{ pt: 1, pb: 1.5 }}>
              {navLinks.map((link, index) => {
                // Special styling for Dashboard button (last item when logged in with subscription)
                const isDashboard = isSignedIn && hasActiveSubscription && index === navLinks.length - 1;
                // Special styling for View Plans button (last item when logged in WITHOUT subscription)
                const isPricing = isSignedIn && !hasActiveSubscription && index === navLinks.length - 1;
                const isActionButton = isDashboard || isPricing;

                return (
                  <Box
                    key={link.name}
                    component="button"
                    onClick={() => handleNavClick(link)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      pl: 3,
                      pr: 4,
                      py: isActionButton ? 1.5 : 1,
                      border: 'none',
                      borderLeft: isActionButton ? '4px solid #fbbf24' : '4px solid transparent',
                      fontSize: '1rem',
                      fontWeight: isActionButton ? 700 : 500,
                      color: isActionButton ? '#fbbf24' : '#64748b',
                      bgcolor: isActionButton ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        color: isActionButton ? '#f59e0b' : '#1e293b',
                        bgcolor: isActionButton ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                        borderLeftColor: '#fbbf24'
                      }
                    }}
                  >
                    {link.name}
                  </Box>
                );
              })}

              {/* UserButton in mobile menu for logged-in users */}
              {isSignedIn && (
                <Box sx={{ pl: 3, pt: 2, pb: 1 }}>
                  <UserButton />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </AppBar>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <Box
          onClick={() => setIsMenuOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.25)',
            zIndex: 40
          }}
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%'
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <LandingFooter />
      </Box>
    </Box>
  );
};
