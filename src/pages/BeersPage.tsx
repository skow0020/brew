import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { fallbackSiteContent } from '../data/siteData'
import { useSiteContent } from '../hooks/useSiteContent'
import { useTapList } from '../hooks/useTapList'
import { beerListSchema } from '../lib/seo/schemas'
import { useSeo } from '../lib/seo/useSeo'

export function BeersPage() {
  const { data: siteContent } = useSiteContent()
  const { data: tapListResult, isLoading } = useTapList()
  const cmsBeers = siteContent?.beers ?? fallbackSiteContent.beers
  const beers = tapListResult?.source === 'live' ? tapListResult.beers : cmsBeers
  const tapListLastUpdated =
    tapListResult?.source === 'live'
      ? new Date(tapListResult.lastUpdatedIso).toLocaleString()
      : null
  const breweryInfo = siteContent?.breweryInfo ?? fallbackSiteContent.breweryInfo

  useSeo({
    title: 'Tap List and Seasonal Beers',
    description:
      'Explore the brew Brewing tap list with current pours, seasonal releases, and style details from our Hopkins brewery.',
    path: '/beers',
    imagePath: '/og-beers.svg',
    jsonLd: beerListSchema(breweryInfo, beers),
  })

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Beer Lineup
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, lineHeight: 0.92 }}>
            Current & Seasonal Beers
          </Typography>
          <Typography color="text.secondary">
            Rotating taps with a mix of hop-forward favorites, easy-drinking lagers, and dark classics.
          </Typography>
        </CardContent>
      </Card>

      {isLoading ? <Alert severity="info">Loading tap list...</Alert> : null}
      {tapListResult?.source === 'fallback' && tapListResult?.message ? (
        <Alert severity="warning">{tapListResult.message}</Alert>
      ) : null}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {tapListResult?.source === 'live' ? (
          <Chip
            color="secondary"
            size="small"
            label="Live Tap Feed"
          />
        ) : (
          <Chip color="default" size="small" label="CMS Beer Catalog" />
        )}
        {tapListLastUpdated ? (
          <Typography variant="caption" color="text.secondary">
            Last updated: {tapListLastUpdated}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {beers.map((beer) => (
          <Card key={beer.name}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                  {beer.name}
                </Typography>
                <Chip
                  size="small"
                  color={beer.onTap ? 'secondary' : 'default'}
                  label={beer.onTap ? 'On Tap' : 'Not On Tap'}
                />
              </Stack>
              <Typography variant="body2" color="primary.main" sx={{ mt: 0.3, fontWeight: 700 }}>
                {beer.style} | {beer.abv}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {beer.notes}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      {beers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Tap list is currently unavailable. Please check back soon.
        </Typography>
      ) : null}
    </Stack>
  )
}
