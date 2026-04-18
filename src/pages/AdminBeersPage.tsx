import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fallbackSiteContent, type Beer } from '../data/siteData'
import { getAdminBeers, saveAdminBeers } from '../lib/api/adminBeerApi'
import { queryKeys } from '../lib/content/queryKeys'

function emptyBeer(): Beer {
  return {
    name: '',
    style: '',
    abv: '',
    notes: '',
    onTap: false,
  }
}

function normalizeEditableBeers(beers: Beer[]): Beer[] {
  return beers.map((beer) => ({
    name: beer.name,
    style: beer.style,
    abv: beer.abv,
    notes: beer.notes,
    onTap: beer.onTap,
  }))
}

export function AdminBeersPage() {
  const [adminKeyInput, setAdminKeyInput] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [editableBeers, setEditableBeers] = useState<Beer[]>(fallbackSiteContent.beers)
  const queryClient = useQueryClient()

  const beersQuery = useQuery({
    queryKey: queryKeys.adminBeers,
    queryFn: () => getAdminBeers(adminKey),
    enabled: false,
  })

  const saveMutation = useMutation({
    mutationFn: (beers: Beer[]) => saveAdminBeers(adminKey, beers),
    onSuccess: (response) => {
      setSaveMessage(response.message ?? 'Beer catalog saved.')
      void queryClient.invalidateQueries({ queryKey: queryKeys.siteContent })
      void queryClient.invalidateQueries({ queryKey: queryKeys.tapList })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBeers })
    },
    onError: () => {
      setSaveMessage('Saving failed. Confirm admin key and CMS server settings.')
    },
  })

  const hasInvalidRows = useMemo(
    () => editableBeers.some((beer) => beer.name.trim().length === 0 || beer.style.trim().length === 0),
    [editableBeers],
  )

  function handleUnlock() {
    setSaveMessage(null)
    setAdminKey(adminKeyInput.trim())
  }

  function handleLoadFromCms() {
    setSaveMessage(null)
    void beersQuery.refetch().then((result) => {
      if (!result.data) {
        return
      }

      setEditableBeers(normalizeEditableBeers(result.data))
      setSaveMessage('Loaded beers from CMS.')
    })
  }

  function updateBeer(index: number, patch: Partial<Beer>) {
    setEditableBeers((current) => current.map((beer, row) => (row === index ? { ...beer, ...patch } : beer)))
  }

  function removeBeer(index: number) {
    setEditableBeers((current) => current.filter((_, row) => row !== index))
  }

  function addBeer() {
    setEditableBeers((current) => [...current, emptyBeer()])
  }

  function handleSave() {
    setSaveMessage(null)
    const cleaned = editableBeers
      .map((beer) => ({
        ...beer,
        name: beer.name.trim(),
        style: beer.style.trim(),
        abv: beer.abv.trim(),
        notes: beer.notes.trim(),
      }))
      .filter((beer) => beer.name && beer.style)

    saveMutation.mutate(cleaned)
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Staff Tools
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.1rem', md: '3.2rem' }, lineHeight: 0.95 }}>
            Manage Beer Catalog
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.8 }}>
            Update beers in-app and publish directly to CMS content.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1.4 }}>
            <TextField
              type="password"
              label="Admin key"
              value={adminKeyInput}
              onChange={(event) => setAdminKeyInput(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleUnlock} disabled={!adminKeyInput.trim()}>
              Unlock
            </Button>
            <Button
              variant="outlined"
              onClick={handleLoadFromCms}
              disabled={!adminKey || beersQuery.isLoading}
            >
              Load from CMS
            </Button>
          </Stack>

          {beersQuery.isLoading ? <Alert severity="info" sx={{ mt: 1.2 }}>Loading beers from CMS...</Alert> : null}
          {beersQuery.isError ? (
            <Alert severity="error" sx={{ mt: 1.2 }}>
              Could not load beers. Confirm the admin API server is running and your key is valid.
            </Alert>
          ) : null}
          {saveMessage ? (
            <Alert severity={saveMessage.toLowerCase().includes('failed') ? 'error' : 'success'} sx={{ mt: 1.2 }} role="status" aria-live="polite">
              {saveMessage}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Stack spacing={1.25}>
        {editableBeers.map((beer, index) => (
          <Card key={`${beer.name}-${index}`}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  label="Name"
                  value={beer.name}
                  onChange={(event) => updateBeer(index, { name: event.target.value })}
                  fullWidth
                />
                <TextField
                  label="Style"
                  value={beer.style}
                  onChange={(event) => updateBeer(index, { style: event.target.value })}
                  fullWidth
                />
                <TextField
                  label="ABV"
                  value={beer.abv}
                  onChange={(event) => updateBeer(index, { abv: event.target.value })}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  label="Notes"
                  value={beer.notes}
                  onChange={(event) => updateBeer(index, { notes: event.target.value })}
                  fullWidth
                />
                <TextField
                  select
                  label="Tap status"
                  value={beer.onTap ? 'on' : 'off'}
                  onChange={(event) => updateBeer(index, { onTap: event.target.value === 'on' })}
                  fullWidth
                  slotProps={{ select: { native: true } }}
                >
                  <option value="on">On tap</option>
                  <option value="off">Not on tap</option>
                </TextField>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeBeer(index)}
                  startIcon={<DeleteOutlineRoundedIcon />}
                >
                  Remove
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<AddCircleOutlineRoundedIcon />} onClick={addBeer}>
          Add Beer
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          onClick={handleSave}
          disabled={!adminKey || saveMutation.isPending || hasInvalidRows}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save to CMS'}
        </Button>
      </Box>

      {hasInvalidRows ? (
        <Alert severity="warning">Each row needs at least a beer name and style before saving.</Alert>
      ) : null}
    </Stack>
  )
}
