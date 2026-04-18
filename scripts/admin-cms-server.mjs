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

function extractBeers(payload) {
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
  if (!env.cmsContentUrl) {
    throw new Error('CMS_CONTENT_URL is not configured')
  }

  if (env.cmsContentUrl.includes('example.com')) {
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
    response = await fetch(env.cmsContentUrl, { headers })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'network error'
    throw new Error(`Could not reach CMS_CONTENT_URL (${env.cmsContentUrl}): ${reason}`)
  }

  if (!response.ok) {
    throw new Error(`Could not load CMS content: ${response.status}`)
  }

  return response.json()
}

async function writeCmsContent(payload) {
  if (!env.cmsWriteUrl) {
    throw new Error('CMS_WRITE_API_URL is not configured')
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (env.cmsWriteToken) {
    headers.Authorization = `Bearer ${env.cmsWriteToken}`
  }

  const response = await fetch(env.cmsWriteUrl, {
    method: env.cmsWriteMethod,
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`CMS write failed (${response.status}): ${details || 'No details'}`)
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
      const beers = Array.isArray(body.beers) ? body.beers : null

      if (!beers) {
        json(response, 400, { ok: false, message: 'Request body must include beers array' })
        return
      }

      const current = await fetchCmsContent()
      const merged = mergeContent(current, beers)
      await writeCmsContent(merged)
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
