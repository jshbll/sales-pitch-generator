import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser, useClerk, UserButton } from '@clerk/clerk-react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  Drawer,
  Badge,
  Tooltip,
  Paper,
  ClickAwayListener,
  Grow,
  Popper,
  Button,
  alpha,
  ListItemAvatar,
  CircularProgress,
  ListItemButton,
  Switch,
} from '@mui/material';
import {
  Home as HomeIcon,
  Event as EventIcon,
  LocalOffer as PromotionsIcon,
  Notifications as NotificationsIcon,
  Add as CreateIcon,
  AccountCircle as ProfileIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Flag as ReportIcon,
  LocalOffer as TagIcon,
  BarChart as ChartIcon,
  Business as BusinessIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  PersonAdd as PersonAddIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ManageAccounts as ManageAccountsIcon,
  BugReport as BugReportIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useExitConfirmation } from '../../contexts/ExitConfirmationContext';
import BugReportDialog from '../common/BugReportDialog';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface BusinessSidebarNavigationProps {
  onCreateClick?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  // Mobile-specific props
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

const BusinessSidebarNavigation: React.FC<BusinessSidebarNavigationProps> = ({
  onCreateClick,
  collapsed = false,
  onToggleCollapse,
  drawerOpen: externalDrawerOpen,
  onDrawerClose: externalOnDrawerClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { user: clerkUser, isLoaded: clerkIsLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const { toggleTheme, mode } = useThemeMode();
  const { handleNavigate } = useExitConfirmation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Use a stable reference for auth state to prevent flickering
  const [stableAuthState, setStableAuthState] = useState<{
    isLoaded: boolean;
    isSignedIn: boolean;
  }>({ isLoaded: false, isSignedIn: false });
  
  // Update stable auth state only when Clerk is fully loaded
  useEffect(() => {
    if (clerkIsLoaded) {
      setStableAuthState({ isLoaded: true, isSignedIn: isSignedIn || false });
    }
  }, [clerkIsLoaded, isSignedIn]);
  
  // Get businessId from user
  const businessId = user?.businessId || user?.id;
  
  // State for mobile menu, create menu, notifications, and drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  // Use external drawer state if provided, otherwise use internal state
  const drawerOpen = externalDrawerOpen !== undefined ? externalDrawerOpen : internalDrawerOpen;
  const setDrawerOpen = externalOnDrawerClose !== undefined
    ? (open: boolean) => {
        if (!open) externalOnDrawerClose();
        else setInternalDrawerOpen(true);
      }
    : setInternalDrawerOpen;
  
  // References for the notification menu anchors
  const notificationsBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch notifications from Convex
  const notifications = useQuery(
    api.businessNotifications.getBusinessNotifications,
    businessId ? {
      businessId: businessId as any,
      limit: 5,
      onlyUnread: false
    } : 'skip'
  );
  
  const unreadCount = useQuery(
    api.businessNotifications.getUnreadCount,
    businessId ? {
      businessId: businessId as any
    } : 'skip'
  ) || 0;
  
  // Mutations
  const markAsRead = useMutation(api.businessNotifications.markAsRead);
  const markAllAsRead = useMutation(api.businessNotifications.markAllAsRead);

  // Navigation items for business management
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
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

    if (isAuthenticated) {
      baseItems.push(
        {
          id: 'create',
          label: 'Create',
          icon: <CreateIcon />,
          path: '#', // Will be handled by dropdown
        }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Create menu items
  const createMenuItems = [
    { id: 'create-promotion', label: 'Create Promotion', icon: <PromotionsIcon />, path: '/business/promotions/create' },
    { id: 'create-event', label: 'Create Event', icon: <EventIcon />, path: '/business/events/create' },
  ];

  const handleNavigation = (item: NavigationItem, event?: React.MouseEvent<HTMLElement>) => {
    if (item.id === 'create') {
      // Open create menu instead of navigating
      if (event) {
        setCreateMenuAnchor(event.currentTarget);
      }
    // Notifications hidden until feature is implemented
    // } else if (item.id === 'notifications') {
    //   // Toggle notifications popup
    //   setNotificationsOpen(!notificationsOpen);
    } else {
      console.log('[BusinessSidebarNavigation] Navigating to:', item.path);
      handleNavigate(item.path);
    }
    setMobileMenuOpen(false);
  };

  const handleCreateMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };
  
  // Close notifications menu when clicking away
  const handleCloseNotifications = (event: MouseEvent | TouchEvent) => {
    if (
      notificationsBtnRef.current &&
      notificationsBtnRef.current.contains(event.target as Node)
    ) {
      return;
    }
    setNotificationsOpen(false);
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    setNotificationsOpen(false);
    
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead({ notificationId: notification._id });
    }
    
    // Navigate to action URL if provided
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (businessId) {
      await markAllAsRead({ businessId: businessId as any });
    }
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return <PersonAddIcon fontSize="small" />;
      case 'payment_received':
      case 'payment_failed':
        return <PaymentIcon fontSize="small" />;
      case 'newsletter_booked':
      case 'event_reminder':
        return <EventIcon fontSize="small" />;
      case 'promotion_view':
      case 'promotion_saved':
        return <TagIcon fontSize="small" />;
      case 'review_received':
        return <StarIcon fontSize="small" />;
      case 'subscription_updated':
        return <WarningIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Get avatar color for priority
  const getAvatarColor = (priority: string, type: string) => {
    if (priority === 'high') return theme.palette.error.light;
    if (priority === 'low') return theme.palette.grey[300];
    
    // Default colors by type
    switch (type) {
      case 'payment_received':
      case 'newsletter_booked':
        return theme.palette.success.light;
      case 'payment_failed':
        return theme.palette.error.light;
      case 'new_follower':
      case 'promotion_view':
        return theme.palette.primary.light;
      default:
        return theme.palette.info.light;
    }
  };

  const handleCreateMenuItem = (path: string) => {
    handleCreateMenuClose();
    console.log('[BusinessSidebarNavigation] Create menu item clicked, navigating to:', path);
    handleNavigate(path);
  };

  const isActivePath = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemPath);
  };

  // Mobile Bottom Navigation - now handled by MobileBottomNavigation component
  // This component only handles the drawer menu for mobile
  if (isMobile) {

    // All items for the drawer menu
    const drawerMenuItems = [
      {
        id: 'divider1',
        type: 'divider',
      },
      {
        id: 'create-promotion',
        label: 'Create Promotion',
        icon: <TagIcon />,
        path: '/business/promotions/create',
      },
      {
        id: 'create-event',
        label: 'Create Event',
        icon: <EventIcon />,
        path: '/business/events/create',
      },
      {
        id: 'divider2',
        type: 'divider',
      },
      {
        id: 'dark-mode',
        label: 'Dark Mode',
        icon: mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />,
        action: 'toggle-theme',
        isSwitch: true,
      },
      {
        id: 'report',
        label: 'Report a Problem',
        icon: <BugReportIcon />,
        action: 'report',
      },
      {
        id: 'divider3',
        type: 'divider',
      },
      {
        id: 'sign-out',
        label: 'Sign Out',
        icon: <LogoutIcon />,
        action: 'sign-out',
      },
    ];

    const handleDrawerItemClick = (item: any) => {
      if (item.action === 'toggle-theme') {
        toggleTheme();
      } else if (item.action === 'report') {
        // Open bug report dialog
        setDrawerOpen(false);
        setBugReportOpen(true);
      } else if (item.action === 'sign-out') {
        // Sign out
        setDrawerOpen(false);
        clerk.signOut();
      } else if (item.path) {
        handleNavigate(item.path);
        setDrawerOpen(false);
      }
    };

    // Prevent body scroll when drawer is open
    useEffect(() => {
      if (drawerOpen) {
        // Store current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
      } else {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    }, [drawerOpen]);

    return (
      <>
        {/* Navigation Drawer */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            // Higher z-index than bottom nav (which is 999)
            zIndex: 1000,
            '& .MuiBackdrop-root': {
              // Backdrop should also be above bottom nav
              zIndex: 1000,
            },
            '& .MuiDrawer-paper': {
              // Height that respects safe areas
              height: 'calc(100vh - env(safe-area-inset-top, 0px))',
              maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px))',
              // Position from top safe area
              top: 'env(safe-area-inset-top, 0px)',
              // Add bottom padding for safe area
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              // Ensure drawer is above bottom nav
              zIndex: 1001,
              // Prevent touch events from affecting elements below
              touchAction: 'none',
            },
          }}
        >
          {/* Fixed Header */}
          <Box sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}>
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Menu</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* User Info with UserButton */}
            {clerkUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Avatar
                    src={clerkUser.imageUrl}
                    alt={clerkUser.fullName || ''}
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {clerkUser.fullName || clerkUser.firstName || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clerkUser.primaryEmailAddress?.emailAddress}
                    </Typography>
                  </Box>
                </Box>
                <UserButton />
              </Box>
            )}
          </Box>

          {/* Scrollable Menu Items */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 2,
            // iOS momentum scrolling
            WebkitOverflowScrolling: 'touch',
            // Allow touch events for scrolling within this area
            touchAction: 'pan-y',
          }}>
            <List>
              {drawerMenuItems.map((item: any) => {
                if (item.type === 'divider') {
                  return <Divider key={item.id} sx={{ my: 1 }} />;
                }

                if (item.isSwitch) {
                  return (
                    <ListItem key={item.id}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      <Switch
                        checked={mode === 'dark'}
                        onChange={() => toggleTheme()}
                      />
                    </ListItem>
                  );
                }

                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => handleDrawerItemClick(item)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>

        {/* Create Menu for Mobile */}
        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCreateMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          {createMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleCreateMenuItem(item.path)}
              sx={{ minWidth: 240 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          ))}
        </Menu>

        {/* Bug Report Dialog */}
        <BugReportDialog open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
      </>
    );
  }

  // Desktop/Tablet Sidebar
  const sidebarWidth = (isTablet || collapsed) ? 72 : 244; // Collapsed on tablet or when manually collapsed

  return (
    <Box
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        // Use multiple height strategies for iOS Safari compatibility
        height: '100vh',
        // Fallback for iOS Safari using @supports
        '@supports (-webkit-touch-callout: none)': {
          height: '-webkit-fill-available',
        },
        // Modern dynamic viewport height
        '@supports (height: 100dvh)': {
          height: '100dvh',
        },
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent outer scrollbar
        transition: theme.transitions.create(['width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ p: 3, pb: 2 }}>
        {isTablet || collapsed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/jaxsaver-golden-logo.svg"
              alt="JaxSaver"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                width: 'auto',
                maxHeight: '40px'
              }}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box
              component="img"
              src="/jaxsaver-golden-logo.svg"
              alt="JaxSaver"
              sx={{
                maxWidth: '180px',
                height: 'auto',
                width: 'auto'
              }}
            />
          </Box>
        )}
      </Box>

      {/* Navigation Items */}
      <List sx={{ 
        flexGrow: 1, 
        px: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.action.disabled,
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },
        },
      }}>
        {navigationItems.map((item) => (
          <Tooltip 
            key={item.id}
            title={collapsed ? item.label : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItem
              onClick={(event) => handleNavigation(item, event)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                mb: 0.5,
                backgroundColor: isActivePath(item.path) ? 
                  theme.palette.action.selected : 
                  'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon 
                sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}
                ref={item.id === 'notifications' ? notificationsBtnRef : undefined}
              >
                {item.badge && item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {!isTablet && !collapsed && (
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActivePath(item.path) ? 600 : 400,
                    },
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
        
        {/* Notifications - hidden until feature is implemented */}
        {/* {isAuthenticated && (
          <Tooltip 
            title={collapsed ? "Notifications" : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItem
              onClick={() => handleNavigation({ id: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, path: 'notifications' })}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon 
                sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}
                ref={notificationsBtnRef}
              >
                {unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                ) : (
                  <NotificationsIcon />
                )}
              </ListItemIcon>
              {!isTablet && !collapsed && (
                <ListItemText 
                  primary="Notifications"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 400,
                    },
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        )} */}
      </List>

      {/* Bottom Section */}
      <Box sx={{
        p: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}>
        {/* User Button - Clerk's prebuilt component with account dropdown */}
        <Tooltip title={collapsed ? "Profile" : ""} placement="right">
          <ListItem
            onClick={() => {
              // Find and click the UserButton to open the profile modal
              const userButtonElement = document.querySelector('.cl-userButtonTrigger') as HTMLElement;
              if (userButtonElement) {
                userButtonElement.click();
              }
            }}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'var(--nav-item-default)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}>
              <UserButton />
            </ListItemIcon>
            {!isTablet && !collapsed && <ListItemText primary="Profile" />}
          </ListItem>
        </Tooltip>

        {/* Dark Mode Toggle */}
        <Tooltip title={collapsed ? `Switch to ${mode === 'light' ? 'dark' : 'light'} mode` : ""} placement="right">
          <ListItem
            onClick={toggleTheme}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </ListItemIcon>
            {!isTablet && !collapsed && <ListItemText primary={`${mode === 'light' ? 'Dark' : 'Light'} mode`} />}
          </ListItem>
        </Tooltip>

        {/* Report a Problem */}
        <Tooltip title={collapsed ? "Report a problem" : ""} placement="right">
          <ListItem
            onClick={() => setBugReportOpen(true)}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}>
              <BugReportIcon />
            </ListItemIcon>
            {!isTablet && !collapsed && <ListItemText primary="Report a problem" />}
          </ListItem>
        </Tooltip>

        {/* Sign Out */}
        <Tooltip title={collapsed ? "Sign out" : ""} placement="right">
          <ListItem
            onClick={() => clerk.signOut()}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            {!isTablet && !collapsed && <ListItemText primary="Sign out" />}
          </ListItem>
        </Tooltip>

        {/* Collapse Toggle Button - Only show on desktop - At the very bottom */}
        {!isMobile && onToggleCollapse && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <ListItem
              onClick={() => onToggleCollapse(!collapsed)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: (isTablet || collapsed) ? 'auto' : 40 }}>
                {collapsed ? <ExpandIcon /> : <CollapseIcon />}
              </ListItemIcon>
              {!isTablet && !collapsed && <ListItemText primary="Collapse" />}
            </ListItem>
          </Tooltip>
        )}

        {/* Create Menu */}
        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCreateMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              minWidth: 240,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          {createMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleCreateMenuItem(item.path)}
              sx={{ 
                py: 1.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          ))}
        </Menu>
        
        {/* Notifications Popper - hidden until feature is implemented */}
        {/* <Popper
          open={notificationsOpen}
          anchorEl={notificationsBtnRef.current}
          role={undefined}
          placement="right-start"
          transition
          disablePortal
          sx={{ zIndex: (theme) => theme.zIndex.drawer }} // 1200 - below modals
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'left top' }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 320, 
                  maxWidth: '100%',
                  ml: 1,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <ClickAwayListener onClickAway={handleCloseNotifications}>
                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: `1px solid ${alpha('#000', 0.05)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Typography 
                          variant="caption" 
                          color="primary" 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={handleMarkAllAsRead}
                        >
                          Mark all as read
                        </Typography>
                      )}
                    </Box>
                    
                    <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
                      {!notifications ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No notifications yet
                          </Typography>
                        </Box>
                      ) : (
                        notifications.map((notification: any, index: number) => (
                          <ListItem
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                              borderBottom: index < notifications.length - 1 ? `1px solid ${alpha('#000', 0.05)}` : 'none',
                              cursor: 'pointer',
                              backgroundColor: !notification.is_read ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.action.hover, 0.08)
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: getAvatarColor(notification.priority, notification.type) }}>
                                {getNotificationIcon(notification.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={notification.is_read ? 400 : 600}
                              >
                                {notification.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {notification.message}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                display="block" 
                                color="text.secondary" 
                                sx={{ mt: 0.5 }}
                              >
                                {formatDistanceToNow(notification.created_at, { addSuffix: true })}
                              </Typography>
                            </Box>
                            {!notification.is_read && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  ml: 1
                                }}
                              />
                            )}
                          </ListItem>
                        ))
                      )}
                    </List>
                    
                    <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${alpha('#000', 0.05)}` }}>
                      <Button 
                        size="small" 
                        onClick={() => {
                          console.log('View all notifications clicked - navigating...');
                          setNotificationsOpen(false);
                          // Navigate to full notifications page
                          navigate('/business/notifications');
                        }}
                        sx={{ 
                          textTransform: 'none', 
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04)
                          }
                        }}
                      >
                        View all notifications
                      </Button>
                    </Box>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper> */}

        {/* Bug Report Dialog */}
        <BugReportDialog open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
      </Box>
    </Box>
  );
};

export default BusinessSidebarNavigation;