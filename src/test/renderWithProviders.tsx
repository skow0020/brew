import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { theme } from '../theme'

type Options = {
  initialEntries?: string[]
}

export function renderWithProviders(ui: ReactElement, options?: Options) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={options?.initialEntries}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  )
}
