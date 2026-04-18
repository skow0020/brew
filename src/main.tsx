import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { theme } from './theme'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background:
              'radial-gradient(circle at 10% -20%, rgba(161, 67, 24, 0.2), transparent 45%), radial-gradient(circle at 100% 0%, rgba(127, 47, 15, 0.18), transparent 35%), linear-gradient(175deg, #f3eee4 0%, #f9f4e8 100%)',
          },
          '.skip-link': {
            position: 'absolute',
            left: '1rem',
            top: '-120px',
            zIndex: 2000,
            padding: '0.6rem 0.8rem',
            borderRadius: '0.5rem',
            background: '#231b16',
            color: '#fffaf0',
            textDecoration: 'none',
            fontWeight: 700,
          },
          '.skip-link:focus': {
            top: '1rem',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
