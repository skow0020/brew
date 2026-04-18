import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import LocalBarRoundedIcon from '@mui/icons-material/LocalBarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import { useMutation } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fallbackSiteContent } from '../data/siteData'
import { subscribeToNewsletter } from '../lib/api/newsletterApi'
import { useSiteContent } from '../hooks/useSiteContent'
import { useTapList } from '../hooks/useTapList'
import { trackEvent } from '../lib/analytics/events'
import { localBusinessSchema } from '../lib/seo/schemas'
import { useSeo } from '../lib/seo/useSeo'

export function HomePage() {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const { data: siteContent } = useSiteContent()
  const { data: tapListResult, isLoading: isTapListLoading } = useTapList()

  const newsletterMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: (response) => {
      if (response.ok) {
        setEmail('')
        trackEvent('newsletter_submit_success', 'home')
      } else {
        trackEvent('newsletter_submit_failure', 'home')
      }
      setFeedback(response.message ?? (response.ok ? 'Subscribed successfully.' : 'Subscription failed.'))
    },
    onError: () => {
      trackEvent('newsletter_submit_failure', 'home')
      setFeedback('Subscription failed. Please try again.')
    },
  })

  const cmsBeers = siteContent?.beers ?? fallbackSiteContent.beers
  const beers = tapListResult?.source === 'live' ? tapListResult.beers : cmsBeers
  const tapListLastUpdated =
    tapListResult?.source === 'live'
      ? new Date(tapListResult.lastUpdatedIso).toLocaleString()
      : null
  const events = siteContent?.events ?? []
  const breweryInfo = siteContent?.breweryInfo ?? fallbackSiteContent.breweryInfo
  const taproomHours = siteContent?.taproomHours ?? fallbackSiteContent.taproomHours

  useSeo({
    title: 'Craft Beer in Hopkins',
    description:
      'brew Brewing Co. serves fresh craft beer in Hopkins, MN with a welcoming taproom, events, and online ordering.',
    path: '/',
    imagePath: '/og-home.svg',
    jsonLd: localBusinessSchema(breweryInfo, taproomHours),
  })

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    newsletterMutation.mutate(email)
  }

  return (
    <Stack spacing={2.2}>
      <Card sx={{ borderRadius: 3, background: 'linear-gradient(145deg, rgba(139,58,23,0.1), rgba(255,250,242,1))' }}>
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Now Pouring in Hopkins
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 0.9, mt: 0.5 }}>
            Fresh beer. Great people. Zero pretense.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2, maxWidth: 780 }}>
            {breweryInfo?.tagline}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href={breweryInfo?.orderUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('order_click', 'home')}
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Order Online
            </Button>
            <Button component={Link} to="/taproom" variant="outlined" size="large">
              Plan Your Visit
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <LocalBarRoundedIcon color="primary" />
                <Typography variant="h3" sx={{ fontSize: '2.05rem' }}>
                  Featured Tap List
                </Typography>
              </Stack>
              {isTapListLoading ? <Alert severity="info" sx={{ mb: 1 }}>Loading live tap list...</Alert> : null}
              {tapListResult?.source === 'fallback' && tapListResult?.message ? (
                <Alert severity="warning" sx={{ mb: 1 }}>{tapListResult.message}</Alert>
              ) : null}
              {tapListLastUpdated ? (
                <Typography variant="caption" color="text.secondary">
                  Last updated: {tapListLastUpdated}
                </Typography>
              ) : null}

              <Stack spacing={1.2} sx={{ mt: 1.2 }}>
                {beers.slice(0, 3).map((beer, index) => (
                  <Box key={beer.name}>
                    {index > 0 ? <Divider sx={{ mb: 1.1 }} /> : null}
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{beer.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {beer.style} | {beer.abv}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={beer.onTap ? 'secondary' : 'default'}
                        label={beer.onTap ? 'On Tap' : 'Rotating Back Soon'}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
              {beers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No tap items available right now.
                </Typography>
              ) : null}
              <MuiLink component={Link} to="/beers" underline="hover" sx={{ mt: 1.5, display: 'inline-block' }}>
                View full beer lineup
              </MuiLink>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <EventRoundedIcon color="primary" />
                <Typography variant="h3" sx={{ fontSize: '2.05rem' }}>
                  Upcoming Events
                </Typography>
              </Stack>
              <Stack spacing={1.2}>
                {events.slice(0, 3).map((event, index) => (
                  <Box key={event.title}>
                    {index > 0 ? <Divider sx={{ mb: 1.1 }} /> : null}
                    <Typography sx={{ fontWeight: 700 }}>{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.day} | {event.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              {events.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No upcoming events posted yet.
                </Typography>
              ) : null}
              <MuiLink component={Link} to="/events" underline="hover" sx={{ mt: 1.5, display: 'inline-block' }}>
                Explore all events
              </MuiLink>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ background: 'linear-gradient(120deg, rgba(139,58,23,0.08), #fffaf2)' }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontSize: '2.05rem' }}>
            {breweryInfo?.newsletterCta}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            No spam, only fresh pours and community happenings.
          </Typography>
          <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ mt: 1.4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                id="newsletter-email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" variant="contained" disabled={newsletterMutation.isPending} sx={{ minWidth: 140 }}>
                {newsletterMutation.isPending ? 'Submitting...' : 'Subscribe'}
              </Button>
            </Stack>
          </Box>
          {feedback ? (
            <Alert severity={feedback.toLowerCase().includes('failed') ? 'error' : 'success'} role="status" aria-live="polite" sx={{ mt: 1.2 }}>
              {feedback}
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </Stack>
  )
}
