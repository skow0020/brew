import type { Beer } from '../../data/siteData'
import { appConfig } from '../config'
import { fetchJson } from './http'

type AdminBeersResponse = {
  beers: Beer[]
}

type SaveAdminBeersResponse = {
  ok: boolean
  message?: string
}

const DEFAULT_ADMIN_API_BASE = '/api/admin'

function getAdminApiUrl(path: string): string {
  const base = (appConfig.adminApiBaseUrl ?? DEFAULT_ADMIN_API_BASE).replace(/\/$/, '')
  return `${base}${path}`
}

export async function getAdminBeers(adminKey: string): Promise<Beer[]> {
  const response = await fetchJson<AdminBeersResponse>(getAdminApiUrl('/beers'), {
    headers: {
      'x-admin-key': adminKey,
    },
  })

  return response.beers
}

export async function saveAdminBeers(adminKey: string, beers: Beer[]): Promise<SaveAdminBeersResponse> {
  return fetchJson<SaveAdminBeersResponse>(getAdminApiUrl('/beers'), {
    method: 'PUT',
    headers: {
      'x-admin-key': adminKey,
    },
    body: JSON.stringify({ beers }),
  })
}
