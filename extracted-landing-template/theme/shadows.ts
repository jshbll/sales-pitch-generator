import { alpha, Theme } from '@mui/material/styles';

export interface CustomShadows {
  z1: string;
  z8: string;
  z12: string;
  z16: string;
  z20: string;
  z24: string;
  primary: string;
  secondary: string;
  orange: string;
  success: string;
  warning: string;
  error: string;
  card: string;
  dropdown: string;
  dialog: string;
  navigation: string;
}

function createCustomShadows(theme: Theme, baseColor: string): CustomShadows {
  const transparent = alpha(baseColor, 0.15);
  const transparentLight = alpha(baseColor, 0.08);
  
  return {
    // Standard elevation shadows
    z1: `0 1px 3px 0 ${transparentLight}, 0 1px 2px 0 ${alpha(baseColor, 0.06)}`,
    z8: `0 8px 10px 1px ${alpha(baseColor, 0.14)}, 0 3px 14px 2px ${alpha(baseColor, 0.12)}, 0 5px 5px -3px ${alpha(baseColor, 0.20)}`,
    z12: `0 7px 8px -4px ${alpha(baseColor, 0.20)}, 0 12px 17px 2px ${alpha(baseColor, 0.14)}, 0 5px 22px 4px ${alpha(baseColor, 0.12)}`,
    z16: `0 8px 10px -5px ${alpha(baseColor, 0.20)}, 0 16px 24px 2px ${alpha(baseColor, 0.14)}, 0 6px 30px 5px ${alpha(baseColor, 0.12)}`,
    z20: `0 10px 13px -6px ${alpha(baseColor, 0.20)}, 0 20px 31px 3px ${alpha(baseColor, 0.14)}, 0 8px 38px 7px ${alpha(baseColor, 0.12)}`,
    z24: `0 11px 15px -7px ${alpha(baseColor, 0.20)}, 0 24px 38px 3px ${alpha(baseColor, 0.14)}, 0 9px 46px 8px ${alpha(baseColor, 0.12)}`,

    // Color-specific shadows for branded elements
    primary: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.25)}`,
    secondary: `0 4px 20px 0 ${alpha(theme.palette.secondary.main, 0.25)}`,
    orange: `0 4px 20px 0 ${alpha('#FF9800', 0.25)}`,
    success: `0 4px 20px 0 ${alpha(theme.palette.success.main, 0.25)}`,
    warning: `0 4px 20px 0 ${alpha(theme.palette.warning.main, 0.25)}`,
    error: `0 4px 20px 0 ${alpha(theme.palette.error.main, 0.25)}`,

    // Component-specific shadows
    card: `0 2px 8px 0 ${alpha(baseColor, 0.10)}, 0 1px 4px 0 ${alpha(baseColor, 0.06)}`,
    dropdown: `0 8px 24px -4px ${alpha(baseColor, 0.20)}, 0 6px 16px -4px ${alpha(baseColor, 0.12)}`,
    dialog: `0 24px 38px 3px ${alpha(baseColor, 0.14)}, 0 9px 46px 8px ${alpha(baseColor, 0.12)}, 0 11px 15px -7px ${alpha(baseColor, 0.20)}`,
    navigation: `0 2px 12px 0 ${alpha(baseColor, 0.10)}`,
  };
}

export default function createCustomShadowTheme(mode: 'light' | 'dark', theme: Theme): CustomShadows {
  const shadowColor = mode === 'dark' ? '#000000' : '#000000';
  return createCustomShadows(theme, shadowColor);
}

// Create a hook to use custom shadows
export const useCustomShadows = (theme: Theme): CustomShadows => {
  return createCustomShadowTheme(theme.palette.mode, theme);
};

// Extend the theme interface
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
}