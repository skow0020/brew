import { fallbackSiteContent, type SiteContent } from '../../data/siteData'
import { normalizeSiteContentPayload } from '../content/normalizeContent'
import { appConfig } from '../config'
import { fetchJson } from './http'

export async function getSiteContent(): Promise<SiteContent> {
  if (!appConfig.enableLiveData || !appConfig.cmsContentUrl) {
    return fallbackSiteContent
  }

  try {
    const payload = await fetchJson<unknown>(appConfig.cmsContentUrl)
    return normalizeSiteContentPayload(payload) ?? fallbackSiteContent
  } catch {
    return fallbackSiteContent
  }
}
