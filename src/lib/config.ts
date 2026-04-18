export const appConfig = {
  siteUrl: import.meta.env.VITE_SITE_URL as string | undefined,
  cmsContentUrl: import.meta.env.VITE_CMS_CONTENT_URL as string | undefined,
  adminApiBaseUrl: import.meta.env.VITE_ADMIN_API_BASE_URL as string | undefined,
  tapListUrl: import.meta.env.VITE_TAPLIST_API_URL as string | undefined,
  newsletterUrl: import.meta.env.VITE_NEWSLETTER_API_URL as string | undefined,
  contactUrl: import.meta.env.VITE_CONTACT_API_URL as string | undefined,
  analyticsUrl: import.meta.env.VITE_ANALYTICS_API_URL as string | undefined,
  enableLiveData: import.meta.env.VITE_ENABLE_LIVE_DATA === 'true',
}
