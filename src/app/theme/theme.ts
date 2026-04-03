import { alpha, createTheme } from '@mui/material/styles';

import { shellTokens } from '@ui/components/shell/shellTokens';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#edf3f8',
      light: '#f7fbff',
      dark: '#d7e2eb',
      contrastText: '#08111a',
    },
    secondary: {
      main: '#a8c7da',
      light: '#c8ddea',
      dark: '#7fa8bf',
    },
    success: {
      main: '#a6d0be',
    },
    warning: {
      main: '#d9c5a1',
    },
    error: {
      main: '#d7a8a8',
    },
    info: {
      main: '#aac6d8',
    },
    background: {
      default: '#dce3eb',
      paper: '#121820',
    },
    divider: shellTokens.border.subtle,
    text: {
      primary: shellTokens.text.primary,
      secondary: shellTokens.text.secondary,
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    button: {
      fontWeight: 500,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    h1: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          width: '100%',
          minHeight: '100%',
        },
        body: {
          background:
            `radial-gradient(circle at top, ${alpha(shellTokens.surface.canvasTop, 0.92)} 0%, ${alpha(shellTokens.surface.canvasBottom, 0.94)} 38%, #b7c0cb 100%)`,
          color: shellTokens.text.primary,
        },
        '::selection': {
          backgroundColor: alpha('#edf3f8', 0.24),
        },
        '*::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          backgroundColor: alpha('#eef4fa', 0.18),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        container: {
          padding: 8,
        },
        paper: {
          margin: 0,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          '&.MuiDialogContent-dividers': {
            borderTop: 'none',
            borderBottom: 'none',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 34,
          paddingInline: 14,
          borderRadius: shellTokens.radius.sm,
        },
        contained: {
          border: `1px solid ${shellTokens.border.active}`,
          background: alpha('#eef5fb', 0.1),
          color: shellTokens.text.primary,
          boxShadow: shellTokens.shadow.inset,
          '&:hover': {
            background: alpha('#eef5fb', 0.16),
          },
        },
        outlined: {
          borderColor: shellTokens.border.strong,
          background: alpha('#091018', 0.16),
          color: shellTokens.text.primary,
          '&:hover': {
            borderColor: shellTokens.border.active,
            background: alpha('#eef5fb', 0.06),
          },
        },
        text: {
          color: shellTokens.text.secondary,
          '&:hover': {
            background: alpha('#eef5fb', 0.06),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shellTokens.radius.pill,
          borderColor: shellTokens.border.strong,
          background: alpha('#091018', 0.16),
          color: shellTokens.text.secondary,
        },
        filled: {
          background: alpha('#eef5fb', 0.14),
          color: shellTokens.text.primary,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36,
        },
        indicator: {
          height: 1,
          borderRadius: 999,
          backgroundColor: alpha('#eef5fb', 0.72),
        },
        scroller: {
          borderBottom: `1px solid ${shellTokens.border.subtle}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 36,
          paddingInline: 8,
          color: shellTokens.text.muted,
          textTransform: 'none',
          '&.Mui-selected': {
            color: shellTokens.text.primary,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#eef5fb',
        },
        rail: {
          opacity: 1,
          backgroundColor: alpha('#eef5fb', 0.12),
        },
        track: {
          border: 'none',
          backgroundColor: alpha('#eef5fb', 0.48),
        },
        thumb: {
          width: 12,
          height: 12,
          boxShadow: 'none',
          backgroundColor: '#f8fbff',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
          opacity: 1,
          borderRadius: 999,
          backgroundColor: alpha('#eef5fb', 0.12),
        },
        thumb: {
          boxShadow: 'none',
          backgroundColor: '#f8fbff',
        },
        switchBase: {
          '&.Mui-checked': {
            color: '#f8fbff',
            '& + .MuiSwitch-track': {
              backgroundColor: alpha('#eef5fb', 0.28),
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: shellTokens.radius.sm,
          border: `1px solid ${shellTokens.border.subtle}`,
          background: alpha('#091018', 0.34),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: shellTokens.border.subtle,
        },
      },
    },
  },
});
