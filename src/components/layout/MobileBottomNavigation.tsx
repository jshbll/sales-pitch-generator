import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Event as EventIcon,
  LocalOffer as PromotionsIcon,
  Business as BusinessIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExitConfirmation } from '../../contexts/ExitConfirmationContext';

interface MobileBottomNavigationProps {
  onMenuClick: () => void;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  onMenuClick,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleNavigate } = useExitConfirmation();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Essential mobile navigation items
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <HomeIcon />,
      path: '/business/dashboard',
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: <PromotionsIcon />,
      path: '/business/promotions',
    },
    {
      id: 'events',
      label: 'Events',
      icon: <EventIcon />,
      path: '/business/events',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <BusinessIcon />,
      path: '/business/profile',
    },
  ];

  // Detect keyboard visibility to hide bottom navigation
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Only update state if value is actually changing to prevent unnecessary re-renders
        setIsKeyboardVisible(prev => prev === true ? prev : true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Only update state if value is actually changing to prevent unnecessary re-renders
        setIsKeyboardVisible(prev => prev === false ? prev : false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleNavigation = (path: string) => {
    handleNavigate(path);
  };

  const isActivePath = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemPath);
  };

  // Prevent scroll events from propagating when touching the nav
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent scroll from starting on the bottom nav
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent any scroll movement when touching the nav
    e.preventDefault();
    e.stopPropagation();
  };

  // Hide when keyboard is visible
  if (isKeyboardVisible) {
    return null;
  }

  // Render directly to body using portal for maximum isolation
  const bottomNav = (
    <div
      className="mobile-bottom-nav-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <BottomNavigation
        showLabels
        sx={{
          width: '100%',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          // Remove any conflicting position styles from MUI
          position: 'relative !important',
          // iOS safe area handled by wrapper
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          // Prevent text selection on touch
          userSelect: 'none',
          WebkitUserSelect: 'none',
          // Prevent iOS callout menu
          WebkitTouchCallout: 'none',
        }}
      >
      {navigationItems.map((item) => (
        <BottomNavigationAction
          key={item.id}
          icon={item.icon}
          label={item.label}
          onClick={() => handleNavigation(item.path)}
          sx={{
            color: isActivePath(item.path)
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
            '&.Mui-selected': {
              color: theme.palette.text.primary,
            },
          }}
        />
      ))}
      {/* Hamburger Menu Button */}
      <BottomNavigationAction
        icon={<MenuIcon />}
        label="More"
        onClick={onMenuClick}
        sx={{
          color: theme.palette.text.secondary,
        }}
      />
    </BottomNavigation>
    </div>
  );

  // Portal to document.body for complete isolation
  return typeof document !== 'undefined' ? createPortal(bottomNav, document.body) : null;
};

export default MobileBottomNavigation;
