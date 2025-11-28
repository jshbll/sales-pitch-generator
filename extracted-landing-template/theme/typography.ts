import { Theme } from '@mui/material/styles';

export default function createTypography(theme: Theme, fontFamily: string = '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif') {
  return {
    fontFamily,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    
    // Heading styles - Professional and clean
    h1: {
      fontSize: '2.125rem', // 34px
      fontWeight: 700,
      lineHeight: 1.2,
      color: theme.palette.grey[900],
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '1.75rem', // 28px
      fontWeight: 700,
      lineHeight: 1.25,
      color: theme.palette.grey[900],
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      color: theme.palette.grey[900],
      letterSpacing: 0,
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.35,
      color: theme.palette.grey[900],
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.4,
      color: theme.palette.grey[900],
      letterSpacing: 0,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.45,
      color: theme.palette.grey[900],
      letterSpacing: '0.0075em',
    },

    // Subtitle styles
    subtitle1: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: theme.palette.text.primary,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.57,
      color: theme.palette.text.secondary,
      letterSpacing: '0.00714em',
    },

    // Body text
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      color: theme.palette.text.primary,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.57,
      color: theme.palette.text.primary,
      letterSpacing: '0.00714em',
    },

    // Utility text
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.66,
      color: theme.palette.text.secondary,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: 2,
      color: theme.palette.text.secondary,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase' as const,
    },

    // Button text
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.02857em',
      textTransform: 'none' as const, // More modern look
    },

    // Custom variants for business app
    cardTitle: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.4,
      color: theme.palette.grey[900],
    },
    cardSubtitle: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      color: theme.palette.text.secondary,
    },
    sectionTitle: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.3,
      color: theme.palette.grey[900],
      marginBottom: '1rem',
    },
    fieldLabel: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      color: theme.palette.text.primary,
      marginBottom: '0.5rem',
    },
    helperText: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.66,
      color: theme.palette.text.secondary,
    },
    
    // Dashboard specific
    metricTitle: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      color: theme.palette.primary.main,
    },
    metricLabel: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
    },

    // Form input styling
    inputLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.palette.grey[600],
      lineHeight: 1.43,
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
    },
    inputHelper: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: theme.palette.text.secondary,
      lineHeight: 1.66,
      marginTop: '3px',
    },
  };
}

// Extend MUI Typography variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    cardTitle: React.CSSProperties;
    cardSubtitle: React.CSSProperties;
    sectionTitle: React.CSSProperties;
    fieldLabel: React.CSSProperties;
    helperText: React.CSSProperties;
    metricTitle: React.CSSProperties;
    metricLabel: React.CSSProperties;
    inputLabel: React.CSSProperties;
    inputHelper: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    cardTitle?: React.CSSProperties;
    cardSubtitle?: React.CSSProperties;
    sectionTitle?: React.CSSProperties;
    fieldLabel?: React.CSSProperties;
    helperText?: React.CSSProperties;
    metricTitle?: React.CSSProperties;
    metricLabel?: React.CSSProperties;
    inputLabel?: React.CSSProperties;
    inputHelper?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
    cardSubtitle: true;
    sectionTitle: true;
    fieldLabel: true;
    helperText: true;
    metricTitle: true;
    metricLabel: true;
    inputLabel: true;
    inputHelper: true;
  }
}