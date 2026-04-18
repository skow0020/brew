import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo/useSeo'

export function NotFoundPage() {
  useSeo({
    title: 'Page Not Found',
    description: 'The page you requested could not be found at brew Brewing.',
    path: '/404',
    imagePath: '/og-home.svg',
  })

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
          404
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, lineHeight: 0.92 }}>
          Page Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.8 }}>
          We could not find that page. Head back to explore beers, events, and taproom info.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <Button component={Link} to="/" variant="contained">
            Go to Home
          </Button>
          <Button component={Link} to="/beers" variant="outlined">
            View Beers
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
