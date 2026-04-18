# brew Brewing Site

Vite and React modernization project for a brewery website.

## Run locally

1. Install dependencies.
2. Start development server.

```bash
npm install
npm run dev
```

## Build and lint

```bash
npm run build
npm run lint
```

Build automatically generates:

- public/sitemap.xml
- public/robots.txt

## Environment configuration

Copy .env.example to .env and set integration endpoints.

```bash
cp .env.example .env
```

Variables:

- VITE_ENABLE_LIVE_DATA
- VITE_SITE_URL
- VITE_CMS_CONTENT_URL
- VITE_ADMIN_API_BASE_URL
- VITE_TAPLIST_API_URL
- VITE_NEWSLETTER_API_URL
- VITE_CONTACT_API_URL
- VITE_ANALYTICS_API_URL

Server-only variables for the admin CMS writer:

- ADMIN_API_PORT
- ADMIN_EDITOR_KEY
- CMS_CONTENT_URL
- CMS_READ_TOKEN
- CMS_WRITE_API_URL
- CMS_WRITE_METHOD
- CMS_WRITE_TOKEN

When VITE_ENABLE_LIVE_DATA is false, the app uses local fallback data from src/data/siteData.ts.

## Data integration design

- CMS content is loaded through src/lib/api/contentApi.ts
- Live tap list is loaded through src/lib/api/tapListApi.ts
- Newsletter submissions are handled through src/lib/api/newsletterApi.ts
- Contact submissions are handled through src/lib/api/contactApi.ts
- Conversion events are tracked through src/lib/analytics/events.ts
- Query caching and refetch behavior are managed by React Query hooks in src/hooks

These integrations are resilient by design: if endpoints are missing or fail, the UI falls back to local content.

## In-app CMS beer editor

The app now includes a staff editor at /admin/beers.

To use it locally:

1. Start the admin API server in one terminal.
2. Start the Vite app in another terminal.
3. Open /admin/beers and enter ADMIN_EDITOR_KEY.
4. Load, edit, and save beers.

```bash
npm run admin-api
npm run dev
```

The browser only calls /api/admin/beers. CMS write credentials remain server-side in the admin API process.

Route-level SEO is configured in src/lib/seo/useSeo.ts and page-specific JSON-LD schemas in src/lib/seo/schemas.ts.
Route-level social preview images are located in public/og-*.svg and attached through each page's useSeo configuration.

## Accepted payload shapes

Site content endpoint accepts either a direct object or a wrapped data object.

Example direct shape:

```json
{
	"breweryInfo": {
		"name": "brew Brewing Co.",
		"city": "Hopkins, MN",
		"tagline": "Neighborhood craft beer...",
		"orderUrl": "https://example.com/order",
		"mapUrl": "https://maps.google.com/...",
		"newsletterCta": "Get release alerts"
	},
	"beers": [
		{
			"name": "Dinkytown",
			"style": "American IPA",
			"abv": "6.2%",
			"notes": "Citrus-forward",
			"onTap": true
		}
	],
	"events": [
		{
			"title": "Friday Live Music",
			"day": "Every Friday",
			"time": "7:00 PM",
			"details": "Local artists in the taproom."
		}
	],
	"taproomHours": [
		{
			"day": "Friday",
			"hours": "12 PM - 11 PM"
		}
	]
}
```

Beers are CMS-managed through the site content payload. If the live tap-list API is available, it overrides CMS beers for real-time tap status.

Tap list endpoint accepts an array or wrappers with beers, items, or data arrays.

Example shape:

```json
{
	"beers": [
		{
			"name": "Dinkytown",
			"style": "American IPA",
			"abv": "6.2%",
			"notes": "Citrus-forward",
			"onTap": true
		}
	]
}
```
