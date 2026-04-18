import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { fallbackSiteContent } from '../data/siteData'
import { useSiteContent } from '../hooks/useSiteContent'
import { localBusinessSchema } from '../lib/seo/schemas'
import { useSeo } from '../lib/seo/useSeo'

export function TaproomPage() {
  const { data: siteContent, isLoading } = useSiteContent()
  const breweryInfo = siteContent?.breweryInfo ?? fallbackSiteContent.breweryInfo
  const taproomHours = siteContent?.taproomHours ?? fallbackSiteContent.taproomHours

  useSeo({
    title: 'Taproom Hours and Location',
    description:
      'Plan your visit to brew Brewing in Hopkins with current taproom hours, location details, and directions.',
    path: '/taproom',
    imagePath: '/og-taproom.svg',
    jsonLd: localBusinessSchema(breweryInfo, taproomHours),
  })

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Taproom
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, lineHeight: 0.92 }}>
            Visit the Taproom
          </Typography>
          <Typography color="text.secondary">
            Grab a pint, meet friends, and settle into a space designed for good conversation.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
              <ScheduleRoundedIcon color="primary" />
              <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                Hours
              </Typography>
            </Stack>
            {isLoading ? <Alert severity="info" sx={{ mb: 1 }}>Loading hours...</Alert> : null}
            <Stack spacing={0.6}>
              {taproomHours.map((entry, index) => (
                <Box key={entry.day}>
                  {index > 0 ? <Divider sx={{ mb: 0.7 }} /> : null}
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700 }}>{entry.day}</Typography>
                    <Typography color="text.secondary">{entry.hours}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
            {taproomHours.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Taproom hours are being updated.
              </Typography>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
              <PlaceRoundedIcon color="primary" />
              <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                Location
              </Typography>
            </Stack>
            <Typography>8 8th Ave N, Hopkins, Minnesota</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Street parking is available nearby. Rideshare drop-off is right at the front entrance.
            </Typography>
            <Button
              variant="outlined"
              href={breweryInfo.mapUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ mt: 1.6 }}
            >
              Open in Maps
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  )
}
