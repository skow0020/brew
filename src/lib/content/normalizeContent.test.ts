import { fallbackSiteContent } from '../../data/siteData'
import { normalizeSiteContentPayload, normalizeTapListPayload } from './normalizeContent'

describe('normalizeSiteContentPayload', () => {
  it('normalizes wrapped CMS payloads with alternate field names', () => {
    const payload = {
      data: {
        brewery: {
          businessName: 'brew Brewing Co.',
          location: 'Hopkins, MN',
          heroTagline: 'Fresh pours and neighborhood vibes.',
          orderLink: 'https://example.com/order',
          locationUrl: 'https://maps.example.com/brew',
          newsletterLabel: 'Stay in the loop',
        },
        eventList: {
          items: [
            {
              name: 'Acoustic Night',
              dateLabel: 'Fridays',
              startTime: '7:00 PM',
              description: 'Live local music in the taproom.',
            },
          ],
        },
        beers: [
          {
            name: 'Northside IPA',
            style: 'IPA',
            abv: '6.5%',
            notes: 'Citrus and pine',
            onTap: true,
          },
        ],
        hours: {
          items: [
            {
              weekday: 'Friday',
              window: '12 PM - 11 PM',
            },
          ],
        },
      },
    }

    const normalized = normalizeSiteContentPayload(payload)

    expect(normalized).toEqual({
      breweryInfo: {
        name: 'brew Brewing Co.',
        city: 'Hopkins, MN',
        tagline: 'Fresh pours and neighborhood vibes.',
        orderUrl: 'https://example.com/order',
        mapUrl: 'https://maps.example.com/brew',
        newsletterCta: 'Stay in the loop',
      },
      beers: [
        {
          name: 'Northside IPA',
          style: 'IPA',
          abv: '6.5%',
          notes: 'Citrus and pine',
          onTap: true,
        },
      ],
      events: [
        {
          title: 'Acoustic Night',
          day: 'Fridays',
          time: '7:00 PM',
          details: 'Live local music in the taproom.',
        },
      ],
      taproomHours: [
        {
          day: 'Friday',
          hours: '12 PM - 11 PM',
        },
      ],
    })
  })

  it('falls back to default events and taproom hours when lists are missing', () => {
    const payload = {
      data: {
        breweryInfo: {
          name: 'brew Brewing Co.',
        },
      },
    }

    const normalized = normalizeSiteContentPayload(payload)

    expect(normalized).not.toBeNull()
    expect(normalized?.beers).toEqual(fallbackSiteContent.beers)
    expect(normalized?.events).toEqual(fallbackSiteContent.events)
    expect(normalized?.taproomHours).toEqual(fallbackSiteContent.taproomHours)
    expect(normalized?.breweryInfo.city).toBe(fallbackSiteContent.breweryInfo.city)
  })

  it('returns null for non-object payloads', () => {
    expect(normalizeSiteContentPayload('invalid')).toBeNull()
    expect(normalizeSiteContentPayload(null)).toBeNull()
  })
})

describe('normalizeTapListPayload', () => {
  it('normalizes tap list payloads using alternate beer keys', () => {
    const payload = {
      data: {
        items: [
          {
            title: 'Northside IPA',
            beerStyle: 'IPA',
            abvPercent: '6.5%',
            description: 'Citrus and pine',
            isOnTap: true,
          },
        ],
      },
    }

    const normalized = normalizeTapListPayload(payload)

    expect(normalized).toEqual([
      {
        name: 'Northside IPA',
        style: 'IPA',
        abv: '6.5%',
        notes: 'Citrus and pine',
        onTap: true,
      },
    ])
  })

  it('filters out invalid beer entries and returns null when none are valid', () => {
    const partiallyValidPayload = {
      beers: [
        {
          name: 'Valid Lager',
          style: 'Lager',
          notes: 'Crisp and clean',
          onTap: true,
        },
        {
          title: 'Missing Style',
        },
      ],
    }

    const normalizedPartiallyValid = normalizeTapListPayload(partiallyValidPayload)
    expect(normalizedPartiallyValid).toHaveLength(1)
    expect(normalizedPartiallyValid?.[0].name).toBe('Valid Lager')

    const invalidPayload = {
      beers: [
        {
          title: 'No style present',
        },
      ],
    }

    expect(normalizeTapListPayload(invalidPayload)).toBeNull()
  })
})
