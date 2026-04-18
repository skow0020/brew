import type { Beer, BreweryInfo, EventItem, TaproomHour } from '../../data/siteData'

const DAY_MAP: Record<string, string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
}

function toTwentyFourHour(input: string): string {
  const normalized = input.trim().toUpperCase()
  const [time, period] = normalized.split(' ')
  const [hourPart, minutePart = '00'] = time.split(':')
  let hour = Number(hourPart)

  if (period === 'PM' && hour < 12) {
    hour += 12
  }

  if (period === 'AM' && hour === 12) {
    hour = 0
  }

  return `${String(hour).padStart(2, '0')}:${minutePart.padStart(2, '0')}`
}

function parseHours(hours: string) {
  if (hours.toLowerCase() === 'closed') {
    return null
  }

  const parts = hours.split('-').map((part) => part.trim())
  if (parts.length !== 2) {
    return null
  }

  return {
    opens: toTwentyFourHour(parts[0]),
    closes: toTwentyFourHour(parts[1]),
  }
}

function openingHoursSpecification(taproomHours: TaproomHour[]) {
  return taproomHours
    .map((entry) => {
      const parsed = parseHours(entry.hours)
      const dayUrl = DAY_MAP[entry.day.toLowerCase()]

      if (!parsed || !dayUrl) {
        return null
      }

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayUrl,
        opens: parsed.opens,
        closes: parsed.closes,
      }
    })
    .filter(Boolean)
}

export function localBusinessSchema(info: BreweryInfo, taproomHours: TaproomHour[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brewery',
    name: info.name,
    description: info.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '8 8th Ave N',
      addressLocality: 'Hopkins',
      addressRegion: 'MN',
      postalCode: '55343',
      addressCountry: 'US',
    },
    hasMap: info.mapUrl,
    url: 'https://brewbrewing.com',
    openingHoursSpecification: openingHoursSpecification(taproomHours),
  }
}

export function eventListSchema(events: EventItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.title,
        description: event.details,
        location: {
          '@type': 'Place',
          name: 'brew Brewing Co.',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '8 8th Ave N',
            addressLocality: 'Hopkins',
            addressRegion: 'MN',
            postalCode: '55343',
            addressCountry: 'US',
          },
        },
      },
    })),
  }
}

export function beerListSchema(info: BreweryInfo, beers: Beer[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${info.name} Tap List`,
    itemListElement: beers.map((beer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: beer.name,
        category: beer.style,
        description: beer.notes,
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'ABV',
            value: beer.abv,
          },
          {
            '@type': 'PropertyValue',
            name: 'On Tap',
            value: beer.onTap ? 'Yes' : 'No',
          },
        ],
      },
    })),
  }
}
