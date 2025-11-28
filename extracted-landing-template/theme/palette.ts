import { createTheme, Theme } from '@mui/material/styles';

export interface CustomPaletteOptions {
  primary: {
    light: string;
    main: string;
    dark: string;
    200: string;
    800: string;
  };
  secondary: {
    light: string;
    main: string;
    dark: string;
    200: string;
    800: string;
  };
  orange: {
    light: string;
    main: string;
    dark: string;
  };
  success: {
    light: string;
    200: string;
    main: string;
    dark: string;
  };
  grey: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  dark: {
    light: string;
    main: string;
    dark: string;
    800: string;
    900: string;
  };
}

// JaxSaver Florida-inspired color palette
const colors = {
  // Primary (Teal/Ocean)
  primaryLight: '#4DB6AC',
  primaryMain: '#00796B',
  primaryDark: '#004D40',
  primary200: '#80CBC4',
  primary800: '#00695C',

  // Secondary (Coral/Sunset)
  secondaryLight: '#FFAB91',
  secondaryMain: '#FF7043',
  secondaryDark: '#F4511E',
  secondary200: '#FFCCBC',
  secondary800: '#E64A19',

  // Orange (Citrus)
  orangeLight: '#FFB74D',
  orangeMain: '#FF9800',
  orangeDark: '#F57C00',

  // Success (Tropical Green)
  successLight: '#81C784',
  success200: '#A5D6A7',
  successMain: '#4CAF50',
  successDark: '#388E3C',

  // Error
  errorLight: '#E57373',
  errorMain: '#F44336',
  errorDark: '#D32F2F',

  // Warning
  warningLight: '#FFD54F',
  warningMain: '#FFC107',
  warningDark: '#FFA000',

  // Grey scale
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Dark theme
  darkTextPrimary: '#FFFFFF',
  darkLevel1: '#1E293B',
  darkLevel2: '#334155',
  darkBackground: '#0F172A',
  darkPaper: '#1E293B',

  // Paper/Background
  paper: '#FFFFFF',
  backgroundDefault: '#FDFCF7', // Sandy off-white for Florida feel
};

export default function createPalette(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      common: {
        black: colors.darkPaper,
        white: '#FFFFFF',
      },
      primary: {
        light: colors.primaryLight,
        main: colors.primaryMain,
        dark: colors.primaryDark,
        contrastText: '#FFFFFF',
        // Custom shades
        ...(colors as any),
      },
      secondary: {
        light: colors.secondaryLight,
        main: colors.secondaryMain,
        dark: colors.secondaryDark,
        contrastText: '#FFFFFF',
      },
      error: {
        light: colors.errorLight,
        main: colors.errorMain,
        dark: colors.errorDark,
        contrastText: '#FFFFFF',
      },
      warning: {
        light: colors.warningLight,
        main: colors.warningMain,
        dark: colors.warningDark,
        contrastText: colors.grey700,
      },
      success: {
        light: colors.successLight,
        main: colors.successMain,
        dark: colors.successDark,
        contrastText: '#FFFFFF',
      },
      grey: {
        50: colors.grey50,
        100: colors.grey100,
        200: colors.grey200,
        300: colors.grey300,
        400: colors.grey400,
        500: colors.grey500,
        600: colors.grey600,
        700: colors.grey700,
        800: colors.grey800,
        900: colors.grey900,
      },
      text: {
        primary: mode === 'dark' ? colors.darkTextPrimary : colors.grey700,
        secondary: mode === 'dark' ? colors.grey400 : colors.grey500,
        disabled: mode === 'dark' ? colors.grey600 : colors.grey400,
      },
      divider: mode === 'dark' ? colors.grey800 : colors.grey200,
      background: {
        paper: mode === 'dark' ? colors.darkPaper : colors.paper,
        default: mode === 'dark' ? colors.darkBackground : colors.backgroundDefault,
      },
      action: {
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
  });
}

// Extend the theme's palette interface
declare module '@mui/material/styles' {
  interface Palette {
    orange: Palette['primary'];
    dark: Palette['primary'];
  }

  interface PaletteOptions {
    orange?: PaletteOptions['primary'];
    dark?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    200?: string;
    800?: string;
  }

  interface SimplePaletteColorOptions {
    200?: string;
    800?: string;
  }
}