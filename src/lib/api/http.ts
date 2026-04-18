const DEFAULT_TIMEOUT_MS = 7000

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`)
    }

    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}
