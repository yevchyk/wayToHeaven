import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c9a45c',
    },
    secondary: {
      main: '#6fb3d2',
    },
    background: {
      default: '#110f14',
      paper: '#1b1822',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Spectral", Georgia, serif',
      fontWeight: 700,
    },
  },
});
