import {
  fallbackSiteContent,
  type Beer,
  type BreweryInfo,
  type EventItem,
  type SiteContent,
  type TaproomHour,
} from '../../data/siteData'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function findArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) {
    return value
  }

  if (!isRecord(value)) {
    return []
  }

  for (const key of keys) {
    const candidate = value[key]
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeBreweryInfo(value: unknown): BreweryInfo {
  const record = isRecord(value) ? value : {}

  return {
    name: asString(record.name ?? record.businessName, fallbackSiteContent.breweryInfo.name),
    city: asString(record.city ?? record.location, fallbackSiteContent.breweryInfo.city),
    tagline: asString(record.tagline ?? record.heroTagline, fallbackSiteContent.breweryInfo.tagline),
    orderUrl: asString(record.orderUrl ?? record.orderLink, fallbackSiteContent.breweryInfo.orderUrl),
    mapUrl: asString(record.mapUrl ?? record.locationUrl, fallbackSiteContent.breweryInfo.mapUrl),
    newsletterCta: asString(
      record.newsletterCta ?? record.newsletterLabel,
      fallbackSiteContent.breweryInfo.newsletterCta,
    ),
  }
}

function normalizeEvents(value: unknown): EventItem[] {
  const events = findArray(value, ['events', 'items'])

  if (events.length === 0) {
    return fallbackSiteContent.events
  }

  return events
    .filter(isRecord)
    .map((event) => ({
      title: asString(event.title ?? event.name, 'Untitled Event'),
      day: asString(event.day ?? event.dateLabel, 'TBD'),
      time: asString(event.time ?? event.startTime, 'TBD'),
      details: asString(event.details ?? event.description, ''),
    }))
}

function normalizeTaproomHours(value: unknown): TaproomHour[] {
  const entries = findArray(value, ['taproomHours', 'hours', 'items'])

  if (entries.length === 0) {
    return fallbackSiteContent.taproomHours
  }

  return entries
    .filter(isRecord)
    .map((entry) => ({
      day: asString(entry.day ?? entry.weekday, 'Unknown'),
      hours: asString(entry.hours ?? entry.window, 'TBD'),
    }))
}

function normalizeBeer(value: unknown): Beer | null {
  if (!isRecord(value)) {
    return null
  }

  const name = asString(value.name ?? value.title)
  const style = asString(value.style ?? value.beerStyle)

  if (!name || !style) {
    return null
  }

  return {
    name,
    style,
    abv: asString(value.abv ?? value.abvPercent, 'N/A'),
    notes: asString(value.notes ?? value.description, ''),
    onTap: asBoolean(value.onTap ?? value.isOnTap, false),
  }
}

export function normalizeSiteContentPayload(payload: unknown): SiteContent | null {
  const root = isRecord(payload) ? payload : null
  const data = isRecord(root?.data) ? root.data : root

  if (!isRecord(data)) {
    return null
  }

  return {
    breweryInfo: normalizeBreweryInfo(data.breweryInfo ?? data.brewery),
    beers:
      normalizeTapListPayload(data.beers ?? data.tapList ?? data.taproomBeers ?? data)
      ?? fallbackSiteContent.beers,
    events: normalizeEvents(data.events ?? data.eventList ?? data),
    taproomHours: normalizeTaproomHours(data.taproomHours ?? data.taproom ?? data.hours),
  }
}

export function normalizeTapListPayload(payload: unknown): Beer[] | null {
  const root = isRecord(payload) ? payload : null
  const candidates = [
    root,
    isRecord(root?.data) ? root.data : null,
    isRecord(root?.tapList) ? root.tapList : null,
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const items = findArray(candidate, ['beers', 'items', 'data'])
    if (items.length === 0) {
      continue
    }

    const normalized = items.map(normalizeBeer).filter((beer): beer is Beer => Boolean(beer))

    if (normalized.length > 0) {
      return normalized
    }
  }

  return null
}
