import React from 'react';
import { Box, Drawer } from '@mui/material';

interface BusinessSidebarNavigationProps {
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

/**
 * BusinessSidebarNavigation - Stub component
 * The full implementation requires Clerk and Convex which are not available in this build.
 * This is a placeholder that renders nothing visible.
 */
const BusinessSidebarNavigation: React.FC<BusinessSidebarNavigationProps> = ({
  drawerOpen = false,
  onDrawerClose,
}) => {
  // Stub - renders an empty drawer that can be opened/closed
  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={onDrawerClose}
      sx={{ display: 'none' }}
    >
      <Box sx={{ width: 250 }} />
    </Drawer>
  );
};

export default BusinessSidebarNavigation;
