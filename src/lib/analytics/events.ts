import { appConfig } from '../config'

type AnalyticsEventName =
  | 'order_click'
  | 'newsletter_submit_success'
  | 'newsletter_submit_failure'
  | 'contact_submit_success'
  | 'contact_submit_failure'

type AnalyticsPayload = {
  event: AnalyticsEventName
  page: string
  metadata?: Record<string, string | number | boolean>
  timestampIso: string
}

export function trackEvent(
  event: AnalyticsEventName,
  page: string,
  metadata?: Record<string, string | number | boolean>,
) {
  const payload: AnalyticsPayload = {
    event,
    page,
    metadata,
    timestampIso: new Date().toISOString(),
  }

  if (!appConfig.enableLiveData || !appConfig.analyticsUrl) {
    return
  }

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon(appConfig.analyticsUrl, blob)
    return
  }

  fetch(appConfig.analyticsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never break primary UX.
  })
}
