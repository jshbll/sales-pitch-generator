import React, { ReactNode, useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Button } from '@mui/material';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import LandingFooter from '../components/landing/LandingFooter';

// Check if Clerk is available
const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

interface LandingLayoutProps {
  children: ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', section: 'features' },
    { name: 'How It Works', section: 'how-it-works' },
    { name: 'Get Started', action: () => navigate(HAS_CLERK ? '/pricing' : '/admin/audio-generator') },
  ];

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setIsMenuOpen(false);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = (link: any) => {
    if (link.action) {
      link.action();
      setIsMenuOpen(false);
    } else if (link.path) {
      navigate(link.path);
      setIsMenuOpen(false);
    } else if (link.section) {
      scrollToSection(link.section);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <AppBar
        position="fixed"
        color="transparent"
        sx={{ bgcolor: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="Cold Pitch"
              sx={{ height: { xs: 32, sm: 40 }, width: 'auto' }}
            />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {navLinks.map((link) => (
              <Button
                key={link.name}
                onClick={() => handleNavClick(link)}
                sx={{
                  color: link.name === 'Get Started' ? 'white' : '#64748b',
                  bgcolor: link.name === 'Get Started' ? '#fbbf24' : 'transparent',
                  fontWeight: link.name === 'Get Started' ? 700 : 500,
                  '&:hover': {
                    bgcolor: link.name === 'Get Started' ? '#f59e0b' : 'rgba(0,0,0,0.05)',
                    color: link.name === 'Get Started' ? 'white' : '#1e293b',
                  },
                }}
              >
                {link.name}
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton onClick={() => setIsMenuOpen(!isMenuOpen)} sx={{ display: { xs: 'block', md: 'none' } }}>
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </IconButton>
        </Toolbar>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: 'white', py: 2 }}>
            {navLinks.map((link) => (
              <Button
                key={link.name}
                fullWidth
                onClick={() => handleNavClick(link)}
                sx={{ justifyContent: 'flex-start', pl: 3, py: 1.5, color: '#64748b' }}
              >
                {link.name}
              </Button>
            ))}
          </Box>
        )}
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <LandingFooter />
    </Box>
  );
};

export default LandingLayout;
