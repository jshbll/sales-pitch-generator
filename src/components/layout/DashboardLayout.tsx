import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Badge,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  NavigateNext as NavigateNextIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Navigation configuration
const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    description: 'Business overview and metrics',
  },
  {
    id: 'profile',
    title: 'Business Profile',
    icon: BusinessIcon,
    path: '/profile',
    description: 'Manage your business information',
  },
  {
    id: 'promotions',
    title: 'Promotions',
    icon: CampaignIcon,
    path: '/promotions',
    description: 'Create and manage promotions',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: AnalyticsIcon,
    path: '/analytics',
    description: 'View performance insights',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    description: 'Account and notification settings',
  },
];

// Constants
const DRAWER_WIDTH = 280;
const HEADER_HEIGHT = 72;

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle responsive drawer behavior
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
    ];

    pathSegments.forEach((segment, index) => {
      if (segment !== 'dashboard') {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        breadcrumbs.push({ label, href });
      }
    });

    return breadcrumbs;
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  // Drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          minHeight: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          J
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          JaxSaver
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, p: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  px: 2,
                  py: 1.5,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  backgroundColor: isActive 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.action.hover, 0.04),
                    color: theme.palette.primary.main,
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: isActive ? 24 : 0,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 2px 2px 0',
                    transition: 'height 0.2s ease',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { 
                      display: { xs: 'none', lg: 'block' },
                      mt: 0.5,
                      opacity: 0.7,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.primary.main,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {user?.business_name?.charAt(0) || user?.email?.charAt(0) || 'B'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.business_name || 'Business User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: theme.customShadows.navigation,
        }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
              },
            }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ '& .MuiBreadcrumbs-separator': { color: theme.palette.text.secondary } }}
            >
              {generateBreadcrumbs().map((crumb, index, array) => (
                <Typography
                  key={crumb.href}
                  variant="body2"
                  sx={{
                    color: index === array.length - 1 
                      ? theme.palette.text.primary 
                      : theme.palette.text.secondary,
                    fontWeight: index === array.length - 1 ? 600 : 400,
                    fontSize: '0.875rem',
                  }}
                >
                  {crumb.label}
                </Typography>
              ))}
            </Breadcrumbs>
          </Box>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              sx={{ color: theme.palette.text.secondary }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              onClick={handleProfileMenuOpen}
              sx={{ color: theme.palette.text.secondary }}
            >
              <AccountCircleIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: theme.customShadows.dropdown,
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 2 }}>
                <LogoutIcon fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={() => isMobile && setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? theme.customShadows.z24 : theme.customShadows.navigation,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          minHeight: '100vh',
          pt: `${HEADER_HEIGHT}px`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ p: 3, minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;