import { screen } from '@testing-library/react'
import App from './App'
import { renderWithProviders } from './test/renderWithProviders'

describe('App routes', () => {
  it('renders home page content on root route', async () => {
    renderWithProviders(<App />, { initialEntries: ['/'] })

    expect(await screen.findByRole('heading', { name: /fresh beer. great people. zero pretense./i })).toBeInTheDocument()
  })

  it('renders not found page for unknown routes', async () => {
    renderWithProviders(<App />, { initialEntries: ['/missing-page'] })

    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
