export type Beer = {
  name: string
  style: string
  abv: string
  notes: string
  onTap: boolean
}

export type TapListResult = {
  beers: Beer[]
  source: 'live' | 'fallback'
  lastUpdatedIso: string
  message?: string
}

export type EventItem = {
  title: string
  day: string
  time: string
  details: string
}

export type TaproomHour = {
  day: string
  hours: string
}

export type BreweryInfo = {
  name: string
  city: string
  tagline: string
  orderUrl: string
  mapUrl: string
  newsletterCta: string
}

export type SiteContent = {
  breweryInfo: BreweryInfo
  beers: Beer[]
  events: EventItem[]
  taproomHours: TaproomHour[]
}

export const breweryInfo: BreweryInfo = {
  name: 'brew Brewing Co.',
  city: 'Hopkins, MN',
  tagline: 'Neighborhood craft beer, bold flavor, and a taproom built for gathering.',
  orderUrl: 'https://brewbrewing.com/',
  mapUrl:
    'https://www.google.com/maps/place/brew+Brewing+Co/@44.9247956,-93.4095684,15z',
  newsletterCta: 'Get release alerts + event updates',
}

export const featuredBeers: Beer[] = [
  {
    name: 'Dinkytown',
    style: 'American IPA',
    abv: '6.2%',
    notes: 'Citrus-forward, piney finish, balanced malt backbone.',
    onTap: true,
  },
  {
    name: 'Burning Daylight',
    style: 'Hazy Pale Ale',
    abv: '5.4%',
    notes: 'Soft body, tropical aroma, low bitterness.',
    onTap: true,
  },
  {
    name: 'Midnight Hammer',
    style: 'Dry Irish Stout',
    abv: '4.8%',
    notes: 'Roasted coffee notes with a silky pour.',
    onTap: false,
  },
  {
    name: 'Lager Crew',
    style: 'Crisp Lager',
    abv: '4.9%',
    notes: 'Clean, bright, and built for pint-after-pint drinking.',
    onTap: true,
  },
]

export const upcomingEvents: EventItem[] = [
  {
    title: 'Friday Live Music',
    day: 'Every Friday',
    time: '7:00 PM',
    details: 'Local artists in the taproom with rotating food trucks outside.',
  },
  {
    title: 'Community Trivia Night',
    day: 'Wednesdays',
    time: '6:30 PM',
    details: 'Team trivia with weekly prizes and featured small-batch pours.',
  },
  {
    title: 'Seasonal Release Party',
    day: 'May 18',
    time: '5:00 PM',
    details: 'First pour of our new seasonal release, plus brewery tours.',
  },
]

export const taproomHours: TaproomHour[] = [
  { day: 'Monday', hours: 'Closed' },
  { day: 'Tuesday', hours: '3 PM - 9 PM' },
  { day: 'Wednesday', hours: '3 PM - 10 PM' },
  { day: 'Thursday', hours: '3 PM - 10 PM' },
  { day: 'Friday', hours: '12 PM - 11 PM' },
  { day: 'Saturday', hours: '12 PM - 11 PM' },
  { day: 'Sunday', hours: '12 PM - 7 PM' },
]

export const fallbackSiteContent: SiteContent = {
  breweryInfo,
  beers: featuredBeers,
  events: upcomingEvents,
  taproomHours,
}
