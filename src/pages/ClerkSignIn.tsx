import React, { useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Box, Container, useTheme, Typography, Alert } from '@mui/material';
import { usePageTitle } from '../hooks/usePageTitle';

const ClerkSignIn: React.FC = () => {
  usePageTitle('Sign In');
  const theme = useTheme();
  
  useEffect(() => {
    console.log('[ClerkSignIn] Component mounted');
    console.log('[ClerkSignIn] Window location:', window.location.href);
    console.log('[ClerkSignIn] Redirect URLs:', {
      redirectUrl: '/business/dashboard',
      signUpUrl: '/register',
      forceRedirectUrl: '/business/dashboard'
    });
    
    // Log any Clerk errors or state changes
    const checkClerkStatus = () => {
      if (window.Clerk) {
        console.log('[ClerkSignIn] Clerk loaded:', {
          isReady: window.Clerk.isReady,
          session: window.Clerk.session,
          user: window.Clerk.user
        });
      } else {
        console.log('[ClerkSignIn] Clerk not yet loaded');
      }
    };
    
    // Check immediately and after a delay
    checkClerkStatus();
    const timeoutId = setTimeout(checkClerkStatus, 1000);
    
    return () => {
      console.log('[ClerkSignIn] Component unmounting');
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
            <Typography variant="body2">
              <strong>Test Account:</strong> josh@somethingelse.com / Team1234!<br />
              <strong>Debug Tools:</strong> Press <strong>Ctrl+Shift+D</strong> or visit <strong>/auth-debug</strong>
            </Typography>
          </Alert>
        )}
        
        <SignIn
          redirectUrl="/business/dashboard"
          signUpUrl="/register"
          forceRedirectUrl="/business/dashboard"
        />
      </Box>
    </Container>
  );
};

export default ClerkSignIn;