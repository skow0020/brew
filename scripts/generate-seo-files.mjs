import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const publicDir = path.join(projectRoot, 'public')
const envPath = path.join(projectRoot, '.env')

const DEFAULT_SITE_URL = 'https://brewbrewing.com'
const ROUTES = ['/', '/beers', '/events', '/taproom', '/contact']

function parseEnv(content) {
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')
    if (separator <= 0) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, '')
    env[key] = value
  }
  return env
}

async function resolveSiteUrl() {
  try {
    const content = await readFile(envPath, 'utf8')
    const env = parseEnv(content)
    return env.VITE_SITE_URL || DEFAULT_SITE_URL
  } catch {
    return DEFAULT_SITE_URL
  }
}

function createSitemapXml(siteUrl) {
  const now = new Date().toISOString()
  const entries = ROUTES.map((route) => {
    const loc = new URL(route, siteUrl).toString()
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

function createRobotsTxt(siteUrl) {
  const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString()
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`
}

async function main() {
  const siteUrl = await resolveSiteUrl()
  await mkdir(publicDir, { recursive: true })

  await writeFile(path.join(publicDir, 'sitemap.xml'), createSitemapXml(siteUrl), 'utf8')
  await writeFile(path.join(publicDir, 'robots.txt'), createRobotsTxt(siteUrl), 'utf8')

  process.stdout.write('Generated public/sitemap.xml and public/robots.txt\n')
}

main().catch((error) => {
  process.stderr.write(`SEO file generation failed: ${String(error)}\n`)
  process.exit(1)
})
