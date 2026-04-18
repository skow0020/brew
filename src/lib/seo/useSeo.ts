import { useEffect } from 'react'
import { appConfig } from '../config'

type SeoOptions = {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  imagePath?: string
  jsonLd?: unknown
}

const SITE_NAME = 'brew Brewing Co.'
const DEFAULT_SITE_URL = 'https://brewbrewing.com'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

export function useSeo(options: SeoOptions) {
  useEffect(() => {
    const siteUrl = appConfig.siteUrl ?? DEFAULT_SITE_URL
    const url = new URL(options.path, siteUrl).toString()
    const imageUrl = new URL(options.imagePath ?? '/og-home.svg', siteUrl).toString()
    const pageTitle = `${options.title} | ${SITE_NAME}`

    document.title = pageTitle

    upsertMeta('name', 'description', options.description)
    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', options.description)
    upsertMeta('property', 'og:type', options.type ?? 'website')
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', options.description)
    upsertMeta('name', 'twitter:image', imageUrl)

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    const scriptId = 'seo-structured-data'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    if (options.jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.text = JSON.stringify(options.jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [options.description, options.imagePath, options.jsonLd, options.path, options.title, options.type])
}
