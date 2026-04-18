import { appConfig } from '../config'
import { fetchJson } from './http'

type NewsletterPayload = {
  email: string
}

type NewsletterResponse = {
  ok: boolean
  message?: string
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterResponse> {
  if (!appConfig.enableLiveData || !appConfig.newsletterUrl) {
    return { ok: true, message: 'Demo mode: newsletter endpoint not configured.' }
  }

  try {
    return await fetchJson<NewsletterResponse>(appConfig.newsletterUrl, {
      method: 'POST',
      body: JSON.stringify({ email } satisfies NewsletterPayload),
    })
  } catch {
    return { ok: false, message: 'Could not submit. Please try again.' }
  }
}
