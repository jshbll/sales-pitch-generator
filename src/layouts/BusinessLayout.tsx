import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import BusinessSidebarNavigation from '../components/layout/BusinessSidebarNavigation';

interface BusinessLayoutProps {
  children: ReactNode;
}

const BusinessLayout: React.FC<BusinessLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <BusinessSidebarNavigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default BusinessLayout;
