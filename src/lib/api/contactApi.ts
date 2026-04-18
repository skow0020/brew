import { appConfig } from '../config'
import { fetchJson } from './http'

export type ContactPayload = {
  name: string
  email: string
  message: string
}

export type ContactResponse = {
  ok: boolean
  message?: string
}

export async function submitContactForm(payload: ContactPayload): Promise<ContactResponse> {
  if (!appConfig.enableLiveData || !appConfig.contactUrl) {
    return { ok: true, message: 'Demo mode: contact endpoint not configured.' }
  }

  try {
    return await fetchJson<ContactResponse>(appConfig.contactUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch {
    return { ok: false, message: 'Could not send message. Please try again.' }
  }
}
