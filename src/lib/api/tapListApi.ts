import { featuredBeers, type TapListResult } from '../../data/siteData'
import { normalizeTapListPayload } from '../content/normalizeContent'
import { appConfig } from '../config'
import { fetchJson } from './http'

export async function getTapList(): Promise<TapListResult> {
  const now = new Date().toISOString()

  if (!appConfig.enableLiveData || !appConfig.tapListUrl) {
    return {
      beers: featuredBeers,
      source: 'fallback',
      lastUpdatedIso: now,
      message: 'Live tap feed is disabled. Showing fallback list.',
    }
  }

  try {
    const payload = await fetchJson<unknown>(appConfig.tapListUrl)
    const normalized = normalizeTapListPayload(payload)

    if (normalized && normalized.length > 0) {
      return {
        beers: normalized,
        source: 'live',
        lastUpdatedIso: now,
      }
    }

    return {
      beers: featuredBeers,
      source: 'fallback',
      lastUpdatedIso: now,
      message: 'Tap feed response was empty. Showing fallback list.',
    }
  } catch {
    return {
      beers: featuredBeers,
      source: 'fallback',
      lastUpdatedIso: now,
      message: 'Tap feed unavailable. Showing fallback list.',
    }
  }
}
