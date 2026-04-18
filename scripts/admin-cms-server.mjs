import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '../.env')

  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex < 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

const PORT = Number(process.env.ADMIN_API_PORT ?? '8787')

function readEnv(name) {
  const value = process.env[name]
  return value ? value.trim() : ''
}

const env = {
  adminEditorKey: readEnv('ADMIN_EDITOR_KEY'),
  cmsContentUrl: readEnv('CMS_CONTENT_URL') || readEnv('VITE_CMS_CONTENT_URL'),
  cmsWriteUrl: readEnv('CMS_WRITE_API_URL'),
  cmsWriteToken: readEnv('CMS_WRITE_TOKEN'),
  cmsReadToken: readEnv('CMS_READ_TOKEN'),
  cmsWriteMethod: (readEnv('CMS_WRITE_METHOD') || 'PUT').toUpperCase(),
}

const CMS_BEER_FIELDS = ['name', 'style', 'abv', 'notes', 'onTap']

function resolveCmsEndpoint(urlValue) {
  if (!urlValue) {
    return ''
  }

  let url
  try {
    url = new URL(urlValue)
  } catch {
    return urlValue
  }

  const normalizedPath = url.pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/' || normalizedPath === '/api') {
    url.pathname = '/api/beers'
    return url.toString()
  }

  return url.toString()
}

const resolvedCmsContentUrl = resolveCmsEndpoint(env.cmsContentUrl)
const resolvedCmsWriteUrl = resolveCmsEndpoint(env.cmsWriteUrl)

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(body))
}

function unauthorized(response) {
  json(response, 401, {
    ok: false,
    message: 'Unauthorized',
  })
}

function extractData(payload) {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  if (payload.data && typeof payload.data === 'object') {
    return payload.data
  }

  return payload
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object'
}

function appendStrapiBeerQuery(urlValue) {
  const url = new URL(urlValue)

  if (!url.pathname.includes('/api/beers')) {
    return urlValue
  }

  if (!url.searchParams.has('pagination[pageSize]')) {
    url.searchParams.set('pagination[pageSize]', '200')
  }

  for (let index = 0; index < CMS_BEER_FIELDS.length; index += 1) {
    url.searchParams.set(`fields[${index}]`, CMS_BEER_FIELDS[index])
  }

  return url.toString()
}

function normalizeBeer(value) {
  if (!isRecord(value)) {
    return null
  }

  const name = typeof value.name === 'string' ? value.name : ''
  const style = typeof value.style === 'string' ? value.style : ''

  if (!name || !style) {
    return null
  }

  return {
    cmsId: value.cmsId ?? value.documentId ?? value.id,
    name,
    style,
    abv: typeof value.abv === 'string' ? value.abv : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    onTap: typeof value.onTap === 'boolean' ? value.onTap : false,
  }
}

function isStrapiCollectionPayload(payload) {
  return Array.isArray(payload?.data)
}

function extractStrapiBeerEntries(payload) {
  if (!isStrapiCollectionPayload(payload)) {
    return []
  }

  return payload.data
    .filter(isRecord)
    .map((entry) => {
      const attrs = isRecord(entry.attributes) ? entry.attributes : entry
      const beer = normalizeBeer(attrs)

      if (!beer) {
        return null
      }

      return {
        cmsId: entry.documentId ?? beer.cmsId ?? entry.id,
        ...beer,
      }
    })
    .filter(Boolean)
}

function beerKey(beer) {
  return `${beer.name.trim().toLowerCase()}::${beer.style.trim().toLowerCase()}`
}

function extractBeers(payload) {
  const strapiEntries = extractStrapiBeerEntries(payload)

  if (strapiEntries.length > 0) {
    return strapiEntries
  }

  const data = extractData(payload)
  const candidates = [data.beers, data.taproomBeers, data.tapList?.beers, data.tapList?.items]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function mergeContent(payload, beers) {
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
    return {
      ...payload,
      data: {
        ...payload.data,
        beers,
      },
    }
  }

  const base = payload && typeof payload === 'object' ? payload : {}
  return {
    ...base,
    beers,
  }
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    request.on('error', reject)
  })
}

async function fetchCmsContent() {
  if (!resolvedCmsContentUrl) {
    throw new Error('CMS_CONTENT_URL is not configured')
  }

  if (resolvedCmsContentUrl.includes('example.com')) {
    throw new Error('CMS_CONTENT_URL still points to example.com. Set a real CMS endpoint in .env.')
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (env.cmsReadToken) {
    headers.Authorization = `Bearer ${env.cmsReadToken}`
  }

  let response
  try {
    response = await fetch(appendStrapiBeerQuery(resolvedCmsContentUrl), { headers })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'network error'
    throw new Error(`Could not reach CMS_CONTENT_URL (${resolvedCmsContentUrl}): ${reason}`)
  }

  if (!response.ok) {
    throw new Error(`Could not load CMS content: ${response.status}`)
  }

  return response.json()
}

async function writeCmsContent(payload) {
  if (!resolvedCmsWriteUrl) {
    throw new Error('CMS_WRITE_API_URL is not configured')
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (env.cmsWriteToken) {
    headers.Authorization = `Bearer ${env.cmsWriteToken}`
  }

  const response = await fetch(resolvedCmsWriteUrl, {
    method: env.cmsWriteMethod,
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`CMS write failed (${response.status}): ${details || 'No details'}`)
  }
}

async function writeStrapiBeerCollection(nextBeers) {
  if (!resolvedCmsWriteUrl || !resolvedCmsWriteUrl.includes('/api/beers')) {
    throw new Error('CMS_WRITE_API_URL must point to a Strapi beers endpoint like .../api/beers')
  }

  const currentPayload = await fetchCmsContent()
  const currentEntries = extractStrapiBeerEntries(currentPayload)
  const currentByKey = new Map(currentEntries.map((entry) => [beerKey(entry), entry]))
  const currentById = new Map(
    currentEntries
      .filter((entry) => entry.cmsId !== undefined && entry.cmsId !== null)
      .map((entry) => [String(entry.cmsId), entry]),
  )

  const nextByKey = new Map(nextBeers.map((beer) => [beerKey(beer), beer]))
  const nextIds = new Set(
    nextBeers
      .map((beer) => beer.cmsId)
      .filter((id) => id !== undefined && id !== null)
      .map((id) => String(id)),
  )

  const nextKeysWithoutId = new Set(
    nextBeers
      .filter((beer) => beer.cmsId === undefined || beer.cmsId === null)
      .map((beer) => beerKey(beer)),
  )

  const headers = {
    'Content-Type': 'application/json',
  }

  if (env.cmsWriteToken) {
    headers.Authorization = `Bearer ${env.cmsWriteToken}`
  }

  for (const nextBeer of nextBeers) {
    const cmsId = nextBeer.cmsId !== undefined && nextBeer.cmsId !== null
      ? String(nextBeer.cmsId)
      : null
    const key = beerKey(nextBeer)
    const currentFromId = cmsId ? currentById.get(cmsId) : null
    const current = currentFromId ?? currentByKey.get(key)
    const payload = {
      name: nextBeer.name,
      style: nextBeer.style,
      abv: nextBeer.abv,
      notes: nextBeer.notes,
      onTap: nextBeer.onTap,
    }

    if (current && current.cmsId !== undefined && current.cmsId !== null) {
      const response = await fetch(`${resolvedCmsWriteUrl.replace(/\/$/, '')}/${current.cmsId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data: payload }),
      })

      if (!response.ok) {
        const details = await response.text()
        throw new Error(`CMS update failed (${response.status}): ${details || 'No details'}`)
      }

      continue
    }

    const createResponse = await fetch(resolvedCmsWriteUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: payload }),
    })

    if (!createResponse.ok) {
      const details = await createResponse.text()
      throw new Error(`CMS create failed (${createResponse.status}): ${details || 'No details'}`)
    }
  }

  for (const current of currentEntries) {
    if (current.cmsId === undefined || current.cmsId === null) {
      continue
    }

    const currentId = String(current.cmsId)
    const key = beerKey(current)

    if (nextIds.has(currentId) || nextKeysWithoutId.has(key) || nextByKey.has(key)) {
      continue
    }

    const deleteResponse = await fetch(`${resolvedCmsWriteUrl.replace(/\/$/, '')}/${current.cmsId}`, {
      method: 'DELETE',
      headers,
    })

    if (!deleteResponse.ok) {
      const details = await deleteResponse.text()
      throw new Error(`CMS delete failed (${deleteResponse.status}): ${details || 'No details'}`)
    }
  }
}

const server = http.createServer(async (request, response) => {
  if (!request.url || !request.method) {
    json(response, 404, { ok: false, message: 'Not found' })
    return
  }

  if (request.url !== '/api/admin/beers') {
    json(response, 404, { ok: false, message: 'Not found' })
    return
  }

  if (!env.adminEditorKey) {
    json(response, 500, { ok: false, message: 'ADMIN_EDITOR_KEY is not configured' })
    return
  }

  const providedKey = request.headers['x-admin-key']
  if (providedKey !== env.adminEditorKey) {
    unauthorized(response)
    return
  }

  try {
    if (request.method === 'GET') {
      const content = await fetchCmsContent()
      json(response, 200, { beers: extractBeers(content) })
      return
    }

    if (request.method === 'PUT') {
      const body = await parseBody(request)
      const beers = Array.isArray(body.beers)
        ? body.beers.map(normalizeBeer).filter(Boolean)
        : null

      if (!beers) {
        json(response, 400, { ok: false, message: 'Request body must include beers array' })
        return
      }

      const current = await fetchCmsContent()

      if (isStrapiCollectionPayload(current)) {
        await writeStrapiBeerCollection(beers)
      } else {
        const merged = mergeContent(current, beers)
        await writeCmsContent(merged)
      }

      json(response, 200, { ok: true, message: 'Beer catalog saved to CMS.' })
      return
    }

    json(response, 405, { ok: false, message: 'Method not allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    json(response, 500, { ok: false, message })
  }
})

server.listen(PORT, () => {
  console.log(`Admin CMS API running on http://localhost:${PORT}`)
})
