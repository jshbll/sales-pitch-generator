import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useThemeMode } from '../contexts/ThemeContext';

interface ClerkWithThemeProps {
  publishableKey: string;
  children: ReactNode;
}

/**
 * ClerkWithTheme - Minimal Clerk wrapper with theme support
 *
 * Applies Clerk's dark theme at provider level to ensure all components
 * (including UserButton dropdown/modal) inherit the theme consistently
 */
const ClerkWithTheme: React.FC<ClerkWithThemeProps> = ({ publishableKey, children }) => {
  const { mode } = useThemeMode();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      appearance={{
        theme: mode === 'dark' ? dark : undefined,
      }}
      navigate={(to) => {
        console.log('[ClerkProvider] Navigation intercepted:', to);
        if (to === '/' || to === '/business' || to === '/business/dashboard') {
          window.location.href = to;
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkWithTheme;
