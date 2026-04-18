import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { useSiteContent } from '../hooks/useSiteContent'
import { eventListSchema } from '../lib/seo/schemas'
import { useSeo } from '../lib/seo/useSeo'

export function EventsPage() {
  const { data: siteContent, isLoading } = useSiteContent()
  const events = siteContent?.events ?? []

  useSeo({
    title: 'Brewery Events',
    description:
      'See upcoming brew Brewing events including trivia, live music, and special release nights in Hopkins.',
    path: '/events',
    imagePath: '/og-events.svg',
    jsonLd: eventListSchema(events),
  })

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Events
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, lineHeight: 0.92 }}>
            Live, Local, and Always Friendly
          </Typography>
          <Typography color="text.secondary">
            From music nights to release parties, there is always something happening in the taproom.
          </Typography>
        </CardContent>
      </Card>

      {isLoading ? <Alert severity="info">Loading events...</Alert> : null}
      <Stack spacing={1.5}>
        {events.map((event) => (
          <Card key={event.title}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 0.4, alignItems: 'center' }}>
                <EventAvailableRoundedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                  {event.day} | {event.time}
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                {event.details}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {events.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No events are scheduled at the moment.
        </Typography>
      ) : null}
    </Stack>
  )
}
