import LocalBarIcon from '@mui/icons-material/LocalBar'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import {
  AppBar,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'
import { fallbackSiteContent } from '../data/siteData'
import { useSiteContent } from '../hooks/useSiteContent'
import { trackEvent } from '../lib/analytics/events'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/beers', label: 'Beers' },
  { to: '/events', label: 'Events' },
  { to: '/taproom', label: 'Taproom' },
  { to: '/contact', label: 'Contact' },
]

export function SiteLayout() {
  const { data: siteContent } = useSiteContent()
  const breweryInfo = siteContent?.breweryInfo ?? fallbackSiteContent.breweryInfo

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, md: 2 } }}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Paper sx={{ overflow: 'hidden' }}>
        <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(90deg, #6d2c12, #8b3a17)' }}>
          <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 0.5, flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocalBarIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {breweryInfo?.city} | Order pickup and merch online
              </Typography>
            </Stack>
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              startIcon={<ShoppingBagOutlinedIcon />}
              href={breweryInfo.orderUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('order_click', 'layout')}
              sx={{ borderColor: 'rgba(255,255,255,0.45)', '&:hover': { borderColor: '#fff' } }}
            >
              Order Online
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <Stack
            component="nav"
            aria-label="Main navigation"
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              borderBottom: '1px solid #d9c7af',
              pb: 2,
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '2.1rem', md: '2.6rem' }, lineHeight: 0.95 }}>
                {breweryInfo?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Independent Craft Brewery
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end={item.to === '/'}
                  color="inherit"
                  sx={{
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.5,
                    color: 'text.primary',
                    '&.active': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          <Box component="main" id="main-content" tabIndex={-1} sx={{ pt: 2 }}>
            <Outlet />
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid #d9c7af', px: { xs: 2, md: 3 }, py: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {breweryInfo?.name} | Modern craft, local roots.
            </Typography>
            <Link component={NavLink} to="/admin/beers" underline="hover" color="text.secondary">
              Staff tools
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
