import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8b3a17',
      dark: '#6d2c12',
      light: '#b85d36',
    },
    secondary: {
      main: '#2f6a3e',
      dark: '#20522e',
      light: '#5d9a6d',
    },
    background: {
      default: '#f3eee4',
      paper: '#fffaf2',
    },
    text: {
      primary: '#231b16',
      secondary: '#5b524d',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['"Source Sans 3"', '"Segoe UI"', 'Tahoma', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['"Bebas Neue"', 'Impact', 'sans-serif'].join(','),
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: ['"Bebas Neue"', 'Impact', 'sans-serif'].join(','),
      letterSpacing: '0.02em',
    },
    h3: {
      fontFamily: ['"Bebas Neue"', 'Impact', 'sans-serif'].join(','),
      letterSpacing: '0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #d9c7af',
          boxShadow: '0 16px 40px rgba(56, 28, 10, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
        },
      },
    },
  },
})
