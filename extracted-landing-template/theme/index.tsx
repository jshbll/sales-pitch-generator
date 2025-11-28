import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

// Import Fontsource fonts
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';

// Theme modules
import createPalette from './palette';
import createTypography from './typography';
import createCustomShadowTheme from './shadows';
import createComponentOverrides from './componentOverrides';

// Theme configuration interface
interface ThemeConfig {
  mode: 'light' | 'dark';
  fontFamily?: string;
  borderRadius?: number;
}

// Create the complete theme
export function createJaxSaverTheme(config: ThemeConfig) {
  const { 
    mode = 'light', 
    fontFamily = '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    borderRadius = 8 
  } = config;

  // Create base theme with palette
  const paletteTheme = createPalette(mode);
  
  // Create typography
  const typography = createTypography(paletteTheme, fontFamily);
  
  // Create custom shadows
  const customShadows = createCustomShadowTheme(mode, paletteTheme);
  
  // Create final theme with all configurations
  const theme = createTheme({
    palette: paletteTheme.palette,
    typography,
    customShadows,
    shape: {
      borderRadius,
    },
    spacing: 8, // 8px base spacing unit
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
    mixins: {
      toolbar: {
        minHeight: 64,
        '@media (min-width:0px) and (orientation: landscape)': {
          minHeight: 48,
        },
        '@media (min-width:600px)': {
          minHeight: 64,
        },
      },
    },
  });

  // Add component overrides
  theme.components = createComponentOverrides(theme, customShadows);

  return theme;
}

// Theme Provider Component
interface JaxSaverThemeProviderProps {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
  fontFamily?: string;
  borderRadius?: number;
}

export const JaxSaverThemeProvider: React.FC<JaxSaverThemeProviderProps> = ({
  children,
  mode = 'light',
  fontFamily,
  borderRadius,
}) => {
  const theme = createJaxSaverTheme({
    mode,
    fontFamily,
    borderRadius,
  });

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

// Export theme utilities
export { default as createPalette } from './palette';
export { default as createTypography } from './typography';
export { default as createCustomShadowTheme } from './shadows';
export { default as createComponentOverrides } from './componentOverrides';
export type { CustomShadows } from './shadows';

// Default theme instances
export const lightTheme = createJaxSaverTheme({ mode: 'light' });
export const darkTheme = createJaxSaverTheme({ mode: 'dark' });

export default createJaxSaverTheme;